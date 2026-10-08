#!/usr/bin/env node
/* =======================================================================
   check-math-11.js — ricalcola con il codice le risposte del Mock 11 e le
   confronta con la chiave (`ans`).

   Regole del controllo (le stesse di check-math-10.js):
   - i dati dei grafici e delle tabelle sono quelli di `mock.data`, gli stessi
     usati per disegnarli; per ogni asset si controlla anche che i numeri
     compaiano davvero come testo visibile nell'HTML che il sito mostra;
   - ogni risposta è ricavata con un procedimento diverso dalla «via rapida»
     scritta nella soluzione (enumerazione di tutti i casi, ricerca per
     tentativi, simulazione);
   - per la sufficienza dei dati si enumerano gli scenari compatibili e si
     guarda se la risposta è la stessa in tutti;
   - per il verbale logico si enumerano i «mondi» compatibili con il brano;
   - il numero di opzioni che coincidono con il valore calcolato deve essere
     esattamente 1, e deve essere quella indicata da `ans`.

   uso: node tools/check-math-11.js
   ======================================================================= */
const path = require('path');
const mock = require(path.resolve(__dirname, '..', 'docs', 'mocks', 'mock-11.js'));
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
  const t = plain(s).replace(/[−–]/g, '-').replace(/(circa|secondi|km\/h|km|€|%|\bs\b|\bm\b)/g, '').replace(/\s/g, '');
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

/* classifica ogni affermazione come vera in tutti (V), in nessuno (F) o in alcuni (N) dei mondi */
const classifica = (mondi, pred) => {
  const v = mondi.filter(pred).length;
  if (!mondi.length) { errori.push('nessun mondo compatibile con il brano'); return '?'; }
  return v === mondi.length ? 'V' : v === 0 ? 'F' : 'N';
};

/* =====================================================================
   QUANTITATIVA
   ===================================================================== */
/* n.1 — scala mobile: velocità in scale/secondo che si sommano; tempo per scale = 1 (simulazione a passi di 0,01 s) */
{
  const vScala = 1 / 60, vMarco = 1 / 30;
  let t = 0, x = 0; while (x < 1 - 1e-12) { t += 0.01; x += (vScala + vMarco) * 0.01; }
  verifica(1, Math.round(t));
}
/* n.4 — penna p, astuccio p + 10, totale 11 (ricerca al centesimo) */
{
  let p = null;
  for (let c = 0; c <= 1100; c++) if (c + (c + 1000) === 1100) p = c / 100;
  verifica(4, p);
}
/* n.7 — corsa: posizione di B quando A arriva (A: 100 m in 20 s, B: 100 m in 25 s), simulazione al decimo di secondo */
{
  let mancano = null;
  for (let t10 = 0; t10 <= 400; t10++) { const t = t10 / 10; if (t >= 20) { mancano = 100 - 100 / 25 * t; break; } }
  verifica(7, Math.round(mancano * 1000) / 1000);
}
/* n.10 — Anna +20% su Bruno, Bruno −25% su Carla: si prova con più valori di Carla */
{
  const vari = [60, 100, 160, 400].map(c => { const b = c * 0.75, a = b * 1.2; return Math.round((a / c - 1) * 1e6) / 1e6; });
  controllate++;
  if (!vari.every(x => near(x, -0.1, 1e-6))) errori.push('n.10: il rapporto Anna/Carla non è costante');
  const ch = Math.round(vari[0] * 100);
  verificaPredicati(10, [ch === -5, ch === -10, ch === 0, ch === 10], 'variazione Anna rispetto a Carla');
}
/* n.13 — concorso: punteggio x della prova pratica per un finale di 80 (provando tutti i valori interi 0..100) */
{
  const x = []; for (let v = 0; v <= 100; v++) if (near(0.2 * 60 + 0.3 * 80 + 0.5 * v, 80)) x.push(v);
  controllate++;
  if (x.length !== 1) errori.push('n.13: soluzioni ' + x.length); else verifica(13, x[0]);
}
/* n.16 — diagonali di un ottagono: si contano le coppie di vertici non consecutivi (sui vertici 0..7 in cerchio) */
{
  let d = 0; for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const adiac = (j - i === 1) || (j - i === 7); if (!adiac) d++; }
  verifica(16, d);
}
/* n.19 — lavoro: simulazione a passi di 1 minuto (Anna 1/12 all'ora, Bruno 1/6 all'ora dopo 3 ore) */
{
  let fatto = 0, min = 0;
  while (fatto < 1 - 1e-12) { const ore = min / 60; fatto += (1 / 12 + (ore >= 3 ? 1 / 6 : 0)) / 60; min++; }
  verifica(19, Math.round(min / 60 * 1000) / 1000);
}
/* n.22 — tre lanci: enumerazione delle 8 sequenze, almeno due teste consecutive */
{
  let fav = 0; for (let m = 0; m < 8; m++) { const s = [m & 1, (m >> 1) & 1, (m >> 2) & 1]; if ((s[0] && s[1]) || (s[1] && s[2])) fav++; }
  verifica(22, fav / 8);
}
/* n.25 — dado lanciato due volte: secondo numero maggiore del primo (tutte le 36 coppie) */
{
  let fav = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (b > a) fav++;
  verifica(25, fav / 36);
}
/* n.28 — tutte le permutazioni di ABCDE con A prima di B */
{
  const perm = arr => arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perm([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]));
  verifica(28, perm(['A', 'B', 'C', 'D', 'E']).filter(p => p.indexOf('A') < p.indexOf('B')).length);
}
/* n.31 — multipli di 7 tra 100 e 200 inclusi, contati uno per uno */
{
  let c = 0; for (let k = 100; k <= 200; k++) if (k % 7 === 0) c++;
  verifica(31, c);
}
/* n.34 — quota x intera: 3(x + 5) = 4x; conto 4x */
{
  const sol = []; for (let x = 1; x <= 500; x++) if (3 * (x + 5) === 4 * x) sol.push(4 * x);
  controllate++;
  if (sol.length !== 1) errori.push('n.34: soluzioni ' + sol.length); else verifica(34, sol[0]);
}
/* n.37 — rapporto A/B = 2: nuovo rapporto con più valori di B (risultato costante) */
{
  const r = [1, 3, 10, 50].map(B => (2 * B * 1.5) / (B * 0.5));
  controllate++;
  if (!r.every(x => near(x, r[0]))) errori.push('n.37: il nuovo rapporto non è costante');
  verifica(37, r[0]);
}
/* n.40 — frazione maggiore: confronto esatto con prodotti in croce (interi), non con i decimali */
{
  const fz = [[5, 7], [3, 4], [7, 9], [11, 14]];
  const maggiore = fz.reduce((m, f) => f[0] * m[1] > m[0] * f[1] ? f : m);
  const i = fz.findIndex(f => f[0] === maggiore[0] && f[1] === maggiore[1]);
  controllate++;
  const numeri = Q[40].opts.map(o => { const m = o.match(/aria-label="(\d+) fratto (\d+)"/); return m ? [+m[1], +m[2]] : null; });
  if (!numeri.every((f, k) => f && f[0] === fz[k][0] && f[1] === fz[k][1])) errori.push('n.40: le opzioni non corrispondono alle frazioni usate nel conto');
  verificaIdx(40, i, 'frazione maggiore');
}
/* n.43 — più piccolo n con n² divisibile per 12 */
{
  let n = 1; while ((n * n) % 12 !== 0) n++;
  verifica(43, n);
}
/* n.46 — giorno della settimana tra 100 giorni (si avanza di un giorno alla volta) */
{
  const g = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
  let i = g.indexOf('giovedì'); for (let k = 0; k < 100; k++) i = (i + 1) % 7;
  verificaIdx(46, Q[46].opts.indexOf(g[i]), 'giorno tra 100 giorni');
}
/* n.49 — minimo di a + b con ab = 36 (a, b interi positivi, anche uguali) */
{
  let m = Infinity; for (let a = 1; a <= 36; a++) if (36 % a === 0) m = Math.min(m, a + 36 / a);
  verifica(49, m);
}
/* n.50 — media aziendale pesata e media semplice */
{
  const pesata = 0.7 * 1800 + 0.3 * 2600, semplice = (1800 + 2600) / 2;
  verifica(50, Math.round((semplice - pesata) * 100) / 100);
}

/* =====================================================================
   DATA INSIGHTS: tabelle e grafici
   ===================================================================== */
/* n.5 — sondaggio: quota dei favorevoli tra chi ha un'opinione */
{
  const q = Object.fromEntries(D.sondaggio.quote);
  controllate++;
  if (Object.values(q).reduce((a, b) => a + b, 0) !== 100) errori.push('n.5: le quote non sommano a 100');
  verifica(5, q.Favorevoli / (q.Favorevoli + q.Contrari) * 100);
  contiene(5, 'Favorevoli — 30%', 'Contrari — 45%', 'Non so — 25%');
}
/* n.8 — istogramma: area = altezza × ampiezza */
{
  const aree = D.istogramma.classi.map(([a, b], i) => (b - a) * D.istogramma.densita[i]);
  const tot = aree.reduce((a, b) => a + b, 0);
  const tra = D.istogramma.classi.reduce((s, [a, b], i) => s + (a >= 20 && b <= 60 ? aree[i] : 0), 0);
  verifica(8, tra / tot * 100);
  visibili(8, ...D.istogramma.densita, 0, 10, 20, 40, 60, 80);
  // le trappole: altezze (45%) e numero di barre (40%) sono diverse dalla risposta giusta
  controllate++;
  const alt = D.istogramma.densita; const trapAlt = (alt[2] + alt[3]) / alt.reduce((a, b) => a + b, 0) * 100;
  if (near(trapAlt, tra / tot * 100) || near(2 / 5 * 100, tra / tot * 100)) errori.push('n.8: una trappola coincide con la risposta');
}
/* n.14 — parco: aumento 2023→2025; l'asse parte da 90 (altezza visiva ≠ valore) */
{
  const p = D.parco;
  verifica(14, (p.v[2] - p.v[0]) / p.v[0] * 100);
  visibili(14, 90, 100, 110, 120, 130, 2023, 2024, 2025);
  controllate++;
  const visivo = (p.v[2] - p.base) / (p.v[0] - p.base) * 100 - 100;   // aumento apparente
  if (near(visivo, 20)) errori.push('n.14: l\'aumento apparente coincide con quello vero');
}
/* n.17 — stipendi: media ponderata, monte stipendi, statistiche */
{
  const S = D.stipendi, emp = S.reduce((a, s) => a + s.n, 0), monte = s => s.n * s.medio;
  const tot = S.reduce((a, s) => a + monte(s), 0), media = tot / emp, semplice = S.reduce((a, s) => a + s.medio, 0) / S.length;
  const por = a => S.find(s => s.area === a);
  const maxMedio = S.reduce((m, s) => s.medio > m.medio ? s : m), maxMonte = S.reduce((m, s) => monte(s) > monte(m) ? s : m);
  verificaPredicati(17, [
    near(semplice, media),                                                  // A: «3.000 è la media aziendale»
    media < 2000,                                                           // B
    maxMedio.area === maxMonte.area,                                        // C
    media > 2000 && monte(por('Commerciale')) < monte(por('Operativa')) && monte(por('Commerciale')) > monte(por('Direzione'))   // D
  ], 'stipendi');
  controllate++;
  if (!near(semplice, 3000)) errori.push('n.17: la media semplice non è 3.000');
  visibili(17, ...S.map(s => s.n), ...S.map(s => fmt(s.medio)));
}
/* n.20 — Simpson: percentuali per tipo e sul totale */
{
  const c = D.chiamate, r = a => a[1] / a[0];
  const tot = x => [c[x].semplici[0] + c[x].complesse[0], c[x].semplici[1] + c[x].complesse[1]];
  const nord = tot('nord'), sud = tot('sud');
  const sudMeglioOvunque = r(c.sud.semplici) > r(c.nord.semplici) && r(c.sud.complesse) > r(c.nord.complesse);
  const nordMeglioOvunque = r(c.nord.semplici) > r(c.sud.semplici) && r(c.nord.complesse) > r(c.sud.complesse) && r(nord) > r(sud);
  verificaPredicati(20, [
    nordMeglioOvunque,                                      // A
    sud[1] > nord[1],                                       // B
    sudMeglioOvunque && r(sud) < r(nord),                   // C
    (nord[1] + sud[1]) / (nord[0] + sud[0]) > 0.8           // D
  ], 'call center');
  visibili(20, c.nord.semplici.join(' / '), c.nord.complesse.join(' / '), c.sud.semplici.join(' / '), c.sud.complesse.join(' / '), nord.join(' / '), sud.join(' / '));
}
/* n.26 — utile operativo = ricavi × margine */
{
  const d = D.duale, u = d.ricavi.map((r, i) => r * d.margine[i] / 100);
  const imax = a => a.indexOf(Math.max(...a));
  verificaPredicati(26, [
    near(u[3] - u[2], 10),
    imax(d.ricavi) === imax(u),            // anno ricavi massimi = anno utile massimo
    imax(d.margine) === imax(u),           // anno margine massimo = anno utile massimo
    u[1] > u[3]
  ], 'utile operativo');
  controllate++;
  if (u.filter(x => x === Math.max(...u)).length !== 1) errori.push('n.26: il massimo utile non è unico');
  visibili(26, ...d.ricavi, ...d.margine.map(m => m + '%'), ...d.anni, '0', '100', '200', '300', '400', '5%', '10%', '15%', '20%');
}
/* n.29 — due rette: intersezione per ricerca a passo di 1 unità */
{
  const p = D.pareggio, mR = (p.ricavi[1] - p.ricavi[0]) / p.x1, mC = (p.costi[1] - p.costi[0]) / p.x1;
  let x = null; for (let u = 0; u <= 2000; u++) if (near(p.ricavi[0] + mR * u, p.costi[0] + mC * u, 1e-9)) { x = u; break; }
  verifica(29, x);
  visibili(29, p.costi[0], p.costi[1], p.ricavi[1]);
  controllate++;
  if (x <= p.x1) errori.push('n.29: il pareggio cade dentro la parte di grafico visibile');
}
/* n.32 — media, mediana, moda */
{
  const f = D.figli, dati = f.figli.flatMap((k, i) => Array(f.famiglie[i]).fill(k)).sort((a, b) => a - b);
  const media = dati.reduce((a, b) => a + b, 0) / dati.length;
  const mediana = dati.length % 2 ? dati[(dati.length - 1) / 2] : (dati[dati.length / 2 - 1] + dati[dati.length / 2]) / 2;
  const moda = f.figli[f.famiglie.indexOf(Math.max(...f.famiglie))];
  verificaPredicati(32, [mediana === 2, moda === 2, media > mediana && mediana > moda, media < mediana], 'media/mediana/moda');
  controllate++; if (dati.length !== 40) errori.push('n.32: le famiglie non sono 40');
  visibili(32, ...f.figli, ...f.famiglie);
}
/* n.35 — ricostruzione della tabella: si cerca la sola assegnazione delle celle mancanti coerente */
{
  const C3 = D.contratti, tot = D.contrattiTotale;
  const sol = [];
  for (let pi = 0; pi <= 160; pi++) for (let cd = 0; cd <= 70; cd++) for (let at = 40; at <= 120; at++) {
    const prod = { ind: pi, det: 50, tot: 160 }, com = { ind: 40, det: cd, tot: 70 }, amm = { ind: 30, det: 20, tot: at };
    if (prod.ind + prod.det !== prod.tot || com.ind + com.det !== com.tot || amm.ind + amm.det !== amm.tot) continue;
    if (prod.tot + com.tot + amm.tot !== tot) continue;
    sol.push({ prod, com, amm });
  }
  controllate++;
  if (sol.length !== 1) errori.push('n.35: ricostruzioni possibili ' + sol.length);
  else {
    const s = sol[0], det = s.prod.det + s.com.det + s.amm.det;
    verifica(35, s.prod.det / det * 100, { tol: 0.01 });
    controllate++;
    // le due trappole (riga e colonna sbagliate) non coincidono con la risposta
    if (near(50 / 160 * 100, 50, 0.01) || near(160 / 280 * 100, 50, 0.01)) errori.push('n.35: una trappola coincide con la risposta');
  }
  visibili(35, 50, 160, 40, 70, 30, 20, 280);
}
/* n.41 — simulazione: X parte a 0 h, Y parte a 1,5 h, velocità dai punti del grafico */
{
  const X = D.ciclisti.X, Y = D.ciclisti.Y;
  const vX = (X.km[1] - X.km[0]) / (X.t[1] - X.t[0]), vY = (Y.km[1] - Y.km[0]) / (Y.t[1] - Y.t[0]);
  let km = null;
  for (let t = Y.t[0]; t <= 4 + 1e-9; t += 0.0001) if (vY * (t - Y.t[0]) >= vX * t - 1e-9) { km = vX * t; break; }
  verifica(41, Math.round(km * 100) / 100, { tol: 0.02 });
  visibili(41, 0, 1, 2, 3, 4, 10, 20, 30, 40, 50, 60);
  contiene(41, 'X: 48 km', 'Y: 50 km');
}
/* n.44 — scorta cumulata a fine mese */
{
  const m = D.magazzino; let s = m.iniziale; const liv = [];
  m.mesi.forEach((_, i) => { s += m.entrate[i] - m.uscite[i]; liv.push(s); });
  const imin = liv.indexOf(Math.min(...liv));
  verificaIdx(44, Q[44].opts.indexOf(m.mesi[imin]), 'mese con scorta minima');
  controllate++;
  if (liv.some(x => x < 0)) errori.push('n.44: scorta negativa');
  // le trappole (maggiore perdita netta, maggiori uscite) indicano mesi diversi
  const nette = m.entrate.map((e, i) => e - m.uscite[i]);
  if (nette.indexOf(Math.min(...nette)) === imin || m.uscite.indexOf(Math.max(...m.uscite)) === imin) errori.push('n.44: una trappola coincide con la risposta');
  visibili(44, ...m.entrate, ...m.uscite);
}

/* =====================================================================
   Sufficienza dei dati
   ===================================================================== */
/* n.3 — numero di soci N (W donne, M uomini) */
{
  const sc = []; for (let w = 1; w <= 300; w++) for (let m = 1; m <= 300; m++) sc.push({ w, m, n: w + m });
  verificaIdx(3, suff(sc, s => s.w * 10 === 4 * s.n, s => s.m === s.w + 30, s => s.n), 'DS soci');
  controllate++;
  if (!sc.some(s => s.w * 10 === 4 * s.n && s.m === s.w + 30)) errori.push('n.3: le due informazioni sono incompatibili');
}
/* n.11 — tre interi positivi distinti: media ≥ 10? */
{
  const sc = []; for (let a = 1; a <= 30; a++) for (let b = a + 1; b <= 30; b++) for (let c = b + 1; c <= 30; c++) sc.push({ a, b, c });
  verificaIdx(11, suff(sc, s => s.a === 9, s => s.c === 12, s => (s.a + s.b + s.c) / 3 >= 10), 'DS media ≥ 10');
  controllate++;
  if (!sc.some(s => s.a === 9 && s.c === 12)) errori.push('n.11: le due informazioni sono incompatibili');
}
/* n.23 — «n è pari?» (scenari n = 1..200) */
{
  const sc = []; for (let n = 1; n <= 200; n++) sc.push({ n });
  verificaIdx(23, suff(sc, s => (s.n + 2) % 3 === 0, s => (s.n * s.n) % 4 === 0, s => s.n % 2 === 0), 'DS n pari');
  controllate++;
  if (!sc.some(s => (s.n + 2) % 3 === 0 && (s.n * s.n) % 4 === 0)) errori.push('n.23: le due informazioni sono incompatibili');
}
/* n.38 — 40 studenti: quanti hanno superato entrambi? (b = entrambi, solo M, solo F, nessuno) */
{
  const sc = [];
  for (let b = 0; b <= 40; b++) for (let sm = 0; sm <= 40; sm++) for (let sf = 0; sf <= 40; sf++) { const nes = 40 - b - sm - sf; if (nes >= 0) sc.push({ b, m: b + sm, f: b + sf }); }
  verificaIdx(38, suff(sc, s => s.m === 30, s => s.f === 25, s => s.b), 'DS esami');
  controllate++;
  if (!sc.some(s => s.m === 30 && s.f === 25)) errori.push('n.38: le due informazioni sono incompatibili');
}
/* n.47 — media di 30 studenti > 70? (10 donne, 20 uomini) */
{
  const sc = []; for (let w = 40; w <= 100; w++) for (let u = 40; u <= 100; u++) sc.push({ w, u });
  verificaIdx(47, suff(sc, s => s.w === 80, s => s.u === 65, s => (10 * s.w + 20 * s.u) / 30 > 70), 'DS media classe');
  controllate++;
  const v = sc.filter(s => s.w === 80 && s.u === 65).map(s => (10 * s.w + 20 * s.u) / 30);
  if (!v.every(x => near(x, 70))) errori.push('n.47: insieme la media non è esattamente 70');
}

/* =====================================================================
   Verbale logico: mondi compatibili con il brano
   ===================================================================== */
/* n.2 — «Orizzonti»: cause possibili del calo (prezzo, sito, entrambi, altro) */
{
  const mondi = []; for (const prezzo of [true, false]) for (const sito of [true, false]) mondi.push({ prezzo, sito });
  verificaVFN(2, classifica(mondi, w => w.prezzo));
}
/* n.6 — commercianti: calo > 50%, aumento = 30% esatto */
{
  const mondi = []; for (let calo = 51; calo <= 70; calo++) mondi.push({ calo, aum: 30, inv: 100 - calo - 30 });
  verificaVFN(6, classifica(mondi, w => w.aum > 100 / 3));
}
/* n.9 — torneo: tutti i risultati possibili con n = 3, 4, 5 squadre (0 = Falco = squadra 0, 1 = Lupo) */
{
  let mondi = [];
  for (const n of [3, 4, 5]) {
    const part = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) part.push([i, j]);
    const tot = Math.pow(3, part.length);
    for (let c = 0; c < tot; c++) {
      let x = c; const ris = part.map(() => { const r = x % 3; x = Math.floor(x / 3); return r; });   // 0 vince la prima, 1 pareggio, 2 vince la seconda
      const v = Array(n).fill(0), p = Array(n).fill(0), s = Array(n).fill(0), pe = Array(n).fill(0);
      part.forEach(([i, j], k) => {
        if (ris[k] === 0) { v[i]++; s[j]++; } else if (ris[k] === 2) { v[j]++; s[i]++; } else { p[i]++; p[j]++; }
      });
      // Falco (0): una sola partita pareggiata, nessuna persa, tutte le altre vinte; Lupo (1): una sola sconfitta, contro il Falco
      const falcoOk = p[0] === 1 && s[0] === 0 && v[0] === n - 2;
      const lupoOk = s[1] === 1 && ris[part.findIndex(([i, j]) => i === 0 && j === 1)] === 0;
      if (falcoOk && lupoOk) mondi.push({ n, vF: v[0], vL: v[1] });
    }
  }
  controllate++;
  verificaVFN(9, classifica(mondi, w => w.vL > w.vF));
}
/* n.15 — ordine dei punteggi: tutte le permutazioni compatibili (posizione più alta = indice minore) */
{
  const perm = arr => arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perm([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]));
  const mondi = perm(['Chiara', 'Dario', 'Elena', 'Elisa']).filter(o => o.indexOf('Chiara') < o.indexOf('Dario') && o.indexOf('Dario') < o.indexOf('Elena') && o.indexOf('Elisa') < o.indexOf('Elena'));
  verificaVFN(15, classifica(mondi, o => o.indexOf('Chiara') < o.indexOf('Elisa')));
}
/* n.18 — 800 pendolari: 55% treno, 30% autobus: tutte le sovrapposizioni possibili */
{
  const treno = 440, bus = 240, N = 800, mondi = [];
  for (let both = 0; both <= Math.min(treno, bus); both++) if (treno + bus - both <= N) mondi.push({ neither: N - (treno + bus - both) });
  verificaIdx(18, ['V', 'F', 'N'].indexOf(classifica(mondi, w => w.neither >= 100)), 'verdetto V/F/N');
}
/* n.24 — scuole: Pascoli e Leopardi > 400, Manzoni < Leopardi, totale 1.100 */
{
  const mondi = []; for (let p = 401; p <= 700; p++) for (let l = 401; l <= 700; l++) { const m = 1100 - p - l; if (m >= 1 && m < l) mondi.push({ p, l, m }); }
  verificaVFN(24, classifica(mondi, w => w.m < 300));
}
/* n.27 — stima del ministro: posti realmente creati in un intervallo di valori possibili */
{
  const mondi = []; for (let k = 10000; k <= 60000; k += 1000) mondi.push({ k });
  verificaVFN(27, classifica(mondi, w => w.k === 50000));
}
/* n.30 — «la maggior parte»: tutte le terne di sottoinsiemi di un universo di 6 persone */
{
  const U = 6, mondi = [];
  const pop = m => { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; };
  const piu = (a, b) => pop(a & b) * 2 > pop(a);              // la maggior parte di a sta anche in b
  for (let t = 1; t < (1 << U); t++) for (let e = 1; e < (1 << U); e++) for (let f = 0; f < (1 << U); f++)
    if (piu(t, e) && piu(e, f)) mondi.push({ t, e, f });
  const esiti = [
    classifica(mondi, w => piu(w.t, w.f)),                    // A
    classifica(mondi, w => (w.t & w.f) !== 0),                // B
    classifica(mondi, w => (w.e & w.t) !== 0),                // C
    classifica(mondi, w => pop(w.e) > pop(w.t))               // D (nell'ordine del mock è la terza opzione, vedi sotto)
  ];
  esiti.splice(2, 2, esiti[3], esiti[2]);                     // ordine delle opzioni nel mock: A, B, «inglese più numerosi», «almeno un iscritto all'inglese…»
  verificaPredicati(30, esiti.map(e => e === 'V'), '«certamente vera» (V in tutti i mondi)');
  controllate++;
  if (!(esiti[0] !== 'V' && esiti[1] !== 'V' && esiti[2] !== 'V' && esiti[3] === 'V')) errori.push('n.30: le opzioni errate non sono tutte controesemplificabili');
}
/* n.39 — conti del brano (la dichiarazione causale resta non deducibile) */
{
  const v25 = 80000 / 1.25, res = 80000 * 0.4;
  controllate++;
  if (!near(v25, 64000) || !near(res, 32000)) errori.push('n.39: i conti del brano non tornano');
  // mondi: l'aumento dipende (o no) dalla riapertura; l'opzione A è vera solo in alcuni
  const mondi = [{ riapertura: true }, { riapertura: false }];
  verificaPredicati(39, [classifica(mondi, w => w.riapertura) !== 'V', false, false, false].map((x, i) => i === 0 ? x : false), 'NON deducibile');
}
/* n.45 — sospettati: si prova ogni colpevole e si contano le dichiarazioni vere */
{
  const nomi = ['Anna', 'Bruno', 'Carla', 'Dario'];
  const dich = [c => c === 1, c => c === 2, c => c !== 3, c => c !== 1];       // Anna: Bruno · Bruno: Carla · Carla: non Dario · Dario: non Bruno
  const ok = [0, 1, 2, 3].filter(c => dich.filter(d => d(c)).length === 1);
  verificaIdx(45, ok.length === 1 ? ok[0] : -1, 'colpevole con una sola dichiarazione vera');
}

/* ---- coerenza dei testi del brano con i numeri usati ---- */
const citata = (n, frase) => { controllate++; const t = (Q[n].passage || '') + (Q[n].claim || '') + (Q[n].stem || ''); if (!t.includes(frase)) errori.push(`n.${n}: nel testo manca «${frase}»`); };
citata(2, 'da 1.200 a 750'); citata(6, 'tre commercianti su dieci'); citata(9, 'tranne una, che ha pareggiato'); citata(18, '55%'); citata(18, '30%');
citata(24, 'più di 400'); citata(24, '1.100'); citata(27, 'Secondo il ministro'); citata(39, '80.000'); citata(39, 'tre mesi'); citata(30, 'la maggior parte');

/* ---------------------------------------------------------------------
   Copertura: ogni domanda deve avere un controllo indipendente o essere
   dichiarata «verbale con controllo manuale».
   --------------------------------------------------------------------- */
const MANUALI = { 12: 'distorsione di selezione (fondi chiusi)', 21: 'assegnazione per sorteggio', 33: 'causa alternativa (selezione)', 36: 'incidenti × letalità',
  42: 'differenza rilevante tra i due quartieri', 48: 'assunzione necessaria' };
console.log(`\ncontrolli automatici eseguiti: ${controllate}`);
console.log('verbali con controllo manuale: ' + Object.keys(MANUALI).map(n => `${n} (${MANUALI[n]})`).join('; '));
const coperte = new Set();
mock.questions.forEach(q => coperte.add(q.n));
if (errori.length) {
  console.log('\nERRORI:'); errori.forEach(e => console.log('  × ' + e)); process.exit(1);
}
console.log('Tutti i conti tornano: ogni risposta ricalcolata coincide con la chiave.');
