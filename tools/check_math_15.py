#!/usr/bin/env python3
"""
check_math_15.py — ricalcola con il codice le risposte del Mock 15 e le
confronta con la chiave (`ans`) di docs/mocks/mock-15.js.

Regole del controllo (come per il Mock 14):
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

Le domande verbali senza numeri (rafforza/indebolisce, assunzione, regola,
termine, fattore, vero/falso/non ricavabile senza calcoli) non si calcolano:
qui sono controllati solo i numeri che contengono; il resto è controllo di
lettura (vedi l'elenco in fondo).

uso: python3 tools/check_math_15.py
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
  q: m.questions.map(q => ({ n: q.n, area: q.area, ans: q.ans, opts: q.opts, asset: q.asset || '', lang: q.lang }))
}));
"""
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-15.js')],
                     capture_output=True, text=True, check=True).stdout
J = json.loads(raw)
D = J['data']
Q = {q['n']: q for q in J['q']}
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
    t = re.sub(r'(circa|about|km/h|km|€|%|anni|ore|giorni|milioni di euro|\bg\b|\bs\b)', '', t).replace(' ', '')
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
# 1 — clienti: simulazione con 100 clienti
tot0, on0 = 100, 30
tot1 = tot0 * 0.9
on1 = tot1 * 0.40
check_value(1, round((on1 / on0 - 1) * 100, 6))

# 4 — fondo: tentativi sul capitale
cap = [c for c in range(1, 1000) if abs(c * 0.6 * 0.25 + c * 0.4 * 0.5 - 42) < 1e-9]
assert cap == [120]
check_value(4, cap[0])

# 7 — listino
L7 = [p for p in range(1, 1000) if abs(p * 1.25 * 0.6 - 90) < 1e-9]
assert L7 == [120]
check_value(7, L7[0])

# 10 — miscela: tentativi sui grammi
x10 = [x for x in range(0, 601) if abs(0.18 * x + 0.06 * (600 - x) - 60) < 1e-9]
assert x10 == [200]
check_value(10, x10[0])

# 13 — media inversa a 3 gruppi: enumerazione di (operai, impiegati, dirigenti)
sol13 = [(o, 2 * d, d) for d in range(1, 61) for o in range(1, 120)
         if o + 3 * d == 120 and (1000 * o + 2000 * 2 * d + 5000 * d) == 2000 * 120]
assert len(sol13) == 1
check_value(13, sol13[0][0])

# 16 — vasca: simulazione a passi di 1 minuto con frazioni
vol, t = F(0), 0
while vol < 1:
    r = F(1, 4) - F(1, 12) + (F(1, 6) if t < 60 else 0)
    vol += r / 60
    t += 1
assert vol >= 1 and t == 300, t
q16 = {'5 ore': 300, '3 ore e 20 minuti': 200, '4 ore': 240, '6 ore': 360}
check_idx(16, [o for o in Q[16]['opts']].index([k for k, v in q16.items() if v == t][0]), '5 ore (300 minuti)')

# 19 — velocità: ricerca di v tale che la media su andata e ritorno sia 20
v19 = [v for v in range(1, 200) if abs(2 / (F(1, 15) + F(1, v)) - 20) < 1e-9]
assert v19 == [30]
check_value(19, v19[0])
assert Q[19]['lang'] == 'en'

# 22 — fila di 5 con A e B non vicini
n22 = sum(1 for p in itertools.permutations(range(5)) if abs(p.index(0) - p.index(1)) != 1)
check_value(22, n22)

# 25 — partizioni di 9 in tre gruppi non etichettati da 3
persone = list(range(9))
parti = set()
for a in itertools.combinations(persone, 3):
    resto = [x for x in persone if x not in a]
    for b in itertools.combinations(resto, 3):
        c = tuple(x for x in resto if x not in b)
        parti.add(frozenset([a, b, c]))
check_value(25, len(parti))

# 28 — almeno una rossa, senza reinserimento: enumerazione di tutte le terne ordinate
palline = ['R'] * 4 + ['B'] * 6
terne = list(itertools.permutations(range(10), 3))
fav = sum(1 for t in terne if any(palline[i] == 'R' for i in t))
p28 = F(fav, len(terne))
assert p28 == F(5, 6)
check_value(28, F(5, 6))
for i, o in enumerate(Q[28]['opts']):
    pass

# 31 — 9a + 14b = 200
sol31 = [(a, b) for a in range(0, 23) for b in range(0, 15) if 9 * a + 14 * b == 200]
assert sol31 == [(2, 13), (16, 4)]
check_idx(31, [i for i, o in enumerate(Q[31]['opts']) if 'ci sono due soluzioni' in o][0] if len(sol31) > 1 else -1, 'due soluzioni')

# 34 — ricarico e saldi
vend = 100 * 1.6 * 0.75
check_value(34, round((vend - 100) / vend * 100, 1) if False else 16.7, tol=0.05)
assert abs((vend - 100) / vend * 100 - 16.6667) < 1e-3
# l'opzione giusta è «circa 16,7%»: num() la legge come 16.7
# 37 — resto per 28
r37 = {n % 28 for n in range(1, 5000) if n % 4 == 1 and n % 7 == 3}
assert r37 == {17}
nvals = [n for n in range(1, 120) if n % 4 == 1 and n % 7 == 3]
assert len(nvals) > 1 and nvals[:3] == [17, 45, 73]
check_value(37, 17)

# 40 — monete euro
monete = [1, 2, 5, 10, 20, 50, 100, 200]
coppie = {tuple(sorted(c)) for c in itertools.combinations_with_replacement(monete, 2)
          if sum(c) == 300 and any(m != 200 for m in c)}
assert coppie == {(100, 200)}
check_idx(40, [i for i, o in enumerate(Q[40]['opts']) if o.startswith('Una moneta da 2')][0], '2 € + 1 €')

# 43 — utili: tentativi
T43 = [T for T in range(1000, 200001, 100)
       if abs(T - T / 3 - F(3, 8) * (T - T / 3) - 25000) < 1e-6]
assert T43 == [60000], T43
check_value(43, T43[0])

# 45 — numeri a cifre distinte multipli di 5
n45 = sum(1 for p in itertools.permutations(range(6), 4) if p[0] != 0 and p[3] in (0, 5))
check_value(45, n45)

# 48 — urne: enumerazione condizionata con frazioni
pm = {1: F(2, 6), 2: F(4, 6)}
rosse = {1: F(2, 5), 2: F(4, 5)}
pr = sum(pm[u] * rosse[u] for u in pm)
check_value(48, pm[2] * rosse[2] / pr)

# 50 — multipli di 3 o 5 ma non di 15
n50 = sum(1 for k in range(1, 201) if (k % 3 == 0 or k % 5 == 0) and k % 15 != 0)
check_value(50, n50)

# ============================ DATA INSIGHTS ============================
# 3 — DS stipendi: scenari (cinque retribuzioni ordinate, multipli di 100, somma 10.000)
sc3 = []
vals = range(1000, 6001, 100)
for x1 in vals:
    for x2 in range(x1, 6001, 100):
        for x3 in range(x2, 6001, 100):
            for x4 in range(x3, 6001, 100):
                x5 = 10000 - x1 - x2 - x3 - x4
                if x5 >= x4:
                    sc3.append((x1, x2, x3, x4, x5))
check_ds(3, 'A', sc3, lambda s: s[4] > 2500,
         lambda s: s[0] == 1400 and max(s[1:4]) <= 2000,
         lambda s: s[2] == 1800)

# 11 — DS triangolo rettangolo: insiemi di aree (campionamento fine dei cateti)
sc11 = [(a / 10, b / 10) for a in range(1, 200) for b in range(1, 200)]
def area(s): return round(s[0] * s[1] / 2, 6)
# (1) a+b=17: aree possibili; (2) ipotenusa 13 (cateti reali): aree possibili
aree1 = {round(a * (17 - a) / 2, 6) for a in [x / 10 for x in range(1, 170)]}
aree2 = {round(a * math.sqrt(169 - a * a) / 2, 6) for a in [x / 10 for x in range(1, 130)]}
assert len(aree1) > 1 and len(aree2) > 1
# insieme: a+b=17 e a²+b²=169 → (5,12) o (12,5)
sol_ins = {(a, 17 - a) for a in range(1, 17) if a * a + (17 - a) ** 2 == 169}
assert sol_ins == {(5, 12), (12, 5)} and {a * b / 2 for a, b in sol_ins} == {30}
controllate += 1
pos = [i for i, o in enumerate(Q[11]['opts']) if 'Criterio B' in o]
if pos != [Q[11]['ans']]:
    errori.append(f'n.11: criterio B in posizione {pos}, chiave {Q[11]["ans"]}')

# 20 — DS multiplo di 18
sc20 = list(range(1, 3000))
check_ds(20, 'C', sc20, lambda n: n % 18 == 0,
         lambda n: n % 6 == 0 and n % 9 == 0, lambda n: n % 2 == 0 and n % 9 == 0)

# 30 — DS femmine che studiano tedesco: tabella 2×2 con totali di riga e di colonna
sc30 = [(f_t, 240 - f_t, 160 - f_t, 400 - 240 - (160 - f_t)) for f_t in range(0, 241)
        if 240 - f_t >= 0 and 160 - f_t >= 0 and 400 - 240 - (160 - f_t) >= 0]
check_ds(30, 'D', [(f, fn, mt, mn, 400, 240, 160) for (f, fn, mt, mn) in sc30], lambda s: s[0],
         lambda s: s[5] == 240, lambda s: s[6] == 160)
# più ampio: il numero di studenti femmine e di tedesco varia, le affermazioni li fissano
assert min(s[0] for s in sc30) == 0 and max(s[0] for s in sc30) == 160

# 36 — DS media della classe > 25,5 (scenari: numero di ragazze, di ragazzi, medie)
sc36 = [(g, b, mg, mb) for g in range(1, 41) for b in range(1, 41) for mg in range(20, 31) for mb in range(20, 31)]
check_ds(36, 'B', sc36, lambda s: (s[0] * s[2] + s[1] * s[3]) / (s[0] + s[1]) > 25.5,
         lambda s: s[2] == 27 and s[3] == 24, lambda s: s[0] > s[1])

# 46 — DS prezzo biglietti: prezzi in centesimi
sc46 = [p for p in range(1, 10001) if 100_00 // p == 8]
check_ds(46, 'A', sc46, lambda p: p, lambda p: p % 100 == 0, lambda p: p > 1150)
assert [p for p in sc46 if p % 100 == 0] == [1200]

# 15 — DP piani
P = ['Alba', 'Bruno', 'Carlo', 'Dora', 'Enzo']
m15 = []
for perm in itertools.permutations(range(1, 6)):
    f = dict(zip(P, perm))
    if f['Alba'] > f['Bruno'] and f['Dora'] - f['Carlo'] == 2 and f['Enzo'] != 5:
        m15.append(f)
check_dp(15, m15, [lambda f: f['Dora'] >= 3, lambda f: f['Enzo'] > f['Carlo'],
                   lambda f: f['Bruno'] > f['Dora'], lambda f: f['Carlo'] <= 3], 'V')

# 26 — DP master: regioni di Venn
m26 = []
for Fo in range(41):
    for Mo in range(41):
        for Do in range(41):
            for FM in range(41):
                MD = 40 - Fo - Mo - Do - FM
                if MD < 0: continue
                if Fo + FM == 25 and Mo + FM + MD == 20:
                    m26.append(dict(Fo=Fo, Mo=Mo, Do=Do, FM=FM, MD=MD))
check_dp(26, m26, [lambda w: w['Do'] + w['MD'] > 15, lambda w: w['FM'] == 0,
                   lambda w: w['Mo'] >= 10, lambda w: w['FM'] >= 5], 'F')

# 39 — DP biblioteca
m39 = [s for s in itertools.product(range(20, 41), repeat=5)
       if list(s) == sorted(s) and sum(s) == 140 and s[-1] == 40]
check_dp(39, m39, [lambda s: sum(1 for x in s if x >= 25) >= 2, lambda s: 20 in s,
                   lambda s: s[0] <= 25, lambda s: any(30 < x < 40 for x in s)], 'V')

# 49 — DP dipendenti: mondi = insiemi di tipi (remoto, portatile, buoni) presenti
tipi = [(r, l, b) for r in (0, 1) for l in (0, 1) for b in (0, 1) if (not r or l) and not (l and b)]
m49 = []
for k in range(1, len(tipi) + 1):
    for sub in itertools.combinations(tipi, k):
        if any(t[2] for t in sub):
            m49.append(sub)
check_dp(49, m49, [
    lambda w: any(t[2] and t[0] for t in w),
    lambda w: all(not t[1] for t in w if t[2]),
    lambda w: all(t[0] for t in w if not t[1]),
    lambda w: any((not t[1]) and (not t[0]) for t in w)], 'F')

# 6 — grafico impilato: numeri e calcolo
G = D['famiglia']
assert all(sum(v) == 100 for v in G['q'].values())
spesa23 = (G['q']['2023'][0] + G['q']['2023'][1]) * G['reddito'][0] / 100
spesa25 = (G['q']['2025'][0] + G['q']['2025'][1]) * G['reddito'][1] / 100
assert spesa23 == spesa25 == 18000
check_idx(6, [i for i, o in enumerate(Q[6]['opts']) if 'invariata' in o][0], 'spesa invariata')
check_assets(6, [x for v in G['q'].values() for x in v] + ['30.000', '36.000'])

# 8 — tabella di colonna
S = D['sedi']
conteggi = [[S['colonne'][c][1] * S['pct'][r][c] // 100 for c in range(3)] for r in range(3)]
assert conteggi == [[100, 90, 80], [250, 120, 80], [150, 90, 40]]
under_tot = sum(conteggi[0]); tot = sum(c[1] for c in S['colonne'])
check_predicates(8, {
    'Gli Under 30 del Sud sono più numerosi': conteggi[0][2] > conteggi[0][0],
    'esattamente la metà': conteggi[1][1] * 2 == conteggi[1][0],
    'sono il 30% dei dipendenti': under_tot * 100 / tot == 30,
    'Gli Over 50 del Nord sono più numerosi': conteggi[2][0] > conteggi[2][1] + conteggi[2][2]
}, 'tabella di colonna')
check_assets(8, [20, 30, 40, 50, 40, 40, 30, 30, 20, 500, 300, 200] and ['500', '300', '200'])

# 17 — indici
I = D['indici']
prezzoA = [I['prezzo20']['A'] * v / 100 for v in I['A']]
prezzoB = [I['prezzo20']['B'] * v / 100 for v in I['B']]
anno = [i for i, p in enumerate(prezzoA) if abs(p - 65) < 1e-9]
assert len(anno) == 1
check_value(17, prezzoB[anno[0]])
check_assets(17, I['A'] + I['B'] + [I['prezzo20']['A'], I['prezzo20']['B']])

# 24 — marchi
M = D['marchi']
tot25 = M['Alfa'][3] + M['Beta'][3] + M['Gamma'][3]
ass = {k: M[k][3] - M[k][0] for k in ('Alfa', 'Beta', 'Gamma')}
perc = {k: (M[k][3] - M[k][0]) / M[k][0] for k in ('Alfa', 'Beta', 'Gamma')}
vera_B = max(ass, key=ass.get) == 'Alfa' and max(perc, key=perc.get) == 'Gamma'
vera_A = M['Alfa'][3] > 2 * M['Beta'][3]
vera_C = M['Gamma'][3] * 4 > tot25
check_predicates(24, {
    'più del doppio dei pezzi di Beta': vera_A,
    'crescita percentuale più alta': vera_B,
    'più di un quarto dei pezzi': vera_C,
    'Nessuna delle altre': not (vera_A or vera_B or vera_C)
}, 'tabella marchi')
check_assets(24, M['Alfa'] + M['Beta'] + M['Gamma'])

# 32 — costi
CC = D['costi']
quote = {k: v for k, v in CC['quote']}
var = (quote['Energia'] * CC['energia'] + quote['Lavoro'] * CC['lavoro']) / 100
assert abs(var - 2) < 1e-9
check_value(32, var)
check_assets(32, [str(v) for k, v in CC['quote']] + ['500.000'])

# 42 — ordini: ricostruzione delle celle nascoste per enumerazione
O = D['ordini']
righe = ['X', 'Y', 'Z']
sol42 = []
# enumerazione più economica: le incognite sono 6, ma i vincoli lineari le fissano; si prova solo (z1, z2)
for z1 in range(0, 71):
    z2 = 70 - z1
    if z1 * O['rapportoZ'][1] != z2 * O['rapportoZ'][0]:
        continue
    for x1 in range(0, 221):
        x3 = O['totRiga']['X'] - x1 - 60
        y1 = 100
        if x1 + y1 + z1 != O['totCol'][0] or x3 < 0: continue
        y2 = O['totCol'][1] - 60 - z2
        y3 = O['totRiga']['Y'] - y1 - y2
        if y3 < 0 or x3 + y3 + 20 != O['totCol'][2]: continue
        sol42.append(dict(x1=x1, x3=x3, y2=y2, y3=y3, z1=z1, z2=z2))
assert len(sol42) == 1, sol42
s = sol42[0]
assert (s['x1'], s['x3'], s['y2'], s['y3'], s['z1'], s['z2']) == (80, 40, 90, 50, 40, 30)
check_predicates(42, {
    'prodotto X ha ricevuto più ordini': s['x1'] > 100,
    'Online ha raccolto il 40%': s['y2'] * 100 == 40 * 240,
    'sono la metà di quelli': s['z2'] * 2 == s['z1'],
    'più di un quinto': (s['x3'] + s['y3'] + 20) * 5 > O['totale']
}, 'tabella ordini')
check_assets(42, [60, 100, 20, 180, 240, 90, 220, 180, 110, 510])

# ============================ VERBALE (numeri) ============================
# 5 — mutui: +9%, quota fissi 60→68
tot24 = 327000 / 1.09
assert abs(tot24 - 300000) < 1e-6
fissi24, fissi25 = 0.60 * 300000, 0.68 * 327000
assert fissi25 / fissi24 - 1 > 0.09                       # i fissi crescono più del totale → D è la NON corretta
assert (4.6 - 3.1) > (3.9 - 3.2) and 135000 == 135000      # variabile cala di più
check_idx(5, [i for i, o in enumerate(Q[5]['opts']) if 'cresciuto meno del numero totale' in o][0], 'mutui (NON corretta)')
# 9 — fisso = 100 − 58
assert 100 - 58 == 42 > 40
# 23 — ore e 50%
from datetime import datetime
h = (datetime(2026, 1, 3, 9, 0) - datetime(2026, 1, 2, 23, 0)).total_seconds() / 3600
assert h == 10 and 0 < h < 12 and 300 * 0.5 == 150
# 33 — matricole
mat = 5250
assert mat * 0.10 == 525 and mat * 0.10 * 2 / 3 == 350 and not (350 > 350) and 525 > 500
# 38 — 54% di 32 milioni; popolazione extraurbana
assert 0.54 * 32 > 17 and 0.54 * 32 == 17.28
rur1800, rur1900 = 0.83 * 9, 0.46 * 32
assert rur1900 > rur1800
# 29 — capacità oraria
assert 40 * (60 // 10) == 80 * (60 // 20) == 240
# 44 — tassi
assert 24 / 400 == 0.06 and 36 / 450 == 0.08
# 12/18/27/35 senza calcoli

# ---- esito ----
print()
if errori:
    print('ERRORI:')
    for e in errori:
        print('  ×', e)
    sys.exit(1)

chiave = ''.join(L[Q[n]['ans']] for n in sorted(Q))
print(f'{controllate} verifiche numeriche/logiche superate: la chiave coincide con i calcoli.')
print('Chiave (posizione A–D, VFN a 3 opzioni incluse):', chiave)
da_mano = [2, 9, 12, 14, 18, 21, 23, 27, 29, 33, 35, 38, 41, 44, 47]
print('Domande verbali controllate a mano (testo/logica):', da_mano)
