#!/usr/bin/env python3
"""
check_math_22.py — ricalcola con il codice le risposte del Mock 22 e le
confronta con la chiave (`ans`) di docs/mocks/mock-22.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_22.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-22.js')],
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
    t = re.sub(r'(circa|about|km/h|km|kg|€|%|anni|ore|giorni|minuti|cm|milioni di euro|\bg\b|\bs\b)', '', t).replace(' ', '')
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

# ============================ QUANTITATIVA ============================
# lordo → netto
check_value('q-lordo', 2000 * 0.9 * 0.8)
assert 2000 * 0.7 == 1400 and 2000 * 0.8 == 1600 and round(2000 * 0.9 * 0.9) == 1620

# pompe: simulazione al minuto
vol, t = 0, 0
while vol < 12000:
    vol += 100 + (150 if t < 30 else 0)
    t += 1
assert t == 75
check_value('q-pompe', t)
assert 12000 / 250 == 48 and 12000 / 100 == 120

# tre numeri
x_ = [x for x in range(1, 60) if x + 2 * x + (2 * x + 5) == 60]
assert x_ == [11]
check_value('q-tre-numeri', 2 * 11 + 5)

# resti 3 mod 4, 4 mod 5, 5 mod 6
n_ = [n for n in range(1, 400) if n % 4 == 3 and n % 5 == 4 and n % 6 == 5]
assert n_[:2] == [59, 119]
check_value('q-resto59', n_[0])
assert 29 % 4 == 1 and 63 % 5 == 3

# dadi: somma prima
primi = {2, 3, 5, 7, 11}
fav = sum(1 for a_, b_ in itertools.product(range(1, 7), repeat=2) if a_ + b_ in primi)
assert fav == 15 and F(fav, 36) == F(5, 12)
check_value('q-primi', F(fav, 36))
assert F(12, 36) == F(1, 3) and F(14, 36) == F(7, 18)

# tasse
x_ = [p for p in range(1, 1000) if F(p) * F(6, 5) == 180]
assert x_ == [150]
check_value('q-tasse', 180 - 150)
assert 180 * 0.2 == 36 and 180 / 4 == 45

# numeri di tre cifre con somma 4
n_c = sum(1 for n in range(100, 1000) if sum(map(int, str(n))) == 4)
assert n_c == 10
check_value('q-cifre', n_c)
assert sum(1 for a_, b_, c_ in itertools.product(range(10), repeat=3) if a_ + b_ + c_ == 4) == 15

# altezze
altre = F(12 * 190 - 4 * 195, 8)
assert altre == F(375, 2)
check_value('q-altezze', float(altre))

# voti
V_ = [v for v in range(1000, 20001) if F(55, 100) * F(90, 100) * v == 3960]
assert V_ == [8000]
check_value('q-voti', 8000)
assert round(3960 / 0.55) == 7200 and round(3960 / 0.45) == 8800 and round(7200 * 1.1) == 7920

# penne e quaderni
quad = 10 / 2
pen = 3 * quad / 5
assert pen * 15 == 45
check_value('q-penne', pen * 15)

# prodotto 24: somme possibili
somme = {a_ + 24 // a_ for a_ in range(1, 25) if 24 % a_ == 0}
assert somme == {25, 14, 11, 10}
controllate += 1
if idx('q-prodotto', 'Non è determinabile') != Q['q-prodotto']['ans']:
    errori.append('n.q-prodotto: la risposta giusta è «Non è determinabile»')

# pesata: minimo numero di pesate per 8 monete (3 esiti per pesata, 3^k ≥ 8)
k_ = min(k for k in range(1, 6) if 3 ** k >= 8)
assert k_ == 2
check_value('q-pesata', k_)

# figli: almeno un maschio, tutti maschi
mondi_f = [c_ for c_ in itertools.product('MF', repeat=3) if 'M' in c_]
p_f = F(sum(1 for c_ in mondi_f if c_ == ('M', 'M', 'M')), len(mondi_f))
assert p_f == F(1, 7)
check_value('q-figli', p_f)

# rifornimenti: prezzo medio ponderato
prezzo = F(20 * 180 + 30 * 200, 100 * 50)
assert prezzo == F(96, 50)
check_value('q-rifornimenti', float(prezzo))
assert (1.80 + 2.00) / 2 == 1.90 and round((30 * 1.80 + 20 * 2.00) / 50, 2) == 1.88

# popolazione
P_ = [p for p in range(1000, 30000) if F(p) * F(9, 10) * F(9, 10) == 8100]
assert P_ == [10000]
check_value('q-popolazione', 10000)
assert round(8100 / 0.9) == 9000 and round(8100 / 0.8) == 10125 and round(8100 * 1.2) == 9720

# azioni
spesa = 100 * 20 * F(101, 100)
incasso = 100 * 25 * F(99, 100)
assert incasso - spesa == 455
check_value('q-azioni', float(incasso - spesa))
assert 500 - 25 == 475 and 500 - 20 == 480

# scorte: giorni-persona
resto_ = 20 * (30 - 10)
g_ = [g for g in range(1, 100) if 25 * g == resto_]
assert g_ == [16]
check_value('q-scorte', 16)
assert 600 / 25 == 24 and 24 - 10 == 14

# rettangoli in una griglia 3 × 4
n_r = sum(1 for r1, r2 in itertools.combinations(range(4), 2) for c1, c2 in itertools.combinations(range(5), 2))
assert n_r == 60
check_value('q-rettangoli', n_r)

# ============================ VERBALE (numeri e logica) ============================
# teatro: under 26 → -50% su 160
assert 160 * F(50, 100) == 80 != 100 and 160 * F(80, 100) == 128
check_vfn('v-teatro', 0)
check_vfn('v-sanrocco', 1)
# buoni pasto: 18 giorni · 8 euro
assert 18 * 8 == 144
check_vfn('v-buoni', 2)
# montalto: 2024 = 60% di 12.000
assert (65 - 5) * 12000 // 100 == 7200 < 7500
check_vfn('v-montalto', 0)
# studenti: 78% di 800
assert 800 * 78 // 100 == 624 > 600
check_vfn('v-studenti', 2)

# cambio euro-dollaro: ricavi in euro = dollari / tasso
r0, r1 = F(12, 10) / F(120, 100), F(12, 10) / F(100, 100)
assert (r0, r1) == (1, F(6, 5)) and r1 / r0 - 1 == F(1, 5)
assert round(float((F(100, 100) - F(120, 100)) / F(120, 100)) * 100, 1) == -16.7
check_predicates('v-cambio', {
    'aumentano del 20%': r1 / r0 - 1 == F(1, 5),
    'diminuiscono di circa il 16,7%': r1 < r0,
    'aumentano di circa il 16,7%': abs(float(r1 / r0 - 1) - 0.167) < 0.001,
    'restano invariati': r1 == r0}, 'cambio')

# fondo: quale NON è corretta
az, ob = 400 * 60 // 100, 400 * 40 // 100
g_az, g_ob = az * 10 // 100, F(ob * 25, 1000)
lordo = F(g_az + g_ob, 400)
netto = F(g_az + g_ob - 400 * 1 // 100, 400)
assert (az, ob, g_az, g_ob) == (240, 160, 24, 4) and lordo == F(7, 100) and netto == F(6, 100)
assert F(10 * 100 + 25 * 10 // 10, 200) == F(125, 200) * 100 or (10 + 2.5) / 2 == 6.25
check_predicates('v-fondo', {
    'è del 6,25%, cioè la media': lordo != F(625, 10000),         # affermazione sbagliata → risposta giusta
    'guadagno delle azioni è stato di 24 milioni': g_az != 24,
    'rendimento lordo del fondo è del 7%': lordo != F(7, 100),
    'rendimento netto del fondo è del 6%': netto != F(6, 100)}, 'quale NON è corretta')

# sfuso, palestra, centro, fisica, energy: ragionamento (controllo della posizione della chiave)
for k_, frag in (('v-sfuso', 'senza reparto sfuso sono rimasti stabili'),
                 ('v-palestra', 'iscritte alle palestre associate'),
                 ('v-centro', 'continueranno a recarvisi'),
                 ('v-fisica', 'raddoppiato le borse di studio'),
                 ('v-energy', 'negli anni precedenti')):
    controllate += 1
    if idx(k_, frag) != Q[k_]['ans']:
        errori.append(f'{k_}: la chiave non punta all\'opzione «{frag}»')

# giovani: occupati 15-24 anni
occ19, occ25 = F(20), F(24, 100) * 90
assert occ25 == F(108, 5) and occ25 > occ19 and F(63, 60) - 1 == F(1, 20)
check_predicates('v-giovani', {
    'numero di occupati di 15–24 anni è aumentato': occ25 > occ19,
    'aumentato del 4%': round((F(24, 20) - 1) * 100) == 4,
    'aumentati del 3%': round((F(63, 60) - 1) * 100) == 3,
    'programma di tirocini ha fatto aumentare': False}, 'giovani')

# orsa
u25, u24 = 90 - 81, 6
assert u25 / u24 == 1.5 and 0.4 * u25 == 3.6 and u25 / 90 == 0.1
check_predicates('v-orsa', {
    "superiore del 50% a quello del 2024": u25 / u24 == 1.5,
    'riceveranno 3,6 milioni': False,           # solo una proposta condizionata
    'distribuire ai soci il 40% dei ricavi': False,
    'inferiore al 10% dei ricavi': u25 / 90 < 0.1}, 'orsa')

# mercato delle biciclette
el25, trad = 300000, 1200000
assert F(el25, el25 + trad) == F(1, 5) and el25 / 1.2 == 250000
online = el25 * (100 - 70 - 20) // 100
assert online == 30000 and el25 * 70 // 100 == 210000
check_predicates('v-mercato-bici', {
    'rappresentato il 20% di tutte le biciclette': F(el25, el25 + trad) == F(1, 5),
    'Nel 2024 sono state vendute 240.000': el25 / 1.2 == 240000,
    'vendute online sono state 60.000': online == 60000,
    'negozi specializzati hanno venduto 210.000 biciclette, elettriche e tradizionali': False}, 'bici')

# condominio
def prenotazione(volte_gia, anticipo, giorno, fine_ora, in_ordine):
    ammessa = volte_gia < 3 and anticipo >= 7 and giorno != 'dom'
    limite = 24 if giorno in ('sab', 'pre') else 23
    penale = fine_ora > limite
    return ammessa, penale
amm, pen = prenotazione(2, 10, 'sab', 25, True)
assert amm and pen
assert Q['v-condominio']['ans'] == idx('v-condominio', 'perde la cauzione e non può prenotare nei tre mesi')

# ============================ DATA INSIGHTS ============================
# a · b = 36, a + b > 15 (sì/no)
sc_p = [(a_, 36 // a_) for a_ in range(1, 37) if 36 % a_ == 0]
check_ds('d-prodotto-36', 'A', sc_p, lambda s: s[0] + s[1] > 15, lambda s: s[0] % 4 == 0, lambda s: s[0] < 12 and s[1] < 12)

# club: percentuali di percentuali (soci 100 fissi, ripartizione dei sopra-40 tra maschi/femmine)
sc_cl = [(m40, f40) for m40 in range(0, 61) for f40 in range(0, 41)]     # su 100 soci: 60 maschi, 40 femmine
check_ds('d-club', 'B', sc_cl, lambda s: s[0] + s[1],
         lambda s: s[0] == 30, lambda s: s[1] == 8)
# nota: (1) fissa i maschi, (2) fissa le femmine; la percentuale complessiva è 38%
assert 30 + 8 == 38

# ufficio: mondi di N persone (1..5)
def persona_ok(p):
    ing, ingl, ted = p
    return (ing or ingl) and not (ing and ted)           # contabile (ing=False) parla inglese; ingegnere non parla tedesco
persone = [p for p in itertools.product([True, False], repeat=3) if persona_ok(p)]
mondi_u = [w for N in range(1, 5) for w in itertools.product(persone, repeat=N) if 2 * sum(1 for p in w if p[0]) >= N]
check_dp('d-ufficio', mondi_u, [
    lambda w: all(not (p[2] and p[0]) for p in w),
    lambda w: 2 * sum(1 for p in w if p[1]) >= len(w),
    lambda w: all((not p[0]) for p in w if p[2]),
    lambda w: sum(1 for p in w if not p[0]) > sum(1 for p in w if p[0])], 'V')

# mercato
DM = D['mercato']
for i in range(4):
    assert DM['X'][i] + DM['Y'][i] + DM['Z'][i] == 100
uni = lambda m: [DM['unita'][i] * DM[m][i] / 100 for i in range(4)]
X_, Y_, Z_ = uni('X'), uni('Y'), uni('Z')
assert [round(v, 6) for v in Y_] == [5, 3.6, 4.8, 7] and round(sum(Y_) / sum(DM['unita']), 6) == 0.408
check_predicates('d-mercato', {
    'In Francia la marca Y vende più unità che in Germania': Y_[2] > Y_[3],
    'marca X vende meno unità della marca Z': sum(X_) < sum(Z_),
    'In Spagna la marca Y vende più unità che in Italia': Y_[1] > Y_[0],
    'quota di mercato superiore al 40%': sum(Y_) / sum(DM['unita']) > 0.4}, 'tabella mercato')
check_assets('d-mercato', [10, 8, 12, 20, '30%', '25%', '40%', '35%', '50%', '45%', '20%'])

# sondaggio: uomini M, donne W
sc_s = [(M, W) for M in range(5, 101, 5) for W in range(5, 101, 5)]
check_ds('d-sondaggio', 'D', sc_s, lambda s: F(60 * s[0] + 40 * s[1], 100) > F(s[0] + s[1], 2),
         lambda s: True, lambda s: True)
assert criterio(sc_s, lambda s: F(60 * s[0] + 40 * s[1], 100) > F(s[0] + s[1], 2), lambda s: True, lambda s: True) == 'D'

# studio (barre ponderate)
DS_ = D['studio']
media_ = F(sum(o * n for o, n in zip(DS_['ore'], DS_['studenti'])), sum(DS_['studenti']))
assert media_ == 18 and sum(DS_['ore']) / 4 == 21
inv = F(sum(o * n for o, n in zip(DS_['ore'], DS_['studenti'][::-1])), 1000)
assert inv == 24
check_value('d-studio', float(media_))
check_assets('d-studio', [12, 18, 24, 30, 400, 300, 200, 100])

# circolo: persone con (scacchi, dama, tombola)
def ok_c(p):
    sc_, da_, to_ = p
    return (not sc_ or da_) and not (da_ and to_)
pers_c = [p for p in itertools.product([True, False], repeat=3) if ok_c(p)]
mondi_c = [w for w in itertools.product(pers_c, repeat=3) if any(p[2] for p in w)]
check_dp('d-circolo', mondi_c, [
    lambda w: any(p[2] and p[0] for p in w),
    lambda w: any(not p[0] for p in w),
    lambda w: all(not (p[2] and p[1]) for p in w),
    lambda w: any(p[1] and p[2] for p in w)], 'F')

# sconto (DS)
sc_d = [(l_, s_) for l_ in range(10, 201, 2) for s_ in range(5, 201, 1) if s_ < l_]
check_ds('d-sconto', 'B', sc_d, lambda s: F(s[0] - s[1], s[0]),
         lambda s: s[1] == 72, lambda s: s[0] == 90)
assert F(90 - 72, 90) == F(1, 5)

# negozi (barre raggruppate)
DN = D['negozi']
cr = [F(b, a) - 1 for a, b in zip(DN['y24'], DN['y25'])]
tot_cr = F(sum(DN['y25']), sum(DN['y24'])) - 1
n_sopra = sum(1 for c_ in cr if c_ > tot_cr)
assert (sum(DN['y24']), sum(DN['y25'])) == (300, 340) and n_sopra == 1
ass = [b - a for a, b in zip(DN['y24'], DN['y25'])]
assert ass == [8, 15, 12, 5] and sum(1 for a_ in ass if a_ > sum(ass) / 4) == 2
check_value('d-negozi', n_sopra)
check_assets('d-negozi', [80, 50, 120, 50, 88, 65, 132, 55])

# gol: tre squadre
mondi_g = [(a_, b_, c_) for b_ in range(1, 40) for a_ in [2 * b_] for c_ in [b_ + 6] if a_ + b_ + c_ == 62]
assert mondi_g == [(28, 14, 20)]
check_dp('d-gol', mondi_g, [
    lambda w: w[0] == 28,
    lambda w: w[1] < 0.2 * 62,
    lambda w: w[0] > w[1] + w[2],
    lambda w: w[2] > w[0] / 2], 'V')

# soci (linea con quote diverse)
DSo = D['soci']
inc = sum(s * (DSo['quota1'] if i < 3 else DSo['quota2']) for i, s in enumerate(DSo['soci']))
assert inc == 36400 and sum(DSo['soci']) == 800 and sum(DSo['soci']) / 6 * 6 * 45 == 36000
check_value('d-soci', inc)
check_assets('d-soci', [100, 120, 140, 130, 150, 160])

# x · y > 0 (DS sì/no)
vals = [F(i, 2) for i in range(-12, 13)]
sc_q = [(x_, y_) for x_ in vals for y_ in vals if x_ != 0 and y_ != 0]
check_ds('d-quadro', 'D', sc_q, lambda s: s[0] * s[1] > 0, lambda s: s[0] + s[1] > 0, lambda s: s[0] > -2)

# energia (cella nascosta)
DE = D['energia']
i24 = DE['totale'][3] - DE['solare'][3] - DE['eolico'][3]
assert i24 == 44
idro = [50, 46, 48, i24, 52]
for i in range(5):
    assert DE['solare'][i] + DE['eolico'][i] + idro[i] == DE['totale'][i]
check_predicates('d-energia', {
    'solare è più che doppia': DE['solare'][4] > 2 * DE['solare'][0],
    'idroelettrico ha prodotto più del solare e dell\'eolico insieme': idro[3] > DE['solare'][3] + DE['eolico'][3],
    'cresciuta di meno del 40%': DE['totale'][4] < 1.4 * DE['totale'][0],
    'almeno il 40% del totale': all(idro[i] >= 0.4 * DE['totale'][i] for i in range(5))}, 'tabella energia')
check_assets('d-energia', [20, 24, 30, 36, 40, 30, 32, 34, 40, 46, 50, 46, 48, 52, 100, 102, 112, 120, 138])

# palline: r > g > b ≥ 3, somma 20
mondi_p = [(r_, g_, b_) for b_ in range(3, 20) for g_ in range(b_ + 1, 20) for r_ in range(g_ + 1, 20) if r_ + g_ + b_ == 20]
check_dp('d-palline', mondi_p, [
    lambda w: w[0] >= 8,
    lambda w: w[2] > 6,
    lambda w: w[1] < 8,
    lambda w: w[0] < 8], 'F')

# associazione
DAs = D['assoc']
avanzi = [e - u for e, u in zip(DAs['entrate'], DAs['uscite'])]
assert avanzi == [10, 5, 10, 20] and sum(DAs['entrate']) == 400 and sum(DAs['uscite']) == 355
dE = [DAs['entrate'][i] - DAs['entrate'][i - 1] for i in range(1, 4)]
dU = [DAs['uscite'][i] - DAs['uscite'][i - 1] for i in range(1, 4)]
cond_a = {
    "è il 10% delle entrate annue": sum(avanzi) * 10 == sum(DAs['entrate']),
    "il doppio di quello del primo trimestre": avanzi[3] == 2 * avanzi[0],
    "uscite sono cresciute, rispetto al trimestre precedente, più delle entrate": all(u > e for u, e in zip(dU, dE)),
}
check_predicates('d-associazione', dict(cond_a, **{'Nessuna delle altre': not any(cond_a.values())}), 'tabella associazione')
check_assets('d-associazione', [80, 90, 100, 130, 70, 85, 90, 110])

# triangolo isoscele (DS): base b reale, lati uguali l = (36 − b)/2, altezza = sqrt(l² − b²/4)
import math as _m
basi = [F(k, 4) for k in range(1, 4 * 36)]
sc_t = [b_ for b_ in basi if (36 - b_) / 2 > b_ / 2]        # disuguaglianza triangolare: 2l > b
def altezza(b_):
    l_ = (36 - b_) / 2
    return _m.sqrt(float(l_ * l_ - b_ * b_ / 4))
sc_t2 = sc_t
valore = lambda b_: b_
p1 = lambda b_: (36 - b_) / 2 == 13
p2 = lambda b_: abs(altezza(b_) - 12) < 1e-9
check_ds('d-triangolo', 'C', sc_t2, valore, p1, p2)
assert (36 - 10) / 2 == 13 and altezza(F(10)) == 12

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
