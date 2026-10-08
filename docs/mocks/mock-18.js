/* =======================================================================
   Mock 18 — 50 domande nuove (18 Q, 16 V, 16 DI), calibrate con
   guida-calibrazione-mock.md e sullo stesso livello del Mock 15:
   Quantitativa e Verbale più difficili del Mock 14 (più passaggi,
   brani da 100–200 parole con modali, opzioni sbagliate tutte
   plausibili), Data Insights come il Mock 14.

   Nelle domande di sufficienza dei dati i criteri sono fissi:
   A = una sola delle due affermazioni basta, B = servono entrambe,
   C = ciascuna basta da sola, D = servono altri dati; nella lista
   compaiono in ordine rimescolato (la lettera del criterio è scritta
   nel testo dell'opzione, la posizione A–D è quella del pulsante).

   Le domande sono scritte per area (Q, V, DI) e poi disposte in schermate
   da tre con ordine delle aree variabile (LAYOUT). Il campo `k` identifica
   la domanda per gli script di verifica (tools/check_math_18.py).
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
  /* n.8 — fatturato per area (%) e quota online di ciascuna area */
  aree: { nomi: ['Nord', 'Centro', 'Sud'], quote: [40, 35, 25], online: [20, 30, 10] },
  /* n.14 — dipendenti per reparto: numero, % donne, % part-time */
  reparti: { nomi: ['Vendite', 'Amministrazione', 'IT', 'Logistica'], n: [200, 120, 80, 100], donne: [40, 75, 25, 20], parttime: [25, 20, 5, 50] },
  /* n.24 — visitatori giornalieri di un parco acquatico e prezzi del biglietto */
  parco: { giorni: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'], visitatori: [200, 150, 250, 200, 200, 500, 300], prezzoFeriale: 8, prezzoWeekend: 10 },
  /* n.26 — visitatori di tre musei (migliaia) */
  musei: { anni: [2022, 2023, 2024, 2025], Civico: [120, 135, 150, 180], Mare: [80, 90, 100, 121], Scienza: [60, 70, 80, 90] },
  /* n.36 — passeggeri (migliaia) di due compagnie di traghetti e biglietto medio */
  stream: { anni: [2021, 2022, 2023, 2024, 2025], A: [100, 110, 120, 130, 140], B: [40, 60, 80, 100, 120], prezzoA: 8, prezzoB: 12 },
  /* n.44 — tre classi: studenti e voto medio, totale con media complessiva */
  classi: { nomi: ['1A', '1B', '1C'], studenti: [20, 30, 10], medie: [6.5, null, 8.0], totStudenti: 60, mediaTot: 7.1 }
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

function gAree() {
  const D = DATA.aree;
  return `<figure class="fig"><figcaption>Fatturato di un'azienda per area geografica (% del fatturato totale)</figcaption>` + C.pie({
    data: D.nomi.map((n, i) => [n, D.quote[i]]), title: 'Fatturato per area',
    aria: 'Torta del fatturato per area: ' + D.nomi.map((n, i) => n + ' ' + D.quote[i] + '%').join(', ') + '.'
  }) + `<p class="fig-note">Quota delle vendite online sul fatturato di ciascuna area: ${D.nomi.map((n, i) => n + ' ' + D.online[i] + '%').join(', ')}.</p></figure>`;
}

function tReparti() {
  const R = DATA.reparti;
  return C.table({
    caption: 'Dipendenti di un\'azienda per reparto: numero, quota di donne e quota di part-time (% dei dipendenti del reparto)',
    head: ['Reparto', 'Dipendenti', 'Donne', 'Part-time'],
    rows: R.nomi.map((n, i) => [n, R.n[i], R.donne[i] + '%', R.parttime[i] + '%'])
  });
}

function gParco() {
  const D = DATA.parco;
  return `<figure class="fig"><figcaption>Visitatori giornalieri di un parco acquatico in una settimana</figcaption>` + C.bars({
    labels: D.giorni, series: [{ name: 'Visitatori', values: D.visitatori }], max: 600,
    aria: 'Istogramma dei visitatori per giorno: ' + D.giorni.map((g, i) => g + ' ' + D.visitatori[i]).join(', ') + '.'
  }) + `<p class="fig-note">Il biglietto costa ${D.prezzoFeriale} € dal lunedì al venerdì e ${D.prezzoWeekend} € il sabato e la domenica.</p></figure>`;
}

function tMusei() {
  const M = DATA.musei;
  return C.table({
    caption: 'Visitatori di tre musei, in migliaia',
    head: ['Museo'].concat(M.anni),
    rows: [['Museo Civico'].concat(M.Civico), ['Museo del Mare'].concat(M.Mare), ['Museo della Scienza'].concat(M.Scienza)]
  });
}

function gStream() {
  const D = DATA.stream;
  return `<figure class="fig"><figcaption>Passeggeri annui di due compagnie di traghetti, in migliaia</figcaption>` + C.line({
    labels: D.anni.map(String),
    series: [{ name: 'Compagnia A', values: D.A }, { name: 'Compagnia B', values: D.B, dash: '6 4' }],
    lo: 20, hi: 160, gridFrom: 20, gridTo: 160, gridStep: 40, L: 58, R: 30, legend: true, title: 'migliaia di passeggeri',
    aria: 'Due linee dal 2021 al 2025. Compagnia A: ' + D.A.join(', ') + '. Compagnia B: ' + D.B.join(', ') + '.'
  }) + `<p class="fig-note">Il biglietto medio costa ${D.prezzoA} € con la compagnia A e ${D.prezzoB} € con la compagnia B.</p></figure>`;
}

function tClassi() {
  const K = DATA.classi, c = v => v === null ? '?' : dec(v.toFixed(1));
  return C.table({
    caption: 'Studenti e voto medio nelle tre classi prime di una scuola',
    head: ['Classe', 'Studenti', 'Voto medio'],
    rows: K.nomi.map((n, i) => [n, K.studenti[i], c(K.medie[i])]),
    foot: ['Totale', K.totStudenti, dec(K.mediaTot.toFixed(1))]
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato. Il voto medio dell'ultima riga è la media di tutti i 60 studenti.</p>`;
}

/* ======================= LE DOMANDE, PER AREA ======================= */
/* Q — 18 domande, nell'ordine in cui compaiono nelle posizioni Q del LAYOUT */
const Q = [

{ k: 'q-promo', diff: 'media', lang: 'it',
  stem: `In un negozio c'è la promozione «tre articoli al prezzo di due». Marco compra tre articoli identici e, con la tessera fedeltà, ha anche uno sconto del 10% sul totale già ridotto dalla promozione: paga in tutto 108 €. Quanto costa un articolo al prezzo di listino?`,
  ...put('60 €', ['36 €', '40 €', '54 €'], 3),
  sol: `Marco paga il 90% del prezzo di due articoli: 0,9 · 2L = 1,8L = 108, quindi L = 60 €. (Controllo: tre articoli a 60 € sono 180 €; con la promozione se ne pagano due, 120 €; con lo sconto del 10%, 108 €.)`,
  trap: `Dividere la spesa per 3 (108 ÷ 3 = 36 €) trova il prezzo medio pagato per articolo, non il listino. Dimenticare il «tre per due» (108 ÷ 3 ÷ 0,9 = 40 €) o la tessera (108 ÷ 2 = 54 €) toglie un passaggio.`,
  patt: 'Base della percentuale' },

{ k: 'q-lumaca', diff: 'facile', lang: 'it',
  stem: `Una lumaca deve uscire da un pozzo profondo 10 metri. Di giorno sale di 3 metri; di notte, scivolando, scende di 2 metri. Dopo quanti giorni, contando anche il giorno in cui esce, arriva in cima al pozzo?`,
  ...put('8 giorni', ['7 giorni', '9 giorni', '10 giorni'], 2),
  sol: `Ogni giorno completo (salita e discesa) la lumaca guadagna 1 metro. Dopo 7 giorni e 7 notti è a 7 metri; l'ottavo giorno sale di 3 metri e arriva a 10, cioè in cima: esce senza dover scendere di nuovo. In tutto 8 giorni.`,
  trap: `Dividere 10 per il guadagno netto di 1 metro al giorno (10 giorni): l'ultimo giorno la lumaca arriva in cima prima della discesa notturna, quindi non vale il guadagno netto. 9 viene da 10 − 1 senza controllare; 7 dal dimenticare che a fine settimo giorno la lumaca è a 7 metri, non a 10.`,
  patt: 'Ragionamento laterale' },

{ k: 'q-iscritti', diff: 'media', lang: 'it',
  stem: `Il corso A ha il 20% di iscritti in più rispetto al corso B, mentre il corso B ha il 25% di iscritti in meno rispetto al corso C. Se il corso A ha 90 iscritti, quanti ne ha il corso C?`,
  ...put('100', ['circa 94', '108', '72'], 1),
  sol: `A = 1,2 · B, quindi B = 90 ÷ 1,2 = 75. B = 0,75 · C, quindi C = 75 ÷ 0,75 = 100. (Controllo: C = 100 → B = 75 → A = 75 · 1,2 = 90.)`,
  trap: `Applicare la percentuale alla base sbagliata: 75 · 1,25 ≈ 94 usa «25% in più» invece di dividere per 0,75; 90 · 1,2 = 108 fa +20% sul dato già finale. 72 = 90 · 0,8 rovescia il +20% con un −20%.`,
  patt: 'Base della percentuale' },

{ k: 'q-vernice', diff: 'difficile', lang: 'it',
  stem: `Mario da solo imbiancherebbe una parete in 10 ore, Luca da solo in 15 ore. Mario comincia da solo e lavora per 4 ore; poi si unisce Luca e lavorano insieme fino alla fine. Quanto dura in tutto il lavoro?`,
  ...put('7 ore e 36 minuti', ['3 ore e 36 minuti', '6 ore', '7 ore e 30 minuti'], 0),
  sol: `In 4 ore Mario fa 4/10 = 2/5 della parete; restano 3/5. Insieme fanno 1/10 + 1/15 = 1/6 della parete all'ora: servono (3/5) ÷ (1/6) = 18/5 ore = 3 ore e 36 minuti. In tutto: 4 ore + 3 ore e 36 minuti = 7 ore e 36 minuti.`,
  trap: `Rispondere 3 ore e 36 minuti (solo la seconda fase) oppure 6 ore (come se lavorassero insieme dall'inizio: 1 ÷ 1/6). Quando le squadre cambiano a metà, bisogna sommare le due fasi.`,
  patt: 'Lavoro con cambio a metà' },

{ k: 'q-eta3', diff: 'difficile', lang: 'it',
  stem: `La somma delle età di Ada, Bea e Carlo è 64 anni. Tra 4 anni Ada avrà il doppio dell'età di Bea, e Carlo ha 6 anni più di Ada. Quanti anni ha Bea oggi?`,
  ...put('10', ['8', '12', '14'], 3),
  sol: `Siano a, b, c le età di oggi: a + 4 = 2(b + 4), quindi a = 2b + 4; c = a + 6 = 2b + 10. La somma è (2b + 4) + b + (2b + 10) = 5b + 14 = 64, quindi b = 10. (Controllo: Ada 24, Carlo 30, 24 + 10 + 30 = 64; tra 4 anni Ada 28 = 2 · 14.)`,
  trap: `Dimenticare lo spostamento di 4 anni (a = 2b dà 5b + 6 = 64, che non ha soluzione intera) o applicare il «doppio» alle età di oggi. Le età tra 4 anni servono solo per la relazione tra Ada e Bea, non per la somma, che è di oggi.`,
  patt: 'Equazioni a parole' },

{ k: 'q-titolo', diff: 'media', lang: 'it',
  stem: `Un titolo in Borsa sale del 12% a gennaio, scende del 15% a febbraio e sale del 10% a marzo (ogni variazione è calcolata sul valore di fine mese precedente). Di quanto è variato, circa, nel trimestre?`,
  ...put('circa +4,7%', ['+7%', '−3%', '+10%'], 2),
  sol: `I tre passaggi si moltiplicano: 1,12 · 0,85 · 1,10 = 1,0472, cioè circa +4,7%.`,
  trap: `Sommare le variazioni (+12 − 15 + 10 = +7%) tratta tre fattori moltiplicativi come se fossero additivi. Fermarsi a gennaio e febbraio (12 − 15 = −3%) dimentica marzo; considerare solo l'ultimo mese dà +10%.`,
  patt: 'Percentuali composte' },

{ k: 'q-ananas', diff: 'difficile', lang: 'it',
  stem: `Quanti anagrammi della parola ANANAS (anche privi di significato) cominciano e finiscono con la stessa lettera?`,
  ...put('16', ['4', '12', '24'], 3),
  sol: `Le lettere sono A, A, A, N, N, S. La S è una sola, quindi la lettera iniziale e finale uguale può essere A oppure N. Se inizia e finisce con A restano N, N, A, S al centro: 4! ÷ 2! = 12 anagrammi. Se inizia e finisce con N restano A, A, A, S: 4! ÷ 3! = 4 anagrammi. In tutto 12 + 4 = 16.`,
  trap: `12 e 4 sono un caso solo (A…A oppure N…N). 24 è 4!, cioè le disposizioni di quattro lettere tutte diverse: dimentica di dividere per le lettere uguali al centro (le due N, nel caso A…A).`,
  patt: 'Anagrammi con lettere ripetute' },

{ k: 'q-utile', diff: 'media', lang: 'it',
  stem: `Un'azienda ha ricavi di 800.000 € e un utile pari al 10% dei ricavi. L'anno dopo i ricavi calano del 5%, ma l'utile sale al 12% dei ricavi (due punti percentuali in più). Di quanto è variato l'utile in valore?`,
  ...put('+14%', ['+12%', '+15%', '+20%'], 0),
  sol: `Utile iniziale: 10% di 800.000 = 80.000 €. Ricavi dell'anno dopo: 760.000 €; utile: 12% di 760.000 = 91.200 €. Variazione: 91.200 ÷ 80.000 = 1,14, cioè +14%. (In alternativa: 1,2 · 0,95 = 1,14.)`,
  trap: `Confondere i punti percentuali con la variazione dell'utile: da 10% a 12% la quota cresce del 20% in relazione, ma i ricavi sono scesi (×0,95). Sottrarre i due effetti (20 − 5 = +15%) tratta due fattori moltiplicativi come additivi; +12% scambia i punti percentuali per una variazione.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'q-tennis', diff: 'media', lang: 'it',
  stem: `Un tennista ha giocato 100 partite in stagione: ha vinto il 70% di quelle sul veloce e il 50% di quelle sulla terra, e in totale ha vinto il 58% delle partite. Quante partite ha giocato sul veloce?`,
  ...put('40', ['50', '60', '58'], 2),
  sol: `Le vittorie totali sono 58. Se x sono le partite sul veloce: 0,7x + 0,5(100 − x) = 58, cioè 0,2x + 50 = 58 e x = 40. (Controllo: veloce 28 vittorie su 40; terra 30 su 60; 28 + 30 = 58.)`,
  trap: `Il 58% sta più vicino al 50% che al 70%: la maggior parte delle partite è sulla terra. Dividere a metà (50 + 50) varrebbe solo per una media del 60%; scambiare i pesi dà 60; 58 è la percentuale complessiva, non un numero di partite.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-resto9', diff: 'difficile', lang: 'it',
  stem: `Un intero positivo n, diviso per 9, dà resto 5. Qual è il resto della divisione di n² + 2n per 9?`,
  ...put('8', ['5', '7', '35'], 1),
  sol: `n = 9k + 5, quindi n² + 2n = n(n + 2) ≡ 5 · 7 = 35 (mod 9), e 35 = 3 · 9 + 8: resto 8. (Controllo con n = 5: 25 + 10 = 35 → resto 8; con n = 14: 196 + 28 = 224 = 24 · 9 + 8.)`,
  trap: `Non ridurre il risultato: 35 è il valore di 5 · 7, non il resto della divisione per 9. Prendere solo il resto di n² (25 → 7) dimentica il termine 2n; 5 è il resto di n, non dell'espressione.`,
  patt: 'Resti e congruenze' },

{ k: 'q-taxi', diff: 'media', lang: 'it',
  stem: `Il taxi A applica una quota fissa di 4 € più 1,50 € per ogni km; il taxi B una quota fissa di 1 € più 2 € per ogni km. Per quale lunghezza della corsa i due costano uguale, e quanto si paga in quel caso?`,
  ...put('6 km e 13 €', ['3 km e 8,50 €', '4 km e 10 €', '10 km e 19 €'], 0),
  sol: `I costi sono uguali quando 4 + 1,5x = 1 + 2x, cioè 3 = 0,5x e x = 6 km. Il costo è 4 + 1,5 · 6 = 13 € (con B: 1 + 2 · 6 = 13 €).`,
  trap: `La risposta ha due parti: la lunghezza e il costo. Sommare le quote fisse (4 + 1 = 5 → 5 ÷ 0,5 = 10 km) o dividere per 1 invece che per 0,50 (3 ÷ 1 = 3 km) sono errori nella differenza tra le due tariffe; 4 km è un valore senza fondamento.`,
  patt: 'Equazioni a parole' },

{ k: 'q-comitato', diff: 'difficile', lang: 'it',
  stem: `Da un gruppo di 5 uomini e 4 donne si deve scegliere un comitato di 4 persone che comprenda almeno 2 donne. Quanti comitati diversi si possono formare?`,
  ...put('81', ['60', '121', '126'], 2),
  sol: `I comitati di 4 persone su 9 sono C(9; 4) = 126. Quelli con meno di 2 donne: nessuna donna, C(5; 4) = 5; una donna, 4 · C(5; 3) = 4 · 10 = 40. Quindi 126 − 5 − 40 = 81. (Controllo: 2 donne 6 · 10 = 60; 3 donne 4 · 5 = 20; 4 donne 1: 60 + 20 + 1 = 81.)`,
  trap: `126 sono tutti i comitati, senza il vincolo. 121 toglie solo il caso «nessuna donna». 60 conta soltanto i comitati con esattamente 2 donne: «almeno 2» comprende anche 3 e 4 donne.`,
  patt: 'Combinatoria con vincolo' },

{ k: 'q-carburante', diff: 'facile', lang: 'it',
  stem: `Un'auto percorre 15 km con un litro di benzina e ha un serbatoio da 50 litri. Il prezzo della benzina passa da 2,00 € a 2,20 € al litro. Per un percorso mensile di 600 km, di quanto aumenta la spesa mensile di carburante?`,
  ...put('8 €', ['4 €', '10 €', '12 €'], 1),
  sol: `Servono 600 ÷ 15 = 40 litri al mese. L'aumento per litro è 0,20 €: 40 · 0,20 = 8 €. (Controllo: 40 · 2,00 = 80 €; 40 · 2,20 = 88 €.) La capienza del serbatoio non serve.`,
  trap: `Il serbatoio da 50 litri è un dato superfluo: usarlo (50 · 0,20 = 10 €) calcola il costo di un pieno, non il consumo mensile. 4 € dimezza i litri (20 invece di 40) e 12 € usa 60 litri (600 ÷ 10).`,
  patt: 'Dati superflui' },

{ k: 'q-terzo', diff: 'difficile', lang: 'it',
  stem: `Un'auto percorre il primo terzo di un tragitto a 60 km/h. A quale velocità costante deve percorrere i restanti due terzi per ottenere una velocità media di 80 km/h sull'intero tragitto?`,
  ...put('96 km/h', ['90 km/h', '100 km/h', '120 km/h'], 0),
  sol: `Sia 3d la lunghezza del tragitto. Per avere 80 km/h il tempo totale deve essere 3d ÷ 80. Il primo terzo richiede d ÷ 60. Restano 3d/80 − d/60 = (9d − 4d)/240 = 5d/240 = d/48. I restanti 2d si percorrono in d/48, quindi v = 2d ÷ (d/48) = 96 km/h. (Controllo con d = 240 km: 240 ÷ 60 = 4 h; 480 ÷ 96 = 5 h; 720 km in 9 h = 80 km/h.)`,
  trap: `Fare la media sulle distanze, (3 · 80 − 60) ÷ 2 = 90 km/h, o la media semplice, 2 · 80 − 60 = 100 km/h: la velocità media è lo spazio diviso il tempo, e il tempo non è proporzionale allo spazio. 120 km/h è la risposta se i due tratti fossero uguali (metà e metà).`,
  patt: 'Media ponderata vs semplice' },

{ k: 'q-risparmio', diff: 'media', lang: 'it',
  stem: `Un risparmiatore mette da parte 1 € il primo giorno, 2 € il secondo, 3 € il terzo e così via, aggiungendo ogni giorno 1 € in più rispetto al giorno prima. Dopo quanti giorni avrà messo da parte, in tutto, almeno 500 €?`,
  ...put('32', ['25', '30', '31'], 3),
  sol: `Dopo n giorni il totale è 1 + 2 + … + n = n(n + 1) ÷ 2. Per n = 31 è 496 (non basta); per n = 32 è 528 ≥ 500. Quindi servono 32 giorni.`,
  trap: `Da n²/2 ≈ 500 si ricava n ≈ 31,6 e si è tentati di rispondere 31: ma 31 giorni danno 496 €, a soli 4 € dall'obiettivo. Va controllato il totale esatto. 25 e 30 danno totali di 325 € e 465 €.`,
  patt: 'Somma dei primi n interi' },

{ k: 'q-carte', diff: 'difficile', lang: 'it',
  stem: `Un mazzo ha 40 carte divise in 4 semi da 10 carte ciascuno (valori da 1 a 10). Si pescano due carte una dopo l'altra, senza reinserire nel mazzo la prima. Qual è la probabilità che le due carte abbiano lo stesso seme oppure lo stesso valore?`,
  ...put(fr(4, 13), [fr(1, 13), fr(3, 13), fr(3, 10)], 3),
  sol: `Dopo la prima carta restano 39 carte. La seconda ha lo stesso seme della prima in 9 casi, oppure lo stesso valore in 3 casi (le carte con quel valore negli altri tre semi). I due casi non si sovrappongono (una carta con stesso seme e stesso valore sarebbe la prima, già estratta). Probabilità: (9 + 3) ÷ 39 = 12/39 = 4/13.`,
  trap: `3/13 conta solo il seme e 1/13 solo il valore: la domanda dice «oppure». 3/10 usa 40 carte al denominatore (12 ÷ 40) dimenticando che la prima carta è già stata estratta.`,
  patt: 'Probabilità senza reinserimento' },

{ k: 'q-visual', diff: 'media', lang: 'it',
  stem: `Un video viene visto da 3 persone il primo giorno e, ogni giorno, il numero di visualizzazioni di quel giorno triplica rispetto al giorno prima (9 il secondo giorno, 27 il terzo, e così via). Dopo quanti giorni le visualizzazioni totali, sommate dal primo giorno, superano per la prima volta le 1.000?`,
  ...put('6 giorni', ['5 giorni', '7 giorni', '8 giorni'], 0),
  sol: `Visualizzazioni giornaliere: 3, 9, 27, 81, 243, 729, … Totali: 3, 12, 39, 120, 363, 1.092. Il totale supera 1.000 al sesto giorno (1.092; al quinto è 363).`,
  trap: `Guardare le visualizzazioni di un solo giorno: 729 al sesto giorno non supera 1.000, e il settimo ne dà 2.187: si risponde 7 per errore. La domanda chiede il totale cumulato, che al sesto giorno vale già 1.092.`,
  patt: 'Crescita esponenziale' },

{ k: 'q-differenza', diff: 'media', lang: 'en',
  stem: `The sum of two positive integers is 20 and their product is 96. What is the difference between the larger and the smaller number?`,
  opts: ['8', '12', '4', 'It cannot be determined: the two numbers are not given'], ans: 2,
  sol: `With a + b = 20 and ab = 96: (a − b)² = (a + b)² − 4ab = 400 − 384 = 16, so the difference is 4. (The numbers are 12 and 8: sum 20, product 96.)`,
  trap: `«It cannot be determined» looks right because the sum alone fits many pairs; the product narrows them down to a single pair. 8 and 12 are the two numbers themselves, not their difference.`,
  patt: 'Identità algebriche' }
];

/* V — 16 domande */
const V = [

{ k: 'v-remoto', diff: 'media', lang: 'it',
  claim: `La maggior parte dei dipendenti con meno di 40 anni lavora da remoto per almeno due giorni a settimana.`,
  passage: `In una società di consulenza lavorano 400 dipendenti. Di questi, 160 lavorano da remoto per almeno due giorni a settimana, mentre gli altri 240 lavorano sempre in sede. Tra i dipendenti che lavorano da remoto, il 75% ha meno di 40 anni; tra quelli che lavorano sempre in sede, i dipendenti con meno di 40 anni sono la metà. L'azienda precisa che il lavoro da remoto è facoltativo e che l'accordo sarà rinnovato a fine anno.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «160 lavorano da remoto … il 75% ha meno di 40 anni» e «gli altri 240 … la metà». Under 40 che lavorano da remoto: 75% di 160 = 120; under 40 che lavorano sempre in sede: metà di 240 = 120. Dei 240 dipendenti con meno di 40 anni, 120 lavorano da remoto: esattamente la metà, non «la maggior parte» (più della metà). L'affermazione è contraddetta.`,
  trap: `Fermarsi al 75% (è la quota di under 40 tra chi lavora da remoto, non la quota di chi lavora da remoto tra gli under 40) e rispondere «vera». Oppure rispondere «non ricavabile» perché il brano non scrive mai quanti sono gli under 40: si ricava con due percentuali.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-disinflazione', diff: 'media', lang: 'it',
  passage: `Nel 2025 l'inflazione di un Paese è scesa dal 4% al 2%. Alcuni commentatori hanno parlato di «disinflazione», altri hanno usato, impropriamente, il termine «deflazione». La differenza è sostanziale: nella disinflazione i prezzi continuano ad aumentare, ma più lentamente; nella deflazione i prezzi diminuiscono e questo, scoraggiando i consumi in attesa di prezzi ancora più bassi, può avviare una spirale pericolosa per l'economia. La banca centrale ha precisato che il suo obiettivo di un'inflazione al 2% non è un obiettivo di prezzi stabili, ma di una crescita contenuta dei prezzi.`,
  stem: `Nel brano, il termine «disinflazione» indica:`,
  ...put(`un rallentamento della crescita dei prezzi, che continuano comunque ad aumentare.`,
    [`una diminuzione generale e prolungata dei prezzi.`,
     `un'inflazione che resta stabile al 2%, come nell'obiettivo della banca centrale.`,
     `un calo dei prezzi dell'energia che scoraggia i consumi.`], 1),
  sol: `Frase chiave: «nella disinflazione i prezzi continuano ad aumentare, ma più lentamente; nella deflazione i prezzi diminuiscono». Nel 2025 l'inflazione è scesa dal 4% al 2%: i prezzi crescono ancora, ma a un ritmo più basso.`,
  trap: `Confondere «disinflazione» con «deflazione» (prezzi che calano): il brano distingue i due termini proprio perché sono confusi nel linguaggio comune. L'obiettivo del 2% della banca centrale è un'inflazione contenuta, non la definizione di disinflazione.`,
  patt: 'Termine economico frainteso' },

{ k: 'v-casaverde', diff: 'difficile', lang: 'it',
  passage: `Per accedere al programma «Casa Verde» un'abitazione deve avere una classe energetica almeno B. Il signor Rossi, la cui abitazione è in classe A, conclude: «La mia domanda sarà accolta, perché rispetto il requisito del programma». Nel bando si legge che i fondi disponibili bastano per finanziare 600 abitazioni, mentre nell'edizione precedente le domande erano state 2.000. Rossi ricorda anche che l'abitazione per cui chiede il contributo è la sua residenza principale.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del signor Rossi?`,
  ...put(`Nell'edizione precedente più della metà delle domande presentate da abitazioni in classe A o B è stata respinta.`,
    [`Nell'edizione precedente tutte le domande accolte riguardavano abitazioni in classe A o B.`,
     `La classe energetica A è la più alta tra quelle previste dalla normativa.`,
     `Il bando di quest'anno chiude il 30 giugno.`], 2),
  sol: `La conclusione trasforma una condizione necessaria («almeno classe B») in una sufficiente («sarà accolta»). L'informazione che indebolisce di più è che in passato rispettare il requisito non è bastato: più della metà delle domande con classe A o B è stata respinta. L'opzione sulle domande accolte conferma che il requisito è necessario, cosa già detta dal brano.`,
  trap: `Scegliere la prima opzione perché «parla di classi e di domande accolte»: dice che chi è accolto rispetta il requisito (necessità), ma Rossi ha bisogno del contrario, cioè che rispettarlo basti. La classe più alta e la data di chiusura non riguardano il passaggio dal requisito all'accoglimento.`,
  patt: 'Necessario vs sufficiente' },

{ k: 'v-mensa', diff: 'media', lang: 'it',
  claim: `La riduzione degli scarti di cibo è dovuta al nuovo menu.`,
  passage: `Da settembre le mense di un istituto comprensivo hanno introdotto un menu con più verdure e meno fritti. Nel trimestre successivo gli scarti di cibo sono diminuiti del 20% rispetto allo stesso trimestre dell'anno precedente, mentre il numero di pasti serviti è sceso del 5%. Nello stesso periodo la cooperativa che gestisce le mense ha sostituito metà del personale e ha ridotto la pausa pranzo da 40 a 30 minuti. La dirigente scolastica ha dichiarato di voler attendere i dati dell'intero anno scolastico prima di trarre conclusioni.`,
  opts: VFN, ans: 1,
  sol: `Il brano riporta il calo degli scarti (−20%) e il nuovo menu, ma anche altri cambiamenti (metà del personale sostituito, pausa più breve, 5% di pasti in meno), e la dirigente dice di voler attendere i dati dell'intero anno prima di trarre conclusioni. Nessuna frase attribuisce il calo al menu né lo esclude: l'affermazione è non ricavabile.`,
  trap: `Accettare il nesso perché menu e calo degli scarti «vanno insieme» nel brano. Non è nemmeno falsa: il brano non esclude che il menu abbia contribuito, dice solo che è presto per concludere.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-fotovoltaico', diff: 'difficile', lang: 'it',
  passage: `Nel 2025 la potenza fotovoltaica installata in Italia è aumentata di 6 gigawatt (GW), portando il totale a 36 GW: il 40% della nuova potenza è stato installato sui tetti delle abitazioni, il resto in impianti industriali e a terra. L'energia prodotta dal fotovoltaico è stata di 36 terawattora (TWh), pari al 12% del consumo elettrico nazionale. Poiché gli impianti producono soltanto nelle ore di luce, il gestore della rete sottolinea che la crescita della potenza installata non basta da sola a ridurre i prezzi dell'energia nelle ore serali, e ha chiesto di incentivare anche i sistemi di accumulo. Gli esperti stimano che nel 2026 la produzione potrebbe superare i 40 TWh, se le condizioni meteorologiche fossero in linea con la media.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  ...put(`Nel 2025 la potenza fotovoltaica installata è aumentata di circa il 17% rispetto al 2024.`,
    [`Nel 2025 la nuova potenza installata sui tetti delle abitazioni è stata di 2,4 GW.`,
     `Il consumo elettrico nazionale del 2025 è stato di circa 300 TWh.`,
     `Secondo il gestore della rete, per ridurre i prezzi serali non basta aumentare la potenza installata.`], 0),
  sol: `Frase chiave: «aumentata di 6 gigawatt (GW), portando il totale a 36 GW». Nel 2024 la potenza era 36 − 6 = 30 GW e 6 ÷ 30 = +20%, non +17%. Le altre sono nel brano: il 40% di 6 GW è 2,4 GW; 36 TWh ÷ 12% = 300 TWh; il gestore dice che la crescita «non basta da sola».`,
  trap: `Calcolare la percentuale sul valore finale (6 ÷ 36 ≈ 17%) invece che sul valore di partenza (30 GW). Nelle domande «NON è corretta» si cerca l'unica frase sbagliata; qui l'errore è numerico, non una parola cambiata.`,
  patt: 'Base della percentuale' },

{ k: 'v-eng', diff: 'media', lang: 'en',
  passage: `A report on 120 mid-sized companies found that firms with a dedicated wellbeing officer have, on average, 15% lower staff turnover than firms without one. The report's author concludes that appointing a wellbeing officer reduces staff turnover, and recommends that every firm with more than 100 employees should appoint one. The data were collected in a single year, and the firms were selected from those that agreed to take part in the study.`,
  stem: `Which of the following, if true, most weakens the author's conclusion?`,
  ...put(`In most of the firms in the study, the wellbeing officer was appointed only after the firm had already brought its staff turnover under control.`,
    [`On average, the wellbeing officers in the study earn more than other managers.`,
     `Staff turnover in the sector has been falling slowly for ten years.`,
     `The 120 companies in the study belong to five different sectors.`], 2),
  sol: `The author moves from a correlation to a cause. If the officer was usually appointed after turnover had already fallen, the causal arrow may point the other way (low turnover → appointment), so the data do not show that the officer reduces turnover. The other options do not touch the direction of the link.`,
  trap: `Choosing the sector-wide fall in turnover: it is another cause, but it affects firms with and without an officer alike, so it cannot explain the 15% difference between the two groups. The weakness here is reverse causation (timing), not a hidden common factor.`,
  patt: 'Causalità inversa' },

{ k: 'v-export', diff: 'media', lang: 'it',
  claim: `Nel 2025 Beta ha esportato verso l'Unione europea merci per più di 45 miliardi di euro.`,
  passage: `Nel 2025 il Paese Beta ha esportato merci per 80 miliardi di euro e ne ha importate per 100 miliardi. Le esportazioni verso l'Unione europea hanno rappresentato il 60% del totale esportato, mentre le importazioni dall'Unione europea sono state il 45% del totale importato. Il saldo commerciale con i Paesi extra-UE è stato negativo, come negli anni precedenti, soprattutto a causa delle importazioni di energia.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «ha esportato merci per 80 miliardi» e «le esportazioni verso l'Unione europea hanno rappresentato il 60% del totale esportato». Il 60% di 80 è 48 miliardi, più di 45: l'affermazione è una conseguenza del brano, con una soglia numerica.`,
  trap: `Confondere il 45% delle importazioni dall'UE (45 miliardi su 100) con le esportazioni: il numero 45 compare nel brano come importo delle importazioni dall'UE, non delle esportazioni. Oppure rispondere «non ricavabile» perché il brano non scrive mai «48 miliardi».`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-corriere', diff: 'difficile', lang: 'it',
  passage: `Dal regolamento di un corriere. Per i pacchi non assicurati il risarcimento in caso di danno è di 20 euro per ogni chilogrammo di peso, fino a un massimo di 100 euro. Per i pacchi assicurati il risarcimento è pari al valore dichiarato, purché non superi i 1.000 euro. La denuncia del danno deve essere presentata entro 8 giorni dalla consegna; oltre tale termine il corriere non risarcisce in nessun caso. Se il danno è causato da un errore del corriere nell'imballaggio, per i pacchi non assicurati sia l'importo per chilogrammo sia il massimo sono raddoppiati.`,
  stem: `Un pacco di 7 kg, non assicurato, viene danneggiato a causa di un errore del corriere nell'imballaggio. Il destinatario presenta la denuncia 5 giorni dopo la consegna. Quale delle seguenti affermazioni è corretta?`,
  ...put(`Il risarcimento è di 200 euro.`,
    [`Il risarcimento è di 100 euro.`, `Il risarcimento è di 140 euro.`, `Il risarcimento è di 280 euro.`], 1),
  sol: `Il pacco non è assicurato: 20 € al kg fino a un massimo di 100 €. Il danno dipende da un errore del corriere nell'imballaggio, quindi l'importo per kg raddoppia (40 €) e anche il massimo raddoppia (200 €): 7 · 40 = 280 €, limitati al massimo di 200 €. La denuncia dopo 5 giorni è nei termini (8 giorni).`,
  trap: `Applicare solo una parte della regola: senza raddoppio il tetto è 100 € (20 · 7 = 140, ridotto a 100); con il solo raddoppio per kg e senza tetto si ottiene 280 €; 140 € è il calcolo senza tetto e senza raddoppio. Il termine di 8 giorni è rispettato.`,
  patt: 'Applicazione di una regola' },

{ k: 'v-borse', diff: 'media', lang: 'it',
  passage: `Un ateneo ha ricevuto 2.400 domande di borsa di studio nel 2025. Ne ha accolte il 25%; tra le domande accolte, il 40% proveniva da studenti fuori sede. L'ateneo ha precisato che le domande respinte per mancanza di requisiti economici sono state il 60% di quelle respinte, mentre le altre sono state respinte per mancata presentazione dei documenti. Il rettore ha affermato che nel 2026 i fondi disponibili aumenteranno del 10%.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  ...put(`Le domande respinte per mancata presentazione dei documenti sono state 720.`,
    [`Gli studenti fuori sede ammessi alla borsa sono stati il 40% di tutti i richiedenti.`,
     `Le domande respinte per mancanza di requisiti economici sono state 1.440.`,
     `Nel 2026 il numero di borse assegnate aumenterà del 10%.`], 0),
  sol: `Domande: 2.400; accolte il 25% = 600; respinte 1.800. Il 60% delle respinte (1.080) lo è per motivi economici, quindi le altre 1.800 − 1.080 = 720 sono state respinte per documenti mancanti. Le altre: i fuori sede ammessi sono il 40% delle accolte (240), cioè il 10% dei richiedenti; 1.440 è il 60% di 2.400, non di 1.800; il brano parla di fondi che aumentano del 10%, non di borse.`,
  trap: `Applicare una percentuale alla base sbagliata: il 60% è delle domande respinte, non di tutte; il 40% è delle accolte, non dei richiedenti. Un aumento dei fondi non è un aumento del numero di borse (potrebbe cambiare anche l'importo di ciascuna).`,
  patt: 'Base della percentuale' },

{ k: 'v-velocita', diff: 'media', lang: 'it',
  passage: `Dopo l'introduzione del limite di 30 km/h in tutte le strade del quartiere Lido, gli incidenti con feriti sono scesi del 25% in un anno. L'assessore alla mobilità conclude che il limite di velocità ha ridotto gli incidenti e propone di estenderlo ad altri due quartieri. L'assessore precisa che il quartiere ha circa 12.000 abitanti, che il limite è stato segnalato con cartelli in ogni strada e che la polizia locale ha effettuato controlli a campione, in alcune strade più spesso che in altre.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione dell'assessore?`,
  ...put(`Nelle strade dove i controlli sono stati più frequenti, e il limite è stato quindi rispettato più spesso, il calo degli incidenti è stato molto maggiore che nelle strade dove i controlli sono stati rari.`,
    [`La maggior parte dei residenti del quartiere è favorevole all'estensione del limite ad altri quartieri.`,
     `I cartelli del limite di velocità sono costati in tutto 15.000 euro.`,
     `Il numero di abitanti del quartiere è rimasto invariato durante l'anno.`], 3),
  sol: `La conclusione è causale: il limite avrebbe ridotto gli incidenti. Se il calo è molto più forte dove il limite è stato rispettato di più, c'è una relazione «dose-effetto» difficile da spiegare con cause generali (clima, traffico): rafforza molto il nesso. Gli abitanti invariati escludono una sola alternativa.`,
  trap: `Scegliere l'opzione sugli abitanti invariati: esclude una causa alternativa, ma un calo uniforme in tutto il quartiere potrebbe ancora dipendere da altro. Le opinioni dei residenti e il costo dei cartelli non toccano il nesso.`,
  patt: 'Rafforzare con effetto dose' },

{ k: 'v-valle', diff: 'media', lang: 'it',
  claim: `Prima della diffusione delle macchine a vapore le filande della Valtessera erano costruite lontano dai corsi d'acqua.`,
  passage: `Nell'Ottocento molte filande della Valtessera sorgevano lungo i torrenti, perché la forza motrice dei telai era fornita dalle ruote idrauliche. Solo con la diffusione delle macchine a vapore, a partire dagli anni Settanta, le fabbriche poterono essere costruite anche in pianura, vicino alle ferrovie e ai centri abitati. Nel 1880 i telai a vapore erano ancora meno di un terzo del totale, e molte filande continuarono a usare l'energia dell'acqua fino al Novecento.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «molte filande della Valtessera sorgevano lungo i torrenti, perché la forza motrice dei telai era fornita dalle ruote idrauliche». «Solo con la diffusione delle macchine a vapore … anche in pianura» conferma che prima non potevano allontanarsi dall'acqua. L'affermazione è contraddetta.`,
  trap: `Rispondere «non ricavabile» perché il brano non usa le parole «lontano dai corsi d'acqua»: un dettaglio contraddetto anche solo dal lessico (sorgevano lungo i torrenti) rende l'affermazione falsa, non ricavabile. Il dato sul 1880 è di contorno.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-navetta', diff: 'difficile', lang: 'it',
  passage: `Un'azienda con 150 dipendenti in sede offre ai lavoratori una navetta che costa 18.000 euro al mese. La direzione propone di sopprimerla e di rimborsare a ogni dipendente un abbonamento ai mezzi pubblici fino a 40 euro al mese, per un costo massimo di 6.000 euro al mese. Ne conclude che il costo diminuirà di due terzi e che i dipendenti non avranno motivo di lamentarsi, perché potranno comunque raggiungere la sede ogni giorno. Il rimborso partirebbe a gennaio e sarebbe rivalutato dopo sei mesi.`,
  stem: `Su quale assunzione si basa principalmente il ragionamento della direzione?`,
  ...put(`Per tutti i dipendenti un abbonamento ai mezzi pubblici permette di raggiungere la sede in modo accettabile quanto con la navetta.`,
    [`Il numero di dipendenti in sede aumenterà nei prossimi mesi.`,
     `L'azienda ha già ridotto altri costi nell'ultimo anno.`,
     `Il rimborso sarà esente da imposte per i dipendenti.`], 3),
  sol: `Il ragionamento è: costo da 18.000 a 6.000 euro (−2/3) e dipendenti che «potranno comunque raggiungere la sede ogni giorno», quindi nessuno si lamenterà. Funziona solo se un abbonamento ai mezzi pubblici consente a tutti di arrivare in sede in modo accettabile, cioè se 40 euro bastano a sostituire la navetta. Se per alcuni non fosse così (nessuna linea, orari incompatibili), la conclusione crollerebbe.`,
  trap: `Scegliere un'opzione su costi o imposte: il calcolo del risparmio è già nel brano (150 · 40 = 6.000). Ciò che il brano non dice è che l'abbonamento sia un sostituto equivalente per tutti, ed è proprio la parte della conclusione sui dipendenti che non si lamenteranno.`,
  patt: 'Assunzione implicita' },

{ k: 'v-affitti', diff: 'media', lang: 'it',
  passage: `Una proposta di riforma degli affitti prevede che i contratti a canone concordato abbiano una durata minima di tre anni, rinnovabili per altri due, e che il canone sia fissato entro un intervallo stabilito dal Comune. In cambio i proprietari avrebbero diritto a una riduzione dell'imposta: una cedolare secca del 10% sul reddito da affitto, anziché del 21%. Le associazioni degli inquilini osservano che la riforma non fissa alcun limite agli aumenti dei contratti a canone libero; le associazioni dei proprietari temono che la durata minima di tre anni renda più difficile riprendere l'alloggio per esigenze familiari e chiedono che tale durata possa essere ridotta a due anni nei comuni con meno di 20.000 abitanti.`,
  stem: `In base al brano, quale delle seguenti affermazioni è corretta?`,
  ...put(`Secondo la proposta, ai proprietari che stipulano contratti a canone concordato spetterebbe una cedolare secca del 10% anziché del 21%.`,
    [`Secondo la proposta, i contratti a canone libero avrebbero una durata minima di tre anni.`,
     `Le associazioni dei proprietari chiedono di ridurre a due anni la durata minima in tutti i comuni.`,
     `Le associazioni degli inquilini chiedono di fissare un limite agli aumenti dei contratti a canone libero.`], 2),
  sol: `Frase chiave: «i contratti a canone concordato … in cambio i proprietari avrebbero diritto a … una cedolare secca del 10% … anziché del 21%». Le altre: la durata minima di tre anni riguarda il canone concordato, non il libero; i proprietari chiedono i due anni «nei comuni con meno di 20.000 abitanti», non ovunque; gli inquilini «osservano che la riforma non fissa alcun limite», ma il brano non dice che chiedano di fissarlo.`,
  trap: `Le esche sono costruite sulle parole del brano: «canone libero» al posto di «concordato» (ambito), «in tutti i comuni» al posto di «meno di 20.000 abitanti» (ambito), «chiedono» al posto di «osservano» (osservare non è chiedere).`,
  patt: 'Periodo o ambito spostato' },

{ k: 'v-sigma', diff: 'difficile', lang: 'it',
  claim: `Nel 2025 il fatturato di Sigma è cresciuto meno del 5%.`,
  passage: `Nel 2025 il fatturato complessivo del settore delle bevande analcoliche di un Paese è cresciuto del 5% rispetto al 2024. Tra le tre maggiori imprese del settore, Delta, la più grande, ha registrato una crescita del 6% e Omega una crescita del 4%; Sigma, la terza per dimensioni, ha comunicato i suoi risultati solo a gennaio 2026. Il resto del settore è composto da piccole imprese, che nel complesso valgono meno del 10% del fatturato totale.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «il fatturato complessivo del settore è cresciuto del 5%» e le crescite di Delta (6%) e Omega (4%). La crescita del settore è una media ponderata delle crescite di tutte le imprese, con pesi (le dimensioni) che il brano non fornisce, e per Sigma non c'è alcun dato: con pesi diversi Sigma può stare sia sotto sia sopra il 5%. L'affermazione non è né confermata né smentita.`,
  trap: `Ragionare come se il 5% fosse la media semplice di 6% e 4%, e concludere che Sigma deve stare intorno al 5%: nella media ponderata il 5% può essere raggiunto con Sigma sopra o sotto il 5%, a seconda dei pesi. Non è nemmeno falsa.`,
  patt: 'Falso vs Non deducibile' },

{ k: 'v-tram', diff: 'media', lang: 'it',
  passage: `Dopo l'inaugurazione della nuova linea di tram che collega il quartiere San Marco al centro città, il prezzo medio delle case a San Marco è salito del 12% in due anni, contro un aumento del 3% nel resto della città. Un consigliere comunale conclude che la nuova linea ha fatto aumentare i prezzi delle case a San Marco e propone di finanziare altre due linee. Il consigliere ricorda che i prezzi delle case nel quartiere erano stabili nei cinque anni precedenti e che i prezzi degli affitti sono rimasti invariati.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del consigliere?`,
  ...put(`Negli stessi due anni a San Marco sono stati aperti un grande parco e due scuole molto richieste dalle famiglie.`,
    [`La nuova linea di tram trasporta ogni giorno circa 20.000 passeggeri.`,
     `Il costo della nuova linea di tram è stato di 90 milioni di euro.`,
     `Anche negli altri quartieri collegati da nuove linee di tram i prezzi delle case sono saliti più della media cittadina.`], 3),
  sol: `La conclusione è causale: il tram avrebbe causato il +12% rispetto al +3%. Se nello stesso periodo a San Marco sono arrivati un parco e due scuole molto richieste, c'è una causa alternativa specifica del quartiere che può spiegare l'aumento dei prezzi anche senza il tram. Il dato sugli altri quartieri rafforza; passeggeri e costo sono irrilevanti per il nesso.`,
  trap: `Scegliere i passeggeri (20.000 al giorno): una linea molto usata non offre una spiegazione alternativa dell'aumento. Sono i fattori che cambiano insieme al tram, e solo a San Marco, a indebolire il nesso.`,
  patt: 'Cause alternative' },

{ k: 'v-preside', diff: 'media', lang: 'it',
  passage: `Il preside di un liceo afferma: «Grazie al nuovo metodo di studio, quest'anno il tasso di promozione al primo anno è salito dall'80% all'88%». Il liceo ha sei classi prime; il nuovo metodo è stato adottato in tre di esse, scelte tra quelle dei docenti che si sono resi disponibili. Il tasso di promozione complessivo del primo anno è stato dell'88%, contro l'80% dell'anno scorso. Il preside precisa che gli studenti sono stati assegnati alle classi in ordine alfabetico.`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione del preside?`,
  ...put(`Il tasso di promozione nelle tre classi che non hanno adottato il nuovo metodo.`,
    [`Il numero totale di studenti iscritti al primo anno.`,
     `Il costo delle ore di formazione dei docenti sul nuovo metodo.`,
     `La percentuale di studenti del liceo che prosegue gli studi all'università.`], 2),
  sol: `L'affermazione è causale e comparativa: «grazie al nuovo metodo» il tasso è salito dall'80% all'88%. Il metodo è stato adottato in tre classi su sei: per giudicare serve confrontare le classi con il metodo e quelle senza. Se anche nelle tre classi senza il metodo il tasso fosse salito allo stesso modo, l'aumento non dipenderebbe dal metodo.`,
  trap: `Scegliere dati generali (numero di iscritti, esiti universitari) o sul costo: non dicono se l'aumento sia dovuto al metodo. Il tasso complessivo (88%) è già noto: serve il dato diviso per gruppi.`,
  patt: 'Misura e definizione' }
];

/* DI — 16 domande */
const DI = [

{ k: 'd-quadrati', diff: 'media', lang: 'it', ds: true,
  stem: ds('Siano x e y due numeri reali positivi. È vero che x è maggiore del doppio di y?',
    'x > 2y + 1.',
    'x² > 4y².'),
  ...dsq('ACBD', 'C'),
  sol: `Si chiede se x > 2y. (1): x > 2y + 1 > 2y, quindi la risposta è sempre «sì». (2): x² > 4y² equivale a (x − 2y)(x + 2y) > 0; poiché x e y sono positivi, x + 2y > 0 e quindi x − 2y > 0: ancora «sì». Ciascuna affermazione basta da sola.`,
  trap: `Pensare che la (2) non basti perché «elevando al quadrato si perde il segno»: qui x e y sono positivi, quindi x² > 4y² equivale a x > 2y. Se i numeri potessero essere negativi la (2) non basterebbe.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-ricercatori', diff: 'difficile', lang: 'it',
  asset: dp([
    `In un laboratorio lavorano 10 ricercatori. Ciascuno si occupa di almeno uno dei due temi, X e Y.`,
    `7 ricercatori si occupano di X e 6 si occupano di Y.`,
    `Chi si occupa soltanto di X non partecipa ai seminari del giovedì.`
  ], [
    `A. Esattamente 4 ricercatori si occupano di entrambi i temi.`,
    `B. Esattamente 4 ricercatori si occupano soltanto di X.`,
    `C. Chi partecipa ai seminari del giovedì si occupa anche di Y.`,
    `D. Almeno 3 ricercatori partecipano ai seminari del giovedì.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  ...put('Sia la B sia la C', ['Solo la B', 'Sia la A sia la B', 'Sia la B sia la D'], 3),
  sol: `Poiché ciascuno dei 10 ricercatori si occupa di almeno un tema, chi si occupa di entrambi è 7 + 6 − 10 = 3: A (4) è falsa. Chi si occupa soltanto di X è 7 − 3 = 4: B vera. C: chi partecipa ai seminari non è «soltanto di X»; poiché ciascuno si occupa di X o di Y, chi non è soltanto di X si occupa di Y: vera (contrapposta del dato 3). D non è sicura: i possibili partecipanti sono al massimo i 6 che si occupano anche di Y, ma il brano non dice quanti partecipino davvero (potrebbero essere anche meno di 3).`,
  trap: `Non vedere C, che non contiene numeri: è la contrapposta del terzo dato, accostata a due proposizioni numeriche. A scambia i 4 che si occupano soltanto di X con i 3 che si occupano di entrambi i temi; D sembra vera perché «ci sono 6 possibili partecipanti», ma non si sa quanti partecipino.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-aree', diff: 'media', lang: 'it', asset: gAree(),
  stem: `Quale percentuale del fatturato totale dell'azienda proviene dalle vendite online?`,
  ...put('21%', ['19,5%', '20%', '21,5%'], 0),
  sol: `Si pesano le quote online con la dimensione delle aree: 40% · 20% + 35% · 30% + 25% · 10% = 8% + 10,5% + 2,5% = 21% del fatturato. (Con un fatturato di 100: online 8 + 10,5 + 2,5 = 21.)`,
  trap: `Fare la media semplice delle tre quote online, (20% + 30% + 10%) ÷ 3 = 20%: le tre aree non hanno lo stesso peso (40%, 35%, 25%). Il 19,5% si ottiene scambiando i pesi di Nord e Sud, il 21,5% scambiando quelli di Nord e Centro.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-biglietti', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Il numero di biglietti venduti da un cinema in una sera è compreso tra 100 e 150 (estremi inclusi). Quanti biglietti sono stati venduti?',
    'Dividendo i biglietti in gruppi da 8, non ne avanza nessuno.',
    'Dividendo i biglietti in gruppi da 12, non ne avanza nessuno.'),
  ...dsq('ABDC', 'D'),
  sol: `Insieme le due condizioni dicono che il numero è multiplo sia di 8 sia di 12, cioè del mcm(8; 12) = 24. Tra 100 e 150 i multipli di 24 sono 120 e 144: restano due valori possibili. Da sola la (1) lascia 104, 112, 120, 128, 136, 144; da sola la (2) lascia 108, 120, 132, 144.`,
  trap: `Prendere 8 · 12 = 96 come numero cui il biglietto deve essere multiplo: 96 non è il minimo comune multiplo, ed è fuori dall'intervallo. Il mcm è 24, e in un intervallo di 50 numeri ci sono due multipli di 24: i dati non bastano.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-reparti', diff: 'media', lang: 'it', asset: tReparti(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`In tutta l'azienda le donne sono più degli uomini.`,
         `Le donne di Amministrazione sono più di quelle di Vendite e IT messe insieme.`,
         `I dipendenti part-time sono il 20% del totale.`,
         `I dipendenti part-time di Logistica sono tanti quanti quelli di Vendite.`], ans: 3,
  sol: `Le percentuali sono di riga: servono i dipendenti di ogni reparto. Donne: 80, 90, 20, 20 (in tutto 210 su 500: meno della metà, la prima è falsa); Amministrazione 90 contro 80 + 20 = 100 (la seconda è falsa). Part-time: 50, 24, 4, 50 (in tutto 128 su 500 = 25,6%, la terza è falsa). Logistica 50 e Vendite 50: uguali (la quarta è vera).`,
  trap: `Leggere 50% > 25% come «più part-time a Logistica»: il reparto è più piccolo (100 contro 200 dipendenti), e i numeri coincidono. Il 20% è la quota di part-time di Amministrazione, non dell'azienda; il 75% di donne di Amministrazione non basta a dare la maggioranza all'intera azienda.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-badge', diff: 'media', lang: 'it',
  asset: dp([
    `Chi ha seguito il corso di sicurezza ha il badge verde.`,
    `Nessun dipendente con il badge verde accede al deposito senza accompagnatore.`,
    `Marco ha seguito il corso di sicurezza.`
  ], [
    `A. Chi accede al deposito senza accompagnatore non ha seguito il corso di sicurezza.`,
    `B. Marco accede al deposito senza accompagnatore.`,
    `C. Chi ha il badge verde ha seguito il corso di sicurezza.`,
    `D. Marco non ha il badge verde.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  ...put('Sia la B sia la D', ['Solo la B', 'Sia la A sia la C', 'Sia la C sia la D'], 1),
  sol: `Marco ha seguito il corso, quindi ha il badge verde (dato 1) e perciò non accede al deposito senza accompagnatore (dato 2): B è sicuramente falsa e D (Marco non ha il badge verde) è sicuramente falsa. A è la contrapposta: chi accede senza accompagnatore non ha il badge verde e quindi non ha seguito il corso, quindi è vera. C inverte il dato 1: il badge verde potrebbe dipendere anche da altro, quindi non è né sicuramente vera né falsa.`,
  trap: `Con la consegna «false» si rischia di scegliere A (la contrapposta, vera ma poco evidente) o C (l'implicazione inversa, che non è sicura). Solo B e D contraddicono i dati.`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-patente', diff: 'media', lang: 'it', ds: true,
  stem: ds('In un gruppo di 100 persone, quanti maschi non hanno la patente?',
    'Le persone con la patente sono 70, di cui 30 femmine.',
    'I maschi sono 55.'),
  ...dsq('BCAD', 'B'),
  sol: `Insieme: i maschi con la patente sono 70 − 30 = 40; i maschi in tutto sono 55; i maschi senza patente sono 55 − 40 = 15. Da sola la (1) dà i maschi con la patente (40) ma non quanti sono i maschi in tutto; da sola la (2) dà i maschi in tutto ma non quanti hanno la patente.`,
  trap: `Credere che la (1) basti: 100 − 70 = 30 sono le persone senza patente, ma comprendono maschi e femmine. Servono le due informazioni per riempire la tabella 2 × 2 (maschi/femmine × con/senza patente).`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-parco', diff: 'media', lang: 'it', asset: gParco(),
  stem: `Quale quota degli incassi della settimana da biglietti è stata realizzata il sabato e la domenica?`,
  ...put('50%', ['44%', '56%', '29%'], 3),
  sol: `Giorni feriali: 200 + 150 + 250 + 200 + 200 = 1.000 visitatori · 8 € = 8.000 €. Fine settimana: 500 + 300 = 800 visitatori · 10 € = 8.000 €. Su 16.000 € totali, il weekend vale la metà: 50%.`,
  trap: `Usare i visitatori: 800 su 1.800 = 44%, ma il biglietto del weekend costa di più. Il 56% è la quota dei visitatori feriali; il 29% è 2 giorni su 7. Gli incassi dipendono sia dai visitatori sia dal prezzo.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-musei', diff: 'media', lang: 'it', asset: tMusei(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Tra il 2022 e il 2025 la crescita percentuale più alta è stata quella del Museo del Mare.`,
         `Nel 2025 il Museo della Scienza ha avuto più di un quarto dei visitatori totali dei tre musei.`,
         `Nel 2024 i visitatori del Museo Civico sono stati più del doppio di quelli del Museo della Scienza.`,
         `Nessuna delle altre risposte è corretta.`], ans: 0,
  sol: `Crescite dal 2022 al 2025: Civico 60 su 120 = +50%; Mare 41 su 80 = +51,25%; Scienza 30 su 60 = +50%. La più alta è quella del Mare: la prima è vera. Seconda: il totale 2025 è 180 + 121 + 90 = 391 e un quarto è 97,75; la Scienza ha 90 (falsa). Terza: il doppio di 80 è 160, il Civico ha 150 (falsa). Quindi «Nessuna delle altre» è falsa.`,
  trap: `Guardare i valori assoluti: la crescita in migliaia più alta è quella del Civico (+60). Le percentuali sono costruite quasi uguali (50%, 51,25%, 50%): serve calcolarle. Le altre due sono vicine alla soglia (90 contro 97,75; 150 contro 160).`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-media7', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('In una classe di 25 studenti i voti vanno da 1 a 10. È vero che la media dei voti della classe è maggiore di 7?',
    'Almeno 22 studenti hanno preso 8 o più, e gli altri hanno preso almeno 5.',
    'La mediana dei voti è 7.'),
  ...dsq('CADB', 'A'),
  sol: `(1): la somma minima possibile è 22 · 8 + 3 · 5 = 176 + 15 = 191, quindi la media è almeno 191 ÷ 25 = 7,64 > 7: la risposta è sempre «sì» e la (1) basta. (2) non basta: con 12 voti da 1 e 13 voti da 7 la mediana è 7 e la media è 103 ÷ 25 ≈ 4,1 (sotto 7); con 13 voti da 7 e 12 voti da 10 la mediana è ancora 7 e la media è 211 ÷ 25 ≈ 8,4 (sopra 7).`,
  trap: `Cercare la media esatta: per una domanda sì/no basta un limite. Dalla (1) si calcola il minimo della somma (voti minimi per tutti) e si vede che supera 7 per 25. La (2) sembra utile perché parla del «centro» dei voti, ma la mediana non fissa la media.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-magliette', diff: 'difficile', lang: 'it',
  asset: dp([
    `Un negozio ha venduto in una settimana 120 magliette, tutte nelle taglie S, M e L.`,
    `Le magliette M vendute sono più numerose delle S, e le S sono più numerose delle L.`,
    `Le magliette L vendute sono almeno 20.`
  ], [
    `A. Le magliette M vendute sono più di 40.`,
    `B. Le magliette S vendute sono più di 20.`,
    `C. Le magliette L vendute sono più di 30.`,
    `D. Le magliette M vendute sono più di 60.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  ...put('Sia la A sia la B', ['Solo la A', 'Sia la B sia la C', 'Sia la C sia la D'], 1),
  sol: `Siano M > S > L con M + S + L = 120 e L ≥ 20. A: se M fosse al massimo 40, S sarebbe al massimo 39 e L al massimo 38, e la somma sarebbe al massimo 117 < 120: dunque M ≥ 41, vera. B: L ≥ 20 e S > L, quindi S ≥ 21: vera. C: L può essere 20 (per esempio 20, 30, 70) oppure 38 (38, 39, 43): non è sicura. D: M può essere 70 (20, 30, 70) oppure 41 (39, 40, 41): non è sicura.`,
  trap: `Cercare i valori esatti invece dei limiti: per A si ragiona per assurdo sulla somma massima possibile con M ≤ 40; per B basta la catena di disuguaglianze; per C e D un controesempio.`,
  patt: 'Consegna: sicuramente vera' },

{ k: 'd-stream', diff: 'difficile', lang: 'it', asset: gStream(),
  stem: `In quale anno l'incasso annuo da biglietti della compagnia B ha superato per la prima volta quello della compagnia A?`,
  ...put('2024', ['2022', '2023', '2025'], 2),
  sol: `Incassi annui (migliaia di €): compagnia A 800, 880, 960, 1.040, 1.120; compagnia B 480, 720, 960, 1.200, 1.440. Nel 2023 i due incassi sono uguali (960): B supera A per la prima volta nel 2024.`,
  trap: `Guardare solo i passeggeri: A ne ha sempre più di B (140 contro 120 nel 2025). Il 2023 è il pareggio (120 · 8 = 80 · 12 = 960), non il sorpasso: «supera» richiede una disuguaglianza stretta.`,
  patt: 'Rapporti vs valori assoluti' },

{ k: 'd-triangolo', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Un triangolo ha un lato di 10 cm. Qual è la sua area?',
    'Il perimetro del triangolo è 30 cm.',
    'Il triangolo è isoscele.'),
  ...dsq('CADB', 'B'),
  sol: `Insieme: i lati sono 10, a, b con a + b = 20. Se il triangolo è isoscele, o a = b (e allora a = b = 10), oppure uno dei due è uguale a 10 (e allora l'altro è 10): in ogni caso il triangolo è equilatero con lato 10 cm e l'area è (√3 ÷ 4) · 100 = 25√3 cm². Da sola la (1) lascia infinite coppie (a; b) con somma 20 (per esempio 9 e 11, oppure 8 e 12, con aree diverse); da sola la (2) lascia infiniti triangoli isosceli con un lato di 10 cm.`,
  trap: `Pensare che «isoscele» basti perché fissa una relazione tra i lati, o che il perimetro fissi i lati: ciascuna informazione lascia infiniti triangoli. Insieme obbligano i tre lati a misurare 10 cm.`,
  patt: 'Sufficienza dei dati' },

{ k: 'd-premium', diff: 'media', lang: 'it',
  asset: dp([
    `Gli abbonati Premium sono unicamente utenti maggiorenni.`,
    `Alcuni utenti maggiorenni hanno la carta fedeltà.`,
    `Nessun utente con la carta fedeltà è abbonato Premium.`
  ], [
    `A. Alcuni utenti maggiorenni non sono abbonati Premium.`,
    `B. Tutti gli abbonati Premium sono maggiorenni.`,
    `C. Alcuni abbonati Premium hanno la carta fedeltà.`,
    `D. Tutti gli utenti maggiorenni sono abbonati Premium.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  ...put('Sia la C sia la D', ['Solo la C', 'Sia la A sia la B', 'Sia la B sia la D'], 0),
  sol: `«Unicamente» indica che i Premium sono tutti maggiorenni (B vera: ripete il dato 1). Alcuni maggiorenni hanno la carta fedeltà (dato 2) e questi non sono Premium (dato 3): A vera, D falsa. C contraddice il dato 3: falsa. Le proposizioni sicuramente false sono C e D.`,
  trap: `Leggere «unicamente» come «tutti i maggiorenni»: il dato dice che i Premium sono solo maggiorenni, non che i maggiorenni siano Premium (implicazione inversa). Con la consegna «false» si rischia di scegliere le vere (A e B).`,
  patt: 'Consegna: sicuramente falsa' },

{ k: 'd-classi', diff: 'difficile', lang: 'it', asset: tClassi(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`La classe 1B ha il voto medio più alto delle tre classi.`,
         `La media complessiva delle classi 1A e 1C insieme è uguale al voto medio della classe 1B.`,
         `Se la classe 1C avesse 20 studenti con lo stesso voto medio, la media complessiva delle tre classi sarebbe superiore a 7,2.`,
         `La media aritmetica semplice dei tre voti medi di classe coincide con la media complessiva.`], ans: 2,
  sol: `Voto medio di 1B: la somma dei voti di tutti è 60 · 7,1 = 426; 1A dà 20 · 6,5 = 130 e 1C dà 10 · 8 = 80; restano 426 − 210 = 216 per 30 studenti, cioè 7,2. Prima: 7,2 contro 8,0 della 1C (falsa). Seconda: 1A e 1C insieme fanno (130 + 80) ÷ 30 = 7,0, non 7,2 (falsa). Terza: con 1C a 20 studenti la somma è 130 + 216 + 160 = 506 su 70 studenti, cioè circa 7,23 > 7,2 (vera). Quarta: (6,5 + 7,2 + 8,0) ÷ 3 ≈ 7,23, non 7,1 (falsa).`,
  trap: `Dare per scontato che la media complessiva sia la media semplice delle medie: le classi hanno numeri diversi di studenti. Il voto medio mancante si ricava dalla somma complessiva dei voti, non dalla media delle medie.`,
  patt: 'Media ponderata vs semplice' },

{ k: 'd-grade', diff: 'media', lang: 'en', ds: true,
  stem: ds('A student\'s final grade is the weighted average of a written test (weight 60%) and an oral test (weight 40%). Both tests are marked out of 30. Is the final grade at least 24?',
    'The written test mark was 18.',
    'The oral test mark was 28.'),
  ...dsq('CADB', 'A', true),
  sol: `(1): even with the highest possible oral mark (30), the final grade is at most 0.6 · 18 + 0.4 · 30 = 10.8 + 12 = 22.8 < 24, so the answer is always «no»: (1) is sufficient. (2): the final grade is 0.6w + 11.2 (w = written mark), which is at least 24 only if w ≥ 21.33…; the written mark is unknown, so (2) alone is not sufficient.`,
  trap: `Looking for the exact final grade: in a yes/no question a bound is enough. (2) looks attractive because 28 is a high mark, but the written test has the larger weight and its mark is missing.`,
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
  id: '18',
  title: 'Mock 18',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Livello del Mock 15: promozioni e basi delle percentuali, lavoro con cambio a metà, velocità media su tratti diseguali, resti, combinatoria con vincoli, brani con modali e opzioni quasi tutte plausibili. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false», sufficienza dei dati e medie ponderate.',
  questions: QUESTIONS,
  data: DATA
};
});
