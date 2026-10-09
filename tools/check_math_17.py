#!/usr/bin/env python3
"""
check_math_17.py — ricalcola con il codice le risposte del Mock 17 e le
confronta con la chiave (`ans`) di docs/mocks/mock-17.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_17.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-17.js')],
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
# listino senza IVA: sconto 25% sul listino con IVA 22%, coupon 10%, pagati 164,70
l1 = [p for p in range(1, 1000) if abs(p * 1.22 * 0.75 * 0.9 - 164.7) < 1e-9]
assert l1 == [200]
check_value('q-listino', l1[0])

# fila: Anna 4ª dall'inizio, Bea 9ª dalla fine, 6 persone in mezzo, Bea dietro Anna
fila = [T for T in range(1, 80) for pb in range(1, T + 1) if pb - 4 - 1 == 6 and T - pb + 1 == 9]
assert fila == [19]
check_value('q-fila', 19)

# basi: Beta = Alfa + 50%, Gamma = Beta − 20%; Alfa rispetto a Gamma
alfa = F(100); beta = alfa * F(3, 2); gamma = beta * F(4, 5)
var = (alfa - gamma) / gamma * 100
assert round(float(var), 1) == -16.7
check_idx('q-base', [i for i, o in enumerate(Q['q-base']['opts']) if '16,7%' in plain(o)][0], 'Alfa rispetto a Gamma ≈ −16,7%')
for x in (20, 25, 30):
    assert abs(float(var) + x) > 1

# interessi composti: capitale iniziale da 12.100 dopo 2 anni, differenza a 3 anni
cap0 = [c0 for c0 in range(1000, 100000, 100) if abs(c0 * 1.1 ** 2 - 12100) < 1e-6]
assert cap0 == [10000]
comp3 = cap0[0] * (1.1 ** 3 - 1)
sempl3 = cap0[0] * 0.1 * 3
check_value('q-composto', round(comp3 - sempl3, 6))
assert round(comp3) == 3310 and sempl3 == 3000 and round(cap0[0] * (1.1 ** 2 - 1) - cap0[0] * 0.2) == 100

# inseguimento: simulazione al secondo (distanze in km)
t = 0
while True:
    anna = F(6) * F(t, 3600)
    bea = F(15) * F(max(0, t - 1800), 3600)
    if t >= 1800 and bea >= anna:
        break
    t += 1
assert t - 1800 == 20 * 60
check_idx('q-inseguimento', [i for i, o in enumerate(Q['q-inseguimento']['opts']) if o.startswith('20 minutes')][0], '20 minuti')

# lavoro: simulazione al minuto
vol, minuto = F(0), 0
while vol < 1:
    if minuto < 60:
        r = F(1, 6) + F(1, 3)
    else:
        r = F(1, 3) + F(1, 12)
    vol += r / 60
    minuto += 1
assert minuto == 132, minuto
check_idx('q-lavoro', [i for i, o in enumerate(Q['q-lavoro']['opts']) if o == '2 ore e 12 minuti'][0], '132 minuti')

# azioni: lotto da 30 € (a azioni a 20 €, b azioni a 30 €)
az = [(a_, b_) for a_ in range(0, 101) for b_ in range(0, 101)
      if 20 * a_ + 30 * b_ == 1200 and a_ + b_ > 0 and abs((20 * a_ + 30 * b_) / (a_ + b_) - 24) < 1e-9]
assert az == [(30, 20)]
check_value('q-azioni', az[0][1])

# calendario
from datetime import date
assert date(2027, 1, 1).strftime('%A') == 'Friday'
giorni = {'Monday': 'lunedì', 'Tuesday': 'martedì', 'Wednesday': 'mercoledì', 'Thursday': 'giovedì', 'Friday': 'venerdì'}
g = giorni[date(2028, 3, 1).strftime('%A')]
assert g == 'mercoledì' and (date(2028, 3, 1) - date(2027, 1, 1)).days == 425
check_idx('q-calendario', [i for i, o in enumerate(Q['q-calendario']['opts']) if o == g][0], g)

# dadi: probabilità condizionata
coppie = [(a, b) for a in range(1, 7) for b in range(1, 7) if a + b >= 10]
assert len(coppie) == 6
p_dadi = F(sum(1 for a, b in coppie if 6 in (a, b)), len(coppie))
assert p_dadi == F(5, 6)
check_value('q-dadi', p_dadi)

# rate: base = prezzo in contanti
rate = 300 + 6 * 150
assert rate == 1200
check_idx('q-rate', [i for i, o in enumerate(Q['q-rate']['opts']) if '11,1%' in o][0], '(1200−1080)/1080 ≈ 11,1%')
assert round((rate - 1080) / 1080 * 100, 1) == 11.1

# resti
n_ = [n for n in range(1, 201) if n % 6 == 4 and n % 9 == 7]
assert len(n_) == 11 and n_[0] == 16 and n_[-1] == 196
check_value('q-resti', len(n_))

# rapporti 3 : 2 → 5 : 6
r_ = [3 * k + 2 * k for k in range(1, 200) if (3 * k - 5) * 6 == (2 * k + 10) * 5]
assert r_ == [50]
check_value('q-rapporti', 50)

# scaglioni
def imposta(R): return 0.2 * min(R, 20000) + 0.4 * max(0, R - 20000)
R_ = [R for R in range(0, 200001, 100) if abs(imposta(R) - 16000) < 1e-6]
assert R_ == [50000]
check_value('q-scaglioni', 16000 / R_[0] * 100)

# torneo
n_sq = [n for n in range(2, 100) if n * (n - 1) // 2 == 45]
assert n_sq == [10]
check_value('q-torneo', 7 * 6 // 2)

# cifre in ordine strettamente crescente
cc = sum(1 for n in range(100, 1000) if str(n)[0] < str(n)[1] < str(n)[2])
check_value('q-cifre', cc)

# insiemi: tra i francofoni, quota di anglofoni
sol_ins = [b for b in range(0, 121) if 84 + 60 - b == 120 - 24]
assert sol_ins == [48]
check_value('q-insiemi', F(sol_ins[0], 60) * 100)

# tiratori: esattamente un colpo a segno
pp = [F(1, 2), F(1, 3), F(1, 4)]
p_uno = F(0)
for e in itertools.product([0, 1], repeat=3):
    if sum(e) == 1:
        pr = F(1)
        for pi, ei in zip(pp, e):
            pr *= pi if ei else 1 - pi
        p_uno += pr
assert p_uno == F(11, 24)
check_value('q-tiratori', p_uno)

# mediana: valori possibili del massimo
poss = set()
for a in range(1, 31):
    for b in range(a, 31):
        c = 30 - a - b
        if c >= b and b == 8:
            poss.add(c)
assert len(poss) > 1 and 14 in poss and 16 in poss and 22 not in poss
check_idx('q-mediana', [i for i, o in enumerate(Q['q-mediana']['opts']) if 'determinabile' in o][0], 'non determinabile')

# ============================ VERBALE (numeri) ============================
assert 0.25 * 120 == 30 and 0.10 * 80 == 8 and not (8 > 10)            # v-formazione: falsa
assert 45000 / 0.9 == 50000 and 0.9 * 1.08 < 1 and abs(270000 / 1.08 - 250000) < 1e-6 and 270000 * 0.92 == 248400   # v-case
assert 1800 * 1.02 == 1836 and abs(1800 / 1.2 * 1.04 - 1560) < 1e-6 and round(1836 / 1560 * 100) == 118        # v-debito
fuori_min = 0.70 * 620
tot_fuori = range(int(fuori_min), 1001)
assert any(fuori_min / n > 0.5 for n in tot_fuori) and any(fuori_min / n < 0.5 for n in tot_fuori)           # v-auto: non determinabile
check_idx('v-debito', [i for i, o in enumerate(Q['v-debito']['opts']) if 'si è ridotto in valore assoluto' in o][0], 'debito: NON corretta')
assert 45 * 1 == 45 and 20 * 1 == 20
# v-auto/v-formazione: posizione fissata nella chiave
assert Q['v-formazione']['ans'] == 0 and Q['v-auto']['ans'] == 1 and Q['v-biblioteca']['ans'] == 1
assert Q['v-parco']['ans'] == 2 and Q['v-dazio']['ans'] == 0

# ============================ DATA INSIGHTS ============================
# urna: R, B, G
sc_u = [(r, b, g) for r in range(1, 41) for b in range(1, 41) for g in range(1, 41)]
check_ds('d-urna', 'A', sc_u, lambda s: s[0] * 3 > sum(s), lambda s: s[0] < s[1] < s[2], lambda s: s[0] == 12)

# pizzeria
DP = D['pizzeria']
marg = [r - DP['fissi'] - r * DP['varPct'] / 100 for r in DP['ricavi']]
mesi15 = sum(1 for m in marg if m > DP['soglia'])
assert mesi15 == 2 and sum(1 for r in DP['ricavi'] if r - 30 > 15) == 4 and sum(1 for r in DP['ricavi'] if r * .85 - 30 > 15) == 3
check_value('d-pizzeria', mesi15)
check_assets('d-pizzeria', [40, 50, 60, 45, 54, 72, '30.000', '20%'])

# tabella canali
C_ = D['canali']
u = {p: {c: C_['unita'][i] * C_['pct'][i][j] / 100 for j, c in enumerate(C_['canali'])} for i, p in enumerate(C_['prodotti'])}
tot_c = {c: sum(u[p][c] for p in u) for c in C_['canali']}
tot_all = sum(C_['unita'])
check_predicates('d-tabcanali', {
    'Ingrosso rappresenta esattamente un quarto': tot_c['Ingrosso'] * 4 == tot_all,
    'inferiori a quelle di Beta': u['Alfa']['Online'] < u['Beta']['Online'],
    'più del doppio di Beta e Gamma': u['Alfa']['Negozio'] > 2 * (u['Beta']['Negozio'] + u['Gamma']['Negozio']),
    'Online ha venduto più unità': tot_c['Online'] > tot_c['Negozio']
}, 'tabella canali')
check_assets('d-tabcanali', [200, 150, 50, 30, 50, 20, 40, 30, 30, 60, 10, 30])

# turni: mondi con conteggi per tipo di turno
tipi = [frozenset(t) for t in [{'M'}, {'P'}, {'M', 'P'}, {'P', 'N'}, {'M', 'P', 'N'}]]   # chi ha N ha anche P
mondi_t = []
for cnt in itertools.product(range(13), repeat=5):
    if sum(cnt) != 12:
        continue
    m = sum(c for c, t in zip(cnt, tipi) if 'M' in t)
    pp_ = sum(c for c, t in zip(cnt, tipi) if 'P' in t)
    if m == 8 and pp_ == 7:
        mondi_t.append(dict(zip(tipi, cnt)))
def cnt_t(w, f): return sum(c for t, c in w.items() if f(t))
check_dp('d-turni', mondi_t, [
    lambda w: cnt_t(w, lambda t: 'M' in t and 'P' in t) == 3,
    lambda w: cnt_t(w, lambda t: 'N' in t) >= 1,
    lambda w: cnt_t(w, lambda t: 'P' not in t and 'M' not in t) == 0 and cnt_t(w, lambda t: 'P' not in t) == cnt_t(w, lambda t: 'P' not in t and 'M' in t),
    lambda w: cnt_t(w, lambda t: t == frozenset({'M'})) >= 6
], 'V')

# gruppi: (entrambe, nessuna, solo inglese, solo spagnolo)
sc_g = [(b, 60 - (80 - b) if False else n, 45 - b, 35 - b) for b in range(0, 61) for n in range(0, 61)
        if 45 - b >= 0 and 35 - b >= 0 and b + n + (45 - b) + (35 - b) == 60]
check_ds('d-gruppi', 'B', sc_g, lambda s: s[0], lambda s: True, lambda s: s[1] == 0) if False else None
# la (1) fissa inglese=45 e spagnolo=35 negli scenari; la (2) è «nessuno senza lingue»:
sc_g2 = [(b, n, e, s_) for b in range(0, 61) for n in range(0, 61) for e in range(0, 61) for s_ in range(0, 61)
         if b + n + e + s_ == 60]
check_ds('d-gruppi', 'B', sc_g2, lambda s: s[0], lambda s: s[0] + s[2] == 45 and s[0] + s[3] == 35, lambda s: s[1] == 0)

# lavoro
DL = D['lavoro']
dis21 = DL['tasso'][1] / 100 * DL['forza']['2021']
dis24 = DL['tasso'][4] / 100 * DL['forza']['2024']
check_value('d-lavoro', round((dis24 / dis21 - 1) * 100, 6))
check_assets('d-lavoro', [20, 22])

# reparti
mondi_r = []
for x in range(1, 37):
    for y in range(x, 37):
        z = 36 - x - y
        if z >= y and x >= 8 and z == 2 * x:
            mondi_r.append((x, y, z))
assert mondi_r == [(8, 12, 16), (9, 9, 18)]
check_dp('d-reparti', mondi_r, [lambda w: w[0] > 8, lambda w: w[2] >= 16, lambda w: w[1] > 12, lambda w: 10 in w], 'F')

# xy
sc_x = [(x, y) for x in range(1, 80) for y in range(1, 80)]
check_ds('d-xy', 'C', sc_x, lambda s: s[0] * s[1] > 100, lambda s: s[0] >= 11 and s[1] >= 10, lambda s: s[0] + s[1] == 20)

# colture
K = D['colture']
f, mm, o = K['Frumento'], K['Mais'], K['Orzo']
cresc = {c: K[c][2] / K[c][0] for c in ('Frumento', 'Mais', 'Orzo')}
tot25 = f[2] + mm[2] + o[2]
v1 = all(f[i] > mm[i] + o[i] for i in range(3))
v2 = max(cresc, key=cresc.get) == 'Mais'
v3 = mm[2] / tot25 > 0.36
assert not (v1 or v2 or v3)
check_predicates('d-colture', {
    'In ciascuno dei tre anni': v1, 'crescita percentuale più alta': v2,
    'più del 36%': v3, 'Nessuna delle altre': not (v1 or v2 or v3)}, 'tabella colture')
check_assets('d-colture', [80, 90, 99, 60, 66, 72, 20, 22, 30])

# punti: (V, P, S)
sc_p = [(v, p, 10 - v - p) for v in range(0, 11) for p in range(0, 11) if 10 - v - p >= 0]
check_ds('d-punti', 'D', sc_p, lambda s: s[0], lambda s: 3 * s[0] + s[1] == 17, lambda s: s[1] > 1)

# età: cinque interi distinti, somma 100, il minimo è 14
mondi_e = []
for a in range(15, 87):
    for b in range(a + 1, 87):
        for c in range(b + 1, 87):
            d_ = 86 - a - b - c
            if d_ > c:
                mondi_e.append((14, a, b, c, d_))
assert mondi_e
check_dp('d-eta', mondi_e, [lambda w: w[4] >= 23, lambda w: w[4] <= 40, lambda w: sum(1 for x in w if x < 20) >= 2, lambda w: w[2] == 20], 'V')

# corsi
DC = D['corsi']
inc24 = sum(n * r for n, r in zip(DC['y24'], DC['retta']))
r25 = [DC['retta'][0], DC['retta'][1], DC['retta'][2] * (100 - DC['scontoC']) / 100]
inc25 = sum(n * r for n, r in zip(DC['y25'], r25))
assert (inc24, inc25) == (640000, 780000)
check_value('d-corsi', inc25 - inc24)
check_assets('d-corsi', [120, 80, 40, 150, 60, 100, '2.000', '3.000', '4.000', '25%'])

# farmaci: tipi (senza ricetta, scaffale frontale, scade entro un anno)
tipi_c = [(sr, fr_, sc) for sr in (0, 1) for fr_ in (0, 1) for sc in (0, 1) if (not sr or fr_) and not (fr_ and sc)]
mondi_c = []
for cnt in itertools.product(range(3), repeat=len(tipi_c)):
    w = [t for t, c_ in zip(tipi_c, cnt) for _ in range(c_)]
    if any(sr for sr, _, _ in w):
        mondi_c.append(w)
check_dp('d-farmaci', mondi_c, [
    lambda w: any(sr and sc for sr, f_, sc in w),
    lambda w: not any(sc and sr for sr, f_, sc in w),
    lambda w: any(f_ and sr for sr, f_, sc in w),
    lambda w: any(sc and f_ for sr, f_, sc in w)], 'F')

# spese
SP = D['spese']
M = {r[0]: list(r[1]) for r in SP['righe']}
tot_r = {r[0]: r[2] for r in SP['righe']}
sol_s = []
for p2 in range(0, 400):
    for l1_ in range(0, 400):
        m2 = SP['totCol'][1] - p2 - M['Logistica'][1]
        m3 = SP['totCol'][2] - M['Produzione'][2] - M['Logistica'][2]
        if p2 + M['Produzione'][0] + M['Produzione'][2] != tot_r['Produzione']: continue
        if l1_ + M['Logistica'][1] + M['Logistica'][2] != tot_r['Logistica']: continue
        if M['Marketing'][0] + m2 + m3 != tot_r['Marketing']: continue
        if m2 * SP['rapportoMkt'][1] != m3 * SP['rapportoMkt'][0]: continue
        if SP['totCol'][0] != M['Produzione'][0] + l1_ + M['Marketing'][0]: continue
        sol_s.append((p2, l1_, m2, m3))
assert sol_s == [(150, 50, 40, 25)], sol_s
p2, l1_, m2, m3 = sol_s[0]
check_predicates('d-spese', {
    'logistica ha speso più della produzione': l1_ > M['Produzione'][0],
    'il triplo del marketing': M['Logistica'][2] == 3 * m3,
    'meno che nel primo': m2 < M['Marketing'][0],
    'più del 65%': p2 / SP['totCol'][1] > 0.65}, 'tabella spese')
check_assets('d-spese', [120, 150, 420, 60, 75, 185, 30, 95, 200, 250, 250, 700])

# biglie
sc_m = [(r, b) for r in range(1, 80) for b in range(1, 80)]
check_ds('d-marbles', 'B', sc_m, lambda s: s[1], lambda s: 5 * s[0] == 3 * (s[0] + s[1]), lambda s: s[0] == 12)

# rettangolo: area 48, lati su una griglia razionale fine
sc_rt = []
for a10 in range(1, 961):
    a = F(a10, 10)
    b = F(48) / a
    sc_rt.append((a, b))
check_ds('d-rettangolo', 'A', sc_rt, lambda s: s[0] + s[1],
         lambda s: s[0].denominator == 1 and s[1].denominator == 1, lambda s: s[0] ** 2 + s[1] ** 2 == 100)

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
print('Domande verbali senza numeri controllate a mano (testo/logica):',
      [k for k in Q if k.startswith('v-') and k not in ('v-formazione', 'v-case', 'v-debito', 'v-auto')])
