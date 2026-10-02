#!/usr/bin/env node
/* =======================================================================
   check-math-12.js — ricalcola con il codice le risposte del Mock 12 e le
   confronta con la chiave (`ans`).

   Regole del controllo (le stesse di check-math-10.js):
   - i dati dei grafici e delle tabelle sono quelli di `mock.data`, gli stessi
     usati per disegnarli; per ogni asset si controlla anche che i numeri
     compaiano davvero come testo visibile nell'HTML che il sito mostra;
   - ogni risposta è ricavata con un procedimento diverso dalla «via rapida»
     scritta nella soluzione (enumerazione di tutti i casi, ricerca per
     tentativi, simulazione, controllo di tutti i modelli possibili);
   - per la sufficienza dei dati si enumerano gli scenari compatibili e si
     guarda se la risposta è la stessa in tutti;
   - il numero di opzioni che coincidono con il valore calcolato deve essere
     esattamente 1, e deve essere quella indicata da `ans`.

   Le domande verbali di ragionamento causale (9, 21, 36, 42), l'assunzione
   (30), l'inferenza (24, 45) e le tre di vero/falso su testi senza numeri
   (6, 18, 27) non si calcolano: il controllo che qui si può fare è solo sulla
   parte numerica o logica, il resto è lasciato alla lettura.

   uso: node tools/check-math-12.js
   ======================================================================= */
const path = require('path');
const mock = require(path.resolve(__dirname, '..', 'docs', 'mocks', 'mock-12.js'));
const D = mock.data;
const Q = Object.fromEntries(mock.questions.map(q => [q.n, q]));
const L = 'ABCD';
const errori = [];
let controllate = 0;
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;

/* ---- lettura delle opzioni ---- */
const plain = s => String(s).replace(/<[^>]*>/g, '').trim();
function num(s) {                         // '−12%' → -12 ; '2,80 €' → 2.8 ; frazione → valore
  const fr = String(s).match(/aria-label="(\d+) fratto (\d+)"/);
  if (fr) return +fr[1] / +fr[2];
  const t = plain(s).replace(/[−–]/g, '-').replace(/(circa|km\/h|km|€|%|\bs\b)/g, '').replace(/\s/g, '');
  if (!t || /[^\d.,+-]/.test(t)) return NaN;
  return parseFloat(t.replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
}
const lead = s => { const m = plain(s).replace(',', '.').match(/\d+(?:\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };   // primo numero del testo
/* confronta un valore calcolato con le 4 opzioni e con la chiave */
function verifica(n, valore, { tol = 1e-9, leggi = num } = {}) {
  const q = Q[n];
  const hit = q.opts.map(o => near(leggi(o), valore, tol));
  const quanti = hit.filter(Boolean).length;
  controllate++;
  if (quanti !== 1) errori.push(`n.${n}: ${quanti} opzioni coincidono con il valore calcolato (${valore}), ne serve esattamente 1`);
  else if (hit.indexOf(true) !== q.ans) errori.push(`n.${n}: il valore calcolato (${valore}) è l'opzione ${L[hit.indexOf(true)]}, la chiave dice ${L[q.ans]}`);
}
/* come verifica, ma l'opzione è riconosciuta dal testo esatto */
function verificaTesto(n, testo) {
  const q = Q[n];
  const hit = q.opts.map(o => plain(o) === testo);
  const quanti = hit.filter(Boolean).length;
  controllate++;
  if (quanti !== 1) errori.push(`n.${n}: ${quanti} opzioni coincidono con «${testo}», ne serve esattamente 1`);
  else if (hit.indexOf(true) !== q.ans) errori.push(`n.${n}: «${testo}» è l'opzione ${L[hit.indexOf(true)]}, la chiave dice ${L[q.ans]}`);
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
function visibili(n, ...vals) {
  const a = Q[n].asset || '';
  vals.forEach(v => { if (!a.includes('>' + v + '<')) errori.push(`n.${n}: il valore «${v}» non compare come testo visibile nell'asset`); });
}
const dec2 = x => x.toFixed(2).replace('.', ',');

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
const compatibili = (n, scenari, s1, s2) => { controllate++; if (!scenari.some(s => s1(s) && s2(s))) errori.push(`n.${n}: le due informazioni sono incompatibili`); };
const griglia = (vals, k) => k === 0 ? [[]] : griglia(vals, k - 1).flatMap(t => vals.map(v => [...t, v]));
const R = (a, b, passo) => { const o = []; for (let x = a; x <= b + 1e-9; x += passo) o.push(Math.round(x * 1000) / 1000); return o; };
const comb = (arr, k) => k === 0 ? [[]] : arr.flatMap((x, i) => comb(arr.slice(i + 1), k - 1).map(c => [x, ...c]));

/* =====================================================================
   Sufficienza dei dati
   ===================================================================== */
/* n.3 — età di Livia (L) e Teo (T), interi da 1 a 100 */
{
  const sc = []; for (let l = 1; l <= 100; l++) for (let t = 1; t <= 100; t++) sc.push({ l, t });
  const s1 = s => s.l === s.t + 6, s2 = s => s.l + 4 + s.t + 4 === 30;
  verificaIdx(3, suff(sc, s1, s2, s => s.l), 'DS età di Livia');
  compatibili(3, sc, s1, s2);
}
/* n.11 — x > y ? coppie di interi (zero e valori uguali compresi) */
{
  const sc = []; for (let x = -12; x <= 12; x++) for (let y = -12; y <= 12; y++) sc.push({ x, y });
  const s1 = s => s.x * s.x > s.y * s.y, s2 = s => s.x > 0 && s.y < 0;
  verificaIdx(11, suff(sc, s1, s2, s => s.x > s.y), 'DS x > y');
  compatibili(11, sc, s1, s2);
}
/* n.23 — crescita % di A maggiore di quella di B? (confronto con prodotti incrociati: niente decimali) */
{
  const sc = [];
  for (const a0 of R(10, 400, 10)) for (const b0 of R(10, 400, 10)) for (const da of [10, 20, 30, 40, 50]) for (const db of [10, 20, 30, 40, 50]) sc.push({ a0, b0, da, db });
  // unità: migliaia di euro; (1) incrementi 30 e 20; (2) a0 = 2 · b0
  const s1 = s => s.da === 30 && s.db === 20, s2 = s => s.a0 === 2 * s.b0;
  verificaIdx(23, suff(sc, s1, s2, s => s.da * s.b0 > s.db * s.a0), 'DS crescita % di A su B');
  compatibili(23, sc, s1, s2);
}
/* n.32 — velocità media > 20 km/h ? distanza, tempo (h) e velocità massima; la massima non può essere sotto la media */
{
  const sc = [];
  for (const d of R(20, 120, 10)) for (const t of R(0.5, 6, 0.25)) for (const vmax of R(15, 60, 5)) if (vmax >= d / t - 1e-9) sc.push({ d, t, vmax });
  const s1 = s => s.d === 60 && s.t < 3, s2 = s => s.vmax === 35;
  verificaIdx(32, suff(sc, s1, s2, s => s.d / s.t > 20 + 1e-9), 'DS velocità media > 20');
  compatibili(32, sc, s1, s2);
}
/* n.44 — prezzo medio d'acquisto < 30 ? N capi, quota s dei capi a prezzo g, gli altri a prezzo medio p */
{
  const sc = [];
  for (const N of [50, 100, 200]) for (const s of [0.4, 0.5, 0.6, 0.7]) for (const g of [15, 25, 35]) for (const p of R(5, 80, 5)) sc.push({ N, s, g, p });
  const s1 = x => x.N === 100, s2 = x => near(x.s, 0.6) && x.g === 25;
  verificaIdx(44, suff(sc, s1, s2, x => x.s * x.g + (1 - x.s) * x.p < 30 - 1e-9), 'DS prezzo medio < 30');
  compatibili(44, sc, s1, s2);
  // due scenari che rispettano (1) e (2) con risposte diverse
  controllate++;
  const insieme = sc.filter(x => s1(x) && s2(x));
  if (!(insieme.some(x => x.s * x.g + (1 - x.s) * x.p < 30) && insieme.some(x => x.s * x.g + (1 - x.s) * x.p >= 30))) errori.push('n.44: sotto (1)+(2) la risposta non cambia');
}

/* =====================================================================
   Domande quantitative e Data Insights: ricalcolo indipendente
   ===================================================================== */
/* n.1 — giovedì + 100 giorni (si contano uno a uno) */
{
  const giorni = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
  let g = 3; for (let i = 0; i < 100; i++) g = (g + 1) % 7;
  verificaTesto(1, giorni[g]);
}
/* n.4 — gita: ricerca di n con 12n + 30 = 15n − 15 */
{
  let trovato = null;
  for (let n = 1; n <= 500; n++) if (12 * n + 30 === 15 * n - 15) trovato = n;
  verifica(4, trovato);
}
/* n.5 — prezzo medio della farina: chili = spesa / prezzo */
{
  const kg = D.farina.reduce((s, r) => s + r.spesa / r.prezzo, 0), spesa = D.farina.reduce((s, r) => s + r.spesa, 0);
  verifica(5, spesa / kg, { tol: 1e-9 });
  visibili(5, ...D.farina.flatMap(r => [r.f, r.spesa, r.prezzo.toFixed(2).replace('.', ',')]));
  // le due «medie sbagliate» valgono entrambe 3,00 e non coincidono con la risposta
  controllate++;
  const semplice = D.farina.reduce((s, r) => s + r.prezzo, 0) / 3;
  const pesataSpesa = D.farina.reduce((s, r) => s + r.prezzo * r.spesa, 0) / spesa;
  if (near(spesa / kg, semplice) || near(spesa / kg, pesataSpesa)) errori.push('n.5: la risposta coincide con una media sbagliata');
}
/* n.7 — torneo a eliminazione diretta con 16 squadre: simulazione dei turni */
{
  let squadre = 16, partite = 0;
  while (squadre > 1) { partite += Math.floor(squadre / 2); squadre = Math.ceil(squadre / 2); }
  verifica(7, partite);
}
/* n.8 — medie complessive nei due anni (dai dati della tabella) */
{
  const media = (anno) => D.sezioni.reduce((s, r) => s + r['n' + anno] * r['m' + anno], 0) / D.sezioni.reduce((s, r) => s + r['n' + anno], 0);
  const m1 = media(1), m2 = media(2);
  const entrambeSalgono = D.sezioni.every(r => r.m2 > r.m1);
  verificaPredicati(8, [
    m2 > m1 && entrambeSalgono,
    near(m1, m2),
    false,                                   // «non si può confrontare»: le medie e le numerosità bastano
    m2 < m1 && entrambeSalgono
  ], 'medie complessive');
  controllate++; if (!near(m1, 7.4) || !near(m2, 6.1)) errori.push(`n.8: medie ${m1} e ${m2}, attese 7,4 e 6,1`);
  visibili(8, ...D.sezioni.flatMap(r => [r.s, r.n1, r.n2, String(r.m1.toFixed(1)).replace('.', ','), String(r.m2.toFixed(1)).replace('.', ',')]), 'Anno 1', 'Anno 2');
}
/* n.10 — carte da 1 a 5: tutte le coppie non ordinate */
{
  let pari = 0, tot = 0;
  for (let a = 1; a <= 5; a++) for (let b = a + 1; b <= 5; b++) { tot++; if ((a + b) % 2 === 0) pari++; }
  verifica(10, pari / tot);
}
/* n.13 — password: si enumerano tutte le sequenze */
{
  let n = 0;
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) for (let d = 1; d <= 6; d++)
    if (new Set([a, b, c, d]).size === 4 && a % 2 === 1) n++;
  verifica(13, n);
}
/* n.14 — percorso critico: inizio più presto di ogni attività */
{
  const fine = (attivita) => {
    const f = {};
    const calc = a => {
      if (f[a.a] !== undefined) return f[a.a];
      const inizio = a.dopo.length ? Math.max(...a.dopo.map(x => calc(attivita.find(y => y.a === x)))) : 0;
      return f[a.a] = inizio + a.d;
    };
    attivita.forEach(calc);
    return Math.max(...Object.values(f));
  };
  const prima = fine(D.progetto);
  const dopo = fine(D.progetto.map(a => a.a === 'C' ? { ...a, d: 5 } : a));
  controllate++; if (prima !== 12) errori.push(`n.14: durata iniziale ${prima}, attesa 12`);
  verifica(14, dopo - prima, { leggi: lead });
  visibili(14, ...D.progetto.flatMap(a => [a.a, a.d]));
}
/* n.15 — 32 in bici, 25 con i mezzi pubblici su 50: si provano tutti i valori possibili di «entrambi» */
{
  const T = 50, B = 32, P = 25, casi = [];
  for (let k = 0; k <= Math.min(B, P); k++) {
    const soloB = B - k, soloP = P - k, nessuno = T - (soloB + soloP + k);
    if (nessuno >= 0) casi.push({ k, soloB });
  }
  const sempre = f => casi.every(f);
  verificaPredicati(15, [
    sempre(c => c.k <= 7),
    sempre(c => c.k === 7),
    sempre(c => c.soloB === 0),
    sempre(c => c.k >= 7)
  ], 'bici / mezzi pubblici');
  controllate++; if (Math.min(...casi.map(c => c.k)) !== 7 || Math.max(...casi.map(c => c.k)) !== 25) errori.push('n.15: intervallo di «entrambi» diverso da 7–25');
}
/* n.16 — dirigenti: ricerca del numero m con media generale 2.000 € */
{
  let trovato = null;
  for (let m = 1; m <= 300; m++) if (near((40 * 1600 + m * 4000) / (40 + m), 2000)) trovato = m;
  verifica(16, trovato);
}
/* n.17 — mediana: si espande l'elenco dei 150 soci */
{
  const elenco = D.soci.n.flatMap((c, i) => Array(c).fill(i));
  const m = (elenco.length % 2) ? elenco[(elenco.length - 1) / 2] : [elenco[elenco.length / 2 - 1], elenco[elenco.length / 2]];
  controllate++; if (Array.isArray(m) && m[0] !== m[1]) errori.push('n.17: i due soci centrali sono di classi diverse');
  const classeMediana = D.soci.classi[Array.isArray(m) ? m[0] : m];
  const moda = D.soci.classi[D.soci.n.indexOf(Math.max(...D.soci.n))];
  verificaTesto(17, classeMediana);
  controllate++; if (classeMediana === moda) errori.push('n.17: la mediana coincide con la moda');
  visibili(17, ...D.soci.n, ...D.soci.classi);
}
/* n.19 — a + b = 50, a² − b² = 500: tutte le coppie di interi */
{
  let a2 = null;
  for (let a = 1; a < 50; a++) { const b = 50 - a; if (a * a - b * b === 500) a2 = a; }
  verifica(19, a2);
}
/* n.20 — prezzo che massimizza il margine; il prezzo che massimizza i ricavi è diverso */
{
  const { prezzo, unita, costo } = D.prezzi;
  const margine = prezzo.map((p, i) => unita[i] * (p - costo)), ricavo = prezzo.map((p, i) => unita[i] * p);
  const pm = prezzo[margine.indexOf(Math.max(...margine))], pr = prezzo[ricavo.indexOf(Math.max(...ricavo))];
  verifica(20, pm);
  controllate++; if (pm === pr) errori.push('n.20: margine e ricavo massimi coincidono');
  visibili(20, ...prezzo, ...unita);
}
/* n.22 — chilometri con 48 litri */
{
  const kmA = 48 / 6 * 100, kmB = 48 / 8 * 100;
  verifica(22, kmA - kmB);
}
/* n.25 — ricarico 25% sul costo: guadagno sul prezzo di vendita */
{
  const costo = 100, prezzo = costo * 1.25;
  verifica(25, (prezzo - costo) / prezzo * 100, { tol: 0.05 });
}
/* n.26 — scuola di lingue: si enumerano tutte le distribuzioni compatibili e si prendono le proposizioni sempre vere */
{
  const { totale, tedesco, minCinese } = D.lingue;
  const casi = [];
  for (let c = 0; c <= totale; c++) {
    const e = 2 * c, s = totale - e - tedesco - c;
    if (c >= minCinese && s > tedesco) casi.push({ c, e, s, t: tedesco });
  }
  const sempre = f => casi.every(f);
  const veri = [sempre(x => x.e > x.s), sempre(x => x.s >= 22), sempre(x => x.c < x.t), sempre(x => x.e >= 20)];
  controllate++; if (casi.length === 0) errori.push('n.26: nessuna distribuzione compatibile');
  const etichetta = 'ABCD'.split('').filter((_, i) => veri[i]).join('');
  const testo = { B: 'Solo B', D: 'Solo D', BD: 'Solo B e D', ABD: 'Solo A, B e D', BCD: 'Solo B, C e D' }[etichetta];
  controllate++; if (etichetta !== 'BD') errori.push(`n.26: proposizioni sempre vere = ${etichetta}, attese BD`);
  verificaTesto(26, testo);
  controllate++; if (Math.min(...casi.map(x => x.s)) !== 22) errori.push('n.26: minimo dello spagnolo diverso da 22');
}
/* n.28 — quota degli stranieri */
{
  const pop = 1000, str = 200;
  verifica(28, (str * 1.32) / (pop * 1.10) * 100, { tol: 1e-9 });
}
/* n.29 — persone in bici sotto i 35 anni */
{
  const [g, a] = D.mezzi;
  const bg = g.n * g.bici / 100, ba = a.n * a.bici / 100;
  verifica(29, bg / (bg + ba) * 100, { tol: 1e-9 });
  D.mezzi.forEach(r => { controllate++; if (r.auto + r.pubblici + r.bici !== 100) errori.push(`n.29: le percentuali di «${r.g}» non sommano a 100`); });
  visibili(29, ...D.mezzi.flatMap(r => [r.g, r.n, r.auto + '%', r.pubblici + '%', r.bici + '%']));
}
/* n.31 — multipli di 4 o di 6 tra 1 e 30 */
{
  let k = 0; for (let x = 1; x <= 30; x++) if (x % 4 === 0 || x % 6 === 0) k++;
  verifica(31, k / 30);
}
/* n.34 — operai e ore: giorni necessari (ricerca per tentativi su d) */
{
  const lavoro = 6 * 8 * 10;
  let d = 1; while (5 * 6 * d < lavoro) d++;
  verifica(34, d);
}
/* n.35 — divisioni: si prova una gamma di fatturati 2024 per Gamma e si guardano le quattro affermazioni */
{
  const { pct, f2024 } = D.divisioni;
  const [fa, fb] = f2024;
  const gammas = R(10, 2000, 10);
  const sempre = f => gammas.every(f);
  const alfa25 = fa * (1 + pct[0] / 100), beta25 = fb * (1 + pct[1] / 100);
  verificaPredicati(35, [
    sempre(() => alfa25 > beta25),
    sempre(g => (alfa25 - fa) + (beta25 - fb) + g * pct[2] / 100 > 0),
    sempre(() => (beta25 - fb) > (alfa25 - fa)),
    sempre(g => g * (1 + pct[2] / 100) < g)
  ], 'divisioni');
  controllate++;   // B non è né sempre vera né sempre falsa: dipende da Gamma
  const b = gammas.map(g => (alfa25 - fa) + (beta25 - fb) + g * pct[2] / 100 > 0);
  if (!(b.some(x => x) && b.some(x => !x))) errori.push('n.35: l\'affermazione B non dipende da Gamma');
  visibili(35, ...D.divisioni.nomi, fa, fb);
}
/* n.37 — capogruppo + comitato: si enumerano tutte le scelte */
{
  const persone = [0, 1, 2, 3, 4, 5]; let n = 0;
  for (const capo of persone) n += comb(persone.filter(p => p !== capo), 2).length;
  verifica(37, n);
}
/* n.38 — rinunce complessive */
{
  const c = D.canali;
  const iscritti = c.quota.map(q => c.totale * q / 100), rinunce = iscritti.map((n, i) => n * c.rinuncia[i] / 100);
  const pct = rinunce.reduce((s, x) => s + x, 0) / c.totale * 100;
  verifica(38, pct, { tol: 1e-9 });
  controllate++; if (c.quota.reduce((s, x) => s + x, 0) !== 100) errori.push('n.38: le quote della torta non sommano a 100');
  const semplice3 = c.rinuncia.reduce((s, x) => s + x, 0) / 3, semplice2 = (c.rinuncia[0] + c.rinuncia[1]) / 2;
  controllate++; if (near(pct, semplice3) || near(pct, semplice2)) errori.push('n.38: la risposta coincide con una media semplice');
  visibili(38, ...c.nomi.map((n, i) => n + ' — ' + c.quota[i] + '%'));
}
/* n.39 — 55% di 800, poi un quarto (verdetto V/F/N) */
{
  const lavorano = 800 * 0.55, treGiorni = lavorano / 4;
  verificaVFN(39, treGiorni > 100 ? 'V' : 'F');
}
/* n.40 — cifra delle unità di 7^2026, calcolata con la potenza modulare (non con il ciclo) */
{
  let r = 1n; for (let i = 0; i < 2026; i++) r = (r * 7n) % 10n;
  verifica(40, Number(r));
}
/* n.41 — piani: da quale consumo il piano C costa meno di A e di B (tutti i consumi interi fino a 80 GB) */
{
  const costo = (p, x) => p.canone + (x > p.inclusi ? (x - p.inclusi) * p.extra : 0);
  const [A, B, Cc] = D.piani;
  const ok = x => costo(Cc, x) < costo(A, x) && costo(Cc, x) < costo(B, x);
  let soglia = null;
  for (let x = 80; x >= 0 && ok(x); x--) soglia = x;
  verifica(41, soglia - 1, { leggi: lead });   // «oltre 24» = il primo consumo in cui C conviene è 25
  controllate++; if (ok(24) || !ok(25)) errori.push('n.41: la soglia non è tra 24 e 25 GB');
  visibili(41, ...D.piani.map(p => p.p));
}
/* n.43 — voto minimo all'orale (ricerca sui voti interi) */
{
  let minimo = null;
  for (let x = 18; x <= 30; x++) if (0.6 * 22 + 0.4 * x >= 24 - 1e-9) { minimo = x; break; }
  verifica(43, minimo);
}
/* n.46 — amici nel furgone (inglese): ricerca per tentativi */
{
  let trovato = null;
  for (let n = 3; n <= 40; n++) if (near(240 / (n - 2) - 240 / n, 20)) trovato = n;
  verifica(46, trovato);
}
/* n.47 — scala mobile: velocità in scale al secondo */
{
  const scala = 1 / 40 - 1 / 60;
  verifica(47, 1 / scala, { tol: 1e-6 });
}
/* n.48 — conclusioni sui corsi: si provano tutti i modelli con 4 corsi (stat, obbligatorio, primo anno, propedeuticità) */
{
  const tipi = []; for (let m = 0; m < 16; m++) tipi.push({ st: !!(m & 1), ob: !!(m & 2), pa: !!(m & 4), pr: !!(m & 8) });
  const modelli = griglia(tipi, 4).filter(corsi =>
    corsi.every(c => !c.st || c.ob) &&                       // tutti i corsi di statistica sono obbligatori
    corsi.some(c => c.ob && c.pa) &&                          // alcuni obbligatori sono al primo anno
    corsi.every(c => !c.pa || !c.pr));                        // nessun corso del primo anno ha propedeuticità
  const sempre = f => modelli.every(f);
  verificaPredicati(48, [
    sempre(cs => cs.some(c => c.ob && !c.pr)),
    sempre(cs => cs.some(c => c.st && c.pa)),
    sempre(cs => cs.every(c => !c.st || !c.pr)),
    sempre(cs => cs.every(c => !c.ob || c.pa))
  ], 'quantificatori sui corsi');
  controllate++; if (modelli.length === 0) errori.push('n.48: nessun modello');
}
/* n.49 — espressione con frazioni, con numeri razionali esatti */
{
  const mcd = (a, b) => b === 0 ? a : mcd(b, a % b);
  const sub = (a, b) => { const n = a[0] * b[1] - b[0] * a[1], d = a[1] * b[1], g = mcd(Math.abs(n), d); return [n / g, d / g]; };
  const add = (a, b) => { const n = a[0] * b[1] + b[0] * a[1], d = a[1] * b[1], g = mcd(n, d); return [n / g, d / g]; };
  const num_ = add([1, 2], [1, 3]), den_ = sub([1, 2], [1, 3]);
  verifica(49, (num_[0] * den_[1]) / (num_[1] * den_[0]), { tol: 1e-9 });
}
/* n.50 — primo mese in cui B supera A, e di quanto */
{
  const { mesi, A, B } = D.risparmio;
  const i = mesi.findIndex((m, k) => B[k] > A[k]);
  controllate++; if (A[i - 1] !== B[i - 1]) errori.push('n.50: al mese precedente i saldi non sono uguali');
  verificaTesto(50, `Dopo ${mesi[i]} mesi, di ${B[i] - A[i]} €`);
  visibili(50, ...A, ...B);
}

/* =====================================================================
   Verbale con numeri: vero / falso / non deducibile
   ===================================================================== */
/* n.2 — da 42 a 30: il calo supera un terzo? */
{
  verificaVFN(2, (42 - 30) / 42 > 1 / 3 ? 'V' : 'F');
}
/* n.12 — ricorso 28 giorni dopo la chiusura: si provano tutte le date possibili di pubblicazione e di ricorso */
{
  const possibili = new Set();
  for (let pubblicazione = 0; pubblicazione <= 15; pubblicazione++)
    for (let ricorso = 0; ricorso <= 10; ricorso++) possibili.add(pubblicazione + ricorso);
  verificaVFN(12, possibili.has(28) ? 'V' : 'F');
  controllate++; if (Math.max(...possibili) !== 25) errori.push('n.12: il massimo non è 25 giorni');
}
/* n.33 — laureati occupati nel 2020 e nel 2025 */
{
  verificaVFN(33, 0.40 * 600 > 0.30 * 1000 ? 'V' : 'F');
}

/* =====================================================================
   Esito
   ===================================================================== */
if (errori.length) {
  console.log(`\n${errori.length} problema/i su ${controllate} controlli:\n`);
  errori.forEach(e => console.log('  × ' + e));
  process.exit(1);
}
console.log(`\nMock 12: tutti i ${controllate} controlli passano (conti, scenari di sufficienza dei dati, modelli logici, numeri visibili negli asset).\n`);
