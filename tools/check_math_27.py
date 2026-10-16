#!/usr/bin/env python3
"""
check_math_27.py — ricalcola con il codice le risposte del Mock 27 e le
confronta con la chiave (`ans`) di docs/mocks/mock-27.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_27.py
"""
import itertools
import json
import math

import re
import subprocess
import sys
from fractions import Fraction as F
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

DUMP = r"""
const m = require(process.argv[1]);
console.log(JSON.stringify({
  data: m.data,
  q: m.questions.map(q => ({ k: q.k, n: q.n, area: q.area, ans: q.ans, opts: q.opts, asset: q.asset || '', lang: q.lang, diff: q.diff, passage: q.passage || '' }))
}));
"""
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-27.js')],
                     capture_output=True, text=True, check=True).stdout
J = json.loads(raw)
D = J['data']
Q = {q['k']: q for q in J['q']}
L = 'ABCD'
errori, controllate = [], 0


def plain(s):
    return re.sub(r'<[^>]*>', '', str(s)).strip()


def num(s):
    """'+0,5%' → 0.5 ; '1.480 €' → 1480 ; 'circa 106 €' → 106 ; frazione HTML → Fraction"""
    fr = re.search(r'aria-label="(\d+) fratto (\d+)"', str(s))
    if fr:
        return F(int(fr.group(1)), int(fr.group(2)))
    t = plain(s).replace('−', '-').replace('–', '-')
    t = re.sub(r'(circa|about|km/h|km|kg|€|%|anni|ore|giorni|minuti|cm|litri|m/min|milioni di euro|euro|\bg\b|\bs\b)', '', t).replace(' ', '')
    if not t or re.search(r'[^\d.,+-]', t):
        return None
    return float(re.sub(r'\.(?=\d{3}\b)', '', t).replace(',', '.'))


def check_value(n, valore, tol=1e-9):
    """esattamente una opzione coincide con `valore` e coincide con la chiave"""
    global controllate
    controllate += 1
    q = Q[n]
    hit = [(o := num(x)) is not None and abs(float(o) - float(valore)) < tol for x in q['opts']]
    if sum(hit) != 1:
        errori.append(f'n.{n}: {sum(hit)} opzioni coincidono con il valore calcolato ({valore}), ne serve esattamente 1')
    elif hit.index(True) != q['ans']:
        errori.append(f"n.{n}: il valore calcolato ({valore}) è l'opzione {L[hit.index(True)]}, la chiave dice {L[q['ans']]}")


def check_idx(n, idx, cosa):
    global controllate
    controllate += 1
    if idx != Q[n]['ans']:
        errori.append(f"n.{n}: {cosa} → opzione {L[idx] if idx is not None and idx >= 0 else idx}, la chiave dice {L[Q[n]['ans']]}")


def check_predicates(n, predicati, cosa):
    """opzioni a testo: solo una risulta vera secondo i predicati.
    `predicati` è un dizionario {frammento caratteristico dell'opzione: vero/falso}."""
    global controllate
    opts = Q[n]['opts']
    pos = {}
    for frag in predicati:
        trovate = [i for i, o in enumerate(opts) if frag in plain(o)]
        assert len(trovate) == 1, (n, frag, trovate)
        pos[frag] = trovate[0]
    assert len(pos) == len(opts) and len(set(pos.values())) == len(opts), (n, 'ogni opzione deve avere un predicato')
    veri = [pos[f] for f, p in predicati.items() if p]
    if len(veri) != 1:
        controllate += 1
        errori.append(f'n.{n}: {cosa} — {len(veri)} opzioni vere ({[L[i] for i in veri]}), ne serve esattamente 1')
    else:
        check_idx(n, veri[0], cosa)


def check_assets(n, numeri):
    """ogni numero (già formattato) deve comparire nel testo visibile dell'asset"""
    global controllate
    controllate += 1
    testo = re.sub(r'<[^>]*>', ' ', Q[n]['asset'])
    for x in numeri:
        if not re.search(r'(?<![\d.,])' + re.escape(str(x)) + r'(?![\d])', testo):
            errori.append(f"n.{n}: il numero {x} non compare nell'asset mostrato")


def criterio(scenari, valore, p1, p2):
    s1 = {valore(s) for s in scenari if p1(s)}
    s2 = {valore(s) for s in scenari if p2(s)}
    s12 = {valore(s) for s in scenari if p1(s) and p2(s)}
    b1, b2, b12 = len(s1) == 1, len(s2) == 1, len(s12) == 1
    if b1 and b2:
        return 'C'
    if b1 or b2:
        return 'A'
    return 'B' if b12 else 'D'


def check_ds(n, atteso, scenari, valore, p1, p2):
    """la lettera del criterio calcolata deve essere `atteso` e la sua posizione deve essere `ans`"""
    global controllate
    controllate += 1
    c = criterio(scenari, valore, p1, p2)
    if c != atteso:
        errori.append(f'n.{n}: criterio calcolato {c}, atteso {atteso}')
    opts = Q[n]['opts']
    testo = [o for o in opts]
    pos = [i for i, o in enumerate(testo) if re.search(r'Crit(erio|erion) ' + c + r'\b', o)]
    if len(pos) != 1 or pos[0] != Q[n]['ans']:
        errori.append(f"n.{n}: il criterio {c} è in posizione {pos}, la chiave dice {L[Q[n]['ans']]}")


def check_dp(n, mondi, props, tipo):
    """tipo 'V' = sicuramente vere, 'F' = sicuramente false; l'opzione giusta elenca esattamente quelle"""
    global controllate
    controllate += 1
    stato = []
    for p in props:
        r = {bool(p(m)) for m in mondi}
        stato.append('V' if r == {True} else ('F' if r == {False} else '?'))
    cerca = {i for i, s in enumerate(stato) if s == tipo}
    lettere = {'Solo la ': 1, 'Sia la ': 2}
    giuste = []
    for i, o in enumerate(Q[n]['opts']):
        m = re.fullmatch(r'Solo la ([A-D])', plain(o)) or re.fullmatch(r'Sia la ([A-D]) sia la ([A-D])', plain(o))
        ins = {'ABCD'.index(g) for g in m.groups()}
        if ins == cerca:
            giuste.append(i)
    if len(giuste) != 1 or giuste[0] != Q[n]['ans']:
        errori.append(f"n.{n}: stato delle proposizioni {stato}; opzioni giuste {giuste}, la chiave dice {L[Q[n]['ans']]}")



def idx(k, frag):
    """posizione dell'unica opzione il cui testo contiene `frag`"""
    t = [i for i, o in enumerate(Q[k]['opts']) if frag in plain(o)]
    assert len(t) == 1, (k, frag, t)
    return t[0]


def check_vfn(k, atteso):
    """ordine fisso: 0 = Falsa, 1 = Non ricavabile, 2 = Vera"""
    check_idx(k, atteso, 'vero/falso/non ricavabile')


from decimal import Decimal as Dc
import datetime

from decimal import Decimal as Dc

from decimal import Decimal as Dc


def idx_eq(k, testo):
    """posizione dell'unica opzione il cui testo è esattamente `testo`"""
    t = [i for i, o in enumerate(Q[k]['opts']) if plain(o) == testo]
    assert len(t) == 1, (k, testo, t)
    return t[0]




def check_ds2(n, atteso, scenari, valore, p1, p2):
    """come check_ds, in più le due affermazioni devono essere compatibili tra loro"""
    assert any(p1(s) and p2(s) for s in scenari), f'{n}: le due affermazioni sono incompatibili'
    check_ds(n, atteso, scenari, valore, p1, p2)


# ============================ QUANTITATIVA ============================
check_value('q-libro', F(1890, 100) / (F(7, 10) * F(9, 10)))
assert F(1890, 100) / F(6, 10) == F(63, 2) and F(1890, 100) / F(7, 10) == 27 and abs(float(F(1890, 100) * F(14, 10)) - 26.46) < 1e-9

# pittura: simulazione giorno per giorno
fatto, giorni = F(0), 0
while fatto < 1:
    giorni += 1
    fatto += (F(1, 12) + F(1, 6)) if giorni <= 2 else F(1, 12)
assert giorni == 8 and 1 / (F(1, 12) + F(1, 6)) == 4
check_value('q-pittura', giorni)

# ricarico
costo = F(90) - F(90) * F(1, 4)
assert costo == F(135, 2) and F(45, 2) / costo == F(1, 3)
check_idx('q-ricarico', idx_eq('q-ricarico', 'circa il 33%'), 'guadagno sul costo')

check_value('q-salita', F(24) / (F(12, 6) + F(12, 12)))
assert (6 + 12) / 2 == 9

# batteri
n_ = 0
while 1000 * 2 ** n_ <= 1_000_000:
    n_ += 1
assert n_ == 10 and 1000 * 2 ** 9 == 512000
h_ = (8 + 3 * n_)
assert (h_ % 24, h_ // 24) == (14, 1) and (8 + 27) % 24 == 11 and (8 + 33) % 24 == 17
check_idx('q-batteri', idx_eq('q-batteri', 'alle 14:00 del giorno dopo'), 'ora del milione')

# anagrammi di STESSO senza SS consecutive
an = set(itertools.permutations('STESSO'))
assert len(an) == 120
senza = [a for a in an if 'SS' not in ''.join(a)]
check_value('q-anagrammi', len(senza))
assert len(senza) * 6 == 144

# esami
serve = 7 * 28 - 6 * 27
assert serve == 34 and serve > 30 and F(6 * 27 + 28, 7) < 28 and F(6 * 27 + 30, 7) < 28 and F(6 * 27 + 29, 7) < 28
check_idx('q-esami', idx('q-esami', 'Non può riuscirci'), 'impossibilità')

# magliette
coppie = list(itertools.combinations(range(8), 2))
st = sum(1 for a, b in coppie if (a < 5) == (b < 5))
assert (st, len(coppie)) == (13, 28) and 15 + 13 == 28
assert F(5 * 5 + 3 * 3, 64) == F(17, 32)
check_value('q-magliette', F(st, len(coppie)), 1e-9)

# resti
ris = [x for x in range(101, 200) if x % 4 == 3 and x % 5 == 2]
assert ris == [107, 127, 147, 167, 187]
check_value('q-resti', len(ris))

# amiche
sol_ = [b for b in range(1, 100) if 2 * b + b + (b + 8) == 92]
assert sol_ == [21]
check_value('q-amiche', sol_[0] + 8)

check_value('q-parttime', F(60, 100) * F(25, 100) * 100 + F(40, 100) * F(10, 100) * 100)
assert (25 + 10) / 2 == 17.5

# figli: spazio dei casi (primo, secondo)
casi = [(a, b) for a in 'MF' for b in 'MF' if 'M' in (a, b)]
assert len(casi) == 3
check_value('q-figli', F(sum(1 for a, b in casi if a == b == 'M'), len(casi)))

# cena
x_ = [x for x in range(1, 500) if F(x, 3) - F(x, 5) == 8]
assert x_ == [60]
check_value('q-cena', x_[0])

check_value('q-multipli', sum(m for m in range(1, 51) if m % 3 == 0))
assert sum(range(1, 51)) // 3 == 425

check_value('q-saldi', F(40, 100) * 50 + F(60, 100) * 20)

# pecore: tutte tranne 9 scappano → ne restano 9
check_value('q-pecore', 9)

cf = [(a, b, c) for a in range(1, 5) for b in range(5) for c in range(5) if len({a, b, c}) == 3]
check_value('q-cifre', len(cf))

# coro
kk = [k for k in range(1, 50) if 3 * k + 2 == 5 * k - 4]
assert kk == [3]
check_value('q-coro', 8 * kk[0])

# ============================ VERBALE ============================
check_vfn('v-tariffa', 0)
check_vfn('v-museo', 1)
check_vfn('v-assegni', 2)
check_vfn('v-famiglie', 0)
check_vfn('v-fumatori', 1)
assert 2000 * 40 // 100 // 4 == 200 < 300
assert F(1) / F(1, 4) == 4 and F(1, 4) > F(1, 5) > F(1, 10)
assert abs(500 / 1.1 - 454.5) < 0.1 and abs(500 - 500 * 0.1 - 450) < 1e-9 and round((30 - 25) / 30 * 100) == 17
check_idx('v-gruppo', idx('v-gruppo', 'circa 455 milioni'), 'ricavi 2024')
assert round((1.04 / 1.06 - 1) * 100) == -2 and 8 > 6 and 4.5 > 3.5
check_idx('v-salari', idx('v-salari', 'compensato l\'inflazione per tutti'), 'affermazione NON corretta')
assert (5400 - 3000) / 3000 == 0.8 and F(5400, 120000) == F(45, 1000) and F(3000, 120000) == F(25, 1000)
check_idx('v-mutuo', idx('v-mutuo', 'aumentano dell\'80%'), 'mutuo')
check_idx('v-app', idx('v-app', 'grande fabbrica'), 'causa alternativa')
check_idx('v-orario', idx('v-orario', 'ora in più per dormire'), 'assunzione')
check_idx('v-colonnine', idx('v-colonnine', 'pochissime colonnine'), 'necessario vs sufficiente')
check_idx('v-cambio', idx('v-cambio', 'più cari in dollari'), 'cambio')
check_idx('v-volontariato', idx('v-volontariato', 'già prima di iniziare'), 'selezione')
check_idx('v-laurea', idx('v-laurea', 'può laurearsi nella sessione di luglio'), 'regola')
check_idx('v-ztl', idx('v-ztl', 'zone senza il divieto'), 'gruppo di controllo')
check_idx('v-vendite', idx('v-vendite', 'di ciascun trimestre'), 'parola chiave')

# ============================ DATA INSIGHTS ============================
# sufficienza dei dati: si enumerano gli scenari compatibili

# urna: (rosse, verdi, gialle) con somma 20, ciascun colore presente
sc = [(r, v, g) for r in range(1, 19) for g in range(1, 19) for v in [20 - r - g] if v >= 1]
check_ds2('d-urna', 'A', sc, lambda s: F(s[0], 20) < F(1, 2), lambda s: 20 - s[0] >= 11, lambda s: s[0] == 2 * s[2])

# classe: ragazze/ragazzi che studiano francese (g ≤ 18, b ≤ 12)
sc = [(g, b) for g in range(0, 19) for b in range(0, 13)]
check_ds2('d-classe', 'B', sc, lambda s: s[0], lambda s: s[0] + s[1] == 12, lambda s: s[1] == 5)

# cappelli e sciarpe: c cappelli, 30 − c sciarpe; prezzi variabili (10/15 solo nell'affermazione 1)
sc = [(c, p, q) for c in range(0, 31) for p in (10, 5, 12) for q in (15, 20, 8)]
check_ds2('d-intervallo', 'D', sc, lambda s: s[1] * s[0] + s[2] * (30 - s[0]),
          lambda s: s[1] == 10 and s[2] == 15, lambda s: 30 - s[0] > s[0])

# multipli di 12
sc = list(range(1, 2000))
check_ds2('d-multipli', 'C', sc, lambda n: n % 12 == 0, lambda n: n % 3 == 0 and n % 4 == 0, lambda n: n % 4 == 0 and n % 6 == 0)

# sconto 20%
sc = [L_ for L_ in range(1, 301)]
check_ds2('d-sconto', 'A', sc, lambda L_: F(4 * L_, 5) < 50, lambda L_: F(L_, 5) < 15, lambda L_: L_ < 60)

# triangolo ABC: lati interi che formano un triangolo
sc = [(a, b, c) for a in range(1, 25) for b in range(1, 25) for c in range(1, 25) if a + b > c and a + c > b and b + c > a]
check_ds2('d-triangolo', 'B', sc, lambda s: s[0] ** 2 + s[1] ** 2 == s[2] ** 2,
          lambda s: s[0] == 5 and s[1] == 12, lambda s: s[2] == 13)

# proposizioni: palestre (un solo mondo)
rap = {'N': F(120, 6), 'C': F(90, 5), 'S': F(70, 4)}
assert rap == {'N': 20, 'C': 18, 'S': F(35, 2)}
mondi = [()]
check_dp('d-palestre', mondi, [
    lambda w: rap['S'] > rap['C'],
    lambda w: rap['N'] > rap['C'] and rap['N'] > rap['S'],
    lambda w: F(280, 15) < 19,
    lambda w: rap['C'] < rap['N'] and rap['C'] < rap['S']], 'V')

# ferie: permutazioni dei giorni 1..3 per (Ada, Bea, Ciro)
mondi = [p_ for p_ in itertools.permutations((1, 2, 3)) if p_[0] < p_[1] and p_[2] != 3]
assert len(mondi) == 2
check_dp('d-ferie', mondi, [
    lambda w: w[2] < w[1],
    lambda w: w[0] == 1,
    lambda w: w[1] == 2,
    lambda w: w[2] > w[1]], 'F')

# parcheggi (un solo mondo)
sede = 60 * 70 // 100
assert (sede, 60 - sede, sede // 2) == (42, 18, 21)
mondi = [()]
check_dp('d-parcheggi', mondi, [
    lambda w: 21 >= 20,
    lambda w: 21 > 25,
    lambda w: 18 == 24,
    lambda w: True], 'V')

# reparti: quattro numeri interi diversi, somma 72, minimo 12, massimo ≤ 24
mondi = [w for w in itertools.combinations(range(12, 25), 4) if sum(w) == 72 and min(w) == 12]
assert len(mondi) > 0
check_dp('d-reparti', mondi, [
    lambda w: 24 in w,
    lambda w: all(x >= 13 for x in w if x != 12),
    lambda w: 11 in w,
    lambda w: sum(1 for x in w if x > 20) == 3], 'F')
assert any(24 in w for w in mondi) and any(24 not in w for w in mondi)

# tabelle e grafici (i numeri usati nelle soluzioni coincidono con DATA)
DN = D['negozi']
onl = [v * p // 100 for v, p in zip(DN['vendite'], DN['online'])]
assert onl == [120, 150, 180, 150] and sum(onl) == 600 and sum(DN['vendite']) == 1400
assert 400 * 55 // 100 == 220
check_idx('d-negozi', idx('d-negozi', 'Biella e Asti hanno lo stesso valore'), 'vendite online')
check_assets('d-negozi', DN['vendite'] + [str(p) + '%' for p in DN['online']])

DP = D['parco']
tot_p = F(DP['ingressi'][0] + DP['ingressi'][1]) + F(DP['ingressi'][2] + DP['ingressi'][3]) * F(75, 100)
assert tot_p == F(265, 2)
assert tot_p * 8 == 1060 and F(160) * 8 == 1280 and F(160) * F(3, 4) * 8 == 960 and F(110) * F(3, 4) * 8 == 660
check_value('d-parco', tot_p * 8 * 1000)
check_assets('d-parco', DP['ingressi'] + [8, 25])

DS_ = D['spese']
pesi = DS_['rapporto']
parte = F(DS_['voci'][2][1], sum(pesi))
assert parte == 5 and sum(v for _, v in DS_['voci']) == 100
check_value('d-spese', DS_['totale'] * (parte * (pesi[1] + pesi[2])) / 100)
assert DS_['totale'] * 10 // 100 == 24000 and DS_['totale'] * 30 // 100 == 72000 and DS_['totale'] * 5 // 100 == 12000

DF = D['fabbriche']
assert DF['f3'][0] < DF['f1'][0] + DF['f2'][0]
assert F(DF['f1'][3] - DF['f1'][0], DF['f1'][0]) == F(2, 5)
tot25 = DF['f1'][3] + DF['f2'][3] + DF['f3'][3]
assert tot25 == 206 and DF['f2'][3] * 3 < tot25
check_idx('d-fabbriche', idx('d-fabbriche', 'Nessuna delle altre'), 'nessuna corretta')
check_assets('d-fabbriche', DF['f1'] + DF['f2'] + DF['f3'])

DO = D['ordini']
q_ = [F(e, r) for e, r in zip(DO['evasi'], DO['ricevuti'])]
assert q_ == [F(9, 10), F(7, 10), F(9, 10), F(4, 5)]
assert max(r - e for r, e in zip(DO['ricevuti'], DO['evasi'])) == 160
check_idx('d-ordini', idx_eq('d-ordini', 'Febbraio'), 'quota evasa più bassa')
assert DO['mesi'][q_.index(min(q_))] == 'Feb'

DC = D['costi']
mancante = DC['totRiga'][1] - DC['gen'][1] - DC['mar'][1]
assert mancante == 40 == DC['totCol'][1] - DC['feb'][0] - DC['feb'][2]
assert F(mancante, DC['totCol'][1]) == F(1, 3) and F(40, 110) > F(1, 3) > F(40, 330)
assert DC['totCol'][3] == sum(DC['totRiga']) == sum(DC['totCol'][:3])
check_idx('d-costi', idx_eq('d-costi', 'circa il 33%'), 'quota del Sud a febbraio')
check_assets('d-costi', DC['gen'] + DC['mar'] + DC['totRiga'] + DC['totCol'])

# ---- controllo trasversale: nessuna schermata con tre domande difficili; brani di 80–150 parole; tutto in italiano ----
for s_ in range(0, 50, 3):
    gr = sorted((q for q in Q.values() if s_ < q['n'] <= s_ + 3), key=lambda q: q['n'])
    if len(gr) == 3 and all(q['diff'] == 'difficile' for q in gr):
        errori.append(f'schermata {s_ // 3 + 1}: tre domande difficili insieme')
for q in Q.values():
    controllate += 1
    if q['lang'] != 'it':
        errori.append(f"n.{q['k']}: lang = {q['lang']}")
    if q['passage']:
        w_ = len(plain(q['passage']).split())
        if not 80 <= w_ <= 150:
            errori.append(f"n.{q['k']}: il brano ha {w_} parole (devono essere 80–150)")

# ---- esito ----
print()
if errori:
    print('ERRORI:')
    for e in errori:
        print('  ×', e)
    sys.exit(1)

chiave = ''.join(L[q['ans']] for q in sorted(Q.values(), key=lambda q: q['n']))
print(f'{controllate} verifiche numeriche/logiche superate: la chiave coincide con i calcoli.')
print('Chiave (posizione A–D, VFN a 3 opzioni incluse):', chiave)
