#!/usr/bin/env python3
"""
check_math_26.py — ricalcola con il codice le risposte del Mock 26 e le
confronta con la chiave (`ans`) di docs/mocks/mock-26.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_26.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-26.js')],
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




def check_ds2(n, atteso, scenari, valore, p1, p2):
    """come check_ds, in più le due affermazioni devono essere compatibili tra loro"""
    assert any(p1(s) and p2(s) for s in scenari), f'{n}: le due affermazioni sono incompatibili'
    check_ds(n, atteso, scenari, valore, p1, p2)


# ============================ QUANTITATIVA ============================
# visitatori: dicembre = 21.000 / (1,4 · 0,75)
dic = F(21000) / (F(7, 5) * F(3, 4))
assert dic == 20000 and F(21000) * F(105, 100) == 22050 and 21000 / 1.15 > 18260 and 21000 / 1.15 < 18261
check_idx('q-visitatori', idx_eq('q-visitatori', '20.000'), 'visite di dicembre')

# vernice: prezzo 6 tra 4 (bianca) e 10 (colorata)
tr = [(b_, c_) for b_ in range(1, 10) for c_ in range(1, 10) if F(4 * b_ + 10 * c_, b_ + c_) == 6 and math.gcd(b_, c_) == 1]
assert tr == [(2, 1)]
assert F(4 + 10, 2) == 7 and F(3 * 4 + 2 * 10, 5) == F(32, 5)
check_idx('q-vernice', idx_eq('q-vernice', '2 : 1'), 'rapporto della miscela')

# biglie: 6 identiche a 3 bambini, ciascuno almeno una
bg = [(a_, b_, 6 - a_ - b_) for a_ in range(1, 6) for b_ in range(1, 6) if 6 - a_ - b_ >= 1]
assert len(bg) == 10
check_value('q-biglie', len(bg))
assert math.comb(8, 2) == 28 and math.comb(6, 3) == 20

# buste: almeno un premio aprendone 2 su 5 (2 premi)
ok_b = sum(1 for c_ in itertools.combinations(range(5), 2) if any(x_ < 2 for x_ in c_))
assert F(ok_b, math.comb(5, 2)) == F(7, 10)
check_value('q-buste', F(ok_b, 10))
assert 1 - F(3, 5) ** 2 == F(16, 25)

# a + b = 10, a² + b² = 58
ab = F(10 ** 2 - 58, 2)
assert ab == 21 and (3 + 7 == 10 and 9 + 49 == 58)
check_value('q-algebra', ab)

# monete: probabilità condizionata (3 monete, esce testa)
facce = [(m_, f_) for m_ in range(3) for f_ in range(2)]            # moneta 0: TT, 1: CC, 2: TC
lato = {(0, 0): 'T', (0, 1): 'T', (1, 0): 'C', (1, 1): 'C', (2, 0): 'T', (2, 1): 'C'}
vis = [(m_, f_) for (m_, f_) in facce if lato[(m_, f_)] == 'T']
altra_testa = [(m_, f_) for (m_, f_) in vis if lato[(m_, 1 - f_)] == 'T']
assert F(len(altra_testa), len(vis)) == F(2, 3)
check_value('q-monete', F(2, 3))

# cifre di 2^20 · 5^18
assert len(str(2 ** 20 * 5 ** 18)) == 19 and str(2 ** 20 * 5 ** 18).startswith('4') and str(2 ** 20 * 5 ** 18).count('0') == 18
check_value('q-potenze', len(str(2 ** 20 * 5 ** 18)))

# fattoria: galline 3 · oche, oche = 2/5 anatre, totale 260
sol_f = [(g_, o_, a_) for a_ in range(1, 261) for o_ in range(1, 261) for g_ in [3 * o_] if 5 * o_ == 2 * a_ and g_ + o_ + a_ == 260]
assert sol_f == [(120, 40, 100)]
check_value('q-fattoria', sol_f[0][0])

# LED e alogena: costo uguale dopo h ore
h_ = [h for h in range(0, 5001) if 12 + F(8, 1000) * F(25, 100) * h == 4 + F(40, 1000) * F(25, 100) * h]
assert h_ == [1000]
check_value('q-led', h_[0])
assert F(8) / F('0.04') == 200 and F(8) / F('0.032') == 250

# cifre con prodotto 6
nc = [n_ for n_ in range(100, 1000) if math.prod(int(c_) for c_ in str(n_)) == 6]
assert len(nc) == 9
check_value('q-cifre', len(nc))

# foglio piegato 10 volte
sp = F(1, 10) * 2 ** 10
assert sp == F(512, 5) and 100 < float(sp) < 105          # ≈ 102 mm ≈ 10 cm
check_idx('q-foglio', idx_eq('q-foglio', 'circa 10 cm'), 'spessore')

# somma 17 e prodotto 66
cp = [(a_, 17 - a_) for a_ in range(1, 17) if a_ * (17 - a_) == 66 and a_ <= 17 - a_]
assert cp == [(6, 11)]
check_value('q-somma-prodotto', max(cp[0]))
assert 12 * 5 == 60 and 14 * 3 == 42

# valore assoluto: 2 < |n − 3| ≤ 5
vv = [n_ for n_ in range(-50, 51) if 2 < abs(n_ - 3) <= 5]
assert vv == [-2, -1, 0, 6, 7, 8] and len(vv) == 6
check_value('q-assoluto', len(vv))
assert len([n_ for n_ in range(-50, 51) if 2 <= abs(n_ - 3) <= 5]) == 8

# indice dei prezzi
assert F(150, 125) - 1 == F(1, 5) and F(25, 150) < F(1, 5)
check_idx('q-indice', idx_eq('q-indice', '20%'), 'aumento dei prezzi')

# lampioni
opp = (5 - 1 + 6) % 12 + 1
assert opp == 11
check_value('q-lampioni', opp)

# treni
v_rel = F(54 + 36, 1) * 1000 / 3600
assert v_rel == 25 and F(150 + 100) / v_rel == 10
check_idx('q-treni', idx_eq('q-treni', '10 secondi'), 'tempo di incrocio')
assert F(150) / 25 == 6 and F(250) / 18 > 13.8 and F(250) / (F(18 * 1000, 3600)) == 50

# calendario: 1° ottobre 2026 è giovedì
d0 = datetime.date(2026, 10, 1)
d1 = datetime.date(2029, 10, 1)
assert d0.strftime('%A') == 'Thursday' and d1.strftime('%A') == 'Monday' and (d1 - d0).days == 1096
check_idx('q-calendario', idx_eq('q-calendario', 'Lunedì'), 'giorno della settimana')

# camicie
inc = 50 * 35 + 30 * Dc(35) * Dc('0.8')
assert inc == 2590 and inc - 80 * 20 == 990 and 80 * 35 - 1600 == 1200
check_value('q-camicie', inc - 1600)
assert 50 * 35 + 30 * Dc(20) * Dc('0.8') - 1600 == 630

# ============================ VERBALE ============================
# stagionali: bagnini 15%, bar 45%, pulizie 40%
pul = 100 - 15 - 3 * 15
assert pul == 40 and F(pul, 100) > F(1, 3) and F(2000 * pul, 100) == 800
check_vfn('v-stagionali', 0)       # «meno di un terzo»: falsa

# PIL reale
g_r = F(105, 100) / F(103, 100) - 1
assert 0.019 < float(g_r) < 0.02
check_predicates('v-pil', {
    'cresciuto di circa il 2%': round(float(g_r) * 100) == 2,
    "cresciuto dell'8%": False,
    'misura la crescita del PIL reale': False,
    'non risente delle variazioni dei prezzi': False}, 'PIL reale')

# abbonamento: gruppi comparabili
check_idx('v-abbonamento', idx('v-abbonamento', 'la stessa anzianità, le stesse valutazioni'), 'rafforza')

# Zeta: costo per titolo di studio non dato
check_vfn('v-zeta', 1)

# deficit: NON corretta
assert 180 - 160 == 20 and 20 - 12 == 8 and 55 - 40 == 15
check_idx('v-deficit', idx('v-deficit', 'perché le esportazioni di beni strumentali sono diminuite'), 'NON corretta')

# rivista: campione autoselezionato
check_idx('v-rivista', idx('v-rivista', 'tendono a non aprire più le e-mail'), 'indebolisce')

# imprese: 800 · 75% · 2/3 = 400
sito = F(800 * 75, 100)
assert sito == 600 and sito * F(2, 3) == 400
check_vfn('v-imprese', 2)

# aeroporto
check_idx('v-aeroporto', idx('v-aeroporto', 'più numerosi che nello stesso periodo del 2024'), 'periodo')
assert 450000 / 0.95 > 473000 and 450000 / 0.95 < 475000

# liceo: 500 studenti, 60% scientifico (90%) e 40% linguistico (60%)
sci, lin = 500 * F(60, 100), 500 * F(40, 100)
suf_s, suf_l = sci * F(90, 100), lin * F(60, 100)
quota_s = suf_s / (suf_s + suf_l)
assert (suf_s, suf_l) == (270, 120) and quota_s > F(2, 3) and F(500 - 390, 500) == F(22, 100)
check_predicates('v-liceo', {
    'più di due su tre frequentano': quota_s > F(2, 3),
    'il 60% frequenta': quota_s == F(60, 100),
    'i tre quarti hanno ottenuto la sufficienza': F(suf_s, sci) == F(3, 4),
    'sono il 30% degli iscritti': F(500 - 390, 500) == F(30, 100)}, 'liceo')

# autobus: assunzione
check_idx('v-autobus', idx('v-autobus', 'non aumentano al punto da annullare il risparmio'), 'assunzione')

# stranieri minorenni: 2.400 / 4 = 600; 600 / 3.000 = 20%
assert F(2400, 4) / 3000 == F(1, 5) < F(1, 4)
check_vfn('v-stranieri', 0)

# lavoro: forze di lavoro 7,5 milioni
fl = F(6) + F(3, 2)
assert F(3, 2) / fl == F(1, 5) and F(6, 10) == F(3, 5) and 10 - fl == F(5, 2)
check_predicates('v-lavoro', {
    'disoccupazione è del 20% e il tasso di occupazione del 60%': F(3, 2) / fl == F(1, 5) and F(6, 10) == F(3, 5),
    'disoccupazione è del 15%': False,
    "occupazione è dell'80%": False,
    'inattivi sono 2 milioni': 10 - fl == 2}, 'tassi')

# caschi: indebolisce
check_idx('v-caschi', idx('v-caschi', 'gli infortuni alla testa erano solo una piccola parte'), 'indebolisce')

# Kappa: confronto con il terzo trimestre 2024 non dato
check_vfn('v-kappa', 1)

# biblioteca: 30 + 15 = 45 giorni; 50 giorni → ritardo 5, divieto 10
assert 30 + 15 == 45 and 50 - 45 == 5 and 2 * 5 == 10
check_idx('v-biblioteca', idx('v-biblioteca', 'con 5 giorni di ritardo e per 10 giorni'), 'regola')

# ristorante: cambio di clientela
check_idx('v-ristorante', idx('v-ristorante', 'tipo di clientela'), 'fattore')

# ============================ DATA INSIGHTS ============================
# laboratori: N studenti, t iscritti a teatro (il 40% di N è iscritto a un laboratorio)
sc_l = [(N_, t_) for N_ in range(100, 1001, 100) for t_ in range(0, N_ * 2 // 5 + 1)]
check_ds2('d-laboratori', 'B', sc_l, lambda s: s[1],
          lambda s: s[1] == s[0] // 10, lambda s: s[0] == 600)
assert 600 * 40 // 100 * 25 // 100 == 60

# appelli: media ponderata
DA = D['appelli']
mp = F(sum(p_ * v_ for p_, v_ in zip(DA['promossi'], DA['voto'])), sum(DA['promossi']))
assert mp == F(248, 10) and sum(DA['voto']) / 3 == 24
check_value('d-appelli', float(mp))
check_assets('d-appelli', DA['promossi'] + DA['voto'])

# certificati: (a = tirocinio e certificazione, b = solo certificazione, c = nessuno dei due), a > b + c
mondi_c = [(a_, b_, c_) for a_ in range(1, 8) for b_ in range(0, 8) for c_ in range(0, 8)
           if a_ > b_ + c_ and a_ + b_ + c_ <= 7]
check_dp('d-certificati', mondi_c, [
    lambda w: 2 * (w[0] + w[1]) > w[0] + w[1] + w[2],
    lambda w: w[2] == 0,
    lambda w: w[0] > 0,
    lambda w: w[1] == 0], 'V')

# produzione per ora lavorata
DP_ = D['produzione']
rap = [F(p_, o_) for p_, o_ in zip(DP_['pezzi'], DP_['ore'])]
assert rap == [5, 6, 5, F(11, 2), 5]
mese = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio'][rap.index(max(rap))]
check_idx('d-produzione', idx_eq('d-produzione', mese), 'produzione per ora')
check_assets('d-produzione', DP_['ore'] + DP_['pezzi'])

# treno e autobus: x pendolari usano entrambi
sc_t = [(x_,) for x_ in range(20, 101)]          # 200 − (120 + 100 − x) ≥ 0
check_ds2('d-treno', 'C', sc_t, lambda s: 120 - s[0],
          lambda s: s[0] == 40, lambda s: 200 - (120 + 100 - s[0]) == 20)

# ciclista: velocità sui due tratti da 30 km
sc_ci = [(v1_, v2_) for v1_ in (5, 6, 10, 12, 15, 20, 30, 60) for v2_ in (5, 6, 10, 12, 15, 20, 30, 60)]
check_ds2('d-ciclista', 'C', sc_ci, lambda s: 60 / (F(30, s[0]) + F(30, s[1])),
          lambda s: F(30, s[0]) + F(30, s[1]) == 3, lambda s: s == (15, 30))
assert (15 + 30) / 2 == 22.5

# libri: x da 10, w da 20, 20 da 15
sol_l = [(x_, w_) for x_ in range(0, 21) for w_ in range(0, 21) if x_ + w_ == 20 and 10 * x_ + 20 * w_ + 15 * 20 == 640]
assert sol_l == [(6, 14)]
mondi_l = [(6, 14, 20)]
check_dp('d-libri', mondi_l, [
    lambda w: w[0] > w[1],
    lambda w: w[1] > 2 * w[0],
    lambda w: w[2] > w[1],
    lambda w: w[0] == 14], 'F')

# x + y
sc_xy = [(F(i_, 4), F(j_, 4)) for i_ in range(-40, 41) for j_ in range(-40, 41)]
check_ds2('d-xy', 'B', sc_xy, lambda s: s[0] + s[1],
          lambda s: s[0] - s[1] == 4, lambda s: s[0] ** 2 - s[1] ** 2 == 20)

# marche (torta): altre marche 40% di 2 milioni, rapporto 1 : 2 : 1
DM = D['marche']
alt = F(dict(DM['voci'])['Altre marche'], 100) * DM['totale'] * 1_000_000
assert sum(v_ for _, v_ in DM['voci']) == 100 and alt == 800000 and alt / 4 * 2 == 400000
check_idx('d-marche', idx_eq('d-marche', '400.000 pezzi'), 'marca Q')
check_assets('d-marche', [35, 25, 40])

# prodotti
DPR = D['prodotti']
t23, t24, t25 = sum(DPR['y23']), sum(DPR['y24']), sum(DPR['y25'])
assert (t23, t24, t25) == (183, 204, 225)
qa = [F(DPR[k_][0], t_) for k_, t_ in (('y23', t23), ('y24', t24), ('y25', t25))]
check_predicates('d-prodotti', {
    'supera di più del 20%': F(t25, t23) > F(6, 5),
    'quota del prodotto A sul totale': qa[0] < qa[1] < qa[2],
    'più del doppio di quelle del 2023': DPR['y25'][2] > 2 * DPR['y23'][2],
    'stessa quantità in ogni anno': DPR['y24'][3] - DPR['y23'][3] == DPR['y25'][3] - DPR['y24'][3]}, 'prodotti')
assert not (qa[0] < qa[1] < qa[2]) and qa[0] > qa[1] > qa[2]
check_assets('d-prodotti', DPR['y23'] + DPR['y24'] + DPR['y25'])

# fatturato: I = Italia 2024, E = estero 2024; entrambe le variazioni sono sempre vere
sc_f = [(I_, E_) for I_ in range(10, 201, 10) for E_ in range(10, 201, 10)]
check_ds2('d-fatturato', 'D', sc_f, lambda s: -5 * s[0] + 10 * s[1] > 0,
          lambda s: True, lambda s: True)

# reparti: 200 dipendenti, 40% produzione (25% donne), 60% ufficio (50% donne)
prod_, uff_ = F(200 * 40, 100), F(200 * 60, 100)
d_p, d_u = prod_ * F(25, 100), uff_ * F(50, 100)
mondi_k = [(d_p, prod_ - d_p, d_u, uff_ - d_u)]
assert mondi_k == [(20, 60, 60, 60)]
check_dp('d-reparti', mondi_k, [
    lambda w: F(w[0] + w[2], 200) == F(40, 100),
    lambda w: w[3] > w[1],
    lambda w: w[0] < F(w[0] + w[2], 4),
    lambda w: w[1] + w[3] == 120], 'V')

# corsi di lingua con cella nascosta
DC = D['corsi']
tedesco_int = DC['totRiga'][2] - DC['princ'][2] - DC['avanz'][2]
assert tedesco_int == DC['totCol'][1] - DC['interm'][0] - DC['interm'][1] == 20
quota_t = F(tedesco_int, DC['totCol'][1])
assert round(float(quota_t) * 100) == 24 and round(float(F(DC['interm'][1], DC['totCol'][1])) * 100) == 29
check_idx('d-corsi', idx_eq('d-corsi', 'circa il 24%'), 'quota di tedesco tra gli intermedi')
check_assets('d-corsi', DC['princ'] + DC['avanz'] + DC['totRiga'] + DC['totCol'])

# quadrato: lato s (multipli di 1/2)
sc_q = [F(k_, 2) for k_ in range(1, 61)]
check_ds2('d-quadrato', 'A', sc_q, lambda s: s > 10,
          lambda s: 2 * s * s > 225, lambda s: s.denominator == 1)
assert 10 * 1.41 < 15

# pezzi venduti (barre) e prezzi
DZ = D['pezzi']
ric_z = sum(DZ['venduti'][:2]) * DZ['prezzoPrimi'] + sum(DZ['venduti'][2:]) * DZ['prezzoUltimi']
ut_z = ric_z - sum(DZ['venduti']) * DZ['costo']
assert (ric_z, ut_z) == (4100, 1580)
assert sum(DZ['venduti']) * 25 - 2520 == 1980 and sum(DZ['venduti']) * 20 - 2520 == 1080 and sum(DZ['venduti']) * 22.5 - 2520 == 1530
check_value('d-pezzi', ut_z * 1000)
check_assets('d-pezzi', DZ['venduti'] + [20, 25, 14])

# premio: (premio, valutazione, promosso) con premio → valutazione e promosso → valutazione; Marco è promosso
mondi_pr = [(p_, v_, True) for p_ in (True, False) for v_ in (True, False) if (not p_ or v_) and v_]
check_dp('d-premio', mondi_pr, [
    lambda w: w[1],
    lambda w: w[0],
    lambda w: not w[1],
    lambda w: w[0] and not w[1]], 'F')

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
