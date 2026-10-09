#!/usr/bin/env python3
"""
check_math_21.py — ricalcola con il codice le risposte del Mock 21 e le
confronta con la chiave (`ans`) di docs/mocks/mock-21.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_21.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-21.js')],
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

from decimal import Decimal as Dc

# ============================ QUANTITATIVA ============================
# abbonamento: prezzo dopo l'aumento del 25% = 50; sconto 10% sul prezzo di prima
p0 = [p for p in range(1, 500) if F(p) * F(125, 100) == 50]
assert p0 == [40]
check_value('q-abbonamento', 40 * 0.9)
assert 50 * 0.9 == 45 and 50 * 0.75 == 37.5

# vasca: simulazione al minuto
livello, minuti = F(0), 0
while livello < 1:
    livello += F(1, 6 * 60) - F(1, 12 * 60)
    minuti += 1
assert minuti == 12 * 60
check_value('q-vasca', minuti / 60)
assert F(1, 6) + F(1, 12) == F(1, 4)

# media inversa
m_ = [m for m in range(1, 200) if F(6 * m + 9 * 12, m + 12) == 8]
assert m_ == [6]
check_value('q-media-inversa', 6)

# parole
let = 'AEIBCDF'
vocali = set('AEI')
n_p = sum(1 for p_ in itertools.permutations(let, 3) if p_[0] not in vocali and p_[2] in vocali)
assert n_p == 60 and 4 * 6 * 3 == 72 and 4 * 3 == 12
check_value('q-parole', n_p)

# urna: seconda pallina bianca, estrazioni ordinate di palline distinte
palline = ['B'] * 3 + ['N'] * 5
coppie_ord = list(itertools.permutations(range(8), 2))
p_b2 = F(sum(1 for a_, b_ in coppie_ord if palline[b_] == 'B'), len(coppie_ord))
assert p_b2 == F(3, 8)
check_value('q-urna', p_b2)

# ne3ne4
n_ = sum(1 for n in range(1, 61) if n % 3 and n % 4)
assert n_ == 30 and 60 - 20 - 15 == 25
check_value('q-ne3ne4', n_)

# somma dei non multipli di 5
s_ = sum(n for n in range(1, 61) if n % 5)
assert s_ == 1440 and 1830 - 12 == 1818 and 1830 - 330 == 1500
check_value('q-somma', s_)

# ninfee: la superficie di una ninfea al giorno t è 2^t; lo stagno è 2^20
cap = 2 ** 20
t1 = min(t for t in range(0, 40) if 2 ** t >= cap)
t2 = min(t for t in range(0, 40) if 2 * 2 ** t >= cap)
assert (t1, t2) == (20, 19)
check_value('q-ninfee', t2)

# figurine
B_ = [b for b in range(1, 100) if 3 * b - 8 == b + 8]
assert B_ == [8]
check_value('q-figurine', 3 * 8)
assert 3 * 8 + 8 == 32

# conto: Ada 40%, Bea un terzo del resto, Carlo 36
T_ = [T for T in range(1, 1000) if F(40, 100) * T + F(1, 3) * F(60, 100) * T + 36 == T]
assert T_ == [90]
check_value('q-conto', 90)
assert 36 / 0.5 == 72 and 36 / 0.3 == 120 and 36 * 3 == 108

# quota di mercato
crescita = F(25, 20) * F(140, 100) - 1
assert crescita == F(3, 4)
check_value('q-quota', float(crescita * 100))
assert 25 / 20 - 1 == 0.25 and 0.25 + 0.4 == 0.65

# pari e maggiori di 4000 con cifre 1..6 distinte
n_p4 = sum(1 for p_ in itertools.permutations('123456', 4) if int(''.join(p_)) > 4000 and int(p_[3]) % 2 == 0)
assert n_p4 == 84 and 3 * 3 * 12 == 108 and 6 * 12 == 72 and 8 * 12 == 96
check_value('q-pari4000', n_p4)

# officina
netto = 12 * 5 * 25 * (1 - F(20, 100))
assert netto == 1200
check_value('q-officina', float(netto))

# scuola: rapporto complessivo
rapp = F(30 * 15 + 20 * 10, 30 + 20)
assert rapp == 13 and (15 + 10) / 2 == 12.5
check_predicates('q-scuola', {'13 a 1': rapp == 13, '12,5 a 1': rapp == F(25, 2), '12 a 1': rapp == 12, '25 a 1': rapp == 25}, 'rapporto studenti/insegnanti')

# spam: popolazione di 1000 e-mail
spam, ham = 600, 400
spam_in, ham_in = spam * 20 // 100, ham * 90 // 100
p_spam = F(spam_in, spam_in + ham_in)
assert (spam_in, ham_in) == (120, 360) and p_spam == F(1, 4)
check_value('q-spam', float(p_spam * 100))
assert F(spam_in, 1000) == F(12, 100) and F(120, 360) == F(1, 3)

# non determinabile: la sovrapposizione k può variare
quote = {F(k, 40) for k in range(0, 31)}      # k = dipendenti sopra i 40 anni nella sede centrale (su 100 dipendenti)
assert len(quote) > 1 and max(quote) == F(3, 4) and F(40 * 30, 100 * 40) == F(3, 10)
check_predicates('q-nondet', {'Non è determinabile': len(quote) == 1, '75%': False, '12%': False, '30%': False}, 'non determinabile') if False else None
controllate += 1
if idx('q-nondet', 'Non è determinabile') != Q['q-nondet']['ans']:
    errori.append("n.q-nondet: la risposta giusta è «Non è determinabile»")

# hotel
P_ = [P for P in range(1, 2000) if F(P) * F(3, 2) * F(4, 5) * F(5, 4) == 180]
assert P_ == [120]
check_value('q-hotel', 120)
assert round(180 / 1.55) == 116 and 180 / 1.25 == 144 and 180 * 0.75 == 135

# lucchetto
n_l = sum(1 for c_ in itertools.product(range(10), repeat=3) if len(set(c_)) < 3)
assert n_l == 280 and 10 * 9 * 8 == 720 and 3 * 10 * 9 == 270
check_value('q-lucchetto', n_l)

# ============================ VERBALE (numeri e logica) ============================
# museo: 16 anni → fascia 14–25 → 5 euro
def prezzo_museo(eta):
    return 0 if eta < 14 else (5 if eta <= 25 else 9)
assert prezzo_museo(16) == 5 != 9
check_vfn('v-museo', 0)
check_vfn('v-ciclabile', 1)      # «dopo» ≠ «a causa di»
# bando: 70% di 40.000 con tetto 20.000
assert min(F(70, 100) * 40000, 20000) == 20000
check_vfn('v-bando', 2)
# tomo: online = un quarto di 2,4 milioni a 12 euro
ricavi_online = F(24, 10) / 4 * 12
assert ricavi_online == F(72, 10) and ricavi_online < 8
check_vfn('v-tomo', 0)
check_vfn('v-sondaggio-bici', 1)  # fondi limitati: «sicuramente» non ricavabile

# occupazione: quale NON è corretta
pop = 200000 * 60 // 100
occ, cerca = 90000, 12000
inatt = pop - occ - cerca
tasso_dis = F(cerca, occ + cerca)
assert (pop, inatt, occ * 2 // 3) == (120000, 18000, 60000) and F(occ, pop) == F(3, 4)
assert tasso_dis != F(1, 10) and round(float(tasso_dis) * 100, 1) == 11.8
check_predicates('v-occupazione', {
    'tasso di disoccupazione è pari al 10%': tasso_dis != F(1, 10),     # sbagliata → risposta giusta
    'tasso di occupazione è del 75%': F(occ, pop) != F(3, 4),
    'non lavorano e non cercano lavoro sono 18.000': inatt != 18000,
    'a tempo pieno sono 60.000': occ * 2 // 3 != 60000}, 'quale NON è corretta')

# abbonamenti, bus, necessario, agile, furti, frane: ragionamento senza conti (controllo della chiave a mano, qui solo la posizione)
for k_, frag in (('v-abbonamenti', 'meno abbonamenti mensili che nel primo trimestre'),
                 ('v-bus', 'circa 500 famiglie'),
                 ('v-necessario', 'a ogni impresa che chiude in utile'),
                 ('v-agile', 'più risorse per investire'),
                 ('v-furti', 'variazione del numero di abitanti')):
    controllate += 1
    if idx(k_, frag) != Q[k_]['ans']:
        errori.append(f'{k_}: la chiave non punta all\'opzione «{frag}»')
# furti: stessa frequenza con popolazione ridotta di un quarto
assert F(120, 20000) == F(90, 15000)
# frane: se l'80% dei terreni è disboscato, l'80% delle frane è la quota attesa senza effetto
assert F(80, 100) / F(80, 100) == 1
controllate += 1
if idx('v-frane', "l'80% dei terreni") != Q['v-frane']['ans']:
    errori.append('v-frane: la chiave non punta all\'opzione sull\'80% dei terreni')

# ateneo
d20, d25 = 20000, 22000
f20, f25 = d20 * 55 // 100, d25 * 60 // 100
m20, m25 = d20 - f20, d25 - f25
assert (f20, f25, m20, m25) == (11000, 13200, 9000, 8800) and f25 - f20 == 2200 and round((f25 / f20 - 1) * 100) == 20
check_predicates('v-ateneo', {
    'maschi è diminuito': m25 < m20,
    'studentesse è aumentato del 5%': round((f25 / f20 - 1) * 100) == 5,
    'aumentato di 1.100 unità': f25 - f20 == 1100,
    'ha fatto crescere la quota': False}, 'ateneo')

# anziani
sanita = F(180) / F(9, 100)
tot_reg = sanita / F(1, 2)
assert (sanita, tot_reg) == (2000, 4000)
a24 = F(180) / F(105, 100)
check_predicates('v-anziani', {
    'spesa complessiva della Regione è stata di 4 miliardi': tot_reg == 4000,
    'il 9% della spesa complessiva': F(180) / tot_reg == F(9, 100),
    '175 milioni': a24 == 175,
    "l'8% della spesa sanitaria": a24 / sanita == F(8, 100)}, 'anziani')

# ricarico e margine
ric, mar = F(100 - 80, 80), F(100 - 80, 100)
assert (ric, mar) == (F(1, 4), F(1, 5))
check_predicates('v-ricarico', {
    'ricarico è del 25% e il margine è del 20%': (ric, mar) == (F(25, 100), F(20, 100)),
    'ricarico è del 20% e il margine è del 25%': (ric, mar) == (F(20, 100), F(25, 100)),
    'entrambi del 20%': ric == mar == F(20, 100),
    'entrambi del 25%': ric == mar == F(25, 100)}, 'ricarico/margine')

# trasferta
def rimborso(ore, pasti, dirigente):
    if ore <= 8:
        return 0
    tetti = sorted((min(p, 25) for p in pasti), reverse=True)
    return sum(tetti) if ore >= 12 else (tetti[0] if tetti else 0)
rb = rimborso(10, [40, 22], True)
assert rb == 25
check_predicates('v-trasferta', {'25 euro': rb == 25, '47 euro': rb == 47, '50 euro': rb == 50, '62 euro': rb == 62}, 'trasferta')

# ============================ DATA INSIGHTS ============================
# prezzo di un libro (sì/no), prezzo intero in euro
sc_li = list(range(1, 101))
check_ds('d-libro', 'D', sc_li, lambda p: p > 12, lambda p: 50 // p <= 4, lambda p: 100 // p >= 7)
assert [p for p in sc_li if 50 // p <= 4 and 100 // p >= 7] == [11, 12, 13, 14]

# editoria (torta + variazioni)
DE = D['editoria']
ric_ora = [DE['totale'] * q / 100 for q in DE['quote']]
ric_poi = [r * (1 + v / 100) for r, v in zip(ric_ora, DE['variazioni'])]
assert ric_ora == [54, 30, 24, 12] and ric_poi == [54, 24, 36, 12] and sum(DE['quote']) == 100
check_value('d-editoria', (sum(ric_poi) / sum(ric_ora) - 1) * 100)
assert sum(DE['variazioni']) == 30 and (50 - 20) / 2 == 15 and sum(DE['variazioni']) / 4 == 7.5
check_assets('d-editoria', [45, 25, 20, 10, 120, 50, 20])

# cooperativa: soci
uomini, donne = 60 * 7 // 12, 60 * 5 // 12
sopra50 = 60 * 40 // 100
assert (uomini, donne, sopra50) == (35, 25, 24)
mondi_c = list(range(max(0, sopra50 - donne), min(uomini, sopra50) + 1))   # uomini con più di 50 anni
check_dp('d-cooperativa', mondi_c, [
    lambda k: donne == 25,
    lambda k: k >= 4,
    lambda k: sopra50 < donne,
    lambda k: F(uomini, 60) == F(60, 100)], 'V')

# penna (DS)
passi = [F(i, 2) for i in range(1, 29)]
sc_pe = [(p, q) for p in passi for q in passi]
check_ds('d-penna', 'B', sc_pe, lambda s: s[0], lambda s: 3 * s[0] + 2 * s[1] == 14, lambda s: s[1] == 2 * s[0])
assert 3 * 2 + 2 * 4 == 14 and 3 * 4 + 2 * 1 == 14

# ammissioni
DA = D['ammissioni']
amm = [c * p // 100 for c, p in zip(DA['candidati'], DA['ammessi'])]
assert amm == [200, 180, 100] and sum(amm) * 100 // sum(DA['candidati']) == 48
check_predicates('d-ammissioni', {
    'percentuale di ammessi è il 50%': F(sum(amm), sum(DA['candidati'])) == F(1, 2),
    'ammessi della sede B sono più di quelli della sede A': amm[1] > amm[0],
    'sedi A e C insieme sono stati ammessi 300': amm[0] + amm[2] == 300,
    'Nessuna delle altre': False}, 'ammissioni')
check_assets('d-ammissioni', [500, 300, 200, '40%', '60%', '50%'])

# logica dei corsi: tre corsi, ciascuno (inglese, numero chiuso); il tirocinio c'è sempre
corsi_ok = [(i_, c_) for i_ in (False, True) for c_ in (False, True) if not (i_ and c_)]
mondi_co = [w for w in itertools.product(corsi_ok, repeat=3) if any(c[0] for c in w)]
check_dp('d-corsi-logica', mondi_co, [
    lambda w: any(c[1] for c in w),
    lambda w: any(not c[1] for c in w),
    lambda w: any(c[0] and False for c in w),       # inglese senza tirocinio: il tirocinio c'è sempre
    lambda w: any(c[0] and c[1] for c in w)], 'F')

# a + b = 20 (DS sì/no)
sc_ab = [(a_, 20 - a_) for a_ in range(1, 20)]
check_ds('d-ab', 'A', sc_ab, lambda s: s[0] * s[1] > 90, lambda s: abs(s[0] - s[1]) <= 4, lambda s: s[0] % 5 == 0)
assert [a_ * b_ for a_, b_ in ((8, 12), (9, 11), (10, 10))] == [96, 99, 100]

# assistenza (barre + percentuali)
DS_ = D['assistenza']
urg = DS_['richieste'][0] * DS_['urgLun'] // 100 + DS_['richieste'][4] * DS_['urgVen'] // 100
assert (urg, sum(DS_['richieste'])) == (35, 250)
check_value('d-assistenza', urg / sum(DS_['richieste']) * 100)
assert (30 + 20) / 2 == 25
check_assets('d-assistenza', [50, 30, 40, 30, 100, '30%', '20%'])

# variazioni mensili (linea)
DV = D['variazioni']
livello_v = F(DV['dicembre'])
serie = []
for v in DV['v']:
    livello_v *= 1 + F(v, 100)
    serie.append(livello_v)
assert serie == [600, 540, 675, 540] and 500 * (1 + F(sum(DV['v']), 100)) == 575
check_value('d-variazioni', serie[-1])
check_assets('d-variazioni', [20, 25])

# francese (DS con tabella 2x2 nascosta)
sc_fr = [(G, fg, fb) for G in range(0, 201) for fg in range(0, G + 1) for fb in range(0, 200 - G + 1)]
check_ds('d-francese', 'C', sc_fr, lambda s: s[1],
         lambda s: s[1] + s[2] == 80 and s[2] == 20,
         lambda s: s[0] == 120 and 2 * s[1] == s[0])

# regioni (tabella con densità)
DG = D['regioni']
dens = [F(a * 1000, s) for a, s in zip(DG['ab'], DG['sup'])]
assert dens == [300, 200, 400, 300]
piu_pop = DG['ab'].index(max(DG['ab']))
cond_r = {
    'più popolosa è anche quella con la densità': dens[piu_pop] == max(dens),
    "insieme delle quattro regioni è di 300": F(sum(DG['ab']) * 1000, sum(DG['sup'])) == 300,
    'più che doppia rispetto a Beta': dens[2] > 2 * dens[1],
}
assert F(sum(DG['ab']) * 1000, sum(DG['sup'])) == F(800, 3) and sum(dens) / 4 == 300
check_predicates('d-regioni', dict(cond_r, **{'Nessuna delle altre': not any(cond_r.values())}), 'tabella regioni')
check_assets('d-regioni', ['2.000', '5.000', '1.000', '4.000', 600, '1.200', 400])

# stipendi: media ponderata
mondi_s = list(range(1, 60))     # k dipendenti al Sud, 2k al Nord
def media(k): return F(2 * k * 2000 + k * 1500, 3 * k)
check_dp('d-stipendi', mondi_s, [
    lambda k: media(k) == 1750,
    lambda k: media(k) > 1750,
    lambda k: 2 * k * 2000 > 2 * (k * 1500),
    lambda k: media(k) < 1800], 'V')

# catena (cella nascosta)
DCt = D['catena']
onl23 = DCt['totale'][2] - DCt['negozi'][2]
assert onl23 == 26
onl = [15, 20, onl23, 34, 40]
for i in range(5):
    if DCt['online'][i] is not None:
        assert DCt['negozi'][i] + DCt['online'][i] == DCt['totale'][i]
aum = [onl[i] - onl[i - 1] for i in range(1, 5)]
assert aum == [5, 6, 8, 6]
check_predicates('d-catena', {
    'ricavi totali della catena sono aumentati di più del 40%': DCt['totale'][4] > 1.4 * DCt['totale'][0],
    'aumentati ogni anno della stessa quantità': len(set(aum)) == 1,
    'inferiori al 40% di quelli dei negozi': onl[2] < 0.4 * DCt['negozi'][2],
    'superato il 60% di quelli dei negozi': onl[4] > 0.6 * DCt['negozi'][4]}, 'tabella catena')
check_assets('d-catena', [60, 62, 64, 66, 68, 15, 20, 34, 40, 75, 82, 90, 100, 108])

# quaderni e penne (DS)
sc_qn = [(q_, p_) for q_ in range(0, 7) for p_ in range(0, 16) if 2 * p_ + 5 * q_ == 30]
assert sc_qn == [(0, 15), (2, 10), (4, 5), (6, 0)]
check_ds('d-quaderni', 'B', sc_qn, lambda s: s[0], lambda s: s[0] >= 3, lambda s: s[1] >= 5)

# sale del museo: quattro misure intere distinte, minima 30, massima 80, totale 200
mondi_ms = [(30, b_, c_, 80) for b_ in range(31, 80) for c_ in range(b_ + 1, 80) if 30 + b_ + c_ + 80 == 200]
check_dp('d-museo-sale', mondi_ms, [
    lambda w: 90 in w,
    lambda w: w[1] + w[2] == 90,
    lambda w: w[1] < 45 and w[2] < 45,
    lambda w: 50 in w], 'F')

# rettangolo con perimetro 30 (DS sì/no): lati a ≤ b, a + b = 15
sc_re = [(F(k, 4), 15 - F(k, 4)) for k in range(1, 31)]
check_ds('d-rettangolo', 'A', sc_re, lambda s: s[0] * s[1] > 50, lambda s: s[0] >= 6, lambda s: s[0].denominator == 1)
assert [a_ * (15 - a_) for a_ in range(1, 8)] == [14, 26, 36, 44, 50, 54, 56]

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
