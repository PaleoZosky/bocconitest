/* =======================================================================
   Mock 16 — 50 domande nuove (18 Q, 16 V, 16 DI), calibrate con
   guida-calibrazione-mock.md. Rispetto al Mock 14: Data Insights allo
   stesso livello; Quantitativa e Verbale più difficili (3–4 passaggi per
   domanda, brani da 120–200 parole con negazioni e modali, opzioni
   sbagliate tutte plausibili: metà vere, ambito spostato, causa invertita,
   periodo sbagliato, assoluti).

   Nelle domande di sufficienza dei dati i criteri sono fissi:
   A = una sola delle due affermazioni basta, B = servono entrambe,
   C = ciascuna basta da sola, D = servono altri dati; nella lista
   compaiono in ordine rimescolato (la lettera del criterio è scritta
   nel testo dell'opzione, la posizione A–D è quella del pulsante).

   Come è costruito il file: ogni domanda sta in ITEMS con la risposta
   giusta (`ok`) e le tre sbagliate (`ko`); ORDER dice in che ordine
   compaiono nel mock e POS in che posizione (A–D) cade la risposta
   giusta, così la chiave è bilanciata senza riscrivere i testi.
   Tutti i numeri dei grafici e delle tabelle stanno in DATA e sono
   riusati da tools/check_math_16.py per ricalcolare le risposte.
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

const ds = C.ds;

/* vero / falso / non ricavabile con la motivazione dentro l'opzione (ordine fisso: Falsa, Non ricavabile, Vera) */
const VFN = [
  'Falsa, poiché contraddice un\'affermazione contenuta nel brano o da esso deducibile',
  'Non ricavabile dal testo, poiché non ci sono abbastanza informazioni',
  'Vera, poiché è contenuta nel brano o da esso deducibile'
];

/* sufficienza dei dati: criteri fissi, lettere rimescolate nella lista */
const DSL = {
  A: 'Criterio A — una sola delle due affermazioni basta (l\'altra, da sola, non basta)',
  B: 'Criterio B — servono entrambe le affermazioni insieme: nessuna delle due basta da sola',
  C: 'Criterio C — ciascuna affermazione, da sola, basta',
  D: 'Criterio D — anche con entrambe le affermazioni servono altri dati'
};
const DSL_EN = {
  A: 'Criterion A — only one of the two statements is sufficient (the other, alone, is not)',
  B: 'Criterion B — both statements are needed together: neither is sufficient alone',
  C: 'Criterion C — each statement, alone, is sufficient',
  D: 'Criterion D — even with both statements, more data are needed'
};
/* `order` = ordine in cui compaiono i criteri A–D nella lista, `giusta` = lettera del criterio corretto */
function dsq(giusta, order, en) {
  const L = en ? DSL_EN : DSL;
  return { opts: order.split('').map(k => L[k]), ans: order.indexOf(giusta) };
}
/* risposta giusta + tre sbagliate, la giusta in posizione `pos` */
function mc(ok, ko, pos) {
  const o = ko.slice(); o.splice(pos, 0, ok);
  return { opts: o, ans: pos };
}
/* come mc, ma con una quarta opzione fissa in fondo («non è possibile determinarlo») */
function mcLast(ok, ko, last, pos) {
  const r = mc(ok, ko, pos);
  r.opts.push(last);
  return r;
}

/* ============================== DATI ============================== */
const DATA = {
  /* g1 — vendite: variazioni mensili (%) da febbraio a giugno, pezzi di aprile, prezzi */
  vendite: { mesi: ['Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno'], var: [25, -20, 50, -40, 20], pezziAprile: 600, prezzoFinoMarzo: 12, prezzoDaAprile: 15 },
  /* g2 — ricavi e costi trimestrali (milioni di euro) e voci straordinarie */
  trim: { t: ['T1', 'T2', 'T3', 'T4'], ricavi: [40, 46, 52, 48], costi: [30, 34, 36, 38], spesaStraord: 8, ricavoStraord: 4 },
  /* g3 — bilancio comunale (% e milioni) */
  bilancio: { quote: [['Personale', 30], ['Servizi', 40], ['Investimenti', 20], ['Altro', 10]], totale: 12, rapporto: [3, 2, 1], totale2: 15, servizi2: 36 },
  /* t1 — iscritti per corso e area (% di riga) */
  iscritti: { corsi: ['Economia', 'Giurisprudenza', 'Ingegneria'], pct: [[50, 30, 20], [25, 25, 50], [40, 40, 20]], tot: [600, 400, 200] },
  /* t2 — esportazioni (milioni di euro) */
  export: { anni: [2022, 2023, 2024, 2025], tessile: [120, 130, 126, 144], meccanica: [300, 320, 330, 340], alimentare: [90, 108, 117, 135], chimica: [80, 84, 78, 74] },
  /* t3 — piani retributivi (euro) */
  piani: { A: [1200, 20], B: [800, 30], C: [0, 50] }
};

/* ======================= tabelle e grafici ======================= */
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

function gVendite() {
  const D = DATA.vendite;
  const W = 520, H = 280, L = 44, R = 16, T = 24, B = 40, lo = -50, hi = 60;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  const slot = (W - L - R) / D.mesi.length, bw = slot * 0.5;
  let g = '';
  for (let t = lo; t <= hi; t += 10) {
    if (t % 20 !== 0 && t !== 0) continue;
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t > 0 ? '+' : ''}${t}%</text>`;
  }
  D.var.forEach((v, i) => {
    const x = L + slot * i + (slot - bw) / 2, top = v >= 0 ? y(v) : y(0), h = Math.abs(y(v) - y(0));
    g += `<rect x="${x}" y="${top}" width="${bw}" height="${h}" style="fill:var(--${v >= 0 ? 's1' : 's2'})"><title>${D.mesi[i]}: ${v > 0 ? '+' : ''}${v}%</title></rect>`;
    g += `<text x="${x + bw / 2}" y="${v >= 0 ? top - 6 : top + h + 15}" class="val" text-anchor="middle">${v > 0 ? '+' : '−'}${Math.abs(v)}%</text>`;
    g += `<text x="${x + bw / 2}" y="${H - 12}" class="tick" text-anchor="middle">${D.mesi[i]}</text>`;
  });
  return `<figure class="fig"><figcaption>Variazione percentuale delle vendite (in pezzi) rispetto al mese precedente</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cinque colonne con la variazione delle vendite rispetto al mese precedente: ${D.mesi.map((m, i) => m + ' ' + (D.var[i] > 0 ? '+' : '') + D.var[i] + '%').join(', ')}.">${g}</svg></div>
<p class="fig-note">Il grafico parte da febbraio: gennaio è il mese di confronto. Ad aprile sono stati venduti ${D.pezziAprile} pezzi. Il prezzo di vendita è stato di ${D.prezzoFinoMarzo} € a pezzo fino a marzo e di ${D.prezzoDaAprile} € a pezzo da aprile in poi.</p></figure>`;
}

function gTrim() {
  const D = DATA.trim;
  const W = 520, H = 280, L = 44, R = 24, T = 20, B = 32, lo = 20, hi = 60;
  const x = i => L + (W - L - R) * i / 3;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  let g = '';
  for (let t = lo; t <= hi; t += 10) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === lo ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  D.t.forEach((q, i) => { g += `<text x="${x(i)}" y="${H - 8}" class="tick" text-anchor="middle">${q}</text>`; });
  const line = (arr, c, dash) => `<polyline points="${arr.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" style="stroke:var(--${c})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${dash ? ' stroke-dasharray="6 4"' : ''}></polyline>`;
  const dots = (arr, c, name) => arr.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"><title>${name}, ${D.t[i]}: ${v}</title></circle>`).join('');
  g += line(D.ricavi, 's1') + line(D.costi, 's2', true) + dots(D.ricavi, 's1', 'Ricavi') + dots(D.costi, 's2', 'Costi');
  D.t.forEach((q, i) => {
    g += `<text x="${x(i)}" y="${y(D.ricavi[i]) - 11}" class="val" text-anchor="middle">${D.ricavi[i]}</text>`;
    g += `<text x="${x(i)}" y="${y(D.costi[i]) + 19}" class="val" text-anchor="middle">${D.costi[i]}</text>`;
  });
  return `<figure class="fig"><figcaption>Ricavi e costi di un'azienda per trimestre (milioni di euro)</figcaption>
<ul class="legend"><li><i class="sw line" style="background:var(--s1)"></i>Ricavi</li><li><i class="sw line" style="background:var(--s2)"></i>Costi</li></ul>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Due linee su quattro trimestri, in milioni di euro. Ricavi: ${D.ricavi.join(', ')}. Costi: ${D.costi.join(', ')}.">${g}</svg></div>
<p class="fig-note">Nel terzo trimestre i costi indicati non comprendono una spesa straordinaria di ${D.spesaStraord} milioni di euro, che è stata sostenuta in quel trimestre. I ricavi del quarto trimestre comprendono ${D.ricavoStraord} milioni di euro di ricavo straordinario.</p></figure>`;
}

function gBilancio() {
  const D = DATA.bilancio;
  return `<figure class="fig"><figcaption>Come il comune di Valmare ripartisce il proprio bilancio annuo</figcaption>` + C.pie({
    data: D.quote, title: 'Bilancio',
    aria: 'Torta con le quote del bilancio: ' + D.quote.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `<p class="fig-note">Il bilancio di quest'anno è di ${D.totale} milioni di euro. La spesa per i Servizi si divide tra scuole, trasporti e verde pubblico nel rapporto ${D.rapporto.join(' : ')}. L'anno prossimo il bilancio salirà a ${D.totale2} milioni di euro, la quota dei Servizi scenderà al ${D.servizi2}% e il rapporto ${D.rapporto.join(' : ')} resterà lo stesso.</p></figure>`;
}

function tIscritti() {
  const S = DATA.iscritti;
  return C.table({
    caption: 'Iscritti a tre corsi di laurea per area di provenienza (% degli iscritti di ciascun corso)',
    head: ['Corso', 'Nord', 'Centro', 'Sud e isole', 'Iscritti del corso'],
    rows: S.corsi.map((c, i) => [c].concat(S.pct[i].map(p => p + '%'), [fmt(S.tot[i])]))
  }) + `<p class="fig-note">Le tre percentuali di ogni riga sommano a 100%. L'ultima colonna indica il numero di iscritti di ciascun corso.</p>`;
}

function tExport() {
  const E = DATA.export;
  return C.table({
    caption: 'Esportazioni di quattro settori, in milioni di euro',
    head: ['Settore'].concat(E.anni),
    rows: [['Tessile'].concat(E.tessile), ['Meccanica'].concat(E.meccanica), ['Alimentare'].concat(E.alimentare), ['Chimica'].concat(E.chimica)]
  });
}

function tPiani() {
  const P = DATA.piani, f = v => fmt(v) + ' €';
  return C.table({
    caption: 'Tre piani retributivi mensili per un agente commerciale',
    head: ['Piano', 'Parte fissa', 'Per ogni contratto concluso'],
    rows: [['A', f(P.A[0]), f(P.A[1])], ['B', f(P.B[0]), f(P.B[1])], ['C', 'nessuna', f(P.C[1])]]
  }) + `<p class="fig-note">La retribuzione del mese è la parte fissa più l'importo per contratto moltiplicato per il numero di contratti conclusi nel mese.</p>`;
}

/* ======================= LE 50 DOMANDE ======================= */
const ITEMS = {

/* ===================== QUANTITATIVA (18) ===================== */

q_list: { area: 'Q', diff: 'media', lang: 'it',
  stem: `Un paio di cuffie viene venduto con due sconti successivi: prima il 30% sul prezzo di listino, poi un ulteriore 10% sul prezzo già scontato. Maria lo paga 126 €. Qual è il prezzo di listino?`,
  ok: '200 €', ko: ['210 €', '180 €', '140 €'],
  sol: `I due sconti si moltiplicano: 0,70 · 0,90 = 0,63. Quindi 126 = 0,63 · listino e il listino è 126 ÷ 0,63 = 200 €. (Controllo: 200 · 0,70 = 140; 140 · 0,90 = 126.)`,
  trap: `Sommare gli sconti (30% + 10% = 40%) e fare 126 ÷ 0,60 = 210 €. Le altre due tolgono un passaggio solo: 126 ÷ 0,70 = 180 (ignora il secondo sconto) e 126 ÷ 0,90 = 140 (ignora il primo; 140 è anche il prezzo dopo il primo sconto: un passaggio intermedio scambiato per la risposta).`,
  patt: 'Percentuali composte' },

q_off: { area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Tra il 2023 e il 2025 le vendite totali di un negozio sono aumentate del 50%, mentre la quota delle vendite online sul totale è scesa dal 40% al 30%. Di quanto sono variate, in percentuale, le vendite non online?`,
  ok: '+75%', ko: ['circa +17%', '+50%', '+60%'],
  sol: `Con vendite totali 100 nel 2023: online 40 e non online 60. Nel 2025 il totale è 150, l'online è il 30% di 150 = 45 e il non online è 150 − 45 = 105. 105 ÷ 60 = 1,75: +75%. (In fattori: 1,5 · 70/60 = 1,75.)`,
  trap: `Guardare solo la quota non online (da 60% a 70%: circa +17%) dimentica che il totale cresce; applicare il +50% del totale anche al non online ignora il cambio di quota; sommare +50% e i 10 punti di quota (+60%) mescola una variazione relativa con una differenza di punti.`,
  patt: 'Rapporti vs valori assoluti' },

q_mix: { area: 'Q', diff: 'media', lang: 'it',
  stem: `400 g di soluzione salina al 20% vengono mescolati con 100 g di soluzione al 70%; alla miscela si aggiungono poi 100 g di acqua pura. Qual è la concentrazione finale della soluzione?`,
  ok: '25%', ko: ['30%', '45%', '22,5%'],
  sol: `Sale: 20% di 400 g = 80 g e 70% di 100 g = 70 g, in tutto 150 g. Massa finale: 400 + 100 + 100 = 600 g. Concentrazione: 150 ÷ 600 = 25%. Il sale resta 150 g: l'acqua cambia solo il totale.`,
  trap: `Fermarsi prima dell'acqua (150 ÷ 500 = 30%); fare la media semplice delle due concentrazioni ((20% + 70%) ÷ 2 = 45%) ignorando che le masse sono 400 g e 100 g; mediare ancora con lo 0% dell'acqua (45% ÷ 2 = 22,5%).`,
  patt: 'Media ponderata vs semplice' },

q_marta: { area: 'Q', diff: 'facile', lang: 'it',
  stem: `Marta ha tre sorelle e ciascuna delle sue sorelle ha esattamente un fratello. Quanti figli ha in tutto la famiglia?`,
  ok: '5', ko: ['4', '7', '8'],
  sol: `Marta e le sue 3 sorelle sono 4 femmine. Ciascuna sorella ha «esattamente un fratello»: è sempre lo stesso maschio, perché se i fratelli fossero due ogni sorella ne avrebbe due. Figli: 4 + 1 = 5.`,
  trap: `Moltiplicare: «tre sorelle, ognuna con un fratello» fa pensare a 3 fratelli (3 + 4 = 7) o a 4 (4 + 4 = 8). Il fratello è uno solo, condiviso da tutte. Chi dimentica il fratello risponde 4.`,
  patt: 'Ragionamento laterale' },

q_sedi: { area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Un'azienda ha tre sedi. Le retribuzioni mensili medie sono 1.500 € a Torino, 2.000 € a Roma e 2.500 € a Milano. A Torino lavorano 40 persone, a Roma il doppio di Torino; la retribuzione media dell'intera azienda è di 2.100 €. Quante persone lavorano a Milano?`,
  ok: '80', ko: ['60', '40', '120'],
  sol: `Conviene lavorare sugli scarti dalla media aziendale (2.100 €). Torino: 40 · (1.500 − 2.100) = −24.000. Roma: 80 · (2.000 − 2.100) = −8.000. Gli scarti negativi (−32.000) devono essere compensati da quelli di Milano: M · (2.500 − 2.100) = 400 · M = 32.000, quindi M = 80. (Controllo: (40 · 1.500 + 80 · 2.000 + 80 · 2.500) ÷ 200 = 420.000 ÷ 200 = 2.100.)`,
  trap: `Dimenticare Roma: 24.000 ÷ 400 = 60. Sbagliare il segno dello scarto di Roma (−24.000 + 8.000 = −16.000 → 40). Pensare che Milano debba pareggiare le altre due sedi insieme (40 + 80 = 120). La media aziendale è una media ponderata: ogni sede pesa quante persone ha.`,
  patt: 'Media ponderata vs semplice' },

q_op: { area: 'Q', diff: 'media', lang: 'it',
  stem: `Sei operai identici, lavorando allo stesso ritmo, finirebbero un lavoro in 10 giorni. Dopo 4 giorni due operai lasciano il cantiere e gli altri quattro continuano allo stesso ritmo. In quanti giorni, contando dall'inizio, viene completato il lavoro?`,
  ok: '13 giorni', ko: ['15 giorni', '9 giorni', '12 giorni'],
  sol: `Il lavoro vale 6 · 10 = 60 giornate-operaio. In 4 giorni i sei operai ne fanno 6 · 4 = 24; ne restano 36. Con quattro operai: 36 ÷ 4 = 9 giorni. In tutto 4 + 9 = 13 giorni.`,
  trap: `Dimenticare i 4 giorni già lavorati da sei operai (60 ÷ 4 = 15); dare solo il tratto finale (9); usare un organico medio di 5 operai per tutto il lavoro (60 ÷ 5 = 12), come se i due operai che se ne vanno lavorassero metà del tempo.`,
  patt: 'Lavoro con cambio a metà' },

q_boc: { area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Quanti anagrammi della parola BOCCONI (anche privi di significato) hanno le due lettere C non vicine tra loro?`,
  ok: '900', ko: ['360', '1.260', '2.160'],
  sol: `Le lettere sono 7, con la C ripetuta due volte e la O ripetuta due volte: in tutto 7! ÷ (2! · 2!) = 5.040 ÷ 4 = 1.260 anagrammi. Con le due C vicine si forma un blocco CC da trattare come una lettera sola: restano 6 «lettere» (CC, B, O, O, N, I) con la O ripetuta, quindi 6! ÷ 2! = 360. Con le C non vicine: 1.260 − 360 = 900.`,
  trap: `Rispondere 360 (le C vicine, cioè il contrario di quel che si chiede) o 1.260 (nessun vincolo). Dimenticare la ripetizione della O nel totale (7! ÷ 2! = 2.520) e togliere 360 dà 2.160.`,
  patt: 'Combinatoria con vincolo' },

q_abc: { area: 'Q', diff: 'media', lang: 'it',
  stem: `Il prezzo di un articolo A supera del 25% quello di un articolo B, e il prezzo di un articolo C è inferiore del 20% a quello di A. Insieme, A, B e C costano 390 €. Quanto costa A?`,
  ok: '150 €', ko: ['120 €', '130 €', '187,50 €'],
  sol: `Sia b il prezzo di B: A = 1,25 · b e C = 0,80 · A = 0,80 · 1,25 · b = b. Quindi A + B + C = 1,25b + b + b = 3,25b = 390 e b = 120 €. A costa 1,25 · 120 = 150 €. (Controllo: 150 + 120 + 120 = 390.)`,
  trap: `Il −20% si applica ad A, non a B: C finisce per costare quanto B. 120 € è il prezzo di B e di C, quindi un passaggio intermedio scambiato per la risposta; 130 € è la media semplice 390 ÷ 3; 187,50 € applica ad A un altro +25%.`,
  patt: 'Base della percentuale' },

q_bici: { area: 'Q', diff: 'difficile', lang: 'en',
  stem: `Luca hikes up a 9 km trail at 3 km/h, rests at the summit for 30 minutes, and walks back down the same trail at 9 km/h. What is his average speed over the whole outing, including the rest?`,
  ok: '4 km/h', ko: ['4.5 km/h', '6 km/h', '2 km/h'],
  sol: `Time uphill: 9 km ÷ 3 km/h = 3 h. Time downhill: 9 ÷ 9 = 1 h. Rest: 30 min = 0.5 h. Total time = 3 + 0.5 + 1 = 4.5 h. Total distance = 9 + 9 = 18 km. Average speed = 18 ÷ 4.5 = 4 km/h.`,
  trap: `Averaging the two speeds: (3 + 9) ÷ 2 = 6 km/h, but the slow leg lasts three times longer, so it weighs more. Forgetting the rest gives 18 ÷ 4 = 4.5 km/h. Using only the one-way distance over the total time gives 9 ÷ 4.5 = 2 km/h.`,
  patt: 'Media ponderata vs semplice' },

q_prob: { area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Da un gruppo di 6 uomini e 4 donne si scelgono a caso 3 persone per formare un comitato. Qual è la probabilità che nel comitato ci sia almeno un uomo e almeno una donna?`,
  ok: fr(4, 5), ko: [fr(1, 5), fr(18, 25), fr(29, 30)],
  sol: `Conviene passare all'evento complementare: il comitato è formato da persone dello stesso sesso. Casi totali: C(10,3) = 120. Tre uomini: C(6,3) = 20; tre donne: C(4,3) = 4. Complementare: 24/120 = 1/5. Quindi P = 1 − 1/5 = 4/5.`,
  trap: `Fermarsi al complementare (1/5). Trattare le scelte come se fossero con reinserimento: 1 − (0,6³ + 0,4³) = 1 − 0,28 = 18/25. Escludere solo il caso «tutte donne» e dimenticare «tutti uomini»: 1 − 4/120 = 29/30.`,
  patt: 'Probabilità: almeno uno' },

q_bigl: { area: 'Q', diff: 'media', lang: 'it',
  stem: `Un cinema ha incassato 100 € vendendo soltanto biglietti da 7 € e biglietti da 12 €. Quanti biglietti da 12 € ha venduto?`,
  ok: '6', ko: ['4', '8'], last: 'Non è possibile determinarlo: servono altri dati',
  sol: `Con a biglietti da 7 € e b da 12 €: 7a + 12b = 100 con a e b interi non negativi. 100 − 12b deve essere multiplo di 7: b = 0 → 100; 1 → 88; 2 → 76; 3 → 64; 4 → 52; 5 → 40; 6 → 28 = 7 · 4; 7 → 16; 8 → 4. Solo b = 6 funziona (con a = 4): 4 · 7 + 6 · 12 = 28 + 72 = 100. La soluzione è unica.`,
  trap: `Cadere nell'esca «non è possibile determinarlo»: una sola equazione con due incognite sembra indeterminata, ma il vincolo «numeri interi non negativi» lascia una sola coppia. 4 è il numero dei biglietti da 7 €, non da 12 €; 8 è 100 ÷ 12 arrotondato per difetto e non soddisfa l'equazione.`,
  patt: 'Sistemi con vincolo di interi' },

q_ric: { area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Un negozio acquista ogni paio di jeans a 100 € e fissa il prezzo di listino con un ricarico del 40% sul costo. Ne vende 60 paia a prezzo di listino e altri 40 con uno sconto del 25% sul listino. Il guadagno complessivo, in percentuale del costo totale, è:`,
  ok: '26%', ko: ['circa 20,6%', '15%', '22,5%'],
  sol: `Listino: 100 · 1,40 = 140 €. Prezzo scontato: 140 · 0,75 = 105 €. Guadagno: 60 paia · 40 € + 40 paia · 5 € = 2.400 + 200 = 2.600 €. Costo totale: 100 paia · 100 € = 10.000 €. Guadagno sul costo: 2.600 ÷ 10.000 = 26%.`,
  trap: `Dividere per il ricavo (12.600 €) invece che per il costo: 2.600 ÷ 12.600 ≈ 20,6%. Sottrarre le percentuali (40% − 25% = 15%) come se sconto e ricarico avessero la stessa base. Fare la media semplice di 40% e 5% (22,5%) ignorando che i paia sono 60 e 40.`,
  patt: 'Media ponderata vs semplice' },

q_eta: { area: 'Q', diff: 'media', lang: 'it',
  stem: `Tra 6 anni l'età di un padre sarà il triplo di quella del figlio; 4 anni fa era il quintuplo. Quanti anni ha oggi il figlio?`,
  ok: '14 anni', ko: ['20 anni', '10 anni', '54 anni'],
  sol: `Siano p e f le età di oggi. Tra 6 anni: p + 6 = 3(f + 6), cioè p = 3f + 12. Quattro anni fa: p − 4 = 5(f − 4), cioè p = 5f − 16. Uguagliando: 3f + 12 = 5f − 16, 2f = 28, f = 14 (e p = 54). Controllo: tra 6 anni 60 e 20 (triplo); 4 anni fa 50 e 10 (quintuplo).`,
  trap: `Passaggi intermedi presi per risposta: 20 è l'età del figlio tra 6 anni, 10 quella di 4 anni fa, 54 l'età del padre oggi. Le due condizioni spostano entrambe le età dello stesso numero di anni, ma il rapporto cambia.`,
  patt: 'Equazioni a parole' },

q_sq: { area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Sei amici, tra cui Ada e Bea, devono essere divisi in due squadre da tre. Le due squadre sono indistinguibili: due divisioni sono la stessa se formano gli stessi due gruppi di persone. In quanti modi diversi si possono formare le squadre se Ada e Bea devono stare in squadre diverse?`,
  ok: '6', ko: ['12', '4', '10'],
  sol: `Le squadre non sono distinguibili: le divisioni in due squadre da 3 sono C(6,3) ÷ 2 = 20 ÷ 2 = 10. Quelle con Ada e Bea nella stessa squadra: la terza componente si sceglie tra gli altri 4, quindi 4 modi. Con Ada e Bea in squadre diverse: 10 − 4 = 6. (Controllo diretto: la squadra di Ada ha altre 2 persone, scelte tra le 4 che non sono Bea: C(4,2) = 6.)`,
  trap: `Contare le squadre come distinguibili (6 · 2 = 12) dimentica il ÷2; 4 è il caso opposto (Ada e Bea insieme); 10 ignora il vincolo.`,
  patt: 'Gruppi non etichettati' },

q_resti: { area: 'Q', diff: 'media', lang: 'it',
  stem: `Un intero positivo n minore di 100 dà resto 2 se diviso per 6 e resto 3 se diviso per 7. Quanto vale n?`,
  opts: ['38', '80', '44', 'Il problema non ha una sola soluzione'], ans: 3,
  sol: `I numeri minori di 100 che divisi per 7 danno resto 3 sono 3, 10, 17, 24, 31, 38, 45, 52, 59, 66, 73, 80, 87, 94. Tra questi, quelli che divisi per 6 danno resto 2 sono 38 (38 = 6 · 6 + 2) e 80 (80 = 6 · 13 + 2). Le soluzioni sono due (le condizioni si ripetono ogni 42): il problema non ha una sola soluzione.`,
  trap: `Fermarsi alla prima soluzione trovata (38) o all'ultima (80): sono entrambe valide, quindi nessuna delle due è «la» risposta. 44 soddisfa solo il resto 2 con il 6 (44 = 6 · 7 + 2), ma diviso per 7 dà resto 2. Qui «non ha una sola soluzione» è la risposta giusta, non un'esca.`,
  patt: 'Resti e congruenze' },

q_fav: { area: 'Q', diff: 'media', lang: 'it',
  stem: `In un sondaggio il 40% degli intervistati ha più di 40 anni. Tra gli intervistati con più di 40 anni il 50% è favorevole a una proposta; tra gli altri è favorevole il 20%. Tra tutti i favorevoli, quale percentuale ha più di 40 anni?`,
  ok: '62,5%', ko: ['50%', '40%', '20%'],
  sol: `Su 100 intervistati: 40 hanno più di 40 anni e 60 meno. Favorevoli tra i primi: 50% di 40 = 20; tra gli altri: 20% di 60 = 12. Favorevoli in tutto: 32, di cui 20 con più di 40 anni: 20 ÷ 32 = 62,5%.`,
  trap: `Scambiare la domanda con la sua inversa: «tra gli over 40 il 50% è favorevole» (50%) non è «tra i favorevoli il x% è over 40». 40% è la quota di over 40 sul totale degli intervistati; 20% è il numero di favorevoli over 40 su 100 intervistati (base sbagliata: serve il totale dei favorevoli, 32).`,
  patt: 'Percentuali condizionate' },

q_nd: { area: 'Q', diff: 'media', lang: 'it',
  stem: `Nel 2025 i ricavi di un'azienda sono cresciuti del 10% rispetto al 2024 e i costi del 5%. Di quanto è variato l'utile (ricavi meno costi)?`,
  opts: ['+7,5%', '+5%', '+10%', 'Non è possibile determinarlo con i dati forniti'], ans: 3,
  sol: `L'utile è ricavi − costi. Se ricavi e costi crescessero della stessa percentuale, anche l'utile crescerebbe di quella percentuale; qui crescono di percentuali diverse e il risultato dipende dal rapporto tra costi e ricavi di partenza. Esempio: ricavi 100 e costi 80 (utile 20) → 110 e 84 (utile 26): +30%. Con ricavi 100 e costi 50 (utile 50) → 110 e 52,5 (utile 57,5): +15%. Il valore cambia: non è determinabile.`,
  trap: `Fare la media (+7,5%) o scegliere +5% o +10% come se l'utile seguisse una delle due variazioni. L'utile è una differenza di quantità, non una differenza di percentuali. Qui «non è possibile determinarlo» è la risposta giusta.`,
  patt: 'Sufficienza dei dati' },

q_tit: { area: 'Q', diff: 'facile', lang: 'it',
  stem: `Un titolo perde il 20% a gennaio e un ulteriore 25% a febbraio. Di quanto deve salire a marzo, rispetto al valore di fine febbraio, per tornare al valore di inizio gennaio?`,
  ok: 'circa +67%', ko: ['+40%', '+45%', 'circa +82%'],
  sol: `Il valore diventa 0,80 · 0,75 = 0,60 di quello iniziale. Per tornare a 1 serve moltiplicare per 1 ÷ 0,60 = 5/3 ≈ 1,67: circa +67%. (Con valore iniziale 100: 80, poi 60; da 60 a 100 servono +40, cioè 40 ÷ 60 ≈ 67%.)`,
  trap: `+40% è la perdita complessiva in punti, ma la base è diversa: oggi il valore è 60, non 100. +45% somma le due perdite (20% + 25%) e +82% calcola 1 ÷ 0,55 con quella somma. Una perdita del 40% richiede un recupero maggiore del 40%.`,
  patt: 'Base della percentuale' },

/* ======================= VERBALE (16) ======================= */

vfn_obb: { area: 'V', diff: 'media', lang: 'it',
  claim: `Un investitore che ha sottoscritto all'emissione un titolo del valore nominale di 1.000 euro ha pagato più di 1.000 euro.`,
  passage: `Nel 2024 la società Cantieri Liguri ha emesso un'obbligazione da 200 milioni di euro, con durata di dieci anni e cedola annua del 4% sul valore nominale, pagata ogni anno il 30 giugno. Il prezzo di emissione è stato pari al 98% del valore nominale, mentre il rimborso alla scadenza avverrà al 100%, a meno che la società non eserciti la facoltà di rimborso anticipato, consentita soltanto a partire dal quinto anno. Secondo l'agenzia di rating, chi sottoscrive il titolo e lo tiene fino a scadenza ottiene un rendimento effettivo superiore alla cedola, proprio perché il titolo è stato emesso sotto la pari. Il prospetto precisa che, negli anni in cui la società non realizza utili, la cedola non viene pagata; la cedola omessa non va però perduta: si accumula e viene versata negli anni successivi, non appena i bilanci lo consentono.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «Il prezzo di emissione è stato pari al 98% del valore nominale». Per un titolo da 1.000 € si pagano quindi 0,98 · 1.000 = 980 €, cioè meno di 1.000 €. L'affermazione è contraddetta (il brano dice anche che il titolo è «emesso sotto la pari»).`,
  trap: `Rispondere «non ricavabile» perché il brano non scrive mai 980 €: si ricava con una percentuale. Oppure «vera», confondendo il prezzo pagato (98%) con il rimborso a scadenza (100%) o con la cedola. «Sotto la pari» significa «a meno del valore nominale».`,
  patt: 'Falso vs Non deducibile' },

vfn_brev: { area: 'V', diff: 'difficile', lang: 'it',
  claim: `Un brevetto non farmaceutico, depositato nel 2020 e concesso nel 2023, garantisce l'esclusiva fino al 2043, se le tasse annuali vengono pagate.`,
  passage: `Il brevetto per invenzione industriale conferisce al titolare il diritto esclusivo di sfruttare l'invenzione per venti anni, che decorrono dalla data di deposito della domanda e non da quella della concessione, la quale arriva spesso dopo tre o quattro anni. Per mantenere in vita il brevetto il titolare deve versare ogni anno una tassa, che cresce con il passare del tempo; se la tassa non viene pagata, il brevetto decade e l'invenzione può essere utilizzata liberamente da chiunque. Nel settore farmaceutico le sperimentazioni cliniche durano spesso più di otto anni, per cui la protezione di cui il farmaco gode dopo l'autorizzazione alla vendita è molto più breve di venti anni. Per i soli medicinali, la legge consente di chiedere un'estensione della tutela fino a cinque anni, a condizione che la richiesta sia presentata prima della scadenza del brevetto.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «venti anni, che decorrono dalla data di deposito della domanda e non da quella della concessione». Con deposito nel 2020 l'esclusiva dura fino al 2040, non al 2043; l'estensione di cinque anni vale «per i soli medicinali», e il brevetto dell'affermazione è non farmaceutico. L'affermazione è contraddetta.`,
  trap: `Contare i venti anni dalla concessione (2023 + 20 = 2043) e rispondere «vera»: è proprio ciò che il brano esclude. Oppure «non ricavabile», perché nel brano non compaiono le date 2020 e 2023: bastano la regola e un'addizione.`,
  patt: 'Falso vs Non deducibile' },

vfn_x: { area: 'V', diff: 'difficile', lang: 'it',
  claim: `Tra le due guerre, un Paese aderente al sistema aureo poteva avere un deficit commerciale e perdere oro senza che i suoi prezzi interni scendessero.`,
  passage: `Nel sistema monetario basato sull'oro, in vigore in gran parte del mondo fino al 1914 e in forma ridotta tra le due guerre, ogni Paese si impegnava a convertire la propria moneta in oro a un prezzo fisso, e da ciò derivava un tasso di cambio praticamente fisso tra le monete. Secondo il meccanismo descritto da David Hume, un Paese che importava più di quanto esportasse perdeva oro; la quantità di moneta in circolazione diminuiva, i prezzi interni scendevano e le merci del Paese diventavano più competitive all'estero, riportando in equilibrio la bilancia commerciale. Questo riequilibrio automatico funzionava però soltanto se la banca centrale lasciava che l'uscita di oro riducesse la moneta in circolazione. Tra le due guerre le banche centrali fecero spesso l'opposto, «sterilizzando» i flussi d'oro, cioè compensando con altre operazioni le variazioni della quantità di moneta. Nel 1931 il Regno Unito abbandonò il sistema; gli Stati Uniti fecero lo stesso nel 1933.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: il riequilibrio «funzionava però soltanto se la banca centrale lasciava che l'uscita di oro riducesse la moneta in circolazione» e «Tra le due guerre le banche centrali fecero spesso l'opposto, sterilizzando i flussi d'oro». Se la banca centrale compensava l'uscita d'oro, la quantità di moneta non diminuiva e quindi i prezzi interni non scendevano per effetto del meccanismo di Hume: l'affermazione è una conseguenza logica, un caso concreto di ciò che il brano descrive.`,
  trap: `Rispondere «non ricavabile» perché il brano non dice in modo esplicito che «i prezzi non scendevano»: lo si ricava dalla condizione «soltanto se». Oppure «falsa», leggendo il meccanismo di Hume come una legge che valeva sempre. «Spesso» non è «sempre», ma l'affermazione parla di ciò che «poteva» accadere.`,
  patt: 'Falso vs Non deducibile' },

vfn_y: { area: 'V', diff: 'media', lang: 'it',
  claim: `Le imprese che hanno adottato il lavoro agile hanno effettivamente ridotto i costi per gli spazi.`,
  passage: `Un'indagine condotta su 1.200 piccole e medie imprese ha rilevato che il 62% di esse ha adottato forme di lavoro agile dopo il 2020 e che, tra queste, più di sei su dieci dichiarano di aver ridotto i costi per gli spazi (affitti, utenze, pulizie). Il rapporto precisa tuttavia che il dato sui costi si basa sulle dichiarazioni dei titolari e non su bilanci verificati. Tra le imprese che non hanno adottato il lavoro agile, il motivo più citato (41% delle risposte) è la natura delle mansioni, che richiedono la presenza fisica; seguono la mancanza di strumenti informatici adeguati (22%) e la preferenza della direzione per il lavoro in sede (18%). Gli autori osservano che le imprese di maggiori dimensioni tendono ad adottare il lavoro agile più spesso delle piccole.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «più di sei su dieci dichiarano di aver ridotto i costi per gli spazi» e «il dato sui costi si basa sulle dichiarazioni dei titolari e non su bilanci verificati». Il brano riporta ciò che le imprese dicono, non che i costi siano davvero diminuiti: l'affermazione non è né confermata né smentita.`,
  trap: `Accettare l'affermazione perché sembra «quasi detta»: «dichiarano di aver ridotto» non equivale a «hanno effettivamente ridotto», e il rapporto avverte proprio di questa differenza. Non è nemmeno falsa: il brano non esclude che i costi siano calati.`,
  patt: 'Falso vs Non deducibile' },

vfn_z: { area: 'V', diff: 'difficile', lang: 'it',
  claim: `Un iscritto da sei anni può ottenere un'anticipazione, entro il 75% del capitale, per spese sanitarie straordinarie.`,
  passage: `Il regolamento di un fondo pensione prevede che l'iscritto possa chiedere un'anticipazione del capitale accumulato dopo otto anni di iscrizione, ma non necessariamente nella misura che desidera: l'anticipazione non può superare il 30% del capitale per qualsiasi esigenza, a meno che serva per spese sanitarie straordinarie, nel qual caso il limite sale al 75%. Prima che siano trascorsi gli otto anni la richiesta è respinta, salvo che sia motivata da spese sanitarie straordinarie, che possono essere anticipate in qualsiasi momento. Le somme anticipate sono soggette a una tassazione del 23%, che si riduce al 15% soltanto per le spese sanitarie straordinarie. Il fondo può chiedere all'iscritto documenti che provino la spesa, ma non può rifiutare l'anticipazione se la documentazione è completa e il limite è rispettato.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «Prima che siano trascorsi gli otto anni la richiesta è respinta, salvo che sia motivata da spese sanitarie straordinarie, che possono essere anticipate in qualsiasi momento» e, per le spese sanitarie straordinarie, «il limite sale al 75%». Dopo sei anni la regola generale non vale, ma l'eccezione sì; il fondo «non può rifiutare» se documentazione e limite sono a posto. L'affermazione («può ottenere», entro il 75%) è una conseguenza del brano.`,
  trap: `Fermarsi alla regola generale («dopo otto anni») e concludere che sei anni non bastano: il brano ammette l'eccezione con «salvo che». Oppure rispondere «non ricavabile» perché non è detto che il fondo accetti: ma «non può rifiutare» se la documentazione è completa. «Non necessariamente nella misura che desidera» riguarda l'importo, non il diritto.`,
  patt: 'Falso vs Non deducibile' },

v_nonc: { area: 'V', diff: 'media', lang: 'it',
  passage: `La peste nera del 1347–1351 ridusse la popolazione europea di circa un terzo. Poiché la terra rimase la stessa mentre i lavoratori diminuivano, nei decenni successivi i salari reali dei lavoratori agricoli aumentarono in molte regioni dell'Europa occidentale, e nel 1351 il Parlamento inglese emanò lo Statuto dei lavoratori, che vietava di pagare salari superiori a quelli in vigore nel 1346. La norma si rivelò in gran parte inefficace: i proprietari, che avevano bisogno di manodopera, spesso la violavano offrendo compensi più alti. Nell'Europa orientale accadde il contrario: i signori, per assicurarsi i lavoratori, rafforzarono i vincoli di servitù, e la condizione dei contadini peggiorò. Gli storici osservano che il diverso esito dipese non tanto dalla peste, che colpì tutte le regioni, quanto dalla capacità dei contadini di negoziare, e quindi dalla forza delle città e dei mercati.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ok: `Nell'Europa orientale i signori rafforzarono i vincoli di servitù perché la peste aveva colpito quella regione meno di quella occidentale.`,
  ko: [`Nell'Europa occidentale, dopo la peste, la scarsità di manodopera contribuì a far salire i salari reali dei lavoratori agricoli.`,
       `Lo Statuto dei lavoratori del 1351 vietava di pagare salari superiori a quelli in vigore nel 1346.`,
       `Secondo gli storici, la diversa evoluzione tra Europa occidentale e orientale dipese soprattutto dalla capacità di negoziare dei contadini.`],
  sol: `Frase chiave: «il diverso esito dipese non tanto dalla peste, che colpì tutte le regioni, quanto dalla capacità dei contadini di negoziare». Secondo il brano la peste colpì tutte le regioni, e la causa dei vincoli di servitù fu la ricerca di manodopera, non una minore mortalità: l'opzione sulla servitù «perché la peste aveva colpito quella regione meno» inventa una causa ed è la sola scorretta. Le altre tre ripetono il brano: salari in crescita all'Ovest, Statuto del 1351 con il limite dei salari del 1346, ruolo della forza negoziale dei contadini.`,
  trap: `Nelle domande «NON è corretta» si cerca l'unica frase sbagliata, non quella giusta. L'opzione sbagliata qui è costruita con una causa inventata: la prima parte (servitù rafforzata all'Est) è nel brano, la seconda («perché la peste aveva colpito meno») no. Tra le corrette, lo Statuto è «inefficace» ma il suo contenuto è proprio quello scritto nell'opzione.`,
  patt: 'Causa inventata' },

v_term: { area: 'V', diff: 'media', lang: 'it',
  passage: `Nel mercato obbligazionario la liquidità di un titolo non dipende dal suo rendimento, ma dalla facilità con cui può essere venduto in tempi brevi senza dover accettare un prezzo molto inferiore a quello di mercato. I titoli di Stato dei Paesi più grandi sono molto liquidi: ogni giorno se ne scambiano miliardi, e chi vuole vendere trova subito un compratore. Le obbligazioni emesse da piccole società, invece, possono essere poco liquide: se un investitore deve vendere in fretta, per attirare un compratore può dover ridurre il prezzo anche del 5–10%. Per questo i fondi comuni che promettono di poter riscattare le quote in qualsiasi giorno hanno bisogno di tenere una parte del patrimonio in titoli molto liquidi; in caso contrario, di fronte a un'ondata di richieste di rimborso, sarebbero costretti a svendere i titoli meno liquidi, danneggiando anche chi non ha chiesto di uscire.`,
  stem: `Nel brano, il termine «liquidità» riferito a un titolo indica:`,
  ok: `la facilità di vendere il titolo rapidamente senza dover accettare uno sconto rilevante sul prezzo di mercato.`,
  ko: [`la quantità di denaro contante che la società emittente tiene in cassa.`,
       `il rendimento che il titolo garantisce se viene tenuto fino alla scadenza.`,
       `la sicurezza che l'emittente rimborserà il titolo alla scadenza.`],
  sol: `Frase chiave: la liquidità «non dipende dal suo rendimento, ma dalla facilità con cui può essere venduto in tempi brevi senza dover accettare un prezzo molto inferiore a quello di mercato». Dunque non è né il contante in cassa all'emittente, né il rendimento, né la sicurezza del rimborso (quest'ultima riguarda il rischio di credito, di cui il brano non parla).`,
  trap: `Il significato quotidiano di «liquidità» (denaro disponibile in cassa) attira verso la prima opzione. «Rendimento» è escluso dal brano stesso («non dipende dal suo rendimento»). La sicurezza del rimborso è un'altra proprietà dei titoli, plausibile ma non nel testo.`,
  patt: 'Termine economico frainteso' },

v_ass: { area: 'V', diff: 'difficile', lang: 'it',
  passage: `Una catena di farmacie di quartiere vuole ridurre i costi di magazzino. Oggi ordina i farmaci ai fornitori una volta alla settimana e tiene in magazzino, in media, scorte pari a due settimane di vendite. La direzione propone di passare a ordini quotidiani: le scorte medie scenderebbero a circa tre giorni di vendite e il valore dei farmaci fermi in magazzino diminuirebbe di oltre il 70%. Una simulazione sui dati del 2025 ha mostrato che, con scorte di tre giorni, le farmacie avrebbero sempre avuto a disposizione i farmaci richiesti dai clienti; inoltre i fornitori hanno confermato che i prezzi unitari non cambierebbero. Le consegne settimanali sono oggi a carico di un corriere pagato a viaggio, mentre le consegne quotidiane richiederebbero un viaggio al giorno per ciascuna farmacia. La direzione conclude che il passaggio agli ordini quotidiani ridurrà i costi complessivi della catena.`,
  stem: `Su quale assunzione si basa principalmente il ragionamento della direzione?`,
  ok: `I viaggi aggiuntivi del corriere costeranno meno di quanto si risparmia riducendo il valore dei farmaci in magazzino.`,
  ko: [`Il magazzino rappresenta la voce di costo più grande tra i costi complessivi della catena.`,
       `Il numero dei clienti delle farmacie aumenterà nel corso del 2026.`,
       `Le farmacie continueranno a vendere gli stessi farmaci ai prezzi attuali.`],
  sol: `Il ragionamento è: scorte più basse → meno costi di magazzino → minori costi complessivi. Il brano ha già escluso i problemi di mancanza di prodotto e di prezzi dei fornitori; resta però un costo che aumenta: «un viaggio al giorno per ciascuna farmacia», pagato a viaggio. La conclusione sui «costi complessivi» regge solo se questo costo in più è inferiore al risparmio sulle scorte: è l'assunzione implicita.`,
  trap: `Scegliere un'assunzione che «sembra economica» ma non serve: il magazzino non deve essere la voce maggiore (basta che il risparmio superi l'aumento dei viaggi), i clienti futuri e i prezzi di vendita non toccano il confronto tra risparmio e costo dei viaggi. L'assunzione si trova guardando cosa aumenta nel piano e non è stato compensato nel testo.`,
  patt: 'Assunzione implicita' },

v_debt: { area: 'V', diff: 'difficile', lang: 'it',
  passage: `Secondo i dati ufficiali, il debito pubblico del Paese Zeta era pari al 135% del prodotto interno lordo (PIL) nel 2020 e al 120% nel 2025. Nello stesso periodo il PIL nominale, cioè misurato ai prezzi correnti, è cresciuto del 30%, soprattutto per effetto dell'inflazione, mentre la crescita reale, al netto dei prezzi, è stata contenuta. Il governo ha attribuito il miglioramento del rapporto debito/PIL a una politica di bilancio prudente; alcuni economisti osservano invece che, quando i prezzi crescono più rapidamente dei tassi pagati sul debito, il valore reale del debito si riduce da sé, indipendentemente dalle scelte del governo. Il ministro ha comunque dichiarato che nei prossimi anni il rapporto continuerà a scendere, purché la crescita nominale resti superiore alla crescita del debito.`,
  stem: `In base al brano, quale delle seguenti affermazioni è corretta?`,
  ok: `Tra il 2020 e il 2025 il debito pubblico di Zeta, in valore assoluto, è aumentato di circa il 16%.`,
  ko: [`Tra il 2020 e il 2025 il debito pubblico di Zeta, in valore assoluto, è diminuito, poiché il suo rapporto con il PIL è sceso.`,
       `Tra il 2020 e il 2025 il PIL reale di Zeta è cresciuto del 30%.`,
       `Secondo il ministro, il rapporto debito/PIL scenderà ancora nei prossimi anni in ogni caso.`],
  sol: `Frasi chiave: «135% del PIL nel 2020 e 120% nel 2025» e «il PIL nominale … è cresciuto del 30%». Con PIL 2020 = 100: debito 2020 = 135; PIL 2025 = 130 e debito 2025 = 120% di 130 = 156. Il debito è passato da 135 a 156: 156 ÷ 135 ≈ 1,156, circa +16%. Le altre: il rapporto scende anche se il debito sale (il PIL sale di più); il +30% riguarda il PIL nominale, non quello reale; il ministro dice «purché la crescita nominale resti superiore…», non «in ogni caso».`,
  trap: `Confondere il rapporto con il valore assoluto: il debito/PIL può scendere mentre il debito cresce (la prima opzione è la più attraente). Scambiare nominale e reale. Trasformare una condizione («purché») in una certezza («in ogni caso»).`,
  patt: 'Rapporti vs valori assoluti' },

v_comp5: { area: 'V', diff: 'difficile', lang: 'it',
  passage: `Nel primo semestre del 2025 il tasso di disoccupazione dei giovani tra 15 e 24 anni nel Paese Y è sceso al 15%, dal 20% dello stesso periodo del 2024. Nello stesso tempo, però, il tasso di occupazione giovanile, cioè la quota dei giovani che lavorano sul totale dei giovani, è sceso dal 20% al 17%. L'apparente contraddizione si spiega con il modo in cui si calcola il tasso di disoccupazione: il denominatore è rappresentato dalle forze di lavoro, cioè da chi lavora o cerca attivamente un lavoro, e non dall'intera popolazione giovanile. Molti giovani hanno smesso di cercare lavoro, per proseguire gli studi o perché scoraggiati, e sono perciò usciti dalle forze di lavoro. Secondo l'istituto di statistica, questo fenomeno spiega buona parte del calo della disoccupazione, ma non è possibile stabilire quanti dei giovani usciti dalle forze di lavoro lo abbiano fatto per studiare e quanti perché scoraggiati.`,
  stem: `In base al brano, quale delle seguenti affermazioni è corretta?`,
  ok: `Nel primo semestre del 2025 la quota dei giovani fuori dalle forze di lavoro è maggiore di quella del primo semestre del 2024.`,
  ko: [`Il calo del tasso di disoccupazione dimostra che nel 2025 più giovani hanno trovato un lavoro.`,
       `Secondo l'istituto di statistica, i giovani usciti dalle forze di lavoro lo hanno fatto soprattutto per proseguire gli studi.`,
       `Il tasso di disoccupazione si calcola dividendo i giovani senza lavoro per la popolazione giovanile.`],
  sol: `Frasi chiave: «il tasso di occupazione giovanile … è sceso dal 20% al 17%» e il tasso di disoccupazione è «sceso al 15%, dal 20%». Su 100 giovani: 2024, 20 occupati e disoccupazione 20% → forze di lavoro 20 ÷ 0,80 = 25, fuori dalle forze di lavoro 75; 2025, 17 occupati e disoccupazione 15% → forze di lavoro 17 ÷ 0,85 = 20, fuori 80. La quota di chi è fuori dalle forze di lavoro è salita da 75% a 80%.`,
  trap: `Leggere il calo della disoccupazione come più occupati (il brano dice il contrario: l'occupazione è scesa). Attribuire all'istituto una causa che «non è possibile stabilire». Sbagliare il denominatore del tasso (la popolazione invece delle forze di lavoro), che è proprio il punto del brano.`,
  patt: 'Rapporti vs valori assoluti' },

v_nec: { area: 'V', diff: 'difficile', lang: 'en',
  passage: `A consulting firm has analysed the careers of its 200 managers. Among those who were promoted to partner within eight years of joining, 85% had completed an international assignment of at least one year. Assignments abroad are offered to about half of the managers, usually those with the best performance reviews, and the number of partner positions available each year is limited. The head of human resources concludes: «Completing an international assignment is enough to be promoted to partner within eight years. We should therefore send every manager abroad for at least a year, and we will promote more partners.» The firm's board notes that an assignment abroad costs about three times a manager's standard annual salary package. The firm's records cover the last ten years, and each manager's performance is reviewed every year by a panel of senior partners.`,
  stem: `Which of the following, if true, most weakens the conclusion of the head of human resources?`,
  ok: `In the last ten years, most of the managers who completed an international assignment were not promoted to partner within eight years.`,
  ko: [`Some of the managers who were promoted to partner within eight years had not completed any international assignment.`,
       `Managers who completed an international assignment say they are more satisfied with their jobs than those who did not.`,
       `The firm plans to offer many more international assignments over the next five years.`],
  sol: `The head of HR treats the assignment as a sufficient condition («is enough to be promoted»). The first option shows that, in practice, most of those who completed an assignment were not promoted: the assignment is not enough, and sending everyone abroad would not produce more partners. The option about managers promoted without an assignment only says that the assignment is not necessary (and the passage already tells us that 15% of the promoted had not completed one).`,
  trap: `Choosing the «necessary» option: it sounds like a refutation but it does not touch the head of HR's claim, which is about sufficiency. Job satisfaction and the firm's future plans are irrelevant to the link between assignment and promotion.`,
  patt: 'Necessario vs sufficiente' },

v_alt: { area: 'V', diff: 'media', lang: 'it',
  passage: `Nel gennaio 2025 il comune di Rivafonda ha introdotto la tariffa puntuale sui rifiuti: ogni famiglia paga in base al numero di volte in cui espone il contenitore dei rifiuti indifferenziati, invece di una quota fissa uguale per tutti. Nel corso dell'anno la quantità di rifiuti indifferenziati raccolti è passata da 400 a 300 chilogrammi per abitante, con un calo del 25%. Il sindaco afferma che il risultato dimostra l'efficacia della tariffa puntuale e propone di estenderla alle attività commerciali. Il comune precisa che i dati si riferiscono ai rifiuti raccolti dalla società municipale e che la tariffa è stata annunciata pubblicamente a dicembre 2024. Nel 2024 la quantità di rifiuti indifferenziati per abitante era già scesa del 3%. I residenti sono circa 18.000 e le famiglie 7.500; a inizio anno il comune ha consegnato a ciascuna famiglia un nuovo contenitore dotato di chip per contare gli svuotamenti.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del sindaco?`,
  ok: `Nel marzo 2025 il comune ha attivato la raccolta separata dell'organico, che prima finiva nel contenitore dell'indifferenziato.`,
  ko: [`Nel 2025 la tariffa puntuale ha fatto aumentare di circa l'8% la spesa media annua delle famiglie per i rifiuti.`,
       `Nei comuni confinanti, dove non è stata introdotta la tariffa puntuale, la quantità di rifiuti indifferenziati per abitante è rimasta invariata nel 2025.`,
       `La maggioranza dei cittadini conosceva già la nuova tariffa prima della sua entrata in vigore.`],
  sol: `La conclusione è che la tariffa puntuale ha causato il calo del 25%. Se nello stesso anno una parte dei rifiuti prima conferita nell'indifferenziato (l'organico) è stata raccolta a parte, il calo ha una causa alternativa che spiega almeno in parte i 100 chilogrammi in meno anche senza la tariffa. I comuni confinanti invariati rafforzano; il costo per le famiglie e la conoscenza della tariffa sono irrilevanti per il nesso.`,
  trap: `Scegliere il dato più «tecnico» sul comportamento dei cittadini o sul costo: nessuno offre un'altra spiegazione del calo. L'opzione sui comuni confinanti è l'esca: sembra un confronto che «contesta» il sindaco, ma mostra che altrove non c'è calo, quindi rafforza il nesso causale.`,
  patt: 'Cause alternative' },

v_sel: { area: 'V', diff: 'difficile', lang: 'it',
  passage: `Una banca ha lanciato un'applicazione che permette di accantonare automaticamente piccole somme a ogni pagamento con carta, arrotondando l'importo all'euro successivo e versando la differenza su un conto risparmio. Dopo due anni, la banca ha confrontato i 40.000 clienti che hanno attivato la funzione con gli altri 160.000: i primi hanno, in media, 9.000 euro di risparmi, i secondi 4.500. L'attivazione è volontaria e avviene da una sezione dell'applicazione chiamata «Obiettivi di risparmio». La banca conclude che l'accantonamento automatico raddoppia i risparmi dei clienti e decide di attivarlo d'ufficio su tutti i nuovi conti. Il direttore commerciale ricorda che nell'ultimo anno l'applicazione è stata scaricata da oltre il 90% dei clienti. La banca ricorda inoltre che il servizio è gratuito e che i risparmi considerati comprendono soltanto i conti intestati alla singola persona.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione della banca?`,
  ok: `Prima del lancio, i clienti che hanno poi attivato la funzione avevano già, in media, risparmi pari al doppio di quelli degli altri clienti.`,
  ko: [`I clienti che hanno attivato la funzione usano l'applicazione più spesso degli altri.`,
       `Il 15% dei clienti che avevano attivato la funzione l'ha poi disattivata entro il primo anno.`,
       `La funzione di accantonamento è disponibile anche in altre applicazioni bancarie.`],
  sol: `La banca confronta due gruppi e attribuisce la differenza (9.000 contro 4.500) alla funzione. Poiché l'attivazione è volontaria, chi attiva può già essere un cliente più propenso al risparmio (selezione): se i due gruppi erano già così diversi prima del lancio, la differenza non può essere un effetto della funzione. È la causa alternativa più diretta.`,
  trap: `Scegliere i dati sull'uso dell'applicazione o sulle disattivazioni: sono plausibili ma indiretti, e non stabiliscono che i due gruppi fossero già diversi. Il dato sulle altre applicazioni è irrilevante. «Volontaria» nel brano è la parola che segnala il problema: chi sceglie di attivare non è un campione casuale.`,
  patt: 'Cause alternative' },

v_obv: { area: 'V', diff: 'difficile', lang: 'it',
  passage: `Un Paese ha introdotto una tassa sulle bevande zuccherate. Nei dodici mesi successivi, secondo l'istituto di statistica, il consumo di zuccheri aggiunti per abitante è diminuito del 12%. Il ministro della Salute afferma che la tassa ha ridotto il consumo di zucchero e propone di estenderla ai dolci confezionati. Lo studio precisa che il consumo è stato stimato in base agli acquisti registrati dai supermercati e dalle catene della grande distribuzione, e che nello stesso periodo il prezzo delle bevande zuccherate è aumentato in media del 20% a causa della tassa. Il ministro osserva che altri Paesi con tasse simili hanno ottenuto riduzioni analoghe. Il consumo è misurato in grammi di zucchero aggiunto contenuti nei prodotti acquistati, e i dati del periodo precedente alla tassa sono stati raccolti con lo stesso metodo.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del ministro?`,
  ok: `Nello stesso anno una quota crescente degli acquisti alimentari è passata dai supermercati ai negozi online e ai distributori automatici, che non sono inclusi nelle rilevazioni utilizzate.`,
  ko: [`Dopo l'introduzione della tassa molti produttori hanno ridotto la quantità di zucchero contenuta nelle loro bevande.`,
       `Il prezzo delle bevande zuccherate è aumentato, in media, del 20% dopo l'introduzione della tassa.`,
       `Il ministro della Salute ha proposto di estendere la tassa ai dolci confezionati.`],
  sol: `La conclusione è che la tassa ha ridotto il consumo di zucchero; la prova è un calo del 12% stimato «in base agli acquisti registrati dai supermercati e dalle catene della grande distribuzione». Se una parte crescente degli acquisti è passata a canali non rilevati, il calo misurato può essere un effetto della misura, non del consumo: la prova non regge. L'opzione sui produttori che riducono lo zucchero rafforza la conclusione.`,
  trap: `La prima opzione sembra un «effetto indesiderato» della tassa (i produttori cambiano le ricette, la tassa viene «elusa»), ma rafforza: meno zucchero nelle bevande significa meno zucchero consumato. Le altre due ripetono il brano o sono irrilevanti. L'obiezione giusta riguarda la misura del consumo, non il nesso causale.`,
  patt: 'Misura e definizione' },

v_reg: { area: 'V', diff: 'difficile', lang: 'it',
  passage: `Dal regolamento delle riduzioni sulle tasse universitarie. Lo studente ha diritto alla riduzione del 50% delle tasse se ha un ISEE inferiore a 25.000 euro e ha acquisito almeno 40 crediti entro il 30 settembre, purché presenti la domanda entro il 15 ottobre. La riduzione è invece del 100% se l'ISEE è inferiore a 15.000 euro e i crediti acquisiti entro il 30 settembre sono almeno 50. Gli studenti fuori corso non hanno diritto ad alcuna riduzione, a meno che siano fuori corso da un solo anno: in tal caso si applicano le stesse regole degli studenti in corso, ma la riduzione non può mai superare il 50%. Le domande presentate tra il 16 e il 31 ottobre possono essere accolte dall'università, che però non è obbligata a farlo; dopo il 31 ottobre non sono ammesse domande. I crediti acquisiti dopo il 30 settembre non sono computati.`,
  stem: `Sara è fuori corso da un solo anno, ha un ISEE di 14.000 euro e il 28 settembre aveva acquisito 52 crediti; ne acquisisce altri 8 il 10 ottobre e presenta domanda il 20 ottobre. Quale delle seguenti affermazioni è corretta?`,
  ok: `Sara non ha diritto alla riduzione, perché la domanda è tardiva; l'università può accoglierla ma non è obbligata, e in quel caso la riduzione non supererebbe il 50%.`,
  ko: [`Sara ha diritto a una riduzione del 100%, perché ha più di 50 crediti e un ISEE inferiore a 15.000 euro.`,
       `Sara ha diritto a una riduzione del 50%, perché è fuori corso da un solo anno.`,
       `Sara non ha diritto ad alcuna riduzione e l'università non può in nessun caso accogliere la sua domanda, perché è fuori corso.`],
  sol: `Sara è fuori corso da un solo anno: si applicano le regole degli studenti in corso, con riduzione «non oltre il 50%». I 52 crediti entro il 28 settembre bastano; gli 8 acquisiti il 10 ottobre «non sono computati» e comunque non servono. La domanda del 20 ottobre cade tra il 16 e il 31 ottobre: «possono essere accolte dall'università, che però non è obbligata a farlo». Quindi nessun diritto alla riduzione; se la domanda fosse accolta, la riduzione non supererebbe il 50%.`,
  trap: `Esche sui modali e sulle eccezioni: «ha diritto» invece di «può essere accolta»; il 100% dimenticando il tetto per chi è fuori corso; «non può in nessun caso» al posto di «possono essere accolte». Il termine del 15 ottobre vale per il diritto, quello del 31 per l'eventuale accoglimento discrezionale.`,
  patt: 'Applicazione di una regola' },

v_fatt: { area: 'V', diff: 'media', lang: 'it',
  passage: `L'assessore alla cultura della città di Montalbo dichiara: «Grazie al bonus libri di 100 euro per i diciottenni, introdotto un anno fa, i giovani della nostra città leggono più di prima». Nell'anno trascorso 4.000 diciottenni hanno speso il bonus, per un totale di 400.000 euro, quasi interamente nelle quattro librerie indipendenti del centro. Le vendite complessive di libri in città, comprese le catene, le librerie online con sede in città e i supermercati, sono passate da 20 a 21,2 milioni di euro. L'assessore sottolinea inoltre che due delle librerie del centro hanno registrato un aumento delle vendite superiore al 15% e che il bonus è stato utilizzato dal 70% dei diciottenni residenti. Il comune ha affidato la gestione del bonus a una piattaforma online, sulla quale i ragazzi si registrano con lo SPID e scelgono la libreria in cui ritirare i libri.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione dell'assessore?`,
  ok: `Quanti libri acquistavano e leggevano i diciottenni della città prima dell'introduzione del bonus.`,
  ko: [`Quanto è aumentata, nello stesso anno, la spesa in libri degli adulti della città.`,
       `Quante librerie online hanno sede in città.`,
       `Il prezzo medio dei libri acquistati con il bonus.`],
  sol: `La parola chiave dell'affermazione è «leggono più di prima»: per sapere se i giovani leggono di più serve il confronto con ciò che facevano prima. Se i diciottenni acquistavano già gli stessi libri con i propri soldi, il bonus ha solo cambiato chi paga e l'affermazione è falsa; se prima ne acquistavano pochi, può essere vera. Gli altri tre dati non riguardano il confronto «prima/dopo» dei diciottenni.`,
  trap: `I numeri del brano (400.000 € di bonus, +1,2 milioni di vendite totali, +15% in due librerie) attirano verso dati di mercato, ma non dicono se i diciottenni abbiano letto di più. La spesa degli adulti e le librerie online riguardano altre persone; il prezzo medio al più cambia il numero di libri, non il confronto con il «prima».`,
  patt: 'Misura e definizione' },

/* ===================== DATA INSIGHTS (16) ===================== */

ds1: { area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Più della metà delle 120 persone intervistate in un sondaggio è favorevole a una proposta?',
    'Gli indecisi sono 10 e i contrari sono meno di 50.',
    'I favorevoli sono più dei contrari.'),
  dsg: 'A', dso: 'DCAB',
  sol: `Favorevoli = 120 − indecisi − contrari. (1): con 10 indecisi e al massimo 49 contrari, i favorevoli sono almeno 120 − 10 − 49 = 61, più di 60: la risposta è sempre «sì». Non serve il numero esatto. (2): «più dei contrari» lascia entrambe le risposte: 45 favorevoli, 40 contrari e 35 indecisi (no) oppure 70 favorevoli, 30 contrari e 20 indecisi (sì).`,
  trap: `Cercare il numero esatto di favorevoli, che non c'è, e dichiarare la (1) insufficiente. Una domanda sì/no si chiude con un limite. La (2) sembra utile perché parla di favorevoli ma non dà alcuna soglia rispetto a 60.`,
  patt: 'Sufficienza dei dati' },

ds2: { area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un rettangolo ha il perimetro di 28 cm. Qual è la sua area?',
    'La diagonale misura 10 cm.',
    'Un lato supera l\'altro di 2 cm.'),
  dsg: 'C', dso: 'ACBD',
  sol: `Dal perimetro: a + b = 14 (semiperimetro). (1): a² + b² = 10² = 100, quindi ab = [(a + b)² − (a² + b²)] ÷ 2 = (196 − 100) ÷ 2 = 48 e l'area è 48 cm². (2): a − b = 2 con a + b = 14 dà a = 8 e b = 6, area 48 cm². Ciascuna affermazione da sola basta (e dà lo stesso valore).`,
  trap: `Giudicare la (1) insufficiente perché «non dà i lati»: l'area ab si ricava da somma e somma dei quadrati, senza trovare a e b (oppure si riconosce la terna 6–8–10). La (2) è più immediata e fa credere che solo lei basti.`,
  patt: 'Sufficienza dei dati' },

ds3: { area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Una scuola ha 100 studenti. Quanti non praticano né il calcio né il basket?',
    '60 studenti giocano a calcio e 45 giocano a basket.',
    '25 studenti giocano sia a calcio sia a basket.'),
  dsg: 'B', dso: 'DBCA',
  sol: `Insieme: gli studenti che praticano almeno uno sport sono 60 + 45 − 25 = 80, quindi 100 − 80 = 20 non ne praticano nessuno. (1) da sola non basta: i 105 posti-sport devono dividersi tra 100 studenti, quindi chi fa entrambi gli sport è almeno 5 ma può essere anche 45; i «né l'uno né l'altro» sono da 0 a 40. (2) da sola non basta: non dice quanti giocano a ciascuno sport.`,
  trap: `Sommare 60 + 45 = 105 senza accorgersi che supera i 100 studenti (quindi c'è sovrapposizione) o sottrarre 105 da 100. Con la (1) sola si può stimare soltanto un minimo di 5 studenti che fanno entrambi gli sport. Serve la parte comune: è la tabella 2 × 2 a cui manca una cella.`,
  patt: 'Sufficienza dei dati' },

ds4: { area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Un gruppo di amici ha diviso in parti uguali una spesa di 120 €, e ciascuno ha pagato un numero intero di euro. Quanti erano gli amici?',
    'Erano più di 4 e meno di 10.',
    'Ciascuno ha pagato più di 12 €.'),
  dsg: 'D', dso: 'CABD',
  sol: `Il numero di amici è un divisore di 120. (1): i divisori di 120 tra 5 e 9 sono 5, 6 e 8 (120 ÷ 7 non è intero). (2): se ognuno ha pagato più di 12 €, gli amici sono meno di 10 (120 ÷ 12): possono essere 1, 2, 3, 4, 5, 6 o 8. Insieme restano 5 (24 € a testa), 6 (20 €) e 8 (15 €): tre valori compatibili, quindi servono altri dati.`,
  trap: `Pensare che due vincoli «a intervallo» chiudano sempre il problema. Qui il vincolo (2) si limita a ripetere in un altro modo un limite superiore già contenuto nella (1) («meno di 10»): non elimina nessuno dei tre casi 5, 6, 8. Controllare ogni valore possibile prima di scegliere B.`,
  patt: 'Sufficienza dei dati' },

ds5: { area: 'DI', diff: 'difficile', lang: 'en', ds: true,
  stem: ds('A car drives 100 km from A to B and then 100 km from B to C, each leg at a constant speed. Is the average speed over the whole trip greater than 60 km/h?',
    'The speed from A to B is 50 km/h.',
    'The speed from B to C is 75 km/h.'),
  dsg: 'B', dso: 'CBDA',
  sol: `Together: total distance 200 km; time = 100 ÷ 50 + 100 ÷ 75 = 2 + 4/3 = 10/3 h; average speed = 200 ÷ (10/3) = 60 km/h exactly, so it is NOT greater than 60: the answer is «no», and it is the same in all cases, so the two statements together are sufficient. Alone, each statement leaves the speed of the other leg free: with (1) alone, a very fast second leg gives an average above 60, a slow one gives less. Same for (2) alone.`,
  trap: `Averaging the two speeds: (50 + 75) ÷ 2 = 62.5 km/h, which is above 60 and would suggest «yes». For equal distances the average speed is the harmonic mean, 2 ÷ (1/50 + 1/75) = 60: exactly 60, not greater. A «no» that holds in every case is a sufficient answer.`,
  patt: 'Sufficienza dei dati' },

ds6: { area: 'DI', diff: 'facile', lang: 'it', ds: true,
  stem: ds('Siano x e y due numeri interi positivi. Il prodotto xy è pari?',
    'La somma x + y è dispari.',
    'x è un multiplo di 3.'),
  dsg: 'A', dso: 'BDAC',
  sol: `(1): una somma dispari si ottiene solo da un numero pari e uno dispari, quindi uno dei due fattori è pari e il prodotto è pari: la risposta è sempre «sì». (2): x = 3 e y = 1 danno xy = 3 (dispari); x = 6 e y = 1 danno xy = 6 (pari): non basta.`,
  trap: `Cercare di capire «quale» tra x e y sia pari: non serve, basta che almeno uno lo sia. La (2) sembra ricca di informazione (un multiplo) ma 3 è dispari e 6 pari.`,
  patt: 'Sufficienza dei dati' },

dp1: { area: 'DI', diff: 'media', lang: 'it',
  asset: dp([
    `Quattro amici — Ada, Bea, Carlo e Dino — possiedono ciascuno un animale diverso: un gatto, un cane, un pesce o un criceto.`,
    `Ada non ha né il cane né il gatto.`,
    `Carlo non ha né il cane né il criceto.`,
    `Dino non ha il gatto e Bea non ha il pesce.`
  ], [
    `A. Bea ha il cane oppure Dino ha il cane.`,
    `B. Dino ha il cane.`,
    `C. Se Ada ha il pesce, allora Carlo ha il gatto.`,
    `D. Il criceto è di Ada o di Dino.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  ok: 'Sia la A sia la C', ko: ['Solo la A', 'Sia la B sia la D', 'Sia la C sia la D'],
  sol: `Ada può avere solo il pesce o il criceto; Carlo solo il gatto o il pesce. Quindi il cane, che non è né di Ada né di Carlo, è di Bea o di Dino: A è vera. Se Ada ha il pesce, Carlo non può averlo e ha il gatto: C è vera. B non è sicura: con Ada criceto, Bea gatto, Carlo pesce e Dino cane è vera, ma con Ada criceto, Carlo gatto, Bea cane, Dino pesce è falsa. D non è sicura: con Ada pesce, Carlo gatto, Dino cane, Bea criceto il criceto è di Bea.`,
  trap: `Considerare vera una proposizione perché «può» essere vera: la consegna è «sicuramente». A e C sono sicure per tutte le assegnazioni compatibili con i dati; B e D valgono in alcune e in altre no. Non esiste una soluzione unica: restano quattro assegnazioni possibili.`,
  patt: 'Consegna: sicuramente vera' },

dp2: { area: 'DI', diff: 'difficile', lang: 'it',
  asset: dp([
    `Cinque atleti completano una gara di corsa. Ciascuno ha impiegato un numero intero di secondi e tutti i tempi sono diversi.`,
    `Il tempo medio dei cinque atleti è di 60 secondi.`,
    `Il più veloce ha impiegato 50 secondi, il più lento 70 secondi.`
  ], [
    `A. Almeno due atleti hanno impiegato meno di 60 secondi.`,
    `B. Il terzo classificato ha impiegato più di 65 secondi.`,
    `C. Nessun atleta ha impiegato esattamente 60 secondi.`,
    `D. Il quarto classificato ha impiegato 70 secondi.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  ok: 'Sia la B sia la D', ko: ['Solo la B', 'Sia la A sia la B', 'Sia la C sia la D'],
  sol: `La somma dei tempi è 5 · 60 = 300 s; tolti 50 e 70 restano 180 s per i tre tempi intermedi, tutti diversi e compresi tra 51 e 69. B: se i tre intermedi sono a < b < c con somma 180 e a ≥ 51, allora c ≥ b + 1 e 51 + b + (b + 1) ≤ 180, cioè b ≤ 64: il terzo classificato (b) ha impiegato al massimo 64 secondi, quindi «più di 65» è sicuramente falsa. D: il quarto classificato è più veloce del quinto (70 s) e tutti i tempi sono diversi, quindi ha impiegato al massimo 69 s: sicuramente falsa. A è sicuramente vera (50 s e almeno un altro tempo sotto 60); C è possibile ma non sicura: (50, 58, 60, 62, 70) ha un 60, (50, 56, 61, 63, 70) no.`,
  trap: `Con la consegna «sicuramente false» si finisce per indicare la C, che è «possibile» ma non sicura. La A è vera, non falsa. Per B e D basta un limite (somma dei tre intermedi e tempi tutti diversi): non serve trovare i tempi esatti.`,
  patt: 'Consegna: sicuramente falsa' },

dp3: { area: 'DI', diff: 'media', lang: 'it',
  asset: dp([
    `Un'associazione ha soci con tessere e anzianità di iscrizione diverse.`,
    `Tutti i soci con la tessera «oro» possono votare in assemblea.`,
    `Hanno la tessera «oro» soltanto i soci iscritti da più di cinque anni.`,
    `Nessun socio iscritto da meno di due anni può partecipare ai viaggi sociali.`,
    `Alcuni soci che partecipano ai viaggi sociali non hanno la tessera «oro».`
  ], [
    `A. Chi può votare in assemblea è iscritto da più di cinque anni.`,
    `B. Alcuni soci iscritti da più di cinque anni non hanno la tessera «oro».`,
    `C. Un socio iscritto da un anno non ha la tessera «oro» e non può partecipare ai viaggi sociali.`,
    `D. Un socio con la tessera «oro» può votare ed è iscritto da più di cinque anni.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  ok: 'Sia la C sia la D', ko: ['Solo la C', 'Sia la A sia la D', 'Sia la B sia la C'],
  sol: `C: un socio iscritto da un anno ha meno di cinque anni, quindi non ha la tessera «oro» (solo chi è iscritto da più di cinque anni la ha), e avendo meno di due anni non può partecipare ai viaggi: vera. D: chi ha la tessera «oro» può votare (dato 2) ed è iscritto da più di cinque anni (dato 3): vera. A non è sicura: «tutti gli oro votano» non significa «solo gli oro votano», quindi possono votare anche soci con meno di cinque anni. B non è sicura: i soci che viaggiano senza «oro» potrebbero avere anche solo tre anni di iscrizione.`,
  trap: `Invertire l'implicazione del dato 2: «tutti gli oro possono votare» non diventa «tutti quelli che votano sono oro» (né iscritti da più di cinque anni). Il dato 4 («alcuni… non hanno la tessera») sembra rinforzare B, ma non dice nulla sull'anzianità di quei soci.`,
  patt: 'Implicazione e inversa' },

dp4: { area: 'DI', diff: 'difficile', lang: 'it',
  asset: dp([
    `Quattro squadre — A, B, C e D — disputano un girone all'italiana: ciascuna squadra affronta una volta ciascuna delle altre.`,
    `La vittoria vale 3 punti, il pareggio 1 punto, la sconfitta 0 punti.`,
    `Al termine del girone A ha 7 punti, B ha 5 punti e D ha 1 punto.`
  ], [
    `A. B ha perso almeno una partita.`,
    `B. C ha ottenuto 4 punti.`,
    `C. A ha pareggiato con B.`,
    `D. C ha battuto D.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  ok: 'Sia la A sia la B', ko: ['Solo la B', 'Sia la A sia la D', 'Sia la C sia la D'],
  sol: `Ogni squadra gioca 3 partite. 7 punti = 3 + 3 + 1: A ha due vittorie e un pareggio. 5 punti = 3 + 1 + 1: B ha una vittoria e due pareggi, cioè nessuna sconfitta: A è sicuramente falsa. 1 punto: D ha un pareggio e due sconfitte. L'unico pareggio di A è con B: se fosse con C o con D, A avrebbe battuto B, mentre B non ha sconfitte; perciò C è vera. A ha battuto C e D, quindi C ottiene i punti solo da B e D: o 3 (batte D, perde con B) o 2 (due pareggi). Non può avere 4 punti: B è sicuramente falsa. D è possibile ma non sicura (C batte D nel primo caso, pareggia nel secondo).`,
  trap: `Fermarsi a «B ha 5 punti, quindi ha pareggiato e vinto» senza concludere che non ha perso. Con la consegna «false» scegliere la C, che è sicuramente vera, o la D, che è soltanto possibile. I punti di C si ricavano dalle partite con B e D, perché con A ha perso.`,
  patt: 'Consegna: sicuramente falsa' },

g1: { area: 'DI', diff: 'difficile', lang: 'it', asset: gVendite(),
  stem: `Di quanto è variato, in percentuale, il ricavo mensile tra gennaio e giugno?`,
  ok: '+35%', ko: ['+33%', '+8%', '+25%'],
  sol: `Ad aprile i pezzi sono 600. Risalendo: aprile = marzo · 1,5, quindi marzo = 400; marzo = febbraio · 0,8, quindi febbraio = 500; febbraio = gennaio · 1,25, quindi gennaio = 400. Poi maggio = 600 · 0,6 = 360 e giugno = 360 · 1,2 = 432. Ricavo di gennaio: 400 · 12 € = 4.800 €; ricavo di giugno: 432 · 15 € = 6.480 €. 6.480 ÷ 4.800 = 1,35: +35%. (In fattori: pezzi 432/400 = 1,08 e prezzo 15/12 = 1,25; 1,08 · 1,25 = 1,35.)`,
  trap: `Sommare le variazioni (+8% sui pezzi e +25% sul prezzo = +33%) invece di moltiplicarle. Rispondere +8% (solo i pezzi) o +25% (solo il prezzo). Le variazioni mensili vanno concatenate partendo dal dato noto (aprile) e non sommate: +25% − 20% + 50% − 40% + 20% non dà +8%.`,
  patt: 'Percentuali composte' },

g2: { area: 'DI', diff: 'media', lang: 'it', asset: gTrim(),
  stem: `Qual è il margine ordinario complessivo dei quattro trimestri, cioè la somma di ricavi meno costi al netto delle voci straordinarie?`,
  ok: '36 milioni di euro', ko: ['48 milioni di euro', '44 milioni di euro', '40 milioni di euro'],
  sol: `Margini letti dal grafico: T1 40 − 30 = 10; T2 46 − 34 = 12; T3 52 − 36 = 16; T4 48 − 38 = 10. Correzioni: nel T3 va aggiunta ai costi la spesa straordinaria di 8 (margine 16 − 8 = 8); nel T4 va tolto dai ricavi il ricavo straordinario di 4 (margine 10 − 4 = 6). Totale ordinario: 10 + 12 + 8 + 6 = 36 milioni.`,
  trap: `Leggere il grafico e basta: 10 + 12 + 16 + 10 = 48. Applicare una sola correzione (44 se si toglie solo il ricavo straordinario del T4, 40 se si aggiunge solo la spesa del T3). Le note sotto il grafico cambiano i numeri letti, in direzioni opposte sui due trimestri.`,
  patt: 'Dati extra nel grafico' },

g3: { area: 'DI', diff: 'media', lang: 'it', asset: gBilancio(),
  stem: `Di quanto varierà, in percentuale, la spesa per i trasporti dal bilancio di quest'anno a quello dell'anno prossimo?`,
  ok: '+12,5%', ko: ['+25%', '−10%', '+15%'],
  sol: `Quest'anno: Servizi = 40% di 12 = 4,8 milioni; trasporti = 2/6 di 4,8 = 1,6 milioni. L'anno prossimo: Servizi = 36% di 15 = 5,4 milioni; trasporti = 2/6 di 5,4 = 1,8 milioni. Variazione: 1,8 ÷ 1,6 = 1,125: +12,5%. (In fattori: bilancio 1,25 · quota 36/40 = 0,9 → 1,125.)`,
  trap: `Guardare solo il bilancio (+25%) o solo la quota (da 40% a 36%: −10%), oppure combinarli per somma (+25% − 10% = +15%) invece che per prodotto (1,25 · 0,9 = 1,125). Il rapporto 3 : 2 : 1 resta uguale, quindi la quota dei trasporti dentro i Servizi non cambia.`,
  patt: 'Rapporti vs valori assoluti' },

t1: { area: 'DI', diff: 'difficile', lang: 'it', asset: tIscritti(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ok: `Gli iscritti di Giurisprudenza provenienti dal Sud e dalle isole sono più della metà di tutti gli iscritti provenienti dal Sud e dalle isole.`,
  ko: [`Tra gli iscritti provenienti dal Centro, quelli di Economia sono più della metà.`,
       `Gli iscritti di Ingegneria provenienti dal Nord sono più numerosi degli iscritti di Economia provenienti dal Sud e dalle isole.`,
       `Gli iscritti provenienti dal Sud e dalle isole sono meno del 30% di tutti gli iscritti.`],
  sol: `Le percentuali sono di riga: servono gli iscritti di ogni corso. Economia (600): Nord 300, Centro 180, Sud 120. Giurisprudenza (400): 100, 100, 200. Ingegneria (200): 80, 80, 40. Totali per area: Nord 480, Centro 360, Sud e isole 360 (su 1.200). Giurisprudenza dal Sud: 200 su 360, cioè più della metà (180): vera. Economia dal Centro: 180 su 360 = esattamente la metà (falsa). Ingegneria dal Nord (80) contro Economia dal Sud (120): falsa. Sud e isole: 360 su 1.200 = esattamente il 30% (falsa).`,
  trap: `Leggere le percentuali di riga come se fossero di colonna: 50% e 20% non si confrontano tra righe diverse se i corsi hanno iscritti diversi. Due affermazioni sono costruite sulla soglia esatta (180 su 360; 360 su 1.200): «più della metà» e «meno del 30%» non includono il caso uguale.`,
  patt: 'Rapporti vs valori assoluti' },

t2: { area: 'DI', diff: 'difficile', lang: 'it', asset: tExport(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel 2025 le esportazioni del tessile sono state più del doppio di quelle della chimica.`,
         `Tra il 2022 e il 2025 le esportazioni dell'alimentare sono aumentate di più del 50%.`,
         `Tra il 2022 e il 2025 la crescita assoluta maggiore tra i quattro settori è quella della meccanica.`,
         `Nessuna delle altre risposte è corretta.`], ans: 3,
  sol: `Prima: 2 · 74 = 148 e il tessile ha 144, quindi non è più del doppio (falsa). Seconda: 135 ÷ 90 = 1,5, cioè esattamente +50%, non di più (falsa). Terza: crescita assoluta 2022–2025: tessile +24, meccanica +40, alimentare +45, chimica −6: la maggiore è quella dell'alimentare, non della meccanica (falsa). Poiché le tre affermazioni sono false, «Nessuna delle altre risposte è corretta» è vera.`,
  trap: `Arrotondare: 144 «è circa il doppio» di 74 e +50% «è più o meno la metà in più» sono confronti costruiti vicino alla soglia. La crescita assoluta maggiore va cercata guardando tutti e quattro i settori: la meccanica ha i valori più alti, ma cresce di meno dell'alimentare. Qui «Nessuna delle altre» è la risposta giusta.`,
  patt: 'Rapporti vs valori assoluti' },

t3: { area: 'DI', diff: 'media', lang: 'it', asset: tPiani(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ok: `Con 40 contratti conclusi nel mese i tre piani pagano lo stesso importo.`,
  ko: [`Con 30 contratti conclusi nel mese il piano più conveniente è il B.`,
       `Con 50 contratti conclusi nel mese il piano C paga 500 € in più del piano A.`,
       `Il piano B è il più conveniente per un numero di contratti compreso tra 20 e 40.`],
  sol: `Retribuzione = fisso + importo per contratto · contratti. Con 40 contratti: A = 1.200 + 20 · 40 = 2.000 €; B = 800 + 30 · 40 = 2.000 €; C = 50 · 40 = 2.000 €: vera. Con 30 contratti: A = 1.800, B = 1.700, C = 1.500: il più conveniente è A (falsa la seconda). Con 50 contratti: A = 2.200 e C = 2.500, differenza 300 € (falsa la terza). Sotto i 40 contratti il migliore è A, sopra i 40 è C: B non è mai il più conveniente (falsa la quarta).`,
  trap: `Confrontare le parti variabili (50 € è il massimo per contratto, quindi «C è sempre meglio») o le parti fisse (1.200 € è il massimo, quindi «A è sempre meglio»): le due rette si incrociano. Il caso in cui tre piani si incontrano nello stesso punto (40 contratti) è facile da perdere se si calcolano solo due piani alla volta.`,
  patt: 'Confronto di piani lineari' }

};

/* ordine di comparsa nel mock e posizione (0 = A … 3 = D) della risposta giusta */
const ORDER = ['q_list', 'v_term', 'ds6', 'q_off', 'vfn_obb', 't3', 'q_mix', 'v_alt', 'dp1', 'q_marta',
  'vfn_y', 'g1', 'q_sedi', 'v_debt', 'ds1', 'q_op', 'dp2', 'v_reg', 'q_boc', 't1',
  'v_nec', 'q_abc', 'ds2', 'vfn_x', 'q_bici', 'g3', 'v_sel', 'q_prob', 'ds3', 'v_nonc',
  'q_bigl', 'dp3', 'vfn_brev', 'q_ric', 'g2', 'v_ass', 'q_eta', 'ds4', 'v_comp5', 'q_sq',
  't2', 'vfn_z', 'q_fav', 'ds5', 'v_obv', 'q_resti', 'dp4', 'v_fatt', 'q_nd', 'q_tit'];
const POS = {
  q_list: 0, v_term: 0, ds6: 2, q_off: 1, vfn_obb: 0, t3: 0, q_mix: 2, v_alt: 1,
  dp1: 2, q_marta: 1, vfn_y: 1, g1: 0, q_sedi: 3, v_debt: 1, ds1: 2, q_op: 3,
  dp2: 2, v_reg: 0, q_boc: 2, t1: 0, v_nec: 2, q_abc: 3, ds2: 1, vfn_x: 2,
  q_bici: 0, g3: 2, v_sel: 1, q_prob: 3, ds3: 1, v_nonc: 3, q_bigl: 0, dp3: 1,
  vfn_brev: 0, q_ric: 0, g2: 3, v_ass: 1, q_eta: 2, ds4: 3, v_comp5: 1, q_sq: 2,
  t2: 3, vfn_z: 2, q_fav: 3, ds5: 1, v_obv: 0, q_resti: 3, dp4: 3, v_fatt: 2,
  q_nd: 3, q_tit: 0
};

const QUESTIONS = ORDER.map((k, i) => {
  const it = Object.assign({}, ITEMS[k]);
  if (it.dsg) {
    Object.assign(it, dsq(it.dsg, it.dso, it.lang === 'en'));
  } else if (it.ok !== undefined) {
    Object.assign(it, it.last ? mcLast(it.ok, it.ko, it.last, POS[k]) : mc(it.ok, it.ko, POS[k]));
  }
  ['ok', 'ko', 'last', 'dsg', 'dso'].forEach(f => delete it[f]);
  /* campi nell'ordine dello schema */
  const q = { n: i + 1, area: it.area, diff: it.diff, lang: it.lang };
  if (it.ds) q.ds = true;
  ['passage', 'claim', 'asset', 'stem', 'opts', 'ans', 'sol', 'trap', 'patt'].forEach(f => { if (it[f] !== undefined) q[f] = it[f]; });
  return q;
});

return {
  id: '16',
  title: 'Mock 16',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Quantitativa e Verbale più difficili del Mock 14: percentuali a più livelli e condizionate, miscele, medie ponderate inverse, lavoro con cambio a metà, combinatoria con vincoli, sistema con interi, brani da 120–200 parole con modali e opzioni quasi tutte plausibili. Data Insights allo stesso livello del Mock 14.',
  questions: QUESTIONS,
  order: ORDER,
  data: DATA
};
});
