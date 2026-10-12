/* =======================================================================
   Mock 25 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
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
   la domanda per gli script di verifica (tools/check_math_25.py).
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
  'q-negozi': 2,
  'q-media-inversa': 0,
  'q-pallavolo': 3,
  'q-ciclisti': 1,
  'q-serie': 2,
  'q-alberi': 0,
  'q-auto': 3,
  'q-medici': 1,
  'q-quadrato': 2,
  'q-master': 0,
  'q-sistema': 1,
  'q-nondet': 3,
  'q-podio': 1,
  'q-rimbalzo': 0,
  'q-rapporti': 2,
  'q-operai': 1,
  'q-lanci': 3,
  'q-dispari': 0,
  'v-core': 1,
  'v-palestra': 0,
  'v-case': 2,
  'v-universita': 2,
  'v-mensa': 3,
  'v-regola': 0,
  'v-rivabella': 1,
  'v-export': 3,
  'v-bibite': 0,
  'v-flex': 2,
  'v-sanita': 1,
  'd-negozi': 2,
  'd-budget': 0,
  'd-gelati': 1,
  'd-sondaggio': 3,
  'd-tariffe': 0
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
  /* clienti (migliaia) di quattro negozi nel 2024 e nel 2025 */
  negozi: { nomi: ['A', 'B', 'C', 'D'], y24: [40, 100, 20, 60], y25: [50, 115, 27, 75] },
  /* budget mensile di una famiglia (% del totale) */
  budget: { voci: [['Affitto', 40], ['Cibo', 25], ['Trasporti', 15], ['Altro', 20]] },
  /* gelati venduti (migliaia di unità) per mese e ricavi di luglio (migliaia di euro) */
  gelati: { mesi: ['Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set'], unita: [20, 30, 50, 60, 40, 20], ricaviLug: 150 },
  /* sondaggio: fasce di età, intervistati, % di favorevoli */
  sondaggio: { fasce: ['18–34 anni', '35–54 anni', '55 anni e oltre'], n: [200, 300, 500], fav: [60, 40, 30] },
  /* ricavi e costi (milioni di euro) di un'azienda */
  utile: { anni: [2021, 2022, 2023, 2024, 2025], ricavi: [100, 120, 140, 150, 180], costi: [80, 105, 120, 135, 150] },
  /* piani tariffari: canone fisso (euro) e costo al minuto (euro) */
  tariffe: { piani: ['A', 'B', 'C'], fisso: [10, 4, 0], minuto: [0.05, 0.08, 0.12] }
};

/* ======================= tabelle e grafici ======================= */
function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}
const vir = x => String(x).replace('.', ',');

function gNegozi() {
  const D = DATA.negozi;
  return `<figure class="fig"><figcaption>Clienti di quattro negozi, in migliaia</figcaption>` + C.bars({
    labels: D.nomi.map(n => 'Negozio ' + n),
    series: [{ name: '2024', values: D.y24, style: 'outline' }, { name: '2025', values: D.y25 }],
    max: 130, legend: true,
    aria: 'Istogramma dei clienti in migliaia, 2024 e 2025: ' + D.nomi.map((n, i) => 'negozio ' + n + ' ' + D.y24[i] + ' e ' + D.y25[i]).join('; ') + '.'
  }) + `</figure>`;
}

function gBudget() {
  const D = DATA.budget;
  return `<figure class="fig"><figcaption>Come una famiglia ripartisce il budget mensile</figcaption>` + C.pie({
    data: D.voci, title: 'Spesa mensile',
    aria: 'Torta della ripartizione del budget: ' + D.voci.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `</figure>`;
}

function gGelati() {
  const D = DATA.gelati;
  return `<figure class="fig"><figcaption>Gelati venduti da una gelateria, in migliaia di unità</figcaption>` + C.bars({
    labels: D.mesi, series: [{ name: 'Gelati venduti', values: D.unita }], max: 70, legend: false,
    aria: 'Istogramma dei gelati venduti in migliaia di unità: ' + D.mesi.map((m, i) => m + ' ' + D.unita[i]).join(', ') + '.'
  }) + `<p class="fig-note">A luglio i ricavi sono stati di ${D.ricaviLug}.000 euro.</p></figure>`;
}

function tSondaggio() {
  const D = DATA.sondaggio;
  return C.table({
    caption: 'Sondaggio su un nuovo servizio di trasporto, per fascia di età',
    head: ['Fascia di età', 'Intervistati', 'Favorevoli (% della fascia)'],
    rows: D.fasce.map((f, i) => [f, D.n[i], D.fav[i] + '%'])
  });
}

function tUtile() {
  const D = DATA.utile;
  return C.table({
    caption: 'Ricavi e costi di un\'azienda, in milioni di euro',
    head: ['Anno', 'Ricavi', 'Costi'],
    rows: D.anni.map((a, i) => [a, D.ricavi[i], D.costi[i]])
  }) + `<p class="fig-note">Utile = ricavi − costi.</p>`;
}

function tTariffe() {
  const D = DATA.tariffe;
  return C.table({
    caption: 'Tre piani tariffari mensili per la telefonia mobile',
    head: ['Piano', 'Canone fisso (€)', 'Costo al minuto (€)'],
    rows: D.piani.map((p, i) => [p, D.fisso[i], vir(D.minuto[i].toFixed(2))])
  });
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-negozi', diff: 'media', lang: 'it',
  stem: `Lo stesso telefono costa il 20% in più nel negozio A che nel negozio B. Nel negozio A è però in corso uno sconto del 25%. Rispetto al prezzo del negozio B, il prezzo scontato di A è:`,
  ...put('q-negozi', 'il 10% più basso', ['il 5% più basso', 'circa l\'11% più basso', 'il 5% più alto']),
  sol: `Se B costa 100, A costa 120; con lo sconto del 25% A costa 120 · 0,75 = 90. Rispetto a B (100) il prezzo scontato è il 10% più basso.`,
  trap: `Il 5% si ottiene sommando +20% e −25%, ma le due percentuali hanno basi diverse (il prezzo di B e il prezzo di A). Circa l'11% divide la differenza (10) per 90 invece che per 100, cioè prende come base il prezzo scontato di A. «Il 5% più alto» inverte il segno.`,
  patt: 'Base della percentuale' },

{ k: 'q-media-inversa', diff: 'media', lang: 'it',
  stem: `In un test la media dei punteggi di tutti i candidati è 25. I 10 candidati del gruppo A hanno una media di 28 e quelli del gruppo B una media di 23. Quanti sono i candidati del gruppo B?`,
  ...put('q-media-inversa', '15', ['10', '25', '20']),
  sol: `Gli scarti dalla media 25 si devono compensare: il gruppo A sta 3 punti sopra, il gruppo B 2 punti sotto. Quindi 10 · 3 = n · 2 e n = 15. Verifica: (10 · 28 + 15 · 23) ÷ 25 = 625 ÷ 25 = 25.`,
  trap: `10 suppone due gruppi di uguale peso, ma 28 e 23 hanno media semplice 25,5 e non 25; 25 è la media generale, non un numero di persone; 20 si ottiene invertendo il rapporto 3 : 2 (10 · 2). Il gruppo più vicino alla media (B) è il più numeroso.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-pallavolo', diff: 'difficile', lang: 'it',
  stem: `Un allenatore deve scegliere i 6 giocatori che scendono in campo tra 9 atleti, di cui 3 sono palleggiatori. In campo deve esserci esattamente un palleggiatore. In quanti modi può formare la squadra?`,
  ...put('q-pallavolo', '18', ['83', '84', '168']),
  sol: `Il palleggiatore si sceglie in 3 modi; gli altri 5 giocatori si scelgono tra i 6 non palleggiatori: C(6, 5) = 6 modi. In tutto 3 · 6 = 18.`,
  trap: `84 = C(9, 6) ignora il vincolo; 83 = 84 − 1 conta le squadre con «almeno un» palleggiatore; 168 = 3 · C(8, 5) sceglie un palleggiatore e poi gli altri 5 tra tutti gli 8 rimasti, che possono includere altri palleggiatori (e conta più volte la stessa squadra).`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-ciclisti', diff: 'media', lang: 'it',
  stem: `Due città A e B distano 100 km. Alle 8:00 un ciclista parte da A verso B a 20 km/h. Alle 8:30 un secondo ciclista parte da B verso A a 40 km/h. A quanti chilometri da A si incontrano?`,
  ...put('q-ciclisti', '40 km', ['circa 33 km', '50 km', '60 km']),
  sol: `Alle 8:30 il primo ha già percorso 10 km: restano 90 km tra i due, che si riducono di 20 + 40 = 60 km ogni ora. Si incontrano dopo 90 ÷ 60 = 1,5 ore, quando il primo ha percorso altri 20 · 1,5 = 30 km. In tutto 10 + 30 = 40 km da A.`,
  trap: `Circa 33 km ignora il vantaggio del primo ciclista (100 · 20/60); 50 km è il punto medio, che varrebbe solo a velocità uguali; 60 km è la distanza percorsa dal secondo ciclista, non quella da A.`,
  patt: 'Velocità e tempi' },

{ k: 'q-serie', diff: 'difficile', lang: 'it',
  stem: `Due squadre giocano al meglio delle tre partite: vince la serie chi si aggiudica per primo due partite. La squadra Rossa vince ciascuna partita con probabilità ${fr(2, 3)}, indipendentemente dalle altre. Qual è la probabilità che la squadra Rossa vinca la serie?`,
  ...put('q-serie', fr(20, 27), [fr(4, 9), fr(8, 9), fr(2, 3)]),
  sol: `La Rossa vince la serie in due modi: vince le prime due partite (${fr(2, 3)} · ${fr(2, 3)} = ${fr(4, 9)}), oppure ne vince una sola delle prime due e poi la terza: 2 · (${fr(2, 3)} · ${fr(1, 3)}) · ${fr(2, 3)} = ${fr(8, 27)}. In tutto ${fr(4, 9)} + ${fr(8, 27)} = ${fr(20, 27)}.`,
  trap: `4/9 conta solo la serie chiusa in due partite; 8/9 = 1 − (1/3)² suppone che la Rossa perda la serie solo perdendo due partite di fila, ma si perde anche con vittoria, sconfitta, sconfitta; 2/3 è la probabilità di una singola partita: una serie al meglio delle tre favorisce chi è più forte e supera 2/3.`,
  patt: 'Probabilità: eventi indipendenti' },

{ k: 'q-alberi', diff: 'media', lang: 'it',
  stem: `Lungo un viale rettilineo di 120 metri si piantano alberi su entrambi i lati, a distanza di 8 metri l'uno dall'altro, mettendone uno anche all'inizio e uno alla fine di ciascun lato. Quanti alberi servono in tutto?`,
  ...put('q-alberi', '32', ['30', '15', '16']),
  sol: `Su ogni lato gli intervalli sono 120 ÷ 8 = 15 e gli alberi sono uno in più degli intervalli, cioè 16. Sui due lati: 2 · 16 = 32.`,
  trap: `30 conta 15 alberi per lato (solo gli intervalli); 15 e 16 dimenticano uno dei due lati. Con un albero a ciascun estremo gli alberi sono sempre uno in più degli intervalli.`,
  patt: 'Ragionamento laterale' },

{ k: 'q-auto', diff: 'media', lang: 'it',
  stem: `Un'auto nuova perde ogni anno il 20% del valore che aveva all'inizio di quell'anno. Dopo tre anni, quanta parte del valore iniziale ha perso, circa?`,
  ...put('q-auto', 'circa il 49%', ['il 60%', 'circa il 51%', 'il 36%']),
  sol: `Ogni anno il valore si moltiplica per 0,8: dopo tre anni resta 0,8 · 0,8 · 0,8 = 0,512 del valore iniziale. Ha quindi perso 1 − 0,512 = 0,488, circa il 49%.`,
  trap: `Il 60% somma tre volte il 20% senza ricalcolare la base ogni anno; circa il 51% è la parte che resta, non quella persa; il 36% è la perdita dopo due anni (1 − 0,64). Bisogna leggere «perso» e non «rimasto».`,
  patt: 'Percentuali composte' },

{ k: 'q-medici', diff: 'media', lang: 'it',
  stem: `La città A ha 150.000 abitanti e 3 medici ogni 1.000 abitanti; la città B ha 100.000 abitanti e 4 medici ogni 1.000 abitanti. Nelle due città insieme, quanti medici ci sono ogni 1.000 abitanti?`,
  ...put('q-medici', '3,4', ['3,5', '3,6', '7']),
  sol: `Medici di A: 150 · 3 = 450; medici di B: 100 · 4 = 400. In tutto 850 medici su 250.000 abitanti, cioè 850 ÷ 250 = 3,4 ogni 1.000 abitanti.`,
  trap: `3,5 è la media semplice dei due tassi, che trascura le dimensioni diverse delle città; 3,6 è la media con i pesi scambiati (150 a B e 100 ad A); 7 somma i due tassi.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-quadrato', diff: 'difficile', lang: 'it',
  stem: `Qual è il più piccolo numero intero positivo n tale che 60 · n sia un quadrato perfetto?`,
  ...put('q-quadrato', '15', ['5', '30', '60']),
  sol: `60 = 2<sup>2</sup> · 3 · 5: un numero è un quadrato perfetto se tutti i suoi fattori primi compaiono con esponente pari. Il 3 e il 5 compaiono una sola volta e vanno completati: n = 3 · 5 = 15 e 60 · 15 = 900 = 30<sup>2</sup>.`,
  trap: `5 completa solo il fattore 5 (60 · 5 = 300 non è un quadrato); 30 porta a 1.800 = 2<sup>3</sup> · 3<sup>2</sup> · 5<sup>2</sup>, in cui il 2 ha esponente dispari; 60 dà 3.600 = 60<sup>2</sup>, che è un quadrato, ma non il più piccolo possibile.`,
  patt: 'Numeri e divisori' },

{ k: 'q-master', diff: 'media', lang: 'it',
  stem: `Il 55% degli iscritti a un master è straniero; tra gli stranieri il 40% è europeo. Tra gli italiani il 60% proviene dal Nord. Se gli stranieri europei sono 44, quanti sono gli italiani del Nord?`,
  ...put('q-master', '54', ['36', '66', '90']),
  sol: `Gli stranieri europei sono il 40% del 55% degli iscritti, cioè il 22%: 44 sono il 22%, quindi gli iscritti sono 200. Gli italiani sono il 45%, cioè 90, e il 60% di 90 è 54.`,
  trap: `90 sono tutti gli italiani; 66 = 60% di 110 usa gli stranieri (55% di 200) al posto degli italiani; 36 = 40% di 90 inverte le due percentuali.`,
  patt: 'Percentuali composte' },

{ k: 'q-sistema', diff: 'media', lang: 'it',
  stem: `Tre chili di mele e due chili di pere costano in tutto 12 €. Un chilo di mele costa 1 € in meno di un chilo di pere. Quanto costano 5 kg di mele e 4 kg di pere?`,
  ...put('q-sistema', '22 €', ['21,60 €', '23 €', '24 €']),
  sol: `Se le pere costano p euro al chilo, le mele costano p − 1: 3(p − 1) + 2p = 12, cioè 5p = 15 e p = 3; le mele costano 2 €/kg. Allora 5 · 2 + 4 · 3 = 22 €.`,
  trap: `21,60 € usa il prezzo medio 12 ÷ 5 = 2,40 € per tutti i 9 kg, ma mele e pere costano in modo diverso; 23 € scambia i prezzi (5 · 3 + 4 · 2); 24 € raddoppia il totale (12 · 2) senza guardare le quantità.`,
  patt: 'Algebra a parole' },

{ k: 'q-nondet', diff: 'media', lang: 'it',
  stem: `In un gruppo di 40 persone, il 60% parla inglese e il 50% parla francese. Quante persone parlano entrambe le lingue?`,
  ...put('q-nondet', 'Non è determinabile', ['4', '10', '20']),
  sol: `Parlano inglese 24 persone e francese 20. Chi parla entrambe le lingue è almeno 24 + 20 − 40 = 4 e al massimo 20: tutti i valori da 4 a 20 sono possibili. Mancano dati per sceglierne uno: non è determinabile.`,
  trap: `Ciascun numero è compatibile con i dati (4 è il minimo, 20 il massimo, 10 un valore intermedio) ma nessuno è obbligato. Con due insiemi sovrapposti si ricava solo un intervallo, a meno che il testo dica anche quante persone non parlano nessuna delle due lingue.`,
  patt: 'Sufficienza dei dati' },

{ k: 'q-podio', diff: 'media', lang: 'it',
  stem: `A una gara partecipano 7 atleti, tra cui Marco. In quanti modi può formarsi il podio (primo, secondo e terzo posto, tutti distinti) se Marco deve essere sul podio?`,
  ...put('q-podio', '90', ['120', '210', '45']),
  sol: `Marco può occupare uno dei 3 gradini del podio. Gli altri due gradini si assegnano ai restanti 6 atleti in 6 · 5 = 30 modi. In tutto 3 · 30 = 90. Verifica: i podi possibili sono 7 · 6 · 5 = 210, quelli senza Marco 6 · 5 · 4 = 120 e 210 − 120 = 90.`,
  trap: `210 ignora il vincolo; 120 è il numero dei podi senza Marco; 45 = 3 · C(6, 2) trascura che i due gradini restanti sono ordinati (primo e secondo posto non sono scambiabili).`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-rimbalzo', diff: 'media', lang: 'it',
  stem: `Una palla lasciata cadere da 10 metri rimbalza ogni volta fino a ${fr(3, 5)} dell'altezza da cui è caduta. Che altezza raggiunge dopo il terzo rimbalzo?`,
  ...put('q-rimbalzo', '2,16 m', ['6 m', '3,6 m', '1,296 m']),
  sol: `Dopo ogni rimbalzo l'altezza si moltiplica per ${fr(3, 5)} = 0,6: dopo il primo 6 m, dopo il secondo 3,6 m, dopo il terzo 2,16 m (10 · 0,6³ = 10 · 0,216).`,
  trap: `6 m e 3,6 m sono le altezze dopo il primo e dopo il secondo rimbalzo; 1,296 m è quella dopo il quarto: basta sbagliare di uno nel conteggio.`,
  patt: 'Crescita esponenziale' },

{ k: 'q-rapporti', diff: 'media', lang: 'it',
  stem: `Il rapporto tra il numero di mele e quello di pere in un cesto è 3 : 4; il rapporto tra le pere e le arance è 6 : 5. Se le mele sono 18, quante sono le arance?`,
  ...put('q-rapporti', '20', ['15', '24', '30']),
  sol: `Se le mele sono 18, le pere sono 18 · 4/3 = 24. Poiché le pere stanno alle arance come 6 : 5, le arance sono 24 · 5/6 = 20.`,
  trap: `15 = 18 · 5/6 salta il primo rapporto; 24 è il numero delle pere; 30 = 18 · 5/3 concatena 3 : 4 e 6 : 5 come se fossero 3 : 5, senza adattare il termine in comune («pere» vale 4 nel primo rapporto e 6 nel secondo).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-operai', diff: 'difficile', lang: 'it',
  stem: `Otto operai, con lo stesso ritmo di lavoro, hanno completato in 6 giorni i ${fr(2, 5)} di un lavoro. Quanti operai in più servono per completare il resto del lavoro in 3 giorni?`,
  ...put('q-operai', '16', ['4', '8', '24']),
  sol: `In 8 · 6 = 48 giorni-operaio si completano i ${fr(2, 5)} del lavoro: il lavoro intero vale 120 giorni-operaio e il resto (${fr(3, 5)}) ne richiede 72. In 3 giorni servono 72 ÷ 3 = 24 operai, cioè 24 − 8 = 16 in più.`,
  trap: `24 è il numero totale di operai, non quelli in più; 8 raddoppia gli operai perché i giorni dimezzano (ma il lavoro che resta è più grande di quello già fatto); 4 sarebbero gli operai in più per finire in 6 giorni (12 − 8).`,
  patt: 'Proporzioni' },

{ k: 'q-lanci', diff: 'media', lang: 'it',
  stem: `Si lancia 6 volte una moneta equilibrata. Qual è la probabilità di ottenere esattamente 2 teste?`,
  ...put('q-lanci', fr(15, 64), [fr(1, 32), fr(15, 32), fr(1, 3)]),
  sol: `Le sequenze possibili sono 2<sup>6</sup> = 64, tutte ugualmente probabili. Quelle con esattamente 2 teste sono C(6, 2) = 15 (si scelgono i 2 lanci su 6 in cui esce testa). La probabilità è ${fr(15, 64)}.`,
  trap: `1/32 = 2/64 conta solo 2 sequenze invece delle 15 combinazioni; 15/32 usa 32 al posto di 64 come totale; 1/3 = 2/6 confonde il numero di teste con la frazione dei lanci.`,
  patt: 'Probabilità: casi favorevoli' },

{ k: 'q-dispari', diff: 'media', lang: 'it',
  stem: `Qual è la somma di tutti i numeri dispari da 1 a 59 (estremi compresi)?`,
  ...put('q-dispari', '900', ['870', '930', '1.770']),
  sol: `I numeri dispari da 1 a 59 sono 30 e la loro somma è il quadrato del loro numero: 30² = 900. Oppure: 30 numeri con media (1 + 59) ÷ 2 = 30, quindi 30 · 30 = 900.`,
  trap: `870 = 29 · 30 e 930 = 31 · 30 sbagliano il conteggio di uno; 1.770 è la somma di tutti i numeri da 1 a 59, pari e dispari.`,
  patt: 'Successioni e somme' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-latteria', diff: 'media', lang: 'it',
  claim: `Un allevatore che nel 2025 ha conferito 100.000 litri ha ricevuto, tra prezzo del latte e quota degli utili, più di 55.000 euro.`,
  passage: `La cooperativa «Val Verde» riunisce 40 allevatori e trasforma in formaggio il latte che essi conferiscono. Ogni allevatore riceve il prezzo del latte consegnato, pari a 0,50 euro al litro, più una quota degli utili della cooperativa, ripartita in proporzione ai litri conferiti. Nel 2025 sono stati conferiti in tutto 2 milioni di litri e gli utili da distribuire ammontavano a 100.000 euro. La cooperativa prevede di ampliare il caseificio nel 2027 e di assumere due nuovi casari. Gli allevatori soci sono tenuti a conferire il latte soltanto alla cooperativa.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «il prezzo del latte consegnato, pari a 0,50 euro al litro» e «una quota degli utili … ripartita in proporzione ai litri conferiti». Con 100.000 litri: 100.000 · 0,50 = 50.000 euro per il latte; la quota degli utili è 100.000 ÷ 2.000.000 = 5% di 100.000 euro, cioè 5.000 euro. In tutto 55.000 euro: esattamente, non «più di» 55.000.`,
  trap: `Il totale torna 55.000 e la soglia è scelta apposta: chi legge «più di» come «almeno» risponde «vera». Non è «non ricavabile»: tutti i dati necessari sono nel brano.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-core', diff: 'media', lang: 'it',
  passage: `L'inflazione complessiva misura la variazione dei prezzi di tutti i beni e servizi del paniere. L'inflazione sottostante, invece, esclude le componenti più volatili, come l'energia e gli alimentari freschi, i cui prezzi cambiano rapidamente per cause stagionali o internazionali. Nel 2025, in un certo Paese, l'inflazione complessiva è stata del 4% e quella sottostante del 2,5%. La banca centrale osserva che le componenti volatili pesano per circa un quinto del paniere e che, per questa ragione, la politica monetaria dovrebbe guardare soprattutto all'inflazione sottostante, che segnala meglio la tendenza di fondo dei prezzi.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-core', `Nel 2025 i prezzi delle componenti volatili sono cresciuti, in media, più del 4%.`,
    [`L'inflazione sottostante comprende le variazioni dei prezzi di energia e alimentari freschi.`,
     `Le componenti volatili sono cresciute di 1,5 punti percentuali, pari alla differenza tra le due misure.`,
     `Nel 2025 la politica monetaria ha guardato soprattutto all'inflazione complessiva.`]),
  sol: `Frasi chiave: «le componenti volatili pesano per circa un quinto del paniere» e i due tassi (4% e 2,5%). Se le componenti volatili (peso 1/5) sono cresciute di v e le altre (peso 4/5) del 2,5%, allora 4 = 0,8 · 2,5 + 0,2 · v, cioè v = 10%: più del 4%. Anche senza il peso, se il totale supera la parte sottostante, la parte volatile deve superare il totale.`,
  trap: `La differenza tra le due misure (1,5 punti) non è la crescita delle componenti volatili, perché queste pesano solo un quinto. L'inflazione sottostante esclude, non include, energia e alimentari freschi. «Dovrebbe guardare» è un'indicazione, non un fatto già avvenuto.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-palestra', diff: 'media', lang: 'it',
  passage: `Il direttore di una catena di palestre afferma che qualunque palestra può aumentare di almeno il 10% le proprie iscrizioni offrendo la prima lezione gratuita. A sostegno della tesi cita la sede di Pinerolo, dove, nei sei mesi successivi all'introduzione dell'offerta, le iscrizioni sono cresciute del 12%. La catena ha 25 sedi, distribuite in città di dimensioni molto diverse, e circa 14.000 iscritti, e la direzione ne rileva le iscrizioni ogni mese. L'offerta costa alla catena, in media, 8 euro per ogni lezione gratuita effettivamente utilizzata.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più l'affermazione del direttore?`,
  ...put('v-palestra', `In dieci sedi della catena scelte a caso, tra città grandi e piccole, l'introduzione della prima lezione gratuita è stata seguita da un aumento delle iscrizioni di almeno il 10%.`,
    [`Nella sede di Pinerolo le iscrizioni erano già in crescita del 12% annuo prima dell'introduzione dell'offerta.`,
     `Le sedi che non hanno introdotto la prima lezione gratuita hanno visto crescere le iscrizioni di almeno il 10%.`,
     `Il costo medio di 8 euro per lezione gratuita è inferiore al ricavo medio di un nuovo iscritto.`]),
  sol: `L'affermazione è generale («qualunque palestra») ma poggia su un solo caso. Un campione casuale di sedi diverse in cui l'offerta ha portato almeno il 10% di iscrizioni in più mostra che l'offerta basta, anche in contesti molto diversi: rafforza la tesi.`,
  trap: `Le due opzioni su Pinerolo e sulle sedi senza offerta indicano che la crescita avrebbe avuto luogo comunque: indeboliscono. Il confronto tra costo e ricavo riguarda la convenienza economica, non l'effetto della prima lezione gratuita sulle iscrizioni.`,
  patt: 'Condizione sufficiente vs necessaria' },

{ k: 'v-case', diff: 'media', lang: 'it',
  passage: `Nel 2025 in un Paese il prezzo medio delle abitazioni è aumentato del 6%, mentre il numero di compravendite è diminuito dell'8%. Secondo gli analisti, il calo delle compravendite riflette l'aumento dei tassi sui mutui, passati dal 3% al 4,5% in un anno; la crescita dei prezzi, invece, è dovuta soprattutto alla scarsità di nuove costruzioni. Le compravendite sono calate soprattutto tra i giovani sotto i 35 anni, che finanziano l'acquisto quasi interamente con un mutuo, mentre sono rimaste stabili tra gli acquirenti più anziani, che pagano in prevalenza con risparmi propri.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put('v-case', `Secondo gli analisti, i prezzi delle abitazioni sono aumentati perché la domanda di case è calata.`,
    [`Il calo delle compravendite ha riguardato soprattutto gli acquirenti che finanziano la casa con un mutuo.`,
     `Nel 2025 i tassi sui mutui sono aumentati di 1,5 punti percentuali.`,
     `Tra gli acquirenti più anziani il numero di compravendite non è calato.`]),
  sol: `Frase chiave: «la crescita dei prezzi, invece, è dovuta soprattutto alla scarsità di nuove costruzioni». Gli analisti attribuiscono l'aumento dei prezzi alla scarsità di offerta, non al calo della domanda: l'affermazione NON è corretta. Le altre tre sono nel brano (4,5% − 3% = 1,5 punti; «rimaste stabili» tra i più anziani).`,
  trap: `Nella domanda con «NON» si cerca l'affermazione sbagliata: le altre tre sono tutte vere e per questo si è tentati di scegliere una vera. Il calo delle compravendite è attribuito ai tassi, l'aumento dei prezzi all'offerta: scambiare le cause è l'errore tipico.`,
  patt: 'Cause alternative' },

{ k: 'v-pista', diff: 'media', lang: 'it',
  claim: `L'aumento delle biciclette in viale Garibaldi è stato causato dalla riduzione dei posti auto.`,
  passage: `Dopo l'apertura di una nuova pista ciclabile lungo viale Garibaldi, il numero di biciclette che transitano ogni giorno in quel tratto è passato da 800 a 1.200. Nello stesso periodo il comune ha eliminato 60 dei 240 posti auto del viale e ha installato nuovi parcheggi per biciclette davanti alla stazione. I rilievi sono stati effettuati da una società esterna, nei giorni feriali tra le 7 e le 9 del mattino, sempre con tempo sereno. Il comune sta valutando di prolungare la pista fino alla zona industriale.`,
  opts: VFN, ans: 1,
  sol: `Il brano riporta due fatti avvenuti «nello stesso periodo» (aumento delle biciclette ed eliminazione di 60 posti auto), ma non dice quale sia la causa dell'aumento. Il nesso causale proposto non è né affermato né smentito: la pista, i parcheggi per biciclette o altri fattori potrebbero spiegare il dato. Non ricavabile.`,
  trap: `Due eventi contemporanei non sono legati da un nesso causale solo perché compaiono vicini nel testo. Non è «falsa»: il brano non esclude che i posti auto c'entrino. Non è «vera»: nessuna frase la afferma.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-mensa', diff: 'media', lang: 'it',
  passage: `Una ricerca su 3.000 lavoratori ha rilevato che chi usa regolarmente la mensa aziendale si assenta per malattia in media meno di chi non la usa: 4 giorni all'anno contro 7. L'ufficio del personale ne conclude che la mensa migliora la salute dei dipendenti e propone di aprirne una in ciascuna delle sedi dell'azienda. La mensa è aperta a pranzo e costa 5 euro a pasto. I dati sono stati ricavati dalle registrazioni di presenza e dalle timbrature della mensa.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione dell'ufficio del personale?`,
  ...put('v-mensa', `I lavoratori con problemi di salute cronici tendono a portarsi il pranzo da casa, seguendo una dieta particolare, e quindi non usano la mensa.`,
    [`La mensa aziendale offre sia menu vegetariani sia menu tradizionali.`,
     `Il prezzo della mensa è inferiore a quello dei ristoranti vicini all'azienda.`,
     `I lavoratori che usano la mensa sono distribuiti in tutte le sedi dell'azienda.`]),
  sol: `La conclusione è causale (la mensa migliora la salute), ma il dato è una correlazione. Se chi è già malato non va in mensa, si ha una causalità inversa (o una selezione): i frequentatori della mensa si assentano meno perché sono più sani in partenza, non per effetto della mensa.`,
  trap: `Menu, prezzo e distribuzione nelle sedi non toccano il nesso tra mensa e assenze. Davanti a una correlazione tra A e B conviene chiedersi se non sia B (o un terzo fattore) a determinare A.`,
  patt: 'Cause alternative' },

{ k: 'v-universita', diff: 'media', lang: 'it',
  passage: `Tra il 2020 e il 2025, in una regione, il numero di studenti universitari è salito da 80.000 a 88.000, mentre il numero di docenti è passato da 2.000 a 2.200. Nello stesso periodo le aule disponibili sono rimaste 400. L'assessore all'istruzione ha dichiarato che «le condizioni di studio non sono cambiate, perché sia gli studenti sia i docenti sono aumentati del 10%». I dati, forniti dall'ufficio statistico regionale, si riferiscono ai cinque atenei della regione e all'inizio di ciascun anno accademico.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-universita', `Il numero di studenti per docente è rimasto invariato, ma il numero di studenti per aula è aumentato.`,
    [`Il numero di studenti per docente è aumentato, perché gli studenti sono cresciuti di 8.000 unità e i docenti di sole 200.`,
     `Il numero di studenti per aula è rimasto invariato, perché le aule sono sempre 400.`,
     `Il numero di studenti per docente è sceso da 40 a 38.`]),
  sol: `Studenti per docente: 80.000 ÷ 2.000 = 40 nel 2020 e 88.000 ÷ 2.200 = 40 nel 2025 (invariato, perché entrambi crescono del 10%). Studenti per aula: 80.000 ÷ 400 = 200 e 88.000 ÷ 400 = 220 (aumentato).`,
  trap: `Confrontare gli aumenti assoluti (8.000 contro 200) senza costruire il rapporto: 8.000 su 80.000 e 200 su 2.000 sono la stessa percentuale. Le aule non sono cambiate, ma gli studenti sì: il rapporto studenti per aula cresce.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-bagaglio', diff: 'media', lang: 'it',
  claim: `Un passeggero che sale a bordo con uno zaino di 38 × 28 × 18 centimetri e con un cappotto sul braccio non paga alcun supplemento.`,
  passage: `Una compagnia aerea consente a ogni passeggero di portare gratuitamente a bordo un solo bagaglio a mano, a condizione che le sue dimensioni non superino 40 × 30 × 20 centimetri. Un secondo bagaglio a mano è accettato soltanto a pagamento, con un supplemento di 15 euro per tratta. Non sono considerati bagagli, e quindi non si pagano, gli effetti personali di piccole dimensioni, come un ombrello, un cappotto o una borsa di libri. I bagagli da stiva si prenotano online e costano 25 euro se si acquistano prima del volo.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «un solo bagaglio a mano, a condizione che le sue dimensioni non superino 40 × 30 × 20 centimetri» e «Non sono considerati bagagli … gli effetti personali di piccole dimensioni, come un ombrello, un cappotto». Lo zaino (38 × 28 × 18) rientra nelle misure e il cappotto non è un bagaglio: nessun supplemento. L'affermazione è vera.`,
  trap: `Rispondere «non ricavabile» perché il caso dello zaino non è citato, oppure contare il cappotto come secondo bagaglio. Un esempio concreto che rientra nella regola generale è «vero». Il supplemento di 15 euro vale solo per un secondo bagaglio a mano.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-regola', diff: 'difficile', lang: 'it',
  passage: `Dal regolamento di un ateneo. La borsa di studio è assegnata agli studenti che soddisfano entrambe le condizioni: un ISEE inferiore a 25.000 euro e almeno 40 crediti ottenuti nell'anno accademico precedente. Gli studenti con una disabilità riconosciuta superiore al 66% sono esonerati dal requisito dei 40 crediti, ma devono comunque rispettare il limite ISEE. Chi ha già ricevuto la borsa per l'intera durata legale del corso non può riceverla di nuovo. Chi riceve la borsa è tenuto a ottenere almeno 20 crediti nell'anno in corso; in caso contrario deve restituire la metà dell'importo.`,
  stem: `Chiara ha un ISEE di 22.000 euro, una disabilità riconosciuta del 70% e nell'anno precedente ha ottenuto 12 crediti. Non ha mai ricevuto la borsa. Quale delle seguenti affermazioni è corretta?`,
  ...put('v-regola', `Ha diritto alla borsa e, se ottiene meno di 20 crediti nell'anno in corso, deve restituire la metà dell'importo.`,
    [`Non ha diritto alla borsa, perché con 12 crediti non raggiunge i 40 richiesti.`,
     `Ha diritto alla borsa e non ha alcun obbligo di crediti, perché ha una disabilità superiore al 66%.`,
     `Ha diritto alla borsa soltanto se ottiene almeno 40 crediti nell'anno in corso.`]),
  sol: `Frasi chiave: «Gli studenti con una disabilità … superiore al 66% sono esonerati dal requisito dei crediti» e «Chi riceve la borsa è tenuto a ottenere almeno 20 crediti nell'anno in corso». Chiara rispetta l'ISEE (22.000 < 25.000), è esonerata dai 40 crediti e non ha mai avuto la borsa: ha diritto alla borsa. Una volta ricevuta, l'obbligo dei 20 crediti vale anche per lei (l'esonero riguarda solo il requisito di accesso).`,
  trap: `L'esonero vale per il requisito dei 40 crediti dell'anno precedente, non per l'obbligo successivo dei 20 crediti: chi lo estende a tutto sceglie la terza opzione. Applicare solo la soglia dei crediti ignorando la disabilità porta alla seconda.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-rivabella', diff: 'difficile', lang: 'it',
  passage: `Il consiglio comunale di Rivabella discute se vietare le auto private nel centro storico per ridurre l'inquinamento. Un consigliere sostiene: «Nelle due città vicine che hanno adottato lo stesso divieto, la concentrazione di polveri sottili in centro è diminuita del 15% nel primo anno; dunque anche a Rivabella le polveri sottili in centro caliranno del 15%». Il centro storico di Rivabella ha 3.000 residenti e circa 40 negozi. Il comune prevede di destinare ai trasporti pubblici i 200.000 euro che ogni anno incassa dai parcheggi in centro. La discussione proseguirà nella seduta di marzo.`,
  stem: `Su quale assunzione si basa principalmente il ragionamento del consigliere?`,
  ...put('v-rivabella', `Rivabella è abbastanza simile alle due città in ciò che conta per le polveri sottili, come il traffico, il clima e le altre fonti di inquinamento.`,
    [`Le polveri sottili in centro a Rivabella sono prodotte esclusivamente dalle auto private.`,
     `La maggioranza dei residenti del centro storico è favorevole al divieto.`,
     `Le due città vicine hanno lo stesso numero di abitanti di Rivabella.`]),
  sol: `Il consigliere argomenta per analogia: da due casi simili ricava ciò che accadrà a Rivabella. Il ragionamento regge solo se Rivabella è simile a quelle città negli aspetti rilevanti (traffico, clima, fonti di inquinamento): altrimenti lo stesso divieto potrebbe avere effetti diversi.`,
  trap: `«Esclusivamente dalle auto» è un'assunzione troppo forte: basterebbe che le auto fossero la fonte principale. Il gradimento dei residenti e il numero di abitanti non servono per prevedere il calo delle polveri sottili.`,
  patt: 'Assunzione implicita' },

{ k: 'v-export', diff: 'difficile', lang: 'it',
  passage: `Un'azienda vinicola ha esportato 100 milioni di euro di vino nel primo trimestre del 2024 e 300 milioni nel secondo trimestre. Nel 2025 le esportazioni del primo trimestre sono cresciute del 6% rispetto al primo trimestre del 2024, mentre quelle del secondo trimestre sono calate del 2% rispetto al secondo trimestre del 2024, soprattutto per il rallentamento della domanda tedesca. L'azienda esporta in 40 Paesi e ha un nuovo magazzino a Rotterdam. I dati sono tratti dai bilanci trimestrali e sono espressi a prezzi correnti.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-export', `Nel primo semestre del 2025 le esportazioni sono state uguali a quelle del primo semestre del 2024.`,
    [`Nel primo semestre del 2025 le esportazioni sono cresciute del 2% rispetto al primo semestre del 2024.`,
     `Nel primo semestre del 2025 le esportazioni sono cresciute del 4% rispetto al primo semestre del 2024.`,
     `Nel primo semestre del 2025 le esportazioni sono calate del 2% rispetto al primo semestre del 2024.`]),
  sol: `Frasi chiave: 100 e 300 milioni nel 2024 e le variazioni +6% e −2%. Nel 2025: primo trimestre 100 · 1,06 = 106; secondo 300 · 0,98 = 294. Il semestre vale 106 + 294 = 400, come nel 2024 (100 + 300): variazione 0%.`,
  trap: `+2% è la media semplice delle due variazioni ((6 − 2) ÷ 2); +4% è la somma algebrica (6 − 2); −2% guarda soltanto il trimestre più grande. Il secondo trimestre pesa il triplo del primo: le variazioni vanno pesate con i valori di partenza.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'v-museo', diff: 'media', lang: 'it',
  claim: `Nel 2025 il museo ha incassato dai biglietti più di 800.000 euro.`,
  passage: `Nel 2025 il museo comunale ha registrato 120.000 visitatori, il 20% in più rispetto al 2024. Gli ingressi gratuiti, riservati alle scuole e ai ragazzi sotto i 18 anni, sono stati il 30% del totale; tutti gli altri visitatori hanno pagato un biglietto di 10 euro. Il museo ha inoltre incassato 60.000 euro dalle visite guidate e dal bookshop. Le spese di gestione sono state di 1 milione di euro e la parte non coperta dagli incassi è stata finanziata dal comune. Dal 2026 l'ingresso sarà gratuito la prima domenica di ogni mese.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «120.000 visitatori», «gli ingressi gratuiti … sono stati il 30% del totale» e «tutti gli altri visitatori hanno pagato un biglietto di 10 euro». I paganti sono il 70% di 120.000 = 84.000 e gli incassi dai biglietti 84.000 · 10 = 840.000 euro, più di 800.000. L'affermazione è vera.`,
  trap: `Contare come paganti il 30% (36.000 persone, 360.000 euro) o sommare i 60.000 euro di visite guidate e bookshop, che non sono biglietti. Il dato del +20% sul 2024 è superfluo. Non è «non ricavabile»: i numeri bastano.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-bibite', diff: 'media', lang: 'it',
  passage: `Dopo l'introduzione di una tassa di 0,10 euro per litro sulle bevande zuccherate, in una città il consumo di queste bevande è calato del 18% in un anno. L'amministrazione attribuisce il calo alla tassa e propone di estenderla ai dolciumi industriali, con l'obiettivo di ridurre il consumo di zuccheri tra i giovani. La città ha 90.000 abitanti e il consumo è stato misurato sulle vendite dei negozi e dei bar. Il gettito della tassa è stato di circa 400.000 euro e sarà destinato ai programmi di educazione alimentare nelle scuole.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la tesi dell'amministrazione?`,
  ...put('v-bibite', `Nello stesso anno una grande catena di supermercati ha tolto dagli scaffali le bevande zuccherate dei due marchi più venduti.`,
    [`In altre città dove è stata introdotta una tassa simile, il consumo di bevande zuccherate è calato di una percentuale analoga.`,
     `Il gettito della tassa è sufficiente a finanziare i programmi di educazione alimentare.`,
     `Il 60% dei cittadini è favorevole all'estensione della tassa ai dolciumi.`]),
  sol: `L'amministrazione attribuisce il calo del 18% alla tassa. Se nello stesso anno i supermercati hanno tolto dagli scaffali due marchi molto venduti, c'è una causa alternativa che spiega il calo anche senza la tassa: la tesi si indebolisce.`,
  trap: `Il calo analogo in altre città rafforza la tesi; il finanziamento dei programmi e il gradimento dei cittadini non riguardano la causa del calo. Davanti a un nesso causale conviene chiedersi che cosa altro è cambiato nello stesso periodo.`,
  patt: 'Cause alternative' },

{ k: 'v-flex', diff: 'media', lang: 'it',
  passage: `Una società di consulenza afferma che il nuovo orario flessibile ha aumentato la produttività dei suoi dipendenti: nel semestre successivo all'introduzione, il fatturato per dipendente è passato da 80.000 a 88.000 euro annui. L'orario flessibile consente di entrare in ufficio tra le 7 e le 10 e di uscire di conseguenza, mantenendo invariate le 40 ore settimanali. La società ha 150 dipendenti e uffici in tre città. I dati sono stati rilevati dal servizio amministrativo e si riferiscono a due semestri consecutivi.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione della società?`,
  ...put('v-flex', `Un eventuale aumento dei prezzi dei servizi praticati dalla società nello stesso semestre.`,
    [`La fascia oraria di ingresso scelta più spesso dai dipendenti.`,
     `L'età media dei dipendenti della società.`,
     `Il numero di città in cui la società ha uffici.`]),
  sol: `La società attribuisce all'orario flessibile l'aumento del fatturato per dipendente (+10%). Se nello stesso semestre i prezzi dei servizi sono stati aumentati, il fatturato può essere cresciuto anche con produttività invariata: è il dato che verifica l'attribuzione.`,
  trap: `La fascia oraria preferita, l'età media e il numero di città non dicono se l'aumento del fatturato sia dovuto all'orario flessibile. Fatturato per dipendente non è sinonimo di produttività: dipende anche dai prezzi.`,
  patt: 'Dato mancante' },

{ k: 'v-corta', diff: 'media', lang: 'it',
  claim: `Con la settimana corta i dipendenti lavorano ogni settimana meno ore di prima.`,
  passage: `Un'azienda di logistica ha introdotto la settimana corta: i dipendenti lavorano quattro giorni a settimana per dieci ore al giorno, invece di cinque giorni da otto ore. La retribuzione mensile è rimasta invariata. Dopo sei mesi la direzione ha rilevato che le assenze per malattia sono diminuite del 15% e che i colli smistati per ora lavorata sono aumentati del 3%. Il responsabile del personale ha precisato che l'esperimento sarà esteso agli altri due magazzini solo dopo una verifica dei costi energetici.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «quattro giorni a settimana per dieci ore al giorno, invece di cinque giorni da otto ore». Prima: 5 · 8 = 40 ore; ora: 4 · 10 = 40 ore. Le ore settimanali sono rimaste le stesse: l'affermazione è contraddetta.`,
  trap: `Associare «settimana corta» a «meno ore»: sono meno i giorni, non le ore. Non è «non ricavabile»: le ore si calcolano dai dati del brano. Il +3% dei colli per ora e il −15% delle assenze sono dati superflui.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-sanita', diff: 'media', lang: 'it',
  passage: `Secondo un rapporto, nel 2025 la spesa sanitaria pubblica di un Paese è stata pari al 7% del prodotto interno lordo (PIL), mentre la spesa sanitaria privata, sostenuta direttamente dalle famiglie e dalle assicurazioni, è stata pari all'1,5% del PIL. Il PIL del Paese è di 2.000 miliardi di euro. Il rapporto stima che, senza riforme, entro il 2035 la spesa pubblica potrebbe salire all'8,5% del PIL, ma precisa che si tratta di una proiezione e non di un esito certo. Il rapporto non analizza la qualità dei servizi.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-sanita', `Nel 2025 la spesa sanitaria complessiva, pubblica e privata, è stata di 170 miliardi di euro.`,
    [`Nel 2025 la spesa sanitaria pubblica è stata di 140 miliardi di euro, pari al 7% della spesa pubblica totale.`,
     `Entro il 2035 la spesa sanitaria pubblica salirà inevitabilmente all'8,5% del PIL.`,
     `Nel 2025 la spesa sanitaria privata è stata di 30 miliardi di euro, cioè il 20% di quella pubblica.`]),
  sol: `Frasi chiave: «7% del … PIL», «1,5% del PIL» e «Il PIL del Paese è di 2.000 miliardi». La spesa complessiva è (7% + 1,5%) di 2.000 = 8,5% di 2.000 = 170 miliardi. Pubblica: 140 miliardi; privata: 30 miliardi.`,
  trap: `Il 7% è riferito al PIL, non alla spesa pubblica totale (ambito spostato); l'8,5% del 2035 è una proiezione («potrebbe salire»), non un esito certo («inevitabilmente»); 30 su 140 fa circa il 21%, non il 20%.`,
  patt: 'Periodo o ambito spostato' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-tavoli', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un ristorante ha 40 tavoli. È vero che più della metà dei tavoli è occupata?',
    'I tavoli occupati sono almeno 3 più di quelli liberi.',
    'I 15 tavoli da quattro posti sono tutti occupati.'),
  ...dsq('DCBA', 'A'),
  sol: `Più della metà significa più di 20 tavoli occupati. (1): occupati ≥ liberi + 3, con occupati + liberi = 40: 2 · occupati ≥ 43, quindi occupati ≥ 22, più di 20: la risposta è sempre «sì» e la (1) basta. (2): gli occupati sono almeno 15, ma possono essere 15 (no) o 30 (sì): non basta.`,
  trap: `Pensare che la (1) non basti perché non dà il numero esatto di tavoli occupati: per una domanda sì/no basta un limite. La (2) dà solo un minimo (15) più basso della soglia.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-turisti', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Un gruppo di 36 turisti è formato da italiani, francesi e tedeschi.`,
    `I francesi sono il doppio dei tedeschi.`,
    `Gli italiani sono 12 più dei tedeschi.`
  ], [
    `A. Gli italiani sono la metà del gruppo.`,
    `B. I francesi sono più degli italiani e dei tedeschi insieme.`,
    `C. I tedeschi sono un sesto del gruppo.`,
    `D. I francesi sono più di un terzo del gruppo.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la A sia la C', 'Sia la B sia la D', 'Sia la C sia la D'], ans: 1,
  sol: `Se i tedeschi sono t, i francesi sono 2t e gli italiani t + 12: t + 2t + t + 12 = 36, quindi 4t = 24 e t = 6. Tedeschi 6, francesi 12, italiani 18. A: 18 su 36 è la metà (vera). B: 12 non è più di 18 + 6 = 24 (falsa). C: 6 su 36 è un sesto (vera). D: 12 su 36 è esattamente un terzo, non «più di» un terzo (falsa).`,
  trap: `La D è falsa «per un soffio»: un terzo esatto non è «più di un terzo». Con numeri vicini conviene calcolare tutte le proposizioni. Dimenticare i 12 in più degli italiani porta a numeri non interi.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-negozi', diff: 'media', lang: 'it', asset: gNegozi(),
  stem: `In quale negozio la crescita percentuale del numero di clienti dal 2024 al 2025 è stata la maggiore?`,
  ...put('d-negozi', 'Negozio C', ['Negozio A', 'Negozio B', 'Negozio D']),
  sol: `Crescita percentuale = (2025 − 2024) ÷ 2024. A: 10 ÷ 40 = 25%; B: 15 ÷ 100 = 15%; C: 7 ÷ 20 = 35%; D: 15 ÷ 60 = 25%. La maggiore è quella del negozio C.`,
  trap: `Guardare l'aumento assoluto: i negozi B e D crescono di 15 mila clienti ma, partendo da basi più grandi, in percentuale crescono meno di C, che aumenta di sole 7 mila unità partendo da 20. A e D hanno la stessa crescita (25%).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-iscritti', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Degli 80 iscritti a un corso, quanti sono maschi e non lavorano?',
    'Il 60% degli iscritti è di sesso femminile e 30 di loro lavorano.',
    'In tutto gli iscritti che lavorano sono 50.'),
  ...dsq('BDAC', 'B'),
  sol: `(1): le femmine sono 48 e i maschi 32, ma non si sa quanti maschi lavorano. (2): i lavoratori sono 50, senza distinzione di sesso. Insieme: le femmine che lavorano sono 30, quindi i maschi che lavorano sono 50 − 30 = 20 e i maschi che non lavorano 32 − 20 = 12.`,
  trap: `Credere che la (1) basti perché dà quasi tutti i numeri (i maschi sono 32): senza il totale dei lavoratori non si possono dividere i maschi tra lavoratori e non lavoratori. In una tabella a doppia entrata (sesso × lavoro) servono i totali e una cella.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-sondaggio', diff: 'media', lang: 'it', asset: tSondaggio(),
  stem: `Tra tutti i favorevoli al nuovo servizio, quale percentuale appartiene alla fascia di età 55 anni e oltre?`,
  ...put('d-sondaggio', 'circa il 38%', ['il 30%', 'il 50%', 'circa il 43%']),
  sol: `Favorevoli per fascia: 18–34 anni, 60% di 200 = 120; 35–54 anni, 40% di 300 = 120; 55 anni e oltre, 30% di 500 = 150. In tutto 390. La fascia 55+ pesa 150 ÷ 390 ≈ 38,5%, cioè circa il 38%.`,
  trap: `Il 30% è la percentuale di favorevoli dentro la fascia (altra base); il 50% è la quota degli intervistati della fascia 55+ sul totale (500 su 1.000), non quella dei favorevoli; circa il 43% è la media semplice dei tre tassi (60, 40, 30).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-reparto', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Ogni prodotto in promozione è venduto nel reparto A.`,
    `Alcuni prodotti del reparto A sono freschi.`,
    `Nessun prodotto fresco è in scatola.`
  ], [
    `A. Qualche prodotto in promozione è fresco.`,
    `B. Qualche prodotto fresco è in scatola.`,
    `C. Qualche prodotto in promozione è venduto fuori dal reparto A.`,
    `D. Qualche prodotto del reparto A non è in scatola.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la B', 'Sia la A sia la B', 'Sia la B sia la C', 'Sia la C sia la D'], ans: 2,
  sol: `B: nessun prodotto fresco è in scatola, quindi «qualche prodotto fresco è in scatola» è falsa. C: tutti i prodotti in promozione sono nel reparto A, quindi «qualche prodotto in promozione è venduto fuori dal reparto A» è falsa. A non è sicura: i prodotti freschi del reparto A potrebbero non essere in promozione (o esserlo). D è sicuramente vera: i prodotti freschi del reparto A non sono in scatola.`,
  trap: `La A è solo possibile, non sicuramente falsa: «non sicuramente vera» non significa «sicuramente falsa». La D è sicuramente vera e quindi, con la consegna «false», non va scelta.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-museo', diff: 'media', lang: 'it', ds: true,
  stem: ds('Quanto costa il biglietto d\'ingresso di un museo per un adulto?',
    'Tre adulti e due ragazzi pagano in tutto 40 €, e il biglietto per un ragazzo costa 5 € meno di quello per un adulto.',
    'Il biglietto per un adulto costa più di 8 €.'),
  ...dsq('CABD', 'A'),
  sol: `(1): se un adulto paga a, un ragazzo paga a − 5 e 3a + 2(a − 5) = 40, cioè 5a = 50 e a = 10 €: basta. (2): più di 8 € è compatibile con 10 €, con 12 € e così via: non basta.`,
  trap: `Considerare sufficiente la (2) perché contiene un prezzo: dà solo un limite inferiore, mentre il prezzo esatto richiede un'uguaglianza. Nella (1) il biglietto per ragazzi è un dato intermedio che si elimina ponendo a − 5.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-budget', diff: 'media', lang: 'it', asset: gBudget(),
  stem: `Il prossimo anno l'affitto aumenterà del 10% e la spesa per il cibo calerà del 20%; le altre voci resteranno invariate. Di quanto varierà la spesa totale?`,
  ...put('d-budget', '−1%', ['−5%', '−10%', '+1%']),
  sol: `La variazione del totale è la somma delle variazioni pesate con le quote: affitto 40% · (+10%) = +4 punti; cibo 25% · (−20%) = −5 punti; le altre voci non variano. Totale: 4 − 5 = −1 punto su 100, cioè −1%.`,
  trap: `−5% è la media semplice delle due variazioni (+10% e −20%) e −10% la loro somma: ignorano che le due voci pesano diversamente (40% e 25%). +1% inverte il segno.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-cubo', diff: 'media', lang: 'it', ds: true,
  stem: ds('Qual è il volume di un cubo?',
    'La diagonale di una faccia misura 6√2 cm.',
    'La superficie totale del cubo è di 216 cm².'),
  ...dsq('CBDA', 'C'),
  sol: `(1): la diagonale di una faccia è lato · √2, quindi il lato è 6 cm e il volume è 6³ = 216 cm³. (2): la superficie è 6 · lato² = 216, quindi lato² = 36, lato = 6 cm e il volume è 216 cm³. Ciascuna affermazione, da sola, basta.`,
  trap: `Pensare che la (2) non basti perché dà una superficie e non una lunghezza: nel cubo le sei facce sono uguali e la superficie fissa il lato. Le due affermazioni sono coerenti (lato 6 cm) ma ciascuna basta da sola.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-tariffe', diff: 'media', lang: 'it', asset: tTariffe(),
  stem: `Per quale consumo mensile i piani A e B costano esattamente lo stesso?`,
  ...put('d-tariffe', '200 minuti', ['120 minuti', '75 minuti', '300 minuti']),
  sol: `I costi sono uguali quando 10 + 0,05 · m = 4 + 0,08 · m, cioè 6 = 0,03 · m e m = 200 minuti (20 € in entrambi i piani).`,
  trap: `120 minuti = 6 ÷ 0,05 trascura il costo al minuto del piano B; 75 minuti = 6 ÷ 0,08 trascura quello del piano A; 300 minuti è un valore a occhio. Si deve usare la differenza dei costi al minuto (0,03).`,
  patt: 'Dati e passaggi' },

{ k: 'd-gol', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Tre squadre hanno segnato in tutto 14 gol in un torneo.`,
    `Ogni squadra ha segnato almeno 3 gol.`,
    `La prima squadra ha segnato più gol della seconda e la seconda più gol della terza.`
  ], [
    `A. La prima squadra ha segnato almeno 6 gol.`,
    `B. La terza squadra ha segnato esattamente 3 gol.`,
    `C. La seconda squadra ha segnato più di 4 gol.`,
    `D. La prima squadra ha segnato il doppio dei gol della terza.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la B', 'Sia la B sia la D', 'Sia la A sia la C', 'Sia la A sia la B'], ans: 3,
  sol: `Siano a > b > c i gol delle tre squadre, con a + b + c = 14 e c ≥ 3. Le terne possibili sono (7, 4, 3) e (6, 5, 3): con c = 4 servirebbe almeno 4 + 5 + 6 = 15 > 14. A: la prima ha segnato 7 o 6 gol, quindi almeno 6 (vera). B: la terza ha sempre 3 gol (vera). C: la seconda ha 4 oppure 5 gol: non è sicuro che siano più di 4. D: il doppio di 3 è 6, che vale solo per la terna (6, 5, 3).`,
  trap: `La C e la D sono vere solo in uno dei due casi possibili: «sicuramente vera» richiede che valgano in tutti i casi compatibili con i dati. Chi trova una sola terna (per esempio 6, 5, 3) rischia di indicare anche la D.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-urna', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('In un sacchetto ci sono 12 palline, ciascuna rossa o blu. È vero che estraendone una a caso è più probabile che sia rossa e non blu?',
    'Le palline blu sono meno di 7.',
    'Le palline rosse sono in numero dispari.'),
  ...dsq('ACBD', 'B'),
  sol: `La rossa è più probabile se le rosse sono più di 6. (1): le blu sono al massimo 6, quindi le rosse sono almeno 6: con 6 rosse e 6 blu le probabilità sono uguali (no), con 8 rosse sì: non basta. (2): rosse dispari: 1 (no) oppure 11 (sì): non basta. Insieme: rosse almeno 6 e dispari, quindi almeno 7, cioè più di 6: la risposta è sempre «sì».`,
  trap: `La (1) sembra bastare («meno di 7 blu» suggerisce più rosse), ma ammette il caso 6 e 6, in cui le due probabilità sono uguali. È proprio quel caso limite che la parità della (2) esclude.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-gelati', diff: 'difficile', lang: 'it', asset: gGelati(),
  stem: `Il prezzo di un gelato è rimasto costante, tranne che in agosto, quando è stato scontato del 20%. Quali sono stati i ricavi complessivi del semestre?`,
  ...put('d-gelati', '530.000 €', ['550.000 €', '440.000 €', '500.000 €']),
  sol: `Prezzo: 150.000 € ÷ 60.000 gelati = 2,50 €. Aprile, maggio, giugno, luglio e settembre: 20 + 30 + 50 + 60 + 20 = 180 mila gelati a 2,50 € = 450.000 €. Agosto: 40 mila gelati a 2,50 · 0,8 = 2 €, cioè 80.000 €. Totale 530.000 €.`,
  trap: `550.000 € ignora lo sconto di agosto (220 mila gelati a 2,50 €); 440.000 € applica lo sconto a tutti i mesi (550.000 · 0,8); 500.000 € dimentica un mese (settembre). Il prezzo si ricava dal solo mese di luglio.`,
  patt: 'Dati e passaggi' },

{ k: 'd-utile', diff: 'difficile', lang: 'it', asset: tUtile(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Il margine (utile sui ricavi) del 2025 è maggiore di quello del 2021.`,
    `L'utile è cresciuto in ogni anno rispetto all'anno precedente.`,
    `L'utile del 2025 è il doppio di quello del 2021.`,
    `Nessuna delle altre risposte è corretta.`], ans: 3,
  sol: `Utili: 20 (2021), 15, 20, 15, 30 (2025). Margini: 20% nel 2021 e 30 ÷ 180 ≈ 16,7% nel 2025: il margine è sceso (prima falsa). L'utile cala nel 2022 e nel 2024 (seconda falsa). 30 non è il doppio di 20 (terza falsa). Quindi è corretta «Nessuna delle altre».`,
  trap: `Guardare solo i valori assoluti: l'utile del 2025 è il più alto, ma i ricavi sono cresciuti di più (+80% contro +50% dell'utile) e il margine è sceso. «Il doppio» richiederebbe 40, non 30. Con tre affermazioni false la risposta giusta è «Nessuna delle altre».`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-pacchi', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un corriere ha consegnato 40 pacchi in tre giorni. Quanti ne ha consegnati il secondo giorno?',
    'Il primo giorno ne ha consegnati 12.',
    'Il terzo giorno ne ha consegnati almeno 14.'),
  ...dsq('BADC', 'D'),
  sol: `Con p₁ + p₂ + p₃ = 40. (1): p₁ = 12, quindi p₂ + p₃ = 28 e p₂ può valere molti numeri. (2): p₃ ≥ 14 non fissa p₂. Insieme: p₂ = 28 − p₃ con p₃ tra 14 e 28, quindi p₂ può essere 14, 10, 5, 0 …: un intervallo di soluzioni. Servono altri dati.`,
  trap: `Pensare che «almeno 14» fissi il terzo giorno: dà solo un limite. Un intervallo di soluzioni non è un valore, quindi due vincoli non bastano a determinare p₂.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-uffici', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Ada, Bea e Carlo lavorano in tre città diverse: Roma, Milano e Torino.`,
    `Ada non lavora a Roma.`,
    `Chi lavora a Milano guadagna più di chi lavora a Torino.`,
    `Carlo lavora a Torino.`
  ], [
    `A. Bea lavora a Milano.`,
    `B. Carlo guadagna più di Ada.`,
    `C. Bea guadagna meno di Ada.`,
    `D. Ada lavora a Milano.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la A', 'Sia la A sia la B', 'Sia la B sia la C', 'Sia la C sia la D'], ans: 1,
  sol: `Carlo lavora a Torino; Ada non lavora a Roma e Torino è occupata, quindi Ada lavora a Milano e Bea a Roma. A: Bea lavora a Roma, non a Milano (falsa). B: Ada (Milano) guadagna più di Carlo (Torino), quindi «Carlo guadagna più di Ada» è falsa. C: il testo non confronta Roma e Milano, quindi non è sicura. D: Ada lavora a Milano (vera).`,
  trap: `La C non è sicuramente falsa: il testo confronta solo Milano con Torino. La D è sicuramente vera e quindi, con la consegna «false», non va scelta.`,
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
  id: '25',
  title: 'Mock 25',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'NOTA',
  questions: QUESTIONS,
  data: DATA
};
});
