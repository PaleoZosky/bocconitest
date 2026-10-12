/* =======================================================================
   Mock 26 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
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
   la domanda per gli script di verifica (tools/check_math_26.py).
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
  'q-visitatori': 0,
  'q-vernice': 2,
  'q-biglie': 1,
  'q-buste': 3,
  'q-algebra': 2,
  'q-monete': 0,
  'q-potenze': 1,
  'q-fattoria': 3,
  'q-led': 0,
  'q-cifre': 2,
  'q-foglio': 1,
  'q-somma-prodotto': 0,
  'q-assoluto': 2,
  'q-indice': 3,
  'q-lampioni': 1,
  'q-treni': 0,
  'q-calendario': 2,
  'q-camicie': 3,
  'v-pil': 1,
  'v-deficit': 2,
  'v-aeroporto': 0,
  'v-liceo': 3,
  'v-lavoro': 0,
  'v-abbonamento': 1,
  'v-rivista': 3,
  'v-autobus': 2,
  'v-caschi': 3,
  'v-biblioteca': 1,
  'v-ristorante': 2,
  'd-produzione': 1,
  'd-marche': 3,
  'd-pezzi': 2,
  'd-appelli': 0,
  'd-prodotti': 1,
  'd-corsi': 3
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
  /* ore lavorate e pezzi prodotti in cinque mesi */
  produzione: { mesi: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag'], ore: [100, 120, 150, 160, 200], pezzi: [500, 720, 750, 880, 1000] },
  /* quote di mercato (%) e mercato totale (milioni di pezzi) */
  marche: { voci: [['Marca X', 35], ['Marca Y', 25], ['Altre marche', 40]], totale: 2 },
  /* pezzi venduti (migliaia) per trimestre, prezzi e costo unitario (euro) */
  pezzi: { trimestri: ['T1', 'T2', 'T3', 'T4'], venduti: [30, 50, 40, 60], prezzoPrimi: 20, prezzoUltimi: 25, costo: 14 },
  /* esame: promossi e voto medio per appello */
  appelli: { nomi: ['Gennaio', 'Giugno', 'Settembre'], promossi: [20, 60, 20], voto: [24, 26, 22] },
  /* vendite (migliaia di pezzi) di quattro prodotti */
  prodotti: { nomi: ['A', 'B', 'C', 'D'], y23: [42, 90, 31, 20], y24: [46, 88, 45, 25], y25: [50, 84, 60, 31] },
  /* iscritti ai corsi di lingua per livello; cella nascosta (null) da ricostruire con i totali */
  corsi: { lingue: ['Inglese', 'Francese', 'Tedesco'], princ: [50, 20, 10], interm: [40, 25, null], avanz: [30, 15, 10], totRiga: [120, 60, 40], totCol: [80, 85, 55, 220] }
};

/* ======================= tabelle e grafici ======================= */
function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

function gProduzione() {
  const D = DATA.produzione;
  return `<figure class="fig"><figcaption>Ore lavorate e pezzi prodotti in un reparto, mese per mese</figcaption>` + C.line({
    labels: D.mesi,
    series: [{ name: 'Ore lavorate', values: D.ore }, { name: 'Pezzi prodotti', values: D.pezzi, dash: '5 4' }],
    lo: 0, hi: 1100, gridFrom: 0, gridTo: 800, gridStep: 400, L: 46, R: 22, legend: true,
    aria: 'Linee di ore lavorate e pezzi prodotti: ore ' + D.mesi.map((m, i) => m + ' ' + D.ore[i]).join(', ') + '; pezzi ' + D.mesi.map((m, i) => m + ' ' + D.pezzi[i]).join(', ') + '.'
  }) + `</figure>`;
}

function gMarche() {
  const D = DATA.marche;
  return `<figure class="fig"><figcaption>Quote di mercato nelle vendite di un prodotto</figcaption>` + C.pie({
    data: D.voci, title: 'Quota di mercato',
    aria: 'Torta delle quote di mercato: ' + D.voci.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `<p class="fig-note">Il mercato totale è di ${D.totale} milioni di pezzi. Le altre marche sono tre (P, Q, R) e vendono nel rapporto 1 : 2 : 1.</p></figure>`;
}

function gPezzi() {
  const D = DATA.pezzi;
  return `<figure class="fig"><figcaption>Pezzi venduti da un'azienda in ciascun trimestre, in migliaia</figcaption>` + C.bars({
    labels: D.trimestri, series: [{ name: 'Pezzi venduti', values: D.venduti }], max: 70, legend: false,
    aria: 'Istogramma dei pezzi venduti in migliaia: ' + D.trimestri.map((m, i) => m + ' ' + D.venduti[i]).join(', ') + '.'
  }) + `<p class="fig-note">Il prezzo di vendita è stato di ${D.prezzoPrimi} euro per pezzo nei primi due trimestri e di ${D.prezzoUltimi} euro negli ultimi due. Il costo di produzione è di ${D.costo} euro per pezzo.</p></figure>`;
}

function tAppelli() {
  const D = DATA.appelli;
  return C.table({
    caption: 'Esame di statistica: studenti promossi e voto medio dei promossi, per appello',
    head: ['Appello', 'Promossi', 'Voto medio dei promossi'],
    rows: D.nomi.map((n, i) => [n, D.promossi[i], D.voto[i]])
  });
}

function tProdotti() {
  const D = DATA.prodotti;
  return C.table({
    caption: 'Vendite di quattro prodotti, in migliaia di pezzi',
    head: ['Prodotto', '2023', '2024', '2025'],
    rows: D.nomi.map((n, i) => [n, D.y23[i], D.y24[i], D.y25[i]])
  });
}

function tCorsi() {
  const D = DATA.corsi, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Iscritti ai corsi di lingua di una scuola, per lingua e livello',
    head: ['Lingua', 'Principianti', 'Intermedi', 'Avanzati', 'Totale'],
    rows: D.lingue.map((s, i) => [s, D.princ[i], c(D.interm[i]), D.avanz[i], D.totRiga[i]]),
    foot: ['Totale'].concat(D.totCol)
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato.</p>`;
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-visitatori', diff: 'media', lang: 'it',
  stem: `Le visite a un sito web sono aumentate del 40% a gennaio rispetto a dicembre e sono poi diminuite del 25% a febbraio rispetto a gennaio. A febbraio le visite sono state 21.000. Quante erano a dicembre?`,
  ...put('q-visitatori', '20.000', ['22.050', '21.000', 'circa 18.260']),
  sol: `Le visite di febbraio sono 1,4 · 0,75 = 1,05 volte quelle di dicembre. Quindi a dicembre erano 21.000 ÷ 1,05 = 20.000.`,
  trap: `22.050 = 21.000 · 1,05 applica la variazione complessiva nel verso sbagliato; 21.000 suppone che +40% e −25% si compensino; circa 18.260 somma le due variazioni (+15%) invece di moltiplicare i fattori e divide 21.000 ÷ 1,15.`,
  patt: 'Percentuali composte' },

{ k: 'q-vernice', diff: 'media', lang: 'it',
  stem: `Per ottenere una vernice che costa 6 € al litro si mescolano vernice bianca a 4 € al litro e vernice colorata a 10 € al litro. In quale rapporto (bianca : colorata) vanno mescolate?`,
  ...put('q-vernice', '2 : 1', ['1 : 1', '1 : 2', '3 : 2']),
  sol: `Il prezzo 6 € dista 2 € da quello della bianca (6 − 4) e 4 € da quello della colorata (10 − 6). Le quantità stanno in rapporto inverso alle distanze: bianca : colorata = 4 : 2 = 2 : 1. Verifica: (2 · 4 + 1 · 10) ÷ 3 = 18 ÷ 3 = 6.`,
  trap: `1 : 1 darebbe 7 € (la media semplice dei due prezzi); 1 : 2 inverte il rapporto: il prezzo 6 € è più vicino a quello della bianca, che deve quindi pesare di più; 3 : 2 darebbe (12 + 20) ÷ 5 = 6,40 €.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-biglie', diff: 'difficile', lang: 'it',
  stem: `In quanti modi si possono distribuire 6 biglie identiche a 3 bambini, in modo che ciascun bambino ne riceva almeno una?`,
  ...put('q-biglie', '10', ['28', '20', '6']),
  sol: `Si cercano le terne (a, b, c) con somma 6 e ogni numero almeno 1: (4, 1, 1) e le sue permutazioni, 3 modi; (3, 2, 1) e le sue permutazioni, 6 modi; (2, 2, 2), 1 modo. In tutto 3 + 6 + 1 = 10.`,
  trap: `28 = C(8, 2) conta anche i casi in cui un bambino non riceve nulla; 20 = C(6, 3) sceglie 3 biglie su 6, che non ha senso con biglie identiche; 6 conta solo le disposizioni della terna (3, 2, 1) e dimentica le altre.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-buste', diff: 'media', lang: 'it',
  stem: `Una gara a premi ha 5 buste, di cui 2 contengono un premio. Un concorrente ne apre 2 a caso, senza rimettere a posto la prima. Qual è la probabilità che trovi almeno un premio?`,
  ...put('q-buste', fr(7, 10), [fr(16, 25), fr(4, 5), fr(2, 5)]),
  sol: `Conviene calcolare l'evento contrario (nessun premio): le due buste aperte sono entrambe vuote con probabilità ${fr(3, 5)} · ${fr(2, 4)} = ${fr(3, 10)}. La probabilità cercata è 1 − ${fr(3, 10)} = ${fr(7, 10)}.`,
  trap: `16/25 = 1 − (3/5)² suppone che la prima busta venga rimessa a posto; 4/5 = 2 · 2/5 somma le probabilità delle due buste contando due volte il caso «due premi»; 2/5 è la probabilità di trovare il premio nella sola prima busta.`,
  patt: 'Probabilità: evento contrario' },

{ k: 'q-algebra', diff: 'media', lang: 'it',
  stem: `I numeri a e b sono tali che a + b = 10 e a² + b² = 58. Quanto vale il prodotto ab?`,
  ...put('q-algebra', '21', ['42', '29', '48']),
  sol: `(a + b)² = a² + b² + 2ab, quindi 100 = 58 + 2ab e ab = 42 ÷ 2 = 21. Infatti a = 3 e b = 7 danno 3 + 7 = 10 e 9 + 49 = 58.`,
  trap: `42 dimentica di dividere per 2 (nello sviluppo compare 2ab); 29 è la metà di 58; 48 = 58 − 10 sottrae grandezze non omogenee (un quadrato e una somma).`,
  patt: 'Algebra' },

{ k: 'q-monete', diff: 'difficile', lang: 'it',
  stem: `In una scatola ci sono tre monete: una ha testa su entrambe le facce, una ha croce su entrambe le facce, una è normale (testa da un lato e croce dall'altro). Si estrae una moneta a caso, la si lancia e si vede che esce testa. Qual è la probabilità che l'altra faccia della stessa moneta sia testa?`,
  ...put('q-monete', fr(2, 3), [fr(1, 2), fr(1, 3), fr(3, 4)]),
  sol: `Le facce «testa» che si possono vedere sono 3, tutte ugualmente probabili: le due facce della moneta a due teste e la faccia testa della moneta normale. In 2 casi su 3 l'altra faccia è testa (moneta a due teste); nel terzo caso è croce. La probabilità è ${fr(2, 3)}.`,
  trap: `1/2 conta le monete rimaste possibili (due) senza pesarle: la moneta a due teste mostra testa in due modi, la normale in uno solo; 1/3 è la probabilità di aver estratto la moneta a due teste prima di guardare il lancio; 3/4 non corrisponde ad alcun conteggio di casi.`,
  patt: 'Probabilità condizionata' },

{ k: 'q-potenze', diff: 'media', lang: 'it',
  stem: `Quante cifre ha il numero 2<sup>20</sup> · 5<sup>18</sup>?`,
  ...put('q-potenze', '19', ['18', '20', '38']),
  sol: `2<sup>20</sup> · 5<sup>18</sup> = 2<sup>2</sup> · (2 · 5)<sup>18</sup> = 4 · 10<sup>18</sup>: un 4 seguito da 18 zeri, cioè 19 cifre.`,
  trap: `18 conta solo gli zeri finali; 20 suppone un 10 per ogni fattore 2; 38 è la somma degli esponenti. I fattori 2 e 5 formano un 10 solo quando sono in coppia (18 coppie), e restano due fattori 2.`,
  patt: 'Numeri e potenze' },

{ k: 'q-fattoria', diff: 'media', lang: 'it',
  stem: `In una fattoria le galline sono il triplo delle oche, e le oche sono i ${fr(2, 5)} delle anatre. Gli animali sono in tutto 260. Quante sono le galline?`,
  ...put('q-fattoria', '120', ['100', '40', '130']),
  sol: `Se le anatre sono 5k, le oche sono 2k (i 2/5 di 5k) e le galline 3 · 2k = 6k. In tutto 5k + 2k + 6k = 13k = 260, quindi k = 20 e le galline sono 6 · 20 = 120.`,
  trap: `100 è il numero delle anatre e 40 quello delle oche; 130 è la metà degli animali. I due rapporti vanno espressi con la stessa unità k, partendo dalla grandezza che compare in entrambi (le oche).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-led', diff: 'media', lang: 'it',
  stem: `Una lampadina LED costa 12 € e consuma 8 W; una lampadina alogena costa 4 € e consuma 40 W. L'energia costa 0,25 € per ogni kWh. Dopo quante ore di accensione il costo complessivo (acquisto più energia) delle due lampadine è uguale?`,
  ...put('q-led', '1.000 ore', ['200 ore', '250 ore', '500 ore']),
  sol: `L'alogena consuma 40 − 8 = 32 W in più, cioè 0,032 kW: costa 0,032 · 0,25 = 0,008 € in più per ogni ora. Il LED costa 12 − 4 = 8 € in più all'acquisto: la differenza si recupera dopo 8 ÷ 0,008 = 1.000 ore.`,
  trap: `200 ore = 8 ÷ 0,04 usa i soli 40 W dell'alogena; 250 ore = 8 ÷ 0,032 dimentica il prezzo di 0,25 € per kWh; 500 ore è un valore a occhio. Attenzione alle unità: 32 W = 0,032 kW.`,
  patt: 'Dati e passaggi' },

{ k: 'q-cifre', diff: 'difficile', lang: 'it',
  stem: `Quanti numeri di tre cifre hanno il prodotto delle cifre uguale a 6?`,
  ...put('q-cifre', '9', ['3', '6', '12']),
  sol: `Il prodotto 6 si ottiene con le terne di cifre {1, 1, 6} e {1, 2, 3}. Con {1, 1, 6} si formano 3 numeri (116, 161, 611); con {1, 2, 3}, tutte diverse, 3! = 6 numeri. In tutto 3 + 6 = 9.`,
  trap: `3 e 6 contano una sola delle due terne; 12 conta due volte la terna {1, 2, 3}. Le cifre ripetute riducono le disposizioni: 3 e non 6.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-foglio', diff: 'media', lang: 'it',
  stem: `Un foglio di carta spesso 0,1 mm viene piegato a metà, poi ancora a metà, e così via, per 10 piegature complete. Quanto è spesso, circa, il foglio piegato?`,
  ...put('q-foglio', 'circa 10 cm', ['circa 1 cm', 'circa 1 m', 'circa 1 mm']),
  sol: `Ogni piegatura raddoppia lo spessore: dopo 10 piegature lo spessore è 2<sup>10</sup> = 1.024 volte quello iniziale, cioè circa 1.000 · 0,1 mm = 100 mm = 10 cm.`,
  trap: `1 mm e 1 cm sottovalutano la crescita esponenziale (lo spessore si moltiplica per circa 1.000, non per 1 o per 10); 1 m la sovrastima di dieci volte. Con 2<sup>10</sup> ≈ 1.000 il conto si fa a mente.`,
  patt: 'Crescita esponenziale' },

{ k: 'q-somma-prodotto', diff: 'media', lang: 'it',
  stem: `La somma di due numeri interi positivi è 17 e il loro prodotto è 66. Qual è il maggiore dei due numeri?`,
  ...put('q-somma-prodotto', '11', ['12', '14', 'Non è determinabile']),
  sol: `I due numeri sono le soluzioni di t² − 17t + 66 = 0, cioè 6 e 11 (6 + 11 = 17 e 6 · 11 = 66). Il maggiore è 11. Oppure: i divisori di 66 sono 1, 2, 3, 6, 11, 22, 33, 66 e la coppia con somma 17 è 6 e 11.`,
  trap: `«Non è determinabile» è l'esca: due condizioni (somma e prodotto) su due incognite fissano i valori. 12 e 14 hanno somma 17 con 5 e 3, ma prodotti 60 e 42, non 66.`,
  patt: 'Sufficienza dei dati' },

{ k: 'q-assoluto', diff: 'media', lang: 'it',
  stem: `Quanti numeri interi n verificano contemporaneamente 2 < |n − 3| ≤ 5?`,
  ...put('q-assoluto', '6', ['3', '5', '8']),
  sol: `La condizione dice che la distanza di n da 3 è maggiore di 2 e al massimo 5: n − 3 vale ±3, ±4 o ±5. I valori sono n = 6, 7, 8 e n = 0, −1, −2: sei numeri.`,
  trap: `3 conta solo i valori a destra di 3 (6, 7, 8); 5 esclude uno degli estremi; 8 include anche la distanza 2 (n = 1 e n = 5), ma la disuguaglianza è stretta a sinistra.`,
  patt: 'Numeri e disuguaglianze' },

{ k: 'q-indice', diff: 'media', lang: 'it',
  stem: `L'indice dei prezzi al consumo di un Paese (base 2020 = 100) vale 125 nel 2023 e 150 nel 2025. Di quanto sono aumentati i prezzi tra il 2023 e il 2025?`,
  ...put('q-indice', '20%', ['25%', '50%', 'circa il 17%']),
  sol: `L'aumento è 150 ÷ 125 − 1 = 1,2 − 1 = 20%. La base della percentuale è il valore del 2023 (125), non il valore di partenza dell'indice (100).`,
  trap: `25% legge i 25 punti di indice (150 − 125) come percentuali: sarebbero il 25% solo rispetto a 100; 50% è l'aumento rispetto alla base 2020; circa il 17% divide la differenza per 150 invece che per 125.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-lampioni', diff: 'media', lang: 'it',
  stem: `Lungo una strada circolare ci sono 12 lampioni, ugualmente distanziati e numerati da 1 a 12 in ordine. Qual è il lampione diametralmente opposto al numero 5?`,
  ...put('q-lampioni', '11', ['6', '7', '10']),
  sol: `I lampioni sono 12 ugualmente distanziati: quello opposto si trova a metà giro, cioè 6 posti più avanti: 5 + 6 = 11.`,
  trap: `6 è il numero di posti, non il numero del lampione; 7 = 12 − 5 conta all'indietro dalla fine; 10 = 5 · 2 raddoppia il numero. L'opposto di n è n + 6 (oppure n − 6) sulla circonferenza.`,
  patt: 'Ragionamento laterale' },

{ k: 'q-treni', diff: 'difficile', lang: 'it',
  stem: `Due treni viaggiano su binari paralleli in senso opposto: il primo è lungo 150 m e viaggia a 54 km/h, il secondo è lungo 100 m e viaggia a 36 km/h. Quanti secondi passano da quando le due locomotive si affiancano a quando le due code si superano?`,
  ...put('q-treni', '10 secondi', ['6 secondi', '14 secondi', '50 secondi']),
  sol: `In senso opposto le velocità si sommano: 54 + 36 = 90 km/h = 25 m/s. Lo spazio da percorrere è la somma delle lunghezze: 150 + 100 = 250 m. Tempo: 250 ÷ 25 = 10 secondi.`,
  trap: `6 secondi usa la sola lunghezza del primo treno (150 ÷ 25); 50 secondi usa la differenza delle velocità (18 km/h = 5 m/s), come se i treni viaggiassero nello stesso senso; 14 secondi divide 250 per 18, dimenticando la conversione da km/h a m/s.`,
  patt: 'Velocità e tempi' },

{ k: 'q-calendario', diff: 'media', lang: 'it',
  stem: `Il 1° ottobre 2026 è un giovedì. Che giorno della settimana sarà il 1° ottobre 2029?`,
  ...put('q-calendario', 'Lunedì', ['Domenica', 'Martedì', 'Sabato']),
  sol: `Da ottobre 2026 a ottobre 2029 passano 3 anni che contengono il 29 febbraio 2028 (anno bisestile): 365 + 366 + 365 = 1.096 giorni. 1.096 = 7 · 156 + 4, quindi il giorno della settimana avanza di 4: giovedì + 4 = lunedì.`,
  trap: `Domenica si ottiene dimenticando il giorno in più dell'anno bisestile (3 anni = 3 giorni di scarto); martedì e sabato sono errori di conteggio di uno o due giorni.`,
  patt: 'Calendario e resti' },

{ k: 'q-camicie', diff: 'media', lang: 'it',
  stem: `Un negozio acquista 80 camicie a 20 € l'una. Ne vende 50 a 35 € e le altre con uno sconto del 20% sul prezzo di 35 €. Nella settimana il negozio ha 12 dipendenti in turno. Qual è il guadagno complessivo sulle 80 camicie?`,
  ...put('q-camicie', '990 €', ['1.200 €', '630 €', '2.590 €']),
  sol: `Incasso: 50 · 35 = 1.750 €; le altre 30 camicie costano 35 · 0,8 = 28 € e fruttano 30 · 28 = 840 €; incasso totale 2.590 €. Costo: 80 · 20 = 1.600 €. Guadagno: 2.590 − 1.600 = 990 €. Il numero dei dipendenti è un dato superfluo.`,
  trap: `1.200 € non applica lo sconto alle 30 camicie rimanenti (2.800 − 1.600); 630 € applica lo sconto sul prezzo d'acquisto invece che su quello di vendita; 2.590 € è l'incasso, non il guadagno.`,
  patt: 'Dati superflui' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-stagionali', diff: 'media', lang: 'it',
  claim: `Gli addetti alle pulizie sono meno di un terzo dei lavoratori stagionali.`,
  passage: `Gli stabilimenti balneari di una riviera assumono ogni estate personale stagionale: bagnini, addetti ai bar e addetti alle pulizie. Tutti i lavoratori stagionali appartengono a una di queste tre categorie. Secondo l'associazione di categoria, i bagnini sono il 15% dei lavoratori stagionali, mentre gli addetti ai bar sono il triplo dei bagnini. Nel 2025 i lavoratori stagionali sono stati in tutto 2.000 e hanno avuto contratti di durata compresa tra due e quattro mesi. L'associazione chiede incentivi fiscali per l'assunzione di giovani sotto i 25 anni e maggiore flessibilità negli orari di lavoro in luglio e agosto.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «Tutti i lavoratori stagionali appartengono a una di queste tre categorie», «i bagnini sono il 15%» e «gli addetti ai bar sono il triplo dei bagnini». I bagnini sono il 15% e gli addetti ai bar il 45%, quindi le pulizie sono il 100% − 15% − 45% = 40% (800 su 2.000), più di un terzo (33,3%). L'affermazione è contraddetta.`,
  trap: `Leggere «il triplo» come 3 punti in più (18%) e arrivare a una quota delle pulizie troppo alta, oppure sbagliare la sottrazione e trovare circa il 30%. Non è «non ricavabile»: le categorie sono tre e il totale si ricava per differenza.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-pil', diff: 'media', lang: 'it',
  passage: `Il PIL nominale misura il valore della produzione di un Paese ai prezzi correnti; il PIL reale la misura invece ai prezzi di un anno base, eliminando l'effetto dell'inflazione, e perciò indica meglio quanto sia cresciuta davvero la produzione di beni e servizi. Nel 2025 il PIL nominale di un Paese è aumentato del 5%, mentre il deflatore del PIL, cioè l'indice dei prezzi dei beni e servizi prodotti, è salito del 3%. Il governo ha annunciato che «l'economia è cresciuta del 5%», ma un'associazione di consumatori sostiene che la crescita effettiva sia stata di circa il 2%.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-pil', `Nel 2025 il PIL reale è cresciuto di circa il 2%.`,
    [`Nel 2025 il PIL reale è cresciuto dell'8%, somma della crescita nominale e dell'inflazione.`,
     `Il dato del 5% annunciato dal governo misura la crescita del PIL reale.`,
     `Il PIL nominale non risente delle variazioni dei prezzi.`]),
  sol: `Frasi chiave: «il PIL reale … elimina l'effetto dell'inflazione», «il PIL nominale … è aumentato del 5%» e «il deflatore … è salito del 3%». La crescita reale è circa 5% − 3% = 2% (esattamente 1,05 ÷ 1,03 − 1 ≈ 1,9%).`,
  trap: `Sommare crescita e inflazione (8%) invece di toglierla; attribuire al PIL reale il 5%, che è il dato nominale; credere che il PIL nominale sia depurato dai prezzi (è quello ai prezzi correnti, quindi li include).`,
  patt: 'Termine economico frainteso' },

{ k: 'v-abbonamento', diff: 'media', lang: 'it',
  passage: `Un consulente sostiene che l'abbonamento a una piattaforma di corsi online aumenta le probabilità di promozione dei dipendenti. Come prova cita i dati di un'azienda: tra i 200 dipendenti abbonati il 30% è stato promosso nell'ultimo anno, contro il 10% dei 600 dipendenti non abbonati. L'abbonamento costa 10 euro al mese ed è stato offerto a tutti i dipendenti che ne hanno fatto richiesta. L'azienda ha in programma di estendere l'abbonamento anche alle sedi estere e ha stanziato a questo scopo 30.000 euro per il prossimo anno.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la tesi del consulente?`,
  ...put('v-abbonamento', `Prima dell'abbonamento, abbonati e non abbonati avevano la stessa anzianità, le stesse valutazioni e la stessa probabilità di essere promossi.`,
    [`Gli abbonati lavorano in reparti nei quali, nell'ultimo anno, si sono liberati molti posti da dirigente.`,
     `La maggior parte dei corsi seguiti dagli abbonati riguarda argomenti informatici.`,
     `L'abbonamento costa meno degli altri corsi di formazione offerti dall'azienda.`]),
  sol: `La tesi è causale (l'abbonamento aumenta le promozioni), ma l'abbonamento è stato offerto a chi lo ha richiesto: gli abbonati potrebbero essere già più motivati o più promuovibili. Se prima dell'abbonamento i due gruppi erano uguali per anzianità, valutazioni e probabilità di promozione, la differenza successiva è più facilmente dovuta all'abbonamento: rafforza la tesi.`,
  trap: `L'opzione sui posti da dirigente indica una causa alternativa (più posti liberi per gli abbonati) e indebolisce; argomento dei corsi e costo non riguardano il nesso tra abbonamento e promozioni. Per rafforzare un nesso causale serve un confronto tra gruppi equivalenti.`,
  patt: 'Cause alternative' },

{ k: 'v-zeta', diff: 'media', lang: 'it',
  claim: `Gli addetti laureati assunti nel 2025 costano all'azienda, in media, più dei diplomati.`,
  passage: `L'azienda Zeta ha assunto nel 2025 trenta nuovi addetti, di cui venti laureati e dieci diplomati. Il costo medio mensile per addetto, tra stipendio e contributi, è di 2.500 euro. L'azienda ha inoltre assegnato un premio una tantum di 500 euro a tutti i nuovi addetti che hanno completato il periodo di prova. La direzione ha dichiarato che nel 2026 assumerà altri quindici addetti, privilegiando i candidati con esperienza nel settore logistico. Zeta ha sedi a Padova, Verona e Treviso.`,
  opts: VFN, ans: 1,
  sol: `Il brano dà il costo medio mensile di tutti i nuovi addetti (2.500 euro) e il loro titolo di studio (venti laureati e dieci diplomati), ma non dice quanto costi in media ciascun gruppo. Il confronto tra laureati e diplomati non è né affermato né smentito: non ricavabile.`,
  trap: `Supporre che i laureati costino di più perché di solito è così: è un'aspettativa, non un dato del brano. Non è «falsa»: nulla nel testo esclude che i laureati costino di più. Il premio di 500 euro vale per tutti, a prescindere dal titolo.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-deficit', diff: 'media', lang: 'it',
  passage: `Nel 2025 un Paese ha registrato un deficit commerciale di 20 miliardi di euro: le importazioni (180 miliardi) hanno superato le esportazioni (160 miliardi). Il deficit è aumentato rispetto al 2024, quando era di 12 miliardi, soprattutto per l'aumento della spesa in energia importata, passata da 40 a 55 miliardi. Le esportazioni di beni strumentali sono cresciute del 4%, mentre quelle agricole sono rimaste invariate. Il governo prevede che il deficit si riduca nel 2026 grazie a nuovi accordi di fornitura di gas, ma il ministro ha precisato che si tratta soltanto di una previsione.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put('v-deficit', `Il deficit è aumentato soprattutto perché le esportazioni di beni strumentali sono diminuite.`,
    [`Il deficit commerciale è cresciuto di 8 miliardi di euro tra il 2024 e il 2025.`,
     `La spesa per l'energia importata è aumentata di 15 miliardi di euro.`,
     `Il governo ritiene possibile una riduzione del deficit nel 2026.`]),
  sol: `Frasi chiave: «Il deficit è aumentato … soprattutto per l'aumento della spesa in energia importata» e «Le esportazioni di beni strumentali sono cresciute del 4%». L'aumento del deficit è attribuito all'energia, non al calo delle esportazioni di beni strumentali, che sono anzi cresciute: l'affermazione NON è corretta. Le altre tre sono nel brano (20 − 12 = 8; 55 − 40 = 15; la riduzione è una previsione).`,
  trap: `Con la domanda «NON corretta» le altre tre sono tutte vere, e per questo si è tentati di scegliere una vera. La causa vera dell'aumento del deficit è l'energia importata; l'opzione scambia la causa con un dato che va nel verso opposto.`,
  patt: 'Cause alternative' },

{ k: 'v-rivista', diff: 'media', lang: 'it',
  passage: `Una rivista di viaggi annuncia che il 90% dei suoi lettori è soddisfatto della nuova veste grafica. L'affermazione si basa su 500 risposte arrivate al sito della rivista in seguito a un invito inviato per e-mail agli abbonati. La rivista ha circa 40.000 lettori, tra abbonati e acquirenti in edicola. La nuova veste grafica è stata introdotta in primavera e prevede più fotografie e meno testo. La direzione intende estendere il nuovo stile anche all'edizione online. Il sondaggio è rimasto aperto per due settimane.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più l'affermazione della rivista?`,
  ...put('v-rivista', `I lettori insoddisfatti della nuova veste grafica tendono a non aprire più le e-mail della rivista e a non rispondere ai suoi inviti.`,
    [`La compilazione del modulo online richiede in media circa cinque minuti.`,
     `L'invito a rispondere è stato inviato in due momenti diversi della stessa settimana.`,
     `La nuova veste grafica ha aumentato il numero di fotografie per ogni pagina.`]),
  sol: `L'affermazione generalizza a tutti i 40.000 lettori il parere di 500 persone che hanno risposto a un invito. Se chi è insoddisfatto non risponde (o non apre le e-mail), il campione è formato quasi solo da soddisfatti: il 90% non è rappresentativo dei lettori, e l'affermazione si indebolisce.`,
  trap: `Durata del modulo, date dell'invito e numero di fotografie non incidono sulla rappresentatività di chi ha risposto. Con un sondaggio volontario conviene sempre chiedersi chi non ha risposto.`,
  patt: 'Selezione del campione' },

{ k: 'v-imprese', diff: 'media', lang: 'it',
  claim: `Almeno 400 delle imprese intervistate vendono anche online.`,
  passage: `Un'indagine ha coinvolto 800 imprese di una provincia. Il 75% delle imprese intervistate dispone di un sito internet; tra queste, i due terzi vendono i propri prodotti anche online. Le imprese senza sito sono quasi tutte molto piccole, con meno di cinque addetti. L'indagine è stata condotta tra marzo e aprile 2025 da una società specializzata, su incarico della Camera di commercio, mediante interviste telefoniche. I risultati completi saranno presentati in un convegno a giugno. Le imprese intervistate operano nell'industria, nel commercio e nei servizi.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «800 imprese», «Il 75% delle imprese intervistate dispone di un sito internet» e «tra queste, i due terzi vendono … anche online». Le imprese con sito sono il 75% di 800 = 600 e i due terzi di 600 sono 400: queste vendono online. Anche se nessuna delle altre imprese vendesse online, il totale è almeno 400: l'affermazione è vera.`,
  trap: `Calcolare i due terzi su 800 (533) o sul 25% (150): la base è il 75% con sito. Le imprese senza sito potrebbero vendere online a loro volta: per questo il brano permette di dire «almeno 400» e non «esattamente 400». Non è «non ricavabile»: i numeri bastano.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-aeroporto', diff: 'media', lang: 'it',
  passage: `Secondo la società di gestione, nei primi nove mesi del 2025 l'aeroporto di Cima ha registrato 3,6 milioni di passeggeri, il 12% in più rispetto allo stesso periodo del 2024. Nel solo mese di settembre i passeggeri sono stati 450.000, il 5% in meno rispetto a settembre 2024. La società attribuisce il calo di settembre a uno sciopero del personale di terra, che ha causato la cancellazione di 40 voli. Per l'intero 2025 la società prevede 4,7 milioni di passeggeri, a condizione che nel quarto trimestre non vi siano ulteriori scioperi.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-aeroporto', `Nei primi nove mesi del 2025 i passeggeri sono stati più numerosi che nello stesso periodo del 2024, nonostante il calo di settembre.`,
    [`A settembre 2025 i passeggeri sono aumentati del 12% rispetto a settembre 2024.`,
     `Nel 2025 l'aeroporto avrà 4,7 milioni di passeggeri.`,
     `A settembre 2024 i passeggeri erano 450.000.`]),
  sol: `Frasi chiave: «nei primi nove mesi del 2025 … 3,6 milioni di passeggeri, il 12% in più» e «nel solo mese di settembre … il 5% in meno». Il periodo dei nove mesi comprende settembre: nel complesso i passeggeri sono aumentati, anche se settembre è in calo.`,
  trap: `Spostare il periodo: il +12% è sui nove mesi, non su settembre. I 4,7 milioni sono una previsione condizionata, non un dato. Il 450.000 è il valore di settembre 2025: nel 2024 i passeggeri erano circa 474.000 (450.000 ÷ 0,95).`,
  patt: 'Periodo o ambito spostato' },

{ k: 'v-liceo', diff: 'difficile', lang: 'it',
  passage: `In un liceo il 60% degli studenti frequenta l'indirizzo scientifico e il 40% quello linguistico. Al test finale di matematica il 90% degli studenti dello scientifico e il 60% di quelli del linguistico ha ottenuto la sufficienza. Il liceo ha in tutto 500 studenti e il test è obbligatorio per tutti. Il test è composto da venti quesiti e dura due ore; gli studenti con disturbi dell'apprendimento hanno a disposizione trenta minuti in più. I risultati sono stati pubblicati nella bacheca della scuola il giorno successivo.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-liceo', `Tra gli studenti che hanno ottenuto la sufficienza, più di due su tre frequentano l'indirizzo scientifico.`,
    [`Tra gli studenti che hanno ottenuto la sufficienza, il 60% frequenta l'indirizzo scientifico.`,
     `Tra gli studenti dello scientifico, i tre quarti hanno ottenuto la sufficienza.`,
     `Gli studenti che non hanno ottenuto la sufficienza sono il 30% degli iscritti.`]),
  sol: `Su 500 studenti: scientifico 300 (90% = 270 sufficienti) e linguistico 200 (60% = 120 sufficienti). I sufficienti sono 390 e quelli dello scientifico sono 270 ÷ 390 ≈ 69%, più di due terzi (66,7%). Gli insufficienti sono 110, cioè il 22% degli iscritti.`,
  trap: `Il 60% è la quota dello scientifico sugli iscritti, non sui sufficienti (le due basi sono diverse e lo scientifico ha un tasso di successo più alto); i tre quarti non corrispondono al 90% dato dal brano; gli insufficienti sono il 10% dello scientifico (30 studenti) e il 40% del linguistico (80): in tutto 110 su 500, cioè il 22% e non il 30%.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-autobus', diff: 'difficile', lang: 'it',
  passage: `Un'azienda di trasporti pubblici annuncia che con i nuovi autobus elettrici i costi di esercizio per chilometro scenderanno del 30%, perché l'energia elettrica costa meno del gasolio per ogni chilometro percorso. L'azienda ha ordinato 20 autobus elettrici per un totale di 12 milioni di euro e prevede di sostituire entro tre anni metà della propria flotta. Gli autobus elettrici saranno ricaricati di notte nel deposito cittadino. L'amministratore delegato ha ricordato che il comune finanzierà il 40% dell'acquisto. Il deposito dispone di un impianto fotovoltaico sul tetto.`,
  stem: `Su quale assunzione si basa principalmente l'annuncio dell'azienda?`,
  ...put('v-autobus', `Gli altri costi di esercizio per chilometro, come la manutenzione e la ricarica, non aumentano al punto da annullare il risparmio sull'energia.`,
    [`I passeggeri preferiscono viaggiare sugli autobus elettrici piuttosto che su quelli a gasolio.`,
     `Il prezzo del gasolio aumenterà nei prossimi anni.`,
     `Gli autobus elettrici durano più a lungo di quelli a gasolio.`]),
  sol: `L'annuncio passa da «l'energia costa meno» a «i costi di esercizio per chilometro scenderanno del 30%». Il passaggio regge solo se il resto dei costi per chilometro (manutenzione, ricarica, personale) non cresce tanto da compensare il risparmio sull'energia.`,
  trap: `Le preferenze dei passeggeri, il prezzo futuro del gasolio e la durata degli autobus non servono per concludere che il costo per chilometro scende: riguardano ricavi, scenari futuri o ammortamento, non i costi di esercizio per chilometro.`,
  patt: 'Assunzione implicita' },

{ k: 'v-stranieri', diff: 'media', lang: 'it',
  claim: `I residenti stranieri con meno di 18 anni sono più di un quarto di tutti i residenti con meno di 18 anni.`,
  passage: `In un comune di 20.000 abitanti i cittadini stranieri sono 2.400. Tra gli stranieri, un quarto ha meno di 18 anni. Nel comune i residenti con meno di 18 anni sono in tutto 3.000. Il comune ha aperto da poco uno sportello per l'iscrizione dei bambini stranieri alle scuole e prevede di assumere due mediatori linguistici. Lo scorso anno la popolazione residente è cresciuta dello 0,5%, soprattutto per l'arrivo di nuove famiglie dall'estero. Il comune ha anche cinque scuole elementari e due scuole medie.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «Tra gli stranieri, un quarto ha meno di 18 anni» e «i residenti con meno di 18 anni sono in tutto 3.000». Gli stranieri minorenni sono 2.400 ÷ 4 = 600, cioè 600 ÷ 3.000 = 20% di tutti i minorenni, meno di un quarto. L'affermazione è contraddetta.`,
  trap: `Scambiare la base: «un quarto degli stranieri» non è «un quarto dei minorenni». Non è «non ricavabile»: i due numeri sono nel brano e il confronto si fa con un calcolo.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-lavoro', diff: 'media', lang: 'it',
  passage: `Il tasso di disoccupazione è il rapporto tra le persone in cerca di lavoro e le forze di lavoro, cioè l'insieme di chi lavora e di chi cerca lavoro. Il tasso di occupazione è invece il rapporto tra gli occupati e la popolazione in età lavorativa. Le persone che non lavorano e non cercano lavoro sono dette inattive. In un Paese con 10 milioni di persone in età lavorativa gli occupati sono 6 milioni e le persone in cerca di lavoro 1,5 milioni. Il governo ha annunciato un piano di formazione per ridurre il numero di inattivi, che secondo le stime sono concentrati nelle regioni meridionali.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-lavoro', `Il tasso di disoccupazione è del 20% e il tasso di occupazione del 60%.`,
    [`Il tasso di disoccupazione è del 15%, perché 1,5 milioni su 10 milioni.`,
     `Il tasso di occupazione è dell'80%, perché 6 milioni su 7,5 milioni.`,
     `Gli inattivi sono 2 milioni.`]),
  sol: `Forze di lavoro: 6 + 1,5 = 7,5 milioni. Tasso di disoccupazione: 1,5 ÷ 7,5 = 20%. Tasso di occupazione: 6 ÷ 10 = 60% (la base è la popolazione in età lavorativa). Gli inattivi sono 10 − 7,5 = 2,5 milioni.`,
  trap: `Dividere i disoccupati per la popolazione in età lavorativa (15%) invece che per le forze di lavoro; calcolare l'occupazione sulle forze di lavoro (80%); contare 2 milioni di inattivi invece di 2,5. Ogni tasso ha una base diversa.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-caschi', diff: 'media', lang: 'it',
  passage: `Il responsabile della sicurezza di un'impresa edile sostiene che, per azzerare gli infortuni nei cantieri, sia sufficiente fornire a tutti gli operai il casco di nuova generazione. A sostegno della tesi cita il cantiere di Via Roma, dove, dopo la fornitura dei nuovi caschi, non si sono più verificati infortuni alla testa. L'impresa ha 12 cantieri e 450 operai. Il casco di nuova generazione costa 80 euro e pesa 300 grammi. Il responsabile propone di acquistarne 450 entro marzo. I dati sono stati raccolti dal responsabile durante i sopralluoghi.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la tesi del responsabile?`,
  ...put('v-caschi', `Nel cantiere di Via Roma, prima della fornitura dei nuovi caschi, gli infortuni alla testa erano solo una piccola parte di tutti gli infortuni.`,
    [`Il casco di nuova generazione costa meno dei caschi della concorrenza.`,
     `Gli operai del cantiere di Via Roma hanno gradito il nuovo casco.`,
     `Il cantiere di Via Roma è stato il primo dell'impresa a ricevere i nuovi caschi.`]),
  sol: `La tesi è che il casco sia sufficiente ad azzerare gli infortuni (tutti), ma la prova riguarda solo gli infortuni alla testa. Se questi erano una piccola parte del totale, il casco non può bastare ad azzerare gli altri infortuni: la tesi si indebolisce.`,
  trap: `Costo, gradimento e ordine di fornitura non riguardano l'efficacia del casco sugli infortuni. L'errore da cogliere è lo slittamento da «nessun infortunio alla testa» a «nessun infortunio».`,
  patt: 'Condizione sufficiente vs necessaria' },

{ k: 'v-kappa', diff: 'media', lang: 'it',
  claim: `Il fatturato del terzo trimestre del 2025 è stato superiore a quello del terzo trimestre del 2024.`,
  passage: `La società Kappa ha annunciato che il fatturato del terzo trimestre del 2025 è stato di 45 milioni di euro, in crescita del 10% rispetto al secondo trimestre. Il fatturato del primo semestre del 2025 era stato di 80 milioni. L'amministratore delegato ha dichiarato di aspettarsi un quarto trimestre ancora in crescita, grazie al lancio di due nuovi prodotti, e ha confermato l'obiettivo di un fatturato annuo superiore a 170 milioni. La società ha 600 dipendenti e produce componenti per l'industria dell'auto.`,
  opts: VFN, ans: 1,
  sol: `Il brano confronta il terzo trimestre del 2025 con il secondo trimestre del 2025 (+10%) e dà il fatturato del primo semestre del 2025, ma non fornisce alcun dato sul terzo trimestre del 2024. Il confronto richiesto riguarda un periodo di cui non si parla: non ricavabile.`,
  trap: `Scambiare il confronto «sul trimestre precedente» con il confronto «sullo stesso trimestre dell'anno prima». Non è «vera»: la crescita rispetto al secondo trimestre non dice nulla sul 2024. Non è «falsa»: nulla la contraddice.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-biblioteca', diff: 'difficile', lang: 'it',
  passage: `Dal regolamento di una biblioteca universitaria. Gli studenti possono prendere in prestito fino a 5 libri per volta, per un periodo di 30 giorni. Il prestito può essere rinnovato una sola volta per ulteriori 15 giorni, purché nessun altro utente abbia prenotato il libro. Chi restituisce un libro in ritardo non può prendere altri libri in prestito per un numero di giorni pari al doppio dei giorni di ritardo. I dottorandi possono prendere in prestito fino a 10 libri per volta, con le stesse regole di durata e di ritardo. I libri della sezione periodici non sono prestabili.`,
  stem: `Un dottorando prende in prestito un libro, lo rinnova (nessuno lo aveva prenotato) e lo restituisce 50 giorni dopo averlo preso. Quale delle seguenti affermazioni è corretta?`,
  ...put('v-biblioteca', `Ha restituito il libro con 5 giorni di ritardo e per 10 giorni non può prendere altri libri in prestito.`,
    [`Ha restituito il libro con 5 giorni di ritardo e per 5 giorni non può prendere altri libri in prestito.`,
     `Ha restituito il libro in tempo, perché il rinnovo prolunga il prestito di altri 30 giorni.`,
     `Ha restituito il libro con 20 giorni di ritardo e per 40 giorni non può prendere altri libri in prestito.`]),
  sol: `Frasi chiave: «per un periodo di 30 giorni», «rinnovato … per ulteriori 15 giorni» e «il doppio dei giorni di ritardo». Con il rinnovo il prestito dura 30 + 15 = 45 giorni; restituendo il libro dopo 50 giorni il ritardo è di 5 giorni e il divieto di prestito dura 2 · 5 = 10 giorni. I dottorandi hanno le stesse regole di durata e di ritardo.`,
  trap: `Dimenticare il raddoppio (5 giorni); credere che il rinnovo sia di 30 giorni (come il prestito iniziale) e che il libro sia stato restituito in tempo; calcolare il ritardo rispetto ai soli 30 giorni (20 giorni di ritardo, 40 di divieto). Il fatto che sia un dottorando cambia solo il numero di libri.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-ristorante', diff: 'media', lang: 'it',
  passage: `Un ristorante annuncia che, da quando ha introdotto il menu a prezzo fisso, la spesa media per cliente è aumentata del 10%, passando da 30 a 33 euro. La direzione ne conclude che la nuova formula induce i clienti a spendere di più e intende proporla anche nella seconda sede. Il menu a prezzo fisso comprende antipasto, primo, dolce e caffè. Il ristorante ha 60 coperti e resta aperto sei giorni su sette. Il dato si riferisce ai tre mesi successivi all'introduzione del menu.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza della conclusione della direzione?`,
  ...put('v-ristorante', `Un eventuale cambiamento, nello stesso periodo, del tipo di clientela (per esempio più cene aziendali).`,
    [`L'orario di chiusura della cucina.`,
     `Il numero di cuochi in servizio.`,
     `Il giorno di chiusura settimanale del ristorante.`]),
  sol: `La direzione attribuisce al menu a prezzo fisso l'aumento della spesa media. Se nello stesso periodo la clientela è cambiata (per esempio più cene aziendali, che spendono di più), l'aumento può dipendere da chi viene al ristorante e non dalla formula: è il dato che verifica l'attribuzione.`,
  trap: `Orario della cucina, numero di cuochi e giorno di chiusura non dicono se l'aumento sia dovuto al menu. Prima di attribuire un effetto a una causa conviene chiedersi che cosa altro è cambiato nello stesso periodo.`,
  patt: 'Dato mancante' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-laboratori', diff: 'media', lang: 'it', ds: true,
  stem: ds('In una scuola il 40% degli studenti è iscritto a un laboratorio pomeridiano. Quanti studenti sono iscritti al laboratorio di teatro?',
    'Il 25% degli iscritti ai laboratori pomeridiani frequenta teatro.',
    'Gli studenti della scuola sono 600.'),
  ...dsq('CABD', 'B'),
  sol: `(1): il 25% dei laboratoristi frequenta teatro, ma non si conosce il numero degli studenti. (2): con 600 studenti gli iscritti ai laboratori sono il 40% di 600 = 240, ma non si sa quanti frequentino teatro. Insieme: il 25% di 240 = 60 studenti.`,
  trap: `Calcolare il 25% di 600 (150): il 25% va applicato agli iscritti ai laboratori, non a tutti gli studenti. Credere che la (1) basti perché contiene la percentuale: le percentuali di percentuali richiedono sia la base totale sia le quote annidate.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-appelli', diff: 'media', lang: 'it', asset: tAppelli(),
  stem: `Qual è il voto medio di tutti i promossi dei tre appelli?`,
  ...put('d-appelli', '24,8', ['24', '25', '26']),
  sol: `Media ponderata con i promossi come pesi: (20 · 24 + 60 · 26 + 20 · 22) ÷ 100 = (480 + 1.560 + 440) ÷ 100 = 24,8.`,
  trap: `24 è la media semplice dei tre voti medi (24, 26 e 22), che non tiene conto dei 60 promossi di giugno; 26 è il voto medio dell'appello più numeroso; 25 è un valore intermedio a occhio.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-certificati', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `La maggior parte degli iscritti a un corso di formazione ha svolto il tirocinio.`,
    `Tutti gli iscritti che hanno svolto il tirocinio hanno ottenuto la certificazione.`
  ], [
    `A. Più della metà degli iscritti ha ottenuto la certificazione.`,
    `B. Tutti gli iscritti hanno ottenuto la certificazione.`,
    `C. Qualche iscritto ha svolto il tirocinio.`,
    `D. Chi non ha svolto il tirocinio non ha ottenuto la certificazione.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Sia la A sia la C', 'Solo la A', 'Sia la B sia la D', 'Sia la C sia la D'], ans: 0,
  sol: `«La maggior parte» significa più della metà: più della metà degli iscritti ha svolto il tirocinio e tutti questi hanno ottenuto la certificazione, quindi più della metà ha ottenuto la certificazione (A vera) e qualche iscritto ha svolto il tirocinio (C vera). B non è sicura: chi non ha svolto il tirocinio potrebbe avere ottenuto lo stesso la certificazione. D è l'inverso del secondo dato e non è sicura.`,
  trap: `La D inverte l'implicazione «tirocinio → certificazione»; la B estende «tutti quelli che hanno svolto il tirocinio» a «tutti». Per la A basta leggere «la maggior parte» come «più della metà».`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-produzione', diff: 'media', lang: 'it', asset: gProduzione(),
  stem: `In quale mese la produzione per ora lavorata è stata la più alta?`,
  ...put('d-produzione', 'Febbraio', ['Gennaio', 'Aprile', 'Maggio']),
  sol: `Pezzi per ora: gennaio 500 ÷ 100 = 5; febbraio 720 ÷ 120 = 6; marzo 750 ÷ 150 = 5; aprile 880 ÷ 160 = 5,5; maggio 1.000 ÷ 200 = 5. Il valore più alto è quello di febbraio.`,
  trap: `Guardare il mese con più pezzi prodotti (maggio, 1.000) o con più ore lavorate: la produzione per ora è un rapporto. Maggio ha il maggior numero di pezzi ma uno dei rapporti più bassi.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-treno', diff: 'media', lang: 'it', ds: true,
  stem: ds('Su 200 pendolari, 120 usano il treno e 100 usano l\'autobus (alcuni usano entrambi i mezzi). Quanti pendolari usano il treno ma non l\'autobus?',
    'I pendolari che usano entrambi i mezzi sono 40.',
    'I pendolari che non usano nessuno dei due mezzi sono 20.'),
  ...dsq('ACDB', 'C'),
  sol: `Sia x il numero di pendolari che usano entrambi i mezzi: chi usa solo il treno è 120 − x. (1): x = 40 e quindi 120 − 40 = 80. (2): chi usa almeno un mezzo è 200 − 20 = 180 e 120 + 100 − x = 180, quindi x = 40 e di nuovo 80. Ciascuna affermazione, da sola, basta.`,
  trap: `Pensare che la (2) non basti perché non cita chi usa entrambi i mezzi: i pendolari senza mezzo (20) permettono di ricavare chi li usa entrambi. Le due affermazioni sono coerenti (x = 40) ma ciascuna basta da sola.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-ciclista', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Un ciclista ha percorso 60 km. Qual è stata la sua velocità media sull\'intero percorso?',
    'Ha impiegato 3 ore in tutto.',
    'Ha percorso i primi 30 km a 15 km/h e gli altri 30 km a 30 km/h.'),
  ...dsq('DACB', 'C'),
  sol: `(1): velocità media = 60 ÷ 3 = 20 km/h. (2): i primi 30 km richiedono 30 ÷ 15 = 2 ore e gli altri 30 km richiedono 30 ÷ 30 = 1 ora, in tutto 3 ore, quindi 60 ÷ 3 = 20 km/h. Ciascuna affermazione, da sola, basta.`,
  trap: `Con la (2) si è tentati di fare la media semplice delle due velocità ((15 + 30) ÷ 2 = 22,5 km/h): le due metà del percorso hanno la stessa lunghezza ma durate diverse, quindi la media va calcolata sul tempo totale. Le due affermazioni sono coerenti (3 ore) ma ciascuna basta da sola.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-libri', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Una libreria ha venduto 40 libri a tre prezzi: 10, 15 e 20 euro.`,
    `I libri da 15 euro sono 20.`,
    `L'incasso totale è stato di 640 euro.`
  ], [
    `A. I libri da 10 euro sono più di quelli da 20 euro.`,
    `B. I libri da 20 euro sono più del doppio di quelli da 10 euro.`,
    `C. I libri da 15 euro sono più di quelli da 20 euro.`,
    `D. Sono stati venduti 14 libri da 10 euro.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la D', 'Sia la A sia la D', 'Sia la B sia la C', 'Sia la A sia la B'], ans: 1,
  sol: `Siano x i libri da 10 euro e w quelli da 20 euro: x + w = 40 − 20 = 20 e 10x + 20w + 15 · 20 = 640, quindi 10x + 20w = 340. Da x + 2w = 34 e x + w = 20 si ricava w = 14 e x = 6. A: 6 non è più di 14 (falsa). B: 14 è più del doppio di 6 (vera). C: 20 è più di 14 (vera). D: i libri da 10 euro sono 6, non 14 (falsa).`,
  trap: `La D scambia i due insiemi: 14 è il numero dei libri da 20 euro. La B e la C sono vere, quindi con la consegna «false» non vanno indicate.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-xy', diff: 'media', lang: 'it', ds: true,
  stem: ds('Quanto vale x + y?',
    'x − y = 4.',
    'x² − y² = 20.'),
  ...dsq('DBAC', 'B'),
  sol: `(1): conosciamo solo la differenza: x + y può valere qualsiasi numero. (2): x² − y² = (x − y)(x + y) = 20 fissa il prodotto dei due fattori, ma non x + y da solo. Insieme: 4 · (x + y) = 20, quindi x + y = 5.`,
  trap: `Pensare che la (2) basti perché «contiene» x e y: x² − y² = (x − y)(x + y) fissa solo il prodotto, e x + y dipende da x − y. Servono entrambe: la (1) dà il fattore x − y, la (2) il prodotto.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-marche', diff: 'media', lang: 'it', asset: gMarche(),
  stem: `Quanti pezzi vende la marca Q, la più venduta tra le tre «altre marche»?`,
  ...put('d-marche', '400.000 pezzi', ['200.000 pezzi', '500.000 pezzi', '800.000 pezzi']),
  sol: `Le altre marche vendono il 40% di 2 milioni, cioè 800.000 pezzi, ripartiti nel rapporto 1 : 2 : 1 (4 parti in tutto). Una parte vale 800.000 ÷ 4 = 200.000 pezzi: la marca Q, con 2 parti, vende 400.000 pezzi.`,
  trap: `800.000 sono tutte le altre marche insieme; 200.000 è una sola parte (la marca P o la R); 500.000 è la marca Y (25% di 2 milioni). Il rapporto 1 : 2 : 1 ripartisce la fetta del 40%, non il mercato intero.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-prodotti', diff: 'media', lang: 'it', asset: tProdotti(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-prodotti', `Il totale delle vendite del 2025 supera di più del 20% quello del 2023.`,
    [`La quota del prodotto A sul totale delle vendite è aumentata ogni anno.`,
     `Le vendite del prodotto C nel 2025 sono più del doppio di quelle del 2023.`,
     `Il prodotto D è aumentato della stessa quantità in ogni anno.`]),
  sol: `Totali: 2023: 42 + 90 + 31 + 20 = 183; 2024: 46 + 88 + 45 + 25 = 204; 2025: 50 + 84 + 60 + 31 = 225. Poiché 183 · 1,2 = 219,6 < 225, il totale è cresciuto di più del 20% (circa 23%). La quota di A è 23,0%, 22,5% e 22,2%: diminuisce. Il doppio di 31 è 62 > 60. D cresce di 5 e poi di 6.`,
  trap: `Le vendite di A crescono in valore assoluto (42, 46, 50) ma meno del totale, quindi la sua quota scende. Il 60 di C è appena sotto il doppio di 31 (62). D non cresce di una quantità costante (+5, poi +6).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-fatturato', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Il fatturato complessivo di un\'azienda è cresciuto nel 2025 rispetto al 2024?',
    'Il fatturato in Italia è diminuito del 5%.',
    'Il fatturato all\'estero è aumentato del 10%.'),
  ...dsq('ABCD', 'D'),
  sol: `La variazione complessiva è −5% · I + 10% · E, dove I ed E sono i fatturati del 2024 in Italia e all'estero. È positiva se E > I ÷ 2, cioè se l'estero vale più di un terzo del totale, ma né una affermazione né l'altra né le due insieme dicono quanto pesino Italia ed estero. Con I = 100 ed E = 20 il fatturato scende; con I = 100 ed E = 100 sale.`,
  trap: `Fare la media semplice delle due variazioni (−5% e +10% → +2,5%) e rispondere «sì»: le variazioni vanno pesate con i fatturati di partenza, che non sono noti. Anche con entrambe le informazioni servono i pesi.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-reparti', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Un'azienda ha 200 dipendenti: il 40% lavora in produzione e il 60% in ufficio.`,
    `In produzione il 25% dei dipendenti è donna.`,
    `In ufficio il 50% dei dipendenti è donna.`
  ], [
    `A. Le donne sono il 40% dei dipendenti.`,
    `B. Gli uomini in ufficio sono più degli uomini in produzione.`,
    `C. Le donne in produzione sono meno di un quarto di tutte le donne.`,
    `D. Gli uomini sono 120.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la D', 'Sia la B sia la C', 'Sia la A sia la D', 'Sia la A sia la B'], ans: 2,
  sol: `Produzione: 80 dipendenti, di cui 20 donne e 60 uomini. Ufficio: 120 dipendenti, di cui 60 donne e 60 uomini. Le donne sono 20 + 60 = 80, cioè il 40% (A vera); gli uomini sono 60 + 60 = 120 (D vera). B: gli uomini sono 60 in produzione e 60 in ufficio, quindi non «più» (falsa). C: le donne in produzione sono 20 su 80, esattamente un quarto, non «meno di» un quarto (falsa).`,
  trap: `La B e la C sono false «per un soffio»: un'uguaglianza non è né «più» né «meno». Dimenticare di applicare le percentuali ai due reparti (80 e 120) porta a numeri sbagliati.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-corsi', diff: 'difficile', lang: 'it', asset: tCorsi(),
  stem: `Tra gli iscritti ai corsi di livello intermedio, quale percentuale studia tedesco?`,
  ...put('d-corsi', 'circa il 24%', ['il 50%', 'circa il 9%', 'circa il 29%']),
  sol: `Il dato mancante si ricava dal totale di riga: tedesco intermedi = 40 − 10 − 10 = 20 (e la colonna dà lo stesso: 85 − 40 − 25 = 20). Gli iscritti ai livelli intermedi sono 85 e quelli di tedesco sono 20 su 85: 20 ÷ 85 ≈ 23,5%, cioè circa il 24%.`,
  trap: `Il 50% è la quota di intermedi dentro il corso di tedesco (20 su 40): la base è sbagliata; circa il 9% divide per il totale degli iscritti (20 su 220); circa il 29% è la quota del francese (25 su 85).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-quadrato', diff: 'media', lang: 'it', ds: true,
  stem: ds('È vero che il perimetro di un quadrato è maggiore di 40 cm?',
    'La diagonale del quadrato è maggiore di 15 cm.',
    'Il lato del quadrato misura un numero intero di centimetri.'),
  ...dsq('BCDA', 'A'),
  sol: `Il perimetro supera 40 cm se il lato supera 10 cm. (1): se il lato fosse 10 cm la diagonale sarebbe 10 · 1,41 = 14,1 cm, meno di 15: una diagonale maggiore di 15 cm richiede un lato maggiore di 10 cm (circa 10,6 cm). La risposta è sempre «sì» e la (1) basta. (2): il lato intero può essere 8 (no) o 12 (sì): non basta.`,
  trap: `Pensare che la (1) non basti perché dà la diagonale e non il lato: per una domanda sì/no basta un limite (lato > 10). La (2) non dà alcun limite.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-pezzi', diff: 'difficile', lang: 'it', asset: gPezzi(),
  stem: `Qual è stato l'utile dell'anno, cioè i ricavi meno i costi di produzione?`,
  ...put('d-pezzi', '1.580.000 €', ['1.980.000 €', '1.080.000 €', '1.530.000 €']),
  sol: `Ricavi: (30 + 50) · 20 = 1.600 e (40 + 60) · 25 = 2.500 migliaia di euro, in tutto 4.100. Costi: 180 mila pezzi · 14 € = 2.520 migliaia di euro. Utile: 4.100 − 2.520 = 1.580 migliaia di euro.`,
  trap: `1.980.000 € applica 25 € a tutti i pezzi; 1.080.000 € applica 20 € a tutti i pezzi; 1.530.000 € usa il prezzo medio semplice di 22,50 € invece di pesare i prezzi con i pezzi venduti (il prezzo medio ponderato è circa 22,78 €).`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-premio', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Se un dipendente ha ricevuto il premio, allora ha superato la valutazione.`,
    `Chi non ha superato la valutazione non può essere promosso.`,
    `Marco è stato promosso.`
  ], [
    `A. Marco ha superato la valutazione.`,
    `B. Marco ha ricevuto il premio.`,
    `C. Marco non ha superato la valutazione.`,
    `D. Marco ha ricevuto il premio senza avere superato la valutazione.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la C', 'Sia la B sia la D', 'Sia la C sia la D', 'Sia la A sia la B'], ans: 2,
  sol: `Marco è stato promosso e chi non supera la valutazione non può essere promosso: Marco ha superato la valutazione (A vera, C falsa). Il premio non è sicuro (B): il primo dato dice che il premio implica la valutazione, non il contrario. D è falsa: chi ha ricevuto il premio ha superato la valutazione.`,
  trap: `La B è tentante, ma richiederebbe l'implicazione inversa («valutazione → premio»), che non è data: non è né sicuramente vera né sicuramente falsa. Con la consegna «false» non va indicata la A, che è vera.`,
  patt: 'Consegna: sicuramente falsa' }
];

/* ================ DISPOSIZIONE IN SCHERMATE DA TRE ================ */
const ROT = ['VDQ', 'DQV', 'QVD', 'VQD', 'DVQ', 'QDV'];
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
  id: '26',
  title: 'Mock 26',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'NOTA',
  questions: QUESTIONS,
  data: DATA
};
});
