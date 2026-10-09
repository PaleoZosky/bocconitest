/* =======================================================================
   Mock 22 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
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
   la domanda per gli script di verifica (tools/check_math_22.py).
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
  'q-lordo': 3,
  'q-pompe': 1,
  'q-tre-numeri': 0,
  'q-resto59': 2,
  'q-primi': 1,
  'q-tasse': 0,
  'q-cifre': 3,
  'q-altezze': 2,
  'q-voti': 1,
  'q-penne': 3,
  'q-prodotto': 2,
  'q-pesata': 0,
  'q-figli': 3,
  'q-rifornimenti': 0,
  'q-popolazione': 2,
  'q-azioni': 1,
  'q-scorte': 0,
  'q-rettangoli': 3,
  'v-cambio': 1,
  'v-fondo': 0,
  'v-sfuso': 2,
  'v-giovani': 3,
  'v-palestra': 1,
  'v-orsa': 0,
  'v-centro': 2,
  'v-fisica': 3,
  'v-mercato-bici': 1,
  'v-condominio': 2,
  'v-energy': 0,
  'd-studio': 1,
  'd-soci': 0,
  'd-negozi': 3
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
  /* ore settimanali medie di studio per anno di corso e numero di studenti */
  studio: { gruppi: ['Matricole', '2° anno', '3° anno', 'Magistrale'], ore: [12, 18, 24, 30], studenti: [400, 300, 200, 100] },
  /* soci di una palestra a fine mese, quota mensile fino a marzo e da aprile */
  soci: { mesi: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'], soci: [100, 120, 140, 130, 150, 160], quota1: 40, quota2: 50 },
  /* ricavi (migliaia di euro) di quattro negozi nel 2024 e nel 2025 */
  negozi: { nomi: ['A', 'B', 'C', 'D'], y24: [80, 50, 120, 50], y25: [88, 65, 132, 55] },
  /* mercato (milioni di unità) e quote (%) di tre marche in quattro paesi */
  mercato: { paesi: ['Italia', 'Spagna', 'Francia', 'Germania'], unita: [10, 8, 12, 20], X: [30, 25, 40, 35], Y: [50, 45, 40, 35], Z: [20, 30, 20, 30] },
  /* produzione elettrica (GWh) per fonte; cella nascosta (null) da ricostruire con il totale */
  energia: { anni: [2021, 2022, 2023, 2024, 2025], solare: [20, 24, 30, 36, 40], eolico: [30, 32, 34, 40, 46], idro: [50, 46, 48, null, 52], totale: [100, 102, 112, 120, 138] },
  /* entrate e uscite trimestrali di un'associazione (migliaia di euro) */
  assoc: { trim: ['T1', 'T2', 'T3', 'T4'], entrate: [80, 90, 100, 130], uscite: [70, 85, 90, 110] }
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

function gStudio() {
  const D = DATA.studio;
  return `<figure class="fig"><figcaption>Ore settimanali medie di studio degli studenti di un ateneo, per anno di corso</figcaption>` + C.bars({
    labels: D.gruppi, series: [{ name: 'Ore di studio', values: D.ore }], max: 36, legend: false,
    aria: 'Istogramma delle ore settimanali medie di studio: ' + D.gruppi.map((g, i) => g + ' ' + D.ore[i]).join(', ') + '.'
  }) + `<p class="fig-note">Gli studenti sono ${D.studenti[0]} matricole, ${D.studenti[1]} del secondo anno, ${D.studenti[2]} del terzo anno e ${D.studenti[3]} della magistrale.</p></figure>`;
}

function gSoci() {
  const D = DATA.soci;
  return `<figure class="fig"><figcaption>Soci di una palestra a fine mese</figcaption>` + C.line({
    labels: D.mesi,
    series: [{ name: 'Soci', values: D.soci }],
    lo: 80, hi: 180, gridFrom: 80, gridTo: 180, gridStep: 20, L: 46, R: 30, legend: false, title: 'soci',
    aria: 'Linea dei soci a fine mese: ' + D.mesi.map((m, i) => m + ' ' + D.soci[i]).join(', ') + '.'
  }) + `<p class="fig-note">Ogni socio presente a fine mese paga la quota di quel mese: ${D.quota1} € fino a marzo e ${D.quota2} € da aprile in poi.</p></figure>`;
}

function gNegozi() {
  const D = DATA.negozi;
  return `<figure class="fig"><figcaption>Ricavi di quattro negozi, in migliaia di euro</figcaption>` + C.bars({
    labels: D.nomi.map(n => 'Negozio ' + n),
    series: [{ name: '2024', values: D.y24 }, { name: '2025', values: D.y25, style: 'outline' }], max: 140, legend: true,
    aria: 'Istogramma dei ricavi dei negozi nel 2024 e nel 2025: ' + D.nomi.map((n, i) => 'negozio ' + n + ' ' + D.y24[i] + ' e ' + D.y25[i]).join('; ') + '.'
  }) + `</figure>`;
}

function tMercato() {
  const D = DATA.mercato;
  return C.table({
    caption: 'Mercato di un prodotto e quote di mercato (% delle unità vendute nel paese) di tre marche',
    head: ['Paese', 'Mercato (milioni di unità)', 'Marca X', 'Marca Y', 'Marca Z'],
    rows: D.paesi.map((p, i) => [p, D.unita[i], D.X[i] + '%', D.Y[i] + '%', D.Z[i] + '%'])
  }) + `<p class="fig-note">In ogni paese le tre quote sommano a 100%.</p>`;
}

function tEnergia() {
  const D = DATA.energia, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Produzione di energia elettrica di un gestore, in GWh',
    head: ['Anno', 'Solare', 'Eolico', 'Idroelettrico', 'Totale'],
    rows: D.anni.map((a, i) => [a, D.solare[i], D.eolico[i], c(D.idro[i]), D.totale[i]])
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato. Il totale comprende soltanto le tre fonti indicate.</p>`;
}

function tAssoc() {
  const D = DATA.assoc;
  return C.table({
    caption: 'Entrate e uscite trimestrali di un\'associazione, in migliaia di euro',
    head: ['Trimestre', 'Entrate', 'Uscite'],
    rows: D.trim.map((t, i) => [t, D.entrate[i], D.uscite[i]])
  });
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-lordo', diff: 'media', lang: 'it',
  stem: `Uno stipendio lordo di 2.000 € è soggetto a contributi pari al 10% del lordo; sul risultato si paga poi un'imposta del 20%. Quanto resta in tasca al lavoratore?`,
  ...put('q-lordo', '1.440 €', ['1.400 €', '1.600 €', '1.620 €']),
  sol: `Dopo i contributi: 2.000 · 0,9 = 1.800 €. L'imposta è il 20% di questa somma, non del lordo: 1.800 · 0,8 = 1.440 €.`,
  trap: `1.400 € somma le due aliquote (30%) e le applica al lordo; 1.600 € applica solo l'imposta al lordo; 1.620 € applica due volte il 10%. Il 20% ha come base lo stipendio già ridotto dei contributi.`,
  patt: 'Base della percentuale' },

{ k: 'q-pompe', diff: 'media', lang: 'it',
  stem: `Una cisterna da 12.000 litri si svuota con due pompe: la pompa A estrae 100 litri al minuto e la pompa B 150 litri al minuto. Dopo 30 minuti la pompa B si guasta e la pompa A continua da sola. Quanti minuti passano in tutto dall'inizio al completo svuotamento?`,
  ...put('q-pompe', '75 minuti', ['48 minuti', '120 minuti', '45 minuti']),
  sol: `In 30 minuti le due pompe estraggono 30 · 250 = 7.500 litri; ne restano 4.500. La pompa A da sola impiega 4.500 ÷ 100 = 45 minuti. In tutto 30 + 45 = 75 minuti.`,
  trap: `48 minuti (12.000 ÷ 250) ignora il guasto; 120 minuti (12.000 ÷ 100) considera solo la pompa A; 45 minuti è il solo tempo dopo il guasto, senza i primi 30.`,
  patt: 'Lavoro e portate' },

{ k: 'q-tre-numeri', diff: 'media', lang: 'it',
  stem: `Tre numeri hanno somma 60. Il secondo è il doppio del primo e il terzo supera il secondo di 5. Qual è il terzo numero?`,
  ...put('q-tre-numeri', '27', ['22', '33', '25']),
  sol: `Se il primo è x, il secondo è 2x e il terzo 2x + 5: x + 2x + 2x + 5 = 60, quindi 5x = 55 e x = 11. Il terzo è 2 · 11 + 5 = 27.`,
  trap: `22 è il secondo numero; 33 = 3 · 11 triplica il primo; 25 si ottiene dividendo 60 per 2 e togliendo 5, senza risolvere l'equazione.`,
  patt: 'Equazioni a parole' },

{ k: 'q-resto59', diff: 'difficile', lang: 'it',
  stem: `Un intero positivo n dà resto 3 se diviso per 4, resto 4 se diviso per 5 e resto 5 se diviso per 6. Qual è il più piccolo valore possibile di n?`,
  ...put('q-resto59', '59', ['119', '29', '63']),
  sol: `In ogni divisione il resto è il divisore meno 1: quindi n + 1 è multiplo di 4, di 5 e di 6, cioè del loro minimo comune multiplo, 60. Il più piccolo n è 60 − 1 = 59. (Controllo: 59 = 4 · 14 + 3 = 5 · 11 + 4 = 6 · 9 + 5.)`,
  trap: `119 = 2 · 60 − 1 è il secondo valore possibile; 29 = 30 − 1 rispetta le condizioni per 5 e 6 ma non per 4 (resto 1); 63 = 60 + 3 sceglie sempre il resto 3.`,
  patt: 'Resti e congruenze' },

{ k: 'q-primi', diff: 'media', lang: 'it',
  stem: `Si lanciano due dadi equilibrati a sei facce. Qual è la probabilità che la somma dei due numeri sia un numero primo?`,
  ...put('q-primi', fr(5, 12), [fr(1, 3), fr(7, 18), fr(1, 2)]),
  sol: `Le somme possibili vanno da 2 a 12. Quelle prime sono 2 (1 modo), 3 (2 modi), 5 (4 modi), 7 (6 modi), 11 (2 modi): 15 casi su 36, cioè 15/36 = 5/12.`,
  trap: `1/3 = 12/36 dimentica le somme 2 e 11; 7/18 = 14/36 dimentica la somma 2; 1/2 conta tutte le somme dispari (18/36), ma 9 non è primo e il 2 è primo e pari.`,
  patt: 'Probabilità: casi favorevoli' },

{ k: 'q-tasse', diff: 'facile', lang: 'it',
  stem: `Un biglietto aereo costa in tutto 180 €. Il prezzo comprende le tasse aeroportuali, pari al 20% del prezzo del biglietto senza tasse. A quanto ammontano le tasse?`,
  ...put('q-tasse', '30 €', ['36 €', '20 €', '45 €']),
  sol: `Se x è il prezzo senza tasse, x · 1,2 = 180, quindi x = 150 € e le tasse sono 180 − 150 = 30 €.`,
  trap: `36 € è il 20% di 180, cioè calcola la percentuale sul prezzo con le tasse invece che su quello senza; 20 € è la percentuale scambiata per un importo; 45 € è un quarto di 180.`,
  patt: 'Base della percentuale' },

{ k: 'q-cifre', diff: 'media', lang: 'it',
  stem: `Quanti numeri di tre cifre hanno la somma delle cifre uguale a 4?`,
  ...put('q-cifre', '10', ['9', '12', '15']),
  sol: `La prima cifra va da 1 a 4. Con prima cifra 1 le altre due sommano 3: 4 casi (03, 12, 21, 30). Con 2: somma 2, 3 casi. Con 3: somma 1, 2 casi. Con 4: somma 0, 1 caso. In tutto 4 + 3 + 2 + 1 = 10.`,
  trap: `15 conta anche i numeri con prima cifra 0 (come 013), che non sono di tre cifre; 9 e 12 si ottengono dimenticando o raddoppiando un caso.`,
  patt: 'Conteggio con vincolo' },

{ k: 'q-altezze', diff: 'media', lang: 'it',
  stem: `Le 12 giocatrici di una squadra hanno un'altezza media di 190 cm. Le 4 attaccanti hanno un'altezza media di 195 cm. Qual è l'altezza media delle altre 8 giocatrici?`,
  ...put('q-altezze', '187,5 cm', ['185 cm', '190 cm', '192,5 cm']),
  sol: `Somma delle altezze di tutte: 12 · 190 = 2.280 cm. Somma delle attaccanti: 4 · 195 = 780 cm. Le altre 8 sommano 1.500 cm e la loro media è 1.500 ÷ 8 = 187,5 cm.`,
  trap: `185 cm toglie 5 alla media totale come se le altre fossero tante quante le attaccanti; il gruppo più numeroso (8 contro 4) si scosta meno dalla media complessiva. 190 e 192,5 cm non usano i pesi.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-voti', diff: 'difficile', lang: 'it',
  stem: `A un'elezione il 10% di chi ha votato ha consegnato scheda bianca o nulla. Il candidato Rossi ha ottenuto il 55% dei voti validi, cioè 3.960 voti. Quanti elettori hanno votato?`,
  ...put('q-voti', '8.000', ['7.200', '7.920', '8.800']),
  sol: `Voti validi: 3.960 ÷ 0,55 = 7.200. I voti validi sono il 90% dei votanti, quindi i votanti sono 7.200 ÷ 0,9 = 8.000.`,
  trap: `7.200 si ferma ai voti validi; 7.920 = 7.200 · 1,1 aggiunge il 10% ai validi invece di dividere per 0,9; 8.800 = 3.960 ÷ 0,45 usa il 45% al posto del 55%.`,
  patt: 'Base della percentuale' },

{ k: 'q-penne', diff: 'media', lang: 'it',
  stem: `Cinque penne costano quanto tre quaderni e due quaderni costano 10 €. Quanto costano quindici penne?`,
  ...put('q-penne', '45 €', ['30 €', '75 €', '25 €']),
  sol: `Un quaderno costa 10 ÷ 2 = 5 €; tre quaderni 15 €, che è anche il prezzo di cinque penne: una penna costa 3 €. Quindici penne costano 45 €.`,
  trap: `75 € = 15 · 5 dà alla penna il prezzo del quaderno; 30 € = 3 · 10 e 25 € = 5 · 5 sono prodotti dei numeri dati senza il passaggio intermedio.`,
  patt: 'Proporzioni' },

{ k: 'q-prodotto', diff: 'media', lang: 'it',
  stem: `Il prodotto di due numeri interi positivi è 24. Quanto vale la loro somma?`,
  ...put('q-prodotto', 'Non è determinabile', ['10', '11', '25']),
  sol: `Le coppie di interi positivi con prodotto 24 sono (1, 24), (2, 12), (3, 8) e (4, 6): le somme sono 25, 14, 11 e 10. La somma non è unica, quindi non è determinabile.`,
  trap: `10, 11 e 25 sono ciascuna la somma di una coppia possibile, ma nessuna è obbligata. Scegliere 10 (4 + 6) perché «i fattori sono vicini» è un'ipotesi non presente nel testo.`,
  patt: 'Sufficienza dei dati' },

{ k: 'q-pesata', diff: 'media', lang: 'it',
  stem: `Tra 8 monete d'aspetto identico, una è più pesante delle altre, che pesano tutte uguale. Con una bilancia a due piatti, senza pesi, qual è il numero minimo di pesate che garantisce sempre di individuare la moneta più pesante?`,
  ...put('q-pesata', '2', ['1', '3', '4']),
  sol: `Prima pesata: 3 monete contro 3, con 2 fuori. Se un piatto scende, la più pesante è tra quelle 3: basta una seconda pesata (1 contro 1; se sono pari è la terza). Se c'è equilibrio, è tra le 2 rimaste: seconda pesata 1 contro 1. Bastano sempre 2 pesate.`,
  trap: `Dividere sempre a metà (4 contro 4, poi 2 contro 2, poi 1 contro 1) richiede 3 pesate; 4 è una pesata per moneta; 1 pesata non basta, perché distingue al massimo tre esiti.`,
  patt: 'Ragionamento laterale' },

{ k: 'q-figli', diff: 'difficile', lang: 'it',
  stem: `Una famiglia ha tre figli. Si sa che almeno uno dei tre è maschio. Qual è la probabilità che siano tutti e tre maschi? (Ogni figlio è maschio o femmina con probabilità 1/2.)`,
  ...put('q-figli', fr(1, 7), [fr(1, 8), fr(1, 4), fr(1, 2)]),
  sol: `Le 8 combinazioni (M o F per ciascun figlio) sono equiprobabili. L'informazione «almeno un maschio» esclude solo FFF: ne restano 7. Una sola (MMM) è favorevole: 1/7.`,
  trap: `1/8 ignora l'informazione e considera tutte le 8 combinazioni; 1/4 e 1/2 sono le probabilità che due figli, o uno solo, siano maschi, come se la condizione fissasse l'esito di un figlio.`,
  patt: 'Probabilità condizionata' },

{ k: 'q-rifornimenti', diff: 'media', lang: 'it',
  stem: `Un automobilista fa due rifornimenti: 20 litri a 1,80 € al litro e 30 litri a 2,00 € al litro. Qual è il prezzo medio pagato per litro?`,
  ...put('q-rifornimenti', '1,92 €', ['1,90 €', '1,88 €', '1,95 €']),
  sol: `Spesa: 20 · 1,80 = 36 € e 30 · 2,00 = 60 €, in tutto 96 € per 50 litri. Prezzo medio: 96 ÷ 50 = 1,92 € al litro.`,
  trap: `1,90 € è la media semplice dei due prezzi, che ignora le quantità diverse (20 e 30 litri); 1,88 € scambia i pesi (30 litri a 1,80 € e 20 a 2,00 €); 1,95 € è un valore «a occhio» tra 1,90 e 2,00.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-popolazione', diff: 'media', lang: 'it',
  stem: `Una popolazione cala del 10% ogni anno. Dopo due anni conta 8.100 individui. Quanti ne contava all'inizio?`,
  ...put('q-popolazione', '10.000', ['9.000', 'circa 10.125', '9.720']),
  sol: `Il fattore dopo due anni è 0,9 · 0,9 = 0,81. L'inizio è 8.100 ÷ 0,81 = 10.000. (Controllo: 10.000 → 9.000 → 8.100.)`,
  trap: `9.000 = 8.100 ÷ 0,9 considera un solo anno di calo; circa 10.125 = 8.100 ÷ 0,8 somma i due cali (20%); 9.720 = 8.100 · 1,2 aggiunge il 20%.`,
  patt: 'Percentuali composte' },

{ k: 'q-azioni', diff: 'media', lang: 'it',
  stem: `Un investitore compra 100 azioni a 20 € l'una e le rivende dopo un anno a 25 € l'una. Su ciascuna delle due operazioni, acquisto e vendita, paga una commissione dell'1% del valore dell'operazione. Qual è il guadagno netto?`,
  ...put('q-azioni', '455 €', ['500 €', '475 €', '480 €']),
  sol: `Acquisto: 100 · 20 = 2.000 € più commissione di 20 €, in tutto 2.020 €. Vendita: 100 · 25 = 2.500 € meno commissione di 25 €, in tutto 2.475 €. Guadagno netto: 2.475 − 2.020 = 455 €.`,
  trap: `500 € non tiene conto delle commissioni; 475 € sottrae solo la commissione di vendita; 480 € sottrae solo quella di acquisto. Le commissioni sono due e di importo diverso (l'1% di valori diversi).`,
  patt: 'Dati e passaggi' },

{ k: 'q-scorte', diff: 'media', lang: 'it',
  stem: `Una scorta di cibo basta per 20 persone per 30 giorni. Dopo 10 giorni arrivano altre 5 persone. Per quanti giorni ancora basta la scorta?`,
  ...put('q-scorte', '16 giorni', ['14 giorni', '20 giorni', '24 giorni']),
  sol: `Dopo 10 giorni resta cibo per 20 persone per altri 20 giorni, cioè 400 «giorni-persona». Con 25 persone bastano 400 ÷ 25 = 16 giorni.`,
  trap: `20 giorni ignora gli arrivi; 24 giorni = 600 ÷ 25 ricalcola tutta la scorta con 25 persone dimenticando i 10 giorni già consumati; 14 giorni = 24 − 10 toglie i giorni già passati dal totale sbagliato.`,
  patt: 'Proporzionalità inversa' },

{ k: 'q-rettangoli', diff: 'difficile', lang: 'it',
  stem: `Una griglia è formata da 3 righe e 4 colonne di quadratini uguali. Quanti rettangoli (compresi i quadrati) si possono individuare seguendo le linee della griglia?`,
  ...put('q-rettangoli', '60', ['12', '30', '120']),
  sol: `Un rettangolo è determinato da 2 delle 4 linee orizzontali e da 2 delle 5 linee verticali: C(4,2) · C(5,2) = 6 · 10 = 60.`,
  trap: `12 conta solo i quadratini; 30 = 6 · 5 e 120 = 12 · 10 usano conteggi parziali o disposizioni (l'ordine delle due linee non conta, perché la stessa coppia dà lo stesso rettangolo).`,
  patt: 'Combinatoria con vincolo' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-teatro', diff: 'media', lang: 'it',
  claim: `Uno studente di 24 anni paga l'abbonamento 100 euro.`,
  passage: `Il Teatro Verdi propone per la stagione 2026 un abbonamento a 8 spettacoli al prezzo di 160 euro, valido per i soli spettacoli serali. Gli under 26 hanno diritto a una riduzione del 50% sul prezzo dell'abbonamento; i pensionati a una riduzione del 20%, non cumulabile con altre riduzioni. L'abbonamento è nominativo e non può essere ceduto. Ogni abbonato può cambiare la data di uno spettacolo, una sola volta, fino a 48 ore prima. La vendita si apre il 1° ottobre e si chiude quando i posti disponibili sono esauriti.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «Gli under 26 hanno diritto a una riduzione del 50% sul prezzo dell'abbonamento». A 24 anni si è under 26: il prezzo è il 50% di 160 euro, cioè 80 euro, non 100. L'affermazione è contraddetta.`,
  trap: `Applicare la riduzione dei pensionati (20%: 128 euro) o un'altra percentuale non indicata. Non è «non ricavabile»: la riduzione per gli under 26 è esplicita. Il dato 100 euro è un valore a metà strada, costruito apposta.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-cambio', diff: 'media', lang: 'it',
  passage: `Il tasso di cambio euro-dollaro indica quanti dollari servono per acquistare un euro: se passa da 1,10 a 1,20 si dice che l'euro si è apprezzato e il dollaro si è deprezzato. Per un'impresa europea che vende negli Stati Uniti e fattura in dollari, un euro più forte riduce i ricavi espressi in euro, mentre un euro più debole li aumenta. Un'impresa italiana ha venduto macchinari negli Stati Uniti per 1,2 milioni di dollari, interamente incassati a fine anno. Le imprese possono coprirsi dal rischio di cambio con strumenti finanziari.`,
  stem: `Se a fine anno il tasso di cambio euro-dollaro passa da 1,20 a 1,00, quale delle seguenti affermazioni sui ricavi in euro dell'impresa è corretta?`,
  ...put('v-cambio', `I ricavi in euro aumentano del 20%.`,
    [`I ricavi in euro diminuiscono di circa il 16,7%.`,
     `I ricavi in euro aumentano di circa il 16,7%.`,
     `I ricavi in euro restano invariati, perché la fattura è in dollari.`]),
  sol: `Frase chiave: «un euro più debole [li] aumenta». Il tasso scende da 1,20 a 1,00: l'euro si è deprezzato. I ricavi in euro sono 1,2 milioni di dollari ÷ 1,20 = 1,0 milioni prima e 1,2 ÷ 1,00 = 1,2 milioni dopo: +20%.`,
  trap: `Il 16,7% è la variazione del tasso di cambio ((1,00 − 1,20) ÷ 1,20), non quella dei ricavi: i ricavi in euro sono inversamente proporzionali al tasso. Dire che restano invariati ignora la conversione in euro.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-fondo', diff: 'difficile', lang: 'it',
  passage: `Un fondo pensione gestisce 400 milioni di euro: il 60% è investito in azioni e il resto in obbligazioni. Nel 2025 le azioni hanno reso il 10% e le obbligazioni il 2,5%. Il rendimento lordo del fondo è il guadagno complessivo, prima delle commissioni, espresso in percentuale del patrimonio iniziale. Le commissioni di gestione, pari all'1% del patrimonio iniziale, vengono sottratte al guadagno per ottenere il rendimento netto. Il fondo non ha ricevuto nuovi versamenti né effettuato prelievi durante l'anno. Il fondo ha circa 50.000 iscritti.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put('v-fondo', `Il rendimento lordo del fondo è del 6,25%, cioè la media dei rendimenti delle due componenti.`,
    [`Il guadagno delle azioni è stato di 24 milioni di euro.`,
     `Il rendimento lordo del fondo è del 7%.`,
     `Il rendimento netto del fondo è del 6%.`]),
  sol: `Azioni: 60% di 400 = 240 milioni, guadagno 10% · 240 = 24 (corretta). Obbligazioni: 160 milioni, guadagno 2,5% · 160 = 4. Guadagno lordo 28 milioni su 400: 7% (corretta). Commissioni: 1% di 400 = 4 milioni; netto 28 − 4 = 24 milioni = 6% (corretta). Il 6,25% è la media semplice di 10% e 2,5%: non tiene conto dei pesi 60% e 40%, quindi è l'affermazione sbagliata.`,
  trap: `Fare la media semplice dei due rendimenti: (10 + 2,5) ÷ 2 = 6,25%. Le due componenti hanno pesi diversi (240 e 160 milioni). Nelle domande «NON è corretta» le altre tre affermazioni sono tutte vere e vanno verificate.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'v-sanrocco', diff: 'media', lang: 'it',
  claim: `Il calo degli incidenti nel quartiere San Rocco è dovuto al limite di 30 km/h.`,
  passage: `Dopo l'introduzione del limite di 30 km/h in tre vie del quartiere San Rocco, gli incidenti segnalati alla polizia locale sono scesi da 24 a 18 in un anno. Nello stesso periodo il numero di residenti del quartiere è rimasto stabile e il traffico, misurato con appositi rilevatori, è diminuito del 5%. L'assessore ha dichiarato che il quartiere è oggi più sicuro, ma che servono almeno altri due anni di dati prima di valutare se estendere il limite alle altre vie.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «Dopo l'introduzione del limite … sono scesi da 24 a 18» e «servono almeno altri due anni di dati prima di valutare». Il brano riporta il calo e la successione nel tempo, ma non dice che il limite ne sia la causa; l'assessore stesso rinvia la valutazione. L'affermazione non è né confermata né smentita.`,
  trap: `Prendere «dopo» per «a causa di»: anche il calo del traffico del 5% potrebbe contribuire. Non è nemmeno «falsa»: il brano non esclude che il limite abbia avuto effetto.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-sfuso', diff: 'media', lang: 'it',
  passage: `Una catena di supermercati ha introdotto un reparto di prodotti sfusi nel punto vendita di Brescia. Dopo sei mesi i rifiuti da imballaggio del punto vendita sono diminuiti del 15%. La direzione ne conclude che il reparto sfuso riduce i rifiuti da imballaggio e vuole aprirlo in tutti i punti vendita della catena. Il costo di allestimento del reparto è stato di 30.000 euro e il punto vendita di Brescia è aperto sette giorni su sette. La catena ha 40 punti vendita, tutti di dimensioni simili.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione della direzione?`,
  ...put('v-sfuso', `Nello stesso periodo i rifiuti da imballaggio dei punti vendita della catena senza reparto sfuso sono rimasti stabili.`,
    [`I clienti dichiarano di apprezzare la possibilità di acquistare prodotti sfusi.`,
     `Il reparto sfuso è meno costoso da gestire dei reparti con prodotti confezionati.`,
     `Brescia è il comune più popoloso tra quelli in cui la catena ha un punto vendita.`]),
  sol: `La conclusione è causale: il reparto sfuso ridurrebbe i rifiuti da imballaggio. Il confronto con punti vendita simili senza reparto sfuso, dove i rifiuti non sono calati, esclude cause generali (stagione, minori vendite della catena) e rafforza il nesso.`,
  trap: `Il gradimento dei clienti e i costi di gestione sono dati sulla proposta, non sul nesso con i rifiuti; la popolosità di Brescia non dice nulla sul calo. Un gruppo di confronto (senza il «trattamento») è ciò che rafforza davvero una conclusione causale.`,
  patt: 'Rafforzare con un confronto' },

{ k: 'v-giovani', diff: 'media', lang: 'it',
  passage: `Il tasso di occupazione giovanile (occupati di 15–24 anni sul totale delle persone di 15–24 anni) di una regione è passato dal 20% del 2019 al 24% del 2025. Nello stesso periodo il numero dei residenti di 15–24 anni è sceso del 10%. Il tasso di occupazione generale (15–64 anni) è passato dal 60% al 63%, con una popolazione di 15–64 anni rimasta stabile. L'assessore al lavoro attribuisce i miglioramenti a un programma di tirocini, ma non ne ha ancora pubblicato la valutazione.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-giovani', `Il numero di occupati di 15–24 anni è aumentato tra il 2019 e il 2025.`,
    [`Il tasso di occupazione giovanile è aumentato del 4% tra il 2019 e il 2025.`,
     `Gli occupati di 15–64 anni sono aumentati del 3% tra il 2019 e il 2025.`,
     `Il programma di tirocini ha fatto aumentare il tasso di occupazione giovanile.`]),
  sol: `Con 100 giovani nel 2019: occupati 20; nel 2025 i giovani sono 90 e gli occupati il 24% di 90 = 21,6: più di 20 (corretta). Il tasso giovanile cresce di 4 punti percentuali (+20% in termini relativi), non del 4%. Gli occupati di 15–64 anni crescono del 5% (63 ÷ 60), non del 3%. Il nesso con i tirocini è solo l'attribuzione dell'assessore, senza valutazione.`,
  trap: `Confondere punti percentuali e percentuale; dimenticare che il tasso giovanile è calcolato su una popolazione che cala (assoluti e rapporti si muovono in modo diverso); prendere l'attribuzione dell'assessore per un fatto.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-buoni', diff: 'media', lang: 'it',
  claim: `Un dipendente a tempo pieno che in un mese lavora 18 giorni in sede, ciascuno di almeno 6 ore, matura buoni pasto per 144 euro.`,
  passage: `La società Aquila riconosce ai propri dipendenti un buono pasto di 8 euro per ogni giornata lavorata in sede per almeno 6 ore. Il buono non spetta nei giorni di ferie, di malattia o di lavoro da casa. I buoni vengono accreditati sulla carta aziendale il mese successivo a quello di maturazione e sono utilizzabili entro dodici mesi. Per i dipendenti con contratto part-time il requisito minimo è di 4 ore. Nel 2025 la società ha distribuito buoni pasto per un valore complessivo di 1,2 milioni di euro.`,
  opts: VFN, ans: 2,
  sol: `Frase chiave: «un buono pasto di 8 euro per ogni giornata lavorata in sede per almeno 6 ore». Per 18 giornate in sede di almeno 6 ore il dipendente matura 18 · 8 = 144 euro: l'esempio rientra nella regola generale (l'accredito avviene il mese dopo, ma la maturazione è quella).`,
  trap: `Rispondere «non ricavabile» perché il brano non cita il caso dei 18 giorni, o «falsa» pensando che l'accredito nel mese successivo impedisca di «maturare» subito. Il brano distingue maturazione e accredito.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-palestra', diff: 'media', lang: 'it',
  passage: `Un'associazione di gestori di palestre ha condotto un sondaggio tra 400 persone: il 90% degli intervistati ha dichiarato di preferire allenarsi in palestra piuttosto che all'aperto. L'associazione ne conclude che la maggior parte dei cittadini preferisce la palestra e chiede un contributo al comune per ampliare le strutture. Il sondaggio è stato svolto in una settimana di ottobre, nelle ore serali; l'associazione rappresenta i gestori di quattordici palestre della città e le risposte sono state raccolte in forma anonima e il margine di errore dichiarato è del 5%.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione dell'associazione?`,
  ...put('v-palestra', `Gli intervistati sono stati scelti tra le persone iscritte alle palestre associate.`,
    [`Il contributo richiesto dall'associazione è pari a 200.000 euro.`,
     `Le palestre della città sono aperte anche la domenica.`,
     `Il 60% dei cittadini pratica sport almeno una volta a settimana.`]),
  sol: `La conclusione generalizza dal campione a tutti i cittadini. Se gli intervistati sono stati scelti tra gli iscritti alle palestre, hanno già scelto la palestra: il campione non rappresenta i cittadini (selezione), e il 90% è quasi scontato.`,
  trap: `Importo del contributo, orari di apertura e quota di sportivi non dicono chi è stato intervistato. L'ultima opzione sembra pertinente (parla dei cittadini) ma non mostra che il campione sia distorto.`,
  patt: 'Cause alternative' },

{ k: 'v-orsa', diff: 'media', lang: 'it',
  passage: `Nel 2025 la società Orsa ha avuto ricavi per 90 milioni di euro e costi per 81 milioni. Il consiglio di amministrazione proporrà all'assemblea dei soci di distribuire il 40% dell'utile: se l'assemblea approverà la proposta, i dividendi saranno pagati entro giugno 2026. Nel 2024 l'utile era stato di 6 milioni di euro. Il presidente ha ricordato che la società non ha debiti finanziari e che la proposta sarà votata nell'assemblea di aprile. La società ha 800 dipendenti e opera nel settore alimentare; il bilancio è stato certificato da una società di revisione.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-orsa', `L'utile del 2025 è stato superiore del 50% a quello del 2024.`,
    [`I soci riceveranno 3,6 milioni di euro di dividendi entro giugno 2026.`,
     `Il consiglio ha deciso di distribuire ai soci il 40% dei ricavi.`,
     `Nel 2025 l'utile è stato inferiore al 10% dei ricavi.`]),
  sol: `Utile 2025: 90 − 81 = 9 milioni; nel 2024 era 6: 9 ÷ 6 = 1,5, cioè +50% (corretta). Il 40% di 9 sarebbe 3,6 milioni, ma la distribuzione è solo una proposta («proporrà … se l'assemblea approverà»); il 40% riguarda l'utile, non i ricavi; 9 milioni sono esattamente il 10% dei ricavi, non meno.`,
  trap: `Trasformare una proposta condizionata in un fatto; spostare l'ambito del 40% (utile → ricavi); la soglia del 10% è costruita sul valore esatto (9 su 90), quindi «inferiore» è falso.`,
  patt: 'Periodo o ambito spostato' },

{ k: 'v-centro', diff: 'difficile', lang: 'it',
  passage: `Il comune di Borgovecchio propone di chiudere al traffico privato il centro storico ogni sabato e domenica. Secondo l'assessore al commercio, i negozi del centro venderanno di più, perché ci saranno più pedoni e meno rumore e smog. La proposta prevede navette gratuite dai parcheggi esterni al centro, ogni dieci minuti. I commercianti hanno chiesto di verificare gli effetti sulle vendite dopo sei mesi e di sospendere la misura se i ricavi dovessero calare. Il centro storico ospita circa 150 negozi e 3.000 residenti, e oggi nei fine settimana vi accedono circa 6.000 auto.`,
  stem: `Su quale assunzione si basa principalmente il ragionamento dell'assessore?`,
  ...put('v-centro', `Le persone che oggi raggiungono il centro in auto continueranno a recarvisi anche senza poter entrare in auto, e i pedoni in più acquisteranno nei negozi.`,
    [`I commercianti del centro sono favorevoli alla chiusura al traffico.`,
     `Le navette gratuite costano meno dei parcheggi situati nel centro storico.`,
     `Il rumore del traffico del fine settimana disturba i residenti del centro.`]),
  sol: `L'assessore passa da «più pedoni, meno rumore» a «i negozi venderanno di più». Funziona solo se la chiusura non allontana i clienti che oggi arrivano in auto e se i pedoni in più comprano davvero: è l'assunzione implicita. Se i clienti in auto rinunciassero a venire, le vendite potrebbero calare.`,
  trap: `Il consenso dei commercianti, il costo delle navette e il disturbo ai residenti sono fatti collaterali: non collegano la chiusura alle vendite. L'assunzione si trova guardando che cosa potrebbe far fallire il passaggio da «più pedoni» a «più vendite».`,
  patt: 'Assunzione implicita' },

{ k: 'v-montalto', diff: 'media', lang: 'it',
  claim: `Nel 2024 il comune di Montalto ha raccolto in modo differenziato più di 7.500 tonnellate di rifiuti.`,
  passage: `Nel 2025 il comune di Montalto ha raccolto 12.000 tonnellate di rifiuti, di cui il 65% in modo differenziato. Rispetto al 2024 la quota della raccolta differenziata è aumentata di 5 punti percentuali, mentre il totale dei rifiuti raccolti è rimasto invariato. Nel 2026 il comune introdurrà la tariffa puntuale, che fa pagare a ciascuna famiglia in base alla quantità di rifiuto indifferenziato prodotta, e prevede di raggiungere il 70% di differenziata entro la fine dell'anno. Il comune ha circa 40.000 abitanti e i dati sono certificati dall'agenzia regionale per l'ambiente.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «raccolta differenziata … aumentata di 5 punti percentuali» e «il totale dei rifiuti raccolti è rimasto invariato». Nel 2024 la quota era 65% − 5 = 60% di 12.000 tonnellate: 7.200 tonnellate, meno di 7.500. L'affermazione è contraddetta.`,
  trap: `Calcolare il 65% di 12.000 = 7.800 (il dato del 2025, che supera 7.500) invece del 60% del 2024. I «punti percentuali» si sottraggono alla quota (65% − 5% = 60%).`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-fisica', diff: 'media', lang: 'it',
  passage: `Dopo l'introduzione di un esame di ammissione, il tasso di abbandono al primo anno del corso di laurea in Fisica è sceso dal 25% al 15%. Il direttore del dipartimento ne conclude che la selezione all'ingresso riduce gli abbandoni e propone di introdurre lo stesso esame in tutti i corsi scientifici. Il numero di studenti del primo anno è rimasto sui 120 e l'esame è sostenuto a luglio, prima dell'iscrizione. Il corso di Fisica ha sede nel campus nord ed è uno dei più antichi dell'ateneo; l'esame consiste in una prova scritta di due ore.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del direttore?`,
  ...put('v-fisica', `Nello stesso anno l'università ha raddoppiato le borse di studio riservate agli studenti del primo anno di Fisica.`,
    [`L'esame di ammissione richiede una preparazione di almeno tre mesi.`,
     `Molti studenti ritengono utile sostenere l'esame di ammissione.`,
     `Il corso di Fisica ha meno iscritti del corso di Matematica.`]),
  sol: `La conclusione è causale: la selezione ridurrebbe gli abbandoni. Se nello stesso anno le borse di studio sono raddoppiate, il calo degli abbandoni ha una causa alternativa (meno difficoltà economiche), indipendente dall'esame.`,
  trap: `La durata della preparazione e il numero di iscritti non toccano il nesso; il parere degli studenti rafforza, non indebolisce. In ogni domanda causale conviene chiedersi che cosa altro è cambiato nello stesso periodo.`,
  patt: 'Cause alternative' },

{ k: 'v-mercato-bici', diff: 'media', lang: 'it',
  passage: `Nel 2025 il mercato italiano delle biciclette elettriche ha raggiunto le 300.000 unità vendute, il 20% in più rispetto al 2024. Il 70% delle vendite è avvenuto nei negozi specializzati, il 20% nella grande distribuzione e il resto online. Nello stesso anno sono state vendute 1,2 milioni di biciclette tradizionali. Gli esperti attribuiscono la crescita agli incentivi statali, ma ritengono che nel 2026 il mercato rallenterà. I dati provengono da un'associazione di categoria che raccoglie le vendite dichiarate da produttori e distributori. Le biciclette elettriche sono quelle con motore di assistenza alla pedalata.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-mercato-bici', `Nel 2025 le biciclette elettriche hanno rappresentato il 20% di tutte le biciclette vendute, elettriche e tradizionali.`,
    [`Nel 2024 sono state vendute 240.000 biciclette elettriche.`,
     `Nel 2025 le biciclette elettriche vendute online sono state 60.000.`,
     `Nel 2025 i negozi specializzati hanno venduto 210.000 biciclette, elettriche e tradizionali.`]),
  sol: `Totale 2025: 300.000 + 1.200.000 = 1.500.000; 300.000 ÷ 1.500.000 = 20% (corretta). Le altre: nel 2024 le elettriche erano 300.000 ÷ 1,2 = 250.000, non 240.000; online è il resto, cioè il 10%: 30.000, non 60.000; il 70% (210.000) riguarda le sole biciclette elettriche, non tutte.`,
  trap: `Il «+20%» va tolto dividendo per 1,2 (non sottraendo il 20% di 300.000). Ambito spostato: la ripartizione 70/20/10 è delle sole elettriche, non del totale delle biciclette.`,
  patt: 'Periodo o ambito spostato' },

{ k: 'v-condominio', diff: 'difficile', lang: 'it',
  passage: `Dal regolamento di un condominio. La sala comune può essere prenotata dai condòmini per feste private fino a un massimo di tre volte all'anno, con almeno sette giorni di anticipo e versando una cauzione di 50 euro, restituita se la sala viene lasciata in ordine. Le feste devono terminare entro le 23 nei giorni feriali ed entro le 24 il sabato e i prefestivi. Le feste non sono ammesse la domenica. Chi non rispetta l'orario di chiusura perde la cauzione e non può prenotare la sala nei tre mesi successivi.`,
  stem: `La signora Bruni ha già prenotato la sala due volte quest'anno. Chiede di prenotarla per un sabato, con dieci giorni di anticipo; la festa terminerà all'una di notte e la sala sarà lasciata in ordine. Quale delle seguenti affermazioni è corretta?`,
  ...put('v-condominio', `La prenotazione è ammessa, ma se la festa termina all'una la signora perde la cauzione e non può prenotare nei tre mesi successivi.`,
    [`La prenotazione non è ammessa, perché la signora ha già usato due volte la sala quest'anno.`,
     `La prenotazione non è ammessa, perché le feste non sono consentite nei giorni prefestivi.`,
     `La prenotazione è ammessa e, poiché la sala sarà lasciata in ordine, la cauzione sarà comunque restituita.`]),
  sol: `Requisiti: terza prenotazione (il massimo è tre, quindi ammessa), anticipo di 10 giorni (almeno sette), sabato (ammesso, con chiusura entro le 24). Un'uscita all'una di notte viola l'orario: «perde la cauzione e non può prenotare nei tre mesi successivi». La sala in ordine non evita la perdita, perché l'orario è una condizione separata.`,
  trap: `Contare «tre volte» come limite già raggiunto con due prenotazioni; scambiare la domenica con il sabato; credere che l'ordine della sala basti a far restituire la cauzione (la restituzione dipende dall'ordine, la perdita dall'orario).`,
  patt: 'Applicazione di una regola' },

{ k: 'v-studenti', diff: 'media', lang: 'it',
  claim: `Gli studenti intervistati che studiano almeno tre ore al giorno sono più di 600.`,
  passage: `In un'indagine su 800 studenti universitari, il 78% ha dichiarato di studiare almeno tre ore al giorno, il 35% di lavorare almeno dieci ore alla settimana e il 12% di non avere mai frequentato le lezioni. Tra chi lavora, il 60% dichiara di studiare almeno tre ore al giorno. L'indagine è stata condotta online nel mese di maggio ed è stata inviata a tutti gli iscritti di tre atenei; il margine di errore dichiarato è del 3%. Non sono stati inclusi gli studenti dei dottorati.`,
  opts: VFN, ans: 2,
  sol: `Frase chiave: «il 78% ha dichiarato di studiare almeno tre ore al giorno» su 800 studenti: 0,78 · 800 = 624, più di 600. L'affermazione è vera (il dato su chi lavora è un sottoinsieme e non cambia il totale).`,
  trap: `Usare il 60% (chi lavora e studia: 0,6 · 280 = 168) o dubitare per il margine di errore (3% di 800 = 24: 624 − 24 = 600, ma il brano dà il numero dichiarato). Non è «non ricavabile»: il 78% è riferito a tutti gli 800.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-energy', diff: 'media', lang: 'it',
  passage: `Un produttore di bevande afferma che «il nostro nuovo energy drink ha fatto aumentare le vendite del 20%». La dichiarazione si basa sul confronto tra le vendite di dicembre 2025, mese in cui il prodotto è stato lanciato con una forte campagna promozionale, e quelle di novembre 2025. Le vendite di novembre erano state di 500.000 lattine e quelle di dicembre di 600.000. Il prodotto è venduto nei supermercati di tutto il Paese. La campagna è stata trasmessa in televisione e sui social network per tutto il mese.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione del produttore?`,
  ...put('v-energy', `L'andamento delle vendite di dicembre rispetto a novembre negli anni precedenti, prima del lancio del prodotto.`,
    [`Il costo della campagna promozionale di lancio.`,
     `Il numero di gusti in cui è disponibile il nuovo energy drink.`,
     `Il nome scelto per il nuovo prodotto.`]),
  sol: `L'affermazione attribuisce al nuovo prodotto l'aumento del 20% (600.000 contro 500.000). Se ogni anno le vendite di dicembre superano del 20% quelle di novembre (stagionalità, feste), l'aumento non dipende dal prodotto. Il confronto con gli anni precedenti è il dato che verifica l'attribuzione.`,
  trap: `Costo della campagna, numero di gusti e nome non misurano l'effetto del prodotto sulle vendite. Il confronto tra due mesi consecutivi è l'anello debole: serve sapere come variano di solito.`,
  patt: 'Dato mancante' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-prodotto-36', diff: 'media', lang: 'it', ds: true,
  stem: ds('Il prodotto di due numeri interi positivi a e b è 36. È vero che a + b è maggiore di 15?',
    'Il numero a è un multiplo di 4.',
    'Sia a sia b sono minori di 12.'),
  ...dsq('BDAC', 'A'),
  sol: `Le coppie (a, b) con prodotto 36 hanno somme 37 (1 e 36), 20 (2 e 18), 15 (3 e 12), 13 (4 e 9), 12 (6 e 6) e le simmetriche. (1): a può essere 4 (somma 13, no), 12 (somma 15, no) o 36 (somma 37, sì): non basta. (2): a e b minori di 12 lasciano solo (4, 9), (6, 6), (9, 4), con somme 13, 12, 13: tutte non maggiori di 15, quindi la risposta è sempre «no» e la (2) basta.`,
  trap: `Pensare che la (1) basti perché «un multiplo di 4» sembra fissare la coppia: ne lascia tre. La (2) non indica i valori esatti, ma ne limita la somma: per una domanda sì/no basta un limite, anche se la risposta è «no».`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-club', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('In un club il 60% dei soci è di sesso maschile. Qual è la percentuale dei soci che hanno più di 40 anni?',
    'Il 50% dei soci maschi ha più di 40 anni.',
    'Il 20% delle socie ha più di 40 anni.'),
  ...dsq('CBDA', 'B'),
  sol: `(1) da sola: dà la quota dei maschi sopra i 40 anni, ma non quella delle socie. (2) da sola: dà la quota delle socie, ma non quella dei maschi. Insieme, su 100 soci: 60 maschi, di cui il 50% = 30; 40 socie, di cui il 20% = 8. Hanno più di 40 anni 30 + 8 = 38 soci su 100: 38%.`,
  trap: `Credere che una delle due basti perché contiene una percentuale: ognuna riguarda un solo gruppo. Dopo averle messe insieme, fare la media semplice di 50% e 20% (35%) invece di pesarle con 60% e 40%.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-ufficio', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `In un ufficio lavorano soltanto ingegneri e contabili.`,
    `Almeno la metà dei dipendenti è ingegnere.`,
    `Ogni contabile parla l'inglese.`,
    `Nessun ingegnere parla il tedesco.`
  ], [
    `A. Nessun dipendente che parla il tedesco è ingegnere.`,
    `B. Almeno la metà dei dipendenti parla l'inglese.`,
    `C. Ogni dipendente che parla il tedesco è contabile.`,
    `D. I contabili sono più degli ingegneri.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la B', 'Sia la A sia la C', 'Sia la A sia la D', 'Solo la D'], ans: 1,
  sol: `A ripete in forma equivalente il quarto dato («nessun ingegnere parla il tedesco»): vera. C: chi parla il tedesco non è ingegnere e in ufficio ci sono solo ingegneri e contabili, quindi è contabile: vera. B non è sicura: gli ingegneri potrebbero non parlare l'inglese (e se i contabili sono pochi, meno della metà lo parla). D è sicuramente falsa: se almeno la metà è ingegnere, i contabili sono al più la metà.`,
  trap: `La B sembra una conseguenza del terzo dato, ma questo riguarda solo i contabili, che possono essere meno della metà. La D inverte «almeno la metà». La C richiede di passare per esclusione: nessun ingegnere → deve essere contabile.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-mercato', diff: 'media', lang: 'it', asset: tMercato(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`In Francia la marca Y vende più unità che in Germania.`,
         `Nei quattro paesi insieme la marca X vende meno unità della marca Z.`,
         `In Spagna la marca Y vende più unità che in Italia.`,
         `Nei quattro paesi insieme la marca Y detiene una quota di mercato superiore al 40%.`], ans: 3,
  sol: `Unità vendute dalla marca Y: Italia 50% di 10 = 5; Spagna 45% di 8 = 3,6; Francia 40% di 12 = 4,8; Germania 35% di 20 = 7. Totale 20,4 su un mercato di 50 milioni: 40,8%, quindi superiore al 40% (vera). In Francia 4,8 < 7 della Germania (falsa); in Spagna 3,6 < 5 dell'Italia (falsa). Marca X: 3 + 2 + 4,8 + 7 = 16,8 contro marca Z: 2 + 2,4 + 2,4 + 6 = 12,8: X vende di più (falsa).`,
  trap: `Confrontare le quote (40% contro 35% in Francia e Germania, 45% contro 50%) invece delle unità: i mercati hanno dimensioni diverse (12 e 20; 8 e 10). La quota complessiva si ottiene sommando le unità, non mediando le quote (la media semplice di Y sarebbe 42,5%).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-sondaggio', diff: 'media', lang: 'it', ds: true,
  stem: ds('In un sondaggio, più della metà degli intervistati è favorevole a una proposta?',
    'Il 60% degli uomini intervistati è favorevole.',
    'Il 40% delle donne intervistate è favorevole.'),
  ...dsq('DACB', 'D'),
  sol: `Se gli uomini sono M e le donne W, i favorevoli sono 0,6 M + 0,4 W. Sono più della metà di M + W solo se 0,6 M + 0,4 W > 0,5 M + 0,5 W, cioè se M > W. Le due affermazioni non dicono nulla sul numero di uomini e donne: con M = W i favorevoli sono esattamente la metà; con più uomini sono la maggioranza, con più donne no. Anche insieme servono altri dati.`,
  trap: `Pensare che 60% e 40% «si compensino» e diano 50%: è la media semplice, valida solo se uomini e donne sono in ugual numero. La media ponderata dipende dai pesi.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-studio', diff: 'media', lang: 'it', asset: gStudio(),
  stem: `Quante ore di studio settimanali dedica in media ciascuno studente dell'ateneo?`,
  ...put('d-studio', '18 ore', ['21 ore', '12 ore', '24 ore']),
  sol: `Ore totali: 400 · 12 + 300 · 18 + 200 · 24 + 100 · 30 = 4.800 + 5.400 + 4.800 + 3.000 = 18.000. Studenti: 1.000. Media: 18.000 ÷ 1.000 = 18 ore.`,
  trap: `21 ore è la media semplice delle quattro medie (12, 18, 24, 30), che trascura i pesi; 24 ore inverte i pesi (le matricole sono le più numerose, non le meno); 12 ore è la sola media delle matricole.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-circolo', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Nel circolo, chi gioca a scacchi gioca anche a dama.`,
    `Nessuno che gioca a dama gioca a tombola.`,
    `Alcuni soci giocano a tombola.`
  ], [
    `A. Alcuni soci giocano sia a tombola sia a scacchi.`,
    `B. Alcuni soci non giocano a scacchi.`,
    `C. Nessun socio che gioca a tombola gioca a dama.`,
    `D. Alcuni soci che giocano a dama giocano anche a tombola.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la A', 'Sia la B sia la C', 'Sia la A sia la D', 'Solo la D'], ans: 2,
  sol: `Chi gioca a scacchi gioca a dama, e chi gioca a dama non gioca a tombola: quindi chi gioca a scacchi non gioca a tombola. A («alcuni soci giocano sia a tombola sia a scacchi») è sicuramente falsa. D contraddice il secondo dato: sicuramente falsa. C ripete il secondo dato in forma capovolta: vera. B è vera: i soci che giocano a tombola (almeno uno) non giocano a scacchi.`,
  trap: `Con la consegna «false» si può indicare la B o la C, che sono vere. La A richiede due passaggi (scacchi → dama → non tombola); la D e la C sono la stessa relazione letta in due versi, una volta negata, una volta ribadita.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-sconto', diff: 'media', lang: 'it', ds: true,
  stem: ds('Qual è la percentuale di sconto applicata a una giacca?',
    'Il prezzo scontato è di 72 €.',
    'Il prezzo di listino è di 90 €.'),
  ...dsq('CABD', 'B'),
  sol: `(1) da sola: il prezzo scontato non basta senza il prezzo di partenza. (2) da sola: il listino non basta senza il prezzo scontato. Insieme: lo sconto è 90 − 72 = 18 €, cioè 18 ÷ 90 = 20% del listino.`,
  trap: `Calcolare lo sconto come 72 ÷ 90 = 80% e fermarsi: quello è il rapporto tra prezzo scontato e listino, non lo sconto; lo sconto è il 20% che manca. Ciascuna affermazione da sola dà un solo prezzo.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-negozi', diff: 'media', lang: 'it', asset: gNegozi(),
  stem: `In quanti negozi la crescita percentuale dei ricavi tra il 2024 e il 2025 è stata superiore alla crescita percentuale dei ricavi complessivi dei quattro negozi?`,
  ...put('d-negozi', '1', ['2', '3', '0']),
  sol: `Ricavi totali: 300 nel 2024 e 340 nel 2025, cioè +13,3%. Crescite dei negozi: A 80 → 88 = +10%; B 50 → 65 = +30%; C 120 → 132 = +10%; D 50 → 55 = +10%. Solo il negozio B supera il 13,3%: 1 negozio.`,
  trap: `Confrontare la crescita in valore assoluto con la media (+8, +15, +12, +5 contro +10 in media) porta a contare 2 negozi (B e C): il negozio C cresce di 12 mila euro ma parte da una base grande (+10%).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-gol', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Le squadre A, B e C hanno segnato in tutto 62 gol.`,
    `La squadra A ha segnato il doppio dei gol della squadra B.`,
    `La squadra C ha segnato 6 gol più della squadra B.`
  ], [
    `A. La squadra A ha segnato 28 gol.`,
    `B. La squadra B ha segnato meno del 20% dei gol totali.`,
    `C. La squadra A ha segnato più gol di B e C insieme.`,
    `D. La squadra C ha segnato più della metà dei gol di A.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la B sia la C', 'Sia la A sia la D', 'Sia la C sia la D'], ans: 2,
  sol: `Con B = x: A = 2x, C = x + 6 e 2x + x + x + 6 = 62, quindi 4x = 56 e x = 14. Allora A = 28 (A vera), C = 20. B: 14 ÷ 62 ≈ 22,6%, non meno del 20% (falsa). C: 28 contro 14 + 20 = 34 (falsa). D: la metà di 28 è 14 e C ha 20 (vera).`,
  trap: `La soglia del 20% è vicina al 22,6% reale; «più della metà» di A si controlla confrontando 20 con 14. Sbagliare il valore di x (per esempio 62 ÷ 4 = 15,5) falsa tutti i confronti.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-soci', diff: 'difficile', lang: 'it', asset: gSoci(),
  stem: `Quanto incassa la palestra, in totale, dalle quote dei sei mesi?`,
  ...put('d-soci', '36.400 €', ['36.000 €', '32.000 €', '40.000 €']),
  sol: `Da gennaio a marzo: (100 + 120 + 140) · 40 = 360 · 40 = 14.400 €. Da aprile a giugno: (130 + 150 + 160) · 50 = 440 · 50 = 22.000 €. Totale: 14.400 + 22.000 = 36.400 €.`,
  trap: `36.000 € usa il numero medio di soci (800 ÷ 6) per sei mesi e la quota media (45 €), cioè due medie semplici; 32.000 € applica 40 € a tutti i 800 «soci-mese»; 40.000 € applica 50 €. Le quote cambiano da aprile: le due fasi vanno calcolate separatamente.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-quadro', diff: 'media', lang: 'it', ds: true,
  stem: ds('Siano x e y due numeri reali. È vero che x · y è maggiore di 0?',
    'x + y è maggiore di 0.',
    'x è maggiore di −2.'),
  ...dsq('ABCD', 'D'),
  sol: `(1): x = 1 e y = 2 danno prodotto 2 (sì); x = 3 e y = −1 danno prodotto −3 (no): non basta. (2): x = 1, y = 2 (sì) oppure x = 1, y = −5 (no): non basta. Insieme: x = 1 e y = 2 danno sì; x = −1 e y = 2 (x > −2, x + y = 1 > 0) danno prodotto −2 (no). Servono altri dati.`,
  trap: `Pensare che due disuguaglianze «di segno» fissino il segno del prodotto: la (1) vincola la somma, non i singoli segni; la (2) limita x solo da sotto. Serve un controesempio per ciascun caso, anche per le due affermazioni insieme.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-energia', diff: 'difficile', lang: 'it', asset: tEnergia(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel 2025 la produzione solare è più che doppia rispetto a quella del 2021.`,
         `Nel 2024 l'idroelettrico ha prodotto più del solare e dell'eolico insieme.`,
         `Tra il 2021 e il 2025 la produzione totale è cresciuta di meno del 40%.`,
         `In ogni anno l'idroelettrico ha prodotto almeno il 40% del totale.`], ans: 2,
  sol: `Il dato mancante si ricava dal totale: idroelettrico 2024 = 120 − 36 − 40 = 44. Prima: solare 40 nel 2025 contro 20 nel 2021, esattamente il doppio, non «più che doppia» (falsa). Seconda: 44 contro 36 + 40 = 76 (falsa). Terza: totale da 100 a 138, cioè +38%, meno del 40% (vera). Quarta: nel 2024 l'idroelettrico è 44 ÷ 120 ≈ 36,7%, sotto il 40% (falsa).`,
  trap: `«Più che doppia» con un valore esattamente doppio; la soglia del 40% è vicina al 38% reale; la quarta si smentisce solo con la cella ricostruita (44 su 120). Dimenticare di ricostruire la cella porta a non poter valutare B e D.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-palline', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Una scatola contiene 20 palline, ciascuna rossa, verde o blu.`,
    `Le palline rosse sono più delle verdi e le verdi sono più delle blu.`,
    `Ci sono almeno 3 palline blu.`
  ], [
    `A. Le palline rosse sono almeno 8.`,
    `B. Le palline blu sono più di 6.`,
    `C. Le palline verdi sono meno di 8.`,
    `D. Le palline rosse sono meno di 8.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la B', 'Sia la B sia la D', 'Sia la A sia la C', 'Solo la D'], ans: 1,
  sol: `Con r > g > b ≥ 3 e r + g + b = 20: il minimo di r si ha con valori vicini, per esempio (8, 7, 5): r non può essere 7 o meno (7 + 6 + 5 = 18 < 20), quindi r ≥ 8 (A vera, D sicuramente falsa). b non può superare 5 (con b = 6 servirebbe almeno 6 + 7 + 8 = 21 > 20): B sicuramente falsa. C non è sicura: con (9, 8, 3) le verdi sono 8, con (8, 7, 5) sono 7.`,
  trap: `La A è vera, quindi con la consegna «false» non va scelta; la D è la sua negazione. La C sembra falsa perché 8 è un valore estremo, ma dipende dalla distribuzione. La B richiede di testare il massimo possibile delle blu.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-associazione', diff: 'media', lang: 'it', asset: tAssoc(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`L'avanzo annuo (entrate meno uscite) è il 10% delle entrate annue.`,
         `Nel quarto trimestre l'avanzo è stato il doppio di quello del primo trimestre.`,
         `In ogni trimestre le uscite sono cresciute, rispetto al trimestre precedente, più delle entrate.`,
         `Nessuna delle altre risposte è corretta.`], ans: 1,
  sol: `Avanzi trimestrali (entrate − uscite): 10, 5, 10, 20. Entrate annue 400, uscite 355, avanzo 45, cioè l'11,25% delle entrate, non il 10% (prima falsa). Nel quarto trimestre l'avanzo è 20, il doppio di 10 del primo (seconda vera). Dal T1 al T2 le uscite crescono di 15 e le entrate di 10, ma dal T2 al T3 le uscite crescono di 5 e le entrate di 10 (terza falsa). Quindi «Nessuna» è falsa.`,
  trap: `L'11,25% è vicino al 10%; per la terza basta un solo trimestre in cui le uscite crescono meno (T2 → T3) per smentirla. Lo scarto tra i trimestri non va confuso con l'avanzo cumulato.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-triangolo', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Un triangolo isoscele ha il perimetro di 36 cm. Quanto misura la sua base?',
    'I due lati uguali misurano 13 cm ciascuno.',
    'L\'altezza relativa alla base misura 12 cm.'),
  ...dsq('ADBC', 'C'),
  sol: `(1): la base è 36 − 2 · 13 = 10 cm, quindi la (1) basta. (2): se la base è b, i lati uguali sono l = (36 − b) ÷ 2 e per il teorema di Pitagora l² = 12² + (b ÷ 2)²; sostituendo, (18 − b/2)² = 144 + b²/4, cioè 324 − 18b = 144 e b = 10 cm: anche la (2) basta. Le due informazioni sono coerenti (triangolo 5, 12, 13).`,
  trap: `Pensare che l'altezza da sola non fissi nulla, perché «non si conoscono i lati»: insieme al perimetro e alla forma isoscele determina la base con una sola equazione. È facile scegliere «servono entrambe» o «servono altri dati» senza provare a risolvere.`,
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
  id: '22',
  title: 'Mock 22',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Tutto in italiano, livello del Mock 15, ma con calcoli e testi più corti (tempo stimato circa 85 minuti): imposte a cascata e basi delle percentuali, resti e congruenze, probabilità condizionata, medie ponderate, brani da 80–150 parole con modali. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false», sufficienza dei dati e tabelle con quote di riga e celle mancanti.',
  questions: QUESTIONS,
  data: DATA
};
});
