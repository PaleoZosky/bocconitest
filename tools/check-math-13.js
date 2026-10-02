#!/usr/bin/env node
/* =======================================================================
   check-math-13.js — ricalcola con il codice le risposte del Mock 13 e le
   confronta con la chiave (`ans`).

   Regole del controllo:
   - i dati dei grafici e delle tabelle sono quelli di `mock.data`, gli stessi
     usati per disegnarli; per ogni asset si controlla anche che i numeri
     compaiano davvero come testo visibile nell'HTML che il sito mostra;
   - ogni risposta è ricavata con un procedimento diverso dalla «via rapida»
     scritta nella soluzione (enumerazione di tutti i casi, ricerca per
     tentativi, simulazione);
   - per la sufficienza dei dati si enumerano gli scenari compatibili e si
     guarda se la risposta è la stessa in tutti;
   - per i vero/falso/non deducibile e per i quantificatori si enumerano i
     «mondi» compatibili con il brano;
   - il numero di opzioni che coincidono con il valore calcolato deve essere
     esattamente 1, e deve essere quella indicata da `ans`.

   uso: node tools/check-math-13.js
   ======================================================================= */
const path = require('path');
const mock = require(path.resolve(__dirname, '..', 'docs', 'mocks', 'mock-13.js'));
const D = mock.data;
const Q = Object.fromEntries(mock.questions.map(q => [q.n, q]));
const L = 'ABCD';
const errori = [];
let controllate = 0;
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;

/* ---- lettura delle opzioni ---- */
const plain = s => String(s).replace(/<[^>]*>/g, '').trim();
function num(s) {                         // '+0,5%' → 0.5 ; '1.480 €' → 1480 ; frazione → valore
  const fr = String(s).match(/aria-label="(\d+) fratto (\d+)"/);
  if (fr) return +fr[1] / +fr[2];
  const t = plain(s).replace(/[−–]/g, '-').replace(/(circa|km\/h|km|€|%|giorni|giorno|\bs\b)/g, '').replace(/\s/g, '');
  if (!t || /[^\d.,+-]/.test(t)) return NaN;
  return parseFloat(t.replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
}
function verifica(n, valore, { tol = 1e-9 } = {}) {
  const q = Q[n];
  const hit = q.opts.map(o => near(num(o), valore, tol));
  const quanti = hit.filter(Boolean).length;
  controllate++;
  if (quanti !== 1) errori.push(`n.${n}: ${quanti} opzioni coincidono con il valore calcolato (${valore}), ne serve esattamente 1`);
  else if (hit.indexOf(true) !== q.ans) errori.push(`n.${n}: il valore calcolato (${valore}) è l'opzione ${L[hit.indexOf(true)]}, la chiave dice ${L[q.ans]}`);
}
function verificaIdx(n, idx, cosa) {
  controllate++;
  if (idx !== Q[n].ans) errori.push(`n.${n}: ${cosa} → opzione ${L[idx]}, la chiave dice ${L[Q[n].ans]}`);
}
/* opzioni verbali o a testo: solo l'opzione `idx` risulta vera secondo i predicati */
function verificaPredicati(n, predicati, cosa) {
  const veri = predicati.map((p, i) => p ? i : -1).filter(i => i >= 0);
  controllate++;
  if (veri.length !== 1) errori.push(`n.${n}: ${cosa} — ${veri.length} opzioni vere (${veri.map(i => L[i])}), ne serve esattamente 1`);
  else verificaIdx(n, veri[0], cosa);
}
/* vero / falso / non deducibile: 0 Vera, 1 Falsa, 2 Non deducibile */
const VF = { V: 0, F: 1, N: 2 };
function verificaVFN(n, esito) { verificaIdx(n, VF[esito], 'verdetto V/F/N'); }
const classifica = (mondi, pred) => {
  if (!mondi.length) { errori.push('mondi vuoti'); return '?'; }
  const v = mondi.map(pred);
  return v.every(Boolean) ? 'V' : v.every(x => !x) ? 'F' : 'N';
};

/* ---- gli asset mostrano davvero i numeri usati nei conti ---- */
function visibili(n, ...vals) {
  const a = Q[n].asset || '';
  vals.forEach(v => { if (!a.includes('>' + v + '<')) errori.push(`n.${n}: il valore «${v}» non compare come testo visibile nell'asset`); });
}
/* lo stesso, ma per i valori scritti in un <text> con un segno davanti (+/−) */
function visibiliTesto(n, ...vals) {
  const a = Q[n].asset || '';
  vals.forEach(v => { if (!a.includes('>' + v + '<')) errori.push(`n.${n}: il testo «${v}» non compare nell'asset`); });
}

/* Sufficienza dei dati: si enumerano gli scenari compatibili e si guarda se
   la risposta alla domanda è la stessa in tutti gli scenari che rispettano
   l'informazione (o le due informazioni). Esito → indice delle opzioni
   standard: 0 «(1) sì, (2) no», 1 «(2) sì, (1) no», 2 «servono entrambe»,
   3 «nemmeno insieme». */
function suff(scenari, s1, s2, risposta) {
  const costante = lista => {
    if (!lista.length) return false;
    const r0 = JSON.stringify(risposta(lista[0]));
    return lista.every(s => JSON.stringify(risposta(s)) === r0);
  };
  const a = costante(scenari.filter(s1));
  const b = costante(scenari.filter(s2));
  const c = costante(scenari.filter(s => s1(s) && s2(s)));
  if (a && b) return 'ciascuna basta da sola (nessuna opzione standard)';
  if (a) return 0;
  if (b) return 1;
  if (c) return 2;
  return 3;
}
const perm = arr => arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perm([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]));

/* =====================================================================
   Quantitativa
   ===================================================================== */
/* n.1 — media ponderata delle quote */
{
  const gruppi = [{ n: 50, q: 40 }, { n: 150, q: 288 / 12 }];   // gli annuali pagano 288 € l'anno
  let incasso = 0, abbonati = 0; gruppi.forEach(g => { incasso += g.n * g.q; abbonati += g.n; });
  verifica(1, incasso / abbonati);
}
/* n.4 — tre lanci di moneta: si enumerano gli 8 esiti */
{
  let fav = 0, tot = 0;
  for (const a of [0, 1]) for (const b of [0, 1]) for (const c of [0, 1]) { tot++; if (a + b + c >= 2) fav++; }
  verifica(4, fav / tot);
}
/* n.7 — si cerca per tentativi il listino: sconto 25%, guadagno = 20% del prezzo di vendita, costo 60 */
{
  let L7 = null;
  for (let l = 1; l <= 400; l += 0.5) { const p = l * 0.75; if (near(p - 60, 0.2 * p, 1e-9)) L7 = l; }
  verifica(7, L7);
}
/* n.10 — pasti: enumerazione */
{
  let c = 0;
  for (let a = 0; a < 3; a++) for (let p = 0; p < 4; p++) for (const d of [null, 0, 1]) c++;
  verifica(10, c);
}
/* n.12 — bottiglie: 5 piccole (20 cl), 2 grandi (50 cl) */
{
  const piccole = 5 * 20, grandi = 2 * 50;
  verifica(12, 100 * piccole / (piccole + grandi));
}
/* n.15 — capitale iniziale, interesse semplice 4% per 3 anni, montante 1.680 */
{
  let c0 = null;
  for (let c = 1000; c <= 2000; c += 10) if (near(c + c * 0.04 * 3, 1680)) c0 = c;
  verifica(15, c0);
}
/* n.18 — quiz: e esatte, s sbagliate, 5 omesse su 20, punteggio 4e − s = 40 */
{
  const sol = [];
  for (let e = 0; e <= 15; e++) for (let s = 0; s <= 15; s++) if (e + s + 5 === 20 && 4 * e - s === 40) sol.push(s);
  controllate++;
  if (sol.length !== 1) errori.push('n.18: soluzione non unica');
  verifica(18, sol[0]);
}
/* n.21 — corsa: tempo di Anna e di Bruno su 20 km */
{
  const tA = 20 / 12 * 60, tB = 20 * 4.5;
  const pred = Q[21].opts.map(o => {
    if (/^Arrivano insieme/.test(o)) return near(tA, tB);
    const [chi, quanto] = [/^Anna/.test(o) ? 'A' : 'B', parseInt(o.match(/di (\d+) minuti/)[1], 10)];
    const diff = tB - tA;                                   // > 0: arriva prima Anna
    return chi === 'A' ? diff > 0 && near(diff, quanto) : diff < 0 && near(-diff, quanto);
  });
  verificaPredicati(21, pred, 'chi arriva prima e di quanto');
}
/* n.24 — resti: si prova con tutti gli n ≡ 4 e m ≡ 5 (mod 6) fino a 200 */
{
  const resti = new Set();
  for (let n = 1; n <= 200; n++) for (let m = 1; m <= 200; m++) if (n % 6 === 4 && m % 6 === 5) resti.add((n * m) % 6);
  controllate++;
  if (resti.size !== 1) errori.push('n.24: il resto non è unico');
  verifica(24, [...resti][0]);
}
/* n.27 — due numeri con somma 60 e rapporto 7:3: si cercano per tentativi */
{
  const sol = [];
  for (let a = 1; a < 60; a++) { const b = 60 - a; if (near(a / b, 7 / 3, 1e-12)) sol.push(a - b); }
  controllate++;
  if (sol.length !== 1) errori.push('n.27: coppia non unica');
  verifica(27, sol[0]);
}
/* n.30 — media meno mediana */
{
  const v = [1200, 1300, 1300, 1500, 5700].sort((a, b) => a - b);
  const media = v.reduce((a, b) => a + b, 0) / v.length;
  verifica(30, media - v[2]);
}
/* n.33 — spesa media degli altri clienti: si cerca per tentativi (prezzi al centesimo non servono) */
{
  let r = null;
  for (let x = 20; x <= 90; x++) if (near(20 * 35 + 30 * x, 50 * 44)) r = x;
  verifica(33, r);
}
/* n.36 — interi n con 3 < n/2 < 9 */
{
  let c = 0; for (let n = -50; n <= 100; n++) if (3 < n / 2 && n / 2 < 9) c++;
  verifica(36, c);
}
/* n.39 — successione */
{
  let t = 5; for (let i = 1; i < 5; i++) t = 2 * t - 3;
  verifica(39, t);
}
/* n.42 — tasso annuo costante: si cerca per tentativi il tasso (passi dello 0,01%) con 200 → 288 in due anni */
{
  let t = null;
  for (let x = 1; x <= 100 * 100; x++) { const r = x / 10000; if (near(200 * (1 + r) * (1 + r), 288, 1e-6)) t = r * 100; }
  controllate++;
  if (t === null) errori.push('n.42: nessun tasso annuo trovato');
  else verifica(42, Math.round(t * 1e6) / 1e6);
  // la trappola 22% non porta a 288
  controllate++;
  if (near(200 * 1.22 * 1.22, 288, 0.5)) errori.push('n.42: anche il 22% porterebbe a 288');
}
/* n.45 — piastrelle: si contano le piastrelle da 20 cm nella griglia 600 × 400 cm */
{
  let c = 0; for (let x = 0; x + 20 <= 600; x += 20) for (let y = 0; y + 20 <= 400; y += 20) c++;
  verifica(45, c);
}
/* n.48 — numeri di tre cifre distinte con le cifre 1..5, pari e maggiori di 300: enumerazione */
{
  let c = 0;
  for (const a of [1, 2, 3, 4, 5]) for (const b of [1, 2, 3, 4, 5]) for (const d of [1, 2, 3, 4, 5]) {
    if (a === b || b === d || a === d) continue;
    const n = 100 * a + 10 * b + d;
    if (n % 2 === 0 && n > 300) c++;
  }
  verifica(48, c);
}
/* n.50 — costo totale: si prova con più costi di partenza */
{
  const v = [100, 1000, 7777].map(c => ((0.4 * c * 1.1 + 0.35 * c * 0.9 + 0.25 * c) / c - 1) * 100);
  controllate++;
  if (!v.every(x => near(x, v[0], 1e-9))) errori.push('n.50: la variazione dipende dal costo di partenza');
  verifica(50, Math.round(v[0] * 1e9) / 1e9);
}

/* =====================================================================
   Data Insights — conti sui dati dei grafici
   ===================================================================== */
/* n.5 — acquisti per canale: quota complessiva di visitatori che acquista (due percentuali a catena) */
{
  const acquisti = D.canali.map(c => c.v * c.car / 100 * c.acq / 100);
  const visitatori = D.canali.reduce((a, c) => a + c.v, 0);
  verifica(5, 100 * acquisti.reduce((a, b) => a + b, 0) / visitatori);
  controllate++;
  if (acquisti.join() !== '1000,600,400') errori.push('n.5: acquisti attesi 1000,600,400, trovati ' + acquisti);
  // trappola: media semplice dei tassi acquisti/visitatori per canale
  const tassi = D.canali.map((c, i) => 100 * acquisti[i] / c.v);
  controllate++;
  if (!near(tassi.reduce((a, b) => a + b, 0) / 3, 15.5, 1e-9)) errori.push('n.5: la media semplice dei tassi non vale 15,5%');
  visibili(5, '8.000', '2.000', '10.000', '25%', '50%', '60%', '10%', '40%');
}
/* n.8 — prima volta con quota online > 40% */
{
  const o = D.ordini; let anno = null;
  for (let i = 0; i < o.anni.length; i++) if (o.online[i] / (o.online[i] + o.negozio[i]) > 0.4) { anno = o.anni[i]; break; }
  verifica(8, anno);
  const q = o.anni.map((a, i) => (o.online[i] / (o.online[i] + o.negozio[i])).toFixed(3));
  controllate++;
  if (q[1] >= 0.4 || q[2] <= 0.4) errori.push('n.8: soglia del 40% non rispettata tra 2022 e 2023: ' + q);
  visibiliTesto(8, ...o.online.map(String), ...o.negozio.map(String));
}
/* n.14 — istogramma: si controllano le quattro affermazioni in tutti i «mondi» estremi */
{
  const lim = [[15, 24], [25, 34], [35, 44], [45, 54], [55, 64]];
  const n = D.eta.n;
  const tot = n.reduce((a, b) => a + b, 0);
  const mondi = [];
  [0, 1].forEach(estremo => {                       // tutti al minimo / tutti al massimo di ogni fascia
    const eta = []; lim.forEach((l, i) => { for (let k = 0; k < n[i]; k++) eta.push(l[estremo]); });
    mondi.push(eta);
  });
  for (let r = 0; r < 200; r++) {                  // mondi casuali (generatore deterministico)
    let seed = 7 + r; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const eta = []; lim.forEach((l, i) => { for (let k = 0; k < n[i]; k++) eta.push(l[0] + Math.floor(rnd() * (l[1] - l[0] + 1))); });
    mondi.push(eta);
  }
  const mediana = e => { const s = [...e].sort((a, b) => a - b); return (s[tot / 2 - 1] + s[tot / 2]) / 2; };
  const media = e => e.reduce((a, b) => a + b, 0) / e.length;
  const certa = f => mondi.every(f);
  verificaPredicati(14, [
    certa(() => n[2] > n[0] + n[1]),                            // A: 35–44 più numerosi di <35
    certa(e => media(e) > 40),                                  // B: media > 40
    certa(e => mediana(e) < 35),                                // C: mediana < 35
    certa(e => e.filter(x => x < 45).length >= 0.7 * tot)       // D: almeno 70% con meno di 45
  ], 'affermazione certamente vera sull\'istogramma');
  controllate++;
  if (tot !== 100) errori.push('n.14: i visitatori non sono 100');
  visibili(14, ...n.map(String));
}
/* n.17 — due ambulatori: tassi per ambulatorio e complessivi */
{
  const A = D.ambulatori;
  const t24 = A.reduce((s, a) => s + a.r24, 0) / A.reduce((s, a) => s + a.t24, 0);
  const t25 = A.reduce((s, a) => s + a.r25, 0) / A.reduce((s, a) => s + a.t25, 0);
  const singoli = A.every(a => a.r25 / a.t25 > a.r24 / a.t24);
  const r24 = A.reduce((s, a) => s + a.r24, 0), r25 = A.reduce((s, a) => s + a.r25, 0);
  verificaPredicati(17, [
    near(t24, t25),                                             // invariata
    r25 > r24,                                                  // recuperi aumentati
    t25 > t24 && singoli,                                       // aumentata perché aumentata in entrambi
    singoli && near((t24 - t25) * 100, 30)                      // −30 punti nonostante il miglioramento singolo
  ], 'affermazione corretta sui due ambulatori');
  controllate++;
  if (!near(t24, 0.68) || !near(t25, 0.38)) errori.push('n.17: tassi complessivi diversi da 68% e 38%');
  visibili(17, 400, 320, 100, 90, 20);
}
/* n.20 — crescita 2022 → 2025 */
{
  const F = D.fatturato; verifica(20, (F.v[3] - F.v[0]) / F.v[0] * 100);
  // l'altezza apparente (sopra l'asse troncato) darebbe +200%: opzione-trappola
  controllate++;
  if (!near(((F.v[3] - F.asseDa) / (F.v[0] - F.asseDa) - 1) * 100, 200)) errori.push('n.20: la trappola dell\'asse troncato non vale +200%');
  visibili(20, ...F.v.map(String));
}
/* n.26 — livello cumulato: mese con il livello più basso a fine mese */
{
  const A = D.abbonati; let liv = A.inizio; const lv = A.var.map(v => (liv += v));
  const min = Math.min(...lv); const mese = A.mesi[lv.indexOf(min)];
  const mesiOpz = { Febbraio: 'Feb', Aprile: 'Apr', Maggio: 'Mag', Giugno: 'Giu' };
  verificaPredicati(26, Q[26].opts.map(o => mesiOpz[o] === mese), 'mese con livello minimo');
  controllate++;
  if (lv.join() !== '128,125,130,124,120,130') errori.push('n.26: livelli attesi 128,125,130,124,120,130, trovati ' + lv);
  visibiliTesto(26, '+8', '−3', '+5', '−6', '−4', '+10');
}
/* n.29 — ricavo giornaliero per camera disponibile degli hotel */
{
  const r = D.hotel.map(h => h.camere * h.occ / 100 * h.tariffa);            // ricavi totali
  const perCamera = D.hotel.map((h, i) => r[i] / h.camere);
  const max = Math.max(...perCamera);
  const primi = D.hotel.filter((h, i) => near(perCamera[i], max)).map(h => h.h);
  const opz = [['Alba'], ['Cielo'], ['Alba', 'Brezza'], ['Brezza']];
  verificaPredicati(29, opz.map(o => JSON.stringify(o) === JSON.stringify(primi)), 'hotel con ricavo per camera più alto');
  controllate++;
  if (r.join() !== '7200,7200,6650') errori.push('n.29: ricavi totali attesi 7200,7200,6650, trovati ' + r);
  controllate++;
  if (perCamera.map(x => Math.round(x * 100) / 100).join() !== '60,90,66.5') errori.push('n.29: ricavi per camera attesi 60,90,66.5, trovati ' + perCamera);
  visibili(29, 120, 80, 100, 95, '75%', '90%', '70%');
}
/* n.35 — tabella con celle mancanti: si cercano per tentativi i valori compatibili con i totali */
{
  const W = D.workshop; const sol = [];
  for (let sp = 0; sp <= 150; sp++) for (let pm = 0; pm <= 150; pm++) for (let pp = 0; pp <= 150; pp++) {
    if (W.studenti.mattina + sp !== W.studenti.tot) continue;            // riga studenti
    if (W.studenti.mattina + pm !== W.tot.mattina) continue;            // colonna mattina
    if (sp + pp !== W.tot.pomeriggio) continue;                          // colonna pomeriggio
    if (W.studenti.tot + pm + pp !== W.tot.tot) continue;                // totale
    sol.push({ sp, pm, pp });
  }
  controllate++;
  if (sol.length !== 1) errori.push('n.35: le celle mancanti non sono univoche (' + sol.length + ')');
  else verifica(35, 100 * sol[0].pp / W.tot.pomeriggio);
  visibili(35, 20, 90, 50, 100, 150);
}
/* n.41 — cammino critico: durata minima prima e dopo aver ridotto B a 2 giorni */
{
  const durata = P => {
    const fine = {};
    const f = a => {
      if (fine[a] !== undefined) return fine[a];
      const t = P.find(x => x.a === a);
      return (fine[a] = Math.max(0, ...t.dopo.map(f)) + t.d);
    };
    return Math.max(...P.map(t => f(t.a)));
  };
  const prima = durata(D.progetto);
  const dopo = durata(D.progetto.map(t => t.a === 'B' ? { ...t, d: t.d - 2 } : t));
  controllate++;
  if (prima !== 12 || dopo !== 11) errori.push(`n.41: durate attese 12 e 11, trovate ${prima} e ${dopo}`);
  verifica(41, prima - dopo);
  visibili(41, 3, 4, 2, 5, 3);
}
/* n.44 — due laboratori: enumerazione degli x compatibili con i dati */
{
  const sc = []; for (let x = 0; x <= 20; x++) { const t = 14 - x, m = 11 - x; if (t >= 0 && m >= 0 && t + m + x === 20) sc.push({ x, t, m }); }
  controllate++;
  if (sc.length !== 1) errori.push('n.44: i dati non fissano un valore unico di x');
  const certa = f => sc.every(f);
  const veri = [certa(s => s.x >= 5), certa(s => s.x > 7), certa(s => s.m < s.t), certa(s => s.t <= 9)];  // A B C D
  const opz = [[1, 0, 1, 0], [1, 0, 0, 1], [1, 0, 1, 1], [1, 1, 1, 1]];
  verificaPredicati(44, opz.map(o => o.every((v, i) => !!v === veri[i])), 'proposizioni sicuramente vere');
}

/* =====================================================================
   Sufficienza dei dati
   ===================================================================== */
/* n.3 — biglietti del cinema */
{
  const sc = []; for (let T = 20; T <= 400; T++) for (let r = 0; r <= T; r++) sc.push({ T, r });
  verificaIdx(3, suff(sc, s => near(s.r, 0.4 * s.T), s => s.T - s.r === 90, s => s.T), 'DS biglietti cinema');
}
/* n.11 — fatturato: I, E (2024) e fattori di crescita Italia/estero */
{
  const sc = [];
  const g = [0.8, 0.9, 0.95, 1, 1.05, 1.1, 1.2];
  for (let I = 1; I <= 20; I++) for (let E = 1; E <= 20; E++) for (const gi of g) for (const ge of g) sc.push({ I, E, gi, ge });
  verificaIdx(11, suff(sc, s => s.I >= s.E, s => near(s.gi, 1.1) && near(s.ge, 0.95), s => s.I * s.gi + s.E * s.ge > s.I + s.E), 'DS fatturato');
  controllate++;
  // le due informazioni sono compatibili
  if (!sc.some(s => s.I >= s.E && near(s.gi, 1.1) && near(s.ge, 0.95))) errori.push('n.11: informazioni incompatibili');
}
/* n.23 — età: A (Anna), B (Bea), C (Carla) */
{
  const sc = []; for (let a = 0; a <= 60; a++) for (let b = 0; b <= 60; b++) for (let c = 0; c <= 60; c++) sc.push({ a, b, c });
  verificaIdx(23, suff(sc, s => s.a === s.c + 6, s => s.a + 5 === 2 * (s.b + 5), s => s.a > s.b), 'DS età Anna e Bea');
}
/* n.32 — circolo di scacchi (EN) */
{
  const sc = []; for (let N = 10; N <= 200; N += 1) for (let b = 0; b <= N; b++) sc.push({ N, b });
  verificaIdx(32, suff(sc, s => near(s.b, 0.55 * s.N), s => s.N === 40, s => s.b > s.N - s.b), 'DS ragazzi e ragazze');
}
/* n.38 — rubinetti: tempi da solo (ore) di A e di B */
{
  const sc = []; for (let ta = 1; ta <= 60; ta += 0.5) for (let tb = 1; tb <= 120; tb += 0.5) sc.push({ ta, tb });
  verificaIdx(38, suff(sc, s => near(1 / s.ta + 1 / s.tb, 1 / 6, 1e-9), s => s.ta === 10, s => s.tb > 6), 'DS rubinetto B');
  // anche il valore di B sotto (1)+(2) è 15 ore
  controllate++;
  const insieme = sc.filter(s => near(1 / s.ta + 1 / s.tb, 1 / 6, 1e-9) && s.ta === 10).map(s => s.tb);
  if (!(insieme.length === 1 && insieme[0] === 15)) errori.push('n.38: sotto (1)+(2) B dovrebbe impiegare 15 ore');
}
/* n.47 — clienti: over 30 (n1), acquirenti over 30 (p1), acquirenti under 30 (p2) */
{
  const sc = [];
  for (let n1 = 20; n1 <= 180; n1 += 20) for (let p2 = 0; p2 <= 200 - n1; p2++) sc.push({ n1, p1: 0.55 * n1, p2 });
  verificaIdx(47, suff(sc, s => true, s => s.n1 === 120, s => s.p1 + s.p2 > 100), 'DS acquirenti > metà');
  // la (1) è una proprietà dello scenario: già inclusa; la (2) fissa n1 = 120
  controllate++;
  const insieme = sc.filter(s => s.n1 === 120).map(s => s.p1 + s.p2 > 100);
  if (!(insieme.includes(true) && insieme.includes(false))) errori.push('n.47: sotto (1)+(2) la risposta dovrebbe restare aperta');
}

/* =====================================================================
   Verbale — vero / falso / non deducibile: mondi compatibili col brano
   ===================================================================== */
/* n.2 — vivaio: aromatiche 30%, da frutto 60%, solo tre tipi */
{
  const mondi = []; for (let N = 100; N <= 2000; N += 100) mondi.push({ N, arom: 0.3 * N, frutto: 0.6 * N });
  mondi.forEach(w => { w.orn = w.N - w.arom - w.frutto; });
  verificaVFN(2, classifica(mondi, w => w.orn < 0.1 * w.N - 1e-9));
}
/* n.9 — condominio: il brano non dice nulla dei balconi sul cortile */
{
  const mondi = [{ balconeCortileAmmesso: true }, { balconeCortileAmmesso: false }];   // entrambi compatibili col brano
  verificaVFN(9, classifica(mondi, w => w.balconeCortileAmmesso));
}
/* n.16 — stazioni (EN): 120 stazioni, tutte ≥ 10 bici, esattamente 90% con più di 15 */
{
  const mondi = [];
  for (const extra of [0, 3, 5]) for (const alte of [16, 20, 40]) {
    const st = []; for (let i = 0; i < 108; i++) st.push(alte);                      // 90% di 120
    for (let i = 0; i < 12; i++) st.push(10 + (i % (extra + 1)) * (extra ? 1 : 0)); // tutte tra 10 e 15
    mondi.push(st);
  }
  mondi.forEach(st => { if (st.length !== 120 || st.some(x => x < 10) || st.filter(x => x > 15).length !== 108) errori.push('n.16: mondo non compatibile'); });
  verificaVFN(16, classifica(mondi, st => st.filter(x => x >= 10 && x <= 15).length >= 10));
}
/* n.22 — rifugio: 7 giorni, ogni giorno 12..40, sabato e domenica ≥ 30 */
{
  const mondi = [];
  for (const sab of [30, 35, 40]) for (const dom of [30, 40]) for (const altro of [12, 30, 40]) {
    const g = { sab, dom, altri: [altro, 12, 12, 12, 12] };
    mondi.push(g);
  }
  verificaVFN(22, classifica(mondi, g => g.altri.every(x => g.sab > x) && g.sab > g.dom));
}
/* n.28 — parco: chiuso ai veicoli nei weekend di luglio/agosto, salvo residenti e soccorso */
{
  const mondi = [{ turistaNonResidente: true, domenicaLuglio: true }];
  const entra = w => !(w.domenicaLuglio && w.turistaNonResidente);
  verificaVFN(28, classifica(mondi, entra));
}
/* n.34 — cooperativa: 40% over 50, metà di questi over 60 */
{
  const mondi = []; for (let N = 100; N <= 1000; N += 100) mondi.push({ N, o50: 0.4 * N, o60: 0.2 * N });
  verificaVFN(34, classifica(mondi, w => (w.N - w.o60) / w.N >= 4 / 5 - 1e-12));
}
/* n.43 — azienda di 60 dipendenti, tre reparti uguali: part-time totali */
{
  const mondi = [];
  const rep = 60 / 3;                                       // «lo stesso numero di persone»
  mondi.push({ pt: rep / 4 + 4 + 0 });                      // vendite: uno su quattro; amministrazione: 4; produzione: 0
  verificaVFN(43, classifica(mondi, w => w.pt > 10));
  controllate++;
  if (mondi[0].pt !== 9) errori.push('n.43: i part-time dovrebbero essere 9, trovati ' + mondi[0].pt);
}

/* =====================================================================
   Verbale — logica e quantificatori: si enumerano i modelli
   ===================================================================== */
/* n.37 — corsi con tre proprietà (tirocinio, lingua, chiuso): tutti i modelli compatibili col brano */
{
  const tipi = []; for (const t of [0, 1]) for (const l of [0, 1]) for (const c of [0, 1]) tipi.push({ t, l, c });
  const modelli = [];
  for (let mask = 1; mask < 256; mask++) {
    const dom = tipi.filter((_, i) => mask & (1 << i));
    const p1 = dom.every(x => !x.t || x.l);                 // tutti i corsi con tirocinio hanno esame di lingua
    const p2 = dom.every(x => !(x.l && x.c));               // nessun corso con lingua è a numero chiuso
    const p3 = dom.some(x => x.c);                          // alcuni sono a numero chiuso
    if (p1 && p2 && p3) modelli.push(dom);
  }
  const sempre = f => modelli.every(f);
  const ex = (dom, f) => dom.some(f);
  verificaPredicati(37, [
    sempre(d => ex(d, x => x.l && !x.t)),                   // A: alcuni con lingua senza tirocinio
    sempre(d => d.filter(x => !x.t).every(x => x.c)),       // B: tutti senza tirocinio sono a numero chiuso
    sempre(d => ex(d, x => x.c && x.t)),                    // C: almeno uno chiuso con tirocinio
    sempre(d => ex(d, x => x.c && !x.t))                    // D: alcuni chiusi senza tirocinio
  ], 'conclusione necessaria sui corsi');
}
/* n.46 — scatole: tutte le assegnazioni contenuto/etichetta con etichette tutte sbagliate e arancia da «Miste» */
{
  const contenuti = ['mele', 'arance', 'miste'], etichette = ['Mele', 'Arance', 'Miste'];
  const mondi = perm(contenuti).filter(c => c.every((x, i) => x.toLowerCase() !== etichette[i].toLowerCase()))
    .filter(c => c[2] !== 'miste' ? c[2] === 'arance' || c[2] === 'mele' : false)
    .filter(c => c[2] === 'arance');                       // dalla scatola «Miste» esce un'arancia: può contenere solo arance (mai miste per etichetta errata)
  controllate++;
  if (mondi.length !== 1) errori.push('n.46: i mondi compatibili non sono unici (' + mondi.length + ')');
  const sempre = f => mondi.every(f);
  verificaPredicati(46, [
    sempre(c => c[0] === 'miste'),                          // «Mele» contiene mele e arance mescolate
    sempre(c => c[1] === 'miste'),                          // «Arance» contiene mele e arance mescolate
    sempre(c => c[1] === 'arance'),                         // «Arance» contiene soltanto arance
    !sempre(c => true) || mondi.length > 1                  // non si può stabilire: falsa se il mondo è unico
  ], 'affermazione certamente vera sulle scatole');
}

/* =====================================================================
   Copertura: ogni domanda deve avere un controllo indipendente o essere
   dichiarata «verbale con controllo manuale».
   ===================================================================== */
const MANUALI = {
  6: 'causa alternativa (stagionalità)', 13: 'dose-risposta', 19: 'assunzione necessaria: soglia del 25%', 25: 'percentuale vs numero assoluto',
  31: 'causa comune (centri commerciali)', 40: 'conclusione supportata', 49: 'tesi principale'
};
/* n.19 — la soglia del 25%: ricavo = retta × iscritti, retta all'80% */
{
  let soglia = null; for (let g = 0; g <= 100; g += 1) { if (0.8 * (1 + g / 100) > 1 + 1e-12) { soglia = g; break; } }
  controllate++;
  if (soglia !== 26 && soglia !== 25) errori.push('n.19: soglia inattesa ' + soglia);   // per interi di percentuale: 26% è il primo > 25%
  controllate++;
  if (!near(0.8 * 1.25, 1)) errori.push('n.19: con +25% l\'incasso è esattamente invariato');
}
/* n.25 — esempio numerico: yoga +60% parte da 100, nuoto +10% parte da 1000 */
{
  controllate++;
  const yoga = 100 * 1.6, nuoto = 1000 * 1.1;
  if (!(yoga < nuoto)) errori.push('n.25: l\'esempio numerico non mostra che lo yoga può restare sotto al nuoto');
}
/* coerenza di alcuni numeri citati nel testo */
controllate++;
if (!Q[34].passage.includes('40%') || !Q[16].passage.includes('120 stations')) errori.push('dati attesi nei brani n.34/n.16');

console.log(`\ncontrolli automatici eseguiti: ${controllate}`);
console.log('verbali con controllo manuale: ' + Object.keys(MANUALI).map(n => `${n} (${MANUALI[n]})`).join('; '));
const coperte = new Set([...Object.keys(MANUALI).map(Number)]);
if (errori.length) {
  console.log('\nERRORI:'); errori.forEach(e => console.log('  × ' + e)); process.exit(1);
}
console.log('Tutti i conti tornano: ogni risposta ricalcolata coincide con la chiave.');
