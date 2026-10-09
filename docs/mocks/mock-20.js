/* =======================================================================
   Mock 20 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
   calibrate con guida-calibrazione-mock.md e sullo stesso livello del
   Mock 15: Quantitativa e Verbale più difficili del Mock 14 (più
   passaggi, brani da 100–200 parole con modali, opzioni sbagliate tutte
   plausibili), Data Insights come il Mock 14.

   Nelle domande di sufficienza dei dati i criteri sono fissi:
   A = una sola delle due affermazioni basta, B = servono entrambe,
   C = ciascuna basta da sola, D = servono altri dati; nella lista
   compaiono in ordine rimescolato (la lettera del criterio è scritta
   nel testo dell'opzione, la posizione A–D è quella del pulsante).

   Le domande sono scritte per area (Q, V, DI) e poi disposte in schermate
   da tre con ordine delle aree variabile (LAYOUT). Il campo `k` identifica
   la domanda per gli script di verifica (tools/check_math_20.py).
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
  'q-stranieri': 1,
  'q-carburante': 1,
  'q-sconti': 3,
  'q-monete': 0,
  'q-ricavo': 1,
  'q-cassa': 2,
  'q-eta-media': 3,
  'q-quaderni': 0,
  'q-resto127': 3,
  'q-margine': 0,
  'q-calendario': 3,
  'q-ciclista': 1,
  'q-soci': 0,
  'q-bayes': 3,
  'q-francia': 1,
  'q-orologio': 1,
  'q-resto2': 2,
  'q-tavolo': 1,
  'v-skyvia': 1,
  'v-libreria': 0,
  'v-pareggio': 1,
  'v-illuminazione': 1,
  'v-prezzi-case': 0,
  'v-regola': 0,
  'v-app': 3,
  'v-rinnovabili': 1,
  'v-cestini': 0,
  'v-incidenti': 0,
  'v-fattore': 0,
  'd-piani': 3,
  'd-fondo': 3,
  'd-trimestri': 3,
  'd-comune': 3
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
  /* valore di un fondo a fine anno (milioni di euro) */
  fondo: { anni: [2020, 2021, 2022, 2023, 2024, 2025], valore: [100, 120, 108, 135, 162, 148] },
  /* ricavi e costi trimestrali (milioni di euro) e aliquota sull'utile */
  trimestri: { nomi: ['T1', 'T2', 'T3', 'T4'], ricavi: [20, 25, 30, 35], costi: [18, 24, 27, 30], imposte: 30 },
  /* spesa di un comune per voce (%), totale, ripartizione dei trasporti e aumento della spesa per gli autobus */
  comune: { nomi: ['Istruzione', 'Sanità', 'Trasporti', 'Altro'], quote: [30, 25, 20, 25], totale: 60, trasporti: [1, 2, 1], aumentoAutobus: 10 },
  /* utenti di tre piani tariffari per regione (% di riga) */
  piani: { regioni: ['Nord', 'Centro', 'Sud'], n: [1000, 500, 500], base: [50, 40, 30], plus: [30, 40, 40], premium: [20, 20, 30] },
  /* pezzi prodotti (migliaia) in tre stabilimenti */
  produzione: { anni: [2021, 2022, 2023, 2024, 2025], A: [120, 126, 132, 138, 150], B: [80, 84, 92, 100, 104], C: [60, 66, 70, 78, 86] },
  /* iscritti a tre corsi: celle nascoste (null) da ricostruire con i totali */
  iscritti: { corsi: ['A', 'B', 'C'], y24: [120, null, 80], y25: [null, 130, 100], totRiga: [270, 240, 180], totCol: [310, 380], totale: 690 }
};

/* ======================= tabelle e grafici ======================= */
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dec = n => String(n).replace('.', ',');

function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

function gFondo() {
  const D = DATA.fondo;
  return `<figure class="fig"><figcaption>Valore di un fondo comune di investimento a fine anno, in milioni di euro</figcaption>` + C.line({
    labels: D.anni.map(String),
    series: [{ name: 'Valore del fondo', values: D.valore }],
    lo: 80, hi: 180, gridFrom: 80, gridTo: 180, gridStep: 20, L: 58, R: 30, legend: false, title: 'milioni di euro',
    aria: 'Linea del valore del fondo dal 2020 al 2025, in milioni di euro: ' + D.anni.map((a, i) => a + ' ' + D.valore[i]).join(', ') + '.'
  }) + `</figure>`;
}

function gTrimestri() {
  const D = DATA.trimestri;
  return `<figure class="fig"><figcaption>Ricavi e costi trimestrali di un'azienda, in milioni di euro</figcaption>` + C.bars({
    labels: D.nomi, series: [{ name: 'Ricavi', values: D.ricavi }, { name: 'Costi', values: D.costi, style: 'outline' }], max: 40, legend: true,
    aria: 'Istogramma di ricavi e costi per trimestre: ' + D.nomi.map((n, i) => n + ' ricavi ' + D.ricavi[i] + ', costi ' + D.costi[i]).join('; ') + '.'
  }) + `<p class="fig-note">Le imposte sono il ${D.imposte}% dell'utile (ricavi meno costi) di ciascun trimestre.</p></figure>`;
}

function gComune() {
  const D = DATA.comune;
  return `<figure class="fig"><figcaption>Spesa di un comune per voce (% della spesa totale)</figcaption>` + C.pie({
    data: D.nomi.map((n, i) => [n, D.quote[i]]), title: 'Spesa del comune',
    aria: 'Torta della spesa del comune: ' + D.nomi.map((n, i) => n + ' ' + D.quote[i] + '%').join(', ') + '.'
  }) + `<p class="fig-note">La spesa totale del comune è di ${D.totale} milioni di euro. La spesa per i trasporti è ripartita tra strade, autobus e ferrovie nel rapporto ${D.trasporti.join(' : ')}. L'anno prossimo la spesa per gli autobus aumenterà del ${D.aumentoAutobus}%, mentre il resto della spesa non cambierà.</p></figure>`;
}

function tPiani() {
  const P = DATA.piani;
  return C.table({
    caption: 'Utenti di un servizio in abbonamento per piano tariffario e regione (% degli utenti di ciascuna regione)',
    head: ['Regione', 'Utenti', 'Base', 'Plus', 'Premium'],
    rows: P.regioni.map((r, i) => [r, fmt(P.n[i]), P.base[i] + '%', P.plus[i] + '%', P.premium[i] + '%'])
  }) + `<p class="fig-note">In ogni regione le tre percentuali sommano a 100%. La seconda colonna indica il numero di utenti della regione.</p>`;
}

function tProduzione() {
  const D = DATA.produzione;
  return C.table({
    caption: 'Pezzi prodotti in tre stabilimenti, in migliaia',
    head: ['Stabilimento'].concat(D.anni),
    rows: [['A'].concat(D.A), ['B'].concat(D.B), ['C'].concat(D.C)]
  });
}

function tIscritti() {
  const D = DATA.iscritti, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Studenti iscritti a tre corsi di un ateneo',
    head: ['Corso', '2024', '2025', 'Totale 2024–2025'],
    rows: D.corsi.map((n, i) => ['Corso ' + n, c(D.y24[i]), c(D.y25[i]), D.totRiga[i]]),
    foot: ['Totale', D.totCol[0], D.totCol[1], D.totale]
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato.</p>`;
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-carburante', diff: 'facile', lang: 'it',
  stem: `Luca percorre 300 km con un'auto che fa 12 km con un litro; la benzina costa 1,80 € al litro. L'azienda gli rimborsa 0,12 € per ogni km percorso. Quanto resta a carico di Luca?`,
  ...put('q-carburante', '9 €', ['36 €', '45 €', '81 €']),
  sol: `Litri consumati: 300 ÷ 12 = 25; costo: 25 · 1,80 = 45 €. Rimborso: 300 · 0,12 = 36 €. A carico di Luca: 45 − 36 = 9 €.`,
  trap: `Ciascuna esca si ferma a un passaggio: 36 € è il solo rimborso, 45 € è il costo senza rimborso, 81 € somma il rimborso invece di sottrarlo.`,
  patt: 'Dati e passaggi' },

{ k: 'q-sconti', diff: 'media', lang: 'it',
  stem: `Per un divano un cliente paga 459 € dopo due sconti successivi: prima il 10% sul prezzo di listino e poi un ulteriore 15% sul prezzo già scontato. Qual era il prezzo di listino?`,
  ...put('q-sconti', '600 €', ['612 €', '510 €', 'circa 574 €']),
  sol: `I due sconti si moltiplicano: 0,90 · 0,85 = 0,765, quindi 459 = 0,765 · listino e il listino è 459 ÷ 0,765 = 600 €. (Controllo: 600 · 0,9 = 540; 540 · 0,85 = 459.)`,
  trap: `Sommare gli sconti (25%) e dividere per 0,75 dà 612 €; considerare soltanto il primo sconto dà 459 ÷ 0,9 = 510 €; moltiplicare per 1,25 invece di dividere dà circa 574 €. Il secondo sconto si applica al prezzo già scontato, che è la sua base.`,
  patt: 'Base della percentuale' },

{ k: 'q-monete', diff: 'media', lang: 'it',
  stem: `In una cassetta ci sono 5 monete da 1 € e 3 monete da 2 €. Se ne estraggono due contemporaneamente, qual è la probabilità che il loro valore complessivo sia di almeno 3 €?`,
  ...put('q-monete', fr(9, 14), [fr(5, 14), fr(39, 64), fr(15, 28)]),
  sol: `Le coppie possibili sono C(8,2) = 28. Il valore è inferiore a 3 € solo con due monete da 1 € (2 €): C(5,2) = 10 coppie. Quelle con almeno 3 € sono 28 − 10 = 18, quindi la probabilità è 18/28 = 9/14.`,
  trap: `5/14 = 10/28 è la probabilità dell'evento opposto (due monete da 1 €). 15/28 è la probabilità di una moneta per tipo (3 €) e dimentica le coppie da 2 € + 2 € (4 €). 39/64 si ottiene con reinserimento (1 − (5/8)²): qui le monete sono estratte insieme.`,
  patt: 'Probabilità: complementare' },

{ k: 'q-ricavo', diff: 'media', lang: 'it',
  stem: `Il prezzo di un prodotto viene ridotto del 20%. Di quanto devono aumentare, in percentuale, le quantità vendute perché il ricavo (prezzo per quantità) resti invariato?`,
  ...put('q-ricavo', '+25%', ['+20%', '+30%', '+40%']),
  sol: `Il nuovo prezzo è 0,8 volte il precedente: serve una quantità x tale che 0,8 · x = 1, cioè x = 1,25: +25%. (Controllo: 100 pezzi a 10 € = 1.000 €; 125 pezzi a 8 € = 1.000 €.)`,
  trap: `Rispondere +20% (la stessa percentuale del calo) dimentica che il calo del 20% è calcolato sul prezzo di partenza, mentre l'aumento è calcolato su una quantità più piccola della base finale. +30% e +40% sono valori «a occhio».`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-stranieri', diff: 'difficile', lang: 'it',
  stem: `In un paese il 10% degli abitanti è straniero. Dopo l'arrivo di 1.000 nuovi residenti stranieri, senza altre variazioni della popolazione, gli stranieri sono il 15% degli abitanti. Quanti abitanti aveva il paese prima dell'arrivo?`,
  ...put('q-stranieri', '17.000', ['20.000', '10.000', '8.500']),
  sol: `Con N abitanti all'inizio: (0,10 · N + 1.000) ÷ (N + 1.000) = 0,15, cioè 0,10 · N + 1.000 = 0,15 · N + 150 e 0,05 · N = 850, quindi N = 17.000. (Controllo: 1.700 stranieri su 17.000; dopo 2.700 su 18.000 = 15%.)`,
  trap: `Dividere 1.000 per il 5% (20.000) dimentica che i nuovi arrivati aumentano anche il totale degli abitanti: la base della percentuale cambia. 10.000 = 1.000 ÷ 10%; 8.500 è la metà di 17.000.`,
  patt: 'Base della percentuale' },

{ k: 'q-cassa', diff: 'media', lang: 'it',
  stem: `Quanti anagrammi della parola CASSA (anche privi di significato) hanno le due lettere S non vicine tra loro?`,
  ...put('q-cassa', '18', ['12', '30', '24']),
  sol: `Gli anagrammi di CASSA sono 5! ÷ (2! · 2!) = 30 (due S e due A uguali). Quelli con le due S vicine: si considera SS come un blocco da sistemare con C, A, A: 4! ÷ 2! = 12. Quelli con le S non vicine sono 30 − 12 = 18.`,
  trap: `12 è la risposta alla domanda opposta (S vicine); 30 è il totale; 24 = 4! dimentica le lettere ripetute.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-eta-media', diff: 'media', lang: 'it',
  stem: `L'età media di un gruppo di 10 persone è 30 anni. Quando una persona lascia il gruppo, l'età media delle 9 persone rimaste scende a 28 anni. Quanti anni ha la persona che se n'è andata?`,
  ...put('q-eta-media', '48', ['50', '32', '58']),
  sol: `Somma delle età all'inizio: 10 · 30 = 300. Somma delle età dei 9 rimasti: 9 · 28 = 252. La persona uscita ha 300 − 252 = 48 anni. (Controllo: 30 + 2 · 9 = 48: i 9 rimasti sono 2 anni sotto la media e ciascun anno va compensato dalla persona uscita.)`,
  trap: `32 è 30 + 2: tratta l'uscita come se spostasse la media «di uno» senza considerare il peso dei 9 rimasti. 50 = 30 + 2 · 10 usa il peso sbagliato (10 invece di 9). 58 = 30 + 28 somma due medie.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-quaderni', diff: 'media', lang: 'it',
  stem: `Con 50 € si comprano 5 quaderni e 4 penne; con 38 € si comprano 3 quaderni e 4 penne (agli stessi prezzi). Quanto costano 2 quaderni e 3 penne?`,
  ...put('q-quaderni', '27 €', ['24 €', '30 €', '33 €']),
  sol: `Confrontando i due acquisti, 2 quaderni costano 50 − 38 = 12 €, quindi un quaderno costa 6 €. Allora 4 penne costano 38 − 3 · 6 = 20 € e una penna 5 €. Due quaderni e tre penne: 12 + 3 · 5 = 27 €.`,
  trap: `Fermarsi a 2 quaderni = 12 € e aggiungere altri 12 € (24 €) significa trattare le penne come costose quanto i quaderni; 30 € e 33 € dimenticano la differenza tra i due acquisti e risultano da stime.`,
  patt: 'Equazioni a parole' },

{ k: 'q-resto127', diff: 'difficile', lang: 'it',
  stem: `Un intero positivo n compreso tra 100 e 150 dà resto 3 se diviso per 4, resto 1 se diviso per 3 e resto 2 se diviso per 5. Quanto vale n?`,
  ...put('q-resto127', '127', ['107', '112', '139']),
  sol: `Resto 3 per 4 e resto 1 per 3 significa n = 7, 19, 31, … (7 + 12k). Tra questi, quelli con resto 2 per 5 si ripetono ogni 60: 7, 67, 127, …; tra 100 e 150 c'è solo 127. (Controllo: 127 = 4 · 31 + 3 = 3 · 42 + 1 = 5 · 25 + 2.)`,
  trap: `Ognuna delle esche rispetta due condizioni su tre: 107 (resti 3 e 2, ma 107 = 3 · 35 + 2), 112 (resti 1 e 2, ma 112 è multiplo di 4) e 139 (resti 3 e 1, ma 139 = 5 · 27 + 4). Va verificata la terza condizione.`,
  patt: 'Resti e congruenze' },

{ k: 'q-margine', diff: 'difficile', lang: 'it',
  stem: `Un negozio vende un paio di scarpe a 160 € guadagnando il 25% sul prezzo di vendita. A quale prezzo dovrebbe venderle per guadagnare il 25% sul costo?`,
  ...put('q-margine', '150 €', ['200 €', '144 €', '128 €']),
  sol: `Il guadagno è il 25% di 160 = 40 €, quindi il costo è 160 − 40 = 120 €. Con il 25% sul costo il prezzo sarebbe 120 · 1,25 = 150 €.`,
  trap: `Applicare il 25% al prezzo di vendita come se fosse un ricarico (160 · 1,25 = 200 €); 144 € = 120 · 1,2 e 128 € = 160 · 0,8 mescolano le basi. La base del 25% cambia: prima è il prezzo di vendita, poi il costo.`,
  patt: 'Base della percentuale' },

{ k: 'q-calendario', diff: 'difficile', lang: 'it',
  stem: `Il 29 febbraio 2028 cade di martedì. Che giorno della settimana sarà il 29 febbraio 2032?`,
  ...put('q-calendario', 'domenica', ['lunedì', 'sabato', 'mercoledì']),
  sol: `Tra le due date passano quattro anni, tre da 365 giorni e uno da 366: 4 · 365 + 1 = 1.461 giorni. 1.461 = 7 · 208 + 5, quindi il giorno della settimana avanza di 5: martedì + 5 = domenica.`,
  trap: `Contare 4 · 365 = 1.460 (resto 4) dimentica il giorno bisestile e dà sabato; contare anni «interi» di 52 settimane senza resto o con un resto sbagliato porta a lunedì o mercoledì.`,
  patt: 'Calendario e giorni della settimana' },

{ k: 'q-ciclista', diff: 'difficile', lang: 'it',
  stem: `Un ciclista deve percorrere 60 km e parte alle 8:00 a 20 km/h. Dopo un'ora di marcia si ferma 30 minuti per un guasto, poi riparte e percorre i chilometri restanti a 30 km/h. A che ora arriva?`,
  ...put('q-ciclista', '10:50', ['10:20', '11:00', '11:30']),
  sol: `Nella prima ora percorre 20 km, ne restano 40. Sosta di 30 minuti. Gli ultimi 40 km a 30 km/h richiedono 40 ÷ 30 = 4/3 h = 80 minuti. Totale: 60 + 30 + 80 = 170 minuti = 2 h 50 min, quindi arriva alle 10:50.`,
  trap: `10:20 dimentica la sosta (2 h 20 min); 11:00 dimentica sia la sosta sia l'aumento di velocità (3 ore: gli ultimi 40 km a 20 km/h); 11:30 applica i 30 km/h a tutti i 60 km e dimentica i 20 km già percorsi.`,
  patt: 'Velocità con cambio a metà' },

{ k: 'q-soci', diff: 'media', lang: 'it',
  stem: `Tre soci dividono un utile di 80.000 € in proporzione alle quote di 2, 3 e 5 parti. Poi il terzo socio cede al primo un quinto della somma che ha ricevuto. Quanto ha in tutto il primo socio?`,
  ...put('q-soci', '24.000 €', ['16.000 €', '20.000 €', '32.000 €']),
  sol: `Le parti sono 2 + 3 + 5 = 10, ciascuna di 8.000 €: il primo riceve 16.000 €, il secondo 24.000 €, il terzo 40.000 €. Il terzo cede un quinto di 40.000 € = 8.000 € al primo, che ha 16.000 + 8.000 = 24.000 €.`,
  trap: `Dimenticare la cessione (16.000 €); calcolare il quinto di una somma sbagliata (un quinto di 20.000 = 4.000 dà 20.000 €); sommare al primo la sua stessa quota (16.000 + 16.000 = 32.000 €).`,
  patt: 'Divisione proporzionale' },

{ k: 'q-bayes', diff: 'difficile', lang: 'it',
  stem: `Una malattia colpisce una persona su 100. Un test dà esito positivo nel 90% delle persone malate e anche nel 10% delle persone sane. Una persona scelta a caso risulta positiva al test. Qual è la probabilità che sia malata?`,
  ...put('q-bayes', fr(1, 12), [fr(9, 10), fr(1, 10), fr(1, 2)]),
  sol: `Su 10.000 persone, 100 sono malate e 90 di loro risultano positive; 9.900 sono sane e 990 di loro risultano positive. I positivi sono 90 + 990 = 1.080 e i malati tra loro sono 90: 90 ÷ 1.080 = 1/12.`,
  trap: `9/10 è la probabilità di essere positivi sapendo di essere malati, cioè la probabilità condizionata nel verso opposto. 1/10 è la quota di falsi positivi tra i sani. La malattia è rara: i falsi positivi (990) superano di molto i veri positivi (90).`,
  patt: 'Probabilità condizionata' },

{ k: 'q-francia', diff: 'difficile', lang: 'it',
  stem: `In Italia un libro costa il 25% in meno che in Francia, mentre in Germania costa il 20% in più che in Francia. Di quanto, in percentuale, il prezzo tedesco supera quello italiano?`,
  ...put('q-francia', '+60%', ['+50%', '+45%', '+33%']),
  sol: `Con prezzo francese 100: Italia 75 e Germania 120. Il prezzo tedesco rispetto a quello italiano è 120 ÷ 75 = 1,6, cioè +60% (la base è il prezzo italiano).`,
  trap: `Sommare 25% e 20% dà +45%. +50% viene da 1,2 · 1,25 (usa il 25% come se fosse l'aumento della Francia sull'Italia, invece di 1/0,75 ≈ 1,33). +33% è il prezzo francese rispetto a quello italiano, senza la Germania.`,
  patt: 'Base della percentuale' },

{ k: 'q-orologio', diff: 'media', lang: 'it',
  stem: `Un orologio batte i rintocchi a intervalli regolari: per suonare 6 rintocchi impiega 5 secondi, dal primo all'ultimo. Quanti secondi passano dal primo all'ultimo rintocco quando suona 12 rintocchi?`,
  ...put('q-orologio', '11 secondi', ['10 secondi', '12 secondi', 'Non si può stabilire senza conoscere la durata di ciascun rintocco']),
  sol: `6 rintocchi delimitano 5 intervalli: 5 secondi, quindi 1 secondo per intervallo. 12 rintocchi delimitano 11 intervalli: 11 secondi.`,
  trap: `Fare la proporzione sui rintocchi (12 ÷ 6 · 5 = 10) conta i rintocchi invece degli intervalli. 12 secondi si ottiene con un secondo per rintocco. L'ultima opzione è un'esca: la durata dei rintocchi non serve, perché il tempo si misura dal primo all'ultimo.`,
  patt: 'Ragionamento laterale' },

{ k: 'q-resto2', diff: 'media', lang: 'it',
  stem: `Qual è il resto della divisione di 2<sup>100</sup> per 7?`,
  ...put('q-resto2', '2', ['1', '4', '6']),
  sol: `I resti delle potenze di 2 divise per 7 si ripetono con periodo 3: 2¹ → 2, 2² → 4, 2³ = 8 → 1, 2⁴ → 2, … Poiché 100 = 3 · 33 + 1, 2¹⁰⁰ ha lo stesso resto di 2¹, cioè 2.`,
  trap: `Il resto 1 si ha per gli esponenti multipli di 3 (99, non 100); il 4 corrisponde a un esponente con resto 2 nella divisione per 3. 6 non compare mai tra i resti delle potenze di 2 modulo 7.`,
  patt: 'Resti e congruenze' },

{ k: 'q-tavolo', diff: 'media', lang: 'it',
  stem: `In quanti modi diversi cinque persone possono sedersi attorno a un tavolo rotondo, se due di loro, Anna e Bea, vogliono stare vicine? (Due disposizioni che si ottengono l'una dall'altra ruotando il tavolo sono considerate uguali.)`,
  ...put('q-tavolo', '12', ['24', '48', '6']),
  sol: `Anna e Bea formano un blocco: i quattro «elementi» (blocco e le altre tre persone) attorno a un tavolo rotondo si dispongono in (4 − 1)! = 6 modi; il blocco ha 2 ordini interni (Anna a sinistra di Bea o il contrario). In tutto 6 · 2 = 12.`,
  trap: `48 = 4! · 2 conta ogni rotazione come una disposizione diversa (come per una fila); 24 è 4! senza l'ordine interno al blocco o (5 − 1)! senza il vincolo; 6 dimentica che il blocco si può scambiare.`,
  patt: 'Combinatoria con vincolo' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-terrafina', diff: 'media', lang: 'it',
  claim: `Nel 2015 Terrafina produceva macchinari in uno stabilimento situato fuori dall'Italia.`,
  passage: `L'azienda Terrafina, fondata nel 1972, ha costruito per quasi mezzo secolo i propri macchinari esclusivamente nello stabilimento di Fano. Soltanto nel 2019, con l'acquisizione di una società polacca, ha iniziato a produrre anche fuori dall'Italia. Nel 2024 gli stabilimenti esteri hanno realizzato il 35% dei 480 milioni di euro di fatturato del gruppo. Il presidente ha dichiarato che la sede legale resterà a Fano.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «esclusivamente nello stabilimento di Fano» e «Soltanto nel 2019 … ha iniziato a produrre anche fuori dall'Italia». Nel 2015 non esistevano stabilimenti esteri: l'affermazione è contraddetta, anche se il brano non nomina il 2015.`,
  trap: `Rispondere «non ricavabile» perché il 2015 non è citato: «esclusivamente» e «soltanto nel 2019» coprono tutto il periodo precedente. I dati del 2024 (35% del fatturato) riguardano un altro anno.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-skyvia', diff: 'difficile', lang: 'it',
  passage: `Nel 2025 la compagnia aerea Skyvia ha trasportato 11 milioni di passeggeri, il 10% in più rispetto al 2024. La tariffa media per passeggero è scesa da 90 a 80 euro, mentre la quota dei passeggeri con bagaglio a pagamento è salita dal 20% al 30%. La compagnia precisa che i ricavi dei bagagli e degli altri servizi accessori non sono compresi nelle tariffe indicate.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put('v-skyvia', `Nel 2025 il numero di passeggeri con bagaglio a pagamento è raddoppiato rispetto al 2024.`,
    [`Nel 2024 la compagnia aveva trasportato 10 milioni di passeggeri.`,
     `I ricavi da biglietti del 2025 sono stati inferiori a quelli del 2024.`,
     `Nel 2025 i passeggeri con bagaglio a pagamento sono stati 3,3 milioni.`]),
  sol: `Frasi chiave: «11 milioni di passeggeri, il 10% in più rispetto al 2024» (nel 2024: 10 milioni, corretta) e «la quota … con bagaglio a pagamento è salita dal 20% al 30%». Passeggeri con bagaglio: 20% di 10 milioni = 2 milioni nel 2024 e 30% di 11 milioni = 3,3 milioni nel 2025 (corretta), cioè +65%, non il doppio: è l'affermazione sbagliata. Ricavi da biglietti: 10 milioni · 90 € = 900 milioni nel 2024; 11 milioni · 80 € = 880 milioni nel 2025 (corretta).`,
  trap: `Leggere 20% → 30% come +50% o come «quasi il doppio» e dimenticare che anche il totale dei passeggeri cresce del 10%. Con i numeri assoluti: 2 milioni → 3,3 milioni. Nelle domande «NON è corretta» va cercata l'unica frase sbagliata.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-libreria', diff: 'media', lang: 'it',
  passage: `Dopo l'apertura di un caffè all'interno della libreria Pagina, le vendite di libri sono aumentate del 18% rispetto all'anno precedente. Il titolare attribuisce l'aumento al caffè, che avrebbe attirato nuovi clienti, e intende aprirne uno anche nella seconda sede. Nello stesso periodo il numero di clienti che hanno comprato almeno un libro è cresciuto del 15%, mentre lo scontrino medio è rimasto stabile.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del titolare?`,
  ...put('v-libreria', `Nello stesso anno la libreria concorrente più vicina, a duecento metri, ha chiuso definitivamente.`,
    [`Il caffè è aperto dalle 8 alle 22 e serve anche pasti leggeri.`,
     `Allestire un caffè nella seconda sede costerebbe il doppio che nella prima.`,
     `Molti clienti hanno dichiarato di avere preso un caffè prima di acquistare i libri.`]),
  sol: `La conclusione è causale: il caffè avrebbe attirato nuovi clienti e fatto salire le vendite del 18%. Se nello stesso anno la libreria concorrente più vicina ha chiuso, i suoi clienti possono essere passati a Pagina: c'è una causa alternativa dell'aumento dei clienti. Le dichiarazioni dei clienti rafforzano; orari e costi non toccano il nesso.`,
  trap: `La terza opzione è un dato sul costo della proposta (la seconda sede), non sul nesso tra caffè e vendite. L'ultima rafforza invece di indebolire: l'aggettivo «indebolisce» va letto due volte.`,
  patt: 'Cause alternative' },

{ k: 'v-scuola', diff: 'media', lang: 'it',
  claim: `Una famiglia con quattro figli iscritti paga per il quarto figlio una retta di 2.000 euro.`,
  passage: `Una scuola privata applica una retta annuale di 4.000 euro per il primo figlio iscritto di ogni famiglia. Per il secondo figlio la retta è ridotta del 30%; per il terzo e per tutti i figli successivi è ridotta del 50%. Le riduzioni si calcolano sulla retta intera di 4.000 euro e non si sommano tra loro. Il pagamento può essere rateizzato in dieci mensilità senza interessi. Nel 2025 la scuola ha accolto 620 studenti.`,
  opts: VFN, ans: 2,
  sol: `Frase chiave: «per il terzo e per tutti i figli successivi è ridotta del 50%». Il quarto figlio è un figlio successivo al terzo: la retta è il 50% di 4.000, cioè 2.000 euro. L'esempio rientra nella regola generale.`,
  trap: `Rispondere «non ricavabile» perché il brano non nomina le famiglie con quattro figli, o «falsa» sommando le riduzioni (30% + 50%): il brano dice che le riduzioni «non si sommano» e si calcolano sulla retta intera.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-pareggio', diff: 'media', lang: 'it',
  passage: `Il margine di contribuzione unitario è la differenza tra il prezzo di vendita di un prodotto e i suoi costi variabili per unità, cioè i costi che crescono con le unità prodotte (materie prime, imballaggio). I costi fissi, come l'affitto del capannone, non dipendono dalle quantità. Il punto di pareggio è la quantità venduta per la quale i margini di contribuzione complessivi coprono esattamente i costi fissi: oltre quella quantità l'impresa guadagna, al di sotto perde. Un'impresa vende un prodotto a 50 euro; i costi variabili sono di 30 euro per unità e i costi fissi annui di 40.000 euro.`,
  stem: `In base al brano, quante unità deve vendere all'anno l'impresa per raggiungere il punto di pareggio?`,
  ...put('v-pareggio', `2.000 unità`, [`800 unità`, `1.333 unità`, `4.000 unità`]),
  sol: `Frasi chiave: «margine di contribuzione unitario è la differenza tra il prezzo di vendita … e i costi variabili» e «punto di pareggio … i margini … coprono esattamente i costi fissi». Margine unitario: 50 − 30 = 20 €; unità di pareggio: 40.000 ÷ 20 = 2.000.`,
  trap: `Dividere i costi fissi per il prezzo (40.000 ÷ 50 = 800) o per i soli costi variabili (40.000 ÷ 30 ≈ 1.333) ignora la definizione di margine di contribuzione: contano i 20 € che restano da ogni unità dopo i costi variabili.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-illuminazione', diff: 'media', lang: 'it',
  passage: `Un comune ha sostituito l'illuminazione stradale in cinque vie del centro, installando lampioni più luminosi. Nei dodici mesi successivi i furti denunciati in centro sono scesi del 25%. L'assessore attribuisce il calo ai nuovi lampioni e propone di estenderli a tutto il comune. Nello stesso periodo il numero di agenti in servizio nel comune è rimasto invariato.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la proposta dell'assessore?`,
  ...put('v-illuminazione', `Nelle cinque vie con i nuovi lampioni i furti sono calati del 40%, mentre nelle altre vie del centro sono rimasti stabili.`,
    [`I nuovi lampioni consumano il 30% di energia in meno dei precedenti.`,
     `La maggior parte dei residenti del centro ha dichiarato di sentirsi più sicura.`,
     `Il costo dei nuovi lampioni è di 2.000 euro ciascuno.`]),
  sol: `L'assessore attribuisce il calo dei furti ai nuovi lampioni. Se il calo si concentra proprio nelle cinque vie dove sono stati installati ed è assente nelle altre vie del centro, il confronto tra vie «con» e «senza» lampioni rafforza il nesso causale e ne esclude le cause generali (clima, stagione, numero di agenti). Consumi, percezione e costo non dicono nulla sui furti.`,
  trap: `La percezione di sicurezza dei residenti sembra attinente, ma è un'opinione e non misura i furti. Risparmio energetico e costo sono dati sulla proposta che non toccano il nesso tra lampioni e furti.`,
  patt: 'Rafforzare con un confronto' },

{ k: 'v-trasporto', diff: 'media', lang: 'it',
  claim: `Le visite aggiuntive hanno migliorato la salute degli anziani dei comuni con il trasporto gratuito.`,
  passage: `In 12 comuni che hanno introdotto il trasporto gratuito per gli anziani verso gli ambulatori, le visite mediche degli over 70 sono aumentate del 15% in due anni; negli altri comuni dello stesso territorio sono aumentate del 4%. Gli autori dello studio avvertono che i dati raccolti non permettono di stabilire se le visite aggiuntive abbiano effetti sulla salute degli anziani. L'amministrazione regionale ha già finanziato l'estensione del servizio ad altri 8 comuni.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «i dati raccolti non permettono di stabilire se le visite aggiuntive abbiano effetti sulla salute degli anziani». Il brano riporta l'aumento delle visite, ma dichiara espressamente di non poter dire nulla sugli effetti sulla salute: l'affermazione non è né confermata né smentita.`,
  trap: `Considerare ovvio che più visite significhino più salute: è un nesso causale non detto dal brano, anzi esplicitamente escluso dai dati. Non è nemmeno «falsa»: il brano non dice che le visite non servano.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-prezzi-case', diff: 'media', lang: 'it',
  passage: `Secondo un osservatorio immobiliare, a Corvara i prezzi medi delle abitazioni sono saliti del 10% nel 2021 rispetto al 2020 e del 5% nel 2022 rispetto al 2021, mentre nel 2023 sono scesi del 10% rispetto al 2022. L'osservatorio ricorda che i prezzi medi si riferiscono alle compravendite concluse nell'anno e non comprendono le case vendute all'asta. Per il 2024 prevede una sostanziale stabilità.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-prezzi-case', `Nel 2023 i prezzi medi delle abitazioni erano ancora superiori a quelli del 2020.`,
    [`Nel 2023 i prezzi medi delle abitazioni sono scesi al di sotto del livello del 2020.`,
     `Tra il 2020 e il 2022 i prezzi medi delle abitazioni sono saliti esattamente del 15%.`,
     `Nel 2023 i prezzi medi delle abitazioni sono tornati al livello del 2021.`]),
  sol: `Con prezzo 100 nel 2020: 2021 = 110; 2022 = 110 · 1,05 = 115,5; 2023 = 115,5 · 0,9 = 103,95. Nel 2023 il prezzo (103,95) è ancora sopra il 2020 (100): corretta. Tra 2020 e 2022 l'aumento è +15,5%, non esattamente 15%; il 2023 (103,95) non è tornato al 2021 (110).`,
  trap: `Sommare le variazioni (+10% + 5% = +15%; +15% − 10% = +5%) mescola percentuali con basi diverse: il −10% del 2023 si applica a un prezzo già più alto, quindi il 2023 non «torna» al 2021 né scende sotto il 2020.`,
  patt: 'Percentuali composte' },

{ k: 'v-regola', diff: 'difficile', lang: 'it',
  passage: `Dal regolamento di una palestra. L'abbonamento annuale può essere sospeso, una sola volta nel corso dell'anno, per un periodo massimo di 60 giorni. La richiesta va presentata in segreteria con almeno 7 giorni di preavviso. Fino a 30 giorni la sospensione è concessa senza altre formalità; per i periodi più lunghi, fino a 60 giorni, è concessa soltanto se la richiesta è accompagnata da un certificato medico. Non è ammessa la sospensione nei primi due mesi dall'iscrizione. Al termine della sospensione la scadenza dell'abbonamento è posticipata di un numero di giorni pari alla durata della sospensione; le quote già versate non sono rimborsabili.`,
  stem: `Paolo è iscritto da cinque mesi e chiede, con dieci giorni di preavviso e senza certificato medico, una sospensione di 45 giorni. Quale delle seguenti affermazioni è corretta?`,
  ...put('v-regola', `La richiesta di 45 giorni non può essere accolta, perché senza certificato medico la sospensione non può superare i 30 giorni.`,
    [`La richiesta può essere accolta, perché il preavviso è superiore a 7 giorni e l'iscrizione ha più di due mesi.`,
     `La richiesta può essere accolta, ma in tal caso la scadenza dell'abbonamento non viene posticipata.`,
     `La richiesta non può essere accolta, perché la sospensione è ammessa soltanto nei primi due mesi dall'iscrizione.`]),
  sol: `Il preavviso (10 giorni ≥ 7) e l'anzianità (5 mesi > 2) sono a posto, ma 45 giorni superano i 30: oltre questa soglia la sospensione «è concessa soltanto» con certificato medico, che Paolo non ha. La richiesta, così com'è, non può essere accolta.`,
  trap: `Verificare soltanto preavviso e anzianità (prima esca). La regola dei primi due mesi è rovesciata nell'ultima opzione: i primi due mesi sono proprio il periodo in cui la sospensione non è ammessa. La scadenza viene posticipata per tutte le sospensioni concesse.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-app', diff: 'media', lang: 'it',
  passage: `Un'azienda che produce un'app di meditazione ha analizzato i dati di 3.000 utenti che hanno registrato il proprio sonno con un braccialetto. Chi usa l'app almeno quattro sere a settimana dorme in media 45 minuti in più a notte di chi la usa meno di una sera a settimana. L'azienda ne conclude che l'uso regolare dell'app migliora il sonno e lo scrive nella pubblicità. Gli utenti analizzati sono stati scelti tra chi aveva acquistato un abbonamento annuale.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione dell'azienda?`,
  ...put('v-app', `Le persone che già dormono bene tendono a mantenere abitudini serali regolari, e quindi usano l'app con maggiore costanza.`,
    [`L'app è disponibile in dodici lingue e viene aggiornata ogni mese.`,
     `Il 70% degli utenti ha acquistato l'abbonamento annuale con uno sconto.`,
     `Gli utenti che usano l'app regolarmente la raccomandano più spesso agli amici.`]),
  sol: `La conclusione è causale: l'uso regolare dell'app migliorerebbe il sonno. Se le persone che dormono già bene sono quelle che usano l'app con più costanza, il nesso può essere rovesciato (dormire bene → usare l'app regolarmente): la correlazione non prova che sia l'app a migliorare il sonno.`,
  trap: `Le altre opzioni parlano di lingue, sconti e raccomandazioni: fatti veri che non toccano il verso della relazione. Nelle domande «indebolisce» con una correlazione, la domanda da porsi è «e se fosse il contrario?».`,
  patt: 'Causalità inversa' },

{ k: 'v-bilancio', diff: 'media', lang: 'it',
  claim: `Nel 2025 le spese del comune per l'istruzione sono inferiori alle entrate da tariffe e altri proventi.`,
  passage: `Il bilancio di previsione del comune di Pianalta per il 2025 prevede entrate per 40 milioni di euro: il 25% proviene da trasferimenti dello Stato, il 45% da imposte locali e il resto da tariffe e altri proventi. Le spese sono pari alle entrate e quelle per l'istruzione ne costituiscono il 32%. Il sindaco ha annunciato che le tariffe dei servizi scolastici non aumenteranno nel 2026.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: entrate 40 milioni; «il resto» oltre il 25% e il 45% è il 100% − 25% − 45% = 30%, cioè 12 milioni di tariffe e altri proventi; le spese sono «pari alle entrate» e l'istruzione ne è il 32%: 12,8 milioni. 12,8 > 12: le spese per l'istruzione sono superiori, non inferiori. L'affermazione è falsa.`,
  trap: `Rispondere «non ricavabile» perché la quota delle tariffe non è scritta (si ricava come «il resto»), oppure «vera» arrotondando 32% e 30% a «circa uguali». La differenza è di soli 0,8 milioni, costruita apposta.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-rinnovabili', diff: 'media', lang: 'it',
  passage: `Secondo un rapporto, nel 2025 le fonti rinnovabili hanno coperto il 42% della produzione elettrica nazionale, contro il 38% del 2024. Nello stesso periodo la quota del solare sulla produzione totale è salita dal 10% al 13%, mentre quella dell'eolico è rimasta all'8%. I consumi elettrici sono cresciuti dell'1%. Il rapporto precisa che il dato sul solare comprende gli impianti domestici, mentre quello sull'eolico include soltanto gli impianti di potenza superiore a 1 MW.`,
  stem: `In base al brano, quale delle seguenti affermazioni è corretta?`,
  ...put('v-rinnovabili', `Nel 2025 la quota del solare sulla produzione elettrica totale è stata superiore di 3 punti percentuali a quella del 2024.`,
    [`Nel 2025 la produzione di energia solare è aumentata del 3% rispetto al 2024.`,
     `Nel 2025 l'eolico ha coperto una quota della produzione elettrica pari a quella del solare.`,
     `Nel 2025 le fonti rinnovabili hanno coperto il 42% dei consumi elettrici.`]),
  sol: `Frase chiave: «la quota del solare sulla produzione totale è salita dal 10% al 13%»: 13 − 10 = 3 punti percentuali. Le altre: il passaggio da 10% a 13% è +30% di quota (non +3% di produzione, che dipende anche dalla produzione totale); l'eolico è all'8% contro il 13% del solare; il 42% riguarda la produzione, non i consumi.`,
  trap: `Esche sui termini: «punti percentuali» scambiati con «per cento»; «produzione» scambiata con «consumi» (ambito spostato). Il dato dell'eolico (8%) è confrontato con il solare del 2024, non con quello del 2025.`,
  patt: 'Periodo o ambito spostato' },

{ k: 'v-cestini', diff: 'difficile', lang: 'it',
  passage: `Il comune di Riva Alta propone di sostituire i cestini stradali con grandi contenitori interrati, quattro volte più capienti, che verrebbero svuotati una volta alla settimana invece che tre. La giunta calcola che il costo del servizio di raccolta diminuirebbe del 40% e conclude che il decoro delle strade non peggiorerà. I contenitori interrati sarebbero collocati agli incroci principali, a una distanza media di 150 metri l'uno dall'altro.`,
  stem: `Su quale assunzione si basa principalmente il ragionamento della giunta?`,
  ...put('v-cestini', `Con una capienza quattro volte maggiore e uno svuotamento ogni sette giorni, i contenitori non si riempiranno al punto da traboccare, e i cittadini li useranno invece di gettare i rifiuti per terra.`,
    [`Il costo di installazione dei contenitori interrati sarà ammortizzato in meno di cinque anni.`,
     `Il numero di abitanti del comune non diminuirà nei prossimi anni.`,
     `Gli altri comuni della provincia hanno già adottato contenitori interrati.`]),
  sol: `La giunta ragiona così: meno svuotamenti (−40% di costo) ma contenitori più capienti, quindi il decoro non peggiora. Funziona solo se i contenitori più capienti, svuotati più di rado e collocati più lontano tra loro, vengono usati e non traboccano: è l'assunzione implicita. Se si riempissero prima del passaggio o fossero scomodi da raggiungere, i rifiuti finirebbero per strada e la conclusione crollerebbe.`,
  trap: `Costi di ammortamento, numero di abitanti e scelte di altri comuni non toccano il passaggio dal risparmio sul servizio al decoro delle strade. L'assunzione si trova guardando che cosa cambia nonostante il calo dei costi: frequenza dei passaggi e distanza dei contenitori.`,
  patt: 'Assunzione implicita' },

{ k: 'v-incidenti', diff: 'difficile', lang: 'it',
  passage: `In una regione gli incidenti stradali sono stati 4.000 nel 2024 e 3.600 nel 2025. Gli incidenti mortali erano il 5% del totale nel 2024 e sono diventati il 6% nel 2025. L'assessore ha commentato che il calo complessivo degli incidenti è un risultato delle nuove campagne di sicurezza, ma ha riconosciuto che la gravità degli incidenti è aumentata. Nel 2025 sono stati installati 40 nuovi autovelox.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-incidenti', `Nel 2025 il numero degli incidenti mortali è stato superiore a quello del 2024.`,
    [`Nel 2025 gli incidenti mortali sono aumentati del 20%, come la loro quota sul totale.`,
     `Il calo degli incidenti del 2025 è dovuto ai 40 nuovi autovelox.`,
     `Nel 2025 gli incidenti non mortali sono stati meno di 3.350.`]),
  sol: `Incidenti mortali: 5% di 4.000 = 200 nel 2024 e 6% di 3.600 = 216 nel 2025: sono aumentati (+8%). Le altre: la quota è salita del 20% in termini relativi (5 → 6), ma il numero solo dell'8%; l'assessore attribuisce il calo alle campagne di sicurezza, non agli autovelox; gli incidenti non mortali del 2025 sono 3.600 − 216 = 3.384, più di 3.350.`,
  trap: `Confondere la variazione della quota (+20%) con quella del numero (+8%, perché il totale è sceso del 10%). Il nesso con gli autovelox è inventato: sono un dato di contorno. La soglia 3.350 è costruita vicino a 3.384.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-ponte', diff: 'media', lang: 'it',
  claim: `Il nuovo ponte sul torrente Sora sarà aperto al traffico entro il 2027.`,
  passage: `Il consiglio comunale di Vallestretta ha approvato la costruzione di un nuovo ponte sul torrente Sora, con una spesa prevista di 3 milioni di euro, di cui il 60% a carico della Regione. I lavori potranno iniziare in autunno e il ponte sarà aperto al traffico entro il 2027 se la Regione erogherà i fondi entro giugno 2026. L'attuale ponte, costruito negli anni Cinquanta, è chiuso ai mezzi pesanti.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «il ponte sarà aperto al traffico entro il 2027 se la Regione erogherà i fondi entro giugno 2026». L'apertura è subordinata a una condizione che il brano non dice se si verificherà: non si può né affermare né negare che il ponte sarà aperto entro il 2027.`,
  trap: `Leggere la frase condizionale come una previsione certa («sarà aperto entro il 2027»): il «se» cambia il valore dell'affermazione. Non è nemmeno «falsa»: il brano non dice che i fondi non arriveranno.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-fattore', diff: 'media', lang: 'it',
  passage: `Un'azienda dichiara: «Quasi tutti i nostri clienti sono soddisfatti: il 94% ha valutato il servizio con almeno 4 stelle su 5». Il dato proviene da un questionario inviato via e-mail ai 20.000 clienti attivi dell'azienda; hanno risposto 1.200 clienti. L'azienda precisa che il questionario era anonimo e che i voti sono stati raccolti nel mese di marzo.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione dell'azienda?`,
  ...put('v-fattore', `Il grado di soddisfazione dei 18.800 clienti che non hanno risposto al questionario.`,
    [`Il numero medio di stelle assegnato dai clienti che hanno dato meno di 4 stelle.`,
     `Il costo di invio del questionario via e-mail.`,
     `Il mese in cui l'azienda ha lanciato il servizio.`]),
  sol: `L'affermazione riguarda «quasi tutti i nostri clienti», cioè i 20.000 clienti attivi, ma il 94% si riferisce soltanto ai 1.200 che hanno risposto (il 6%). Se i 18.800 che non hanno risposto fossero meno soddisfatti dei rispondenti, la quota complessiva sarebbe molto più bassa: la loro soddisfazione è il dato che più incide sull'affermazione.`,
  trap: `Il voto medio degli insoddisfatti o il costo del questionario non cambiano la quota dei soddisfatti sul totale dei clienti. Il mese del lancio è irrilevante. La parola da mettere alla prova è «tutti» (clienti), non il 94% (rispondenti).`,
  patt: 'Dato mancante' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-medie', diff: 'media', lang: 'it', ds: true,
  stem: ds('La media aritmetica di quattro numeri interi è 15. Il più piccolo dei quattro numeri è maggiore di 10?',
    'La somma dei due numeri più grandi è 40.',
    'Il più grande dei quattro numeri è 25.'),
  ...dsq('CDAB', 'A'),
  sol: `La somma dei quattro numeri è 4 · 15 = 60. (1): i due più grandi sommano 40, quindi i due più piccoli sommano 20 e il più piccolo dei quattro è al massimo 10 (se fosse maggiore di 10 anche il secondo lo sarebbe e la somma supererebbe 20): la risposta è «no» in ogni caso, quindi la (1) basta. (2): il più grande è 25 e gli altri tre sommano 35: possono essere (11, 12, 12), con il più piccolo 11, maggiore di 10 (sì), oppure (5, 15, 15), con il più piccolo 5 (no). La (2) non basta.`,
  trap: `Cercare i quattro numeri esatti: per una domanda sì/no basta un limite. La (2) sembra utile perché dà un numero concreto, ma lascia aperte entrambe le risposte; la (1) non nomina il più piccolo, ma lo vincola per differenza.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-piani', diff: 'difficile', lang: 'it', asset: tPiani(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-piani', `In tutto il Paese il piano Base è scelto da più del 40% degli utenti.`,
    [`In ciascuna regione il piano Plus è scelto da almeno il 40% degli utenti.`,
     `Gli utenti del piano Premium del Sud sono più numerosi di quelli del Nord.`,
     `Gli utenti del piano Premium sono più di un quarto del totale.`]),
  sol: `Le percentuali sono di riga: servono i numeri. Nord (1.000): Base 500, Plus 300, Premium 200. Centro (500): 200, 200, 100. Sud (500): 150, 200, 150. Totale utenti 2.000: Base 850 = 42,5% (vera). Plus nel Nord è il 30%, non almeno il 40% (falsa). Premium: Sud 150 contro Nord 200 (falsa). Premium in tutto 450 = 22,5%, meno di un quarto (falsa).`,
  trap: `Usare la media semplice delle tre quote del piano Base (50%, 40%, 30% → 40%) e concludere «non più del 40%»: le regioni hanno pesi diversi (1.000, 500, 500). Leggere 30% > 20% come «più utenti Premium al Sud» ignora che il Nord ha il doppio degli utenti.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-gare', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `In un torneo di calcio a sei squadre ogni squadra incontra una sola volta ciascuna delle altre.`,
    `Non ci sono pareggi: ogni partita ha un vincitore.`,
    `Alfa ha vinto 4 partite e Beta ne ha vinte 3.`
  ], [
    `A. Alfa ha perso esattamente una partita.`,
    `B. Beta ha battuto Alfa.`,
    `C. In tutto nel torneo si giocano 15 partite.`,
    `D. Beta ha perso meno partite di Alfa.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la B sia la D', 'Solo la C', 'Sia la A sia la C'], ans: 3,
  sol: `Ogni squadra gioca 5 partite. A: Alfa ne ha vinte 4 e non ci sono pareggi, quindi ne ha perse esattamente 1 (vera). C: le partite sono le coppie di squadre: 6 · 5 ÷ 2 = 15 (vera, senza leggere le altre informazioni). B: l'unica sconfitta di Alfa può essere contro Beta o contro un'altra squadra (non sicura). D: Beta ne ha perse 5 − 3 = 2, più di Alfa (1): D è sicuramente falsa.`,
  trap: `La C si salta perché non riguarda né Alfa né Beta, ma è una conseguenza della prima frase (numero di coppie di sei squadre). La B sembra naturale («Beta ha vinto 3 partite»), ma non dice contro chi. La D rovescia il confronto tra sconfitte.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-fondo', diff: 'media', lang: 'it', asset: gFondo(),
  stem: `In quale anno il valore del fondo è cresciuto, in percentuale rispetto all'anno precedente, più che in ogni altro anno?`,
  ...put('d-fondo', '2023', ['2021', '2024', '2025']),
  sol: `Variazioni rispetto all'anno precedente: 2021: 100 → 120 = +20%; 2022: 120 → 108 = −10%; 2023: 108 → 135 = +25%; 2024: 135 → 162 = +20%; 2025: 162 → 148 ≈ −8,6%. La crescita percentuale più alta è quella del 2023.`,
  trap: `Guardare la crescita in euro: nel 2023 e nel 2024 il fondo guadagna lo stesso importo (+27 milioni), ma la base del 2023 è più bassa (108 contro 135), quindi la percentuale è più alta. Il 2021 ha una crescita di soli 20 milioni, ma con base 100 vale +20%.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-quadrato', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un quadrato e un rettangolo hanno lo stesso perimetro. Qual è l\'area del quadrato?',
    'Un lato del rettangolo misura 6 cm.',
    'L\'area del rettangolo è 60 cm².'),
  ...dsq('BACD', 'B'),
  sol: `(1) da sola: l'altro lato del rettangolo non è noto, quindi non lo è il perimetro. (2) da sola: ab = 60 è compatibile con molte coppie (5 e 12, 6 e 10, 4 e 15, …) con perimetri diversi. Insieme: un lato è 6, quindi l'altro è 60 ÷ 6 = 10; il perimetro è 2 · (6 + 10) = 32 cm, il lato del quadrato è 32 ÷ 4 = 8 cm e l'area è 64 cm².`,
  trap: `Pensare che l'area del rettangolo basti da sola perché «contiene» i lati: con la sola area i lati restano indeterminati. Insieme alla misura di un lato, l'area fissa l'altro lato.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-produzione', diff: 'difficile', lang: 'it', asset: tProduzione(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`La produzione dello stabilimento A è cresciuta ogni anno della stessa quantità.`,
         `Nel 2025 lo stabilimento B ha prodotto più della metà di quanto hanno prodotto insieme A e C.`,
         `Tra il 2021 e il 2025 la produzione totale dei tre stabilimenti è cresciuta di più del 30%.`,
         `Nessuna delle altre risposte è corretta.`], ans: 2,
  sol: `Prima: gli aumenti di A sono +6, +6, +6, +12, quindi non costanti (falsa). Seconda: nel 2025 A + C = 150 + 86 = 236, la metà è 118 e B ne ha 104 (falsa). Terza: totale 2021 = 120 + 80 + 60 = 260; totale 2025 = 150 + 104 + 86 = 340; 340 ÷ 260 ≈ 1,308, cioè +30,8%: più del 30% (vera). Quindi «Nessuna delle altre» è falsa.`,
  trap: `«Ogni anno della stessa quantità» è smentito da un solo anno (2025); il confronto con la metà (104 contro 118) e la soglia del 30% (30,8%) sono costruiti vicini ai valori reali. Calcolare 30% di 260 = 78 e confrontare con 340 − 260 = 80 risolve la terza.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-eta', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Cinque amici — Anna, Bruno, Carla, Dario ed Elena — hanno età tutte diverse.`,
    `Anna è più anziana di Bruno e di Carla.`,
    `Dario è più giovane di Bruno.`,
    `Elena è più anziana di Anna.`
  ], [
    `A. Bruno è più anziano di Elena.`,
    `B. Carla è più anziana di Dario.`,
    `C. Elena è più anziana di Dario.`,
    `D. Dario è più anziano di Anna.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la A', 'Sia la B sia la C', 'Sia la A sia la D', 'Solo la D'], ans: 2,
  sol: `Dai dati: Elena > Anna > Bruno > Dario e Anna > Carla. A: Bruno è più giovane di Anna, che è più giovane di Elena: A è sicuramente falsa. D: Dario è più giovane di Bruno, che è più giovane di Anna: D è sicuramente falsa. C è sicuramente vera (Elena > Anna > Bruno > Dario). B non è sicura: Carla può essere più anziana o più giovane di Dario.`,
  trap: `Con la consegna «false» si può indicare la C (vera). La A e la D richiedono di concatenare tre o quattro confronti (transitività). La B è «possibile» ma non sicuramente falsa.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-pompe', diff: 'media', lang: 'it', ds: true,
  stem: ds('Due pompe, A e B, svuotano una piscina. Quanto tempo impiegano per svuotarla lavorando insieme?',
    'La pompa A, da sola, impiega 6 ore.',
    'La portata della pompa B è il doppio di quella della pompa A.'),
  ...dsq('ADBC', 'B'),
  sol: `(1) da sola: non dice nulla sulla pompa B. (2) da sola: dà il rapporto tra le portate, ma non il tempo di nessuna pompa. Insieme: A svuota 1/6 della piscina all'ora e B 2/6 = 1/3; in totale 1/2 all'ora, cioè 2 ore.`,
  trap: `Credere che la (2) basti perché «contiene» un rapporto: un rapporto senza un valore assoluto non fissa nessun tempo. Credere che la (1) basti perché fissa la pompa A: manca la pompa B.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-trimestri', diff: 'media', lang: 'it', asset: gTrimestri(),
  stem: `Qual è l'utile annuo dell'azienda dopo le imposte?`,
  ...put('d-trimestri', '7,7 milioni di euro', ['11 milioni di euro', '3,3 milioni di euro', '8,25 milioni di euro']),
  sol: `Utile prima delle imposte di ciascun trimestre (ricavi meno costi): 20 − 18 = 2; 25 − 24 = 1; 30 − 27 = 3; 35 − 30 = 5; in tutto 11 milioni. Imposte: 30% di 11 = 3,3 milioni. Utile dopo le imposte: 11 − 3,3 = 7,7 milioni di euro.`,
  trap: `Fermarsi all'utile prima delle imposte (11) o rispondere con le sole imposte (3,3); 8,25 si ottiene togliendo il 25% invece del 30%. Il grafico mostra ricavi e costi, non gli utili: vanno calcolati trimestre per trimestre.`,
  patt: 'Dati extra nel grafico' },

{ k: 'd-dipendenti', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Un'azienda ha un numero di dipendenti compreso tra 40 e 60 (estremi inclusi).`,
    `Le donne sono i 3/5 dei dipendenti.`,
    `Gli uomini che lavorano part-time sono esattamente un quarto degli uomini.`
  ], [
    `A. I dipendenti sono più di 45.`,
    `B. Il numero dei dipendenti è un multiplo di 5.`,
    `C. Gli uomini che lavorano part-time sono almeno 4.`,
    `D. Le donne sono più di 28.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la B', 'Sia la A sia la D', 'Sia la B sia la C', 'Sia la C sia la D'], ans: 2,
  sol: `Con N dipendenti, le donne sono 3N/5 e gli uomini 2N/5; entrambi devono essere interi, quindi N è multiplo di 5 (B vera). Gli uomini part-time sono 2N/5 ÷ 4 = N/10, anch'esso intero: N = 40, 50 o 60 (con 45 o 55 non lo è). Allora i part-time sono 4, 5 o 6: almeno 4 (C vera). A: con N = 40 non è vera (non sicura). D: le donne sono 24, 30 o 36, quindi con N = 40 non sono più di 28 (non sicura).`,
  trap: `Cercare una sola risposta numerica: i dati lasciano tre valori (40, 50, 60), e A e D dipendono dal caso. La B è una conseguenza della frazione 3/5 (le donne devono essere un numero intero); la C richiede di combinare la divisibilità per 4 con l'intervallo.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-eta-ds', diff: 'media', lang: 'it', ds: true,
  stem: ds('Quanti anni ha Anna oggi?',
    'Tra 6 anni avrà il triplo dell\'età che aveva 6 anni fa.',
    'Tra 3 anni avrà il quintuplo dell\'età che aveva 9 anni fa.'),
  ...dsq('DCBA', 'C'),
  sol: `Con x l'età di Anna: (1) x + 6 = 3 · (x − 6), cioè 2x = 24 e x = 12. (2) x + 3 = 5 · (x − 9), cioè 4x = 48 e x = 12. Ciascuna equazione ha una sola soluzione, quindi ciascuna affermazione basta da sola (e le due sono coerenti).`,
  trap: `Credere che servano due equazioni perché l'incognita è una sola «con due informazioni»: un'equazione di primo grado in x basta. Il tranello è considerare «insufficiente» una frase che sembra solo «un confronto di età».`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-iscritti', diff: 'difficile', lang: 'it', asset: tIscritti(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel 2025 il corso A ha più iscritti dei corsi B e C messi insieme.`,
         `Tra il 2024 e il 2025 il corso B è cresciuto di più del 20%.`,
         `Tra il 2024 e il 2025 il corso A è cresciuto del 25%.`,
         `Nessuna delle altre risposte è corretta.`], ans: 2,
  sol: `Ricostruzione: corso A nel 2025 = 270 − 120 = 150; corso B nel 2024 = 240 − 130 = 110. Controllo con i totali di colonna: 2025: 150 + 130 + 100 = 380; 2024: 120 + 110 + 80 = 310. Prima: 150 contro 130 + 100 = 230 (falsa). Seconda: B passa da 110 a 130, cioè +18,2%, non più del 20% (falsa). Terza: A passa da 120 a 150 = +25% (vera). «Nessuna delle altre» è dunque falsa.`,
  trap: `Il 20% è vicino al 18,2% reale; la crescita assoluta di B (+20) fa pensare «+20%», ma la base è 110. Per ricostruire i dati mancanti bisogna usare il totale di riga; i totali di colonna servono per il controllo.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-comune', diff: 'media', lang: 'it', asset: gComune(),
  stem: `Quanto spenderà il comune per gli autobus l'anno prossimo?`,
  ...put('d-comune', '6,6 milioni di euro', ['6 milioni di euro', '3,3 milioni di euro', '13,2 milioni di euro']),
  sol: `Trasporti: 20% di 60 milioni = 12 milioni. Ripartizione 1 : 2 : 1: gli autobus sono 2/4 = metà, cioè 6 milioni. Con l'aumento del 10%: 6 · 1,1 = 6,6 milioni di euro.`,
  trap: `6 è la spesa di quest'anno, senza l'aumento; 3,3 usa la quota 1/4 invece di 2/4 (3 · 1,1); 13,2 applica l'aumento a tutta la spesa per i trasporti (12 · 1,1).`,
  patt: 'Dati extra nel grafico' },

{ k: 'd-logica', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Alcuni architetti sono anche pittori.`,
    `Nessun pittore è ingegnere.`,
    `Tutti gli ingegneri sono laureati.`
  ], [
    `A. Alcuni architetti non sono ingegneri.`,
    `B. Tutti gli architetti sono ingegneri.`,
    `C. Nessun ingegnere è architetto.`,
    `D. Alcuni ingegneri sono pittori.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Sia la A sia la C', 'Solo la B', 'Sia la B sia la D', 'Solo la D'], ans: 2,
  sol: `Esiste almeno un architetto che è anche pittore; poiché nessun pittore è ingegnere, quell'architetto non è ingegnere: A è sicuramente vera e B («tutti gli architetti sono ingegneri») è sicuramente falsa. D contraddice il secondo dato (nessun pittore è ingegnere): sicuramente falsa. C non è sicura: i dati non escludono che qualche ingegnere sia anche architetto (non pittore).`,
  trap: `Con la consegna «false» si rischia di indicare la A (vera). La C sembra una conseguenza del secondo dato, ma questo riguarda i pittori e non gli architetti in generale: è possibile ma non sicura.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-cifre', diff: 'media', lang: 'it', ds: true,
  stem: ds('Il numero intero positivo n ha due cifre. Quanto vale n?',
    'Le due cifre di n hanno somma 9.',
    'n è dispari.'),
  ...dsq('ABCD', 'D'),
  sol: `(1): i numeri di due cifre con somma 9 sono 18, 27, 36, 45, 54, 63, 72, 81, 90. (2): tutti i numeri dispari di due cifre. Insieme: 27, 45, 63, 81: quattro valori possibili, quindi anche con entrambe le affermazioni servono altri dati.`,
  trap: `Pensare che «dispari» riduca a uno la lista: la parità dimezza i candidati ma ne lascia quattro. È facile fermarsi al primo numero dispari della lista (27).`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-classe', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('In una classe di 30 studenti hanno superato la prova 21 studenti. Quanti maschi hanno superato la prova?',
    'Le femmine sono 12 e 3 di loro non hanno superato la prova.',
    'I maschi che non hanno superato la prova sono 6.'),
  ...dsq('BCAD', 'A'),
  sol: `Hanno superato la prova 21 studenti e non l'hanno superata 9. (1): le femmine che hanno superato la prova sono 12 − 3 = 9, quindi i maschi che l'hanno superata sono 21 − 9 = 12: la (1) basta. (2): i maschi che non l'hanno superata sono 6, ma senza sapere quanti sono i maschi in tutto (o le femmine) il numero dei maschi promossi resta indeterminato: la (2) non basta.`,
  trap: `Pensare che la (2) basti perché i 9 bocciati e i 6 maschi bocciati portano a «3 femmine bocciate»: si conosce quanti sono bocciati, ma non il totale dei maschi. Nella tabella maschi/femmine × promossi/bocciati servono i totali di una riga o di una colonna in più.`,
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
  id: '20',
  title: 'Mock 20',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Tutto in italiano, livello del Mock 15: sconti successivi e basi delle percentuali, velocità con sosta a metà, resti e congruenze, probabilità condizionata, brani con modali e opzioni quasi tutte plausibili. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false», sufficienza dei dati e tabelle con celle mancanti.',
  questions: QUESTIONS,
  data: DATA
};
});
