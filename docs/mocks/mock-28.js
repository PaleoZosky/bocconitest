/* =======================================================================
   Mock 28 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
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
   la domanda per gli script di verifica (tools/check_math_28.py).
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
  'q-prezzo': 2, 'q-numeri-pari': 1, 'q-vittorie': 3, 'q-media-aggiunta': 1, 'q-eta': 1, 'q-anagrammi': 0,
  'q-quaderni': 0, 'q-eta-media': 0, 'q-difettosi': 2, 'q-capitale': 3, 'q-sorpasso': 1, 'q-operai': 1,
  'q-divisori': 2, 'q-vasca': 3, 'q-soluzione': 0, 'q-urna': 3, 'q-cubo': 2, 'q-dispari': 2,
  'v-margine': 1, 'v-mensa': 1, 'v-parcheggio': 3, 'v-ammortamento': 0, 'v-bolletta': 2, 'v-librerie': 0,
  'v-ztl': 2, 'v-spedizione': 3, 'v-fattore': 0, 'v-pendolari': 3, 'v-spread': 2,
  'd-bilancio': 1, 'd-salari': 3, 'd-straordinari': 0, 'd-preferenze': 2, 'd-spedizioni': 1, 'd-ricavi': 3
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
  /* costi annui di una startup (% sul totale di 200.000 euro) */
  bilancio: { voci: [['Stipendi', 45], ['Affitto', 20], ['Marketing', 15], ['Altro', 20]], totale: 200000, dMkt: 40, dStip: -10 },
  /* indici (base 2021 = 100) di salari e prezzi */
  salari: { anni: ['2021', '2022', '2023', '2024', '2025'], salari: [100, 106, 112, 116, 120], prezzi: [100, 104, 110, 116, 121] },
  /* ore di straordinario per reparto e paga oraria (euro) */
  straordinari: { reparti: ['A', 'B', 'C', 'D'], ore: [30, 50, 20, 100], paga: [20, 20, 30, 30] },
  /* intervistati e % che preferisce il prodotto X per fascia d'età */
  preferenze: { fasce: ['Fino a 30 anni', '31–50 anni', 'Oltre 50 anni'], n: [200, 500, 300], perc: [60, 40, 20] },
  /* spedizioni per corriere e destinazione; cella nascosta (null) da ricostruire con i totali */
  spedizioni: { corrieri: ['Corriere A', 'Corriere B', 'Corriere C'], ita: [40, 25, 15], eur: [30, null, 10], mondo: [10, 5, 15], totRiga: [80, 50, 40], totCol: [80, 60, 30, 170] },
  /* ricavi (migliaia di euro) di tre negozi */
  ricavi: { negozi: ['A', 'B', 'C'], y23: [120, 210, 85], y24: [130, 190, 90], y25: [143, 170, 95] }
};

/* ======================= tabelle e grafici ======================= */
function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

function gBilancio() {
  const D = DATA.bilancio;
  return `<figure class="fig"><figcaption>Come si ripartiscono i costi annui di una startup</figcaption>` + C.pie({
    data: D.voci, title: 'Quota dei costi',
    aria: 'Torta dei costi: ' + D.voci.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `<p class="fig-note">Il costo totale annuo è di ${D.totale.toLocaleString('it-IT')} euro.</p></figure>`;
}

function gSalari() {
  const D = DATA.salari;
  return `<figure class="fig"><figcaption>Indice dei salari e indice dei prezzi (2021 = 100)</figcaption>` + C.line({
    labels: D.anni,
    series: [{ name: 'Salari', values: D.salari }, { name: 'Prezzi', values: D.prezzi, dash: '5 4' }],
    lo: 90, hi: 130, gridFrom: 100, gridTo: 120, gridStep: 10, L: 46, R: 22, legend: true,
    aria: 'Linee degli indici: salari ' + D.anni.map((m, i) => m + ' ' + D.salari[i]).join(', ') + '; prezzi ' + D.anni.map((m, i) => m + ' ' + D.prezzi[i]).join(', ') + '.'
  }) + `</figure>`;
}

function gStraordinari() {
  const D = DATA.straordinari;
  return `<figure class="fig"><figcaption>Ore di straordinario svolte in un anno, per reparto</figcaption>` + C.bars({
    labels: D.reparti, series: [{ name: 'Ore di straordinario', values: D.ore }], max: 120, legend: false,
    aria: 'Istogramma delle ore di straordinario: ' + D.reparti.map((m, i) => 'reparto ' + m + ' ' + D.ore[i]).join(', ') + '.'
  }) + `<p class="fig-note">Lo straordinario è pagato ${D.paga[0]} euro l'ora nei reparti A e B e ${D.paga[2]} euro l'ora nei reparti C e D.</p></figure>`;
}

function tPreferenze() {
  const D = DATA.preferenze;
  return C.table({
    caption: 'Indagine sul prodotto X: intervistati e quota di chi lo preferisce, per fascia d\'età',
    head: ['Fascia d\'età', 'Intervistati', 'Preferiscono X'],
    rows: D.fasce.map((f, i) => [f, D.n[i], D.perc[i] + '%'])
  });
}

function tSpedizioni() {
  const D = DATA.spedizioni, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Spedizioni di un\'azienda in un mese, per corriere e destinazione',
    head: ['Corriere', 'Italia', 'Europa', 'Resto del mondo', 'Totale'],
    rows: D.corrieri.map((s, i) => [s, D.ita[i], c(D.eur[i]), D.mondo[i], D.totRiga[i]]),
    foot: ['Totale'].concat(D.totCol)
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato.</p>`;
}

function tRicavi() {
  const D = DATA.ricavi;
  return C.table({
    caption: 'Ricavi di tre negozi, in migliaia di euro',
    head: ['Negozio', '2023', '2024', '2025'],
    rows: D.negozi.map((n, i) => [n, D.y23[i], D.y24[i], D.y25[i]])
  });
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-prezzo', diff: 'media', lang: 'it',
  stem: `Un negozio aumenta il prezzo di un articolo del 20% e dopo qualche settimana lo riduce del 20%. Il prezzo finale è 576 €. Qual era il prezzo iniziale?`,
  ...put('q-prezzo', '600 €', ['576 €', '720 €', '590 €']),
  sol: `Il prezzo finale è 1,2 · 0,8 = 0,96 volte quello iniziale. Quindi il prezzo iniziale era 576 ÷ 0,96 = 600 €.`,
  trap: `576 € suppone che +20% e −20% si compensino; 720 € = 576 ÷ 0,8 annulla solo la riduzione; 590 € è un valore a occhio. La riduzione del 20% si applica al prezzo già aumentato, non a quello iniziale.`,
  patt: 'Percentuali composte' },

{ k: 'q-numeri-pari', diff: 'media', lang: 'it',
  stem: `Quanti numeri pari di quattro cifre tutte diverse si possono formare usando soltanto le cifre 1, 2, 3, 4 e 5?`,
  ...put('q-numeri-pari', '48', ['24', '60', '120']),
  sol: `L'ultima cifra deve essere pari: 2 oppure 4, cioè 2 scelte. Le altre tre posizioni si riempiono con le restanti 4 cifre, senza ripetizioni: 4 · 3 · 2 = 24 modi. In tutto 2 · 24 = 48 numeri.`,
  trap: `120 = 5 · 4 · 3 · 2 conta tutti i numeri di quattro cifre diverse, anche quelli dispari; 60 = 5 · 4 · 3 non considera la quarta cifra; 24 considera una sola scelta per l'ultima cifra. Conviene fissare prima la cifra con il vincolo.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-vittorie', diff: 'difficile', lang: 'it',
  stem: `Una squadra ha vinto il 60% delle prime 20 partite del campionato. Quante partite deve vincere di seguito, almeno, per portare la percentuale di vittorie al 75%?`,
  ...put('q-vittorie', '12', ['3', '8', '15']),
  sol: `Le vittorie iniziali sono 12 su 20. Dopo n vittorie in più si ha (12 + n) ÷ (20 + n) = 3/4, cioè 48 + 4n = 60 + 3n e n = 12. Verifica: 24 vittorie su 32 partite sono il 75%.`,
  trap: `3 calcola il 75% di 20 (15 vittorie) e aggiunge solo 15 − 12, dimenticando che con le nuove partite sale anche il totale; 15 è il numero di vittorie del 75% di 20; 8 è un valore a occhio: 20 su 28 è il 71%.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-media-aggiunta', diff: 'media', lang: 'it',
  stem: `La media di cinque numeri è 12. Aggiungendo un sesto numero la media sale a 13. Qual è il sesto numero?`,
  ...put('q-media-aggiunta', '18', ['13', '16', '25']),
  sol: `La somma dei cinque numeri è 5 · 12 = 60; la somma dei sei numeri è 6 · 13 = 78. Il sesto numero è 78 − 60 = 18.`,
  trap: `13 scambia la nuova media con il numero aggiunto; 16 = 12 + 4 sposta la media di 1 solo per quattro posizioni invece che per sei; 25 = 13 + 12 somma le due medie. La media è la somma divisa per il numero dei valori: conviene lavorare sulle somme.`,
  patt: 'Media aritmetica' },

{ k: 'q-eta', diff: 'media', lang: 'it',
  stem: `Oggi la somma delle età di un padre e di suo figlio è 44 anni. Tra 6 anni l'età del padre sarà il triplo di quella del figlio. Quanti anni ha oggi il padre?`,
  ...put('q-eta', '36', ['42', '40', '33']),
  sol: `Siano f e s le età di oggi: f + s = 44 e f + 6 = 3(s + 6), quindi f = 3s + 12. Allora 4s + 12 = 44, s = 8 e f = 36. Verifica: tra 6 anni 42 e 14 anni, e 42 = 3 · 14.`,
  trap: `42 è l'età del padre tra 6 anni; 40 e 33 sono valori a occhio che non verificano la somma 44. Il triplo vale tra 6 anni, non oggi.`,
  patt: 'Algebra' },

{ k: 'q-anagrammi', diff: 'difficile', lang: 'it',
  stem: `Quanti anagrammi, anche privi di significato, ha la parola ANANAS in cui le tre A non siano mai vicine tra loro?`,
  ...put('q-anagrammi', '12', ['20', '36', '60']),
  sol: `Si dispongono prima le lettere N, N, S: 3!/2! = 3 modi. Tra e intorno a queste tre lettere ci sono 4 posti liberi: le tre A occupano tre posti diversi su 4, in C(4, 3) = 4 modi. In tutto 3 · 4 = 12 anagrammi.`,
  trap: `60 = 6!/(3! · 2!) sono tutti gli anagrammi, anche con le A vicine; 20 = C(6, 3) sceglie le posizioni delle A ma non esclude quelle adiacenti; 36 è un valore che non corrisponde a un conteggio.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-quaderni', diff: 'media', lang: 'it',
  stem: `Tre quaderni e due penne costano in tutto 13 €; due quaderni e tre penne costano in tutto 12 €. Quanto costano insieme un quaderno e una penna?`,
  ...put('q-quaderni', '5 €', ['4 €', '6 €', 'Non è determinabile']),
  sol: `Sommando le due relazioni: 5 quaderni + 5 penne = 25 €, quindi un quaderno più una penna costano 25 ÷ 5 = 5 €. (Infatti un quaderno costa 3 € e una penna 2 €.)`,
  trap: `«Non è determinabile» è l'esca: non serve trovare i due prezzi, basta sommare le due equazioni. 4 € e 6 € sono valori a occhio che non verificano la somma 25.`,
  patt: 'Algebra' },

{ k: 'q-eta-media', diff: 'media', lang: 'it',
  stem: `L'età media di un gruppo di 30 persone è 40 anni. Gli uomini del gruppo sono 10 e hanno un'età media di 46 anni. Qual è l'età media delle donne?`,
  ...put('q-eta-media', '37 anni', ['34 anni', '40 anni', '43 anni']),
  sol: `L'età complessiva del gruppo è 30 · 40 = 1.200 anni; quella degli uomini è 10 · 46 = 460. Alle 20 donne restano 1.200 − 460 = 740 anni: 740 ÷ 20 = 37 anni.`,
  trap: `34 anni = 2 · 40 − 46 suppone gruppi della stessa numerosità (40 al centro tra 34 e 46), ma le donne sono il doppio degli uomini e pesano di più: la media 40 è più vicina a 37; 40 anni è la media complessiva; 43 anni è un valore a occhio.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-difettosi', diff: 'difficile', lang: 'it',
  stem: `Un'azienda produce il 60% dei pezzi con la macchina A e il 40% con la macchina B. Il 2% dei pezzi della macchina A e il 5% dei pezzi della macchina B è difettoso. Si sceglie a caso un pezzo difettoso. Qual è la probabilità che provenga dalla macchina B?`,
  ...put('q-difettosi', fr(5, 8), [fr(2, 5), fr(1, 2), fr(3, 8)]),
  sol: `Su 1.000 pezzi, i difettosi della macchina A sono 600 · 2% = 12 e quelli della macchina B sono 400 · 5% = 20. I difettosi sono 32 e 20 vengono da B: ${fr(20, 32)} = ${fr(5, 8)}.`,
  trap: `2/5 è la quota di produzione della macchina B (il 40%), che ignora il diverso tasso di difetti; 3/8 è la probabilità che il pezzo difettoso venga da A; 1/2 confronta i due tassi senza pesarli con le quote di produzione.`,
  patt: 'Probabilità condizionata' },

{ k: 'q-capitale', diff: 'media', lang: 'it',
  stem: `Un capitale è investito al 10% annuo con interessi composti (alla fine di ogni anno gli interessi si sommano al capitale). Dopo 2 anni vale 6.050 €. Qual era il capitale iniziale?`,
  ...put('q-capitale', '5.000 €', ['5.040 €', '5.500 €', '4.840 €']),
  sol: `Dopo 2 anni il capitale è moltiplicato per 1,1 · 1,1 = 1,21. Il capitale iniziale è 6.050 ÷ 1,21 = 5.000 €.`,
  trap: `5.500 € = 6.050 ÷ 1,1 toglie un solo anno; circa 5.040 € = 6.050 ÷ 1,2 somma i due tassi invece di moltiplicare i fattori; 4.840 € = 6.050 · 0,8 è un valore a occhio.`,
  patt: 'Percentuali composte' },

{ k: 'q-sorpasso', diff: 'media', lang: 'it',
  stem: `In una gara di corsa un atleta supera il corridore che è al secondo posto. In quale posizione si trova subito dopo il sorpasso?`,
  ...put('q-sorpasso', 'Seconda', ['Prima', 'Terza', 'Non è determinabile']),
  sol: `Superando il secondo classificato si prende il suo posto: si diventa secondi. Il primo resta davanti e non è stato superato.`,
  trap: `«Prima» è l'esca (si pensa che superare significhi vincere); «Terza» scambia chi sorpassa con chi viene sorpassato. Il testo basta a stabilire la posizione.`,
  patt: 'Ragionamento laterale' },

{ k: 'q-operai', diff: 'difficile', lang: 'it',
  stem: `Otto operai, lavorando allo stesso ritmo, finirebbero un lavoro in 12 giorni. Dopo 4 giorni di lavoro, quattro operai lasciano il cantiere. Quanti giorni servono ancora, in tutto, per finire il lavoro?`,
  ...put('q-operai', '16 giorni', ['8 giorni', '12 giorni', '24 giorni']),
  sol: `Il lavoro vale 8 · 12 = 96 giornate di operaio; in 4 giorni ne sono state fatte 8 · 4 = 32, ne restano 64. Con 4 operai servono 64 ÷ 4 = 16 giorni.`,
  trap: `8 giorni sono i giorni che resterebbero con tutti e otto gli operai (12 − 4); 12 giorni suppone che la perdita di operai non cambi i tempi; 24 giorni raddoppia i giorni totali. Con metà degli operai il lavoro rimanente richiede il doppio del tempo: 8 · 2 = 16.`,
  patt: 'Lavoro e velocità' },

{ k: 'q-divisori', diff: 'media', lang: 'it',
  stem: `Quanti divisori positivi ha il numero 60 (compresi 1 e 60)?`,
  ...put('q-divisori', '12', ['10', '15', '8']),
  sol: `60 = 2² · 3 · 5. I divisori si ottengono scegliendo l'esponente di 2 (0, 1 o 2: 3 modi), quello di 3 (0 o 1: 2 modi) e quello di 5 (0 o 1: 2 modi): 3 · 2 · 2 = 12. Elenco: 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60.`,
  trap: `10 e 8 dimenticano alcuni divisori «intermedi» (come 12 o 15); 15 è la metà di 30 e non corrisponde a un conteggio. Il numero di divisori è il prodotto di (esponente + 1) per ogni fattore primo, non la somma.`,
  patt: 'Numeri e divisori' },

{ k: 'q-vasca', diff: 'media', lang: 'it',
  stem: `Un rubinetto riempie da solo una vasca in 6 ore. Lo scarico, da solo, la svuota in 12 ore. Con rubinetto e scarico aperti insieme, in quante ore si riempie la vasca vuota?`,
  ...put('q-vasca', '12 ore', ['9 ore', '18 ore', '4 ore']),
  sol: `In un'ora il rubinetto riempie 1/6 della vasca e lo scarico ne svuota 1/12: in totale 1/6 − 1/12 = 1/12. Servono quindi 12 ore.`,
  trap: `4 ore somma le due portate invece di sottrarle (1/6 + 1/12 = 1/4); 9 ore è la media semplice dei due tempi; 18 ore somma i due tempi. I tempi non si sommano né si mediano: si sommano le portate.`,
  patt: 'Lavoro e velocità' },

{ k: 'q-soluzione', diff: 'media', lang: 'it',
  stem: `Una soluzione di 6 litri contiene il 20% di sale. Quanta acqua pura bisogna aggiungere per ottenere una soluzione con il 15% di sale?`,
  ...put('q-soluzione', '2 litri', ['1,5 litri', '3 litri', '1 litro']),
  sol: `Il sale è il 20% di 6 litri, cioè 1,2 litri, e non cambia. Deve essere il 15% della nuova soluzione: 1,2 ÷ 0,15 = 8 litri. Si aggiungono 8 − 6 = 2 litri di acqua.`,
  trap: `3 litri è il 50% di 6 litri e 1,5 litri il 25%: valori a occhio; 1 litro è un altro valore a occhio. Il 15% si calcola sul volume finale (8 litri), non su quello iniziale.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-urna', diff: 'media', lang: 'it',
  stem: `Un'urna contiene 4 palline rosse e 6 palline blu. Si estraggono due palline una dopo l'altra, senza rimettere la prima nell'urna. Qual è la probabilità che le due palline abbiano lo stesso colore?`,
  ...put('q-urna', fr(7, 15), [fr(1, 2), fr(8, 15), fr(2, 5)]),
  sol: `Due rosse: ${fr(4, 10)} · ${fr(3, 9)} = ${fr(12, 90)}. Due blu: ${fr(6, 10)} · ${fr(5, 9)} = ${fr(30, 90)}. In tutto ${fr(42, 90)} = ${fr(7, 15)}.`,
  trap: `8/15 è la probabilità di due colori diversi (1 − 7/15); 1/2 è un valore a occhio; 2/5 è la probabilità che la prima pallina sia rossa. Senza reinserimento i denominatori scendono: 10 · 9, non 10 · 10.`,
  patt: 'Probabilità senza reinserimento' },

{ k: 'q-cubo', diff: 'media', lang: 'it',
  stem: `La superficie totale di un cubo misura 150 cm². Quanto misura il suo volume?`,
  ...put('q-cubo', '125 cm³', ['25 cm³', '75 cm³', '150 cm³']),
  sol: `Il cubo ha 6 facce uguali: ogni faccia misura 150 ÷ 6 = 25 cm², quindi lo spigolo è 5 cm e il volume è 5³ = 125 cm³.`,
  trap: `25 è l'area di una faccia, non il volume; 75 è la metà della superficie; 150 confonde superficie e volume. Per passare dall'area allo spigolo serve la radice quadrata di 25.`,
  patt: 'Geometria elementare' },

{ k: 'q-dispari', diff: 'media', lang: 'it',
  stem: `La somma di tre numeri dispari consecutivi è 75. Qual è il maggiore dei tre?`,
  ...put('q-dispari', '27', ['25', '29', '23']),
  sol: `Tre numeri dispari consecutivi hanno come media il numero centrale: 75 ÷ 3 = 25. I tre numeri sono 23, 25, 27 e il maggiore è 27.`,
  trap: `25 è il numero centrale; 23 è il minore; 29 somma 2 due volte al numero centrale. Consecutivi tra i dispari significa a distanza 2, non 1.`,
  patt: 'Algebra' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-bici', diff: 'media', lang: 'it',
  claim: `L'aumento dei noleggi nel 2025 è dovuto soprattutto alla riduzione della tariffa.`,
  passage: `Nel 2025 i noleggi del servizio di bike sharing di una città sono stati 1,3 milioni, il 30% in più rispetto al 2024. Nello stesso anno il comune ha ridotto la tariffa per mezz'ora di noleggio da 1 euro a 0,70 euro e ha aperto dodici chilometri di nuove piste ciclabili. La primavera è stata inoltre più asciutta della media. L'assessore alla mobilità ha dichiarato che l'amministrazione non dispone di analisi che permettano di attribuire l'aumento a una sola di queste novità, e ha annunciato per il 2026 un'indagine tra gli utenti. Il servizio conta 150 stazioni e 2.000 biciclette, tutte a pedalata muscolare.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «l'amministrazione non dispone di analisi che permettano di attribuire l'aumento a una sola di queste novità». Il brano elenca tre possibili concause (tariffa, piste, primavera asciutta) e non dà il peso di nessuna: l'affermazione non è né confermata né smentita.`,
  trap: `Dare per vera la causa più «ovvia» (la tariffa) o per falsa quella che il brano non cita come decisiva. Il brano non esclude la tariffa, e non dice che sia la causa principale: non ricavabile.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-margine', diff: 'media', lang: 'it',
  passage: `Nel commercio si chiama ricarico la differenza tra prezzo di vendita e costo d'acquisto, espressa in percentuale del costo; si chiama margine la stessa differenza espressa in percentuale del prezzo di vendita. Un negozio di abbigliamento acquista una giacca a 60 euro e la rivende a 80 euro. Il titolare nota che i fornitori parlano di ricarico, mentre il suo commercialista usa il margine, e che talvolta i due numeri vengono confusi. Il negozio vende in media 40 giacche al mese e ne ordina nuove ogni trimestre.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-margine', `Sulla giacca il ricarico è circa del 33% e il margine del 25%.`,
    [`Sulla giacca il ricarico è del 25% e il margine circa del 33%.`,
     `Sulla giacca ricarico e margine sono entrambi del 25%.`,
     `Sulla giacca il margine è del 20%, perché 20 euro su 100.`]),
  sol: `Frasi chiave: «ricarico … in percentuale del costo» e «margine … in percentuale del prezzo di vendita». La differenza è 80 − 60 = 20 euro: ricarico 20 ÷ 60 ≈ 33%, margine 20 ÷ 80 = 25%.`,
  trap: `Scambiare le due basi (costo e prezzo di vendita) porta a invertire i due valori; dividere 20 per 100 usa una base che nel brano non compare. Il ricarico ha base più piccola, quindi è sempre maggiore del margine.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-mensa', diff: 'difficile', lang: 'it',
  passage: `Il direttore di un'azienda propone di chiudere la mensa e di dare a ciascun dipendente un buono pasto da 8 euro per ogni giorno lavorato. La mensa costa all'azienda 12 euro per ogni pasto servito, e il direttore ne conclude che l'azienda risparmierà 4 euro a pasto. Attualmente usa la mensa il 60% dei dipendenti. L'azienda ha 250 dipendenti e la mensa è aperta cinque giorni a settimana. I sindacati hanno chiesto di discutere la proposta prima di una decisione definitiva.`,
  stem: `Su quale assunzione si basa principalmente la conclusione del direttore?`,
  ...put('v-mensa', `Che il numero di buoni pasto distribuiti sia uguale al numero di pasti oggi serviti in mensa.`,
    [`Che i dipendenti preferiscano pranzare fuori dall'azienda.`,
     `Che il costo dei pasti in mensa resti invariato nei prossimi anni.`,
     `Che i sindacati accettino la proposta senza modifiche.`]),
  sol: `Il direttore confronta 12 euro (costo di un pasto servito) con 8 euro (valore di un buono), ma i buoni andrebbero a tutti i 250 dipendenti, mentre oggi la mensa serve solo il 60% di loro. Il risparmio di 4 euro «a pasto» regge solo se i buoni sono tanti quanti i pasti oggi serviti.`,
  trap: `Le altre opzioni riguardano preferenze, costi futuri o consenso dei sindacati: non servono per calcolare il risparmio a pasto. La difficoltà sta nel notare che il confronto è tra un costo per pasto servito e un buono dato a tutti.`,
  patt: 'Assunzione implicita' },

{ k: 'v-parcheggio', diff: 'media', lang: 'it',
  passage: `Il titolare di un negozio di scarpe sostiene che l'apertura del nuovo parcheggio a pagamento davanti al negozio abbia fatto aumentare le sue vendite. Come prova cita il fatto che nei tre mesi successivi all'apertura gli incassi sono stati superiori del 15% a quelli dei tre mesi precedenti. Il parcheggio ha 80 posti e costa 1,50 euro l'ora. Il negozio occupa 120 metri quadrati e ha quattro dipendenti. Il titolare intende chiedere al comune di ampliare il parcheggio e ha già incontrato l'assessore al commercio.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la tesi del titolare?`,
  ...put('v-parcheggio', `Nei tre mesi successivi all'apertura sono iniziati i saldi, durante i quali tutti i negozi della zona hanno aumentato gli incassi.`,
    [`Il parcheggio è aperto anche la domenica.`,
     `I clienti pagano il parcheggio con un'applicazione sul telefono.`,
     `Il negozio vende anche borse e accessori.`]),
  sol: `La tesi attribuisce l'aumento (+15%) al parcheggio. Se nello stesso periodo sono iniziati i saldi e tutti i negozi hanno aumentato gli incassi, l'aumento ha una causa alternativa che non dipende dal parcheggio: la tesi si indebolisce.`,
  trap: `Orari del parcheggio, modalità di pagamento e assortimento del negozio non dicono nulla sulla causa dell'aumento. Quando due fatti coincidono nel tempo, conviene cercare che cos'altro è cambiato nello stesso periodo.`,
  patt: 'Cause alternative' },

{ k: 'v-famiglie', diff: 'media', lang: 'it',
  claim: `Meno di un sesto delle famiglie intervistate non ha alcun abbonamento.`,
  passage: `Un'indagine su 200 famiglie di un quartiere ha rilevato che 120 sono abbonate a un servizio di streaming e 80 sono abbonate a un quotidiano; 30 famiglie hanno entrambi gli abbonamenti. Tutte le famiglie intervistate hanno risposto a entrambe le domande. L'indagine è stata condotta da un istituto di ricerca nel mese di novembre, per conto di un'associazione di commercianti del quartiere, e i risultati sono stati presentati in una riunione pubblica. L'associazione intende usarli per decidere se aprire un'edicola digitale.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «120 sono abbonate a un servizio di streaming», «80 … a un quotidiano», «30 famiglie hanno entrambi». Le famiglie con almeno un abbonamento sono 120 + 80 − 30 = 170, quindi 30 su 200 (15%) non hanno alcun abbonamento. Un sesto di 200 è circa 33,3: 30 è meno, e l'affermazione è vera.`,
  trap: `Sommare 120 + 80 = 200 e concludere che nessuno è senza abbonamento: così si contano due volte le 30 famiglie con entrambi gli abbonamenti. Non è «non ricavabile»: i numeri bastano.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-ammortamento', diff: 'media', lang: 'it',
  passage: `L'ammortamento è la ripartizione del costo di un bene durevole sugli anni in cui il bene viene utilizzato. Con il metodo a quote costanti, l'ammortamento annuo si ottiene dividendo la differenza tra il costo del bene e il suo valore residuo (quello che si stima di ricavare alla fine della vita utile) per il numero di anni di vita utile. Una pasticceria acquista un forno per 14.000 euro, stima una vita utile di sei anni e un valore residuo di 2.000 euro. Il forno consuma energia elettrica per circa 3.000 euro l'anno.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-ammortamento', `L'ammortamento annuo del forno è di 2.000 euro.`,
    [`L'ammortamento annuo del forno è di circa 2.333 euro, cioè 14.000 divisi per 6 anni.`,
     `L'ammortamento annuo del forno è di circa 2.667 euro, cioè 16.000 divisi per 6 anni.`,
     `L'ammortamento annuo del forno è di 3.000 euro, pari al consumo di energia.`]),
  sol: `Frasi chiave: «la differenza tra il costo del bene e il suo valore residuo» divisa «per il numero di anni di vita utile». (14.000 − 2.000) ÷ 6 = 2.000 euro l'anno.`,
  trap: `Dividere 14.000 per 6 dimentica il valore residuo; sommarlo (16.000) lo tratta come un costo in più; l'energia elettrica è un costo di esercizio, non entra nell'ammortamento.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-bolletta', diff: 'difficile', lang: 'it',
  passage: `La bolletta del gas di una famiglia si compone di tre voci: il 50% è il costo della materia prima, il 30% il trasporto e il 20% le imposte. Il prossimo trimestre il costo della materia prima salirà del 20%, il trasporto resterà invariato e le imposte scenderanno del 10%. L'azienda fornitrice invierà la nuova bolletta entro il 15 del mese e offrirà la possibilità di pagare in tre rate. Il consumo di gas della famiglia non cambierà e la famiglia abita in un appartamento di 80 metri quadrati.`,
  stem: `In base al brano, di quanto varierà il totale della bolletta?`,
  ...put('v-bolletta', `Aumenterà dell'8%.`,
    [`Aumenterà del 10%.`, `Aumenterà di circa il 3%.`, `Aumenterà del 15%.`]),
  sol: `Frasi chiave: le quote (50%, 30%, 20%) e le variazioni (+20%, 0%, −10%). La variazione del totale è la media pesata con le quote: 0,5 · 20% + 0,3 · 0% + 0,2 · (−10%) = 10% − 2% = +8%.`,
  trap: `+10% considera solo la materia prima e dimentica le imposte; circa +3% è la media semplice delle tre variazioni ((20 + 0 − 10) ÷ 3 ≈ 3,3%), che ignora il peso di ciascuna voce; +15% è un valore a occhio.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'v-librerie', diff: 'media', lang: 'it',
  passage: `Uno studio ha rilevato che nei quartieri di una città con più librerie la percentuale di residenti laureati è più alta. Gli autori sostengono che la presenza di librerie contribuisca ad aumentare il livello di istruzione dei residenti. Lo studio ha preso in esame 60 quartieri e ha escluso quelli con meno di 5.000 abitanti. La ricerca è stata finanziata da un'associazione di librai e pubblicata in una rivista di sociologia urbana, che l'ha presentata come uno dei lavori più citati dell'anno.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la tesi degli autori?`,
  ...put('v-librerie', `Le librerie aprono soprattutto nei quartieri in cui risiedono già molte persone laureate.`,
    [`Nei quartieri con molte librerie i residenti spendono di più per l'acquisto di libri.`,
     `Le librerie dei quartieri esaminati hanno in media tre dipendenti.`,
     `Alcuni quartieri esclusi dallo studio hanno una sola libreria.`]),
  sol: `La tesi dice: librerie → più laureati. Se le librerie aprono dove vivono già molti laureati, la relazione può essere inversa (causalità inversa): sono i laureati ad attrarre le librerie, e la tesi si indebolisce.`,
  trap: `La spesa in libri, il numero di dipendenti e i quartieri esclusi non riguardano la direzione del nesso causale. Una correlazione tra due fattori può dipendere dal fatto che il secondo causi il primo.`,
  patt: 'Cause alternative' },

{ k: 'v-palestra', diff: 'media', lang: 'it',
  claim: `I soci che frequentano almeno un corso di gruppo sono meno di 150.`,
  passage: `Una palestra ha 600 soci. Il 40% dei soci usa esclusivamente la sala pesi. Tra i restanti soci, esattamente la metà frequenta almeno un corso di gruppo, mentre gli altri utilizzano soltanto la piscina. La palestra è aperta dalle 7 alle 22 nei giorni feriali e dalle 9 alle 18 nel fine settimana. Per il prossimo anno la direzione prevede di aumentare del 5% la quota di iscrizione e di aprire una nuova sala per lo yoga. L'ultima ristrutturazione della piscina è avvenuta nel 2023.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «600 soci», «Il 40% … usa esclusivamente la sala pesi» e «esattamente la metà frequenta almeno un corso di gruppo». I soci della sala pesi sono 240; i restanti 360, e la metà sono 180: più di 150. L'affermazione è contraddetta.`,
  trap: `Calcolare la metà di 600 o di 240 invece che dei restanti 360, oppure fermarsi a 360 ÷ 2 = 180 e confrontarlo con 150 nel verso sbagliato. Non è «non ricavabile»: i numeri bastano.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-ztl', diff: 'media', lang: 'it',
  passage: `Il comune di Rivalta vuole introdurre una zona a traffico limitato a pagamento nel centro storico per ridurre il traffico. A sostegno della proposta, l'assessore cita il caso della città di Montebello, dove, dopo l'introduzione di una misura analoga, il traffico nel centro è diminuito del 20%. Rivalta ha 60.000 abitanti e il suo centro storico ha circa 90 negozi. Il pedaggio previsto è di 5 euro al giorno per i non residenti. L'assessore ritiene che gli incassi possano finanziare nuove piste ciclabili.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la proposta dell'assessore?`,
  ...put('v-ztl', `Montebello è simile a Rivalta per dimensioni e struttura urbana e, nello stesso periodo, non ha adottato altre misure sul traffico.`,
    [`A Montebello il pedaggio era di 3 euro al giorno.`,
     `A Montebello gli incassi sono stati usati per costruire piste ciclabili.`,
     `Rivalta ha più negozi nel centro storico di Montebello.`]),
  sol: `L'argomento è un confronto con un caso (Montebello). Rafforza se il caso è davvero paragonabile e se la riduzione del traffico è attribuibile soltanto alla misura: città simile e nessun'altra misura nello stesso periodo.`,
  trap: `L'importo del pedaggio, l'uso degli incassi e il numero dei negozi non dicono se il calo del traffico a Montebello dipenda dalla misura né se Rivalta possa aspettarsi lo stesso effetto.`,
  patt: 'Analogia' },

{ k: 'v-spedizione', diff: 'difficile', lang: 'it',
  passage: `Le tariffe di spedizione di un negozio online sono le seguenti. Per un pacco fino a 2 kg la spedizione costa 5 euro. Per ogni chilogrammo, o frazione di chilogrammo, oltre i primi 2 si aggiungono 1,50 euro. La spedizione è gratuita se l'importo dell'ordine, al netto di eventuali sconti, supera i 60 euro. I clienti iscritti al programma fedeltà ottengono uno sconto del 10% sull'importo dell'ordine, ma non sulla spedizione. Gli ordini sono evasi entro due giorni lavorativi e i resi sono gratuiti per trenta giorni.`,
  stem: `Una cliente iscritta al programma fedeltà ordina articoli per 64 euro, in un pacco di 4,3 kg. Quanto paga in totale?`,
  ...put('v-spedizione', `67,10 euro`,
    [`57,60 euro`, `65,60 euro`, `73,50 euro`]),
  sol: `Frasi chiave: «al netto di eventuali sconti, supera i 60 euro» e «ogni chilogrammo, o frazione di chilogrammo». Con lo sconto l'ordine vale 64 · 0,9 = 57,60 euro, non supera 60: la spedizione si paga. Oltre i primi 2 kg ci sono 2,3 kg, cioè 3 kg o frazioni: 5 + 3 · 1,50 = 9,50 euro. Totale 57,60 + 9,50 = 67,10 euro.`,
  trap: `57,60 euro assume la spedizione gratuita (guardando i 64 euro prima dello sconto); 65,60 euro conta solo 2 kg oltre i primi 2 e ignora la frazione; 73,50 euro dimentica lo sconto del 10%.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-rifiuti', diff: 'media', lang: 'it',
  claim: `Una famiglia con quattro figli minorenni e ISEE di 12.000 euro paga la tassa sui rifiuti con una riduzione del 20%.`,
  passage: `Il regolamento comunale sulla tassa dei rifiuti prevede una riduzione del 20% per le famiglie con ISEE inferiore a 15.000 euro e l'esenzione totale per le famiglie con più di tre figli minorenni. Le due agevolazioni non si sommano: a ciascuna famiglia si applica soltanto quella più favorevole. Le richieste vanno presentate allo sportello entro il 31 marzo, allegando l'attestazione ISEE e lo stato di famiglia. Il comune stima che nel 2025 le agevolazioni riguarderanno circa 1.800 famiglie su 12.000.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «esenzione totale per le famiglie con più di tre figli minorenni» e «si applica soltanto quella più favorevole». La famiglia ha quattro figli e ha diritto a entrambe le agevolazioni: si applica la più favorevole, cioè l'esenzione totale, non la riduzione del 20%. L'affermazione è contraddetta.`,
  trap: `Pensare che si applichino entrambe (le agevolazioni «non si sommano») o scegliere la riduzione perché l'ISEE è sotto soglia. Non è «non ricavabile»: il brano dice quale delle due si applica.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-fattore', diff: 'media', lang: 'it',
  passage: `Un istituto di lingue sostiene che il suo nuovo corso intensivo migliora il livello degli studenti. A sostegno cita i risultati di un test d'ingresso e di uno finale: il punteggio medio degli iscritti è passato da 60 a 72 su 100. Il corso dura dieci settimane e costa 400 euro. Gli iscritti sono stati 90, di cui due terzi donne. L'istituto afferma che i risultati dimostrano l'efficacia del corso e li utilizzerà nella campagna pubblicitaria che partirà il mese prossimo.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza della conclusione dell'istituto?`,
  ...put('v-fattore', `Il fatto che il test finale fosse più facile del test d'ingresso.`,
    [`Il costo del corso rispetto a quello dei concorrenti.`,
     `La quota di donne sul totale degli iscritti.`,
     `Il giorno della settimana in cui si tengono le lezioni.`]),
  sol: `L'istituto attribuisce al corso l'aumento da 60 a 72. Se il test finale è più facile di quello d'ingresso, l'aumento può dipendere dalla diversa difficoltà dei test e non dall'apprendimento: è il dato che verifica l'attribuzione.`,
  trap: `Costo, composizione per sesso e giorni delle lezioni non dicono se il miglioramento misurato sia reale. Prima di attribuire un miglioramento a una causa conviene chiedersi se i due test siano confrontabili.`,
  patt: 'Cause alternative' },

{ k: 'v-pendolari', diff: 'media', lang: 'it',
  passage: `In una città di 100.000 abitanti, un'indagine sugli spostamenti casa-lavoro ha rilevato che il 40% dei pendolari usa l'auto, il 30% i mezzi pubblici e il resto va in bicicletta o a piedi. Rispetto a cinque anni fa, la quota dell'auto è scesa di 5 punti percentuali, mentre quella dei mezzi pubblici è rimasta invariata. I pendolari sono in tutto 30.000. Il comune attribuisce il calo dell'auto soprattutto all'estensione della zona a traffico limitato, ma riconosce di non aver verificato il ruolo di altri fattori, come il prezzo dei carburanti.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put('v-pendolari', `Cinque anni fa il 35% dei pendolari usava l'auto.`,
    [`Oggi usano l'auto 12.000 pendolari.`,
     `I pendolari che vanno in bicicletta o a piedi sono 9.000.`,
     `Il comune non ha verificato se il prezzo dei carburanti abbia contribuito al calo dell'auto.`]),
  sol: `Frasi chiave: «il 40% dei pendolari usa l'auto» e «la quota dell'auto è scesa di 5 punti percentuali». Cinque anni fa la quota era 40% + 5 = 45%, non 35%: l'affermazione NON è corretta. Le altre tre sono nel brano: 40% di 30.000 = 12.000; il resto è 100 − 40 − 30 = 30%, cioè 9.000; la verifica sugli altri fattori manca.`,
  trap: `Con la domanda «NON corretta» le altre tre sono vere. L'errore da evitare è sottrarre 5 punti invece di aggiungerli: la quota è scesa, quindi in passato era più alta.`,
  patt: 'Punti percentuali' },

{ k: 'v-delta', diff: 'media', lang: 'it',
  claim: `Il fatturato per dipendente di Delta è aumentato nel 2025 rispetto al 2024.`,
  passage: `La società Delta ha annunciato che nel 2025 il suo fatturato è stato di 120 milioni di euro, il 10% in più rispetto al 2024. Nel 2025 la società contava 600 dipendenti, distribuiti in quattro stabilimenti. Gli investimenti in nuovi macchinari sono stati pari a 8 milioni, finanziati in parte con un prestito bancario. L'amministratore delegato ha dichiarato che l'andamento dell'anno è stato positivo e che nel 2026 la società intende aprire un quinto stabilimento nel Nord Italia, vicino a uno dei principali clienti.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «fatturato … il 10% in più rispetto al 2024» e «Nel 2025 la società contava 600 dipendenti». Il fatturato 2025 per dipendente è 200.000 euro, ma il brano non dà il numero dei dipendenti nel 2024: se fossero aumentati più del 10% il rapporto sarebbe calato. Non ricavabile.`,
  trap: `Concludere «vero» perché il fatturato è cresciuto: il fatturato per dipendente è un rapporto e dipende anche da quanti dipendenti c'erano prima. Non è «falsa»: nulla nel brano la contraddice.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-spread', diff: 'media', lang: 'it',
  passage: `Il tasso di un mutuo a tasso variabile è dato dalla somma di un parametro di mercato, l'Euribor, e di un margine fisso della banca chiamato spread. Un cliente ha un mutuo con Euribor al 3% e spread dell'1,5%, quindi paga un tasso del 4,5%. Se l'Euribor sale di un punto percentuale, il tasso del mutuo sale in egual misura. Il mutuo ha durata di vent'anni e il capitale iniziale è di 150.000 euro. Il cliente sta valutando di passare a un tasso fisso.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-spread', `Se l'Euribor sale di un punto percentuale, il tasso del mutuo passa dal 4,5% al 5,5%, cioè aumenta di circa il 22% in termini relativi.`,
    [`Se l'Euribor sale di un punto percentuale, il tasso del mutuo passa dal 4,5% al 5,5%, cioè aumenta del 33% come l'Euribor.`,
     `Se l'Euribor sale di un punto percentuale, anche lo spread sale in egual misura e il tasso passa al 6%.`,
     `Se l'Euribor sale di un punto percentuale, il tasso del mutuo passa dal 4,5% al 4,6%.`]),
  sol: `Frasi chiave: «Euribor al 3% e spread dell'1,5%, quindi paga un tasso del 4,5%» e «il tasso del mutuo sale in egual misura». Il tasso passa dal 4,5% al 5,5%: l'aumento è di 1 punto, cioè 1 ÷ 4,5 ≈ 22% in termini relativi.`,
  trap: `Il 33% è l'aumento relativo dell'Euribor (da 3% a 4%), non del tasso del mutuo, che ha anche lo spread; lo spread è «fisso», quindi non sale; 4,6% scambia i punti percentuali con i decimi.`,
  patt: 'Rapporti vs valori assoluti' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-prodotto', diff: 'media', lang: 'it', ds: true,
  stem: ds('Il prodotto di due numeri interi positivi x e y è maggiore di 50?',
    'Entrambi i numeri sono maggiori o uguali a 8.',
    'La somma dei due numeri è 20.'),
  ...dsq('DABC', 'A'),
  sol: `(1): x · y ≥ 8 · 8 = 64 > 50, quindi la risposta è sempre «sì». (2): con x + y = 20 si può avere 10 · 10 = 100 (sì) oppure 1 · 19 = 19 (no): non basta. La (1) basta, la (2) no.`,
  trap: `Pensare che la (1) non basti perché non dà i valori di x e y: per una domanda sì/no basta un limite (prodotto ≥ 64). Con la (2) si è tentati di fissare x = y = 10, ma la somma 20 non impone numeri uguali.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-bilancio', diff: 'difficile', lang: 'it', asset: gBilancio(),
  stem: `Il prossimo anno la spesa per il marketing aumenterà del 40%, quella per gli stipendi diminuirà del 10% e le altre voci resteranno invariate. Di quanto varierà il costo totale annuo?`,
  ...put('d-bilancio', 'Aumenterà dell\'1,5%', ['Aumenterà del 30%', 'Aumenterà del 7,5%', 'Diminuirà dell\'1,5%']),
  sol: `La variazione del totale è la media pesata con le quote: 15% · (+40%) = +6 punti e 45% · (−10%) = −4,5 punti. In tutto +6 − 4,5 = +1,5%. (Sul totale di 200.000 euro: +12.000 − 9.000 = +3.000 euro, cioè +1,5%.)`,
  trap: `Aumenterà del 30% somma le due variazioni (+40% − 10%) senza pesarle; aumenterà del 7,5% è la media semplice sulle quattro voci ((40 − 10) ÷ 4); diminuirà dell'1,5% scambia i segni dei due contributi.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-preferenze', diff: 'media', lang: 'it', asset: tPreferenze(),
  stem: `Quale percentuale di tutti gli intervistati preferisce il prodotto X?`,
  ...put('d-preferenze', '38%', ['40%', '36%', '33%']),
  sol: `Chi preferisce X: 60% di 200 = 120; 40% di 500 = 200; 20% di 300 = 60. In tutto 380 su 1.000 intervistati, cioè il 38%.`,
  trap: `Il 40% è la media semplice dei tre valori percentuali (60, 40 e 20), che non tiene conto del diverso numero di intervistati per fascia. Le percentuali di riga non si sommano né si mediano senza i pesi.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-gol', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `In una stagione una squadra ha giocato 10 partite, segnando in media 2 gol a partita.`,
    `In ogni partita la squadra ha segnato almeno un gol.`,
    `In nessuna partita la squadra ha segnato più di 4 gol.`
  ], [
    `A. La squadra ha segnato in tutto 20 gol.`,
    `B. In almeno una partita la squadra ha segnato più di 2 gol.`,
    `C. In una partita la squadra ha segnato 5 gol.`,
    `D. In una partita la squadra non ha segnato.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Sia la B sia la C', 'Solo la D', 'Sia la C sia la D', 'Sia la A sia la B'], ans: 2,
  sol: `La media di 2 gol su 10 partite dà 20 gol in tutto (A vera). Nessuna partita ha più di 4 gol, quindi C è falsa; ogni partita ha almeno un gol, quindi D è falsa. B non è sicura: se la squadra avesse segnato 2 gol in ogni partita, nessuna avrebbe più di 2 gol.`,
  trap: `La B è tentante («la media è 2, quindi qualche partita deve superare 2»): ma se tutte le partite fossero da 2 gol non sarebbe vero. Con la consegna «false» non va indicata la A, che è vera.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-convegno', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('A un convegno ci sono 100 partecipanti, di cui 60 donne. Quante donne parlano inglese?',
    'In tutto 70 partecipanti parlano inglese.',
    'Il 40% degli uomini parla inglese.'),
  ...dsq('BDCA', 'B'),
  sol: `Gli uomini sono 100 − 60 = 40. (1): 70 persone parlano inglese, ma non si sa quanti siano uomini. (2): gli uomini che parlano inglese sono il 40% di 40 = 16, ma nulla si dice sulle donne. Insieme: le donne che parlano inglese sono 70 − 16 = 54.`,
  trap: `Pensare che la (1) basti perché «70 parlano inglese» (le donne possono essere da 30 a 60) o che basti la (2) perché il 40% sembra riferirsi ai partecipanti: è riferito ai soli uomini. Serve la tabella 2×2 completa.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-salari', diff: 'media', lang: 'it', asset: gSalari(),
  stem: `In quale anno il potere d'acquisto dei salari, cioè il rapporto tra indice dei salari e indice dei prezzi, è stato più alto?`,
  ...put('d-salari', '2022', ['2021', '2023', '2025']),
  sol: `Rapporto salari ÷ prezzi: 2021: 100/100 = 1; 2022: 106/104 ≈ 1,019; 2023: 112/110 ≈ 1,018; 2024: 116/116 = 1; 2025: 120/121 ≈ 0,992. Il valore più alto è quello del 2022 (2 punti su 104 contro 2 su 110).`,
  trap: `Guardare solo il livello dei salari (il più alto è nel 2025) o il solo vantaggio in punti (2 in entrambi gli anni 2022 e 2023): conta il rapporto, e a parità di differenza vince l'indice dei prezzi più basso.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-rettangolo', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un rettangolo ha il perimetro di 40 cm. Qual è la sua area?',
    'Un lato misura 8 cm.',
    'I due lati stanno nel rapporto 2 : 3.'),
  ...dsq('BADC', 'C'),
  sol: `La somma di due lati adiacenti è 40 ÷ 2 = 20 cm. (1): l'altro lato è 20 − 8 = 12 cm e l'area è 8 · 12 = 96 cm². (2): i lati sono 2k e 3k con 5k = 20, quindi 8 e 12 cm, area 96 cm². Ciascuna affermazione, da sola, basta.`,
  trap: `Credere che con il solo perimetro i lati restino indeterminati e che servano entrambe le affermazioni: ciascuna dà una seconda relazione tra i lati che, insieme al perimetro, li determina. Le due affermazioni sono coerenti (8 e 12 cm).`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-ricavi', diff: 'media', lang: 'it', asset: tRicavi(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-ricavi', 'Nessuna delle altre risposte è corretta', [
    `I ricavi del negozio A sono aumentati del 10% ogni anno.`,
    `I ricavi del negozio B nel 2025 sono inferiori di almeno il 20% a quelli del 2023.`,
    `Il totale dei ricavi dei tre negozi è aumentato tra il 2023 e il 2025.`]),
  sol: `A: 130 ÷ 120 − 1 ≈ 8,3% (e 143 ÷ 130 − 1 = 10%): non è il 10% ogni anno. B: 170 ÷ 210 − 1 ≈ −19%, meno del 20%. Totali: 2023 = 120 + 210 + 85 = 415; 2025 = 143 + 170 + 95 = 408, quindi il totale è diminuito. Le tre affermazioni sono false.`,
  trap: `«Ogni anno» è smentito da un solo anno (+8,3%); il −19% sembra un −20%; i ricavi di A e C crescono, ma il calo di B (−40) è maggiore dei loro aumenti (+23 e +10), e questo si vede solo sommando.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-logica', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Tutti i soci di un club che giocano a tennis hanno più di 30 anni.`,
    `Alcuni soci del club con più di 30 anni non giocano a tennis.`,
    `Giulia è una socia del club e ha 25 anni.`
  ], [
    `A. Qualche socio del club non gioca a tennis.`,
    `B. Nessun socio con più di 30 anni gioca a tennis.`,
    `C. Tutti i soci con più di 30 anni giocano a tennis.`,
    `D. Giulia non gioca a tennis.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Sia la B sia la D', 'Sia la A sia la C', 'Solo la D', 'Sia la A sia la D'], ans: 3,
  sol: `Giulia ha 25 anni e chi gioca a tennis ha più di 30 anni: Giulia non gioca a tennis (D vera). Allora qualche socio non gioca a tennis (A vera, e lo dice anche il secondo dato). C è falsa: il secondo dato dice che alcuni soci con più di 30 anni non giocano. B non è sicura: il primo dato non dice che qualcuno con più di 30 anni giochi a tennis, ma non lo esclude.`,
  trap: `La B è tentante perché il secondo dato parla di soci che non giocano, ma «alcuni non giocano» non vuol dire «nessuno gioca». La D richiede di leggere l'implicazione «tennis → più di 30 anni» al contrario (chi ha 25 anni non gioca).`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-straordinari', diff: 'media', lang: 'it', asset: gStraordinari(),
  stem: `Qual è la paga media oraria dello straordinario, pesata sulle ore svolte in tutti i reparti?`,
  ...put('d-straordinari', '26 euro', ['25 euro', '24 euro', '27 euro']),
  sol: `Ore: 30 + 50 = 80 nei reparti A e B (a 20 euro) e 20 + 100 = 120 nei reparti C e D (a 30 euro). Spesa: 80 · 20 + 120 · 30 = 1.600 + 3.600 = 5.200 euro su 200 ore: 5.200 ÷ 200 = 26 euro l'ora.`,
  trap: `25 euro è la media semplice delle due paghe (20 e 30): ma il 60% delle ore è pagato 30 euro, quindi la media pesata è più vicina a 30. 24 e 27 euro sono valori a occhio.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-cassa', diff: 'media', lang: 'it', ds: true,
  stem: ds('Una cassa contiene soltanto penne da 2 euro e quaderni da 5 euro, almeno una penna e almeno un quaderno. Qual è il valore complessivo del contenuto?',
    'Gli oggetti sono 12 in tutto.',
    'I quaderni sono meno delle penne.'),
  ...dsq('CADB', 'D'),
  sol: `Se i quaderni sono q, le penne sono 12 − q e il valore è 2(12 − q) + 5q = 24 + 3q. (1): q può essere qualsiasi numero da 1 a 11. (2): q < 12 − q, cioè q ≤ 5. Anche insieme q può valere 1, 2, 3, 4 o 5, e il valore cambia (27, 30, 33, 36, 39 euro).`,
  trap: `Pensare che il vincolo «meno quaderni che penne» insieme ai 12 oggetti fissi la composizione: lascia cinque casi possibili. Insieme le affermazioni sono coerenti ma l'intervallo di soluzioni non si riduce a un solo valore.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-spedizioni', diff: 'difficile', lang: 'it', asset: tSpedizioni(),
  stem: `Tra le spedizioni verso l'Europa, quale quota è stata effettuata dal Corriere B?`,
  ...put('d-spedizioni', 'un terzo', ['il 40%', 'circa il 12%', 'il 20%']),
  sol: `Il dato mancante si ricava dal totale di riga: Corriere B verso l'Europa = 50 − 25 − 5 = 20 (e la colonna dà lo stesso: 60 − 30 − 10 = 20). Le spedizioni verso l'Europa sono 60 in tutto: 20 ÷ 60 = un terzo.`,
  trap: `Il 40% è la quota dell'Europa dentro le spedizioni del Corriere B (20 su 50): la base è sbagliata; circa il 12% divide per il totale delle spedizioni (20 su 170); il 20% è il numero di spedizioni scambiato per una percentuale.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-rapporto', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `In un'azienda il rapporto tra dipendenti a tempo pieno e dipendenti part-time è 3 : 2.`,
    `I dipendenti sono più di 40 e meno di 60.`
  ], [
    `A. Il numero totale dei dipendenti è un multiplo di 5.`,
    `B. I dipendenti part-time sono 20.`,
    `C. I dipendenti a tempo pieno sono più della metà del totale.`,
    `D. I dipendenti a tempo pieno sono il doppio dei part-time.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Sia la B sia la D', 'Solo la C', 'Sia la A sia la D', 'Sia la A sia la C'], ans: 3,
  sol: `Se i part-time sono 2k, i dipendenti a tempo pieno sono 3k e il totale è 5k, con 40 < 5k < 60: k vale 9, 10 o 11 e il totale 45, 50 o 55. A vera (il totale è 5k). C vera (3k su 5k è il 60%). B non è sicura: i part-time sono 18, 20 o 22. D è falsa: 3k non è il doppio di 2k.`,
  trap: `La B è vera solo per k = 10: un rapporto fissa le proporzioni, non i valori assoluti. La D confonde 3 : 2 con 2 : 1.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-lucia', diff: 'media', lang: 'it', ds: true,
  stem: ds('Lucia ha 3 anni più di Marco. Quanti anni ha Lucia?',
    'La somma delle loro età è 31.',
    'Il prodotto delle loro età è 238.'),
  ...dsq('CBDA', 'C'),
  sol: `Se Lucia ha L anni, Marco ne ha L − 3. (1): L + L − 3 = 31, quindi L = 17. (2): L(L − 3) = 238, cioè L² − 3L − 238 = 0, che ha come unica soluzione positiva L = 17 (17 · 14 = 238). Ciascuna affermazione, da sola, basta.`,
  trap: `Pensare che la (2) non basti perché è un'equazione di secondo grado, che di solito ha due soluzioni: la seconda soluzione (−14) è negativa e un'età non può esserlo. Le due affermazioni sono coerenti (17 e 14) e ciascuna basta da sola.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-variazione', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Una grandezza aumenta del 20% e poi diminuisce del x%. Il valore finale è inferiore a quello iniziale?',
    'x è maggiore o uguale a 20.',
    'x è un multiplo di 5.'),
  ...dsq('CDBA', 'A'),
  sol: `Il valore finale è 1,2 · (1 − x/100) volte l'iniziale, ed è inferiore se x > 16,67 circa. (1): x ≥ 20 supera 16,67, quindi la risposta è sempre «sì». (2): x = 5 dà «no», x = 25 dà «sì». La (1) basta, la (2) no.`,
  trap: `Pensare che la (1) non basti perché non dà il valore esatto di x: per una domanda sì/no basta un limite. Un aumento del 20% seguito da un calo del 20% non riporta al valore di partenza: il calo si applica a una base maggiore (1,2 · 0,8 = 0,96).`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-animali', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Anna, Bruno, Carla e Dario hanno ciascuno un animale diverso tra cane, gatto, pesce e uccello.`,
    `Anna non ha né il cane né il gatto.`,
    `Bruno ha il gatto.`,
    `Dario non ha il cane.`
  ], [
    `A. Carla ha il cane.`,
    `B. Dario ha il gatto.`,
    `C. Anna ha il pesce.`,
    `D. Carla ha l'uccello.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Sia la A sia la C', 'Sia la B sia la D', 'Solo la B', 'Sia la C sia la D'], ans: 1,
  sol: `Bruno ha il gatto. Il cane non può averlo né Anna, né Bruno, né Dario: lo ha Carla (A vera, D falsa). Anna e Dario hanno il pesce e l'uccello in uno dei due modi: C non è sicura. Il gatto è di Bruno, quindi B è falsa.`,
  trap: `Per esclusione il cane spetta a Carla, anche se nessun dato la nomina. La C è un'esca: Anna ha il pesce oppure l'uccello, e il testo non decide. Con la consegna «false» non va indicata la A, che è vera.`,
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
  id: '28',
  title: 'Mock 28',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'NOTA',
  questions: QUESTIONS,
  data: DATA
};
});
