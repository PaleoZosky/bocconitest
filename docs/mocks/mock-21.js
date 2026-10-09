/* =======================================================================
   Mock 21 — 50 domande nuove (18 Q, 16 V, 16 DI), tutte in italiano,
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
   la domanda per gli script di verifica (tools/check_math_21.py).
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
  'q-abbonamento': 1,
  'q-vasca': 0,
  'q-media-inversa': 2,
  'q-parole': 3,
  'q-urna': 0,
  'q-ne3ne4': 1,
  'q-somma': 2,
  'q-ninfee': 3,
  'q-figurine': 1,
  'q-conto': 0,
  'q-quota': 2,
  'q-pari4000': 3,
  'q-officina': 1,
  'q-scuola': 0,
  'q-spam': 2,
  'q-nondet': 3,
  'q-hotel': 1,
  'q-lucchetto': 0,
  'v-occupazione': 2,
  'v-ricarico': 0,
  'v-abbonamenti': 3,
  'v-ateneo': 1,
  'v-anziani': 2,
  'v-bus': 0,
  'v-agile': 3,
  'v-necessario': 1,
  'v-trasferta': 2,
  'v-furti': 0,
  'v-frane': 3,
  'd-editoria': 1,
  'd-variazioni': 2,
  'd-assistenza': 0
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
  /* ricavi di un gruppo editoriale per area (%), totale (milioni di euro) e variazioni previste (%) */
  editoria: { nomi: ['Libri', 'Riviste', 'Digitale', 'Altro'], quote: [45, 25, 20, 10], totale: 120, variazioni: [0, -20, 50, 0] },
  /* variazione % mensile delle vendite rispetto al mese precedente e vendite di dicembre */
  variazioni: { mesi: ['Gen', 'Feb', 'Mar', 'Apr'], v: [20, -10, 25, -20], dicembre: 500 },
  /* richieste di assistenza in una settimana e quota di urgenti di lunedì e venerdì (%) */
  assistenza: { giorni: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven'], richieste: [50, 30, 40, 30, 100], urgLun: 30, urgVen: 20 },
  /* candidati e % di ammessi per sede */
  ammissioni: { sedi: ['Sede A', 'Sede B', 'Sede C'], candidati: [500, 300, 200], ammessi: [40, 60, 50] },
  /* ricavi (milioni di euro) di una catena: negozi, online (cella nascosta = null), totale */
  catena: { anni: [2021, 2022, 2023, 2024, 2025], negozi: [60, 62, 64, 66, 68], online: [15, 20, null, 34, 40], totale: [75, 82, 90, 100, 108] },
  /* superficie (km²) e abitanti (migliaia) di quattro regioni */
  regioni: { nomi: ['Alfa', 'Beta', 'Gamma', 'Delta'], sup: [2000, 5000, 1000, 4000], ab: [600, 1000, 400, 1200] }
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

function gEditoria() {
  const D = DATA.editoria;
  return `<figure class="fig"><figcaption>Ricavi di un gruppo editoriale per area (% dei ricavi totali)</figcaption>` + C.pie({
    data: D.nomi.map((n, i) => [n, D.quote[i]]), title: 'Ricavi del gruppo',
    aria: 'Torta dei ricavi del gruppo editoriale: ' + D.nomi.map((n, i) => n + ' ' + D.quote[i] + '%').join(', ') + '.'
  }) + `<p class="fig-note">I ricavi totali di quest'anno sono ${D.totale} milioni di euro. L'anno prossimo i ricavi del digitale aumenteranno del ${D.variazioni[2]}%, quelli delle riviste diminuiranno del ${-D.variazioni[1]}% e quelli delle altre aree non cambieranno.</p></figure>`;
}

function gVariazioni() {
  const D = DATA.variazioni;
  return `<figure class="fig"><figcaption>Variazione percentuale mensile delle vendite rispetto al mese precedente</figcaption>` + C.line({
    labels: D.mesi,
    series: [{ name: 'Variazione %', values: D.v }],
    lo: -30, hi: 30, gridFrom: -30, gridTo: 30, gridStep: 10, L: 46, R: 30, legend: false, title: '% rispetto al mese precedente',
    aria: 'Linea della variazione percentuale mensile delle vendite: ' + D.mesi.map((m, i) => m + ' ' + D.v[i] + '%').join(', ') + '.'
  }) + `<p class="fig-note">Ogni punto è la variazione rispetto al mese immediatamente precedente.</p></figure>`;
}

function gAssistenza() {
  const D = DATA.assistenza;
  return `<figure class="fig"><figcaption>Richieste di assistenza ricevute in una settimana</figcaption>` + C.bars({
    labels: D.giorni, series: [{ name: 'Richieste', values: D.richieste }], max: 120, legend: false,
    aria: 'Istogramma delle richieste di assistenza: ' + D.giorni.map((g, i) => g + ' ' + D.richieste[i]).join(', ') + '.'
  }) + `<p class="fig-note">Il ${D.urgLun}% delle richieste del lunedì e il ${D.urgVen}% di quelle del venerdì sono urgenti; negli altri giorni nessuna richiesta è urgente.</p></figure>`;
}

function tAmmissioni() {
  const D = DATA.ammissioni;
  return C.table({
    caption: 'Candidati a un test di ammissione e quota di ammessi, per sede',
    head: ['Sede', 'Candidati', 'Ammessi (% dei candidati)'],
    rows: D.sedi.map((s, i) => [s, fmt(D.candidati[i]), D.ammessi[i] + '%'])
  });
}

function tCatena() {
  const D = DATA.catena, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Ricavi di una catena di abbigliamento, in milioni di euro',
    head: ['Anno', 'Negozi', 'Online', 'Totale'],
    rows: D.anni.map((a, i) => [a, D.negozi[i], c(D.online[i]), D.totale[i]])
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato.</p>`;
}

function tRegioni() {
  const D = DATA.regioni;
  return C.table({
    caption: 'Superficie e popolazione di quattro regioni',
    head: ['Regione', 'Superficie (km²)', 'Abitanti (migliaia)'],
    rows: D.nomi.map((n, i) => [n, fmt(D.sup[i]), fmt(D.ab[i])])
  });
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-abbonamento', diff: 'media', lang: 'it',
  stem: `Dopo un aumento del 25% un abbonamento annuale costa 50 €. Un cliente fedele ha diritto a uno sconto del 10% sul prezzo che l'abbonamento aveva prima dell'aumento. Quanto paga il cliente fedele?`,
  ...put('q-abbonamento', '36 €', ['45 €', '40 €', '37,50 €']),
  sol: `Prezzo prima dell'aumento: 50 ÷ 1,25 = 40 €. Sconto del 10% su 40 €: 40 · 0,9 = 36 €.`,
  trap: `45 € applica il 10% ai 50 € attuali; 40 € ignora lo sconto; 37,50 € «toglie» il 25% a 50 € (50 · 0,75), ma il 25% era calcolato sul prezzo vecchio, non su quello nuovo.`,
  patt: 'Base della percentuale' },

{ k: 'q-vasca', diff: 'media', lang: 'it',
  stem: `Un rubinetto riempirebbe da solo una vasca in 6 ore; lo scarico la svuoterebbe da solo, a vasca piena, in 12 ore. Partendo dalla vasca vuota, si aprono insieme rubinetto e scarico. Dopo quante ore la vasca è piena?`,
  ...put('q-vasca', '12 ore', ['4 ore', '9 ore', '18 ore']),
  sol: `Il rubinetto riempie 1/6 della vasca all'ora, lo scarico ne svuota 1/12: il guadagno netto è 1/6 − 1/12 = 1/12 all'ora, quindi servono 12 ore.`,
  trap: `4 ore somma i due ritmi (1/6 + 1/12 = 1/4) come se anche lo scarico riempisse; 9 ore è la media di 6 e 12; 18 ore è la somma dei due tempi.`,
  patt: 'Lavoro e portate' },

{ k: 'q-media-inversa', diff: 'media', lang: 'it',
  stem: `In una classe i maschi hanno preso in media 6 e le femmine in media 9; la media dell'intera classe è 8. Le femmine sono 12. Quanti sono i maschi?`,
  ...put('q-media-inversa', '6', ['24', '12', '8']),
  sol: `La media 8 dista 2 da 6 e 1 da 9: i pesi sono inversamente proporzionali alle distanze, quindi maschi : femmine = 1 : 2. Con 12 femmine i maschi sono 6. (Controllo: (6 · 6 + 12 · 9) ÷ 18 = 144 ÷ 18 = 8.)`,
  trap: `Il rapporto 2 : 1 preso al contrario dà 24 maschi: il gruppo più vicino alla media (le femmine) è quello più numeroso. 12 maschi pareggerebbe i due gruppi e darebbe media 7,5; 8 è la media dell'intera classe.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-parole', diff: 'media', lang: 'it',
  stem: `Con le sette lettere distinte A, E, I, B, C, D, F (tre vocali e quattro consonanti) si formano parole di tre lettere, tutte diverse tra loro, anche prive di significato. Quante iniziano con una consonante e finiscono con una vocale?`,
  ...put('q-parole', '60', ['12', '72', '24']),
  sol: `Prima lettera: 4 consonanti; ultima: 3 vocali; la lettera centrale può essere una qualsiasi delle 5 rimaste (7 − 2). In tutto 4 · 5 · 3 = 60.`,
  trap: `12 = 4 · 3 dimentica la lettera centrale; 72 = 4 · 6 · 3 sceglie la centrale tra 6 lettere, come se solo una fosse già usata; 24 = 4 · 2 · 3 la sceglie tra le sole 2 vocali rimaste.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-urna', diff: 'difficile', lang: 'it',
  stem: `Un'urna contiene 3 palline bianche e 5 nere. Si estraggono due palline una dopo l'altra, senza reinserimento. Qual è la probabilità che la seconda pallina estratta sia bianca?`,
  ...put('q-urna', fr(3, 8), [fr(3, 7), fr(2, 7), fr(9, 56)]),
  sol: `Prima nera e poi bianca: 5/8 · 3/7 = 15/56. Prima bianca e poi bianca: 3/8 · 2/7 = 6/56. Somma: 21/56 = 3/8. (Per simmetria: senza sapere la prima, la seconda pallina ha la stessa probabilità della prima di essere bianca.)`,
  trap: `3/7 è la probabilità condizionata se la prima era nera, 2/7 se era bianca: il testo non dice il colore della prima, quindi vanno sommati i due casi. 9/56 moltiplica 3/8 per 3/7 mescolando i casi.`,
  patt: 'Probabilità: casi alternativi' },

{ k: 'q-ne3ne4', diff: 'media', lang: 'it',
  stem: `Tra i numeri interi da 1 a 60 (estremi inclusi), quanti non sono divisibili né per 3 né per 4?`,
  ...put('q-ne3ne4', '30', ['25', '40', '45']),
  sol: `Multipli di 3: 20; multipli di 4: 15; multipli di entrambi, cioè di 12: 5. Divisibili per 3 o per 4: 20 + 15 − 5 = 30. Gli altri sono 60 − 30 = 30.`,
  trap: `25 = 60 − 20 − 15 sottrae due volte i multipli di 12; 40 considera solo i multipli di 3; 45 solo quelli di 4.`,
  patt: 'Multipli e inclusione-esclusione' },

{ k: 'q-somma', diff: 'media', lang: 'it',
  stem: `Qual è la somma di tutti i numeri interi da 1 a 60 che non sono multipli di 5?`,
  ...put('q-somma', '1.440', ['1.830', '1.818', '1.500']),
  sol: `Somma da 1 a 60: 60 · 61 ÷ 2 = 1.830. Multipli di 5 fino a 60: 5, 10, …, 60, cioè 5 · (1 + 2 + … + 12) = 5 · 78 = 390. Differenza: 1.830 − 390 = 1.440.`,
  trap: `1.830 non toglie nulla; 1.818 toglie solo il numero dei multipli (12) invece della loro somma; 1.500 dimentica il multiplo 60 (toglie 330).`,
  patt: 'Somma 1…n' },

{ k: 'q-ninfee', diff: 'media', lang: 'it',
  stem: `In uno stagno una ninfea raddoppia ogni giorno la superficie coperta e da sola ricoprirebbe l'intero stagno in 20 giorni. Se si piantano contemporaneamente due ninfee identiche, in quanti giorni ricoprono insieme l'intero stagno?`,
  ...put('q-ninfee', '19', ['10', '18', '15']),
  sol: `Due ninfee identiche coprono in ogni momento il doppio di una sola. Poiché la superficie di una sola raddoppia ogni giorno, le due ninfee arrivano a stagno pieno un giorno prima: 19 giorni.`,
  trap: `10 giorni dimezza il tempo come se la crescita fosse lineare; 18 anticipa di due giorni; 15 è una stima «a metà strada». Con una crescita che raddoppia ogni giorno, raddoppiare il punto di partenza fa guadagnare un solo giorno.`,
  patt: 'Crescita esponenziale' },

{ k: 'q-figurine', diff: 'facile', lang: 'it',
  stem: `Anna ha il triplo delle figurine di Bea. Se Anna ne regala 8 a Bea, le due amiche ne hanno lo stesso numero. Quante figurine ha Anna all'inizio?`,
  ...put('q-figurine', '24', ['16', '32', '12']),
  sol: `Se Bea ne ha B, Anna ne ha 3B. Dopo il regalo: 3B − 8 = B + 8, quindi 2B = 16, B = 8 e Anna ne ha 24.`,
  trap: `16 è il numero che ciascuna ha alla fine; 12 è la metà di 24; 32 = 3 · 8 + 8 aggiunge gli 8 invece di toglierli.`,
  patt: 'Equazioni a parole' },

{ k: 'q-conto', diff: 'media', lang: 'it',
  stem: `Tre amici dividono il conto di una cena. Ada paga il 40% del totale, Bea paga un terzo di quello che resta dopo Ada, Carlo paga il resto, cioè 36 €. Qual è il totale del conto?`,
  ...put('q-conto', '90 €', ['108 €', '72 €', '120 €']),
  sol: `Dopo Ada resta il 60% del totale; Bea ne paga un terzo, cioè il 20%; a Carlo resta il 40% del totale. Se il 40% vale 36 €, il totale è 36 ÷ 0,4 = 90 €.`,
  trap: `108 € = 36 · 3 tratta Carlo come «un terzo» del totale; 72 € e 120 € dividono 36 per 0,5 e per 0,3, cioè usano una quota sbagliata per Carlo.`,
  patt: 'Frazioni successive' },

{ k: 'q-quota', diff: 'difficile', lang: 'it',
  stem: `La quota di mercato di un'azienda sale dal 20% al 25%, mentre il mercato complessivo cresce del 40%. Di quanto sono cresciute, in percentuale, le vendite dell'azienda?`,
  ...put('q-quota', '+75%', ['+5%', '+25%', '+65%']),
  sol: `Vendite = quota · mercato. Il fattore di crescita è (25 ÷ 20) · 1,4 = 1,25 · 1,4 = 1,75: +75%.`,
  trap: `+5% è l'aumento in punti percentuali della quota; +25% è l'aumento relativo della quota, senza il mercato; +65% somma +25% e +40% invece di moltiplicare i due fattori.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-pari4000', diff: 'difficile', lang: 'it',
  stem: `Con le cifre 1, 2, 3, 4, 5 e 6, ciascuna usata al massimo una volta, quanti numeri di quattro cifre sono pari e maggiori di 4.000?`,
  ...put('q-pari4000', '84', ['108', '72', '96']),
  sol: `La prima cifra è 4, 5 o 6 e l'ultima è 2, 4 o 6, diverse tra loro. Prima = 4: ultima 2 o 6 (2 scelte); prima = 5: ultima 2, 4 o 6 (3); prima = 6: ultima 2 o 4 (2). In ogni caso le due cifre centrali si scelgono tra le 4 rimaste in 4 · 3 = 12 modi: (2 + 3 + 2) · 12 = 84.`,
  trap: `108 = 3 · 3 · 12 conta 3 prime cifre e 3 ultime senza togliere le coppie in cui la cifra coincide (4–4 e 6–6); 72 e 96 contano 6 o 8 coppie (prima, ultima) invece di 7.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-officina', diff: 'media', lang: 'it',
  stem: `Un'officina ripara in tutto 12 biciclette al giorno, lavora 5 giorni a settimana e ha 4 meccanici. Ogni riparazione fa incassare 25 €, ma il 20% delle riparazioni viene poi rimborsato al cliente per un difetto. Quanto incassa l'officina in una settimana, al netto dei rimborsi?`,
  ...put('q-officina', '1.200 €', ['1.500 €', '300 €', '4.800 €']),
  sol: `Riparazioni settimanali: 12 · 5 = 60; incasso lordo: 60 · 25 = 1.500 €; rimborsi: 20% di 1.500 = 300 €; netto: 1.500 − 300 = 1.200 €. Il numero dei meccanici è un dato superfluo.`,
  trap: `1.500 € dimentica i rimborsi; 300 € è il solo rimborso; 4.800 € moltiplica per i 4 meccanici (dato superfluo): le 12 riparazioni sono già quelle dell'intera officina.`,
  patt: 'Dati superflui' },

{ k: 'q-scuola', diff: 'media', lang: 'it',
  stem: `In una scuola il rapporto tra studenti e insegnanti è 15 a 1 nella primaria (30 insegnanti) e 10 a 1 nella secondaria (20 insegnanti). Qual è il rapporto tra studenti e insegnanti nell'intera scuola?`,
  ...put('q-scuola', '13 a 1', ['12,5 a 1', '12 a 1', '25 a 1']),
  sol: `Studenti: 30 · 15 = 450 alla primaria e 20 · 10 = 200 alla secondaria, in tutto 650. Insegnanti: 50. Rapporto: 650 ÷ 50 = 13.`,
  trap: `12,5 è la media semplice di 15 e 10, che ignora i pesi diversi (30 e 20 insegnanti); 25 somma i due rapporti; 12 è un valore «a occhio» tra 10 e 15.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-spam', diff: 'difficile', lang: 'it',
  stem: `Il 60% delle e-mail ricevute da un'azienda è spam. Il filtro blocca l'80% dello spam e, per errore, anche il 10% delle e-mail non spam; le altre e-mail arrivano nella casella principale. Una e-mail arriva nella casella principale: qual è la probabilità che sia spam?`,
  ...put('q-spam', '25%', ['12%', '20%', '33%']),
  sol: `Su 100 e-mail: 60 sono spam, di cui il 20% non è bloccato = 12; 40 non sono spam, di cui il 90% non è bloccato = 36. Nella casella principale ci sono 12 + 36 = 48 e-mail e 12 sono spam: 12 ÷ 48 = 25%.`,
  trap: `12% è la quota di spam arrivato su tutte le 100 e-mail, non su quelle arrivate; 20% è la quota di spam non bloccato; 33% = 12 ÷ 36 confronta lo spam con le sole e-mail legittime.`,
  patt: 'Probabilità condizionata' },

{ k: 'q-nondet', diff: 'media', lang: 'it',
  stem: `In un'azienda il 40% dei dipendenti ha più di 40 anni e il 30% lavora nella sede centrale. Quale percentuale dei dipendenti con più di 40 anni lavora nella sede centrale?`,
  ...put('q-nondet', 'Non è determinabile con i dati forniti', ['75%', '12%', '30%']),
  sol: `Mancano dati su quanto si sovrappongono i due gruppi: se tutti i dipendenti della sede centrale avessero più di 40 anni, la risposta sarebbe 30 ÷ 40 = 75%; se nessuno li avesse, sarebbe 0%. Con i dati forniti non è determinabile.`,
  trap: `12% = 40% · 30% presuppone che le due caratteristiche siano indipendenti (e comunque sarebbe il 12% di tutti i dipendenti, non dei più di 40 anni); 30% e 75% sono casi particolari.`,
  patt: 'Sufficienza dei dati' },

{ k: 'q-hotel', diff: 'media', lang: 'it',
  stem: `Il prezzo di una camera viene aumentato del 50% in alta stagione, poi ridotto del 20% con una promozione e infine aumentato del 25% per una tassa di soggiorno. Il prezzo finale è 180 €. Qual era il prezzo iniziale?`,
  ...put('q-hotel', '120 €', ['circa 116 €', '144 €', '135 €']),
  sol: `I fattori si moltiplicano: 1,5 · 0,8 · 1,25 = 1,5. Il prezzo iniziale è 180 ÷ 1,5 = 120 €.`,
  trap: `Circa 116 € divide per 1,55 sommando le variazioni (+50% − 20% + 25% = +55%); 144 € = 180 ÷ 1,25 considera solo l'ultimo aumento; 135 € = 180 · 0,75 «toglie» il 25% finale.`,
  patt: 'Percentuali composte' },

{ k: 'q-lucchetto', diff: 'media', lang: 'it',
  stem: `Un lucchetto ha tre rotelle, ciascuna con le cifre da 0 a 9. Quante combinazioni contengono almeno due cifre uguali?`,
  ...put('q-lucchetto', '280', ['720', '270', '300']),
  sol: `Le combinazioni totali sono 10 · 10 · 10 = 1.000. Quelle con le tre cifre tutte diverse sono 10 · 9 · 8 = 720. Con almeno due cifre uguali: 1.000 − 720 = 280.`,
  trap: `720 è la risposta alla domanda opposta (tutte diverse); 270 = 3 · 10 · 9 conta solo le combinazioni con esattamente due cifre uguali e dimentica le 10 con tutte e tre uguali; 300 è un valore «tondo» senza calcolo.`,
  patt: 'Combinatoria: complementare' }
];

/* V — 16 domande, nell'ordine in cui compaiono nelle posizioni V del LAYOUT */
const V = [

{ k: 'v-museo', diff: 'media', lang: 'it',
  claim: `Un ragazzo di 16 anni, senza tessera, paga 9 euro per entrare un giovedì.`,
  passage: `Il Museo della Seta di Como è aperto dal martedì alla domenica, dalle 10 alle 18. L'ingresso costa 9 euro; i minori di 14 anni entrano gratis, mentre per i ragazzi dai 14 ai 25 anni il biglietto costa 5 euro. La prima domenica di ogni mese l'ingresso è gratuito per tutti. Chi possiede la tessera annuale, che costa 30 euro, può entrare quante volte vuole. Le visite guidate si prenotano a parte e hanno un costo di 4 euro a persona. Nel 2025 il museo ha accolto circa 48.000 visitatori.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «per i ragazzi dai 14 ai 25 anni il biglietto costa 5 euro». Un sedicenne rientra in questa fascia e paga 5 euro, non 9. Il giovedì è un giorno di apertura e non ci sono gratuità: l'affermazione è contraddetta.`,
  trap: `Rispondere «vera» fermandosi alla prima frase sul prezzo (9 euro), senza leggere le fasce di età: il prezzo pieno vale per gli adulti. Non è «non ricavabile»: la fascia 14–25 anni è esplicita.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-occupazione', diff: 'difficile', lang: 'it',
  passage: `In una città di 200.000 abitanti il 60% ha un'età compresa tra 15 e 64 anni. Tra queste persone 90.000 sono occupate e 12.000 cercano attivamente un lavoro; le altre non lavorano e non cercano lavoro. Gli occupati a tempo pieno sono i due terzi degli occupati. Il tasso di occupazione è la quota degli occupati sulla popolazione di 15–64 anni; il tasso di disoccupazione è la quota dei disoccupati (chi cerca lavoro) sulle forze di lavoro, cioè su occupati e disoccupati insieme.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put('v-occupazione', `Il tasso di disoccupazione è pari al 10%.`,
    [`Il tasso di occupazione è del 75%.`,
     `Le persone di 15–64 anni che non lavorano e non cercano lavoro sono 18.000.`,
     `Gli occupati a tempo pieno sono 60.000.`]),
  sol: `Popolazione 15–64: 60% di 200.000 = 120.000. Occupazione: 90.000 ÷ 120.000 = 75% (corretta). Non lavorano e non cercano: 120.000 − 90.000 − 12.000 = 18.000 (corretta). Tempo pieno: 2/3 di 90.000 = 60.000 (corretta). Disoccupazione, secondo la definizione del brano: 12.000 ÷ (90.000 + 12.000) ≈ 11,8%, non 10%: è l'affermazione sbagliata.`,
  trap: `Dividere i disoccupati per la popolazione di 15–64 anni (12.000 ÷ 120.000 = 10%) invece che per le forze di lavoro: il brano definisce la base («occupati e disoccupati insieme»). Nelle domande «NON è corretta» va cercata l'unica frase sbagliata.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-abbonamenti', diff: 'media', lang: 'it',
  passage: `Secondo un'indagine sui trasporti regionali, nel primo semestre del 2025 gli abbonamenti ferroviari mensili venduti sono aumentati dell'8% rispetto al primo semestre del 2024. Nel solo secondo trimestre, però, le vendite sono diminuite del 2% rispetto al primo trimestre del 2025. I gestori attribuiscono il calo alle giornate di sciopero di maggio e dichiarano che per l'intero 2025 prevedono un aumento di almeno il 5% rispetto al 2024. L'indagine ricorda che gli abbonamenti annuali non sono compresi nei dati. Le vendite sono rilevate presso le biglietterie e i distributori automatici di tutte le stazioni della regione.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-abbonamenti', `Nel secondo trimestre del 2025 sono stati venduti meno abbonamenti mensili che nel primo trimestre del 2025.`,
    [`Nel secondo trimestre del 2025 sono stati venduti meno abbonamenti mensili che nel secondo trimestre del 2024.`,
     `Nel 2025 gli abbonamenti mensili venduti aumenteranno di almeno il 5% rispetto al 2024.`,
     `Gli scioperi di maggio hanno provocato il calo delle vendite del secondo trimestre.`]),
  sol: `Frase chiave: «nel solo secondo trimestre, però, le vendite sono diminuite del 2% rispetto al primo trimestre del 2025». Il confronto è tra due trimestri dello stesso anno: corretta. Le altre: il confronto con il secondo trimestre del 2024 non è dato (il +8% riguarda il semestre); l'aumento del 5% è una previsione dei gestori; il nesso con gli scioperi è «attribuito» dai gestori, non accertato.`,
  trap: `Periodo spostato: il calo è rispetto al trimestre precedente, non allo stesso trimestre dell'anno prima. Una previsione («prevedono») e un'attribuzione («attribuiscono») non sono fatti accertati.`,
  patt: 'Periodo o ambito spostato' },

{ k: 'v-ciclabile', diff: 'media', lang: 'it',
  claim: `L'aumento delle biciclette contate alle porte di Rivabella è stato causato dall'apertura della pista ciclabile lungo il fiume.`,
  passage: `Dopo l'apertura della pista ciclabile lungo il fiume, a Rivabella il numero di biciclette contate ogni mattina alle porte della città è aumentato del 30%. Nello stesso periodo il traffico automobilistico in ingresso è rimasto invariato, mentre il numero di residenti è cresciuto dell'1%. Il Comune ha dichiarato che continuerà a raccogliere i dati per altri due anni prima di decidere nuovi investimenti sulla mobilità ciclistica e che al momento non intende trarre conclusioni. Le biciclette sono contate da un sensore posto all'ingresso del ponte principale, tra le 7 e le 9 di ogni mattina.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «Dopo l'apertura della pista … è aumentato del 30%». Il brano riporta una successione nel tempo, non un nesso di causa; il Comune stesso dichiara di «non intendere trarre conclusioni»: l'affermazione non è né confermata né smentita.`,
  trap: `Prendere «dopo» per «a causa di». Non è nemmeno «falsa»: nulla nel brano nega che la pista abbia avuto effetto.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-bus', diff: 'media', lang: 'it',
  passage: `Dopo che il comune di Tavolara ha reso gratuiti gli autobus urbani per gli studenti, il numero di iscritti alle scuole superiori cittadine è cresciuto del 6% in un anno. L'assessore all'istruzione ne conclude che la gratuità del trasporto ha convinto più famiglie a iscrivere i figli a Tavolara e propone di estendere il servizio anche agli studenti dei comuni vicini. Il costo annuo della misura è stato di 400.000 euro, coperto da un fondo regionale. Gli autobus per gli studenti circolano dal lunedì al sabato, dalle 6:30 alle 15.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione dell'assessore?`,
  ...put('v-bus', `Nello stesso anno uno stabilimento industriale ha aperto a Tavolara e circa 500 famiglie con figli in età scolare si sono trasferite in città.`,
    [`Molti studenti intervistati dichiarano di usare volentieri gli autobus gratuiti.`,
     `Il fondo regionale che copre il costo della misura terminerà tra tre anni.`,
     `Nei comuni vicini gli autobus per gli studenti sono già in parte gratuiti.`]),
  sol: `La conclusione è causale: la gratuità avrebbe convinto più famiglie. Se nello stesso anno 500 famiglie con figli in età scolare si sono trasferite a Tavolara, l'aumento degli iscritti ha una causa alternativa. L'opinione degli studenti rafforza; fondi e comuni vicini non toccano il nesso.`,
  trap: `Il fondo che termina riguarda la sostenibilità della proposta, non il nesso tra gratuità e iscrizioni. Le altre due opzioni sono dati sulla proposta di estensione o rafforzano la tesi: l'aggettivo «indebolisce» va letto due volte.`,
  patt: 'Cause alternative' },

{ k: 'v-ateneo', diff: 'media', lang: 'it',
  passage: `Tra il 2020 e il 2025 gli iscritti a un ateneo sono passati da 20.000 a 22.000. Nello stesso periodo la quota di studentesse sugli iscritti è salita dal 55% al 60%. L'ateneo attribuisce il cambiamento all'apertura di due nuovi corsi di laurea, ma riconosce che non esistono dati per verificarlo. Il rettore ha dichiarato che nei prossimi anni l'obiettivo è arrivare a 25.000 iscritti, mantenendo la stessa quota di studentesse. I dati si riferiscono a tutti i corsi di laurea, triennali e magistrali, e a tutti gli studenti iscritti al primo anno e agli anni successivi.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  ...put('v-ateneo', `Il numero degli studenti maschi è diminuito tra il 2020 e il 2025.`,
    [`Il numero delle studentesse è aumentato del 5%.`,
     `Il numero delle studentesse è aumentato di 1.100 unità.`,
     `L'apertura dei nuovi corsi ha fatto crescere la quota di studentesse.`]),
  sol: `Studentesse: 55% di 20.000 = 11.000 nel 2020 e 60% di 22.000 = 13.200 nel 2025 (+2.200, cioè +20%). Studenti maschi: 9.000 nel 2020 e 8.800 nel 2025: diminuiti (corretta). Il +5 è in punti percentuali; 1.100 applica i 5 punti al totale; il nesso con i nuovi corsi, per il brano, non è verificabile.`,
  trap: `Leggere «dal 55% al 60%» come +5% del numero di studentesse: sono 5 punti percentuali di una quota, mentre il totale cresce del 10%. Il nesso causale con i nuovi corsi è solo un'ipotesi dell'ateneo.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-bando', diff: 'media', lang: 'it',
  claim: `Per un progetto con 40.000 euro di costi ammessi, il contributo della Fondazione Ardenza non può superare i 20.000 euro.`,
  passage: `Per partecipare al bando della Fondazione Ardenza, un'associazione deve avere sede legale in regione e almeno tre anni di attività documentata. Sono esclusi i progetti già finanziati da altri enti pubblici. Il contributo copre fino al 70% dei costi ammessi, con un massimo di 20.000 euro per progetto. Le domande si presentano entro il 30 settembre e l'esito viene comunicato entro i due mesi successivi. Nell'ultima edizione sono stati finanziati 34 progetti su 120 presentati. Le associazioni selezionate devono rendicontare le spese entro dodici mesi dall'erogazione del contributo.`,
  opts: VFN, ans: 2,
  sol: `Frase chiave: «Il contributo copre fino al 70% dei costi ammessi, con un massimo di 20.000 euro per progetto». Su 40.000 euro il 70% sarebbe 28.000, ma il tetto è 20.000: il contributo non supera 20.000 euro. L'esempio rientra nella regola generale.`,
  trap: `Rispondere «non ricavabile» perché il brano non cita il caso dei 40.000 euro, o «falsa» calcolando solo il 70% (28.000) e dimenticando il tetto per progetto.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-necessario', diff: 'difficile', lang: 'it',
  passage: `L'agenzia di consulenza Delta assiste ogni anno decine di imprese del territorio nei rapporti con le banche e ha raccolto i dati di dieci anni di richieste di finanziamento: nessuna impresa che avesse chiuso in perdita almeno uno degli ultimi due esercizi ha ottenuto un finanziamento. L'agenzia sostiene che un'impresa può ottenere un finanziamento bancario solo se chiude in utile da almeno due anni consecutivi. L'impresa Zefiro, che ha presentato richiesta di finanziamento a una banca della regione, chiude in utile da tre anni consecutivi, e la consulente dell'agenzia conclude che Zefiro otterrà sicuramente il finanziamento richiesto.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione della consulente?`,
  ...put('v-necessario', `Le banche della regione concedono il finanziamento a ogni impresa che chiude in utile da almeno due anni consecutivi.`,
    [`Chiudere in utile da almeno due anni consecutivi è una condizione indispensabile per ottenere un finanziamento dalle banche della regione.`,
     `Il finanziamento richiesto da Zefiro è inferiore alla media dei finanziamenti richiesti dalle altre imprese.`,
     `Zefiro opera nel settore manifatturiero, come la maggior parte dei clienti dell'agenzia.`]),
  sol: `L'affermazione dell'agenzia è una condizione necessaria («solo se»). La conclusione richiede invece una condizione sufficiente: se la banca concede il finanziamento a ogni impresa con almeno due anni di utile, Zefiro (tre anni) lo otterrà. È l'informazione che chiude il passaggio.`,
  trap: `La seconda opzione sembra la più vicina, ma ripete la condizione necessaria già data: dire che serve non significa che basti. Dimensione della richiesta e settore non toccano il nesso.`,
  patt: 'Necessario vs sufficiente' },

{ k: 'v-anziani', diff: 'media', lang: 'it',
  passage: `Nel 2025 la Regione ha speso 180 milioni di euro per l'assistenza agli anziani, pari al 9% della spesa sanitaria regionale. La spesa sanitaria rappresenta il 50% della spesa complessiva della Regione. Rispetto al 2024 la spesa per gli anziani è aumentata del 5%, mentre la spesa sanitaria è rimasta invariata. L'assessore ha annunciato che nel 2026 la spesa per gli anziani crescerà di altri 10 milioni di euro. I dati sono tratti dal bilancio consuntivo approvato dal consiglio regionale e si riferiscono all'anno solare.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put('v-anziani', `Nel 2025 la spesa complessiva della Regione è stata di 4 miliardi di euro.`,
    [`Nel 2025 la spesa per gli anziani è stata il 9% della spesa complessiva della Regione.`,
     `Nel 2024 la Regione ha speso 175 milioni di euro per l'assistenza agli anziani.`,
     `Nel 2024 la spesa per gli anziani era l'8% della spesa sanitaria regionale.`]),
  sol: `Spesa sanitaria: 180 ÷ 0,09 = 2.000 milioni. Spesa complessiva: 2.000 ÷ 0,5 = 4.000 milioni, cioè 4 miliardi (corretta). Gli anziani sono il 4,5% della spesa complessiva (non il 9%). Nel 2024: 180 ÷ 1,05 ≈ 171,4 milioni (non 175), pari a circa l'8,6% della spesa sanitaria (non l'8%).`,
  trap: `Ambito spostato: il 9% è la quota sulla spesa sanitaria, non su quella complessiva. Il 5% di aumento va tolto dividendo per 1,05 (non sottraendo il 5% di 180 = 9 milioni).`,
  patt: 'Periodo o ambito spostato' },

{ k: 'v-tomo', diff: 'media', lang: 'it',
  claim: `Nel 2025 i ricavi della catena Tomo dai libri venduti online sono stati superiori a 8 milioni di euro.`,
  passage: `Nel 2025 la catena di librerie Tomo ha venduto 2,4 milioni di libri, di cui un quarto online. Il prezzo medio di vendita è stato di 15 euro per i libri venduti in negozio e di 12 euro per quelli venduti online. Per il 2026 l'azienda prevede di aprire dodici nuovi negozi, portando il totale a sessanta, e di aumentare le vendite online del 10%. Il presidente ha dichiarato che il prezzo medio online resterà invariato. Le librerie Tomo sono presenti in nove regioni italiane.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «2,4 milioni di libri, di cui un quarto online» e «12 euro per quelli venduti online». Libri online: 2,4 ÷ 4 = 0,6 milioni; ricavi online: 0,6 · 12 = 7,2 milioni di euro, meno di 8: l'affermazione è contraddetta.`,
  trap: `Usare il prezzo dei libri in negozio (0,6 · 15 = 9 milioni) o applicare il prezzo a tutti i libri. Non è «non ricavabile»: tutti i dati necessari ci sono.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-agile', diff: 'media', lang: 'it',
  passage: `Uno studio ha confrontato il fatturato di 400 aziende italiane negli ultimi cinque anni. Le aziende che hanno introdotto per prime il lavoro agile hanno registrato una crescita del fatturato superiore di 8 punti percentuali a quella delle aziende che non lo hanno mai adottato. L'autore dello studio ne conclude che il lavoro agile fa crescere il fatturato e invita le imprese a introdurlo. Le aziende del campione sono state scelte a caso tra quelle con più di 50 dipendenti. Lo studio è stato finanziato da un'università.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione dell'autore?`,
  ...put('v-agile', `Le imprese già in forte crescita avevano più risorse per investire nelle tecnologie necessarie e sono state le prime a introdurre il lavoro agile.`,
    [`Molti lavoratori in lavoro agile dichiarano di sentirsi più soddisfatti.`,
     `Il lavoro agile riduce i costi di gestione degli uffici.`,
     `Nell'ultimo anno quasi tutte le grandi imprese italiane hanno adottato forme di lavoro agile.`]),
  sol: `La conclusione è causale: il lavoro agile farebbe crescere il fatturato. Se le imprese già in crescita erano anche le prime a introdurlo, il nesso può essere rovesciato (crescita → lavoro agile): la correlazione non prova la causa.`,
  trap: `Soddisfazione dei lavoratori e risparmio sui costi rafforzano o non toccano il nesso; la diffusione recente del lavoro agile non dice chi cresce di più. Con una correlazione, la domanda da porsi è «e se fosse il contrario?».`,
  patt: 'Cause alternative' },

{ k: 'v-furti', diff: 'media', lang: 'it',
  passage: `Il comune di Selva afferma di essere diventato più sicuro: i furti denunciati sono scesi da 120 nel 2024 a 90 nel 2025. Il sindaco attribuisce il risultato al nuovo servizio di vigilanza notturna, introdotto nel gennaio 2025, e ne chiede il finanziamento anche per il 2026. I dati sono forniti dalla polizia municipale e riguardano tutto il territorio comunale. Il consiglio comunale discuterà la proposta a marzo. La vigilanza notturna è svolta da due pattuglie che coprono il centro storico e le frazioni. Le denunce sono registrate presso il comando di polizia municipale.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione secondo cui il comune è diventato più sicuro?`,
  ...put('v-furti', `La variazione del numero di abitanti del comune tra il 2024 e il 2025.`,
    [`Il costo annuo del servizio di vigilanza notturna.`,
     `Il numero di agenti della polizia municipale impiegati nella vigilanza.`,
     `Il mese dell'anno in cui sono stati registrati più furti.`]),
  sol: `«Più sicuro» significa meno furti in rapporto alla popolazione. Se gli abitanti fossero diminuiti del 25% (per esempio da 20.000 a 15.000), i furti ogni 1.000 abitanti sarebbero 6 sia nel 2024 sia nel 2025: nessun miglioramento. La popolazione è il dato che cambia il giudizio.`,
  trap: `Costo, numero di agenti e mese dei furti riguardano le cause o la proposta, non la misura della sicurezza: i valori assoluti (120 e 90) non bastano senza la base di confronto.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'v-ricarico', diff: 'media', lang: 'it',
  passage: `In un negozio di abbigliamento si distingue il ricarico dal margine. Il ricarico è la differenza tra il prezzo di vendita e il costo d'acquisto, espressa in percentuale del costo; il margine è la stessa differenza espressa in percentuale del prezzo di vendita. Un cappotto acquistato a 80 euro viene venduto a 100 euro. Per i saldi il negozio ha deciso di non scendere mai sotto un margine del 10% su nessun capo, e di rinnovare l'assortimento ogni stagione. I prezzi indicati sono comprensivi di IVA.`,
  stem: `In base al brano, quale delle seguenti affermazioni è corretta?`,
  ...put('v-ricarico', `Sul cappotto il ricarico è del 25% e il margine è del 20%.`,
    [`Sul cappotto il ricarico è del 20% e il margine è del 25%.`,
     `Sul cappotto ricarico e margine sono entrambi del 20%.`,
     `Sul cappotto ricarico e margine sono entrambi del 25%.`]),
  sol: `Differenza: 100 − 80 = 20 euro. Ricarico: 20 ÷ 80 (costo) = 25%. Margine: 20 ÷ 100 (prezzo di vendita) = 20%.`,
  trap: `Scambiare le due basi: il ricarico si calcola sul costo (la base più piccola, quindi la percentuale più alta), il margine sul prezzo di vendita (la base più grande, percentuale più bassa).`,
  patt: 'Termine economico frainteso' },

{ k: 'v-trasferta', diff: 'difficile', lang: 'it',
  passage: `L'azienda rimborsa le spese di trasferta alle condizioni seguenti. Il pasto è rimborsato fino a 25 euro, ma solo se la trasferta dura più di 8 ore. Se la trasferta dura meno di 12 ore, si rimborsa al massimo un pasto per giornata. Il pernottamento è rimborsato fino a 120 euro a notte, con limite raddoppiato per i dirigenti; il raddoppio non riguarda i pasti. Le ricevute vanno consegnate entro 10 giorni dal rientro. Le spese non documentate non vengono mai rimborsate e le richieste si presentano tramite il portale aziendale.`,
  stem: `Marta, dirigente, fa una trasferta di 10 ore senza pernottare, spende 40 euro per il pranzo e 22 euro per la cena e consegna le ricevute dopo tre giorni. Quanto le viene rimborsato?`,
  ...put('v-trasferta', `25 euro`, [`47 euro`, `50 euro`, `62 euro`]),
  sol: `La trasferta dura più di 8 ore (pasti rimborsabili) ma meno di 12, quindi si rimborsa un solo pasto. Il pranzo costa 40 euro, ma il tetto è 25. Il raddoppio dei limiti per i dirigenti riguarda solo il pernottamento, che qui non c'è. Rimborso: 25 euro.`,
  trap: `47 euro rimborsa due pasti (25 + 22), dimenticando il limite di un pasto sotto le 12 ore; 50 euro raddoppia il tetto del pasto; 62 euro rimborsa tutto.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-sondaggio-bici', diff: 'media', lang: 'it',
  claim: `Chi presenta la domanda di contributo il 10 marzo riceverà sicuramente il contributo.`,
  passage: `Il Comune di Valdoro ha approvato un contributo per l'acquisto di biciclette elettriche: chi presenta domanda entro il 15 marzo riceve il 25% del prezzo, fino a un massimo di 300 euro. Le domande vengono evase in ordine di arrivo finché i fondi, pari a 90.000 euro, non sono esauriti. L'assessore ha ricordato che l'iniziativa è rivolta ai residenti maggiorenni e che le biciclette devono essere nuove. Le domande si presentano soltanto online, sul sito del Comune, e ogni residente può presentarne una sola. Il contributo viene versato entro trenta giorni dall'accettazione.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «Le domande vengono evase in ordine di arrivo finché i fondi, pari a 90.000 euro, non sono esauriti». Il 10 marzo è entro la scadenza del 15, ma il brano non dice se per quella data i fondi saranno finiti: «sicuramente» non è ricavabile.`,
  trap: `Rispondere «vera» perché la domanda è nei termini: la scadenza è una condizione necessaria, non sufficiente. Non è «falsa»: il brano non dice che i fondi si esauriranno prima del 10 marzo.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-frane', diff: 'media', lang: 'it',
  passage: `In una valle appenninica, nell'ultimo decennio l'80% delle frane si è verificato in terreni dove nei vent'anni precedenti erano stati abbattuti dei boschi. L'ente per la tutela del territorio ne conclude che l'abbattimento dei boschi è la causa principale delle frane e chiede di vietarlo in tutta la valle. Nello stesso periodo il numero totale di frane nella valle è stato di 150. Il rapporto dell'ente si basa sui sopralluoghi effettuati dai propri tecnici in tutti i punti in cui si sono verificate frane. La valle si estende per circa 300 chilometri quadrati.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione dell'ente?`,
  ...put('v-frane', `Nella valle l'80% dei terreni è stato interessato dall'abbattimento dei boschi negli ultimi vent'anni.`,
    [`Le frane dell'ultimo decennio hanno causato danni per circa 3 milioni di euro.`,
     `Il divieto di abbattere i boschi esiste già in altre valli appenniniche.`,
     `Nei terreni disboscati le frane sono state in media più estese che altrove.`]),
  sol: `Il dato (80% delle frane in terreni disboscati) prova poco se gran parte della valle è disboscata: con l'80% dei terreni disboscati, l'80% delle frane sarebbe quello atteso anche senza alcun effetto del disboscamento. La quota va confrontata con il peso dei terreni disboscati.`,
  trap: `L'opzione sulle frane più estese nei terreni disboscati rafforza la tesi; danni e divieti altrove non toccano il nesso. L'errore è trattare «80% delle frane» come un dato forte senza chiedersi quale sia la percentuale di terreni disboscati.`,
  patt: 'Rapporti vs valori assoluti' }
];

/* DI — 16 domande, nell'ordine in cui compaiono nelle posizioni D del LAYOUT */
const DI = [

{ k: 'd-libro', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Il prezzo di un libro è un numero intero di euro. Il libro costa più di 12 €?',
    'Con 50 € se ne possono comprare al massimo 4.',
    'Con 100 € se ne possono comprare almeno 7.'),
  ...dsq('CDAB', 'D'),
  sol: `(1): con 50 € se ne comprano al massimo 4, quindi 5 libri costerebbero più di 50 €: il prezzo p è maggiore di 10, cioè almeno 11 €. (2): con 100 € se ne comprano almeno 7, quindi 7p ≤ 100 e p ≤ 14. Da sole, ciascuna lascia sia prezzi sopra 12 sia prezzi non sopra 12. Insieme: p può essere 11, 12, 13 o 14; con 11 o 12 la risposta è «no», con 13 o 14 è «sì». Servono altri dati.`,
  trap: `Fermarsi all'intervallo 11–14 e scegliere il valore «centrale» (12) oppure concludere che due vincoli sul prezzo bastino sempre: qui l'intervallo contiene valori da una parte e dall'altra della soglia 12.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-editoria', diff: 'media', lang: 'it', asset: gEditoria(),
  stem: `Di quanto varierà, in percentuale, il fatturato totale del gruppo l'anno prossimo?`,
  ...put('d-editoria', '+5%', ['+30%', '+15%', '+7,5%']),
  sol: `Ricavi attuali: libri 54, riviste 30, digitale 24, altro 12 (milioni; totale 120). L'anno prossimo: libri 54, riviste 30 · 0,8 = 24, digitale 24 · 1,5 = 36, altro 12: totale 126. Variazione: 126 ÷ 120 = +5%.`,
  trap: `+30% somma i due cambiamenti (+50% e −20%) come se avessero lo stesso peso; +15% e +7,5% sono medie semplici (di due e di quattro variazioni): le variazioni pesano in proporzione ai ricavi di ogni area.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-cooperativa', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Una cooperativa ha 60 soci.`,
    `Il rapporto tra soci uomini e soci donne è 7 : 5.`,
    `I soci con più di 50 anni sono il 40% dei soci.`
  ], [
    `A. Le donne socie sono 25.`,
    `B. Gli uomini con più di 50 anni sono almeno 4.`,
    `C. I soci con più di 50 anni sono meno delle donne socie.`,
    `D. Gli uomini sono il 60% dei soci.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la A', 'Solo la C', 'Sia la A sia la C', 'Sia la B sia la D'], ans: 2,
  sol: `Con 60 soci e rapporto 7 : 5 gli uomini sono 35 e le donne 25 (A vera). I soci con più di 50 anni sono il 40% di 60, cioè 24: meno delle donne, 25 (C vera). B non è sicura: tutti i 24 potrebbero essere donne, e allora gli uomini con più di 50 anni sarebbero 0. D è falsa: 35 ÷ 60 ≈ 58,3%, non il 60%.`,
  trap: `La D è costruita vicina al valore vero (58,3% contro 60%); la C richiede di confrontare 24 e 25, due numeri ricavati da percentuali e rapporti diversi. Per la B bisogna immaginare la distribuzione più sfavorevole.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-penna', diff: 'media', lang: 'it', ds: true,
  stem: ds('Quanto costa una penna?',
    'Tre penne e due quaderni costano in tutto 14 €.',
    'Un quaderno costa il doppio di una penna.'),
  ...dsq('BDCA', 'B'),
  sol: `(1) da sola: 3p + 2q = 14 ha più soluzioni (p = 2 e q = 4, ma anche p = 4 e q = 1). (2) da sola: q = 2p non fissa nessun prezzo assoluto. Insieme: 3p + 2 · (2p) = 7p = 14, quindi p = 2 €.`,
  trap: `Credere che la (2) basti perché dà un rapporto: un rapporto senza un valore assoluto non fissa il prezzo. Credere che basti la (1) perché contiene un totale: ha due incognite.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-ammissioni', diff: 'media', lang: 'it', asset: tAmmissioni(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Sul totale delle tre sedi la percentuale di ammessi è il 50%.`,
         `Gli ammessi della sede B sono più di quelli della sede A.`,
         `Nelle sedi A e C insieme sono stati ammessi 300 candidati.`,
         `Nessuna delle altre risposte è corretta.`], ans: 2,
  sol: `Ammessi: sede A 40% di 500 = 200; sede B 60% di 300 = 180; sede C 50% di 200 = 100; in tutto 480 su 1.000 candidati = 48%, non 50% (falsa la prima). B ha 180 ammessi, meno dei 200 di A (falsa la seconda). A e C insieme: 200 + 100 = 300 (vera).`,
  trap: `Il 50% è la media semplice delle tre percentuali (40, 60, 50): non tiene conto dei pesi diversi (500, 300, 200 candidati). Confrontare le percentuali (60% contro 40%) invece dei numeri porta alla seconda opzione.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-corsi-logica', diff: 'difficile', lang: 'it', dp: true,
  asset: dp([
    `Tutti i corsi di laurea magistrale del dipartimento prevedono un tirocinio.`,
    `Alcuni corsi di laurea magistrale del dipartimento sono impartiti in inglese.`,
    `Nessun corso impartito in inglese è a numero chiuso.`
  ], [
    `A. Alcuni corsi a numero chiuso del dipartimento prevedono il tirocinio.`,
    `B. Alcuni corsi del dipartimento non sono a numero chiuso.`,
    `C. Alcuni corsi del dipartimento impartiti in inglese non prevedono il tirocinio.`,
    `D. Alcuni corsi del dipartimento impartiti in inglese sono a numero chiuso.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la A', 'Solo la D', 'Sia la B sia la C', 'Sia la C sia la D'], ans: 3,
  sol: `Dai dati: ogni corso del dipartimento ha il tirocinio; esiste almeno un corso in inglese e nessun corso in inglese è a numero chiuso. C («alcuni corsi in inglese non prevedono il tirocinio») contraddice il primo dato: sicuramente falsa. D («alcuni corsi in inglese sono a numero chiuso») contraddice il terzo: sicuramente falsa. B è vera (il corso in inglese non è a numero chiuso). A non è sicura: i dati non dicono se esistano corsi a numero chiuso.`,
  trap: `Con la consegna «false» si può indicare la B, che è vera. La A sembra una conseguenza del primo dato, ma il primo dato non garantisce che esista un corso a numero chiuso: è possibile, non sicura.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-ab', diff: 'media', lang: 'it', ds: true,
  stem: ds('Siano a e b due numeri interi positivi con a + b = 20. È vero che a · b è maggiore di 90?',
    'La differenza tra a e b, in valore assoluto, è al più 4.',
    'Il numero a è un multiplo di 5.'),
  ...dsq('CABD', 'A'),
  sol: `Con a + b = 20 il prodotto è tanto più grande quanto più a e b sono vicini. (1): le coppie con |a − b| ≤ 4 sono (8, 12), (9, 11), (10, 10) e le simmetriche: i prodotti sono 96, 99, 100, tutti maggiori di 90, quindi la risposta è sempre «sì» e la (1) basta. (2): a = 5 dà 5 · 15 = 75 (no), a = 10 dà 100 (sì): la (2) non basta.`,
  trap: `Cercare i valori esatti di a e b: per una domanda sì/no basta un limite. La (2) elenca valori precisi, ma non decide la risposta.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-assistenza', diff: 'media', lang: 'it', asset: gAssistenza(),
  stem: `Quale percentuale delle richieste della settimana è urgente?`,
  ...put('d-assistenza', '14%', ['25%', '35%', '20%']),
  sol: `Richieste urgenti: 30% di 50 (lunedì) = 15 e 20% di 100 (venerdì) = 20, in tutto 35. Richieste totali: 50 + 30 + 40 + 30 + 100 = 250. Quota di urgenti: 35 ÷ 250 = 14%.`,
  trap: `25% è la media semplice di 30% e 20%, che ignora i pesi diversi (50 e 100 richieste); 35 è il numero di richieste urgenti, non una percentuale; 20% è la sola quota del venerdì.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-variazioni', diff: 'difficile', lang: 'it', asset: gVariazioni(),
  stem: `Il grafico mostra la variazione percentuale mensile delle vendite rispetto al mese precedente. A dicembre le vendite erano di 500 unità. Quante unità sono state vendute ad aprile?`,
  ...put('d-variazioni', '540', ['575', '675', '600']),
  sol: `Si applicano i fattori mese per mese: gennaio 500 · 1,2 = 600; febbraio 600 · 0,9 = 540; marzo 540 · 1,25 = 675; aprile 675 · 0,8 = 540.`,
  trap: `575 somma le variazioni (+20 − 10 + 25 − 20 = +15%) e applica il totale a 500; 675 è il valore di marzo (ci si ferma un mese prima); 600 è il valore di gennaio. Ogni percentuale ha come base il mese precedente, non dicembre.`,
  patt: 'Percentuali composte' },

{ k: 'd-francese', diff: 'media', lang: 'it', ds: true,
  stem: ds('In una scuola di 200 studenti, quante ragazze studiano francese?',
    'Studiano francese 80 studenti, di cui 20 sono ragazzi.',
    'Le ragazze sono 120 e metà di loro studia francese.'),
  ...dsq('ADBC', 'C'),
  sol: `(1): le ragazze che studiano francese sono 80 − 20 = 60, quindi la (1) basta. (2): metà di 120 ragazze sono 60, quindi anche la (2) basta. Ciascuna affermazione, da sola, dà la risposta (60) e le due sono coerenti.`,
  trap: `Cercare una tabella 2 × 2 completa: la domanda chiede solo una cella, e ciascuna affermazione la fornisce direttamente (per differenza o con una metà). Il totale di 200 studenti è superfluo.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-regioni', diff: 'media', lang: 'it', asset: tRegioni(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`La regione più popolosa è anche quella con la densità (abitanti per km²) più alta.`,
         `La densità dell'insieme delle quattro regioni è di 300 abitanti per km².`,
         `Gamma ha una densità più che doppia rispetto a Beta.`,
         `Nessuna delle altre risposte è corretta.`], ans: 3,
  sol: `Densità (abitanti per km²): Alfa 600.000 ÷ 2.000 = 300; Beta 1.000.000 ÷ 5.000 = 200; Gamma 400.000 ÷ 1.000 = 400; Delta 1.200.000 ÷ 4.000 = 300. Delta è la più popolosa ma la più densa è Gamma (falsa la prima). Insieme: 3.200.000 ÷ 12.000 ≈ 267, non 300 (falsa la seconda). Gamma ha una densità doppia di Beta (400 = 2 · 200), non più che doppia (falsa la terza). Quindi nessuna delle altre è corretta.`,
  trap: `Confondere gli abitanti con la densità; usare la media semplice delle densità ((300 + 200 + 400 + 300) ÷ 4 = 300) invece di dividere il totale degli abitanti per la superficie totale; «più che doppia» al posto di «doppia».`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-stipendi', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Un'azienda ha due sedi, Nord e Sud.`,
    `La sede Nord ha il doppio dei dipendenti della sede Sud.`,
    `Lo stipendio medio è di 2.000 € al Nord e di 1.500 € al Sud.`
  ], [
    `A. Lo stipendio medio complessivo dell'azienda è di 1.750 €.`,
    `B. Lo stipendio medio complessivo dell'azienda è maggiore di 1.750 €.`,
    `C. La massa salariale del Nord è più del doppio di quella del Sud.`,
    `D. Lo stipendio medio complessivo dell'azienda è inferiore a 1.800 €.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Sia la B sia la C', 'Solo la A', 'Sia la A sia la D', 'Solo la B'], ans: 0,
  sol: `Con k dipendenti al Sud e 2k al Nord, lo stipendio medio complessivo è (2k · 2.000 + k · 1.500) ÷ 3k = 5.500 ÷ 3 ≈ 1.833 €. A è falsa (1.750 è la media semplice di 2.000 e 1.500); B è vera (1.833 > 1.750); D è falsa (1.833 > 1.800). La massa salariale è 2k · 2.000 = 4.000k al Nord contro 1.500k al Sud: più del doppio (C vera).`,
  trap: `La media semplice (1.750 €) trascura che il Nord pesa il doppio. La D usa una soglia vicina al valore vero (1.833 contro 1.800). La C richiede di moltiplicare numero di dipendenti per stipendio medio.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-catena', diff: 'difficile', lang: 'it', asset: tCatena(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Tra il 2021 e il 2025 i ricavi totali della catena sono aumentati di più del 40%.`,
         `Dal 2021 al 2025 i ricavi online sono aumentati ogni anno della stessa quantità.`,
         `Nel 2023 i ricavi online sono stati inferiori al 40% di quelli dei negozi.`,
         `Nel 2025 i ricavi online hanno superato il 60% di quelli dei negozi.`], ans: 0,
  sol: `Il dato mancante si ricava dal totale: online 2023 = 90 − 64 = 26. Totali: 75 nel 2021 e 108 nel 2025; 108 ÷ 75 = 1,44, cioè +44% (vera). Online: 15, 20, 26, 34, 40, con aumenti 5, 6, 8, 6: non costanti (falsa). Nel 2023 il 40% di 64 è 25,6 e l'online è 26: non inferiore (falsa). Nel 2025 il 60% di 68 è 40,8 e l'online è 40: non superiore (falsa).`,
  trap: `Le soglie sono vicine ai valori reali (26 contro 25,6; 40 contro 40,8). «Ogni anno della stessa quantità» è smentito da un solo anno. Il 40% di 75 è 30 e 108 − 75 = 33 > 30: confronto rapido per la prima.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-quaderni', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un cliente spende esattamente 30 € in un negozio di cancelleria, dove una penna costa 2 € e un quaderno 5 €, e compra soltanto penne e quaderni. Quanti quaderni ha comprato?',
    'Ha comprato almeno 3 quaderni.',
    'Ha comprato almeno 5 penne.'),
  ...dsq('DCAB', 'B'),
  sol: `Con 2p + 5q = 30 il numero di quaderni è pari: (q, p) = (0, 15), (2, 10), (4, 5), (6, 0). (1): q ≥ 3 lascia (4, 5) e (6, 0): due casi. (2): p ≥ 5 lascia (0, 15), (2, 10), (4, 5): tre casi. Insieme: l'unico caso comune è (4, 5), cioè 4 quaderni.`,
  trap: `Fermarsi a una delle due affermazioni: ciascuna restringe l'elenco ma non lo riduce a un solo caso. Dimenticare che q deve essere pari porta a contare soluzioni inesistenti.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-museo-sale', diff: 'media', lang: 'it', dp: true,
  asset: dp([
    `Un museo ha quattro sale con superfici tutte diverse tra loro, espresse in metri quadrati interi.`,
    `La sala più piccola misura 30 m² e la più grande 80 m².`,
    `La superficie totale delle quattro sale è di 200 m².`
  ], [
    `A. Una delle sale misura 90 m².`,
    `B. Le due sale intermedie misurano in tutto 90 m².`,
    `C. Ciascuna delle due sale intermedie misura meno di 45 m².`,
    `D. Una delle sale misura 50 m².`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la A', 'Sia la A sia la C', 'Sia la B sia la D', 'Solo la C'], ans: 1,
  sol: `Le due sale intermedie misurano in tutto 200 − 30 − 80 = 90 m² (B vera). A è falsa: la sala più grande è 80 m². C è falsa: le due sale intermedie sono diverse e sommano 90, quindi una supera 45 (per esempio 44 e 46). D non è sicura: 40 e 50 sono possibili, ma anche 35 e 55.`,
  trap: `Con la consegna «false» si può indicare la B (vera). La C sembra plausibile perché 45 + 45 = 90, ma le superfici sono tutte diverse: se una è sotto 45, l'altra è sopra. La D è possibile, non sicuramente falsa.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-rettangolo', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Un rettangolo ha il perimetro di 30 cm. La sua area è maggiore di 50 cm²?',
    'Il lato più corto misura almeno 6 cm.',
    'Le misure dei lati, in cm, sono numeri interi.'),
  ...dsq('ABDC', 'A'),
  sol: `La somma dei due lati è 15 cm, e l'area a · b è tanto più grande quanto più i lati sono vicini. (1): se il lato più corto è almeno 6, l'altro è al più 9 e l'area è almeno 6 · 9 = 54: sempre maggiore di 50, quindi la (1) basta. (2): con lati interi le aree possibili sono 14, 26, 36, 44, 50, 54 e 56: con 5 e 10 l'area è esattamente 50 (non maggiore), con 6 e 9 è 54. La (2) non basta.`,
  trap: `Pensare che i lati interi permettano di calcolare l'area: ci sono più rettangoli, e il caso 5 × 10 = 50 non è «maggiore di 50». Per una domanda sì/no basta un limite.`,
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
  id: '21',
  title: 'Mock 21',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Tutto in italiano, livello del Mock 15, ma con calcoli e testi più corti (tempo stimato circa 85 minuti): media ponderata inversa, quote di mercato e percentuali composte, combinatoria con vincoli e complementare, probabilità condizionata, brani da 80–150 parole con modali. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false», sufficienza dei dati e tabelle con celle mancanti.',
  questions: QUESTIONS,
  data: DATA
};
});
