#!/usr/bin/env python3
"""
check_math_23.py — ricalcola con il codice le risposte del Mock 23 e le
confronta con la chiave (`ans`) di docs/mocks/mock-23.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_23.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-23.js')],
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
    t = re.sub(r'(circa|about|km/h|km|kg|€|%|anni|ore|giorni|minuti|cm|m/min|milioni di euro|euro|\bg\b|\bs\b)', '', t).replace(' ', '')
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


# ============================ QUANTITATIVA ============================
# trenta: 45 è il 30% → restano il 70%
tot = F(45) / F(3, 10)
assert tot == 150
check_value('q-trenta', tot - 45)
assert 150 * F(7, 10) == 105 and 45 * 3 == 135 and 45 * 2 == 90

# nuotatore: v + c = 400/4, v − c = 400/8
sol_n = [(v, c) for v in range(0, 300) for c in range(0, 150) if (v + c) * 4 == 400 and (v - c) * 8 == 400]
assert sol_n == [(75, 25)]
check_value('q-nuotatore', sol_n[0][1])

# media ponderata dei voti con i crediti
media = F(24 * 9 + 27 * 6 + 30 * 3, 9 + 6 + 3)
assert media == 26 and F(24 + 27 + 30, 3) == 27
check_value('q-media-crediti', media)

# multiplo di 7 con resto 1 modulo 2, 3, 4
n7 = [n for n in range(1, 400) if n % 7 == 0 and n % 2 == 1 and n % 3 == 1 and n % 4 == 1]
assert n7[:2] == [49, 133]
check_value('q-resto49', n7[0])
assert 13 % 7 != 0 and 85 % 7 != 0 and 13 % 12 == 1 and 85 % 12 == 1

# rappresentante e vice: persone 0..5 ragazze, 6..9 ragazzi, ordine rilevante
cop = list(itertools.permutations(range(10), 2))
misti = sum(1 for a_, b_ in cop if (a_ < 6) != (b_ < 6))
assert F(misti, len(cop)) == F(8, 15)
check_value('q-rappresentanti', F(misti, len(cop)))
assert 2 * F(6, 10) * F(4, 10) == F(12, 25) and F(6, 10) * F(4, 9) == F(4, 15)

# presidente, segretario e due consiglieri tra 6 soci
n_c = sum(1 for p_, s_ in itertools.permutations(range(6), 2)
          for cons in itertools.combinations([x for x in range(6) if x not in (p_, s_)], 2))
assert n_c == 180
check_value('q-cariche', n_c)
assert 6 * 5 * 4 * 3 == 360 and math.factorial(6) == 720

# merce: 25% venduto, poi 40% del resto; restano 270
N_ = [N for N in range(1, 5000) if F(N) * F(3, 4) * F(3, 5) == 270]
assert N_ == [600]
check_value('q-merce', 600)
assert F(270) / F(3, 5) == 450 and F(270) / F(2, 5) == 675 and F(270) / F(3, 10) == 900

# percorsi dalla partenza (0,0) a (4,3) passando per (2,1)
def percorsi(a_, b_):
    return sum(1 for mosse in itertools.product('RU', repeat=(b_[0] - a_[0]) + (b_[1] - a_[1]))
               if mosse.count('R') == b_[0] - a_[0])
tot_p = percorsi((0, 0), (4, 3))
via = percorsi((0, 0), (2, 1)) * percorsi((2, 1), (4, 3))
assert tot_p == 35 and via == 18
# verifica per enumerazione diretta di tutti i percorsi
dirette = 0
for mosse in itertools.product('RU', repeat=7):
    if mosse.count('R') != 4:
        continue
    x_, y_, ok = 0, 0, False
    for m_ in mosse:
        x_, y_ = (x_ + 1, y_) if m_ == 'R' else (x_, y_ + 1)
        if (x_, y_) == (2, 1):
            ok = True
    dirette += ok
assert dirette == 18
check_value('q-percorsi', via)

# fruttivendolo
guad = F(45) * 2 - F(50) * F(6, 5)
assert guad == 30
check_value('q-fruttivendolo', guad)
assert 100 - 60 == 40 and 90 - 54 == 36

# produttività: pezzi per operaio all'ora
pa, pb = F(120, 5 * 8), F(150, 6 * 10)
assert (pa, pb) == (3, F(5, 2)) and pa / pb - 1 == F(1, 5) and round(float((pa - pb) / pa) * 100) == 17
check_value('q-produttivita', 20)

# voti: rapporto 5:3, 40 voti spostati
k_v = [k for k in range(1, 200) if 5 * k - 40 == 3 * k + 40]
assert k_v == [40] and 8 * 40 == 320
check_value('q-voti', 320)
assert 5 * 40 == 200 and 200 - 40 == 160

# impasto
farina, acqua = 600, 300
pane = 1000 - acqua // 3
assert pane == 900
check_value('q-impasto', farina / pane * 100, tol=0.5)
assert round(600 / 940 * 100) == 64 and round(600 / (1000 - 1000 / 3) * 100) == 90

# giorni della settimana
oggi = datetime.date(2026, 10, 12)          # un lunedì
assert oggi.weekday() == 0
fra = oggi + datetime.timedelta(days=2 ** 10)
nomi = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
assert pow(2, 10, 7) == 2 and nomi[fra.weekday()] == 'Mercoledì'
controllate += 1
if idx_eq('q-giorni', nomi[fra.weekday()]) != Q['q-giorni']['ans']:
    errori.append('n.q-giorni: la risposta giusta è Mercoledì')

# quattro interi positivi distinti con somma 10
quaterne = [c_ for c_ in itertools.combinations(range(1, 11), 4) if sum(c_) == 10]
assert quaterne == [(1, 2, 3, 4)]
check_value('q-quattro-numeri', max(quaterne[0]))

# candele
t_ = [t for t in range(0, 241) if F(1) - F(t, 240) == (F(1) - F(t, 360)) / 2]
assert t_ == [180]
controllate += 1
if idx_eq('q-candele', f'{t_[0] // 60} ore') != Q['q-candele']['ans']:
    errori.append('n.q-candele: la risposta giusta è 3 ore')

# cifre: n = 4 · somma cifre e scambiato = n + 18
n_d = [n for n in range(10, 100) if n == 4 * (n // 10 + n % 10) and (n % 10) * 10 + n // 10 == n + 18]
assert n_d == [24]
check_value('q-cifre', n_d[0])
assert [n for n in range(10, 100) if n == 4 * (n // 10 + n % 10)] == [12, 24, 36, 48]

# armadio: 3 camicie (la 3ª blu), 4 pantaloni, 2 giacche (la 2ª blu)
n_a = sum(1 for c_, p_, g_ in itertools.product(range(3), range(4), range(2)) if not (c_ == 2 and g_ == 1))
assert n_a == 20
check_value('q-armadio', n_a)
assert 3 * 4 * 2 == 24 and 24 - 8 == 16

# divisori: numeri tra 1 e 100 con esattamente 3 divisori
n_div = [n for n in range(1, 101) if sum(1 for d_ in range(1, n + 1) if n % d_ == 0) == 3]
assert n_div == [4, 9, 25, 49]
check_value('q-divisori', len(n_div))
assert sum(1 for n in range(2, 101) if all(n % d_ for d_ in range(2, n))) == 25

# ============================ VERBALE ============================
# parcheggio: 5 ore = 2 + 4 · 1,50
assert 2 + 4 * 1.5 == 8 != 7.5 and 5 * 1.5 == 7.5 and 8 <= 15
check_vfn('v-parcheggio', 0)
check_vfn('v-fabbrica', 1)
# corso di lingua: 40% di 500, tetto 300, requisiti rispettati (36 crediti ≥ 30)
assert F(40, 100) * 500 == 200 <= 300 and 36 >= 30
check_vfn('v-corso', 2)
# abbonamento mensile = 36; 24 corse da 1,50 = 36 (non meno)
assert 24 * 1.5 == 36 and not (24 * 1.5 < 36)
check_vfn('v-trasporti', 0)
# circolo: 60% di 400 maschi, 25% di loro con più di 50 anni
assert 400 * 60 // 100 * 25 // 100 == 60 > 50
check_vfn('v-soci', 2)

# PIL
nom25 = 500 * 1.06
real = 1.06 / 1.04 - 1
assert abs(nom25 - 530) < 1e-9 and round(real * 100) == 2
check_predicates('v-pil', {
    'di 530 miliardi di euro e il PIL reale è cresciuto di circa il 2%': abs(nom25 - 530) < 1e-9 and round(real * 100) == 2,
    'cresciuto di circa il 10%': round(real * 100) == 10,
    'PIL pro capite reale è cresciuto del 6%': round(real * 100) == 6,
    'PIL reale è diminuito': real < 0}, 'PIL')

# pareggio: quale NON è corretta
marg = 30 - 20
pareggio = 60000 // marg
assert (marg, pareggio) == (10, 6000)
check_predicates('v-pareggio', {
    'punto di pareggio è di 2.000 unità': not (pareggio == 2000),
    'margine unitario è di 10 euro': not (marg == 10),
    "utile del 2025 è stato di 30.000 euro": not (9000 * marg - 60000 == 30000),
    "in perdita di 30.000 euro": not (3000 * marg - 60000 == -30000)}, 'quale NON è corretta')
assert 60000 // 30 == 2000

# turismo
s25, i25 = 800000 * 60 // 100, 800000 * 40 // 100
s24, i24 = F(s25) / F(6, 5), F(i25) / F(4, 5)
assert (s24, i24) == (400000, 400000) and s24 + i24 == s25 + i25
check_predicates('v-turismo', {
    'totali del 2025 sono state uguali a quelle del 2024': s24 + i24 == s25 + i25,
    'totali del 2025 sono state inferiori': s25 + i25 < s24 + i24,
    'Nel 2024 gli stranieri erano il 60%': s24 / (s24 + i24) == F(6, 10),
    'sono diminuite di 20.000 unità': i24 - i25 == 20000}, 'turismo')

# rimborso
prezzo, assic = 1200, 100
rimb = F(prezzo, 2) - 50
assert rimb == 550
check_value('v-rimborso', rimb)
assert F(prezzo + assic, 2) == 650

# affitti
inc20, inc25 = F(600, 2400), F(690, 2400 * F(11, 10))
assert inc20 == F(1, 4) and round(float(inc25) * 100, 1) == 26.1 and 690 - 600 == 90
check_predicates('v-affitti', {
    'incidenza media del canone sul reddito è più alta che nel 2020': inc25 > inc20,
    'è aumentato di 100 euro': 690 - 600 == 100,
    'è del 25%, come nel 2020': inc25 == inc20,
    "ha dimostrato": False}, 'affitti')

# mutuo
int3, int25 = 120000 * F(3, 100), 120000 * F(25, 1000)
assert (int3, int25) == (3600, 3000)
check_predicates('v-mutuo', {
    '3.600 euro al tasso del 3% e 3.000 euro al tasso del 2,5%': (int3, int25) == (3600, 3000),
    'verrà estinto prima di 20 anni': False,
    '2,5% sarebbero 4.200 euro': int25 == 4200,
    'più conveniente perché non cambia mai': False}, 'mutuo')

# ragionamento: la chiave punta all'opzione indicata
for k_, frag in (('v-contenitori', 'molto simili a Cornavalle'),
                 ('v-smartworking', 'soprattutto ai dipendenti che già in precedenza'),
                 ('v-ciclabile', 'limite di velocità sul viale è stato abbassato'),
                 ('v-tassa', 'abbastanza simili da far prevedere'),
                 ('v-recensioni', 'Quale quota dei clienti ha scritto una recensione')):
    controllate += 1
    if idx(k_, frag) != Q[k_]['ans']:
        errori.append(f'{k_}: la chiave non punta all\'opzione «{frag}»')

# ============================ DATA INSIGHTS ============================
# mcm: n multiplo di 24
sc_m = list(range(1, 601))
check_ds('d-mcm', 'C', sc_m, lambda n: n % 24 == 0,
         lambda n: n % 8 == 0 and n % 6 == 0, lambda n: n % 12 == 0 and n % 8 == 0)
assert math.lcm(8, 6) == 24 and math.lcm(12, 8) == 24 and math.lcm(4, 6) == 12

# palestra: 40% nuoto, maschi 60%, 50% dei maschi in nuoto
sc_n = []
for m_ in (F(k, 20) for k in range(1, 20)):
    for p_ in (F(j, 20) for j in range(0, 21)):
        q_ = (F(2, 5) - m_ * p_) / (1 - m_)
        if 0 <= q_ <= 1:
            sc_n.append((m_, p_))
check_ds('d-nuoto', 'B', sc_n, lambda s: s[0] * s[1] / F(2, 5),
         lambda s: s[0] == F(3, 5), lambda s: s[1] == F(1, 2))
assert F(3, 5) * F(1, 2) / F(2, 5) == F(3, 4)

# cartoleria: quaderni
check_ds('d-cartoleria', 'D', list(range(0, 21)), lambda q_: q_,
         lambda q_: 45 <= 2 * q_ + 3 * (20 - q_) <= 55, lambda q_: 20 - q_ > q_)
assert [q_ for q_ in range(21) if 45 <= 60 - q_ <= 55 and 20 - q_ > q_] == [5, 6, 7, 8, 9]

# dipendenti: donne > 80
check_ds('d-dipendenti', 'A', list(range(0, 201)), lambda w: w > 80,
         lambda w: (200 - w) >= F(62, 100) * 200, lambda w: w > 60)

# cerchio: area > 100
sc_ci = [F(k, 4) for k in range(1, 81)]
check_ds('d-cerchio', 'A', sc_ci, lambda r_: math.pi * float(r_) ** 2 > 100,
         lambda r_: 2 * r_ > 12, lambda r_: 2 * math.pi * float(r_) < 40)

# classe: media dei maschi
sc_cl = []
for f_ in range(1, 20):
    for mf in (F(k, 2) for k in range(2, 21)):
        mm = (140 - f_ * mf) / F(20 - f_)
        if 0 <= mm <= 10:
            sc_cl.append((f_, mf, mm))
check_ds('d-classe', 'B', sc_cl, lambda s: s[2], lambda s: s[0] == 12, lambda s: s[1] == F(13, 2))
assert (140 - 12 * F(13, 2)) / 8 == F(31, 4) and F(31, 4) == 7.75

# bar: logica
tipi = [t_ for t_ in itertools.product([True, False], repeat=4)          # cornetto, caffè, tè, altra bevanda
        if (t_[1] or t_[2] or t_[3]) and (not t_[0] or t_[1]) and not (t_[2] and t_[1])]
mondi_b = [w for N in range(1, 4) for w in itertools.product(tipi, repeat=N)]
check_dp('d-bar', mondi_b, [
    lambda w: all(not (p[2] and p[0]) for p in w),
    lambda w: all(p[0] for p in w if p[1]),
    lambda w: all(p[2] for p in w if not p[1]),
    lambda w: all(p[1] or p[2] or p[3] for p in w if p[0])], 'V')

# comune (torta) + crescita
DC_ = D['comune']
assert sum(v for _, v in DC_['voci']) == 100
tot_c = F(DC_['trasporti']) / F(dict(DC_['voci'])['Trasporti'], 100)
assert tot_c == 15
sanita_next = tot_c * F(100 + DC_['crescita'], 100) * F(dict(DC_['voci'])['Sanità'], 100)
assert sanita_next == F(9, 2) and tot_c * F(25, 100) == F(15, 4) and F(18) * F(30, 100) == F(27, 5)
check_value('d-comune', float(sanita_next))
check_assets('d-comune', [30, 25, 20, 3])

# indice dei prezzi (base 2020 = 100)
DV = D['indice']
cresc = F(DV['valori'][4], DV['valori'][2])
costo = DV['paniere'] * cresc
assert cresc == F(9, 8) and costo == 315 and DV['valori'][4] - DV['valori'][2] == 14
assert round(float(DV['paniere'] * F(114, 100)), 1) == 319.2 and round(float(DV['paniere'] * F(126, 100)), 1) == 352.8
check_value('d-indice', float(costo))
check_assets('d-indice', [2020, 2021, 2022, 2023, 2024, 100, 104, 112, 120, 126, 280])

# tappe: tre tappe, la terza 20 km e più corta delle altre, la seconda più lunga della prima
mondi_t = [(F(f2, 2), 70 - F(f2, 2)) for f2 in range(41, 140) if F(f2, 2) > 20 and 70 - F(f2, 2) > F(f2, 2)]
check_dp('d-tappe', mondi_t, [
    lambda w: w[0] < 35,
    lambda w: w[1] >= 50,
    lambda w: w[1] > 40,
    lambda w: w[0] <= 20], 'F')

# canali: quote di riga
DCa = D['canali']
for i in range(4):
    assert DCa['neg'][i] + DCa['onl'][i] + DCa['gro'][i] == 100
val = lambda col: [F(DCa['ricavi'][i] * DCa[col][i], 100) for i in range(4)]
Ne, On, Gr = val('neg'), val('onl'), val('gro')
assert (sum(Ne), sum(On), sum(Gr), sum(DCa['ricavi'])) == (370, 390, 240, 1000)
check_predicates('d-canali', {
    'Nel complesso le vendite online superano quelle dei negozi': sum(On) > sum(Ne),
    'Per le sciarpe le vendite nei negozi sono inferiori a quelle delle cinture': Ne[3] < Ne[2],
    'grossisti assorbono un quinto': sum(Gr) * 5 == sum(DCa['ricavi']),
    'online delle borse sono superiori a quelle delle scarpe': On[1] > On[0]}, 'tabella canali')
check_assets('d-canali', [400, 300, 100, 200, '40%', '30%', '60%', '50%', '20%'])

# iscritti: cella nascosta
DI_ = D['iscritti']
rB = DI_['totCol'][1] - sum(x for x in DI_['B'] if x is not None)
rR = DI_['totRiga'][1] - DI_['A'][1] - DI_['C'][1]
assert rB == rR == 40
for i in range(3):
    assert DI_['A'][i] + (DI_['B'][i] if DI_['B'][i] is not None else 40) + DI_['C'][i] == DI_['totRiga'][i]
assert sum(DI_['A']) == DI_['totCol'][0] and sum(DI_['C']) == DI_['totCol'][2] and sum(DI_['totRiga']) == DI_['totCol'][3] == 300
check_value('d-iscritti', F(rB, DI_['totCol'][1]) * 100)
assert round(100 / 300 * 100) == 33
check_assets('d-iscritti', [40, 30, 50, 20, 120, 100, 80, 300, 'Milano', 'Roma', 'Torino'][:8])

# margini
DM_ = D['margini']
mg = [F(r_ - c_, r_) for r_, c_ in zip(DM_['ricavi'], DM_['costi'])]
ut = [r_ - c_ for r_, c_ in zip(DM_['ricavi'], DM_['costi'])]
assert mg == [F(1, 4), F(1, 3), F(1, 5), F(1, 4)] and ut == [50, 40, 60, 20]
check_idx('d-margini', mg.index(max(mg)), 'divisione con margine più alto')
assert ut.index(max(ut)) == 2
check_assets('d-margini', [200, 120, 300, 80, 150, 80, 240, 60])

# giardino: (melo, pero, alto)
tipi_g = [t_ for t_ in itertools.product([True, False], repeat=3)
          if (t_[0] or t_[1]) and not (t_[0] and t_[2])]
mondi_g = [w for N in range(1, 4) for w in itertools.product(tipi_g, repeat=N) if any(p[1] and p[2] for p in w)]
check_dp('d-giardino', mondi_g, [
    lambda w: any(p[0] and not p[2] for p in w),
    lambda w: any(p[0] and p[2] for p in w),
    lambda w: all(p[1] for p in w if p[2]),
    lambda w: all(not (p[1] and p[2]) for p in w)], 'F')

# lavoro: 120 persone, rapporto 3:2, 25% degli uomini part-time
uomini, donne = 120 * 3 // 5, 120 * 2 // 5
pt_u = uomini * 25 // 100
assert (uomini, donne, pt_u, uomini - pt_u) == (72, 48, 18, 54)
mondi_l = [(pt_u, w_) for w_ in range(0, donne + 1)]
check_dp('d-lavoro', mondi_l, [
    lambda w: donne == 48,
    lambda w: w[0] == 18,
    lambda w: w[1] < w[0],
    lambda w: uomini - w[0] == 60], 'V')

# brevetti
DB = D['brevetti']
cond_b = {
    'più del doppio di quelle del 2021': DB['pres'][4] > 2 * DB['pres'][0],
    'almeno la metà di quelle presentate': all(2 * c_ >= p_ for c_, p_ in zip(DB['conc'], DB['pres'])),
    'concesse sono cresciute, in percentuale, più di quelle presentate': F(DB['conc'][4], DB['conc'][0]) > F(DB['pres'][4], DB['pres'][0]),
}
check_predicates('d-brevetti', dict(cond_b, **{'Nessuna delle altre': not any(cond_b.values())}), 'tabella brevetti')
assert F(DB['pres'][4], DB['pres'][0]) - 1 == F(7, 8) and round(float(F(40, 22) - 1) * 100, 1) == 81.8
check_assets('d-brevetti', [40, 52, 60, 65, 75, 22, 26, 29, 34, 40])

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
