#!/usr/bin/env python3
"""
check_math_24.py — ricalcola con il codice le risposte del Mock 24 e le
confronta con la chiave (`ans`) di docs/mocks/mock-24.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_24.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-24.js')],
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


# ============================ QUANTITATIVA ============================
# scala 1:25.000
km = F(12 * 25000, 100000)
assert km == 3
check_value('q-scala', km)

# prezzo × quantità
ric = F(6, 5) * F(9, 10)
assert ric == F(27, 25)
check_value('q-ricavo', (ric - 1) * 100)
assert F(6, 5) * F(11, 10) == F(33, 25)

# calzini: minimo n che garantisce 3 uguali (8 per colore)
def garantito(n):
    return all(max(v) >= 3 for v in itertools.product(range(9), repeat=3) if sum(v) == n)
n_min = min(n for n in range(1, 25) if garantito(n))
assert n_min == 7
check_value('q-calzini', n_min)

# media di cinque verifiche
ult = F(5 * 64 - 3 * 60, 10) / 2
assert ult == 7
check_value('q-voti-medie', ult)

# almeno due persone nello stesso giorno della settimana
cas = [t for t in itertools.product(range(7), repeat=3) if len(set(t)) < 3]
p_ = F(len(cas), 343)
assert p_ == F(19, 49)
check_value('q-stesso-giorno', p_)
assert F(210, 343) == F(30, 49)

# dirigenti: donne tra i dirigenti
dir_u, dir_d = F(60) * F(10, 100), F(40) * F(25, 100)
assert (dir_u, dir_d) == (6, 10) and dir_d / (dir_u + dir_d) == F(5, 8)
check_value('q-dirigenti', float(dir_d / (dir_u + dir_d)) * 100)

# x + 20% = y − 20%
coppie = [(x_, y_) for x_ in range(1, 40) for y_ in range(1, 40) if F(6, 5) * x_ == F(4, 5) * y_]
assert all(F(x_, y_) == F(2, 3) for x_, y_ in coppie) and coppie
check_value('q-aum-dim', F(2, 3))

# né quadrati né cubi tra 1 e 100
n_nn = [n for n in range(1, 101) if round(n ** 0.5) ** 2 != n and round(n ** (1 / 3)) ** 3 != n]
assert len(n_nn) == 88
check_value('q-cubi', len(n_nn))
assert sum(1 for n in range(1, 101) if round(n ** 0.5) ** 2 == n) == 10 and sum(1 for n in range(1, 101) if round(n ** (1 / 3)) ** 3 == n) == 4

# quattro coppie in fila, sempre vicine
n_cp = 0
for perm in itertools.permutations(range(8)):
    pos = {p_: i for i, p_ in enumerate(perm)}
    if all(abs(pos[2 * c_] - pos[2 * c_ + 1]) == 1 for c_ in range(4)):
        n_cp += 1
assert n_cp == 384 == math.factorial(4) * 2 ** 4
check_value('q-coppie', n_cp)

# cambio
eu = F(500) * F(11, 10) / F(5, 4)
assert eu == 440
check_value('q-cambio', eu)

# gioco: due dadi, somma 7
p7 = F(sum(1 for a_, b_ in itertools.product(range(1, 7), repeat=2) if a_ + b_ == 7), 36)
atteso = 9 * p7 - 2
assert p7 == F(1, 6) and atteso == F(-1, 2)
check_idx('q-gioco', idx('q-gioco', 'perdono in media 0,50'), 'valore atteso −0,50')

# serbatoio
cap = F(24) / (F(3, 5) - F(1, 2))
assert cap == 240
check_value('q-serbatoio', cap)
assert 24 / (3 / 5) == 40 and round(24 / (2 / 5)) == 60

# età: non determinabile
ann = {2 * c_ + 5 for c_ in range(1, 40)}
assert len(ann) > 1 and {15, 19, 25} <= ann
controllate += 1
if idx_eq('q-eta', 'Non è determinabile') != Q['q-eta']['ans']:
    errori.append('n.q-eta: la risposta giusta è «Non è determinabile»')

# zeri finali di 25!
zeri = len(str(math.factorial(25))) - len(str(math.factorial(25)).rstrip('0'))
assert zeri == 6
check_value('q-zeri', zeri)

# successione
a_, b_ = 2, 3
seq = [a_, b_]
while len(seq) < 11:
    seq.append(seq[-1] + seq[-2])
assert seq[9] == 144 and seq[8] == 89 and seq[10] == 233
check_value('q-fibonacci', seq[9])

# orologio
r_ = [m for m in range(1, 1000) if F(m) * F(9, 10) == 360]
assert r_ == [400]
ora = (datetime.datetime(2026, 1, 1, 8, 0) + datetime.timedelta(minutes=r_[0])).strftime('%H:%M')
assert ora == '14:40'
controllate += 1
if idx_eq('q-orologio', ora) != Q['q-orologio']['ans']:
    errori.append('n.q-orologio: la risposta giusta è 14:40')

# ricetta
pasta = F(300, 4) * F(8, 10) * 10
assert pasta == 600
check_value('q-ricetta', pasta)
assert F(750) / F(6, 5) == 625

# almeno 8 «vero» su 10
n_vf = sum(1 for t in itertools.product((0, 1), repeat=10) if sum(t) >= 8)
assert n_vf == 56
check_value('q-vero-falso', n_vf)

# ============================ VERBALE ============================
# piscina: 10 ingressi 60 euro contro abbonamento 48 euro
ris = F(60 - 48, 60)
assert ris == F(1, 5) != F(1, 4) and F(12, 48) == F(1, 4)
check_vfn('v-piscina', 0)
check_vfn('v-ristorante', 1)
assert F(630000) == 18000 * 35 and F(18000, 112) * 100 * 35 == 562500
# polizza: 1.250 − 250, massimale 5.000
assert 1250 - 250 == 1000 <= 5000
check_vfn('v-polizza', 2)
# concorso: 23 < 24
assert 23 < 24
check_vfn('v-concorso', 0)
# sondaggio: 100% − 35% − 15% = 50% di 1.200
assert 1200 * (100 - 35 - 15) // 100 == 600 > 550
check_vfn('v-sondaggio', 2)

# debito / PIL
r24, r25 = F(1200, 800), F(1200 + 60, 800 * F(105, 100))
assert r24 == r25 == F(3, 2)
check_predicates('v-debito', {
    'rimasto invariato al 150%': r25 == r24 == F(3, 2),
    'migliorato, perché il PIL è cresciuto': r25 < r24,
    'peggiorato, perché il debito è aumentato': r25 > r24,
    'sceso al 145%': r25 == F(145, 100)}, 'debito/PIL')

# quota di mercato
m24, m25 = 10, F(10) * F(8, 10)
x25 = F(27, 10)
x24 = x25 / F(9, 10)
q24, q25 = x24 / m24, x25 / m25
assert (x24, q24, q25) == (3, F(3, 10), F(27, 80))
check_predicates('v-quota', {
    'quota di mercato della marca X è aumentata': q25 > q24,
    'quota di mercato della marca X è diminuita': q25 < q24,
    'rimasta uguale al 30%': q25 == F(3, 10),
    'sono calate del 20%, come quelle dell\'intero mercato': x25 / x24 - 1 == F(-1, 5)}, 'quota')

# bonus
def fondo(fat):
    if fat > 60:
        return F(3, 100) * (fat - 50) * 10 ** 6
    if fat > 50:
        return F(2, 100) * (fat - 50) * 10 ** 6
    return F(0)
assert fondo(56) == 120000 and fondo(62) == 360000
check_predicates('v-bonus', {
    'fondo bonus sarebbe di 120.000 euro': fondo(56) == 120000,
    'supererà sicuramente i 50 milioni': False,
    'fondo bonus sarebbe di 1,86 milioni di euro': fondo(62) == 1860000,
    'quota proporzionale del bonus': False}, 'bonus')

# rendimento di un affitto
lordo, netto = F(800 * 12, 200000), F(800 * 12 - 1600, 200000)
assert (lordo, netto) == (F(12, 250), F(1, 25)) and float(lordo) == 0.048 and float(netto) == 0.04
check_predicates('v-affitto', {
    'lordo annuo è del 4,8% e quello netto del 4%.': (lordo, netto) == (F(48, 1000), F(4, 100)),
    'lordo annuo è del 4% e quello': lordo == F(4, 100),
    'quello netto del 4,8%': netto == F(48, 1000),
    'Il rendimento netto annuo è del 3,2%': netto == F(32, 1000)}, 'affitto')

# straordinari domenicali
paga = 12 * F(3, 2) * 4
assert paga == 72 and 12 * F(5, 4) * 4 == 60 and 12 * F(7, 4) * 4 == 84 and 12 * 4 == 48
check_value('v-straordinari', paga)

# scuola
rag, rgz = 800 * 55 // 100, 800 - 800 * 55 // 100
info = 800 * 30 // 100
info_r, info_m = info * 40 // 100, info - info * 40 // 100
assert (rag, rgz, info, info_r, info_m) == (440, 360, 240, 96, 144)
check_predicates('v-scuola', {
    'quota dei ragazzi che hanno scelto informatica è maggiore': F(info_m, rgz) > F(info_r, rag),
    'i ragazzi sono 96': info_m == 96,
    'Più della metà degli studenti ha scelto un laboratorio': info + 800 * 20 // 100 > 800 // 2,
    'sono il 40% di tutte le ragazze': F(info_r, rag) == F(40, 100)}, 'scuola')

# ragionamento: la chiave punta all'opzione indicata
for k_, frag in (('v-triage', 'ha assunto sei nuovi medici'),
                 ('v-lettura', 'In un esperimento'),
                 ('v-parcheggio', 'prive di parcheggi gratuiti'),
                 ('v-assunzione', 'Il numero di reclami riflette'),
                 ('v-furti', 'zone della città senza telecamere')):
    controllate += 1
    if idx(k_, frag) != Q[k_]['ans']:
        errori.append(f'{k_}: la chiave non punta all\'opzione «{frag}»')

# ============================ DATA INSIGHTS ============================
# tedesco: meno di un quarto di 40 persone parla tedesco
sc_t = [(g_, f_) for g_ in range(0, 41) for f_ in range(0, 41)]
check_ds('d-tedesco', 'A', sc_t, lambda s: s[0] < 10,
         lambda s: s[1] == 8 and s[0] <= s[1], lambda s: s[0] >= 5)

# test da 40 domande: sbagliate w, in bianco b
sc_te = [(w_, b_) for w_ in range(0, 41) for b_ in range(0, 41) if w_ + b_ <= 40]
check_ds('d-test', 'A', sc_te, lambda s: 40 - s[0] - s[1] > 30,
         lambda s: s[0] + s[1] < 8, lambda s: s[0] == 3)

# aula: 40 posti, A = 2B, C = 10
mondi_a = [(2 * b_, b_, 10) for b_ in range(1, 40) if 2 * b_ + b_ + 10 == 40]
assert mondi_a == [(20, 10, 10)]
check_dp('d-aula', mondi_a, [
    lambda w: w[1] == 10,
    lambda w: w[0] > w[1] + w[2],
    lambda w: w[2] * 4 == 40,
    lambda w: w[0] < 15], 'V')

# promossi (barre + tassi)
DP_ = D['promossi']
prom = sum(F(n_ * t_, 100) for n_, t_ in zip(DP_['partecipanti'], DP_['tasso']))
assert prom == 310 and F(prom, sum(DP_['partecipanti'])) == F(31, 50) and sum(DP_['tasso']) / 4 == 67.5
check_value('d-promossi', float(F(prom, sum(DP_['partecipanti'])) * 100))
check_assets('d-promossi', [100, 200, 50, 150, '90%', '60%', '80%', '40%'])

# soldi
check_ds('d-soldi', 'C', [F(x_) for x_ in range(1, 301)], lambda x_: x_,
         lambda x_: x_ - x_ / 3 == 40, lambda x_: x_ - 30 == x_ / 2)

# corsi di laurea: (statistica, matematica, latino)
tipi_c = [t_ for t_ in itertools.product([True, False], repeat=3) if (t_[0] or t_[1]) and not (t_[0] and t_[2])]
mondi_c = [w for N in range(1, 4) for w in itertools.product(tipi_c, repeat=N) if any(p[2] for p in w)]
check_dp('d-corsi', mondi_c, [
    lambda w: any(p[1] for p in w),
    lambda w: all(p[1] for p in w if p[2]),
    lambda w: all(not (p[0] and p[1]) for p in w),
    lambda w: any(p[0] for p in w)], 'V')

# retribuzioni
DR = D['retribuzioni']
ret = lambda i, n: DR['fisso'][i] + DR['pezzo'][i] * n
A_, B_, C_ = 0, 1, 2
assert ret(A_, 150) == ret(C_, 150) == 1200 and ret(A_, 200) == ret(B_, 200) == 1400
check_predicates('d-retribuzioni', {
    'Con 150 pezzi Anna e Carla guadagnano la stessa somma': ret(A_, 150) == ret(C_, 150),
    'Con 200 pezzi Bruno guadagna più di Anna': ret(B_, 200) > ret(A_, 200),
    'Con 100 pezzi Carla guadagna più di Bruno': ret(C_, 100) > ret(B_, 100),
    'Con 120 pezzi Carla guadagna più di Anna': ret(C_, 120) > ret(A_, 120)}, 'retribuzioni')
check_assets('d-retribuzioni', [600, 400, 0, 4, 5, 8])

# triangolo rettangolo: ipotenusa 15, cateto 9
sc_tr = []
for th in range(1, 90):
    a_ = 15 * math.cos(math.radians(th)); b_ = 15 * math.sin(math.radians(th))
    sc_tr.append((a_, b_))
for b_ in range(1, 61):
    sc_tr.append((9.0, b_ / 2)); sc_tr.append((b_ / 2, 9.0))
area_ = lambda s: round(s[0] * s[1] / 2, 6)
check_ds('d-cateto', 'B', sc_tr, area_,
         lambda s: abs(math.hypot(*s) - 15) < 1e-9, lambda s: abs(s[0] - 9) < 1e-9 or abs(s[1] - 9) < 1e-9)
assert 9 * 12 / 2 == 54 and math.isqrt(15 ** 2 - 9 ** 2) == 12

# cena: 120 euro
mondi_ce = [(2 * b_, b_, 30) for b_ in range(1, 120) if 2 * b_ + b_ + 30 == 120]
assert mondi_ce == [(60, 30, 30)]
check_dp('d-cena', mondi_ce, [
    lambda w: w[1] > w[2],
    lambda w: w[0] * 2 == 120,
    lambda w: w[2] < w[0],
    lambda w: w[1] == 40], 'F')

# prezzi (linee)
DPr = D['prezzi']
mesi_20 = [m_ for m_ in range(6) if F(DPr['X'][m_], DPr['Y'][m_]) >= F(6, 5)]
assert mesi_20 == [3, 4, 5]
check_value('d-prezzi', len(mesi_20))
check_assets('d-prezzi', DPr['X'] + DPr['Y'])

# velocità media
check_ds('d-velocita', 'D', [F(k_, 4) for k_ in range(2, 33)], lambda t_: 300 / t_ > 100,
         lambda t_: t_ > 2, lambda t_: t_ < 4)

# corriere: cella nascosta
DCo = D['corriere']
exp_ = DCo['totRiga'][1] - DCo['standard'][1] - DCo['economy'][1]
exp2 = DCo['totCol'][1] - sum(x for x in DCo['express'] if x is not None)
assert exp_ == exp2 == 15
expr = [DCo['express'][0], exp_, DCo['express'][2]]
for i in range(3):
    assert DCo['standard'][i] + expr[i] + DCo['economy'][i] == DCo['totRiga'][i]
assert sum(DCo['standard']) == DCo['totCol'][0] and sum(DCo['economy']) == DCo['totCol'][2] and sum(DCo['totRiga']) == DCo['totCol'][3] == 280
quote = [F(expr[i], DCo['totRiga'][i]) for i in range(3)]
assert quote == [F(3, 10), F(3, 16), F(1, 5)]
check_idx('d-corriere', quote.index(min(quote)), 'quota Express più bassa')
check_assets('d-corriere', [60, 30, 10, 45, 20, 20, 50, 30, 100, 80, 135, 65, 280])

# ricavi e variazioni
DRi = D['ricavi']
y25 = [F(r_ * (100 + v_), 100) for r_, v_ in zip(DRi['y24'], DRi['var'])]
assert [int(x) for x in y25] == [220, 270, 150, 420] and sum(y25) == 1060
var = (sum(y25) / sum(DRi['y24']) - 1) * 100
assert var == 6 and sum(DRi['var']) / 4 == 13.75
check_value('d-variazioni', float(var))
check_assets('d-variazioni', [200, 300, 100, 400, '10%', '50%', '5%'])

# aumento del prezzo
check_ds('d-aumento', 'B', [(p0, p1) for p0 in range(10, 61) for p1 in range(10, 61)],
         lambda s: F(s[1], s[0]) > F(6, 5), lambda s: s[1] == 31, lambda s: s[0] == 25)
assert F(31, 25) == F(124, 100)

# fatturato per area (torta): l'Estero è il 20% e vale 6 milioni
DF = D['fatturato']
assert sum(v for _, v in DF['voci']) == 100
q_e = dict(DF['voci'])['Estero']
tot_f = F(DF['estero'] * 100, q_e)
assert tot_f == 30
nuova = F(DF['estero'] * 2) / (tot_f + DF['estero'])
assert nuova == F(1, 3)
check_value('d-fatturato', float(nuova) * 100, tol=0.5)
check_assets('d-fatturato', [35, 25, 20, 6])

# bonus trasporti: (Roma, sede centrale, auto, bonus)
tipi_b = [t_ for t_ in itertools.product([True, False], repeat=4)
          if (t_[2] or t_[3]) and (not t_[2] or t_[1]) and not (t_[0] and t_[1])]
mondi_b = [w for N in range(1, 4) for w in itertools.product(tipi_b, repeat=N) if any(p[0] for p in w)]
check_dp('d-bonus', mondi_b, [
    lambda w: any(p[0] and p[2] for p in w),
    lambda w: all(p[3] for p in w if p[0]),
    lambda w: all(p[0] for p in w if p[3]),
    lambda w: any(p[0] and not p[2] and not p[3] for p in w)], 'F')

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
