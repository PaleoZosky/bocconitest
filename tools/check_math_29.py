#!/usr/bin/env python3
"""
check_math_29.py — ricalcola con il codice le risposte del Mock 29 e le
confronta con la chiave (`ans`) di docs/mocks/mock-29.js.

Stesse regole di check_math_15.py: i numeri di grafici e tabelle sono quelli di
`mock.data`; ogni risposta è ricavata con un procedimento diverso dalla «via
rapida» (enumerazione, ricerca per tentativi, simulazione); per la sufficienza
dei dati si enumerano gli scenari compatibili; per le proposizioni «sicuramente
vere / false» si enumerano tutti i mondi compatibili; esattamente una opzione
deve coincidere con il valore calcolato ed essere quella di `ans`.
Le domande si indicano con la chiave `k` (la numerazione dipende dal LAYOUT).

uso: python3 tools/check_math_29.py
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
raw = subprocess.run(['node', '-e', DUMP, str(ROOT / 'docs' / 'mocks' / 'mock-29.js')],
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
# rincaro 60 → 75: riduzione per tornare a 60
assert F(75 - 60, 75) == F(1, 5) and F(75 - 60, 60) == F(1, 4)
check_value('q-rincaro', 20)

# due gruppi con medie 29 e 25, media totale 26 su 40 studenti (ricerca)
sol_mix = [x_ for x_ in range(0, 41) if 29 * x_ + 25 * (40 - x_) == 40 * 26]
assert sol_mix == [10]
check_value('q-mix', sol_mix[0])

# due carte di denari su 40 senza reinserimento (enumerazione)
cp = list(itertools.permutations(range(40), 2))
fav = sum(1 for a_, b_ in cp if a_ < 10 and b_ < 10)
assert F(fav, len(cp)) == F(3, 52) and F(1, 4) ** 2 == F(1, 16) and F(10 * 9, 40 * 40) == F(9, 160)
check_value('q-carte', F(fav, len(cp)))

# rimborso
litri = F(300, 12)
spesa = litri * 2
assert spesa == 50 and spesa * F(40, 100) == 20 and spesa * F(60, 100) == 30
check_value('q-rimborso', 20)

# ciclisti: Anna parte a t = 0 (8:00); Bruno a t = 1; 15 t = 20 (t − 1)
tt = [t_ for t_ in range(0, 13) if 15 * t_ == 20 * (t_ - 1)]
assert tt == [4]
check_idx('q-ciclisti', idx_eq('q-ciclisti', '%d:00' % (8 + tt[0])), 'ora di incontro')

# comitato: almeno 2 donne su 3 (enumerazione); persone 0..4 uomini, 5..7 donne
com = list(itertools.combinations(range(8), 3))
fav = sum(1 for c_ in com if sum(1 for p_ in c_ if p_ >= 5) >= 2)
assert (fav, len(com)) == (16, 56) and F(fav, len(com)) == F(2, 7)
check_value('q-comitato', F(fav, len(com)))

# crescita +10%, +10%, −10%
tot_ = F(11, 10) * F(11, 10) * F(9, 10)
assert tot_ == F(1089, 1000) and round(float(tot_ - 1) * 100) == 9
check_idx('q-crescita', idx_eq('q-crescita', 'Aumento di circa il 9%'), 'variazione composta')

# podio con Luca (0) tra 8 atleti (enumerazione)
pod = [p_ for p_ in itertools.permutations(range(8), 3) if 0 in p_]
assert len(pod) == 126 and 8 * 7 * 6 == 336 and 7 * 6 * 5 == 210
check_value('q-podio', len(pod))

# occhiali
occ = F(55 * 40 + 45 * 20, 100 * 100)
assert occ == F(31, 100)
check_value('q-occhiali', 31)

# utile: vendita 90 = 1,25 · acquisto; sconto 10%
acq = F(90) / F(5, 4)
assert acq == 72 and F(90) * F(9, 10) - acq == 9 and 90 - acq == 18
check_value('q-utile', 9)

# età: A + B = 30, B + C = 36, A + C = 34 (ricerca)
et3 = [(a_, b_, c_) for a_ in range(1, 40) for b_ in range(1, 40) for c_ in range(1, 40)
       if a_ + b_ == 30 and b_ + c_ == 36 and a_ + c_ == 34]
assert et3 == [(14, 16, 20)]
check_value('q-sistema', et3[0][0])

# batteri: 10 raddoppi ≈ 1.024.000 → il più vicino su scala logaritmica è 1 milione
bat = 1000 * 2 ** (30 // 3)
cand = {'Circa 10.000': 1e4, 'Circa 100.000': 1e5, 'Circa 1 milione': 1e6, 'Circa 30.000': 3e4}
mig = min(cand, key=lambda k_: abs(math.log10(cand[k_]) - math.log10(bat)))
assert mig == 'Circa 1 milione' and bat == 1024000
check_idx('q-batteri', idx_eq('q-batteri', mig), 'ordine di grandezza')

# catena con basi diverse
sara = F(100)
luca = sara * F(80, 100)
marco = luca * F(125, 100)
assert marco == sara
check_idx('q-base-catena', idx_eq('q-base-catena', 'lo stesso numero di figurine'), 'Marco vs Sara')

# resti 5 con 6, 8 e 9 (ricerca)
rr = [n_ for n_ in range(6, 1000) if n_ % 6 == 5 and n_ % 8 == 5 and n_ % 9 == 5]
assert rr[0] == 77 and rr[1] == 149 and 53 % 9 == 8
check_value('q-resti', rr[0])

# calendario
d_ = datetime.date(2026, 10, 10)
assert d_.weekday() == 5      # sabato
gs = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'][datetime.date(2030, 10, 10).weekday()]
assert gs == 'Giovedì'
check_idx('q-calendario', idx_eq('q-calendario', gs), 'giorno della settimana')

# parti inversamente proporzionali a 2, 4, 6 su 330
pesi = [F(1, 2), F(1, 4), F(1, 6)]
quote = [330 * p_ / sum(pesi) for p_ in pesi]
assert quote == [180, 90, 60]
check_value('q-inverso', quote[2])

# mattone: x = 3 + x/2
xs_ = [x_ for x_ in (F(k_, 2) for k_ in range(1, 60)) if x_ == 3 + x_ / 2]
assert xs_ == [6] and F(3, 2) * 6 == 9
check_value('q-mattone', F(3, 2) * xs_[0])

# a · b = 12, a + b > 0 (enumerazione)
somme = {a_ + b_ for a_ in range(-30, 31) for b_ in range(-30, 31) if a_ * b_ == 12 and a_ + b_ > 0}
assert somme == {13, 8, 7}
check_idx('q-nondet', idx_eq('q-nondet', 'Non è determinabile con i dati forniti'), 'somme possibili ' + str(sorted(somme)))

# ============================== VERBALE ==============================
# VFN
check_vfn('v-biblioteca', 0)
assert 1 + 3 * F(1, 2) == F(5, 2)       # parcheggio al 95% (tre soglie superate)
check_vfn('v-parcheggio', 2)
check_vfn('v-remoto', 0)
assert F(8, 10) * F(15, 10) == F(12, 10)  # bio: ricavo per ettaro +20%, profitto non calcolabile
check_vfn('v-bio', 1)
assert (900 * F(80, 100)) / 3 == 240 and 240 < 250
check_vfn('v-app', 2)

# tasso reale
assert 3 - 4 == -1 and F(10300) / F(104, 100) < 10000
check_predicates('v-tassoreale', {
    'circa −1%': True, 'del 7%': False, 'del 3%, perché': False, 'è positivo': False}, 'tasso reale')

# autisti: la NON corretta
oggi_ind, oggi_term = 120, 80
fa_ind, fa_term = oggi_ind + 20, oggi_term - 20
assert oggi_ind == 200 * 60 // 100 and fa_ind + fa_term == 200
check_predicates('v-autisti', {
    'Un anno fa il 60%': not (F(fa_ind, 200) == F(60, 100)),
    'Un anno fa gli autisti a termine erano 60': not (fa_term == 60),
    'stabilizzare 40 autisti': not (oggi_term // 2 == 40),
    'Oggi gli autisti a tempo indeterminato sono 120': not (oggi_ind == 120)}, 'affermazione NON corretta')

# prevenzione
p24, p25 = 5000 * 9 // 100, 5000 * 12 // 100
assert (p24, p25) == (450, 600) and F(p25 - p24, p24) == F(1, 3)
check_predicates('v-prevenzione', {
    'da 450 a 600 milioni': (p24, p25) == (450, 600), 'aumentata del 3%': False,
    'rivolti a tutti': False, 'prestazioni ospedaliere è diminuita': False}, 'prevenzione')

# deficit/debito
assert 600 + 20 == 620
check_idx('v-deficit', idx_eq('v-deficit', '620 miliardi di euro'), 'debito')

# vino: crescita annua 6% < crescita del primo semestre 8% → il secondo semestre cresce meno del 6%
for w_ in (F(k_, 100) for k_ in range(30, 71)):
    g_ = (6 - 8 * w_) / (1 - w_)
    assert g_ < 6 < 8
check_predicates('v-vino', {
    'crescita inferiore a quella del primo': True, 'verso l\'Europa sono raddoppiate': False,
    'si riferisce al solo primo semestre': False, 'Le vendite in Asia rappresentano': False}, 'vino')

# regola del concorso
def punti(voto, anni, inglese):
    lau = 5 if voto >= 105 else 0
    if anni > 5 and lau:
        lau = 3
    ing = 3 if inglese else 0
    return max(lau, ing) if anni > 5 else lau + ing
assert punti(108, 6, True) == 3 and punti(108, 3, True) == 8 and punti(108, 6, False) == 3
check_idx('v-regola', idx_eq('v-regola', '3 punti'), 'regola')

# domande qualitative (una sola opzione poggia sul testo; vedi sol)
check_idx('v-doposcuola', idx('v-doposcuola', 'quartieri benestanti'), 'selezione: il doposcuola è dove l\'abbandono era già basso')
check_idx('v-fertilizzante', idx('v-fertilizzante', 'Nelle annate precedenti'), 'esclude la causa alternativa (terreno)')
check_idx('v-matematica', idx('v-matematica', 'nessuna impiega docenti privi di laurea'), 'condizione necessaria')
check_idx('v-fattore', idx('v-fattore', 'smesso di usare l\'app'), 'selezione dei rispondenti')
check_idx('v-centro', idx('v-centro', 'clienti che arrivano in auto'), 'effetto collaterale')

# ============================ DATA INSIGHTS ============================
sc2 = None

# DS 1: n < 50? (1) n = 2p, p primo < 20; (2) n multiplo di 6
primi = [p_ for p_ in range(2, 20) if all(p_ % d_ for d_ in range(2, p_))]
sc_n = [(n_,) for n_ in range(1, 400)]
check_ds2('d-sino1', 'A', sc_n, lambda s: s[0] < 50, lambda s: s[0] % 2 == 0 and s[0] // 2 in primi, lambda s: s[0] % 6 == 0)

# DS 2 (2×2): 100 persone; (1) donne = 60; (2) abbonati metà donne e uomini non abbonati = 30
sc_2x2 = [(W_, wa_, ma_) for W_ in range(0, 101) for wa_ in range(0, W_ + 1) for ma_ in range(0, 100 - W_ + 1)]
check_ds2('d-2x2', 'B', sc_2x2, lambda s: s[1],
          lambda s: s[0] == 60,
          lambda s: s[1] + s[2] == 2 * s[1] and (100 - s[0]) - s[2] == 30)

# DS 3: P(rossa) < 1/2 ? (1) V = 6 e R = 8; (2) B > R
sc_p = [(r_, b_, g_) for r_ in range(1, 31) for b_ in range(1, 31) for g_ in range(1, 31)]
check_ds2('d-limite2', 'A', sc_p, lambda s: F(s[0], sum(s)) < F(1, 2),
          lambda s: s[2] == 6 and s[0] == 8, lambda s: s[1] > s[0])

# DS 4: area del cerchio. (1) circonferenza 12π ; (2) quadrato inscritto con area 72
sc_r = [(F(k_, 2),) for k_ in range(2, 60)]
check_ds2('d-cerchio', 'C', sc_r, lambda s: s[0],
          lambda s: 2 * s[0] == 12, lambda s: (2 * s[0]) ** 2 / 2 == 72)

# DS 5: x y = 12 ; (1) x < y ; (2) x pari
sc_xy = [(x_, y_) for x_ in range(1, 13) for y_ in range(1, 13) if x_ * y_ == 12]
check_ds2('d-prod', 'B', sc_xy, lambda s: s[0], lambda s: s[0] < s[1], lambda s: s[0] % 2 == 0)

# DS 6: penne da 2 € e matite da 1 €
sc_pm = [(p_, m_) for p_ in range(0, 41) for m_ in range(0, 41)]
check_ds2('d-intervallo', 'D', sc_pm, lambda s: s[0], lambda s: s[0] + s[1] == 20, lambda s: 25 < 2 * s[0] + s[1] < 30)

# ---- proposizioni ----
# d-logica-a: 60 dipendenti 2:3; 15 under 30; nessun under 30 è dirigente. Mondo = uomini under 30 (0..15)
mondi = [{'mu': mu_, 'dir_u30': 0} for mu_ in range(0, 16)]
check_dp('d-logica-a', mondi, [
    lambda w: 60 * 3 // 5 == 36,
    lambda w: w['mu'] == 6,
    lambda w: 60 - 15 == 40,
    lambda w: w['dir_u30'] == 0], 'V')

# d-vendite: 5 modelli, almeno 10 pezzi ciascuno, somma 100, massimo 40
mv = [s_ for s_ in itertools.product(range(10, 41), repeat=5) if sum(s_) == 100 and max(s_) == 40 and list(s_) == sorted(s_)]
check_dp('d-vendite', mv, [
    lambda s: 5 in s,
    lambda s: min(s) < 20,
    lambda s: sum(1 for x_ in s if x_ > 20) >= 2,
    lambda s: max(s) > 50], 'F')

# d-logica-c: tre soci (il primo è Giorgio) con attributi (pittura, disegno, scultura)
att = list(itertools.product([False, True], repeat=3))
mc = []
for soci in itertools.product(att, repeat=3):
    ok = all((not p_ or d_) and (not s_ or not d_) for p_, d_, s_ in soci) and soci[0][0]
    if ok:
        mc.append(soci)
check_dp('d-logica-c', mc, [
    lambda w: w[0][1],
    lambda w: not w[0][2],
    lambda w: all((not d_) or p_ for p_, d_, s_ in w),
    lambda w: any(p_ and s_ for p_, d_, s_ in w)], 'V')

# d-ordine: altezze di Anna, Bruno, Carla, Dario
mo = [h_ for h_ in itertools.permutations([1, 2, 3, 4]) if h_[0] > h_[1] > h_[2] and h_[3] < h_[0] and h_[3] > h_[2]]
check_dp('d-ordine', mo, [
    lambda h: h[2] == min(h),
    lambda h: h[3] > h[1],
    lambda h: h[1] > h[0],
    lambda h: h[3] == max(h)], 'F')

# ---- grafici e tabelle ----
Dc_ = D['canali']
check_assets('d-pie', ['45%', '30%', '15%', '10%', '8.000', '20%'])
online = F(Dc_['copie'] * 30, 100)
assert online == 2400 and online * (1 - F(20, 100)) == 1920
check_value('d-pie', 1920)

Dt = D['trimestri']
rap = [F(r_, c_) for r_, c_ in zip(Dt['ricavi'], Dt['costi'])]
assert rap.index(max(rap)) == 0 and max(range(4), key=lambda i: Dt['ricavi'][i] - Dt['costi'][i]) == 3
check_idx('d-barre', idx_eq('d-barre', 'Il primo trimestre'), 'rapporto ricavi/costi massimo')

Dz = D['citta']
t20, t25 = sum(Dz['y20']), sum(Dz['y25'])
assert (t20, t25) == (400, 460)
tot30 = F(t25) * F(11, 10)
crescita = (tot30 / t20 - 1) * 100
assert crescita == F(53, 2)
media_s = sum(F(b_ - a_, a_) * 100 for a_, b_ in zip(Dz['y20'], Dz['y25'])) / 4
assert media_s == F(45, 2)
check_assets('d-citta', Dz['y20'] + Dz['y25'] + ['2020', '2025'])
check_value('d-citta', crescita)

Dk = D['corsi']
fs_ = [F(n_ * p_, 100) for n_, p_ in zip(Dk['n'], Dk['perc'])]
assert fs_ == [60, 60, 50]
check_assets('d-corsi', Dk['n'] + [str(p_) + '%' for p_ in Dk['perc']])
check_predicates('d-corsi', {
    'quadruplo': Dk['n'][1] - fs_[1] == 4 * fs_[1],
    'Il corso C ha più studenti fuori sede': fs_[2] > fs_[0],
    'più del 30% del totale': sum(fs_) > F(30, 100) * sum(Dk['n']),
    'Nessuna delle altre': False}, 'tabella con percentuali di riga')

Dtu = D['turni']
notte = Dtu['totale'] - sum(p_ for p_ in Dtu['pezzi'] if p_ is not None)
dif = F(500 * 4, 100) + F(300 * 5, 100) + F(notte * 10, 100)
assert notte == 200 and dif == 55 and dif / Dtu['totale'] * 100 == F(11, 2)
assert abs(float(F(4 + 5 + 10, 3)) - 6.33) < 0.01          # media semplice delle tre percentuali (esca)
check_assets('d-cella', [500, 300, '1.000', '4%', '5%', '10%'])
check_value('d-cella', F(11, 2))

Do = D['ore']
A_, B_, C_ = Do['ore']
check_assets('d-ore', [44, 52, 57, 89, 60, 75, 80, 118, 30, 42, 50, 54])
check_predicates('d-ore', {
    'dell\'Associazione A nel 2025 sono più del doppio': A_[3] > 2 * A_[0],
    'dell\'Associazione B nel 2025 sono più del doppio': B_[3] > 2 * B_[0],
    'cresciute ogni anno dello stesso numero': len({C_[i + 1] - C_[i] for i in range(3)}) == 1,
    'superano la somma': B_[2] > A_[2] + C_[2]}, 'tabella con numeri vicini')

# ---- controllo trasversale: schermate, lingua, lunghezza dei brani ----
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
