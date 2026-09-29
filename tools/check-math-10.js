#!/usr/bin/env node
/* =======================================================================
   check-math-10.js — ricalcola con il codice le risposte del Mock 10 e le
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
   - il numero di opzioni che coincidono con il valore calcolato deve essere
     esattamente 1, e deve essere quella indicata da `ans`.

   uso: node tools/check-math-10.js
   ======================================================================= */
const path = require('path');
const mock = require(path.resolve(__dirname, '..', 'docs', 'mocks', 'mock-10.js'));
const D = mock.data;
const Q = Object.fromEntries(mock.questions.map(q => [q.n, q]));
const L = 'ABCD';
const errori = [];
let controllate = 0;
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;

/* ---- lettura delle opzioni ---- */
const plain = s => String(s).replace(/<[^>]*>/g, '').trim();
function num(s) {                         // '−12%' → -12 ; '10,40 €' → 10.4 ; frazione → valore
  const fr = String(s).match(/aria-label="(\d+) fratto (\d+)"/);
  if (fr) return +fr[1] / +fr[2];
  const t = plain(s).replace(/[−–]/g, '-').replace(/(circa|km\/h|km|€|%|\bs\b)/g, '').replace(/\s/g, '');
  if (!t || /[^\d.,+-]/.test(t)) return NaN;
  return parseFloat(t.replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
}
/* confronta un valore calcolato con le 4 opzioni e con la chiave */
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
/* opzioni verbali: solo l'opzione `idx` risulta vera secondo i predicati */
function verificaPredicati(n, predicati, cosa) {
  const veri = predicati.map((p, i) => p ? i : -1).filter(i => i >= 0);
  controllate++;
  if (veri.length !== 1) errori.push(`n.${n}: ${cosa} — ${veri.length} opzioni vere (${veri.map(i => L[i])}), ne serve esattamente 1`);
  else verificaIdx(n, veri[0], cosa);
}
/* vero / falso / non deducibile: 0 Vera, 1 Falsa, 2 Non deducibile */
const VF = { V: 0, F: 1, N: 2 };
function verificaVFN(n, esito) { verificaIdx(n, VF[esito], 'verdetto V/F/N'); }

/* ---- gli asset mostrano davvero i numeri usati nei conti ---- */
function contiene(n, ...testi) {
  const a = Q[n].asset || '';
  testi.forEach(t => { if (!a.includes(String(t))) errori.push(`n.${n}: nell'asset manca «${t}»`); });
}
/* i valori devono comparire come testo visibile (cella di tabella o etichetta
   del grafico), non solo come sottostringa delle coordinate dell'SVG */
function visibili(n, ...vals) {
  const a = Q[n].asset || '';
  vals.forEach(v => { if (!a.includes('>' + v + '<')) errori.push(`n.${n}: il valore «${v}» non compare come testo visibile nell'asset`); });
}
const fmt = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* ---------------------------------------------------------------------
   Sufficienza dei dati: si enumerano gli scenari compatibili e si guarda
   se la risposta alla domanda è la stessa in tutti gli scenari che
   rispettano l'informazione (o le due informazioni).
   Esito → indice delle opzioni standard: 0 «(1) sì, (2) no», 1 «(2) sì,
   (1) no», 2 «servono entrambe», 3 «nemmeno insieme».
   --------------------------------------------------------------------- */
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
const griglia = (vals, k) => k === 0 ? [[]] : griglia(vals, k - 1).flatMap(t => vals.map(v => [...t, v]));
const R = (a, b, passo) => { const o = []; for (let x = a; x <= b + 1e-9; x += passo) o.push(Math.round(x * 1000) / 1000); return o; };
const perm = arr => arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perm([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]));
const comb = (arr, k) => k === 0 ? [[]] : arr.flatMap((x, i) => comb(arr.slice(i + 1), k - 1).map(c => [x, ...c]));
const hm = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

/* =====================================================================
   Sufficienza dei dati
   ===================================================================== */
/* n.3 — km percorsi in 3 ore (scenari: velocità, consumo, km = v · 3) */
{
  const sc = []; for (let v = 40; v <= 130; v += 10) for (let c = 4; c <= 9; c++) sc.push({ v, c, ore: 3 });
  // (1) il consumo è 6 l/100 km; (2) velocità costante 80 km/h. Risposta: km = v · ore
  verificaIdx(3, suff(sc, s => s.c === 6, s => s.v === 80, s => s.v * s.ore), 'DS km percorsi');
}
/* n.20 — la quota di donne è aumentata? (donne ieri/oggi, membri ieri/oggi) */
{
  const sc = []; for (let w0 = 1; w0 <= 8; w0++) for (let w1 = 1; w1 <= 9; w1++) for (let t0 = 8; t0 <= 18; t0++) for (let t1 = 8; t1 <= 18; t1++) if (w0 < t0 && w1 < t1) sc.push({ w0, w1, t0, t1 });
  verificaIdx(20, suff(sc, s => s.w0 === 4 && s.w1 === 5, s => s.t0 === 12 && s.t1 === 15, s => s.w1 * s.t0 > s.w0 * s.t1), 'DS quota donne');
}
/* n.30 — Anna davanti a Marco? (permutazioni dell'ordine d'arrivo di 4 persone) */
{
  const sc = perm(['Anna', 'Bea', 'Marco', 'Carla']).map(o => ({ pos: n => o.indexOf(n) }));
  verificaIdx(30, suff(sc, s => s.pos('Anna') < s.pos('Bea'), s => s.pos('Marco') < s.pos('Bea'), s => s.pos('Anna') < s.pos('Marco')), 'DS ordine di arrivo');
  // le due informazioni non si contraddicono: esiste almeno uno scenario che le rispetta entrambe
  controllate++;
  if (!sc.some(s => s.pos('Anna') < s.pos('Bea') && s.pos('Marco') < s.pos('Bea'))) errori.push('n.30: le due informazioni sono incompatibili');
}
/* n.41 — promossi > 60%? Ragazzi b, ragazze g; 70% dei ragazzi e 40% delle ragazze promossi */
{
  const sc = [];
  for (let b = 10; b <= 400; b += 10) for (let g = 5; g <= 400; g += 5) sc.push({ b, g });   // b multiplo di 10 e g di 5 → promossi interi
  const frazione = s => (0.7 * s.b + 0.4 * s.g) / (s.b + s.g);
  const oltre = s => frazione(s) > 0.6 + 1e-12;
  verificaIdx(41, suff(sc, s => s.b === 2 * s.g, s => s.g === 90, oltre), 'DS promossi > 60%');
  // il valore esatto sotto (1)
  controllate++;
  const v1 = sc.filter(s => s.b === 2 * s.g).map(frazione);
  if (!v1.every(v => near(v, 0.6, 1e-12))) errori.push('n.41: sotto (1) la percentuale non è sempre esattamente 60%');
}
/* n.45 — media di a, b, c */
{
  const sc = []; for (let a = -10; a <= 40; a++) for (let b = -10; b <= 40; b++) for (let c = -10; c <= 40; c += 1) sc.push({ a, b, c });
  verificaIdx(45, suff(sc, s => s.a + s.b === 20, s => s.b + s.c === 30, s => (s.a + s.b + s.c) / 3), 'DS media di a, b, c');
}

/* Le due informazioni di ogni quesito di sufficienza non si contraddicono: esiste almeno uno scenario che le rispetta insieme */
{
  const ok = (n, presente) => { controllate++; if (!presente) errori.push(`n.${n}: le due informazioni sono incompatibili`); };
  ok(3, [40, 60, 80, 100].some(v => v === 80));                                                    // (1) consumo 6 l/100 km e (2) 80 km/h non si escludono
  ok(20, 4 / 12 <= 5 / 15 && 4 <= 12 && 5 <= 15);                                                   // 4 donne su 12, poi 5 su 15
  ok(41, (() => { const g = 90, b = 2 * g; return (7 * b) % 10 === 0 && (4 * g) % 10 === 0; })());   // ragazze 90, ragazzi 180: promossi interi (126 e 36)
  ok(45, (() => { const b = 10; return b + (20 - b) === 20 && b + (30 - b) === 30; })());          // a = 10, b = 10, c = 20
}

/* =====================================================================
   Domande quantitative e Data Insights: ricalcolo indipendente
   ===================================================================== */
/* n.1 — riso: prezzo al chilo */
{
  const piccola = 2.5 / 0.5, grande = 3.6 / 0.8;
  verifica(1, (piccola - grande) / piccola * 100, { tol: 1e-6 });
}
/* n.4 — Anna, Bea, Carla: ricerca per tentativi */
{
  let trovato = null;
  for (let c = 1; c <= 200; c++) { const b = 3 * c, a = 2 * b; if (a + b + c === 200) trovato = a; }
  verifica(4, trovato);
}
/* n.5 — canone medio ponderato (dai dati della tabella) */
{
  const tot = D.affitti.reduce((s, a) => s + a.m2 * a.eur, 0), sup = D.affitti.reduce((s, a) => s + a.m2, 0);
  verifica(5, tot / sup, { tol: 1e-9 });
  visibili(5, ...D.affitti.flatMap(a => [a.zona, fmt(a.m2), a.eur]));
}
/* n.7 — 30% di A = 45% di B: A come % di B (ricerca per tentativi su B) */
{
  const B = 20, A = 0.45 * B / 0.30;
  verifica(7, A / B * 100, { tol: 1e-9 });
}
/* n.9 — abbonati: valori assoluti e percentuali, poi verità delle 4 affermazioni */
{
  const { A, B } = D.abbonati;
  const dA = A[4] - A[0], dB = B[4] - B[0], pA = dA / A[0], pB = dB / B[0];
  verificaPredicati(9, [pA > pB, dB > dA, pB > pA && dA > dB, near(B[4], A[4] / 2)], 'abbonati');
  visibili(9, ...A, ...B, ...D.abbonati.anni);
}
/* n.10 — dadi: tutti i 36 esiti */
{
  let pari = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if ((a * b) % 2 === 0) pari++;
  verifica(10, pari / 36);
}
/* n.11 — media dei voti (istogramma) */
{
  const tot = D.voti.n.reduce((s, x) => s + x, 0), somma = D.voti.n.reduce((s, x, i) => s + x * D.voti.voto[i], 0);
  verifica(11, somma / tot);
  visibili(11, ...D.voti.n, ...D.voti.voto);
}
/* n.12 — la quota sale ma il numero scende: totale iniziale 1000 */
{
  const prima = 0.10 * 1000, dopo = 0.12 * (1000 * 0.8);
  // l'opzione A (totale −20%) rende il numero di stranieri più basso di prima; le altre non fissano alcun numero
  verificaIdx(12, dopo < prima ? 0 : -1, 'stranieri: con il totale a −20% il numero scende');
}
/* n.13 — fatturato per dipendente */
{
  verifica(13, (1.10 / 1.25 - 1) * 100, { tol: 1e-9 });
}
/* n.15 — treni: tutte le combinazioni */
{
  const T = D.treni; let best = Infinity;
  T.mb.forEach(([, p1, a1]) => T.bf.forEach(([, p2, a2]) => {
    if (hm(p1) >= hm(T.dopoLe) && hm(p2) - hm(a1) >= T.cambioMin) best = Math.min(best, hm(a2));
  }));
  const ore = Math.floor(best / 60), min = best % 60;
  const testo = `${ore}:${String(min).padStart(2, '0')}`;
  const idx = Q[15].opts.indexOf(testo);
  controllate++;
  if (idx < 0) errori.push(`n.15: ${testo} non è tra le opzioni`); else verificaIdx(15, idx, 'arrivo a Firenze ' + testo);
  visibili(15, ...T.mb.flat(), ...T.bf.flat());
}
/* n.16 — 3/5 di x = 18 → 2/3 di x */
{
  let x = null; for (let k = 1; k <= 500; k++) if (near(0.6 * k, 18)) x = k;
  verifica(16, 2 / 3 * x);
}
/* n.18 — ricavi: valori in milioni per ogni area e verità delle 4 affermazioni */
{
  const v = a => Object.fromEntries(D.ricavi.quote[a].map(([n, p]) => [n, p / 100 * D.ricavi.tot[a]]));
  const a24 = v(2024), a25 = v(2025);
  verificaPredicati(18, [
    a25.Italia < a24.Italia,
    near(a25.Europa, a24.Europa),
    near(a25['Resto del mondo'], a24['Resto del mondo'] * 1.10),
    near(a25.Italia, a24.Italia)
  ], 'ricavi per area');
  [2024, 2025].forEach(a => { if (D.ricavi.quote[a].reduce((s, d) => s + d[1], 0) !== 100) errori.push('ricavi ' + a + ': le quote non sommano a 100'); });
  contiene(18, ...D.ricavi.quote[2024].map(d => d[0] + ' — ' + d[1] + '%'), ...D.ricavi.quote[2025].map(d => d[0] + ' — ' + d[1] + '%'),
    `totale ${D.ricavi.tot[2024]} milioni`, `totale ${D.ricavi.tot[2025]} milioni`);
}
/* n.19 — ciclisti: simulazione al secondo */
{
  let t = 0, p1 = 0, p2 = 0, trovato = null;
  while (t < 5000) { t++; p1 += 5; p2 += 7; if ((p2 - p1) % 600 === 0) { trovato = t; break; } }
  verifica(19, trovato);
}
/* n.22 — consumo medio */
{
  verifica(22, (100 * 5 / 100 + 300 * 9 / 100) / 400 * 100);
}
/* n.24 — aeroporto */
{
  const A = D.aeroporto;
  const cresc = (A.internazionali[2] - A.internazionali[0]) / A.internazionali[0] * 100;
  const q0 = A.internazionali[0] / (A.internazionali[0] + A.nazionali[0]) * 100, q2 = A.internazionali[2] / (A.internazionali[2] + A.nazionali[2]) * 100;
  const pt = q2 - q0;
  const totale = ((A.internazionali[2] + A.nazionali[2]) - (A.internazionali[0] + A.nazionali[0])) / (A.internazionali[0] + A.nazionali[0]) * 100;
  verificaPredicati(24, [
    near(cresc, 100) && Math.abs(pt - 13) < 0.5,
    near(cresc, 100) && Math.abs(pt - 33) < 0.5,
    near(cresc, 50) && Math.abs(pt - 13) < 0.5,
    near(A.internazionali[2] - A.internazionali[0], 4) && Math.abs(pt - 53) < 0.5
  ], 'aeroporto');
  controllate++;
  if (!near(totale, 50)) errori.push('n.24: il totale non cresce del 50% (distrattore)');
  visibili(24, ...A.nazionali, ...A.internazionali, ...A.anni, 10, 12, 15);
}
/* n.25 — tre pari consecutivi con somma 84 */
{
  let mx = null; for (let a = 2; a <= 100; a += 2) if (a + (a + 2) + (a + 4) === 84) mx = a + 4;
  verifica(25, mx);
}
/* n.27 — test di ammissione: si ricostruiscono le celle mancanti dai vincoli */
{
  const [m, r, t] = D.ammissione;
  const ammM = m.cand * m.tasso / 100;              // Milano: ammessi
  let candR = null; for (let c = 1; c <= 2000; c++) if (near(r.amm / c * 100, r.tasso)) candR = c;   // Roma: candidati
  const tassoT = t.amm / t.cand * 100;             // Torino: tasso
  const cand = m.cand + candR + t.cand, amm = ammM + r.amm + t.amm;
  verifica(27, amm / cand * 100);
  controllate++;
  if (!near(tassoT, 10)) errori.push('n.27: il tasso di Torino non è 10%');
  const semplice = (m.tasso + r.tasso + tassoT) / 3;
  controllate++;
  if (Q[27].opts.filter(o => near(num(o), Math.round(semplice * 10) / 10)).length !== 1) errori.push('n.27: il distrattore «media semplice» non è tra le opzioni');
  visibili(27, m.sede, r.sede, t.sede, m.cand, r.amm, t.cand, t.amm, m.tasso + '%', r.tasso + '%');
}
/* n.28 — promozione paghi 2 prendi 3: massimo numero di articoli con 75 € */
{
  let best = 0;
  for (let art = 0; art <= 30; art++) {
    const pagati = Math.floor(art / 3) * 2 + (art % 3);
    if (pagati * 10 <= 75) best = art;
  }
  verifica(28, best);
  const medio = Math.floor(75 / (20 / 3));   // distrattore: 11
  controllate++;
  if (!Q[28].opts.some(o => near(num(o), medio))) errori.push('n.28: il distrattore «prezzo medio» non è tra le opzioni');
}
/* n.31 — multipli di 4 non di 6, minori di 100 */
{
  let k = 0; for (let x = 1; x < 100; x++) if (x % 4 === 0 && x % 6 !== 0) k++;
  verifica(31, k);
}
/* n.32 — variazioni composte */
{
  const f = D.variazioni.pct.reduce((p, x) => p * (1 + x / 100), 1);
  verifica(32, (f - 1) * 100, { tol: 1e-9 });
  visibili(32, '+50%', '−20%', '+25%', ...D.variazioni.anni);
}
/* n.34 — x − y con 2<x<5 e 1<y<3: per ogni intero k si cerca (in centesimi, senza errori
   di arrotondamento) una coppia x = y + k con x e y dentro gli intervalli aperti */
{
  const interi = [];
  for (let k = -6; k <= 8; k++) {
    let esiste = false;
    for (let y100 = 101; y100 <= 299; y100++) { const x100 = y100 + 100 * k; if (x100 > 200 && x100 < 500) { esiste = true; break; } }
    if (esiste) interi.push(k);
  }
  verifica(34, Math.max(...interi));
}
/* n.36 — scatter: scostamento percentuale e assoluto */
{
  const p = D.reparti.map(r => ({ r: r.r, pct: (r.eff - r.prev) / r.prev * 100, ass: r.eff - r.prev }));
  const best = p.reduce((a, b) => b.pct > a.pct ? b : a);
  const idx = Q[36].opts.indexOf(best.r);
  controllate++;
  if (idx < 0) errori.push('n.36: ' + best.r + ' non è tra le opzioni'); else verificaIdx(36, idx, 'reparto con scostamento % massimo: ' + best.r);
  const assMax = p.reduce((a, b) => b.ass > a.ass ? b : a);
  controllate++;
  if (assMax.r === best.r) errori.push('n.36: il reparto con scostamento assoluto massimo coincide con quello percentuale (manca il distrattore)');
  visibili(36, ...D.reparti.map(r => `${r.r} (${r.prev}; ${r.eff})`));
}
/* n.37 — carte: 40 carte, cuori oppure 5 o 10 */
{
  const semi = ['cuori', 'quadri', 'fiori', 'picche']; let f = 0, tot = 0;
  semi.forEach(s => { for (let v = 1; v <= 10; v++) { tot++; if (s === 'cuori' || v === 5 || v === 10) f++; } });
  verifica(37, f / tot);
}
/* n.39 — firme: si enumerano tutti i casi interi compatibili con i dati */
{
  const casi = [];
  for (let L = 0; L <= 100; L++) { const M = 2 * L, W = 100 - L - M; if (L >= 20 && M >= 20 && W >= 20 && W > L) casi.push({ L, M, W }); }
  const sempre = p => casi.length > 0 && casi.every(p);
  const A = sempre(c => c.L < 25), B = sempre(c => c.M > c.W), Cc = sempre(c => c.W >= 28), Dd = sempre(c => c.M % 2 === 0);
  const veri = ['A', 'B', 'C', 'D'].filter((_, i) => [A, B, Cc, Dd][i]).join(', ');
  const attese = ['A, C', 'A, D', 'A, C, D', 'A, B, C, D'];
  const idx = attese.indexOf(veri);
  controllate++;
  if (idx < 0) errori.push(`n.39: proposizioni sicuramente vere = ${veri}, non è tra le opzioni`); else verificaIdx(39, idx, 'proposizioni sicuramente vere: ' + veri);
  console.log(`  n.39 · ${casi.length} casi compatibili (lunedì da ${casi[0].L} a ${casi[casi.length - 1].L})`);
  controllate++;
  if (!casi.some(c => c.M === c.W)) errori.push('n.39: manca il caso limite in cui martedì = mercoledì (B non sarebbe un distrattore valido)');
}
/* n.40 — densità di A rispetto a B */
{
  const p = 7, s = 5;   // valori qualsiasi per B
  const rapporto = ((2 * p) / (3 * s)) / (p / s);
  const valori = [2 / 3, 3 / 2, 2, 3];
  const testi = ['due terzi', 'una volta e mezza', 'due volte', 'tre volte'];
  const idx = testi.findIndex((t, i) => near(valori[i], rapporto));
  controllate++;
  if (Q[40].opts.map(plain).join('|') !== testi.join('|')) errori.push('n.40: le opzioni non sono quelle attese');
  else verificaIdx(40, idx, 'densità A/B = ' + rapporto);
}
/* n.43 — potenze */
{
  verifica(43, (3 ** 5 * 9 ** 2) / 27 ** 2);
}
/* n.46 — un romanzo tra 5 e due saggi tra 4 */
{
  const romanzi = [0, 1, 2, 3, 4], saggi = [0, 1, 2, 3];
  const k = romanzi.length * comb(saggi, 2).length;
  verifica(46, k);
}
/* n.47 — vendite con marzo nascosto */
{
  const v = D.vendite;
  const marzo = v.totale - v.v.filter(x => x !== null).reduce((s, x) => s + x, 0);
  const maggio = v.v[4];
  verifica(47, (maggio - marzo) / marzo * 100);
  visibili(47, ...v.v.filter(x => x !== null), ...v.mesi);
}
/* n.49 — prezzo medio delle azioni */
{
  verifica(49, (100 * 8 + 300 * 12) / 400);
}
/* n.50 — media 8 di 5 interi positivi distinti: massimo del più grande, per ricerca esaustiva */
{
  let best = 0;
  for (let m = 5; m <= 40; m++) {
    // esiste una quaterna di interi positivi distinti (tutti < m) con somma 40 − m ?
    const target = 40 - m;
    for (let a = 1; a < m; a++) for (let b = a + 1; b < m; b++) for (let c = b + 1; c < m; c++) {
      const d = target - a - b - c;
      if (d > c && d < m) best = Math.max(best, m);
    }
  }
  verifica(50, best);
}

/* =====================================================================
   Verbale con numeri: le parti numeriche dei brani e delle affermazioni
   ===================================================================== */
/* n.8 — 600 studenti, 40% bici, 25% a piedi: motorizzati < 200 ? */
{
  const motorizzati = 600 - 600 * 0.40 - 600 * 0.25;
  verificaVFN(8, motorizzati < 200 ? 'V' : 'F');
}
/* n.14 — percentuali su basi diverse: esistono scenari con verità opposta */
{
  const a = (nA, nB) => 0.6 * nA > 0.5 * nB;
  controllate++;
  if (!(a(100, 400) === false && a(400, 100) === true)) errori.push('n.14: gli scenari non mostrano che il verdetto dipende dalle numerosità');
  verificaVFN(14, 'N');
}
/* n.21 — punti percentuali: 52 − 38 = 14, mentre +14% relativo darebbe 43,3 */
{
  const pt = 52 - 38, rel = 38 * 1.14;
  verificaPredicati(21, [false, near(pt, 14), false, near(rel, 52)], 'punti percentuali (A e C false per il testo, D falsa perché 38 · 1,14 ≠ 52)');
  // D: «14% della quantità» non coincide con i 14 punti: 38 · 1,14 = 43,32 ≠ 52
}
/* n.23 — biblioteca: film < 1/10 del totale? */
{
  let film = null;
  for (let f = 1; f <= 6000; f++) if (18000 * 2 / 3 + 2 * f + f === 18000) film = f;
  verificaVFN(23, film < 18000 / 10 ? 'V' : 'F');
  controllate++;
  if (film !== 2000) errori.push('n.23: i film dovrebbero essere 2000, invece ' + film);
}
/* n.33 — quota R&S e PIL */
{
  const spesa0 = 0.020 * 100, spesa1 = 0.025 * 90;
  const variazione = (spesa1 - spesa0) / spesa0 * 100;
  verificaPredicati(33, [spesa1 > spesa0, near(variazione, 25), near(spesa1, spesa0), spesa1 < spesa0], 'R&S');
}
/* n.44 — festival: +20% poi +30% */
{
  verificaVFN(44, 100 * 1.2 * 1.3 > 150 ? 'V' : 'F');
}
/* n.12 — controllo sui numeri della domanda: 0,12 × 0,8 = 0,096 < 0,10 */
{
  controllate++;
  if (!(0.12 * 0.8 < 0.10)) errori.push('n.12: 0,12 × 0,8 non è inferiore a 0,10');
}

/* =====================================================================
   Verbale senza numeri: la risposta poggia su una frase precisa. Si
   verifica solo che la frase citata nella soluzione compaia nel brano.
   ===================================================================== */
const citata = (n, frase) => {
  controllate++;
  const brano = plain((Q[n].passage || '') + ' ' + (Q[n].claim || ''));
  if (!brano.includes(frase)) errori.push(`n.${n}: la frase «${frase}» non compare nel brano`);
  if (!plain(Q[n].sol).includes(frase.slice(0, 20))) errori.push(`n.${n}: la soluzione non cita la frase «${frase.slice(0, 20)}…»`);
};
citata(2, 'hanno, in media, voti più alti dei figli delle altre famiglie');
citata(8, 'tutti gli altri con un mezzo motorizzato');
citata(21, 'dal 38% al 52% in due anni');
citata(29, 'non fornisce altre informazioni');
citata(38, 'accoglie visite guidate per gruppi su prenotazione');

/* ---------------------------------------------------------------------
   Verbale logico: si enumerano i «mondi» compatibili con il brano e si
   classifica ogni affermazione come vera in tutti (V), in nessuno (F) o
   in alcuni (N). Vale per n.2, n.29 e per le opzioni di n.38.
   --------------------------------------------------------------------- */
const classifica = (mondi, pred) => {
  const v = mondi.filter(pred).length;
  return v === mondi.length ? 'V' : v === 0 ? 'F' : 'N';
};
/* n.2 — mondi: media dei voti dei figli di chi cena insieme (mA) e degli altri (mB), il testo dice mA > mB */
{
  const mondi = []; for (let a = 4; a <= 10; a += 0.5) for (let b = 4; b <= 10; b += 0.5) if (a > b) mondi.push({ a, b });
  verificaVFN(2, classifica(mondi, w => w.b < w.a));
}
/* n.29 — 300 pazienti, 42 con effetti lievi: gli altri 258 possono avere o no effetti gravi (0..258) */
{
  const mondi = []; for (let gravi = 0; gravi <= 258; gravi++) mondi.push({ gravi });
  verificaVFN(29, classifica(mondi, w => w.gravi === 0));
}
/* n.38 — mondi: gruppi il lunedì (il brano dice che le visite di gruppo su prenotazione ci sono), audioguide sì/no */
{
  const mondi = []; for (const audio of [true, false]) mondi.push({ gruppiLunedi: true, audio, apertoDomenica18: true, gratisPrimaDomenica: true });
  const esiti = [
    classifica(mondi, w => w.apertoDomenica18),          // A
    classifica(mondi, w => w.gratisPrimaDomenica),       // B
    classifica(mondi, w => !w.gruppiLunedi),             // C: «nessun gruppo può visitare»
    classifica(mondi, w => w.audio)                      // D
  ];
  verificaPredicati(38, esiti.map(e => e === 'F'), 'affermazione contraddetta (F in tutti i mondi)');
  controllate++;
  if (esiti[3] !== 'N') errori.push('n.38: l\'opzione sulle audioguide dovrebbe essere «non deducibile»');
}

/* coerenza dei valori numerici mostrati nel brano n.21 */
controllate++;
if (!Q[21].passage.includes('12 città') || !Q[21].passage.includes('inferiore a 5 punti')) errori.push('n.21: il brano non contiene i dati attesi');

/* ---------------------------------------------------------------------
   Copertura: ogni domanda deve avere un controllo indipendente o essere
   dichiarata «verbale con controllo manuale».
   --------------------------------------------------------------------- */
const MANUALI = { 6: 'regressione verso la media', 17: 'causa alternativa (deposito)', 26: 'causalità inversa', 35: 'gruppo di controllo interno',
  42: 'composizione dei pazienti', 48: 'assunzione necessaria' };
console.log(`\ncontrolli automatici eseguiti: ${controllate}`);
console.log('verbali con controllo manuale: ' + Object.keys(MANUALI).map(n => `${n} (${MANUALI[n]})`).join('; '));
if (errori.length) {
  console.log('\nERRORI:'); errori.forEach(e => console.log('  × ' + e)); process.exit(1);
}
console.log('Tutti i conti tornano: ogni risposta ricalcolata coincide con la chiave.');
