/* =======================================================================
   Mock 10 — 50 domande nuove (18 Q, 16 V, 16 DI).
   Pensato per il punto debole (Data Insights) e per i cinque pattern
   d'errore: Falso vs Non deducibile, Rapporti vs valori assoluti,
   Cause alternative, Media ponderata vs semplice, Sufficienza dei dati.

   Tutti i numeri dei grafici e delle tabelle stanno in DATA e sono
   riusati da tools/check-math-10.js per ricalcolare le risposte.
   Schema di una domanda: vedi mock-07.js.
   ======================================================================= */
(function (root, factory) {
  var C = (typeof module === 'object' && module.exports) ? require('../js/charts.js') : root.Charts;
  var mock = factory(C);
  if (typeof module === 'object' && module.exports) module.exports = mock;
  else { root.MOCKS = root.MOCKS || {}; root.MOCKS[mock.id] = mock; }
})(typeof self !== 'undefined' ? self : this, function (C) {
'use strict';

function fr(n, d){ return `<span class="fr" role="math" aria-label="${n} fratto ${d}"><span>${n}</span><span>${d}</span></span>`; }

const VFN = C.VFN;
const DSOPTS = C.DSOPTS;
const DSOPTS_EN = C.DSOPTS_EN;
const ds = C.ds;

/* ============================== DATI ============================== */
const DATA = {
  /* n.5 — affitti per zona */
  affitti: [
    { zona: 'Centro',     m2: 2000,  eur: 20 },
    { zona: 'Semicentro', m2: 6000,  eur: 12 },
    { zona: 'Periferia',  m2: 12000, eur: 8 }
  ],
  /* n.9 — abbonati a due servizi (migliaia) */
  abbonati: { anni: [2021, 2022, 2023, 2024, 2025], A: [200, 220, 240, 260, 280], B: [40, 50, 60, 80, 100] },
  /* n.18 — ricavi per area geografica */
  ricavi: {
    tot: { 2024: 40, 2025: 50 },
    quote: {
      2024: [['Italia', 50], ['Europa', 30], ['Resto del mondo', 20]],
      2025: [['Italia', 40], ['Europa', 30], ['Resto del mondo', 30]]
    }
  },
  /* n.24 — passeggeri di un aeroporto (milioni) */
  aeroporto: { anni: [2023, 2024, 2025], nazionali: [6, 6, 7], internazionali: [4, 6, 8] },
  /* n.27 — test di ammissione: celle note (null = dato non riportato) */
  ammissione: [
    { sede: 'Milano', cand: 300,  amm: null, tasso: 40 },
    { sede: 'Roma',   cand: null, amm: 90,   tasso: 30 },
    { sede: 'Torino', cand: 400,  amm: 40,   tasso: null }
  ],
  /* n.32 — variazione annua delle vendite (%) */
  variazioni: { anni: [2023, 2024, 2025], pct: [50, -20, 25] },
  /* n.36 — spesa prevista ed effettiva per reparto (migliaia di €) */
  reparti: [
    { r: 'Acquisti',   prev: 20,  eff: 20 },
    { r: 'Assistenza', prev: 50,  eff: 70 },
    { r: 'Logistica',  prev: 40,  eff: 50 },
    { r: 'Produzione', prev: 80,  eff: 88 },
    { r: 'Vendite',    prev: 100, eff: 130 }
  ],
  /* n.15 — treni (orari in minuti dalla mezzanotte, per i conti) */
  treni: {
    cambioMin: 10, dopoLe: '7:30',
    mb: [['M1', '7:10', '8:50'], ['M2', '7:40', '9:10'], ['M3', '8:20', '9:50']],
    bf: [['B1', '8:55', '9:45'], ['B2', '9:20', '10:10'], ['B3', '9:55', '10:45'], ['B4', '10:30', '11:20']]
  },
  /* n.11 — voti dell'esame: numero di studenti per voto */
  voti: { voto: [6, 7, 8, 9, 10], n: [5, 6, 5, 2, 2] },
  /* n.47 — vendite mensili, marzo nascosto */
  vendite: { mesi: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag'], v: [80, 90, null, 110, 120], totale: 500 }
};

/* ======================= tabelle e grafici ======================= */
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function tAffitti() {
  return C.table({
    caption: 'Affitti in tre zone della città',
    head: ['Zona', 'Superficie affittata (m²)', 'Canone medio (€/m² al mese)'],
    rows: DATA.affitti.map(a => [a.zona, fmt(a.m2), a.eur])
  });
}

function gAbbonati() {
  const D = DATA.abbonati;
  const W = 520, H = 280, L = 40, R = 30, T = 20, B = 32, lo = 0, hi = 300;
  const x = i => L + (W - L - R) * i / 4;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  let g = '';
  for (let t = 0; t <= 300; t += 100) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  D.anni.forEach((yr, i) => { g += `<text x="${x(i)}" y="${H - 8}" class="tick" text-anchor="middle">${yr}</text>`; });
  const line = (arr, c) => `<polyline points="${arr.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" style="stroke:var(--${c})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>`;
  const dots = (arr, c, name) => arr.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"><title>Servizio ${name}, ${D.anni[i]}: ${v}</title></circle>`).join('');
  g += line(D.A, 's1') + line(D.B, 's2') + dots(D.A, 's1', 'A') + dots(D.B, 's2', 'B');
  D.A.forEach((v, i) => { g += `<text x="${x(i)}" y="${y(v) - 11}" class="val" text-anchor="middle">${v}</text>`; });
  D.B.forEach((v, i) => { g += `<text x="${x(i)}" y="${y(v) - 11}" class="val" text-anchor="middle">${v}</text>`; });
  return `<figure class="fig"><figcaption>Abbonati a due servizi di streaming (migliaia)</figcaption>
<ul class="legend"><li><i class="sw line" style="background:var(--s1)"></i>Servizio A</li><li><i class="sw line" style="background:var(--s2)"></i>Servizio B</li></ul>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Due linee dal 2021 al 2025, abbonati in migliaia. Servizio A: ${D.A.join(', ')}. Servizio B: ${D.B.join(', ')}.">${g}</svg></div></figure>`;
}

function gRicavi() {
  const R = DATA.ricavi;
  const una = anno => `<figure class="fig"><figcaption>Ricavi per area geografica, ${anno} — totale ${R.tot[anno]} milioni di €</figcaption>` + C.pie({
    data: R.quote[anno],
    aria: 'Ripartizione dei ricavi ' + anno + ': ' + R.quote[anno].map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `</figure>`;
  return una(2024) + una(2025);
}

function gAeroporto() {
  const D = DATA.aeroporto;
  const W = 520, H = 300, L = 40, R = 12, T = 30, B = 34;
  const plotH = H - T - B, plotW = W - L - R, max = 16, k = plotH / max, base = T + plotH;
  const band = plotW / 3, cw = 64, gap = 2, r = 4;
  let g = '';
  for (const t of [0, 5, 10, 15]) {
    const y = base - t * k;
    g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  const serie = [{ k: 'Nazionali', v: D.nazionali, c: 's1' }, { k: 'Internazionali', v: D.internazionali, c: 's2' }];
  D.anni.forEach((yr, i) => {
    const x = L + band * i + (band - cw) / 2;
    let yb = base, tot = 0;
    serie.forEach((s, j) => {
      const v = s.v[i]; tot += v;
      const h = v * k, top = yb - h, y0 = top + gap;
      const isTop = j === serie.length - 1;
      const d = isTop
        ? `M${x},${yb} V${y0 + r} Q${x},${y0} ${x + r},${y0} H${x + cw - r} Q${x + cw},${y0} ${x + cw},${y0 + r} V${yb} Z`
        : `M${x},${yb} V${y0} H${x + cw} V${yb} Z`;
      g += `<path d="${d}" style="fill:var(--${s.c})"><title>${s.k} ${yr}: ${v} milioni</title></path>`;
      g += `<text x="${x + cw / 2}" y="${(y0 + yb) / 2 + 4}" class="in" style="fill:var(--on-${s.c})" text-anchor="middle">${v}</text>`;
      yb = top;
    });
    g += `<text x="${x + cw / 2}" y="${yb - 8}" class="total" text-anchor="middle">${tot}</text>`;
    g += `<text x="${x + cw / 2}" y="${base + 20}" class="tick" text-anchor="middle">${yr}</text>`;
  });
  const legend = serie.map(s => `<li><i class="sw" style="background:var(--${s.c})"></i>${s.k}</li>`).join('');
  return `<figure class="fig"><figcaption>Passeggeri di un aeroporto, in milioni</figcaption>
<ul class="legend">${legend}</ul>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Colonne impilate, passeggeri in milioni. ${D.anni.map((a, i) => a + ': nazionali ' + D.nazionali[i] + ', internazionali ' + D.internazionali[i] + ', totale ' + (D.nazionali[i] + D.internazionali[i])).join('. ')}.">${g}</svg></div>
<p class="fig-note">Il numero sopra ogni colonna è il totale dei passeggeri dell'anno.</p></figure>`;
}

function tAmmissione() {
  const c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Test di ammissione in tre sedi',
    head: ['Sede', 'Candidati', 'Ammessi', 'Tasso di ammissione'],
    rows: DATA.ammissione.map(a => [a.sede, c(a.cand), c(a.amm), a.tasso === null ? '?' : a.tasso + '%'])
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato. Il tasso di ammissione è il rapporto tra ammessi e candidati.</p>`;
}

function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

function gVariazioni() {
  const D = DATA.variazioni;
  const W = 520, H = 290, L = 46, R = 14, T = 26, B = 36, lo = -40, hi = 60, bw = 70;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  const band = (W - L - R) / 3;
  let g = '';
  for (let t = -40; t <= 60; t += 20) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t}%</text>`;
  }
  D.pct.forEach((p, i) => {
    const x = L + band * i + (band - bw) / 2;
    const pos = p >= 0;
    const y0 = pos ? y(p) : y(0), h = Math.abs(y(p) - y(0));
    g += `<rect x="${x}" y="${y0}" width="${bw}" height="${h}" style="fill:var(--${pos ? 's1' : 's2'})"><title>${D.anni[i]}: ${p > 0 ? '+' : '−'}${Math.abs(p)}%</title></rect>`;
    g += `<text x="${x + bw / 2}" y="${pos ? y0 - 7 : y0 + h + 15}" class="val" text-anchor="middle">${p > 0 ? '+' : '−'}${Math.abs(p)}%</text>`;
    g += `<text x="${x + bw / 2}" y="${H - 10}" class="lab" text-anchor="middle">${D.anni[i]}</text>`;
  });
  return `<figure class="fig"><figcaption>Vendite di un negozio: variazione rispetto all'anno precedente</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Colonne con variazione annua delle vendite rispetto all'anno precedente. ${D.anni.map((a, i) => a + ': ' + (D.pct[i] > 0 ? '+' : '−') + Math.abs(D.pct[i]) + '%').join('. ')}.">${g}</svg></div></figure>`;
}

function gReparti() {
  const W = 420, H = 320, L = 46, R = 16, T = 14, B = 44, xmax = 120, ymax = 140;
  const X = v => L + (W - L - R) * v / xmax, Y = v => T + (H - T - B) * (1 - v / ymax);
  let g = '';
  for (let t = 0; t <= ymax; t += 20) {
    g += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 7}" y="${Y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  for (let t = 0; t <= xmax; t += 20) {
    g += `<line x1="${X(t)}" x2="${X(t)}" y1="${T}" y2="${H - B}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${X(t)}" y="${H - B + 16}" class="tick" text-anchor="middle">${t}</text>`;
  }
  g += `<text x="${(L + W - R) / 2}" y="${H - 6}" class="tick" text-anchor="middle">Spesa prevista (migliaia di €)</text>`;
  g += `<text x="12" y="${(T + H - B) / 2}" class="tick" text-anchor="middle" transform="rotate(-90 12 ${(T + H - B) / 2})">Spesa effettiva (migliaia di €)</text>`;
  g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(120)}" y2="${Y(120)}" style="stroke:var(--ink-soft)" stroke-width="1.4" stroke-dasharray="5 4"></line>`;
  DATA.reparti.forEach(p => {
    const destra = p.r === 'Acquisti';   // gli altri punti stanno sopra la diagonale: l'etichetta va a sinistra, lontano dalla linea
    g += `<circle cx="${X(p.prev)}" cy="${Y(p.eff)}" r="5" style="fill:var(--s1);stroke:var(--paper)" stroke-width="1.5"><title>${p.r}: prevista ${p.prev}, effettiva ${p.eff}</title></circle>`;
    g += `<text x="${X(p.prev) + (destra ? 9 : -9)}" y="${Y(p.eff) + (destra ? 16 : 4)}" class="val" text-anchor="${destra ? 'start' : 'end'}">${p.r} (${p.prev}; ${p.eff})</text>`;
  });
  return `<figure class="fig"><figcaption>Cinque reparti: spesa prevista ed effettiva</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafico a punti, spesa prevista e spesa effettiva in migliaia di euro. ${DATA.reparti.map(p => p.r + ': prevista ' + p.prev + ', effettiva ' + p.eff).join('. ')}. La linea tratteggiata indica i punti in cui spesa effettiva e prevista coincidono.">${g}</svg></div>
<p class="fig-note">Tra parentesi, per ogni punto: (spesa prevista; spesa effettiva). I punti sulla linea tratteggiata hanno speso esattamente quanto previsto.</p></figure>`;
}

function tTreni() {
  const T = DATA.treni;
  return C.table({
    caption: 'Treni da Milano a Bologna',
    head: ['Treno', 'Partenza', 'Arrivo'],
    rows: T.mb
  }) + C.table({
    caption: 'Treni da Bologna a Firenze',
    head: ['Treno', 'Partenza', 'Arrivo'],
    rows: T.bf
  });
}

function gVoti() {
  const D = DATA.voti;
  return `<figure class="fig"><figcaption>Voti all'esame di statistica: numero di studenti per voto</figcaption>` + C.bars({
    labels: D.voto.map(String),
    series: [{ name: 'Studenti', values: D.n, style: 'fill' }],
    W: 400, H: 220, max: 8,
    aria: 'Numero di studenti per voto: ' + D.voto.map((v, i) => 'voto ' + v + ': ' + D.n[i] + ' studenti').join(', ') + '.'
  }) + `</figure>`;
}

function gVendite() {
  const D = DATA.vendite;
  const W = 460, H = 260, L = 40, R = 14, T = 22, B = 34, max = 140;
  const plotH = H - T - B, base = T + plotH, k = plotH / max, band = (W - L - R) / D.mesi.length, bw = 52;
  let g = '';
  for (let t = 0; t <= 140; t += 20) {
    g += `<line x1="${L}" x2="${W - R}" y1="${base - t * k}" y2="${base - t * k}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 7}" y="${base - t * k + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  D.mesi.forEach((m, i) => {
    const x = L + band * i + (band - bw) / 2, v = D.v[i];
    if (v === null) {
      g += `<rect x="${x}" y="${base - 90 * k}" width="${bw}" height="${90 * k}" fill="none" style="stroke:var(--ink-soft)" stroke-width="1.5" stroke-dasharray="5 4"><title>${m}: dato non riportato</title></rect>`;
      g += `<text x="${x + bw / 2}" y="${base - 45 * k + 6}" class="lab" text-anchor="middle">?</text>`;
    } else {
      g += `<rect x="${x}" y="${base - v * k}" width="${bw}" height="${v * k}" style="fill:var(--s1)"><title>${m}: ${v}</title></rect>`;
      g += `<text x="${x + bw / 2}" y="${base - v * k - 7}" class="val" text-anchor="middle">${v}</text>`;
    }
    g += `<text x="${x + bw / 2}" y="${H - 10}" class="lab" text-anchor="middle">${m}</text>`;
  });
  return `<figure class="fig"><figcaption>Vendite mensili di un negozio (unità)</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Colonne delle vendite mensili in unità. ${D.mesi.map((m, i) => m + ': ' + (D.v[i] === null ? 'dato non riportato' : D.v[i])).join(', ')}.">${g}</svg></div>
<p class="fig-note">Nei cinque mesi il negozio ha venduto in tutto ${D.totale} unità. La colonna tratteggiata di marzo non riporta il valore.</p></figure>`;
}

/* ======================= LE 50 DOMANDE ======================= */
const QUESTIONS = [

/* ---------- 1 ---------- */
{ n: 1, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Una confezione di riso da 500 g costa 2,50 € e una da 800 g costa 3,60 €. Di quanto, in percentuale, costa meno al chilo la confezione più grande rispetto a quella più piccola?`,
  opts: ['10%', '30%', '44%', '60%'], ans: 0,
  sol: `Prezzo al chilo: 2,50 € ÷ 0,5 = 5,00 € per la piccola; 3,60 € ÷ 0,8 = 4,50 € per la grande. Differenza: 0,50 € su 5,00 €, cioè il 10%.`,
  trap: `Guardare il prezzo assoluto: 3,60 € è il 44% in più di 2,50 €, ma la confezione pesa il 60% in più. Conta il rapporto prezzo/peso, non il prezzo della confezione.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 2 ---------- */
{ n: 2, area: 'V', diff: 'media', lang: 'it',
  passage: `Uno studio su 1.200 famiglie ha rilevato che i figli delle famiglie che cenano insieme almeno cinque volte a settimana hanno, in media, voti più alti dei figli delle altre famiglie. Gli autori precisano che la relazione è statisticamente solida, ma che lo studio non permette di stabilire se siano le cene in comune a determinare i voti più alti.`,
  claim: `In media, i figli delle famiglie che cenano insieme meno di cinque volte a settimana hanno voti più bassi dei figli delle famiglie che cenano insieme almeno cinque volte.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «hanno, in media, voti più alti dei figli delle altre famiglie». Dire che i primi hanno voti più alti equivale a dire che gli «altri» li hanno più bassi: l'affermazione descrive la stessa associazione. La cautela sul nesso causale riguarda il «perché», non il «cosa».`,
  trap: `Rispondere «Non deducibile» perché il testo avverte che non c'è un nesso causale: l'affermazione non parla di cause, ripete soltanto il confronto tra le medie.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 3 ---------- */
{ n: 3, area: 'DI', diff: 'facile', lang: 'it', ds: true,
  stem: ds('Quanti chilometri ha percorso un\'auto in 3 ore di viaggio?',
    'L\'auto consuma 6 litri di carburante ogni 100 km.',
    'L\'auto ha viaggiato a velocità costante, 80 km/h.'),
  opts: DSOPTS, ans: 1,
  sol: `Dalla (2): 80 km/h × 3 h = 240 km. La (1) da sola non dice nulla su distanza e tempo, e non serve nemmeno insieme alla (2).`,
  trap: `Pensare che il consumo sia necessario: riguarda il carburante, non la distanza. Il dato (1) è pertinente solo in apparenza.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 4 ---------- */
{ n: 4, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Anna ha il doppio dei soldi di Bea, e Bea ha il triplo dei soldi di Carla. Insieme hanno 200 €. Quanti euro ha Anna?`,
  opts: ['20 €', '60 €', '100 €', '120 €'], ans: 3,
  sol: `Se Carla ha x, Bea ha 3x e Anna 2 · 3x = 6x. Insieme: x + 3x + 6x = 10x = 200, quindi x = 20 e Anna ha 6 · 20 = 120 €.`,
  trap: `Fermarsi a un passaggio intermedio: 20 € sono i soldi di Carla e 60 € quelli di Bea. Serve la parte di Anna.`,
  patt: 'Equazioni e problemi a parole' },

/* ---------- 5 ---------- */
{ n: 5, area: 'DI', diff: 'media', lang: 'it', asset: tAffitti(),
  stem: `Qual è il canone medio al metro quadro, calcolato su tutta la superficie affittata nelle tre zone?`,
  opts: ['10,40 €', '12,00 €', '13,33 €', '16,00 €'], ans: 0,
  sol: `Affitto totale al mese: 2.000 × 20 + 6.000 × 12 + 12.000 × 8 = 40.000 + 72.000 + 96.000 = 208.000 €. Superficie totale: 20.000 m². Canone medio: 208.000 ÷ 20.000 = 10,40 €/m².`,
  trap: `Fare la media semplice dei tre canoni: (20 + 12 + 8) ÷ 3 = 13,33 €. Le zone hanno superfici molto diverse: la periferia pesa più della metà del totale.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 6 ---------- */
{ n: 6, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Ogni autunno una scuola superiore iscrive a un corso di recupero gli studenti che hanno ottenuto i punteggi più bassi nella prova d'ingresso. Alla prova di gennaio la maggior parte di questi studenti ottiene un punteggio più alto. Il preside conclude che il corso di recupero funziona.`,
  stem: `Quale delle seguenti affermazioni, se vera, indebolisce di più la conclusione del preside?`,
  opts: [`In generale, chi ottiene un punteggio molto basso in una prova tende a ottenerne uno meno basso nella prova successiva, anche senza alcun intervento.`,
         `Il corso di recupero è frequentato anche da alcuni studenti con punteggi sufficienti.`,
         `Alcuni studenti dichiarano di aver trovato utile il corso.`,
         `Il corso di recupero è gratuito.`], ans: 0,
  sol: `Se chi parte da un punteggio molto basso tende comunque a risalire (ritorno verso la media), il miglioramento si vedrebbe anche senza corso: è una spiegazione alternativa che indebolisce il nesso corso → miglioramento.`,
  trap: `Cercare un difetto nel corso (chi lo frequenta, quanto costa): il problema è nel confronto, perché mancano studenti simili che non hanno seguito il corso.`,
  patt: 'Cause alternative' },

/* ---------- 7 ---------- */
{ n: 7, area: 'Q', diff: 'media', lang: 'it',
  stem: `Il 30% di un numero positivo A è uguale al 45% di un numero positivo B. A è pari a quale percentuale di B?`,
  opts: ['66,7%', '75%', '150%', '200%'], ans: 2,
  sol: `0,30 · A = 0,45 · B → A = (0,45 ÷ 0,30) · B = 1,5 · B, cioè il 150% di B. (Controllo: se B = 20, il 45% è 9 e A = 30, il cui 30% è 9.)`,
  trap: `Rispondere 66,7% capovolgendo il rapporto (B rispetto ad A): il numero che ha la percentuale minore è quello più grande.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 8 ---------- */
{ n: 8, area: 'V', diff: 'media', lang: 'it',
  passage: `Un sondaggio condotto su 600 studenti di un istituto ha rilevato che il 40% raggiunge la scuola in bicicletta, il 25% a piedi e tutti gli altri con un mezzo motorizzato.`,
  claim: `Gli studenti che raggiungono la scuola con un mezzo motorizzato sono meno di 200.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «tutti gli altri con un mezzo motorizzato». Gli altri sono 100% − 40% − 25% = 35% di 600 = 210, che non è meno di 200: l'affermazione è contraddetta dai numeri.`,
  trap: `Arrotondare 35% a «circa un terzo» (200) e non accorgersi che 35% è più di un terzo. Non c'è nulla di «non deducibile»: tutti i dati servono.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 9 ---------- */
{ n: 9, area: 'DI', diff: 'media', lang: 'it', asset: gAbbonati(),
  stem: `Tra il 2021 e il 2025, quale delle seguenti affermazioni è corretta?`,
  opts: [`Il servizio A è cresciuto di più del servizio B in percentuale.`,
         `Il servizio B è cresciuto di più del servizio A in valore assoluto.`,
         `Il servizio B è cresciuto di più in percentuale, il servizio A di più in valore assoluto.`,
         `Nel 2025 gli abbonati del servizio B sono la metà di quelli del servizio A.`], ans: 2,
  sol: `A: da 200 a 280, cioè +80 mila (+40%). B: da 40 a 100, cioè +60 mila (+150%). A cresce di più in valore assoluto (80 > 60), B di più in percentuale (150% > 40%). Nel 2025 B ha 100 mila abbonati contro i 280 mila di A: non è la metà.`,
  trap: `Giudicare dalla pendenza delle linee, che riflette la variazione assoluta: la linea di A sale di più, ma parte da una base cinque volte più alta.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 10 ---------- */
{ n: 10, area: 'Q', diff: 'media', lang: 'it',
  stem: `Marta lancia due volte lo stesso dado a sei facce e moltiplica i due numeri ottenuti. Qual è la probabilità che il prodotto sia pari?`,
  opts: [fr(1, 4), fr(1, 2), fr(2, 3), fr(3, 4)], ans: 3,
  sol: `Il prodotto è dispari solo se entrambi i numeri sono dispari: ${fr(1, 2)} × ${fr(1, 2)} = ${fr(1, 4)}. Quindi il prodotto è pari con probabilità 1 − ${fr(1, 4)} = ${fr(3, 4)}.`,
  trap: `Rispondere ${fr(1, 2)} pensando che «pari» e «dispari» siano equiprobabili anche per il prodotto: per avere un prodotto pari basta un solo fattore pari.`,
  patt: 'Probabilità e combinatoria' },

/* ---------- 11 ---------- */
{ n: 11, area: 'DI', diff: 'media', lang: 'it', asset: gVoti(),
  stem: `Qual è il voto medio degli studenti che hanno sostenuto l'esame?`,
  opts: ['7,0', '7,5', '8,0', '8,5'], ans: 1,
  sol: `Studenti: 5 + 6 + 5 + 2 + 2 = 20. Somma dei voti: 6·5 + 7·6 + 8·5 + 9·2 + 10·2 = 30 + 42 + 40 + 18 + 20 = 150. Media: 150 ÷ 20 = 7,5.`,
  trap: `Fare la media dei cinque voti possibili, (6 + 7 + 8 + 9 + 10) ÷ 5 = 8, come se ogni voto avesse lo stesso numero di studenti. Le colonne più alte sono quelle dei voti bassi.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 12 ---------- */
{ n: 12, area: 'V', diff: 'media', lang: 'it',
  passage: `Un quotidiano scrive che gli studenti stranieri iscritti a un ateneo sono aumentati, perché la loro quota sul totale degli iscritti è passata dal 10% al 12%.`,
  stem: `Quale delle seguenti informazioni, se vera, mette più in dubbio l'affermazione del quotidiano?`,
  opts: [`Nello stesso periodo il numero totale degli iscritti è diminuito del 20%.`,
         `Gli studenti stranieri provengono da più di trenta paesi.`,
         `La quota degli studenti stranieri è aumentata in tutte le facoltà.`,
         `Le tasse di iscrizione sono rimaste invariate.`], ans: 0,
  sol: `Se gli iscritti totali passano da 100 a 80 e la quota straniera è il 12%, gli stranieri sono 0,12 × 80 = 9,6, meno dei 10 di prima: la quota è salita ma il numero è sceso.`,
  trap: `Confondere quota e numero: una percentuale può aumentare anche se il gruppo si riduce, quando il totale si riduce più in fretta.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 13 ---------- */
{ n: 13, area: 'Q', diff: 'media', lang: 'it',
  stem: `In un anno il fatturato di un'azienda cresce del 10% e il numero dei suoi dipendenti cresce del 25%. Come varia il fatturato per dipendente?`,
  opts: ['−15%', '−12%', '−10%', '+15%'], ans: 1,
  sol: `Fatturato per dipendente: ${fr('1,10', '1,25')} = 0,88 volte quello di prima, cioè −12%. (Con numeri semplici: 100 di fatturato e 100 dipendenti → 110 e 125; 110 ÷ 125 = 0,88 contro 1 di prima.)`,
  trap: `Sottrarre le percentuali (10 − 25 = −15%): le variazioni percentuali di numeratore e denominatore non si sottraggono, si dividono i fattori.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 14 ---------- */
{ n: 14, area: 'V', diff: 'media', lang: 'it',
  passage: `Nell'ultima sessione d'esame il 60% degli iscritti alla facoltà A ha superato la prova di statistica, contro il 50% degli iscritti alla facoltà B.`,
  claim: `Alla prova di statistica hanno superato l'esame più studenti della facoltà A che della facoltà B.`,
  opts: VFN, ans: 2,
  sol: `Il testo dà due percentuali su basi diverse e non dice quanti siano gli iscritti alle due facoltà. Con A di 100 iscritti e B di 400 si avrebbero 60 e 200 promossi; con A di 400 e B di 100, 240 e 50. Il testo è compatibile con entrambe le situazioni: non deducibile.`,
  trap: `Confrontare direttamente 60% e 50% come se fossero numeri di studenti. Una percentuale più alta non implica un numero assoluto più alto se le facoltà hanno dimensioni diverse.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 15 ---------- */
{ n: 15, area: 'DI', diff: 'media', lang: 'it', asset: tTreni(),
  stem: `Un viaggiatore parte da Milano non prima delle 7:30 e cambia treno a Bologna, dove servono almeno 10 minuti tra l'arrivo e la partenza successiva. A che ora arriva a Firenze al più presto?`,
  opts: ['9:45', '10:10', '10:45', '11:20'], ans: 1,
  sol: `Da Milano si può prendere M2 (7:40, arrivo 9:10) o M3 (8:20, arrivo 9:50). Con M2 il primo treno utile è B2 (parte 9:20, esattamente 10 minuti dopo): arrivo alle 10:10. Con M3 non si prende B3 (9:55, solo 5 minuti dopo) e il primo utile è B4, con arrivo alle 11:20.`,
  trap: `Scegliere 9:45 (B1) partendo da M1, che però parte alle 7:10, prima delle 7:30. Oppure 10:45, abbinando M3 a B3 senza rispettare i 10 minuti di cambio.`,
  patt: 'Lettura di tabelle' },

/* ---------- 16 ---------- */
{ n: 16, area: 'Q', diff: 'facile', lang: 'it',
  stem: `I ${fr(3, 5)} di un numero valgono 18. Quanto valgono i ${fr(2, 3)} dello stesso numero?`,
  opts: ['20', '24', '27', '30'], ans: 0,
  sol: `Se ${fr(3, 5)} del numero fanno 18, un quinto fa 6 e il numero è 30. I ${fr(2, 3)} di 30 sono 20.`,
  trap: `Applicare i ${fr(2, 3)} direttamente a 18 (12) oppure fermarsi al numero intero (30): 18 è già una frazione del numero.`,
  patt: 'Frazioni' },

/* ---------- 17 ---------- */
{ n: 17, area: 'V', diff: 'media', lang: 'en',
  passage: `A hospital reports that, since it started sending text-message reminders to patients, the share of missed appointments has fallen from 15% to 11%. The hospital concludes that the reminders reduced missed appointments.`,
  stem: `Which of the following, if true, most weakens the hospital's conclusion?`,
  opts: [`The reminders are sent by an external company that also works for other hospitals.`,
         `In the same period the hospital began asking patients for a booking deposit, which is lost if they do not attend.`,
         `Some patients receive more than one reminder.`,
         `The hospital treats about 2,000 patients per month.`], ans: 1,
  sol: `Il deposito perso in caso di assenza è una causa alternativa: può far calare le assenze anche senza i messaggi. Le altre opzioni non spiegano perché le assenze siano diminuite.`,
  trap: `Scegliere l'opzione A o C: descrivono come funziona il servizio ma non offrono un'altra spiegazione del calo. Il numero di pazienti (D) è irrilevante.`,
  patt: 'Cause alternative' },

/* ---------- 18 ---------- */
{ n: 18, area: 'DI', diff: 'difficile', lang: 'it', asset: gRicavi(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`I ricavi in Italia sono diminuiti, perché la loro quota è scesa dal 50% al 40%.`,
         `I ricavi in Europa sono rimasti invariati, perché la loro quota è rimasta al 30%.`,
         `I ricavi nel resto del mondo sono aumentati del 10%, perché la loro quota è passata dal 20% al 30%.`,
         `I ricavi in Italia sono rimasti invariati.`], ans: 3,
  sol: `Italia: 50% di 40 = 20 milioni nel 2024; 40% di 50 = 20 milioni nel 2025: invariati. Europa: 12 → 15 milioni (+25%). Resto del mondo: 8 → 15 milioni (+87,5%).`,
  trap: `Leggere la variazione della quota come variazione del valore: il totale è cresciuto del 25%, per questo una quota può scendere (Italia) o restare uguale (Europa) mentre il valore assoluto sale o rimane fermo.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 19 ---------- */
{ n: 19, area: 'Q', diff: 'media', lang: 'it',
  stem: `Su una pista circolare lunga 600 m due ciclisti partono insieme dallo stesso punto e nello stesso verso, a 5 m/s e a 7 m/s. Dopo quanti secondi si ritrovano affiancati per la prima volta?`,
  opts: ['50 s', '100 s', '300 s', '600 s'], ans: 2,
  sol: `Il più veloce guadagna 7 − 5 = 2 m ogni secondo e deve guadagnare un giro intero (600 m): 600 ÷ 2 = 300 s.`,
  trap: `Rispondere 50 s sommando le velocità (600 ÷ 12): vale per ciclisti che vanno in versi opposti, non nello stesso verso.`,
  patt: 'Tassi, lavoro e velocità' },

/* ---------- 20 ---------- */
{ n: 20, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('In un consiglio di amministrazione la quota di donne è aumentata rispetto a due anni fa?',
    'Due anni fa nel consiglio c\'erano 4 donne, oggi ce ne sono 5.',
    'Due anni fa il consiglio aveva 12 membri, oggi ne ha 15.'),
  opts: DSOPTS, ans: 2,
  sol: `Insieme: due anni fa ${fr(4, 12)} = ${fr(1, 3)}, oggi ${fr(5, 15)} = ${fr(1, 3)}. La quota è invariata, quindi non è aumentata: la risposta è un «no» certo, e per questo le informazioni sono sufficienti. Da sole non bastano: la (1) non dà i totali, la (2) non dà le donne.`,
  trap: `Concludere «Nemmeno insieme» perché la risposta è «no»: in un quesito di sufficienza conta che la risposta sia unica, non che sia «sì». Oppure guardare solo le donne (+1) e pensare che la quota sia salita.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 21 ---------- */
{ n: 21, area: 'V', diff: 'media', lang: 'it',
  passage: `Un'indagine condotta in 12 città europee ha rilevato che nei quartieri in cui è stata introdotta la raccolta differenziata porta a porta la quota di rifiuti riciclati è passata in media dal 38% al 52% in due anni. In tre città, tuttavia, l'aumento è stato inferiore a 5 punti percentuali. Gli autori osservano che nelle città con i risultati migliori il porta a porta era accompagnato da una tariffa proporzionale ai rifiuti prodotti, ma avvertono di non aver potuto separare l'effetto della tariffa da quello del porta a porta.`,
  stem: `In base al brano, quale delle seguenti affermazioni è corretta?`,
  opts: [`La tariffa proporzionale è stata la causa dei risultati migliori.`,
         `Nei quartieri interessati la quota media di rifiuti riciclati è aumentata di 14 punti percentuali.`,
         `In tutte le dodici città l'aumento è stato di almeno 5 punti percentuali.`,
         `Il porta a porta ha aumentato del 14% la quantità di rifiuti riciclati.`], ans: 1,
  sol: `Frase chiave: «dal 38% al 52% in due anni»: 52 − 38 = 14 punti percentuali, in media. La prima è contraddetta da «non aver potuto separare l'effetto della tariffa»; la terza da «in tre città [...] inferiore a 5 punti»; la quarta scambia punti percentuali con percentuale e attribuisce un effetto causale.`,
  trap: `Scegliere la prima, leggendo l'osservazione degli autori come una causa; oppure la quarta, confondendo i 14 punti con un aumento del 14% (che sarebbe 38% → 43,3%).`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 22 ---------- */
{ n: 22, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un'auto percorre una prima tratta di 100 km consumando 5 litri ogni 100 km e una seconda tratta di 300 km consumando 9 litri ogni 100 km. Qual è il consumo medio, in litri ogni 100 km, sull'intero percorso?`,
  opts: ['6,5', '7', '7,5', '8'], ans: 3,
  sol: `Carburante: 5 litri sulla prima tratta e 3 × 9 = 27 litri sulla seconda, in tutto 32 litri per 400 km. Per 100 km: 32 ÷ 4 = 8 litri.`,
  trap: `Fare la media semplice dei due consumi, (5 + 9) ÷ 2 = 7: la seconda tratta è tre volte più lunga della prima e pesa tre volte di più.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 23 ---------- */
{ n: 23, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Nel 2025 la biblioteca comunale ha registrato 18.000 prestiti: i due terzi erano libri, mentre i restanti erano audiolibri e film. I prestiti di audiolibri sono stati il doppio di quelli di film.`,
  claim: `Nel 2025 i prestiti di film sono stati meno di un decimo del totale.`,
  opts: VFN, ans: 1,
  sol: `Libri: ${fr(2, 3)} di 18.000 = 12.000. Restano 6.000 prestiti tra audiolibri (il doppio dei film) e film: 2f + f = 6.000, quindi i film sono 2.000. Un decimo del totale sarebbe 1.800: 2.000 è di più, quindi l'affermazione è falsa.`,
  trap: `Rispondere «Non deducibile» perché il brano non dà il numero dei film: si ricava. Oppure «Vera» a occhio, perché 2.000 su 18.000 sembra poco: è ${fr(1, 9)}, più di un decimo.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 24 ---------- */
{ n: 24, area: 'DI', diff: 'difficile', lang: 'it', asset: gAeroporto(),
  stem: `Tra il 2023 e il 2025, di quanto sono variati i passeggeri internazionali e la loro quota sul totale dei passeggeri?`,
  opts: [`+100% e circa +13 punti percentuali`,
         `+100% e circa +33 punti percentuali`,
         `+50% e circa +13 punti percentuali`,
         `+4 milioni e circa +53 punti percentuali`], ans: 0,
  sol: `Internazionali: da 4 a 8 milioni, cioè +100%. Quota: 2023 → ${fr(4, 10)} = 40%; 2025 → ${fr(8, 15)} ≈ 53,3%. La quota sale di circa 13 punti percentuali.`,
  trap: `Scambiare i punti percentuali con una variazione relativa (53,3 ÷ 40 ≈ +33%), oppure usare il +50% dei passeggeri totali (da 10 a 15 milioni) al posto di quello degli internazionali.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 25 ---------- */
{ n: 25, area: 'Q', diff: 'facile', lang: 'en',
  stem: `The sum of three consecutive even integers is 84. What is the largest of the three?`,
  opts: ['26', '28', '30', '32'], ans: 2,
  sol: `Il valore centrale è la media: 84 ÷ 3 = 28. I tre numeri sono 26, 28 e 30 (somma 84): il maggiore è 30.`,
  trap: `Rispondere 28: è il numero centrale, cioè la media dei tre, non il maggiore.`,
  patt: 'Equazioni e problemi a parole' },

/* ---------- 26 ---------- */
{ n: 26, area: 'V', diff: 'media', lang: 'it',
  passage: `Uno studio su 20.000 adulti ha rilevato che chi beve almeno tre caffè al giorno ha meno probabilità di avere una certa malattia del fegato. I ricercatori concludono che il caffè protegge il fegato.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione dei ricercatori?`,
  opts: [`Molte persone che hanno già i primi disturbi al fegato, prima ancora della diagnosi, riducono o eliminano il caffè perché non lo tollerano più.`,
         `Il caffè contiene sostanze antiossidanti.`,
         `Lo studio è stato pubblicato su una rivista scientifica specializzata.`,
         `Lo studio ha coinvolto sia uomini sia donne.`], ans: 0,
  sol: `Se chi comincia ad avere problemi al fegato smette di bere caffè, il nesso può essere inverso: non è il caffè a proteggere, è la malattia a ridurre il consumo. L'antiossidante (B) rafforza la tesi; la rivista (C) e la composizione del campione per sesso (D) non offrono un'altra spiegazione della relazione.`,
  trap: `Scegliere B, perché «suona» scientifico: rafforza la tesi invece di indebolirla. La domanda chiede quale informazione rende più plausibile una spiegazione alternativa (qui: causa e effetto invertiti).`,
  patt: 'Cause alternative' },

/* ---------- 27 ---------- */
{ n: 27, area: 'DI', diff: 'media', lang: 'it', asset: tAmmissione(),
  stem: `Qual è il tasso di ammissione complessivo delle tre sedi?`,
  opts: ['25%', '26,7%', '30%', '32%'], ans: 0,
  sol: `Dati mancanti: Milano ha 40% di 300 = 120 ammessi; Roma ha 90 ammessi con tasso 30%, quindi 300 candidati; Torino ha 40 ammessi su 400, cioè 10%. Totale: 250 ammessi su 1.000 candidati = 25%.`,
  trap: `Fare la media semplice dei tre tassi, (40 + 30 + 10) ÷ 3 ≈ 26,7%: le sedi hanno un numero diverso di candidati (Torino ne ha di più ed ha il tasso più basso).`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 28 ---------- */
{ n: 28, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Un negozio propone la promozione «paghi 2 e prendi 3»: ogni due articoli pagati se ne ricevono tre. Gli articoli, tutti identici, costano 10 € l'uno. Con 75 € quanti articoli si portano a casa, al massimo?`,
  opts: ['9', '10', '11', '12'], ans: 1,
  sol: `Con 75 € si pagano al massimo 7 articoli (70 €): 3 coppie danno 3 × 3 = 9 articoli, e il settimo pagato ne porta a casa 1 solo. Totale 10. Per averne 11 si dovrebbero pagare 8 articoli (80 €).`,
  trap: `Calcolare il prezzo medio di 20 € ÷ 3 ≈ 6,67 € per articolo e dividere 75 ÷ 6,67 ≈ 11: la promozione vale solo per coppie complete di articoli pagati.`,
  patt: 'Percentuali e promozioni' },

/* ---------- 29 ---------- */
{ n: 29, area: 'V', diff: 'facile', lang: 'it',
  passage: `Nella sperimentazione di un nuovo farmaco su 300 pazienti, 42 hanno segnalato effetti collaterali lievi, come nausea o mal di testa. Il rapporto finale non fornisce altre informazioni sugli effetti collaterali.`,
  claim: `Nessuno dei 300 pazienti ha avuto effetti collaterali gravi.`,
  opts: VFN, ans: 2,
  sol: `Il testo parla solo di effetti «lievi» e dichiara di non dare altre informazioni: non dice né che ci siano stati effetti gravi né che non ce ne siano stati. Frase chiave: «non fornisce altre informazioni».`,
  trap: `Rispondere «Vera» perché si citano solo effetti lievi, o «Falsa» perché «il rapporto non lo esclude»: quando il testo tace, la risposta è «Non deducibile».`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 30 ---------- */
{ n: 30, area: 'DI', diff: 'facile', lang: 'en', ds: true,
  stem: ds('Did Anna finish the race ahead of Marco?',
    'Anna finished ahead of Bea.',
    'Marco finished ahead of Bea.'),
  opts: DSOPTS_EN, ans: 3,
  sol: `Insieme sappiamo solo che sia Anna sia Marco sono arrivati davanti a Bea: l'ordine tra Anna e Marco può essere in entrambi i modi (Anna, Marco, Bea oppure Marco, Anna, Bea).`,
  trap: `Pensare che due confronti con lo stesso terzo termine bastino a ordinare gli altri due: servirebbe un confronto che collega Anna e Marco (per esempio «Bea è tra Anna e Marco»).`,
  patt: 'Sufficienza dei dati' },

/* ---------- 31 ---------- */
{ n: 31, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Quanti numeri interi positivi minori di 100 sono multipli di 4 ma non multipli di 6?`,
  opts: ['8', '12', '16', '24'], ans: 2,
  sol: `Multipli di 4 minori di 100: 4, 8, …, 96 → 24. Tra questi sono anche multipli di 6 quelli che sono multipli di 12 (mcm di 4 e 6): 12, 24, …, 96 → 8. Restano 24 − 8 = 16.`,
  trap: `Sottrarre i multipli di 6 (16) dai multipli di 4 (24) e ottenere 8: i multipli di 6 non sono tutti multipli di 4, vanno tolti solo quelli in comune (multipli di 12).`,
  patt: 'Multipli e mcm' },

/* ---------- 32 ---------- */
{ n: 32, area: 'DI', diff: 'media', lang: 'it', asset: gVariazioni(),
  stem: `Le vendite del 2025 rispetto a quelle del 2022 sono:`,
  opts: ['+25%', '+40%', '+50%', '+55%'], ans: 2,
  sol: `Partendo da 100 nel 2022: +50% → 150; −20% → 120; +25% → 150. Le vendite del 2025 sono il 50% in più di quelle del 2022. In un solo passaggio: 1,5 × 0,8 × 1,25 = 1,5.`,
  trap: `Sommare le tre variazioni (50 − 20 + 25 = 55%): ogni percentuale si applica al valore dell'anno precedente, non a quello del 2022.`,
  patt: 'Percentuali composte' },

/* ---------- 33 ---------- */
{ n: 33, area: 'V', diff: 'difficile', lang: 'it',
  passage: `In un paese la spesa in ricerca e sviluppo (R&S) è passata dal 2,0% al 2,5% del PIL. Nello stesso periodo il PIL è diminuito del 10%.`,
  stem: `Quale delle seguenti affermazioni è certamente vera?`,
  opts: [`La spesa in R&S è aumentata in valore assoluto.`,
         `La spesa in R&S è aumentata del 25%.`,
         `La spesa in R&S è rimasta invariata in valore assoluto.`,
         `La spesa in R&S è diminuita in valore assoluto, perché è diminuito il PIL.`], ans: 0,
  sol: `Con PIL iniziale 100: spesa iniziale 2,0. Dopo il calo, PIL 90 e spesa 2,5% di 90 = 2,25. La spesa è salita da 2,0 a 2,25, cioè del 12,5%: aumentata in valore assoluto.`,
  trap: `Rispondere 25%: è la variazione della quota (da 2,0% a 2,5%), non della spesa. Anche la quarta è un errore speculare: una quota più alta di un totale più basso può comunque valere di più.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 34 ---------- */
{ n: 34, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Siano x e y numeri reali tali che 2 < x < 5 e 1 < y < 3. Qual è il più grande numero intero che x − y può assumere?`,
  opts: ['3', '4', '5', '6'], ans: 0,
  sol: `x − y è massimo quando x è grande e y piccolo, ma le disuguaglianze sono strette: x − y < 5 − 1 = 4, e 4 non si raggiunge. Il valore 3 si ottiene, per esempio, con x = 4,5 e y = 1,5. Il più grande intero possibile è 3.`,
  trap: `Rispondere 4 usando gli estremi 5 e 1: con le disuguaglianze strette non sono valori ammessi.`,
  patt: 'Disuguaglianze' },

/* ---------- 35 ---------- */
{ n: 35, area: 'V', diff: 'media', lang: 'it',
  passage: `Da quando il comune di Riobello ha attivato lo sportello online per i permessi edilizi, il tempo medio di rilascio è sceso da 40 a 28 giorni. L'assessore ne conclude che lo sportello online ha ridotto i tempi.`,
  stem: `Quale informazione, se vera, rafforza di più la conclusione dell'assessore?`,
  opts: [`Il personale dell'ufficio tecnico si dichiara soddisfatto del nuovo sistema.`,
         `Lo sportello online è stato finanziato con fondi europei.`,
         `Molti cittadini non conoscevano l'esistenza dello sportello online.`,
         `Nello stesso ufficio i tempi sono scesi solo per le pratiche presentate online; per quelle presentate allo sportello fisico sono rimasti a 40 giorni.`], ans: 3,
  sol: `Confronta pratiche dello stesso ufficio, nello stesso periodo, con e senza sportello online: se solo le prime accelerano, altre cause comuni (personale, stagione, regole) diventano meno plausibili.`,
  trap: `Scegliere la soddisfazione del personale (A): è un'opinione, non un dato sui tempi. Finanziamento e notorietà non collegano lo sportello alla riduzione dei tempi.`,
  patt: 'Cause alternative' },

/* ---------- 36 ---------- */
{ n: 36, area: 'DI', diff: 'difficile', lang: 'it', asset: gReparti(),
  stem: `Quale reparto ha superato di più, in percentuale, la spesa prevista?`,
  opts: ['Assistenza', 'Logistica', 'Produzione', 'Vendite'], ans: 0,
  sol: `Spesa effettiva ÷ prevista: Assistenza 70 ÷ 50 = 1,40 (+40%); Logistica 50 ÷ 40 = 1,25 (+25%); Produzione 88 ÷ 80 = 1,10 (+10%); Vendite 130 ÷ 100 = 1,30 (+30%). Il massimo è Assistenza.`,
  trap: `Scegliere Vendite, che ha lo scostamento più grande in valore assoluto (+30 mila €) e il punto più lontano dalla linea tratteggiata: la domanda chiede lo scostamento in percentuale, cioè rapportato alla spesa prevista.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 37 ---------- */
{ n: 37, area: 'Q', diff: 'media', lang: 'it',
  stem: `Da un mazzo di 40 carte, numerate da 1 a 10 in ciascuno dei quattro semi (cuori, quadri, fiori, picche), se ne estrae una a caso. Qual è la probabilità che sia una carta di cuori oppure un 5 o un 10?`,
  opts: [fr(7, 20), fr(2, 5), fr(9, 20), fr(1, 2)], ans: 1,
  sol: `Cuori: 10 carte. 5 e 10 di tutti i semi: 8 carte. Il 5 di cuori e il 10 di cuori sono contati due volte: 10 + 8 − 2 = 16 carte favorevoli su 40, cioè ${fr(16, 40)} = ${fr(2, 5)}.`,
  trap: `Sommare senza togliere le carte in comune (10 + 8 = 18): si ottiene ${fr(9, 20)}, ma il 5 di cuori e il 10 di cuori sono già tra i cuori.`,
  patt: 'Probabilità e combinatoria' },

/* ---------- 38 ---------- */
{ n: 38, area: 'V', diff: 'facile', lang: 'it',
  passage: `Il museo civico è aperto dal martedì alla domenica, dalle 10 alle 19. L'ingresso è gratuito la prima domenica del mese. Il lunedì il museo è chiuso al pubblico, ma accoglie visite guidate per gruppi su prenotazione.`,
  stem: `Quale delle seguenti affermazioni è contraddetta dal brano?`,
  opts: [`Di domenica il museo è aperto alle 18.`,
         `In alcune domeniche l'ingresso al museo non si paga.`,
         `Il lunedì nessun gruppo può visitare il museo.`,
         `Il museo offre un servizio di audioguide.`], ans: 2,
  sol: `Frase chiave: «il lunedì [...] accoglie visite guidate per gruppi su prenotazione»: dire che nessun gruppo può visitare il museo il lunedì la contraddice. Le prime due sono confermate (aperto fino alle 19; gratuito la prima domenica); sulle audioguide il brano tace.`,
  trap: `Scegliere l'ultima: non è «contraddetta», è solo non menzionata. La domanda chiede ciò che il testo esclude, non ciò che il testo non dice.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 39 ---------- */
{ n: 39, area: 'DI', diff: 'difficile', lang: 'it',
  asset: dp(
    ['Un\'associazione raccoglie firme in tre giorni consecutivi: lunedì, martedì e mercoledì.',
     'Ogni giorno raccoglie almeno 20 firme.',
     'Martedì raccoglie il doppio delle firme di lunedì.',
     'Mercoledì raccoglie più firme di lunedì.',
     'In tutto raccoglie 100 firme.'],
    ['A. Lunedì raccoglie meno di 25 firme.',
     'B. Martedì raccoglie più firme di mercoledì.',
     'C. Mercoledì raccoglie almeno 28 firme.',
     'D. Martedì raccoglie un numero pari di firme.']),
  stem: `Leggi con attenzione i dati e le proposizioni. In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo A e C', 'Solo A e D', 'Solo A, C e D', 'Tutte e quattro'], ans: 2,
  sol: `Sia L le firme di lunedì: martedì 2L, mercoledì 100 − 3L. Da «mercoledì più di lunedì»: 100 − 3L > L, quindi L < 25; da «almeno 20»: L ≥ 20. Quindi L = 20, …, 24 e mercoledì = 40, …, 28. A vera (L ≤ 24). C vera (mercoledì ≥ 28). D vera (2L è pari). B non è sicura: con L = 20 martedì e mercoledì raccolgono entrambi 40 firme.`,
  trap: `Considerare B «sicuramente vera» perché nella maggior parte dei casi martedì supera mercoledì: basta il caso L = 20, in cui sono uguali. «Sicuramente vera» richiede che valga in ogni caso compatibile.`,
  patt: 'Deduzioni con vincoli' },

/* ---------- 40 ---------- */
{ n: 40, area: 'Q', diff: 'media', lang: 'it',
  stem: `L'area A ha una popolazione doppia rispetto a quella dell'area B e una superficie tripla. Rispetto alla densità di popolazione (abitanti per km²) di B, quella di A è pari a:`,
  opts: ['due terzi', 'una volta e mezza', 'due volte', 'tre volte'], ans: 0,
  sol: `Se B ha p abitanti e s km², la sua densità è ${fr('p', 's')}. A ha 2p abitanti e 3s km²: densità ${fr('2p', '3s')} = ${fr(2, 3)} · ${fr('p', 's')}. Dunque due terzi di quella di B.`,
  trap: `Guardare solo la popolazione (il doppio) o invertire il rapporto (una volta e mezza): la densità è popolazione divisa per superficie, e la superficie cresce più della popolazione.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 41 ---------- */
{ n: 41, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('In una scuola il 70% dei ragazzi e il 40% delle ragazze ha superato l\'esame di ammissione. La percentuale complessiva di studenti che ha superato l\'esame è superiore al 60%?',
    'I ragazzi sono il doppio delle ragazze.',
    'Le ragazze sono 90.'),
  opts: DSOPTS, ans: 0,
  sol: `Dalla (1): su 3 studenti, 2 ragazzi (70%) e 1 ragazza (40%): (2 · 0,7 + 1 · 0,4) ÷ 3 = 1,8 ÷ 3 = 60%. Non è «superiore al 60%»: risposta «no», certa. La (2) da sola non dice quanti sono i ragazzi.`,
  trap: `Usare la media semplice 55% e rispondere «no» senza pesare. Oppure, avendo trovato esattamente il 60%, pensare che manchi qualcosa: il valore è determinato, e la risposta alla domanda è «no».`,
  patt: 'Sufficienza dei dati' },

/* ---------- 42 ---------- */
{ n: 42, area: 'V', diff: 'media', lang: 'it',
  passage: `Un giornale confronta due ospedali: nell'ospedale A il 3% dei pazienti operati muore entro un mese dall'intervento, nell'ospedale B il 5%. Il giornale conclude che i chirurghi dell'ospedale A sono più bravi.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del giornale?`,
  opts: [`L'ospedale A ha più posti letto dell'ospedale B.`,
         `L'ospedale B è più antico dell'ospedale A.`,
         `Nei due ospedali lavora un numero simile di chirurghi.`,
         `L'ospedale B accoglie soprattutto pazienti in condizioni gravi trasferiti da altri ospedali, mentre l'ospedale A esegue in prevalenza interventi di routine.`], ans: 3,
  sol: `Se i due ospedali trattano pazienti con un rischio di partenza diverso, la differenza tra 3% e 5% può dipendere dal tipo di pazienti e non dalla bravura dei chirurghi: è una causa alternativa.`,
  trap: `Cercare differenze tra gli ospedali (dimensione, età, numero di chirurghi): nessuna spiega perché la mortalità dovrebbe essere diversa a parità di pazienti.`,
  patt: 'Cause alternative' },

/* ---------- 43 ---------- */
{ n: 43, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Quanto vale (3<sup>5</sup> · 9<sup>2</sup>) ÷ 27<sup>2</sup>?`,
  opts: ['9', '27', '81', '243'], ans: 1,
  sol: `Riscrivi tutto con base 3: 9² = 3⁴ e 27² = 3⁶. Il calcolo diventa 3⁵ · 3⁴ ÷ 3⁶ = 3<sup>5+4−6</sup> = 3³ = 27.`,
  trap: `Calcolare le potenze una a una (243 · 81 ÷ 729): lungo e pieno di errori possibili. Basta portare tutto alla stessa base e sommare o sottrarre gli esponenti.`,
  patt: 'Potenze' },

/* ---------- 44 ---------- */
{ n: 44, area: 'V', diff: 'media', lang: 'it',
  passage: `Il festival del cinema ha registrato nel 2024 un aumento delle presenze del 20% rispetto al 2023 e nel 2025 un ulteriore aumento del 30% rispetto al 2024.`,
  claim: `Nel 2025 le presenze sono state più del 50% in più rispetto al 2023.`,
  opts: VFN, ans: 0,
  sol: `Con 100 presenze nel 2023: nel 2024 sono 120 (+20%) e nel 2025 sono 120 × 1,3 = 156. Rispetto al 2023 l'aumento è del 56%, cioè più del 50%.`,
  trap: `Sommare le due percentuali (20 + 30 = 50%) e concludere «Falsa» perché 50% non è «più del 50%». Il +30% si applica al valore del 2024, che è già più alto di quello del 2023.`,
  patt: 'Percentuali composte' },

/* ---------- 45 ---------- */
{ n: 45, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Qual è la media dei tre numeri a, b e c?',
    'a + b = 20',
    'b + c = 30'),
  opts: DSOPTS, ans: 3,
  sol: `Per la media serve la somma a + b + c. Con le due informazioni: a + 2b + c = 50, ma il valore di b resta libero, quindi a + b + c cambia: con b = 10 si ha 40 (media 13,3...), con b = 5 si ha 45 (media 15).`,
  trap: `Sommare le due equazioni (50) e dividere per 3: nella somma b è contato due volte, quindi 50 non è la somma dei tre numeri.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 46 ---------- */
{ n: 46, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un lettore vuole scegliere 1 romanzo tra 5 e 2 saggi tra 4, senza tener conto dell'ordine in cui li leggerà. Quante scelte diverse ha?`,
  opts: ['20', '30', '60', '84'], ans: 1,
  sol: `Romanzo: 5 modi. Coppie di saggi tra 4, senza ordine: ${fr(4 * 3, 2)} = 6. Totale: 5 × 6 = 30.`,
  trap: `Contare i saggi in ordine (4 · 3 = 12) e ottenere 60, oppure ragionare su 3 libri qualsiasi tra 9 (84): il vincolo è 1 romanzo e 2 saggi.`,
  patt: 'Combinazioni vs permutazioni' },

/* ---------- 47 ---------- */
{ n: 47, area: 'DI', diff: 'media', lang: 'it', asset: gVendite(),
  stem: `Di quanto, in percentuale, le vendite di maggio superano quelle di marzo?`,
  opts: ['9%', '10%', '15%', '20%'], ans: 3,
  sol: `Il totale dei cinque mesi è 500: marzo = 500 − (80 + 90 + 110 + 120) = 100. Maggio è 120, cioè ${fr(20, 100)} = 20% in più di marzo.`,
  trap: `Confrontare maggio con aprile (10 su 110 ≈ 9%) o dividere per il valore sbagliato: la base della percentuale è marzo, il dato che va prima ricostruito.`,
  patt: 'Informazioni parziali' },

/* ---------- 48 ---------- */
{ n: 48, area: 'V', diff: 'media', lang: 'it',
  passage: `La biblioteca comunale ha deciso di aprire anche la domenica mattina, ritenendo che in questo modo aumenterà il numero di utenti che lavorano a tempo pieno.`,
  stem: `Su quale assunzione si basa principalmente questa decisione?`,
  opts: [`Gli utenti attuali sono soddisfatti degli orari di apertura.`,
         `Nessun lavoratore a tempo pieno lavora la domenica mattina.`,
         `Almeno una parte dei lavoratori a tempo pieno non riesce oggi a frequentare la biblioteca negli orari attuali, ma potrebbe farlo la domenica mattina.`,
         `La domenica mattina la biblioteca costerà meno che negli altri giorni.`], ans: 2,
  sol: `Perché l'apertura domenicale porti più utenti tra chi lavora a tempo pieno, deve esistere almeno una parte di questi lavoratori che oggi non può venire e la domenica sì. La B è troppo forte («nessun») e non serve.`,
  trap: `Scegliere B: è una condizione sufficiente ma non necessaria. Basta che alcuni lavoratori siano liberi la domenica mattina, non tutti.`,
  patt: 'Assunzione implicita' },

/* ---------- 49 ---------- */
{ n: 49, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Marco compra 100 azioni a 8 € l'una e, il mese dopo, altre 300 azioni a 12 € l'una. Qual è il prezzo medio pagato per azione?`,
  opts: ['9 €', '10 €', '10,50 €', '11 €'], ans: 3,
  sol: `Spesa totale: 100 · 8 + 300 · 12 = 800 + 3.600 = 4.400 €. Azioni: 400. Prezzo medio: 4.400 ÷ 400 = 11 €.`,
  trap: `Fare la media semplice dei due prezzi, (8 + 12) ÷ 2 = 10 €: il secondo acquisto è tre volte più grande del primo, quindi il prezzo medio è più vicino a 12.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 50 ---------- */
{ n: 50, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Cinque numeri interi positivi distinti hanno media 8. Qual è il massimo valore possibile del più grande dei cinque?`,
  opts: ['26', '28', '30', '36'], ans: 2,
  sol: `La somma è 5 · 8 = 40. Il più grande è massimo quando gli altri quattro sono i più piccoli possibili: 1, 2, 3 e 4, che fanno 10. Il più grande è 40 − 10 = 30.`,
  trap: `Usare quattro numeri uguali a 1 (somma 4): darebbe 36, ma i numeri devono essere distinti.`,
  patt: 'Medie e somme' }
];

return {
  id: '10',
  title: 'Mock 10',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Focus su Data Insights e sui cinque pattern d\'errore.',
  questions: QUESTIONS,
  data: DATA
};
});
