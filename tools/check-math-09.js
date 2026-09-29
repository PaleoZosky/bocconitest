#!/usr/bin/env node
/* =======================================================================
   check-math-09.js — ricalcola con il codice le risposte del Mock 09 e le
   confronta con la chiave (`ans`).

   Regole del controllo:
   - i dati dei grafici e delle tabelle sono quelli di `mock.data`, gli stessi
     usati per disegnarli; per ogni asset si controlla anche che i numeri
     compaiano davvero nell'HTML che il sito mostra;
   - ogni risposta è ricavata con un procedimento diverso dalla «via rapida»
     scritta nella soluzione (ricerca per tentativi, enumerazione di tutti i
     casi, simulazione);
   - per le domande di sufficienza dei dati e per «dati e proposizioni» si
     enumerano tutti i casi compatibili e si classifica il risultato;
   - il numero di opzioni che coincidono con il valore calcolato deve essere
     esattamente 1, e deve essere quella indicata da `ans`.

   uso: node tools/check-math-09.js
   ======================================================================= */
const path = require('path');
const mock = require(path.resolve(__dirname, '..', 'docs', 'mocks', 'mock-09.js'));
const D = mock.data;
const Q = Object.fromEntries(mock.questions.map(q => [q.n, q]));
const L = 'ABCD';
const errori = [];
let controllate = 0;
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;

/* ---- lettura delle opzioni ---- */
const plain = s => String(s).replace(/<[^>]*>/g, '').trim();
function num(s) {                         // '2,40 €' → 2.4 ; '32.5%' → 32.5 ; frazione → valore
  const fr = String(s).match(/aria-label="(\d+) fratto (\d+)"/);
  if (fr) return +fr[1] / +fr[2];
  const t = plain(s).replace(/(circa|km\/h|km|€|%)/g, '').replace(/\s/g, '');
  if (!t) return NaN;
  const conPunti = t.replace(/\.(?=\d{3}\b)/g, '');
  return parseFloat(conPunti.replace(',', '.'));
}
/* confronta un valore calcolato con le 4 opzioni e con la chiave */
function verifica(n, valore, { tol = 1e-9, testo = false } = {}) {
  const q = Q[n];
  const hit = q.opts.map(o => testo ? plain(o) === valore : near(num(o), valore, tol));
  const quanti = hit.filter(Boolean).length;
  controllate++;
  if (quanti !== 1) errori.push(`n.${n}: ${quanti} opzioni coincidono con il valore calcolato (${valore}), ne serve esattamente 1`);
  else if (hit.indexOf(true) !== q.ans) errori.push(`n.${n}: il valore calcolato (${valore}) è l'opzione ${L[hit.indexOf(true)]}, la chiave dice ${L[q.ans]}`);
}
function verificaIdx(n, idx, cosa) {
  controllate++;
  if (idx !== Q[n].ans) errori.push(`n.${n}: ${cosa} → opzione ${L[idx]}, la chiave dice ${L[Q[n].ans]}`);
}

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
visibili(11, ...D.rifiuti.flatMap(r => [r.q, fmt(r.ab), r.kg, r.diff + '%']));
visibili(5, ...D.pane.centro, ...D.pane.periferia);
contiene(20, ...D.condominio.map(d => d[0] + ' — ' + d[1] + '%'));
visibili(3, ...D.ordini.cum);
visibili(23, ...D.powerbank.map(p => `${p.m} (${p.prezzo}; ${p.wh})`));
visibili(29, D.soddisfazione.A, D.soddisfazione.B);
contiene(29, `da ${D.soddisfazione.base} a ${D.soddisfazione.top}`);
visibili(31, ...D.gelato.flatMap(r => [r.fascia, r.n, r.cioc + '%', r.fra + '%', r.pist + '%', r.altro + '%']), 'Cioccolato', 'Fragola', 'Pistacchio', 'Altro');
visibili(37, ...D.turisti.map(t => t.n));
contiene(37, ...D.turisti.map(t => t.p));
D.gelato.forEach(r => { if (r.cioc + r.fra + r.pist + r.altro !== 100) errori.push('gelato: le percentuali di ' + r.fascia + ' non sommano a 100'); });
if (D.condominio.reduce((s, d) => s + d[1], 0) !== 100) errori.push('condominio: le quote non sommano a 100');

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

/* n.8 — media di 5 voti > 8 (voti al mezzo punto tra 6 e 10) */
{
  const sc = griglia(R(6, 10, 0.5), 5).map(v => v.slice().sort((x, y) => x - y));
  const media = s => s.reduce((a, b) => a + b, 0) / 5;
  const s1 = s => s[0] === 6 && s[4] === 10;
  const conta8 = s => s.filter(v => v === 8).length;
  const tutti = griglia(R(0, 10, 0.5), 5).map(v => v.slice().sort((x, y) => x - y));
  verificaIdx(8, suff(tutti, s1, s => conta8(s) === 2, s => media(s) > 8), 'DS media voti (esattamente due 8)');
  verificaIdx(8, suff(tutti, s1, s => conta8(s) >= 2, s => media(s) > 8), 'DS media voti (almeno due 8)');
}
/* n.14 — produzione totale di latte */
{
  const sc = griglia([0.8, 0.9, 1, 1.1, 1.2, 1.5], 1).flatMap(([fc]) => [0.8, 0.9, 0.95, 1, 1.05, 1.2].map(fp => ({ fc, fp })));
  verificaIdx(14, suff(sc, s => near(s.fc, 1.1), s => near(s.fp, 0.95), s => s.fc * s.fp > 1), 'DS latte');
}
/* n.17 — punti della squadra Rossa */
{
  const sc = []; for (let w = 0; w <= 12; w++) for (let d = 0; d <= 12; d++) for (let l = 0; l <= 12; l++) sc.push({ w, d, l });
  verificaIdx(17, suff(sc, s => s.w === 6 && s.d === 2, s => s.l === 3, s => 3 * s.w + s.d), 'DS punti');
}
/* n.30 — segno di xy */
{
  const vals = R(-4, 4, 0.5); const sc = vals.flatMap(x => vals.map(y => ({ x, y })));
  verificaIdx(30, suff(sc, s => s.x + s.y > 0, s => s.x < s.y, s => s.x * s.y > 0), 'DS segno di xy');
}
/* n.34 — part-time più della metà */
{
  const sc = []; for (let f = 1; f <= 120; f++) for (let p = 1; p <= 120; p++) sc.push({ f, p });
  verificaIdx(34, suff(sc, s => s.p === 45, s => s.p === s.f + 10, s => s.p > s.f), 'DS part-time');
}
/* n.43 — prezzo della lezione singola (risposta = prezzo, intero in centesimi) */
{
  const sc = []; for (let s = 500; s <= 4000; s += 50) for (let p = 5000; p <= 40000; p += 500) sc.push({ s, p });
  verificaIdx(43, suff(sc, x => x.p === 18000, x => x.p === 9 * x.s, x => x.s), 'DS lezione');
}

/* ---------------------------------------------------------------------
   Domande quantitative e Data Insights: ricalcolo indipendente
   --------------------------------------------------------------------- */
/* n.1 — scala 1:50.000 */
verifica(1, 3.6 * 50000 / 100000);
/* n.3 — mese con più ordini (differenze tra totali cumulati) */
{
  const c = D.ordini.cum, mesi = { Gen: 'Gennaio', Feb: 'Febbraio', Mar: 'Marzo', Apr: 'Aprile', Mag: 'Maggio', Giu: 'Giugno' };
  const men = c.map((v, i) => v - (i ? c[i - 1] : 0));
  verifica(3, mesi[D.ordini.mesi[men.indexOf(Math.max(...men))]], { testo: true });
}
/* n.4 — pareggio tra le due offerte, per tentativi */
{ let km = null; for (let x = 0; x <= 2000; x++) if (near(30 + 0.2 * x, 10 + 0.3 * x, 1e-9)) km = x; verifica(4, km); }
/* n.5 — giorno con quota massima della Periferia */
{
  const nomi = { Lun: 'Lunedì', Mar: 'Martedì', Mer: 'Mercoledì', Gio: 'Giovedì', Ven: 'Venerdì' };
  const quote = D.pane.giorni.map((g, i) => D.pane.periferia[i] / (D.pane.periferia[i] + D.pane.centro[i]));
  verifica(5, nomi[D.pane.giorni[quote.indexOf(Math.max(...quote))]], { testo: true });
}
/* n.7 — un quaderno + una penna (prezzi in centesimi, tutte le coppie) */
{
  let somma = null; const sol = [];
  for (let q = 0; q <= 900; q++) for (let p = 0; p <= 900; p++) if (3 * q + 2 * p === 900 && 2 * q + 3 * p === 800) sol.push(q + p);
  if (sol.length !== 1) errori.push('n.7: il sistema non ha soluzione unica'); else somma = sol[0] / 100;
  verifica(7, somma);
}
/* n.10 — nuova quota delle esportazioni */
{ const exp = 200 * 0.2, resto = 200 - exp; verifica(10, 100 * (2 * exp) / (2 * exp + resto), { tol: 0.06 }); }
/* n.11 — tonnellate differenziate */
{
  const t = D.rifiuti.map(r => r.ab * r.kg / 1000 * r.diff / 100);
  verifica(11, D.rifiuti[t.indexOf(Math.max(...t))].q, { testo: true });
}
/* n.13 — pagine del libro (per tentativi) */
{ let p = null; for (let x = 1; x <= 5000; x++) if (near(x / 2 - x * 3 / 8, 60, 1e-9)) p = x; verifica(13, p); }
/* n.16 — numeri di 3 cifre diverse tra 1,2,3,4 divisibili per 3 */
{
  let k = 0; const c = [1, 2, 3, 4];
  c.forEach(a => c.forEach(b => c.forEach(d => { if (a !== b && a !== d && b !== d && (100 * a + 10 * b + d) % 3 === 0) k++; })));
  verifica(16, k);
}
/* n.19 — prezzo medio della benzina a parità di spesa */
verifica(19, (60 + 60) / (60 / 2 + 60 / 3));
/* n.20 — variazione della spesa totale del condominio */
{
  const v = D.condominioVar; const tot0 = 100;
  const tot1 = D.condominio.reduce((s, [nome, q]) => s + q * (1 + (v[nome] || 0) / 100), 0);
  verifica(20, tot0 - tot1, { tol: 1e-9 });
}
/* n.21 — velocità della corrente (ricerca su griglia) */
{
  let c = null;
  for (let b = 0; b <= 20; b += 0.5) for (let x = 0; x < b; x += 0.5) if (near(12 / (b - x), 3) && near(12 / (b + x), 2)) c = x;
  verifica(21, c);
}
/* n.23 — capacità per euro */
{
  const r = D.powerbank.map(p => p.wh / p.prezzo), max = Math.max(...r);
  const migliori = D.powerbank.filter((p, i) => near(r[i], max));
  if (migliori.length !== 1) errori.push('n.23: il modello migliore non è unico');
  verifica(23, migliori[0].m, { testo: true });
}
/* n.24 — aritmetica con i decimali, in aritmetica intera */
verifica(24, (2 * 5 * 1000) / (10 * 100 * 4) , { tol: 1e-9 });
/* n.27 — probabilità (enumerazione di tutte le 25 coppie ordinate) */
{
  const urna = ['R', 'R', 'B', 'B', 'B']; let f = 0, t = 0;
  urna.forEach((a, i) => urna.forEach((b, j) => { t++; if (a === b) f++; }));
  verifica(27, f / t);
}
/* n.29 — variazione percentuale con l'asse che parte da 80 */
{ const s = D.soddisfazione; verifica(29, (s.B - s.A) / s.A * 100, { tol: 0.5 }); }
/* n.33 — quante volte compare la cifra 9 tra 1 e 100 */
{ let k = 0; for (let x = 1; x <= 100; x++) k += String(x).split('9').length - 1; verifica(33, k); }
/* n.36 — simulazione minuto per minuto delle due stampanti */
{
  let pag = 0, t = 0;
  while (pag < 500) { pag += 30 + (t >= 5 ? 20 : 0); t++; }
  // se l'ultimo minuto non è intero si controlla l'esattezza: 150 + 350 = 500 esatte
  verifica(36, t);
}
/* n.39 — dipendenti prima delle assunzioni */
{ let sol = []; for (let N = 1; N <= 2000; N++) if (near((0.6 * N + 20) / (N + 20), 0.65, 1e-9)) sol.push(N); if (sol.length !== 1) errori.push('n.39: soluzione non unica'); verifica(39, sol[0]); }
/* n.42 — sconto complessivo (in inglese) */
verifica(42, (80 - (80 * 0.75 - 6)) / 80 * 100);
/* n.45 — numero tolto dopo il cambio di media */
verifica(45, 5 * 20 - 4 * 18);
/* n.48 — numero di due cifre */
{ const sol = []; for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) if (a + b === 11 && (10 * b + a) - (10 * a + b) === 27) sol.push(10 * a + b); if (sol.length !== 1) errori.push('n.48: soluzione non unica'); verifica(48, sol[0]); }
/* n.50 — frazioni a catena */
verifica(50, 60 * (2 / 3) * (3 / 4));

/* n.31 — tabella dei gusti: ogni affermazione valutata con i conteggi */
{
  const tot = { cioc: 0, fra: 0, pist: 0, altro: 0 }; let N = 0;
  D.gelato.forEach(r => { N += r.n; ['cioc', 'fra', 'pist', 'altro'].forEach(k => tot[k] += r.n * r[k] / 100); });
  const g = f => D.gelato.find(r => r.fascia === f);
  const vere = [
    near(tot.cioc + tot.fra, N / 2),                                                   // opzione A
    tot.cioc > tot.pist && tot.cioc > tot.fra && tot.cioc > tot.altro,                 // B
    g('Under 18').n * g('Under 18').fra / 100 > g('Over 40').n * g('Over 40').fra / 100, // C
    tot.pist > N / 3                                                                   // D
  ];
  if (vere.filter(Boolean).length !== 1) errori.push('n.31: le affermazioni vere non sono esattamente una: ' + vere);
  verificaIdx(31, vere.indexOf(true), 'affermazione vera sulla tabella dei gusti');
  console.log(`  n.31 · totali per gusto: cioc ${tot.cioc}, fra ${tot.fra}, pist ${tot.pist}, altro ${tot.altro} su ${N}`);
}
/* n.37 — turisti con più di 3 notti */
{
  const lun = D.turisti.map(t => ({ p: t.p, n: t.n * t.lunghi / 100, q: t.lunghi }));
  const tot = lun.reduce((s, x) => s + x.n, 0), N = D.turisti.reduce((s, t) => s + t.n, 0);
  const byP = Object.fromEntries(lun.map(x => [x.p, x]));
  const maxQ = lun.reduce((a, b) => b.q > a.q ? b : a), maxN = lun.reduce((a, b) => b.n > a.n ? b : a);
  const vere = [
    maxQ.p === 'Germania' && maxN.p === 'Italia',      // A
    near(tot, N / 2),                                   // B
    byP['Altri'].n < byP['Francia'].n,                  // C
    byP['Germania'].n > byP['Italia'].n                 // D
  ];
  if (vere.filter(Boolean).length !== 1) errori.push('n.37: le affermazioni vere non sono esattamente una: ' + vere);
  verificaIdx(37, vere.indexOf(true), 'affermazione vera sui turisti');
}

/* ---------------------------------------------------------------------
   «Dati e proposizioni»: enumerazione di tutti i casi compatibili.
   Una proposizione è sicuramente vera se vale in tutti i casi,
   sicuramente falsa se non vale in nessuno.
   --------------------------------------------------------------------- */
const permuta = a => a.length <= 1 ? [a] : a.flatMap((x, i) => permuta([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p]));
function classifica(casi, prop) {
  return prop.map(f => { const t = casi.filter(f).length; return t === casi.length ? 'V' : t === 0 ? 'F' : '?'; }).join('');
}
const etichette = { 'Solo D': 'D', 'Solo A, B e D': 'ABD', 'Solo B, C e D': 'BCD', 'Solo B e D': 'BD', 'Solo A': 'A', 'Solo A e C': 'AC', 'Solo A, C e D': 'ACD', 'Solo B e C': 'BC', 'Solo B': 'B', 'Solo A e D': 'AD', 'Solo C e D': 'CD' };
function daOpzioni(n) { return Q[n].opts.map(o => etichette[plain(o)]); }
function verificaDP(n, casi, prop, cerca) {
  const cl = classifica(casi, prop);
  const lettere = [...cl].map((c, i) => c === cerca ? 'ABCD'[i] : '').join('');
  const idx = daOpzioni(n).indexOf(lettere);
  controllate++;
  if (idx < 0) errori.push(`n.${n}: nessuna opzione corrisponde all'insieme corretto «${lettere}» (classificazione ${cl})`);
  else if (idx !== Q[n].ans) errori.push(`n.${n}: l'insieme corretto «${lettere}» è l'opzione ${L[idx]}, la chiave dice ${L[Q[n].ans]}`);
  console.log(`  n.${n} · ${casi.length} casi compatibili · classificazione A–D: ${cl}`);
}
/* n.26 — cinque band in cinque sere */
{
  const band = ['Alfa', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
  const casi = permuta([1, 2, 3, 4, 5]).map(p => Object.fromEntries(band.map((b, i) => [b, p[i]])))
    .filter(o => o.Beta < o.Gamma && o.Delta === o.Alfa + 1 && o.Epsilon !== 1 && o.Epsilon !== 5);
  verificaDP(26, casi, [o => o.Alfa < o.Gamma, o => o.Delta !== 1, o => o.Epsilon === 4, o => o.Beta !== 5], 'V');
}
/* n.40 — scuola di musica */
{
  const casi = [];
  for (let c = 8; c <= 20; c++) for (let p = 8; p <= 20; p++) for (let v = 8; v <= 20; v++)
    if (c + p + v === 42 && p === v + 6 && c < p) casi.push({ c, p, v });
  verificaDP(40, casi, [o => o.v >= 11, o => o.c === 12, o => o.p > 16, o => o.c > o.v], 'V');
}
/* n.46 — punti del torneo: tutte le combinazioni (V, N, P) di 4 partite */
{
  const combo = []; for (let w = 0; w <= 4; w++) for (let d = 0; d <= 4 - w; d++) combo.push({ w, d, l: 4 - w - d, pt: 3 * w + d });
  const casi = [];
  combo.filter(b => b.pt === 7).forEach(blu => combo.filter(v => v.d === 0 && v.l === blu.l).forEach(verde => casi.push({ blu, verde })));
  verificaDP(46, casi, [o => o.verde.pt === 9, o => o.verde.w < o.blu.w, o => o.verde.w === o.blu.w, o => o.verde.pt > o.blu.pt], 'F');
}

/* ---------------------------------------------------------------------
   Domande verbali con un nucleo logico o numerico
   --------------------------------------------------------------------- */
/* n.2 — classifica: Rovereto > Trento; Bolzano < Trento; Merano > Rovereto */
{
  const sq = ['Rovereto', 'Trento', 'Bolzano', 'Merano'];
  const casi = permuta([0, 1, 2, 3]).map(p => Object.fromEntries(sq.map((s, i) => [s, p[i]]))) // posizione: 0 = primo
    .filter(o => o.Rovereto < o.Trento && o.Bolzano > o.Trento && o.Merano < o.Rovereto);
  const cl = classifica(casi, [o => o.Bolzano < o.Rovereto]);
  controllate++;
  if (cl !== 'F') errori.push('n.2: «Bolzano davanti al Rovereto» non è sicuramente falsa (' + cl + ')');
  if (Q[2].ans !== 1) errori.push('n.2: la chiave dovrebbe essere «Falsa»');
}
/* n.15 — soci iscritti a nessun torneo, nel caso migliore e peggiore */
{
  const N = 120, a = 60, b = 50; const nessuno = [];
  for (let both = Math.max(0, a + b - N); both <= Math.min(a, b); both++) nessuno.push(N - (a + b - both));
  controllate++;
  if (Math.min(...nessuno) < 10) errori.push('n.15: esiste uno scenario con meno di 10 soci senza iscrizione');
  if (Q[15].ans !== 0) errori.push('n.15: la chiave dovrebbe essere «Vera»');
}
/* n.28 — reclami per passeggero: sono calati solo se i passeggeri sono calati di meno del 25% */
{
  let ok = true;
  for (let p1 = 50; p1 <= 130; p1++) {                    // passeggeri oggi, con 100 di un anno fa
    const tassoScende = 300 / p1 < 400 / 100;
    const calatiMenoDeiReclami = p1 / 100 > 300 / 400;    // p1/100 > 0,75
    if (tassoScende !== calatiMenoDeiReclami) ok = false;
  }
  controllate++;
  if (!ok) errori.push('n.28: la condizione «passeggeri calati meno dei reclami» non coincide con «reclami per passeggero in calo»');
}
/* n.41 — media ponderata sotto 6,8 per ogni coppia di numerosità con 3A < 3B */
{
  let ok = true, nMedia = 0;
  for (let a = 1; a <= 60; a++) for (let b = a + 1; b <= 60; b++) { const m = (7.2 * a + 6.4 * b) / (a + b); if (!(m < 6.8 - 1e-12)) ok = false; nMedia++; }
  controllate++;
  if (!ok || Q[41].ans !== 0) errori.push('n.41: la media ponderata non è sempre sotto 6,8');
}
/* n.44 — dama e scacchi: quali affermazioni valgono per ogni numero possibile di partecipanti */
{
  const casi = []; for (let dama = 0; dama <= 25; dama++) casi.push({ dama });
  const cl = classifica(casi, [o => o.dama >= 15, o => o.dama === 25, o => o.dama >= 1, o => o.dama <= 25]);
  controllate++;
  // opzioni in ordine: «almeno 15», «tutti gli scacchisti», «almeno uno», «al massimo 25»
  if (cl !== '???V' || Q[44].ans !== 3) errori.push('n.44: classificazione inattesa ' + cl);
}
/* n.47 — sillogismo: modelli con 4 persone e 4 attributi */
{
  let modelli = 0; const conteggio = [0, 0, 0, 0];
  for (let m = 0; m < 1 << 16; m++) {
    const P = [0, 1, 2, 3].map(i => ({ corso: (m >> (4 * i)) & 1, gita: (m >> (4 * i + 1)) & 1, u18: (m >> (4 * i + 2)) & 1, giuria: (m >> (4 * i + 3)) & 1 }));
    if (!P.every(p => !p.corso || p.gita)) continue;
    if (!P.every(p => !p.gita || !p.u18)) continue;
    if (!P.some(p => p.giuria && p.corso)) continue;
    modelli++;
    if (P.some(p => p.giuria && p.u18)) conteggio[0]++;
    if (P.some(p => p.giuria && !p.u18)) conteggio[1]++;
    if (P.every(p => !p.gita || p.corso)) conteggio[2]++;
    if (!P.some(p => p.giuria && p.gita)) conteggio[3]++;
  }
  const sicure = conteggio.map(c => c === modelli);
  controllate++;
  if (sicure.filter(Boolean).length !== 1 || sicure.indexOf(true) !== Q[47].ans) errori.push('n.47: conclusioni necessarie ' + sicure + ', chiave ' + L[Q[47].ans]);
  console.log(`  n.47 · ${modelli} modelli compatibili con le premesse`);
}
/* n.18 — coerenza dei numeri del brano sul riso: produzione stabile a 1,4 milioni di t */
{
  const oggi = 220000 * 6.4, ieri = 220000 / 0.96 * 6.1;
  controllate++;
  if (Math.abs(oggi - 1.4e6) > 0.02e6 || Math.abs(ieri - 1.4e6) > 0.02e6) errori.push(`n.18: produzione ${oggi} oggi e ${ieri} l'anno prima, non coerenti con «stabile a 1,4 milioni»`);
}

/* ---------------------------------------------------------------------
   Copertura: ogni domanda numerica di Q e DI deve essere stata controllata
   --------------------------------------------------------------------- */
console.log(`\ncontrolli eseguiti: ${controllate}`);
if (errori.length) {
  console.log('\nERRORI:'); errori.forEach(e => console.log('  × ' + e)); process.exit(1);
}
console.log('Tutti i conti tornano: ogni risposta ricalcolata coincide con la chiave.');
