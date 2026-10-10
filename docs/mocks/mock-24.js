/* =======================================================================
   Mock 24 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
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
   la domanda per gli script di verifica (tools/check_math_24.py).
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
  'q-scala': 1,
  'q-ricavo': 3,
  'q-calzini': 0,
  'q-voti-medie': 0,
  'q-stesso-giorno': 1,
  'q-dirigenti': 0,
  'q-aum-dim': 3,
  'q-cubi': 0,
  'q-coppie': 1,
  'q-cambio': 3,
  'q-gioco': 0,
  'q-serbatoio': 2,
  'q-eta': 3,
  'q-zeri': 0,
  'q-fibonacci': 1,
  'q-orologio': 2,
  'q-ricetta': 3,
  'q-vero-falso': 1,
  'v-debito': 2,
  'v-triage': 0,
  'v-quota': 3,
  'v-bonus': 1,
  'v-lettura': 2,
  'v-affitto': 0,
  'v-straordinari': 1,
  'v-parcheggio': 3,
  'v-assunzione': 2,
  'v-scuola': 0,
  'v-furti': 3,
  'd-promossi': 1,
  'd-retribuzioni': 2,
  'd-prezzi': 0,
  'd-variazioni': 3,
  'd-fatturato': 0
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
  /* partecipanti a quattro corsi di recupero e tasso di promozione (%) di ciascun corso */
  promossi: { corsi: ['A', 'B', 'C', 'D'], partecipanti: [100, 200, 50, 150], tasso: [90, 60, 80, 40] },
  /* prezzi mensili (euro) di due prodotti */
  prezzi: { mesi: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'], X: [40, 42, 45, 48, 54, 60], Y: [35, 36, 40, 40, 45, 50] },
  /* fatturato per area (% del totale) e fatturato dell'Estero (milioni di euro) */
  fatturato: { voci: [['Nord', 35], ['Centro', 25], ['Sud', 20], ['Estero', 20]], estero: 6 },
  /* retribuzione mensile: parte fissa e compenso per pezzo */
  retribuzioni: { nomi: ['Anna', 'Bruno', 'Carla'], fisso: [600, 400, 0], pezzo: [4, 5, 8] },
  /* pacchi (migliaia) per servizio e città; cella nascosta (null) da ricostruire con i totali */
  corriere: { citta: ['Milano', 'Torino', 'Roma'], standard: [60, 45, 30], express: [30, null, 20], economy: [10, 20, 50], totRiga: [100, 80, 100], totCol: [135, 65, 80, 280] },
  /* ricavi 2024 (migliaia di euro) di quattro prodotti e variazione % nel 2025 */
  ricavi: { prodotti: ['A', 'B', 'C', 'D'], y24: [200, 300, 100, 400], var: [10, -10, 50, 5] }
};

/* ======================= tabelle e grafici ======================= */
function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

function gPromossi() {
  const D = DATA.promossi;
  return `<figure class="fig"><figcaption>Partecipanti a quattro corsi di recupero</figcaption>` + C.bars({
    labels: D.corsi.map(c => 'Corso ' + c), series: [{ name: 'Partecipanti', values: D.partecipanti }], max: 220, legend: false,
    aria: 'Istogramma dei partecipanti ai corsi di recupero: ' + D.corsi.map((c, i) => 'corso ' + c + ' ' + D.partecipanti[i]).join(', ') + '.'
  }) + `<p class="fig-note">Tasso di promozione: ${D.corsi.map((c, i) => 'corso ' + c + ' ' + D.tasso[i] + '%').join(', ')}.</p></figure>`;
}

function gPrezzi() {
  const D = DATA.prezzi;
  return `<figure class="fig"><figcaption>Prezzo mensile di due prodotti, in euro</figcaption>` + C.line({
    labels: D.mesi,
    series: [{ name: 'Prodotto X', values: D.X }, { name: 'Prodotto Y', values: D.Y, dash: '5 4' }],
    lo: 30, hi: 65, gridFrom: 30, gridTo: 60, gridStep: 10, L: 58, R: 22, legend: true, title: 'euro',
    aria: 'Linee dei prezzi mensili: prodotto X ' + D.mesi.map((m, i) => m + ' ' + D.X[i]).join(', ') + '; prodotto Y ' + D.mesi.map((m, i) => m + ' ' + D.Y[i]).join(', ') + '.'
  }) + `</figure>`;
}

function gFatturato() {
  const D = DATA.fatturato;
  return `<figure class="fig"><figcaption>Come un'azienda ripartisce il fatturato di quest'anno per area</figcaption>` + C.pie({
    data: D.voci, title: 'Fatturato',
    aria: 'Torta con le quote del fatturato per area: ' + D.voci.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `<p class="fig-note">Quest'anno il fatturato dell'Estero è di ${D.estero} milioni di euro.</p></figure>`;
}

function tRetribuzioni() {
  const D = DATA.retribuzioni;
  return C.table({
    caption: 'Retribuzione mensile: parte fissa e compenso per ogni pezzo prodotto, in euro',
    head: ['Lavoratore', 'Parte fissa (€)', 'Per ogni pezzo (€)'],
    rows: D.nomi.map((n, i) => [n, D.fisso[i], D.pezzo[i]])
  }) + `<p class="fig-note">La retribuzione mensile è la parte fissa più il compenso per ogni pezzo prodotto nel mese.</p>`;
}

function tCorriere() {
  const D = DATA.corriere, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Pacchi spediti da un corriere, per città e servizio, in migliaia',
    head: ['Città', 'Standard', 'Express', 'Economy', 'Totale'],
    rows: D.citta.map((s, i) => [s, D.standard[i], c(D.express[i]), D.economy[i], D.totRiga[i]]),
    foot: ['Totale'].concat(D.totCol)
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato.</p>`;
}

function tRicavi() {
  const D = DATA.ricavi;
  return C.table({
    caption: 'Ricavi 2024 e variazione nel 2025 di quattro prodotti',
    head: ['Prodotto', 'Ricavi 2024 (migliaia di €)', 'Variazione nel 2025'],
    rows: D.prodotti.map((p, i) => [p, D.y24[i], (D.var[i] > 0 ? '+' : '−') + Math.abs(D.var[i]) + '%'])
  });
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-scala', diff: 'facile', lang: 'it',
  stem: `Su una mappa in scala 1:25.000 due paesi distano 12 cm. Quanti chilometri li separano nella realtà?`,
  ...put('q-scala', '3 km', ['30 km', '0,3 km', '300 km']),
  sol: `12 cm sulla mappa sono 12 · 25.000 = 300.000 cm nella realtà, cioè 3.000 m, cioè 3 km.`,
  trap: `Gli errori sono di unità: 30 km, 0,3 km e 300 km spostano la virgola di una, due o tre cifre. 100.000 cm fanno 1 km, quindi 300.000 cm sono 3 km.`,
  patt: 'Proporzioni' },

{ k: 'q-ricavo', diff: 'media', lang: 'it',
  stem: `Un bar aumenta del 20% il prezzo del caffè e perde il 10% dei clienti che lo ordinavano. Di quanto varia l'incasso del caffè?`,
  ...put('q-ricavo', '+8%', ['+10%', '+32%', '−10%']),
  sol: `L'incasso è prezzo per quantità: il prezzo diventa 1,2 volte e le vendite 0,9 volte. 1,2 · 0,9 = 1,08, cioè +8%.`,
  trap: `+10% somma l'aumento e il calo (20% − 10%) invece di moltiplicare i fattori; +32% = 1,2 · 1,1 usa +10% al posto di −10%; −10% guarda solo la perdita di clienti.`,
  patt: 'Percentuali composte' },

{ k: 'q-calzini', diff: 'media', lang: 'it',
  stem: `In un cassetto ci sono 8 calzini rossi, 8 verdi e 8 blu, tutti sciolti. Al buio, qual è il numero minimo di calzini da prendere per essere certi di averne almeno 3 dello stesso colore?`,
  ...put('q-calzini', '7', ['9', '6', '4']),
  sol: `Il caso peggiore è prenderne 2 per colore: 2 + 2 + 2 = 6 calzini senza tre uguali. Il settimo calzino deve necessariamente essere il terzo di uno dei colori.`,
  trap: `9 = 3 per colore (conta il caso migliore per ciascun colore); 6 è il numero di calzini che si possono prendere senza alcuna garanzia; 4 è la risposta per avere solo 2 calzini uguali. Si ragiona sul caso peggiore.`,
  patt: 'Ragionamento laterale' },

{ k: 'q-voti-medie', diff: 'media', lang: 'it',
  stem: `La media di cinque verifiche di uno studente è 6,4. Le prime tre hanno media 6. Qual è la media delle ultime due?`,
  ...put('q-voti-medie', '7', ['6,8', '6,4', '7,5']),
  sol: `Somma di tutte e cinque: 5 · 6,4 = 32. Somma delle prime tre: 3 · 6 = 18. Le ultime due sommano 32 − 18 = 14 e la loro media è 14 ÷ 2 = 7.`,
  trap: `6,8 somma alla media totale lo scarto delle prime tre (0,4) senza pesarlo: le prime tre sono 3 contro 2 e pesano di più, quindi le ultime due devono compensare con 0,4 · 3 ÷ 2 = 0,6. 6,4 e 7,5 sono valori «a occhio».`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-stesso-giorno', diff: 'difficile', lang: 'it',
  stem: `Tre persone scelte a caso sono nate ciascuna in un giorno della settimana (tutti i giorni sono ugualmente probabili). Qual è la probabilità che almeno due siano nate nello stesso giorno della settimana?`,
  ...put('q-stesso-giorno', fr(19, 49), [fr(1, 7), fr(30, 49), fr(3, 7)]),
  sol: `Conviene calcolare l'evento contrario: tre giorni tutti diversi. Casi favorevoli 7 · 6 · 5 = 210 su 7³ = 343 casi: 210/343 = 30/49. Quindi la probabilità cercata è 1 − 30/49 = 19/49.`,
  trap: `30/49 è la probabilità dell'evento contrario (tre giorni tutti diversi); 1/7 è la probabilità che due persone fissate coincidano; 3/7 = 3 · 1/7 somma le tre coppie contando due volte i casi in cui coincidono tutte e tre.`,
  patt: 'Probabilità: evento contrario' },

{ k: 'q-dirigenti', diff: 'media', lang: 'it',
  stem: `In un'azienda il 60% dei dipendenti è di sesso maschile. Il 10% degli uomini e il 25% delle donne sono dirigenti. Tra i dirigenti, qual è la percentuale di donne?`,
  ...put('q-dirigenti', '62,5%', ['25%', '40%', '50%']),
  sol: `Su 100 dipendenti: 60 uomini, di cui il 10% = 6 dirigenti; 40 donne, di cui il 25% = 10 dirigenti. I dirigenti sono 16 e 10 sono donne: 10 ÷ 16 = 62,5%.`,
  trap: `25% è la quota di dirigenti tra le donne (un rapporto con un'altra base); 40% è la quota di donne sul totale dei dipendenti; 50% è un valore «medio» a occhio. Le percentuali vanno trasformate in numeri prima di fare il rapporto.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-aum-dim', diff: 'media', lang: 'it',
  stem: `Il numero x, aumentato del 20%, è uguale al numero y, diminuito del 20%. Quanto vale il rapporto x/y?`,
  ...put('q-aum-dim', fr(2, 3), [fr(3, 2), fr(4, 5), fr(1, 1)]),
  sol: `La condizione è 1,2 · x = 0,8 · y. Quindi x/y = 0,8 ÷ 1,2 = 8/12 = 2/3.`,
  trap: `3/2 capovolge il rapporto; 4/5 = 0,8 ÷ 1 usa solo uno dei due fattori; 1 pensa che +20% e −20% «si annullino». Le due percentuali hanno basi diverse (x e y).`,
  patt: 'Base della percentuale' },

{ k: 'q-cubi', diff: 'media', lang: 'it',
  stem: `Quanti numeri interi da 1 a 100 non sono né quadrati perfetti né cubi perfetti?`,
  ...put('q-cubi', '88', ['86', '90', '84']),
  sol: `Quadrati perfetti tra 1 e 100: 1, 4, …, 100, cioè 10. Cubi perfetti: 1, 8, 27, 64, cioè 4. Sia quadrati sia cubi (sesta potenza): 1 e 64, cioè 2. Quadrati o cubi: 10 + 4 − 2 = 12. Gli altri sono 100 − 12 = 88.`,
  trap: `86 = 100 − 14 non toglie i numeri contati due volte (1 e 64); 90 considera solo i quadrati; 84 = 100 − 16 somma invece di sottrarre i comuni.`,
  patt: 'Insiemi e sovrapposizioni' },

{ k: 'q-coppie', diff: 'difficile', lang: 'it',
  stem: `Quattro coppie di amici (otto persone) si siedono in fila su otto sedie, in modo che i due componenti di ciascuna coppia siano sempre vicini. In quanti modi diversi possono sedersi?`,
  ...put('q-coppie', '384', ['192', '24', '40.320']),
  sol: `Ogni coppia è un blocco: i 4 blocchi si dispongono in 4! = 24 modi. In ogni blocco i due amici possono scambiarsi: 2 modi per ciascuna delle 4 coppie, cioè 2⁴ = 16. In tutto 24 · 16 = 384.`,
  trap: `192 = 24 · 8 dimentica lo scambio in una delle coppie; 24 ignora l'ordine all'interno delle coppie; 40.320 = 8! non tiene conto del vincolo di restare vicini.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-cambio', diff: 'media', lang: 'it',
  stem: `Un turista cambia 500 € in dollari al cambio di 1,10 dollari per euro; al ritorno riconverte tutti i dollari in euro al cambio di 1,25 dollari per euro. Quanti euro riceve?`,
  ...put('q-cambio', '440 €', ['500 €', '450 €', '475 €']),
  sol: `500 € diventano 500 · 1,10 = 550 dollari. Riconvertendoli con 1,25 dollari per euro si ottengono 550 ÷ 1,25 = 440 €.`,
  trap: `500 € suppone che i due cambi si compensino; 450 € e 475 € sono perdite «a occhio» (10% e 5%). Con un cambio che sale da 1,10 a 1,25 l'euro si è rafforzato e i dollari valgono meno: al ritorno si perde.`,
  patt: 'Dati e passaggi' },

{ k: 'q-gioco', diff: 'media', lang: 'it',
  stem: `Un gioco costa 2 € a partita. Si lanciano due dadi equilibrati e si vincono 9 € se la somma è 7; altrimenti non si vince nulla. In media, quanto si guadagna (o si perde) per partita?`,
  ...put('q-gioco', 'Si perdono in media 0,50 €', ['Si guadagnano in media 0,50 €', 'Si perdono in media 2 €', 'Si guadagnano in media 7 €']),
  sol: `La somma 7 esce in 6 casi su 36, cioè con probabilità 1/6. La vincita media è 9 · 1/6 = 1,50 €; il costo è 2 €. In media si perdono 2 − 1,50 = 0,50 € a partita.`,
  trap: `«Si guadagnano 7 €» è 9 − 2 solo se si vince; «si perdono 2 €» ignora la possibilità di vincere; «si guadagnano 0,50 €» inverte il segno. Il valore medio pesa la vincita con la sua probabilità.`,
  patt: 'Probabilità: valore atteso' },

{ k: 'q-serbatoio', diff: 'media', lang: 'it',
  stem: `Un serbatoio è pieno per i 3/5 della sua capacità. Dopo aver consumato 24 litri, risulta pieno a metà. Qual è la capacità del serbatoio?`,
  ...put('q-serbatoio', '240 litri', ['40 litri', '120 litri', '60 litri']),
  sol: `Il consumo porta il livello da 3/5 a 1/2 della capacità: 3/5 − 1/2 = 6/10 − 5/10 = 1/10. Quindi 24 litri sono un decimo della capacità, che vale 24 · 10 = 240 litri.`,
  trap: `40 litri = 24 ÷ (3/5) scambia la frazione consumata con quella iniziale; 60 litri = 24 ÷ (2/5) usa la frazione mancante dal pieno; 120 litri è la metà di 240. La frazione che corrisponde ai 24 litri è la differenza tra le due.`,
  patt: 'Frazioni' },

{ k: 'q-eta', diff: 'media', lang: 'it',
  stem: `Anna ha 5 anni più di Bea e Bea ha il doppio degli anni di Carlo. Quanti anni ha Anna?`,
  ...put('q-eta', 'Non è determinabile', ['15 anni', '19 anni', '25 anni']),
  sol: `Se Carlo ha x anni, Bea ne ha 2x e Anna 2x + 5. L'età di Anna dipende da x, che il testo non fornisce: con x = 5 Anna ha 15 anni, con x = 7 ne ha 19, con x = 10 ne ha 25. Non è determinabile.`,
  trap: `Ciascuno dei tre numeri è l'età di Anna per un certo valore di x (5, 7 o 10): sono compatibili con i dati ma nessuno è obbligato. Due condizioni sulle differenze e sui rapporti non bastano a fissare un'età se manca un valore assoluto.`,
  patt: 'Sufficienza dei dati' },

{ k: 'q-zeri', diff: 'difficile', lang: 'it',
  stem: `Con quante cifre 0 termina il numero 25! (il prodotto di tutti gli interi da 1 a 25)?`,
  ...put('q-zeri', '6', ['5', '4', '25']),
  sol: `Ogni zero finale nasce da un fattore 10 = 2 · 5. I fattori 2 sono più numerosi dei fattori 5, quindi contano i 5: i multipli di 5 fino a 25 sono 5, 10, 15, 20, 25 (cinque), ma 25 = 5 · 5 porta un fattore 5 in più. In tutto 5 + 1 = 6 zeri.`,
  trap: `5 conta i multipli di 5 una volta sola e dimentica che 25 ne contiene due; 4 e 25 sono scarti senza ragionamento (25 è il numero stesso). Per i fattoriali si contano i fattori 5, non i fattori 10.`,
  patt: 'Numeri e divisori' },

{ k: 'q-fibonacci', diff: 'media', lang: 'it',
  stem: `In una successione ogni termine, dal terzo in poi, è la somma dei due termini precedenti. Se il primo termine è 2 e il secondo è 3, quanto vale il decimo termine?`,
  ...put('q-fibonacci', '144', ['89', '233', '121']),
  sol: `Si calcolano i termini uno dopo l'altro: 2, 3, 5, 8, 13, 21, 34, 55, 89, 144. Il decimo è 144.`,
  trap: `89 è il nono termine e 233 sarebbe l'undicesimo: basta sbagliare di uno nel conteggio; 121 = 11² non appartiene alla successione. Conviene numerare i termini mentre si scrivono.`,
  patt: 'Successioni' },

{ k: 'q-orologio', diff: 'media', lang: 'it',
  stem: `Un orologio ritarda di 1 minuto ogni 10 minuti reali. Viene regolato alle 8:00 esatte. Quando l'orologio segna le 14:00, che ora è davvero?`,
  ...put('q-orologio', '14:40', ['14:36', '14:06', '14:30']),
  sol: `In 10 minuti reali l'orologio avanza di 9 minuti. Per segnare 6 ore (360 minuti) servono 360 · 10/9 = 400 minuti reali, cioè 6 ore e 40 minuti. L'ora vera è 8:00 + 6:40 = 14:40.`,
  trap: `14:36 somma 6 minuti di ritardo per ogni ora segnata (ma il ritardo si accumula sul tempo reale, non su quello segnato); 14:06 e 14:30 sono valori «a occhio». L'orologio avanza di 9 minuti ogni 10 reali: il tempo reale è maggiore di quello segnato.`,
  patt: 'Proporzioni' },

{ k: 'q-ricetta', diff: 'media', lang: 'it',
  stem: `Una ricetta per 4 persone richiede 300 g di pasta. Per cenare in 10 persone si decide di ridurre del 20% la dose di pasta a testa rispetto alla ricetta. Quanti grammi di pasta servono?`,
  ...put('q-ricetta', '600 g', ['750 g', '625 g', '480 g']),
  sol: `Dose a testa: 300 ÷ 4 = 75 g. Ridotta del 20%: 75 · 0,8 = 60 g. Per 10 persone: 60 · 10 = 600 g.`,
  trap: `750 g non applica la riduzione; 625 g = 750 ÷ 1,2 toglie il 20% con la divisione, che non è la stessa cosa; 480 g = 600 · 0,8 applica la riduzione due volte.`,
  patt: 'Proporzioni' },

{ k: 'q-vero-falso', diff: 'difficile', lang: 'it',
  stem: `Un test ha 10 domande a risposta vero/falso. In quanti modi si può rispondere a tutte le domande dando almeno 8 risposte «vero»?`,
  ...put('q-vero-falso', '56', ['46', '55', '100']),
  sol: `Con esattamente 8 «vero» i modi sono C(10, 8) = 45; con esattamente 9 sono 10; con 10 «vero» è 1. In tutto 45 + 10 + 1 = 56.`,
  trap: `46 e 55 dimenticano un caso (rispettivamente le 45 + 1 con 8 e 10 «vero», o le 45 + 10 senza il 10 su 10); 100 = 10 · 10 moltiplica numeri senza un conteggio dei casi.`,
  patt: 'Combinatoria con vincolo' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-piscina', diff: 'media', lang: 'it',
  claim: `Per un adulto l'abbonamento a dieci ingressi comporta un risparmio del 25% rispetto a dieci ingressi singoli.`,
  passage: `La piscina comunale di Valdora è aperta dal lunedì al sabato. L'ingresso singolo per gli adulti costa 6 euro; l'abbonamento a dieci ingressi costa 48 euro e può essere usato entro sei mesi dall'acquisto. I ragazzi sotto i 14 anni pagano la metà del prezzo degli adulti, sia per l'ingresso singolo sia per l'abbonamento. L'accesso alle corsie per il nuoto libero è consentito fino a un'ora prima della chiusura. Il noleggio della cuffia costa 1 euro e quello dell'asciugamano 2 euro. Nei giorni di maltempo l'area solarium resta chiusa.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «L'ingresso singolo per gli adulti costa 6 euro; l'abbonamento a dieci ingressi costa 48 euro». Dieci ingressi singoli costano 60 euro; con l'abbonamento si pagano 48 euro e si risparmiano 12 euro, cioè 12 ÷ 60 = 20% del costo degli ingressi singoli, non il 25%.`,
  trap: `Il 25% si ottiene dividendo il risparmio per il prezzo dell'abbonamento (12 ÷ 48) invece che per il costo che si sarebbe sostenuto (60). Non è «non ricavabile»: i due prezzi sono espliciti.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-debito', diff: 'media', lang: 'it',
  passage: `Il rapporto debito/PIL misura il debito pubblico di un Paese in percentuale del suo prodotto interno lordo (PIL). Un rapporto più basso è considerato favorevole, perché indica che il Paese ha meno difficoltà a ripagare il debito con il reddito che produce. Nel 2024 il Paese Beta aveva un debito pubblico di 1.200 miliardi di euro e un PIL di 800 miliardi. Nel 2025 il debito è aumentato di 60 miliardi di euro e il PIL è cresciuto del 5%. Il governo ha dichiarato che il rapporto debito/PIL «è migliorato», ma l'opposizione contesta la dichiarazione.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-debito', `Nel 2025 il rapporto debito/PIL è rimasto invariato al 150%.`,
    [`Nel 2025 il rapporto debito/PIL è migliorato, perché il PIL è cresciuto del 5%.`,
     `Nel 2025 il rapporto debito/PIL è peggiorato, perché il debito è aumentato.`,
     `Nel 2025 il rapporto debito/PIL è sceso al 145%.`]),
  sol: `2024: 1.200 ÷ 800 = 150%. 2025: debito 1.200 + 60 = 1.260 miliardi; PIL 800 · 1,05 = 840 miliardi; 1.260 ÷ 840 = 150%. Il rapporto è invariato: il debito cresce del 5% (60 su 1.200), come il PIL.`,
  trap: `Guardare un solo termine del rapporto: il debito è salito, ma anche il PIL e nella stessa misura (+5%). Quando numeratore e denominatore crescono della stessa percentuale il rapporto non cambia. Il 145% è un valore costruito a caso.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-triage', diff: 'media', lang: 'it',
  passage: `Un ospedale ha introdotto un sistema informatico di triage nel pronto soccorso: il tempo medio di attesa dei pazienti non gravi è sceso da 90 a 60 minuti nei sei mesi successivi. La direzione sanitaria ne conclude che il nuovo sistema ha ridotto le attese e propone di adottarlo in tutti gli ospedali della regione. Il sistema è costato 200.000 euro e richiede un breve corso di formazione per il personale. Nel periodo considerato il pronto soccorso ha trattato in media 150 pazienti al giorno.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione della direzione sanitaria?`,
  ...put('v-triage', `Nello stesso periodo l'ospedale ha assunto sei nuovi medici e quattro infermieri destinati al pronto soccorso.`,
    [`Il sistema informatico è stato fornito da un'azienda con sede in un'altra regione.`,
     `La maggior parte dei pazienti non gravi si dichiara soddisfatta del servizio.`,
     `Il corso di formazione per il personale dura due giorni.`]),
  sol: `La conclusione è causale: il nuovo sistema avrebbe ridotto le attese. Se nello stesso periodo sono stati assunti medici e infermieri, la riduzione da 90 a 60 minuti ha una causa alternativa (più personale) che la spiega anche senza il sistema.`,
  trap: `Il fornitore, la soddisfazione dei pazienti e la durata del corso non toccano il nesso tra sistema e attese (la soddisfazione, anzi, lo rafforza). In ogni domanda causale conviene chiedersi che cosa altro è cambiato nello stesso periodo.`,
  patt: 'Cause alternative' },

{ k: 'v-quota', diff: 'difficile', lang: 'it',
  passage: `Nel 2024 in Italia sono stati venduti 10 milioni di smartphone. Nel 2025 il mercato è calato del 20%; la marca X ha venduto 2,7 milioni di unità, il 10% in meno rispetto al 2024. La quota di mercato di una marca è la percentuale delle unità vendute dalla marca sul totale delle unità vendute nel Paese nello stesso anno. I dati provengono da un istituto di ricerca che monitora le vendite nei negozi e online. Il prezzo medio di uno smartphone è rimasto stabile intorno ai 400 euro.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-quota', `Nel 2025 la quota di mercato della marca X è aumentata, anche se le sue vendite in unità sono diminuite.`,
    [`Nel 2025 la quota di mercato della marca X è diminuita, perché le sue vendite sono calate.`,
     `Nel 2025 la quota di mercato della marca X è rimasta uguale al 30%.`,
     `Nel 2025 le vendite della marca X sono calate del 20%, come quelle dell'intero mercato.`]),
  sol: `Mercato 2025: 10 · 0,8 = 8 milioni. Marca X: 2,7 milioni nel 2025 e 2,7 ÷ 0,9 = 3 milioni nel 2024. Quote: 3 ÷ 10 = 30% nel 2024 e 2,7 ÷ 8 = 33,75% nel 2025. Le vendite di X sono calate del 10%, ma meno del mercato (−20%), quindi la quota è salita.`,
  trap: `Associare «vendite in calo» a «quota in calo»: la quota è un rapporto con il mercato, che è calato di più. Il 30% è la quota del 2024; il −20% è il calo del mercato, non quello della marca.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-ristorante', diff: 'media', lang: 'it',
  claim: `Nel 2025 il ristorante ha realizzato un utile superiore a quello del 2024.`,
  passage: `Nel 2025 il ristorante «Il Faro» ha servito 18.000 coperti con uno scontrino medio di 35 euro a persona. Rispetto al 2024 il numero di coperti è aumentato del 12%, mentre lo scontrino medio è rimasto invariato. Il locale ha 14 dipendenti e chiude un giorno a settimana. Nel 2025 ha aperto una seconda sala da 30 posti, che ha richiesto lavori per 80.000 euro. Il proprietario ha dichiarato che l'investimento «ha già dato i suoi frutti». I dati sui coperti sono forniti dal gestionale di cassa del locale.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «il numero di coperti è aumentato del 12%, mentre lo scontrino medio è rimasto invariato» e «ha già dato i suoi frutti». I ricavi sono saliti (da 562.500 a 630.000 euro), ma il brano non dice nulla sui costi, che comprendono i lavori da 80.000 euro e probabilmente altre spese: l'utile non è determinabile.`,
  trap: `Passare da «ricavi più alti» a «utile più alto». Non è «falsa»: il brano non esclude che l'utile sia salito. La frase del proprietario è un'opinione, non un dato.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-bonus', diff: 'media', lang: 'it',
  passage: `Il consiglio di amministrazione della società Delta ha approvato un piano di incentivi per i dirigenti. Se nel 2026 il fatturato supererà i 50 milioni di euro, il fondo bonus complessivo sarà pari al 2% dell'eccedenza rispetto a 50 milioni; se supererà i 60 milioni, il fondo sarà pari al 3% dell'eccedenza rispetto a 50 milioni. Il fondo non potrà in nessun caso superare 500.000 euro. Il piano non prevede bonus per chi lascia la società prima del 31 dicembre. Nel 2025 il fatturato della società è stato di 48 milioni di euro.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-bonus', `Con un fatturato 2026 di 56 milioni di euro il fondo bonus sarebbe di 120.000 euro.`,
    [`Nel 2026 il fatturato supererà sicuramente i 50 milioni di euro, perché nel 2025 era già di 48 milioni.`,
     `Con un fatturato 2026 di 62 milioni di euro il fondo bonus sarebbe di 1,86 milioni di euro, cioè il 3% di 62 milioni.`,
     `Un dirigente che lascia la società a ottobre avrà comunque diritto a una quota proporzionale del bonus.`]),
  sol: `Frasi chiave: «il fondo bonus complessivo sarà pari al 2% dell'eccedenza rispetto a 50 milioni». Con 56 milioni l'eccedenza è 6 milioni e il 2% di 6 milioni è 0,12 milioni, cioè 120.000 euro (corretta). Il 3% si applica all'eccedenza (12 milioni, quindi 360.000 euro), non all'intero fatturato.`,
  trap: `Trasformare una condizione («Se supererà…») in una previsione; applicare la percentuale all'intero fatturato invece che all'eccedenza; ignorare che per chi lascia prima del 31 dicembre non è previsto alcun bonus (non una quota proporzionale).`,
  patt: 'Periodo o ambito spostato' },

{ k: 'v-lettura', diff: 'media', lang: 'it',
  passage: `Un'indagine su 2.000 studenti delle scuole medie mostra che chi legge almeno tre libri all'anno ottiene in italiano un voto medio di 7,5, contro il 6,5 di chi ne legge meno di tre. Un esperto ne conclude che stimolare la lettura migliora i risultati scolastici e propone di destinare 100.000 euro a campagne di promozione nelle scuole. I dati sono stati raccolti con un questionario anonimo e i voti sono quelli dell'ultima pagella. Le scuole coinvolte sono 40, distribuite in tutta la regione.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione dell'esperto?`,
  ...put('v-lettura', `In un esperimento, studenti scelti a caso e incoraggiati a leggere di più hanno migliorato i voti di italiano rispetto a studenti scelti a caso che non sono stati incoraggiati.`,
    [`Gli studenti che leggono di più dichiarano di divertirsi di più a scuola degli altri.`,
     `Le famiglie degli studenti che leggono di più possiedono in media più libri a casa.`,
     `Le scuole coinvolte nell'indagine sono sia statali sia paritarie.`]),
  sol: `La conclusione è causale: la lettura migliorerebbe i voti. L'indagine mostra solo una correlazione (chi legge ha voti migliori, ma potrebbe essere già più bravo o avere famiglie più istruite). Un esperimento con gruppi scelti a caso esclude queste spiegazioni alternative e mostra l'effetto della lettura: rafforza il nesso.`,
  trap: `La terza opzione parla di libri a casa: indica una causa alternativa e indebolisce. Divertirsi a scuola e il tipo di scuola non toccano il nesso causale. Per rafforzare un'ipotesi causale serve un confronto tra gruppi equivalenti.`,
  patt: 'Cause alternative' },

{ k: 'v-polizza', diff: 'media', lang: 'it',
  claim: `Per un danno da collisione di 1.250 euro, riparato in un'officina convenzionata, l'assicurato ottiene un rimborso di 1.000 euro.`,
  passage: `Una polizza auto prevede una franchigia di 250 euro: in caso di sinistro l'assicurazione rimborsa la parte del danno che supera la franchigia, fino al massimale di 5.000 euro. Se il danno è inferiore alla franchigia non si ottiene alcun rimborso. Il premio annuo è di 600 euro; chi non denuncia sinistri per cinque anni consecutivi ottiene uno sconto del 20% sul premio. Le riparazioni devono essere eseguite presso officine convenzionate. Per i danni causati da eventi naturali la franchigia è ridotta a 100 euro.`,
  opts: VFN, ans: 2,
  sol: `Frase chiave: «l'assicurazione rimborsa la parte del danno che supera la franchigia, fino al massimale di 5.000 euro». Danno 1.250, franchigia 250 (non è un evento naturale): rimborso 1.250 − 250 = 1.000 euro, sotto il massimale. L'officina è convenzionata, come richiesto.`,
  trap: `Rispondere «non ricavabile» perché il caso non è citato, oppure applicare la franchigia ridotta (100 euro) che vale solo per gli eventi naturali: la collisione non lo è. L'esempio concreto rientra nella regola generale.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-affitto', diff: 'media', lang: 'it',
  passage: `Un investitore acquista un appartamento a 200.000 euro e lo affitta a 800 euro al mese. Il rendimento lordo annuo è il rapporto tra il canone annuo e il prezzo di acquisto; il rendimento netto si calcola invece sottraendo dal canone annuo le spese (imposte, manutenzione e amministrazione) prima di dividere per il prezzo di acquisto. Le spese annue dell'investitore sono pari a 1.600 euro. L'appartamento è stato affittato per tutti i dodici mesi dell'anno. L'investitore non ha ricevuto contributi pubblici e ha pagato l'acquisto senza mutuo.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-affitto', `Il rendimento lordo annuo è del 4,8% e quello netto del 4%.`,
    [`Il rendimento lordo annuo è del 4% e quello netto del 3,2%.`,
     `Il rendimento lordo annuo è del 4,8% e quello netto del 4,8%, perché le spese sono basse.`,
     `Il rendimento netto annuo è del 3,2%, cioè il 4,8% meno il 1,6% di spese.`]),
  sol: `Canone annuo: 800 · 12 = 9.600 euro; rendimento lordo: 9.600 ÷ 200.000 = 4,8%. Netto: (9.600 − 1.600) ÷ 200.000 = 8.000 ÷ 200.000 = 4%.`,
  trap: `Sottrarre le spese in euro dal rendimento in percentuale: 1.600 euro sono lo 0,8% di 200.000, non l'1,6%. Il rendimento netto non può essere uguale al lordo se ci sono spese.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-straordinari', diff: 'difficile', lang: 'it',
  passage: `Dal contratto di un'azienda di logistica. La paga oraria ordinaria è di 12 euro. Le ore lavorate oltre le 40 settimanali sono straordinari e sono pagate con una maggiorazione del 25% sulla paga oraria. Le ore lavorate la domenica sono pagate con una maggiorazione del 50%. Le due maggiorazioni non si sommano: a un'ora che è al tempo stesso straordinaria e domenicale si applica la sola maggiorazione più alta. Il pagamento degli straordinari richiede l'autorizzazione scritta del responsabile. Il contratto si applica ai dipendenti a tempo pieno, con un orario di lavoro ordinario di 40 ore a settimana.`,
  stem: `Marco, in una settimana in cui ha già lavorato 40 ore dal lunedì al sabato, lavora altre 4 ore la domenica, con regolare autorizzazione scritta del responsabile. Quanto riceve per quelle 4 ore?`,
  ...put('v-straordinari', '72 euro', ['60 euro', '84 euro', '48 euro']),
  sol: `Frase chiave: «a un'ora che è al tempo stesso straordinaria e domenicale si applica la sola maggiorazione più alta». Le 4 ore sono oltre le 40 e di domenica: si applica il 50%. Paga oraria 12 · 1,5 = 18 euro; 18 · 4 = 72 euro.`,
  trap: `60 euro applica solo il 25% degli straordinari (12 · 1,25 · 4); 84 euro somma le due maggiorazioni (75%: 12 · 1,75 · 4), esplicitamente escluso; 48 euro paga le ore con la sola paga ordinaria.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-concorso', diff: 'media', lang: 'it',
  claim: `Un candidato che nella prova scritta ottiene 23 punti su 30 accede al colloquio.`,
  passage: `Il bando di concorso per un posto di ricercatore è riservato ai laureati di età non superiore a 35 anni alla data di scadenza della domanda, fissata al 15 ottobre. La domanda si presenta esclusivamente online. La selezione prevede una prova scritta e un colloquio; accedono al colloquio i candidati che nella prova scritta ottengono almeno 24 punti su 30. Il vincitore ottiene un contratto di tre anni, rinnovabile una sola volta per altri due. Il bando non prevede alcun rimborso per le spese di viaggio dei candidati.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «accedono al colloquio i candidati che nella prova scritta ottengono almeno 24 punti su 30». Con 23 punti la soglia non è raggiunta: l'affermazione è contraddetta.`,
  trap: `Leggere «almeno 24» come «circa 24»: la soglia è netta. Non è «non ricavabile»: il brano indica esplicitamente il punteggio minimo.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-parcheggio', diff: 'media', lang: 'it',
  passage: `L'associazione dei commercianti di Borgonuovo sostiene che le vendite dei negozi del centro storico possono aumentare soltanto se il comune offre parcheggi gratuiti nelle vicinanze. Oggi nel centro storico i parcheggi sono a pagamento e le vendite sono calate del 6% in due anni. L'associazione chiede al comune di rinunciare a circa 300.000 euro l'anno di incassi dei parcheggi. Il centro storico ha 120 negozi e circa 4.000 residenti. Negli ultimi due anni cinque negozi hanno chiuso e tre ne hanno aperti. Il comune ha annunciato che deciderà entro marzo.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la tesi dell'associazione?`,
  ...put('v-parcheggio', `In tutte le città simili a Borgonuovo prive di parcheggi gratuiti vicino al centro, le vendite dei negozi del centro non sono aumentate.`,
    [`In due città simili a Borgonuovo che hanno introdotto parcheggi gratuiti vicino al centro, le vendite dei negozi del centro sono aumentate.`,
     `Il 70% dei commercianti di Borgonuovo è iscritto all'associazione.`,
     `I parcheggi a pagamento di Borgonuovo incassano 300.000 euro l'anno.`]),
  sol: `La tesi è che i parcheggi gratuiti siano una condizione necessaria («soltanto se»): senza di essi le vendite non crescono. La conferma più diretta è che, dove non ci sono, le vendite non sono mai cresciute.`,
  trap: `La seconda opzione è l'esca: mostra che i parcheggi gratuiti sono compatibili con la crescita (condizione sufficiente o utile), ma non che siano indispensabili. Iscritti all'associazione e incassi dei parcheggi non toccano il nesso.`,
  patt: 'Condizione sufficiente vs necessaria' },

{ k: 'v-assunzione', diff: 'difficile', lang: 'it',
  passage: `Una compagnia telefonica annuncia che i clienti sono oggi più soddisfatti, perché il numero di reclami ricevuti è sceso da 12.000 a 9.000 all'anno. Nello stesso periodo il numero di clienti è rimasto di circa 2 milioni. I reclami si presentano attraverso il sito internet o telefonando al servizio clienti, che è aperto dalle 9 alle 18. La compagnia ha ricevuto un premio per la qualità del servizio. L'operatore ha un call center con 300 addetti e offre contratti di telefonia fissa e mobile a famiglie e imprese.`,
  stem: `Su quale assunzione si basa principalmente il ragionamento della compagnia?`,
  ...put('v-assunzione', `Il numero di reclami riflette il grado di insoddisfazione dei clienti: la propensione a reclamare non è diminuita per altri motivi, per esempio perché presentare un reclamo è diventato più difficile.`,
    [`Il servizio clienti è aperto anche il sabato.`,
     `I clienti che presentano un reclamo ottengono sempre un rimborso.`,
     `Il premio per la qualità è stato assegnato da una giuria indipendente.`]),
  sol: `La compagnia passa da «meno reclami» a «clienti più soddisfatti». Il passaggio regge solo se i reclami misurano davvero l'insoddisfazione: se, per esempio, il sito rende più difficile reclamare o il servizio telefonico è meno raggiungibile, i reclami calerebbero anche con clienti scontenti come prima.`,
  trap: `L'orario del servizio, i rimborsi e il premio sono fatti collaterali: non servono per passare dai reclami alla soddisfazione. L'assunzione si trova chiedendosi che cosa renderebbe falsa la conclusione pur con la stessa premessa.`,
  patt: 'Assunzione implicita' },

{ k: 'v-scuola', diff: 'media', lang: 'it',
  passage: `In un liceo con 800 studenti il 55% è costituito da ragazze. Il 30% degli studenti ha scelto il laboratorio di informatica e, tra questi, il 40% sono ragazze. Il laboratorio di teatro è stato scelto dal 20% degli studenti. L'iscrizione ai laboratori è facoltativa e ogni studente può scegliere un solo laboratorio. Il liceo ha due indirizzi, scientifico e linguistico, con lo stesso numero di classi. Le iscrizioni ai laboratori si chiudono a ottobre e le attività si svolgono il pomeriggio, una volta alla settimana, da novembre a maggio.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-scuola', `La quota dei ragazzi che hanno scelto informatica è maggiore di quella delle ragazze.`,
    [`Tra gli studenti del laboratorio di informatica i ragazzi sono 96.`,
     `Più della metà degli studenti ha scelto un laboratorio tra informatica e teatro.`,
     `Le ragazze che hanno scelto informatica sono il 40% di tutte le ragazze.`]),
  sol: `Ragazze: 55% di 800 = 440; ragazzi: 360. Informatica: 30% di 800 = 240 studenti, di cui 96 ragazze (40%) e 144 ragazzi. Quota di ragazzi in informatica: 144 ÷ 360 = 40%; quota di ragazze: 96 ÷ 440 ≈ 21,8%. La prima è maggiore (corretta).`,
  trap: `Il 40% è la quota di ragazze tra gli studenti di informatica, non tra tutte le ragazze: le basi sono diverse. I ragazzi del laboratorio sono 144 (non 96); informatica più teatro fanno il 50%, cioè esattamente la metà, non «più della metà».`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-sondaggio', diff: 'media', lang: 'it',
  claim: `Più di 550 degli intervistati si sono dichiarati favorevoli alla nuova zona a traffico limitato.`,
  passage: `In un sondaggio condotto su 1.200 abitanti di una città, il 35% degli intervistati si è dichiarato contrario alla nuova zona a traffico limitato, mentre il 15% ha risposto di non avere un'opinione. Gli altri intervistati si sono dichiarati favorevoli. Le interviste sono state svolte per telefono nell'arco di una settimana di giugno. Il comune ha spiegato che la zona a traffico limitato entrerà in vigore a settembre e che i residenti potranno ottenere un permesso gratuito per un'auto per nucleo familiare.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «il 35% … contrario», «il 15% … non avere un'opinione» e «Gli altri intervistati si sono dichiarati favorevoli». I favorevoli sono il 100% − 35% − 15% = 50% di 1.200 = 600, più di 550. L'affermazione è vera.`,
  trap: `Contare come favorevoli anche i senza opinione (il 65% dei non contrari sarebbe 780) darebbe lo stesso verdetto con un ragionamento sbagliato: il calcolo corretto è 50% = 600. Non è «non ricavabile»: i favorevoli sono determinati per differenza.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-furti', diff: 'media', lang: 'it',
  passage: `Il comune di Riva Alta afferma che l'installazione di telecamere nelle piazze del centro ha dimezzato i furti: nell'anno successivo i furti denunciati in centro sono scesi da 400 a 200. L'amministrazione intende installare altre 50 telecamere nei quartieri periferici, con una spesa di 150.000 euro. Il comune ha 40.000 abitanti e le telecamere del centro sono 30. I furti sono contati in base alle denunce presentate alla polizia locale e ai carabinieri. I dati del 2025 sono stati presentati dal sindaco in consiglio comunale.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione del comune?`,
  ...put('v-furti', `L'andamento dei furti denunciati, nello stesso periodo, nelle zone della città senza telecamere.`,
    [`Il numero di abitanti del centro storico.`,
     `La marca delle telecamere installate.`,
     `Il costo di manutenzione annuo delle telecamere.`]),
  sol: `Il comune attribuisce il dimezzamento dei furti in centro alle telecamere. Se nelle zone senza telecamere i furti sono aumentati, forse si sono solo spostati; se sono calati anche lì, la causa potrebbe essere generale. L'andamento nelle zone di controllo è il dato che verifica l'attribuzione.`,
  trap: `Abitanti, marca e costo di manutenzione non dicono se il calo sia dovuto alle telecamere. Il confronto con le zone senza telecamere è l'anello debole dell'argomento.`,
  patt: 'Dato mancante' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-tedesco', diff: 'media', lang: 'it', ds: true,
  stem: ds('In un gruppo di 40 persone, è vero che meno di un quarto parla tedesco?',
    'Chi parla tedesco parla anche francese, e le persone che parlano francese sono 8.',
    'Le persone che parlano tedesco sono almeno 5.'),
  ...dsq('CBAD', 'A'),
  sol: `Un quarto di 40 è 10. (1): i germanofoni sono un sottoinsieme dei francofoni, quindi sono al massimo 8, meno di 10: la risposta è sempre «sì» e la (1) basta. (2): «almeno 5» è compatibile con 6 (sì) e con 12 (no): non basta.`,
  trap: `Pensare che la (1) non basti perché non dà il numero esatto di germanofoni: per una domanda sì/no basta un limite superiore. La (2) dà solo un minimo, che non aiuta a stare sotto 10.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-test', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Carla ha risposto correttamente a più di 30 domande di un test di 40 domande?',
    'Carla ha sbagliato o lasciato in bianco meno di 8 domande.',
    'Carla ha sbagliato esattamente 3 domande.'),
  ...dsq('DABC', 'A'),
  sol: `(1): sbagliate più in bianco sono al massimo 7, quindi le giuste sono almeno 40 − 7 = 33, più di 30: la risposta è sempre «sì» e la (1) basta. (2): le giuste sono 37 − (domande in bianco): con 0 in bianco sono 37 (sì), con 10 in bianco sono 27 (no): non basta.`,
  trap: `Considerare la (2) sufficiente: se non si sa quante domande sono state lasciate in bianco, le giuste non si ricavano dalle sole sbagliate (nel test vero le omesse non sono errori). La (1) include sia le sbagliate sia le omesse.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-aula', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Un'aula ha 40 posti, tutti occupati da studenti di tre corsi: A, B e C.`,
    `Gli studenti del corso A sono il doppio di quelli del corso B.`,
    `Gli studenti del corso C sono 10.`
  ], [
    `A. Il corso B ha 10 studenti.`,
    `B. Il corso A ha più studenti dei corsi B e C insieme.`,
    `C. Gli studenti del corso C sono un quarto del totale.`,
    `D. Il corso A ha meno di 15 studenti.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la B sia la D', 'Sia la A sia la C', 'Solo la C'], ans: 2,
  sol: `A e B sommano 40 − 10 = 30 studenti, con A = 2B: 3B = 30, quindi B = 10 e A = 20 (A vera). C: 10 su 40 è un quarto (vera). B: A ha 20 studenti e B + C ne hanno 10 + 10 = 20, quindi non «di più» (falsa). D: A ha 20 studenti, non meno di 15 (falsa).`,
  trap: `La B è vera «per un soffio»: 20 contro 20 è un'uguaglianza, non un «più»; con numeri vicini conviene calcolare tutto. Dimenticare di sottrarre i 10 del corso C porterebbe a B = 13,3 e a valori non interi.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-promossi', diff: 'media', lang: 'it', asset: gPromossi(),
  stem: `Qual è la percentuale complessiva di promossi sui partecipanti ai quattro corsi?`,
  ...put('d-promossi', '62%', ['67,5%', '60%', '64%']),
  sol: `Promossi per corso: A 90% di 100 = 90; B 60% di 200 = 120; C 80% di 50 = 40; D 40% di 150 = 60. In tutto 310 promossi su 500 partecipanti: 310 ÷ 500 = 62%.`,
  trap: `67,5% è la media semplice dei quattro tassi: ma i corsi hanno partecipanti molto diversi (200 nel corso B, che ha il tasso basso, contro 50 nel corso C). La percentuale complessiva è il totale dei promossi diviso il totale dei partecipanti.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-soldi', diff: 'media', lang: 'it', ds: true,
  stem: ds('Quanti euro ha Luca?',
    'Spendendo un terzo di ciò che ha, a Luca resterebbero 40 €.',
    'Regalando 30 €, a Luca resterebbe esattamente metà di ciò che ha.'),
  ...dsq('BDCA', 'C'),
  sol: `(1): se x è la somma, x − x/3 = 40, quindi 2x/3 = 40 e x = 60. (2): x − 30 = x/2, quindi x/2 = 30 e x = 60. Ciascuna affermazione, da sola, determina la somma (60 €) e le due sono coerenti.`,
  trap: `Pensare che la (2) non basti perché non fornisce un numero direttamente: è un'equazione con una sola incognita e una soluzione. Basta risolvere ciascuna informazione da sola, senza combinare.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-corsi', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Ogni corso di laurea del dipartimento prevede un esame di statistica o un esame di matematica.`,
    `Nessun corso che prevede statistica prevede latino.`,
    `Alcuni corsi prevedono latino.`
  ], [
    `A. Alcuni corsi prevedono matematica.`,
    `B. Ogni corso che prevede latino prevede matematica.`,
    `C. Nessun corso prevede sia statistica sia matematica.`,
    `D. Almeno un corso prevede statistica.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la B', 'Sia la A sia la B', 'Sia la C sia la D', 'Sia la B sia la D'], ans: 1,
  sol: `Un corso con latino non ha statistica (secondo dato) e deve avere statistica o matematica (primo dato): quindi ha matematica. Poiché alcuni corsi hanno latino (terzo dato), B è vera e anche A è vera (almeno uno di quei corsi prevede matematica). C non è sicura: un corso potrebbe avere entrambe. D non è sicura: tutti i corsi potrebbero avere matematica e nessuno statistica.`,
  trap: `La D sembra naturale perché il primo dato nomina la statistica, ma «statistica o matematica» non obbliga alcun corso alla statistica. Scegliere solo la B dimentica che A ne segue («alcuni corsi» hanno latino, e quei corsi hanno matematica).`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-retribuzioni', diff: 'media', lang: 'it', asset: tRetribuzioni(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-retribuzioni', `Con 150 pezzi Anna e Carla guadagnano la stessa somma.`,
    [`Con 200 pezzi Bruno guadagna più di Anna.`,
     `Con 100 pezzi Carla guadagna più di Bruno.`,
     `Con 120 pezzi Carla guadagna più di Anna.`]),
  sol: `Retribuzione = fisso + compenso per pezzo · pezzi. Con 150 pezzi: Anna 600 + 4 · 150 = 1.200; Carla 8 · 150 = 1.200 (uguali, vera). Con 200 pezzi: Bruno 400 + 5 · 200 = 1.400, Anna 600 + 4 · 200 = 1.400 (uguali, non «più»: falsa). Con 100 pezzi: Carla 800, Bruno 900 (falsa). Con 120 pezzi: Carla 960, Anna 1.080 (falsa).`,
  trap: `Pensare che Carla, con il compenso per pezzo più alto, guadagni sempre di più: sotto i 150 pezzi (rispetto ad Anna) la parte fissa conta di più. Le uguaglianze (150 e 200 pezzi) sono costruite apposta: «più» non è «uguale».`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-cateto', diff: 'media', lang: 'it', ds: true,
  stem: ds('Qual è l\'area di un triangolo rettangolo?',
    'L\'ipotenusa misura 15 cm.',
    'Un cateto misura 9 cm.'),
  ...dsq('DACB', 'B'),
  sol: `(1) da sola: con l'ipotenusa 15 i cateti possono essere molti (9 e 12, ma anche 10 e circa 11,2). (2) da sola: con un cateto di 9 cm l'altro è libero. Insieme: il secondo cateto è √(15² − 9²) = √144 = 12 cm e l'area è 9 · 12 ÷ 2 = 54 cm².`,
  trap: `Credere che l'ipotenusa da sola «fissi» il triangolo: ne limita solo la dimensione massima. Anche con le due informazioni, bisogna ricavare il secondo cateto con il teorema di Pitagora prima di calcolare l'area.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-cena', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Tre amici hanno speso in tutto 120 euro per una cena.`,
    `Ada ha pagato il doppio di Bea.`,
    `Carlo ha pagato 30 euro.`
  ], [
    `A. Bea ha pagato più di Carlo.`,
    `B. Ada ha pagato metà del totale.`,
    `C. Carlo ha pagato meno di Ada.`,
    `D. Bea ha pagato 40 euro.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la D', 'Sia la A sia la C', 'Sia la B sia la D', 'Sia la A sia la D'], ans: 3,
  sol: `Ada e Bea pagano insieme 120 − 30 = 90 euro, con Ada = 2 · Bea: 3 · Bea = 90, quindi Bea = 30 e Ada = 60. A: Bea (30) non ha pagato più di Carlo (30): falsa. B: Ada ha pagato 60, metà di 120: vera. C: Carlo (30) ha pagato meno di Ada (60): vera. D: Bea ha pagato 30, non 40: falsa.`,
  trap: `Con la consegna «false» non vanno indicate la B e la C, che sono vere. La A è falsa per un'uguaglianza (30 contro 30): «più di» e «quanto» non coincidono. Sbagliare la ripartizione (per esempio 60 + 30 + 30 = 120 senza controllarla) falsa tutti i confronti.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-prezzi', diff: 'difficile', lang: 'it', asset: gPrezzi(),
  stem: `In quanti mesi il prezzo del prodotto X supera quello del prodotto Y di almeno il 20%?`,
  ...put('d-prezzi', '3', ['2', '4', '1']),
  sol: `Rapporto tra X e Y mese per mese: gennaio 40/35 ≈ 1,14; febbraio 42/36 ≈ 1,17; marzo 45/40 ≈ 1,13; aprile 48/40 = 1,20; maggio 54/45 = 1,20; giugno 60/50 = 1,20. Il rapporto è almeno 1,20 in aprile, maggio e giugno: tre mesi.`,
  trap: `Ragionare sulla differenza in euro (5, 6, 5, 8, 9, 10) invece che sul rapporto; escludere i mesi in cui il rapporto è esattamente 1,20 (che soddisfa «almeno»); dimenticare che «20% in più» di Y è 1,2 · Y.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-velocita', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un automobilista ha percorso 300 km. È vero che la sua velocità media è stata maggiore di 100 km/h?',
    'Ha viaggiato per più di 2 ore.',
    'Ha viaggiato per meno di 4 ore.'),
  ...dsq('ABDC', 'D'),
  sol: `La velocità media è 300 ÷ (ore di viaggio). Maggiore di 100 km/h significa meno di 3 ore. (1): più di 2 ore lascia 2,5 ore (120 km/h, sì) e 3,5 ore (circa 86 km/h, no). (2): meno di 4 ore lascia 2 ore (150 km/h, sì) e 3,5 ore (no). Insieme: tra 2 e 4 ore sono ancora possibili entrambe le risposte. Servono altri dati.`,
  trap: `Pensare che un intervallo di tempo («tra 2 e 4 ore») fissi un verdetto: la soglia delle 3 ore cade proprio dentro l'intervallo. Per essere sicuri bisogna esibire due durate compatibili con entrambe le affermazioni che danno risposte diverse.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-corriere', diff: 'difficile', lang: 'it', asset: tCorriere(),
  stem: `In quale città la quota dei pacchi Express sul totale dei pacchi della città è la più bassa?`,
  opts: ['Milano', 'Torino', 'Roma', 'Torino e Roma hanno la stessa quota'], ans: 1,
  sol: `Il dato mancante si ricava dal totale di riga: Torino ha 80 − 45 − 20 = 15 pacchi Express (e la colonna dà lo stesso: 65 − 30 − 20 = 15). Quote Express: Milano 30/100 = 30%; Torino 15/80 = 18,75%; Roma 20/100 = 20%. La più bassa è Torino.`,
  trap: `Guardare i valori assoluti (la quota più bassa sarebbe «Roma» con 20 pacchi, ma Torino ne ha solo 15) o ignorare il dato mancante. Roma e Torino hanno quote vicine (20% e 18,75%) proprio perché le basi sono diverse.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-variazioni', diff: 'media', lang: 'it', asset: tRicavi(),
  stem: `Di quanto sono variati, in percentuale, i ricavi complessivi dei quattro prodotti nel 2025?`,
  ...put('d-variazioni', '+6%', ['+13,75%', '+5%', '+10%']),
  sol: `Ricavi 2025: A 200 · 1,10 = 220; B 300 · 0,90 = 270; C 100 · 1,50 = 150; D 400 · 1,05 = 420. Totale 2025: 1.060 contro 1.000 nel 2024: +6%.`,
  trap: `+13,75% è la media semplice delle quattro variazioni ((10 − 10 + 50 + 5) ÷ 4): ma il prodotto C, con la variazione più alta, ha il ricavo più piccolo (100) e pesa poco. Le variazioni vanno pesate con i ricavi di partenza.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-aumento', diff: 'media', lang: 'it', ds: true,
  stem: ds('Il prezzo di un prodotto è aumentato di più del 20%?',
    'Il nuovo prezzo è di 31 €.',
    'Il prezzo iniziale era di 25 €.'),
  ...dsq('CDAB', 'B'),
  sol: `(1) da sola: senza il prezzo iniziale non si sa di quanto sia aumentato. (2) da sola: senza il nuovo prezzo non si sa se sia aumentato. Insieme: 31 ÷ 25 = 1,24, cioè +24%, più del 20%: la risposta è «sì».`,
  trap: `Credere che una delle due basti perché contiene un prezzo: un aumento percentuale richiede entrambi i prezzi. Una volta uniti, la base della percentuale è il prezzo iniziale (25 €), non il nuovo.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-fatturato', diff: 'difficile', lang: 'it', asset: gFatturato(),
  stem: `L'anno prossimo il fatturato dell'Estero aumenterà di 6 milioni di euro, mentre quello delle altre aree resterà invariato. Quale sarà la quota dell'Estero sul fatturato totale?`,
  ...put('d-fatturato', 'circa 33%', ['40%', 'circa 29%', 'circa 27%']),
  sol: `L'Estero vale il 20% del fatturato ed è di 6 milioni: il totale è 6 ÷ 0,2 = 30 milioni. L'anno prossimo l'Estero sarà 6 + 6 = 12 milioni e il totale 30 + 6 = 36 milioni: la quota è 12 ÷ 36 = 1/3, circa 33%.`,
  trap: `40% somma 20 punti alla quota (come se i 6 milioni fossero il 20% del totale futuro) senza considerare che cresce anche il totale; circa 29% e circa 27% sono valori «a occhio». Il totale va ricostruito dalla fetta nota e poi aggiornato.`,
  patt: 'Base della percentuale' },

{ k: 'd-bonus', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Ogni dipendente ha l'auto aziendale o il bonus trasporti.`,
    `Chi ha l'auto aziendale lavora nella sede centrale.`,
    `Alcuni dipendenti lavorano nella sede di Roma, che non è la sede centrale.`
  ], [
    `A. Qualche dipendente della sede di Roma ha l'auto aziendale.`,
    `B. Tutti i dipendenti della sede di Roma hanno il bonus trasporti.`,
    `C. Chi ha il bonus trasporti lavora a Roma.`,
    `D. Qualche dipendente della sede di Roma non ha né l'auto aziendale né il bonus trasporti.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la C', 'Sia la B sia la C', 'Sia la A sia la D', 'Sia la A sia la B'], ans: 2,
  sol: `Chi lavora a Roma non lavora nella sede centrale, quindi non ha l'auto aziendale (secondo dato); per il primo dato ha allora il bonus trasporti. A è falsa (nessuno a Roma ha l'auto) e D è falsa (chi sta a Roma ha il bonus). B è vera. C non è sicura: anche chi lavora nella sede centrale potrebbe avere il bonus.`,
  trap: `La C è l'implicazione inversa: dal fatto che chi lavora a Roma ha il bonus non segue che chi ha il bonus lavori a Roma. Con la consegna «false» non va indicata la B, che è vera.`,
  patt: 'Consegna: sicuramente falsa' }
];

/* ================ DISPOSIZIONE IN SCHERMATE DA TRE ================ */
const ROT = ['DVQ', 'QDV', 'VQD', 'DQV', 'VDQ', 'QVD'];
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
  id: '24',
  title: 'Mock 24',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Tutto in italiano, livello del Mock 15 ma con calcoli e testi più corti (tempo teorico stimato: circa 86 minuti): effetti di prezzo e quantità, probabilità con evento contrario, combinatoria con vincoli, medie ponderate, brani da 80–150 parole con modali. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false», sufficienza dei dati e tabelle con celle mancanti e medie pesate.',
  questions: QUESTIONS,
  data: DATA
};
});
