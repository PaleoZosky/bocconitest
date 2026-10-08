/* =======================================================================
   Mock 11 — 50 domande nuove (18 Q, 16 V, 16 DI).
   Pensato per il punto debole (Data Insights) e per i cinque pattern
   d'errore: Falso vs Non deducibile, Rapporti vs valori assoluti,
   Cause alternative, Media ponderata vs semplice, Sufficienza dei dati.

   Novità di questo mock rispetto ai precedenti: istogramma con classi di
   ampiezza diversa, grafico a due assi, asse verticale che non parte da
   zero, rette da prolungare (pareggio, incontro), paradosso di Simpson in
   tabella, tabella con celle da ricostruire, insiemi sovrapposti,
   quantificatori «la maggior parte», domande «NON si può dedurre».

   Tutti i numeri dei grafici e delle tabelle stanno in DATA e sono
   riusati da tools/check-math-11.js per ricalcolare le risposte.
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
const VFN_EN = C.VFN_EN;
const DSOPTS = C.DSOPTS;
const DSOPTS_EN = C.DSOPTS_EN;
const ds = C.ds;

/* ============================== DATI ============================== */
const DATA = {
  /* n.5 — sondaggio sulla zona a traffico limitato (% di 800 intervistati) */
  sondaggio: { campione: 800, quote: [['Favorevoli', 30], ['Contrari', 45], ['Non so', 25]] },
  /* n.8 — istogramma: classi d'età [da, a) e visitatori per ogni anno di età (migliaia) */
  istogramma: { classi: [[0, 10], [10, 20], [20, 40], [40, 60], [60, 80]], densita: [8, 12, 10, 8, 2] },
  /* n.14 — visitatori di un parco archeologico (migliaia), asse che parte da 90 */
  parco: { anni: [2023, 2024, 2025], v: [100, 110, 120], base: 90, top: 130 },
  /* n.17 — dipendenti e stipendio medio mensile per area */
  stipendi: [
    { area: 'Operativa',      n: 40, medio: 1500 },
    { area: 'Commerciale',    n: 20, medio: 2500 },
    { area: 'Amministrativa', n: 10, medio: 2000 },
    { area: 'Direzione',      n: 5,  medio: 6000 }
  ],
  /* n.20 — chiamate ai due call center: semplici e complesse */
  chiamate: {
    nord: { semplici: [80, 72], complesse: [20, 10] },    // [chiamate, risolte]
    sud:  { semplici: [20, 19], complesse: [80, 48] }
  },
  /* n.26 — ricavi (milioni di €) e margine operativo (%) */
  duale: { anni: [2022, 2023, 2024, 2025], ricavi: [160, 240, 320, 280], margine: [20, 15, 10, 15] },
  /* n.29 — due rette viste solo fino a 400 unità (migliaia di €) */
  pareggio: { x1: 400, ricavi: [0, 120], costi: [60, 140] },
  /* n.32 — famiglie per numero di figli */
  figli: { figli: [0, 1, 2, 3, 4, 5], famiglie: [8, 12, 8, 6, 4, 2] },
  /* n.35 — dipendenti per reparto e tipo di contratto (null = dato non riportato) */
  contratti: [
    { r: 'Produzione',      ind: null, det: 50,   tot: 160 },
    { r: 'Commerciale',     ind: 40,   det: null, tot: 70 },
    { r: 'Logistica',       ind: 30,   det: 20,   tot: null }
  ],
  contrattiTotale: 280,
  /* n.41 — due ciclisti: tempo (ore) e distanza (km) */
  ciclisti: { X: { t: [0, 4], km: [0, 48] }, Y: { t: [1.5, 4], km: [0, 50] } },
  /* n.44 — magazzino: scorta iniziale e movimenti mensili */
  magazzino: { iniziale: 100, mesi: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio'], entrate: [50, 20, 60, 90, 40], uscite: [80, 60, 70, 60, 55] }
};

/* ======================= tabelle e grafici ======================= */
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const svg = (W, H, aria, inner) => `<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${aria}">${inner}</svg></div>`;

function gSondaggio() {
  const S = DATA.sondaggio;
  return `<figure class="fig"><figcaption>Nuova zona a traffico limitato: opinione di ${S.campione} residenti intervistati</figcaption>` + C.pie({
    data: S.quote,
    aria: 'Ripartizione delle risposte: ' + S.quote.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `</figure>`;
}

function gIstogramma() {
  const D = DATA.istogramma;
  const W = 520, H = 280, L = 46, R = 14, T = 22, B = 50, ymax = 14, xmax = 80;
  const X = v => L + (W - L - R) * v / xmax, Y = v => T + (H - T - B) * (1 - v / ymax);
  let g = '';
  for (let t = 0; t <= ymax; t += 2) {
    g += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 7}" y="${Y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  D.classi.forEach(([a, b], i) => {
    const d = D.densita[i];
    g += `<rect x="${X(a)}" y="${Y(d)}" width="${X(b) - X(a)}" height="${Y(0) - Y(d)}" style="fill:var(--s1);stroke:var(--paper)" stroke-width="2"><title>Da ${a} a ${b} anni: ${d} migliaia di visitatori per ogni anno di età</title></rect>`;
    g += `<text x="${(X(a) + X(b)) / 2}" y="${Y(d) - 6}" class="val" text-anchor="middle">${d}</text>`;
  });
  [0, 10, 20, 40, 60, 80].forEach(t => { g += `<text x="${X(t)}" y="${Y(0) + 16}" class="tick" text-anchor="middle">${t}</text>`; });
  g += `<text x="${(L + W - R) / 2}" y="${H - 8}" class="tick" text-anchor="middle">Età (anni)</text>`;
  return `<figure class="fig"><figcaption>Visitatori di una mostra per età</figcaption>
${svg(W, H, 'Istogramma con cinque classi di età di ampiezza diversa. Altezza delle barre, in migliaia di visitatori per ogni anno di età: ' + D.classi.map((c, i) => 'da ' + c[0] + ' a ' + c[1] + ' anni ' + D.densita[i]).join(', ') + '.', g)}
<p class="fig-note">Asse verticale: migliaia di visitatori per ogni anno di età (non il numero di visitatori della classe). Le classi hanno ampiezze diverse.</p></figure>`;
}

function gParco() {
  const D = DATA.parco;
  const W = 460, H = 270, L = 46, R = 14, T = 20, B = 36;
  const Y = v => T + (H - T - B) * (D.top - v) / (D.top - D.base);
  const band = (W - L - R) / D.anni.length, bw = 70;
  let g = '';
  for (let t = D.base; t <= D.top; t += 10) {
    g += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" class="${t === D.base ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 7}" y="${Y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  D.anni.forEach((a, i) => {
    const x = L + band * i + (band - bw) / 2;
    g += `<rect x="${x}" y="${Y(D.v[i])}" width="${bw}" height="${Y(D.base) - Y(D.v[i])}" style="fill:var(--s1)"><title>${a}: ${D.v[i]} migliaia</title></rect>`;
    g += `<text x="${x + bw / 2}" y="${H - 12}" class="lab" text-anchor="middle">${a}</text>`;
  });
  return `<figure class="fig"><figcaption>Visitatori di un parco archeologico (migliaia)</figcaption>
${svg(W, H, 'Colonne dei visitatori in migliaia, con asse verticale da ' + D.base + ' a ' + D.top + '. ' + D.anni.map((a, i) => a + ': ' + D.v[i]).join(', ') + '.', g)}</figure>`;
}

function tStipendi() {
  return C.table({
    caption: 'Dipendenti e stipendio medio mensile per area',
    head: ['Area', 'Dipendenti', 'Stipendio medio mensile (€)'],
    rows: DATA.stipendi.map(s => [s.area, s.n, fmt(s.medio)])
  });
}

function tChiamate() {
  const D = DATA.chiamate;
  const cella = a => `${a[0]} / ${a[1]}`;
  const somma = c => [c.semplici[0] + c.complesse[0], c.semplici[1] + c.complesse[1]];
  return C.table({
    caption: 'Chiamate gestite da due call center in un mese',
    head: ['Centro', 'Semplici', 'Complesse', 'Totale'],
    rows: [
      ['Nord', cella(D.nord.semplici), cella(D.nord.complesse), cella(somma(D.nord))],
      ['Sud', cella(D.sud.semplici), cella(D.sud.complesse), cella(somma(D.sud))]
    ]
  }) + `<p class="fig-note">In ogni cella: chiamate ricevute / chiamate risolte al primo contatto.</p>`;
}

function gDuale() {
  const D = DATA.duale;
  const W = 520, H = 300, L = 50, R = 50, T = 26, B = 40, lmax = 400, rmax = 20;
  const YL = v => T + (H - T - B) * (1 - v / lmax), YR = v => T + (H - T - B) * (1 - v / rmax);
  const band = (W - L - R) / D.anni.length, bw = 64;
  let g = '';
  for (let k = 0; k <= 4; k++) {
    g += `<line x1="${L}" x2="${W - R}" y1="${YL(k * 100)}" y2="${YL(k * 100)}" class="${k === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 7}" y="${YL(k * 100) + 4}" class="tick" text-anchor="end">${k * 100}</text>`;
    g += `<text x="${W - R + 7}" y="${YR(k * 5) + 4}" class="tick" text-anchor="start">${k * 5}%</text>`;
  }
  g += `<text x="${L - 7}" y="${T - 10}" class="tick" text-anchor="end">mln €</text>`;
  g += `<text x="${W - 2}" y="${T - 10}" class="tick" text-anchor="end">margine</text>`;
  const cx = i => L + band * i + band / 2;
  D.anni.forEach((a, i) => {
    g += `<rect x="${cx(i) - bw / 2}" y="${YL(D.ricavi[i])}" width="${bw}" height="${YL(0) - YL(D.ricavi[i])}" style="fill:var(--s1)" opacity=".85"><title>${a}: ricavi ${D.ricavi[i]} milioni</title></rect>`;
    g += `<text x="${cx(i)}" y="${YL(D.ricavi[i]) + 17}" class="in" style="fill:var(--on-s1)" text-anchor="middle">${D.ricavi[i]}</text>`;
    g += `<text x="${cx(i)}" y="${H - 14}" class="lab" text-anchor="middle">${a}</text>`;
  });
  g += `<polyline points="${D.anni.map((a, i) => cx(i) + ',' + YR(D.margine[i])).join(' ')}" fill="none" style="stroke:var(--s2)" stroke-width="2.4" stroke-linejoin="round"></polyline>`;
  D.anni.forEach((a, i) => {
    g += `<circle cx="${cx(i)}" cy="${YR(D.margine[i])}" r="5" style="fill:var(--s2);stroke:var(--paper)" stroke-width="2"><title>${a}: margine ${D.margine[i]}%</title></circle>`;
    g += `<text x="${cx(i)}" y="${YR(D.margine[i]) - 11}" class="val" text-anchor="middle">${D.margine[i]}%</text>`;
  });
  return `<figure class="fig"><figcaption>Un'azienda: ricavi e margine operativo</figcaption>
<ul class="legend"><li><i class="sw" style="background:var(--s1)"></i>Ricavi, milioni di € (asse sinistro)</li><li><i class="sw line" style="background:var(--s2)"></i>Margine operativo, % dei ricavi (asse destro)</li></ul>
${svg(W, H, 'Colonne dei ricavi in milioni di euro e linea del margine operativo in percentuale dei ricavi. ' + D.anni.map((a, i) => a + ': ricavi ' + D.ricavi[i] + ', margine ' + D.margine[i] + '%').join('. ') + '.', g)}
<p class="fig-note">Margine operativo = utile operativo ÷ ricavi.</p></figure>`;
}

function gPareggio() {
  const D = DATA.pareggio;
  const W = 480, H = 290, L = 50, R = 70, T = 20, B = 44, xmax = 400, ymax = 160;
  const X = v => L + (W - L - R) * v / xmax, Y = v => T + (H - T - B) * (1 - v / ymax);
  let g = '';
  for (let t = 0; t <= ymax; t += 40) {
    g += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 7}" y="${Y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  for (let t = 0; t <= xmax; t += 100) g += `<text x="${X(t)}" y="${Y(0) + 17}" class="tick" text-anchor="middle">${t}</text>`;
  g += `<text x="${(L + W - R) / 2}" y="${H - 8}" class="tick" text-anchor="middle">Unità vendute</text>`;
  g += `<text x="2" y="${T - 7}" class="tick" text-anchor="start">migliaia di €</text>`;
  const linea = (a, c) => `<line x1="${X(0)}" y1="${Y(a[0])}" x2="${X(D.x1)}" y2="${Y(a[1])}" style="stroke:var(--${c})" stroke-width="2.4" stroke-linecap="round"></line>`
    + `<circle cx="${X(0)}" cy="${Y(a[0])}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"></circle><circle cx="${X(D.x1)}" cy="${Y(a[1])}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"></circle>`;
  g += linea(D.costi, 's2') + linea(D.ricavi, 's1');
  g += `<text x="${X(0) + 8}" y="${Y(D.costi[0]) - 9}" class="val">${D.costi[0]}</text>`;
  g += `<text x="${X(D.x1) + 9}" y="${Y(D.costi[1]) + 4}" class="val">${D.costi[1]}</text>`;
  g += `<text x="${X(D.x1) + 9}" y="${Y(D.ricavi[1]) + 4}" class="val">${D.ricavi[1]}</text>`;
  g += `<text x="${X(0) + 8}" y="${Y(0) - 8}" class="val">0</text>`;
  return `<figure class="fig"><figcaption>Ricavi e costi totali di un prodotto, in funzione delle unità vendute</figcaption>
<ul class="legend"><li><i class="sw line" style="background:var(--s1)"></i>Ricavi totali</li><li><i class="sw line" style="background:var(--s2)"></i>Costi totali (costi fissi + costi variabili)</li></ul>
${svg(W, H, 'Due rette per unità vendute da 0 a 400. Ricavi: da ' + D.ricavi[0] + ' a ' + D.ricavi[1] + ' migliaia di euro. Costi: da ' + D.costi[0] + ' a ' + D.costi[1] + ' migliaia di euro.', g)}
<p class="fig-note">Sono riportati i valori agli estremi di ciascuna retta (0 e 400 unità). Entrambe le grandezze crescono in modo lineare.</p></figure>`;
}

function tFigli() {
  const D = DATA.figli;
  return C.table({
    caption: 'Famiglie di un condominio per numero di figli',
    head: ['Numero di figli', ...D.figli],
    rows: [['Famiglie', ...D.famiglie]]
  });
}

function tContratti() {
  const c = v => v === null ? '?' : v;
  const rows = DATA.contratti.map(r => [r.r, c(r.ind), c(r.det), c(r.tot)]);
  rows.push(['Totale', '?', '?', DATA.contrattiTotale]);
  return C.table({
    caption: 'Dipendenti per reparto e tipo di contratto (T. indet. = a tempo indeterminato; T. det. = a tempo determinato)',
    head: ['Reparto', 'T. indet.', 'T. det.', 'Totale'],
    rows
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato. In ogni riga e in ogni colonna il totale è la somma delle altre celle.</p>`;
}

function gCiclisti() {
  const D = DATA.ciclisti;
  const W = 480, H = 290, L = 46, R = 76, T = 20, B = 44, xmax = 4, ymax = 60;
  const X = v => L + (W - L - R) * v / xmax, Y = v => T + (H - T - B) * (1 - v / ymax);
  let g = '';
  for (let t = 0; t <= ymax; t += 10) {
    g += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 7}" y="${Y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  for (let t = 0; t <= xmax; t += 1) g += `<text x="${X(t)}" y="${Y(0) + 17}" class="tick" text-anchor="middle">${t}</text>`;
  g += `<text x="${(L + W - R) / 2}" y="${H - 8}" class="tick" text-anchor="middle">Ore dalla partenza di X</text>`;
  g += `<text x="${L - 7}" y="${T - 7}" class="tick" text-anchor="end">km</text>`;
  const linea = (o, c, nome, dy) => `<line x1="${X(o.t[0])}" y1="${Y(o.km[0])}" x2="${X(o.t[1])}" y2="${Y(o.km[1])}" style="stroke:var(--${c})" stroke-width="2.4" stroke-linecap="round"></line>`
    + `<circle cx="${X(o.t[0])}" cy="${Y(o.km[0])}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"></circle><circle cx="${X(o.t[1])}" cy="${Y(o.km[1])}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"></circle>`
    + `<text x="${X(o.t[1]) + 9}" y="${Y(o.km[1]) + dy}" class="val">${nome}: ${o.km[1]} km</text>`;
  g += linea(D.X, 's1', 'X', 15) + linea(D.Y, 's2', 'Y', -4);
  g += `<text x="${X(D.Y.t[0]) - 8}" y="${Y(0) - 9}" class="val" text-anchor="end">Y parte</text>`;
  return `<figure class="fig"><figcaption>Due ciclisti sulla stessa strada, nella stessa direzione</figcaption>
<ul class="legend"><li><i class="sw line" style="background:var(--s1)"></i>Ciclista X</li><li><i class="sw line" style="background:var(--s2)"></i>Ciclista Y</li></ul>
${svg(W, H, 'Distanza percorsa in chilometri in funzione delle ore dalla partenza di X. X parte a 0 ore e arriva a ' + D.X.km[1] + ' km dopo 4 ore. Y parte dopo 1,5 ore e arriva a ' + D.Y.km[1] + ' km dopo 4 ore. Entrambi viaggiano a velocità costante.', g)}
<p class="fig-note">Entrambi i ciclisti viaggiano a velocità costante; i punti segnati sono la partenza e l'ultima rilevazione.</p></figure>`;
}

function tMagazzino() {
  const D = DATA.magazzino;
  return C.table({
    caption: `Magazzino di un negozio — scorta al 1° gennaio: ${D.iniziale} pezzi`,
    head: ['Mese', 'Pezzi acquistati (entrate)', 'Pezzi venduti (uscite)'],
    rows: D.mesi.map((m, i) => [m, D.entrate[i], D.uscite[i]])
  }) + `<p class="fig-note">Le entrate e le uscite di ogni mese sono distribuite nell'arco del mese; interessa solo la scorta alla fine di ciascun mese.</p>`;
}

/* ======================= LE 50 DOMANDE ======================= */
const QUESTIONS = [

/* ---------- 1 ---------- */
{ n: 1, area: 'Q', diff: 'media', lang: 'it',
  stem: `Una scala mobile in funzione porta una persona ferma dal fondo alla cima in 60 secondi. Marco, camminando a passo costante su una scala spenta, la sale in 30 secondi. Quanto impiega a salirla se cammina allo stesso passo sulla scala in funzione?`,
  opts: ['20 secondi', '30 secondi', '40 secondi', '45 secondi'], ans: 0,
  sol: `Contiamo le «scale percorse al secondo»: la scala in funzione fa ${fr(1, 60)}, Marco da solo ${fr(2, 60)}. Camminando sulla scala in funzione le due velocità si sommano: ${fr(1, 60)} + ${fr(2, 60)} = ${fr(3, 60)} = ${fr(1, 20)} di scala al secondo, cioè 20 secondi per salirla tutta.`,
  trap: `Fare la media dei due tempi, (60 + 30) ÷ 2 = 45 secondi: con 45 s Marco impiegherebbe più che camminando da solo su una scala spenta (30 s), il che è assurdo, perché la scala in funzione lo aiuta. Si sommano le velocità (gli inversi dei tempi), non i tempi.`,
  patt: 'Tassi, lavoro e velocità' },

/* ---------- 2 ---------- */
{ n: 2, area: 'V', diff: 'facile', lang: 'it',
  passage: `Dal 2019 il numero di soci della biblioteca di quartiere è sceso da 1.200 a 750. Nello stesso periodo la biblioteca ha spostato la sede in un edificio più lontano dal centro e ha attivato un servizio gratuito di prestito di libri digitali.`,
  claim: `Il calo dei soci è dovuto al trasferimento della sede.`,
  opts: VFN, ans: 2,
  sol: `Frase chiave: «Nello stesso periodo la biblioteca ha spostato la sede… e ha attivato un servizio gratuito». Il brano elenca due fatti contemporanei al calo ma non attribuisce il calo a nessuno dei due: l'affermazione sceglie una causa che il testo non indica. Non deducibile.`,
  trap: `Rispondere «Vera» perché la sede più lontana «sembra» una buona ragione per iscriversi meno. Una coincidenza nel tempo non è una causa dichiarata, e il servizio digitale gratuito è una spiegazione alternativa altrettanto compatibile.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 3 ---------- */
{ n: 3, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Quanti soci ha il circolo di vela?',
    'Il 40% dei soci è donna.',
    'I soci uomini sono 30 più delle donne.'),
  opts: DSOPTS, ans: 2,
  sol: `Da sola la (1) dà solo una percentuale, la (2) solo una differenza. Insieme: uomini 60%, donne 40%, differenza 20% dei soci = 30, quindi i soci sono 30 ÷ 0,20 = 150 (60 donne e 90 uomini).`,
  trap: `Pensare che la (2) basti perché contiene un numero concreto («30»): è una differenza, e differenze uguali stanno bene con circoli piccoli e grandi. Oppure pensare che basti la (1): una percentuale da sola non dà mai un numero di persone.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 4 ---------- */
{ n: 4, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Una penna e un astuccio costano insieme 11 €. L'astuccio costa 10 € più della penna. Quanto costa la penna?`,
  opts: ['0,50 €', '1,00 €', '1,50 €', '10,50 €'], ans: 0,
  sol: `Se la penna costa x, l'astuccio costa x + 10 e insieme x + (x + 10) = 11, quindi 2x = 1 e x = 0,50 €. (Controllo: astuccio 10,50 €, differenza 10 €, totale 11 €.)`,
  trap: `Rispondere 1 € sottraendo 10 da 11: ma 10 € è la differenza tra i due prezzi, non il prezzo dell'astuccio. Con la penna a 1 € l'astuccio costerebbe 11 € e il totale sarebbe 12 €.`,
  patt: 'Equazioni e problemi a parole' },

/* ---------- 5 ---------- */
{ n: 5, area: 'DI', diff: 'facile', lang: 'it', asset: gSondaggio(),
  stem: `Tra i residenti che hanno espresso un'opinione (favorevoli o contrari), quale percentuale è favorevole?`,
  opts: ['25%', '30%', '35%', '40%'], ans: 3,
  sol: `Chi ha espresso un'opinione è 30% + 45% = 75% degli intervistati. I favorevoli sono 30 su 75, cioè ${fr(30, 75)} = ${fr(2, 5)} = 40%.`,
  trap: `Leggere direttamente 30% dal grafico: è la quota sul totale degli intervistati, compresi i «Non so». Cambiando la base (si escludono 25 intervistati su 100) cambia anche la percentuale.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 6 ---------- */
{ n: 6, area: 'V', diff: 'media', lang: 'it',
  passage: `In un'indagine sui commercianti del centro storico, la maggior parte degli intervistati ha dichiarato un calo degli incassi nel 2025, mentre tre commercianti su dieci hanno dichiarato un aumento.`,
  claim: `Più di un terzo dei commercianti intervistati ha dichiarato un aumento degli incassi nel 2025.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «tre commercianti su dieci hanno dichiarato un aumento». Tre su dieci sono il 30%, che è meno di un terzo (33,3%): l'affermazione è contraddetta dal dato, qualunque sia il numero degli intervistati.`,
  trap: `Trattare «tre su dieci» come «circa un terzo» e rispondere «Vera», oppure pensare che la parte non detta (chi non ha dichiarato né calo né aumento) renda la risposta indeterminata. Il testo dà la quota esatta dei commercianti con aumento.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 7 ---------- */
{ n: 7, area: 'Q', diff: 'media', lang: 'it',
  stem: `In una gara sui 100 metri A e B corrono a velocità costante: A taglia il traguardo dopo 20 secondi, B dopo 25 secondi. Quando A taglia il traguardo, quanti metri mancano a B?`,
  opts: ['10 m', '20 m', '25 m', '80 m'], ans: 1,
  sol: `B percorre 100 m in 25 s, cioè 4 m/s. In 20 s ne percorre 80, quindi gli mancano 100 − 80 = 20 m.`,
  trap: `Moltiplicare la differenza dei tempi (5 s) per la velocità di A (5 m/s) e rispondere 25 m: B è indietro di 5 s alla propria velocità, 5 s × 4 m/s = 20 m. 80 m, invece, è la distanza che B ha già percorso, non quella che gli manca.`,
  patt: 'Tassi, lavoro e velocità' },

/* ---------- 8 ---------- */
{ n: 8, area: 'DI', diff: 'difficile', lang: 'it', asset: gIstogramma(),
  stem: `Quale percentuale dei visitatori ha tra 20 e 60 anni?`,
  opts: ['40%', '45%', '60%', '80%'], ans: 2,
  sol: `Il numero di visitatori di una classe è altezza × ampiezza. 0–10: 8 × 10 = 80; 10–20: 12 × 10 = 120; 20–40: 10 × 20 = 200; 40–60: 8 × 20 = 160; 60–80: 2 × 20 = 40. Totale 600. Tra 20 e 60 anni: 200 + 160 = 360, cioè 360 ÷ 600 = 60%.`,
  trap: `Leggere le altezze come numero di visitatori: 10 + 8 = 18 su 40 dà 45%; contare le barre dà 2 su 5 = 40%. Con classi di ampiezza diversa conta l'area, non l'altezza.`,
  patt: 'Istogramma: densità vs frequenza' },

/* ---------- 9 ---------- */
{ n: 9, area: 'V', diff: 'difficile', lang: 'it',
  passage: `In un torneo di calcio ogni squadra ha affrontato una sola volta tutte le altre. Il Falco ha vinto tutte le partite tranne una, che ha pareggiato. Il Lupo ha perso soltanto la partita contro il Falco.`,
  claim: `Il Lupo ha vinto più partite del Falco.`,
  opts: VFN, ans: 1,
  sol: `Con n squadre ogni squadra gioca n − 1 partite. Il Falco ne vince n − 2 (una è pareggiata, nessuna persa). Il Lupo perde contro il Falco: le sue altre n − 2 partite sono vittorie o pareggi, quindi vince al più n − 2 partite. Il Lupo non può averne vinte più del Falco: l'affermazione è falsa.`,
  trap: `Rispondere «Non deducibile» perché il numero di squadre non è noto: il confronto non ne dipende, perché entrambe le squadre hanno al massimo n − 2 vittorie. Oppure lasciarsi attirare da «ha perso una sola partita» come segno di superiorità.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 10 ---------- */
{ n: 10, area: 'Q', diff: 'media', lang: 'it',
  stem: `Anna guadagna il 20% in più di Bruno, e Bruno guadagna il 25% in meno di Carla. Rispetto a Carla, Anna guadagna:`,
  opts: ['il 5% in meno', 'il 10% in meno', 'lo stesso', 'il 10% in più'], ans: 1,
  sol: `Se Carla guadagna 100, Bruno guadagna 75 (−25%) e Anna 75 × 1,2 = 90. Anna guadagna il 10% in meno di Carla.`,
  trap: `Sommare le percentuali (+20 − 25 = −5%): le due percentuali hanno basi diverse (Bruno la prima, Carla la seconda) e vanno moltiplicate come fattori: 1,2 × 0,75 = 0,9.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 11 ---------- */
{ n: 11, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('La media di tre numeri interi positivi distinti è almeno 10?',
    'Il più piccolo dei tre numeri è 9.',
    'Il più grande dei tre numeri è 12.'),
  opts: DSOPTS, ans: 0,
  sol: `Dalla (1): gli altri due numeri sono interi distinti maggiori di 9, quindi almeno 10 e 11. La somma è almeno 9 + 10 + 11 = 30 e la media almeno 10: la risposta è sempre «sì». La (2) da sola non basta: 10, 11, 12 hanno media 11, ma 1, 2, 12 hanno media 5.`,
  trap: `Pensare che la (1) non basti perché dà solo il numero più piccolo e non la media: per rispondere a «almeno 10?» non serve il valore esatto, basta un limite inferiore che regga in tutti i casi. È la stessa logica delle disuguaglianze: un vincolo può bastare senza fissare il valore.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 12 ---------- */
{ n: 12, area: 'V', diff: 'media', lang: 'it',
  passage: `Un'analisi sui fondi comuni ancora in attività nel 2025 mostra che, negli ultimi dieci anni, hanno reso in media il 6% all'anno. Gli autori concludono che chi ha investito in fondi comuni in quel periodo ha ottenuto in media il 6% annuo.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione degli autori?`,
  opts: [`I fondi analizzati investono in settori molto diversi tra loro.`,
         `Nei dieci anni molti fondi con rendimenti bassi sono stati chiusi e non compaiono nell'analisi.`,
         `Il rendimento medio dei fondi azionari è stato superiore a quello dei fondi obbligazionari.`,
         `Il numero di fondi in attività è aumentato negli ultimi anni.`], ans: 1,
  sol: `L'analisi considera solo i fondi sopravvissuti. Se quelli con rendimenti bassi sono stati chiusi, la media dei sopravvissuti sopravvaluta quanto ha ottenuto chi ha investito all'inizio, anche in fondi poi scomparsi. Le altre opzioni non toccano il legame tra il campione e la conclusione.`,
  trap: `Scegliere B: confronta due tipi di fondi ma non dice se il 6% sia sbagliato per chi ha investito. Il difetto è nel campione: mancano i fondi che hanno chiuso, proprio quelli che avrebbero abbassato la media.`,
  patt: 'Distorsione di selezione' },

/* ---------- 13 ---------- */
{ n: 13, area: 'Q', diff: 'media', lang: 'it',
  stem: `In un concorso il punteggio finale è la media ponderata di tre prove: scritto (peso 20%), colloquio (peso 30%) e prova pratica (peso 50%). Un candidato ha ottenuto 60 allo scritto e 80 al colloquio. Quale punteggio deve ottenere nella prova pratica per avere un punteggio finale di 80?`,
  opts: ['72', '76', '80', '88'], ans: 3,
  sol: `Punteggio finale = 0,20 × 60 + 0,30 × 80 + 0,50 × x = 12 + 24 + 0,5 x. Deve valere 80, quindi 0,5 x = 44 e x = 88.`,
  trap: `Rispondere 80, come se per un finale di 80 bastasse 80 nell'ultima prova. Lo scritto, con il suo 60, abbassa il punteggio: l'ultima prova deve compensare, e pesando solo il 50% serve un valore più alto del target.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 14 ---------- */
{ n: 14, area: 'DI', diff: 'media', lang: 'it', asset: gParco(),
  stem: `Di quanto sono aumentati, in percentuale, i visitatori tra il 2023 e il 2025?`,
  opts: ['20%', '50%', '100%', '200%'], ans: 0,
  sol: `Leggendo i valori sull'asse: 2023 = 100 mila, 2025 = 120 mila. Aumento: 20 su 100, cioè 20%. (L'asse parte da 90, non da 0.)`,
  trap: `Confrontare le altezze delle colonne a occhio: la barra 2025 sembra tre volte quella 2023 (+200%) perché l'asse è troncato e parte da 90. Le altezze visive sono 10 e 30, i valori veri 100 e 120.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 15 ---------- */
{ n: 15, area: 'V', diff: 'media', lang: 'it',
  passage: `Alla gara di tiro con l'arco Chiara ha ottenuto un punteggio più alto di Dario, e Dario più alto di Elena. Anche Elisa ha ottenuto un punteggio più alto di Elena.`,
  claim: `Chiara ha ottenuto un punteggio più alto di Elisa.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «Chiara più alto di Dario, e Dario più alto di Elena» e «Elisa più alto di Elena». Elisa sta sopra Elena, ma il brano non la confronta né con Dario né con Chiara: può essere sotto Chiara o sopra di lei. Non deducibile.`,
  trap: `Rispondere «Vera» perché Chiara compare per prima e con la catena più lunga. Due catene che hanno in comune solo Elena non permettono di confrontare le due teste.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 16 ---------- */
{ n: 16, area: 'Q', diff: 'media', lang: 'it',
  stem: `Quante diagonali ha un ottagono (una diagonale è un segmento che unisce due vertici non consecutivi)?`,
  opts: ['12', '16', '20', '28'], ans: 2,
  sol: `I segmenti che uniscono due degli 8 vertici sono ${fr('8 × 7', 2)} = 28. Otto di questi sono i lati, quindi le diagonali sono 28 − 8 = 20. (Altra via: ogni vertice si collega a 5 vertici non adiacenti, e 8 × 5 ÷ 2 = 20.)`,
  trap: `Rispondere 28 contando anche i lati, oppure 40 (8 × 5) senza dividere per 2: una diagonale ha due estremi e viene contata due volte. Si scelgono coppie di vertici senza ordine, quindi serve la divisione per 2.`,
  patt: 'Combinazioni vs permutazioni' },

/* ---------- 17 ---------- */
{ n: 17, area: 'DI', diff: 'media', lang: 'it', asset: tStipendi(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`La media dei quattro stipendi medi, 3.000 €, è lo stipendio medio dell'intera azienda.`,
         `Lo stipendio medio dell'intera azienda è inferiore a 2.000 €.`,
         `L'area con lo stipendio medio più alto è anche quella con il monte stipendi mensile più alto.`,
         `Lo stipendio medio dell'intera azienda supera i 2.000 €, e l'area Commerciale ha un monte stipendi inferiore a quello dell'area Operativa ma superiore a quello della Direzione.`], ans: 3,
  sol: `Monte stipendi mensile: Operativa 40 × 1.500 = 60.000; Commerciale 20 × 2.500 = 50.000; Amministrativa 10 × 2.000 = 20.000; Direzione 5 × 6.000 = 30.000. Totale 160.000 € su 75 dipendenti: circa 2.133 €, sopra 2.000. Commerciale (50.000) è sotto Operativa (60.000) e sopra Direzione (30.000): la seconda è vera. La prima confonde la media semplice (3.000) con quella ponderata; la terza è falsa (Direzione ha 30.000 contro 60.000); la quarta è falsa (2.133 > 2.000).`,
  trap: `Fare la media semplice dei quattro stipendi medi (3.000 €): la Direzione, con soli 5 dipendenti, pesa quanto l'area Operativa che ne ha 40. E ragionare sullo stipendio medio per giudicare il monte stipendi, che dipende anche dal numero di persone.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 18 ---------- */
{ n: 18, area: 'V', diff: 'difficile', lang: 'en',
  passage: `A survey of 800 commuters found that 55% travel by train at least once a week and 30% travel by bus at least once a week.`,
  claim: `At least 100 of the surveyed commuters do not travel by train or by bus even once a week.`,
  opts: C.VFN_EN, ans: 0,
  sol: `Frase chiave: «55% … train» e «30% … bus». Anche nel caso peggiore, in cui nessuno usa entrambi i mezzi, chi usa almeno uno dei due è 55% + 30% = 85%: resta almeno il 15% di 800 = 120 pendolari che non usa né treno né autobus, più di 100. L'affermazione è vera.`,
  trap: `Rispondere «Cannot be determined» perché il brano non dice quanti usano entrambi i mezzi: non serve saperlo. Più persone usano entrambi, meno sono quelle che usano almeno uno dei due, quindi i pendolari senza treno né autobus sono sempre almeno il 15%.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 19 ---------- */
{ n: 19, area: 'Q', diff: 'media', lang: 'it',
  stem: `Anna da sola completerebbe un lavoro in 12 ore, Bruno da solo in 6 ore. Anna comincia da sola e dopo 3 ore arriva Bruno: da quel momento lavorano insieme fino alla fine. Quante ore passano in tutto dall'inizio del lavoro?`,
  opts: ['6', '7', '9', '12'], ans: 0,
  sol: `In 3 ore Anna fa ${fr(3, 12)} = ${fr(1, 4)} del lavoro; restano ${fr(3, 4)}. Insieme fanno ${fr(1, 12)} + ${fr(1, 6)} = ${fr(1, 4)} del lavoro all'ora, quindi per i ${fr(3, 4)} restanti servono 3 ore. In tutto 3 + 3 = 6 ore.`,
  trap: `Calcolare il tempo di coppia come se il lavoro partisse da zero (4 ore) e aggiungere le 3 ore di Anna (7), oppure togliere le 3 ore ai 12 di Anna (9). Le prime 3 ore hanno già completato un quarto del lavoro: resta da fare solo ${fr(3, 4)}.`,
  patt: 'Tassi, lavoro e velocità' },

/* ---------- 20 ---------- */
{ n: 20, area: 'DI', diff: 'difficile', lang: 'it', asset: tChiamate(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Il Nord ha la percentuale di risoluzione più alta sia in ciascun tipo di chiamata sia sul totale.`,
         `Il Sud ha risolto più chiamate del Nord in valore assoluto.`,
         `Il Sud ha una percentuale di risoluzione più alta del Nord in ciascun tipo di chiamata, ma più bassa sul totale.`,
         `Sul totale dei due centri la percentuale di risoluzione supera l'80%.`], ans: 2,
  sol: `Semplici: Nord 72 ÷ 80 = 90%, Sud 19 ÷ 20 = 95%. Complesse: Nord 10 ÷ 20 = 50%, Sud 48 ÷ 80 = 60%. Totale: Nord 82 ÷ 100 = 82%, Sud 67 ÷ 100 = 67%. Il Sud vince in ciascun tipo, il Nord sul totale. Il Nord ha risolto 82 chiamate, il Sud 67 (la seconda è falsa); insieme 149 su 200 = 74,5% (la terza è falsa).`,
  trap: `Ragionare come se una squadra migliore in ogni gruppo dovesse essere migliore anche sul totale. Il totale è una media ponderata: il Sud riceve l'80% di chiamate complesse, più difficili, il Nord solo il 20%. Il peso di ciascun gruppo cambia il risultato complessivo (paradosso di Simpson).`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 21 ---------- */
{ n: 21, area: 'V', diff: 'media', lang: 'it',
  passage: `Una scuola di lingue offre due corsi di inglese, uno intensivo e uno standard. Al test finale gli studenti del corso intensivo hanno ottenuto punteggi medi più alti. La direttrice sostiene che il corso intensivo sia più efficace.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la sua conclusione?`,
  opts: [`Gli studenti sono stati assegnati ai due corsi tramite sorteggio.`,
         `Il corso intensivo costa più del corso standard.`,
         `Molti studenti del corso intensivo hanno dichiarato di essere soddisfatti.`,
         `Gli insegnanti dei due corsi lavorano nella scuola da più di cinque anni.`], ans: 0,
  sol: `Con l'assegnazione per sorteggio i due gruppi sono simili all'inizio: la differenza nei punteggi finali non può dipendere da chi sceglie l'intensivo (più motivati, più preparati). Elimina la causa alternativa principale e rafforza il nesso corso → punteggi.`,
  trap: `Scegliere C: la soddisfazione dichiarata non misura il punteggio. Il rischio da escludere è che gli studenti migliori scelgano il corso intensivo: solo il sorteggio lo fa.`,
  patt: 'Cause alternative' },

/* ---------- 22 ---------- */
{ n: 22, area: 'Q', diff: 'media', lang: 'it',
  stem: `Si lancia tre volte una moneta equilibrata. Qual è la probabilità di ottenere almeno due teste consecutive?`,
  opts: [fr(1, 4), fr(3, 8), fr(1, 2), fr(5, 8)], ans: 1,
  sol: `Le sequenze possibili sono 8. Quelle con due teste di fila sono TTC, CTT e TTT (T = testa, C = croce), cioè 3. Probabilità: ${fr(3, 8)}.`,
  trap: `Contare tutte le sequenze con almeno due teste (anche non vicine): sono 4, cioè ${fr(1, 2)}. La sequenza T C T ha due teste ma non consecutive.`,
  patt: 'Probabilità e combinatoria' },

/* ---------- 23 ---------- */
{ n: 23, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('L\'intero positivo n è pari?',
    'n + 2 è un multiplo di 3.',
    'n² è un multiplo di 4.'),
  opts: DSOPTS, ans: 1,
  sol: `Dalla (2): se n fosse dispari anche n² sarebbe dispari, quindi n² multiplo di 4 (pari) implica n pari: sufficiente. Dalla (1): n può essere 1 (dispari), 4 (pari), 7 (dispari), 10 (pari)…: non basta.`,
  trap: `Scegliere la (1) perché sembra restringere di più il campo: i numeri con n + 2 multiplo di 3 sono infiniti e alternano pari e dispari. Oppure ritenere che la (2) parli solo di n² e non di n: ma un quadrato pari ha sempre base pari.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 24 ---------- */
{ n: 24, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Nel comune di Montefiore ci sono tre scuole secondarie: la Pascoli e la Leopardi hanno ciascuna più di 400 studenti, mentre il Manzoni ne ha meno della Leopardi. In tutto gli studenti sono 1.100.`,
  claim: `Il Manzoni ha meno di 300 studenti.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «ciascuna più di 400» e «In tutto … 1.100». Pascoli e Leopardi hanno almeno 401 studenti ciascuna, cioè almeno 802 insieme. Al Manzoni restano al più 1.100 − 802 = 298 studenti, meno di 300. Vera.`,
  trap: `Rispondere «Non deducibile» perché il numero esatto degli studenti del Manzoni non si conosce: l'affermazione non chiede il valore, ma un limite, che il totale e i due «più di 400» fissano. L'informazione «meno della Leopardi» non serve.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 25 ---------- */
{ n: 25, area: 'Q', diff: 'media', lang: 'it',
  stem: `Si lancia due volte un dado equilibrato a sei facce. Qual è la probabilità che il secondo numero sia maggiore del primo?`,
  opts: [fr(1, 3), fr(5, 12), fr(1, 2), fr(7, 12)], ans: 1,
  sol: `Le coppie possibili sono 36. In 6 di esse i due numeri sono uguali; nelle altre 30 il secondo è maggiore del primo in metà dei casi, cioè in 15. Probabilità ${fr(15, 36)} = ${fr(5, 12)}.`,
  trap: `Rispondere ${fr(1, 2)} ragionando «o maggiore o minore»: si dimentica che 6 coppie su 36 sono uguali. ${fr(7, 12)} è la probabilità di «maggiore o uguale».`,
  patt: 'Probabilità e combinatoria' },

/* ---------- 26 ---------- */
{ n: 26, area: 'DI', diff: 'media', lang: 'it', asset: gDuale(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel 2025 l'utile operativo è stato di 10 milioni di € superiore a quello del 2024.`,
         `Nel 2024, anno con i ricavi massimi, l'utile operativo è stato il più alto.`,
         `Nel 2022, anno con il margine più alto, l'utile operativo è stato il più alto.`,
         `L'utile operativo del 2023 è stato superiore a quello del 2025.`], ans: 0,
  sol: `Utile operativo = ricavi × margine: 2022 → 160 × 20% = 32; 2023 → 240 × 15% = 36; 2024 → 320 × 10% = 32; 2025 → 280 × 15% = 42. Il massimo è il 2025 (42), e 42 − 32 = 10 milioni rispetto al 2024. Le altre tre sono false: 2024 e 2022 hanno utile 32, il 2023 ha 36 < 42.`,
  trap: `Guardare un solo asse: i ricavi massimi (2024) o il margine massimo (2022). Il margine è un rapporto e il ricavo un valore assoluto: per l'utile in euro vanno moltiplicati.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 27 ---------- */
{ n: 27, area: 'V', diff: 'media', lang: 'it',
  passage: `Secondo il ministro, il nuovo piano per l'edilizia scolastica creerà 50.000 posti di lavoro in cinque anni. Le organizzazioni sindacali chiedono una verifica indipendente della stima, ma riconoscono che il piano porterà comunque nuove assunzioni nel settore.`,
  claim: `Il piano creerà 50.000 posti di lavoro in cinque anni.`,
  opts: VFN, ans: 2,
  sol: `Frase chiave: «Secondo il ministro». Il brano riporta una stima attribuita al ministro e la richiesta dei sindacati di verificarla, senza dire se sia corretta: l'affermazione presenta come fatto ciò che è solo una stima non verificata. Non deducibile (e non falsa: nessuno dice che i posti saranno un numero diverso da 50.000).`,
  trap: `Rispondere «Vera» scambiando una stima attribuita a qualcuno («secondo il ministro») per un fatto. Oppure «Falsa» perché i sindacati chiedono una verifica: chiedere di verificare una stima non la rende falsa.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 28 ---------- */
{ n: 28, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Le cinque lettere A, B, C, D, E vengono disposte in fila, una sola volta ciascuna. In quanti ordini la A precede la B (non necessariamente subito prima)?`,
  opts: ['24', '48', '60', '120'], ans: 2,
  sol: `Gli ordini possibili sono 5! = 120. In ognuno la A sta prima della B oppure dopo, e scambiando A e B si passa da un caso all'altro: i due gruppi sono uguali. Gli ordini con A prima di B sono 120 ÷ 2 = 60.`,
  trap: `Rispondere 120 (tutte le permutazioni) oppure 24 (trattando «AB» come un blocco unico: 4! ordini con A subito prima di B). La domanda non chiede che siano adiacenti.`,
  patt: 'Combinazioni vs permutazioni' },

/* ---------- 29 ---------- */
{ n: 29, area: 'DI', diff: 'difficile', lang: 'it', asset: gPareggio(),
  stem: `Se le due rette proseguissero con la stessa pendenza, a quante unità vendute ricavi e costi si pareggerebbero?`,
  opts: ['500', '600', '700', '800'], ans: 1,
  sol: `Ricavi: 120 mila € ogni 400 unità, cioè 0,30 mila € per unità. Costi: 60 mila € fissi più (140 − 60) ÷ 400 = 0,20 mila € per unità. Pareggio: 0,30 x = 60 + 0,20 x, quindi 0,10 x = 60 e x = 600 unità (a 600 unità ricavi e costi valgono 180 mila €).`,
  trap: `Guardare il punto in cui le rette sembrano avvicinarsi (400 unità) o fermarsi a metà strada. Il divario a 400 unità è 20 mila €; si riduce di 0,10 mila € per ogni unità in più, quindi servono altre 200 unità.`,
  patt: 'Lettura di grafici: estrapolazione' },

/* ---------- 30 ---------- */
{ n: 30, area: 'V', diff: 'difficile', lang: 'it',
  passage: `In un circolo la maggior parte degli iscritti al corso di tedesco frequenta anche il corso di inglese, e la maggior parte degli iscritti al corso di inglese frequenta anche il corso di francese.`,
  stem: `Quale delle seguenti affermazioni è certamente vera?`,
  opts: [`La maggior parte degli iscritti al corso di tedesco frequenta anche il corso di francese.`,
         `Almeno un iscritto al corso di tedesco frequenta anche il corso di francese.`,
         `Gli iscritti al corso di inglese sono più numerosi di quelli al corso di tedesco.`,
         `Almeno un iscritto al corso di inglese frequenta anche il corso di tedesco.`], ans: 3,
  sol: `Frase chiave: «la maggior parte degli iscritti al corso di tedesco frequenta anche il corso di inglese». Se più della metà degli iscritti al tedesco frequenta anche l'inglese, c'è almeno un iscritto al tedesco che frequenta l'inglese: è un iscritto al corso di inglese che frequenta anche il tedesco. Le altre non seguono. Esempio: 10 iscritti all'inglese, 6 dei quali anche al francese (più della metà); 7 iscritti al tedesco, 4 dei quali frequentano l'inglese (più della metà) e sono proprio i 4 iscritti all'inglese senza francese, mentre gli altri 3 fanno solo tedesco. Qui nessuno frequenta insieme tedesco e francese (A e B false). Con 15 iscritti al tedesco, di cui 8 anche all'inglese, il tedesco supera l'inglese (D non è necessaria).`,
  trap: `Trattare «la maggior parte» come una relazione transitiva (tedesco → inglese → francese ⇒ tedesco → francese). Le due maggioranze possono riguardare sottogruppi diversi degli iscritti all'inglese, senza alcuna intersezione con il francese.`,
  patt: 'Quantificatori' },

/* ---------- 31 ---------- */
{ n: 31, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Quanti numeri interi compresi tra 100 e 200 (estremi inclusi) sono multipli di 7?`,
  opts: ['13', '14', '15', '16'], ans: 1,
  sol: `Il primo multiplo di 7 non minore di 100 è 105 (7 × 15) e l'ultimo non maggiore di 200 è 196 (7 × 28). I multipli sono 7 × 15, 7 × 16, …, 7 × 28: 28 − 15 + 1 = 14.`,
  trap: `Sbagliare di uno: 28 − 15 = 13 dimentica un estremo; 200 ÷ 7 − 100 ÷ 7 ≈ 14,3 invita ad arrotondare a 15. Si contano i termini, non la differenza.`,
  patt: 'Conteggio degli estremi' },

/* ---------- 32 ---------- */
{ n: 32, area: 'DI', diff: 'facile', lang: 'it', asset: tFigli(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`La mediana è 2.`,
         `La moda è 2.`,
         `La media è maggiore della mediana, che è maggiore della moda.`,
         `La media è minore della mediana.`], ans: 2,
  sol: `Le famiglie sono 8 + 12 + 8 + 6 + 4 + 2 = 40. Moda: il valore più frequente è 1 (12 famiglie). Mediana: tra la 20ª e la 21ª famiglia; fino a 1 figlio si contano 8 + 12 = 20 famiglie, quindi la 20ª ha 1 figlio e la 21ª ne ha 2: mediana 1,5. Media: (0·8 + 1·12 + 2·8 + 3·6 + 4·4 + 5·2) ÷ 40 = 72 ÷ 40 = 1,8. Dunque moda 1 < mediana 1,5 < media 1,8.`,
  trap: `Confondere la moda con il numero di figli «al centro» della tabella (2) o con la mediana. La mediana non è il valore centrale della riga di intestazione, ma quello della 20ª e 21ª famiglia ordinate. Le code lunghe (4 e 5 figli) trascinano la media sopra la mediana.`,
  patt: 'Media, mediana e moda' },

/* ---------- 33 ---------- */
{ n: 33, area: 'V', diff: 'media', lang: 'en',
  passage: `A company notes that employees who use the on-site gym took fewer sick days last year than employees who do not, and concludes that using the gym reduces sick leave.`,
  stem: `Which of the following, if true, most weakens the company's conclusion?`,
  opts: [`Employees who were already in very good health before the gym opened were much more likely to start using it.`,
         `The gym was built by an external contractor.`,
         `Some employees use the gym only once a week.`,
         `The gym is open from 7 a.m. to 9 p.m. on weekdays.`], ans: 0,
  sol: `Se a frequentare la palestra sono soprattutto persone già in ottima salute, i pochi giorni di malattia dipendono dalla salute di partenza e non dalla palestra: causa alternativa (selezione) che indebolisce il nesso palestra → meno assenze.`,
  trap: `Scegliere C: chi va in palestra poco spesso ha comunque meno giorni di malattia del gruppo di confronto, quindi non indebolisce la conclusione. Gli orari e il costruttore (A, B) sono irrilevanti.`,
  patt: 'Cause alternative' },

/* ---------- 34 ---------- */
{ n: 34, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Quattro amici dividono in parti uguali il conto di una cena. All'ultimo momento uno non può pagare e gli altri tre versano 5 € in più ciascuno rispetto a quanto previsto. Quanto era il conto?`,
  opts: ['45 €', '60 €', '75 €', '80 €'], ans: 1,
  sol: `Se la quota prevista è x, il conto è 4x. Con tre paganti, ciascuno versa x + 5 e 3(x + 5) = 4x, da cui x = 15 e il conto è 4 × 15 = 60 €. (Controllo: 3 × 20 = 60.)`,
  trap: `Fermarsi a x = 15 € (la quota di prima) oppure pensare che i 5 € in più siano la quota dell'amico mancante divisa per tre. La quota dell'assente è x e, divisa per tre, deve valere 5: x ÷ 3 = 5, da cui x = 15.`,
  patt: 'Equazioni e problemi a parole' },

/* ---------- 35 ---------- */
{ n: 35, area: 'DI', diff: 'media', lang: 'it', asset: tContratti(),
  stem: `Tra i dipendenti a tempo determinato, quale quota lavora in Produzione?`,
  opts: ['31,25%', '35,7%', '50%', '57,1%'], ans: 2,
  sol: `Ricostruiamo le celle: Commerciale a tempo determinato = 70 − 40 = 30; Logistica totale = 30 + 20 = 50. Dipendenti a tempo determinato: 50 + 30 + 20 = 100. Quelli di Produzione sono 50 su 100: 50%. (Controllo: 160 + 70 + 50 = 280.)`,
  trap: `Usare la riga invece della colonna: 50 ÷ 160 = 31,25% è la quota di contratti a termine dentro la Produzione; 160 ÷ 280 = 57,1% è la quota di Produzione sul totale dei dipendenti. La domanda ha come base solo i dipendenti a tempo determinato.`,
  patt: 'Base della percentuale' },

/* ---------- 36 ---------- */
{ n: 36, area: 'V', diff: 'media', lang: 'it',
  passage: `In un paese i modelli di auto sono diventati molto più sicuri: negli ultimi vent'anni i test di collisione mostrano una riduzione drastica del rischio di morte per ogni singolo incidente. Eppure il numero annuo di morti sulle strade non è diminuito.`,
  stem: `Quale delle seguenti affermazioni, se vera, spiega meglio il fatto apparentemente contraddittorio?`,
  opts: [`I test di collisione sono eseguiti anche da enti indipendenti.`,
         `Il numero di incidenti è cresciuto, nello stesso periodo, in misura tale da compensare la minore letalità di ciascuno.`,
         `Le auto più sicure costano in media più di quelle prodotte vent'anni fa.`,
         `Molti automobilisti ritengono che le strade siano oggi meglio tenute.`], ans: 1,
  sol: `I morti totali sono incidenti × morti per incidente. Se la letalità del singolo incidente cala ma gli incidenti aumentano abbastanza, il prodotto resta invariato: è il solo elemento che spiega perché un rischio unitario più basso non riduca il totale.`,
  trap: `Scegliere A o C: aggiungono informazioni sui test o sul prezzo ma non toccano il numero di incidenti né la letalità. Un rapporto che migliora (morti per incidente) può convivere con un valore assoluto (morti totali) invariato se cambia il denominatore.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 37 ---------- */
{ n: 37, area: 'Q', diff: 'media', lang: 'it',
  stem: `Il rapporto A/B tra due numeri positivi vale 2. Se A aumenta del 50% e B diminuisce del 50%, quanto vale il nuovo rapporto A/B?`,
  opts: ['2', '3', '4', '6'], ans: 3,
  sol: `Con A = 2 e B = 1 si ottiene, dopo le variazioni, A = 3 e B = 0,5: il rapporto è 3 ÷ 0,5 = 6. In generale il rapporto si moltiplica per ${fr('1,5', '0,5')} = 3, e 2 × 3 = 6.`,
  trap: `Pensare che +50% e −50% «si compensino» (resta 2), oppure cambiare solo il numeratore (3). Un rapporto cambia per due fattori: ridurre il denominatore a metà equivale a raddoppiare il rapporto.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 38 ---------- */
{ n: 38, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('In una classe di 40 studenti, quanti hanno superato sia l\'esame di matematica sia quello di fisica?',
    '30 studenti hanno superato l\'esame di matematica.',
    '25 studenti hanno superato l\'esame di fisica.'),
  opts: DSOPTS, ans: 3,
  sol: `Insieme (1) e (2) fissano solo i due insiemi, non quanti studenti ne facciano parte contemporaneamente. Se tutti hanno superato almeno un esame, i due gruppi si sovrappongono per 30 + 25 − 40 = 15 studenti; ma se qualcuno non ha superato nessuno dei due, la sovrapposizione è maggiore (fino a 25). Quindi nemmeno insieme sono sufficienti.`,
  trap: `Calcolare 30 + 25 − 40 = 15 e rispondere «servono entrambe». Il calcolo è corretto solo se nessuno ha fallito entrambi gli esami, ipotesi che il testo non fornisce.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 39 ---------- */
{ n: 39, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel 2025 l'orto botanico ha registrato 80.000 visitatori, il 25% in più rispetto al 2024. Il 60% dei visitatori del 2025 era costituito da turisti stranieri, i restanti da residenti. Nel 2024 l'orto botanico è rimasto chiuso per tre mesi per lavori di ristrutturazione.`,
  stem: `Quale delle seguenti affermazioni NON può essere dedotta dal brano?`,
  opts: [`L'aumento dei visitatori del 2025 è dovuto alla riapertura dopo i lavori di ristrutturazione.`,
         `Nel 2024 i visitatori dell'orto botanico sono stati 64.000.`,
         `Nel 2025 i residenti tra i visitatori sono stati 32.000.`,
         `Nel 2024 l'orto botanico è stato aperto per meno di dodici mesi.`], ans: 0,
  sol: `B: 80.000 ÷ 1,25 = 64.000, deducibile. C: il 40% di 80.000 = 32.000, deducibile. D: chiuso tre mesi, quindi aperto al più nove mesi, deducibile. A attribuisce l'aumento alla riapertura: il brano accosta i due fatti ma non dice che il secondo spieghi il primo.`,
  trap: `Cercare il «difetto» nei calcoli (le opzioni B e C sembrano più rischiose perché contengono numeri) e scegliere un'opzione numerica. Le deduzioni numeriche sono verificabili; il nesso causale non è mai dichiarato.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 40 ---------- */
{ n: 40, area: 'Q', diff: 'media', lang: 'it',
  stem: `Quale delle seguenti frazioni ha il valore maggiore?`,
  opts: [fr(5, 7), fr(3, 4), fr(7, 9), fr(11, 14)], ans: 3,
  sol: `Si confronta ciascuna frazione con 1: mancano ${fr(2, 7)}, ${fr(1, 4)}, ${fr(2, 9)} e ${fr(3, 14)} per arrivare a 1. È maggiore la frazione a cui manca di meno. Tra ${fr(2, 9)} e ${fr(3, 14)}: 2 × 14 = 28 contro 3 × 9 = 27, quindi ${fr(3, 14)} è la più piccola e ${fr(11, 14)} è la frazione maggiore. (In decimali: 0,714; 0,75; 0,778; 0,786.)`,
  trap: `Fermarsi a ${fr(7, 9)}, che sembra la più alta, o giudicare dal numeratore e dal denominatore più grandi: le due frazioni migliori differiscono di meno di un centesimo (0,778 contro 0,786). Il confronto con 1, o il prodotto in croce (11 × 9 = 99 contro 7 × 14 = 98), risolve senza decimali.`,
  patt: 'Frazioni' },

/* ---------- 41 ---------- */
{ n: 41, area: 'DI', diff: 'media', lang: 'it', asset: gCiclisti(),
  stem: `A quale distanza dalla partenza il ciclista Y raggiunge il ciclista X?`,
  opts: ['30 km', '36 km', '40 km', '45 km'], ans: 3,
  sol: `X percorre 48 km in 4 h: 12 km/h. Y percorre 50 km in 4 − 1,5 = 2,5 h: 20 km/h. Dopo t ore, X ha percorso 12 t e Y ha percorso 20 (t − 1,5). Si raggiungono quando 12 t = 20 t − 30, cioè t = 3,75 h, a 12 × 3,75 = 45 km dalla partenza.`,
  trap: `Prendere uno dei valori segnati (48 km, 50 km) come punto d'incontro: le rette si incrociano prima dell'ultima rilevazione, a 3,75 h, perché Y, più veloce, recupera gradualmente il ritardo di 1,5 h. Per trovare il punto servono le due velocità (le pendenze), non i valori finali.`,
  patt: 'Livello vs variazione' },

/* ---------- 42 ---------- */
{ n: 42, area: 'V', diff: 'media', lang: 'it',
  passage: `Il comune prevede che la nuova linea di metropolitana, che servirà un quartiere di 50.000 residenti, avrà ogni giorno 20.000 passeggeri. La previsione si basa sul fatto che la linea 2, che serve un quartiere di 40.000 residenti, ha ogni giorno 16.000 passeggeri.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la previsione del comune?`,
  opts: [`Il progetto della nuova linea è stato approvato dal consiglio comunale all'unanimità.`,
         `Il quartiere servito dalla nuova linea ospita una quota di anziani molto più alta di quella del quartiere della linea 2, e gli anziani usano poco la metropolitana.`,
         `La linea 2 è stata inaugurata dieci anni fa.`,
         `Il prezzo del biglietto è uguale per tutte le linee.`], ans: 1,
  sol: `La previsione assume che i due quartieri si comportino allo stesso modo (40% di residenti che usano la metropolitana ogni giorno). Una composizione molto diversa della popolazione, con più persone che usano poco la metropolitana, mette in dubbio proprio questa somiglianza.`,
  trap: `Scegliere C: l'anzianità della linea non dice se i due quartieri siano confrontabili. Un ragionamento per analogia si indebolisce mostrando una differenza rilevante tra i due casi, non aggiungendo informazioni qualsiasi.`,
  patt: 'Rafforza e indebolisce' },

/* ---------- 43 ---------- */
{ n: 43, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Qual è il più piccolo intero positivo n tale che n² sia divisibile per 12?`,
  opts: ['3', '4', '6', '12'], ans: 2,
  sol: `12 = 2² × 3. Perché n² contenga un fattore 3 anche n deve contenerlo; perché contenga 2² basta che n contenga un solo 2. Quindi n deve essere multiplo di 2 × 3 = 6. Il più piccolo è 6: 6² = 36 = 3 × 12.`,
  trap: `Scegliere 12 perché «se 12 divide n², allora n è multiplo di 12»: è falso. Anche 3 e 4 sembrano plausibili, ma 3² = 9 e 4² = 16 non sono divisibili per 12.`,
  patt: 'Multipli e divisibilità' },

/* ---------- 44 ---------- */
{ n: 44, area: 'DI', diff: 'media', lang: 'it', asset: tMagazzino(),
  stem: `A fine di quale mese la scorta del magazzino è minima?`,
  opts: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile'], ans: 2,
  sol: `Variazione netta (entrate − uscite): gennaio −30, febbraio −40, marzo −10, aprile +30, maggio −15. Scorta a fine mese partendo da 100: 70, 30, 20, 50, 35. Il minimo è a fine marzo (20).`,
  trap: `Scegliere il mese con la perdita netta maggiore (febbraio, −40) o con le vendite più alte (gennaio, 80). La scorta è la somma cumulata delle variazioni: scende finché le variazioni sono negative, anche se sempre meno, e tocca il minimo quando diventano positive (aprile).`,
  patt: 'Livello vs variazione' },

/* ---------- 45 ---------- */
{ n: 45, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Quattro colleghi, Anna, Bruno, Carla e Dario, sono sospettati di aver lasciato aperta la finestra dell'ufficio; è stato uno solo di loro. Ciascuno fa una dichiarazione. Anna: «È stato Bruno.» Bruno: «È stato Carla.» Carla: «Non è stato Dario.» Dario: «Non è stato Bruno.» Si sa che una sola delle quattro dichiarazioni è vera.`,
  stem: `Chi ha lasciato aperta la finestra?`,
  opts: ['Anna', 'Bruno', 'Carla', 'Dario'], ans: 3,
  sol: `Si prova ogni colpevole contando le dichiarazioni vere. Anna: vere quelle di Carla e di Dario → 2. Bruno: vere quelle di Anna e di Carla → 2. Carla: vere quelle di Bruno, Carla e Dario → 3. Dario: vera solo quella di Dario («Non è stato Bruno») → 1. Solo con Dario le dichiarazioni vere sono esattamente una.`,
  trap: `Seguire la prima dichiarazione («è stato Bruno») senza verificare le altre tre: se è Bruno le dichiarazioni vere sono due (la sua condizione dice una sola). Il metodo sicuro è provare ogni sospettato e contare.`,
  patt: 'Vincoli logici' },

/* ---------- 46 ---------- */
{ n: 46, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Oggi è giovedì. Che giorno della settimana sarà tra 100 giorni?`,
  opts: ['mercoledì', 'giovedì', 'venerdì', 'sabato'], ans: 3,
  sol: `I giorni della settimana si ripetono ogni 7. Poiché 100 = 14 × 7 + 2, dopo 98 giorni è di nuovo giovedì e due giorni dopo è sabato.`,
  trap: `Dividere 100 per 7 (14,28…) e dimenticare il resto, rispondendo «giovedì», oppure contare un giorno in meno e dire venerdì. Conta solo il resto della divisione per 7.`,
  patt: 'Multipli e resti' },

/* ---------- 47 ---------- */
{ n: 47, area: 'DI', diff: 'difficile', lang: 'en', ds: true,
  stem: ds('Is the average score of the 30 students in a class higher than 70?',
    'The 10 women in the class have an average score of 80.',
    'The 20 men in the class have an average score of 65.'),
  opts: DSOPTS_EN, ans: 2,
  sol: `Da sola la (1) lascia libera la media degli uomini, da sola la (2) quella delle donne: in entrambi i casi la media della classe può stare sopra o sotto 70. Insieme: (10 × 80 + 20 × 65) ÷ 30 = 2.100 ÷ 30 = 70. La media è esattamente 70, cioè non è superiore a 70: la risposta alla domanda è sempre «no», quindi i due dati insieme sono sufficienti.`,
  trap: `Fare la media semplice di 80 e 65 (72,5) e concludere che la media supera 70: gli uomini sono il doppio delle donne, quindi la media è più vicina a 65. E pensare che «esattamente 70» non sia una risposta: «No» è una risposta definita.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 48 ---------- */
{ n: 48, area: 'V', diff: 'media', lang: 'it',
  passage: `Un'azienda di logistica ha deciso di sostituire i furgoni a gasolio con furgoni elettrici, convinta che così ridurrà i costi di gestione del parco mezzi, anche perché l'energia per chilometro costa meno del gasolio.`,
  stem: `Su quale assunzione si basa principalmente la decisione?`,
  opts: [`Tutti i clienti dell'azienda preferiscono consegne a emissioni zero.`,
         `Il prezzo del gasolio aumenterà nei prossimi anni.`,
         `Il costo di acquisto, manutenzione e ricarica dei furgoni elettrici non annulla il risparmio sul costo dell'energia per chilometro.`,
         `I furgoni elettrici sono più veloci di quelli a gasolio.`], ans: 2,
  sol: `La conclusione riguarda i costi totali di gestione, ma la premessa cita solo il costo dell'energia. Perché il ragionamento regga, gli altri costi non devono annullare quel risparmio. Se lo annullassero, la decisione non ridurrebbe i costi: è un'assunzione necessaria.`,
  trap: `Scegliere B: un aumento futuro del gasolio rafforzerebbe il piano, ma non è necessario: già oggi l'energia costa meno. Le assunzioni necessarie sono quelle la cui negazione fa crollare l'argomento.`,
  patt: 'Assunzione implicita' },

/* ---------- 49 ---------- */
{ n: 49, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Due interi positivi a e b hanno prodotto 36. Qual è il valore minimo possibile di a + b?`,
  opts: ['12', '13', '15', '20'], ans: 0,
  sol: `Le coppie con prodotto 36 sono (1, 36), (2, 18), (3, 12), (4, 9) e (6, 6), con somme 37, 20, 15, 13 e 12. La somma minima è 12, con a = b = 6.`,
  trap: `Escludere la coppia (6, 6) perché i numeri «sembrano diversi» e rispondere 13. Il testo non dice che a e b siano distinti. A parità di prodotto, la somma è minima quando i due numeri sono uguali.`,
  patt: 'Equazioni e problemi a parole' },

/* ---------- 50 ---------- */
{ n: 50, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un'azienda ha due sedi. La sede di Milano impiega il 70% dei dipendenti, con uno stipendio medio di 1.800 €; la sede di Roma impiega il restante 30%, con uno stipendio medio di 2.600 €. Di quanti euro lo stipendio medio dell'intera azienda è inferiore alla media aritmetica dei due stipendi medi?`,
  opts: ['160 €', '200 €', '240 €', '400 €'], ans: 0,
  sol: `Media aritmetica dei due stipendi medi: (1.800 + 2.600) ÷ 2 = 2.200 €. Stipendio medio dell'azienda: 0,70 × 1.800 + 0,30 × 2.600 = 1.260 + 780 = 2.040 €. Differenza: 2.200 − 2.040 = 160 €.`,
  trap: `Dare lo stesso peso alle due sedi (2.200 €): Milano ha più del doppio dei dipendenti di Roma, quindi la media dell'azienda sta più vicina a 1.800. Scambiare i pesi (30% a Milano, 70% a Roma) darebbe 2.360 €, sopra la media semplice.`,
  patt: 'Media ponderata vs semplice' }
];

return {
  id: '11',
  title: 'Mock 11',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Focus su Data Insights: istogrammi, grafici a due assi, rette da prolungare, tabelle da ricostruire e sufficienza dei dati.',
  questions: QUESTIONS,
  data: DATA
};
});
