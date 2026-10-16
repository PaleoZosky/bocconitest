/* =======================================================================
   Mock 29 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
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
   la domanda per gli script di verifica (tools/check_math_29.py).
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
  'q-rincaro': 2, 'q-mix': 1, 'q-carte': 3, 'q-rimborso': 0, 'q-ciclisti': 2, 'q-comitato': 1, 'q-crescita': 0,
  'q-podio': 2, 'q-occhiali': 3, 'q-utile': 1, 'q-sistema': 0, 'q-batteri': 2, 'q-base-catena': 3,
  'q-resti': 0, 'q-calendario': 1, 'q-inverso': 3, 'q-mattone': 2, 'q-nondet': 3,
  'v-tassoreale': 1, 'v-doposcuola': 3, 'v-autisti': 0, 'v-prevenzione': 2, 'v-fertilizzante': 1, 'v-matematica': 0,
  'v-deficit': 3, 'v-fattore': 2, 'v-centro': 1, 'v-vino': 0, 'v-regola': 2,
  'd-pie': 1, 'd-barre': 3, 'd-citta': 0, 'd-corsi': 2, 'd-cella': 1, 'd-ore': 0
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
  /* vendite di una casa editrice per canale (% sul totale di copie), copie totali e quota di resi online */
  canali: { voci: [['Librerie', 45], ['Online', 30], ['Fiere', 15], ['Altro', 10]], copie: 8000, resiOnline: 20 },
  /* ricavi e costi trimestrali (migliaia di euro) */
  trimestri: { nomi: ['1° trim.', '2° trim.', '3° trim.', '4° trim.'], ricavi: [80, 120, 100, 150], costi: [50, 90, 80, 100] },
  /* abitanti (migliaia) di quattro città nel 2020 e nel 2025, crescita prevista 2025–2030 (%) */
  citta: { nomi: ['Città A', 'Città B', 'Città C', 'Città D'], y20: [80, 120, 40, 160], y25: [100, 132, 60, 168], crescita: 10 },
  /* studenti per corso e quota di fuori sede */
  corsi: { nomi: ['Corso A', 'Corso B', 'Corso C'], n: [200, 300, 100], perc: [30, 20, 50] },
  /* produzione per turno; pezzi della notte nascosti (null) da ricostruire con il totale */
  turni: { nomi: ['Mattino', 'Pomeriggio', 'Notte'], pezzi: [500, 300, null], perc: [4, 5, 10], totale: 1000 },
  /* ore di volontariato per associazione e anno */
  ore: { anni: ['2022', '2023', '2024', '2025'], nomi: ['Associazione A', 'Associazione B', 'Associazione C'], ore: [[44, 52, 57, 89], [60, 75, 80, 118], [30, 42, 50, 54]] }
};

/* ======================= tabelle e grafici ======================= */
/* migliaia con il punto, senza dipendere dal locale */
const mig = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

function gCanali() {
  const D = DATA.canali;
  return `<figure class="fig"><figcaption>Come si ripartiscono le copie vendute da una casa editrice</figcaption>` + C.pie({
    data: D.voci, title: 'Quota delle copie vendute',
    aria: 'Torta delle copie vendute per canale: ' + D.voci.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `<p class="fig-note">In tutto sono state vendute ${mig(D.copie)} copie. Il ${D.resiOnline}% delle copie vendute online è stato restituito dai clienti.</p></figure>`;
}

function gTrimestri() {
  const D = DATA.trimestri;
  return `<figure class="fig"><figcaption>Ricavi e costi di un'azienda per trimestre (migliaia di euro)</figcaption>` + C.bars({
    labels: D.nomi, series: [{ name: 'Ricavi', values: D.ricavi }, { name: 'Costi', values: D.costi, style: 'outline' }], max: 160, legend: true,
    aria: 'Istogramma di ricavi e costi: ' + D.nomi.map((m, i) => m + ' ricavi ' + D.ricavi[i] + ' e costi ' + D.costi[i]).join('; ') + '.'
  }) + `</figure>`;
}

function gCitta() {
  const D = DATA.citta;
  return `<figure class="fig"><figcaption>Abitanti di quattro città nel 2020 e nel 2025 (migliaia)</figcaption>` + C.bars({
    labels: D.nomi, series: [{ name: '2020', values: D.y20 }, { name: '2025', values: D.y25, style: 'outline' }], max: 180, legend: true,
    aria: 'Istogramma degli abitanti: ' + D.nomi.map((m, i) => m + ' ' + D.y20[i] + ' nel 2020 e ' + D.y25[i] + ' nel 2025').join('; ') + '.'
  }) + `</figure>`;
}

function tCorsi() {
  const D = DATA.corsi;
  return C.table({
    caption: 'Studenti iscritti ai corsi di un dipartimento e quota di studenti fuori sede',
    head: ['Corso', 'Iscritti', 'Fuori sede'],
    rows: D.nomi.map((s, i) => [s, D.n[i], D.perc[i] + '%'])
  });
}

function tTurni() {
  const D = DATA.turni, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Produzione di una fabbrica in un giorno, per turno',
    head: ['Turno', 'Pezzi prodotti', 'Pezzi difettosi'],
    rows: D.nomi.map((s, i) => [s, c(D.pezzi[i]), D.perc[i] + '%']),
    foot: ['Totale', mig(D.totale), '—']
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato. La percentuale di pezzi difettosi è calcolata sui pezzi prodotti nel turno.</p>`;
}

function tOre() {
  const D = DATA.ore;
  return C.table({
    caption: 'Ore di volontariato svolte in un anno da tre associazioni',
    head: ['Associazione'].concat(D.anni),
    rows: D.nomi.map((s, i) => [s].concat(D.ore[i]))
  });
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-rincaro', diff: 'media', lang: 'it',
  stem: `Un abbonamento costava 60 € e, dopo un rincaro, costa 75 €. Di quanto per cento va ridotto il nuovo prezzo per tornare a 60 €?`,
  ...put('q-rincaro', '20%', ['25%', '15%', '12,5%']),
  sol: `Il rincaro è di 15 €. Per tornare a 60 € bisogna togliere 15 € dal nuovo prezzo, che è 75 €: 15 ÷ 75 = 20%.`,
  trap: `25% è il rincaro (15 su 60) usato anche come riduzione: ma la riduzione si calcola sul prezzo più alto, 75 €. 15% è la differenza in euro scambiata per una percentuale; 12,5% è un valore a occhio.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-mix', diff: 'difficile', lang: 'it',
  stem: `In un corso di 40 studenti la media dei voti è 26. Gli studenti fuori sede hanno una media di 29, gli altri una media di 25. Quanti sono gli studenti fuori sede?`,
  ...put('q-mix', '10', ['20', '15', '8']),
  sol: `I punti totali sono 40 · 26 = 1.040. Se i fuori sede sono x: 29x + 25(40 − x) = 1.040, cioè 4x + 1.000 = 1.040 e x = 10. (Via rapida: 26 dista 1 da 25 e 3 da 29, quindi i pesi stanno come 3 : 1 e i fuori sede sono un quarto di 40.)`,
  trap: `20 suppone gruppi della stessa numerosità: in quel caso la media sarebbe 27, il punto di mezzo tra 25 e 29. La media 26 è più vicina a 25, quindi il gruppo con 25 pesa di più. 15 e 8 sono valori a occhio.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-carte', diff: 'media', lang: 'it',
  stem: `Da un mazzo di 40 carte (10 carte per ciascuno dei 4 semi) si estraggono due carte una dopo l'altra, senza rimettere la prima nel mazzo. Qual è la probabilità che siano entrambe di denari?`,
  ...put('q-carte', fr(3, 52), [fr(1, 16), fr(9, 160), fr(1, 8)]),
  sol: `La prima carta è di denari con probabilità ${fr(10, 40)}; poi nel mazzo restano 39 carte, di cui 9 di denari: ${fr(9, 39)}. Il prodotto è ${fr(90, 1560)} = ${fr(3, 52)}.`,
  trap: `${fr(1, 16)} = ${fr(1, 4)} · ${fr(1, 4)} suppone che la prima carta venga rimessa nel mazzo; ${fr(9, 160)} lascia 40 carte al denominatore invece di 39 dopo la prima estrazione; ${fr(1, 8)} è un valore a occhio.`,
  patt: 'Probabilità senza reinserimento' },

{ k: 'q-rimborso', diff: 'media', lang: 'it',
  stem: `Un dipendente percorre in auto 300 km per una trasferta di lavoro, impiegando 4 ore. L'auto fa 12 km con un litro e la benzina costa 2 € al litro. L'azienda rimborsa il 60% della spesa per la benzina. Quanto resta a carico del dipendente?`,
  ...put('q-rimborso', '20 €', ['12 €', '30 €', '50 €']),
  sol: `Litri consumati: 300 ÷ 12 = 25; spesa: 25 · 2 = 50 €. L'azienda rimborsa il 60%, quindi resta a carico il 40%: 40% di 50 € = 20 €. (Le 4 ore non servono.)`,
  trap: `30 € è il rimborso, non la parte a carico; 50 € è la spesa totale; 12 € è il 60% di 20 € ed è un'applicazione sbagliata della percentuale. Il dato delle 4 ore è superfluo.`,
  patt: 'Dato superfluo' },

{ k: 'q-ciclisti', diff: 'media', lang: 'it',
  stem: `Anna parte alle 8:00 in bicicletta a 15 km/h. Bruno parte dallo stesso punto, sulla stessa strada, alle 9:00 a 20 km/h. A che ora Bruno raggiunge Anna?`,
  ...put('q-ciclisti', '12:00', ['11:00', '11:30', '13:00']),
  sol: `Alle 9:00 Anna è già a 15 km. Bruno recupera 20 − 15 = 5 km ogni ora: servono 15 ÷ 5 = 3 ore dalla partenza di Bruno, cioè le 12:00. (Verifica: Bruno fa 60 km in 3 ore, Anna 60 km in 4 ore.)`,
  trap: `11:00 conta le 3 ore dalla partenza di Anna invece che da quella di Bruno. 11:30 e 13:00 sono valori a occhio.`,
  patt: 'Velocità relative' },

{ k: 'q-comitato', diff: 'difficile', lang: 'it',
  stem: `Un gruppo è formato da 5 uomini e 3 donne. Si sceglie a caso un comitato di 3 persone. Qual è la probabilità che nel comitato ci siano almeno 2 donne?`,
  ...put('q-comitato', fr(2, 7), [fr(15, 56), fr(3, 8), fr(1, 3)]),
  sol: `I comitati possibili sono C(8,3) = 56. Con esattamente 2 donne: C(3,2) · 5 = 15; con 3 donne: 1. I casi favorevoli sono 16 su 56: ${fr(16, 56)} = ${fr(2, 7)}.`,
  trap: `${fr(15, 56)} dimentica il comitato formato da tre donne («almeno 2» comprende anche 3). ${fr(3, 8)} è la quota di donne nel gruppo; ${fr(1, 3)} è un valore a occhio.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-crescita', diff: 'media', lang: 'it',
  stem: `Il numero di abbonati a una rivista aumenta del 10% a gennaio, aumenta ancora del 10% a febbraio e diminuisce del 10% a marzo. Di quanto è variato in totale rispetto a dicembre?`,
  ...put('q-crescita', 'Aumento di circa il 9%', ['Aumento del 10%', 'Aumento di circa l\'11%', 'Nessuna variazione']),
  sol: `I tre fattori sono 1,1 · 1,1 · 0,9 = 1,21 · 0,9 = 1,089: l'aumento complessivo è di circa l'8,9%, cioè circa il 9%.`,
  trap: `Il 10% somma e sottrae le percentuali (+10 + 10 − 10): ma ogni variazione si applica al valore del mese precedente. Nessuna variazione suppone che +10% e −10% si annullino; l'11% è un valore a occhio.`,
  patt: 'Percentuali composte' },

{ k: 'q-podio', diff: 'media', lang: 'it',
  stem: `A una gara partecipano 8 atleti. In quanti modi si possono assegnare oro, argento e bronzo, se Luca, uno degli 8 atleti, deve salire sul podio?`,
  ...put('q-podio', '126', ['336', '210', '42']),
  sol: `Luca può prendere una delle 3 medaglie: 3 modi. Le altre due medaglie vanno a due dei 7 atleti rimasti, in ordine: 7 · 6 = 42 modi. In tutto 3 · 42 = 126.`,
  trap: `336 = 8 · 7 · 6 conta tutti i podi, anche quelli senza Luca; 210 = 7 · 6 · 5 sono i podi in cui Luca non c'è; 42 dimentica di scegliere la medaglia di Luca.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-occhiali', diff: 'media', lang: 'it',
  stem: `In una classe il 55% degli studenti sono ragazze. Portano gli occhiali il 40% delle ragazze e il 20% dei ragazzi. Qual è la percentuale di studenti della classe che porta gli occhiali?`,
  ...put('q-occhiali', '31%', ['25%', '35%', '30%']),
  sol: `Su 100 studenti, 55 sono ragazze e 45 sono ragazzi. Con gli occhiali: 40% di 55 = 22 e 20% di 45 = 9. In tutto 31 su 100: il 31%.`,
  trap: `30% è la media semplice di 40% e 20%: varrebbe solo se ragazze e ragazzi fossero lo stesso numero. Le ragazze sono di più, quindi il risultato è un po' sopra 30. 25% e 35% sono valori a occhio.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-utile', diff: 'difficile', lang: 'it',
  stem: `Un articolo è venduto a 90 €, con un guadagno pari al 25% del prezzo di acquisto. Se il prezzo di vendita fosse scontato del 10%, quanto sarebbe il guadagno?`,
  ...put('q-utile', '9 €', ['18 €', '13,50 €', '4,50 €']),
  sol: `Il prezzo di vendita è 1,25 volte quello di acquisto: 90 ÷ 1,25 = 72 €. Con lo sconto il prezzo diventa 90 · 0,9 = 81 €, e il guadagno è 81 − 72 = 9 €.`,
  trap: `18 € è il guadagno senza sconto (90 − 72). Il 25% si calcola sul prezzo di acquisto, non su quello di vendita (25% di 90 = 22,50 € darebbe un acquisto di 67,50 €). 13,50 € e 4,50 € sono valori a occhio.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-sistema', diff: 'media', lang: 'it',
  stem: `La somma delle età di Anna e Bea è 30, quella di Bea e Carla è 36 e quella di Anna e Carla è 34. Quanti anni ha Anna?`,
  ...put('q-sistema', '14', ['16', '18', '20']),
  sol: `Sommando le tre relazioni, ogni età compare due volte: 2(A + B + C) = 100, quindi A + B + C = 50. Anna ha 50 − (B + C) = 50 − 36 = 14 anni. (Bea ne ha 16 e Carla 20.)`,
  trap: `16 e 20 sono le età di Bea e di Carla; 18 è un valore a occhio. Conviene sommare le tre relazioni invece di provare a tentativi.`,
  patt: 'Algebra' },

{ k: 'q-batteri', diff: 'media', lang: 'it',
  stem: `Una coltura di batteri raddoppia di numero ogni 3 ore. All'inizio ci sono 1.000 batteri. Dopo 30 ore, quanti batteri ci sono circa?`,
  ...put('q-batteri', 'Circa 1 milione', ['Circa 10.000', 'Circa 100.000', 'Circa 30.000']),
  sol: `In 30 ore ci sono 10 raddoppi: il numero di batteri si moltiplica per 2¹⁰ = 1.024, cioè circa per 1.000. Quindi 1.000 · 1.000 circa = 1 milione.`,
  trap: `Circa 10.000 tratta i 10 raddoppi come se aggiungessero ogni volta il valore iniziale; circa 30.000 è una crescita lineare; circa 100.000 è un valore a occhio. Una crescita esponenziale non si calcola con le addizioni.`,
  patt: 'Crescita esponenziale' },

{ k: 'q-base-catena', diff: 'media', lang: 'it',
  stem: `Marco ha il 25% di figurine in più di Luca, e Luca ha il 20% di figurine in meno di Sara. Rispetto a Sara, Marco ha:`,
  ...put('q-base-catena', 'lo stesso numero di figurine', ['il 5% di figurine in più', 'il 5% di figurine in meno', 'il 45% di figurine in più']),
  sol: `Se Sara ha 100 figurine, Luca ne ha 80 (−20% di 100). Marco ne ha 80 · 1,25 = 100: lo stesso numero di Sara.`,
  trap: `Il 5% in più viene da 25 − 20 e il 45% da 25 + 20: ma le due percentuali hanno basi diverse (il 25% è di Luca, il 20% è di Sara). Il 5% in meno è un'altra variante dello stesso errore.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-resti', diff: 'difficile', lang: 'it',
  stem: `Qual è il più piccolo numero intero positivo che, diviso per 6, per 8 e per 9, dà sempre resto 5?`,
  ...put('q-resti', '77', ['72', '149', '53']),
  sol: `Il numero meno 5 deve essere multiplo di 6, di 8 e di 9, cioè del loro mcm: mcm(6, 8, 9) = 72. Il più piccolo numero cercato è 72 + 5 = 77.`,
  trap: `72 è il mcm e dà resto 0; 149 = 2 · 72 + 5 è una soluzione, ma non la più piccola; 53 dà resto 5 con 6 e con 8, ma resto 8 con 9. Va sommato il resto al mcm, non moltiplicato per i divisori.`,
  patt: 'Resti e mcm' },

{ k: 'q-calendario', diff: 'media', lang: 'it',
  stem: `Il 10 ottobre 2026 cade di sabato. Che giorno della settimana sarà il 10 ottobre 2030?`,
  ...put('q-calendario', 'Giovedì', ['Mercoledì', 'Venerdì', 'Sabato']),
  sol: `Un anno (365 giorni = 52 settimane + 1 giorno) sposta il giorno della settimana di 1; se tra le due date cade un 29 febbraio lo sposta di 2. Dal 10 ottobre 2026 al 10 ottobre 2030 passano 4 anni e il 29 febbraio 2028 cade nell'intervallo (il 2028 è l'unico bisestile): lo slittamento è 4 + 1 = 5 giorni. Sabato + 5 giorni = giovedì.`,
  trap: `Mercoledì conta 4 giorni e dimentica l'anno bisestile; venerdì conta un giorno in più (due anni bisestili): nell'intervallo c'è un solo 29 febbraio, quello del 2028; sabato è la risposta di chi pensa che dopo 4 anni si torni allo stesso giorno.`,
  patt: 'Calendario' },

{ k: 'q-inverso', diff: 'media', lang: 'it',
  stem: `Tre fratelli si dividono 330 € in parti inversamente proporzionali alle loro età, che sono 2, 4 e 6 anni. Quanto riceve il più grande?`,
  ...put('q-inverso', '60 €', ['180 €', '110 €', '90 €']),
  sol: `Le parti sono proporzionali a ${fr(1, 2)}, ${fr(1, 4)} e ${fr(1, 6)}, cioè a 6 : 3 : 2 (moltiplicando per 12). In tutto 11 parti: 330 ÷ 11 = 30 € a parte. Il più grande (6 anni) riceve 2 parti = 60 €.`,
  trap: `180 € è la quota del più piccolo (6 parti): la proporzionalità inversa dà di più a chi ha l'età minore. 110 € divide in parti uguali; 90 € è la quota del fratello di mezzo.`,
  patt: 'Proporzionalità inversa' },

{ k: 'q-mattone', diff: 'media', lang: 'it',
  stem: `Un mattone pesa 3 kg più mezzo mattone. Quanto pesa un mattone e mezzo?`,
  ...put('q-mattone', '9 kg', ['4,5 kg', '7,5 kg', '10,5 kg']),
  sol: `Se il mattone pesa x, x = 3 + x/2, cioè x/2 = 3 e x = 6 kg. Un mattone e mezzo pesa 6 + 3 = 9 kg.`,
  trap: `4,5 kg = 1,5 · 3 scambia i 3 kg per il peso del mattone; 7,5 kg e 10,5 kg sono valori a occhio. Il «mezzo mattone» è esso stesso incognito: va scritta l'equazione.`,
  patt: 'Trabocchetto' },

{ k: 'q-nondet', diff: 'media', lang: 'it',
  stem: `Due numeri interi a e b hanno prodotto 12 e somma positiva. Quanto vale a + b?`,
  ...put('q-nondet', 'Non è determinabile con i dati forniti', ['7', '8', '13']),
  sol: `Poiché la somma è positiva, i due numeri sono positivi. Le coppie con prodotto 12 sono (1,12), (2,6) e (3,4), con somme 13, 8 e 7: tre valori diversi, quindi a + b non è determinabile.`,
  trap: `Scegliere 7, 8 o 13 vuol dire fermarsi alla prima coppia che viene in mente. Il vincolo «somma positiva» esclude le coppie negative, ma non basta a scegliere tra le tre coppie positive.`,
  patt: 'Sufficienza dei dati' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-biblioteca', diff: 'media', lang: 'it',
  claim: `La maggior parte dei nuovi iscritti alla biblioteca è composta da pensionati.`,
  passage: `Dal 2023 la biblioteca comunale di Fornace tiene aperta la sera per cinque giorni la settimana, contro i due di prima. Nel 2024 i prestiti sono stati 48.000, contro i 40.000 del 2022. Nello stesso periodo il comune ha rinnovato il catalogo online e ha organizzato un incontro con un autore ogni mese. Il bibliotecario capo ha osservato che i nuovi iscritti sono soprattutto lavoratori e studenti universitari, ma ha precisato che non è stata condotta alcuna rilevazione per capire quali iniziative li abbiano attirati. Il bilancio della biblioteca è rimasto invariato.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «i nuovi iscritti sono soprattutto lavoratori e studenti universitari». Se i nuovi iscritti sono soprattutto lavoratori e studenti, la maggior parte non può essere composta da pensionati: l'affermazione è contraddetta.`,
  trap: `Rispondere «non ricavabile» perché il brano non nomina i pensionati: ma dice chi sono «soprattutto» i nuovi iscritti. La frase sull'assenza di rilevazioni riguarda le cause dell'aumento, non la composizione degli iscritti.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-tassoreale', diff: 'media', lang: 'it',
  passage: `Il tasso di interesse reale è la differenza tra il tasso nominale e il tasso di inflazione: indica di quanto cresce, in termini di beni acquistabili, il capitale depositato. Un risparmiatore deposita 10.000 euro su un conto che paga il 3% annuo di interesse nominale. Nello stesso anno i prezzi aumentano in media del 4%. Il conto non ha costi di gestione, gli interessi sono accreditati alla fine dell'anno e il risparmiatore non preleva nulla durante l'anno. Il conto è offerto da una banca che ha duecento filiali.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-tassoreale', `Il tasso reale è di circa −1%: alla fine dell'anno il risparmiatore può comprare meno beni di quanti ne avrebbe potuti comprare all'inizio.`,
    [`Il tasso reale è del 7%, somma del tasso nominale e dell'inflazione.`,
     `Il tasso reale è del 3%, perché gli interessi sono accreditati senza costi di gestione.`,
     `Il tasso reale è positivo, perché alla fine dell'anno il risparmiatore ha 10.300 euro invece di 10.000.`]),
  sol: `Frase chiave: «la differenza tra il tasso nominale e il tasso di inflazione». Il tasso reale è 3% − 4% = −1%: i 10.300 euro finali, a prezzi più alti del 4%, valgono meno dei 10.000 iniziali.`,
  trap: `Il tasso reale non somma i due tassi e non coincide con quello nominale. Avere più euro (10.300) non vuol dire poter comprare più beni quando i prezzi crescono più dell'interesse.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-doposcuola', diff: 'media', lang: 'it',
  passage: `Una regione propone di finanziare il doposcuola gratuito in tutte le scuole medie, per ridurre l'abbandono scolastico. A sostegno della proposta cita un confronto: nelle scuole medie in cui il doposcuola è già attivo, l'abbandono riguarda il 4% degli studenti, contro il 10% delle altre. Il costo previsto è di 200 euro per studente all'anno. Secondo la regione, i dati dimostrano che il doposcuola riduce l'abbandono. Il confronto riguarda 120 scuole di tutta la regione e il doposcuola è stato attivato negli ultimi dieci anni su richiesta dei dirigenti scolastici.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la tesi della regione?`,
  ...put('v-doposcuola', `Il doposcuola è stato attivato soprattutto nelle scuole di quartieri benestanti, dove l'abbandono era già basso.`,
    [`Il doposcuola è gestito da educatori con una laurea specifica.`,
     `L'abbandono scolastico è un problema anche in altre regioni europee.`,
     `Il costo del doposcuola sarebbe interamente a carico della regione.`]),
  sol: `La tesi dice: doposcuola → meno abbandono. Se il doposcuola è presente soprattutto dove l'abbandono era già basso, la differenza tra 4% e 10% può dipendere dal quartiere e non dal doposcuola (selezione, o causalità inversa).`,
  trap: `Gli educatori, la situazione in altre regioni e chi paga non toccano il nesso tra doposcuola e abbandono. Un confronto tra gruppi già diversi in partenza non dimostra un effetto.`,
  patt: 'Cause alternative' },

{ k: 'v-autisti', diff: 'difficile', lang: 'it',
  passage: `Un'azienda di trasporti ha oggi 200 autisti, il 60% dei quali con contratto a tempo indeterminato e i restanti a termine. Rispetto a un anno fa, gli autisti a termine sono aumentati di 20 unità, mentre quelli a tempo indeterminato sono diminuiti di 20: il totale non è cambiato. L'azienda attribuisce il cambiamento ai pensionamenti dei lavoratori più anziani e dichiara di voler stabilizzare entro due anni metà degli autisti a termine. Per l'azienda un autista a termine costa il 15% in meno di uno a tempo indeterminato.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put('v-autisti', `Un anno fa il 60% degli autisti aveva un contratto a tempo indeterminato.`,
    [`Un anno fa gli autisti a termine erano 60.`,
     `L'azienda vuole stabilizzare 40 autisti entro due anni.`,
     `Oggi gli autisti a tempo indeterminato sono 120.`]),
  sol: `Oggi gli autisti a tempo indeterminato sono il 60% di 200 = 120 e quelli a termine 80. Un anno fa erano 140 a tempo indeterminato (70%) e 60 a termine. Il 60% è la quota di oggi, non quella di un anno fa: l'affermazione NON è corretta. Le altre tre lo sono: 60 a termine, metà di 80 = 40, 120.`,
  trap: `Con la domanda «NON corretta» le altre tre sono vere. L'esca è scambiare il 60% di oggi con la quota di un anno fa: quel 60% si riferisce alla situazione attuale.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-parcheggio', diff: 'media', lang: 'it',
  claim: `Un automobilista non residente che parcheggia quando i posti sono occupati al 95% paga più di uno che parcheggia quando sono occupati al 40%.`,
  passage: `Il comune di Torrenova ha introdotto una tariffa dinamica nei parcheggi del centro: il prezzo orario parte da 1 euro e sale di 50 centesimi ogni volta che l'occupazione dei posti supera il 70%, l'80% e il 90%. Quando l'occupazione scende sotto una soglia, il prezzo diminuisce di nuovo di 50 centesimi. Il comune sostiene che la misura ridurrà il tempo che gli automobilisti passano a cercare un posto. Una parte degli incassi sarà destinata al trasporto pubblico. I residenti con permesso non pagano la tariffa dinamica. Una prima verifica dei risultati è prevista dopo sei mesi.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «sale di 50 centesimi ogni volta che l'occupazione … supera il 70%, l'80% e il 90%». Al 95% sono superate tutte e tre le soglie: 1 + 3 · 0,50 = 2,50 euro l'ora; al 40% nessuna soglia, quindi 1 euro. L'affermazione è deducibile.`,
  trap: `Rispondere «non ricavabile» perché il brano non dà il prezzo al 95%: le soglie e l'aumento fisso permettono di calcolarlo. I residenti con permesso sono esclusi, ma l'affermazione riguarda un non residente.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-prevenzione', diff: 'media', lang: 'it',
  passage: `Nel 2025 la Regione ha destinato alla prevenzione il 12% della propria spesa sanitaria, contro il 9% del 2024. In entrambi gli anni la spesa sanitaria complessiva è stata di 5 miliardi di euro. L'aumento ha finanziato screening gratuiti per i cittadini oltre i 50 anni, mentre la spesa per le prestazioni ospedaliere è rimasta invariata. L'opposizione ha osservato che i tempi di attesa per le visite specialistiche non sono diminuiti. La Regione ha risposto che gli effetti degli screening si vedranno solo in alcuni anni.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-prevenzione', `La spesa per la prevenzione è passata da 450 a 600 milioni di euro, con un aumento di un terzo.`,
    [`La spesa per la prevenzione è aumentata del 3%.`,
     `Gli screening gratuiti sono rivolti a tutti i cittadini.`,
     `La spesa per le prestazioni ospedaliere è diminuita per finanziare gli screening.`]),
  sol: `Frasi chiave: «il 12% … contro il 9%» e «la spesa sanitaria complessiva è stata di 5 miliardi». 9% di 5 miliardi = 450 milioni; 12% = 600 milioni. L'aumento è di 150 milioni, cioè un terzo di 450.`,
  trap: `Il 3% sono punti percentuali (12 − 9), non una variazione relativa della spesa. Gli screening sono per chi ha «oltre i 50 anni», non per tutti, e la spesa ospedaliera «è rimasta invariata».`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-fertilizzante', diff: 'media', lang: 'it',
  passage: `Un'azienda agricola ha provato un nuovo fertilizzante su 20 ettari di grano e ha ottenuto un raccolto per ettaro superiore del 15% rispetto alla media degli altri 60 ettari. L'azienda conclude che il nuovo fertilizzante aumenta il raccolto e intende usarlo su tutta la superficie. Il fertilizzante costa il doppio di quello tradizionale. I 20 ettari di prova si trovano nella parte pianeggiante dell'azienda, vicino al fiume, mentre gli altri 60 ettari sono in parte collinari. La prova è stata condotta in un'unica annata.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione dell'azienda?`,
  ...put('v-fertilizzante', `Nelle annate precedenti i 20 ettari di prova avevano dato lo stesso raccolto per ettaro degli altri 60.`,
    [`Il fertilizzante è prodotto da un'azienda con sede in Italia.`,
     `Il prezzo del grano è aumentato nel corso dell'anno.`,
     `Il fertilizzante tradizionale è usato da molte aziende della zona.`]),
  sol: `La conclusione è: fertilizzante → raccolto maggiore. Il rischio è che i 20 ettari rendessero di più comunque (pianura, vicino al fiume). Se in passato i due gruppi rendevano uguale, quella spiegazione alternativa cade e la conclusione si rafforza.`,
  trap: `La sede del produttore, il prezzo del grano e la diffusione del fertilizzante tradizionale non dicono nulla sul perché i 20 ettari abbiano reso di più. Per rafforzare un nesso causale conviene escludere le cause alternative.`,
  patt: 'Cause alternative' },

{ k: 'v-matematica', diff: 'difficile', lang: 'it',
  passage: `Un provveditore sostiene che una scuola media debba assumere come docenti di matematica soltanto laureati in matematica, perché senza quella laurea non si possiedono gli strumenti per insegnare il ragionamento rigoroso. Le scuole della provincia che hanno finora impiegato docenti di formazione diversa, come la scuola Don Milani, hanno ottenuto risultati inferiori alla media provinciale nelle prove nazionali. Il provveditore intende modificare i bandi per le assunzioni del prossimo anno. La provincia conta 40 scuole medie e circa 9.000 studenti.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la tesi del provveditore?`,
  ...put('v-matematica', `Tra le scuole medie della provincia con risultati molto buoni in matematica, nessuna impiega docenti privi di laurea in matematica.`,
    [`Alcune scuole medie che assumono soltanto laureati in matematica hanno ottenuto risultati superiori alla media.`,
     `Il numero di laureati in matematica in provincia è aumentato negli ultimi dieci anni.`,
     `La scuola Don Milani è una delle più piccole della provincia.`]),
  sol: `La tesi è una condizione necessaria: servono soltanto laureati in matematica. La rafforza chi mostra che le scuole con risultati molto buoni hanno tutte docenti laureati in matematica (senza laurea, niente risultati).`,
  trap: `L'esca è la condizione sufficiente: sapere che alcune scuole con soli laureati vanno bene mostra che la laurea può bastare, non che sia necessaria. Il numero di laureati e le dimensioni della scuola Don Milani non toccano la tesi.`,
  patt: 'Necessario vs sufficiente' },

{ k: 'v-remoto', diff: 'media', lang: 'it',
  claim: `Secondo lo studio, lavorare da casa due giorni a settimana aumenta la produttività in ogni tipo di mansione.`,
  passage: `Uno studio condotto su 3.000 dipendenti di aziende di servizi ha confrontato chi lavora da casa due giorni a settimana con chi lavora sempre in ufficio. In media, i primi hanno completato più pratiche al giorno, e il risultato è stato attribuito alla minore quantità di interruzioni. L'effetto, però, dipende dal tipo di mansione: nei ruoli che richiedono un continuo coordinamento con i colleghi la produttività è risultata invariata o in lieve calo. Gli autori precisano che lo studio non ha misurato la qualità del lavoro svolto. Il campione comprende dipendenti di sei città diverse.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «nei ruoli che richiedono un continuo coordinamento con i colleghi la produttività è risultata invariata o in lieve calo». «In ogni tipo di mansione» è contraddetto da questa frase.`,
  trap: `Fermarsi alla prima parte («in media … più pratiche») e rispondere «vera», oppure dire «non ricavabile» pensando che lo studio non copra ogni mansione: il brano nomina proprio mansioni in cui l'effetto manca. Un termine assoluto come «ogni» basta un solo caso contrario a smentirlo.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-deficit', diff: 'media', lang: 'it',
  passage: `Il deficit pubblico è la differenza, in un anno, tra le spese e le entrate dello Stato; il debito pubblico è invece l'insieme dei deficit accumulati negli anni, al netto di eventuali avanzi. Lo Stato di Altavilla ha chiuso l'anno scorso con un deficit di 30 miliardi di euro e quest'anno con un deficit di 20 miliardi. All'inizio di quest'anno il debito di Altavilla era di 600 miliardi. Il governo si è presentato come più virtuoso dell'anno precedente e ha promesso di ridurre ulteriormente il deficit nel prossimo anno.`,
  stem: `In base al brano, a quanto ammonta il debito di Altavilla alla fine di quest'anno?`,
  ...put('v-deficit', `620 miliardi di euro`,
    [`580 miliardi di euro`, `600 miliardi di euro`, `650 miliardi di euro`]),
  sol: `Frasi chiave: «il debito pubblico è … l'insieme dei deficit accumulati» e «All'inizio di quest'anno il debito … era di 600 miliardi». Il deficit di quest'anno (20 miliardi) si aggiunge al debito: 600 + 20 = 620 miliardi. Il deficit dell'anno scorso è già compreso nei 600.`,
  trap: `Un deficit in calo non fa calare il debito: lo fa crescere di meno (580 e 600 trattano il deficit come un avanzo o lo ignorano). 650 conta anche il deficit dell'anno scorso, che è già nei 600 miliardi iniziali.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-fattore', diff: 'media', lang: 'it',
  passage: `Un'app per la meditazione sostiene di migliorare il sonno dei suoi utenti. A sostegno, riporta i risultati di un questionario inviato dopo tre mesi di utilizzo: tra i 2.000 utenti che hanno risposto, il 70% dichiara di dormire meglio di prima. L'azienda ne conclude che l'uso dell'app migliora il sonno e utilizzerà il dato nella pubblicità. L'app ha avuto 20.000 iscritti nel primo anno e costa 5 euro al mese. La compilazione del questionario era facoltativa e i risultati non sono stati verificati da enti esterni.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza della conclusione dell'azienda?`,
  ...put('v-fattore', `La quota di iscritti che ha smesso di usare l'app prima dei tre mesi e che quindi non ha risposto al questionario.`,
    [`Il prezzo dell'app rispetto a quello delle app concorrenti.`,
     `L'età media degli iscritti all'app.`,
     `Il numero di download nel mese del lancio.`]),
  sol: `L'azienda generalizza a tutti gli utenti i dati di 2.000 rispondenti su 20.000 iscritti. Se molti iscritti hanno smesso di usare l'app perché non ne traevano beneficio, non hanno risposto: il campione sarebbe composto da chi è soddisfatto e la conclusione sarebbe falsata (selezione del campione).`,
  trap: `Prezzo, età media e download non dicono se i rispondenti siano rappresentativi di tutti gli iscritti. Con un questionario facoltativo conviene chiedersi chi non ha risposto.`,
  patt: 'Selezione del campione' },

{ k: 'v-bio', diff: 'difficile', lang: 'it',
  claim: `Per ettaro, il profitto dei campi biologici è superiore a quello dei campi convenzionali.`,
  passage: `Un'azienda agricola ha convertito al biologico 40 dei suoi 100 ettari. Per ettaro, la resa dei campi biologici è inferiore del 20% a quella dei campi convenzionali, ma il prodotto biologico viene venduto a un prezzo superiore del 50%. La conversione ha richiesto investimenti per 90.000 euro; i costi di manodopera per ettaro sono rimasti invariati. L'azienda ha dichiarato che il passaggio ha migliorato l'immagine del marchio e che dal prossimo anno convertirà altri 20 ettari, in attesa di nuove certificazioni.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «resa … inferiore del 20%» e «prezzo superiore del 50%». Il ricavo per ettaro è 0,8 · 1,5 = 1,2 volte quello convenzionale (+20%). Ma il profitto è ricavo meno costi: del biologico si sa solo che la manodopera non cambia e che servono 90.000 euro di investimenti; gli altri costi non sono dati. L'affermazione non è né confermata né smentita.`,
  trap: `Rispondere «vera» fermandosi al ricavo (+20%), che non è il profitto; oppure «falsa» pesando i 90.000 euro di investimenti senza sapere su quanti anni si ammortizzano. Il ricavo per ettaro è un rapporto che si ricava, il profitto no.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-centro', diff: 'media', lang: 'it',
  passage: `Il sindaco di Valmora vuole rendere pedonale il centro storico per aumentare gli incassi dei negozi. Cita il caso di tre città in cui, dopo la pedonalizzazione, gli incassi dei negozi del centro sono cresciuti. Il centro ospita 150 negozi e ha una sola linea di autobus. Il sindaco ritiene che i pedoni, camminando più lentamente, si fermino di più davanti alle vetrine. I commercianti sono divisi: una parte teme che i clienti non riescano più a raggiungere il centro.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la proposta del sindaco?`,
  ...put('v-centro', `Gran parte degli incassi dei negozi del centro proviene da clienti che arrivano in auto dai comuni vicini, e il centro non ha parcheggi alternativi.`,
    [`Molti negozi del centro sono aperti anche la domenica.`,
     `Il sindaco è stato eletto con il 52% dei voti.`,
     `Il costo della pedonalizzazione sarà coperto da fondi europei.`]),
  sol: `La proposta poggia sull'idea che più pedoni portino più incassi. Se i clienti più importanti arrivano in auto e non hanno alternative, la pedonalizzazione può far perdere proprio loro: un effetto collaterale che colpisce l'obiettivo.`,
  trap: `Gli orari domenicali, i voti del sindaco e i fondi europei non dicono nulla sugli incassi dopo la pedonalizzazione. Per indebolire bisogna colpire il nesso tra la misura e il risultato.`,
  patt: 'Effetto collaterale' },

{ k: 'v-vino', diff: 'media', lang: 'it',
  passage: `Nel primo semestre del 2025 le esportazioni di vino di un Paese sono cresciute dell'8% rispetto al primo semestre del 2024, soprattutto grazie alle vendite in Asia, che sono raddoppiate. Le vendite in Europa, che rappresentano ancora circa due terzi delle esportazioni complessive, sono rimaste stabili. Il governo prevede per l'intero 2025 una crescita del 6% rispetto al 2024, perché nel secondo semestre il cambio sarà meno favorevole per gli esportatori. Le imprese del settore sono circa 800 e il vino pesa per circa il 5% sulle esportazioni agroalimentari del Paese.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-vino', `Il governo si aspetta per il secondo semestre del 2025 una crescita inferiore a quella del primo.`,
    [`Nel primo semestre del 2025 le esportazioni verso l'Europa sono raddoppiate.`,
     `La crescita del 6% prevista dal governo si riferisce al solo primo semestre del 2025.`,
     `Le vendite in Asia rappresentano ora circa due terzi delle esportazioni.`]),
  sol: `Frasi chiave: «cresciute dell'8%» nel primo semestre e «per l'intero 2025 una crescita del 6%». Se l'intero anno cresce del 6%, meno dell'8% del primo semestre, il secondo semestre deve crescere ancora meno del 6%: quindi meno del primo.`,
  trap: `Le altre tre affermazioni spostano il periodo (il 6% è per l'intero anno) o il continente (sono le vendite in Asia a raddoppiare, quelle in Europa a restare stabili e a pesare per i due terzi).`,
  patt: 'Periodo spostato' },

{ k: 'v-app', diff: 'media', lang: 'it',
  claim: `I clienti che pagano con l'app sono meno di 250.`,
  passage: `Un supermercato ha intervistato 900 clienti all'uscita, un sabato di aprile, sul modo in cui pagano la spesa. Il 20% degli intervistati ha dichiarato di pagare sempre in contanti. Tra tutti gli altri, due su tre usano la carta e i restanti un'app sul telefono. I responsabili avvertono che nei giorni feriali le abitudini potrebbero essere diverse. Le interviste sono anonime. Il 70% dei clienti intervistati ha più di quarant'anni e il 40% fa la spesa almeno due volte alla settimana.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «900 clienti», «Il 20% … in contanti» e «Tra tutti gli altri, due su tre usano la carta». Gli altri sono 720; un terzo di loro usa l'app: 240, meno di 250. L'affermazione è deducibile.`,
  trap: `Calcolare un terzo di 900 (300) o dei soli 180 che pagano in contanti invece che di 720. La base del «due su tre» è il gruppo di chi non paga in contanti, non l'intero campione. I numeri bastano: non è «non ricavabile».`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-regola', diff: 'difficile', lang: 'it',
  passage: `Il regolamento di un concorso assegna punti aggiuntivi in base ai titoli. Chi ha una laurea con voto di almeno 105 su 110 ottiene 5 punti; se però la laurea è stata conseguita da più di cinque anni, i punti per il voto di laurea sono ridotti a 3. Chi possiede una certificazione di inglese di livello B2 o superiore ottiene 3 punti. I punti per la laurea e quelli per l'inglese si sommano, tranne nel caso in cui la laurea sia stata conseguita da più di cinque anni: in tale caso si applica soltanto il più alto dei due punteggi. Le domande vanno presentate entro il 15 marzo.`,
  stem: `Marta si è laureata sei anni fa con 108 su 110 e possiede una certificazione di inglese di livello C1. Quanti punti aggiuntivi ottiene in base al regolamento?`,
  ...put('v-regola', `3 punti`, [`5 punti`, `6 punti`, `8 punti`]),
  sol: `Frasi chiave: «se però la laurea è stata conseguita da più di cinque anni, i punti … sono ridotti a 3» e «si applica soltanto il più alto dei due punteggi». Marta si è laureata sei anni fa: la laurea vale 3 punti e l'inglese 3 punti. Non si sommano: si applica il più alto, che è 3.`,
  trap: `8 = 5 + 3 ignora la riduzione e somma; 6 = 3 + 3 applica la riduzione ma somma comunque; 5 ignora la riduzione. Con la laurea oltre i cinque anni scattano due regole insieme: la riduzione e il divieto di sommare.`,
  patt: 'Applicazione di una regola' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-sino1', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un intero positivo n è minore di 50?',
    'n è il doppio di un numero primo minore di 20.',
    'n è un multiplo di 6.'),
  ...dsq('BADC', 'A'),
  sol: `(1): i primi minori di 20 arrivano a 19, quindi n = 2p ≤ 38 < 50: la risposta è sempre «sì». (2): n può essere 6 (sì) oppure 60 (no): non basta. La (1) basta, la (2) no.`,
  trap: `Pensare che la (1) non basti perché non dice quale sia n: per una domanda sì/no basta un limite (n ≤ 38). Con la (2) molti multipli di 6 sono sotto 50, ma non tutti.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-pie', diff: 'media', lang: 'it', asset: gCanali(),
  stem: `Quante delle copie vendute online non sono state restituite?`,
  ...put('d-pie', '1.920', ['2.400', '1.600', '480']),
  sol: `Le copie vendute online sono il 30% di 8.000 = 2.400. Di queste il 20% è stato restituito: 480. Le copie non restituite sono 2.400 − 480 = 1.920 (cioè 2.400 · 0,8).`,
  trap: `2.400 sono le copie vendute online prima dei resi; 480 sono le copie restituite; 1.600 è il 20% di 8.000, cioè la percentuale applicata al totale invece che al solo canale online.`,
  patt: 'Percentuali composte' },

{ k: 'd-2x2', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('In un gruppo di 100 persone, quante sono le donne abbonate a una rivista?',
    'Le donne sono 60.',
    'Gli abbonati sono per metà donne e gli uomini non abbonati sono 30.'),
  ...dsq('CBAD', 'B'),
  sol: `Tabella 2×2 donne/uomini × abbonati/non abbonati. (1): le donne sono 60 e gli uomini 40, ma non si sa quanti siano abbonati. (2): se le donne abbonate sono w, anche gli uomini abbonati sono w (metà degli abbonati) e gli uomini sono 30 + w: senza il numero delle donne, w può cambiare. Insieme: gli uomini sono 40 = 30 + w, quindi w = 10.`,
  trap: `La (2) dà una relazione ma non fissa il totale degli uomini (30 + w): sembra bastare perché cita «metà» e 30. Serve la (1) per sapere che gli uomini sono 40. È una tabella 2×2 con due vincoli che si incastrano.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-corsi', diff: 'media', lang: 'it', asset: tCorsi(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-corsi', 'Nel corso B gli studenti non fuori sede sono il quadruplo dei fuori sede.', [
    'Il corso C ha più studenti fuori sede del corso A.',
    'Gli studenti fuori sede sono più del 30% del totale degli iscritti.',
    'Nessuna delle altre risposte è corretta']),
  sol: `Fuori sede: A = 30% di 200 = 60; B = 20% di 300 = 60; C = 50% di 100 = 50. Nel corso B i non fuori sede sono 300 − 60 = 240 = 4 · 60. Le altre: C (50) ha meno fuori sede di A (60); in tutto 170 su 600 sono il 28,3%, meno del 30%.`,
  trap: `Le percentuali di riga non dicono dove ci siano più fuori sede: il corso C ha la percentuale più alta ma pochi iscritti (50 contro 60). Il 30% è la quota del solo corso A; la media semplice (33,3%) darebbe un risultato sbagliato.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-limite2', diff: 'media', lang: 'it', ds: true,
  stem: ds('In un sacchetto ci sono palline rosse, blu e verdi. La probabilità che una pallina estratta a caso sia rossa è minore di 1/2?',
    'Le palline verdi sono 6 e le palline rosse sono 8.',
    'Le palline blu sono più numerose delle palline rosse.'),
  ...dsq('CDBA', 'A'),
  sol: `(2): se le blu sono più delle rosse, le rosse sono meno della metà di (rosse + blu), e a maggior ragione meno della metà di tutte le palline: la risposta è sempre «sì». (1): con 8 rosse e 6 verdi la probabilità è 8/14 > 1/2 se non ci sono blu, ma è minore di 1/2 se le blu sono 20: non basta. La (2) basta, la (1) no.`,
  trap: `Pensare che la (2) non basti perché non dà alcun numero: per una domanda sì/no basta un limite. Con la (1) si è tentati di calcolare 8/14 senza ricordare che le palline blu non sono state contate.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-ore', diff: 'media', lang: 'it', asset: tOre(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-ore', 'Le ore dell\'Associazione A nel 2025 sono più del doppio di quelle del 2022.', [
    'Le ore dell\'Associazione B nel 2025 sono più del doppio di quelle del 2022.',
    'Le ore dell\'Associazione C sono cresciute ogni anno dello stesso numero di ore.',
    'Nel 2024 le ore dell\'Associazione B superano la somma di quelle di A e di C.']),
  sol: `A: il doppio di 44 è 88 e 89 > 88, vero. B: il doppio di 60 è 120 e 118 < 120, quindi falso. C: gli aumenti sono 12, 8 e 4, non costanti. Nel 2024: 57 + 50 = 107 > 80 di B, falso.`,
  trap: `Il doppio con numeri vicini (89 contro 88, 118 contro 120): conviene calcolare il doppio invece di valutare a occhio. «Ogni anno dello stesso numero di ore» è smentito da un solo anno.`,
  patt: 'Doppio con numeri vicini' },

{ k: 'd-cella', diff: 'difficile', lang: 'it', asset: tTurni(),
  stem: `Qual è la percentuale di pezzi difettosi sul totale dei pezzi prodotti nella giornata?`,
  ...put('d-cella', '5,5%', ['5%', 'Circa 6,3%', '7%']),
  sol: `I pezzi del turno di notte si ricavano dal totale: 1.000 − 500 − 300 = 200. Difettosi: 4% di 500 = 20; 5% di 300 = 15; 10% di 200 = 20. In tutto 55 su 1.000: il 5,5%.`,
  trap: `Circa 6,3% è la media semplice delle tre percentuali (4, 5 e 10): ma i turni producono quantità molto diverse e il turno di notte, con la percentuale più alta, produce poco. 5% e 7% sono valori a occhio.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-prod', diff: 'media', lang: 'it', ds: true,
  stem: ds('Due numeri interi positivi x e y hanno prodotto 12. Quanto vale x?',
    'x è minore di y.',
    'x è pari.'),
  ...dsq('DCBA', 'B'),
  sol: `Le coppie con prodotto 12 sono (1,12), (2,6), (3,4), (4,3), (6,2), (12,1). (1): x < y lascia x = 1, 2 o 3. (2): x pari lascia x = 2, 4, 6 o 12. Insieme: x = 2.`,
  trap: `Pensare che una sola affermazione basti perché riduce molto le coppie: restano tre o quattro casi. I due vincoli si incrociano in un solo valore (2); il 3 e l'1 sono dispari, il 4, il 6 e il 12 non sono minori di y.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-logica-a', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Un'azienda ha 60 dipendenti e il rapporto tra uomini e donne è 2 : 3.`,
    `I dipendenti con meno di 30 anni sono 15.`,
    `Nessun dipendente con meno di 30 anni è un dirigente.`
  ], [
    `A. Le donne sono 36.`,
    `B. Gli uomini con meno di 30 anni sono 6.`,
    `C. I dipendenti con almeno 30 anni sono 40.`,
    `D. Un dipendente di 25 anni non è un dirigente.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la B sia la D', 'Sia la A sia la C', 'Sia la A sia la D'], ans: 3,
  sol: `Il rapporto 2 : 3 su 60 dipendenti dà 24 uomini e 36 donne (A vera). Chi ha meno di 30 anni non è dirigente, quindi un venticinquenne non lo è (D vera). I dipendenti con almeno 30 anni sono 60 − 15 = 45, non 40 (C falsa). Gli uomini sotto i 30 anni possono essere qualsiasi numero da 0 a 15 (B non è sicura).`,
  trap: `La B mescola il rapporto 2 : 3 con i 15 dipendenti giovani: nessun dato dice come si dividono tra uomini e donne. Un rapporto fissa le proporzioni solo dentro il gruppo a cui si riferisce.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-cerchio', diff: 'media', lang: 'it', ds: true,
  stem: ds('Quanto misura l\'area di un cerchio?',
    'La circonferenza misura 12π cm.',
    'Il quadrato inscritto nel cerchio ha area di 72 cm².'),
  ...dsq('ABDC', 'C'),
  sol: `(1): la circonferenza è 2πr = 12π, quindi r = 6 cm e l'area è 36π cm². (2): la diagonale del quadrato è il diametro del cerchio; il quadrato di lato l ha area l² = 72 e diagonale² = 2l² = 144, quindi il diametro è 12 cm, r = 6 e l'area è 36π cm². Ciascuna affermazione, da sola, basta.`,
  trap: `Credere che l'area del quadrato non basti per il cerchio: la diagonale del quadrato inscritto coincide con il diametro, e l'area dà la diagonale (d² = 2 · area). Le due affermazioni sono coerenti (r = 6 cm).`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-logica-c', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Ogni socio del circolo che frequenta il corso di pittura frequenta anche il corso di disegno.`,
    `Nessun socio che frequenta il corso di scultura frequenta il corso di disegno.`,
    `Giorgio è un socio del circolo e frequenta il corso di pittura.`
  ], [
    `A. Giorgio frequenta il corso di disegno.`,
    `B. Giorgio non frequenta il corso di scultura.`,
    `C. Ogni socio che frequenta il corso di disegno frequenta anche il corso di pittura.`,
    `D. Qualche socio frequenta sia il corso di pittura sia quello di scultura.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la A sia la C', 'Sia la A sia la B', 'Solo la B'], ans: 2,
  sol: `Giorgio frequenta pittura, quindi anche disegno (A vera). Chi frequenta disegno non frequenta scultura, quindi Giorgio non frequenta scultura (B vera). C è l'implicazione inversa: non è garantita. D è falsa: un socio di pittura frequenta disegno e un socio di scultura no.`,
  trap: `La B richiede un secondo passaggio, per contrapposizione (disegno → non scultura). La C è l'inversa dell'implicazione del primo dato («pittura → disegno»): non vale in generale. «Solo la A» si ferma al primo passaggio.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-barre', diff: 'media', lang: 'it', asset: gTrimestri(),
  stem: `In quale trimestre il rapporto tra ricavi e costi è stato più alto?`,
  ...put('d-barre', 'Il primo trimestre', ['Il secondo trimestre', 'Il terzo trimestre', 'Il quarto trimestre']),
  sol: `Ricavi ÷ costi: 1° trim. 80/50 = 1,6; 2° trim. 120/90 ≈ 1,33; 3° trim. 100/80 = 1,25; 4° trim. 150/100 = 1,5. Il valore più alto è il primo.`,
  trap: `Il quarto trimestre ha i ricavi più alti e la differenza ricavi − costi maggiore (50), ma il rapporto (1,5) è inferiore a quello del primo (1,6). Il secondo ha la stessa differenza del primo (30), su costi più alti.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-intervallo', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un negozio vende soltanto penne da 2 € e matite da 1 €. Quante penne ha venduto in tutto?',
    'In tutto ha venduto 20 articoli.',
    'L\'incasso totale è superiore a 25 € e inferiore a 30 €.'),
  ...dsq('ADBC', 'D'),
  sol: `Se le penne sono p e le matite 20 − p, l'incasso è 2p + (20 − p) = 20 + p. Con l'incasso tra 25 € e 30 €: 5 < p < 10, cioè p = 6, 7, 8 o 9. Anche con entrambe le affermazioni restano quattro valori.`,
  trap: `Pensare che, essendo noti il numero di articoli e l'incasso, p sia fissato: ma l'incasso è dato solo come intervallo. Con l'incasso esatto (per esempio 28 €) le due affermazioni insieme sarebbero bastate.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-vendite', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Un negozio ha venduto in una settimana 100 zaini di 5 modelli diversi.`,
    `Di ogni modello ha venduto almeno 10 pezzi.`,
    `Il modello più venduto ha venduto 40 pezzi.`
  ], [
    `A. Un modello ha venduto soltanto 5 pezzi.`,
    `B. Il modello meno venduto ha venduto meno di 20 pezzi.`,
    `C. Almeno due modelli hanno venduto più di 20 pezzi.`,
    `D. Il modello più venduto ha venduto più della metà dei pezzi.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Sia la B sia la C', 'Sia la A sia la D', 'Sia la C sia la D', 'Solo la A'], ans: 1,
  sol: `Ogni modello ha almeno 10 pezzi: A è falsa. 40 pezzi sono meno della metà di 100: D è falsa. B è vera: gli altri quattro modelli vendono 60 pezzi, quindi il minore ne ha al massimo 15. C non è sicura: con 40, 15, 15, 15, 15 un solo modello supera 20, con 40, 25, 15, 10, 10 ne superano 20 due.`,
  trap: `Con la consegna «false» non va indicata la B (vera). Per la C non basta un esempio: esistono distribuzioni che la rendono vera e altre che la rendono falsa, quindi non è sicuramente falsa.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-citta', diff: 'difficile', lang: 'it', asset: gCitta(),
  stem: `Se tra il 2025 e il 2030 la popolazione complessiva delle quattro città crescerà ancora del 10%, di quanto sarà aumentata nel 2030 rispetto al 2020?`,
  ...put('d-citta', '26,5%', ['25%', '32,5%', '22,5%']),
  sol: `Totale 2020: 80 + 120 + 40 + 160 = 400; totale 2025: 100 + 132 + 60 + 168 = 460 (+15%). Nel 2030: 460 · 1,1 = 506, cioè 506 ÷ 400 = 1,265: +26,5% rispetto al 2020.`,
  trap: `32,5% somma 22,5% (la media semplice delle quattro crescite 25, 10, 50 e 5) e il 10% finale; 25% somma 15% e 10% invece di moltiplicare i fattori (1,15 · 1,1); 22,5% è la sola media semplice. Le variazioni percentuali delle singole città vanno pesate con le loro dimensioni, e le variazioni successive si compongono.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-ordine', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Anna è più alta di Bruno.`,
    `Bruno è più alto di Carla.`,
    `Dario è più basso di Anna ma più alto di Carla.`
  ], [
    `A. Carla è la più bassa del gruppo.`,
    `B. Dario è più alto di Bruno.`,
    `C. Bruno è più alto di Anna.`,
    `D. Dario è il più alto del gruppo.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Sia la A sia la B', 'Solo la D', 'Sia la B sia la C', 'Sia la C sia la D'], ans: 3,
  sol: `Anna è più alta di Bruno, quindi C è falsa. Anna è più alta anche di Dario, quindi D è falsa. A è vera: Carla è più bassa di Bruno, di Dario e (per transitività) di Anna. B non è sicura: dei due, Bruno e Dario, non si sa chi sia più alto.`,
  trap: `La B è un'esca: Bruno e Dario sono entrambi sotto Anna e sopra Carla, ma il loro ordine reciproco non è dato. Con la consegna «false» non va indicata la A, che è vera.`,
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
  id: '29',
  title: 'Mock 29',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'NOTA',
  questions: QUESTIONS,
  data: DATA
};
});
