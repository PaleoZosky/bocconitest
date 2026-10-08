#!/usr/bin/env python3
"""
check_math_14.py — ricalcola con il codice le risposte del Mock 14 e le
confronta con la chiave (`ans`) di docs/mocks/mock-14.js.

Regole del controllo (come per gli altri mock):
- i numeri dei grafici e delle tabelle sono quelli di `mock.data`, gli stessi
  usati per disegnarli (li legge da Node); per ogni asset si controlla anche
  che i numeri compaiano davvero come testo visibile nell'HTML del sito;
- ogni risposta è ricavata con un procedimento diverso dalla «via rapida»
  scritta nella soluzione (enumerazione di tutti i casi, ricerca per
  tentativi, simulazione);
- per la sufficienza dei dati si enumerano gli scenari compatibili con
  ciascuna affermazione e si guarda se la risposta è la stessa in tutti;
- per le proposizioni «sicuramente vere / false» si enumerano tutti i mondi
  compatibili con i dati;
- il numero di opzioni che coincidono con il valore calcolato deve essere
  esattamente 1, e deve essere quella indicata da `ans`.

Le domande verbali senza numeri (vero/falso/non ricavabile, rafforza /
indebolisce, regola, fattore) non si calcolano: qui sono controllati solo i
numeri che contengono; il resto è controllo di lettura (vedi l'elenco in fondo).

uso: python3 tools/check_math_14.py
"""
import itertools
import json
import math
import re
import subprocess
import sys
from datetime import date, timedelta
from fractions import Fraction as F
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

DUMP = r"""
const m = require(process.argv[1]);
console.log(JSON.stringify({
  data: m.data,
  q: m.questions.map(q => ({ n: q.n, area: q.area, ans: q.ans, opts: q.opts, asset: q.asset || '', lang: q.lang }))
}));
"""
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-14.js')],
                     capture_output=True, text=True, check=True).stdout
J = json.loads(raw)
D = J['data']
Q = {q['n']: q for q in J['q']}
L = 'ABCD'
errori, controllate = [], 0


def plain(s):
    return re.sub(r'<[^>]*>', '', str(s)).strip()


def num(s):
    """'+0,5%' → 0.5 ; '1.480 €' → 1480 ; 'about −6%' → −6 ; frazione HTML → Fraction"""
    fr = re.search(r'aria-label="(\d+) fratto (\d+)"', str(s))
    if fr:
        return F(int(fr.group(1)), int(fr.group(2)))
    t = plain(s).replace('−', '-').replace('–', '-')
    t = re.sub(r'(circa|about|km/h|km|€|%|anni|ore|giorni|\bs\b)', '', t).replace(' ', '')
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
    `predicati` è un dizionario {frammento caratteristico dell'opzione: vero/falso},
    così l'ordine delle opzioni nel mock non conta."""
    global controllate
    opts = Q[n]['opts']
    pos = {}
    for frag in predicati:
        trovate = [i for i, o in enumerate(opts) if frag in plain(o)]
        assert len(trovate) == 1, (n, frag, trovate)
        pos[frag] = trovate[0]
    assert len(pos) == len(opts) and len(set(pos.values())) == len(opts), (n, 'ogni opzione deve avere un predicato')
    veri = [pos[f] for f, p in predicati.items() if p]
    controllate += 1
    if len(veri) != 1:
        errori.append(f'n.{n}: {cosa} — {len(veri)} opzioni vere ({[L[i] for i in veri]}), ne serve esattamente 1')
    else:
        check_idx(n, veri[0], cosa)
        controllate -= 1  # una sola verifica contata


def check_assets(n, numeri):
    """ogni numero (già formattato) deve comparire nel testo visibile dell'asset"""
    global controllate
    controllate += 1
    testo = re.sub(r'<[^>]*>', ' ', Q[n]['asset'])
    for x in numeri:
        if not re.search(r'(?<![\d.,])' + re.escape(str(x)) + r'(?![\d])', testo):
            errori.append(f"n.{n}: il numero {x} non compare nell'asset mostrato")


def it(v, dec=None):
    s = f'{v:.{dec}f}' if dec is not None else str(v)
    return s.replace('.', ',')


# ---------------------------------------------------------------------------
# sufficienza dei dati: scenari compatibili con ciascuna affermazione
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
    c = criterio(scenari, valore, p1, p2)
    print(f'  n.{n}: criterio calcolato {c}')
    if c != atteso:
        errori.append(f'n.{n}: criterio calcolato {c}, atteso {atteso}')
    # posizione dell'opzione con quel criterio
    pos = [i for i, o in enumerate(Q[n]['opts']) if re.match(r'(Criterio|Criterion) ' + c + r' —', o)]
    check_idx(n, pos[0] if len(pos) == 1 else -1, f'criterio {c}')


# ---------------------------------------------------------------------------
# proposizioni «sicuramente vere / false» su un insieme di mondi
def esiti(mondi, props):
    r = []
    for p in props:
        v = {bool(p(m)) for m in mondi}
        r.append('V' if v == {True} else 'F' if v == {False} else '?')
    return r


def comb_text(sel):
    sel = [L[i] for i, x in enumerate(sel) if x]
    return {1: f'Solo la {sel[0]}' if sel else '', 2: f'Sia la {sel[0]} sia la {sel[1]}' if len(sel) == 2 else ''}.get(len(sel), '')


def check_dp(n, mondi, props, voluto):
    r = esiti(mondi, props)
    sel = [x == voluto for x in r]
    testo = comb_text(sel)
    idx = [i for i, o in enumerate(Q[n]['opts']) if o == testo]
    print(f'  n.{n}: esiti {r} → «{testo}»')
    check_idx(n, idx[0] if len(idx) == 1 else -1, f'proposizioni {voluto}: {testo}')


# ===========================================================================
# 1 — prezzo al chilo dei biscotti
v = (5.5 / 0.32) / (5 / 0.4) - 1
check_value(1, v * 100, 1e-6)

# 3 — DS: classe, n tra 21 e 29, resto 1 per 4
check_ds(3, 'D', range(1, 200), lambda n: n, lambda n: 20 < n < 30, lambda n: n % 4 == 1)

# 4 — tabella energia
E = D['energia']
A_ = E['solare'][4] > 2 * E['solare'][0]
B_ = all(E['eolico'][i + 1] > E['eolico'][i] for i in range(4))
tot22 = E['solare'][1] + E['eolico'][1] + E['idro'][1]
C_ = E['idro'][1] >= tot22 / 3
check_predicates(4, {'più che doppia': A_, 'in modo costante': B_, 'almeno un terzo': C_,
                     'Nessuna delle altre': not (A_ or B_ or C_)}, 'energia (doppio, costante, un terzo, nessuna)')
check_assets(4, [it(x, 1) for x in E['solare'] + E['eolico'] + E['idro']])

# 5 — spesa divisa: ricerca per tentativi su C
sol = [(c, b, a) for c in range(1, 331) for b in [F(8, 10) * c] for a in [F(3, 2) * b] if c + b + a == 330]
assert len(sol) == 1
check_value(5, float(sol[0][2]))
# esche: Anna = 1,5 C → C = 100, Anna 150
assert 100 + 80 + 150 == 330

# 7 — media ponderata inversa
w = [w for w in range(0, 91) if F(2200 * (90 - w) + 1600 * w, 90) == 1800]
assert w == [60]
check_idx(7, [num(o) == 60 for o in Q[7]['opts']].index(True), 'donne = 60')

# 9 — torta + informazioni extra
C9 = D['canali']
q9 = dict(C9['quote'])
tot25 = C9['onlineMln'] / (q9['Online'] / 100)
tot24 = tot25 / (1 + C9['aumentoTot'] / 100)
neg24 = tot24 * C9['quotaNegozi24'] / 100
neg25 = tot25 * q9['Negozi'] / 100
crescita = (neg25 / neg24 - 1) * 100
check_value(9, round(crescita), 1)
check_assets(9, [str(x[1]) + '%' for x in C9['quote']])

# 10 — DS: urna con 10 palline, P(stesso colore) < 1/2
def p_same(r, n=10):
    b = n - r
    return F(r * (r - 1) + b * (b - 1), n * (n - 1))
check_ds(10, 'A', range(0, 11), lambda r: p_same(r) < F(1, 2),
         lambda r: 4 <= r <= 6, lambda r: (10 - r) < r)

# 11 — luci: simulazione secondo per secondo
ripetute = sum(1 for t in range(1, 601) if t % 12 == 0 and t % 18 == 0 and t % 30 == 0)
check_value(11, ripetute)
assert 600 // 36 == 16 and 600 // 60 == 10 and 12 * 18 * 30 > 600

# 14 — club di pallavolo: tutte le assegnazioni di allenatori
S = D['club']['squadre']
mondi14 = []
for c in itertools.product([1, 2], repeat=3):
    if sum(c) == D['club']['allenatori'] and c[0] == c[1]:
        mondi14.append(c)
assert mondi14 == [(2, 2, 1)]
props14 = [
    lambda c: S[2][1] / c[2] > 15,
    lambda c: S[0][1] / c[0] > S[1][1] / c[1],
    lambda c: sum(s[1] for s in S) / sum(c) > 13,
    lambda c: all(S[i][1] < 25 for i in range(3) if c[i] == 2),
]
check_dp(14, mondi14, props14, 'V')

# 15 — gol: enumerazione di tutte le sequenze
seq = [s for s in set(itertools.permutations('CCCCOOO')) if s[0] == 'O']
n15 = len(seq)
def val_formula(s):
    e = re.sub(r'(\d+)!', lambda m: f'F({math.factorial(int(m.group(1)))})', s).replace('·', '*')
    return eval(e)
check_idx(15, [val_formula(o) == n15 for o in Q[15]['opts']].index(True) if sum(val_formula(o) == n15 for o in Q[15]['opts']) == 1 else -1,
          f'{n15} sequenze')

# 17 — musei: lavorare per differenza
M = D['musei']
c24 = M['tot24'] - M['A'][2] - M['B'][2]
tot25_m = M['tot24'] * (1 - M['caloTot'] / 100)
c25 = tot25_m - M['A'][3] - M['B'][3]
calo = (c24 - c25) / c24 * 100
hit = [abs(num(o) - calo) < 0.5 for o in Q[17]['opts']]
check_idx(17, hit.index(True) if sum(hit) == 1 else -1, f'calo del museo C {calo:.1f}%')
check_assets(17, [str(x) for x in M['A'] + M['B']])

# 18 — rimborso
benz = 12000 * 7 / 100 * 1.5
rimb = 12000 * 0.18
r18 = (rimb - benz) / benz * 100
hit = [abs(num(o) - r18) < 0.5 for o in Q[18]['opts']]
check_idx(18, hit.index(True) if sum(hit) == 1 else -1, f'rimborso oltre la spesa {r18:.1f}%')

# 19 — DS: parallelepipedo (dimensioni su una griglia fine di razionali per b)
scen19 = []
for k in range(1, 97):
    b = F(k, 4)
    a, c = 12 / b, 20 / b
    scen19.append((a, b, c))
check_ds(19, 'A', scen19, lambda s: s[0] * s[1] * s[2],
         lambda s: s[0] * s[2] == 15, lambda s: all(x.denominator == 1 for x in s))

# 21 — anagrammi di ESSERE
an = {p for p in itertools.permutations('ESSERE') if p[0] in 'SR' and p[-1] == 'E'}
check_value(21, len(an))

# 22 — percentuali di riga: conteggi
T = {t['c']: t for t in D['trasporti']}
cnt = lambda c, k: T[c]['n'] * T[c][k] / 100
check_predicates(22, {
    'automobilisti sono più numerosi': cnt('Napoli', 'auto') > cnt('Bologna', 'auto'),
    'altrettanti i lavoratori che vanno a piedi': cnt('Torino', 'piedi') == cnt('Bologna', 'piedi'),
    'ciclisti sono la metà': cnt('Torino', 'bici') == cnt('Bologna', 'bici') / 2,
    'meno di un quinto': cnt('Napoli', 'mp') < cnt('Torino', 'mp') / 5}, 'trasporti (conteggi)')
for t in D['trasporti']:
    assert t['auto'] + t['bici'] + t['mp'] + t['piedi'] == 100
check_assets(22, [f"{t[k]}%" for t in D['trasporti'] for k in ('auto', 'bici', 'mp', 'piedi')])

# 24 — parti inversamente proporzionali alle età
eta = [2, 4, 8]
pesi = [F(1, e) for e in eta]
parti = [63000 * p / sum(pesi) for p in pesi]
check_value(24, float(parti[0]))

# 25 — scaffale: tutte le disposizioni
G = ['gialli', 'saggi', 'fantasy', 'storia']
mondi25 = []
for p in itertools.permutations(range(1, 5)):
    pos = dict(zip(G, p))
    if pos['gialli'] == 1 or not pos['saggi'] > pos['storia'] or pos['fantasy'] != pos['gialli'] - 1:
        continue
    mondi25.append(pos)
print(f'  n.25: {len(mondi25)} disposizioni compatibili')
check_dp(25, mondi25, [lambda m: m['saggi'] == 3, lambda m: m['gialli'] > m['fantasy'],
                       lambda m: m['storia'] > m['gialli'], lambda m: m['fantasy'] == 4], 'F')

# 26 — regola di recesso (date)
cons_scarpe, cons_giacca, comunic = date(2026, 3, 3), date(2026, 3, 5), date(2026, 3, 15)
assert (comunic - cons_scarpe).days <= 14 and (comunic - cons_giacca).days <= 14
assert comunic + timedelta(days=14) == date(2026, 3, 29)

# 27 — sconti e coupon
L27 = (90 + 10) / (0.8 * 0.7)
vals = [num(o) for o in Q[27]['opts']]
assert [round(x) for x in vals] == [143, 161, 179, 200] or sorted(round(x) for x in vals) == [143, 161, 179, 200]
check_value(27, round(L27), 1.0)
# esche: senza coupon, coupon col segno sbagliato, sconti sommati
assert round(90 / 0.56) == 161 and round(80 / 0.56) == 143 and (90 + 10) / 0.5 == 200

# 28 — DS in inglese: cinque pacchi (pesi interi 1..24, multiset)
scen28 = [s for s in itertools.combinations_with_replacement(range(1, 25), 5)]
check_ds(28, 'C', scen28, lambda s: (max(s) - min(s)) > 2,
         lambda s: 11 in s and 14 in s,
         lambda s: sum(s) == 55 and min(s) < 9)

# 29 — Edilmar
assert (F(2, 3) * 90) >= 50

# 30 — estrazioni senza reinserimento
f1 = math.comb(5, 2) * math.comb(4, 1)
f2 = math.comb(4, 2) * math.comb(5, 1)
rapp = F(f1, f2)
check_idx(30, [num(o) == rapp for o in Q[30]['opts']].index(True), f'rapporto {rapp}')
# con reinserimento sarebbe 5/4
assert F(5, 9) ** 2 * F(4, 9) / (F(4, 9) ** 2 * F(5, 9)) == F(5, 4)

# 31 — celle mancanti: ricerca di tutte le tabelle compatibili
S31 = D['stab']
sol31 = []
for aP in range(0, 271):
    aN = S31['totRiga']['A'] - S31['noti']['A'][0] - aP
    if aN < 0:
        continue
    for bM in range(0, 241):
        bP = S31['totRiga']['B'] - bM - S31['noti']['B'][2]
        if bP < 0:
            continue
        # riga C nel rapporto 5:4:3, totale 240
        k = F(S31['totRiga']['C'], sum(S31['rapportoC']))
        if k.denominator != 1:
            continue
        cM, cP, cN = [int(k * x) for x in S31['rapportoC']]
        cols = [S31['noti']['A'][0] + bM + cM, aP + bP + cP, aN + S31['noti']['B'][2] + cN]
        if cols == S31['totTurno']:
            sol31.append({'A': [S31['noti']['A'][0], aP, aN], 'B': [bM, bP, S31['noti']['B'][2]], 'C': [cM, cP, cN]})
assert len(sol31) == 1, sol31
T31 = sol31[0]
assert T31 == {'A': S31['A'], 'B': S31['B'], 'C': S31['C']}
check_predicates(31, {
    'più pezzi di A e di C messi insieme': T31['B'][1] > T31['A'][1] + T31['C'][1],
    'A e C producono lo stesso numero': T31['A'][2] == T31['C'][2],
    'più di un terzo': T31['C'][0] > S31['totTurno'][0] / 3,
    'il doppio dei pezzi': T31['B'][0] == 2 * T31['B'][2]}, 'stabilimenti (tabella ricostruita)')

# 32 — Meridiana
perdita, svalut = 12, F(2, 3) * 12
assert perdita - svalut == 4 and round(300 / 0.96, 1) == 312.5 and 300 * 0.96 == 288

# 33 — crescita esponenziale
n_div = next(k for k in range(100) if 2 ** k >= 1_000_000)
minuti = n_div * 20
def minuti_da_testo(s):
    h = re.search(r'(\d+) ore', s); m_ = re.search(r'(\d+) minuti', s)
    return (int(h.group(1)) * 60 if h else 0) + (int(m_.group(1)) if m_ else 0)
check_idx(33, [minuti_da_testo(o) == minuti for o in Q[33]['opts']].index(True), f'{n_div} raddoppi = {minuti} minuti')

# 34 — DS: clienti agenzia viaggi (percentuali intere)
scen34 = [(v, h, e) for v in range(0, 101) for h in range(0, 101) for e in range(0, min(v, h) + 1)]
check_ds(34, 'B', scen34, lambda s: s[0] + s[1] - s[2],
         lambda s: s[0] == 40 and s[2] == 10, lambda s: s[1] == 30)

# 37 — barre di variazioni e addetti
V37 = D['vendite']
serie = [V37['gen']]
for p in V37['var']:
    serie.append(serie[-1] * (100 + p) / 100)
assert serie == [200, 250, 200, 240, 180, 270]
add = V37['addetti']
per_add = serie[-1] / add[-1] / (serie[0] / add[0]) - 1
check_value(37, round(per_add * 100, 6))
assert sum(V37['var']) == 50 and serie[-1] / serie[0] == 1.35 and serie[-1] / 10 / 25 == 1.08
check_assets(37, [('+' if p > 0 else '−') + str(abs(p)) + '%' for p in V37['var']])

# 38 — survey
assert 800 * 0.35 * 0.60 >= 150

# 39 — stipendio netto
v39 = (1.10 * 0.75) / 0.80 - 1
hit = [abs(num(o) - v39 * 100) < 0.5 for o in Q[39]['opts']]
check_idx(39, hit.index(True) if sum(hit) == 1 else -1, f'netto {v39 * 100:.2f}%')

# 40 — ristorante
comune = 6 * 2 + (30 + 6 * 15) * 1.10
quota = comune / 6 + 20 / 5
hit = [abs(num(o) - quota) < 1e-9 for o in Q[40]['opts']]
check_idx(40, hit.index(True) if sum(hit) == 1 else -1, f'quota {quota}')
assert abs((comune + 20) / 6 - 27.33) < 0.01 and (comune - 12) / 6 + 4 == 26  # esche

# 41 — ore di lavoro: tutte le quaterne
mondi41 = [c for c in itertools.combinations(range(20, 41), 4) if sum(c) == 120]
srt = lambda c: sorted(c)
check_dp(41, mondi41, [lambda c: max(c) >= 32, lambda c: min(c) <= 27, lambda c: 30 in c,
                       lambda c: srt(c)[-1] + srt(c)[-2] >= 63], 'V')

# 42 — comitato con vincolo e ruoli
Anna, Bruno = 0, 1
comitati = [c for c in itertools.combinations(range(7), 3) if not (Anna in c and Bruno in c)]
check_idx(42, [o == f'{len(comitati)}; {math.factorial(3)}' for o in Q[42]['opts']].index(True), f'{len(comitati)}; 6')

# 43 — mutui (numeri)
assert round(5.6 - 2.1, 1) == 3.5 and round(4.9 - 2.8, 1) == 2.1

# 44 — DS: interi con prodotto 12 (anche negativi)
scen44 = [(a, b) for a in range(-12, 13) for b in range(-12, 13) if a * b == 12]
check_ds(44, 'B', scen44, lambda s: s[0] + s[1], lambda s: s[0] - s[1] == 1, lambda s: s[0] > 0)

# 45 — monete: enumerazione
mon = [(n1, n2, n5) for n5 in range(0, 41) for n2 in range(0, 41) for n1 in range(0, 41)
       if n1 + n2 + n5 == 40 and n1 + 2 * n2 + 5 * n5 == 100 and n2 == 2 * n5]
assert len(mon) == 1
check_value(45, mon[0][1] * 2)

# 47 — circolo: mondi compatibili (quanti anziani e quanti nuovi partecipano)
mondi47 = [(po, pn) for po in range(0, 31) for pn in range(0, 11)
           if po + pn == 12 and pn == 0]          # «unicamente»: i nuovi non possono partecipare
props47 = [
    lambda m: m[0] == 30,                                      # A: tutti gli anziani partecipano
    lambda m: 30 - m[0] >= 18,                                 # B: non partecipanti anziani ≥ 18
    lambda m: m[1] >= 1,                                       # C: almeno un nuovo partecipa
    lambda m: (m[0] + m[1]) < 30 / 2                           # D: partecipanti < metà degli anziani
]
check_dp(47, mondi47, props47, 'F')

# 48 — resti
sol48 = [n for n in range(1, 50) if n % 3 == 2 and n % 5 == 4]
check_idx(48, 3 if len(sol48) > 1 else [num(o) == sol48[0] for o in Q[48]['opts']].index(True), f'soluzioni {sol48}')

# 49 — età media: la risposta dipende da n
nuove = {41 + n for n in range(1, 60)}
assert len(nuove) > 1
check_idx(49, 3, 'età del nuovo socio dipende da n → non determinabile')
for nn in (1, 10, 40):
    assert 41 * (nn + 1) - 40 * nn == 41 + nn

# ---- verbale con numeri e verifiche di coerenza sulle opzioni ----
assert 6.7 - 6.3 == 0.4 or abs(6.7 - 6.3 - 0.4) < 1e-9                       # n.20
assert 1.11 / 1.14 < 1 and 5.7 > 2.1                                           # n.13
assert F(2, 3) < 1 and 1 - F(2, 3) < F(1, 2)                                   # n.6

# ---- esito ----
print()
if errori:
    print('ERRORI:')
    for e in errori:
        print('  ×', e)
    sys.exit(1)

# riepilogo chiave
chiave = ''.join(L[Q[n]['ans']] for n in sorted(Q))
print(f'{controllate} verifiche numeriche/logiche superate: la chiave coincide con i calcoli.')
print('Chiave (posizione A–D, VFN a 3 opzioni incluse):', chiave)
da_mano = [2, 8, 12, 16, 23, 26, 29, 35, 36, 38, 46, 50, 6, 13, 20, 32, 43]
print('Domande verbali controllate a mano (testo/logica, senza calcoli):', sorted(da_mano))
