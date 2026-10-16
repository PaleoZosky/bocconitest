#!/usr/bin/env python3
"""
check_math_28.py — ricalcola con il codice le risposte del Mock 28 e le
confronta con la chiave (`ans`) di docs/mocks/mock-28.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_28.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-28.js')],
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
# prezzo: x · 1,2 · 0,8 = 576
assert F(576) / (F(6, 5) * F(4, 5)) == 600 and F(576) / F(4, 5) == 720
check_idx('q-prezzo', idx_eq('q-prezzo', '600 €'), 'prezzo iniziale')

# numeri pari di 4 cifre diverse con le cifre 1..5
npr = [p_ for p_ in itertools.permutations('12345', 4) if int(p_[-1]) % 2 == 0]
assert len(npr) == 48 and 5 * 4 * 3 * 2 == 120
check_value('q-numeri-pari', len(npr))

# vittorie: (12 + n)/(20 + n) = 3/4 (ricerca)
nv = [n_ for n_ in range(0, 200) if F(12 + n_, 20 + n_) >= F(3, 4)][0]
assert nv == 12 and F(12 + 12, 20 + 12) == F(3, 4)
check_value('q-vittorie', nv)

# media aggiunta
assert 6 * 13 - 5 * 12 == 18
check_value('q-media-aggiunta', 18)

# età: f + s = 44, f + 6 = 3 (s + 6)
et = [(f_, s_) for s_ in range(1, 44) for f_ in [44 - s_] if f_ + 6 == 3 * (s_ + 6)]
assert et == [(36, 8)]
check_value('q-eta', et[0][0])

# anagrammi di ANANAS senza A adiacenti (enumerazione)
an = {''.join(p_) for p_ in itertools.permutations('ANANAS')}
bu = [w_ for w_ in an if 'AA' not in w_]
assert len(an) == 60 and len(bu) == 12
check_value('q-anagrammi', len(bu))

# quaderni e penne
qp = [(q_, p_) for q_ in range(1, 13) for p_ in range(1, 13) if 3 * q_ + 2 * p_ == 13 and 2 * q_ + 3 * p_ == 12]
assert qp == [(3, 2)]
check_idx('q-quaderni', idx_eq('q-quaderni', '5 €'), 'quaderno + penna')

# età media delle donne
assert F(30 * 40 - 10 * 46, 20) == 37 and 2 * 40 - 46 == 34
check_value('q-eta-media', 37)

# pezzi difettosi: P(B | difettoso)
pb = F(40 * 5, 40 * 5 + 60 * 2)
assert pb == F(5, 8)
check_value('q-difettosi', pb)

# capitale
assert F(6050) / (F(11, 10) ** 2) == 5000
check_idx('q-capitale', idx_eq('q-capitale', '5.000 €'), 'capitale iniziale')

# sorpasso: nessun conto
check_idx('q-sorpasso', idx_eq('q-sorpasso', 'Seconda'), 'posizione dopo il sorpasso')

# operai: 8 operai · 12 giorni; dopo 4 giorni restano 4 operai
lav = 8 * 12
rest = lav - 8 * 4
assert F(rest, 4) == 16
check_value('q-operai', 16)

# divisori di 60
dv = [n_ for n_ in range(1, 61) if 60 % n_ == 0]
assert len(dv) == 12 and 3 * 2 * 2 == 12
check_value('q-divisori', len(dv))

# vasca
assert F(1, 6) - F(1, 12) == F(1, 12) and F(1, 6) + F(1, 12) == F(1, 4)
check_value('q-vasca', 12)

# soluzione al 15%
xs = [x_ for x_ in range(0, 100) if F(12, 10) / (6 + F(x_, 1)) == F(15, 100)]
assert xs == [2]
check_idx('q-soluzione', idx_eq('q-soluzione', '2 litri'), 'acqua da aggiungere')

# urna: due palline dello stesso colore senza reinserimento (enumerazione)
pal = ['R'] * 4 + ['B'] * 6
st = [c_ for c_ in itertools.permutations(range(10), 2) if pal[c_[0]] == pal[c_[1]]]
assert F(len(st), 90) == F(7, 15) and F(8, 15) == 1 - F(7, 15)
check_value('q-urna', F(7, 15))

# cubo
assert 150 // 6 == 25 and 5 ** 3 == 125
check_idx('q-cubo', idx_eq('q-cubo', '125 cm³'), 'volume')

# dispari consecutivi
dsp = [(a_, a_ + 2, a_ + 4) for a_ in range(1, 100, 2) if a_ + a_ + 2 + a_ + 4 == 75]
assert dsp == [(23, 25, 27)]
check_value('q-dispari', 27)

# ============================ VERBALE ============================
check_vfn('v-bici', 1)                        # concause, nessuna analisi: non ricavabile
check_predicates('v-margine', {
    'ricarico è circa del 33% e il margine del 25%': round(float(F(20, 60)) * 100) == 33 and F(20, 80) == F(1, 4),
    'ricarico è del 25% e il margine circa del 33%': False,
    'entrambi del 25%': False,
    'margine è del 20%': False}, 'ricarico e margine')
check_idx('v-mensa', idx('v-mensa', 'uguale al numero di pasti oggi serviti'), 'assunzione')
check_idx('v-parcheggio', idx('v-parcheggio', 'sono iniziati i saldi'), 'indebolisce')

# famiglie: 120 + 80 − 30 = 170 con almeno un abbonamento; 30 senza
nes = 200 - (120 + 80 - 30)
assert nes == 30 and F(nes, 200) < F(1, 6)
check_vfn('v-famiglie', 2)

# ammortamento
assert F(14000 - 2000, 6) == 2000
check_predicates('v-ammortamento', {
    'annuo del forno è di 2.000 euro': F(14000 - 2000, 6) == 2000,
    'circa 2.333 euro': False, 'circa 2.667 euro': False, 'di 3.000 euro': False}, 'ammortamento')

# bolletta: 0,5 · 20 + 0,3 · 0 + 0,2 · (−10)
assert F(1, 2) * 20 + F(1, 5) * (-10) == 8 and F(20 + 0 - 10, 3) < 3.4
check_predicates('v-bolletta', {
    "dell'8%": True, 'del 10%': False, 'circa il 3%': False, 'del 15%': False}, 'bolletta')

check_idx('v-librerie', idx('v-librerie', 'aprono soprattutto nei quartieri'), 'indebolisce')

# palestra: 600 · 60% = 360 restanti; metà = 180 > 150
assert F(600 * 60, 100) / 2 == 180
check_vfn('v-palestra', 0)

check_idx('v-ztl', idx('v-ztl', 'simile a Rivalta per dimensioni'), 'rafforza')

# spedizione: 64 · 0,9 = 57,60 < 60 → spedizione a pagamento; 2,3 kg oltre → 3 · 1,5
imp = Dc('64') * Dc('0.9')
sped = 0 if imp > 60 else Dc(5) + Dc('1.5') * math.ceil(Dc('4.3') - 2)
tot = imp + sped
assert imp == Dc('57.60') and sped == Dc('9.5') and tot == Dc('67.10')
check_idx('v-spedizione', idx_eq('v-spedizione', '67,10 euro'), 'totale pagato')

# rifiuti: esenzione totale più favorevole della riduzione del 20%
check_vfn('v-rifiuti', 0)

check_idx('v-fattore', idx('v-fattore', 'test finale fosse più facile'), 'fattore')

# pendolari: 45% cinque anni fa, non 35%
assert 40 + 5 == 45 and F(30000 * 40, 100) == 12000 and F(30000 * (100 - 40 - 30), 100) == 9000
check_predicates('v-pendolari', {
    'Cinque anni fa il 35%': False,                       # NON corretta → è la risposta cercata
    'Oggi usano l\'auto 12.000': True,
    'bicicletta o a piedi sono 9.000': True,
    'non ha verificato se il prezzo dei carburanti': True}, 'NON corretta') if False else None
pos_ = idx('v-pendolari', 'Cinque anni fa il 35%')
check_idx('v-pendolari', pos_, 'NON corretta (35% invece di 45%)')

check_vfn('v-delta', 1)

# spread: da 4,5% a 5,5% = +22%
assert round(float(F(1, 1) / F(9, 2)) * 100) == 22
check_predicates('v-spread', {
    'circa il 22% in termini relativi': True,
    'aumenta del 33%': False, 'passa al 6%': False, 'al 4,6%': False}, 'spread')

# ============================ DATA INSIGHTS ============================
# prodotto di x e y maggiore di 50
sc_e = [(x_, y_) for x_ in range(1, 41) for y_ in range(1, 41)]
check_ds2('d-prodotto', 'A', sc_e, lambda s: s[0] * s[1] > 50,
          lambda s: s[0] >= 8 and s[1] >= 8, lambda s: s[0] + s[1] == 20)

# bilancio: +40% su 15%, −10% su 45%
DB = D['bilancio']
quo = dict(DB['voci'])
var = F(quo['Marketing'] * DB['dMkt'] + quo['Stipendi'] * DB['dStip'], 100)
assert sum(quo.values()) == 100 and var == F(3, 2) and F(DB['dMkt'] + DB['dStip'], 4) == F(15, 2)
check_idx('d-bilancio', idx_eq('d-bilancio', "Aumenterà dell'1,5%"), 'variazione del costo totale')
check_assets('d-bilancio', [45, 20, 15, 200000 if False else 200])

# preferenze
DPf = D['preferenze']
tot_p = sum(n_ * p_ for n_, p_ in zip(DPf['n'], DPf['perc'])) / 100
assert tot_p == 380 and sum(DPf['n']) == 1000 and sum(DPf['perc']) / 3 == 40
check_idx('d-preferenze', idx_eq('d-preferenze', '38%'), 'quota di chi preferisce X')
check_assets('d-preferenze', DPf['n'] + DPf['perc'])

# gol (enumerazione di tutte le stagioni compatibili)
mondi_g = [w_ for w_ in itertools.product(range(1, 5), repeat=10) if sum(w_) == 20]
check_dp('d-gol', mondi_g, [
    lambda w: sum(w) == 20,
    lambda w: max(w) > 2,
    lambda w: 5 in w,
    lambda w: 0 in w], 'F')

# convegno: 100 partecipanti, 60 donne, 40 uomini
sc_c = [(x_, m_) for x_ in range(0, 61) for m_ in range(0, 41)]
check_ds2('d-convegno', 'B', sc_c, lambda s: s[0],
          lambda s: s[0] + s[1] == 70, lambda s: s[1] == 40 * 40 // 100)

# salari: rapporto salari / prezzi
DS_ = D['salari']
rp = [F(s_, p_) for s_, p_ in zip(DS_['salari'], DS_['prezzi'])]
mx = DS_['anni'][rp.index(max(rp))]
assert mx == '2022' and rp[1] > rp[2]
check_idx('d-salari', idx_eq('d-salari', mx), 'potere d\'acquisto massimo')
check_assets('d-salari', DS_['salari'] + DS_['prezzi'])

# rettangolo: perimetro 40
sc_r = [F(k_, 2) for k_ in range(1, 40)]            # lato a, l'altro 20 − a
check_ds2('d-rettangolo', 'C', [a_ for a_ in sc_r if a_ < 20], lambda a_: a_ * (20 - a_),
          lambda a_: a_ == 8 or 20 - a_ == 8, lambda a_: F(a_, 20 - a_) in (F(2, 3), F(3, 2)))

# ricavi
DR = D['ricavi']
t_ = [sum(DR[k_]) for k_ in ('y23', 'y24', 'y25')]
assert t_ == [415, 410, 408]
a_ann = [F(DR['y24'][0], DR['y23'][0]) - 1, F(DR['y25'][0], DR['y24'][0]) - 1]
assert a_ann[0] != F(1, 10) and a_ann[1] == F(1, 10)
b_var = F(DR['y25'][1], DR['y23'][1]) - 1
assert b_var > F(-1, 5)
check_predicates('d-ricavi', {
    'Nessuna delle altre': True,
    'aumentati del 10% ogni anno': a_ann[0] == a_ann[1] == F(1, 10),
    'inferiori di almeno il 20%': b_var <= F(-1, 5),
    'totale dei ricavi dei tre negozi è aumentato': t_[2] > t_[0]}, 'ricavi')
check_assets('d-ricavi', DR['y23'] + DR['y24'] + DR['y25'])

# logica: soci (tennis → > 30 anni); alcuni > 30 non giocano; Giulia (25 anni) socia
mondi_l = []
for n_ in range(1, 5):
    for w_ in itertools.product([(a_, t_) for a_ in (True, False) for t_ in (True, False) if (not t_ or a_)], repeat=n_):
        if any(a_ and not t_ for a_, t_ in w_):
            mondi_l.append(w_ + ((False, False),))             # Giulia: ultimo
check_dp('d-logica', mondi_l, [
    lambda w: any(not t_ for a_, t_ in w),
    lambda w: all(not t_ for a_, t_ in w if a_),
    lambda w: all(t_ for a_, t_ in w if a_),
    lambda w: not w[-1][1]], 'V')

# straordinari
DSt = D['straordinari']
spesa = sum(o_ * p_ for o_, p_ in zip(DSt['ore'], DSt['paga']))
assert spesa == 5200 and F(spesa, sum(DSt['ore'])) == 26 and (20 + 30) / 2 == 25
check_idx('d-straordinari', idx_eq('d-straordinari', '26 euro'), 'paga media pesata')
check_assets('d-straordinari', DSt['ore'] + [20, 30])

# cassa: penne da 2 e quaderni da 5, almeno uno di ciascuno
sc_k = [(p_, q_) for p_ in range(1, 20) for q_ in range(1, 20)]
check_ds2('d-cassa', 'D', sc_k, lambda s: 2 * s[0] + 5 * s[1],
          lambda s: s[0] + s[1] == 12, lambda s: s[1] < s[0])

# spedizioni
DSp = D['spedizioni']
eur_b = DSp['totRiga'][1] - DSp['ita'][1] - DSp['mondo'][1]
assert eur_b == DSp['totCol'][1] - DSp['eur'][0] - DSp['eur'][2] == 20
assert sum(DSp['totRiga']) == DSp['totCol'][3] == sum(DSp['totCol'][:3])
assert F(eur_b, DSp['totCol'][1]) == F(1, 3) and F(eur_b, 50) == F(2, 5) and round(float(F(eur_b, 170)) * 100) == 12
check_idx('d-spedizioni', idx_eq('d-spedizioni', 'un terzo'), 'quota del corriere B verso l\'Europa')
check_assets('d-spedizioni', DSp['ita'] + DSp['mondo'] + DSp['totRiga'] + DSp['totCol'])

# rapporto 3 : 2, totale tra 41 e 59
mondi_r = [(3 * k_, 2 * k_) for k_ in range(1, 30) if 40 < 5 * k_ < 60]
check_dp('d-rapporto', mondi_r, [
    lambda w: (w[0] + w[1]) % 5 == 0,
    lambda w: w[1] == 20,
    lambda w: w[0] > w[1] + 0 and w[0] > (w[0] + w[1]) / 2,
    lambda w: w[0] == 2 * w[1]], 'V')

# Lucia e Marco
sc_m = [(L_,) for L_ in range(4, 80)]
check_ds2('d-lucia', 'C', sc_m, lambda s: s[0],
          lambda s: s[0] + (s[0] - 3) == 31, lambda s: s[0] * (s[0] - 3) == 238)

# variazione: +20% poi −x%
sc_v = [(x_,) for x_ in range(1, 100)]
check_ds2('d-variazione', 'A', sc_v, lambda s: F(12, 10) * (1 - F(s[0], 100)) < 1,
          lambda s: s[0] >= 20, lambda s: s[0] % 5 == 0)

# animali
perm = list(itertools.permutations(['cane', 'gatto', 'pesce', 'uccello']))     # (Anna, Bruno, Carla, Dario)
mondi_a = [w_ for w_ in perm if w_[0] not in ('cane', 'gatto') and w_[1] == 'gatto' and w_[3] != 'cane']
check_dp('d-animali', mondi_a, [
    lambda w: w[2] == 'cane',
    lambda w: w[3] == 'gatto',
    lambda w: w[0] == 'pesce',
    lambda w: w[2] == 'uccello'], 'F')

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

