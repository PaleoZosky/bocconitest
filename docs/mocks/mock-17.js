/* =======================================================================
   Mock 17 — 50 domande nuove (18 Q, 16 V, 16 DI), calibrate con
   guida-calibrazione-mock.md e sullo stesso livello del Mock 15:
   Quantitativa e Verbale più difficili del Mock 14 (più passaggi,
   brani da 100–200 parole con modali, opzioni sbagliate tutte
   plausibili), Data Insights come il Mock 14.

   Nelle domande di sufficienza dei dati i criteri sono fissi:
   A = una sola delle due affermazioni basta, B = servono entrambe,
   C = ciascuna basta da sola, D = servono altri dati; nella lista
   compaiono in ordine rimescolato (la lettera del criterio è scritta
   nel testo dell'opzione, la posizione A–D è quella del pulsante).

   Le domande sono scritte per area (POOL) e poi disposte in schermate da
   tre con ordine delle aree variabile (LAYOUT). Il campo `k` identifica la
   domanda per gli script di verifica (tools/check_math_17.py).
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

/* inserisce l'opzione giusta nella posizione voluta (0 = A) tra le sbagliate */
function put(right, wrongs, pos) { const o = wrongs.slice(); o.splice(pos, 0, right); return { opts: o, ans: pos }; }

/* vero / falso / non ricavabile con la motivazione dentro l'opzione (ordine fisso: Falsa, Non ricavabile, Vera) */
const VFN = [
  'Falsa, poiché contraddice un\'affermazione contenuta nel brano o da esso deducibile',
  'Non ricavabile dal testo, poiché non ci sono abbastanza informazioni',
  'Vera, poiché è contenuta nel brano o da esso deducibile'
];
const VFN_EN = [
  'False, because it contradicts a statement in the passage or one that follows from it',
  'Cannot be determined from the text, because there is not enough information',
  'True, because it is stated in the passage or follows from it'
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
  /* n.5 — ricavi mensili di una pizzeria (migliaia di euro) */
  pizzeria: { mesi: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'], ricavi: [40, 50, 60, 45, 54, 72], fissi: 30, varPct: 20, soglia: 15 },
  /* n.16 — tasso di disoccupazione (%) e forza lavoro (milioni) */
  lavoro: { anni: [2020, 2021, 2022, 2023, 2024], tasso: [9, 10, 9, 9, 8], forza: { 2021: 20, 2024: 22 } },
  /* n.34 — nuovi iscritti per corso e rette */
  corsi: { nomi: ['Corso A', 'Corso B', 'Corso C'], y24: [120, 80, 40], y25: [150, 60, 100], retta: [2000, 3000, 4000], scontoC: 25 },
  /* n.7 — vendite per canale (% di riga) */
  canali: { prodotti: ['Alfa', 'Beta', 'Gamma'], unita: [200, 150, 50], pct: [[30, 50, 20], [40, 30, 30], [60, 10, 30]], canali: ['Online', 'Negozio', 'Ingrosso'] },
  /* n.25 — produzione agricola (migliaia di tonnellate) */
  colture: { anni: [2023, 2024, 2025], Frumento: [80, 90, 99], Mais: [60, 66, 72], Orzo: [20, 22, 30] },
  /* n.43 — spese trimestrali per reparto (migliaia di euro), celle nascoste */
  spese: {
    righe: [['Produzione', [120, null, 150], 420], ['Logistica', [null, 60, 75], 185], ['Marketing', [30, null, null], 95]],
    totCol: [200, 250, 250], totale: 700, rapportoMkt: [8, 5]
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

function gPizzeria() {
  const D = DATA.pizzeria;
  return `<figure class="fig"><figcaption>Ricavi mensili di una pizzeria, in migliaia di euro</figcaption>` + C.bars({
    labels: D.mesi, series: [{ name: 'Ricavi', values: D.ricavi }], max: 80, unit: 'migliaia di €',
    aria: 'Istogramma dei ricavi mensili in migliaia di euro: ' + D.mesi.map((m, i) => m + ' ' + D.ricavi[i]).join(', ') + '.'
  }) + `<p class="fig-note">In ogni mese i costi sono pari a ${D.fissi}.000 € fissi più il ${D.varPct}% dei ricavi di quel mese.</p></figure>`;
}

function gLavoro() {
  const D = DATA.lavoro;
  return `<figure class="fig"><figcaption>Tasso di disoccupazione di un Paese (% della forza lavoro)</figcaption>` + C.line({
    labels: D.anni.map(String), series: [{ name: 'Tasso', values: D.tasso }], lo: 6, hi: 12, gridFrom: 6, gridTo: 12, gridStep: 2,
    title: '% della forza lavoro',
    aria: 'Linea del tasso di disoccupazione: ' + D.anni.map((a, i) => a + ' ' + D.tasso[i] + '%').join(', ') + '.'
  }) + `<p class="fig-note">La forza lavoro (occupati più disoccupati) era di ${D.forza[2021]} milioni di persone nel 2021 e di ${D.forza[2024]} milioni nel 2024.</p></figure>`;
}

function gCorsi() {
  const D = DATA.corsi;
  return `<figure class="fig"><figcaption>Nuovi iscritti ai tre corsi di una scuola</figcaption>` + C.bars({
    labels: D.nomi, series: [{ name: '2024', values: D.y24, style: 'outline' }, { name: '2025', values: D.y25 }], max: 160,
    aria: 'Barre dei nuovi iscritti. 2024: ' + D.nomi.map((n, i) => n + ' ' + D.y24[i]).join(', ') + '. 2025: ' + D.nomi.map((n, i) => n + ' ' + D.y25[i]).join(', ') + '.'
  }) + `<p class="fig-note">Retta annua nel 2024: ${fmt(D.retta[0])} € (corso A), ${fmt(D.retta[1])} € (corso B), ${fmt(D.retta[2])} € (corso C). Nel 2025 le rette di A e B sono invariate, mentre i nuovi iscritti al corso C pagano ${D.scontoC}% in meno.</p></figure>`;
}

function tCanali() {
  const D = DATA.canali;
  return C.table({
    caption: 'Vendite di tre prodotti: unità vendute (in migliaia) e ripartizione per canale (% delle unità di ciascun prodotto)',
    head: ['Prodotto', 'Unità (migliaia)'].concat(D.canali),
    rows: D.prodotti.map((p, i) => [p, D.unita[i]].concat(D.pct[i].map(x => x + '%')))
  }) + `<p class="fig-note">Le tre percentuali di ogni riga sommano a 100%.</p>`;
}

function tColture() {
  const D = DATA.colture;
  return C.table({
    caption: 'Produzione di tre cereali, in migliaia di tonnellate',
    head: ['Cereale'].concat(D.anni),
    rows: ['Frumento', 'Mais', 'Orzo'].map(c => [c].concat(D[c]))
  });
}

function tSpese() {
  const S = DATA.spese, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Spese trimestrali per reparto, in migliaia di euro',
    head: ['Reparto', '1° trim.', '2° trim.', '3° trim.', 'Totale'],
    rows: S.righe.map(r => [r[0]].concat(r[1].map(c), [r[2]])),
    foot: ['Totale'].concat(S.totCol, [S.totale])
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato. Per il reparto Marketing le spese del 2° e del 3° trimestre stanno nel rapporto 8 : 5.</p>`;
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-listino', diff: 'difficile', lang: 'it',
  stem: `Un tablet è in vendita con uno sconto del 25% sul prezzo di listino, IVA al 22% compresa. Con un coupon Anna ottiene un ulteriore 10% sul prezzo già scontato e paga in tutto 164,70 €. Quanto costa il tablet al listino, prima dell'IVA?`,
  ...put('200 €', ['244 €', '135 €', 'circa 189 €'], 2),
  sol: `Il prezzo pagato è il 90% del prezzo scontato: 164,70 ÷ 0,9 = 183 €. Questo è il 75% del listino con IVA: 183 ÷ 0,75 = 244 €. Il listino con IVA contiene l'IVA al 22%, cioè è 1,22 volte il prezzo senza IVA: 244 ÷ 1,22 = 200 €. (Controllo: 200 · 1,22 = 244; 244 · 0,75 = 183; 183 · 0,9 = 164,70.)`,
  trap: `Fermarsi a 244 € (listino ma con l'IVA ancora dentro) o a 135 € (164,70 ÷ 1,22: toglie l'IVA ma dimentica i due sconti). Sommare le variazioni (+22% − 25% − 10% = −13%) e fare 164,70 ÷ 0,87 ≈ 189 € è l'errore di chi tratta passaggi in sequenza come se avessero la stessa base.`,
  patt: 'Base della percentuale' },

{ k: 'q-fila', diff: 'facile', lang: 'it',
  stem: `In una fila per entrare a teatro Anna è la quarta partendo dall'inizio della fila e Bea è la nona partendo dalla fine. Tra Anna e Bea ci sono esattamente 6 persone, e Bea sta dietro ad Anna. Quante persone ci sono in tutto nella fila?`,
  ...put('19', ['18', '20', '21'], 1),
  sol: `Anna è in posizione 4. Con 6 persone in mezzo, Bea è in posizione 4 + 6 + 1 = 11 (contando dall'inizio). Essendo la nona dalla fine, dopo di lei ci sono 8 persone: la fila è di 11 + 8 = 19 persone.`,
  trap: `Sommare 11 + 9 = 20: la posizione di Bea è già contata sia da chi parte dall'inizio sia da chi parte dalla fine, quindi va contata una volta sola. Contare «nona dalla fine» come «nove persone dopo di lei» (invece di otto) porta allo stesso errore.`,
  patt: 'Ragionamento laterale' },

{ k: 'q-base', diff: 'media', lang: 'it',
  stem: `Il fatturato di Beta supera del 50% quello di Alfa; il fatturato di Gamma è inferiore del 20% a quello di Beta. Di quanto, in percentuale, il fatturato di Alfa è inferiore a quello di Gamma?`,
  ...put('circa 16,7% in meno', ['20% in meno', '25% in meno', '30% in meno'], 3),
  sol: `Con Alfa = 100: Beta = 150 e Gamma = 150 · 0,8 = 120. La differenza tra Gamma e Alfa è 20, ma «Alfa è inferiore a Gamma» chiede di dividere per Gamma: 20 ÷ 120 = 1/6 ≈ 16,7% in meno.`,
  trap: `Dividere per la base sbagliata: 20 ÷ 100 = 20% è di quanto Gamma supera Alfa, non di quanto Alfa è inferiore a Gamma. Il 30% somma e sottrae le due variazioni (50 − 20), il 25% è il rapporto inverso di un 20% in meno (1 ÷ 0,8).`,
  patt: 'Base della percentuale' },

{ k: 'q-composto', diff: 'difficile', lang: 'it',
  stem: `Un capitale viene depositato a interesse composto al 10% annuo: gli interessi di ogni anno si aggiungono al capitale e fruttano a loro volta. Dopo 2 anni il capitale vale 12.100 €. Di quanto gli interessi composti maturati in 3 anni superano gli interessi semplici (calcolati sempre sul capitale iniziale) che si otterrebbero nello stesso tempo e allo stesso tasso?`,
  ...put('310 €', ['100 €', '3.000 €', '3.310 €'], 2),
  sol: `Il capitale iniziale si ricava dividendo per 1,10²: 12.100 ÷ 1,21 = 10.000 €. In 3 anni, a interesse composto, vale 10.000 · 1,10³ = 13.310 €, quindi gli interessi sono 3.310 €. A interesse semplice sarebbero 3 · 10% · 10.000 = 3.000 €. La differenza è 310 €.`,
  trap: `100 € è la differenza dopo 2 anni (2.100 − 2.000), non dopo 3; 3.000 € sono gli interessi semplici; 3.310 € sono gli interessi composti totali, non la differenza tra i due metodi. Un altro errore è calcolare gli interessi sui 12.100 € invece che sul capitale iniziale.`,
  patt: 'Percentuali composte' },

{ k: 'q-inseguimento', diff: 'media', lang: 'en',
  stem: `Anna starts walking along a path at 6 km/h. Half an hour later, Bea sets off from the same point and follows the same path on a bike at 15 km/h. How long after Bea's departure does she catch up with Anna?`,
  ...put('20 minutes', ['12 minutes', 'about 9 minutes', '30 minutes'], 0),
  sol: `When Bea starts, Anna is already 6 · 0.5 = 3 km ahead. Bea gains 15 − 6 = 9 km on her every hour, so she closes the 3 km gap in 3 ÷ 9 = 1/3 hour = 20 minutes.`,
  trap: `Dividing the head start by Bea's speed alone (3 ÷ 15 h = 12 minutes) forgets that Anna keeps walking. Dividing by the sum of the speeds (3 ÷ 21 h ≈ 9 minutes) is the formula for two people walking towards each other, not one chasing the other. 30 minutes is just Anna's head start.`,
  patt: 'Velocità relativa' },

{ k: 'q-lavoro', diff: 'difficile', lang: 'it',
  stem: `Tre stampanti lavorano a una grossa commessa. Da sola, A la completerebbe in 6 ore, B in 3 ore e C in 12 ore. Nella prima ora lavorano A e B insieme; poi A si ferma e al suo posto entra C, che lavora insieme a B fino alla fine. Quanto dura in tutto la commessa?`,
  ...put('2 ore e 12 minuti', ['2 ore', '2 ore e 30 minuti', 'circa 1 ora e 43 minuti'], 3),
  sol: `Nella prima ora A e B fanno 1/6 + 1/3 = 1/2 della commessa. Poi B e C insieme fanno 1/3 + 1/12 = 5/12 della commessa all'ora. Resta 1/2: (1/2) ÷ (5/12) = 6/5 ore = 1 ora e 12 minuti. In tutto: 1 ora + 1 ora e 12 minuti = 2 ore e 12 minuti.`,
  trap: `Lasciare B da sola dopo la prima ora (1/2 ÷ 1/3 = 1 ora e 30 minuti → 2 ore e 30 minuti) dimentica che C entra. Far lavorare tutte e tre per tutto il tempo (7/12 all'ora) dà circa 1 ora e 43 minuti. Lasciare A anche nella seconda fase dà 2 ore.`,
  patt: 'Lavoro con cambio a metà' },

{ k: 'q-azioni', diff: 'media', lang: 'it',
  stem: `Un investitore compra azioni della stessa società in due lotti: uno al prezzo di 20 € per azione e uno al prezzo di 30 € per azione. In tutto spende 1.200 € e il prezzo medio pagato per azione risulta di 24 €. Quante azioni ha comprato al prezzo di 30 €?`,
  ...put('20', ['30', '25', '24'], 1),
  sol: `Il prezzo medio 24 dista 4 dal 20 e 6 dal 30: le quantità stanno in rapporto inverso alle distanze, quindi azioni a 20 € : azioni a 30 € = 6 : 4 = 3 : 2. Le azioni in tutto sono 1.200 ÷ 24 = 50, quindi quelle da 30 € sono 2/5 di 50 = 20. (Controllo: 30 · 20 + 20 · 30 = 600 + 600 = 1.200.)`,
  trap: `Con due lotti uguali (25 + 25 azioni) il prezzo medio sarebbe 25 €, non 24: la media è più vicina a 20 €, quindi si compra di più al prezzo basso (30 azioni) che a quello alto. Scambiare i due lotti dà 30; 25 è la divisione in parti uguali; 24 è il prezzo medio, non un numero di azioni.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-calendario', diff: 'media', lang: 'it',
  stem: `Il 1° gennaio 2027 è un venerdì. Che giorno della settimana sarà il 1° marzo 2028?`,
  ...put('mercoledì', ['martedì', 'giovedì', 'venerdì'], 0),
  sol: `Dal 1° gennaio 2027 al 1° gennaio 2028 passano 365 giorni (il 2027 non è bisestile); poi gennaio ha 31 giorni e febbraio 2028 ne ha 29 (il 2028 è bisestile): in tutto 365 + 31 + 29 = 425 giorni. 425 = 7 · 60 + 5, quindi si avanza di 5 giorni: venerdì + 5 = mercoledì.`,
  trap: `Dimenticare il 29 febbraio 2028 (il 2028 è bisestile): con 424 giorni si avanza di 4 e si arriva a martedì. Giovedì è l'errore opposto, un giorno di troppo (6 invece di 5). Venerdì è il giorno di partenza, che si ritrova se si contano soltanto anni interi.`,
  patt: 'Calendario e giorni della settimana' },

{ k: 'q-dadi', diff: 'difficile', lang: 'it',
  stem: `Si lanciano due dadi equi a sei facce. Sapendo che la somma dei due numeri usciti è almeno 10, qual è la probabilità che sia uscito almeno un 6?`,
  ...put(fr(5, 6), [fr(1, 2), fr(11, 36), fr(2, 3)], 2),
  sol: `Le coppie con somma almeno 10 sono 6: (4;6), (6;4), (5;5), (5;6), (6;5), (6;6). Quelle con almeno un 6 sono 5 (tutte tranne (5;5)). La probabilità condizionata è 5 ÷ 6 = 5/6.`,
  trap: `11/36 è la probabilità di avere almeno un 6 su tutti i 36 casi, senza usare l'informazione sulla somma. 1/2 e 2/3 sono stime «a occhio» che non partono dall'elenco dei casi favorevoli alla condizione. Il denominatore giusto è 6 (i casi che rispettano la condizione), non 36.`,
  patt: 'Probabilità condizionata' },

{ k: 'q-rate', diff: 'media', lang: 'it',
  stem: `Un divano costa 1.080 € se pagato in contanti. Pagandolo a rate si versa un anticipo di 300 € più 6 rate mensili da 150 €. Di quanto, in percentuale, il costo totale a rate supera il prezzo in contanti?`,
  ...put('circa 11,1%', ['10%', '20%', '9%'], 1),
  sol: `A rate si pagano 300 + 6 · 150 = 1.200 €. La differenza è 1.200 − 1.080 = 120 €. Il confronto è con il prezzo in contanti, quindi la base è 1.080: 120 ÷ 1.080 = 1/9 ≈ 11,1%.`,
  trap: `Dividere per il costo a rate (120 ÷ 1.200 = 10%): la base di «supera il prezzo in contanti» è il prezzo in contanti, non quello a rate. Il 9% e il 20% sono valori «a occhio» che non corrispondono a nessun rapporto tra i dati.`,
  patt: 'Base della percentuale' },

{ k: 'q-resti', diff: 'difficile', lang: 'it',
  stem: `Un intero positivo n, se diviso per 6, dà resto 4 e, se diviso per 9, dà resto 7. Quanti valori di n compresi tra 1 e 200 (estremi inclusi) soddisfano entrambe le condizioni?`,
  ...put('11', ['4', '10', '12'], 2),
  sol: `Resto 4 nella divisione per 6 significa n + 2 multiplo di 6; resto 7 nella divisione per 9 significa n + 2 multiplo di 9. Quindi n + 2 è multiplo del mcm(6; 9) = 18: n = 16, 34, 52, … cioè n = 16 + 18k. Deve essere 16 + 18k ≤ 200, cioè k ≤ 10,2: k = 0, 1, …, 10, in tutto 11 valori (l'ultimo è 196).`,
  trap: `Usare 6 · 9 = 54 come passo (16, 70, 124, 178: 4 valori) invece del mcm 18. Il 12 viene da 200 ÷ 18 ≈ 11,1 arrotondato per eccesso senza controllare il primo valore (16) e l'ultimo (196); il 10 dall'errore opposto.`,
  patt: 'Resti e congruenze' },

{ k: 'q-rapporti', diff: 'difficile', lang: 'it',
  stem: `In un corso il rapporto tra studenti e studentesse è di 3 a 2. Se arrivano 10 nuove studentesse e 5 studenti lasciano il corso, il rapporto diventa di 5 a 6. Quanti iscritti c'erano all'inizio?`,
  ...put('50', ['40', '60', '75'], 3),
  sol: `Siano 3k gli studenti e 2k le studentesse. Dopo le variazioni: (3k − 5) ÷ (2k + 10) = 5/6, quindi 18k − 30 = 10k + 50, 8k = 80 e k = 10. All'inizio: 30 studenti e 20 studentesse, in tutto 50. (Controllo: 25 studenti e 30 studentesse, cioè 25 : 30 = 5 : 6.)`,
  trap: `Il rapporto 3 : 2 non è un conteggio: 3 + 2 = 5 indica solo i «blocchi». Rispondere 75 significa risolvere il caso «numeri uguali» (3k − 5 = 2k + 10, k = 15) invece del rapporto 5 : 6. 40 e 60 sono totali scelti a caso, che non soddisfano il rapporto finale.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-scaglioni', diff: 'difficile', lang: 'it',
  stem: `In un Paese l'imposta sul reddito si calcola per scaglioni: aliquota del 20% sulla parte di reddito fino a 20.000 € e del 40% sulla parte oltre i 20.000 €. Una persona paga in tutto 16.000 € di imposta. Qual è la sua aliquota media, cioè il rapporto tra imposta e reddito?`,
  ...put('32%', ['40%', '30%', '35%'], 0),
  sol: `Sui primi 20.000 € l'imposta è 20% · 20.000 = 4.000 €. I restanti 16.000 − 4.000 = 12.000 € sono il 40% della parte oltre soglia: 12.000 ÷ 0,40 = 30.000 €. Il reddito è 20.000 + 30.000 = 50.000 € e l'aliquota media è 16.000 ÷ 50.000 = 32%.`,
  trap: `Il 40% è l'aliquota marginale (quella dell'ultimo scaglione), non la media. Il 30% è la media semplice di 20% e 40%, ma i due scaglioni pesano in modo diverso (20.000 e 30.000 €). Il 35% è un valore intermedio senza calcolo.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-torneo', diff: 'media', lang: 'it',
  stem: `In un torneo ogni squadra incontra una sola volta tutte le altre e in tutto si giocano 45 partite. Se prima dell'inizio si ritirassero 3 squadre, quante partite si giocherebbero?`,
  ...put('21', ['18', '24', '30'], 2),
  sol: `Con n squadre le partite sono n(n − 1) ÷ 2 = 45, cioè n(n − 1) = 90 e n = 10. Con 3 squadre in meno, n = 7: 7 · 6 ÷ 2 = 21 partite.`,
  trap: `Togliere 3 partite per squadra ritirata: 45 − 3 · 9 = 18 conta due volte le partite tra le squadre ritirate. Togliere 3 · 7 = 21 (scontri tra ritirate e rimaste) dà 24 e dimentica quelli tra le ritirate. 30 è una proporzione senza fondamento (45 · 7/10 arrotondato).`,
  patt: 'Combinazioni vs permutazioni' },

{ k: 'q-cifre', diff: 'difficile', lang: 'it',
  stem: `Quanti numeri di tre cifre hanno le cifre in ordine strettamente crescente da sinistra a destra (come 135 o 289)?`,
  ...put('84', ['120', '504', '56'], 0),
  sol: `Scelte tre cifre diverse, c'è un solo modo di metterle in ordine crescente: basta contare i gruppi di tre cifre. Lo 0, essendo la cifra più piccola, andrebbe per forza davanti, e un numero di tre cifre non può iniziare con 0. Quindi si scelgono 3 cifre tra 1, 2, …, 9: C(9; 3) = 9 · 8 · 7 ÷ 6 = 84.`,
  trap: `Includere lo 0 (C(10; 3) = 120) dà numeri con lo 0 davanti, che non sono di tre cifre. 504 = 9 · 8 · 7 conta anche l'ordine, mentre qui l'ordine è fissato dalla regola. 56 è C(8; 3): scarta una cifra a caso.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-insiemi', diff: 'difficile', lang: 'it',
  stem: `In un gruppo di 120 persone il 70% parla inglese, il 50% parla francese e il 20% non parla nessuna delle due lingue. Tra le persone che parlano francese, quale percentuale parla anche inglese?`,
  ...put('80%', ['48%', '40%', '70%'], 1),
  sol: `Inglese: 84 persone; francese: 60; nessuna delle due: 24. Chi parla almeno una lingua è 120 − 24 = 96; chi le parla entrambe è 84 + 60 − 96 = 48. Tra i 60 che parlano francese, 48 parlano anche inglese: 48 ÷ 60 = 80%.`,
  trap: `48 è il numero di persone, non la percentuale; 40% è 48 ÷ 120, cioè la quota sul gruppo intero invece che sui francofoni; 70% è la quota degli anglofoni nell'intero gruppo. Fare 70% + 50% − 100% = 20% dimentica il 20% che non parla nessuna lingua.`,
  patt: 'Insiemi sovrapposti' },

{ k: 'q-tiratori', diff: 'difficile', lang: 'it',
  stem: `Tre tiratori sparano ciascuno un colpo al bersaglio, in modo indipendente. Le probabilità di centrare il bersaglio sono 1/2 per il primo, 1/3 per il secondo e 1/4 per il terzo. Qual è la probabilità che il bersaglio sia centrato da esattamente uno dei tre?`,
  ...put(fr(11, 24), [fr(1, 4), fr(3, 4), fr(13, 24)], 3),
  sol: `Esattamente uno: centra solo il primo (1/2 · 2/3 · 3/4 = 6/24), oppure solo il secondo (1/2 · 1/3 · 3/4 = 3/24), oppure solo il terzo (1/2 · 2/3 · 1/4 = 2/24). Somma: 11/24.`,
  trap: `1/4 è la probabilità che nessuno colpisca (1/2 · 2/3 · 3/4) e 3/4 quella che almeno uno colpisca: sono gli altri due eventi tipici del problema. 13/24 è la probabilità dell'evento complementare di «esattamente uno».`,
  patt: 'Probabilità: eventi indipendenti' },

{ k: 'q-mediana', diff: 'media', lang: 'it',
  stem: `La media aritmetica di tre numeri interi positivi è 10 e la loro mediana è 8. Qual è il più grande dei tre numeri?`,
  ...put('Non è determinabile', ['14', '22', '16'], 1),
  sol: `La somma dei tre numeri è 30 e quello centrale è 8, quindi gli altri due sommano 22: (a; 8; 22 − a) con a intero da 1 a 8. Il numero più grande può essere 14 (se a = 8), 15, 16, …, fino a 21 (se a = 1): non è unico, quindi non è determinabile.`,
  trap: `Trovare un caso che funziona (per esempio 8, 8, 14) e fermarsi: la domanda chiede un valore, e i dati ne lasciano molti. 22 non è raggiungibile (richiederebbe il minimo a 0, ma i numeri sono positivi) ed è l'esca di chi dimentica il vincolo.`,
  patt: 'Sufficienza dei dati' }
];

/* V — 16 domande */
const V = [

{ k: 'v-formazione', diff: 'media', lang: 'it',
  claim: `Tra i dipendenti promossi nel 2025 quelli che non hanno frequentato il corso sono più di dieci.`,
  passage: `L'azienda Fornace ha organizzato nel 2025 un corso facoltativo di formazione sulla sicurezza informatica. Dei 200 dipendenti, 120 hanno frequentato il corso e 80 no. Alla fine dell'anno sono stati promossi il 25% dei dipendenti che hanno frequentato il corso e il 10% di quelli che non lo hanno frequentato. La direzione ha precisato che le promozioni sono state decise dai responsabili di reparto, senza obbligo di tenere conto della frequenza al corso, e che il corso sarà riproposto nel 2026 con un programma più breve.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «120 hanno frequentato il corso e 80 no» e «il 10% di quelli che non lo hanno frequentato». I promossi tra chi non ha frequentato sono il 10% di 80 = 8, e 8 non è più di dieci. L'affermazione è contraddetta da un dato che si ricava con un calcolo semplice.`,
  trap: `Rispondere «non ricavabile» perché il brano non scrive mai quanti sono i promossi che non hanno frequentato il corso: il numero si ricava con una percentuale. Oppure leggere «10%» come «10 persone» e giudicare l'affermazione vera.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-pilreale', diff: 'media', lang: 'it',
  passage: `Quando gli economisti confrontano la ricchezza prodotta da un Paese in anni diversi, distinguono tra PIL nominale, calcolato ai prezzi correnti di ciascun anno, e PIL reale, calcolato invece ai prezzi di un anno di riferimento fissato una volta per tutte. Nel 2025 il PIL nominale di Alfa è cresciuto del 5%, ma i prezzi sono aumentati in media del 3%: per questo la crescita del PIL reale è stata molto più contenuta, intorno al 2%. Chi si limitasse a leggere il dato nominale sarebbe indotto a sovrastimare l'aumento della produzione di beni e servizi, perché quel dato include anche l'effetto dei prezzi. Alcuni analisti preferiscono il PIL pro capite reale, che tiene conto anche della crescita della popolazione.`,
  stem: `Nel brano, l'aggettivo «reale» riferito al PIL indica un PIL:`,
  ...put(`calcolato ai prezzi di un anno di riferimento, così da togliere l'effetto della variazione dei prezzi.`,
    [`corretto per la crescita della popolazione, cioè diviso per il numero di abitanti.`,
     `che comprende soltanto i beni materiali effettivamente prodotti, esclusi i servizi.`,
     `calcolato ai prezzi correnti di ciascun anno, e quindi più vicino all'esperienza quotidiana dei consumatori.`], 3),
  sol: `Frase chiave: il PIL reale è «calcolato … ai prezzi di un anno di riferimento fissato una volta per tutte», e il brano spiega che il dato nominale «include anche l'effetto dei prezzi». «Reale» significa quindi depurato dalla variazione dei prezzi. Il PIL che tiene conto della popolazione è un'altra misura, il PIL «pro capite».`,
  trap: `Confondere «reale» con «pro capite» (la terza frase del brano parla del PIL pro capite reale, che è una combinazione delle due cose), o dare a «reale» il significato quotidiano di «concreto, materiale». L'opzione sui prezzi correnti descrive il PIL nominale, cioè il contrario.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-necessario', diff: 'difficile', lang: 'it',
  passage: `Il bando «Impresa Futura» prevede che, per ottenere il finanziamento, un'impresa debba possedere la certificazione ambientale di tipo B. La Cantina Rivoli, che non ha la certificazione B ma ha un fatturato in crescita da cinque anni, sta valutando se presentare domanda. Il suo consulente sostiene che, senza la certificazione B, la Cantina non potrà ottenere il finanziamento, e consiglia di rinunciare alla domanda, che costerebbe circa 8.000 euro, e di investire quella somma nell'ottenimento della certificazione. Il consulente ricorda che nel bando dell'anno scorso sono state presentate 90 domande e ne sono state finanziate 25.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione del consulente?`,
  ...put(`Nei bandi degli anni precedenti nessuna delle imprese prive della certificazione B ha ottenuto il finanziamento.`,
    [`Nei bandi degli anni precedenti tutte le imprese in possesso della certificazione B hanno ottenuto il finanziamento.`,
     `L'ottenimento della certificazione B richiede in media sei mesi di lavoro.`,
     `Il finanziamento del bando può coprire fino al 50% delle spese del progetto.`], 0),
  sol: `La conclusione del consulente è che la certificazione B sia una condizione necessaria: «senza la certificazione B, la Cantina non potrà ottenere il finanziamento». La conferma più diretta è che in passato nessuna impresa senza certificazione B è stata finanziata. L'opzione «tutte quelle con la certificazione sono state finanziate» dice che la certificazione è sufficiente, cosa diversa.`,
  trap: `Scegliere la seconda opzione perché «parla di certificazione e di finanziamento»: mostra che avere la certificazione basta, non che serva. Nessun dato su chi ce l'ha dice qualcosa su chi non ce l'ha. Le altre due sono di contorno.`,
  patt: 'Necessario vs sufficiente' },

{ k: 'v-parco', diff: 'media', lang: 'it',
  claim: `Alle 22 di un giorno di luglio una residente di una via confinante può attraversare il parco con il proprio cane al guinzaglio per tornare a casa.`,
  passage: `Il regolamento del parco comunale consente l'ingresso dei cani durante tutto l'anno, purché siano tenuti al guinzaglio, mentre nell'area giochi per bambini l'accesso è vietato agli animali di qualsiasi specie. Nelle ore serali, dalle 21 alle 7, il parco è chiuso al pubblico, ma i residenti delle vie confinanti possono attraversarlo con i propri cani per raggiungere l'abitazione. Il regolamento prevede inoltre che le feste di compleanno nell'area picnic siano comunicate all'ufficio comunale almeno tre giorni prima.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «Nelle ore serali, dalle 21 alle 7, il parco è chiuso al pubblico, ma i residenti delle vie confinanti possono attraversarlo con i propri cani per raggiungere l'abitazione» e «cani … purché siano tenuti al guinzaglio». Alle 22 il parco è chiuso al pubblico, ma una residente di una via confinante può attraversarlo con il cane per tornare a casa; se lo tiene al guinzaglio rispetta anche la regola generale. È un esempio concreto coerente con le regole: l'affermazione è vera.`,
  trap: `Fermarsi alla chiusura serale («alle 22 il parco è chiuso») e rispondere «falsa», senza leggere l'eccezione per i residenti. Oppure «non ricavabile» perché il brano non cita «luglio» o «alle 22»: basta che l'orario rientri nella fascia 21–7 e il mese sia compreso in «durante tutto l'anno».`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-case', diff: 'media', lang: 'it',
  passage: `Nel 2025 a Valverde le abitazioni vendute sono state 45.000, il 10% in meno rispetto al 2024, mentre il prezzo medio per abitazione è salito dell'8%, raggiungendo i 270.000 euro. L'agenzia immobiliare regionale attribuisce il calo delle compravendite soprattutto al rialzo dei tassi sui mutui, mentre l'associazione dei costruttori ritiene che abbia pesato di più la diminuzione dei nuovi cantieri; l'ufficio statistico precisa che i dati disponibili non permettono di stabilire quale delle due spiegazioni sia corretta.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put(`Nel 2024 le abitazioni vendute a Valverde erano 50.000.`,
    [`Nel 2025 il valore complessivo delle compravendite è aumentato rispetto al 2024.`,
     `Nel 2024 il prezzo medio per abitazione era di 248.400 euro.`,
     `Il calo delle compravendite del 2025 è stato causato dal rialzo dei tassi sui mutui.`], 3),
  sol: `Frasi chiave: «45.000, il 10% in meno rispetto al 2024» e «salito dell'8%». Il 2025 è il 90% del 2024: 45.000 ÷ 0,9 = 50.000 abitazioni nel 2024. Le altre: valore = quantità · prezzo, e 0,90 · 1,08 = 0,972, quindi il valore complessivo è sceso di circa il 3%; il prezzo del 2024 era 270.000 ÷ 1,08 = 250.000, non 248.400 (che è il 92% di 270.000); sulle cause l'ufficio statistico dice che i dati non permettono di scegliere.`,
  trap: `Applicare la percentuale alla base sbagliata: il 2024 si ricava dividendo per 0,9 e per 1,08, non togliendo il 10% o l'8% dal dato del 2025. Un prezzo più alto e meno vendite sembrano «compensarsi», ma 0,9 · 1,08 è minore di 1. Il nesso con i tassi è una delle due tesi riportate, non un fatto.`,
  patt: 'Base della percentuale' },

{ k: 'v-biblioteca', diff: 'media', lang: 'it',
  claim: `L'aumento dei prestiti del 2024 è dovuto soprattutto all'estensione dell'orario di apertura.`,
  passage: `In una città di medie dimensioni, nel 2024 la biblioteca comunale ha esteso l'orario di apertura, passando da 40 a 56 ore settimanali e aprendo anche la domenica mattina. Nello stesso anno i prestiti di libri sono aumentati del 18% rispetto al 2023, mentre le iscrizioni di nuovi utenti sono cresciute del 7%. Il Comune ha inoltre avviato una campagna di promozione della lettura nelle scuole, i cui risultati saranno valutati nel 2026. L'assessore alla cultura ha definito «incoraggianti» i dati.`,
  opts: VFN, ans: 1,
  sol: `Il brano riporta tre fatti (orario esteso, prestiti +18%, campagna nelle scuole) ma non dice che l'aumento dei prestiti sia dovuto all'orario, né che non lo sia: la parola «soprattutto» attribuisce una causa e una proporzione che il testo non fornisce. L'affermazione non è né confermata né smentita.`,
  trap: `Accettare un nesso che sembra «quasi detto»: due fatti nello stesso anno non implicano che il primo spieghi il secondo (c'è anche la campagna nelle scuole). Non è nemmeno falsa, perché il brano non esclude l'effetto dell'orario.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-leggipiu', diff: 'media', lang: 'it',
  passage: `Dopo aver ridotto del 15% il prezzo dell'abbonamento mensile a «LeggiPiù», un servizio di quotidiani online, la società ha registrato in tre mesi un aumento del 30% degli abbonati. Il direttore marketing ne conclude che l'aumento è stato causato dalla riduzione del prezzo, e propone di applicare un ulteriore ribasso del 10% anche nei prossimi mesi. Il direttore ricorda che nello stesso periodo LeggiPiù non ha modificato i contenuti né gli investimenti pubblicitari e che i prezzi degli abbonamenti dei concorrenti sono rimasti invariati.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del direttore?`,
  ...put(`Nello stesso trimestre il principale concorrente ha chiuso il proprio servizio e una parte dei suoi abbonati si è iscritta a LeggiPiù.`,
    [`Il 40% dei nuovi abbonati ha scelto la formula annuale anziché quella mensile.`,
     `Negli ultimi anni il numero di abbonati ai quotidiani online è cresciuto in tutto il Paese di circa il 5% ogni trimestre.`,
     `Il ribasso del 15% è stato annunciato con un'ampia campagna di comunicazione.`], 2),
  sol: `La conclusione è causale: il ribasso del prezzo avrebbe causato il +30%. La chiusura del concorrente offre una causa alternativa specifica di quel trimestre: molti nuovi abbonati potrebbero essere arrivati comunque. La crescita generale del 5% a trimestre spiega solo una piccola parte del +30%; la formula annuale e la campagna non toccano il nesso.`,
  trap: `Scegliere la crescita del mercato (5% a trimestre): è un'altra spiegazione, ma troppo piccola per spiegare un aumento del 30% e, soprattutto, non specifica di LeggiPiù. La campagna di comunicazione, se mai, rafforza (o confonde) il nesso, non lo indebolisce.`,
  patt: 'Cause alternative' },

{ k: 'v-debito', diff: 'difficile', lang: 'it',
  passage: `Nel 2024 il debito pubblico di Alfa era di 1.800 miliardi di euro, pari al 120% del PIL. Nel 2025 il PIL nominale è cresciuto del 4% e il debito del 2%, arrivando a 1.836 miliardi: il rapporto tra debito e PIL è così sceso a circa il 118%. La spesa per interessi, pari al 3% del PIL, è rimasta invariata, perché il costo medio del debito è salito leggermente mentre il peso del debito sul PIL è diminuito. Il governo ritiene che il rapporto continuerà a scendere solo se il PIL nominale crescerà più del debito; l'agenzia di rating avverte che un forte rialzo dei tassi renderebbe più onerosa la spesa per interessi.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put(`Il rapporto tra debito e PIL è sceso perché il debito si è ridotto in valore assoluto.`,
    [`Nel 2025 il debito pubblico di Alfa è aumentato in valore assoluto.`,
     `Nel 2025 il PIL nominale di Alfa è stato di circa 1.560 miliardi di euro.`,
     `Secondo il governo, il rapporto tra debito e PIL continuerà a scendere solo se il PIL nominale crescerà più del debito.`], 1),
  sol: `Frase chiave: «il debito del 2%, arrivando a 1.836 miliardi» (da 1.800): il debito è salito in valore assoluto, mentre il rapporto è sceso perché il PIL nominale è cresciuto di più (+4%). Il PIL del 2024 era 1.800 ÷ 1,2 = 1.500 miliardi, quindi quello del 2025 è 1.500 · 1,04 = 1.560. Il governo lo dice nell'ultima frase. L'unica affermazione sbagliata è quella sul debito «ridotto in valore assoluto».`,
  trap: `Confondere un rapporto che scende con un numeratore che scende: il rapporto debito/PIL diminuisce anche se il debito cresce, purché il PIL cresca più in fretta. Nelle domande «NON è corretta» si cerca l'unica frase sbagliata, non quella giusta.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-fitness', diff: 'media', lang: 'en',
  passage: `A fitness chain surveyed its 4,000 members by email at the end of the year. Of the 600 members who replied, 85% said they had lost weight thanks to the chain's 12-week programme. The chain's marketing director concludes that the programme helps most of its members to lose weight, and plans to advertise it with the slogan «More than eight members out of ten lose weight». The survey was optional and anonymous, and the questionnaire asked only whether the respondent had lost weight after taking part in the programme.`,
  stem: `Which of the following, if true, most weakens the marketing director's conclusion?`,
  ...put(`Members who gave up the programme after a few weeks were much less likely to answer the survey than members who completed it.`,
    [`Most of the members who replied joined the chain less than a year ago.`,
     `The programme costs the chain more than the weight-loss programmes offered by its competitors.`,
     `The 600 respondents included members of every age group.`], 0),
  sol: `The director generalises from the 600 who replied to all members. If those who quit the programme mostly did not answer, the respondents are not a fair sample of the members who followed it: the 85% overstates the share of members who lose weight. The other options do not affect how representative the sample is (or even support it).`,
  trap: `Looking for an option that is «negative» about the chain (cost) or that mentions the respondents (recent members) without saying anything about who is missing. The weakness is selection: the people who answer are not a random sample of the members.`,
  patt: 'Selezione del campione' },

{ k: 'v-dazio', diff: 'media', lang: 'it',
  claim: `Un'impresa che importa in Valdora tubi di acciaio paga il dazio del 15%.`,
  passage: `Il governo di Valdora ha introdotto un dazio del 15% sulle importazioni di acciaio grezzo (barre, lingotti e billette), mentre i prodotti in acciaio finito, come le lamiere e i tubi, restano esenti. I produttori nazionali di acciaio grezzo hanno accolto la misura con favore; le imprese che usano l'acciaio grezzo come materia prima per i propri semilavorati hanno invece annunciato che dovranno aumentare i prezzi.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «i prodotti in acciaio finito, come le lamiere e i tubi, restano esenti». I tubi sono citati come prodotto esente, quindi chi importa tubi non paga il dazio del 15%, che riguarda soltanto l'acciaio grezzo. L'affermazione è contraddetta dal lessico del brano.`,
  trap: `Rispondere «non ricavabile» perché il brano parla di «acciaio» in generale e non dice esplicitamente che chi importa tubi non paga: l'esenzione è però dichiarata per i tubi. Oppure leggere «dazio sull'acciaio» e dimenticare la distinzione grezzo / finito.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-concorso', diff: 'difficile', lang: 'it',
  passage: `Dal regolamento di un concorso fotografico. Possono partecipare i residenti in regione che abbiano compiuto 16 anni; i minorenni devono presentare l'autorizzazione scritta di un genitore. Ogni partecipante può inviare al massimo tre fotografie, ma le fotografie a colori non possono essere più di una. Le fotografie già pubblicate altrove sono escluse, salvo che l'autore abbia rinunciato per iscritto ai diritti di pubblicazione. Chi supera uno dei limiti sul numero di fotografie viene escluso dal concorso; chi invia una fotografia già pubblicata senza avere rinunciato ai diritti vede esclusa soltanto quella fotografia.`,
  stem: `Giulia, residente in regione, ha 17 anni e ha l'autorizzazione scritta del padre. Invia tre fotografie inedite: due a colori e una in bianco e nero. Quale delle seguenti affermazioni è corretta?`,
  ...put(`Giulia viene esclusa dal concorso, perché invia più di una fotografia a colori.`,
    [`Giulia partecipa con tutte e tre le fotografie, perché ne invia al massimo tre.`,
     `Giulia non può partecipare, perché è minorenne.`,
     `Giulia viene esclusa soltanto dalla fotografia pubblicata altrove, se ce n'è una.`], 3),
  sol: `Giulia rispetta i requisiti personali (residente, 17 anni ≥ 16, autorizzazione del genitore) e il limite di tre fotografie in tutto. Ma il regolamento dice che «le fotografie a colori non possono essere più di una» e che chi «supera uno dei limiti sul numero di fotografie viene escluso dal concorso»: con due fotografie a colori supera il limite sul colore e viene esclusa.`,
  trap: `Controllare un solo limite (tre fotografie in tutto) e dimenticare il limite sul colore. Oppure considerare l'età: i minorenni possono partecipare con l'autorizzazione. L'ultima opzione trasferisce a Giulia la regola sulle foto già pubblicate (che esclude solo la singola foto), ma le sue foto sono inedite.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-sostenibilita', diff: 'media', lang: 'it',
  passage: `Una proposta di legge prevede che le imprese con più di 250 dipendenti pubblichino ogni anno un bilancio di sostenibilità. Le imprese con meno di 50 dipendenti sarebbero escluse; quelle con un numero di dipendenti compreso tra 50 e 250 potrebbero pubblicarlo su base volontaria e ottenere in cambio un credito d'imposta pari al 10% delle spese di consulenza sostenute per redigerlo. Secondo i promotori, il costo medio del bilancio, stimato in 20.000 euro per un'impresa grande, sarebbe compensato dai vantaggi nell'accesso al credito bancario. Le associazioni imprenditoriali sostengono che per le imprese di dimensioni intermedie il costo potrebbe essere proporzionalmente più elevato e chiedono di rinviare di un anno l'entrata in vigore della legge.`,
  stem: `In base al brano, quale delle seguenti affermazioni è corretta?`,
  ...put(`Secondo la proposta, un'impresa con 200 dipendenti che pubblicasse volontariamente il bilancio potrebbe ottenere un credito d'imposta sulle spese di consulenza.`,
    [`Secondo la proposta, un'impresa con 100 dipendenti sarebbe obbligata a pubblicare il bilancio di sostenibilità.`,
     `Le associazioni imprenditoriali chiedono di non approvare la legge.`,
     `Secondo i promotori, i vantaggi nell'accesso al credito sono certi e supereranno i costi in tutte le imprese.`], 1),
  sol: `Frase chiave: le imprese «tra 50 e 250 dipendenti potrebbero pubblicarlo su base volontaria e ottenere in cambio un credito d'imposta pari al 10% delle spese di consulenza». Un'impresa con 200 dipendenti rientra in quella fascia. Le altre: obbligo solo oltre i 250 dipendenti; le associazioni chiedono un rinvio di un anno, non di non approvare; i promotori dicono che il costo «sarebbe compensato», in riferimento a un'impresa grande, non «certo» per tutte.`,
  trap: `Le esche sono costruite sulle parole del brano: «obbligata» al posto di «volontaria» (ambito spostato), «non approvare» al posto di «rinviare», «certi … in tutte le imprese» al posto di un condizionale riferito alle imprese grandi.`,
  patt: 'Periodo o ambito spostato' },
{ k: 'v-sportelli', diff: 'difficile', lang: 'it',
  passage: `Il responsabile di un ufficio postale propone di eliminare i due sportelli riservati ai pacchi e di far gestire sia i pacchi sia le lettere da tutti e sei gli sportelli. Nell'ultimo anno servire un cliente è costato in media 4 minuti per un pacco e 2 minuti per una lettera, e un cliente su tre ritira o spedisce un pacco. Il responsabile osserva che oggi si formano spesso code davanti agli sportelli dei pacchi mentre gli altri sportelli sono liberi, e conclude che, a parità di sportelli, di addetti e di clienti, con la nuova organizzazione i tempi medi di attesa diminuirebbero. La riorganizzazione partirebbe a gennaio e il responsabile intende rivalutarla dopo sei mesi.`,
  stem: `Su quale assunzione si basa principalmente il ragionamento del responsabile?`,
  ...put(`I tempi medi di servizio per i pacchi e per le lettere restano gli stessi anche quando gli addetti non sono più specializzati.`,
    [`I clienti preferiscono sportelli specializzati per tipo di operazione.`,
     `Il numero di clienti che spediscono pacchi crescerà nei prossimi mesi.`,
     `I sei addetti accetteranno di svolgere tutte le operazioni senza un compenso aggiuntivo.`], 2),
  sol: `Il responsabile ragiona così: con sei sportelli tutti uguali non ci sono più sportelli inattivi mentre altri hanno la coda, quindi l'attesa media diminuisce. Il conto funziona solo se il tempo che serve per servire un cliente (4 minuti per un pacco, 2 per una lettera) non aumenta quando gli addetti smettono di essere specializzati. È l'assunzione implicita; se i tempi aumentassero, la conclusione crollerebbe.`,
  trap: `Scegliere un'opzione che tocca i clienti (preferenze, numeri futuri) o i compensi: non servono perché il ragionamento regga. L'assunzione si trova guardando cosa cambia nella nuova organizzazione oltre al numero di sportelli per tipo di operazione: la specializzazione degli addetti.`,
  patt: 'Assunzione implicita' },

{ k: 'v-auto', diff: 'difficile', lang: 'it',
  claim: `Tra gli intervistati che abitano fuori dal centro storico, la maggior parte usa l'auto almeno tre volte a settimana.`,
  passage: `Un sondaggio condotto su 1.000 residenti di una città ha rilevato che il 62% degli intervistati usa l'auto almeno tre volte a settimana. Tra questi utenti abituali dell'auto, il 70% abita fuori dal centro storico. Il sondaggio ha un margine di errore del 3%. L'amministrazione comunale ha annunciato che in autunno estenderà la zona a traffico limitato e che i dati del sondaggio serviranno a valutare gli effetti della misura. Gli intervistati sono stati scelti in modo da rappresentare per età e quartiere l'intera popolazione.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «il 62% usa l'auto almeno tre volte a settimana» e «tra questi … il 70% abita fuori dal centro storico». Gli utenti abituali dell'auto sono 620, di cui 434 fuori dal centro. Ma quanti intervistati abitano in tutto fuori dal centro? Il brano non lo dice: potrebbero essere 434 (e allora tutti usano l'auto) oppure 1.000 (e allora il 43,4% soltanto). Il dato non permette di decidere.`,
  trap: `Scambiare «il 70% di chi usa l'auto abita fuori dal centro» con «il 70% di chi abita fuori dal centro usa l'auto»: la percentuale è calcolata su un gruppo (gli automobilisti), non sull'altro. È il classico errore di base: manca il totale di chi abita fuori dal centro.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-plastica', diff: 'media', lang: 'it',
  passage: `Due anni fa il comune di Rivabella ha vietato la distribuzione gratuita di sacchetti di plastica nei negozi. In seguito il Comune ha rilevato che la quantità di sacchetti di plastica raccolti ogni mese sulle spiagge cittadine è diminuita del 30% rispetto ai due anni precedenti. L'assessore all'ambiente conclude che il divieto ha ridotto l'inquinamento delle spiagge da sacchetti di plastica e propone di estenderlo agli imballaggi monouso. Il Comune precisa che le rilevazioni sono state effettuate sempre dalla stessa squadra, con lo stesso metodo e nelle stesse spiagge, e che i controlli nei negozi hanno rilevato un'applicazione del divieto superiore al 90%.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione dell'assessore?`,
  ...put(`Nelle spiagge di un comune vicino, dove non è stato introdotto alcun divieto, la quantità di sacchetti raccolti è rimasta praticamente invariata nello stesso periodo.`,
    [`Il numero di turisti che hanno visitato le spiagge cittadine in questi due anni è rimasto stabile.`,
     `La maggior parte dei cittadini si dichiara favorevole all'estensione del divieto agli imballaggi monouso.`,
     `I sacchetti di carta, che hanno sostituito quelli di plastica, costano il doppio.`], 3),
  sol: `La conclusione è causale: il divieto avrebbe ridotto i sacchetti sulle spiagge. Un confronto con spiagge di un comune senza divieto, dove la quantità non è cambiata, mostra che il calo non dipende da fattori generali (clima, abitudini, stagioni) comuni a entrambe le zone: rafforza molto il nesso. I turisti stabili eliminano una sola causa alternativa; le altre due opzioni non riguardano il nesso.`,
  trap: `Scegliere i turisti stabili: aiuta, ma esclude un solo fattore; il confronto con un comune senza divieto li esclude tutti insieme. Le opinioni dei cittadini e il costo dei sacchetti di carta non dicono nulla su cosa abbia ridotto i sacchetti di plastica.`,
  patt: 'Rafforzare con un confronto' },

{ k: 'v-puntualita', diff: 'media', lang: 'it',
  passage: `Il sindaco di Montecrisi ha dichiarato: «Nel 2025 il nostro trasporto pubblico è stato il più puntuale tra le grandi città italiane: il 94% delle corse è arrivato entro cinque minuti dall'orario previsto». La percentuale è stata calcolata dall'azienda di trasporto sulle sole corse effettuate; nel 2025 le corse cancellate sono state il 6% di quelle programmate. L'azienda sostiene che i ritardi dipendono soprattutto dal traffico e che l'introduzione di corsie riservate nel 2024 ha migliorato la regolarità. Il confronto con le altre grandi città è stato ricavato da un rapporto nazionale.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione del sindaco?`,
  ...put(`Il modo in cui le altre grandi città trattano le corse cancellate nel calcolo della propria percentuale di puntualità.`,
    [`Il numero di passeggeri trasportati ogni giorno a Montecrisi.`,
     `Il costo del biglietto a Montecrisi rispetto alle altre grandi città.`,
     `La percentuale di corse puntuali a Montecrisi negli anni precedenti al 2024.`], 0),
  sol: `L'affermazione è un confronto («il più puntuale tra le grandi città»), e la percentuale di Montecrisi è calcolata «sulle sole corse effettuate»: il 6% di corse cancellate non pesa sul 94%. Se le altre città contassero le cancellazioni come ritardi, i numeri non sarebbero confrontabili: per giudicare l'affermazione serve sapere come le altre città calcolano la loro percentuale.`,
  trap: `Scegliere un dato che riguarda il servizio in generale (passeggeri, costo del biglietto, storia) ma non il confronto: l'affermazione è «più puntuale di», quindi serve un dato che renda i numeri comparabili. Il caso di Montecrisi preso da solo non basta per dire «il più puntuale».`,
  patt: 'Misura e definizione' }
];

/* DI — 16 domande */
const DI = [

{ k: 'd-urna', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Un\'urna contiene soltanto palline rosse, blu e verdi. Estraendo a caso una pallina, la probabilità che sia rossa è maggiore di 1/3?',
    'Le palline blu sono più numerose delle rosse e le verdi sono più numerose delle blu.',
    'Nell\'urna ci sono 12 palline rosse.'),
  ...dsq('DABC', 'A'),
  sol: `Siano R, B, G i numeri delle palline. (1): R < B < G, quindi 3R < R + B + G e R ÷ (R + B + G) < 1/3: la risposta è sempre «no», dunque la (1) basta. (2): con 12 rosse la probabilità dipende dal totale: con 30 palline è 12/30 = 2/5 > 1/3, con 60 palline è 1/5 < 1/3. Non basta.`,
  trap: `Cercare il valore esatto della probabilità: per una domanda sì/no basta un limite. Dalla (1) non si conoscono i numeri, ma si sa che la rossa è la meno numerosa, quindi non può superare un terzo. Dare per insufficiente la (1) perché «mancano i numeri» è l'errore tipico.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-pizzeria', diff: 'media', lang: 'it', asset: gPizzeria(),
  stem: `In quanti mesi, tra gennaio e giugno, il margine della pizzeria (ricavi meno costi) ha superato i 15.000 €?`,
  ...put('2', ['3', '4', '1'], 0),
  sol: `Margine = ricavi − 30 − 0,20 · ricavi = 0,8 · ricavi − 30 (in migliaia). Deve essere maggiore di 15: 0,8 · ricavi > 45, cioè ricavi > 56,25. I mesi con ricavi maggiori di 56,25 sono marzo (60) e giugno (72): 2 mesi. (Margini: gen 2, feb 10, mar 18, apr 6, mag 13,2, giu 27,6.)`,
  trap: `Togliere solo i costi fissi (ricavi > 45): febbraio, marzo, maggio e giugno, cioè 4 mesi (aprile, con 45 esatti, non supera 15). Usare un costo variabile del 15% invece del 20% porta a 3 mesi (maggio a 54 passerebbe). Il costo variabile va applicato ai ricavi di ogni mese.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-tabcanali', diff: 'media', lang: 'it', asset: tCanali(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put(`Il canale Ingrosso rappresenta esattamente un quarto delle unità vendute complessivamente.`,
    [`Le vendite online di Alfa sono inferiori a quelle di Beta.`,
     `Nel canale Negozio, Alfa vende più del doppio di Beta e Gamma messi insieme.`,
     `Il canale Online ha venduto più unità del canale Negozio.`], 2),
  sol: `Le percentuali sono di riga: servono le unità. Online: Alfa 60, Beta 60, Gamma 30 (in tutto 150). Negozio: Alfa 100, Beta 45, Gamma 5 (150). Ingrosso: Alfa 40, Beta 45, Gamma 15 (100). Alfa online (60) e Beta online (60) sono uguali, quindi la prima è falsa; Negozio: 100 contro 2 · (45 + 5) = 100, non «più del doppio»; Online e Negozio vendono 150 ciascuno. Ingrosso: 100 su 400 = un quarto, vera.`,
  trap: `Leggere le percentuali come numeri: 30% < 40% fa credere che Alfa venda meno di Beta online, ma Alfa vende 200 mila unità e Beta 150 mila. Le altre due sono costruite in pareggio apposta (100 contro 100; 150 contro 150): «più di» non è «quanto».`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-turni', diff: 'difficile', lang: 'it',
  asset: dp([
    `In un reparto lavorano 12 infermieri. Ciascuno lavora in almeno uno dei tre turni: mattina, pomeriggio, notte.`,
    `8 infermieri lavorano di mattina e 7 lavorano di pomeriggio.`,
    `Chi lavora di notte lavora anche di pomeriggio.`
  ], [
    `A. Esattamente 3 infermieri lavorano sia di mattina sia di pomeriggio.`,
    `B. Almeno un infermiere lavora di notte.`,
    `C. Chi non lavora di pomeriggio lavora di mattina.`,
    `D. Almeno 6 infermieri lavorano soltanto di mattina.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  ...put('Sia la A sia la C', ['Solo la A', 'Sia la B sia la D', 'Sia la C sia la D'], 1),
  sol: `Chi lavora di notte lavora anche di pomeriggio, quindi ogni infermiere lavora di mattina o di pomeriggio: i due insiemi coprono tutti i 12. Allora chi lavora in entrambi i turni è 8 + 7 − 12 = 3, esattamente (A vera). C: chi non lavora di pomeriggio non lavora nemmeno di notte (contrapposta del dato 3) e deve avere un turno, quindi è di mattina (C vera). B: non è detto che ci sia qualcuno di notte (falsa o vera a seconda dei casi). D: chi lavora di mattina ma non di pomeriggio è 8 − 3 = 5, non almeno 6 (D falsa).`,
  trap: `Non vedere C, che non contiene numeri: è la contrapposta del terzo dato («chi non lavora di pomeriggio non lavora di notte»), accostata ai turni di mattina. Per A basta ricordare che ogni infermiere ha almeno un turno e che la notte non aggiunge nessuno fuori da mattina e pomeriggio.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-gruppi', diff: 'media', lang: 'it', ds: true,
  stem: ds('In un gruppo di 60 persone, quante parlano sia inglese sia spagnolo?',
    '45 persone parlano inglese e 35 parlano spagnolo.',
    'Ciascuna delle 60 persone parla almeno una delle due lingue.'),
  ...dsq('ADCB', 'B'),
  sol: `Insieme: i due elenchi sommano 45 + 35 = 80, ma le persone sono 60 e tutte parlano almeno una lingua; i 20 «in più» sono chi parla entrambe le lingue, e vengono contati due volte: 80 − 60 = 20. Da sola la (1) non basta (le persone che parlano entrambe le lingue possono essere da 20 a 35, se qualcuno non parla né l'una né l'altra); da sola la (2) non dice nulla sui numeri.`,
  trap: `Pensare che la (1) basti perché «ci sono i numeri»: senza sapere se qualcuno non parla nessuna lingua, la sovrapposizione non è fissata. Con la sola (2) manca qualsiasi dato sui singoli gruppi.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-lavoro', diff: 'media', lang: 'it', asset: gLavoro(),
  stem: `Di quanto è variato, in percentuale, il numero dei disoccupati tra il 2021 e il 2024?`,
  ...put('−12%', ['−20%', '−2%', '+10%'], 2),
  sol: `Disoccupati = tasso · forza lavoro. 2021: 10% di 20 milioni = 2,0 milioni. 2024: 8% di 22 milioni = 1,76 milioni. Variazione: (1,76 − 2,0) ÷ 2,0 = −12%.`,
  trap: `Guardare solo il tasso: da 10% a 8% è −20% in relazione, o −2 punti, ma i disoccupati dipendono anche da quanto è cresciuta la forza lavoro (+10%). Il +10% è proprio la crescita della forza lavoro scambiata per quella dei disoccupati.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-reparti', diff: 'difficile', lang: 'it',
  asset: dp([
    `Un'azienda ha 36 dipendenti, divisi in tre reparti.`,
    `Ogni reparto ha almeno 8 dipendenti.`,
    `Il reparto più grande ha esattamente il doppio dei dipendenti del reparto più piccolo.`
  ], [
    `A. Il reparto più piccolo ha più di 8 dipendenti.`,
    `B. Il reparto più grande ha almeno 16 dipendenti.`,
    `C. Il reparto intermedio ha più di 12 dipendenti.`,
    `D. Esiste un reparto con esattamente 10 dipendenti.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  ...put('Sia la C sia la D', ['Solo la A', 'Sia la A sia la C', 'Sia la B sia la D'], 0),
  sol: `Siano x ≤ y ≤ 2x i tre reparti: x + y + 2x = 36, quindi y = 36 − 3x. Dev'essere x ≥ 8 e x ≤ y (x ≤ 9) e y ≤ 2x (x ≥ 7,2). Le uniche terne sono (8; 12; 16) e (9; 9; 18). A: il più piccolo è 8 o 9, quindi A non è né sempre vera né sempre falsa. B: il più grande è 16 o 18, B è sicuramente vera. C: l'intermedio è 12 o 9, mai più di 12: sicuramente falsa. D: nessuna terna contiene 10, sicuramente falsa.`,
  trap: `Con la consegna «sicuramente false» si rischia di indicare la B, che è la vera. La A non è sicuramente falsa: dipende dalla terna (9 sì, 8 no). Per C e D non basta trovare un caso: bisogna elencare tutti i casi compatibili con i tre dati (qui sono solo due).`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-xy', diff: 'media', lang: 'it', ds: true,
  stem: ds('Siano x e y due numeri interi positivi. Il prodotto xy è maggiore di 100?',
    'x è almeno 11 e y è almeno 10.',
    'x + y = 20.'),
  ...dsq('ABDC', 'C'),
  sol: `(1): xy ≥ 11 · 10 = 110 > 100, quindi la risposta è sempre «sì». (2): a somma fissata il prodotto è massimo quando i due numeri sono uguali: xy ≤ 10 · 10 = 100, quindi xy non supera mai 100 e la risposta è sempre «no». Ciascuna affermazione fornisce una risposta unica, anche se opposta.`,
  trap: `Pensare che la (2) non basti perché «ci sono tante coppie con somma 20» (1 e 19, 5 e 15, 10 e 10…): per una domanda sì/no non serve conoscere xy, basta sapere da che parte sta rispetto a 100. Un «no» certo è un'informazione sufficiente quanto un «sì» certo.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-colture', diff: 'media', lang: 'it', asset: tColture(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`In ciascuno dei tre anni la produzione di frumento ha superato la somma di mais e orzo.`,
         `Tra il 2023 e il 2025 la crescita percentuale più alta è stata quella del mais.`,
         `Nel 2025 il mais ha rappresentato più del 36% della produzione totale dei tre cereali.`,
         `Nessuna delle altre risposte è corretta.`], ans: 3,
  sol: `Prima: nel 2023 il frumento è 80 e mais + orzo è 60 + 20 = 80, quindi non lo supera (falsa). Seconda: dal 2023 al 2025 il mais cresce di 12 su 60 = +20%, il frumento di 19 su 80 ≈ +23,8%, l'orzo di 10 su 20 = +50%: la più alta è quella dell'orzo (falsa). Terza: nel 2025 il totale è 99 + 72 + 30 = 201 e il 36% di 201 è 72,36; il mais è 72, quindi non lo supera (falsa). Allora è corretta «Nessuna delle altre risposte».`,
  trap: `Arrotondare: 80 contro 80 («circa uguali» ma non «superiore») e 72 contro 72,36 («circa il 36%») sono costruiti vicino alla soglia. Sulla crescita, il frumento cresce di più in valore assoluto (+19 mila t, contro +12 del mais e +10 dell'orzo), ma non in percentuale: la più alta è quella dell'orzo (+50%), non quella del mais.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-punti', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('In un campionato una squadra ha giocato 10 partite. Ogni vittoria vale 3 punti, ogni pareggio 1 punto, ogni sconfitta 0 punti. Quante partite ha vinto?',
    'La squadra ha totalizzato 17 punti.',
    'La squadra ha pareggiato più di una partita.'),
  ...dsq('BCDA', 'D'),
  sol: `Siano V, P, S vittorie, pareggi e sconfitte, con V + P + S = 10. (1): 3V + P = 17, con P ≤ 10 − V: V = 5 (P = 2, S = 3) oppure V = 4 (P = 5, S = 1); V = 6 darebbe P = −1, V = 3 darebbe P = 8 e S = −1. Quindi V può essere 4 o 5. (2): in entrambi i casi P > 1 (2 e 5): non elimina nessuna delle due. Né da sola né con la (1) si arriva a un solo valore.`,
  trap: `Fermarsi alla prima soluzione trovata (5 vittorie, 2 pareggi, 3 sconfitte) senza cercare le altre. La (2) sembra utile perché «aggiunge un vincolo», ma entrambe le soluzioni la rispettano: un vincolo che non esclude nessun caso non aiuta.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-eta', diff: 'difficile', lang: 'it',
  asset: dp([
    `Cinque amici hanno età espresse da numeri interi di anni, tutte diverse tra loro.`,
    `L'età media dei cinque amici è 20 anni.`,
    `L'amico più giovane ha 14 anni.`
  ], [
    `A. L'amico più anziano ha almeno 23 anni.`,
    `B. Nessuno ha più di 40 anni.`,
    `C. Almeno due amici hanno meno di 20 anni.`,
    `D. L'età mediana dei cinque amici è 20 anni.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  ...put('Sia la A sia la B', ['Solo la A', 'Sia la B sia la C', 'Sia la C sia la D'], 0),
  sol: `La somma delle età è 100; tolto il più giovane (14), gli altri quattro sommano 86 e sono interi diversi tra loro, tutti maggiori di 14. A: il più anziano è minimo quando gli altri sono il più possibile vicini tra loro: 20 + 21 + 22 + 23 = 86, quindi il più anziano ha almeno 23 anni (vera). B: il più anziano è massimo quando gli altri tre sono i più piccoli possibili (15, 16, 17): 86 − 48 = 38, quindi nessuno supera i 38 anni (vera). C e D non sono sicure: (14; 20; 21; 22; 23) ha un solo amico sotto i 20 anni e mediana 21, (14; 15; 16; 25; 30) ha tre amici sotto i 20 e mediana 16.`,
  trap: `Cercare un'unica terna di età invece dei limiti: le età non sono determinate, ma minimo e massimo del più anziano sì. B è una proposizione «di massimo» che si controlla con la terna più piccola possibile; A una «di minimo» con quella più compatta. Per C e D basta un controesempio.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-corsi', diff: 'difficile', lang: 'it', asset: gCorsi(),
  stem: `Di quanto sono variati, tra il 2024 e il 2025, gli incassi totali dalle rette dei nuovi iscritti?`,
  ...put('+140.000 €', ['+100.000 €', '+240.000 €', '+40.000 €'], 1),
  sol: `2024: 120 · 2.000 + 80 · 3.000 + 40 · 4.000 = 240.000 + 240.000 + 160.000 = 640.000 €. 2025: il corso C costa il 25% in meno, cioè 3.000 €: 150 · 2.000 + 60 · 3.000 + 100 · 3.000 = 300.000 + 180.000 + 300.000 = 780.000 €. Variazione: 780.000 − 640.000 = +140.000 €.`,
  trap: `Non applicare lo sconto al corso C (100 · 4.000 = 400.000 → incasso 880.000 e +240.000 €). Applicarlo anche agli iscritti del 2024. Guardare solo il totale degli iscritti (240 contro 290) senza pesare le diverse rette.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-rettangolo', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un rettangolo ha area 48 cm². Qual è il suo perimetro?',
    'Le misure dei lati, in centimetri, sono numeri interi.',
    'La diagonale misura 10 cm.'),
  ...dsq('CABD', 'A'),
  sol: `Siano a e b i lati, con ab = 48. (2): a² + b² = 10² = 100, quindi (a + b)² = a² + b² + 2ab = 100 + 96 = 196 e a + b = 14: il perimetro è 28 cm, un solo valore. (1): le coppie di lati interi con prodotto 48 sono (1; 48), (2; 24), (3; 16), (4; 12), (6; 8), con perimetri 98, 52, 38, 32 e 28 cm: non basta.`,
  trap: `La (1) sembra forte perché restringe i casi a numeri interi, ma lascia cinque rettangoli diversi. La (2) non richiede di trovare i lati: area e diagonale fissano la somma a + b (e quindi il perimetro) con un'identità, senza elencare le coppie.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-farmaci', diff: 'media', lang: 'it',
  asset: dp([
    `Tutti i farmaci venduti senza ricetta sono esposti nello scaffale frontale.`,
    `Nessun farmaco dello scaffale frontale scade entro un anno.`,
    `In farmacia ci sono farmaci venduti senza ricetta.`
  ], [
    `A. Alcuni farmaci venduti senza ricetta scadono entro un anno.`,
    `B. Nessun farmaco che scade entro un anno è venduto senza ricetta.`,
    `C. Alcuni farmaci dello scaffale frontale sono venduti senza ricetta.`,
    `D. Alcuni farmaci che scadono entro un anno sono esposti nello scaffale frontale.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  ...put('Sia la A sia la D', ['Solo la A', 'Sia la B sia la C', 'Solo la D'], 3),
  sol: `I farmaci senza ricetta stanno nello scaffale frontale e nessun farmaco di quello scaffale scade entro un anno: nessun farmaco senza ricetta scade entro un anno (A falsa, B vera). I farmaci senza ricetta esistono (dato 3) e sono nello scaffale frontale: C è vera. D dice il contrario del secondo dato (nessun farmaco dello scaffale frontale scade entro un anno), quindi è falsa. Le proposizioni sicuramente false sono A e D.`,
  trap: `Con la consegna «false» si finisce per indicare la coppia delle vere (B e C). Indicare solo A o solo D dimentica che sono false entrambe per ragioni diverse: la A dalla catena senza ricetta → scaffale frontale → non scade, la D dal secondo dato.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-spese', diff: 'difficile', lang: 'it', asset: tSpese(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel primo trimestre la logistica ha speso più della produzione.`,
         `Nel terzo trimestre la logistica ha speso il triplo del marketing.`,
         `Il marketing ha speso nel secondo trimestre meno che nel primo.`,
         `Nel secondo trimestre la produzione ha speso più del 65% del totale del trimestre.`], ans: 1,
  sol: `Produzione: 2° trim. = 420 − 120 − 150 = 150. Logistica: 1° trim. = 185 − 60 − 75 = 50. Marketing: 2° + 3° trim. = 95 − 30 = 65, nel rapporto 8 : 5 (13 parti da 5): 40 e 25. Controllo con i totali di colonna: 2° trimestre 150 + 60 + 40 = 250, 3° trimestre 150 + 75 + 25 = 250. Prima: 50 contro 120 (falsa). Seconda: 75 = 3 · 25 (vera). Terza: 40 contro 30 (falsa). Quarta: 150 ÷ 250 = 60%, non più del 65% (falsa).`,
  trap: `Dividere i 95 totali del marketing nel rapporto 8 : 5 senza togliere il primo trimestre (30): 8 : 5 si applica solo ai trimestri 2° e 3° (65 in tutto). Con 95 si otterrebbero 58 e 37, che non tornano con i totali di colonna.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-marbles', diff: 'media', lang: 'en', ds: true,
  stem: ds('A bag contains only red and blue marbles. How many blue marbles are there in the bag?',
    'If one marble is drawn at random, the probability that it is red is 3/5.',
    'There are 12 red marbles in the bag.'),
  ...dsq('DABC', 'B', true),
  sol: `(1) alone gives only the ratio red : total = 3 : 5, so blue : red = 2 : 3, but not the actual numbers (6 red and 4 blue, or 12 red and 8 blue, …). (2) alone gives the red marbles but not the blue ones. Together: 12 red are 3/5 of the total, so the total is 12 ÷ 3 · 5 = 20 and there are 20 − 12 = 8 blue marbles.`,
  trap: `Thinking that (1) is enough because it «gives the proportion»: a proportion fixes the ratio, not the number. Or thinking that (2) is enough because it «gives a number»: without a link between red and blue the blue marbles can be any number.`,
  patt: 'Sufficienza dei dati' }
];

/* ================ DISPOSIZIONE IN SCHERMATE DA TRE ================ */
const ROT = ['QVD', 'VDQ', 'DQV', 'QDV', 'VQD', 'DVQ'];
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
  id: '17',
  title: 'Mock 17',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Livello del Mock 15: Quantitativa e Verbale più difficili del Mock 14 (basi delle percentuali, listino dallo scontato con IVA, lavoro con cambio a metà, resti, probabilità condizionata, brani con modali e opzioni quasi tutte plausibili). Data Insights come il Mock 14, con proposizioni «sicuramente vere/false» e sufficienza dei dati.',
  questions: QUESTIONS,
  data: DATA
};
});
