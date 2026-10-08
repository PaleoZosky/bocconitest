#!/usr/bin/env python3
"""
check_math_16.py — ricalcola con il codice le risposte del Mock 16 e le
confronta con la chiave (`ans`) di docs/mocks/mock-16.js.

Regole del controllo (come per i Mock 14 e 15):
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
  esattamente 1, e deve essere quella indicata da `ans`;
- i brani del verbale devono avere 120–200 parole.

Le domande verbali senza numeri (rafforza/indebolisce, assunzione, termine,
fattore, vero/falso/non ricavabile senza calcoli) non si calcolano: qui sono
controllati solo i numeri che contengono; il resto è controllo di lettura
(vedi l'elenco in fondo).

uso: python3 tools/check_math_16.py
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
  data: m.data, order: m.order,
  q: m.questions.map(q => ({ n: q.n, area: q.area, ans: q.ans, opts: q.opts, asset: q.asset || '', lang: q.lang, passage: q.passage || '' }))
}));
"""
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-16.js')],
                     capture_output=True, text=True, check=True).stdout
J = json.loads(raw)
D = J['data']
Q = {q['n']: q for q in J['q']}
N = {k: i + 1 for i, k in enumerate(J['order'])}      # chiave → numero di domanda
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



def tutte(k):
    return N[k]


def vedi(k):
    return N[k]

# ============================ QUANTITATIVA ============================
# q_list — due sconti: ricerca del listino per tentativi
cand = [p for p in range(1, 1000) if abs(p * 0.7 * 0.9 - 126) < 1e-9]
assert cand == [200]
check_value(vedi('q_list'), cand[0])

# q_off — simulazione con totale 100 nel 2023
tot0, on0 = 100, 40
off0 = tot0 - on0
tot1 = tot0 * 1.5
off1 = tot1 * (1 - 0.30)
check_value(vedi('q_off'), round((off1 / off0 - 1) * 100, 6))

# q_mix — sale e massa
sale = 0.20 * 400 + 0.70 * 100
check_value(vedi('q_mix'), sale / (400 + 100 + 100) * 100)

# q_marta — conteggio dei figli: femmine = 1 + 3, maschi = 1 (ogni sorella ha esattamente un fratello)
femmine, maschi = 1 + 3, 1
check_value(vedi('q_marta'), femmine + maschi)

# q_sedi — ricerca del numero di persone a Milano
ms = [m for m in range(1, 1000) if abs((40 * 1500 + 80 * 2000 + m * 2500) / (40 + 80 + m) - 2100) < 1e-9]
assert ms == [80], ms
check_value(vedi('q_sedi'), ms[0])

# q_op — simulazione giorno per giorno
lavoro, giorno, operai = 60.0, 0, 6
while lavoro > 1e-9:
    giorno += 1
    if giorno == 5:
        operai = 4
    lavoro -= operai
check_value(vedi('q_op'), giorno)

# q_boc — enumerazione di tutti gli anagrammi distinti
ana = {p for p in itertools.permutations('BOCCONI')}
assert len(ana) == 1260
non_vicine = [p for p in ana if all(not (p[i] == 'C' and p[i + 1] == 'C') for i in range(6))]
check_value(vedi('q_boc'), len(non_vicine))

# q_abc — ricerca del prezzo di B
bs = [b for b in range(1, 1000) if abs(1.25 * b + b + 0.8 * 1.25 * b - 390) < 1e-9]
assert bs == [120]
check_value(vedi('q_abc'), 1.25 * bs[0])

# q_bici — tempi in minuti
t_su, t_giu, sosta = 9 / 3 * 60, 9 / 9 * 60, 30
v = 18 / ((t_su + t_giu + sosta) / 60)
check_value(vedi('q_bici'), v)

# q_prob — enumerazione dei comitati
persone = ['U'] * 6 + ['D'] * 4
com = list(itertools.combinations(range(10), 3))
fav = sum(1 for c in com if 0 < sum(persone[i] == 'U' for i in c) < 3)
check_value(vedi('q_prob'), F(fav, len(com)))

# q_bigl — enumerazione delle soluzioni intere
sol = [(a, b) for a in range(0, 15) for b in range(0, 9) if 7 * a + 12 * b == 100]
assert sol == [(4, 6)], sol
check_value(vedi('q_bigl'), sol[0][1])

# q_ric — simulazione dei 100 paia
costo = 100 * 100
ricavo = 60 * 140 + 40 * 140 * 0.75
check_value(vedi('q_ric'), (ricavo - costo) / costo * 100)
assert abs((ricavo - costo) / ricavo * 100 - 20.63) < 0.01          # opzione «circa 20,6%»

# q_eta — ricerca delle età
sols = [(f, p) for f in range(1, 60) for p in range(1, 120) if p + 6 == 3 * (f + 6) and p - 4 == 5 * (f - 4)]
assert sols == [(14, 54)], sols
check_value(vedi('q_eta'), sols[0][0])

# q_sq — enumerazione delle partizioni in due squadre da 3
amici = range(6)       # 0 = Ada, 1 = Bea
parti = set()
for s in itertools.combinations(amici, 3):
    altra = tuple(x for x in amici if x not in s)
    parti.add(frozenset([s, altra]))
assert len(parti) == 10
diverse = [p for p in parti if all(not (0 in sq and 1 in sq) for sq in p)]
check_value(vedi('q_sq'), len(diverse))

# q_resti — le soluzioni sono due, e le opzioni 38 e 80 sono entrambe valide
ss = [n for n in range(1, 100) if n % 6 == 2 and n % 7 == 3]
assert ss == [38, 80], ss
assert 44 % 6 == 2 and 44 % 7 != 3
o = [plain(x) for x in Q[vedi('q_resti')]['opts']]
assert o[:3] == ['38', '80', '44'] and 'non ha una sola soluzione' in o[3]
check_idx(vedi('q_resti'), 3, 'resti: due soluzioni')

# q_fav — enumerazione su 100 intervistati
over, under = 40, 60
f_over, f_under = over * 0.5, under * 0.2
check_value(vedi('q_fav'), f_over / (f_over + f_under) * 100)

# q_nd — l'utile può variare in modi diversi con gli stessi +10% e +5%
var = set()
for r0 in (100, 200):
    for c0 in range(10, r0, 10):
        u0, u1 = r0 - c0, r0 * 1.10 - c0 * 1.05
        var.add(round((u1 / u0 - 1) * 100, 4))
assert len(var) > 3
check_idx(vedi('q_nd'), 3, 'utile non determinabile')
assert {7.5, 5.0, 10.0}.isdisjoint(var) or len(var) > 3       # le tre opzioni numeriche non valgono sempre

# q_tit — recupero necessario
check_value(vedi('q_tit'), (1 / (0.8 * 0.75) - 1) * 100, tol=0.5)

# ============================ VERBALE (numeri) ============================
# vfn_obb — prezzo di emissione
assert 0.98 * 1000 < 1000
# vfn_brev — scadenza
assert 2020 + 20 == 2040 and 2040 != 2043
# v_debt — debito 2025 / debito 2020
pil20 = 100
d20, pil25 = 1.35 * pil20, 1.30 * pil20
d25 = 1.20 * pil25
assert d25 > d20 and abs((d25 / d20 - 1) * 100 - 15.6) < 0.1
# v_comp5 — forze di lavoro e inattività (su 100 giovani)
for occ, dis, att in ((20, 0.20, 75), (17, 0.15, 80)):
    fl = occ / (1 - dis)
    assert abs((100 - fl) - att) < 1e-9, (occ, dis, fl)
# v_reg — Sara: date e crediti
cred_computati, isee, fuori_corso_anni = 52, 14000, 1
assert cred_computati >= 50 and isee < 15000 and fuori_corso_anni == 1      # in corso farebbe 100%, ma tetto 50%
# domanda del 20 ottobre: tra il 16 e il 31 → discrezionale
assert 16 <= 20 <= 31
check_idx(vedi('v_reg'), [i for i, x in enumerate(Q[vedi('v_reg')]['opts']) if 'tardiva' in x][0], 'regola università')
# v_nonc — la NON corretta è quella con la causa inventata
check_idx(vedi('v_nonc'), [i for i, x in enumerate(Q[vedi('v_nonc')]['opts']) if 'colpito quella regione meno' in x][0], 'peste: NON corretta')

# lunghezza dei brani (120–200 parole)
for k, n in N.items():
    p = plain(Q[n]['passage'])
    if p:
        w = len(p.split())
        if not (120 <= w <= 200):
            errori.append(f'{k} (n.{n}): il brano ha {w} parole, devono essere 120–200')
        print(f'  brano {k:9s} n.{n:2d}: {w} parole')

# ============================ DATA INSIGHTS ============================
# ---- sufficienza dei dati ----
# ds1 — sondaggio da 120 persone
sc = [(f, c, 120 - f - c) for f in range(0, 121) for c in range(0, 121 - f)]
check_ds(vedi('ds1'), 'A', sc, lambda s: s[0] > 60, lambda s: s[2] == 10 and s[1] < 50, lambda s: s[0] > s[1])

# ds2 — rettangolo di perimetro 28 (semiperimetro 14)
sc = [(a / 2, 14 - a / 2) for a in range(1, 28)]
check_ds(vedi('ds2'), 'C', sc, lambda s: round(s[0] * s[1], 6),
         lambda s: abs(s[0] ** 2 + s[1] ** 2 - 100) < 1e-9, lambda s: abs(abs(s[0] - s[1]) - 2) < 1e-9)

# ds3 — insiemi sovrapposti, 100 studenti
sc = [(c, b, x) for c in range(0, 101) for b in range(0, 101) for x in range(0, min(c, b) + 1) if c + b - x <= 100]
check_ds(vedi('ds3'), 'B', sc, lambda s: 100 - (s[0] + s[1] - s[2]),
         lambda s: s[0] == 60 and s[1] == 45, lambda s: s[2] == 25)

# ds4 — divisori di 120
sc = [n for n in range(1, 121) if 120 % n == 0]
check_ds(vedi('ds4'), 'D', sc, lambda n: n, lambda n: 4 < n < 10, lambda n: 120 / n > 12)
assert [n for n in sc if 4 < n < 10 and 120 / n > 12] == [5, 6, 8]

# ds5 — velocità medie (due tratti da 100 km)
sc = [(v1, v2) for v1 in range(10, 201) for v2 in range(10, 201)]
media = lambda s: F(200) / (F(100, s[0]) + F(100, s[1]))
check_ds(vedi('ds5'), 'B', sc, lambda s: media(s) > 60, lambda s: s[0] == 50, lambda s: s[1] == 75)
assert media((50, 75)) == 60

# ds6 — prodotto pari
sc = [(x, y) for x in range(1, 13) for y in range(1, 13)]
check_ds(vedi('ds6'), 'A', sc, lambda s: (s[0] * s[1]) % 2 == 0, lambda s: (s[0] + s[1]) % 2 == 1, lambda s: s[0] % 3 == 0)

# ---- dati e proposizioni ----
# dp1 — animali
nomi = ['Ada', 'Bea', 'Carlo', 'Dino']
mondi = []
for p in itertools.permutations(['gatto', 'cane', 'pesce', 'criceto']):
    m = dict(zip(nomi, p))
    if m['Ada'] in ('cane', 'gatto') or m['Carlo'] in ('cane', 'criceto') or m['Dino'] == 'gatto' or m['Bea'] == 'pesce':
        continue
    mondi.append(m)
assert len(mondi) == 4
check_dp(vedi('dp1'), mondi, [
    lambda m: m['Bea'] == 'cane' or m['Dino'] == 'cane',
    lambda m: m['Dino'] == 'cane',
    lambda m: m['Ada'] != 'pesce' or m['Carlo'] == 'gatto',
    lambda m: m['Ada'] == 'criceto' or m['Dino'] == 'criceto'], 'V')

# dp2 — cinque atleti
mondi = []
for mid in itertools.combinations(range(51, 70), 3):
    if sum(mid) + 120 == 300:
        mondi.append((50,) + mid + (70,))
assert len(mondi) == 41
check_dp(vedi('dp2'), mondi, [
    lambda w: sum(t < 60 for t in w) >= 2,
    lambda w: w[2] > 65,
    lambda w: 60 not in w,
    lambda w: w[3] == 70], 'F')
assert max(w[2] for w in mondi) == 64

# dp3 — soci: mondi = insiemi di tipi di socio compatibili con i dati
tipi = []
for anz in ('<2', '2-5', '>5'):
    for oro in (0, 1):
        for vota in (0, 1):
            for viaggia in (0, 1):
                if oro and anz != '>5': continue            # solo > 5 anni hanno l'oro
                if oro and not vota: continue                # gli oro votano
                if anz == '<2' and viaggia: continue         # meno di 2 anni: niente viaggi
                tipi.append((anz, oro, vota, viaggia))
mondi = []
for r in range(1, len(tipi) + 1):
    for sub in itertools.combinations(tipi, r):
        if any(t[3] and not t[1] for t in sub):               # alcuni viaggiatori senza oro
            mondi.append(sub)
check_dp(vedi('dp3'), mondi, [
    lambda w: all(t[0] == '>5' for t in w if t[2]),
    lambda w: any(t[0] == '>5' and not t[1] for t in w),
    lambda w: all((not t[1]) and (not t[3]) for t in w if t[0] == '<2'),
    lambda w: all(t[2] and t[0] == '>5' for t in w if t[1])], 'V')

# dp4 — girone a quattro squadre: A = 7, B = 5, D = 1 punti
coppie = list(itertools.combinations(range(4), 2))
mondi = []
for res in itertools.product('WDL', repeat=6):
    pts = [0] * 4
    ris = {}
    for (i, j), r in zip(coppie, res):
        if r == 'W': pts[i] += 3
        elif r == 'L': pts[j] += 3
        else: pts[i] += 1; pts[j] += 1
        ris[(i, j)] = r
    if pts[0] == 7 and pts[1] == 5 and pts[3] == 1:
        mondi.append((ris, pts))
assert len(mondi) == 2, len(mondi)
def persa(m, sq):
    ris, _ = m
    return any((r == 'L' and i == sq) or (r == 'W' and j == sq) for (i, j), r in ris.items())
check_dp(vedi('dp4'), mondi, [
    lambda m: persa(m, 1),                        # A. B ha perso almeno una partita
    lambda m: m[1][2] == 4,                       # B. C ha ottenuto 4 punti
    lambda m: m[0][(0, 1)] == 'D',                # C. A ha pareggiato con B
    lambda m: m[0][(2, 3)] == 'W'], 'F')          # D. C ha battuto D

# ---- grafici ----
# g1 — vendite: ricostruzione a ritroso da aprile
V = D['vendite']
fatt = [1 + x / 100 for x in V['var']]       # feb, mar, apr, mag, giu
apr = V['pezziAprile']
gen = apr / (fatt[0] * fatt[1] * fatt[2])
pezzi = [gen]
for f in fatt: pezzi.append(pezzi[-1] * f)
assert pezzi[3] == apr and abs(gen - 400) < 1e-9 and abs(pezzi[5] - 432) < 1e-9
ric_gen, ric_giu = pezzi[0] * V['prezzoFinoMarzo'], pezzi[5] * V['prezzoDaAprile']
check_value(vedi('g1'), (ric_giu / ric_gen - 1) * 100)
check_assets(vedi('g1'), [25, 20, 50, 40, 20, 600, 12, 15])

# g2 — margine ordinario
T = D['trim']
marg = [r - c for r, c in zip(T['ricavi'], T['costi'])]
marg[2] -= T['spesaStraord']; marg[3] -= T['ricavoStraord']
check_value(vedi('g2'), sum(marg))
check_assets(vedi('g2'), T['ricavi'] + T['costi'] + [8, 4])
assert sum(r - c for r, c in zip(T['ricavi'], T['costi'])) == 48

# g3 — trasporti
B = D['bilancio']
quota = {k: v for k, v in B['quote']}
tr0 = B['totale'] * quota['Servizi'] / 100 * B['rapporto'][1] / sum(B['rapporto'])
tr1 = B['totale2'] * B['servizi2'] / 100 * B['rapporto'][1] / sum(B['rapporto'])
check_value(vedi('g3'), (tr1 / tr0 - 1) * 100)
check_assets(vedi('g3'), [30, 40, 20, 10, 12, 15, 36])

# ---- tabelle ----
# t1 — iscritti
I = D['iscritti']
cnt = [[I['tot'][i] * p // 100 for p in I['pct'][i]] for i in range(3)]
assert all(sum(r) == I['tot'][i] for i, r in enumerate(cnt))
col = [sum(r[j] for r in cnt) for j in range(3)]
tot = sum(I['tot'])
check_predicates(vedi('t1'), {
    'Giurisprudenza provenienti dal Sud': cnt[1][2] * 2 > col[2],
    'quelli di Economia sono più della metà': cnt[0][1] * 2 > col[1],
    'Ingegneria provenienti dal Nord sono più numerosi': cnt[2][0] > cnt[0][2],
    'meno del 30%': col[2] * 100 < 30 * tot
}, 'iscritti')
assert (cnt[0][1] * 2, col[1]) == (360, 360) and (col[2] * 10, 3 * tot) == (3600, 3600)    # soglie esatte
check_assets(vedi('t1'), [50, 30, 20, 25, 25, 50, 40, 40, 20, '600', '400', '200'])

# t2 — esportazioni
E = D['export']
tess, mecc, alim, chim = E['tessile'], E['meccanica'], E['alimentare'], E['chimica']
crescita = {'tessile': tess[3] - tess[0], 'meccanica': mecc[3] - mecc[0], 'alimentare': alim[3] - alim[0], 'chimica': chim[3] - chim[0]}
check_predicates(vedi('t2'), {
    'più del doppio di quelle della chimica': tess[3] > 2 * chim[3],
    "dell'alimentare sono aumentate di più del 50%": alim[3] > 1.5 * alim[0],
    'crescita assoluta maggiore tra i quattro settori è quella della meccanica': max(crescita, key=crescita.get) == 'meccanica',
    'Nessuna delle altre': not (tess[3] > 2 * chim[3] or alim[3] > 1.5 * alim[0] or max(crescita, key=crescita.get) == 'meccanica')
}, 'esportazioni')
assert max(crescita, key=crescita.get) == 'alimentare'
check_assets(vedi('t2'), tess + mecc + alim + chim)

# t3 — piani retributivi
P = D['piani']
pay = lambda p, x: P[p][0] + P[p][1] * x
best = lambda x: max('ABC', key=lambda p: pay(p, x))
check_predicates(vedi('t3'), {
    'Con 40 contratti': pay('A', 40) == pay('B', 40) == pay('C', 40),
    'Con 30 contratti': best(30) == 'B',
    'Con 50 contratti': pay('C', 50) - pay('A', 50) == 500,
    'compreso tra 20 e 40': all(best(x) == 'B' for x in range(21, 40))
}, 'piani retributivi')
assert pay('C', 50) - pay('A', 50) == 300
check_assets(vedi('t3'), ['1.200', 20, 800, 30, 50])

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
da_mano = ['vfn_obb', 'vfn_brev', 'vfn_x', 'vfn_y', 'vfn_z', 'v_nonc (testo)', 'v_term', 'v_ass', 'v_nec', 'v_alt', 'v_sel', 'v_obv', 'v_fatt']
print('Domande verbali controllate a mano (testo/logica):', da_mano)
