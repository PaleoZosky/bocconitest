/* =======================================================================
   Mock 15 — 50 domande nuove (18 Q, 16 V, 16 DI), calibrate con
   guida-calibrazione-mock.md. Rispetto al Mock 14: Data Insights allo
   stesso livello; Quantitativa e Verbale più difficili (più passaggi,
   brani da 120–200 parole con negazioni e modali, opzioni sbagliate
   tutte plausibili: metà vere, ambito spostato, causa invertita,
   periodo sbagliato, assoluti).

   Nelle domande di sufficienza dei dati i criteri sono fissi:
   A = una sola delle due affermazioni basta, B = servono entrambe,
   C = ciascuna basta da sola, D = servono altri dati; nella lista
   compaiono in ordine rimescolato (la lettera del criterio è scritta
   nel testo dell'opzione, la posizione A–D è quella del pulsante).

   Tutti i numeri dei grafici e delle tabelle stanno in DATA e sono
   riusati da tools/check_math_15.py per ricalcolare le risposte.
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
function dsq(order, giusta, en) {
  const L = en ? DSL_EN : DSL;
  return { opts: order.split('').map(k => L[k]), ans: order.indexOf(giusta) };
}

/* ============================== DATI ============================== */
const DATA = {
  /* n.6 — come una famiglia ripartisce il reddito (colonne impilate, % del reddito) */
  famiglia: {
    anni: ['2023', '2025'], reddito: [30000, 36000],
    voci: ['Casa', 'Alimentari', 'Trasporti', 'Risparmio', 'Altro'],
    q: { '2023': [35, 25, 15, 10, 15], '2025': [30, 20, 15, 20, 15] }
  },
  /* n.8 — dipendenti per sede e fascia d'età (% di colonna) */
  sedi: {
    colonne: [['Nord', 500], ['Centro', 300], ['Sud', 200]],
    fasce: ['Under 30', '30–50 anni', 'Over 50'],
    pct: [[20, 30, 40], [50, 40, 40], [30, 30, 20]]
  },
  /* n.17 — indice dei prezzi di un paniere (2020 = 100) in due Paesi e prezzi 2020 in euro */
  indici: { anni: [2020, 2021, 2022, 2023, 2024], A: [100, 110, 120, 130, 140], B: [100, 105, 110, 115, 120], prezzo20: { A: 50, B: 80 } },
  /* n.24 — pezzi venduti (migliaia) da tre marchi */
  marchi: { anni: [2022, 2023, 2024, 2025], Alfa: [150, 160, 190, 235], Beta: [80, 95, 110, 118], Gamma: [60, 70, 105, 110] },
  /* n.32 — struttura dei costi di produzione (%) e variazioni previste */
  costi: { quote: [['Materie prime', 40], ['Lavoro', 30], ['Energia', 20], ['Altro', 10]], totale: 500000, energia: 25, lavoro: -10 },
  /* n.42 — ordini per prodotto e canale (celle nascoste) */
  ordini: {
    canali: ['Negozio', 'Online', 'Telefono'],
    noti: { X: [null, 60, null], Y: [100, null, null], Z: [null, null, 20] },
    totRiga: { X: 180, Y: 240, Z: 90 }, totCol: [220, 180, 110], totale: 510, rapportoZ: [4, 3]
  }
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

function gFamiglia() {
  const D = DATA.famiglia;
  const W = 520, H = 300, T = 16, B = 34, bw = 90, xs = [40, 275];
  const fill = ['var(--s1)', 'var(--s3)', 'var(--s2)', 'var(--f2)', 'var(--f4)'];
  const ph = H - T - B;
  let g = `<line x1="40" x2="${W - 10}" y1="${T + ph}" y2="${T + ph}" class="axis"></line>`;
  D.anni.forEach((yr, k) => {
    let acc = 0;
    D.q[yr].forEach((p, i) => {
      const h = ph * p / 100, y = T + ph - ph * (acc + p) / 100;
      g += `<rect x="${xs[k]}" y="${y}" width="${bw}" height="${h}" style="fill:${fill[i]};stroke:var(--paper)" stroke-width="1.5"><title>${yr}, ${D.voci[i]}: ${p}%</title></rect>`;
      g += `<text x="${xs[k] + bw + 8}" y="${y + h / 2 + 4}" class="val">${D.voci[i]} ${p}%</text>`;
      acc += p;
    });
    g += `<text x="${xs[k] + bw / 2}" y="${H - 10}" class="lab" text-anchor="middle">${yr}</text>`;
  });
  return `<figure class="fig"><figcaption>Come una famiglia ripartisce il proprio reddito annuo (100% = reddito dell'anno)</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Due colonne impilate. Nel 2023: ${D.voci.map((v, i) => v + ' ' + D.q['2023'][i] + '%').join(', ')}. Nel 2025: ${D.voci.map((v, i) => v + ' ' + D.q['2025'][i] + '%').join(', ')}.">${g}</svg></div>
<p class="fig-note">Il reddito annuo della famiglia era di ${fmt(D.reddito[0])} € nel 2023 e di ${fmt(D.reddito[1])} € nel 2025.</p></figure>`;
}

function tSedi() {
  const S = DATA.sedi;
  return C.table({
    caption: 'Dipendenti di un\'azienda per fascia d\'età, in ciascuna sede (% dei dipendenti di quella sede)',
    head: ['Fascia d\'età'].concat(S.colonne.map(c => c[0])),
    rows: S.fasce.map((f, i) => [f].concat(S.pct[i].map(p => p + '%'))),
    foot: ['Dipendenti della sede'].concat(S.colonne.map(c => c[1]))
  }) + `<p class="fig-note">Le tre percentuali di ogni sede sommano a 100%. L'ultima riga indica il numero di dipendenti di ciascuna sede.</p>`;
}

function gIndici() {
  const D = DATA.indici;
  const W = 520, H = 280, L = 44, R = 24, T = 20, B = 32, lo = 90, hi = 150;
  const x = i => L + (W - L - R) * i / 4;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  let g = '';
  for (let t = lo; t <= hi; t += 10) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === lo ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  D.anni.forEach((yr, i) => { g += `<text x="${x(i)}" y="${H - 8}" class="tick" text-anchor="middle">${yr}</text>`; });
  const line = (arr, c, dash) => `<polyline points="${arr.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" style="stroke:var(--${c})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${dash ? ' stroke-dasharray="6 4"' : ''}></polyline>`;
  const dots = (arr, c, name) => arr.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"><title>${name}, ${D.anni[i]}: ${v}</title></circle>`).join('');
  g += line(D.A, 's1') + line(D.B, 's2', true) + dots(D.A, 's1', 'Paese A') + dots(D.B, 's2', 'Paese B');
  D.anni.forEach((yr, i) => {
    g += `<text x="${x(i)}" y="${y(D.A[i]) - 11}" class="val" text-anchor="middle">${D.A[i]}</text>`;
    g += `<text x="${x(i)}" y="${y(D.B[i]) + 19}" class="val" text-anchor="middle">${D.B[i]}</text>`;
  });
  return `<figure class="fig"><figcaption>Indice del prezzo dello stesso paniere di beni in due Paesi (2020 = 100 in entrambi)</figcaption>
<ul class="legend"><li><i class="sw line" style="background:var(--s1)"></i>Paese A</li><li><i class="sw line" style="background:var(--s2)"></i>Paese B</li></ul>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Due linee dal 2020 al 2024, indice del prezzo del paniere con 2020 = 100. Paese A: ${D.A.join(', ')}. Paese B: ${D.B.join(', ')}.">${g}</svg></div>
<p class="fig-note">Nel 2020 il paniere costava ${D.prezzo20.A} € nel Paese A e ${D.prezzo20.B} € nel Paese B.</p></figure>`;
}

function tMarchi() {
  const M = DATA.marchi, f = v => String(v);
  return C.table({
    caption: 'Pezzi venduti da tre marchi, in migliaia',
    head: ['Marchio'].concat(M.anni),
    rows: [['Alfa'].concat(M.Alfa.map(f)), ['Beta'].concat(M.Beta.map(f)), ['Gamma'].concat(M.Gamma.map(f))]
  });
}

function gCosti() {
  const D = DATA.costi;
  return `<figure class="fig"><figcaption>Struttura del costo di produzione di un'azienda (quote del costo totale)</figcaption>` + C.pie({
    data: D.quote, title: 'Costo di produzione',
    aria: 'Torta con le quote del costo di produzione: ' + D.quote.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `<p class="fig-note">Il costo totale di produzione è di ${fmt(D.totale)} € all'anno.</p></figure>`;
}

function tOrdini() {
  const O = DATA.ordini, c = v => v === null ? '?' : v;
  const riga = k => ['Prodotto ' + k].concat(O.noti[k].map(c), [O.totRiga[k]]);
  return C.table({
    caption: 'Ordini ricevuti per prodotto e canale di vendita',
    head: ['', 'Negozio', 'Online', 'Telefono', 'Totale'],
    rows: [riga('X'), riga('Y'), riga('Z'), ['Totale'].concat(O.totCol, [O.totale])]
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato. Per il prodotto Z gli ordini del canale Negozio e quelli del canale Online stanno nel rapporto 4 : 3.</p>`;
}

/* ======================= LE 50 DOMANDE ======================= */
const QUESTIONS = [

/* ---------- 1 ---------- */
{ n: 1, area: 'Q', diff: 'media', lang: 'it',
  stem: `Quest'anno il numero totale dei clienti di un negozio è diminuito del 10% rispetto all'anno scorso, ma la quota dei clienti che comprano online è salita dal 30% al 40% del totale. Di quanto è variato, in percentuale, il numero dei clienti che comprano online?`,
  opts: ['circa +33%', '+10%', '+20%', 'circa +23%'], ans: 2,
  sol: `Il totale si moltiplica per 0,9 e la quota online per 40 ÷ 30 = 4/3: i clienti online si moltiplicano per 0,9 · 4/3 = 1,2, cioè +20%. (Controllo con 100 clienti: l'anno scorso 30 online; quest'anno 90 clienti in tutto e il 40% di 90 = 36 online; 36 ÷ 30 = 1,2.)`,
  trap: `Guardare solo la quota: 40 ÷ 30 = +33% dimentica che il totale è sceso. Sottrarre i punti (40 − 30 = +10%) confonde punti percentuali e variazione relativa. Sottrarre il calo dal 33% (33% − 10% ≈ +23%) tratta due variazioni che si moltiplicano come se si sommassero.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 2 ---------- */
{ n: 2, area: 'V', diff: 'media', lang: 'it',
  claim: `Escludendo le componenti non ricorrenti, i profitti operativi di Aurelia nel 2025 sono cresciuti rispetto al 2024.`,
  passage: `Nel 2025 la società Aurelia, quotata alla Borsa di Milano, ha distribuito agli azionisti un dividendo di 0,80 € per azione, contro i 0,60 € dell'anno precedente. L'aumento è stato reso possibile dalla cessione di una controllata, che ha generato una plusvalenza di 45 milioni di euro: il consiglio di amministrazione l'ha classificata come componente non ricorrente del risultato. Al netto di tale plusvalenza, il risultato operativo è invece diminuito del 6%, scendendo a 210 milioni. Alcuni analisti sostengono che, senza la cessione, la società avrebbe potuto mantenere il dividendo precedente soltanto riducendo gli investimenti. Il presidente ha dichiarato che nel 2026 la politica dei dividendi sarà rivista in base agli utili effettivamente realizzati, senza assumere alcun impegno sulla cifra.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «Al netto di tale plusvalenza, il risultato operativo è invece diminuito del 6%». «Componenti non ricorrenti» indica qui la plusvalenza (la società stessa la classifica così) e «profitti operativi» è il «risultato operativo»: escluso ciò che non ricorre, il dato è calato del 6%, non cresciuto. L'affermazione è contraddetta.`,
  trap: `Rispondere «non ricavabile» perché il brano non usa le parole «componenti non ricorrenti» né «profitti operativi»: sono sinonimi tecnici di «plusvalenza» e «risultato operativo». Il dividendo in aumento è un dato diverso e attira verso la risposta sbagliata.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 3 ---------- */
{ n: 3, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Cinque dipendenti di un ufficio hanno una retribuzione mensile media di 2.000 €. La retribuzione mensile più alta supera i 2.500 €?',
    'La retribuzione più bassa è di 1.400 € e le tre retribuzioni intermedie non superano ciascuna i 2.000 €.',
    'La retribuzione mediana, cioè la terza in ordine crescente, è di 1.800 €.'),
  ...dsq('DABC', 'A'),
  sol: `La somma delle cinque retribuzioni è 5 · 2.000 = 10.000 €. (1): la più bassa è 1.400 e le tre intermedie sommano al massimo 6.000, quindi la più alta è almeno 10.000 − 1.400 − 6.000 = 2.600 €: supera sempre 2.500, la risposta è «sì». (2): con la mediana a 1.800 si hanno sia (1.600; 1.600; 1.800; 2.500; 2.500), dove la più alta non supera 2.500 (somma 10.000), sia (1.000; 1.000; 1.800; 3.100; 3.100), dove la supera (somma 10.000): non basta.`,
  trap: `Cercare i cinque valori esatti: per una domanda sì/no basta un limite. La (1) non nomina la retribuzione più alta, ma la costringe per differenza; la (2) sembra utile (parla della mediana, quindi del «centro») ma lascia aperte entrambe le risposte.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 4 ---------- */
{ n: 4, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Un fondo investe il 60% del capitale in azioni e il resto in obbligazioni. Tra le azioni il 25% è di società estere; tra le obbligazioni il 50% è estero. Gli investimenti esteri ammontano in tutto a 42 milioni di euro. Qual è il capitale totale del fondo?`,
  opts: ['120 milioni di euro', '112 milioni di euro', '168 milioni di euro', '84 milioni di euro'], ans: 0,
  sol: `Quota estera sul capitale = 0,6 · 25% + 0,4 · 50% = 15% + 20% = 35%. Capitale = 42 ÷ 0,35 = 120 milioni. (Controllo: azioni 72, di cui estere 18; obbligazioni 48, di cui estere 24; 18 + 24 = 42.)`,
  trap: `Fare la media semplice di 25% e 50% (37,5%) e ottenere 42 ÷ 0,375 = 112: le due quote hanno pesi diversi (60% e 40%). Le altre due sono basi sbagliate: 42 ÷ 0,25 = 168 (solo azioni) e 42 ÷ 0,5 = 84 (solo obbligazioni).`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 5 ---------- */
{ n: 5, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel 2025 il numero di nuovi mutui per l'acquisto di abitazioni è aumentato del 9% rispetto al 2024, raggiungendo quota 327.000, mentre l'importo medio erogato è rimasto stabile a 135.000 euro. La crescita è stata sostenuta dal calo dei tassi: il tasso medio sui mutui a tasso fisso è sceso dal 3,9% al 3,2%, quello sui mutui a tasso variabile dal 4,6% al 3,1%, così che nel 2025 il variabile è risultato di poco inferiore al fisso. Ciononostante, la quota dei mutui a tasso fisso sul totale è salita dal 60% al 68%, perché molte famiglie, temendo nuovi rialzi, hanno preferito la certezza della rata. Secondo la banca centrale, le famiglie con un mutuo a tasso variabile sono più esposte a un eventuale aumento dei tassi, ma non necessariamente a un peggioramento della loro situazione finanziaria complessiva, che dipende anche dal reddito e dal valore dell'immobile.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  opts: [`Nel 2025 il tasso medio dei mutui a tasso variabile è diminuito più di quello dei mutui a tasso fisso.`,
         `L'importo complessivo erogato con i nuovi mutui è aumentato, nel 2025, di circa il 9%.`,
         `Secondo la banca centrale, in caso di rialzo dei tassi chi ha un mutuo a tasso variabile potrebbe non vedere peggiorare la propria situazione finanziaria complessiva.`,
         `Nel 2025 il numero di nuovi mutui a tasso fisso è cresciuto meno del numero totale di nuovi mutui.`], ans: 3,
  sol: `Frase chiave: «la quota dei mutui a tasso fisso sul totale è salita dal 60% al 68%». Nel 2024 i mutui erano 300.000 (327.000 ÷ 1,09) e quelli a tasso fisso 180.000; nel 2025 sono 327.000 e quelli a tasso fisso 222.360, cioè +23,5%: più del +9% del totale. Dunque la quarta è sbagliata. Le altre sono nel brano: variabile −1,5 punti contro fisso −0,7; importo medio stabile e numero +9% → totale +9%; «non necessariamente a un peggioramento».`,
  trap: `Leggere 60% → 68% come «+8» e concludere che i mutui a tasso fisso crescono meno del 9%: 8 sono punti di quota, non la variazione del numero di mutui, che dipende anche dal totale. Nelle domande «NON è corretta» si cerca l'unica frase sbagliata, non quella giusta.`,
  patt: 'Percentuali e punti percentuali' },

/* ---------- 6 ---------- */
{ n: 6, area: 'DI', diff: 'media', lang: 'it', asset: gFamiglia(),
  stem: `Come è cambiata, in euro, la spesa complessiva della famiglia per casa e alimentari tra il 2023 e il 2025?`,
  opts: [`È diminuita del 10%.`,
         `È rimasta invariata.`,
         `È diminuita di circa il 17%.`,
         `È aumentata del 20%.`], ans: 1,
  sol: `2023: (35% + 25%) di 30.000 = 60% · 30.000 = 18.000 €. 2025: (30% + 20%) di 36.000 = 50% · 36.000 = 18.000 €. La spesa è identica: la quota sul reddito è scesa, ma il reddito è salito del 20% (36.000 ÷ 30.000).`,
  trap: `Leggere la quota (60% → 50%) come se fosse la spesa: −10 punti scambiati per −10%, oppure −10 ÷ 60 ≈ −17% di quota. L'aumento del 20% è quello del reddito, non della spesa. Le percentuali sono su un reddito diverso in ciascun anno: vanno convertite in euro.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 7 ---------- */
{ n: 7, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un negozio aumenta del 25% il prezzo di una giacca; poi, per i saldi, riduce del 40% il nuovo prezzo. Ora la giacca costa 90 €. Quanto costava prima del rincaro?`,
  opts: ['circa 106 €', '150 €', '120 €', '72 €'], ans: 2,
  sol: `I due passaggi si moltiplicano: 1,25 · 0,60 = 0,75. Quindi 90 = 0,75 · prezzo iniziale e il prezzo iniziale è 90 ÷ 0,75 = 120 €. (Controllo: 120 · 1,25 = 150; 150 · 0,60 = 90.)`,
  trap: `Sommare le variazioni (+25% − 40% = −15%) e fare 90 ÷ 0,85 ≈ 106 €. Le altre due tolgono un passaggio solo: 90 ÷ 0,6 = 150 (ignora il rincaro) e 90 ÷ 1,25 = 72 (ignora i saldi).`,
  patt: 'Percentuali composte' },

/* ---------- 8 ---------- */
{ n: 8, area: 'DI', diff: 'media', lang: 'it', asset: tSedi(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Gli Under 30 del Sud sono più numerosi degli Under 30 del Nord.`,
         `I dipendenti tra 30 e 50 anni del Centro sono esattamente la metà di quelli del Nord.`,
         `In tutta l'azienda gli Under 30 sono il 30% dei dipendenti.`,
         `Gli Over 50 del Nord sono più numerosi degli Over 50 del Centro e del Sud messi insieme.`], ans: 3,
  sol: `Le percentuali sono di colonna: servono i dipendenti di ogni sede. Nord (500): 100, 250, 150. Centro (300): 90, 120, 90. Sud (200): 80, 80, 40. Under 30: Sud 80 contro Nord 100 (falsa la prima). Tra 30 e 50: 120 contro 250, la metà sarebbe 125 (falsa la seconda). Under 30 totali: 100 + 90 + 80 = 270 su 1.000 = 27% (falsa la terza). Over 50: Nord 150 contro 90 + 40 = 130 (vera la quarta).`,
  trap: `Leggere le percentuali come numeri: 40% > 20% fa credere che al Sud gli Under 30 siano più numerosi. Il 30% è la media semplice di 20%, 30% e 40%, ma le sedi hanno pesi diversi (500, 300, 200). Il confronto «metà» con 120 contro 250 è costruito vicino alla soglia (125).`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 9 ---------- */
{ n: 9, area: 'V', diff: 'media', lang: 'it',
  claim: `Nel 2025 i contratti domestici a prezzo fisso erano più di quattro su dieci.`,
  passage: `Nel mercato dell'energia elettrica i clienti domestici possono scegliere tra due sole formule di contratto: il prezzo fisso, che resta invariato per il periodo concordato (di norma dodici mesi), e il prezzo variabile, indicizzato al prezzo all'ingrosso dell'energia e quindi aggiornato ogni mese. Secondo l'ultimo rapporto dell'autorità di settore, nel 2025 il 58% dei contratti domestici era a prezzo variabile, contro il 71% del 2023. Il rapporto osserva che, nei periodi di forte rialzo del prezzo all'ingrosso, chi ha un contratto a prezzo fisso non subisce aumenti fino alla scadenza, ma al rinnovo l'offerta proposta può risultare più cara della precedente. Nei periodi di ribasso, invece, i clienti a prezzo variabile beneficiano subito della riduzione, mentre quelli a prezzo fisso continuano a pagare la tariffa concordata.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «due sole formule di contratto» e «nel 2025 il 58% dei contratti domestici era a prezzo variabile». Se le formule sono due e il variabile è il 58%, il fisso è il 100% − 58% = 42%, cioè più di quattro contratti su dieci (40%). L'affermazione è una conseguenza logica del brano.`,
  trap: `Rispondere «non ricavabile» perché il brano non scrive mai la percentuale dei contratti a prezzo fisso: si ricava per differenza, grazie a «due sole formule». Il 71% del 2023 è un dato di un altro anno e non serve.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 10 ---------- */
{ n: 10, area: 'Q', diff: 'media', lang: 'it',
  stem: `Si vogliono ottenere 600 g di soluzione salina al 10% mescolando una soluzione al 18% con una soluzione al 6%. Quanti grammi della soluzione al 18% servono?`,
  opts: ['300 g', '200 g', '400 g', '150 g'], ans: 1,
  sol: `Sale totale: 10% di 600 = 60 g. Se x sono i grammi al 18%: 0,18x + 0,06(600 − x) = 60, cioè 0,12x + 36 = 60 e x = 200 g. In alternativa, le distanze dal 10% sono 4 punti (verso il 6%) e 8 punti (verso il 18%): le quantità stanno in rapporto inverso, 8 : 4 = 2 : 1 per la soluzione al 6%, quindi 1 parte su 3 è al 18%: 600 ÷ 3 = 200 g.`,
  trap: `Prendere quantità uguali (300 g + 300 g dà 12%, non 10%), invertire il rapporto (400 g al 18% darebbe 14%) o dividere per la «distanza totale» 4 ÷ 12 e prendere 600 ÷ 4 = 150 g. La soluzione più vicina al 10% è quella al 6%, quindi se ne usa di più.`,
  patt: 'Miscele e concentrazioni' },

/* ---------- 11 ---------- */
{ n: 11, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un triangolo rettangolo ha i cateti di lunghezza a e b (in cm). Qual è la sua area?',
    'La somma dei due cateti è 17 cm.',
    'L\'ipotenusa misura 13 cm.'),
  ...dsq('BDAC', 'B'),
  sol: `Area = ab ÷ 2. Insieme: a + b = 17 e a² + b² = 13² = 169, quindi ab = [(a + b)² − (a² + b²)] ÷ 2 = (289 − 169) ÷ 2 = 60 e l'area è 30 cm². Da sola la (1) non basta: (5; 12) dà area 30, ma (8; 9) dà 36. Da sola la (2) non basta: (5; 12) dà 30, mentre due cateti uguali di 13/√2 darebbero 169 ÷ 4 = 42,25.`,
  trap: `Riconoscere la terna 5–12–13 e dare subito per sufficiente la (2): l'ipotenusa 13 non basta, perché esistono infiniti triangoli rettangoli con quell'ipotenusa. Insieme le due informazioni fissano ab senza bisogno di trovare i cateti.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 12 ---------- */
{ n: 12, area: 'V', diff: 'media', lang: 'it',
  passage: `La catena di supermercati Granaio ha introdotto a gennaio 2025, in tutti i suoi 80 punti vendita, un programma di fedeltà con sconti personalizzati proposti tramite un'applicazione per smartphone. Alla fine dell'anno il fatturato per punto vendita è risultato superiore dell'8% a quello del 2024, mentre il fatturato medio dei supermercati dello stesso settore è cresciuto del 3%. Il direttore commerciale attribuisce interamente al programma di fedeltà la maggiore crescita di Granaio e propone di destinare al suo potenziamento un budget di due milioni di euro per il 2026, da ripartire tra tutti i punti vendita. Il direttore ricorda che il programma è stato attivato nello stesso mese in tutti i punti vendita e che nel 2024 il fatturato per punto vendita era cresciuto del 2%, in linea con l'andamento del settore.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più l'attribuzione del direttore commerciale?`,
  opts: [`Nel corso del 2025 Granaio ha aperto in tutti i punti vendita un reparto di gastronomia molto frequentato, che prima non esisteva.`,
         `Gli iscritti al programma di fedeltà spendono in media il 20% in più dei clienti non iscritti.`,
         `Il programma di fedeltà ha richiesto un investimento iniziale di 1,2 milioni di euro.`,
         `Il fatturato medio del settore è cresciuto del 3% soprattutto per effetto dell'aumento dei prezzi.`], ans: 0,
  sol: `La conclusione è che il programma di fedeltà ha causato tutta la maggiore crescita (8% contro 3%). Se nello stesso anno Granaio ha aperto un reparto nuovo e molto frequentato, quella crescita ha una causa alternativa che spiega almeno in parte il +8% anche senza il programma. Il +20% degli iscritti rafforza; il costo è irrilevante per il nesso; l'inflazione nel settore riguarda il +3% e non spiega perché Granaio sia cresciuta di più.`,
  trap: `Scegliere il dato che «contraddice» il confronto con il settore (l'ultima): se i prezzi crescono per tutti, Granaio resta comunque sopra il settore. L'unica opzione che offre un'altra spiegazione del +8% specifica di Granaio è il reparto nuovo (causa alternativa).`,
  patt: 'Cause alternative' },

/* ---------- 13 ---------- */
{ n: 13, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `In un'azienda gli operai guadagnano in media 1.000 € al mese, gli impiegati 2.000 € e i dirigenti 5.000 €. Gli impiegati sono il doppio dei dirigenti e la retribuzione media dell'intera azienda è di 2.000 € al mese. Se in azienda lavorano in tutto 120 persone, quanti sono gli operai?`,
  opts: ['90', '12', '40', '60'], ans: 3,
  sol: `Siano d i dirigenti, 2d gli impiegati e o gli operai. La media complessiva è 2.000, uguale a quella degli impiegati: gli impiegati non spostano la media, quindi operai e dirigenti si bilanciano. Gli operai sono 1.000 sotto la media, i dirigenti 3.000 sopra: 1.000 · o = 3.000 · d, cioè o = 3d. In tutto: 3d + 2d + d = 6d = 120, d = 20 e gli operai sono 60. (Controllo: (60 · 1.000 + 40 · 2.000 + 20 · 5.000) ÷ 120 = 240.000 ÷ 120 = 2.000.)`,
  trap: `Dimenticare gli impiegati: con operai e dirigenti soli in rapporto 3 : 1 su 120 persone si ottiene 90 operai. Invertire il rapporto (dirigenti il triplo degli operai) porta a 12; dividere 120 in tre parti uguali (40) ignora i pesi. La media complessiva non è la media semplice dei tre valori.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 14 ---------- */
{ n: 14, area: 'V', diff: 'media', lang: 'it',
  passage: `Per misurare l'andamento dei prezzi gli istituti di statistica calcolano l'inflazione complessiva, che include tutti i beni di un paniere rappresentativo dei consumi delle famiglie, e l'inflazione di fondo, che esclude le componenti più volatili, come i prodotti energetici e gli alimentari freschi. Nel 2025 l'inflazione complessiva è stata dell'1,8%, mentre quella di fondo è stata del 2,5%: la differenza si spiega con il calo dei prezzi dell'energia. Secondo molti economisti la banca centrale dovrebbe guardare soprattutto all'inflazione di fondo, perché meno soggetta a oscillazioni temporanee; altri osservano però che le famiglie con redditi bassi spendono in energia e alimentari una quota maggiore del reddito e quindi percepiscono l'inflazione complessiva, non quella di fondo, come il proprio costo della vita.`,
  stem: `Nel brano, l'aggettivo «volatili» riferito alle componenti dei prezzi indica componenti:`,
  opts: [`i cui prezzi sono aumentati più della media nell'anno considerato.`,
         `i cui prezzi possono variare molto e in modo temporaneo da un periodo all'altro.`,
         `che le famiglie con redditi bassi sono costrette ad acquistare anche quando i prezzi salgono.`,
         `che la banca centrale non è in grado di misurare con precisione.`], ans: 1,
  sol: `Frase chiave: l'inflazione di fondo «esclude le componenti più volatili» ed è considerata «meno soggetta a oscillazioni temporanee». «Volatile» significa quindi soggetta a forti oscillazioni, anche temporanee. Nel 2025 l'energia è invece calata (la differenza 1,8% contro 2,5% «si spiega con il calo dei prezzi dell'energia»), quindi la prima opzione è smentita; il peso sul bilancio dei redditi bassi è un altro argomento del brano.`,
  trap: `Confondere «volatile» con «in aumento» (il significato quotidiano di «prezzi che salgono»): qui indica ampiezza e temporaneità delle oscillazioni, in su o in giù. La terza opzione mescola due frasi diverse del brano; la quarta è inventata.`,
  patt: 'Termine economico frainteso' },

/* ---------- 15 ---------- */
{ n: 15, area: 'DI', diff: 'media', lang: 'it',
  asset: dp([
    `Cinque colleghi — Alba, Bruno, Carlo, Dora ed Enzo — lavorano ciascuno a un piano diverso di un palazzo di cinque piani, numerati da 1 a 5.`,
    `Alba lavora più in alto di Bruno.`,
    `Dora lavora esattamente due piani sopra Carlo.`,
    `Enzo non lavora al quinto piano.`
  ], [
    `A. Dora lavora almeno al terzo piano.`,
    `B. Enzo lavora più in alto di Carlo.`,
    `C. Bruno lavora più in alto di Dora.`,
    `D. Carlo lavora al terzo piano o più in basso.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Solo la D', 'Sia la A sia la D', 'Sia la B sia la C'], ans: 2,
  sol: `Dora sta due piani sopra Carlo: se Carlo fosse al quarto piano Dora sarebbe al sesto, che non esiste. Quindi Carlo è ai piani 1, 2 o 3 (D vera) e Dora ai piani 3, 4 o 5 (A vera). B non è sicura: (Enzo 1, Carlo 2, Bruno 3, Dora 4, Alba 5) la smentisce, mentre (Carlo 1, Bruno 2, Dora 3, Enzo 4, Alba 5) la conferma. C non è sicura ma è possibile: (Carlo 1, Enzo 2, Dora 3, Bruno 4, Alba 5) la rende vera, (Carlo 2, Bruno 3, Dora 4, Enzo 1, Alba 5) falsa.`,
  trap: `Scartare A o D perché «non si sa il piano esatto»: i vincoli impongono comunque un limite (almeno il terzo, al massimo il terzo). Per B e C basta trovare un caso compatibile con i dati in cui sono false: «possibile» non vuol dire «sicuro».`,
  patt: 'Consegna: sicuramente vera' },

/* ---------- 16 ---------- */
{ n: 16, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Una vasca viene riempita da due rubinetti: A la riempirebbe da solo in 4 ore, B da solo in 6 ore. Un foro sul fondo, sempre aperto, la svuoterebbe da solo in 12 ore. A, B e il foro funzionano dall'inizio; dopo 1 ora B viene chiuso. Dopo quante ore in tutto la vasca è piena?`,
  opts: ['5 ore', '3 ore e 20 minuti', '4 ore', '6 ore'], ans: 0,
  sol: `In un'ora A riempie 1/4 della vasca, B 1/6, il foro ne svuota 1/12. Prima ora (tutti e tre): 1/4 + 1/6 − 1/12 = (3 + 2 − 1)/12 = 1/3. Poi restano A e il foro: 1/4 − 1/12 = 1/6 all'ora. Mancano 2/3 della vasca: 2/3 ÷ 1/6 = 4 ore. In tutto 1 + 4 = 5 ore.`,
  trap: `Ignorare il foro (1/4 + 1/6 = 5/12 nella prima ora, poi A da sola: 3 ore e 20 minuti in tutto). Non tenere conto che B si chiude (rapporto 1/3 per tutto il tempo: 3 ore). Dimenticare l'ora già trascorsa e dare solo le 4 ore del tratto finale. Contare l'ora iniziale come se A e il foro lavorassero da soli (1/6 all'ora, 6 ore).`,
  patt: 'Lavoro con cambio a metà' },

/* ---------- 17 ---------- */
{ n: 17, area: 'DI', diff: 'media', lang: 'it', asset: gIndici(),
  stem: `Nell'anno in cui il paniere costava 65 € nel Paese A, quanto costava nel Paese B?`,
  opts: ['104 €', '115 €', '88 €', '92 €'], ans: 3,
  sol: `Nel Paese A il paniere costava 50 € nel 2020 (indice 100): a 65 € l'indice è 65 ÷ 50 · 100 = 130, cioè il 2023. Nel Paese B nel 2023 l'indice è 115, quindi il prezzo è 80 · 1,15 = 92 €.`,
  trap: `Leggere l'indice 130 sulla linea di B e applicarlo ai 80 € (104 €), oppure prendere 115 come se fosse un prezzo in euro. L'anno sbagliato (2022 invece di 2023) dà 88 €. Gli indici hanno la stessa base ma prezzi di partenza diversi: l'indice non è un prezzo.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 18 ---------- */
{ n: 18, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Il programma europeo «Horizon Nova» prevede che, per essere finanziato, un progetto di ricerca debba ottenere almeno 80 punti su 100 nella valutazione finale del comitato di esperti. Il Dipartimento di Fisica dell'Università di Ravenna ha presentato un progetto sulla fotonica che ha ricevuto dal comitato 85 punti. Il direttore del dipartimento conclude: «Il nostro progetto sarà finanziato, perché ha superato la soglia richiesta dal programma». Il progetto coinvolge sei ricercatori e due partner industriali, e ha una durata prevista di tre anni. Nel bando dello scorso anno erano stati presentati 310 progetti e ne erano stati finanziati 42; il direttore aggiunge che i valutatori hanno giudicato «eccellente» l'impatto previsto del progetto, guidato da una ricercatrice che ha già coordinato due progetti nazionali.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione del direttore?`,
  opts: [`Negli ultimi bandi, quasi tutti i progetti finanziati avevano ottenuto più di 80 punti.`,
         `Negli ultimi bandi, tutti i progetti che hanno ottenuto più di 80 punti sono stati finanziati.`,
         `Il Dipartimento di Fisica ha già ottenuto un finanziamento europeo nel 2021.`,
         `Il progetto è stato valutato da un comitato composto da esperti di cinque Paesi diversi.`], ans: 1,
  sol: `Il programma fissa una condizione necessaria (almeno 80 punti per essere finanziati), mentre il direttore ne trae una conseguenza sufficiente (85 punti → sarà finanziato). La seconda opzione dice che in passato superare gli 80 punti è bastato: è la condizione sufficiente che manca, e rafforza di più la conclusione. La prima ripete che 80 è necessario («quasi tutti i finanziati avevano più di 80»), cosa già nel brano.`,
  trap: `Scegliere la prima opzione perché «parla di soglia e di finanziamenti»: dice che gli 80 punti sono necessari, ma il direttore ha bisogno che siano sufficienti. Le altre due (finanziamento del 2021, composizione del comitato) non toccano il passaggio dai punti al finanziamento.`,
  patt: 'Necessario vs sufficiente' },

/* ---------- 19 ---------- */
{ n: 19, area: 'Q', diff: 'difficile', lang: 'en',
  stem: `Marta cycles from her home to a lake at a constant speed of 15 km/h. She wants her average speed over the whole round trip (there and back, on the same road) to be 20 km/h. At what constant speed must she cycle on the way back?`,
  opts: ['25 km/h', '40 km/h', '30 km/h', 'It cannot be determined because the distance is not given'], ans: 2,
  sol: `Call d the one-way distance. Average speed = total distance ÷ total time: 2d ÷ (d/15 + d/v) = 20, so 1/15 + 1/v = 2/20 = 1/10. Then 1/v = 1/10 − 1/15 = 1/30 and v = 30 km/h. The distance d cancels. (Check with d = 30 km: 2 h there, 1 h back, 60 km in 3 h = 20 km/h.)`,
  trap: `Averaging the speeds: (15 + v) ÷ 2 = 20 gives 25 km/h, but equal distances at different speeds take different times (the slower leg weighs more). 40 km/h comes from «doubling» the target. «It cannot be determined» is a bait: the distance does not matter.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 20 ---------- */
{ n: 20, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Il numero intero positivo n è un multiplo di 18?',
    'n è un multiplo sia di 6 sia di 9.',
    'n è un multiplo sia di 2 sia di 9.'),
  ...dsq('ADBC', 'C'),
  sol: `Un numero multiplo di due interi è multiplo del loro minimo comune multiplo. (1): mcm(6, 9) = 18, quindi n è multiplo di 18. (2): mcm(2, 9) = 18 (2 e 9 non hanno fattori in comune, il mcm è il prodotto), quindi n è multiplo di 18. Ciascuna affermazione basta da sola.`,
  trap: `Pensare che «multiplo di 6 e di 9» richieda 6 · 9 = 54 (o che la (1) non basti perché 6 e 9 hanno il fattore 3 in comune): il numero che serve è il mcm, non il prodotto. Per la (2), 2 · 9 = 18 coincide con il mcm perché 2 e 9 sono coprimi.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 21 ---------- */
{ n: 21, area: 'V', diff: 'media', lang: 'it',
  claim: `Dopo il 1933 i fallimenti bancari sono diminuiti grazie alla garanzia federale sui depositi.`,
  passage: `Nel 1929 il crollo della Borsa di New York segnò l'inizio della Grande Depressione. Tra il 1929 e il 1933 il prodotto interno lordo degli Stati Uniti si ridusse di circa un quarto e la disoccupazione salì dal 3% a circa il 25%. Molti economisti attribuiscono la gravità della crisi non al solo crollo azionario, ma alla serie di fallimenti bancari che seguì: tra il 1930 e il 1933 fallirono circa novemila banche e i depositanti, che allora non erano protetti da alcuna assicurazione sui depositi, persero i loro risparmi. Nel 1933 il governo di Roosevelt introdusse una garanzia federale sui depositi bancari; da allora i fallimenti bancari diminuirono sensibilmente. Gli storici discutono se la politica monetaria della Federal Reserve, che in quegli anni restrinse la quantità di moneta, abbia aggravato la crisi, ma non vi è accordo su quanto.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «Nel 1933 il governo … introdusse una garanzia federale sui depositi bancari; da allora i fallimenti bancari diminuirono sensibilmente». «Da allora» indica una successione nel tempo, non un nesso causale: il brano non dice che i fallimenti siano calati «grazie» alla garanzia. L'affermazione non è né confermata né smentita.`,
  trap: `Accettare un nesso causale che sembra «quasi detto»: due fatti vicini nel tempo (garanzia introdotta, fallimenti in calo) non implicano che il primo spieghi il secondo. Non è nemmeno falsa, perché il brano non esclude la causa: la risposta è «non ricavabile».`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 22 ---------- */
{ n: 22, area: 'Q', diff: 'media', lang: 'it',
  stem: `Cinque amici (Anna, Bruno, Carla, Dario ed Elisa) si siedono in fila su cinque sedie. Anna e Bruno non vogliono sedersi su sedie vicine. In quanti modi diversi possono sedersi?`,
  opts: ['72', '48', '96', '60'], ans: 0,
  sol: `Tutte le disposizioni: 5! = 120. Quelle con Anna e Bruno vicini: si considerano come un blocco, quindi 4 elementi in 4! = 24 modi, e il blocco si può scambiare in 2 modi (AB oppure BA): 24 · 2 = 48. Quelle richieste: 120 − 48 = 72.`,
  trap: `Rispondere 48, cioè quelle con Anna e Bruno vicini (il contrario di ciò che si chiede). Dimenticare che il blocco ha due ordini interni: 120 − 24 = 96. Dimezzare 120 (60) come se Anna e Bruno fossero «una sì e una no».`,
  patt: 'Combinatoria con vincolo' },

/* ---------- 23 ---------- */
{ n: 23, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Dal regolamento di una compagnia aerea. Il passeggero ha diritto al rimborso integrale del biglietto se cancella la prenotazione almeno 48 ore prima della partenza. Se la cancellazione avviene meno di 48 ore ma più di 12 ore prima della partenza, il passeggero ha diritto al rimborso del 50%, a meno che il biglietto sia stato acquistato con la tariffa «Light», che non è rimborsabile in nessun caso. Nelle ultime 12 ore non è previsto alcun rimborso in denaro; se però la cancellazione dipende da un ricovero o da una malattia, documentati da un certificato medico presentato entro 5 giorni, la compagnia può concedere un voucher pari al 50% del valore del biglietto, ma non è obbligata a farlo. Se è la compagnia a cancellare il volo, il rimborso integrale spetta sempre.`,
  stem: `Luca ha acquistato con la tariffa «Standard» un biglietto da 300 € per un volo in partenza sabato alle 9:00. Venerdì alle 23:00 viene ricoverato e cancella la prenotazione; il lunedì successivo consegna il certificato medico. Quale delle seguenti affermazioni è corretta?`,
  opts: [`Luca ha diritto a un voucher di 150 €.`,
         `Luca ha diritto al rimborso in denaro di 150 €.`,
         `Luca non ha diritto ad alcun rimborso in denaro; la compagnia può concedergli un voucher di 150 €, ma non è obbligata a farlo.`,
         `Luca non può ricevere un voucher, perché il certificato è stato presentato oltre i 5 giorni.`], ans: 2,
  sol: `Da venerdì alle 23:00 a sabato alle 9:00 passano 10 ore, quindi la cancellazione cade nelle ultime 12 ore («Nelle ultime 12 ore non è previsto alcun rimborso in denaro»). Il certificato consegnato lunedì è entro 5 giorni dal venerdì: la compagnia «può concedere un voucher pari al 50% del valore del biglietto, ma non è obbligata a farlo». Il 50% di 300 € è 150 €.`,
  trap: `Esche sui modali: «ha diritto» al voucher (il testo dice solo «può» e «non è obbligata») e «ha diritto al rimborso del 50%», che vale per la fascia tra 12 e 48 ore ed è in denaro. L'ultima inventa un termine scaduto: il lunedì rientra nei 5 giorni. La tariffa «Light» è un'eccezione che non riguarda Luca.`,
  patt: 'Applicazione di una regola' },

/* ---------- 24 ---------- */
{ n: 24, area: 'DI', diff: 'media', lang: 'it', asset: tMarchi(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel 2025 Alfa ha venduto più del doppio dei pezzi di Beta.`,
         `Tra il 2022 e il 2025 la crescita percentuale più alta è stata quella di Gamma, anche se in valore assoluto la crescita più alta è stata quella di Alfa.`,
         `Nel 2025 Gamma ha venduto più di un quarto dei pezzi venduti in totale dai tre marchi.`,
         `Nessuna delle altre risposte è corretta.`], ans: 1,
  sol: `Prima: 2 · 118 = 236 e Alfa ha 235, quindi non è più del doppio (falsa). Terza: il totale 2025 è 235 + 118 + 110 = 463 e un quarto è 115,75: Gamma ne ha 110 (falsa). Seconda: crescita in valore assoluto dal 2022 al 2025: Alfa +85, Beta +38, Gamma +50, la più alta è Alfa; in percentuale: Alfa 85 ÷ 150 ≈ +57%, Beta 38 ÷ 80 = +47,5%, Gamma 50 ÷ 60 ≈ +83%, la più alta è Gamma. La seconda è vera, quindi «Nessuna delle altre» è falsa.`,
  trap: `Arrotondare: 235 «è circa il doppio» di 118 e 110 «è circa un quarto» di 463 sono i confronti costruiti vicini alla soglia. La seconda unisce livelli e variazioni: chi guarda solo i valori assoluti attribuisce la crescita più alta ad Alfa e basta; chi guarda solo le percentuali scarta la seconda perché «Alfa cresce di più in pezzi».`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 25 ---------- */
{ n: 25, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Nove ragazzi devono essere divisi in tre squadre da tre. Le squadre non hanno nome né colore: conta solo con chi ciascun ragazzo si trova. In quanti modi diversi si possono formare le squadre?`,
  opts: ['560', '840', '1.680', '280'], ans: 3,
  sol: `Prima squadra: C(9,3) = 84; seconda tra i 6 rimasti: C(6,3) = 20; la terza è fissata. Ordinate (prima, seconda, terza) sono 84 · 20 = 1.680. Poiché le squadre non sono distinguibili, ogni divisione è stata contata 3! = 6 volte: 1.680 ÷ 6 = 280.`,
  trap: `Fermarsi a 1.680 (le squadre sembrano «prima, seconda e terza» ma non lo sono). Dividere solo per 3 (560) o solo per 2 (840) dimentica che le tre squadre si possono ordinare in 3! = 6 modi.`,
  patt: 'Gruppi non etichettati' },

/* ---------- 26 ---------- */
{ n: 26, area: 'DI', diff: 'difficile', lang: 'it',
  asset: dp([
    `Un master ha 40 studenti. Ciascuno segue almeno uno tra tre moduli: Finanza, Marketing e Diritto.`,
    `Gli studenti che seguono Finanza sono 25; quelli che seguono Marketing sono 20.`,
    `Nessuno studente che segue Diritto segue anche Finanza.`
  ], [
    `A. Gli studenti che seguono Diritto sono più di 15.`,
    `B. Nessuno studente segue sia Finanza sia Marketing.`,
    `C. Gli studenti che seguono solo Marketing sono almeno 10.`,
    `D. Almeno 5 studenti seguono sia Finanza sia Marketing.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Sia la A sia la B', 'Solo la A', 'Sia la B sia la C', 'Sia la C sia la D'], ans: 0,
  sol: `Chi segue Diritto non segue Finanza, quindi sta tra i 40 − 25 = 15 studenti che non seguono Finanza: A (più di 15) è sicuramente falsa. Finanza e Marketing sommano 25 + 20 = 45 iscrizioni su 40 studenti, quindi almeno 45 − 40 = 5 studenti seguono entrambi: B è sicuramente falsa e D sicuramente vera. C è possibile ma non sicura: chi segue solo Marketing può essere da 0 a 15 (per esempio 15 con 5 studenti in comune, oppure 0 con 20 in comune); né sempre vera né sempre falsa.`,
  trap: `Con la consegna «sicuramente false» si finisce per indicare la D, che è la vera. La C non è sicuramente falsa: è falsa in alcuni casi compatibili con i dati e vera in altri. L'informazione sul Diritto serve per limitare quanti studenti lo seguono, non per contare i moduli.`,
  patt: 'Consegna: sicuramente falsa' },

/* ---------- 27 ---------- */
{ n: 27, area: 'V', diff: 'media', lang: 'en',
  passage: `A study of 5,000 office workers in several European countries found that employees who regularly take their lunch break away from their desk receive, on average, higher performance ratings from their managers than employees who usually eat at their desk. The study also showed that the difference in ratings was largest among employees with more than ten years of experience. The authors conclude that leaving the desk at lunchtime improves job performance, and they recommend that companies encourage all employees to do so, even those who say they prefer to keep working through lunch. The authors acknowledge that the study did not follow the same employees over time, and that the ratings were collected from the managers at the end of the year.`,
  stem: `Which of the following, if true, most weakens the authors' conclusion?`,
  opts: [`The study covered offices of different sizes in several European countries.`,
         `Employees who are already highly rated by their managers are usually given more freedom to decide how to organise their working day, including when and where to take their breaks.`,
         `Most of the employees in the study take a lunch break of between 30 and 45 minutes.`,
         `The study included only employees who work in offices, not in factories or shops.`], ans: 1,
  sol: `The authors move from a correlation (people who leave the desk are rated higher) to a cause (leaving the desk improves performance). If employees who are already highly rated get more freedom to take breaks away from their desk, the direction of the link may be reversed: good ratings lead to away-from-desk breaks, not the other way round. The other options do not touch the causal link.`,
  trap: `Looking for an option that «sounds negative» or technical (survey period, break length, size of offices): none of them offers another explanation of the correlation. The weakness here is reverse causation (or selection), which is different from a hidden third factor.`,
  patt: 'Causalità inversa' },

/* ---------- 28 ---------- */
{ n: 28, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un'urna contiene 4 palline rosse e 6 blu. Se ne estraggono 3 una dopo l'altra, senza rimettere nell'urna quelle già estratte. Qual è la probabilità di estrarre almeno una pallina rossa?`,
  opts: [fr(2, 3), fr(1, 6), fr(5, 6), fr(98, 125)], ans: 2,
  sol: `Conviene passare all'evento complementare: nessuna rossa, cioè tutte e tre blu. P = 6/10 · 5/9 · 4/8 = 120/720 = 1/6 (oppure C(6,3)/C(10,3) = 20/120). Almeno una rossa: 1 − 1/6 = 5/6.`,
  trap: `Fermarsi al complementare (1/6). Trattare le estrazioni come se fossero con reinserimento: 1 − (3/5)³ = 98/125. Fermarsi a due estrazioni invece di tre: 1 − 6/10 · 5/9 = 2/3.`,
  patt: 'Probabilità: almeno uno' },

/* ---------- 29 ---------- */
{ n: 29, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Una società di trasporto urbano propone di sostituire, su una linea, gli attuali autobus da 40 posti, che passano ogni 10 minuti, con autobus snodati da 80 posti che passerebbero ogni 20 minuti. Secondo la direzione, la capacità oraria della linea resterebbe identica (240 posti l'ora in ciascun senso), mentre il costo del personale scenderebbe del 30%, perché servirebbero meno autisti. La direzione conclude che il cambiamento non peggiorerà il servizio percepito dagli utenti e che nessun passeggero avrà motivo di lamentarsi. Il percorso e la velocità commerciale della linea non cambierebbero. La sostituzione è prevista a settembre, con un periodo di prova di tre mesi al termine del quale la direzione deciderà se estenderla ad altre due linee. La linea attraversa sei quartieri e conta ventiquattro fermate.`,
  stem: `Su quale assunzione si basa principalmente il ragionamento della direzione?`,
  opts: [`Per gli utenti non ha importanza attendere alla fermata il doppio del tempo, purché la capacità oraria della linea resti invariata.`,
         `Gli autobus snodati hanno costi di manutenzione inferiori a quelli degli autobus da 40 posti.`,
         `Nei prossimi anni il numero di passeggeri della linea aumenterà.`,
         `Il risparmio sul costo del personale verrà usato per ridurre le tariffe.`], ans: 0,
  sol: `La direzione ragiona così: stessi posti all'ora (40 · 6 = 80 · 3 = 240), quindi stesso servizio. Ma il passaggio ogni 20 minuti invece che ogni 10 raddoppia l'attesa alla fermata. La conclusione regge solo se l'attesa non conta per gli utenti: è l'assunzione implicita. Se l'attesa contasse, a parità di posti il servizio peggiorerebbe e la conclusione crollerebbe.`,
  trap: `Scegliere opzioni su costi, tariffe o domanda futura: non servono perché il ragionamento (stessa capacità → stesso servizio) funzioni. L'assunzione si trova guardando cosa cambia nonostante la capacità sia costante: la frequenza dei passaggi.`,
  patt: 'Assunzione implicita' },

/* ---------- 30 ---------- */
{ n: 30, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('In una scuola di 400 studenti, quante femmine studiano tedesco?',
    'Le femmine sono 240.',
    'Gli studenti che studiano tedesco sono 160.'),
  ...dsq('CABD', 'D'),
  sol: `Sono due totali (le femmine e chi studia tedesco), ma servirebbe una cella della tabella femmine/maschi × tedesco/non tedesco. Le femmine che studiano tedesco possono essere qualsiasi numero da 0 a 160: 0 se tutti i 160 che studiano tedesco sono maschi (i maschi sono 160), 160 se sono tutte femmine. Anche insieme le affermazioni non bastano.`,
  trap: `Supporre che il tedesco sia distribuito come la scuola (60% di 160 = 96 femmine): è un caso possibile, non l'unico. Con due totali di riga e di colonna una tabella 2 × 2 resta aperta: serve il valore di almeno una cella interna.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 31 ---------- */
{ n: 31, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Un teatro ha incassato 200 € vendendo soltanto biglietti da 9 € e biglietti da 14 €. Quanti biglietti da 14 € ha venduto?`,
  opts: ['4', '13', 'Non è possibile determinarlo con certezza: ci sono due soluzioni', '8'], ans: 2,
  sol: `Se a sono i biglietti da 9 € e b quelli da 14 €: 9a + 14b = 200 con a e b interi non negativi. 200 − 14b deve essere multiplo di 9: b = 4 dà 144 = 9 · 16 (a = 16); b = 13 dà 18 = 9 · 2 (a = 2); b = 22 sarebbe oltre 200. Le soluzioni sono due, (a; b) = (16; 4) e (2; 13): b può valere 4 oppure 13.`,
  trap: `Fermarsi alla prima soluzione trovata (4) o all'ultima (13). Il vincolo «numeri interi» non rende automaticamente unica la soluzione: bisogna cercarle tutte. L'8 è 200 ÷ (9 + 14) arrotondato e non soddisfa l'equazione.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 32 ---------- */
{ n: 32, area: 'DI', diff: 'media', lang: 'it', asset: gCosti(),
  stem: `L'anno prossimo il costo dell'energia aumenterà del 25%, quello del lavoro diminuirà del 10%, mentre gli altri costi resteranno invariati. Di quanto varierà, in percentuale, il costo totale di produzione?`,
  opts: ['+15%', '+2%', '+7,5%', '+5%'], ans: 1,
  sol: `Variazione del totale = 20% · (+25%) + 30% · (−10%) = +5% − 3% = +2% del costo totale. (Controllo in euro: energia 100.000 € → +25.000 €; lavoro 150.000 € → −15.000 €; in tutto +10.000 € su 500.000 €, cioè +2%.)`,
  trap: `Sommare le due variazioni (25% − 10% = +15%) o farne la media semplice (+7,5%) ignora che energia e lavoro pesano il 20% e il 30% del costo. Considerare solo l'energia (+5%) dimentica il lavoro. Il costo totale di 500.000 € non serve per la percentuale.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 33 ---------- */
{ n: 33, area: 'V', diff: 'difficile', lang: 'it',
  claim: `Le matricole straniere che hanno scelto un corso di laurea in inglese sono più di 350.`,
  passage: `L'università di Valtrebbia ha reso noti i dati sulle immatricolazioni dell'anno accademico 2025/26: le nuove matricole sono state 5.250, il 5% in più rispetto all'anno precedente. Il 55% delle matricole è costituito da donne e il 30% proviene da fuori regione; gli studenti stranieri sono il 10% del totale, contro il 7% dell'anno precedente. L'ateneo precisa che, tra le matricole straniere, due su tre hanno scelto un corso di laurea tenuto in inglese. I corsi in inglese sono 12 sui 40 complessivamente offerti. Il rettore ha commentato i risultati osservando che la crescita complessiva è stata sostenuta soprattutto dai corsi dell'area economica. Per il prossimo anno l'ateneo non esclude di attivare altri due corsi in inglese, purché le matricole straniere superino quota 500.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «gli studenti stranieri sono il 10% del totale» e «tra le matricole straniere, due su tre hanno scelto un corso di laurea tenuto in inglese». Le matricole straniere sono 10% di 5.250 = 525; i due terzi sono 350. Il numero è esattamente 350, non «più di 350»: l'affermazione è contraddetta da un dato deducibile con un calcolo semplice.`,
  trap: `Rispondere «non ricavabile» perché il brano non scrive il numero degli stranieri in corsi in inglese: si ricava con una percentuale e una frazione. Oppure «vera» confondendo i 525 stranieri (che superano la quota 500) con i 350 che scelgono l'inglese, o arrotondando 350 a «più di 350».`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 34 ---------- */
{ n: 34, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un negozio compra un paio di scarpe a 100 €, fissa il prezzo di listino con un ricarico del 60% sul costo e, ai saldi, applica uno sconto del 25% sul listino. Il guadagno sul singolo paio, rispetto al prezzo a cui viene venduto ai saldi, è pari a:`,
  opts: ['20%', '35%', '12,5%', 'circa 16,7%'], ans: 3,
  sol: `Listino: 100 · 1,60 = 160 €. Prezzo ai saldi: 160 · 0,75 = 120 €. Guadagno: 120 − 100 = 20 €. Rispetto al prezzo di vendita (120 €): 20 ÷ 120 = 1/6 ≈ 16,7%.`,
  trap: `La base cambia a ogni passaggio. 20% è il guadagno sul costo (20 ÷ 100); 12,5% è il guadagno sul listino (20 ÷ 160); 35% somma e sottrae i due 60% − 25% come se fossero sulla stessa base. Qui la base richiesta è il prezzo di vendita.`,
  patt: 'Base della percentuale' },

/* ---------- 35 ---------- */
{ n: 35, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Per sei mesi un'azienda di software ha sperimentato la settimana lavorativa di quattro giorni per i suoi 400 dipendenti, senza ridurre lo stipendio. Al termine della sperimentazione la produttività per ora lavorata, misurata come numero di richieste dei clienti evase diviso per le ore registrate sui cartellini, risultava superiore del 6% a quella dei sei mesi precedenti. L'amministratore delegato conclude che la settimana corta fa aumentare la produttività dei dipendenti e intende estenderla in modo permanente a tutta l'azienda. L'azienda precisa che le richieste dei clienti arrivano tramite una piattaforma che le assegna ai dipendenti in base alla disponibilità e che le ore di lavoro sono registrate dai dipendenti stessi con un cartellino digitale; le persone coinvolte lavorano in tre sedi, con mansioni di assistenza tecnica e commerciale.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione dell'amministratore delegato?`,
  opts: [`Nei questionari interni i dipendenti hanno dichiarato di sentirsi più riposati e meno stressati dopo l'introduzione della settimana corta.`,
         `L'azienda ha circa 400 dipendenti, quasi tutti impiegati nelle sedi italiane.`,
         `Durante la sperimentazione molti dipendenti hanno continuato a rispondere alle richieste dei clienti anche nel quinto giorno, senza registrare queste ore sul cartellino.`,
         `La sperimentazione è stata annunciata ai dipendenti con un anno di anticipo.`], ans: 2,
  sol: `La produttività è «richieste evase diviso per le ore registrate sui cartellini». Se molti hanno lavorato anche nel quinto giorno senza registrare le ore, il denominatore è sottostimato: le ore realmente lavorate sono più di quelle registrate e l'aumento del 6% può essere dovuto in tutto o in parte a un errore di misura, non a una maggiore produttività. È un'obiezione alla misura, diversa da una causa alternativa.`,
  trap: `La prima opzione è la più «ovvia» perché parla della settimana corta e del benessere, ma rafforza la conclusione (spiega perché la produttività potrebbe salire davvero). Le altre due sono dati di contesto che non toccano né la misura né il nesso.`,
  patt: 'Misura e definizione' },

/* ---------- 36 ---------- */
{ n: 36, area: 'DI', diff: 'media', lang: 'en', ds: true,
  stem: ds('In a class, is the average mark of all the students greater than 25.5?',
    'The average mark of the girls is 27 and the average mark of the boys is 24.',
    'There are more girls than boys in the class.'),
  ...dsq('BCDA', 'B', true),
  sol: `(1) alone: the class average is between 24 and 27, but where it falls depends on how many girls and boys there are: with 10 girls and 30 boys it is (270 + 720) ÷ 40 = 24.75 (no), with 30 girls and 10 boys it is (810 + 240) ÷ 40 = 26.25 (yes). (2) alone says nothing about the marks. Together: 25.5 is exactly the simple average of 24 and 27; with more girls the weighted average is pulled towards 27, so it is above 25.5 in every case.`,
  trap: `Taking the class average to be the simple average of the two group averages (25.5), or thinking that (1) is enough because 27 is larger than 24. The class average is weighted by the size of the groups; (2) provides the missing weights as an inequality, and for a yes/no question a bound is enough.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 37 ---------- */
{ n: 37, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Un numero intero positivo n, diviso per 4, dà resto 1 e, diviso per 7, dà resto 3. Qual è il resto della divisione di n per 28?`,
  opts: ['4', '17', '45', 'Il problema non ha una sola soluzione'], ans: 1,
  sol: `I numeri che divisi per 7 danno resto 3 sono 3, 10, 17, 24, …; tra questi, il primo che diviso per 4 dà resto 1 è 17 (17 = 4 · 4 + 1). Poiché 4 e 7 non hanno fattori in comune, le soluzioni sono tutte 17 + 28k (17, 45, 73, …): il resto della divisione per 28 è sempre 17.`,
  trap: `Il numero n non è unico (17, 45, 73, …) ed è facile rispondere «non ha una sola soluzione»; ma la domanda chiede il resto per 28, che è sempre lo stesso. 45 è un altro n valido, non un resto (maggiore di 28 non può esserlo). 4 è la somma dei resti 1 + 3.`,
  patt: 'Resti e congruenze' },

/* ---------- 38 ---------- */
{ n: 38, area: 'V', diff: 'media', lang: 'it',
  passage: `Tra il 1800 e il 1900 la popolazione dell'Inghilterra e del Galles passò da circa 9 a 32 milioni di abitanti, mentre la quota di popolazione residente nelle città con più di 20.000 abitanti salì dal 17% al 54%. Nello stesso periodo la quota di occupati in agricoltura scese da circa un terzo a meno di un decimo. Gli storici sottolineano che l'urbanizzazione non fu soltanto una conseguenza dell'industrializzazione: le campagne, dove la meccanizzazione riduceva il fabbisogno di braccianti, spinsero verso le città molti lavoratori anche prima che le fabbriche offrissero impieghi sufficienti. I salari reali dei lavoratori urbani cominciarono a crescere in modo apprezzabile solo dopo il 1840 circa; fino ad allora, secondo diverse stime, la crescita del prodotto per abitante superò quella dei salari.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  opts: [`Tra il 1800 e il 1900 la popolazione residente fuori dalle città con più di 20.000 abitanti è diminuita in termini assoluti.`,
         `L'urbanizzazione dell'Ottocento dipese esclusivamente dall'industrializzazione.`,
         `Prima del 1840 circa i salari reali dei lavoratori urbani diminuirono.`,
         `Nel 1900 gli abitanti delle città con più di 20.000 abitanti erano più di 17 milioni.`], ans: 3,
  sol: `Frasi chiave: «da circa 9 a 32 milioni di abitanti» e «salì dal 17% al 54%». Nel 1900 il 54% di 32 milioni è 17,28 milioni: più di 17 milioni. Le altre: fuori dalle grandi città vivevano 83% · 9 ≈ 7,5 milioni nel 1800 e 46% · 32 ≈ 14,7 milioni nel 1900, quindi la popolazione extraurbana è aumentata; il brano dice che l'urbanizzazione «non fu soltanto» una conseguenza dell'industrializzazione; i salari «cominciarono a crescere … solo dopo il 1840», il che non significa che prima siano diminuiti.`,
  trap: `Ragionare sulle quote come se fossero numeri: la quota rurale scende dall'83% al 46%, ma la popolazione totale è più che triplicata e quindi la popolazione rurale in assoluto sale. Il «17» del 1800 (quota) non è il «17 milioni» del 1900 (valore assoluto). Il salario che non cresce non è un salario che diminuisce.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 39 ---------- */
{ n: 39, area: 'DI', diff: 'difficile', lang: 'it',
  asset: dp([
    `Una biblioteca ha 5 sale di lettura.`,
    `Ogni sala ha almeno 20 posti e al massimo 40 posti.`,
    `In tutto le sale offrono 140 posti.`,
    `La sala più grande ha esattamente 40 posti.`
  ], [
    `A. Almeno due sale hanno 25 posti o più.`,
    `B. Almeno una sala ha esattamente 20 posti.`,
    `C. La sala più piccola ha al massimo 25 posti.`,
    `D. Esiste una sala con più di 30 e meno di 40 posti.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Solo la C', 'Sia la A sia la C', 'Sia la B sia la D'], ans: 2,
  sol: `Tolta la sala da 40, le altre quattro offrono 140 − 40 = 100 posti. A: se solo la sala da 40 avesse 25 posti o più, le altre quattro avrebbero al massimo 24 posti ciascuna, cioè 96 in tutto, meno di 100: dunque almeno un'altra sala ha 25 posti o più, vera. C: se anche la più piccola avesse almeno 26 posti, le altre quattro ne avrebbero almeno 104 > 100: dunque la più piccola ne ha al massimo 25, vera. B: (40; 25; 25; 25; 25) non ha sale da 20: non sicura. D: (40; 40; 20; 20; 20) non ha sale tra 30 e 40: non sicura.`,
  trap: `Cercare i valori esatti invece dei limiti: il minimo 20 e il massimo 40 sono confini, non valori che devono comparire. Per A e C si ragiona per assurdo sulla somma (100 posti da ripartire su quattro sale); per B e D basta un caso compatibile in cui sono false.`,
  patt: 'Consegna: sicuramente vera' },

/* ---------- 40 ---------- */
{ n: 40, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Due monete euro hanno un valore complessivo di 3 €. Una delle due non è una moneta da 2 €. Quali sono le due monete?`,
  opts: ['Una moneta da 2 € e una da 1 €',
         'Due monete da 1,50 €',
         'Il problema è impossibile: se una non è da 2 € non si arriva a 3 €',
         'Non è possibile determinarlo con i dati forniti'], ans: 0,
  sol: `Le monete euro sono da 1, 2, 5, 10, 20, 50 centesimi e da 1 € e 2 €. L'unica coppia che somma 3 € è 2 € + 1 €. «Una delle due non è da 2 €» è vera: è la moneta da 1 €, mentre l'altra può benissimo essere da 2 €.`,
  trap: `Leggere «una non è da 2 €» come «nessuna è da 2 €»: allora 3 € non si raggiungerebbe e il problema sembrerebbe impossibile. Dire che una non è da 2 € non significa che nessuna lo sia. Le monete da 1,50 € non esistono, e i dati bastano.`,
  patt: 'Ragionamento laterale' },

/* ---------- 41 ---------- */
{ n: 41, area: 'V', diff: 'difficile', lang: 'it',
  claim: `Secondo Bianchi, ogni volta che il salario minimo supera il livello di un mercato concorrenziale l'occupazione diminuisce.`,
  passage: `Secondo l'economista Bianchi, un aumento del salario minimo non provoca necessariamente una perdita di posti di lavoro. Nei mercati in cui poche imprese hanno un forte potere di acquisto sul lavoro (il cosiddetto monopsonio), un aumento moderato può addirittura far crescere l'occupazione; solo se il salario minimo supera il livello che si formerebbe in un mercato concorrenziale gli effetti sull'occupazione diventano negativi. Uno studio su 150 contee americane confinanti, che ha confrontato aree con salari minimi diversi, non ha rilevato differenze significative nell'occupazione dei ristoranti. Bianchi avverte però che l'esito dipende dalla dimensione dell'aumento e dalla situazione locale del mercato del lavoro, e che i risultati dello studio non possono essere estesi automaticamente ad altri settori. Il suo ragionamento parte dall'idea che, in un mercato perfettamente concorrenziale, le imprese pagano ogni lavoratore quanto vale il suo contributo.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «solo se il salario minimo supera il livello che si formerebbe in un mercato concorrenziale gli effetti sull'occupazione diventano negativi». «Solo se» indica una condizione necessaria: senza superare quel livello non ci sono effetti negativi. Non dice che superarlo basti: il brano aggiunge che «l'esito dipende dalla dimensione dell'aumento e dalla situazione locale». «Ogni volta … l'occupazione diminuisce» non è né confermato né smentito.`,
  trap: `Leggere «solo se» come «se e solo se»: l'implicazione va in un verso solo. Rispondere «vera» trasforma una condizione necessaria in sufficiente. Non è nemmeno «falsa»: il brano non dice che superare il livello lasci l'occupazione invariata.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 42 ---------- */
{ n: 42, area: 'DI', diff: 'difficile', lang: 'it', asset: tOrdini(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel canale Negozio il prodotto X ha ricevuto più ordini del prodotto Y.`,
         `Per il prodotto Y il canale Online ha raccolto il 40% degli ordini.`,
         `Per il prodotto Z gli ordini del canale Online sono la metà di quelli del canale Negozio.`,
         `Gli ordini telefonici sono più di un quinto degli ordini totali.`], ans: 3,
  sol: `Z: Negozio + Online = 90 − 20 = 70, in rapporto 4 : 3, quindi 40 e 30. Colonna Negozio: X + 100 + 40 = 220, X = 80. Riga X: 80 + 60 + ? = 180, Telefono = 40. Colonna Online: 60 + Y + 30 = 180, Y online = 90. Riga Y: 100 + 90 + ? = 240, Telefono = 50 (controllo della colonna Telefono: 40 + 50 + 20 = 110 ✓). Prima: 80 contro 100 (falsa). Seconda: 90 ÷ 240 = 37,5% (falsa). Terza: 30 contro 40, la metà sarebbe 20 (falsa). Quarta: 110 ÷ 510 ≈ 21,6% e un quinto è 102 (vera).`,
  trap: `Applicare il rapporto 4 : 3 a tutti i 90 ordini di Z invece che ai soli 70 di Negozio e Online (il Telefono è già noto: 20). Il 40% per Y è vicino al 37,5%, e «un quinto» è vicino al 21,6%: i confronti sono costruiti vicino alla soglia, bisogna calcolare.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 43 ---------- */
{ n: 43, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Tre soci si dividono gli utili di un anno: il primo prende un terzo del totale, il secondo i 3/8 di quel che resta dopo il primo e il terzo i rimanenti 25.000 €. A quanto ammontano gli utili totali?`,
  opts: ['75.000 €', '37.500 €', '60.000 €', '100.000 €'], ans: 2,
  sol: `Il primo prende 1/3 e restano 2/3. Il secondo prende 3/8 di 2/3 = 1/4 del totale. Al terzo restano 1 − 1/3 − 1/4 = 5/12, che valgono 25.000 €. Utili totali: 25.000 ÷ 5/12 = 60.000 €. (Controllo: primo 20.000, secondo 15.000, terzo 25.000.)`,
  trap: `Tre basi sbagliate: leggere i 25.000 € come un terzo del totale (75.000), come i 2/3 che restano dopo il primo (37.500) o come la quota 1/4 del secondo (100.000). I 3/8 si applicano al resto, non al totale.`,
  patt: 'Frazioni successive' },

/* ---------- 44 ---------- */
{ n: 44, area: 'V', diff: 'media', lang: 'it',
  passage: `Il direttore dell'ospedale San Rocco dichiara: «Grazie al nuovo protocollo di trattamento, la mortalità per infarto nel nostro ospedale è oggi la più bassa della regione». Il protocollo, introdotto due anni fa, prevede l'angioplastica entro 90 minuti dall'arrivo del paziente. Nel 2025 al San Rocco sono stati curati 400 pazienti colpiti da infarto e 24 sono deceduti, contro i 36 decessi su 450 pazienti del 2022. La regione ha otto ospedali con reparto di cardiologia, di dimensioni molto diverse tra loro: i più grandi trattano più di mille infarti l'anno, i più piccoli meno di cento. Il direttore precisa che la mortalità viene calcolata nello stesso modo in tutti gli ospedali, cioè come numero di decessi entro trenta giorni dal ricovero diviso per il numero di pazienti curati.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione del direttore?`,
  opts: [`Il numero assoluto di decessi per infarto avvenuti nel 2025 in ciascuno degli altri ospedali della regione.`,
         `Il tasso di mortalità per infarto (decessi su pazienti curati) del 2025 di ciascuno degli altri ospedali della regione.`,
         `Il costo del nuovo protocollo per ogni paziente curato.`,
         `La mortalità per infarto del San Rocco negli anni precedenti al 2022.`], ans: 1,
  sol: `La parola chiave è «la più bassa della regione»: la mortalità del San Rocco è 24 ÷ 400 = 6%, e per confermare o smentire serve il tasso di mortalità degli altri sette ospedali. Basta un ospedale con tasso inferiore al 6% per smentire il direttore. I decessi assoluti dipendono dalla dimensione dell'ospedale («dimensioni molto diverse»), non dalla qualità delle cure.`,
  trap: `Scegliere i decessi assoluti: un ospedale grande ne ha di più anche con un tasso basso (rapporti contro valori assoluti). La mortalità storica del San Rocco o il costo riguardano il «grazie al nuovo protocollo», non il confronto «la più bassa della regione» che l'affermazione propone.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 45 ---------- */
{ n: 45, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Con le sei cifre 0, 1, 2, 3, 4, 5, usate al massimo una volta ciascuna, quanti numeri di quattro cifre multipli di 5 si possono formare?`,
  opts: ['108', '120', '60', '96'], ans: 0,
  sol: `Un multiplo di 5 finisce con 0 o con 5. Finisce con 0: le prime tre cifre si scelgono tra 1, 2, 3, 4, 5 senza ripetizioni: 5 · 4 · 3 = 60. Finisce con 5: la prima cifra non può essere né 0 né 5, quindi 4 scelte (1–4); la seconda tra le 4 cifre rimaste (0 compreso): 4; la terza: 3. Sono 4 · 4 · 3 = 48. Totale: 60 + 48 = 108.`,
  trap: `Contare 60 anche per i numeri che finiscono con 5, permettendo lo 0 davanti (120); fermarsi a quelli che finiscono con 0 (60); raddoppiare i 48 (96). Lo zero ha due ruoli diversi: come ultima cifra va bene, come prima cifra no.`,
  patt: 'Combinatoria con vincolo' },

/* ---------- 46 ---------- */
{ n: 46, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Con 100 € Luca compra il maggior numero possibile di biglietti uguali per un concerto e ne compra esattamente 8. Quanto costa un biglietto?',
    'Il prezzo di un biglietto è un numero intero di euro.',
    'Il prezzo di un biglietto è superiore a 11,50 €.'),
  ...dsq('CDAB', 'A'),
  sol: `Il testo già dà una condizione: 8 biglietti costano al massimo 100 € e 9 costano più di 100 €. Con p il prezzo: 8p ≤ 100 e 9p > 100, cioè 11,11… < p ≤ 12,50. (1): l'unico intero in questo intervallo è 12, quindi p = 12 € e la (1) basta. (2): p > 11,50 lascia l'intervallo 11,50 < p ≤ 12,50 (per esempio 11,60 oppure 12): non basta.`,
  trap: `Giudicare insufficiente la (1) perché «gli interi sono tanti», senza usare la condizione del testo (il maggior numero possibile è 8) che restringe p a un intervallo di poco più di un euro. La (2) sembra più utile perché dà un numero con decimali, ma lascia infiniti valori.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 47 ---------- */
{ n: 47, area: 'V', diff: 'media', lang: 'it',
  passage: `Per finanziare l'aumento delle pensioni minime il governo di un Paese ha proposto di alzare di due punti percentuali l'aliquota IVA ordinaria, dal 20% al 22%, stimando un maggior gettito di 6 miliardi di euro l'anno. I critici osservano che l'IVA pesa in misura proporzionalmente maggiore sulle famiglie a basso reddito, che destinano ai consumi quasi tutto il reddito, mentre le famiglie ad alto reddito ne risparmiano una parte consistente. I sostenitori replicano che i beneficiari delle pensioni minime appartengono proprio alle famiglie con i redditi più bassi e che l'aumento non riguarda i beni alimentari di base, che restano all'aliquota ridotta del 4%. L'ufficio parlamentare di bilancio avverte che il gettito effettivo potrebbe risultare inferiore alle stime, se l'aumento dei prezzi riducesse i consumi.`,
  stem: `In base al brano, quale delle seguenti affermazioni è corretta?`,
  opts: [`Secondo i critici, l'IVA pesa in misura proporzionalmente maggiore sulle famiglie ad alto reddito, perché in valore assoluto consumano di più.`,
         `Secondo i sostenitori, l'aumento dell'aliquota riguarda anche i beni alimentari di base.`,
         `L'ufficio parlamentare di bilancio garantisce che il maggior gettito sarà di 6 miliardi di euro l'anno.`,
         `Un calo dei consumi causato dall'aumento dei prezzi potrebbe far scendere il gettito sotto la stima del governo.`], ans: 3,
  sol: `Frase chiave: «il gettito effettivo potrebbe risultare inferiore alle stime, se l'aumento dei prezzi riducesse i consumi». Le altre: i critici dicono che l'IVA pesa di più, in proporzione, sulle famiglie a basso reddito (causa invertita); i sostenitori dicono che i beni alimentari di base restano al 4% (ambito spostato); l'ufficio «avverte» che il gettito «potrebbe» essere inferiore, non garantisce nulla (assoluto).`,
  trap: `Le esche sono costruite sulle parole del brano: «proporzionalmente» sostituito da «in valore assoluto», «beni alimentari di base» spostato dal gruppo escluso a quello incluso, «potrebbe risultare inferiore» trasformato in «garantisce». L'unica opzione prudente («potrebbe») è anche l'unica compatibile con il testo.`,
  patt: 'Periodo o ambito spostato' },

/* ---------- 48 ---------- */
{ n: 48, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Due urne: la prima contiene 2 palline rosse e 3 blu, la seconda 4 rosse e 1 blu. Si lancia un dado: se esce 1 o 2 si pesca una pallina dalla prima urna, altrimenti dalla seconda. La pallina estratta è rossa. Qual è la probabilità che provenga dalla seconda urna?`,
  opts: [fr(2, 3), fr(4, 5), fr(8, 15), fr(1, 2)], ans: 1,
  sol: `P(prima urna) = 2/6 = 1/3 e P(seconda urna) = 2/3. P(rossa e seconda) = 2/3 · 4/5 = 8/15; P(rossa e prima) = 1/3 · 2/5 = 2/15; P(rossa) = 10/15. Sapendo che la pallina è rossa: P(seconda | rossa) = (8/15) ÷ (10/15) = 4/5.`,
  trap: `2/3 è la probabilità di partenza della seconda urna, che non tiene conto che la pallina è rossa. 8/15 è la probabilità che esca rossa dalla seconda urna, non divisa per la probabilità totale di rosso. 1/2 tratta le due urne come ugualmente probabili.`,
  patt: 'Probabilità condizionata' },

/* ---------- 49 ---------- */
{ n: 49, area: 'DI', diff: 'media', lang: 'it',
  asset: dp([
    `In un'azienda, tutti i dipendenti che lavorano da remoto hanno un portatile aziendale.`,
    `Nessun dipendente che ha il portatile aziendale riceve i buoni pasto.`,
    `Alcuni dipendenti ricevono i buoni pasto.`
  ], [
    `A. Alcuni dipendenti che ricevono i buoni pasto lavorano da remoto.`,
    `B. Tutti i dipendenti che ricevono i buoni pasto sono senza portatile aziendale.`,
    `C. Tutti i dipendenti senza portatile aziendale lavorano da remoto.`,
    `D. Alcuni dipendenti senza portatile aziendale non lavorano da remoto.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Sia la A sia la C', 'Solo la A', 'Sia la B sia la D', 'Solo la C'], ans: 0,
  sol: `Chi lavora da remoto ha il portatile (dato 1) e chi ha il portatile non riceve i buoni (dato 2): chi lavora da remoto non riceve i buoni, quindi A è sicuramente falsa. Chi riceve i buoni (esiste, dato 3) non ha il portatile e non lavora da remoto: perciò B è vera, D è vera (quei dipendenti sono senza portatile e non da remoto) e C è sicuramente falsa (quei dipendenti sono senza portatile ma non da remoto).`,
  trap: `Invertire l'implicazione del dato 1: «tutti i remoti hanno il portatile» non diventa «tutti i senza portatile sono remoti». Con la consegna «false» si rischia di indicare B e D, che sono le vere. Il dato 3 («alcuni ricevono i buoni») serve a garantire che esistano dipendenti senza portatile.`,
  patt: 'Consegna: sicuramente falsa' },

/* ---------- 50 ---------- */
{ n: 50, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Quanti numeri interi da 1 a 200 (estremi compresi) sono multipli di 3 oppure di 5, ma non di 15?`,
  opts: ['93', '53', '80', '106'], ans: 2,
  sol: `Multipli di 3: 66 (⌊200/3⌋); di 5: 40; di 15: 13. Multipli di 3 o di 5: 66 + 40 − 13 = 93, perché i multipli di 15 sono contati due volte. Togliendo i 13 multipli di 15: 80. (Controllo: solo multipli di 3, 66 − 13 = 53; solo multipli di 5, 40 − 13 = 27; 53 + 27 = 80.)`,
  trap: `Fermarsi a 93 dimentica «ma non di 15»; 106 = 66 + 40 conta due volte i multipli di 15; 53 considera solo i multipli di 3 non di 15 e scorda quelli di 5.`,
  patt: 'Insiemi sovrapposti' }
];

return {
  id: '15',
  title: 'Mock 15',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Quantitativa e Verbale più difficili del Mock 14: percentuali a più livelli, miscele, medie ponderate inverse, lavoro con cambio a metà, combinatoria con vincoli, brani da 120–200 parole con modali e opzioni quasi tutte plausibili. Data Insights allo stesso livello del Mock 14.',
  questions: QUESTIONS,
  data: DATA
};
});
