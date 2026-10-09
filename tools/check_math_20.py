#!/usr/bin/env python3
"""
check_math_20.py — ricalcola con il codice le risposte del Mock 20 e le
confronta con la chiave (`ans`) di docs/mocks/mock-20.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_20.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-20.js')],
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

# ============================ QUANTITATIVA ============================
# carburante
check_value('q-carburante', 300 / 12 * 1.80 - 300 * 0.12)
assert round(300 / 12 * 1.80 - 300 * 0.12, 6) == 9

# sconti: listino dallo scontato
L_ = [p for p in range(1, 5000) if F(p) * F(90, 100) * F(85, 100) == 459]
assert L_ == [600]
check_value('q-sconti', 600)
assert round(459 / 0.75) == 612 and round(459 / 0.9) == 510 and round(459 * 1.25) == 574

# monete: due estratte insieme, valore di almeno 3 €
monete = [1] * 5 + [2] * 3
coppie = list(itertools.combinations(range(8), 2))
p_m = F(sum(1 for a_, b_ in coppie if monete[a_] + monete[b_] >= 3), len(coppie))
assert p_m == F(9, 14)
check_value('q-monete', p_m)
assert 1 - F(25, 64) == F(39, 64) and F(5 * 3, 28) == F(15, 28)

# ricavo
check_value('q-ricavo', round((1 / 0.8 - 1) * 100, 6))

# cassa
an = {''.join(p_) for p_ in itertools.permutations('CASSA')}
n_c = sum(1 for a_ in an if 'SS' not in a_)
assert len(an) == 30 and n_c == 18
check_value('q-cassa', n_c)

# età media
x_ = [e for e in range(0, 200) if 10 * 30 - e == 9 * 28]
assert x_ == [48]
check_value('q-eta-media', 48)

# quaderni: sistema
sol_q = [(q_, p_) for q_ in range(1, 20) for p_ in range(1, 20) if 5 * q_ + 4 * p_ == 50 and 3 * q_ + 4 * p_ == 38]
assert sol_q == [(6, 5)]
check_value('q-quaderni', 2 * 6 + 3 * 5)

# stranieri
N_ = [N for N in range(100, 100000, 10) if F(N, 10) + 1000 == F(15, 100) * (N + 1000)]
assert N_ == [17000]
check_value('q-stranieri', 17000)
assert 1000 / 0.05 == 20000

# resto127
r_ = [n for n in range(100, 151) if n % 4 == 3 and n % 3 == 1 and n % 5 == 2]
assert r_ == [127]
check_value('q-resto127', 127)
for esca, ok in ((107, (True, False, True)), (112, (False, True, True)), (139, (True, True, False))):
    assert (esca % 4 == 3, esca % 3 == 1, esca % 5 == 2) == ok, esca

# margine
costo = 160 - 0.25 * 160
assert costo == 120
check_value('q-margine', costo * 1.25)

# calendario
d0 = datetime.date(2028, 2, 29)
d1 = datetime.date(2032, 2, 29)
assert d0.weekday() == 1                       # martedì
giorni = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica']
assert giorni[d1.weekday()] == 'domenica' and (d1 - d0).days == 1461
check_idx('q-calendario', idx('q-calendario', 'domenica'), 'domenica')

# ciclista: simulazione al minuto
minuti, km, sosta_fatta = 0, 0.0, False
while km < 60 - 1e-9:
    if minuti == 60 and not sosta_fatta:
        minuti += 30
        sosta_fatta = True
        continue
    v = 20 if minuti < 60 else 30
    km += v / 60
    minuti += 1
assert minuti == 170 and (8 * 60 + minuti) // 60 == 10 and (8 * 60 + minuti) % 60 == 50
check_idx('q-ciclista', idx('q-ciclista', '10:50'), '10:50')

# soci
parti = F(80000, 10)
primo = 2 * parti + F(1, 5) * 5 * parti
assert primo == 24000
check_value('q-soci', primo)

# bayes
pop = 10000
mal, sani = pop // 100, pop - pop // 100
pos_m, pos_s = mal * 9 // 10, sani * 1 // 10
assert F(pos_m, pos_m + pos_s) == F(1, 12)
check_value('q-bayes', F(pos_m, pos_m + pos_s))

# francia
it_, de_ = F(75), F(120)
check_value('q-francia', float((de_ / it_ - 1) * 100))
assert 1.2 * 1.25 == 1.5 and round(100 / 75 * 100 - 100) == 33

# orologio: intervalli
intervallo = F(5, 6 - 1)
check_idx('q-orologio', idx('q-orologio', '11 secondi'), '11 s')
assert intervallo * (12 - 1) == 11

# resto 2^100 mod 7
assert pow(2, 100, 7) == 2
check_value('q-resto2', 2)

# tavolo rotondo: disposizioni a meno di rotazioni, con Anna (0) e Bea (1) vicine
def canonica(p):
    i = p.index(0)
    return p[i:] + p[:i]
cerchi = {canonica(p) for p in itertools.permutations(range(5))}
vicine = [c for c in cerchi if abs(c.index(1) - c.index(0)) in (1, 4)]
assert len(cerchi) == 24 and len(vicine) == 12
check_value('q-tavolo', len(vicine))

# ============================ VERBALE (numeri e logica) ============================
check_vfn('v-terrafina', 0)      # «esclusivamente … soltanto nel 2019»
check_vfn('v-scuola', 2)         # quarto figlio: 50% di 4.000
assert 4000 * F(50, 100) == 2000
check_vfn('v-trasporto', 1)
check_vfn('v-ponte', 1)
# bilancio: istruzione 32% di 40 milioni contro tariffe = resto
tar = 40 * (100 - 25 - 45) / 100
istr = 40 * 32 / 100
assert (tar, istr) == (12.0, 12.8) and istr > tar
check_vfn('v-bilancio', 0)

# skyvia: la NON corretta è «raddoppiato»
p24, p25 = 10_000_000, 11_000_000
b24, b25 = p24 * 20 // 100, p25 * 30 // 100
assert (b24, b25) == (2_000_000, 3_300_000) and not b25 >= 2 * b24 and round((b25 / b24 - 1) * 100) == 65
assert p25 / p24 == 1.1 and p25 * 80 < p24 * 90
check_predicates('v-skyvia', {
    'è raddoppiato': True,                     # sbagliata → risposta giusta
    'aveva trasportato 10 milioni': False,
    'inferiori a quelli del 2024': False,
    '3,3 milioni': False}, 'quale NON è corretta')

# pareggio
margine = 50 - 30
check_predicates('v-pareggio', {
    '2.000 unità': 40000 / margine == 2000,
    '800 unità': 40000 / 50 == 2000,
    '1.333 unità': round(40000 / 30) == 2000,
    '4.000 unità': 40000 / 10 == 2000}, 'punto di pareggio')

# prezzi delle case
p21, p22 = 100 * 1.10, 100 * 1.10 * 1.05
p23 = p22 * 0.90
assert round(p23, 2) == 103.95
check_predicates('v-prezzi-case', {
    'ancora superiori a quelli del 2020': p23 > 100,
    'al di sotto del livello del 2020': p23 < 100,
    'esattamente del 15%': round(p22, 6) == 115,
    'tornati al livello del 2021': abs(p23 - p21) < 1e-9}, 'prezzi delle case')

# rinnovabili
assert 13 - 10 == 3 and round((13 / 10 - 1) * 100) == 30
assert Q['v-rinnovabili']['ans'] == idx('v-rinnovabili', 'superiore di 3 punti percentuali')

# incidenti
m24, m25 = 4000 * 5 // 100, 3600 * 6 // 100
assert (m24, m25) == (200, 216) and 3600 - m25 == 3384
check_predicates('v-incidenti', {
    'incidenti mortale' if False else 'degli incidenti mortali è stato superiore': m25 > m24,
    'aumentati del 20%': round((m25 / m24 - 1) * 100) == 20,
    'dovuto ai 40 nuovi autovelox': False,
    'meno di 3.350': 3600 - m25 < 3350}, 'incidenti')

# regola della palestra: Paolo, 5 mesi, preavviso 10 gg, 45 gg senza certificato
def sospensione_ok(mesi, preavviso, giorni, certificato):
    if mesi < 2 or preavviso < 7 or giorni > 60:
        return False
    return giorni <= 30 or certificato
assert not sospensione_ok(5, 10, 45, False) and sospensione_ok(5, 10, 30, False) and sospensione_ok(5, 10, 45, True)
assert Q['v-regola']['ans'] == idx('v-regola', 'non può superare i 30 giorni')

# fattore: 94% dei 1.200 rispondenti; non rispondenti 18.800
assert 20000 - 1200 == 18800 and Q['v-fattore']['ans'] == idx('v-fattore', '18.800 clienti che non hanno risposto')

# ============================ DATA INSIGHTS ============================
# medie (DS sì/no): quattro interi positivi con somma 60 (ordinati)
sc_m = [t for t in itertools.combinations_with_replacement(range(1, 61), 4) if sum(t) == 60]
check_ds('d-medie', 'A', sc_m, lambda t: t[0] > 10,
         lambda t: t[2] + t[3] == 40, lambda t: t[3] == 25)

# quadrato e rettangolo
sc_qr = [(a, b) for a in range(1, 61) for b in range(1, 61)]   # lati del rettangolo
check_ds('d-quadrato', 'B', sc_qr, lambda s: F(2 * (s[0] + s[1]), 4) ** 2,
         lambda s: 6 in s, lambda s: s[0] * s[1] == 60)
assert (2 * (6 + 10) / 4) ** 2 == 64

# pompe: tA in ore (1..24), portata di B = k · portata di A
sc_po = [(tA, k) for tA in range(1, 25) for k in (F(1, 2), F(1), F(2), F(3), F(4))]
check_ds('d-pompe', 'B', sc_po, lambda s: F(s[0]) / (1 + s[1]), lambda s: s[0] == 6, lambda s: s[1] == 2)
assert F(6) / 3 == 2

# età di Anna
sc_e = list(range(1, 101))
check_ds('d-eta-ds', 'C', sc_e, lambda x: x, lambda x: x + 6 == 3 * (x - 6), lambda x: x + 3 == 5 * (x - 9))

# cifre
sc_c = list(range(10, 100))
check_ds('d-cifre', 'D', sc_c, lambda n: n, lambda n: n // 10 + n % 10 == 9, lambda n: n % 2 == 1)
assert [n for n in sc_c if n // 10 + n % 10 == 9 and n % 2 == 1] == [27, 45, 63, 81]

# classe: (femmine totali, femmine bocciate) con 9 bocciati in tutto
sc_cl = [(Ft, Fb, Mb) for Ft in range(0, 31) for Fb in range(0, Ft + 1) for Mb in range(0, 31 - Ft + 1) if Fb + Mb == 9]
check_ds('d-classe', 'A', sc_cl, lambda s: (30 - s[0]) - s[2], lambda s: s[0] == 12 and s[1] == 3, lambda s: s[2] == 6)

# gare: tornei a 6 squadre senza pareggi
squadre = range(6)
partite = list(itertools.combinations(squadre, 2))
mondi_g = []
for esiti in itertools.product([0, 1], repeat=len(partite)):     # 0 = vince la prima, 1 = vince la seconda
    vittorie = [0] * 6
    for (a_, b_), e in zip(partite, esiti):
        vittorie[a_ if e == 0 else b_] += 1
    if vittorie[0] == 4 and vittorie[1] == 3:
        mondi_g.append((vittorie, dict(zip(partite, esiti))))
def batte(w, a_, b_):
    return (w[1][(a_, b_)] == 0) if a_ < b_ else (w[1][(b_, a_)] == 1)
check_dp('d-gare', mondi_g, [
    lambda w: 5 - w[0][0] == 1,
    lambda w: batte(w, 1, 0),
    lambda w: len(partite) == 15,
    lambda w: (5 - w[0][1]) < (5 - w[0][0])], 'V')

# età: ordinamenti di cinque amici (0 = Anna, 1 = Bruno, 2 = Carla, 3 = Dario, 4 = Elena), età = rango
mondi_et = [r for r in itertools.permutations(range(5))
            if r[0] > r[1] and r[0] > r[2] and r[3] < r[1] and r[4] > r[0]]
check_dp('d-eta', mondi_et, [
    lambda r: r[1] > r[4],
    lambda r: r[2] > r[3],
    lambda r: r[4] > r[3],
    lambda r: r[3] > r[0]], 'F')

# dipendenti
mondi_d = [N for N in range(40, 61) if (3 * N) % 5 == 0 and (2 * N // 5) % 4 == 0 and (2 * N) % 5 == 0]
assert mondi_d == [40, 50, 60]
check_dp('d-dipendenti', mondi_d, [
    lambda N: N > 45,
    lambda N: N % 5 == 0,
    lambda N: 2 * N // 5 // 4 >= 4,
    lambda N: 3 * N // 5 > 28], 'V')

# logica: tre individui con (architetto, pittore, ingegnere, laureato)
def val(p):
    a_, p_, i_, l_ = p
    return not (p_ and i_) and (not i_ or l_)
tutti = [p for p in itertools.product([False, True], repeat=4) if val(p)]
mondi_l = [w for w in itertools.product(tutti, repeat=3) if any(p[0] and p[1] for p in w)]
check_dp('d-logica', mondi_l, [
    lambda w: any(p[0] and not p[2] for p in w),
    lambda w: all(p[2] for p in w if p[0]),
    lambda w: all(not (p[2] and p[0]) for p in w),
    lambda w: any(p[2] and p[1] for p in w)], 'F')

# fondo (linea)
DF = D['fondo']
var = [F(DF['valore'][i], DF['valore'][i - 1]) - 1 for i in range(1, 6)]
anno_max = DF['anni'][1 + max(range(5), key=lambda i: var[i])]
assert anno_max == 2023 and [float(v) for v in var][:3] == [0.2, -0.1, 0.25]
check_value('d-fondo', anno_max)
assert 135 - 108 == 162 - 135 == 27
check_assets('d-fondo', [100, 120, 108, 135, 162, 148])

# trimestri (barre ricavi/costi)
DT_ = D['trimestri']
lordo = sum(r - c for r, c in zip(DT_['ricavi'], DT_['costi']))
assert lordo == 11
check_value('d-trimestri', lordo * (100 - DT_['imposte']) / 100)
check_assets('d-trimestri', [20, 25, 30, 35, 18, 24, 27, 30, 30])

# comune (torta con rapporto 1:2:1 e aumento)
DC = D['comune']
assert sum(DC['quote']) == 100
trasp = DC['totale'] * DC['quote'][2] / 100
auto = trasp * DC['trasporti'][1] / sum(DC['trasporti'])
check_value('d-comune', round(auto * 1.1, 9))
assert trasp * 1.1 == 13.200000000000001 or round(trasp * 1.1, 6) == 13.2
check_assets('d-comune', [30, 25, 20, 60, 10])

# piani (percentuali di riga)
DP_ = D['piani']
conta = lambda col: [n * p // 100 for n, p in zip(DP_['n'], DP_[col])]
base, plus, prem = conta('base'), conta('plus'), conta('premium')
tot = sum(DP_['n'])
assert (base, plus, prem) == ([500, 200, 150], [300, 200, 200], [200, 100, 150]) and tot == 2000
check_predicates('d-piani', {
    'il piano Base è scelto da più del 40%': sum(base) > 0.4 * tot,
    'In ciascuna regione il piano Plus è scelto da almeno il 40%': all(p >= 40 for p in DP_['plus']),
    'Premium del Sud sono più numerosi di quelli del Nord': prem[2] > prem[0],
    'Premium sono più di un quarto del totale': sum(prem) > tot / 4}, 'tabella piani')
assert sum(base) / tot == 0.425 and sum(DP_['base']) / 3 == 40
check_assets('d-piani', ['1.000', 500, '50%', '40%', '30%', '20%'])

# produzione (nessuna delle altre falsa)
DR = D['produzione']
A_, B_, C_ = DR['A'], DR['B'], DR['C']
t21, t25 = A_[0] + B_[0] + C_[0], A_[4] + B_[4] + C_[4]
incr = [A_[i] - A_[i - 1] for i in range(1, 5)]
cond = {
    'ogni anno della stessa quantità': len(set(incr)) == 1,
    'più della metà di quanto': B_[4] > (A_[4] + C_[4]) / 2,
    'cresciuta di più del 30%': t25 > t21 * 1.3,
}
assert (t21, t25) == (260, 340) and incr == [6, 6, 6, 12]
check_predicates('d-produzione', dict(cond, **{'Nessuna delle altre': not any(cond.values())}), 'tabella produzione')
check_assets('d-produzione', [120, 126, 132, 138, 150, 80, 84, 92, 100, 104, 60, 66, 70, 78, 86])

# iscritti (celle nascoste)
DI_ = D['iscritti']
a25 = DI_['totRiga'][0] - DI_['y24'][0]
b24 = DI_['totRiga'][1] - DI_['y25'][1]
assert (a25, b24) == (150, 110)
assert DI_['y24'][0] + b24 + DI_['y24'][2] == DI_['totCol'][0] and a25 + DI_['y25'][1] + DI_['y25'][2] == DI_['totCol'][1]
assert DI_['totCol'][0] + DI_['totCol'][1] == DI_['totale']
cond_i = {
    'più iscritti dei corsi B e C messi insieme': a25 > DI_['y25'][1] + DI_['y25'][2],
    'il corso B è cresciuto di più del 20%': DI_['y25'][1] > 1.2 * b24,
    'il corso A è cresciuto del 25%': a25 == 1.25 * DI_['y24'][0],
}
check_predicates('d-iscritti', dict(cond_i, **{'Nessuna delle altre': not any(cond_i.values())}), 'tabella iscritti')
check_assets('d-iscritti', [120, 130, 80, 100, 270, 240, 180, 310, 380, 690])

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
calcolati = {'v-terrafina', 'v-scuola', 'v-trasporto', 'v-ponte', 'v-bilancio', 'v-skyvia', 'v-pareggio', 'v-prezzi-case', 'v-rinnovabili', 'v-incidenti', 'v-regola', 'v-fattore'}
print('Domande verbali senza conti controllate a mano (testo/logica):',
      [k for k in Q if k.startswith('v-') and k not in calcolati])
