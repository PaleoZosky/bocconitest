/* =======================================================================
   Mock 23 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
   calibrate con guida-calibrazione-mock.md: livello del Mock 15 per
   Quantitativa e Verbale, del Mock 14 per Data Insights, ma con calcoli
   e testi più corti (tempo teorico stimato tra 85 e 88 minuti):
   Q con al massimo 3 passaggi, brani verbali da 80–150 parole, un solo
   grafico o una sola tabella per domanda (al massimo 6 righe × 5 colonne).

   Nelle domande di sufficienza dei dati i criteri sono fissi:
   A = una sola delle due affermazioni basta (l'altra, da sola, non basta),
   B = servono entrambe insieme, C = ciascuna basta da sola,
   D = servono altri dati; nella lista compaiono in ordine rimescolato
   (la lettera del criterio è scritta nel testo dell'opzione, la posizione
   A–D è quella del pulsante).

   Le domande sono scritte per area (Q, V, DI) e poi disposte in schermate
   da tre con ordine delle aree variabile (LAYOUT). Il campo `k` identifica
   la domanda per gli script di verifica (tools/check_math_23.py).
   La posizione della risposta giusta nelle domande a scelta libera è
   fissata nella tabella POS (bilanciamento della chiave).
   Tutti i numeri dei grafici e delle tabelle stanno in DATA.
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

/* posizione (0 = A) della risposta giusta nelle domande a scelta libera */
const POS = {
  'q-trenta': 2,
  'q-nuotatore': 0,
  'q-media-crediti': 3,
  'q-resto49': 1,
  'q-rappresentanti': 2,
  'q-cariche': 0,
  'q-merce': 1,
  'q-percorsi': 3,
  'q-fruttivendolo': 2,
  'q-produttivita': 0,
  'q-voti': 3,
  'q-impasto': 1,
  'q-giorni': 2,
  'q-quattro-numeri': 0,
  'q-candele': 3,
  'q-cifre': 1,
  'q-armadio': 2,
  'q-divisori': 0,
  'v-pil': 3,
  'v-pareggio': 1,
  'v-contenitori': 0,
  'v-turismo': 2,
  'v-smartworking': 1,
  'v-rimborso': 3,
  'v-affitti': 0,
  'v-ciclabile': 2,
  'v-tassa': 1,
  'v-mutuo': 3,
  'v-recensioni': 0,
  'd-comune': 2,
  'd-indice': 1,
  'd-canali': 3,
  'd-iscritti': 0
};

/* inserisce l'opzione giusta nella posizione fissata in POS tra le sbagliate */
function put(k, right, wrongs) {
  const pos = POS[k];
  if (pos === undefined) throw new Error('POS mancante per ' + k);
  const o = wrongs.slice(); o.splice(pos, 0, right); return { opts: o, ans: pos };
}

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
function dsq(order, giusta) {
  return { opts: order.split('').map(k => DSL[k]), ans: order.indexOf(giusta) };
}

/* ============================== DATI ============================== */
const DATA = {
  /* spesa di un comune per funzione (% del totale) e spesa per i trasporti (milioni di euro) */
  comune: { voci: [['Istruzione', 30], ['Sanità', 25], ['Trasporti', 20], ['Altri servizi', 25]], trasporti: 3, crescita: 20 },
  /* indice dei prezzi al consumo (base 2020 = 100) e costo di un paniere nel 2022 (euro) */
  indice: { anni: [2020, 2021, 2022, 2023, 2024], valori: [100, 104, 112, 120, 126], paniere: 280 },
  /* ricavi e costi (milioni di euro) di quattro divisioni */
  margini: { div: ['A', 'B', 'C', 'D'], ricavi: [200, 120, 300, 80], costi: [150, 80, 240, 60] },
  /* ricavi (migliaia di euro) di quattro linee di prodotto e quote di riga per canale */
  canali: { linee: ['Scarpe', 'Borse', 'Cinture', 'Sciarpe'], ricavi: [400, 300, 100, 200], neg: [40, 30, 60, 30], onl: [40, 50, 20, 30], gro: [20, 20, 20, 40] },
  /* iscritti a tre corsi in tre sedi; cella nascosta (null) da ricostruire con i totali */
  iscritti: { sedi: ['Milano', 'Roma', 'Torino'], A: [40, 20, 20], B: [30, null, 30], C: [50, 40, 30], totRiga: [120, 100, 80], totCol: [80, 100, 120, 300] },
  /* domande di brevetto presentate e concesse, per anno */
  brevetti: { anni: [2021, 2022, 2023, 2024, 2025], pres: [40, 52, 60, 65, 75], conc: [22, 26, 29, 34, 40] }
};

/* ======================= tabelle e grafici ======================= */
function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

function gComune() {
  const D = DATA.comune;
  return `<figure class="fig"><figcaption>Come un comune ripartisce la spesa di quest'anno</figcaption>` + C.pie({
    data: D.voci, title: 'Spesa',
    aria: 'Torta con le quote della spesa del comune: ' + D.voci.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `<p class="fig-note">Quest'anno la spesa per i Trasporti è di ${D.trasporti} milioni di euro.</p></figure>`;
}

function gIndice() {
  const D = DATA.indice;
  return `<figure class="fig"><figcaption>Indice dei prezzi al consumo di un Paese (base 2020 = 100)</figcaption>` + C.line({
    labels: D.anni,
    series: [{ name: 'Indice', values: D.valori }],
    lo: 95, hi: 130, gridFrom: 100, gridTo: 130, gridStep: 10, L: 46, R: 30, legend: false, title: 'indice',
    aria: 'Linea dell\'indice dei prezzi: ' + D.anni.map((a, i) => a + ' ' + D.valori[i]).join(', ') + '.'
  }) + `<p class="fig-note">Nel 2022 un paniere di beni costava ${D.paniere} €. Il costo del paniere varia come l'indice.</p></figure>`;
}

function gMargini() {
  const D = DATA.margini;
  return `<figure class="fig"><figcaption>Ricavi e costi di quattro divisioni, in milioni di euro</figcaption>` + C.bars({
    labels: D.div.map(n => 'Divisione ' + n),
    series: [{ name: 'Ricavi', values: D.ricavi }, { name: 'Costi', values: D.costi, style: 'outline' }], max: 340, legend: true,
    aria: 'Istogramma dei ricavi e dei costi delle divisioni: ' + D.div.map((n, i) => 'divisione ' + n + ' ricavi ' + D.ricavi[i] + ' e costi ' + D.costi[i]).join('; ') + '.'
  }) + `<p class="fig-note">L'utile di una divisione è la differenza tra ricavi e costi.</p></figure>`;
}

function tCanali() {
  const D = DATA.canali;
  return C.table({
    caption: 'Ricavi per linea di prodotto e ripartizione per canale di vendita',
    head: ['Linea', 'Ricavi (migliaia di €)', 'Negozi', 'Online', 'Grossisti'],
    rows: D.linee.map((l, i) => [l, D.ricavi[i], D.neg[i] + '%', D.onl[i] + '%', D.gro[i] + '%'])
  }) + `<p class="fig-note">Le percentuali sono le quote dei ricavi di ciascuna linea (ogni riga somma a 100%).</p>`;
}

function tIscritti() {
  const D = DATA.iscritti, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Iscritti a tre corsi, per sede',
    head: ['Sede', 'Corso A', 'Corso B', 'Corso C', 'Totale'],
    rows: D.sedi.map((s, i) => [s, D.A[i], c(D.B[i]), D.C[i], D.totRiga[i]]),
    foot: ['Totale'].concat(D.totCol)
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato.</p>`;
}

function tBrevetti() {
  const D = DATA.brevetti;
  return C.table({
    caption: 'Domande di brevetto presentate e concesse da un ufficio',
    head: ['Anno', 'Presentate', 'Concesse'],
    rows: D.anni.map((a, i) => [a, D.pres[i], D.conc[i]])
  });
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-trenta', diff: 'facile', lang: 'it',
  stem: `Un negozio ha venduto il 30% delle sue magliette: sono 45. Quante magliette gli restano da vendere?`,
  ...put('q-trenta', '105', ['150', '135', '90']),
  sol: `Se 45 sono il 30%, il totale è 45 ÷ 0,3 = 150 magliette; ne restano 150 − 45 = 105 (cioè il 70% di 150).`,
  trap: `150 è il totale, non le rimanenti; 135 = 3 · 45 e 90 = 2 · 45 sono moltiplicazioni a caso del dato; il 30% è la parte venduta, quindi il totale va ricavato dividendo, non moltiplicando.`,
  patt: 'Base della percentuale' },

{ k: 'q-nuotatore', diff: 'media', lang: 'it',
  stem: `Un nuotatore percorre in un canale 400 metri a favore di corrente in 4 minuti e li ripercorre controcorrente in 8 minuti. Qual è la velocità della corrente?`,
  ...put('q-nuotatore', '25 m/min', ['50 m/min', '75 m/min', '12,5 m/min']),
  sol: `A favore di corrente la velocità è 400 ÷ 4 = 100 m/min, controcorrente 400 ÷ 8 = 50 m/min. La prima è v + c, la seconda v − c: la differenza è 2c = 50, quindi c = 25 m/min (e v = 75 m/min).`,
  trap: `75 m/min è la velocità del nuotatore in acqua ferma (v), non della corrente; 50 m/min è la velocità controcorrente; 12,5 m/min divide per 2 due volte. La differenza tra le due velocità vale il doppio della corrente.`,
  patt: 'Lavoro e velocità' },

{ k: 'q-media-crediti', diff: 'media', lang: 'it',
  stem: `Uno studente ha sostenuto tre esami: 24 in un esame da 9 crediti, 27 in uno da 6 crediti e 30 in uno da 3 crediti. Qual è la sua media dei voti ponderata con i crediti?`,
  ...put('q-media-crediti', '26', ['27', '25,5', '26,5']),
  sol: `Somma dei voti pesati: 24 · 9 + 27 · 6 + 30 · 3 = 216 + 162 + 90 = 468. Crediti totali: 9 + 6 + 3 = 18. Media ponderata: 468 ÷ 18 = 26.`,
  trap: `27 è la media semplice dei tre voti: l'esame da 9 crediti, con il voto più basso, pesa il triplo di quello da 3 crediti, quindi la media si sposta verso il 24. 25,5 e 26,5 sono valori «a occhio» intorno al risultato.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-resto49', diff: 'difficile', lang: 'it',
  stem: `Qual è il più piccolo multiplo di 7 che, diviso per 2, per 3 e per 4, dà sempre resto 1?`,
  ...put('q-resto49', '49', ['13', '85', '133']),
  sol: `Se n dà resto 1 con 2, 3 e 4, allora n − 1 è multiplo del loro minimo comune multiplo, 12: n = 13, 25, 37, 49, 61, 73, 85, 97, 109, 121, 133 … Il primo multiplo di 7 di questa lista è 49 = 7 · 7.`,
  trap: `13 e 85 rispettano i resti (13 = 12 + 1, 85 = 84 + 1) ma non sono multipli di 7; 133 = 7 · 19 è anch'esso valido ma è il secondo, non il più piccolo.`,
  patt: 'Resti e congruenze' },

{ k: 'q-rappresentanti', diff: 'media', lang: 'it',
  stem: `In una classe di 10 studenti, 6 ragazze e 4 ragazzi, si scelgono a caso due persone diverse come rappresentante e vice. Qual è la probabilità che una sia una ragazza e l'altra un ragazzo (in qualsiasi ordine)?`,
  ...put('q-rappresentanti', fr(8, 15), [fr(12, 25), fr(4, 15), fr(1, 2)]),
  sol: `Prima una ragazza e poi un ragazzo: 6/10 · 4/9 = 24/90; prima un ragazzo e poi una ragazza: 4/10 · 6/9 = 24/90. In tutto 48/90 = 8/15.`,
  trap: `12/25 = 2 · 0,6 · 0,4 reinserisce la persona scelta (le due cariche vanno a persone diverse, quindi al secondo passo i candidati sono 9); 4/15 conta un solo ordine; 1/2 è un valore «a occhio» tra 0,48 e 0,53.`,
  patt: 'Probabilità senza reinserimento' },

{ k: 'q-cariche', diff: 'media', lang: 'it',
  stem: `Un'associazione di 6 soci deve eleggere un presidente, un segretario e due consiglieri (i due consiglieri non hanno ruoli distinti tra loro). Nessun socio può avere due cariche. In quanti modi diversi si può formare il gruppo dirigente?`,
  ...put('q-cariche', '180', ['360', '90', '720']),
  sol: `Presidente: 6 scelte; segretario: 5 scelte; i due consiglieri si scelgono tra i 4 rimasti senza ordine: 4 · 3 ÷ 2 = 6. In tutto 6 · 5 · 6 = 180.`,
  trap: `360 = 6 · 5 · 4 · 3 dà un ordine ai due consiglieri (ma «Anna e Bruno» è lo stesso consiglio di «Bruno e Anna»); 720 = 6! ordina tutti i soci; 90 divide per 2 anche dove l'ordine conta (presidente e segretario sono ruoli diversi).`,
  patt: 'Combinazioni vs permutazioni' },

{ k: 'q-merce', diff: 'media', lang: 'it',
  stem: `Un magazzino vende il 25% dell'intera scorta di merce a prezzo pieno; poi vende in saldo il 40% di quanto è rimasto. Restano 270 pezzi. Quanti pezzi c'erano all'inizio?`,
  ...put('q-merce', '600', ['450', '675', '900']),
  sol: `Dopo la prima vendita resta il 75% della scorta; dopo la seconda resta il 60% di quel 75%, cioè 0,75 · 0,6 = 0,45 della scorta. Dunque 270 ÷ 0,45 = 600.`,
  trap: `450 = 270 ÷ 0,6 ignora la prima vendita; 675 = 270 ÷ 0,4 prende il 40% come parte che resta (invece è la parte venduta); 900 = 270 ÷ 0,3 somma le due percentuali ma applica il 40% al totale. Il 40% si calcola sul resto, non sull'intera scorta.`,
  patt: 'Base della percentuale' },

{ k: 'q-percorsi', diff: 'difficile', lang: 'it',
  stem: `Una formica deve andare dall'angolo in basso a sinistra a quello in alto a destra di una griglia di strade formata da 4 isolati in orizzontale e 3 in verticale, muovendosi solo verso destra o verso l'alto. Deve passare per l'incrocio situato 2 isolati a destra e 1 in alto rispetto alla partenza. Quanti percorsi ha a disposizione?`,
  ...put('q-percorsi', '18', ['35', '12', '21']),
  sol: `Fino all'incrocio obbligato servono 2 passi a destra e 1 in alto: 3 ordini possibili. Dall'incrocio all'arrivo restano 2 passi a destra e 2 in alto: C(4,2) = 6 ordini. I percorsi sono 3 · 6 = 18.`,
  trap: `35 = C(7,3) conta tutti i percorsi, senza il passaggio obbligato; 12 = 3 · 4 e 21 = C(7,2) sono conteggi parziali. Un passaggio obbligato divide il percorso in due tratti, i cui numeri di ordini si moltiplicano.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-fruttivendolo', diff: 'media', lang: 'it',
  stem: `Un fruttivendolo compra 50 kg di mele a 1,20 € al kg. Il 10% delle mele è da buttare perché rovinato; le altre le vende a 2 € al kg. Qual è il suo guadagno?`,
  ...put('q-fruttivendolo', '30 €', ['40 €', '36 €', '45 €']),
  sol: `Costo: 50 · 1,20 = 60 €. Mele vendibili: 90% di 50 = 45 kg, che fruttano 45 · 2 = 90 €. Guadagno: 90 − 60 = 30 €.`,
  trap: `40 € = 100 − 60 ignora le mele buttate; 36 € = 90 − 54 calcola il costo solo sulle 45 kg vendute (le mele rovinate sono state comunque pagate); 45 € confonde i chilogrammi con gli euro.`,
  patt: 'Dati e passaggi' },

{ k: 'q-produttivita', diff: 'media', lang: 'it',
  stem: `La fabbrica A produce 120 pezzi in 8 ore con 5 operai; la fabbrica B ne produce 150 in 10 ore con 6 operai. Di quanto la produttività di A, misurata in pezzi per operaio all'ora, supera quella di B?`,
  ...put('q-produttivita', '20%', ['circa 17%', '0%', '25%']),
  sol: `A: 120 ÷ (5 · 8) = 3 pezzi per operaio all'ora. B: 150 ÷ (6 · 10) = 2,5 pezzi per operaio all'ora. A supera B di 0,5 su 2,5, cioè del 20% (3 ÷ 2,5 = 1,2).`,
  trap: `circa 17% è lo scarto diviso per la produttività di A (0,5 ÷ 3) invece che per quella di B, la base del confronto; 0% è il risultato di pezzi all'ora senza contare gli operai (15 e 15); 25% è un valore vicino senza calcolo. Nei rapporti le grandezze vanno divise entrambe, ore e operai.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-voti', diff: 'media', lang: 'it',
  stem: `In un'assemblea il rapporto tra voti favorevoli e contrari a una proposta è 5 a 3 (non ci sono astenuti). Se 40 votanti favorevoli avessero votato contro, favorevoli e contrari sarebbero stati in pari numero. Quanti hanno votato?`,
  ...put('q-voti', '320', ['200', '160', '400']),
  sol: `Favorevoli 5k e contrari 3k. Passando 40 voti dai favorevoli ai contrari: 5k − 40 = 3k + 40, quindi 2k = 80 e k = 40. I votanti sono 8k = 320 (200 favorevoli e 120 contrari).`,
  trap: `200 è il numero dei favorevoli e 160 quello dei favorevoli dopo lo spostamento; 400 si ottiene con k = 50. Lo spostamento di 40 voti cambia la differenza di 80 (non di 40), perché si toglie da una parte e si aggiunge all'altra.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-impasto', diff: 'media', lang: 'it',
  stem: `Un impasto di 1 kg è fatto per il 60% di farina e per il 30% di acqua; il resto è lievito e sale. In cottura evapora un terzo dell'acqua. Dopo la cottura, quale percentuale del peso del pane è farina?`,
  ...put('q-impasto', 'circa 67%', ['60%', 'circa 64%', 'circa 90%']),
  sol: `Farina: 600 g; acqua: 300 g, di cui 100 g evaporano. Il pane pesa 1.000 − 100 = 900 g e la farina è 600 ÷ 900 = 2/3, cioè circa 67%.`,
  trap: `60% è la quota prima della cottura (la base è cambiata); circa 64% = 600 ÷ 940 toglie il 20% dell'acqua invece di un terzo; circa 90% = 600 ÷ 667 toglie un terzo dell'intero peso invece che dell'acqua.`,
  patt: 'Base della percentuale' },

{ k: 'q-giorni', diff: 'difficile', lang: 'it',
  stem: `Oggi è lunedì. Che giorno della settimana sarà fra 2¹⁰ giorni (cioè fra 1.024 giorni)?`,
  ...put('q-giorni', 'Mercoledì', ['Martedì', 'Giovedì', 'Lunedì']),
  sol: `Il giorno dipende dal resto della divisione per 7. Poiché 2³ = 8 ha resto 1, 2⁹ = (2³)³ ha resto 1 e 2¹⁰ = 2⁹ · 2 ha resto 2. (Controllo: 1.024 = 7 · 146 + 2.) Due giorni dopo lunedì è mercoledì.`,
  trap: `Lunedì corrisponde a un resto 0 (esattamente settimane intere), che non è il caso: 1.024 non è un multiplo di 7. Martedì e giovedì sono scarti di un giorno rispetto al resto 2.`,
  patt: 'Resti e congruenze' },

{ k: 'q-quattro-numeri', diff: 'media', lang: 'it',
  stem: `Quattro numeri interi positivi, tutti diversi tra loro, hanno somma 10. Quanto vale il più grande?`,
  ...put('q-quattro-numeri', '4', ['5', '6', 'Non è determinabile']),
  sol: `Quattro interi positivi diversi hanno somma almeno 1 + 2 + 3 + 4 = 10. Poiché la somma è proprio 10, i numeri sono necessariamente 1, 2, 3 e 4 e il più grande è 4.`,
  trap: `«Non è determinabile» sembra naturale perché c'è un solo dato, ma il vincolo «tutti diversi» e «positivi» lascia una sola quaterna. Con numeri non vincolati (o non tutti diversi) la risposta sarebbe davvero ambigua. 5 e 6 corrispondono a somme maggiori di 10.`,
  patt: 'Sufficienza dei dati' },

{ k: 'q-candele', diff: 'media', lang: 'it',
  stem: `Due candele della stessa lunghezza vengono accese insieme: la prima si consuma completamente in 4 ore, la seconda in 6 ore (entrambe a velocità costante). Dopo quanto tempo la prima è lunga esattamente la metà della seconda?`,
  ...put('q-candele', '3 ore', ['2 ore', '2 ore e 30 minuti', '3 ore e 30 minuti']),
  sol: `Dopo t ore restano 1 − t/4 della prima e 1 − t/6 della seconda. La prima è la metà della seconda quando 1 − t/4 = (1 − t/6) ÷ 2, cioè 2 − t/2 = 1 − t/6, quindi 1 = t/3 e t = 3 ore. (Controllo: restano 1/4 e 1/2.)`,
  trap: `2 ore è la metà di 4 (la durata della prima); 2 ore e 30 minuti è la metà della durata media; 3 ore e 30 minuti è un valore vicino ma sbagliato. L'equazione va impostata sulle parti rimaste, non sul tempo.`,
  patt: 'Equazioni a parole' },

{ k: 'q-cifre', diff: 'media', lang: 'it',
  stem: `Un numero di due cifre è uguale a 4 volte la somma delle sue cifre. Se si scambiano le due cifre, si ottiene un numero maggiore del primo di 18. Qual è il numero?`,
  ...put('q-cifre', '24', ['12', '36', '48']),
  sol: `Con cifre a (decine) e b (unità): 10a + b = 4(a + b) dà 6a = 3b, cioè b = 2a. Scambiandole, 10b + a − (10a + b) = 9(b − a) = 18, quindi b − a = 2. Da b = 2a segue a = 2 e b = 4: il numero è 24 (controllo: 4 · 6 = 24 e 42 − 24 = 18).`,
  trap: `12, 36 e 48 rispettano la prima condizione (sono tutti uguali a 4 volte la somma delle cifre) ma non la seconda (le differenze con i numeri scambiati sono 9, 27 e 36). Vanno usate entrambe le condizioni.`,
  patt: 'Equazioni a parole' },

{ k: 'q-armadio', diff: 'media', lang: 'it',
  stem: `Un negozio ha in vetrina 3 camicie (bianca, azzurra, blu), 4 paia di pantaloni e 2 giacche (grigia e blu). Un cliente compone un abbigliamento con una camicia, un paio di pantaloni e una giacca, ma non vuole mai la camicia blu insieme alla giacca blu. Quanti abbigliamenti diversi può comporre?`,
  ...put('q-armadio', '20', ['24', '16', '12']),
  sol: `Senza vincoli: 3 · 4 · 2 = 24 abbigliamenti. Quelli vietati hanno camicia blu e giacca blu e uno dei 4 pantaloni: 1 · 4 · 1 = 4. Restano 24 − 4 = 20.`,
  trap: `24 ignora il vincolo; 16 = 24 − 8 toglie tutti gli abbigliamenti con la camicia blu (anche quelli con la giacca grigia, che sono ammessi); 12 dimezza il totale.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-divisori', diff: 'difficile', lang: 'it',
  stem: `Quanti numeri interi compresi tra 1 e 100 hanno esattamente tre divisori positivi?`,
  ...put('q-divisori', '4', ['5', '10', '25']),
  sol: `Un numero con esattamente tre divisori (1, un numero d e il numero stesso) è il quadrato di un numero primo: p² ha come divisori 1, p e p². Con p² ≤ 100 i primi possibili sono 2, 3, 5 e 7, quindi i numeri sono 4, 9, 25 e 49: sono 4.`,
  trap: `25 è il numero dei primi minori di 100 (non dei loro quadrati); 5 si ottiene contando anche 100 (che ha 9 divisori) o 121 (fuori intervallo); 10 conta anche i prodotti di due primi, che hanno quattro divisori.`,
  patt: 'Numeri e divisori' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-parcheggio', diff: 'media', lang: 'it',
  claim: `Chi lascia l'auto per cinque ore, in orario diurno, paga 7,50 euro.`,
  passage: `Il parcheggio interrato «Piazza Nuova» applica questa tariffa: 2 euro per la prima ora e 1,50 euro per ciascuna ora successiva (ogni ora iniziata si paga per intero), fino a un massimo di 15 euro al giorno. Dalle 22 alle 6 la sosta è gratuita. Gli abbonati mensili, che pagano 90 euro al mese, hanno il posto riservato e non pagano la sosta oraria. I veicoli elettrici in ricarica pagano la tariffa maggiorata del 20%, ma solo per il tempo di ricarica. Il parcheggio ha 240 posti distribuiti su tre piani.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «2 euro per la prima ora e 1,50 euro per ciascuna ora successiva». Cinque ore: 2 + 4 · 1,50 = 8 euro, non 7,50 (e il massimo giornaliero di 15 euro non viene toccato). L'affermazione è contraddetta.`,
  trap: `Applicare 1,50 euro a tutte e cinque le ore (5 · 1,50 = 7,50) dimenticando che la prima ora costa di più. Non è «non ricavabile»: la tariffa è esplicita e il calcolo è determinato.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-pil', diff: 'media', lang: 'it',
  passage: `Il prodotto interno lordo (PIL) misura il valore dei beni e dei servizi prodotti in un Paese in un anno. Il PIL nominale è calcolato ai prezzi correnti; il PIL reale è calcolato a prezzi costanti, cioè al netto dell'inflazione. Il PIL pro capite si ottiene dividendo il PIL per il numero di abitanti. Nel 2025 il PIL nominale di Altria è cresciuto del 6%, l'inflazione è stata del 4% e la popolazione è rimasta stabile. Nel 2024 il PIL nominale era pari a 500 miliardi di euro.`,
  stem: `In base al brano, quale delle seguenti affermazioni è corretta?`,
  ...put('v-pil', `Nel 2025 il PIL nominale è di 530 miliardi di euro e il PIL reale è cresciuto di circa il 2%.`,
    [`Nel 2025 il PIL reale è cresciuto di circa il 10%, somma della crescita nominale e dell'inflazione.`,
     `Nel 2025 il PIL pro capite reale è cresciuto del 6%, perché la popolazione è rimasta stabile.`,
     `Nel 2025 il PIL reale è diminuito, perché l'inflazione ha annullato la crescita nominale.`]),
  sol: `Frasi chiave: «il PIL reale è calcolato … al netto dell'inflazione» e «il PIL nominale … è cresciuto del 6%». Nominale: 500 · 1,06 = 530 miliardi. Reale: 1,06 ÷ 1,04 ≈ 1,019, cioè circa +2%. Con popolazione stabile anche il PIL pro capite reale cresce di circa 2%, non del 6%.`,
  trap: `Il 6% è la crescita nominale, non quella reale: l'inflazione si toglie (non si somma) e il 6% − 4% = 2% è, con buona approssimazione, la crescita reale. Dire che il PIL reale è diminuito scambia una crescita inferiore con un calo.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-pareggio', diff: 'difficile', lang: 'it',
  passage: `Un'impresa sostiene costi fissi, che non dipendono dalle unità prodotte, per 60.000 euro l'anno e costi variabili, che crescono con le unità prodotte, per 20 euro a unità. Ogni unità viene venduta a 30 euro. Si chiama margine unitario la differenza tra il prezzo di vendita e il costo variabile di un'unità, e punto di pareggio il numero di unità per cui i ricavi totali uguagliano i costi totali (fissi più variabili). Sotto il punto di pareggio l'impresa è in perdita, sopra è in utile. Nel 2025 ha venduto 9.000 unità.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put('v-pareggio', `Il punto di pareggio è di 2.000 unità, perché con 2.000 unità i ricavi (60.000 euro) coprono i costi fissi.`,
    [`Il margine unitario è di 10 euro.`,
     `Con 9.000 unità l'utile del 2025 è stato di 30.000 euro.`,
     `Con 3.000 unità l'impresa sarebbe stata in perdita di 30.000 euro.`]),
  sol: `Margine unitario: 30 − 20 = 10 euro (corretta). Utile con 9.000 unità: 9.000 · 10 − 60.000 = 30.000 euro (corretta). Con 3.000 unità: 3.000 · 10 − 60.000 = −30.000, cioè perdita di 30.000 euro (corretta). Il pareggio richiede che i ricavi uguaglino i costi totali, fissi più variabili: 10 · n = 60.000, cioè n = 6.000 unità. A 2.000 unità i ricavi coprono i soli costi fissi, ma non quelli variabili: affermazione sbagliata.`,
  trap: `Confrontare i ricavi con i soli costi fissi (60.000 ÷ 30 = 2.000 unità): ma ogni unità venduta costa anche 20 euro di costo variabile, quindi serve il margine unitario (10 euro), non il prezzo. Nelle domande «NON è corretta» le altre tre sono vere e vanno verificate.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-fabbrica', diff: 'media', lang: 'it',
  claim: `L'aumento della disoccupazione a Valmonte è stato causato dalla chiusura della fabbrica.`,
  passage: `A Valmonte la fabbrica di elettrodomestici ha chiuso a gennaio 2025, lasciando a casa 300 lavoratori. Nel corso dell'anno il tasso di disoccupazione del comune è salito dal 6% all'8%. Nello stesso periodo due negozi del centro hanno chiuso e il comune ha perso circa 400 abitanti, in gran parte giovani trasferiti altrove. Il sindaco ha annunciato un tavolo di confronto con la regione per attirare nuove imprese, ma non ha indicato scadenze. I dati sul lavoro sono stati pubblicati dall'ufficio statistico regionale.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «la fabbrica … ha chiuso a gennaio 2025» e «il tasso di disoccupazione … è salito dal 6% all'8%». Il brano riporta i due fatti e la loro successione, ma non afferma che il primo sia la causa del secondo (anche le altre chiusure e il calo di abitanti potrebbero contare). L'affermazione non è né confermata né smentita.`,
  trap: `Leggere la successione («a gennaio… nel corso dell'anno») come un nesso causale. Non è nemmeno «falsa»: il brano non esclude che la chiusura abbia contribuito.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-contenitori', diff: 'media', lang: 'it',
  passage: `Il comune di Cornavalle vuole portare la raccolta differenziata dal 55% al 65% e propone di distribuire gratuitamente un contenitore per l'umido a tutte le famiglie. Un assessore sostiene che la misura sarà sufficiente a raggiungere l'obiettivo. La spesa prevista è di 80.000 euro. Oggi l'umido è il punto debole: solo una famiglia su tre lo separa dal resto dei rifiuti. In passato il comune ha già distribuito sacchetti biodegradabili senza ottenere variazioni significative. Il comune ha circa 20.000 abitanti.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la tesi dell'assessore, secondo cui la distribuzione dei contenitori basterà per raggiungere il 65%?`,
  ...put('v-contenitori', `In due comuni molto simili a Cornavalle, la distribuzione gratuita dei contenitori ha portato la raccolta differenziata dal 55% al 67%.`,
    [`In tutti i comuni che hanno raggiunto il 65% di differenziata erano stati distribuiti contenitori gratuiti.`,
     `Il 90% delle famiglie di Cornavalle dichiara di gradire il contenitore per l'umido.`,
     `Il costo di un contenitore è inferiore a quello previsto dal comune.`]),
  sol: `La tesi dice che i contenitori sono una condizione sufficiente: basta distribuirli per arrivare al 65%. Due comuni molto simili in cui la distribuzione ha portato da 55% a 67% mostrano proprio che, in condizioni simili, il risultato si ottiene con quella sola misura.`,
  trap: `La seconda opzione è l'esca: dice che i contenitori sono stati presenti in tutti i comuni riusciti (condizione necessaria), ma non che bastino. Gradimento e costo non dicono nulla sull'effetto sulla differenziata.`,
  patt: 'Condizione sufficiente vs necessaria' },

{ k: 'v-turismo', diff: 'media', lang: 'it',
  passage: `Nel 2025 una località turistica ha registrato 800.000 presenze, di cui il 60% di turisti stranieri. Rispetto al 2024 le presenze di stranieri sono aumentate del 20%, mentre quelle degli italiani sono diminuite del 20%. Il 70% delle presenze si concentra tra giugno e settembre. I dati provengono dall'ufficio del turismo regionale, che conteggia come presenza ogni notte trascorsa in una struttura ricettiva da una persona. La località ha circa 5.000 abitanti ed è nota per i suoi sentieri di montagna.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-turismo', `Le presenze totali del 2025 sono state uguali a quelle del 2024.`,
    [`Le presenze totali del 2025 sono state inferiori a quelle del 2024.`,
     `Nel 2024 gli stranieri erano il 60% delle presenze.`,
     `Le presenze degli italiani sono diminuite di 20.000 unità.`]),
  sol: `2025: stranieri 60% di 800.000 = 480.000, italiani 320.000. Il +20% porta gli stranieri da 480.000 ÷ 1,2 = 400.000 (2024); il −20% porta gli italiani da 320.000 ÷ 0,8 = 400.000 (2024). Totale 2024: 800.000, uguale al 2025.`,
  trap: `Pensare che +20% e −20% si «compensino» o non si compensino in generale: dipende dalle basi. Qui le basi del 2024 sono uguali (400.000 e 400.000), quindi il totale non cambia. La variazione degli italiani è 80.000 (non 20.000) e gli stranieri nel 2024 erano il 50%.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-corso', diff: 'media', lang: 'it',
  claim: `Una studentessa con 36 crediti ottenuti nell'anno precedente, non beneficiaria di una borsa di mobilità, paga un corso di lingua di 500 euro e presenta la ricevuta in tempo: ottiene un rimborso di 200 euro.`,
  passage: `L'ateneo di Vallesino rimborsa agli studenti iscritti il 40% del costo di un corso di lingua frequentato in un'altra città, fino a un massimo di 300 euro all'anno. Il rimborso è riservato agli studenti che nell'anno accademico precedente hanno ottenuto almeno 30 crediti. Per riceverlo occorre presentare la ricevuta di pagamento entro il 15 dicembre. Gli studenti già beneficiari di una borsa di mobilità internazionale non possono richiedere il rimborso. Nel 2025 sono state accolte 420 domande, per un totale di 100.800 euro.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «rimborsa … il 40% del costo di un corso di lingua … fino a un massimo di 300 euro» e «almeno 30 crediti». La studentessa ha 36 crediti, non ha la borsa di mobilità e rispetta il termine: 40% di 500 = 200 euro, sotto il tetto di 300.`,
  trap: `Rispondere «non ricavabile» perché il brano non cita il corso da 500 euro, oppure cercare un ostacolo che non c'è (tutti i requisiti sono soddisfatti: crediti, borsa, termine). L'esempio concreto rientra nella regola generale.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-smartworking', diff: 'difficile', lang: 'it',
  passage: `Un'azienda di consulenza ha confrontato la produttività, misurata in fatture emesse per dipendente, di chi lavora da casa almeno tre giorni a settimana con quella di chi lavora sempre in ufficio: i primi hanno emesso in media il 15% di fatture in più. Il direttore ne conclude che il lavoro da casa aumenta la produttività e vuole estenderlo a tutti i 400 dipendenti. Il lavoro da casa è stato concesso su richiesta, previa approvazione del responsabile di area; ne hanno usufruito 120 dipendenti. L'azienda ha sedi a Milano e a Bologna.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del direttore?`,
  ...put('v-smartworking', `I responsabili di area hanno approvato il lavoro da casa soprattutto ai dipendenti che già in precedenza avevano risultati superiori alla media.`,
    [`Chi lavora da casa dichiara di essere più soddisfatto del proprio lavoro.`,
     `Il lavoro da casa fa risparmiare all'azienda parte dei costi per gli uffici.`,
     `Le sedi di Milano e di Bologna hanno uffici di dimensioni diverse.`]),
  sol: `La conclusione è causale: il lavoro da casa farebbe aumentare la produttività. Se il permesso è andato soprattutto a chi era già più produttivo, la differenza del 15% può essere la causa del permesso e non l'effetto (causalità inversa / selezione): non si può estendere a tutti.`,
  trap: `La soddisfazione dichiarata, il risparmio sugli uffici e le dimensioni delle sedi non toccano il nesso tra lavoro da casa e produttività (la prima, anzi, lo rafforza). Nei confronti tra «chi ha scelto» e «chi non ha scelto» conviene chiedersi chi ha deciso chi.`,
  patt: 'Cause alternative' },

{ k: 'v-rimborso', diff: 'difficile', lang: 'it',
  passage: `Dal regolamento di un'agenzia di viaggi. Il prezzo del viaggio non comprende l'assicurazione facoltativa, che si paga a parte e non è mai rimborsabile. Chi annulla almeno trenta giorni prima della partenza ottiene il rimborso integrale del prezzo. Tra trenta e dieci giorni prima, il rimborso è pari al 50% del prezzo. Meno di dieci giorni prima non è dovuto alcun rimborso, salvo che l'annullamento sia causato da malattia certificata, nel qual caso si applica il rimborso del 50%. Ogni rimborso inferiore al 100% è ridotto di una quota di gestione di 50 euro.`,
  stem: `Il signor Neri ha prenotato un viaggio dal prezzo di 1.200 euro e ha sottoscritto l'assicurazione facoltativa da 100 euro. Annulla otto giorni prima della partenza, per una malattia certificata. Quanto gli viene rimborsato?`,
  ...put('v-rimborso', '550 euro', ['600 euro', '650 euro', '0 euro']),
  sol: `Frasi chiave: «Meno di dieci giorni prima non è dovuto alcun rimborso, salvo … malattia certificata, nel qual caso si applica il rimborso del 50%» e «Ogni rimborso inferiore al 100% è ridotto di una quota di gestione di 50 euro». Rimborso: 50% di 1.200 = 600 euro, meno 50 euro di gestione = 550 euro; l'assicurazione non si rimborsa.`,
  trap: `600 euro dimentica la quota di gestione; 650 euro è il 50% di 1.300 (prezzo più assicurazione) senza la quota di gestione; 0 euro applica la regola dei meno di dieci giorni senza l'eccezione per malattia.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-affitti', diff: 'media', lang: 'it',
  passage: `Tra il 2020 e il 2025 il canone mensile medio di affitto in una città è passato da 600 a 690 euro, mentre il reddito mensile medio delle famiglie è aumentato del 10%. Un indicatore usato dagli economisti è l'incidenza del canone sul reddito, cioè la quota del reddito mensile spesa per l'affitto. Nel 2020 il reddito mensile medio era pari a 2.400 euro. Il comune ha dichiarato che il peso dell'affitto sulle famiglie «è rimasto sostanzialmente stabile», ma un'associazione di inquilini lo contesta.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-affitti', `Nel 2025 l'incidenza media del canone sul reddito è più alta che nel 2020.`,
    [`Tra il 2020 e il 2025 il canone medio è aumentato di 100 euro.`,
     `Nel 2025 l'incidenza media del canone sul reddito è del 25%, come nel 2020.`,
     `L'associazione degli inquilini ha dimostrato che la dichiarazione del comune è falsa.`]),
  sol: `Canone: +15% (da 600 a 690, cioè +90 euro). Incidenza 2020: 600 ÷ 2.400 = 25%. Reddito 2025: 2.400 · 1,10 = 2.640 euro; incidenza 2025: 690 ÷ 2.640 ≈ 26,1%. Il canone è cresciuto del 15% contro il 10% del reddito, quindi l'incidenza è salita.`,
  trap: `Pensare che «aumenta il reddito» significhi «invariata l'incidenza»; l'aumento del canone è +90 (non +100) euro; l'associazione «contesta» e non «dimostra». Rapporti e valori assoluti si muovono in modo diverso: conta se il numeratore cresce più del denominatore.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-trasporti', diff: 'media', lang: 'it',
  claim: `Un adulto che prende il mezzo 24 volte in un mese spende meno con i biglietti singoli che con l'abbonamento mensile.`,
  passage: `L'azienda di trasporti di Brenno vende il biglietto singolo a 1,50 euro, valido per 90 minuti dalla convalida, e l'abbonamento mensile a 36 euro; l'abbonamento annuale costa 330 euro. I ragazzi sotto i 14 anni viaggiano gratis, mentre gli studenti universitari pagano l'abbonamento mensile la metà. I biglietti acquistati a bordo costano 0,50 euro in più. L'azienda gestisce undici linee urbane e quattro extraurbane; nei giorni festivi il servizio è ridotto della metà. Le tessere elettroniche si ricaricano nelle tabaccherie convenzionate e nelle biglietterie automatiche delle stazioni.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «il biglietto singolo a 1,50 euro» e «l'abbonamento mensile a 36 euro». Ventiquattro corse con biglietti singoli costano 24 · 1,50 = 36 euro, esattamente quanto l'abbonamento: non si spende meno. L'affermazione è contraddetta.`,
  trap: `Pensare che «24 corse» sia già una soglia di convenienza: a pari costo non si risparmia (il risparmio comincerebbe dalla venticinquesima). Non è «non ricavabile»: i due prezzi sono esplicitati.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-ciclabile', diff: 'media', lang: 'it',
  passage: `Dopo l'apertura di una pista ciclabile sul viale principale, il numero di biciclette che lo percorrono ogni giorno è passato da 800 a 1.400 e il numero di incidenti con feriti è sceso da 30 a 21 all'anno. L'assessore alla mobilità ne conclude che la pista ha reso il viale più sicuro e propone di costruirne altre cinque in città. La pista è lunga 3 chilometri e ha richiesto lavori per sei mesi. Il viale è percorso ogni giorno da circa 12.000 veicoli.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione dell'assessore?`,
  ...put('v-ciclabile', `Nello stesso anno il limite di velocità sul viale è stato abbassato da 50 a 30 km/h, con controlli molto frequenti.`,
    [`Gli incidenti con feriti sono rimasti stabili in tutte le altre vie della città.`,
     `La pista è stata inaugurata dal sindaco con una festa molto partecipata.`,
     `Le biciclette che percorrono il viale sono quasi tutte di proprietà dei residenti.`]),
  sol: `La conclusione è causale: la pista ridurrebbe gli incidenti. Se nello stesso periodo il limite di velocità è stato abbassato con controlli frequenti, il calo da 30 a 21 ha una causa alternativa che spiega gli incidenti anche senza la pista.`,
  trap: `Incidenti stabili altrove rafforzano la conclusione (il calo è specifico del viale); festa e proprietà delle biciclette sono irrilevanti. In ogni domanda causale conviene chiedersi che cosa altro è cambiato nello stesso periodo.`,
  patt: 'Cause alternative' },

{ k: 'v-soci', diff: 'media', lang: 'it',
  claim: `Nel circolo i soci maschi con più di 50 anni sono più di 50.`,
  passage: `Un circolo sportivo ha 400 soci. Il 60% dei soci è di sesso maschile e il 25% dei soci maschi ha più di 50 anni. Tra le socie, il 10% ha più di 50 anni. La quota annuale è di 300 euro per gli adulti e di 150 euro per i soci di meno di 18 anni; il circolo organizza corsi di tennis, nuoto e pallavolo. L'assemblea dei soci si riunisce ogni anno in primavera ed elegge un consiglio di sette membri.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «Un circolo sportivo ha 400 soci. Il 60% dei soci è di sesso maschile e il 25% dei soci maschi ha più di 50 anni». Maschi: 60% di 400 = 240; con più di 50 anni: 25% di 240 = 60, che è più di 50. L'affermazione è vera.`,
  trap: `Applicare il 25% a 400 (100 soci) o il 10% delle socie, o dubitare perché mancano le socie: la domanda riguarda i soli maschi, già determinati. Non è «non ricavabile»: i dati bastano.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-tassa', diff: 'difficile', lang: 'it',
  passage: `Il comune di Sestri vuole introdurre una tassa di soggiorno di 2 euro a notte. L'assessore al bilancio sostiene che porterà circa 400.000 euro l'anno senza danneggiare il turismo, perché a Marinara, città vicina dove la tassa esiste dal 2022, le presenze sono rimaste stabili e le entrate comunali sono aumentate. A Sestri le presenze sono oggi 200.000 notti l'anno. Il comune ha circa 30.000 abitanti, 45 strutture ricettive e due musei; il periodo di maggiore affluenza va da giugno a settembre.`,
  stem: `Su quale assunzione si basa principalmente il ragionamento dell'assessore?`,
  ...put('v-tassa', `Sestri e Marinara sono abbastanza simili da far prevedere, a Sestri, una reazione dei turisti analoga a quella osservata a Marinara.`,
    [`Il turismo è la principale fonte di entrate del comune di Sestri.`,
     `I turisti conoscono l'importo della tassa prima di scegliere la destinazione.`,
     `Gli albergatori di Sestri sono favorevoli all'introduzione della tassa.`]),
  sol: `L'assessore passa da «a Marinara la tassa non ha ridotto le presenze» a «a Sestri non le ridurrà». Il passaggio regge solo se le due città sono simili (stesso tipo di turisti, stessa concorrenza): è l'assunzione implicita. Se i turisti di Sestri fossero più sensibili al prezzo, le presenze potrebbero calare.`,
  trap: `L'importanza del turismo, la conoscenza della tassa e il parere degli albergatori sono fatti collaterali: non sono necessari per trasferire il risultato da una città all'altra. L'assunzione si trova guardando che cosa farebbe saltare l'analogia.`,
  patt: 'Assunzione implicita' },

{ k: 'v-mutuo', diff: 'media', lang: 'it',
  passage: `Una famiglia ha acceso un mutuo a tasso fisso del 3% annuo, con rimborso in 20 anni; oggi il debito residuo è di 120.000 euro. La banca propone la «surroga», cioè il trasferimento del mutuo a un'altra banca che applica un tasso più basso, senza costi per il cliente: la nuova offerta è del 2,5% annuo. Il tasso fisso resta invariato per tutta la durata del mutuo, mentre il tasso variabile può cambiare nel tempo seguendo gli indici di mercato. Gli interessi annui si calcolano sul debito residuo a inizio anno.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-mutuo', `Nel primo anno gli interessi sul debito residuo sarebbero 3.600 euro al tasso del 3% e 3.000 euro al tasso del 2,5%.`,
    [`Con la surroga il mutuo verrà estinto prima di 20 anni, perché il tasso è più basso.`,
     `Nel primo anno gli interessi al tasso del 2,5% sarebbero 4.200 euro.`,
     `Il tasso fisso del 3% è il più conveniente perché non cambia mai.`]),
  sol: `Frase chiave: «Gli interessi annui si calcolano sul debito residuo a inizio anno». Al 3%: 120.000 · 0,03 = 3.600 euro; al 2,5%: 120.000 · 0,025 = 3.000 euro (corretta). La durata non è citata come modificabile; 4.200 euro sarebbe il 3,5%; la convenienza di un tasso fisso dipende dal confronto con quello nuovo (2,5%).`,
  trap: `Dedurre una durata più breve da un tasso più basso (il brano non la modifica); confondere la stabilità del tasso fisso con la sua convenienza (qui è la nuova offerta, a tasso più basso, a costare meno).`,
  patt: 'Dati e passaggi' },

{ k: 'v-recensioni', diff: 'media', lang: 'it',
  passage: `Un ristorante afferma sul proprio sito: «Da quando è arrivato il nuovo chef, i clienti sono più soddisfatti: il voto medio nelle recensioni online è passato da 4,0 a 4,4 su 5». Le recensioni sono scritte volontariamente dai clienti su una piattaforma pubblica. Il nuovo chef è arrivato a marzo 2025; prima del suo arrivo erano state pubblicate 120 recensioni, dopo ne sono state pubblicate 90. Il ristorante ha 60 coperti, si trova in centro a pochi passi dalla stazione ed è aperto sei giorni su sette.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione del ristorante?`,
  ...put('v-recensioni', `Quale quota dei clienti ha scritto una recensione prima e dopo l'arrivo dello chef, e se a scriverla sono clienti dello stesso tipo.`,
    [`Il numero di coperti a disposizione del ristorante.`,
     `Il giorno di chiusura settimanale del ristorante.`,
     `Il numero di piatti presenti nel menù.`]),
  sol: `L'affermazione trasforma il voto medio delle recensioni volontarie in una misura della soddisfazione di tutti i clienti. Se prima scrivevano soprattutto i clienti scontenti e dopo i soddisfatti (o viceversa), la media cambia senza che la soddisfazione cambi: la quota e il tipo di chi recensisce verificano l'inferenza.`,
  trap: `Coperti, giorno di chiusura e numero di piatti non misurano chi scrive le recensioni né la soddisfazione. Le recensioni volontarie sono un campione autoselezionato: la media può riflettere chi decide di scrivere.`,
  patt: 'Dato mancante' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-mcm', diff: 'media', lang: 'it', ds: true,
  stem: ds('Sia n un intero positivo. È vero che n è multiplo di 24?',
    'n è multiplo di 8 e di 6.',
    'n è multiplo di 12 e di 8.'),
  ...dsq('CADB', 'C'),
  sol: `(1): se n è multiplo di 8 e di 6 è multiplo del loro minimo comune multiplo, mcm(8, 6) = 24: la risposta è sì. (2): mcm(12, 8) = 24, quindi anche qui n è multiplo di 24 e la risposta è sì. Ciascuna affermazione, da sola, basta.`,
  trap: `Pensare che «multiplo di 8 e di 6» richieda il prodotto 48 e quindi non garantisca 24: serve il minimo comune multiplo, non il prodotto. Si può anche cadere nell'errore opposto (che due multipli bastino sempre): per esempio «multiplo di 4 e di 6» darebbe solo 12.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-nuoto', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('In una palestra il 40% dei clienti è iscritto al corso di nuoto. Quale percentuale degli iscritti al corso di nuoto è di sesso maschile?',
    'Il 60% dei clienti della palestra è di sesso maschile.',
    'Il 50% dei clienti maschi è iscritto al corso di nuoto.'),
  ...dsq('ADBC', 'B'),
  sol: `(1) da sola dà il numero dei maschi ma non quanti sono iscritti al nuoto; (2) da sola dà la quota di maschi iscritti ma non quanti maschi ci sono. Insieme, su 100 clienti: 60 maschi, di cui il 50% = 30 iscritti al nuoto; gli iscritti al nuoto sono 40, quindi la percentuale cercata è 30 ÷ 40 = 75%.`,
  trap: `Credere che una delle due basti perché contiene una percentuale: ognuna descrive solo un pezzo della tabella 2 × 2 (sesso × nuoto). Dopo averle unite, dividere 30 per 100 (30%) invece che per i 40 iscritti.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-bar', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Ogni cliente di un bar ordina almeno una bevanda.`,
    `Chi ordina un cornetto ordina anche un caffè.`,
    `Nessuno che ordina un tè ordina un caffè.`
  ], [
    `A. Nessun cliente che ordina un tè ordina un cornetto.`,
    `B. Chi ordina un caffè ordina anche un cornetto.`,
    `C. Chi non ordina un caffè ordina un tè.`,
    `D. Chi ordina un cornetto ordina almeno una bevanda.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la A sia la D', 'Sia la B sia la C', 'Sia la C sia la D'], ans: 1,
  sol: `A: chi ordina un cornetto ordina un caffè; chi ordina un tè non ordina un caffè; quindi chi ordina un tè non ordina un cornetto (vera). D: ogni cliente ordina almeno una bevanda, anche chi ordina un cornetto (vera). B inverte il secondo dato: si può ordinare un caffè senza il cornetto. C: chi non prende il caffè potrebbe prendere un'altra bevanda (acqua, succo): non è sicura.`,
  trap: `B e C sono implicazioni inverse o «per esclusione» non giustificate: dal secondo dato non segue il contrario, e «almeno una bevanda» non vuol dire «caffè o tè». La D è la più banale e si tende a trascurarla.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-comune', diff: 'media', lang: 'it', asset: gComune(),
  stem: `Il prossimo anno la spesa totale del comune aumenterà del ${DATA.comune.crescita}%, mentre la quota della sanità resterà invariata. Quanto spenderà il comune per la sanità il prossimo anno?`,
  ...put('d-comune', '4,5 milioni di euro', ['3,75 milioni di euro', '5,4 milioni di euro', '3,6 milioni di euro']),
  sol: `I Trasporti valgono il 20% della spesa: 3 ÷ 0,2 = 15 milioni di spesa totale quest'anno. Il prossimo anno la spesa sarà 15 · 1,2 = 18 milioni e la sanità, al 25%, costerà 18 · 0,25 = 4,5 milioni di euro.`,
  trap: `3,75 milioni = 25% di 15 dimentica l'aumento; 5,4 milioni = 30% di 18 usa la quota dell'istruzione; 3,6 milioni = 3 · 1,2 applica l'aumento alla spesa per i trasporti. Il totale va ricostruito dalla fetta nota (20%), non preso per 3.`,
  patt: 'Base della percentuale' },

{ k: 'd-cartoleria', diff: 'media', lang: 'it', ds: true,
  stem: ds('Una cartoleria ha venduto in una giornata 20 articoli tra quaderni (2 € l\'uno) e penne (3 € l\'una). Quanti quaderni ha venduto?',
    'L\'incasso della giornata è compreso tra 45 € e 55 €.',
    'Ha venduto più penne che quaderni.'),
  ...dsq('BCAD', 'D'),
  sol: `Se q sono i quaderni, le penne sono 20 − q e l'incasso è 2q + 3(20 − q) = 60 − q. (1): 45 ≤ 60 − q ≤ 55 dà 5 ≤ q ≤ 15 (molti valori). (2): penne > quaderni significa q < 10 (molti valori). Insieme: 5 ≤ q ≤ 9, cioè cinque valori possibili. Servono altri dati.`,
  trap: `Pensare che un intervallo di incasso, unito a un confronto, fissi il numero (due condizioni «vincolano» ma non sempre bastano). Per essere sicuri bisogna esibire due valori compatibili con tutte e due le informazioni (per esempio 6 e 8 quaderni).`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-indice', diff: 'difficile', lang: 'it', asset: gIndice(),
  stem: `Quanto costa lo stesso paniere di beni nel 2024?`,
  ...put('d-indice', '315 €', ['294 €', 'circa 319 €', 'circa 353 €']),
  sol: `L'indice ha base 2020 = 100: dal 2022 (112) al 2024 (126) i prezzi sono saliti di 126 ÷ 112 = 1,125, cioè +12,5%. Il paniere costa 280 · 1,125 = 315 €.`,
  trap: `294 € aggiunge 14 € (la differenza in punti di indice) come se fossero euro; circa 319 € applica +14% (14 punti) a una base che non è 100; circa 353 € applica +26% (126 − 100), cioè la crescita dal 2020 e non dal 2022. Un indice si legge come rapporto tra due valori, non come differenza di punti.`,
  patt: 'Percentuali composte' },

{ k: 'd-tappe', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Un percorso di 90 km è diviso in tre tappe.`,
    `La terza tappa misura 20 km ed è più corta delle altre due.`,
    `La seconda tappa è più lunga della prima.`
  ], [
    `A. La prima tappa misura meno di 35 km.`,
    `B. La seconda tappa misura 50 km o più.`,
    `C. La seconda tappa misura più di 40 km.`,
    `D. La prima tappa misura 20 km o meno.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la B', 'Sia la A sia la C', 'Sia la B sia la D', 'Sia la C sia la D'], ans: 2,
  sol: `Prima e seconda tappa sommano 90 − 20 = 70 km. La prima è più lunga della terza, quindi misura più di 20 km (D falsa); la seconda è più lunga della prima, quindi più di 35 km; essendo 70 − (prima) con prima > 20, la seconda è sotto 50 km (B falsa). La prima è sotto 35 km (A vera). La seconda sta tra 35 e 50 km: C può essere vera o falsa.`,
  trap: `Con la consegna «false» non vanno indicate la A (vera) e la C (non decisa). La B e la D si ottengono dai limiti: se la prima supera 20, la seconda sta sotto 70 − 20 = 50; «20 km o meno» è esclusa dal confronto con la terza.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-canali', diff: 'media', lang: 'it', asset: tCanali(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-canali', `Nel complesso le vendite online superano quelle dei negozi.`,
    [`Per le sciarpe le vendite nei negozi sono inferiori a quelle delle cinture.`,
     `I grossisti assorbono un quinto dei ricavi complessivi.`,
     `Le vendite online delle borse sono superiori a quelle delle scarpe.`]),
  sol: `Le quote sono di riga: servono i ricavi di ciascuna linea. Negozi: 160 + 90 + 60 + 60 = 370; online: 160 + 150 + 20 + 60 = 390; grossisti: 80 + 60 + 20 + 80 = 240 (su 1.000). Online (390) supera negozi (370): vera. Sciarpe nei negozi: 30% di 200 = 60, cinture: 60% di 100 = 60: uguali, non inferiori (falsa). Grossisti: 24%, non un quinto (falsa). Borse online: 150, scarpe online: 160 (falsa).`,
  trap: `Confrontare le percentuali (30% contro 60%) invece dei valori: le linee hanno ricavi diversi (200 contro 100) e le due vendite sono uguali. Il 24% dei grossisti è vicino al 20%.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-dipendenti', diff: 'media', lang: 'it', ds: true,
  stem: ds('In un\'azienda di 200 dipendenti, è vero che le donne sono più di 80?',
    'Gli uomini sono almeno il 62% dei dipendenti.',
    'Le donne sono più di 60.'),
  ...dsq('DBCA', 'A'),
  sol: `(1): uomini ≥ 62% di 200 = 124, quindi le donne sono al massimo 200 − 124 = 76, meno di 80: la risposta è sempre «no», quindi la (1) basta. (2): donne > 60 è compatibile con 70 (no) e con 90 (sì): non basta.`,
  trap: `Pensare che la (1) non basti perché non dà il numero esatto delle donne: per una domanda sì/no basta un limite, anche se la risposta è «no». Pensare che la (2) basti perché 60 «è vicino» a 80.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-iscritti', diff: 'difficile', lang: 'it', asset: tIscritti(),
  stem: `Quale percentuale degli iscritti al corso B frequenta la sede di Roma?`,
  ...put('d-iscritti', '40%', ['circa 33%', '30%', '45%']),
  sol: `Il dato mancante si ricava con i totali: il corso B ha 100 iscritti in tutto, di cui 30 a Milano e 30 a Torino, quindi a Roma ce ne sono 100 − 30 − 30 = 40 (la riga di Roma dà lo stesso: 100 − 20 − 40 = 40). Percentuale: 40 ÷ 100 = 40%.`,
  trap: `circa 33% è la quota di Roma sul totale degli iscritti (100 ÷ 300), non sul corso B; 30% è la quota di Milano (e di Torino) sul corso B; 45% è un valore «a occhio».`,
  patt: 'Dati e passaggi' },

{ k: 'd-lavoro', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `In un'azienda lavorano 120 persone.`,
    `Il rapporto tra uomini e donne è 3 a 2.`,
    `Il 25% degli uomini lavora part-time.`
  ], [
    `A. Le donne sono 48.`,
    `B. Gli uomini che lavorano part-time sono 18.`,
    `C. Le donne che lavorano part-time sono meno degli uomini che lavorano part-time.`,
    `D. Gli uomini che lavorano a tempo pieno sono 60.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la B sia la C', 'Sia la A sia la B', 'Sia la C sia la D'], ans: 2,
  sol: `Uomini e donne stanno nel rapporto 3 : 2 su 120: 72 uomini e 48 donne (A vera). Gli uomini part-time sono il 25% di 72 = 18 (B vera). Di conseguenza gli uomini a tempo pieno sono 72 − 18 = 54, non 60 (D falsa). Le donne part-time non sono note (C non sicura).`,
  trap: `Il rapporto 3 a 2 non dà direttamente le persone: vanno divise 120 in 5 parti da 24. Il 25% si applica agli uomini (72), non a tutti. La C non è sicura perché il dato sul part-time riguarda solo gli uomini.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-margini', diff: 'media', lang: 'it', asset: gMargini(),
  stem: `In quale divisione l'utile rappresenta la quota più alta dei ricavi?`,
  opts: ['Divisione A', 'Divisione B', 'Divisione C', 'Divisione D'], ans: 1,
  sol: `Utile e quota sui ricavi: A 200 − 150 = 50, cioè 25%; B 120 − 80 = 40, cioè 40 ÷ 120 = 1/3 (circa 33%); C 300 − 240 = 60, cioè 20%; D 80 − 60 = 20, cioè 25%. La quota più alta è quella della divisione B.`,
  trap: `La divisione C ha l'utile più alto in valore assoluto (60) ma la quota più bassa (20%); A e D hanno la stessa quota (25%) con utili molto diversi. La domanda chiede un rapporto, non una differenza.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-giardino', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Nel giardino ogni albero è un melo o un pero.`,
    `Alcuni peri sono alti.`,
    `Nessun melo è alto.`
  ], [
    `A. Alcuni meli non sono alti.`,
    `B. Esiste un melo alto.`,
    `C. Tutti gli alberi alti sono peri.`,
    `D. Nessun pero è alto.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la A', 'Sia la A sia la C', 'Sia la B sia la D', 'Sia la C sia la D'], ans: 2,
  sol: `B contraddice il terzo dato («nessun melo è alto»): sicuramente falsa. D contraddice il secondo («alcuni peri sono alti»): sicuramente falsa. C è vera: un albero alto non è un melo, quindi è un pero. A non è decisa: tutti i meli (se ci sono) non sono alti, ma i dati non dicono che nel giardino ci sia almeno un melo.`,
  trap: `Scegliere A perché «nessun melo è alto» sembra renderla vera o falsa: un'affermazione con «alcuni» richiede che esista almeno un melo, e i dati non lo garantiscono. La C è vera, quindi con la consegna «false» non va indicata.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-classe', diff: 'media', lang: 'it', ds: true,
  stem: ds('In una classe di 20 studenti la media dei voti è 7. Qual è la media dei voti dei maschi?',
    'Le studentesse sono 12.',
    'La media dei voti delle studentesse è 6,5.'),
  ...dsq('CBAD', 'B'),
  sol: `(1) da sola dà il numero di maschi (8) ma non la media delle femmine; (2) da sola dà la media delle femmine ma non quante siano. Insieme: i voti totali sono 20 · 7 = 140; le femmine (12) totalizzano 12 · 6,5 = 78; i maschi (8) totalizzano 140 − 78 = 62 e la loro media è 62 ÷ 8 = 7,75.`,
  trap: `Pensare che la (2) basti perché «la media è 7 e quella delle femmine è 6,5, quindi i maschi hanno 7,5»: è la media semplice, vera solo se maschi e femmine fossero in ugual numero. Servono i pesi (12 contro 8).`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-brevetti', diff: 'media', lang: 'it', asset: tBrevetti(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel 2025 le domande presentate sono più del doppio di quelle del 2021.`,
         `In ogni anno le domande concesse sono almeno la metà di quelle presentate.`,
         `Tra il 2021 e il 2025 le domande concesse sono cresciute, in percentuale, più di quelle presentate.`,
         `Nessuna delle altre risposte è corretta.`], ans: 3,
  sol: `Prima: il doppio di 40 è 80, e nel 2025 le presentate sono 75 (falsa). Seconda: nel 2023 la metà di 60 è 30, ma le concesse sono 29 (falsa). Terza: presentate da 40 a 75 sono +87,5%, concesse da 22 a 40 sono +81,8% (falsa). Le prime tre sono false: è corretta «Nessuna delle altre».`,
  trap: `75 è vicino a 80 e 29 è vicino a 30: bastano pochi decimali per smentire. Nella terza, 40 − 22 = 18 è un aumento assoluto vicino a 35 (75 − 40) diviso 2, ma il confronto va fatto in percentuale. «Nessuna delle altre» è qui la risposta giusta.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-cerchio', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('È vero che l\'area di un cerchio è maggiore di 100 cm²?',
    'Il diametro del cerchio misura più di 12 cm.',
    'La circonferenza del cerchio misura meno di 40 cm.'),
  ...dsq('BADC', 'A'),
  sol: `(1): d > 12 significa raggio > 6, quindi area = π · r² > 3 · 36 = 108 cm², maggiore di 100: la risposta è sempre «sì» e la (1) basta. (2): circonferenza < 40 significa raggio < 40 ÷ (2π) ≈ 6,4 cm; con raggio 6 l'area è circa 113 cm² (sì), con raggio 5 è circa 78,5 cm² (no): non basta.`,
  trap: `Pensare che un limite sulla circonferenza «stringa» l'area: ma è un tetto (massimo) e la domanda chiede se l'area supera una soglia, quindi serve un minimo, come nella (1). Anche per la (1) basta il limite, senza conoscere il valore esatto.`,
  patt: 'Sufficienza dei dati' }
];

/* ================ DISPOSIZIONE IN SCHERMATE DA TRE ================ */
const ROT = ['VQD', 'DVQ', 'QDV', 'VDQ', 'DQV', 'QVD'];
const LAYOUT = [];
for (let s = 0; s < 16; s++) ROT[s % 6].split('').forEach(a => LAYOUT.push(a));
LAYOUT.push('Q', 'Q');

const POOL = { Q: Q.slice(), V: V.slice(), D: DI.slice() };
const AREA = { Q: 'Q', V: 'V', D: 'DI' };
const QUESTIONS = LAYOUT.map((a, i) => {
  const q = POOL[a].shift();
  return Object.assign({ n: i + 1, area: AREA[a] }, q);
});

return {
  id: '23',
  title: 'Mock 23',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Tutto in italiano, livello del Mock 15 ma con calcoli e testi più corti (tempo teorico stimato: circa 86 minuti): velocità media e corrente, resti e cicli, percorsi con passaggio obbligato, medie ponderate, brani da 80–150 parole con modali. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false», sufficienza dei dati e tabelle con quote di riga e celle mancanti.',
  questions: QUESTIONS,
  data: DATA
};
});
