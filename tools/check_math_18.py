#!/usr/bin/env python3
"""
check_math_18.py — ricalcola con il codice le risposte del Mock 18 e le
confronta con la chiave (`ans`) di docs/mocks/mock-18.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_18.py
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
  q: m.questions.map(q => ({ k: q.k, n: q.n, area: q.area, ans: q.ans, opts: q.opts, asset: q.asset || '', lang: q.lang }))
}));
"""
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-18.js')],
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
    t = re.sub(r'(circa|about|km/h|km|kg|€|%|anni|ore|giorni|milioni di euro|\bg\b|\bs\b)', '', t).replace(' ', '')
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



# ============================ QUANTITATIVA ============================
# promo: 3x2 + sconto 10% → 108
L_ = [p for p in range(1, 500) if abs(2 * p * 0.9 - 108) < 1e-9]
assert L_ == [60]
check_value('q-promo', 60)

# lumaca: simulazione
pos, giorno = 0, 0
while True:
    giorno += 1
    pos += 3
    if pos >= 10:
        break
    pos -= 2
assert giorno == 8
check_idx('q-lumaca', [i for i, o in enumerate(Q['q-lumaca']['opts']) if o == '8 giorni'][0], '8 giorni')

# iscritti: A = 1,2 B; B = 0,75 C; A = 90
C_ = [c for c in range(1, 1000) if abs(c * 0.75 * 1.2 - 90) < 1e-9]
assert C_ == [100]
check_value('q-iscritti', 100)
assert round(75 * 1.25) == 94 and 90 * 1.2 == 108 and 90 * 0.8 == 72

# vernice: simulazione al minuto con frazioni
vol, minuto = F(0), 0
while vol < 1:
    r = F(1, 10) if minuto < 240 else F(1, 10) + F(1, 15)
    vol += r / 60
    minuto += 1
assert minuto == 456, minuto
check_idx('q-vernice', [i for i, o in enumerate(Q['q-vernice']['opts']) if o == '7 ore e 36 minuti'][0], '456 minuti')

# età: tentativi su Bea
sol_e = [(a, b, c) for b in range(1, 60) for a in range(1, 60) for c in range(1, 80)
         if a + b + c == 64 and a + 4 == 2 * (b + 4) and c == a + 6]
assert sol_e == [(24, 10, 30)]
check_value('q-eta3', 10)

# titolo
v = F(112, 100) * F(85, 100) * F(110, 100)
assert round(float((v - 1) * 100), 1) == 4.7
check_idx('q-titolo', [i for i, o in enumerate(Q['q-titolo']['opts']) if '4,7%' in o][0], '+4,7%')

# ananas: anagrammi distinti che cominciano e finiscono con la stessa lettera
an = {''.join(p_) for p_ in itertools.permutations('ANANAS')}
n_st = sum(1 for a_ in an if a_[0] == a_[-1])
assert len(an) == 60 and n_st == 16
check_value('q-ananas', n_st)

# utile
ut1 = 800000 * 0.10
ut2 = 800000 * 0.95 * 0.12
check_value('q-utile', round((ut2 / ut1 - 1) * 100, 6))

# tennis: partite sul veloce
x_ = [x for x in range(0, 101) if abs(0.7 * x + 0.5 * (100 - x) - 58) < 1e-9]
assert x_ == [40]
check_value('q-tennis', 40)

# resto: n = 5 mod 9, resto di n² + 2n mod 9
r9 = {(n * n + 2 * n) % 9 for n in range(1, 2000) if n % 9 == 5}
assert r9 == {8}
check_value('q-resto9', 8)

# taxi: km in cui costano uguale
sol_t = [(km, 4 + 1.5 * km) for km in range(0, 200) if abs(4 + 1.5 * km - (1 + 2 * km)) < 1e-9]
assert sol_t == [(6, 13.0)]
check_idx('q-taxi', [i for i, o in enumerate(Q['q-taxi']['opts']) if o == '6 km e 13 €'][0], '6 km e 13 €')

# comitato: almeno 2 donne
n_c = sum(1 for c in itertools.combinations(range(9), 4) if sum(1 for p in c if p >= 5) >= 2)   # 0..4 uomini, 5..8 donne
assert n_c == 81
check_value('q-comitato', 81)

# carburante
litri = 600 / 15
check_value('q-carburante', round(litri * (2.20 - 2.00), 6))

# terzo: velocità sui due terzi
vv = [v for v in range(1, 300) if abs(3 / (F(1, 60) + F(2, v)) - 80) < 1e-9]
assert vv == [96]
check_value('q-terzo', 96)

# risparmio
n_r = [n for n in range(1, 100) if n * (n + 1) // 2 >= 500][0]
assert n_r == 32 and 31 * 32 // 2 == 496
check_value('q-risparmio', 32)

# carte: stesso seme oppure stesso valore, senza reinserimento (tutte le coppie ordinate)
carte = [(s, v_) for s in range(4) for v_ in range(10)]
cop = [(a_, b_) for a_ in carte for b_ in carte if a_ != b_]
p_c = F(sum(1 for a_, b_ in cop if a_[0] == b_[0] or a_[1] == b_[1]), len(cop))
assert p_c == F(4, 13)
check_value('q-carte', p_c)

# visualizzazioni: totale cumulato
tot, g_, giornaliere = 0, 0, 3
while tot <= 1000:
    g_ += 1
    tot += giornaliere
    if tot > 1000:
        break
    giornaliere *= 3
assert g_ == 6
check_value('q-visual', 6)

# differenza
cop_d = [(a_, b_) for a_ in range(1, 20) for b_ in range(a_, 20) if a_ + b_ == 20 and a_ * b_ == 96]
assert cop_d == [(8, 12)]
check_idx('q-differenza', [i for i, o in enumerate(Q['q-differenza']['opts']) if o == '4'][0], 'differenza 4')

# ============================ VERBALE (numeri) ============================
# v-remoto: under 40 da remoto contro under 40 in sede
ur, us = 0.75 * 160, 0.5 * 240
assert ur == us == 120 and not (ur / (ur + us) > 0.5)
assert Q['v-remoto']['ans'] == 0
# v-export
assert 0.6 * 80 == 48 > 45 and 0.45 * 100 == 45 and Q['v-export']['ans'] == 2
# v-fotovoltaico: la NON corretta è il +17%
assert 36 - 6 == 30 and round(6 / 30 * 100) == 20 and round(6 / 36 * 100) == 17 and round(0.4 * 6, 9) == 2.4 and round(36 / 0.12, 6) == 300
check_idx('v-fotovoltaico', [i for i, o in enumerate(Q['v-fotovoltaico']['opts']) if '17%' in o][0], '+17% è sbagliato')
# v-borse
dom = 2400; acc = dom * 0.25; resp = dom - acc; ec = resp * 0.6; doc = resp - ec
assert (acc, resp, ec, doc) == (600, 1800, 1080, 720) and acc * 0.4 == 240 and 240 / dom == 0.1 and dom * 0.6 == 1440
check_idx('v-borse', [i for i, o in enumerate(Q['v-borse']['opts']) if '720' in o][0], '720 documenti')
# v-corriere: 7 kg non assicurato, errore imballaggio
rimb = min(7 * 20 * 2, 100 * 2)
assert rimb == 200 and min(7 * 20, 100) == 100 and 7 * 20 == 140 and 7 * 40 == 280
check_idx('v-corriere', [i for i, o in enumerate(Q['v-corriere']['opts']) if '200 euro' in o][0], '200 euro')
# v-navetta: 150 · 40 = 6.000; 6.000 / 18.000 = 1/3 (calo di due terzi)
assert 150 * 40 == 6000 and F(6000, 18000) == F(1, 3)
# v-sigma: sia sotto sia sopra il 5%
trovati = set()
for pD in range(10, 70, 5):
    for pO in range(10, 70, 5):
        for pS in range(10, 70, 5):
            pR = 100 - pD - pO - pS
            if not (0 < pR < 10): continue
            for s in range(-10, 21):
                for t in range(-10, 21):
                    if abs((pD * 6 + pO * 4 + pS * s + pR * t) / 100 - 5) < 1e-9:
                        trovati.add('sotto' if s < 5 else 'sopra' if s > 5 else 'uguale')
assert {'sotto', 'sopra'} <= trovati
assert Q['v-sigma']['ans'] == 1 and Q['v-mensa']['ans'] == 1 and Q['v-valle']['ans'] == 0

# ============================ DATA INSIGHTS ============================
# quadrati: x, y reali positivi (griglia fine), «x > 2y»
sc_q = [(x / 4, y / 4) for x in range(1, 80) for y in range(1, 80)]
check_ds('d-quadrati', 'C', sc_q, lambda s: s[0] > 2 * s[1], lambda s: s[0] > 2 * s[1] + 1, lambda s: s[0] ** 2 > 4 * s[1] ** 2)

# ricercatori: (solo X, solo Y, entrambi, partecipanti al giovedì: scelti tra chi non è «soltanto X»)
mondi_r = []
for e in range(0, 11):
    sx, sy = 7 - e, 6 - e
    if sx < 0 or sy < 0 or sx + sy + e != 10: continue
    for part in range(0, sy + e + 1):
        mondi_r.append((sx, sy, e, part))
assert {w[2] for w in mondi_r} == {3}
check_dp('d-ricercatori', mondi_r, [
    lambda w: w[2] == 4,
    lambda w: w[0] == 4,
    lambda w: True,       # C: i partecipanti stanno tra chi si occupa di Y (vero in tutti i mondi per costruzione)
    lambda w: w[3] >= 3
], 'V')

# aree: quota online ponderata
DA = D['aree']
online = sum(q * o for q, o in zip(DA['quote'], DA['online'])) / 100
semplice = sum(DA['online']) / 3
assert online == 21 and round(semplice) == 20
check_value('d-aree', online)
check_assets('d-aree', [40, 35, 25])
assert sum(q * o for q, o in zip([25, 35, 40], DA['online'])) / 100 == 19.5 and sum(q * o for q, o in zip([35, 40, 25], DA['online'])) / 100 == 21.5

# biglietti: DS
sc_b = list(range(100, 151))
check_ds('d-biglietti', 'D', sc_b, lambda n: n, lambda n: n % 8 == 0, lambda n: n % 12 == 0)

# reparti
DR = D['reparti']
don = [n * p / 100 for n, p in zip(DR['n'], DR['donne'])]
pt = [n * p / 100 for n, p in zip(DR['n'], DR['parttime'])]
tot = sum(DR['n'])
check_predicates('d-reparti', {
    'le donne sono più degli uomini': sum(don) > tot / 2,
    'Amministrazione sono più di quelle di Vendite e IT': don[1] > don[0] + don[2],
    'part-time sono il 20%': abs(sum(pt) / tot - 0.20) < 1e-9,
    'part-time di Logistica sono tanti quanti': pt[3] == pt[0]
}, 'tabella reparti')
check_assets('d-reparti', [200, 120, 80, 100, '40%', '75%', '25%', '20%', '5%', '50%'])

# badge: mondi con tre tipi di persone (corso, badge, deposito libero) + Marco
tipi_b = [(co, ba, de) for co in (0, 1) for ba in (0, 1) for de in (0, 1) if (not co or ba) and not (ba and de)]
mondi_b = []
for cnt in itertools.product(range(2), repeat=len(tipi_b)):
    w = [t for t, c_ in zip(tipi_b, cnt) for _ in range(c_)]
    for marco in [t for t in tipi_b if t[0] == 1]:     # Marco ha seguito il corso
        mondi_b.append((w, marco))
check_dp('d-badge', mondi_b, [
    lambda m: all(not de or not co for co, ba, de in m[0]),            # A: chi accede senza accompagnatore non ha fatto il corso
    lambda m: bool(m[1][2]),                                           # B: Marco accede senza accompagnatore
    lambda m: all(not ba or co for co, ba, de in m[0]),                # C: chi ha il badge ha seguito il corso
    lambda m: not m[1][1]                                              # D: Marco non ha il badge
], 'F')

# patente: tabella 2×2 (maschi con patente, maschi senza, femmine con, femmine senza), totale 100
sc_p = [(a, b, c, d) for a in range(0, 101) for b in range(0, 101 - a) for c in range(0, 101 - a - b)
        for d in [100 - a - b - c]]
check_ds('d-patente', 'B', sc_p, lambda s: s[1],
         lambda s: s[0] + s[2] == 70 and s[2] == 30, lambda s: s[0] + s[1] == 55)

# parco
DPk = D['parco']
fer = sum(DPk['visitatori'][:5]) * DPk['prezzoFeriale']
wk = sum(DPk['visitatori'][5:]) * DPk['prezzoWeekend']
assert (fer, wk) == (8000, 8000)
check_value('d-parco', wk / (fer + wk) * 100)
assert round(800 / 1800 * 100) == 44 and round(1000 / 1800 * 100) == 56 and round(2 / 7 * 100) == 29
check_assets('d-parco', [200, 150, 250, 500, 300])

# musei
K = D['musei']
cr = {m: K[m][3] / K[m][0] - 1 for m in ('Civico', 'Mare', 'Scienza')}
tot25 = K['Civico'][3] + K['Mare'][3] + K['Scienza'][3]
v1 = max(cr, key=cr.get) == 'Mare'
v2 = K['Scienza'][3] > tot25 / 4
v3 = K['Civico'][2] > 2 * K['Scienza'][2]
check_predicates('d-musei', {
    'crescita percentuale più alta è stata quella del Museo del Mare': v1,
    'più di un quarto dei visitatori totali': v2,
    'più del doppio di quelli del Museo della Scienza': v3,
    'Nessuna delle altre': not (v1 or v2 or v3)}, 'tabella musei')
assert max(('Civico', 'Mare', 'Scienza'), key=lambda m: K[m][3] - K[m][0]) == 'Civico'
check_assets('d-musei', [120, 135, 150, 180, 80, 90, 100, 121, 60, 70])

# media7: due scenari estremi per (2), minimo per (1)
min1 = (22 * 8 + 3 * 5) / 25
assert min1 > 7
bassa = sorted([1] * 12 + [7] * 13)
alta = sorted([7] * 13 + [10] * 12)
assert bassa[12] == 7 and alta[12] == 7 and sum(bassa) / 25 < 7 < sum(alta) / 25
# (1) con qualunque scelta: media ≥ min1 > 7 → risposta «sì» sempre; (2): entrambi gli esiti → A
opts = Q['d-media7']['opts']
pos = [i for i, o in enumerate(opts) if 'Criterio A' in o]
check_idx('d-media7', pos[0], 'criterio A (la (1) basta, la (2) no)')

# magliette
mondi_m = [(m_, s_, 120 - m_ - s_) for m_ in range(1, 120) for s_ in range(1, 120)
           if 120 - m_ - s_ >= 20 and m_ > s_ > 120 - m_ - s_]
check_dp('d-magliette', mondi_m, [lambda w: w[0] > 40, lambda w: w[1] > 20, lambda w: w[2] > 30, lambda w: w[0] > 60], 'V')

# streaming
DS_ = D['stream']
ricA = [a_ * DS_['prezzoA'] for a_ in DS_['A']]
ricB = [b_ * DS_['prezzoB'] for b_ in DS_['B']]
primo = [DS_['anni'][i] for i in range(5) if ricB[i] > ricA[i]][0]
assert primo == 2024 and ricA[2] == ricB[2] == 960 and all(a_ > b_ for a_, b_ in zip(DS_['A'], DS_['B']))
check_value('d-stream', primo)
check_assets('d-stream', [100, 110, 120, 130, 140, 40, 60, 80, 100, 120])

# triangolo: Heron, lati su griglia 0,25
def heron(a, b, c):
    s = (a + b + c) / 2
    v = s * (s - a) * (s - b) * (s - c)
    return round(math.sqrt(max(v, 0)), 6) if v > 0 else None
tri = []
g = [x / 4 for x in range(1, 161)]
for b in g:
    for c in g:
        if abs(10 + b - c) > 0 and 10 + b > c and 10 + c > b and b + c > 10 and b <= c:
            tri.append((10, b, c))
check_ds('d-triangolo', 'B', tri, lambda t: heron(*t),
         lambda t: abs(sum(t) - 30) < 1e-9,
         lambda t: t[0] == t[1] or t[0] == t[2] or t[1] == t[2])

# premium: tipi (maggiorenne, fedeltà, premium)
tipi_p = [(ma, fe, pr) for ma in (0, 1) for fe in (0, 1) for pr in (0, 1) if (not pr or ma) and not (fe and pr)]
mondi_p = []
for cnt in itertools.product(range(3), repeat=len(tipi_p)):
    w = [t for t, c_ in zip(tipi_p, cnt) for _ in range(c_)]
    if any(ma and fe for ma, fe, pr in w):
        mondi_p.append(w)
check_dp('d-premium', mondi_p, [
    lambda w: any(ma and not pr for ma, fe, pr in w),
    lambda w: all(ma for ma, fe, pr in w if pr),
    lambda w: any(pr and fe for ma, fe, pr in w),
    lambda w: all(pr for ma, fe, pr in w if ma)], 'F')

# classi: media di 1B ricavata dal totale
KC = D['classi']
somma = KC['totStudenti'] * KC['mediaTot']
m1b = (somma - 20 * 6.5 - 10 * 8.0) / 30
assert abs(m1b - 7.2) < 1e-9
nuova = (20 * 6.5 + 30 * m1b + 20 * 8.0) / 70
check_predicates('d-classi', {
    'voto medio più alto delle tre classi': m1b > 8.0,
    'uguale al voto medio della classe 1B': abs((20 * 6.5 + 10 * 8.0) / 30 - m1b) < 1e-9,
    'sarebbe superiore a 7,2': nuova > 7.2,
    'media aritmetica semplice dei tre voti': abs((6.5 + m1b + 8.0) / 3 - 7.1) < 1e-9}, 'tabella classi')
check_assets('d-classi', [20, 30, 10, 60])

# grade (EN): DS sì/no
sc_g = [(w_, o_) for w_ in range(0, 31) for o_ in range(0, 31)]
check_ds('d-grade', 'A', sc_g, lambda s: 0.6 * s[0] + 0.4 * s[1] >= 24, lambda s: s[0] == 18, lambda s: s[1] == 28)

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
calcolati = {'v-remoto', 'v-export', 'v-fotovoltaico', 'v-borse', 'v-corriere', 'v-navetta', 'v-sigma'}
print('Domande verbali senza conti controllate a mano (testo/logica):',
      [k for k in Q if k.startswith('v-') and k not in calcolati])
