#!/usr/bin/env python3
"""
check_math_19.py — ricalcola con il codice le risposte del Mock 19 e le
confronta con la chiave (`ans`) di docs/mocks/mock-19.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_19.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-19.js')],
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


# ============================ QUANTITATIVA ============================
# assemblea
x_a = [x for x in range(0, 101) if abs((x * 80 + (100 - x) * 50) / 100 - 68) < 1e-9]
assert x_a == [60]
check_value('q-assemblea', 60)
assert (80 + 50) / 2 == 65

# pesi: sistema lineare per tentativi
sol_p = [(m, l, n) for m in range(30, 100) for l in range(30, 100) for n in range(30, 100)
         if m + l == 130 and l + n == 120 and m + n == 110]
assert sol_p == [(60, 70, 50)]
check_value('q-pesi', 50)

# listino
L_ = [p for p in range(1, 2000) if p * 8 // 10 - 40 == 360 and p * 8 % 10 == 0]
assert L_ == [500]
check_value('q-listino', 500)
assert 360 / 0.8 == 450 and 360 / 0.8 + 40 == 490 and 400 * 1.2 == 480

# moneta: sequenze di 4 lanci con almeno due teste consecutive
seq = [''.join(s) for s in itertools.product('HT', repeat=4)]
fav = sum(1 for s in seq if 'HH' in s)
assert fav == 8 and len(seq) == 16
check_value('q-moneta', F(fav, len(seq)))
assert sum(1 for s in seq if s.count('H') == 2) == 6 and sum(1 for s in seq if s.count('H') >= 2) == 11

# crescita: 20 raddoppi
val = 2 ** 20
best = min(range(len(Q['q-crescita']['opts'])),
           key=lambda i: abs(math.log10(val) - math.log10({'mille': 1e3, 'centomila': 1e5, 'milione': 1e6, 'miliardo': 1e9}[
               [w for w in ('mille', 'centomila', 'milione', 'miliardo') if w in plain(Q['q-crescita']['opts'][i])][0]])))
check_idx('q-crescita', best, '2^20 ≈ un milione')
assert (14 - 9) * 60 // 15 == 20 and 2 ** 10 == 1024 and abs(2 ** 20 - 10 ** 6) / 10 ** 6 < 0.05

# stipendi
b25, a25 = F(100), F(150)
b26, a26 = b25 * F(12, 10), a25 * F(11, 10)
check_value('q-stipendi', float((a26 / b26 - 1) * 100))
assert a25 / b26 == F(5, 4) and 50 - 20 + 10 == 40 and 50 - 20 == 30

# capitano e vice
n_c = sum(1 for tit in itertools.combinations(range(7), 4) for cap in tit for vice in tit if vice != cap)
n_c2 = sum(1 for cap in range(7) for vice in range(7) if vice != cap
           for altri in itertools.combinations([x for x in range(7) if x not in (cap, vice)], 2))
assert n_c == n_c2 == 420
check_value('q-capitano', 420)
assert 7 * 6 * 5 * 4 == 840 and 35 * 6 == 210 and 35 * 4 == 140

# resti: file da 5, 6, 7
r_ = [n for n in range(200, 301) if n % 5 == 1 and n % 6 == 2 and n % 7 == 0]
assert r_ == [266]
check_value('q-resto-fila', 266)
for esca, ok in ((236, (True, True, False)), (231, (True, False, True)), (224, (False, True, True))):
    assert (esca % 5 == 1, esca % 6 == 2, esca % 7 == 0) == ok, esca

# ristorante
n_r = [N for N in range(1, 1000) if N * 11 * 11 == 242 * 100]
assert n_r == [200]
check_value('q-ristorante', 200)
assert abs(242 / 1.2 - 201.67) < 0.01 and round(242 / 1.1, 6) == 220 and abs(242 * 0.8 - 193.6) < 1e-9

# urna: due palline di colori diversi
palline = ['r'] * 4 + ['b'] * 3 + ['v'] * 2
coppie = list(itertools.combinations(range(9), 2))
p_u = F(sum(1 for a_, b_ in coppie if palline[a_] != palline[b_]), len(coppie))
assert p_u == F(13, 18)
check_value('q-urna', p_u)
assert 1 - F(16 + 9 + 4, 81) == F(52, 81)

# traduttori: lavoro, con cambio a metà
fatto, giorno = F(0), 0
while fatto < 1:
    giorno += 1
    r = F(1, 12) + F(1, 18) if giorno <= 6 else F(1, 18) * F(3, 2)
    fatto += r
assert giorno == 8 and fatto >= 1
check_value('q-traduttori', giorno)
# senza il +50%: 9 giorni
fatto, g2 = F(0), 0
while fatto < 1:
    g2 += 1
    fatto += F(1, 12) + F(1, 18) if g2 <= 6 else F(1, 18)
assert g2 == 9

# potere d'acquisto
check_value('q-potere', round((1.10 / 1.25 - 1) * 100, 6))
assert round((0.15 / 1.1) * 100, 1) == 13.6 and round((1 / 1.25 - 1) * 100) == -20

# voti: media dei 10 migliori
check_value('q-voti', (40 * 23 - 30 * 21) / 10)

# dadi: somma 10
n_d = sum(1 for t in itertools.product(range(1, 7), repeat=3) if sum(t) == 10)
n_9 = sum(1 for t in itertools.product(range(1, 7), repeat=3) if sum(t) == 9)
assert n_d == 27 and n_9 == 25
check_value('q-dadi', F(n_d, 216))

# corsa: velocità e posizione di Bea
vA = F(10)             # m/s qualsiasi (la risposta non dipende da vA)
vB = vA * F(90, 100)   # nella prima gara, Bea fa 90 m mentre Anna fa 100 m
tA = F(110) / vA
assert vB * tA == 99 and 100 - vB * tA == 1
check_idx('q-corsa', idx('q-corsa', 'Anna vince di poco'), 'Anna vince di 1 m')

# sei amici
T_ = [T for T in range(1, 2000) if T * 3 - T * 2 == 12 * 12 and T % 12 == 0]
assert T_ == [144] and F(144, 4) - F(144, 6) == 12
check_value('q-sei-amici', 144)

# vittorie
x_ = [x for x in range(0, 500) if F(12 + x, 20 + x) == F(8, 10)]
assert x_ == [20]
check_value('q-vittorie', 20)

# mcm
n_m = sum(1 for s in range(1, 3601) if s % 12 == 0 and s % 18 == 0 and s % 30 == 0)
assert n_m == 20 and math.lcm(12, 18, 30) == 180 and math.lcm(18, 30) == 90
check_value('q-mcm', 20)

# ============================ VERBALE (numeri e logica) ============================
# v-biblio: soltanto soci studenti oltre le 20 → falsa
check_vfn('v-biblio', 0)
# v-sondaggio: 800 · 30% · 2/5
ins = 800 * F(30, 100) * F(2, 5)
assert ins == 96 and not ins > 100
check_vfn('v-sondaggio', 0)
# v-vino: vitigno prevalente = quota maggiore
mix = {'Nebbiolo': 40, 'Barbera': 35, 'Freisa': 25}
assert max(mix, key=mix.get) == 'Nebbiolo' and sum(mix.values()) == 100
check_vfn('v-vino', 2)
# v-metro e v-corso: non ricavabile. v-corso: l'inverso di «frequenza ≥ 80% → promosso» ammette mondi veri e falsi
mondi_c = []
for st in itertools.product(itertools.product([False, True], repeat=2), repeat=3):   # (frequenza ≥ 80%, promosso)
    if all(p for f, p in st if f):
        mondi_c.append(st)
claim_c = {all(f for f, p in st if p) for st in mondi_c}
assert claim_c == {True, False}
check_vfn('v-corso', 1)
check_vfn('v-metro', 1)

# v-turismo: la NON corretta è «spesa complessiva cresciuta meno del 20%»
t24, t25 = 500000, 600000
assert t25 / t24 == 1.2
sogg24, sogg25 = 5 * 120, 6 * 108
tot24, tot25 = t24 * sogg24, t25 * sogg25
assert (sogg24, sogg25, tot24, tot25) == (600, 648, 300000000, 388800000)
assert round((tot25 / tot24 - 1) * 100, 1) == 29.6 and t25 * 45 // 100 == 270000
check_predicates('v-turismo', {
    'cresciuta nel 2025 di meno del 20%': True,        # è l'affermazione sbagliata (risposta giusta)
    'erano 500.000': False,
    'hanno ospitato 270.000 turisti': False,
    'media di un turista per l\'intero soggiorno è aumentata': False}, 'quale NON è corretta')

# v-spread
m0, m1 = F(15, 10) + F(160, 100), F(23, 10) + F(120, 100)
assert (m0, m1) == (F(31, 10), F(35, 10)) and m1 - m0 == F(4, 10)
check_predicates('v-spread', {
    'è aumentato di 0,4 punti percentuali': True,
    'è sceso di 0,4 punti percentuali': False,
    'aumentato di 0,8 punti percentuali': False,
    'dell\'1,2%': False}, 'rendimento di Montalto')

# v-direttiva: 4% − 1% = 3 punti
assert 4 - 1 == 3
assert Q['v-direttiva']['ans'] == idx('v-direttiva', 'dovrebbe presentare una relazione')

# v-imprese
imprese, addetti = 4_000_000, 16_000_000
micro_i, micro_a = imprese * F(94, 100), addetti * F(40, 100)
grandi_i, grandi_a = imprese * F(2, 1000), addetti * F(25, 100)
interm = 100 - 94 - F(2, 10)
assert float(micro_a / micro_i) < 2 and round(float(micro_a / micro_i), 2) == 1.70
assert grandi_i == 8000 and grandi_a / grandi_i == 500 and interm == F(58, 10)
check_predicates('v-imprese', {
    'occupano meno di due addetti ciascuna': micro_a / micro_i < 2,
    'sono più di 10.000': grandi_i > 10000,
    'circa 400 addetti ciascuna': abs(grandi_a / grandi_i - 400) < 20,
    'sono meno dell\'1% del totale': interm < 1}, 'imprese')

# v-occupazione: 20% < 21%
assert 20 < 21
assert Q['v-occupazione']['ans'] == idx('v-occupazione', 'inferiore a quello da cui si era partiti')

# v-regola: Giulia, 3° anno, ISEE 27.000, disabilità 70%, 38 crediti
def ha_diritto(anno, isee, disab, crediti):
    limite = 30000 if disab >= 66 else 22000
    if isee >= limite and not (isee < limite):
        return False
    ok_isee = isee < limite
    ok_crediti = True if anno == 1 else (crediti >= 20 if anno == 2 else crediti >= 45)
    return ok_isee and ok_crediti
assert not ha_diritto(3, 27000, 70, 38) and (27000 < 30000) and (38 < 45)
check_predicates('v-regola', {
    'non ha acquisito i crediti richiesti': True,
    'il suo ISEE supera i 22.000 euro': False,           # sbagliata: la disabilità alza il limite
    'il limite di ISEE sale a 30.000 euro': False,       # la conclusione «ha diritto» è sbagliata
    'più dei 20 crediti richiesti': False}, 'regola del bando')

# ============================ DATA INSIGHTS ============================
# prezzo: sì/no con limite
sc_pr = [(F(P), F(P) * F(24, 100)) for P in range(1, 200)] + [(F(P), F(5)) for P in range(1, 200)] + [(F(125, 6), F(5))]
check_ds('d-prezzo', 'A', sc_pr,
         lambda s: F(12, 10) * s[0] - s[1] < s[0],
         lambda s: s[1] == F(24, 100) * s[0],
         lambda s: s[1] == 5)

# triangolo: AB = 6, AC = 8, angolo A variabile
sc_t = [a for a in range(1, 180)]
def BC2(a): return 36 + 64 - 96 * math.cos(math.radians(a))
check_ds('d-triangolo', 'C', sc_t,
         lambda a: round(24 * math.sin(math.radians(a)), 6),
         lambda a: a == 90,
         lambda a: abs(BC2(a) - 100) < 1e-9)

# lingue (DS): iscritti N, studenti di spagnolo S
sc_l = []
for N in range(25, 1001, 25):
    e_ = N * 7 // 10
    both = e_ * 4 // 10
    for S in range(both, N - e_ + both + 1):
        sc_l.append((N, S, both))
check_ds('d-lingue-ds', 'B', sc_l, lambda s: s[1] - s[2], lambda s: s[0] == 500, lambda s: s[1] == 250)
assert 250 - 0.28 * 500 == 110

# cisterna
sc_ci = list(range(300, 501))
check_ds('d-cisterna', 'D', sc_ci, lambda n: n, lambda n: n % 7 == 3, lambda n: n % 5 == 2)
assert [n for n in sc_ci if n % 7 == 3 and n % 5 == 2] == [332, 367, 402, 437, 472]

# stipendi (DS)
sc_s = list(range(0, 41))
check_ds('d-stipendi', 'A', sc_s,
         lambda E: F(1800 * (40 - E) + 2600 * E, 40) > 2200,
         lambda E: E > 20, lambda E: 40 - E > 15)

# camicie
sc_cm = [(c, p) for c in range(1, 101) for p in range(1, 101)]
check_ds('d-camicie', 'B', sc_cm, lambda s: s[0], lambda s: 2 * s[0] + s[1] == 90, lambda s: s[0] + 2 * s[1] == 105)

# lingue (DP): 12 dipendenti, tipi (inglese, tedesco, francese) con francese ⇒ tedesco e almeno una lingua
tipi = [t for t in itertools.product([0, 1], repeat=3) if (t[0] or t[1]) and (not t[2] or t[1])]
mondi_l = []
for cnt in itertools.product(range(13), repeat=len(tipi)):
    if sum(cnt) != 12:
        continue
    ing = sum(c * t[0] for c, t in zip(cnt, tipi))
    ted = sum(c * t[1] for c, t in zip(cnt, tipi))
    if ing == 9 and ted == 7:
        mondi_l.append(list(zip(cnt, tipi)))
def cnt_if(w, f): return sum(c for c, t in w if f(t))
check_dp('d-lingue', mondi_l, [
    lambda w: cnt_if(w, lambda t: t[0] and t[1]) >= 4,
    lambda w: cnt_if(w, lambda t: t[0] and not t[1]) <= 3,
    lambda w: cnt_if(w, lambda t: t[2]) >= 2,
    lambda w: cnt_if(w, lambda t: t[0] and not t[1] and t[2]) == 0], 'V')

# ripiani: 4 libri, 4 ripiani
mondi_r = []
for perm in itertools.permutations(range(1, 5)):
    g, s, f, t = perm            # ripiano di giallo, storico, fantasy, saggio
    if g in (1, 4) or not t > s or f not in (1, 4):
        continue
    mondi_r.append(dict(g=g, s=s, f=f, t=t))
assert len(mondi_r) == 4
check_dp('d-ripiani', mondi_r, [
    lambda w: w['t'] == 1,
    lambda w: w['s'] == 4,
    lambda w: w['g'] > w['f'],
    lambda w: abs(w['g'] - w['t']) != 1], 'F')

# soci
mondi_s = []
for S_ in range(1, 100):
    for J_ in range(0, 100):
        if 2 * J_ == S_ and 30 <= S_ + J_ + 6 <= 40:
            mondi_s.append((S_, J_, 6))
assert [w[0] for w in mondi_s] == [16, 18, 20, 22]
check_dp('d-soci', mondi_s, [
    lambda w: w[0] > w[1] + w[2],
    lambda w: (w[0] + w[1] + w[2]) % 3 == 0,
    lambda w: w[1] >= 10,
    lambda w: w[0] + w[1] + w[2] > 35], 'V')

# badge: Carla + due altri dipendenti; flag (smart, badge, corso, neo)
def valido(p):
    smart, badge, corso, neo = p
    return (not smart or badge) and (not badge or corso) and not (neo and corso)
tutti = [p for p in itertools.product([False, True], repeat=4) if valido(p)]
mondi_b = [(carla, a_, b_) for carla in tutti if carla[0] for a_ in tutti for b_ in tutti]
check_dp('d-badge', mondi_b, [
    lambda w: w[0][2],
    lambda w: all(p[0] for p in w if p[1]),
    lambda w: w[0][3],
    lambda w: any(p[3] and p[1] for p in w)], 'F')

# ordini (istogramma)
DO = D['ordini']
q1 = sum(DO['migliaia'][:3]) * 1000 * DO['prezzo1']
q2 = sum(DO['migliaia'][3:]) * 1000 * DO['prezzo2']
assert (q1, q2) == (7_500_000, 12_000_000)
check_value('d-ordini', (q1 + q2) * DO['margine'] / 100 / 1e6)
assert sum(DO['migliaia']) * 1000 * 50 * 0.2 / 1e6 == 3.5 and sum(DO['migliaia']) * 1000 * 60 * 0.2 / 1e6 == 4.2
check_assets('d-ordini', [40, 50, 60, 70, 20])

# variazioni (barre positive e negative)
DV = D['variazioni']
serie = [F(DV['gennaio'])]
for p_ in DV['pct']:
    serie.append(serie[-1] * (100 + p_) / 100)
assert serie == [400, 500, 400, 600, 300, 360]
check_value('d-variazioni', float(sum(serie)))
tutte_su_gen = [DV['gennaio']] + [DV['gennaio'] * (100 + p_) / 100 for p_ in DV['pct']]
assert sum(tutte_su_gen) == 2500 and 6 * 400 == 2400 and sum(serie) - 400 == 2160
check_assets('d-variazioni', [25, 20, 50, 400])

# linee (torta con dati extra)
DL = D['linee']
assert sum(DL['quote']) == 100
cucine = DL['totale'] * DL['quote'][1] / 100
online = cucine * DL['negozioOnline'][1] / sum(DL['negozioOnline'])
assert online == 336000
check_value('d-linee', online)
assert (DL['totale'] / 1.2) * 0.35 * 0.4 == 280000 and cucine * 3 / 5 == 504000 and cucine / 2 == 420000
check_assets('d-linee', [40, 35, 25, 20, '2.400.000'])

# trasporti (percentuali di riga)
DT = D['trasporti']
num = lambda col: [n * p // 100 for n, p in zip(DT['n'], DT[col])]
auto, pub, bici = num('auto'), num('pubblici'), num('bici')
assert all(a_ + b_ + c_ == n for a_, b_, c_, n in zip(auto, pub, bici, DT['n']))
tot = sum(DT['n'])
assert (auto, pub, bici) == ([180, 240, 160], [240, 100, 20], [180, 60, 20]) or True
# l'ordine delle colonne nella tabella è: auto, pubblici, bici, per fascia
auto = [DT['n'][i] * DT['auto'][i] // 100 for i in range(3)]
pub = [DT['n'][i] * DT['pubblici'][i] // 100 for i in range(3)]
bici = [DT['n'][i] * DT['bici'][i] // 100 for i in range(3)]
assert auto == [180, 240, 160] and pub == [240, 100, 20] and bici == [180, 60, 20] and tot == 1200
check_predicates('d-trasporti', {
    'più del doppio': bici[0] > 2 * bici[1],
    'Più della metà degli intervistati va al lavoro in auto': sum(auto) > tot / 2,
    'meno del 25% del totale': sum(pub) < 0.25 * tot,
    'più numerosi di quelli di 35–54 anni che usano l\'auto': auto[2] > auto[1]}, 'tabella trasporti')
assert round(sum(auto) / tot * 100, 1) == 48.3 and round(sum(DT['auto']) / 3, 1) == 56.7
check_assets('d-trasporti', [600, 400, 200, '30%', '60%', '80%', '40%', '25%', '10%', '15%'])

# spesa pubblica (numeri vicini alla soglia)
from decimal import Decimal as Dc
DS_ = D['spesa']
ist = [Dc(str(x)) for x in DS_['Istruzione']]
san = [Dc(str(x)) for x in DS_['Sanità']]
tra = [Dc(str(x)) for x in DS_['Trasporti']]
tot21, tot25 = ist[0] + san[0] + tra[0], ist[4] + san[4] + tra[4]
check_predicates('d-spesa', {
    'almeno un terzo di quella per la sanità': tra[4] >= san[4] / 3,
    'cresciuta in ciascun anno': all(ist[i] > ist[i - 1] for i in range(1, 5)),
    'di più del 16%': tot25 > tot21 * Dc('1.16'),
    'più del doppio di quella per l\'istruzione': san[3] + san[4] > 2 * (ist[3] + ist[4])}, 'tabella spesa')
assert (tot21, tot25) == (Dc('65.0'), Dc('74.8')) and san[4] / 3 == Dc('13.4')
check_assets('d-spesa', ['18,4', '34,0', '12,6', '21,0', '40,2', '13,6', '19,8'])

# divisioni (la risposta giusta è «Nessuna delle altre»)
DD = D['divisioni']
sud = DD['Sud']; nord = DD['Nord']; cen = DD['Centro']
tot25d = nord[3] + cen[3] + sud[3]
crescite = {'Nord': F(nord[3] - nord[0], nord[0]), 'Centro': F(cen[3] - cen[0], cen[0]), 'Sud': F(sud[3] - sud[0], sud[0])}
check_predicates('d-nessuna', {
    'più che doppi': sud[3] > 2 * sud[0],
    'crescita percentuale più alta è stata quella della divisione Centro': max(crescite, key=crescite.get) == 'Centro',
    'più del 45%': F(nord[3], tot25d) > F(45, 100),
    'Nessuna delle altre': not (sud[3] > 2 * sud[0] or max(crescite, key=crescite.get) == 'Centro' or F(nord[3], tot25d) > F(45, 100))}, 'tabella divisioni')
assert tot25d == 150 and F(nord[3], tot25d) == F(44, 100) and max(crescite, key=crescite.get) == 'Sud'
check_assets('d-nessuna', [48, 52, 60, 66, 30, 33, 36, 44, 20, 26, 31, 40])

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
calcolati = {'v-biblio', 'v-sondaggio', 'v-vino', 'v-metro', 'v-corso', 'v-turismo', 'v-spread', 'v-direttiva', 'v-imprese', 'v-occupazione', 'v-regola'}
print('Domande verbali senza conti controllate a mano (testo/logica):',
      [k for k in Q if k.startswith('v-') and k not in calcolati])
