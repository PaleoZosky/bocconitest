/* =======================================================================
   Mock 27 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
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
   la domanda per gli script di verifica (tools/check_math_27.py).
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
  'q-libro': 0,
  'q-pittura': 2,
  'q-ricarico': 0,
  'q-salita': 2,
  'q-batteri': 3,
  'q-anagrammi': 2,
  'q-esami': 1,
  'q-magliette': 0,
  'q-resti': 3,
  'q-amiche': 2,
  'q-parttime': 3,
  'q-figli': 3,
  'q-cena': 3,
  'q-multipli': 2,
  'q-saldi': 1,
  'q-pecore': 2,
  'q-cifre': 3,
  'q-coro': 2,
  'v-salari': 3,
  'v-app': 0,
  'v-gruppo': 2,
  'v-orario': 3,
  'v-colonnine': 2,
  'v-cambio': 0,
  'v-volontariato': 1,
  'v-laurea': 3,
  'v-ztl': 0,
  'v-vendite': 1,
  'v-mutuo': 3,
  'd-negozi': 0,
  'd-parco': 3,
  'd-spese': 0,
  'd-ordini': 1,
  'd-fabbriche': 1,
  'd-costi': 3
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
  /* ingressi (migliaia) a un parco per mese; prezzo del biglietto e quota di ingressi gratuiti in luglio e agosto */
  parco: { mesi: ['Mag', 'Giu', 'Lug', 'Ago'], ingressi: [20, 30, 50, 60], prezzo: 8, gratisPct: 25 },
  /* spese annue di un'azienda: quote (%) e totale (euro); «Altre voci» = energia : pulizie : assicurazioni = 3 : 2 : 1 */
  spese: { voci: [['Personale', 45], ['Affitto', 25], ['Altre voci', 30]], totale: 240000, rapporto: [3, 2, 1] },
  /* ordini ricevuti ed evasi in quattro mesi */
  ordini: { mesi: ['Gen', 'Feb', 'Mar', 'Apr'], ricevuti: [400, 500, 600, 800], evasi: [360, 350, 540, 640] },
  /* vendite totali (migliaia di euro) e quota online (%) di quattro negozi */
  negozi: { nomi: ['Alba', 'Biella', 'Como', 'Asti'], vendite: [200, 500, 400, 300], online: [60, 30, 45, 50] },
  /* produzione (migliaia di pezzi) di tre fabbriche */
  fabbriche: { anni: [2022, 2023, 2024, 2025], f1: [40, 46, 52, 56], f2: [55, 58, 61, 68], f3: [80, 78, 85, 82] },
  /* costi mensili (migliaia di euro) per area; cella nascosta (null) da ricostruire con i totali */
  costi: { aree: ['Nord', 'Sud', 'Centro'], gen: [40, 30, 20], feb: [50, null, 30], mar: [60, 40, 20], totRiga: [150, 110, 70], totCol: [90, 120, 120, 330] }
};

/* ======================= tabelle e grafici ======================= */
function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

function gParco() {
  const D = DATA.parco;
  return `<figure class="fig"><figcaption>Ingressi a un parco naturale per mese, in migliaia</figcaption>` + C.bars({
    labels: D.mesi, series: [{ name: 'Ingressi', values: D.ingressi }], max: 70, legend: false,
    aria: 'Istogramma degli ingressi in migliaia: ' + D.mesi.map((m, i) => m + ' ' + D.ingressi[i]).join(', ') + '.'
  }) + `<p class="fig-note">Il biglietto costa ${D.prezzo} euro. A luglio e ad agosto il ${D.gratisPct}% degli ingressi è gratuito; negli altri mesi tutti pagano.</p></figure>`;
}

function gSpese() {
  const D = DATA.spese;
  return `<figure class="fig"><figcaption>Spese annue di un'azienda</figcaption>` + C.pie({
    data: D.voci, title: 'Quota sul totale',
    aria: 'Torta delle spese: ' + D.voci.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `<p class="fig-note">Le spese totali sono di ${D.totale.toLocaleString('it-IT')} euro l'anno. Le altre voci sono energia, pulizie e assicurazioni, nel rapporto ${D.rapporto.join(' : ')}.</p></figure>`;
}

function gOrdini() {
  const D = DATA.ordini;
  return `<figure class="fig"><figcaption>Ordini ricevuti ed evasi da un magazzino, per mese</figcaption>` + C.bars({
    labels: D.mesi, series: [{ name: 'Ricevuti', values: D.ricevuti }, { name: 'Evasi', values: D.evasi }], max: 900, legend: true,
    aria: 'Istogramma degli ordini: ricevuti ' + D.mesi.map((m, i) => m + ' ' + D.ricevuti[i]).join(', ') + '; evasi ' + D.mesi.map((m, i) => m + ' ' + D.evasi[i]).join(', ') + '.'
  }) + `</figure>`;
}

function tNegozi() {
  const D = DATA.negozi;
  return C.table({
    caption: 'Vendite di quattro negozi; la parte non online si vende in negozio',
    head: ['Negozio', 'Vendite totali (migliaia di euro)', 'Quota online'],
    rows: D.nomi.map((n, i) => [n, D.vendite[i], D.online[i] + '%'])
  });
}

function tFabbriche() {
  const D = DATA.fabbriche;
  return C.table({
    caption: 'Produzione di tre fabbriche, in migliaia di pezzi',
    head: ['Anno', 'Fabbrica 1', 'Fabbrica 2', 'Fabbrica 3'],
    rows: D.anni.map((a, i) => [a, D.f1[i], D.f2[i], D.f3[i]])
  });
}

function tCosti() {
  const D = DATA.costi, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Costi mensili di tre aree di un\'azienda, in migliaia di euro',
    head: ['Area', 'Gennaio', 'Febbraio', 'Marzo', 'Totale'],
    rows: D.aree.map((s, i) => [s, D.gen[i], c(D.feb[i]), D.mar[i], D.totRiga[i]]),
    foot: ['Totale'].concat(D.totCol)
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato.</p>`;
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-libro', diff: 'media', lang: 'it',
  stem: `In una libreria un volume viene scontato prima del 30% e poi, alla cassa, di un ulteriore 10% sul prezzo già scontato. Il cliente paga 18,90 €. Qual era il prezzo di listino?`,
  ...put('q-libro', '30,00 €', ['31,50 €', '27,00 €', '26,46 €']),
  sol: `I due sconti moltiplicano il prezzo per 0,7 · 0,9 = 0,63. Quindi il listino è 18,90 ÷ 0,63 = 30 €.`,
  trap: `31,50 € = 18,90 ÷ 0,6 somma i due sconti (30% + 10% = 40%); 27,00 € = 18,90 ÷ 0,7 considera solo il primo sconto; 26,46 € = 18,90 · 1,4 «ripristina» lo sconto invece di dividere.`,
  patt: 'Percentuali composte' },

{ k: 'q-pittura', diff: 'media', lang: 'it',
  stem: `Per tinteggiare una palestra Aldo da solo impiega 12 giorni, Bruno da solo 6 giorni. Lavorano insieme per 2 giorni; poi Bruno si ferma e Aldo finisce il lavoro da solo. In quanti giorni, in totale, la palestra è tinteggiata?`,
  ...put('q-pittura', '8 giorni', ['4 giorni', '7 giorni', '10 giorni']),
  sol: `Insieme fanno 1/12 + 1/6 = 1/4 del lavoro al giorno: in 2 giorni metà lavoro. L'altra metà Aldo la fa in 6 giorni (metà di 12). Totale 2 + 6 = 8 giorni.`,
  trap: `4 giorni è il tempo in cui i due finirebbero insieme (1 ÷ 1/4); 7 giorni e 10 giorni vengono da conti sbagliati sulla metà rimasta.`,
  patt: 'Lavoro e rapporti' },

{ k: 'q-ricarico', diff: 'difficile', lang: 'it',
  stem: `Un negozio vende un articolo a 90 € e il suo guadagno è il 25% del prezzo di vendita. Espresso come percentuale del costo di acquisto, il guadagno è pari a:`,
  ...put('q-ricarico', 'circa il 33%', ['il 25%', 'circa il 30%', 'il 40%']),
  sol: `Il guadagno è il 25% di 90 = 22,50 €, quindi il costo è 90 − 22,50 = 67,50 €. Rispetto al costo: 22,50 ÷ 67,50 = 1/3, cioè circa il 33%.`,
  trap: `Restare al 25%, che è calcolato sul prezzo di vendita e non sul costo; cambiare la base della percentuale (il costo è più piccolo del prezzo, quindi la percentuale cresce).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-salita', diff: 'media', lang: 'it',
  stem: `Marta percorre in bicicletta 12 km di salita a 6 km/h e poi, lungo lo stesso percorso, 12 km di discesa a 12 km/h. Qual è la sua velocità media sull'intero tragitto?`,
  ...put('q-salita', '8 km/h', ['9 km/h', '10 km/h', '7 km/h']),
  sol: `Tempo in salita 12 ÷ 6 = 2 h, in discesa 12 ÷ 12 = 1 h. In 3 ore percorre 24 km: 24 ÷ 3 = 8 km/h.`,
  trap: `9 km/h è la media semplice di 6 e 12: non tiene conto che in salita si passa più tempo (la media va pesata con i tempi, non con i chilometri).`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-batteri', diff: 'media', lang: 'it',
  stem: `Una coltura di batteri raddoppia ogni 3 ore. Alle 8:00 contiene 1.000 individui. Ricorda che 2¹⁰ = 1.024. A che ora supererà per la prima volta il milione di individui?`,
  ...put('q-batteri', 'alle 14:00 del giorno dopo', ['alle 11:00 del giorno dopo', 'alle 17:00 del giorno dopo', 'alle 14:00 dello stesso giorno']),
  sol: `Servono n raddoppi con 1.000 · 2ⁿ > 1.000.000, cioè 2ⁿ > 1.000: n = 10 (2¹⁰ = 1.024; con 9 si ha solo 512). 10 raddoppi sono 30 ore: dalle 8:00 si arriva alle 14:00 del giorno dopo.`,
  trap: `Con 9 raddoppi (27 ore, alle 11:00 del giorno dopo) si hanno 512.000 batteri, meno di un milione; con 11 raddoppi si supera il milione ma non è la prima volta; alle 14:00 dello stesso giorno sono passate solo 6 ore.`,
  patt: 'Crescita esponenziale' },

{ k: 'q-anagrammi', diff: 'difficile', lang: 'it',
  stem: `Quanti anagrammi (anche privi di significato) della parola STESSO non contengono due S consecutive?`,
  ...put('q-anagrammi', '24', ['144', '120', '4']),
  sol: `Prima si dispongono le tre lettere diverse T, E, O: 3! = 6 modi. Tra e intorno a loro ci sono 4 posti liberi: si scelgono i 3 posti per le S (una per posto), in C(4,3) = 4 modi. Totale 6 · 4 = 24.`,
  trap: `120 = 6!/3! sono tutti gli anagrammi, anche con le S vicine; 144 = 24 · 3! tratta le S come lettere distinguibili; 4 conta solo i posti delle S e dimentica l'ordine di T, E, O.`,
  patt: 'Combinazioni vs permutazioni' },

{ k: 'q-esami', diff: 'media', lang: 'it',
  stem: `Dopo 6 esami la media dei voti di Elena è 27. Con il settimo esame vuole portare la media a 28. Il voto massimo è 30. Quale delle seguenti affermazioni è corretta?`,
  ...put('q-esami', 'Non può riuscirci: le servirebbe un voto superiore a 30', ['Le basta un 28, come la media desiderata', 'Le basta un 30', 'Le basta un 29']),
  sol: `Per avere media 28 su 7 esami la somma deve essere 7 · 28 = 196. Finora la somma è 6 · 27 = 162, quindi servirebbe un voto 196 − 162 = 34, impossibile. Anche con un 30 la media sarebbe (162 + 30) ÷ 7 ≈ 27,4.`,
  trap: `Credere che un 28 (il valore della media che vuole) basti: un voto di 28 alza la media da 27 solo di 1/7 di punto, a circa 27,1. Alzare la media di un punto su sette esami costa 7 punti di voto in più.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-magliette', diff: 'media', lang: 'it',
  stem: `In un cassetto ci sono 5 magliette rosse e 3 magliette blu. Al buio se ne prendono 2 insieme. Qual è la probabilità che abbiano lo stesso colore?`,
  ...put('q-magliette', fr(13, 28), [fr(17, 32), fr(1, 2), fr(15, 28)]),
  sol: `Casi totali: C(8,2) = 28. Due rosse: C(5,2) = 10; due blu: C(3,2) = 3. Favorevoli 13, probabilità 13/28.`,
  trap: `17/32 = (25 + 9)/64 suppone che la prima maglietta venga rimessa nel cassetto; 15/28 è la probabilità di colori diversi (5 · 3 = 15 coppie); 1/2 è un valore a occhio.`,
  patt: 'Probabilità senza reinserimento' },

{ k: 'q-resti', diff: 'difficile', lang: 'it',
  stem: `Quanti numeri interi compresi tra 100 e 200 (estremi esclusi) divisi per 4 danno resto 3 e divisi per 5 danno resto 2?`,
  ...put('q-resti', '5', ['4', '6', '20']),
  sol: `I numeri con resto 2 nella divisione per 5 finiscono per 2 o per 7; tra questi, resto 3 nella divisione per 4 si ha per 7 + 20k: 107, 127, 147, 167, 187. Sono 5 (uno ogni mcm(4,5) = 20).`,
  trap: `Contare i numeri di una sola condizione (20 con resto 2 mod 5, 25 con resto 3 mod 4) o sbagliare di uno gli estremi dell'intervallo: i numeri ammessi ripartono ogni 20, non ogni 4 o 5.`,
  patt: 'Resti e mcm' },

{ k: 'q-amiche', diff: 'media', lang: 'it',
  stem: `Tre amiche hanno in tutto 92 €. Anna ha il doppio dei soldi di Bea e Carla ha 8 € in più di Bea. Quanti euro ha Carla?`,
  ...put('q-amiche', '29 €', ['21 €', '42 €', '37 €']),
  sol: `Se Bea ha b, Anna ha 2b e Carla b + 8: 2b + b + b + 8 = 92, quindi 4b = 84 e b = 21. Carla ha 21 + 8 = 29 €.`,
  trap: `Rispondere con il valore di Bea (21) o di Anna (42), cioè la grandezza intermedia e non quella richiesta.`,
  patt: 'Sistemi a parole' },

{ k: 'q-parttime', diff: 'media', lang: 'it',
  stem: `In un'azienda il 60% dei dipendenti è donna. Lavorano part-time il 25% delle donne e il 10% degli uomini. Quale percentuale dei dipendenti lavora part-time?`,
  ...put('q-parttime', '19%', ['17,5%', '35%', '15%']),
  sol: `Il 25% del 60% dà il 15% dei dipendenti; il 10% del 40% dà il 4%. In tutto 15% + 4% = 19%.`,
  trap: `17,5% è la media semplice di 25% e 10%: non pesa i due gruppi (60% e 40%); 35% somma le due percentuali; 15% dimentica il part-time degli uomini.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-figli', diff: 'difficile', lang: 'it',
  stem: `Una coppia ha due figli. Sapendo che almeno uno dei due è maschio, qual è la probabilità che siano entrambi maschi?`,
  ...put('q-figli', fr(1, 3), [fr(1, 2), fr(1, 4), fr(2, 3)]),
  sol: `I casi possibili per (primo, secondo) sono MM, MF, FM, FF. «Almeno un maschio» esclude FF e lascia 3 casi equiprobabili; solo MM è favorevole: 1/3.`,
  trap: `1/2 si ottiene dimenticando che i casi MF e FM sono due e ragionando sul «fratello rimasto» come se fosse indipendente; 1/4 è la probabilità senza la condizione. La condizione restringe i casi possibili a 3.`,
  patt: 'Probabilità condizionata' },

{ k: 'q-cena', diff: 'media', lang: 'it',
  stem: `Cinque amici dovevano dividersi in parti uguali il conto di una cena, ma due se ne sono andati senza pagare e gli altri tre hanno diviso il conto in parti uguali, pagando ciascuno 8 € in più del previsto. A quanto ammontava il conto?`,
  ...put('q-cena', '60 €', ['40 €', '24 €', '120 €']),
  sol: `Se il conto è x: x/3 − x/5 = 8, cioè 2x/15 = 8 e x = 60 €. Verifica: 20 € a testa in tre, 12 € a testa in cinque, differenza 8 €.`,
  trap: `24 € = 8 · 3 e 120 € = 8 · 15 sono passaggi intermedi sbagliati: la differenza tra le due quote non è il conto, ma una frazione (2/15) del conto.`,
  patt: 'Equazioni a parole' },

{ k: 'q-multipli', diff: 'media', lang: 'it',
  stem: `Qual è la somma di tutti i multipli di 3 compresi tra 1 e 50?`,
  ...put('q-multipli', '408', ['425', '459', '391']),
  sol: `I multipli sono 3, 6, …, 48: sono 16 (48 = 3 · 16). La somma è 3 · (1 + 2 + … + 16) = 3 · 136 = 408.`,
  trap: `425 = 1.275 ÷ 3 (un terzo della somma da 1 a 50, che non è la somma dei multipli); 459 include 51, che supera 50.`,
  patt: 'Somme e progressioni' },

{ k: 'q-saldi', diff: 'difficile', lang: 'it',
  stem: `In un negozio il 40% dei capi è composto da giacche e tutti i capi hanno lo stesso prezzo di listino. Nei saldi le giacche sono scontate del 50% e tutti gli altri capi del 20%. Di quanto scende, in percentuale, il valore complessivo della merce?`,
  ...put('q-saldi', '32%', ['35%', '30%', '28%']),
  sol: `Il 40% dei capi perde il 50%, il 60% perde il 20%: 0,4 · 50 + 0,6 · 20 = 20 + 12 = 32%.`,
  trap: `35% è la media semplice di 50% e 20%: non pesa lo sconto con la quota di capi a cui si applica.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-pecore', diff: 'media', lang: 'it',
  stem: `Un pastore ha 17 pecore. Tutte tranne 9 scappano. Quante pecore gli restano?`,
  ...put('q-pecore', '9', ['8', '17', '0']),
  sol: `«Tutte tranne 9» scappano: le uniche che non scappano sono 9, quindi gli restano 9 pecore.`,
  trap: `Sottrarre 17 − 9 = 8: si legge «9 scappano» invece di «scappano tutte tranne 9».`,
  patt: 'Ragionamento laterale' },

{ k: 'q-cifre', diff: 'media', lang: 'it',
  stem: `Quanti numeri di tre cifre tutte diverse tra loro si possono formare con le cifre 0, 1, 2, 3, 4?`,
  ...put('q-cifre', '48', ['60', '64', '36']),
  sol: `La cifra delle centinaia non può essere 0: 4 scelte. Per le decine restano 4 cifre (lo 0 ora è ammesso): 4 scelte. Per le unità ne restano 3. Totale 4 · 4 · 3 = 48.`,
  trap: `60 = 5 · 4 · 3 ammette lo 0 come prima cifra; 64 = 4 · 4 · 4 permette di ripetere le cifre; 36 = 4 · 3 · 3 toglie lo 0 anche dalle altre posizioni.`,
  patt: 'Combinazioni vs permutazioni' },

{ k: 'q-coro', diff: 'media', lang: 'it',
  stem: `In un coro il rapporto tra ragazzi e ragazze è 3 : 5. Se 4 ragazze lasciano il coro e 2 ragazzi si iscrivono, i ragazzi diventano tanti quante le ragazze. Quanti coristi c'erano all'inizio?`,
  ...put('q-coro', '24', ['16', '32', '40']),
  sol: `Ragazzi 3k, ragazze 5k: 3k + 2 = 5k − 4, quindi 2k = 6 e k = 3. All'inizio 9 ragazzi e 15 ragazze: 24 coristi.`,
  trap: `Fermarsi a k = 3 e rispondere 9 o 15; oppure scegliere un totale multiplo di 8 a caso: solo k = 3 rende uguali i due gruppi.`,
  patt: 'Rapporti vs valori assoluti' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-tariffa', diff: 'media', lang: 'it',
  claim: `Con la tariffa puntuale ogni famiglia di Rivabella paga una cifra che dipende soltanto dal numero di sacchi di indifferenziato consegnati.`,
  passage: `Il comune di Rivabella ha introdotto nel 2024 una tariffa puntuale sui rifiuti: ogni famiglia paga una quota fissa di 60 euro l'anno più 0,20 euro per ogni sacco di rifiuti indifferenziati consegnato. I sacchi di carta, plastica e vetro si ritirano gratuitamente. Nel primo anno la quantità di rifiuti indifferenziati è scesa del 30% e la raccolta differenziata è passata dal 55% al 70% del totale. Il sindaco ha dichiarato che con un'ulteriore riduzione dei rifiuti il comune risparmierebbe sui costi di smaltimento, ma che il bilancio del servizio resterà in pareggio solo se le famiglie manterranno i comportamenti attuali.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «ogni famiglia paga una quota fissa di 60 euro l'anno più 0,20 euro per ogni sacco». La cifra dipende anche dalla quota fissa, quindi non «soltanto» dai sacchi: l'affermazione è contraddetta.`,
  trap: `Leggere la tariffa «puntuale» come se fosse proporzionale ai soli sacchi e rispondere «vera». Non è «non ricavabile»: il brano dice esplicitamente che c'è una quota fissa.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-salari', diff: 'difficile', lang: 'it',
  passage: `Nel 2025 il salario nominale medio di un Paese è aumentato del 4%, mentre i prezzi al consumo sono cresciuti del 6%. Il potere d'acquisto del salario, cioè la quantità di beni che esso consente di acquistare, è quindi diminuito. Il governo ha ricordato che il salario minimo è aumentato dell'8%, ma ha precisato che riguarda soltanto il 5% dei lavoratori. I sindacati chiedono di collegare i salari all'inflazione; gli industriali replicano che un'indicizzazione automatica rischierebbe di spingere ulteriormente al rialzo i prezzi, pur ammettendo che i lavoratori con i salari più bassi sono i più esposti al rincaro.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put('v-salari', `Il governo sostiene che l'aumento dell'8% del salario minimo abbia compensato l'inflazione per tutti i lavoratori.`,
    [`Il potere d'acquisto del salario medio è diminuito di circa il 2%.`,
     `Il salario minimo è cresciuto più dei prezzi, ma riguarda solo una piccola parte dei lavoratori.`,
     `Per gli industriali l'indicizzazione automatica potrebbe far salire ulteriormente i prezzi.`]),
  sol: `Frase chiave: «il salario minimo è aumentato dell'8%, ma ha precisato che riguarda soltanto il 5% dei lavoratori». Il governo non sostiene che l'8% compensi l'inflazione per tutti: l'affermazione sbagliata è la quarta. Le altre sono corrette: 1,04 ÷ 1,06 ≈ 0,98 (circa −2%); 8% > 6%; gli industriali temono l'effetto sui prezzi.`,
  trap: `Nel formato «NON è corretta» si tende a scegliere la prima opzione che sembra sbagliata: il −2% è esatto (4% − 6% ≈ −2%). Il dato dell'8% si estende per errore a tutti i lavoratori, mentre il brano dice 5%.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-app', diff: 'media', lang: 'it',
  passage: `Un'azienda di trasporti urbani ha sostituito i biglietti di carta con un'app per i pagamenti. Nei sei mesi successivi gli incassi da biglietti sono aumentati del 12% e il direttore sostiene che il merito sia dell'app, che avrebbe reso l'acquisto più comodo e ridotto l'evasione. L'app è stata scaricata da 20.000 dei circa 90.000 abitanti della città. Nello stesso periodo l'azienda ha mantenuto invariati le tariffe e il numero di corse, mentre il Comune ha lanciato una campagna per l'uso del trasporto pubblico.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la tesi del direttore?`,
  ...put('v-app', `Nello stesso periodo una grande fabbrica servita dalle linee ha riaperto e molti dei suoi 3.000 dipendenti usano i mezzi pubblici.`,
    [`Gli utenti giudicano l'app semplice da usare.`,
     `Altre città hanno sostituito i biglietti di carta con app simili.`,
     `La maggior parte dei biglietti in app viene acquistata dopo le 18.`]),
  sol: `La tesi è causale (l'app ha fatto aumentare gli incassi). La riapertura di una fabbrica con 3.000 dipendenti che usano i mezzi pubblici è una causa alternativa dello stesso aumento: indebolisce la tesi.`,
  trap: `La semplicità dell'app rafforza la tesi; le altre città e l'orario degli acquisti non toccano il nesso tra app e incassi. Per indebolire un nesso causale serve una spiegazione alternativa.`,
  patt: 'Cause alternative' },

{ k: 'v-museo', diff: 'media', lang: 'it',
  claim: `L'aumento dei visitatori del museo nel 2025 è dovuto alla nuova sala di archeologia marina.`,
  passage: `Il Museo civico di Tellaro ha registrato nel 2025 ottantamila visitatori, il 25% in più del 2024. L'aumento è concentrato nei mesi da giugno a settembre, mentre tra ottobre e maggio i visitatori sono rimasti stabili. Nel 2025 il museo ha inaugurato una nuova sala dedicata all'archeologia marina e ha esteso l'orario di apertura serale ai fine settimana estivi. Il biglietto intero costa 8 euro, con ingresso gratuito per i minori di 18 anni. La direzione prevede di ampliare il bookshop nel 2026.`,
  opts: VFN, ans: 1,
  sol: `Il brano riporta l'aumento dei visitatori, la nuova sala e l'orario serale esteso, ma non attribuisce l'aumento a nessuna delle due novità. Il nesso causale non è né affermato né smentito: non ricavabile.`,
  trap: `Prendere per vero un nesso plausibile (sala nuova → più visitatori). Anche l'orario serale estivo potrebbe spiegare l'aumento concentrato in estate: il brano non sceglie. Non è «falsa»: nulla esclude la sala come causa.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-gruppo', diff: 'media', lang: 'it',
  passage: `Nel 2025 un gruppo industriale ha registrato ricavi per 500 milioni di euro, in crescita del 10% rispetto al 2024, e un utile netto di 25 milioni, pari al 5% dei ricavi. Il 2024 si era chiuso con un utile di 30 milioni. L'azienda attribuisce il calo dell'utile all'aumento del costo dell'energia, che ha pesato per 20 milioni in più rispetto all'anno precedente, e agli investimenti in nuovi impianti, finanziati in parte con un prestito da 40 milioni. Per il 2026 il gruppo prevede ricavi in crescita, ma non ha indicato obiettivi per l'utile.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-gruppo', `Nel 2024 i ricavi del gruppo erano di circa 455 milioni di euro.`,
    [`Nel 2025 l'utile netto è sceso del 25% rispetto al 2024.`,
     `Il calo dell'utile è dovuto interamente al costo dell'energia.`,
     `Per il 2026 il gruppo prevede un utile superiore a quello del 2025.`]),
  sol: `Frase chiave: «ricavi per 500 milioni di euro, in crescita del 10% rispetto al 2024». I ricavi del 2024 sono 500 ÷ 1,1 ≈ 455 milioni. L'utile è sceso da 30 a 25 milioni: −5/30 ≈ −17%, non −25%.`,
  trap: `Calcolare il 2024 come 500 − 10% = 450 (la base del 10% è il 2024, non il 2025); scambiare i 5 milioni di calo (o i 25 milioni di utile) con una percentuale: il calo è 5 su 30, circa −17%; «interamente» e la previsione sull'utile non sono nel brano.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-orario', diff: 'media', lang: 'it',
  passage: `Il consiglio di un liceo propone di spostare l'inizio delle lezioni dalle 8:00 alle 9:00. Secondo i promotori, gli studenti dormirebbero di più e, essendo più riposati, otterrebbero voti migliori. A sostegno, il preside cita un liceo vicino che ha già adottato l'orario posticipato: lì la media dei voti è salita da 6,8 a 7,2. Gli autisti dei pullman scolastici dovrebbero rivedere i turni, ma la scuola ha assicurato che il costo sarebbe contenuto. Il consiglio voterà la proposta nella seduta di giugno.`,
  stem: `Quale assunzione sta alla base dell'argomento a favore dello spostamento dell'orario?`,
  ...put('v-orario', `Gli studenti userebbero davvero l'ora in più per dormire.`,
    [`Il liceo vicino ha più studenti di quello che propone il cambiamento.`,
     `Tutti gli studenti oggi dormono meno di cinque ore per notte.`,
     `I pullman scolastici costano meno dei treni regionali.`]),
  sol: `L'argomento è: orario posticipato → più sonno → voti migliori. Funziona solo se l'ora in più viene davvero usata per dormire (e non, per esempio, per restare alzati la sera): è l'assunzione implicita.`,
  trap: `La seconda opzione è troppo forte (serve che qualcuno dorma poco, non tutti meno di cinque ore); le altre non riguardano il passaggio tra orario e sonno.`,
  patt: 'Assunzione implicita' },

{ k: 'v-colonnine', diff: 'difficile', lang: 'it',
  passage: `Una proposta di legge vuole imporre a tutti i comuni di installare una colonnina di ricarica ogni 10 chilometri di strada principale. I promotori sostengono che, senza una rete di ricarica capillare, in Italia la quota di auto elettriche non potrà superare il 10% delle immatricolazioni; oggi la quota è del 6%. Gli oppositori ricordano che molti acquirenti ricaricano a casa e che installare ogni colonnina costa ai comuni circa 20.000 euro. Il governo ha chiesto un parere all'associazione dei comuni, che si pronuncerà entro la fine dell'anno.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la tesi dei promotori secondo cui una rete capillare è necessaria per superare il 10%?`,
  ...put('v-colonnine', `Un Paese con pochissime colonnine pubbliche, ma con incentivi all'acquisto e garage privati molto diffusi, ha una quota di auto elettriche del 25%.`,
    [`In un Paese con una rete di ricarica capillare la quota di auto elettriche ha superato il 12%.`,
     `Ogni colonnina costa ai comuni circa 20.000 euro.`,
     `Gli oppositori della proposta sono più numerosi dei promotori.`]),
  sol: `I promotori sostengono che la rete sia una condizione necessaria per superare il 10%. Un Paese senza rete capillare che arriva al 25% mostra che si può superare il 10% anche senza: la condizione non è necessaria.`,
  trap: `La seconda opzione mostra che la rete è sufficiente (o compatibile con la tesi), non che sia necessaria: non indebolisce. Costi e numero degli oppositori non toccano il nesso.`,
  patt: 'Necessario vs sufficiente' },

{ k: 'v-assegni', diff: 'media', lang: 'it',
  claim: `Un ristorante di Valdoro che ha aderito al programma e ha ridotto i rifiuti organici di un quarto ha diritto allo sconto sulla tassa dei rifiuti.`,
  passage: `Nel 2024 la città di Valdoro ha avviato un programma per ridurre gli sprechi alimentari dei ristoranti. I locali aderenti ricevono contenitori per portare a casa gli avanzi e uno sconto del 10% sulla tassa dei rifiuti, ma solo se riducono i rifiuti organici di almeno un quinto rispetto all'anno precedente. Aderire è volontario. Dei 400 ristoranti della città, 120 hanno aderito nel primo anno e i dati finali sono ancora in elaborazione. L'assessore ha detto che l'obiettivo è arrivare a 200 aderenti entro il 2027.`,
  opts: VFN, ans: 2,
  sol: `Frase chiave: «uno sconto del 10% sulla tassa dei rifiuti, ma solo se riducono i rifiuti organici di almeno un quinto». Un quarto (25%) è più di un quinto (20%): la condizione è soddisfatta, quindi un ristorante aderente con quella riduzione ha lo sconto. È un esempio concreto coerente con la regola: vera.`,
  trap: `Dire «non ricavabile» perché il brano non cita quel ristorante, o confondere un quarto con un valore inferiore a un quinto (1/4 = 25%, 1/5 = 20%): un esempio che rispetta la regola generale è deducibile.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-cambio', diff: 'media', lang: 'it',
  passage: `Quando una moneta si apprezza rispetto a un'altra, servono più unità della seconda per acquistare un'unità della prima. Se l'euro passa da 1,10 a 1,20 dollari, un prodotto europeo che costa 100 euro passa, per un acquirente statunitense, da 110 a 120 dollari, a parità di prezzo in euro; ciò tende a ridurre le esportazioni europee verso gli Stati Uniti. Al contrario, per un'impresa europea che importa materie prime pagate in dollari, l'apprezzamento dell'euro riduce il costo in euro delle importazioni. La Banca centrale non ha un obiettivo di cambio, ma ne osserva gli effetti sull'inflazione.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-cambio', `Un euro più forte rende più cari in dollari i prodotti europei per gli acquirenti statunitensi, a parità di prezzo in euro.`,
    [`Un euro più forte aumenta il costo in euro delle materie prime importate e pagate in dollari.`,
     `La Banca centrale si pone come obiettivo un cambio di 1,20 dollari per euro.`,
     `Con il cambio a 1,20 un prodotto europeo da 100 euro costa 100 dollari.`]),
  sol: `Frasi chiave: «un prodotto europeo che costa 100 euro passa, per un acquirente statunitense, da 110 a 120 dollari» e «l'apprezzamento dell'euro riduce il costo in euro delle importazioni». La prima opzione ripete il primo meccanismo; la seconda lo inverte.`,
  trap: `Confondere apprezzamento e deprezzamento: se l'euro si rafforza, le importazioni in dollari costano meno in euro e le esportazioni costano di più in dollari. Il cambio non è un obiettivo della Banca centrale (il brano lo nega).`,
  patt: 'Termine economico frainteso' },

{ k: 'v-volontariato', diff: 'media', lang: 'it',
  passage: `Una ricerca ha rilevato che gli studenti universitari che fanno volontariato hanno voti medi più alti dei compagni che non lo fanno. Il rettore conclude che il volontariato migliora il rendimento negli studi e propone di renderlo obbligatorio per tutti gli studenti del primo anno. Il volontariato è su base volontaria e richiede circa quattro ore alla settimana. Gli studenti che lo praticano sono circa il 15% del totale e gli enti convenzionati dichiarano di avere posti per tutti. Il rettore presenterà la proposta al senato accademico in autunno.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del rettore?`,
  ...put('v-volontariato', `Gli studenti che scelgono il volontariato avevano voti più alti dei compagni già prima di iniziare.`,
    [`Il volontariato richiede circa quattro ore alla settimana.`,
     `Gli enti convenzionati hanno posti disponibili per tutti gli studenti del primo anno.`,
     `Molti studenti dichiarano di trovare il volontariato un'esperienza gratificante.`]),
  sol: `La conclusione è causale (il volontariato migliora i voti), ma gli studenti scelgono liberamente: se avevano già voti più alti prima, la differenza è dovuta alla selezione e non al volontariato.`,
  trap: `Con un dato osservativo si scambia l'associazione per causa. Tempo richiesto, posti disponibili e gratificazione non riguardano il rendimento.`,
  patt: 'Cause alternative' },

{ k: 'v-laurea', diff: 'difficile', lang: 'it',
  passage: `Regolamento della sessione di laurea. Può laurearsi nella sessione di luglio lo studente che abbia superato tutti gli esami entro il 15 giugno e che consegni la tesi entro il 30 giugno. Lo studente che non consegna la tesi entro il 30 giugno può laurearsi soltanto nella sessione di ottobre. La commissione si riunisce soltanto nelle sessioni di luglio e di ottobre; la laurea non può essere conferita in altri periodi. Gli studenti che si laureano a luglio devono pagare la tassa di laurea entro il 5 luglio.`,
  stem: `Giulia ha superato tutti gli esami il 10 giugno e ha consegnato la tesi il 28 giugno. Quale delle seguenti conclusioni è certa?`,
  ...put('v-laurea', `Giulia può laurearsi nella sessione di luglio.`,
    [`Giulia deve laurearsi nella sessione di luglio.`,
     `Giulia non può laurearsi nella sessione di ottobre.`,
     `Giulia può laurearsi anche nel mese di settembre.`]),
  sol: `Frase chiave: «Può laurearsi nella sessione di luglio lo studente che abbia superato tutti gli esami entro il 15 giugno e che consegni la tesi entro il 30 giugno». Giulia soddisfa entrambe le condizioni (10 giugno, 28 giugno): può laurearsi a luglio.`,
  trap: `«Può» non è «deve»; e «soltanto a ottobre» riguarda chi non consegna entro il 30 giugno, non Giulia: il regolamento non le vieta ottobre. A settembre non si laurea nessuno: la commissione si riunisce solo a luglio e a ottobre.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-ztl', diff: 'media', lang: 'it',
  passage: `Un comune propone di vietare l'ingresso delle auto nel centro storico dalle 8 alle 20. L'assessore sostiene che la misura ridurrà l'inquinamento dell'aria in centro, e porta come prova una città che ha adottato un divieto simile e ha registrato un calo del 20% dei livelli di polveri sottili nel centro. I commercianti temono un calo delle vendite, mentre un comitato di residenti chiede di estendere il divieto anche ai motorini. La decisione sarà presa dopo un periodo di prova di tre mesi.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più l'argomento dell'assessore?`,
  ...put('v-ztl', `Nella città citata, nelle zone senza il divieto, le polveri sottili non sono calate nello stesso periodo.`,
    [`Nella città citata il numero dei negozi del centro è diminuito dopo il divieto.`,
     `Molti automobilisti dichiarano di condividere l'obiettivo di ridurre l'inquinamento.`,
     `La città citata ha molti più abitanti del comune che propone il divieto.`]),
  sol: `L'argomento è: divieto → meno polveri sottili. Se nelle zone senza il divieto le polveri non sono calate, il calo del 20% nel centro non si spiega con fattori generali (meteo, stagione): il confronto rafforza il nesso.`,
  trap: `I negozi e il giudizio degli automobilisti non riguardano l'inquinamento; il confronto tra le popolazioni delle due città è irrilevante o, se mai, indebolisce la generalizzazione.`,
  patt: 'Cause alternative' },

{ k: 'v-vendite', diff: 'media', lang: 'it',
  passage: `Un'azienda di abbigliamento sostiene che le proprie vendite «crescono costantemente». A sostegno, riporta che le vendite sono passate da 80 milioni di euro nel 2023 a 120 milioni nel 2025. L'azienda ha circa 300 dipendenti e nel 2025 ha aperto due nuovi punti vendita. Il direttore commerciale attribuisce la crescita soprattutto alle vendite online, che nel 2025 sono state un quarto del totale. Per il 2026 prevede un ulteriore aumento, ma non ha comunicato una cifra. I punti vendita fisici sono distribuiti in dodici città.`,
  stem: `Quale delle seguenti informazioni sarebbe più utile per verificare l'affermazione che le vendite «crescono costantemente»?`,
  ...put('v-vendite', `Le vendite di ciascun trimestre dal 2023 al 2025.`,
    [`Il numero di dipendenti di ciascun anno.`,
     `Le vendite dei concorrenti nel 2025.`,
     `Il costo di apertura dei due nuovi punti vendita.`]),
  sol: `«Costantemente» significa senza interruzioni: i soli dati del 2023 e del 2025 mostrano una crescita complessiva, non l'assenza di cali intermedi. Serve l'andamento periodo per periodo, trimestre per trimestre.`,
  trap: `Il passaggio da 80 a 120 milioni fa pensare a una crescita costante, ma due punti non mostrano l'andamento in mezzo. Dipendenti, concorrenti e costi non verificano la parola chiave.`,
  patt: 'Parola chiave da verificare' },

{ k: 'v-fumatori', diff: 'media', lang: 'it',
  claim: `Tra i partecipanti allo studio, chi camminava meno di 30 minuti al giorno era più spesso fumatore di chi camminava di più.`,
  passage: `Uno studio ha seguito per cinque anni 3.000 persone di oltre 60 anni. Chi camminava almeno 30 minuti al giorno ha avuto un rischio di ricovero per cause cardiache inferiore del 20% rispetto a chi camminava meno. I ricercatori hanno tenuto conto dell'età e dell'abitudine al fumo dei partecipanti, ma non del loro reddito né della dieta. Gli autori sottolineano che i risultati mostrano un'associazione e non provano un rapporto di causa ed effetto. Lo studio è stato finanziato da una fondazione sanitaria e i dati completi saranno pubblicati nel prossimo anno.`,
  opts: VFN, ans: 1,
  sol: `Il brano dice che si è «tenuto conto» dell'abitudine al fumo, ma non riporta quanti fumatori ci fossero tra chi camminava poco e tra chi camminava molto. Il confronto sul fumo non è né affermato né smentito: non ricavabile.`,
  trap: `Leggere «tenuto conto del fumo» come «il fumo spiega la differenza» (falsa o vera a seconda del gusto): il brano dice solo che è stato controllato, non come si distribuisce.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-mutuo', diff: 'media', lang: 'it',
  passage: `Un mutuo di 120.000 euro a tasso variabile prevede un tasso pari all'indice di riferimento più uno spread fisso dell'1,5%. Se l'indice passa dall'1% al 3%, il tasso complessivo passa dal 2,5% al 4,5% e gli interessi annui sul capitale iniziale passano da 3.000 a 5.400 euro. Con un tasso fisso del 3,5% la rata resterebbe costante per l'intera durata. La banca ricorda che il fisso offre stabilità ma, se l'indice scende, chi lo ha scelto non ne beneficia; il variabile è più conveniente quando l'indice resta basso.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-mutuo', `Passando dall'indice all'1% a quello al 3%, gli interessi annui sul capitale iniziale aumentano dell'80%.`,
    [`Con l'indice al 3% il tasso variabile complessivo è inferiore al tasso fisso del 3,5%.`,
     `Il tasso fisso conviene sempre quando l'indice sale.`,
     `Se l'indice scende, chi ha il tasso fisso ne beneficia comunque.`]),
  sol: `Frasi chiave: «gli interessi annui sul capitale iniziale passano da 3.000 a 5.400 euro»: l'aumento è 2.400 su 3.000, cioè +80%. Con l'indice al 3% il variabile è al 4,5%, superiore al fisso del 3,5%.`,
  trap: `Calcolare l'aumento rispetto a 5.400 (44%) invece che rispetto a 3.000, oppure confondere i punti percentuali (da 2,5% a 4,5% sono +2 punti, ma +80% in termini relativi); «sempre» e «comunque» sono assoluti che il brano smentisce.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-famiglie', diff: 'media', lang: 'it',
  claim: `Più di 300 delle famiglie intervistate possiedono più di un'automobile.`,
  passage: `Un'indagine su 2.000 famiglie di una città ha rilevato che il 40% possiede almeno un'automobile e che, tra queste, una su quattro ne possiede più di una. Le famiglie senza automobile risiedono per la maggior parte nel centro storico, dove la circolazione è limitata. Il comune ha avviato una campagna per incentivare l'uso della bicicletta e prevede di aggiungere 30 chilometri di piste ciclabili entro il 2028. Secondo l'assessore alla mobilità, tra cinque anni le famiglie senza automobile potrebbero diventare più numerose, ma si tratta soltanto di una stima.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «il 40% possiede almeno un'automobile» e «tra queste, una su quattro ne possiede più di una». Le famiglie con almeno un'auto sono il 40% di 2.000 = 800; quelle con più di un'auto sono un quarto di 800 = 200, meno di 300. L'affermazione è contraddetta.`,
  trap: `Applicare «una su quattro» a tutte le 2.000 famiglie (500) o al 40% sbagliato: la frazione si applica alle sole famiglie con automobile. Non è «non ricavabile»: i numeri bastano.`,
  patt: 'Falso vs Non deducibile' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-urna', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un\'urna contiene 20 palline, ciascuna rossa, verde o gialla. È vero che la probabilità di estrarre una pallina rossa è minore di 1/2?',
    'Le palline non rosse sono almeno 11.',
    'Le palline rosse sono il doppio delle gialle.'),
  ...dsq('BDAC', 'A'),
  sol: `La probabilità è minore di 1/2 se le rosse sono meno di 10. (1): le non rosse sono almeno 11, quindi le rosse sono al massimo 9 su 20 e la probabilità è sempre minore di 1/2: basta, con risposta «sì». (2): se le gialle sono 2 le rosse sono 4 (sì), se le gialle sono 6 le rosse sono 12 (no): non basta.`,
  trap: `Pensare che la (1) non basti perché non dà il numero esatto delle rosse: per una domanda sì/no basta un limite («al massimo 9»). La (2) lega rosse e gialle, ma lascia libero il numero di gialle.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-negozi', diff: 'media', lang: 'it', asset: tNegozi(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-negozi', `Biella e Asti hanno lo stesso valore di vendite online.`,
    [`Il negozio con la quota online più alta è anche quello con il maggior valore di vendite online.`,
     `Le vendite online dei quattro negozi sono più della metà delle vendite totali.`,
     `Le vendite in negozio di Como sono pari a 200 mila euro.`]),
  sol: `Vendite online (migliaia di euro): Alba 200 · 0,60 = 120; Biella 500 · 0,30 = 150; Como 400 · 0,45 = 180; Asti 300 · 0,50 = 150. Biella e Asti coincidono (150). Le altre: la quota più alta è di Alba (120, non il massimo, che è Como con 180); le vendite online totali sono 600 su 1.400, meno della metà; le vendite in negozio di Como sono 400 · 0,55 = 220, non 200.`,
  trap: `Confondere la quota (un rapporto) con il valore assoluto: Alba ha la quota maggiore ma non il valore maggiore. Per Como si può dimenticare che la quota in negozio è il 55%, complemento del 45%.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-palestre', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `La sede Nord ha 120 iscritti e 6 istruttori.`,
    `La sede Centro ha 90 iscritti e 5 istruttori.`,
    `La sede Sud ha 70 iscritti e 4 istruttori.`
  ], [
    `A. Il Sud ha più iscritti per istruttore del Centro.`,
    `B. Il Nord ha più iscritti per istruttore di ciascuna delle altre due sedi.`,
    `C. Nel complesso delle tre sedi ci sono meno di 19 iscritti per istruttore.`,
    `D. Il Centro ha il minor numero di iscritti per istruttore.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la B', 'Sia la B sia la C', 'Sia la A sia la C', 'Sia la C sia la D'], ans: 1,
  sol: `Iscritti per istruttore: Nord 120 ÷ 6 = 20, Centro 90 ÷ 5 = 18, Sud 70 ÷ 4 = 17,5. A è falsa (17,5 < 18); B è vera (20 è il massimo); C è vera: 280 iscritti su 15 istruttori ≈ 18,7 < 19; D è falsa (il minimo è del Sud).`,
  trap: `Il Sud ha meno istruttori del Centro, ma ha anche meno iscritti: conta il rapporto. La media complessiva è il totale degli iscritti sul totale degli istruttori, non la media semplice dei tre rapporti (18,5, anch'essa sotto 19, ma per caso).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-parco', diff: 'difficile', lang: 'it', asset: gParco(),
  stem: `Quali sono stati i ricavi dei biglietti nei quattro mesi?`,
  ...put('d-parco', '1.060.000 €', ['1.280.000 €', '960.000 €', '660.000 €']),
  sol: `Ingressi a pagamento: maggio e giugno 20 + 30 = 50 mila; luglio e agosto 50 + 60 = 110 mila, di cui il 75% paga: 82,5 mila. In tutto 132,5 mila biglietti a 8 €: 1.060 migliaia di euro.`,
  trap: `1.280.000 € = 160 mila · 8 ignora la gratuità; 960.000 € = 120 mila · 8 applica il 25% di gratuiti a tutti i mesi; 660.000 € considera solo luglio e agosto.`,
  patt: 'Percentuali su sottoinsiemi' },

{ k: 'd-classe', diff: 'media', lang: 'it', ds: true,
  stem: ds('In una classe di 30 studenti, 18 sono ragazze. Quante ragazze studiano francese?',
    'Gli studenti che studiano francese sono 12.',
    'I ragazzi che studiano francese sono 5.'),
  ...dsq('DBCA', 'B'),
  sol: `Sia g il numero di ragazze e b quello dei ragazzi che studiano francese. (1): g + b = 12, ma b non è noto. (2): b = 5, ma non si sa il totale. Insieme: g = 12 − 5 = 7.`,
  trap: `Leggere i 12 della (1) come se fossero tutti ragazze: sono studenti, maschi e femmine insieme. La (2) da sola non dice nulla sulle ragazze, quindi i due dati vanno sottratti.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-spese', diff: 'media', lang: 'it', asset: gSpese(),
  stem: `Quanto spende l'azienda in un anno per pulizie e assicurazioni insieme?`,
  ...put('d-spese', '36.000 €', ['24.000 €', '72.000 €', '12.000 €']),
  sol: `Le altre voci sono il 30% del totale; nel rapporto 3 : 2 : 1 (6 parti) ogni parte è il 5%. Pulizie 10% e assicurazioni 5%: 15% di 240.000 = 36.000 €.`,
  trap: `24.000 € è solo il 10% (pulizie); 72.000 € è tutto il 30% delle altre voci; 12.000 € è solo il 5% (assicurazioni).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-ferie', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Ada, Bea e Ciro prendono ciascuno un solo giorno di ferie, tutti in giorni diversi tra lunedì, martedì e mercoledì.`,
    `Ada è in ferie prima di Bea.`,
    `Ciro non è in ferie il mercoledì.`
  ], [
    `A. Ciro è in ferie prima di Bea.`,
    `B. Ada è in ferie il lunedì.`,
    `C. Bea è in ferie il martedì.`,
    `D. Ciro è in ferie dopo Bea.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la C', 'Sia la B sia la C', 'Sia la C sia la D', 'Sia la A sia la D'], ans: 2,
  sol: `Ada è prima di Bea, quindi Bea non è lunedì e Ada non è mercoledì; Ciro non è mercoledì: il mercoledì spetta a Bea. Restano due casi: Ada lunedì e Ciro martedì, oppure Ciro lunedì e Ada martedì. A è vera in entrambi i casi (Bea è mercoledì); B è possibile ma non sicura; C è falsa (Bea è mercoledì, non martedì); D è falsa (Bea è l'ultima).`,
  trap: `Con la consegna «false» si indica la A, che invece è sicuramente vera, oppure la B, che non è né sicuramente vera né sicuramente falsa. Serve prima trovare per esclusione che Bea è in ferie il mercoledì.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-intervallo', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Un negozio ha venduto in un giorno 30 articoli tra cappelli e sciarpe. Quanti euro ha incassato?',
    'Un cappello costa 10 € e una sciarpa 15 €.',
    'Il negozio ha venduto più sciarpe che cappelli.'),
  ...dsq('ACBD', 'D'),
  sol: `Sia c il numero di cappelli e 30 − c quello delle sciarpe. (1): l'incasso è 10c + 15(30 − c) = 450 − 5c, ma c non è noto. (2): dà solo un limite (30 − c > c, cioè c ≤ 14). Insieme l'incasso può valere 450 (c = 0), 400 (c = 10), 380 (c = 14)…: non è determinato.`,
  trap: `Credere che il vincolo «più sciarpe che cappelli» fissi il numero di cappelli: dà soltanto un intervallo (da 0 a 14 cappelli).`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-multipli', diff: 'media', lang: 'it', ds: true,
  stem: ds('L\'intero positivo n è un multiplo di 12?',
    'n è multiplo sia di 3 sia di 4.',
    'n è multiplo sia di 4 sia di 6.'),
  ...dsq('CDAB', 'C'),
  sol: `Un numero multiplo di due numeri è multiplo del loro minimo comune multiplo. (1): mcm(3,4) = 12, quindi n è multiplo di 12. (2): mcm(4,6) = 12, quindi n è multiplo di 12. Ciascuna basta da sola.`,
  trap: `Per la (2) credere che «multiplo di 4 e di 6» richieda 4 · 6 = 24 e non dica nulla su 12: il numero che conta è il mcm (12), non il prodotto.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-fabbriche', diff: 'media', lang: 'it', asset: tFabbriche(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-fabbriche', `Nessuna delle altre risposte è corretta.`,
    [`In ogni anno la Fabbrica 3 ha prodotto più della somma delle altre due.`,
     `Dal 2022 al 2025 la produzione della Fabbrica 1 è cresciuta di più del 40%.`,
     `Nel 2025 la Fabbrica 2 ha prodotto più di un terzo del totale.`]),
  sol: `Prima: nel 2022 la Fabbrica 3 ha 80 contro 40 + 55 = 95, quindi è falsa. Seconda: da 40 a 56 la crescita è 16 su 40 = 40% esatto, non «di più». Terza: il totale 2025 è 56 + 68 + 82 = 206 e un terzo è 68,67; la Fabbrica 2 ne produce 68, meno. Nessuna delle altre è corretta.`,
  trap: `Per la seconda e la terza i numeri sono vicinissimi alla soglia (40% esatto; 68 contro 68,67): affermazioni «quasi vere» che vanno respinte. Chi non controlla il conto sceglie una delle altre invece dell'ultima.`,
  patt: 'Confronti con numeri vicini' },

{ k: 'd-ordini', diff: 'media', lang: 'it', asset: gOrdini(),
  stem: `In quale mese la quota di ordini evasi sugli ordini ricevuti è stata più bassa?`,
  ...put('d-ordini', 'Febbraio', ['Gennaio', 'Marzo', 'Aprile']),
  sol: `Quote evase: Gennaio 360/400 = 90%; Febbraio 350/500 = 70%; Marzo 540/600 = 90%; Aprile 640/800 = 80%. La più bassa è Febbraio.`,
  trap: `Aprile ha il maggior numero di ordini non evasi in valore assoluto (160), ma in rapporto agli ordini ricevuti è meglio di Febbraio (150 non evasi su 500). Occorre il rapporto, non la differenza.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-sconto', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un maglione viene venduto con lo sconto del 20% sul prezzo di listino. È vero che il prezzo scontato è inferiore a 50 €?',
    'Lo sconto, in euro, è inferiore a 15 €.',
    'Il prezzo di listino è inferiore a 60 €.'),
  ...dsq('DACB', 'A'),
  sol: `Il prezzo scontato è l'80% del listino. (2): listino sotto 60 € significa prezzo scontato sotto 0,8 · 60 = 48 €, quindi inferiore a 50 €: basta, con risposta «sì». (1): sconto sotto 15 € vuol dire listino sotto 75 €, quindi prezzo scontato sotto 60 €: può essere 40 € (sì) o 55 € (no). Non basta.`,
  trap: `Pensare che la (2) non basti perché dà il listino e non il prezzo scontato: per un sì/no basta un limite. Credere che la (1) basti perché «sconto basso» fa pensare a un prezzo basso.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-costi', diff: 'difficile', lang: 'it', asset: tCosti(),
  stem: `Quale quota del costo totale di febbraio spetta all'area Sud?`,
  ...put('d-costi', 'circa il 33%', ['circa il 12%', 'circa il 36%', 'circa il 25%']),
  sol: `Costo del Sud a febbraio: dal totale di riga 110 − 30 − 40 = 40 (oppure dal totale di colonna 120 − 50 − 30 = 40). Totale di febbraio 120: 40 ÷ 120 = 1/3, circa il 33%.`,
  trap: `circa il 36% divide per il totale del Sud (40 ÷ 110) e circa il 12% per il totale generale (40 ÷ 330): la quota richiesta ha per denominatore il totale di febbraio. Circa il 25% è un valore a occhio.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-parcheggi', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `I dipendenti di un'azienda sono 60 e il 70% lavora in sede.`,
    `Esattamente la metà di chi lavora in sede ha il parcheggio.`,
    `Nessuno di chi lavora da remoto ha il parcheggio.`
  ], [
    `A. Almeno 20 dipendenti hanno il parcheggio.`,
    `B. Più di 25 dipendenti hanno il parcheggio.`,
    `C. I dipendenti che lavorano da remoto sono 24.`,
    `D. Chi ha il parcheggio lavora in sede.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la A sia la D', 'Sia la B sia la D', 'Sia la A sia la C'], ans: 1,
  sol: `In sede lavora il 70% di 60 = 42 persone, da remoto 18. Il parcheggio ce l'ha la metà di 42, cioè 21 persone, e nessuno da remoto. A è vera (21 ≥ 20); B è falsa (21 < 25); C è falsa (18, non 24); D è vera (nessun lavoratore da remoto ha il parcheggio).`,
  trap: `Calcolare i dipendenti da remoto come il 40% (24) o il parcheggio sul totale di 60 invece che su chi lavora in sede. La D è una proposizione logica che si dimentica accanto a quelle numeriche.`,
  patt: 'Logica: almeno / unicamente' },

{ k: 'd-triangolo', diff: 'media', lang: 'it', ds: true,
  stem: ds('Il triangolo ABC è rettangolo in B?',
    'AB = 5 cm e BC = 12 cm.',
    'AC = 13 cm.'),
  ...dsq('ADBC', 'B'),
  sol: `Il triangolo è rettangolo in B se AB² + BC² = AC². (1) da sola dà i due lati ma non AC (AC può essere 13 oppure un altro valore tra 7 e 17). (2) da sola dà AC ma non gli altri lati. Insieme: 25 + 144 = 169 = 13², quindi è rettangolo in B.`,
  trap: `Riconoscere la terna 5-12-13 e concludere che bastano le due informazioni «che la formano» senza controllare che l'ipotenusa sia AC: servono tutte e tre le misure e l'ordine dei lati.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-reparti', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Quattro reparti hanno un numero di addetti intero e diverso l'uno dall'altro; in tutto gli addetti sono 72.`,
    `Il reparto più piccolo ha 12 addetti.`,
    `Nessun reparto ha più di 24 addetti.`
  ], [
    `A. Un reparto ha 24 addetti.`,
    `B. Ogni altro reparto ha almeno 13 addetti.`,
    `C. Un reparto ha 11 addetti.`,
    `D. Tutti e tre gli altri reparti hanno più di 20 addetti.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la C', 'Sia la A sia la D', 'Sia la C sia la D', 'Sia la B sia la C'], ans: 2,
  sol: `Il reparto più piccolo ha 12 addetti, gli altri tre sono tutti diversi e maggiori di 12, e insieme fanno 72 − 12 = 60. B è vera. C è falsa (il minimo è 12). D è falsa: tre numeri interi diversi maggiori di 20 sommano almeno 21 + 22 + 23 = 66 > 60. A è possibile ma non sicura (12 + 24 + 17 + 19 = 72, oppure 12 + 18 + 19 + 23 = 72 senza 24).`,
  trap: `Considerare la A sicuramente falsa o sicuramente vera: esistono configurazioni con e senza il 24. La D va controllata con il minimo: se tre reparti avessero più di 20 addetti, sarebbero almeno 66.`,
  patt: 'Vincoli di minimo e massimo' }
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
  id: '27',
  title: 'Mock 27',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Tutto in italiano, livello del Mock 15 ma con calcoli e testi più corti (tempo teorico stimato: circa 86 minuti): sconti a catena, lavoro e velocità media, ricarico e margine, anagrammi con vincolo, resti, probabilità condizionata, brani da 80–150 parole con modali, regole e cause alternative. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false», sufficienza dei dati (limiti, mcm, tabella 2×2, triangolo), grafici con percentuali su sottoinsiemi e tabelle con cella mancante.',
  questions: QUESTIONS,
  data: DATA
};
});
