/* =======================================================================
   Mock 19 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
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
   la domanda per gli script di verifica (tools/check_math_19.py).
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
  'q-assemblea': 2, 'q-pesi': 0, 'q-listino': 3, 'q-moneta': 1, 'q-crescita': 2, 'q-stipendi': 0,
  'q-capitano': 3, 'q-resto-fila': 1, 'q-ristorante': 2, 'q-urna': 0, 'q-traduttori': 3, 'q-potere': 1,
  'q-voti': 0, 'q-dadi': 2, 'q-corsa': 1, 'q-sei-amici': 3, 'q-vittorie': 0, 'q-mcm': 2,
  'v-turismo': 3, 'v-liceo': 1, 'v-spread': 0, 'v-casco': 2, 'v-direttiva': 3, 'v-regola': 0,
  'v-parcheggi': 2, 'v-imprese': 1, 'v-export': 3, 'v-occupazione': 0, 'v-fattore': 2,
  'd-ordini': 1, 'd-variazioni': 3, 'd-linee': 0, 'd-trasporti': 2, 'd-spesa': 1
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
  /* ordini mensili (migliaia) di un negozio online, gennaio–giugno, e prezzi/margine */
  ordini: { mesi: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'], migliaia: [40, 50, 60, 60, 70, 70], prezzo1: 50, prezzo2: 60, margine: 20 },
  /* variazioni % mensili delle vendite rispetto al mese precedente (febbraio–giugno) e vendite di gennaio */
  variazioni: { mesi: ['Feb', 'Mar', 'Apr', 'Mag', 'Giu'], pct: [25, -20, 50, -50, 20], gennaio: 400 },
  /* fatturato 2025 per linea di prodotto (%), totale e crescita sul 2024, rapporto negozio:online della linea Cucine */
  linee: { nomi: ['Arredo', 'Cucine', 'Illuminazione'], quote: [40, 35, 25], totale: 2400000, crescita: 20, negozioOnline: [3, 2] },
  /* mezzo di trasporto per fascia d'età (% di riga) */
  trasporti: { fasce: ['18–34 anni', '35–54 anni', '55 anni e oltre'], n: [600, 400, 200], auto: [30, 60, 80], pubblici: [40, 25, 10], bici: [30, 15, 10] },
  /* ricavi (milioni di euro) di tre divisioni */
  divisioni: { anni: [2022, 2023, 2024, 2025], Nord: [48, 52, 60, 66], Centro: [30, 33, 36, 44], Sud: [20, 26, 31, 40] },
  /* spesa pubblica (miliardi di euro) per settore */
  spesa: { anni: [2021, 2022, 2023, 2024, 2025], Istruzione: [18.4, 19.1, 19.8, 19.8, 21.0], Sanità: [34.0, 35.2, 36.1, 38.4, 40.2], Trasporti: [12.6, 13.0, 13.2, 13.4, 13.6] }
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

function gOrdini() {
  const D = DATA.ordini;
  return `<figure class="fig"><figcaption>Ordini mensili di un negozio online, in migliaia</figcaption>` + C.bars({
    labels: D.mesi, series: [{ name: 'Ordini (migliaia)', values: D.migliaia }], max: 80,
    aria: 'Istogramma degli ordini mensili in migliaia: ' + D.mesi.map((m, i) => m + ' ' + D.migliaia[i]).join(', ') + '.'
  }) + `<p class="fig-note">Il valore medio di un ordine è stato di ${D.prezzo1} € da gennaio a marzo e di ${D.prezzo2} € da aprile a giugno. Il margine dell'azienda è il ${D.margine}% dell'incasso.</p></figure>`;
}

function gVariazioni() {
  const D = DATA.variazioni;
  const W = 520, H = 270, L = 44, R = 16, T = 24, B = 34, lo = -60, hi = 60;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  const n = D.mesi.length, gw = (W - L - R) / n, bw = gw * 0.5;
  let g = '';
  [-60, -40, -20, 0, 20, 40, 60].forEach(t => {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t > 0 ? '+' : (t < 0 ? '−' : '')}${Math.abs(t)}%</text>`;
  });
  D.mesi.forEach((m, i) => {
    const v = D.pct[i], cx = L + gw * i + gw / 2;
    const top = Math.min(y(v), y(0)), h = Math.abs(y(v) - y(0));
    g += `<rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${h}" style="fill:var(${v >= 0 ? '--s3' : '--s2'})"><title>${m}: ${v > 0 ? '+' : '−'}${Math.abs(v)}%</title></rect>`;
    g += `<text x="${cx}" y="${v >= 0 ? top - 6 : top + h + 14}" class="val" text-anchor="middle">${v > 0 ? '+' : '−'}${Math.abs(v)}%</text>`;
    g += `<text x="${cx}" y="${H - 10}" class="lab" text-anchor="middle">${m}</text>`;
  });
  return `<figure class="fig"><figcaption>Variazione percentuale delle vendite di un negozio rispetto al mese precedente</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Istogramma delle variazioni mensili delle vendite rispetto al mese precedente: ${D.mesi.map((m, i) => m + ' ' + (D.pct[i] > 0 ? '+' : '−') + Math.abs(D.pct[i]) + '%').join(', ')}.">${g}</svg></div>
<p class="fig-note">A gennaio le vendite sono state di ${D.gennaio} unità. Ogni barra indica la variazione rispetto al mese immediatamente precedente.</p></figure>`;
}

function gLinee() {
  const D = DATA.linee;
  return `<figure class="fig"><figcaption>Fatturato 2025 di un'azienda per linea di prodotto (% del fatturato totale)</figcaption>` + C.pie({
    data: D.nomi.map((n, i) => [n, D.quote[i]]), title: 'Fatturato per linea',
    aria: 'Torta del fatturato per linea: ' + D.nomi.map((n, i) => n + ' ' + D.quote[i] + '%').join(', ') + '.'
  }) + `<p class="fig-note">Il fatturato totale del 2025 è stato di ${fmt(D.totale)} €, il ${D.crescita}% in più rispetto al 2024. Le vendite della linea Cucine sono ripartite tra negozio e online nel rapporto ${D.negozioOnline[0]} : ${D.negozioOnline[1]}.</p></figure>`;
}

function tTrasporti() {
  const T = DATA.trasporti;
  return C.table({
    caption: 'Mezzo usato per andare al lavoro, per fascia d\'età (% degli intervistati di ciascuna fascia)',
    head: ['Fascia d\'età', 'Intervistati', 'Auto', 'Mezzi pubblici', 'Bici o a piedi'],
    rows: T.fasce.map((f, i) => [f, T.n[i], T.auto[i] + '%', T.pubblici[i] + '%', T.bici[i] + '%'])
  }) + `<p class="fig-note">In ogni fascia le tre percentuali sommano a 100%. La seconda colonna indica il numero di intervistati della fascia.</p>`;
}

function tDivisioni() {
  const D = DATA.divisioni;
  return C.table({
    caption: 'Ricavi di un gruppo per divisione, in milioni di euro',
    head: ['Divisione'].concat(D.anni),
    rows: [['Nord'].concat(D.Nord), ['Centro'].concat(D.Centro), ['Sud'].concat(D.Sud)]
  });
}

function tSpesa() {
  const S = DATA.spesa, f = v => dec(v.toFixed(1));
  return C.table({
    caption: 'Spesa pubblica di un Paese per settore, in miliardi di euro',
    head: ['Settore'].concat(S.anni),
    rows: [['Istruzione'].concat(S.Istruzione.map(f)), ['Sanità'].concat(S['Sanità'].map(f)), ['Trasporti'].concat(S.Trasporti.map(f))]
  });
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-assemblea', diff: 'difficile', lang: 'it',
  stem: `In un'assemblea condominiale ha votato a favore di una proposta l'80% degli uomini presenti e il 50% delle donne presenti; in totale ha votato a favore il 68% dei presenti. Quale percentuale dei presenti è costituita da uomini?`,
  ...put('q-assemblea', '60%', ['40%', '50%', '65%']),
  sol: `Se gli uomini sono una frazione x dei presenti: 0,8x + 0,5(1 − x) = 0,68, cioè 0,3x = 0,18 e x = 0,6: gli uomini sono il 60%. In alternativa: 68% dista 18 punti dal 50% delle donne e 12 punti dall'80% degli uomini; i pesi stanno in rapporto inverso alle distanze, 18 : 12 = 3 : 2, cioè 3 uomini ogni 2 donne = 60%. (Controllo con 100 presenti: 48 + 20 = 68.)`,
  trap: `Il 68% è più vicino all'80% che al 50%, quindi gli uomini pesano di più: invertire i pesi dà il 40%. Prendere la media semplice dei due estremi (65%) o il punto medio (50%) tratta uomini e donne come se fossero in numero uguale; ma allora il totale sarebbe 65%, non 68%.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-pesi', diff: 'facile', lang: 'it',
  stem: `Marco e Luca insieme pesano 130 kg, Luca e Nino insieme 120 kg, Marco e Nino insieme 110 kg. Quanto pesa Nino?`,
  ...put('q-pesi', '50 kg', ['55 kg', '60 kg', '70 kg']),
  sol: `Sommando le tre pesate ogni persona compare due volte: 130 + 120 + 110 = 360 kg = 2 · (Marco + Luca + Nino), quindi i tre insieme pesano 180 kg. Nino = 180 − 130 = 50 kg. (Controllo: Marco = 180 − 120 = 60 kg, Luca = 70 kg; 60 + 70 = 130, 70 + 50 = 120, 60 + 50 = 110.)`,
  trap: `Dividere per due una pesata (110 ÷ 2 = 55 kg) suppone che Marco e Nino pesino uguale. 60 kg e 70 kg sono i pesi di Marco e di Luca: la risposta sbagliata più facile è quella del peso di un'altra persona.`,
  patt: 'Equazioni a parole' },

{ k: 'q-listino', diff: 'media', lang: 'it',
  stem: `Un televisore viene venduto con uno sconto del 20% sul prezzo di listino. Alla cassa il cliente presenta un buono da 40 €, che viene detratto dal prezzo già scontato, e paga in tutto 360 €. Qual era il prezzo di listino?`,
  ...put('q-listino', '500 €', ['450 €', '490 €', '480 €']),
  sol: `Prima del buono il prezzo scontato era 360 + 40 = 400 €, cioè l'80% del listino: 400 ÷ 0,8 = 500 €. (Controllo: 500 · 0,8 = 400; 400 − 40 = 360.)`,
  trap: `Ignorare il buono (360 ÷ 0,8 = 450); dividere solo i 360 € e poi sommare il buono (360 ÷ 0,8 + 40 = 490); calcolare un +20% (400 · 1,2 = 480) invece di dividere per 0,8: lo sconto è calcolato sul listino, che è la base.`,
  patt: 'Base della percentuale' },

{ k: 'q-moneta', diff: 'difficile', lang: 'it',
  stem: `Una moneta equa viene lanciata 4 volte. Qual è la probabilità che in almeno un punto della sequenza escano due teste in due lanci consecutivi?`,
  ...put('q-moneta', fr(1, 2), [fr(3, 8), fr(11, 16), fr(5, 16)]),
  sol: `Le sequenze possibili sono 2⁴ = 16. Conviene contare le sequenze SENZA due teste vicine: TTTT, HTTT, THTT, TTHT, TTTH, HTHT, HTTH, THTH, cioè 8. Quelle con almeno due teste vicine sono 16 − 8 = 8, quindi la probabilità è 8/16 = 1/2.`,
  trap: `Rispondere 3/8 (6 sequenze su 16) significa contare le sequenze con esattamente due teste in tutto, comprese quelle con teste lontane (HTHT, HTTH, THTH). 11/16 è la probabilità di almeno due teste in totale, non consecutive. Il complementare è più semplice da contare.`,
  patt: 'Probabilità: sequenze' },

{ k: 'q-crescita', diff: 'media', lang: 'it',
  stem: `Una cellula si divide in due ogni 15 minuti. Partendo da una sola cellula alle 9:00, quante cellule ci saranno approssimativamente alle 14:00 dello stesso giorno, se nessuna muore?`,
  ...put('q-crescita', 'circa un milione', ['circa mille', 'circa centomila', 'circa un miliardo']),
  sol: `Dalle 9:00 alle 14:00 passano 5 ore, cioè 20 intervalli da 15 minuti: la popolazione si raddoppia 20 volte, 2²⁰ = 2¹⁰ · 2¹⁰ ≈ 1.000 · 1.000 = un milione (esattamente 1.048.576).`,
  trap: `Contare gli intervalli all'ora (4) e i giorni: 2¹⁰ ≈ mille corrisponde a sole 2 ore e mezza. Un miliardo sarebbe 2³⁰, cioè 7 ore e mezza. «Centomila» non è una potenza di 2 vicina a nessuno dei casi.`,
  patt: 'Crescita esponenziale' },

{ k: 'q-stipendi', diff: 'difficile', lang: 'it',
  stem: `Nel 2025 Ada guadagna il 50% in più di Bea. Nel 2026 lo stipendio di Bea aumenta del 20% e quello di Ada del 10%. Di quanto lo stipendio di Ada supera, in percentuale, quello di Bea nel 2026?`,
  ...put('q-stipendi', '+37,5%', ['+40%', '+30%', '+25%']),
  sol: `Con Bea = 100, Ada = 150 nel 2025. Nel 2026 Bea guadagna 120 e Ada 165. Il rapporto è 165 ÷ 120 = 1,375: Ada supera Bea del 37,5% (la base è lo stipendio di Bea).`,
  trap: `Sommare le variazioni: 50 − 20 + 10 = +40% mescola percentuali con basi diverse. 50 − 20 = +30% ignora l'aumento di Ada; 150 ÷ 120 = +25% dimentica che anche lo stipendio di Ada è cresciuto (+10%).`,
  patt: 'Base della percentuale' },

{ k: 'q-capitano', diff: 'media', lang: 'it',
  stem: `Un allenatore ha a disposizione 7 giocatori. Sceglie 4 titolari e, tra i titolari, designa un capitano e un vice-capitano (due ruoli diversi, affidati a due persone diverse). In quanti modi diversi può farlo?`,
  ...put('q-capitano', '420', ['840', '210', '140']),
  sol: `I 4 titolari si scelgono in C(7,4) = 35 modi (l'ordine non conta). Poi il capitano tra i 4 titolari (4 modi) e il vice tra i 3 rimasti (3 modi): 35 · 12 = 420. (Controllo: capitano tra 7, vice tra 6, poi gli altri due titolari tra i 5 rimasti in C(5,2) = 10 modi: 7 · 6 · 10 = 420.)`,
  trap: `7 · 6 · 5 · 4 = 840 conta l'ordine anche dei due titolari semplici. 35 · 6 = 210 sceglie capitano e vice come coppia senza ordine (ma i ruoli sono diversi). 35 · 4 = 140 assegna solo il capitano.`,
  patt: 'Combinazioni vs permutazioni' },

{ k: 'q-resto-fila', diff: 'difficile', lang: 'it',
  stem: `Un gruppo di studenti, in numero compreso tra 200 e 300, viene disposto in file. Disposti in file da 5, ne avanza 1; in file da 6, ne avanzano 2; in file da 7, non ne avanza nessuno. Quanti sono gli studenti?`,
  ...put('q-resto-fila', '266', ['236', '231', '224']),
  sol: `n dà resto 1 se diviso per 5 e resto 2 se diviso per 6: provando, n = 26, 56, 86, … (26 + 30k). Tra questi il primo multiplo di 7 è 56 = 7 · 8, e le soluzioni si ripetono ogni mcm(5, 6, 7) = 210: 56, 266, 476, … Tra 200 e 300 c'è solo 266. (Controllo: 266 = 5 · 53 + 1 = 6 · 44 + 2 = 7 · 38.)`,
  trap: `Ognuna delle esche rispetta due condizioni su tre: 236 (resto 1 e 2, ma 236 = 7 · 33 + 5), 231 (multiplo di 7 e resto 1 per 5, ma 231 = 6 · 38 + 3), 224 (multiplo di 7 e resto 2 per 6, ma 224 = 5 · 44 + 4). Va controllata la terza condizione.`,
  patt: 'Resti e congruenze' },

{ k: 'q-ristorante', diff: 'difficile', lang: 'it',
  stem: `Il conto di una cena è di 242 €. Comprende il servizio, pari al 10% dell'importo netto delle consumazioni, e l'IVA del 10%, calcolata sulla somma di consumazioni e servizio. Quanto sono costate le sole consumazioni, al netto di servizio e IVA?`,
  ...put('q-ristorante', '200 €', ['220 €', 'circa 202 €', '193,6 €']),
  sol: `Il conto è il netto N moltiplicato per 1,10 (servizio) e poi ancora per 1,10 (IVA): 1,10 · 1,10 · N = 1,21 · N = 242, quindi N = 200 €. (Controllo: servizio 20 €, subtotale 220 €, IVA 22 €, totale 242 €.)`,
  trap: `Togliere un solo 10% (242 ÷ 1,1 = 220 €); sommare i due 10% in un 20% (242 ÷ 1,2 ≈ 202 €); togliere dal totale il 10% due volte (242 · 0,8 = 193,6 €). L'IVA si calcola sull'importo che comprende già il servizio: i due 10% si moltiplicano.`,
  patt: 'Percentuali composte' },

{ k: 'q-urna', diff: 'media', lang: 'it',
  stem: `Un'urna contiene 4 palline rosse, 3 blu e 2 verdi. Se ne estraggono due contemporaneamente, qual è la probabilità che abbiano colori diversi?`,
  ...put('q-urna', fr(13, 18), [fr(5, 18), fr(52, 81), fr(2, 3)]),
  sol: `Le coppie possibili sono C(9,2) = 36. Le coppie dello stesso colore sono C(4,2) + C(3,2) + C(2,2) = 6 + 3 + 1 = 10. Quelle di colori diversi sono 36 − 10 = 26 e la probabilità è 26/36 = 13/18.`,
  trap: `5/18 = 10/36 è la probabilità dell'evento opposto (stesso colore). 52/81 si ottiene con reinserimento (1 − (16 + 9 + 4)/81): qui le palline estratte insieme non si rimettono. 2/3 è un valore «a occhio».`,
  patt: 'Probabilità: complementare' },

{ k: 'q-traduttori', diff: 'difficile', lang: 'it',
  stem: `Una traduttrice tradurrebbe da sola un manuale in 12 giorni, il suo collega in 18 giorni. Lavorano insieme per i primi 6 giorni; poi la traduttrice lascia il progetto e il collega prosegue da solo ma, avendo ormai preso confidenza con il testo, lavora il 50% più velocemente di prima. Quanti giorni dura in tutto il lavoro?`,
  ...put('q-traduttori', '8 giorni', ['9 giorni', '7 giorni e mezzo', '10 giorni']),
  sol: `In un giorno insieme: 1/12 + 1/18 = 5/36 del manuale; in 6 giorni 30/36 = 5/6. Resta 1/6. Il collega ora fa 1/18 · 1,5 = 1/12 al giorno: 1/6 ÷ 1/12 = 2 giorni. In tutto 6 + 2 = 8 giorni.`,
  trap: `Dimenticare l'aumento di velocità: 1/6 ÷ 1/18 = 3 giorni e il totale sale a 9. Leggere «50% più velocemente» come «metà del tempo» (rapporto 1/9 al giorno) porta a 1,5 giorni e a 7 giorni e mezzo. Dimenticare i 6 giorni già trascorsi dà solo il tratto finale.`,
  patt: 'Lavoro con cambio a metà' },

{ k: 'q-potere', diff: 'media', lang: 'it',
  stem: `In un Paese, in un anno, lo stipendio medio sale del 10% mentre i prezzi al consumo salgono del 25%. Di quanto varia, in percentuale, il potere d'acquisto dello stipendio medio (cioè la quantità di beni che si possono comprare)?`,
  ...put('q-potere', '−12%', ['−15%', '−20%', 'circa −13,6%']),
  sol: `Il potere d'acquisto è lo stipendio diviso per i prezzi: 1,10 ÷ 1,25 = 0,88, cioè −12%. (Controllo: uno stipendio di 100 compra 100 unità di beni a 1 € l'una; dopo un anno 110 € a 1,25 € l'una comprano 88 unità.)`,
  trap: `Sottrarre le due percentuali (10 − 25 = −15%) mescola variazioni con basi diverse. −20% (1 ÷ 1,25 = 0,8) dimentica l'aumento dello stipendio. Dividere la differenza per lo stipendio (0,15 ÷ 1,10 ≈ −13,6%) usa la base sbagliata.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-voti', diff: 'media', lang: 'it',
  stem: `A un esame con voti in trentesimi la media dei 40 studenti che l'hanno sostenuto è 23. Escludendo i 10 studenti con i voti più alti, la media degli altri 30 è 21. Qual è la media dei 10 studenti esclusi?`,
  ...put('q-voti', '29', ['25', '22', 'circa 24']),
  sol: `Somma di tutti i voti: 40 · 23 = 920. Somma dei 30 rimasti: 30 · 21 = 630. I 10 esclusi sommano 920 − 630 = 290, quindi la loro media è 29. (Controllo: la media totale dista 2 punti dai 30 e 6 dai 10, e 2 · 30 = 6 · 10 = 60.)`,
  trap: `Estrapolare in modo simmetrico (23 + 2 = 25) tratta i due gruppi come se avessero lo stesso peso; 22 è la media semplice di 23 e 21. Rovesciare i pesi (23 + 2 · 10/30 ≈ 23,7, circa 24) dimentica che il gruppo piccolo deve spostare la media di più.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-dadi', diff: 'difficile', lang: 'it',
  stem: `Si lanciano tre dadi equi a sei facce. Qual è la probabilità che la somma dei tre numeri usciti sia 10?`,
  ...put('q-dadi', fr(1, 8), [fr(25, 216), fr(1, 6), fr(5, 36)]),
  sol: `I casi possibili sono 6³ = 216. Le terne (non ordinate) con somma 10 sono (1,3,6), (1,4,5), (2,2,6), (2,3,5), (2,4,4), (3,3,4): quelle con tre numeri diversi si dispongono in 6 modi, quelle con un numero ripetuto in 3 modi. Casi favorevoli: 6 + 6 + 3 + 6 + 3 + 3 = 27. Probabilità: 27/216 = 1/8.`,
  trap: `Contare le terne senza il numero di disposizioni (6 terne su 216, o 6 su 56). 25/216 è la probabilità della somma 9, vicina a quella della somma 10; 1/6 = 36/216 e 5/36 = 30/216 sono valori «a occhio».`,
  patt: 'Probabilità: somma di dadi' },

{ k: 'q-corsa', diff: 'difficile', lang: 'it',
  stem: `In una corsa sui 100 metri Anna batte Bea di 10 metri: quando Anna taglia il traguardo, Bea si trova ai 90 metri. Le due ripetono la gara, ma questa volta Anna parte 10 metri dietro la linea di partenza (deve percorrere 110 metri) mentre Bea parte dalla linea. Entrambe corrono alla stessa velocità costante della prima gara. Che cosa accade?`,
  ...put('q-corsa', 'Anna vince di poco: quando taglia il traguardo, Bea è a circa 1 metro da esso.',
    ['Arrivano insieme, perché lo svantaggio di 10 metri compensa il vantaggio di 10 metri.',
     'Vince Bea, perché Anna deve percorrere più strada.',
     'Non si può stabilire senza conoscere le velocità delle due atlete.']),
  sol: `Nella prima gara, nello stesso tempo Anna percorre 100 m e Bea 90 m: la velocità di Bea è il 90% di quella di Anna. Nella seconda gara Anna impiega il tempo necessario per 110 m; in quel tempo Bea percorre 0,9 · 110 = 99 m e le manca 1 m. Vince Anna per circa 1 m.`,
  trap: `Il «pareggio» è l'esca: 10 metri sono il 10% di 100 ma solo il 9% di 110. Le velocità non servono: il rapporto 0,9 è già nei dati.`,
  patt: 'Ragionamento laterale' },

{ k: 'q-sei-amici', diff: 'media', lang: 'it',
  stem: `Sei amici avevano deciso di dividersi in parti uguali il costo di un viaggio in barca. All'ultimo momento due di loro rinunciano e gli altri quattro si dividono il costo: la quota di ciascuno aumenta così di 12 €. Qual è il costo totale del viaggio?`,
  ...put('q-sei-amici', '144 €', ['72 €', '48 €', '96 €']),
  sol: `Con T il costo totale: T/4 − T/6 = 12, cioè T · (3 − 2)/12 = 12 e T = 144 €. (Controllo: 144 ÷ 6 = 24 €, 144 ÷ 4 = 36 €, differenza 12 €.)`,
  trap: `Moltiplicare i 12 € per il numero di partecipanti (12 · 6 = 72, 12 · 4 = 48) tratta l'aumento come se fosse il costo di un'intera quota. 96 € è 24 · 4: la quota originale per i quattro rimasti.`,
  patt: 'Equazioni a parole' },

{ k: 'q-vittorie', diff: 'difficile', lang: 'it',
  stem: `Una squadra ha vinto 12 delle sue prime 20 partite. Quante partite consecutive deve ancora vincere, senza perderne alcuna, per arrivare a una percentuale di vittorie dell'80% sul totale delle partite giocate?`,
  ...put('q-vittorie', '20', ['4', '10', '16']),
  sol: `Con x vittorie in più, il totale diventa 20 + x e le vittorie 12 + x: (12 + x)/(20 + x) = 0,8, cioè 12 + x = 16 + 0,8x e 0,2x = 4, quindi x = 20. (Controllo: 32 vittorie su 40 partite = 80%.)`,
  trap: `Calcolare l'80% di 20 (16) e sottrarre le 12 vittorie (4) dimentica che ogni nuova partita aumenta anche il totale: la base della percentuale cambia a ogni vittoria. 16 è l'80% di 20; 10 è un numero «a metà strada».`,
  patt: 'Base della percentuale' },

{ k: 'q-mcm', diff: 'media', lang: 'it',
  stem: `Tre fari lampeggiano rispettivamente ogni 12, ogni 18 e ogni 30 secondi, e alle 20:00:00 lampeggiano tutti e tre insieme. Senza contare il lampeggio simultaneo delle 20:00:00, quante volte lampeggiano ancora tutti e tre insieme fino alle 21:00:00 incluse?`,
  ...put('q-mcm', '20', ['21', '40', '19']),
  sol: `Lampeggiano insieme ogni mcm(12, 18, 30) secondi: 12 = 2² · 3, 18 = 2 · 3², 30 = 2 · 3 · 5, quindi mcm = 2² · 3² · 5 = 180 s (3 minuti). In un'ora (3.600 s) ci sono 3.600 ÷ 180 = 20 lampeggi simultanei dopo quello iniziale, compreso quello delle 21:00:00, che cade esattamente a 3.600 s.`,
  trap: `21 conta anche il lampeggio delle 20:00:00, che la domanda esclude; 19 esclude l'ultimo, che invece è incluso («21:00:00 incluse»); 40 viene da un mcm sbagliato (90 = mcm(18, 30), ignorando il 12).`,
  patt: 'Minimo comune multiplo' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-biblio', diff: 'media', lang: 'it',
  claim: `Alle 20:30 un socio ordinario può entrare nella sala di studio.`,
  passage: `Il regolamento della biblioteca civica di Torrelungo distingue due categorie di iscritti. I soci ordinari possono prendere in prestito fino a quattro libri alla volta per trenta giorni; i soci studenti ne possono prendere fino a sei per quaranta giorni. La sala di studio è aperta fino alle 23; dopo le 20 vi si può accedere soltanto con la tessera di socio studente, che si ottiene presentando un documento che attesti l'iscrizione a una scuola o a un'università. Il prestito è rinnovabile una volta, purché il libro non sia stato prenotato da altri utenti. Nel 2025 la biblioteca ha contato 5.400 soci, il 35% dei quali studenti.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «dopo le 20 vi si può accedere soltanto con la tessera di socio studente». Alle 20:30 si è dopo le 20 e un socio ordinario non ha quella tessera: non può entrare. L'affermazione è contraddetta da una regola esplicita, anche se il brano non nomina né le «20:30» né il caso del socio ordinario in sala.`,
  trap: `Rispondere «non ricavabile» perché il brano non scrive che un socio ordinario non può entrare alle 20:30: «soltanto» esclude tutti gli altri, quindi la regola decide anche il caso non citato. I dati sui prestiti e sui 5.400 soci non c'entrano.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-turismo', diff: 'difficile', lang: 'it',
  passage: `Nel 2025 l'isola di Calamora ha accolto 600.000 turisti, il 20% in più rispetto al 2024. Il soggiorno medio è passato da 5 a 6 giorni, mentre la spesa media giornaliera di ciascun turista è scesa da 120 a 108 euro, perché è aumentata la quota di visitatori che alloggiano in case in affitto invece che in albergo. Nel 2025 gli alberghi hanno ospitato il 55% dei turisti e le case in affitto i restanti. Il consiglio comunale ha deciso di destinare l'1% della spesa turistica complessiva alla manutenzione dei sentieri.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put('v-turismo', `La spesa turistica complessiva dell'isola è cresciuta nel 2025 di meno del 20%.`,
    [`Nel 2024 i turisti accolti dall'isola erano 500.000.`,
     `Nel 2025 le case in affitto hanno ospitato 270.000 turisti.`,
     `La spesa media di un turista per l'intero soggiorno è aumentata nel 2025.`]),
  sol: `Frase chiave: «600.000 turisti, il 20% in più rispetto al 2024». Nel 2024 i turisti erano 600.000 ÷ 1,2 = 500.000 (corretta). Le case in affitto hanno ospitato il 45% di 600.000 = 270.000 (corretta). Spesa per soggiorno: 5 · 120 = 600 € nel 2024 e 6 · 108 = 648 € nel 2025 (corretta). Spesa complessiva: 500.000 · 600 = 300 milioni di euro contro 600.000 · 648 = 388,8 milioni, cioè +29,6%: più del 20%. È questa l'affermazione sbagliata.`,
  trap: `La spesa giornaliera scende (−10%) e i turisti crescono «solo» del 20%: si pensa che il totale cresca meno del 20%. Ma anche il soggiorno si allunga del 20%, e le variazioni si moltiplicano: 1,2 · 1,2 · 0,9 = 1,296. Nelle domande «NON è corretta» va cercata l'unica frase sbagliata.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-liceo', diff: 'media', lang: 'it',
  passage: `Il liceo Galilei ha introdotto a settembre un'ora aggiuntiva di matematica a settimana in tutte le classi. A giugno la quota di studenti con insufficienza in matematica è scesa dal 30% al 22%. Il preside attribuisce il miglioramento all'ora aggiuntiva e propone di estenderla a tutte le scuole superiori della città. Il costo dell'ora aggiuntiva è di 40.000 euro all'anno per il liceo; il preside precisa che il numero di studenti iscritti è rimasto invariato e che i criteri di valutazione delle verifiche non sono cambiati.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del preside?`,
  ...put('v-liceo', `Nello stesso anno scolastico il liceo ha attivato, per gli studenti con insufficienze, un servizio di ripetizioni gratuite pomeridiane frequentato da più della metà di loro.`,
    [`Gli studenti del liceo hanno frequentato l'ora aggiuntiva con una presenza media del 92%.`,
     `L'ora aggiuntiva è stata collocata nelle ultime ore del mattino.`,
     `Le altre scuole superiori della città hanno costi di personale inferiori a quelli del liceo Galilei.`]),
  sol: `La conclusione è causale: l'ora aggiuntiva avrebbe fatto scendere gli insufficienti dal 30% al 22%. Se nello stesso anno il liceo ha offerto ripetizioni gratuite proprio agli studenti con insufficienze, c'è una causa alternativa che spiega il calo anche senza l'ora aggiuntiva. La presenza al 92% rafforza; la collocazione oraria e i costi di altre scuole non toccano il nesso.`,
  trap: `Scegliere l'opzione sui costi delle altre scuole perché «mette in dubbio la proposta di estendere l'ora»: non intacca il nesso tra l'ora aggiuntiva e il calo. L'opzione sulla presenza al 92% rafforza invece di indebolire.`,
  patt: 'Cause alternative' },

{ k: 'v-sondaggio', diff: 'media', lang: 'it',
  claim: `Tra gli intervistati, le persone che usano i mezzi pubblici e sono insoddisfatte del servizio sono più di cento.`,
  passage: `In un sondaggio condotto su 800 pendolari di una grande città, il 45% ha dichiarato di recarsi al lavoro in auto privata, il 30% con i mezzi pubblici e i restanti con altri mezzi (bicicletta, motorino, a piedi). Tra chi usa i mezzi pubblici, due persone su cinque si sono dichiarate insoddisfatte del servizio; tra chi usa l'auto privata, il 20% ha detto di voler rinunciare all'auto entro due anni. Il comune ha precisato che il campione è stato scelto in modo da rappresentare la popolazione dei pendolari per età e per quartiere di residenza.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «il 30%» di 800 intervistati usa i mezzi pubblici, cioè 240 persone; «due persone su cinque» sono insoddisfatte: 240 · 2/5 = 96. 96 non è «più di cento»: l'affermazione è contraddetta da un dato che si ricava con due passaggi.`,
  trap: `Rispondere «non ricavabile» perché il brano non scrive mai il numero degli insoddisfatti, o «vera» perché 96 è «circa cento». La soglia è costruita vicina al valore reale (96 contro 100).`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-spread', diff: 'difficile', lang: 'it',
  passage: `Lo «spread» tra i titoli di Stato di due Paesi è la differenza tra i rispettivi rendimenti, espressa in punti base (un punto base è un centesimo di punto percentuale, cioè lo 0,01%). All'inizio del 2025 lo spread tra i titoli decennali di Montalto e quelli della Germania era di 160 punti base; alla fine dell'anno era sceso a 120 punti base. Nello stesso periodo il rendimento dei titoli tedeschi è salito dall'1,5% al 2,3%. Gli analisti osservano che la riduzione dello spread è stata accolta con favore dai mercati, ma ricordano che il costo del debito per lo Stato dipende dal livello del rendimento e non dalla differenza con altri Paesi.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-spread', `Nel 2025 il rendimento dei titoli decennali di Montalto è aumentato di 0,4 punti percentuali.`,
    [`Poiché lo spread è diminuito, nel 2025 il rendimento dei titoli di Montalto è sceso di 0,4 punti percentuali.`,
     `Nel 2025 il rendimento dei titoli di Montalto è aumentato di 0,8 punti percentuali, come quello dei titoli tedeschi.`,
     `Alla fine del 2025 il rendimento dei titoli di Montalto era dell'1,2%.`]),
  sol: `Il rendimento di Montalto è il rendimento tedesco più lo spread (160 punti base = 1,6 punti percentuali; 120 punti base = 1,2). All'inizio: 1,5% + 1,6% = 3,1%. Alla fine: 2,3% + 1,2% = 3,5%. La variazione è +0,4 punti percentuali. Il rendimento tedesco è salito di 0,8, lo spread è sceso di 0,4: il saldo è +0,4.`,
  trap: `Leggere «spread in calo» come «rendimento in calo»: lo spread è una differenza e qui il rendimento tedesco è salito più di quanto lo spread sia sceso. 0,8 è la variazione dei soli titoli tedeschi; 1,2% è lo spread finale, non un rendimento.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-casco', diff: 'media', lang: 'it',
  passage: `Un'azienda edile ha introdotto l'obbligo del casco con visiera integrata in tutti i suoi cantieri. Nei dodici mesi successivi il numero di infortuni sul lavoro è sceso del 30% rispetto ai dodici mesi precedenti. Il responsabile della sicurezza sostiene che il calo sia dovuto proprio alla nuova dotazione e propone di estenderla ai cantieri dei fornitori. Nello stesso periodo il numero di ore lavorate è rimasto sostanzialmente invariato.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la tesi del responsabile?`,
  ...put('v-casco', `Il calo degli infortuni si è concentrato quasi interamente sulle lesioni al volto e alla testa, mentre quelle agli arti sono rimaste invariate.`,
    [`Il casco con visiera integrata costa circa il doppio dei caschi tradizionali.`,
     `Il 90% degli operai ha dichiarato di preferire il nuovo casco a quello precedente.`,
     `Nello stesso periodo il numero di infortuni è sceso del 30% anche nei cantieri di un'altra azienda che non ha adottato il nuovo casco.`]),
  sol: `La tesi è che il casco abbia causato il calo degli infortuni. Se il calo riguarda proprio le lesioni alla testa e al volto, che il casco protegge, e non quelle agli arti, il meccanismo spiega il dato: la tesi esce rafforzata. L'ultima opzione indebolisce (un calo uguale si è avuto anche senza casco); costo e preferenze degli operai non toccano il nesso.`,
  trap: `Scegliere l'ultima opzione per distrazione: è un dato sullo stesso calo, ma lo attribuisce ad altro e indebolisce. Il gradimento degli operai (90%) è un dato favorevole al casco ma non dice nulla sul numero di infortuni.`,
  patt: 'Rafforzare con effetto specifico' },

{ k: 'v-vino', diff: 'media', lang: 'it',
  claim: `Una cantina che produce un vino con il 40% di uve Nebbiolo, il 35% di Barbera e il 25% di Freisa deve indicare il Nebbiolo come vitigno prevalente.`,
  passage: `Nella regione di Valdorca un vino può fregiarsi della denominazione «di montagna» solo se almeno l'85% delle uve proviene da vigneti situati oltre i 600 metri di altitudine. In etichetta le cantine devono indicare l'annata e il vitigno prevalente, intendendosi per tale il vitigno che costituisce la quota maggiore delle uve impiegate, anche quando questa quota è inferiore al 50%. Il vino «di montagna» deve inoltre essere imbottigliato nella regione. Nel 2025 le cantine della regione hanno prodotto 2,4 milioni di bottiglie, di cui il 30% con la denominazione «di montagna».`,
  opts: VFN, ans: 2,
  sol: `Frase chiave: «il vitigno prevalente … è quello che costituisce la quota maggiore delle uve impiegate, anche quando questa quota è inferiore al 50%». Il Nebbiolo ha la quota maggiore (40% contro 35% e 25%), quindi è il prevalente pur senza la maggioranza assoluta. L'esempio concreto rientra nella regola generale.`,
  trap: `Rispondere «non ricavabile» perché il brano non nomina né il Nebbiolo né quel vino, oppure «falsa» perché il 40% non arriva alla metà: la regola dice proprio «anche quando … inferiore al 50%». La denominazione «di montagna» è un altro tema.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-direttiva', diff: 'media', lang: 'it',
  passage: `Il piano europeo per la riduzione degli imballaggi stabilisce che, entro il 2030, ogni Stato membro dovrebbe ridurre del 15% la quantità di rifiuti da imballaggio per abitante rispetto al livello del 2018. Il piano prevede un obbligo vincolante soltanto per il divieto di alcune plastiche monouso, in vigore dal 2027, mentre l'obiettivo del 15% ha valore indicativo: gli Stati che non lo raggiungeranno dovranno presentare una relazione sulle cause, ma non sono previste sanzioni. Nel 2022 l'Italia aveva ridotto la quantità di rifiuti da imballaggio per abitante del 4% rispetto al 2018, mentre la media europea era di una riduzione dell'1%.`,
  stem: `In base al brano, quale delle seguenti affermazioni è corretta?`,
  ...put('v-direttiva', `Uno Stato che nel 2030 non avesse raggiunto la riduzione del 15% dovrebbe presentare una relazione sulle cause, ma non subirebbe sanzioni.`,
    [`Entro il 2030 ogni Stato membro è obbligato a ridurre del 15% i rifiuti da imballaggio per abitante.`,
     `Nel 2022 la riduzione dell'Italia era superiore di 4 punti percentuali alla media europea.`,
     `Il divieto delle plastiche monouso, come l'obiettivo del 15%, ha soltanto valore indicativo.`]),
  sol: `Frase chiave: «l'obiettivo del 15% ha valore indicativo: gli Stati che non lo raggiungeranno dovranno presentare una relazione sulle cause, ma non sono previste sanzioni». Le altre: «dovrebbe» non è «è obbligato»; l'Italia ha ridotto del 4% e la media europea dell'1%, una differenza di 3 punti, non 4; il vincolo vale proprio per il divieto delle plastiche monouso, non per l'obiettivo del 15%.`,
  trap: `Esche sui modali e sui numeri: «dovrebbe» trasformato in «è obbligato»; «solo il divieto è vincolante» rovesciato in «soltanto indicativo»; 4% − 1% = 3 punti, non 4 (4 è la riduzione dell'Italia, non la differenza).`,
  patt: 'Modali e obblighi' },

{ k: 'v-regola', diff: 'media', lang: 'it',
  passage: `Dal bando per l'assegnazione di posti letto universitari. Hanno diritto a un posto letto gratuito gli studenti iscritti a un corso di laurea con un ISEE inferiore a 22.000 euro che, entro il 30 settembre, abbiano acquisito almeno 20 crediti se iscritti al secondo anno, o almeno 45 crediti se iscritti al terzo anno o a un anno successivo. Gli studenti iscritti al primo anno non devono possedere crediti. Gli studenti con una disabilità riconosciuta pari ad almeno il 66% hanno diritto al posto letto anche con un ISEE fino a 30.000 euro, a parità degli altri requisiti. Il posto letto è assegnato per un anno e può essere rinnovato solo se lo studente consegue almeno 30 crediti nell'anno. Chi già percepisce una borsa di studio regionale può rinunciarvi per chiedere il posto letto, ma non può cumulare i due benefici.`,
  stem: `Giulia è iscritta al terzo anno, ha un ISEE di 27.000 euro e una disabilità riconosciuta del 70%; al 30 settembre aveva acquisito 38 crediti. Quale delle seguenti affermazioni è corretta?`,
  ...put('v-regola', `Giulia non ha diritto al posto letto, perché non ha acquisito i crediti richiesti.`,
    [`Giulia non ha diritto al posto letto, perché il suo ISEE supera i 22.000 euro.`,
     `Giulia ha diritto al posto letto, perché con una disabilità pari ad almeno il 66% il limite di ISEE sale a 30.000 euro.`,
     `Giulia ha diritto al posto letto, perché ha acquisito più dei 20 crediti richiesti.`]),
  sol: `Giulia è al terzo anno: servono almeno 45 crediti entro il 30 settembre e ne ha 38. La disabilità del 70% alza il limite di ISEE a 30.000 euro («a parità degli altri requisiti»), quindi l'ISEE di 27.000 euro non è un ostacolo, ma non sostituisce il requisito dei crediti. Giulia non ha diritto al posto letto.`,
  trap: `Due opzioni concludono «non ha diritto», ma con motivazioni diverse: quella sull'ISEE è sbagliata perché la disabilità alza il limite. I 20 crediti valgono per il secondo anno, non per il terzo. L'eccezione sulla disabilità riguarda soltanto l'ISEE.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-parcheggi', diff: 'difficile', lang: 'it',
  passage: `In sei città italiane l'introduzione dei parcheggi a pagamento nel centro storico è stata seguita, nell'arco di due anni, da una riduzione del traffico in centro compresa tra il 15% e il 25%. Il consigliere comunale di Borgovecchio ne ricava che anche a Borgovecchio il traffico in centro diminuirà in misura analoga se verranno introdotti parcheggi a pagamento nel centro storico. Borgovecchio ha 40.000 abitanti, di cui 6.000 residenti nel centro storico, e un centro con poche strade a senso unico.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del consigliere?`,
  ...put('v-parcheggi', `A Borgovecchio quasi tutte le auto che circolano in centro appartengono a residenti che dispongono di un box privato e non userebbero mai i parcheggi pubblici.`,
    [`Nelle sei città considerate le tariffe dei parcheggi erano comprese tra 1 e 2 euro all'ora.`,
     `A Borgovecchio il centro storico è raggiunto da due linee di autobus urbano.`,
     `Il comune di Borgovecchio incasserebbe dai parcheggi a pagamento circa 300.000 euro all'anno.`]),
  sol: `Il consigliere ragiona per analogia: ciò che è accaduto in sei città accadrà a Borgovecchio. Il meccanismo è che i parcheggi a pagamento scoraggiano chi cerca un posto in centro. Se a Borgovecchio quasi tutte le auto in centro hanno un box privato, il meccanismo non agisce e Borgovecchio non è simile alle sei città: l'analogia cade.`,
  trap: `Le altre opzioni parlano di tariffe, di autobus e di incassi del comune: dati veri e «concreti» che non toccano il passaggio dalle sei città a Borgovecchio. L'opzione giusta attacca l'ipotesi di somiglianza tra i due casi.`,
  patt: 'Analogia e confronto' },

{ k: 'v-metro', diff: 'media', lang: 'it',
  claim: `La nuova linea della metropolitana ha fatto aumentare il numero di clienti dei negozi situati lungo il suo percorso.`,
  passage: `Dopo l'inaugurazione della nuova linea della metropolitana, nel marzo 2025, i ricavi dei negozi situati lungo il suo percorso sono aumentati in media del 6% rispetto al 2024, mentre quelli dei negozi del resto della città sono rimasti stabili. Alcuni commercianti attribuiscono l'aumento all'arrivo di nuovi clienti dalla periferia, altri alla stagione turistica eccezionalmente favorevole del 2025. Il comune ha affidato a un istituto di ricerca uno studio che dovrebbe distinguere i due effetti e i cui risultati saranno resi noti nel 2027.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «Alcuni commercianti attribuiscono l'aumento…» e «uno studio che dovrebbe distinguere i due effetti». Il brano riporta opinioni diverse e un'indagine ancora da svolgere: non stabilisce che l'aumento dei ricavi dipenda dalla metropolitana, né che sia aumentato il numero di clienti (potrebbe essere cresciuta la spesa di ciascuno). L'affermazione non è né confermata né smentita.`,
  trap: `Accettare un nesso causale «quasi detto» perché i fatti sono vicini nel tempo (inaugurazione, ricavi in crescita). Non è nemmeno «falsa»: il brano non esclude che i nuovi clienti siano venuti grazie alla linea.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-imprese', diff: 'difficile', lang: 'it',
  passage: `Un Paese conta 4 milioni di imprese e 16 milioni di addetti. Le imprese con meno di 10 addetti sono il 94% del totale e occupano il 40% degli addetti; quelle con più di 250 addetti sono lo 0,2% del totale e ne occupano il 25%. Il fatturato per addetto delle grandi imprese è circa il doppio di quello delle microimprese. Un'associazione di categoria osserva che le microimprese, pur rappresentando la quasi totalità delle imprese, generano una quota del fatturato complessivo inferiore alla loro quota di addetti.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-imprese', `In media le microimprese occupano meno di due addetti ciascuna.`,
    [`Le imprese con più di 250 addetti sono più di 10.000.`,
     `In media le imprese con più di 250 addetti occupano circa 400 addetti ciascuna.`,
     `Le imprese con un numero di addetti compreso tra 10 e 250 sono meno dell'1% del totale.`]),
  sol: `Microimprese: 94% di 4 milioni = 3,76 milioni di imprese, con il 40% di 16 milioni = 6,4 milioni di addetti: 6,4 ÷ 3,76 ≈ 1,7 addetti ciascuna, meno di due (corretta). Le altre: le imprese con più di 250 addetti sono lo 0,2% di 4 milioni = 8.000, non più di 10.000; occupano il 25% di 16 milioni = 4 milioni di addetti, cioè 4.000.000 ÷ 8.000 = 500 ciascuna, non 400; le imprese intermedie sono il 100% − 94% − 0,2% = 5,8%, non meno dell'1%.`,
  trap: `Confondere quote e valori assoluti: lo 0,2% di 4 milioni sembra «poche migliaia» ma va calcolato (8.000). Per le medie per impresa bisogna dividere gli addetti per il numero delle imprese della stessa classe, non le due percentuali tra loro. Le imprese intermedie sono il «resto», non una frazione trascurabile.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-export', diff: 'media', lang: 'it',
  passage: `Un'associazione di categoria ha analizzato 120 piccole imprese manifatturiere e ha osservato che tutte quelle che esportano più del 30% del fatturato dispongono di un sito web in lingua inglese. L'associazione conclude che, per far crescere le esportazioni delle imprese associate che ancora non esportano, basterà dotarle di un sito web in inglese, e propone di finanziare la traduzione dei siti con un contributo di 2.000 euro a impresa. Il costo medio di realizzazione di un sito in inglese è di 1.500 euro.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione dell'associazione?`,
  ...put('v-export', `Tra le 120 imprese analizzate, 45 dispongono di un sito in inglese ma esportano meno del 5% del fatturato.`,
    [`Il contributo di 2.000 euro è superiore al costo medio di realizzazione di un sito in inglese.`,
     `La maggior parte delle imprese esportatrici dichiara di avere clienti in più di tre Paesi.`,
     `Il 70% delle imprese analizzate non esporta più del 30% del fatturato.`]),
  sol: `Il dato di partenza dice che il sito in inglese è una condizione necessaria per esportare più del 30%: tutte le grandi esportatrici ce l'hanno. L'associazione la tratta come sufficiente («basterà»). L'informazione che indebolisce è quella che mostra imprese con il sito che non esportano: il sito da sola non basta.`,
  trap: `Le altre opzioni riguardano il costo, i Paesi dei clienti o la quota delle imprese poco esportatrici: dati veri che non toccano il passaggio da «chi esporta ha il sito» a «chi ha il sito esporta». Il contributo superiore al costo è un dettaglio sulla proposta, non sul nesso.`,
  patt: 'Necessario vs sufficiente' },

{ k: 'v-corso', diff: 'media', lang: 'it',
  claim: `Tutti i partecipanti che hanno superato l'esame avevano frequentato almeno l'80% delle lezioni.`,
  passage: `L'azienda Meridia ha organizzato da gennaio a giugno 2025 un corso di formazione sulla sicurezza informatica per 60 dipendenti delle sedi di Bologna e Verona. Alla fine del corso i partecipanti hanno sostenuto un esame. Il responsabile della formazione ha comunicato che tutti coloro che avevano frequentato almeno l'80% delle lezioni hanno superato l'esame. In totale hanno superato l'esame 42 dei 60 partecipanti; gli altri 18 potranno ripeterlo entro sei mesi, senza dover frequentare di nuovo le lezioni.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «tutti coloro che avevano frequentato almeno l'80% delle lezioni hanno superato l'esame». Dice che la frequenza dell'80% basta per superare l'esame; l'affermazione propone l'inverso (chi ha superato l'esame aveva frequentato almeno l'80%), che il brano non afferma e non esclude: alcuni dei 42 potrebbero aver frequentato meno.`,
  trap: `Invertire l'implicazione: «se A allora B» non dice «se B allora A». Non è «falsa»: il brano non afferma che qualcuno abbia superato l'esame con meno dell'80% di frequenza, né il contrario.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-occupazione', diff: 'media', lang: 'it',
  passage: `Secondo i dati diffusi da un istituto di statistica, nel primo trimestre del 2025 il tasso di disoccupazione giovanile (15–24 anni) è sceso dal 21% al 19%, mentre nel secondo trimestre è risalito al 20%. Nello stesso semestre il tasso di occupazione generale, calcolato sulla popolazione tra i 15 e i 64 anni, è rimasto fermo al 62%. L'istituto precisa che il tasso di disoccupazione giovanile è il rapporto tra i giovani che cercano lavoro e le forze di lavoro della stessa età, cioè i giovani che lavorano o cercano lavoro: gli studenti che non cercano un impiego non rientrano nel calcolo. Secondo alcuni economisti il calo del primo trimestre è dovuto in parte al fatto che molti giovani hanno smesso di cercare lavoro.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-occupazione', `Il tasso di disoccupazione giovanile del secondo trimestre 2025 era inferiore a quello da cui si era partiti all'inizio dell'anno.`,
    [`Nel secondo trimestre 2025 è aumentato il numero di giovani che cercano lavoro.`,
     `Il calo della disoccupazione giovanile del primo trimestre è dovuto al fatto che molti giovani hanno smesso di cercare lavoro.`,
     `Nel semestre il numero di occupati tra i 15 e i 64 anni è rimasto invariato.`]),
  sol: `Frasi chiave: «è sceso dal 21% al 19%» (primo trimestre) e «è risalito al 20%» (secondo): 20% è inferiore al 21% di partenza. Le altre: un tasso in aumento può dipendere anche da una riduzione delle forze di lavoro, quindi non si ricava che i giovani in cerca siano aumentati; «secondo alcuni economisti … in parte» è un'opinione parziale, non un fatto; il tasso di occupazione fermo al 62% non implica occupati invariati, perché la popolazione può cambiare.`,
  trap: `«Risalito» fa pensare a un ritorno al livello iniziale, ma 20% è ancora sotto il 21%. Un'opinione («secondo alcuni economisti, in parte») viene trasformata in fatto, e un tasso viene scambiato per un numero.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-fattore', diff: 'media', lang: 'it',
  passage: `Il sindaco di Rocca Lunga dichiara: «Da quando abbiamo introdotto la zona a traffico limitato, la qualità dell'aria in centro è migliorata costantemente». I dati comunali mostrano che la concentrazione media annua di polveri sottili in centro è stata di 42 microgrammi per metro cubo nel 2023 (anno dell'introduzione della zona), di 36 nel 2024 e di 33 nel 2025. Il sindaco aggiunge che le rilevazioni sono effettuate ogni mese da una centralina in centro e che i dati mensili sono archiviati dall'agenzia regionale per l'ambiente.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione del sindaco?`,
  ...put('v-fattore', `L'andamento mensile delle polveri sottili nel 2024 e nel 2025, per verificare se in qualche mese la concentrazione sia risalita.`,
    [`La concentrazione di polveri sottili in centro nel 2022, prima dell'introduzione della zona a traffico limitato.`,
     `Il costo annuale di gestione della zona a traffico limitato.`,
     `Il numero di auto che hanno attraversato la zona nei fine settimana del 2025.`]),
  sol: `La parola chiave è «costantemente»: la qualità dell'aria sarebbe migliorata in modo continuo. I tre valori annuali (42, 36, 33) sono in calo, ma le medie annue possono nascondere mesi di risalita; per verificare «costantemente» servono i dati mensili. Se in qualche mese la concentrazione è risalita, l'affermazione è sbagliata.`,
  trap: `Il 2022 riguarda il «prima» e non il «da quando abbiamo introdotto»; costo e traffico nei fine settimana non dicono nulla sulla regolarità dell'andamento. L'avverbio «costantemente» è la parola da mettere alla prova.`,
  patt: 'Dato mancante' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-prezzo', diff: 'media', lang: 'it', ds: true,
  stem: ds('Il prezzo di un articolo viene aumentato del 20% a marzo e poi ridotto a maggio. Il prezzo di maggio è inferiore al prezzo di febbraio (prima dell\'aumento)?',
    'La riduzione di maggio è del 20% del prezzo di marzo.',
    'La riduzione di maggio è di 5 €.'),
  ...dsq('BADC', 'A'),
  sol: `Sia P il prezzo di febbraio: a marzo è 1,2 · P. (1): a maggio è 1,2 · P · 0,8 = 0,96 · P, che è sempre minore di P: la risposta è «sì» qualunque sia P, quindi la (1) basta. (2): a maggio il prezzo è 1,2 · P − 5, che è minore di P solo se 0,2 · P < 5, cioè se P < 25 €: senza P non si decide.`,
  trap: `Cercare il prezzo esatto: la domanda è sì/no e il rapporto 1,2 · 0,8 = 0,96 la risolve. Pensare che «+20% e −20% si annullino» è l'errore opposto (dà invariato, ma è inferiore). La (2) sembra concreta (5 €) ma dipende da P.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-trasporti', diff: 'difficile', lang: 'it', asset: tTrasporti(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-trasporti', `Tra chi va al lavoro in bicicletta o a piedi, gli intervistati di 18–34 anni sono più del doppio di quelli di 35–54 anni.`,
    [`Più della metà degli intervistati va al lavoro in auto.`,
     `Gli intervistati che usano i mezzi pubblici sono meno del 25% del totale.`,
     `Gli intervistati di 55 anni e oltre che usano l'auto sono più numerosi di quelli di 35–54 anni che usano l'auto.`]),
  sol: `Le percentuali sono di riga: servono i numeri. 18–34 (600): 180 auto, 240 mezzi pubblici, 180 bici. 35–54 (400): 240, 100, 60. 55+ (200): 160, 20, 20. Bici o a piedi: 180 contro 60, il triplo, quindi più del doppio (vera). Auto: 180 + 240 + 160 = 580 su 1.200 = 48,3% (la prima è falsa). Mezzi pubblici: 360 su 1.200 = 30%, non meno del 25% (falsa). Auto di 55+ contro 35–54: 160 contro 240 (falsa).`,
  trap: `Leggere le percentuali come numeri: 30% contro 15% fa pensare a «esattamente il doppio», ma le fasce hanno 600 e 400 intervistati. La media semplice delle quote di auto (30, 60, 80) è 56,7%, ma pesate dà 48,3%. L'80% dei 55+ è più alto del 60% dei 35–54, ma su 200 persone invece che su 400.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-lingue', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Un'agenzia ha 12 dipendenti. Ciascuno di loro parla almeno una tra inglese e tedesco.`,
    `9 dipendenti parlano inglese e 7 parlano tedesco.`,
    `Tutti i dipendenti che parlano francese parlano anche tedesco.`
  ], [
    `A. Almeno 4 dipendenti parlano sia inglese sia tedesco.`,
    `B. Al massimo 3 dipendenti parlano soltanto inglese.`,
    `C. Almeno 2 dipendenti parlano francese.`,
    `D. Nessun dipendente che parla soltanto inglese parla francese.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la B sia la C', 'Solo la D', 'Sia la A sia la D'], ans: 3,
  sol: `A: |inglese ∩ tedesco| = 9 + 7 − 12 = 4, perché ognuno parla almeno una delle due lingue: «almeno 4» è vera. B: chi non parla tedesco parla soltanto inglese: 12 − 7 = 5 dipendenti, non «al massimo 3» (falsa). C: nessun dato impone che qualcuno parli francese (non sicura). D: chi parla francese parla tedesco; chi parla «soltanto inglese» non parla tedesco, quindi non parla francese: vera per logica, senza numeri.`,
  trap: `La D non contiene numeri e si vede per ultima, ma è una conseguenza logica del terzo dato. Dopo aver trovato la A con il calcolo, si rischia di scegliere «Solo la A». La B sembra vera perché «soltanto inglese» fa pensare a pochi dipendenti: sono 5.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-ordini', diff: 'media', lang: 'it', asset: gOrdini(),
  stem: `Qual è stato il margine totale dell'azienda nel semestre gennaio–giugno?`,
  ...put('d-ordini', '3,9 milioni di euro', ['3,5 milioni di euro', '4,2 milioni di euro', '19,5 milioni di euro']),
  sol: `Gennaio–marzo: 40 + 50 + 60 = 150 mila ordini, 150.000 · 50 € = 7,5 milioni. Aprile–giugno: 60 + 70 + 70 = 200 mila ordini, 200.000 · 60 € = 12 milioni. Incasso del semestre: 19,5 milioni. Margine: 20% di 19,5 = 3,9 milioni di euro.`,
  trap: `Usare un solo valore medio per tutti i 350 mila ordini: 50 € dà 3,5 milioni e 60 € dà 4,2 milioni. 19,5 milioni è l'incasso, non il margine. Il valore medio dell'ordine cambia a metà semestre e va applicato ai due periodi.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-triangolo', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un triangolo ABC ha i lati AB = 6 cm e AC = 8 cm. Qual è la sua area?',
    'L\'angolo in A è retto.',
    'Il lato BC misura 10 cm.'),
  ...dsq('DCBA', 'C'),
  sol: `(1): con l'angolo in A retto, AB e AC sono base e altezza e l'area è 6 · 8 ÷ 2 = 24 cm². (2): i tre lati 6, 8, 10 soddisfano 6² + 8² = 36 + 64 = 100 = 10², quindi (teorema di Pitagora inverso) il triangolo è rettangolo in A e l'area è ancora 24 cm². Ciascuna affermazione basta da sola.`,
  trap: `Credere che la (2) non basti perché non parla dell'angolo: tre lati determinano il triangolo, e qui formano una terna pitagorica (6, 8, 10). Credere che la (1) non basti perché non c'è il lato BC: per l'area del triangolo rettangolo servono solo i due cateti.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-spesa', diff: 'difficile', lang: 'it', asset: tSpesa(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  ...put('d-spesa', `Nel 2025 la spesa per i trasporti è almeno un terzo di quella per la sanità.`,
    [`La spesa per l'istruzione è cresciuta in ciascun anno rispetto all'anno precedente.`,
     `La spesa totale dei tre settori è aumentata, tra il 2021 e il 2025, di più del 16%.`,
     `Nel biennio 2024–2025 la spesa per la sanità è stata più del doppio di quella per l'istruzione.`]),
  sol: `Trasporti 2025: 13,6; un terzo della sanità 2025: 40,2 ÷ 3 = 13,4; 13,6 ≥ 13,4 (vera). Istruzione: 19,8 nel 2023 e nel 2024, quindi non cresce ogni anno (falsa). Totale 2021: 18,4 + 34,0 + 12,6 = 65,0; totale 2025: 21,0 + 40,2 + 13,6 = 74,8; 74,8 ÷ 65,0 ≈ +15,1%, non più del 16% (falsa). Biennio 2024–2025: sanità 38,4 + 40,2 = 78,6; istruzione 19,8 + 21,0 = 40,8, il cui doppio è 81,6 > 78,6 (falsa).`,
  trap: `Le confronti sono costruiti vicini alla soglia: 13,6 contro 13,4 (vera per poco), 78,6 contro 81,6 («più del doppio» è falsa per poco), 15,1% contro 16%. Con numeri vicini l'«a occhio» sbaglia: vanno calcolati. «In ciascun anno» è smentito da un solo anno (2023–2024).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-ripiani', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Quattro libri — un giallo, uno storico, un fantasy e un saggio — occupano quattro ripiani diversi di una libreria, numerati da 1 (il più basso) a 4 (il più alto), un libro per ripiano.`,
    `Il giallo non sta né sul ripiano 1 né sul ripiano 4.`,
    `Il saggio sta più in alto dello storico.`,
    `Il fantasy sta sul ripiano 1 o sul ripiano 4.`
  ], [
    `A. Il saggio sta sul ripiano 1.`,
    `B. Lo storico sta sul ripiano 4.`,
    `C. Il giallo sta più in alto del fantasy.`,
    `D. Il giallo e il saggio non stanno su ripiani adiacenti.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la A', 'Sia la C sia la D', 'Sia la B sia la C', 'Sia la A sia la B'], ans: 3,
  sol: `Le disposizioni (dal ripiano 1 al 4) compatibili sono quattro: fantasy–giallo–storico–saggio; fantasy–storico–giallo–saggio; storico–giallo–saggio–fantasy; storico–saggio–giallo–fantasy. A: il saggio sta sopra lo storico, quindi non può essere sul ripiano 1: sicuramente falsa. B: se lo storico fosse sul ripiano 4, non ci sarebbe nulla più in alto per il saggio: sicuramente falsa. C: vera nelle prime due disposizioni, falsa nelle altre due (non sicura). D: vera solo nella prima disposizione (giallo sul 2 e saggio sul 4), falsa nelle altre tre (non sicura).`,
  trap: `Con la consegna «false» si scelgono le proposizioni vere. Dopo aver visto la A (immediata), la B richiede un ragionamento in più: lo storico non può stare sul ripiano più alto. C e D non sono né sempre vere né sempre false: «possibile» non vuol dire «sicuramente falso».`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-lingue-ds', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('In una scuola di lingue il 70% degli iscritti studia inglese e, tra questi, il 40% studia anche spagnolo. Quanti iscritti studiano spagnolo ma non inglese?',
    'Gli iscritti alla scuola sono 500.',
    'Gli iscritti che studiano spagnolo sono in tutto 250.'),
  ...dsq('CBDA', 'B'),
  sol: `Se N sono gli iscritti, chi studia sia inglese sia spagnolo è 0,7 · 0,4 · N = 0,28 · N. (1) da sola: N = 500, quindi 140 studiano entrambe, ma non si sa quanti studino spagnolo in tutto. (2) da sola: gli studenti di spagnolo sono 250, ma senza N non si sa quanti tra loro studino anche inglese. Insieme: 250 − 0,28 · 500 = 250 − 140 = 110 iscritti studiano spagnolo ma non inglese.`,
  trap: `Pensare che la (2) basti perché «250 studiano spagnolo»: tra questi 250 alcuni studiano anche inglese. Il 28% (70% · 40%) è una percentuale di tutti gli iscritti, non degli iscritti di spagnolo, e per usarla serve N.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-linee', diff: 'media', lang: 'it', asset: gLinee(),
  stem: `Quanto ha incassato online la linea Cucine nel 2025?`,
  ...put('d-linee', '336.000 €', ['504.000 €', '280.000 €', '420.000 €']),
  sol: `Fatturato 2025 della linea Cucine: 35% di 2.400.000 = 840.000 €. Negozio e online stanno nel rapporto 3 : 2, quindi l'online è 2/5 del totale della linea: 840.000 · 2/5 = 336.000 €. Il +20% rispetto al 2024 non serve.`,
  trap: `Scambiare i due rapporti (3/5 dà 504.000 €); dividere per due senza usare il 3 : 2 (420.000 €); usare il fatturato 2024 come base, 2.400.000 ÷ 1,2 = 2.000.000 (35% = 700.000; 2/5 = 280.000 €). Il totale indicato è già quello del 2025.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-badge', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `In un ufficio, tutti i dipendenti che lavorano in smart working hanno il badge digitale.`,
    `Il badge digitale viene assegnato unicamente a chi ha completato il corso di sicurezza.`,
    `Nessun neoassunto ha completato il corso di sicurezza.`,
    `Carla lavora in smart working.`
  ], [
    `A. Carla ha completato il corso di sicurezza.`,
    `B. Tutti i dipendenti con il badge digitale lavorano in smart working.`,
    `C. Carla è una neoassunta.`,
    `D. Alcuni neoassunti hanno il badge digitale.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Sia la A sia la B', 'Solo la C', 'Sia la C sia la D', 'Sia la B sia la D'], ans: 2,
  sol: `Carla lavora in smart working, quindi ha il badge, quindi (badge «unicamente» a chi ha fatto il corso) ha completato il corso: A è vera. Chi ha completato il corso non è un neoassunto, perciò Carla non è una neoassunta: C è sicuramente falsa. Per lo stesso motivo nessun neoassunto ha il badge (lo avrebbe solo chi ha completato il corso): D è sicuramente falsa. B inverte il primo dato: il badge non implica lo smart working (non sicura).`,
  trap: `Con la consegna «false» si indica la A (vera) per distrazione. La B è l'implicazione inversa del primo dato: non è sicuramente falsa, perché il badge potrebbe averlo anche chi non lavora in smart working. «Unicamente» lega il badge al corso in un solo verso.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-cisterna', diff: 'media', lang: 'it', ds: true,
  stem: ds('Una cisterna contiene un numero intero di litri, compreso tra 300 e 500 (estremi inclusi). Quanti litri contiene?',
    'Se la si svuota con bottiglie da 7 litri, ne avanzano 3.',
    'Se la si svuota con bottiglie da 5 litri, ne avanzano 2.'),
  ...dsq('ABDC', 'D'),
  sol: `(1) dice n ≡ 3 (mod 7); (2) dice n ≡ 2 (mod 5). Insieme: n ≡ 17 (mod 35), cioè n = 17 + 35k. Tra 300 e 500: 332, 367, 402, 437, 472. Sono cinque valori possibili, quindi anche con entrambe le affermazioni servono altri dati.`,
  trap: `Pensare che due resti fissino il numero: determinano soltanto la classe modulo 35 (7 · 5), e in un intervallo di 200 litri ci sono cinque o sei numeri di quella classe. Il limite 300–500 restringe, ma non basta.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-nessuna', diff: 'difficile', lang: 'it', asset: tDivisioni(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel 2025 i ricavi della divisione Sud sono più che doppi rispetto a quelli del 2022.`,
         `Tra il 2022 e il 2025 la crescita percentuale più alta è stata quella della divisione Centro.`,
         `Nel 2025 la divisione Nord ha realizzato più del 45% dei ricavi totali del gruppo.`,
         `Nessuna delle altre risposte è corretta.`], ans: 3,
  sol: `Prima: i ricavi del Sud sono 40 nel 2025 e 20 nel 2022, esattamente il doppio, non più che doppi (falsa). Seconda: crescita 2022–2025 del Nord 18 ÷ 48 = 37,5%, del Centro 14 ÷ 30 ≈ 46,7%, del Sud 20 ÷ 20 = 100%: la più alta è quella del Sud (falsa). Terza: ricavi totali 2025 = 66 + 44 + 40 = 150; il Nord ha 66 ÷ 150 = 44%, non più del 45% (falsa). Quindi l'unica corretta è «Nessuna delle altre».`,
  trap: `«Più che doppi» con 40 contro 20 e «più del 45%» con 44% sono costruiti a un soffio dalla soglia. La crescita percentuale più alta non è quella in valore assoluto più alta (Nord +18, Centro +14, Sud +20) e non è nemmeno quella del Centro. Quando tutte le altre sono false, la risposta giusta è proprio «Nessuna delle altre».`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-variazioni', diff: 'difficile', lang: 'it', asset: gVariazioni(),
  stem: `Quante unità sono state vendute in tutto nei sei mesi, da gennaio a giugno compresi?`,
  ...put('d-variazioni', '2.560', ['2.500', '2.400', '2.160']),
  sol: `Si ricostruisce la serie mese per mese, sempre rispetto al mese precedente. Gennaio 400; febbraio +25%: 500; marzo −20%: 400; aprile +50%: 600; maggio −50%: 300; giugno +20%: 360. Totale: 400 + 500 + 400 + 600 + 300 + 360 = 2.560.`,
  trap: `Applicare tutte le percentuali a gennaio (400): si ottiene 400 + 500 + 320 + 600 + 200 + 480 = 2.500, ma ogni variazione è rispetto al mese immediatamente precedente. 2.400 = 6 · 400 ignora le variazioni; 2.160 è il totale senza gennaio.`,
  patt: 'Percentuali composte' },

{ k: 'd-soci', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Un circolo sportivo ha soci di tre categorie: junior, senior e veterani.`,
    `I soci junior sono esattamente la metà dei soci senior.`,
    `I veterani sono 6.`,
    `In totale i soci sono almeno 30 e al massimo 40.`
  ], [
    `A. I soci senior sono più dei junior e dei veterani messi insieme.`,
    `B. Il numero totale dei soci è un multiplo di 3.`,
    `C. I soci junior sono almeno 10.`,
    `D. I soci sono più di 35.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Sia la B sia la D', 'Solo la B', 'Sia la A sia la B'], ans: 3,
  sol: `Con S senior, i junior sono S/2 (quindi S è pari) e il totale è S + S/2 + 6 = 1,5 · S + 6, compreso tra 30 e 40: S può valere 16, 18, 20 o 22, con totale 30, 33, 36 o 39 e junior 8, 9, 10 o 11. A: S > S/2 + 6 equivale a S > 12, sempre vera. B: il totale è 3 · (S/2) + 6, sempre multiplo di 3 (30, 33, 36, 39): sempre vera. C: i junior possono essere 8 o 9 (non sicura). D: il totale può essere 30 o 33 (non sicura).`,
  trap: `Lasciare perdere la B perché non è un confronto tra conteggi: è una proprietà del totale, ma il totale è sempre 3 volte (S/2 + 2). Bisogna enumerare i quattro casi o scrivere il totale in funzione dei junior (J + 2J + 6 = 3J + 6).`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-stipendi', diff: 'media', lang: 'it', ds: true,
  stem: ds('In un\'azienda lavorano 40 persone, tra operai e impiegati. Lo stipendio medio degli operai è di 1.800 € e quello degli impiegati è di 2.600 €. Lo stipendio medio di tutti i 40 dipendenti è superiore a 2.200 €?',
    'Gli impiegati sono più di 20.',
    'Gli operai sono più di 15.'),
  ...dsq('DACB', 'A'),
  sol: `Con E impiegati, la media di tutti è 1.800 + 800 · E ÷ 40 = 1.800 + 20 · E. Supera 2.200 se E > 20. (1): E > 20, quindi la media supera 2.200: risposta «sì», la (1) basta. (2): gli operai sono più di 15, quindi gli impiegati sono meno di 25 (E ≤ 24): con E = 24 la media è 2.280 (sì), con E = 5 è 1.900 (no). La (2) non basta.`,
  trap: `Pensare alla media semplice di 1.800 e 2.600 (2.200 esatti): vale solo con 20 operai e 20 impiegati; la media dei 40 dipendenti dipende dal peso di ciascun gruppo. La (2) sembra dare il rapporto tra i gruppi, ma fissa solo un limite sugli impiegati (meno di 25) senza dire se superano 20.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-camicie', diff: 'facile', lang: 'it', ds: true,
  stem: ds('Un negozio vende camicie e pantaloni, ciascuno a un prezzo fisso. Quanto costa una camicia?',
    'Due camicie e un paio di pantaloni costano 90 €.',
    'Una camicia e due paia di pantaloni costano 105 €.'),
  ...dsq('BCAD', 'B'),
  sol: `Con c e p i prezzi di camicia e pantaloni: (1) 2c + p = 90 e (2) c + 2p = 105. Da sola ciascuna equazione ha infinite soluzioni (per esempio c = 20, p = 50 nella (1)). Insieme: moltiplicando la (1) per 2 si ha 4c + 2p = 180; sottraendo la (2): 3c = 75, cioè c = 25 € (e p = 40 €).`,
  trap: `Credere che una sola equazione con due incognite basti, o che due equazioni bastino sempre: qui le due equazioni sono indipendenti (una non è un multiplo dell'altra), quindi insieme fissano c. Se la seconda fosse stata 4c + 2p = 180, sarebbe stata la stessa equazione e non sarebbe bastata.`,
  patt: 'Sufficienza dei dati' }
];

/* ================ DISPOSIZIONE IN SCHERMATE DA TRE ================ */
const ROT = ['DQV', 'QVD', 'VDQ', 'DVQ', 'QDV', 'VQD'];
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
  id: '19',
  title: 'Mock 19',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Tutto in italiano, livello del Mock 15: basi delle percentuali e listino dallo scontato, lavoro con cambio a metà, resti e congruenze, combinatoria con vincoli, brani con modali e opzioni quasi tutte plausibili. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false», sufficienza dei dati e tabelle con percentuali di riga.',
  questions: QUESTIONS,
  data: DATA
};
});
