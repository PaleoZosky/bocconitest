#!/usr/bin/env python3
"""
check_math_25.py — ricalcola con il codice le risposte del Mock 25 e le
confronta con la chiave (`ans`) di docs/mocks/mock-25.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_25.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-25.js')],
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
# negozi A e B: A = 1,2 B; sconto 25%
assert F(6, 5) * F(3, 4) == F(9, 10)
check_idx('q-negozi', idx_eq('q-negozi', 'il 10% più basso'), 'prezzo scontato di A rispetto a B')
assert F(10, 90) * 100 > 11 and F(10, 90) * 100 < 11.2   # l'11% è la base sbagliata

# media inversa
n_b = [n_ for n_ in range(1, 200) if F(10 * 28 + n_ * 23, 10 + n_) == 25]
assert n_b == [15]
check_value('q-media-inversa', n_b[0])
assert (28 + 23) / 2 == 25.5

# pallavolo: 6 su 9, esattamente un palleggiatore (0, 1, 2)
sq = [c_ for c_ in itertools.combinations(range(9), 6) if sum(1 for x_ in c_ if x_ < 3) == 1]
assert len(sq) == 18
check_value('q-pallavolo', len(sq))
assert sum(1 for c_ in itertools.combinations(range(9), 6) if any(x_ < 3 for x_ in c_)) == 83
assert math.comb(9, 6) == 84 and 3 * math.comb(8, 5) == 168

# ciclisti
t_inc = [F(t_) for t_ in range(0, 241) if F(20 * t_, 60) + F(40 * max(t_ - 30, 0), 60) == 100]
assert t_inc == [120]
x1 = F(20 * 120, 60)
assert x1 == 40 and 100 - 40 * F(120 - 30, 60) == 40
check_value('q-ciclisti', x1)
assert F(100 * 20, 60) > 33 and F(100 * 20, 60) < 34

# serie al meglio delle tre, p = 2/3
p_ = F(2, 3)
def serie():
    # probabilità di arrivare a 2 vittorie prima delle 2 sconfitte
    from functools import lru_cache
    @lru_cache(None)
    def f(w_, l_):
        if w_ == 2:
            return F(1)
        if l_ == 2:
            return F(0)
        return p_ * f(w_ + 1, l_) + (1 - p_) * f(w_, l_ + 1)
    return f(0, 0)
assert serie() == F(20, 27)
check_value('q-serie', serie())
assert 1 - F(1, 3) ** 2 == F(8, 9) and p_ ** 2 == F(4, 9)

# alberi
assert 2 * (120 // 8 + 1) == 32
check_value('q-alberi', 2 * (120 // 8 + 1))

# auto: perdita dopo tre anni
v3 = F(4, 5) ** 3
assert v3 == F(64, 125) and round(float(1 - v3) * 100) == 49 and round(float(v3) * 100) == 51 and 100 * (1 - F(4, 5) ** 2) == 36
check_idx('q-auto', idx_eq('q-auto', 'circa il 49%'), 'perdita dopo tre anni')

# medici
med = F(150 * 3 + 100 * 4, 250)
assert med == F(17, 5) and (3 + 4) / 2 == 3.5 and F(100 * 3 + 150 * 4, 250) == F(18, 5)
check_value('q-medici', float(med))

# più piccolo n tale che 60 · n sia un quadrato perfetto
nq = [n_ for n_ in range(1, 1000) if math.isqrt(60 * n_) ** 2 == 60 * n_]
assert nq[0] == 15 and 60 * 15 == 900 == 30 ** 2
assert math.isqrt(300) ** 2 != 300 and math.isqrt(1800) ** 2 != 1800 and math.isqrt(3600) ** 2 == 3600
check_value('q-quadrato', nq[0])

# master
N_m = [N_ for N_ in range(1, 1000) if F(55 * 40 * N_, 10000) == 44]
assert N_m == [200]
nord = F(N_m[0] * 45, 100) * F(60, 100)
assert nord == 54
check_value('q-master', nord)

# sistema mele e pere (prezzi in centesimi)
sol_ = [(m_, p_c) for p_c in range(0, 1201) for m_ in [p_c - 100] if m_ >= 0 and 3 * m_ + 2 * p_c == 1200]
assert sol_ == [(200, 300)]
tot_mp = (5 * 200 + 4 * 300) / 100
assert tot_mp == 22 and 5 * 300 + 4 * 200 == 2300 and F(12, 5) * 9 == F(216, 10)
check_value('q-sistema', tot_mp)

# insiemi: inglese 24, francese 20, su 40
both = {x_ for x_ in range(0, 41) if 24 + 20 - x_ <= 40 and x_ <= 20 and x_ <= 24}
assert min(both) == 4 and max(both) == 20 and len(both) > 1
check_idx('q-nondet', idx_eq('q-nondet', 'Non è determinabile'), 'insiemi sovrapposti')

# podio
pod = [p3 for p3 in itertools.permutations(range(7), 3) if 0 in p3]
assert len(pod) == 90 and 7 * 6 * 5 == 210 and 6 * 5 * 4 == 120
check_value('q-podio', len(pod))

# rimbalzo
h3 = 10 * F(3, 5) ** 3
assert h3 == F(54, 25) == F(216, 100)
check_idx('q-rimbalzo', idx_eq('q-rimbalzo', '2,16 m'), 'altezza al terzo rimbalzo')
assert 10 * F(3, 5) == 6 and 10 * F(3, 5) ** 2 == F(18, 5) and 10 * F(3, 5) ** 4 == F(1296, 1000)

# rapporti a catena
pere = F(18 * 4, 3)
arance = pere * F(5, 6)
assert (pere, arance) == (24, 20)
check_value('q-rapporti', arance)

# operai
rate = F(2, 5) / (8 * 6)
needed = (1 - F(2, 5)) / (3 * rate)
assert needed == 24
check_value('q-operai', needed - 8)

# sei lanci, esattamente due teste
fav = sum(1 for s_ in itertools.product([0, 1], repeat=6) if sum(s_) == 2)
assert fav == 15
check_value('q-lanci', F(fav, 64))

# somma dei dispari
assert sum(range(1, 60, 2)) == 900 == 30 ** 2 and sum(range(1, 60)) == 1770
check_value('q-dispari', sum(range(1, 60, 2)))

# ============================ VERBALE ============================
# latteria: 100.000 litri
euro = 100000 * F(1, 2) + F(100000, 2000000) * 100000
assert euro == 55000
check_vfn('v-latteria', 0)           # «più di 55.000»: falsa

# inflazione sottostante: 4 = 0,8 · 2,5 + 0,2 · v
v_vol = (F(4) - F(8, 10) * F(5, 2)) / F(2, 10)
assert v_vol == 10
check_predicates('v-core', {
    'cresciuti, in media, più del 4%': v_vol > 4,
    'sottostante comprende le variazioni': False,
    'cresciute di 1,5 punti percentuali': v_vol == F(3, 2),
    'ha guardato soprattutto': False}, 'inflazione')

# palestra: generalizzazione da un campione casuale
check_idx('v-palestra', idx('v-palestra', 'dieci sedi della catena scelte a caso'), 'rafforza')

# case: 4,5 − 3 = 1,5
assert F(9, 2) - 3 == F(3, 2)
check_idx('v-case', idx('v-case', 'perché la domanda di case è calata'), 'NON corretta')

# pista: causa non detta
check_vfn('v-pista', 1)

# mensa: causalità inversa
check_idx('v-mensa', idx('v-mensa', 'problemi di salute cronici'), 'indebolisce')

# università
sd20, sd25, sa20, sa25 = F(80000, 2000), F(88000, 2200), F(80000, 400), F(88000, 400)
assert (sd20, sd25, sa20, sa25) == (40, 40, 200, 220)
check_predicates('v-universita', {
    'invariato, ma il numero di studenti per aula è aumentato': sd20 == sd25 and sa25 > sa20,
    'per docente è aumentato': sd25 > sd20,
    'per aula è rimasto invariato': sa25 == sa20,
    'sceso da 40 a 38': sd25 == 38}, 'università')

# bagaglio: 38×28×18 ≤ 40×30×20, cappotto non è bagaglio
assert 38 <= 40 and 28 <= 30 and 18 <= 20
check_vfn('v-bagaglio', 2)

# regola borsa
check_idx('v-regola', idx('v-regola', 'Ha diritto alla borsa e, se ottiene meno di 20 crediti'), 'regola')

# Rivabella: analogia
check_idx('v-rivabella', idx('v-rivabella', 'abbastanza simile alle due città'), 'assunzione')

# export
q1_25, q2_25 = 100 * F(106, 100), 300 * F(98, 100)
assert q1_25 + q2_25 == 400 == 100 + 300 and (6 - 2) / 2 == 2
check_predicates('v-export', {
    'state uguali a quelle': q1_25 + q2_25 == 400,
    'cresciute del 2%': (q1_25 + q2_25) / 400 == F(102, 100),
    'cresciute del 4%': (q1_25 + q2_25) / 400 == F(104, 100),
    'calate del 2%': (q1_25 + q2_25) / 400 == F(98, 100)}, 'export')

# museo
paganti = 120000 * F(70, 100)
assert paganti * 10 == 840000 > 800000 and 120000 * F(30, 100) * 10 == 360000
check_vfn('v-museo', 2)

# bibite: causa alternativa
check_idx('v-bibite', idx('v-bibite', 'catena di supermercati'), 'indebolisce')

# flex: causa alternativa (prezzi)
check_idx('v-flex', idx('v-flex', 'aumento dei prezzi dei servizi'), 'fattore')

# settimana corta: 4·10 = 5·8
assert 4 * 10 == 5 * 8
check_vfn('v-corta', 0)

# sanità
assert F(2000) * F(85, 10) / 100 == 170 and F(2000) * 7 / 100 == 140 and F(2000) * F(15, 10) / 100 == 30
assert F(30, 140) != F(1, 5)
check_predicates('v-sanita', {
    'complessiva, pubblica e privata, è stata di 170 miliardi': True,
    '140 miliardi di euro, pari al 7% della spesa pubblica totale': False,
    'inevitabilmente': False,
    'cioè il 20% di quella pubblica': False}, 'sanità')

# ============================ DATA INSIGHTS ============================
# tavoli
check_ds2('d-tavoli', 'A', [(o_,) for o_ in range(0, 41)], lambda s: s[0] > 20,
          lambda s: s[0] >= (40 - s[0]) + 3, lambda s: s[0] >= 15)

# turisti: (italiani, francesi, tedeschi)
mondi_t = [(t_ + 12, 2 * t_, t_) for t_ in range(1, 40) if (t_ + 12) + 2 * t_ + t_ == 36]
assert mondi_t == [(18, 12, 6)]
check_dp('d-turisti', mondi_t, [
    lambda w: w[0] * 2 == 36,
    lambda w: w[1] > w[0] + w[2],
    lambda w: w[2] * 6 == 36,
    lambda w: w[1] * 3 > 36], 'V')

# negozi: crescita percentuale
DN = D['negozi']
cres = [F(b_ - a_, a_) * 100 for a_, b_ in zip(DN['y24'], DN['y25'])]
assert cres == [25, 15, 35, 25]
assert [b_ - a_ for a_, b_ in zip(DN['y24'], DN['y25'])] == [10, 15, 7, 15]
check_idx('d-negozi', idx_eq('d-negozi', 'Negozio ' + DN['nomi'][cres.index(max(cres))]), 'crescita massima')
check_assets('d-negozi', DN['y24'] + DN['y25'])

# iscritti: (femmine che lavorano, femmine che non lavorano, maschi che lavorano, maschi che non lavorano)
sc_i = [(a_, b_, c_, 80 - a_ - b_ - c_) for a_ in range(81) for b_ in range(81 - a_) for c_ in range(81 - a_ - b_)]
check_ds2('d-iscritti', 'B', sc_i, lambda s: s[3],
          lambda s: s[0] + s[1] == 48 and s[0] == 30, lambda s: s[0] + s[2] == 50)

# sondaggio
DS_ = D['sondaggio']
fav_ = [F(n_ * f_, 100) for n_, f_ in zip(DS_['n'], DS_['fav'])]
assert fav_ == [120, 120, 150] and sum(fav_) == 390
quota = float(fav_[2] / sum(fav_) * 100)
assert round(quota) == 38 and round(sum(DS_['fav']) / 3) == 43
check_idx('d-sondaggio', idx_eq('d-sondaggio', 'circa il 38%'), 'quota dei favorevoli 55+')
check_assets('d-sondaggio', DS_['n'] + [str(f_) + '%' for f_ in DS_['fav']])

# reparto: (promozione, reparto A, fresco, in scatola)
tipi_r = [t_ for t_ in itertools.product([True, False], repeat=4)
          if (not t_[0] or t_[1]) and not (t_[2] and t_[3])]
mondi_r = [w for N in range(1, 4) for w in itertools.product(tipi_r, repeat=N) if any(p[1] and p[2] for p in w)]
check_dp('d-reparto', mondi_r, [
    lambda w: any(p[0] and p[2] for p in w),
    lambda w: any(p[2] and p[3] for p in w),
    lambda w: any(p[0] and not p[1] for p in w),
    lambda w: any(p[1] and not p[3] for p in w)], 'F')

# museo: adulto a, ragazzo r; 3a + 2r = 40 e r = a − 5
sc_mu = [(a_, r_) for a_ in range(1, 41) for r_ in range(0, 41)]
check_ds2('d-museo', 'A', sc_mu, lambda s: s[0],
          lambda s: 3 * s[0] + 2 * s[1] == 40 and s[1] == s[0] - 5, lambda s: s[0] > 8)

# budget
DB = dict(D['budget']['voci'])
var_b = F(DB['Affitto'], 100) * F(10, 100) - F(DB['Cibo'], 100) * F(20, 100)
assert var_b == F(-1, 100) and (10 - 20) / 2 == -5
check_idx('d-budget', idx_eq('d-budget', '−1%'), 'variazione della spesa totale')
check_assets('d-budget', [])

# cubo: lato s
sc_cb = [F(k_, 2) for k_ in range(1, 41)]
check_ds2('d-cubo', 'C', sc_cb, lambda s: s ** 3,
          lambda s: 2 * s * s == 72, lambda s: 6 * s * s == 216)

# tariffe: A e B uguali
DT = D['tariffe']
uguali = [m_ for m_ in range(0, 2001) if DT['fisso'][0] + F(str(DT['minuto'][0])) * m_ == DT['fisso'][1] + F(str(DT['minuto'][1])) * m_]
assert uguali == [200] and F(6) / F('0.05') == 120 and F(6) / F('0.08') == F(150, 2)
check_value('d-tariffe', uguali[0])
check_assets('d-tariffe', ['10', '4', '0', '0,05', '0,08', '0,12'])

# gol: tre squadre a > b > c, somma 14, ognuna almeno 3
mondi_g = [(a_, b_, c_) for c_ in range(3, 15) for b_ in range(c_ + 1, 15) for a_ in range(b_ + 1, 15) if a_ + b_ + c_ == 14]
assert sorted(mondi_g) == [(6, 5, 3), (7, 4, 3)]
check_dp('d-gol', mondi_g, [
    lambda w: w[0] >= 6,
    lambda w: w[2] == 3,
    lambda w: w[1] > 4,
    lambda w: w[0] == 2 * w[2]], 'V')

# urna: rosse r, blu 12 − r
check_ds2('d-urna', 'B', [(r_,) for r_ in range(0, 13)], lambda s: s[0] > 12 - s[0],
          lambda s: 12 - s[0] < 7, lambda s: s[0] % 2 == 1)

# gelati
DG = D['gelati']
prezzo = F(DG['ricaviLug'], DG['unita'][3])
ric = sum(u_ * prezzo for i_, u_ in enumerate(DG['unita']) if i_ != 4) + DG['unita'][4] * prezzo * F(4, 5)
assert prezzo == F(5, 2) and ric == 530
assert sum(DG['unita']) * prezzo == 550 and sum(DG['unita']) * prezzo * F(4, 5) == 440 and (sum(DG['unita']) - DG['unita'][5]) * prezzo == 500
check_value('d-gelati', ric * 1000)
check_assets('d-gelati', DG['unita'] + ['150.000'])

# utile e margine
DU = D['utile']
ut = [r_ - c_ for r_, c_ in zip(DU['ricavi'], DU['costi'])]
mar = [F(u_, r_) for u_, r_ in zip(ut, DU['ricavi'])]
assert ut == [20, 15, 20, 15, 30]
check_predicates('d-utile', {
    'Il margine (utile sui ricavi) del 2025 è maggiore': mar[4] > mar[0],
    "L'utile è cresciuto in ogni anno": all(ut[i_] > ut[i_ - 1] for i_ in range(1, 5)),
    "L'utile del 2025 è il doppio di quello del 2021": ut[4] == 2 * ut[0],
    'Nessuna delle altre risposte è corretta': not (mar[4] > mar[0]) and not all(ut[i_] > ut[i_ - 1] for i_ in range(1, 5)) and ut[4] != 2 * ut[0]},
    'utile e margine')
check_assets('d-utile', DU['ricavi'] + DU['costi'])

# pacchi
sc_p = [(a_, b_, 40 - a_ - b_) for a_ in range(41) for b_ in range(41 - a_)]
check_ds2('d-pacchi', 'D', sc_p, lambda s: s[1], lambda s: s[0] == 12, lambda s: s[2] >= 14)

# uffici: (città di Ada, Bea, Carlo) + stipendi per città (R, M, T) con M > T
mondi_u = []
for perm in itertools.permutations('RMT'):
    if perm[0] == 'R' or perm[2] != 'T':
        continue
    for sR, sM, sT in itertools.product(range(1, 4), repeat=3):
        if sM > sT:
            sal = {'R': sR, 'M': sM, 'T': sT}
            mondi_u.append((perm, sal))
check_dp('d-uffici', mondi_u, [
    lambda w: w[0][1] == 'M',
    lambda w: w[1][w[0][2]] > w[1][w[0][0]],
    lambda w: w[1][w[0][1]] < w[1][w[0][0]],
    lambda w: w[0][0] == 'M'], 'F')

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
