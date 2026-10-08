/* =======================================================================
   Mock 14 — 50 domande nuove (18 Q, 16 V, 16 DI), calibrate con
   guida-calibrazione-mock.md sulla difficoltà del test ufficiale:
   2–3 passaggi anche per le domande facili, 4–5 per le difficili, numeri
   puliti, ogni opzione sbagliata è un errore tipico preciso.

   Nelle domande di sufficienza dei dati i criteri sono fissi:
   A = una sola delle due affermazioni basta, B = servono entrambe,
   C = ciascuna basta da sola, D = servono altri dati; nella lista
   compaiono in ordine rimescolato (la lettera del criterio è scritta
   nel testo dell'opzione, la posizione A–D è quella del pulsante).

   Tutti i numeri dei grafici e delle tabelle stanno in DATA e sono
   riusati da tools/check_math_14.py per ricalcolare le risposte.
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

/* vero / falso / non ricavabile con la motivazione dentro l'opzione (ordine fisso: Falsa, Non ricavabile, Vera) */
const VFN = [
  'Falsa, poiché contraddice un\'affermazione contenuta nel brano o da esso deducibile',
  'Non ricavabile dal testo, poiché non ci sono abbastanza informazioni',
  'Vera, poiché è contenuta nel brano o da esso deducibile'
];
const VFN_EN = [
  'False, because it contradicts a statement in the passage or one that can be deduced from it',
  'Cannot be determined, because the passage does not provide enough information',
  'True, because it is stated in the passage or can be deduced from it'
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
  /* n.14 — club di pallavolo: giocatori per squadra, allenatori in tutto */
  club: { squadre: [['Under 14', 18], ['Under 16', 24], ['Under 18', 20]], allenatori: 5 },
  /* n.9 — ricavi per canale (torta, quote 2025) e informazioni extra */
  canali: { quote: [['Negozi', 40], ['Online', 25], ['Grande distribuzione', 20], ['Altri canali', 15]], onlineMln: 30, aumentoTot: 20, quotaNegozi24: 36 },
  /* n.17 — visitatori (migliaia) dei musei A e B; il museo C è solo nel testo */
  musei: { anni: [2022, 2023, 2024, 2025], A: [250, 260, 240, 200], B: [170, 190, 180, 140], tot24: 500, caloTot: 20 },
  /* n.37 — variazione % mensile delle vendite (gennaio = 200 mila €), addetti */
  vendite: { mesi: ['Feb', 'Mar', 'Apr', 'Mag', 'Giu'], var: [25, -20, 20, -25, 50], gen: 200, addetti: [8, 8, 10, 10, 12, 12] },
  /* n.22 — mezzo usato per andare al lavoro (percentuali di riga) */
  trasporti: [
    { c: 'Torino',  n: 800, auto: 45, bici: 10, mp: 35, piedi: 10 },
    { c: 'Bologna', n: 400, auto: 30, bici: 30, mp: 20, piedi: 20 },
    { c: 'Napoli',  n: 200, auto: 55, bici: 5,  mp: 30, piedi: 10 }
  ],
  /* n.4 — produzione di energia elettrica (TWh) */
  energia: {
    anni: [2021, 2022, 2023, 2024, 2025],
    solare: [43.7, 52.0, 61.5, 74.0, 86.9],
    eolico: [30.0, 36.5, 35.8, 36.9, 46.2],
    idro:   [55.0, 44.0, 42.0, 50.0, 53.0]
  },
  /* n.31 — pezzi per stabilimento e turno (mattina, pomeriggio, notte); in C rapporto 5:4:3 */
  stab: {
    A: [120, 90, 60], B: [80, 110, 50], C: [100, 80, 60],
    totTurno: [300, 280, 170], rapportoC: [5, 4, 3],
    noti: { A: [120, null, null], B: [null, null, 50], C: [null, null, null] },
    totRiga: { A: 270, B: 240, C: 240 }
  }
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

function gCanali() {
  const D = DATA.canali;
  return `<figure class="fig"><figcaption>Fatturato 2025 di un'azienda di abbigliamento, per canale di vendita</figcaption>` + C.pie({
    data: D.quote, title: 'Quote del fatturato 2025',
    aria: 'Torta con le quote del fatturato 2025: ' + D.quote.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `</figure>`;
}

function gMusei() {
  const D = DATA.musei;
  const W = 520, H = 280, L = 44, R = 24, T = 20, B = 32, lo = 100, hi = 300;
  const x = i => L + (W - L - R) * i / 3;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  let g = '';
  for (let t = lo; t <= hi; t += 50) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === lo ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  D.anni.forEach((yr, i) => { g += `<text x="${x(i)}" y="${H - 8}" class="tick" text-anchor="middle">${yr}</text>`; });
  const line = (arr, c, dash) => `<polyline points="${arr.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" style="stroke:var(--${c})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${dash ? ' stroke-dasharray="6 4"' : ''}></polyline>`;
  const dots = (arr, c, name) => arr.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"><title>${name}, ${D.anni[i]}: ${v}</title></circle>`).join('');
  g += line(D.A, 's1') + line(D.B, 's2', true) + dots(D.A, 's1', 'Museo A') + dots(D.B, 's2', 'Museo B');
  D.anni.forEach((yr, i) => {
    g += `<text x="${x(i)}" y="${y(D.A[i]) - 11}" class="val" text-anchor="middle">${D.A[i]}</text>`;
    g += `<text x="${x(i)}" y="${y(D.B[i]) + 19}" class="val" text-anchor="middle">${D.B[i]}</text>`;
  });
  return `<figure class="fig"><figcaption>Visitatori di due musei di una città, in migliaia</figcaption>
<ul class="legend"><li><i class="sw line" style="background:var(--s1)"></i>Museo A</li><li><i class="sw line" style="background:var(--s2)"></i>Museo B</li></ul>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Due linee dal 2022 al 2025, visitatori in migliaia. Museo A: ${D.A.join(', ')}. Museo B: ${D.B.join(', ')}.">${g}</svg></div></figure>`;
}

function gVendite() {
  const D = DATA.vendite;
  const W = 480, H = 280, L = 44, R = 14, T = 24, B = 34, lo = -40, hi = 60, bw = 44;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  const band = (W - L - R) / D.mesi.length;
  let g = '';
  for (let t = -40; t <= 60; t += 20) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t > 0 ? '+' : t < 0 ? '−' : ''}${Math.abs(t)}%</text>`;
  }
  D.var.forEach((p, i) => {
    const x = L + band * i + (band - bw) / 2, pos = p >= 0;
    const y0 = pos ? y(p) : y(0), h = Math.abs(y(p) - y(0));
    g += `<rect x="${x}" y="${y0}" width="${bw}" height="${h}" style="fill:var(--${pos ? 's1' : 's2'})"><title>${D.mesi[i]}: ${pos ? '+' : '−'}${Math.abs(p)}%</title></rect>`;
    g += `<text x="${x + bw / 2}" y="${pos ? y0 - 7 : y0 + h + 15}" class="val" text-anchor="middle">${pos ? '+' : '−'}${Math.abs(p)}%</text>`;
    g += `<text x="${x + bw / 2}" y="${H - 10}" class="lab" text-anchor="middle">${D.mesi[i]}</text>`;
  });
  return `<figure class="fig"><figcaption>Vendite di un negozio online: variazione percentuale rispetto al mese precedente</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Colonne con la variazione percentuale mensile delle vendite. ${D.mesi.map((m, i) => m + ': ' + (D.var[i] > 0 ? '+' : '−') + Math.abs(D.var[i]) + '%').join(', ')}.">${g}</svg></div>
<p class="fig-note">Le vendite di gennaio sono state di ${D.gen} mila €. A gennaio gli addetti erano 8; ne sono stati assunti 2 a marzo e altri 2 a maggio, senza uscite.</p></figure>`;
}

function tTrasporti() {
  return C.table({
    caption: 'Mezzo usato per andare al lavoro, per città (% dei lavoratori intervistati in quella città)',
    head: ['Città', 'Lavoratori intervistati', 'Auto', 'Bici', 'Mezzi pubblici', 'A piedi'],
    rows: DATA.trasporti.map(t => [t.c, fmt(t.n), t.auto + '%', t.bici + '%', t.mp + '%', t.piedi + '%'])
  }) + `<p class="fig-note">Le quattro percentuali di ogni riga sommano a 100%.</p>`;
}

function tEnergia() {
  const E = DATA.energia, f = v => dec(v.toFixed(1));
  return C.table({
    caption: 'Produzione di energia elettrica da tre fonti, in TWh',
    head: ['Fonte'].concat(E.anni),
    rows: [['Solare'].concat(E.solare.map(f)), ['Eolico'].concat(E.eolico.map(f)), ['Idroelettrico'].concat(E.idro.map(f))]
  });
}

function tStab() {
  const S = DATA.stab, c = v => v === null ? '?' : v;
  const riga = k => [k === 'C' ? 'Stabilimento C' : 'Stabilimento ' + k].concat(S.noti[k].map(c), [S.totRiga[k]]);
  return C.table({
    caption: 'Pezzi prodotti in tre stabilimenti, per turno',
    head: ['', 'Mattina', 'Pomeriggio', 'Notte', 'Totale'],
    rows: [riga('A'), riga('B'), riga('C'), ['Totale'].concat(S.totTurno, [750])]
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato. Nello stabilimento C i pezzi dei tre turni (mattina, pomeriggio, notte) stanno nel rapporto 5 : 4 : 3.</p>`;
}

/* ======================= LE 50 DOMANDE ======================= */
const QUESTIONS = [

/* ---------- 1 ---------- */
{ n: 1, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Una confezione di biscotti da 400 g costava 5 €. Oggi costa 5,50 €, ma contiene il 20% di biscotti in meno. Di quanto è aumentato, in percentuale, il prezzo al chilo?`,
  opts: ['37,5%', '30%', '25%', '10%'], ans: 0,
  sol: `Il prezzo della confezione si moltiplica per 1,10 e la quantità per 0,80: il prezzo al chilo si moltiplica per 1,10 ÷ 0,80 = 1,375, cioè +37,5%. (Controllo: prima 5 ÷ 0,4 = 12,50 €/kg; ora 5,50 ÷ 0,32 = 17,1875 €/kg; 17,1875 ÷ 12,5 = 1,375.)`,
  trap: `Sommare le due variazioni (10% + 20% = 30%) oppure fermarsi a una sola: solo il prezzo (+10%) o solo la quantità (1 ÷ 0,80 = 1,25, cioè +25%). Il prezzo al chilo è un rapporto: le due variazioni si compongono dividendo, non sommando.`,
  patt: 'Percentuali composte' },

/* ---------- 2 ---------- */
{ n: 2, area: 'V', diff: 'media', lang: 'it', claim: `Nel 2025 la banca centrale ha abbassato il costo del denaro.`,
  passage: `Nel 2025 la banca centrale ha lasciato invariato per dodici mesi il tasso di riferimento, fermo al 3,5%, nonostante l'inflazione fosse scesa dal 4,1% al 2,8%. Nello stesso anno ha però ridotto gli acquisti di titoli di Stato, scelta che ha contribuito a far salire i rendimenti dei titoli a lungo termine.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «ha lasciato invariato per dodici mesi il tasso di riferimento, fermo al 3,5%». Il «costo del denaro» è il tasso di riferimento: se è rimasto fermo tutto l'anno, non è stato abbassato. L'affermazione è contraddetta.`,
  trap: `Rispondere «non ricavabile» perché il brano non usa l'espressione «costo del denaro»: è un sinonimo tecnico del tasso. Il calo dell'inflazione non obbliga a nulla e il brano dice espressamente che il tasso non si è mosso.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 3 ---------- */
{ n: 3, area: 'DI', diff: 'facile', lang: 'it', ds: true,
  stem: ds('Quanti studenti ha una classe?',
    'Gli studenti sono più di 20 e meno di 30.',
    'Dividendo la classe in gruppi da 4 studenti ne avanza uno.'),
  ...dsq('BDCA', 'D'),
  sol: `(1) da sola dà 9 valori (da 21 a 29). (2) da sola dice che il numero è del tipo 4k + 1, quindi ne ammette infiniti. Insieme: tra 21 e 29 i numeri che divisi per 4 danno resto 1 sono 21, 25 e 29. Restano tre possibilità: i vincoli lasciano un intervallo di soluzioni, servono altri dati.`,
  trap: `Fermarsi al primo valore trovato (21) e dire «insieme bastano». Con due condizioni non si ha automaticamente un solo valore: bisogna elencare tutti i casi compatibili.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 4 ---------- */
{ n: 4, area: 'DI', diff: 'media', lang: 'it', asset: tEnergia(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel 2025 la produzione solare è più che doppia rispetto a quella del 2021.`,
         `La produzione eolica è cresciuta, anno dopo anno, in modo costante in tutto il periodo.`,
         `Nel 2022 l'idroelettrico ha prodotto almeno un terzo del totale delle tre fonti.`,
         `Nessuna delle altre risposte è corretta.`], ans: 3,
  sol: `Solare: 2 × 43,7 = 87,4 e il 2025 vale 86,9, quindi non è più che doppia. Eolico: nel 2023 scende da 36,5 a 35,8, quindi non cresce ogni anno. Idro 2022: totale 52,0 + 36,5 + 44,0 = 132,5 e un terzo è 44,17; 44,0 è meno. Le prime tre sono false, quindi è corretta «Nessuna delle altre».`,
  trap: `Arrotondare: 86,9 «è circa il doppio» di 43,7 e 44 «è circa un terzo» di 132,5. Con i confronti «doppio», «un terzo» e «in modo costante» i numeri sono vicini apposta alla soglia: basta un anno o mezzo punto per smentire.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 5 ---------- */
{ n: 5, area: 'Q', diff: 'media', lang: 'it',
  stem: `Tre colleghi dividono una cena da 330 € in parti diverse. Anna paga il 50% in più di Bea; Bea paga il 20% in meno di Carla. Quanto paga Anna?`,
  opts: ['88 €', '110 €', '132 €', '150 €'], ans: 2,
  sol: `Poniamo Carla = C. Bea paga 0,8C; Anna paga il 50% in più di Bea: 1,5 · 0,8C = 1,2C. Totale: C + 0,8C + 1,2C = 3C = 330, quindi C = 110 e Anna paga 1,2 · 110 = 132 €. (Controllo: 110 + 88 + 132 = 330.)`,
  trap: `Applicare il 50% a Carla invece che a Bea (Anna = 1,5C): il totale sarebbe 3,3C = 330, C = 100 e Anna 150 €. Il «50% in più» ha come base Bea. Esche anche la quota di un'altra persona (88 € Bea, 110 € Carla).`,
  patt: 'Base della percentuale' },

/* ---------- 6 ---------- */
{ n: 6, area: 'V', diff: 'media', lang: 'it',
  passage: `Nei primi nove mesi del 2025 le esportazioni agroalimentari italiane hanno raggiunto i 48 miliardi di euro, il 6% in più rispetto allo stesso periodo del 2024. La crescita è stata trainata dai mercati extra-UE (+9%), mentre le vendite verso i Paesi dell'Unione sono aumentate solo del 3%. Secondo le associazioni di categoria, circa due terzi dell'aumento in valore dipendono dai rincari dei prezzi e non da maggiori quantità vendute. L'export pesa ormai per il 25% del fatturato complessivo del settore.`,
  stem: `Quale delle seguenti affermazioni NON è corretta in base al brano?`,
  opts: [`Il 6% è l'aumento delle esportazioni rispetto allo stesso periodo del 2024.`,
         `Nel primo semestre del 2025 le esportazioni agroalimentari hanno raggiunto i 48 miliardi di euro.`,
         `Verso i Paesi dell'Unione le esportazioni sono cresciute meno che verso i mercati extra-UE.`,
         `Meno della metà dell'aumento in valore delle esportazioni è dovuta a maggiori quantità vendute.`], ans: 1,
  sol: `Frase chiave: «Nei primi nove mesi del 2025 … 48 miliardi di euro». I 48 miliardi si riferiscono ai primi nove mesi, non al primo semestre: l'affermazione sposta il periodo. Le altre tre sono nel brano: «+6% … stesso periodo del 2024»; «+9%» extra-UE contro «solo del 3%»; «due terzi … dai rincari dei prezzi», quindi meno di un terzo (cioè meno della metà) dalle quantità.`,
  trap: `Nelle domande «NON è corretta» si cerca l'unica frase sbagliata, non quella giusta: qui l'esca è il periodo spostato («nove mesi» → «primo semestre»). Attenzione a «meno della metà»: è vera perché le quantità spiegano circa un terzo.`,
  patt: 'Periodo o ambito spostato' },

/* ---------- 7 ---------- */
{ n: 7, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `In un'azienda di 90 persone lo stipendio medio degli uomini è di 2.200 € e quello delle donne è di 1.600 €. Lo stipendio medio dell'intera azienda è di 1.800 €. Quante sono le donne?`,
  opts: ['60', '30', '45', 'Non è possibile determinarlo con i dati forniti'], ans: 0,
  sol: `La media complessiva sta a 200 € dalle donne (1.800 − 1.600) e a 400 € dagli uomini (2.200 − 1.800): i pesi sono inversi alle distanze, quindi donne : uomini = 400 : 200 = 2 : 1. Su 90 persone le donne sono 60 e gli uomini 30. (Controllo: (60 · 1.600 + 30 · 2.200) ÷ 90 = 162.000 ÷ 90 = 1.800.)`,
  trap: `Invertire i pesi: la media (1.800) è più vicina a quella delle donne, quindi le donne sono la maggioranza, non la minoranza (30). Altra esca: 45, che varrebbe con la media semplice (1.900). I dati bastano: la media complessiva e il totale fissano il rapporto.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 8 ---------- */
{ n: 8, area: 'V', diff: 'media', lang: 'it',
  passage: `Nelle città le superfici impermeabili, come asfalto e cemento, impediscono all'acqua piovana di penetrare nel terreno e la costringono a defluire nelle fognature, che durante i temporali intensi possono saturarsi e provocare allagamenti. Per questo molti Comuni sostituiscono parte delle superfici impermeabili con superfici permeabili, come prati o ghiaia, che assorbono parte dell'acqua.`,
  claim: `Trasformare un parcheggio asfaltato in un prato può ridurre il rischio che le fognature si saturino durante un temporale.`,
  opts: VFN, ans: 2,
  sol: `Frasi chiave: «le superfici impermeabili … impediscono all'acqua piovana di penetrare nel terreno» e «sostituiscono … superfici impermeabili con superfici permeabili, come prati». Un parcheggio asfaltato è una superficie impermeabile e un prato una permeabile: l'affermazione è un esempio concreto coerente con la descrizione generale del brano.`,
  trap: `Rispondere «non ricavabile» perché il brano non nomina i parcheggi: il testo descrive la regola generale (asfalto → prato) e l'affermazione ne è un caso particolare, formulato con «può», quindi prudente.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 9 ---------- */
{ n: 9, area: 'DI', diff: 'media', lang: 'it', asset: gCanali(),
  stem: `Nel 2024 i negozi pesavano per il 36% sul fatturato totale. Si sa che le vendite online del 2025 sono state di 30 milioni di euro e che il fatturato totale del 2025 è stato del 20% superiore a quello del 2024. Di quanto sono cresciute, circa, le vendite dei negozi tra il 2024 e il 2025?`,
  opts: ['circa +39%', 'circa +33%', 'circa +20%', 'circa +12%'], ans: 1,
  sol: `Online = 25% del 2025 = 30 milioni, quindi il fatturato 2025 è 30 ÷ 0,25 = 120 milioni. Il 2025 è il 20% sopra il 2024: fatturato 2024 = 120 ÷ 1,2 = 100 milioni. Negozi 2024: 36% di 100 = 36 milioni. Negozi 2025: 40% di 120 = 48 milioni. Crescita: 48 ÷ 36 − 1 ≈ +33%.`,
  trap: `Calcolare il 2024 come 120 · 0,8 = 96 (base sbagliata): i negozi 2024 diventano 34,56 e la crescita sembra circa +39%. Un'altra esca è dare la differenza 48 − 36 = 12 come se fosse una percentuale.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 10 ---------- */
{ n: 10, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds(`In un'urna ci sono 10 palline, ciascuna rossa o blu. Si estraggono due palline una dopo l'altra, senza rimettere nell'urna la prima. La probabilità che le due palline estratte abbiano lo stesso colore è minore di ${fr(1, 2)}?`,
    'Le palline rosse sono almeno 4 e al massimo 6.',
    'Le palline blu sono meno delle rosse.'),
  ...dsq('ADBC', 'A'),
  sol: `Con r rosse e 10 − r blu, P(stesso colore) = [r(r − 1) + (10 − r)(9 − r)] ÷ 90. Con r = 4, 5, 6 si ottiene 42/90, 40/90, 42/90: sempre sotto 45/90 = ½. La (1) basta, anche senza sapere r. La (2) dice solo r ≥ 6: r = 6 dà 42/90 (sì), r = 7 dà 48/90 (no). Non basta.`,
  trap: `Cercare il valore esatto di r: per una risposta sì/no basta un limite. Il caso opposto è la (2), che sembra più forte («le blu sono meno») ma lascia r = 7, 8, 9, dove la probabilità supera ½. Rispondere «servono altri dati» quando bastava un limite è l'errore da evitare.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 11 ---------- */
{ n: 11, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Tre luci lampeggiano ogni 12, 18 e 30 secondi. Alle 21:00:00 lampeggiano tutte e tre insieme. Quante volte lampeggeranno di nuovo tutte e tre insieme tra le 21:00:01 e le 21:10:00 (estremi compresi)?`,
  opts: ['16', '10', '3', '0'], ans: 2,
  sol: `Il tempo tra due lampi simultanei è il mcm: 12 = 2²·3, 18 = 2·3², 30 = 2·3·5, quindi mcm = 2²·3²·5 = 180 s. In 10 minuti (600 s) si ha un lampo comune a 180, 360 e 540 s; il successivo, a 720 s, è fuori. Risposta: 3.`,
  trap: `Usare il prodotto 12 · 18 · 30 = 6.480 s (nessun lampo nei 600 s: «0»), oppure il mcm di sole due luci: 36 s (600 ÷ 36 → 16) o 60 s (600 ÷ 60 = 10). Serve il mcm di tutte e tre.`,
  patt: 'mcm vs prodotto' },

/* ---------- 12 ---------- */
{ n: 12, area: 'V', diff: 'media', lang: 'it',
  passage: `Il Comune di Valdera vuole ridurre di almeno il 10% il traffico privato in centro introducendo un pedaggio d'ingresso di 3 €. L'assessore osserva che a Verona, città con dimensioni e abitudini di spostamento molto simili, un pedaggio di 3 € ha ridotto il traffico del 12% e ne conclude che a Valdera il pedaggio raggiungerà l'obiettivo.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione dell'assessore?`,
  opts: [`In città molto diverse da Valdera, per ridurre il traffico del 10% serve un pedaggio di almeno 4 €.`,
         `La costruzione dei varchi di accesso a Valdera costerà due milioni di euro.`,
         `Negli ultimi dodici mesi il traffico privato nel centro di Valdera è aumentato del 4%.`,
         `In città molto simili a Valdera basta un pedaggio di 2,50 € per ridurre il traffico del 10%.`], ans: 3,
  sol: `La conclusione è: «a Valdera un pedaggio di 3 € ridurrà il traffico di almeno il 10%». Se in città molto simili basta già 2,50 €, allora 3 € (di più) basta a maggior ragione: è una condizione sufficiente che rafforza la conclusione. Le altre opzioni parlano di città diverse, di costi o di un dato che non tocca l'efficacia del pedaggio.`,
  trap: `Confondere necessario e sufficiente: «serve almeno 4 €» è una condizione necessaria, ma vale per città molto diverse da Valdera, quindi non riguarda il caso. «Basta 2,50 €» è sufficiente e riguarda città simili. Gli altri due sono esche pratiche o numeriche irrilevanti.`,
  patt: 'Necessario vs sufficiente' },

/* ---------- 13 ---------- */
{ n: 13, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel 2025 l'inflazione media annua è scesa al 2,1%, dal 5,7% del 2023. Questo non significa che i prezzi siano diminuiti: significa che hanno continuato ad aumentare, ma più lentamente. Tra il 2021 e il 2025 il livello medio dei prezzi al consumo è cresciuto del 14%, mentre le retribuzioni nominali, cioè espresse in euro correnti, sono aumentate dell'11%.`,
  stem: `Quale delle seguenti affermazioni è corretta in base al brano?`,
  opts: [`Nel 2025 i prezzi al consumo sono diminuiti rispetto al 2024.`,
         `Tra il 2021 e il 2025 il potere d'acquisto delle retribuzioni è diminuito.`,
         `Tra il 2021 e il 2025 le retribuzioni nominali sono diminuite del 3%.`,
         `L'inflazione media del 2023 è stata inferiore a quella del 2025.`], ans: 1,
  sol: `Frase chiave: «prezzi … +14%» e «retribuzioni nominali … +11%». Se i prezzi crescono più dei salari nominali, il potere d'acquisto cala: 1,11 ÷ 1,14 ≈ 0,974, cioè circa −2,6% in termini reali. Le altre: «non significa che i prezzi siano diminuiti» smentisce la prima; le retribuzioni nominali sono aumentate dell'11%, non diminuite; il 5,7% del 2023 è maggiore del 2,1% del 2025.`,
  trap: `Termine economico frainteso: inflazione in calo (disinflazione) non vuol dire prezzi in calo (deflazione). Inoltre 11% − 14% = −3 sono punti di differenza tra due crescite diverse, non una diminuzione delle retribuzioni.`,
  patt: 'Termine economico frainteso' },

/* ---------- 14 ---------- */
{ n: 14, area: 'DI', diff: 'media', lang: 'it',
  asset: dp([
    `Un club di pallavolo ha tre squadre giovanili: Under 14, Under 16 e Under 18.`,
    `Ogni giocatore appartiene a una sola squadra e ogni allenatore allena una sola squadra.`,
    `I giocatori sono 18 nell'Under 14, 24 nell'Under 16 e 20 nell'Under 18.`,
    `Ogni squadra ha uno o due allenatori; in tutto gli allenatori sono 5.`,
    `L'Under 14 e l'Under 16 hanno lo stesso numero di allenatori.`
  ], [
    `A. Nell'Under 18 ci sono più di 15 giocatori per allenatore.`,
    `B. Il numero di giocatori per allenatore è più alto nell'Under 14 che nell'Under 16.`,
    `C. Nell'intero club ci sono in media più di 13 giocatori per allenatore.`,
    `D. Ogni squadra con due allenatori ha meno di 25 giocatori.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Sia la A sia la D', 'Sia la B sia la C', 'Solo la A', 'Solo la D'], ans: 0,
  sol: `Cinque allenatori in tre squadre, da 1 o 2 ciascuna: due squadre ne hanno 2 e una ne ha 1. Under 14 e Under 16 ne hanno quanti? Uguali: se fossero entrambe a 1, la terza dovrebbe averne 3 (impossibile), quindi entrambe a 2 e l'Under 18 a 1. Giocatori per allenatore: 18 ÷ 2 = 9, 24 ÷ 2 = 12, 20 ÷ 1 = 20. A: 20 > 15, vera. B: 9 > 12, falsa. C: nell'intero club 62 giocatori ÷ 5 allenatori = 12,4, quindi non più di 13: falsa. D: le squadre con due allenatori sono Under 14 (18) e Under 16 (24), entrambe sotto 25: vera.`,
  trap: `Per la C calcolare la media dei tre rapporti, (9 + 12 + 20) ÷ 3 ≈ 13,7, e dichiararla vera: la media dell'intero club è ponderata (62 ÷ 5 = 12,4). Per la B confrontare i rapporti al contrario. La D è una proposizione logica che si controlla solo sapendo quali squadre hanno due allenatori.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 15 ---------- */
{ n: 15, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Una partita tra Casa e Ospite finisce 4–3 per la Casa. In quanti ordini diversi possono essere stati segnati i sette gol, sapendo che il primo gol è stato segnato dall'Ospite?`,
  opts: ['7!/(4!·3!)', '6!/(3!·3!)', '5!/(4!·2!)', '6!/(4!·2!)'], ans: 3,
  sol: `Il primo gol è fissato (Ospite). Restano 6 gol: 4 della Casa e 2 dell'Ospite. L'ordine è deciso da quali 2 dei 6 posti sono dell'Ospite: 6!/(4!·2!) = 720 ÷ 48 = 15.`,
  trap: `7!/(4!·3!) = 35 ignora il vincolo del primo gol; 6!/(3!·3!) = 20 vale se il primo gol fosse della Casa (resterebbero 3 + 3); 5!/(4!·2!) non è nemmeno un intero (2,5): si sono contati male i gol rimasti.`,
  patt: 'Combinatoria con vincolo' },

/* ---------- 16 ---------- */
{ n: 16, area: 'V', diff: 'facile', lang: 'it',
  passage: `Dopo l'apertura della nuova tangenziale di Valmonte, il traffico nel centro storico è diminuito del 15% e il numero di negozi chiusi nell'anno è sceso da 24 a 18.`,
  claim: `Il calo delle chiusure dei negozi del centro è stato provocato dalla riduzione del traffico.`,
  opts: VFN, ans: 1,
  sol: `Il brano riporta due fatti avvenuti dopo la tangenziale: traffico −15% e chiusure da 24 a 18. Non dice mai che le chiusure siano diminuite a causa del minor traffico (potrebbero esserci altre ragioni). Nessuna frase afferma o nega il nesso causale.`,
  trap: `Accettare una causa non detta: due fatti vicini nel tempo non implicano un nesso. Qui però non è nemmeno falsa, perché il brano non esclude il nesso: la risposta è «non ricavabile».`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 17 ---------- */
{ n: 17, area: 'DI', diff: 'media', lang: 'it', asset: gMusei(),
  stem: `Nel 2024 i visitatori dei tre musei della città erano in tutto 500 mila; il Museo C non compare nel grafico. Nel 2025 il totale dei tre musei è calato del 20%. Di quanto è calato, in percentuale, il numero di visitatori del Museo C tra il 2024 e il 2025?`,
  opts: ['circa 17%', '20%', '25%', 'circa 33%'], ans: 2,
  sol: `Museo C nel 2024: 500 − 240 − 180 = 80 mila. Totale 2025: 500 · 0,8 = 400 mila. Museo C nel 2025: 400 − 200 − 140 = 60 mila. Calo: (80 − 60) ÷ 80 = 25%.`,
  trap: `Rispondere 20%, il calo del totale: il totale è una media ponderata dei tre cali (A −16,7%, B −22,2%) e C, che pesa meno, è calato di più. Altre esche: dividere il calo per il valore del 2025 (20 ÷ 60 ≈ 33%) oppure prendere il calo di A (circa 17%).`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 18 ---------- */
{ n: 18, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Un agente percorre 12.000 km in un anno con un'auto che consuma 7 litri ogni 100 km; la benzina costa 1,50 € al litro. L'azienda gli rimborsa 0,18 € per ogni chilometro. Di quanto, in percentuale, il rimborso supera la spesa per il carburante?`,
  opts: ['circa 171%', 'circa 71%', 'circa 58%', 'circa 42%'], ans: 1,
  sol: `Carburante: 12.000 · 7 ÷ 100 = 840 litri, cioè 840 · 1,50 = 1.260 €. Rimborso: 12.000 · 0,18 = 2.160 €. Eccedenza: 2.160 − 1.260 = 900 €. Il rimborso supera la spesa: la base è la spesa. 900 ÷ 1.260 ≈ 71,4%.`,
  trap: `Dividere l'eccedenza per il rimborso (900 ÷ 2.160 ≈ 42%): in «X supera Y del …%» la base è Y, la spesa. Le altre due sono rapporti invertiti: la spesa come quota del rimborso (1.260 ÷ 2.160 ≈ 58%) e il rimborso come quota della spesa (2.160 ÷ 1.260 ≈ 171%).`,
  patt: 'Base della percentuale' },

/* ---------- 19 ---------- */
{ n: 19, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Un parallelepipedo a base rettangolare ha due facce adiacenti di area 12 cm² e 20 cm². Qual è il suo volume?',
    'La terza faccia, adiacente a entrambe, ha area 15 cm².',
    'Le tre dimensioni sono numeri interi di centimetri.'),
  ...dsq('BCDA', 'A'),
  sol: `Dimensioni a, b, c con ab = 12 e bc = 20 (lo spigolo b è comune). (1): ac = 15. Moltiplicando le tre aree, (abc)² = 12 · 20 · 15 = 3.600, quindi V = abc = 60 cm³. (2): con dimensioni intere, b divide sia 12 sia 20, quindi b ∈ {1, 2, 4}: (12, 1, 20) → V = 240; (6, 2, 10) → 120; (3, 4, 5) → 60. Tre volumi possibili: non basta.`,
  trap: `Pensare che (2) «restringa abbastanza» perché i numeri sono interi: restano tre parallelepipedi diversi. Con (1) non serve trovare le singole dimensioni: il volume è la radice del prodotto delle tre aree.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 20 ---------- */
{ n: 20, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel 2025 la spesa sanitaria pubblica italiana è stata pari al 6,3% del PIL, contro il 6,7% del 2022; la spesa sostenuta direttamente dalle famiglie (spesa «out of pocket») è salita al 2,4% del PIL. Nello stesso periodo il numero di medici ogni 1.000 abitanti è rimasto stabile a 4,1, mentre il personale infermieristico è diminuito del 3%. Un'indagine segnala che circa un cittadino su dieci ha rinunciato nell'ultimo anno ad almeno una prestazione sanitaria per motivi economici.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  opts: [`La quota di PIL destinata alla sanità pubblica è scesa di 0,4 punti percentuali rispetto al 2022.`,
         `La spesa sanitaria totale (pubblica e privata) è diminuita rispetto al 2022.`,
         `Il calo del personale infermieristico ha provocato la rinuncia alle cure per un cittadino su dieci.`,
         `Il 6,3% della spesa pubblica complessiva è destinato alla sanità.`], ans: 0,
  sol: `Frase chiave: «6,3% del PIL, contro il 6,7% del 2022». 6,7 − 6,3 = 0,4 punti percentuali di PIL. Le altre: della spesa privata nel 2022 il brano non dà il valore, quindi non si può dire che la spesa totale sia calata; nessuna frase lega il calo degli infermieri alla rinuncia alle cure; il 6,3% è una quota del PIL, non della spesa pubblica.`,
  trap: `Tre esche classiche: una conclusione sul totale quando manca metà dei dati; una causa inventata tra due fatti vicini; un ambito spostato (6,3% del PIL → 6,3% della spesa pubblica).`,
  patt: 'Periodo o ambito spostato' },

/* ---------- 21 ---------- */
{ n: 21, area: 'Q', diff: 'media', lang: 'it',
  stem: `Quanti anagrammi della parola ESSERE (anche privi di significato) iniziano con una consonante e finiscono con una vocale?`,
  opts: ['12', '18', '30', '48'], ans: 1,
  sol: `ESSERE ha tre E, due S e una R. Prima lettera consonante (S o R), ultima vocale (E). Caso S … E: restano E, E, S, R da disporre nelle 4 posizioni centrali: 4! ÷ 2! = 12. Caso R … E: restano E, E, S, S: 4! ÷ (2!·2!) = 6. Totale 12 + 6 = 18.`,
  trap: `Contare solo il caso con la S iniziale (12), oppure dimenticare le lettere ripetute: 4! + 4! = 48. Il 30 è un'altra domanda: gli anagrammi che iniziano per E sono 5! ÷ (2!·2!) = 30.`,
  patt: 'Anagrammi con lettere ripetute' },

/* ---------- 22 ---------- */
{ n: 22, area: 'DI', diff: 'media', lang: 'it', asset: tTrasporti(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`A Napoli gli automobilisti sono più numerosi che a Bologna.`,
         `A Torino i ciclisti sono la metà di quelli di Bologna.`,
         `A Torino e a Bologna sono altrettanti i lavoratori che vanno a piedi.`,
         `Gli utenti dei mezzi pubblici di Napoli sono meno di un quinto di quelli di Torino.`], ans: 2,
  sol: `Le percentuali sono di riga: servono i lavoratori intervistati. Auto: Napoli 55% di 200 = 110, Bologna 30% di 400 = 120 (110 < 120, la prima è falsa). A piedi: Torino 10% di 800 = 80, Bologna 20% di 400 = 80 (uguali, la seconda è vera). Bici: Torino 10% di 800 = 80, Bologna 30% di 400 = 120 (80 non è la metà di 120). Mezzi pubblici: Napoli 30% di 200 = 60, Torino 35% di 800 = 280, un quinto è 56 e 60 > 56 (la quarta è falsa).`,
  trap: `Leggere le percentuali di riga come conteggi: 55% > 30% farebbe pensare che gli automobilisti napoletani siano più numerosi, e 10% < 20% che i pedoni di Torino siano meno di quelli di Bologna. Le città hanno 800, 400 e 200 intervistati: i numeri assoluti si ribaltano.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 23 ---------- */
{ n: 23, area: 'V', diff: 'facile', lang: 'it',
  passage: `Dopo che il comune di Borgoverde ha piantato duemila alberi lungo le strade cittadine, nell'anno successivo la concentrazione media di polveri sottili (PM10) è scesa del 10%. Il sindaco ne conclude che gli alberi hanno ripulito l'aria.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del sindaco?`,
  opts: [`Gli alberi piantati appartengono a specie che assorbono bene le polveri sottili.`,
         `Il piano ha avuto un costo di 300.000 euro, pagato con fondi regionali.`,
         `La concentrazione di PM10 è misurata da tre centraline distribuite nel comune.`,
         `Nello stesso anno la concentrazione di PM10 è scesa di circa il 10% anche nei comuni vicini, dove non è stato piantato alcun albero.`], ans: 3,
  sol: `Se il calo del 10% si è verificato anche dove non ci sono alberi nuovi, c'è probabilmente una causa comune (clima, traffico, norme) che spiega la diminuzione indipendentemente dagli alberi: è una causa alternativa. La prima opzione rafforza; le altre due sono irrilevanti per il nesso causale.`,
  trap: `Scegliere un'opzione che «sembra negativa» (il costo) o un dato tecnico (le centraline): non toccano il nesso alberi → aria più pulita. L'unica che offre una spiegazione diversa dello stesso calo è quella sui comuni vicini.`,
  patt: 'Cause alternative' },

/* ---------- 24 ---------- */
{ n: 24, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un'eredità di 63.000 € viene divisa tra tre nipoti di 2, 4 e 8 anni in parti inversamente proporzionali alle loro età. Quanto riceve il più piccolo?`,
  opts: ['36.000 €', '21.000 €', '18.000 €', '9.000 €'], ans: 0,
  sol: `Parti inversamente proporzionali a 2, 4 e 8: sono proporzionali a 1/2 : 1/4 : 1/8, cioè (moltiplicando per 8) a 4 : 2 : 1. In tutto 7 parti: 63.000 ÷ 7 = 9.000 € a parte. Il più piccolo (2 anni) riceve 4 parti: 36.000 €.`,
  trap: `Usare la proporzionalità diretta (2 : 4 : 8 = 1 : 2 : 4): il più piccolo avrebbe una sola parte, 9.000 €. Il 21.000 € è la divisione in parti uguali (63.000 ÷ 3).`,
  patt: 'Proporzionalità inversa' },

/* ---------- 25 ---------- */
{ n: 25, area: 'DI', diff: 'media', lang: 'it',
  asset: dp([
    `Uno scaffale ha quattro ripiani, numerati da 1 (il più basso) a 4 (il più alto).`,
    `Su ogni ripiano c'è un solo genere di libri, scelto tra gialli, saggi, fantasy e storia, e ogni genere occupa un solo ripiano.`,
    `I gialli non sono sul ripiano 1.`,
    `I saggi sono più in alto della storia.`,
    `Il fantasy è subito sotto i gialli (sul ripiano immediatamente inferiore).`
  ], [
    `A. I saggi sono sul ripiano 3.`,
    `B. I gialli sono più in alto del fantasy.`,
    `C. La storia è più in alto dei gialli.`,
    `D. Il fantasy è sul ripiano 4.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo la A', 'Sia la A sia la D', 'Solo la B', 'Sia la C sia la D'], ans: 1,
  sol: `Fantasy e gialli occupano due ripiani consecutivi, con il fantasy sotto. Le disposizioni possibili sono tre: (fantasy 1, gialli 2, storia 3, saggi 4); (fantasy 2, gialli 3, storia 1, saggi 4); (fantasy 3, gialli 4, storia 1, saggi 2). A: i saggi stanno sul 4, sul 4 o sul 2, mai sul 3: sicuramente falsa. B: i gialli stanno subito sopra il fantasy: sempre vera. C: la storia è sopra i gialli solo nella prima disposizione: né sempre vera né sempre falsa. D: il fantasy ha i gialli sopra di sé, quindi non può essere sul ripiano 4: sicuramente falsa.`,
  trap: `Con la consegna «sicuramente false» si finisce per scegliere ciò che è vero (la B). Inoltre la C non è sicuramente falsa: lo è in due disposizioni su tre ma non nella prima. «Sicuramente falsa» significa falsa in tutti i casi compatibili con i dati.`,
  patt: 'Consegna: sicuramente falsa' },

/* ---------- 26 ---------- */
{ n: 26, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Condizioni di vendita di un negozio online: il cliente può recedere dal contratto entro 14 giorni dalla consegna, senza dover indicare il motivo. Il diritto di recesso non spetta per i beni confezionati su misura. Il venditore deve rimborsare il prezzo entro 14 giorni dalla comunicazione del recesso. Il 3 marzo Paolo riceve un paio di scarpe di serie e il 5 marzo una giacca confezionata su misura; il 15 marzo comunica al venditore il recesso per entrambi gli articoli.`,
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Per le scarpe il venditore non può rifiutare il recesso; per la giacca deve comunque rimborsare entro il 29 marzo.`,
         `Per le scarpe il venditore può rifiutare il recesso, perché Paolo lo ha comunicato dopo la consegna; per la giacca non può rifiutarlo.`,
         `Per le scarpe il venditore deve rimborsare entro il 29 marzo; per la giacca non è tenuto a rimborsare.`,
         `Per le scarpe il venditore deve rimborsare entro il 29 marzo; per la giacca non può in nessun caso rimborsare il prezzo.`], ans: 2,
  sol: `Scarpe: bene di serie, recesso comunicato il 15 marzo, 12 giorni dopo la consegna del 3 marzo (entro i 14 giorni): il recesso è valido e il rimborso va fatto entro 14 giorni dalla comunicazione, cioè entro il 29 marzo. Giacca: «Il diritto di recesso non spetta per i beni confezionati su misura»: il venditore non è tenuto a rimborsare.`,
  trap: `Esche sui modali: «non può», «deve», «non può in nessun caso». Il testo dice soltanto che per la giacca il diritto non spetta, cioè il venditore non è obbligato; non gli vieta di rimborsare. Per le scarpe i 14 giorni del recesso decorrono dalla consegna, quelli del rimborso dalla comunicazione.`,
  patt: 'Applicazione di una regola' },

/* ---------- 27 ---------- */
{ n: 27, area: 'Q', diff: 'media', lang: 'it',
  stem: `Il prezzo di un cappotto viene ridotto del 20% rispetto al listino; sul prezzo così ottenuto si applica un ulteriore sconto del 30%; infine un coupon toglie 10 € dal prezzo scontato. Dopo i tre interventi Marco paga 90 €. Qual era, circa, il prezzo di listino?`,
  opts: ['200 €', 'circa 179 €', 'circa 161 €', 'circa 143 €'], ans: 1,
  sol: `Sia L il listino. Dopo il primo sconto 0,8L; dopo il secondo, sul prezzo già scontato, 0,7 · 0,8L = 0,56L; il coupon toglie 10 €: 0,56L − 10 = 90. Quindi 0,56L = 100 e L = 100 ÷ 0,56 ≈ 178,6 €, cioè circa 179 €.`,
  trap: `Tre errori tipici: ignorare il coupon (90 ÷ 0,56 ≈ 161 €); sottrarlo invece di aggiungerlo nel passaggio inverso (80 ÷ 0,56 ≈ 143 €); sommare gli sconti (20% + 30% = 50%) e ottenere (90 + 10) ÷ 0,5 = 200 €. Gli sconti successivi si moltiplicano.`,
  patt: 'Base della percentuale' },

/* ---------- 28 ---------- */
{ n: 28, area: 'DI', diff: 'media', lang: 'en', ds: true,
  stem: ds('Five parcels are weighed. Is the difference between the weight of the heaviest and the weight of the lightest parcel greater than 2 kg?',
    'Two of the parcels weigh 11 kg and 14 kg.',
    'The average weight of the five parcels is 11 kg and the lightest parcel weighs less than 9 kg.'),
  ...dsq('CBDA', 'C', true),
  sol: `(1) The heaviest parcel weighs at least 14 kg and the lightest at most 11 kg, so the difference is at least 3 kg: more than 2. (2) The average is 11, so the heaviest weighs at least 11 kg (the maximum cannot be below the average); the lightest weighs less than 9 kg; hence the difference is greater than 11 − 9 = 2. Each statement alone gives a bound that decides the yes/no question.`,
  trap: `Looking for the exact weights: for a yes/no question a bound is enough. Answering «more data are needed» because neither statement gives the five weights is the typical mistake; it is also a mistake to think that (2) needs (1) just because it mentions an average.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 29 ---------- */
{ n: 29, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel 2025 la società Edilmar ha realizzato investimenti per 90 milioni di euro. Un terzo è stato finanziato con capitale proprio e i restanti due terzi con debito bancario, a un tasso medio del 5%. Per effetto degli oneri finanziari l'utile netto è sceso del 5%, nonostante i ricavi siano cresciuti dell'8%.`,
  claim: `Nel 2025 Edilmar ha finanziato con debito bancario meno di 50 milioni di euro di investimenti.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «Un terzo è stato finanziato con capitale proprio e i restanti due terzi con debito bancario». I due terzi di 90 milioni sono 60 milioni, che non è «meno di 50 milioni»: l'affermazione è contraddetta da un dato deducibile.`,
  trap: `Rispondere «non ricavabile» perché il brano non scrive la cifra in euro del debito: si ricava con una frazione (2/3 · 90 = 60). Il tasso del 5% e il calo dell'utile sono dati che non servono.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 30 ---------- */
{ n: 30, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Un'urna contiene 5 palline rosse e 4 blu. Se ne estraggono 3 senza reinserimento. Il rapporto tra la probabilità di ottenere esattamente 2 rosse e 1 blu e quella di ottenere esattamente 2 blu e 1 rossa vale:`,
  opts: [fr(3, 4), fr(5, 4), fr(12, 9), fr(25, 16)], ans: 2,
  sol: `Il totale dei casi è lo stesso (C(9,3) = 84), quindi il rapporto è quello dei casi favorevoli. 2 rosse e 1 blu: C(5,2) · C(4,1) = 10 · 4 = 40. 2 blu e 1 rossa: C(4,2) · C(5,1) = 6 · 5 = 30. Rapporto 40 ÷ 30 = 4/3 = 12/9.`,
  trap: `Ragionare come se le estrazioni fossero con reinserimento: il rapporto sarebbe (5/9)²(4/9) ÷ (4/9)²(5/9) = 5/4. Le altre esche: il rapporto invertito (3/4) e il suo quadrato (25/16). Il 12/9 è 4/3 non semplificato.`,
  patt: 'Probabilità senza reinserimento' },

/* ---------- 31 ---------- */
{ n: 31, area: 'DI', diff: 'difficile', lang: 'it', asset: tStab(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`Nel turno del pomeriggio lo stabilimento B produce più pezzi di A e di C messi insieme.`,
         `Nel turno del mattino lo stabilimento C produce più di un terzo dei pezzi totali del turno.`,
         `Lo stabilimento B produce di mattina il doppio dei pezzi che produce di notte.`,
         `Di notte gli stabilimenti A e C producono lo stesso numero di pezzi.`], ans: 3,
  sol: `C: 240 pezzi in rapporto 5 : 4 : 3 (12 parti da 20) → 100, 80, 60. Mattina: A + B + C = 300, con A = 120 e C = 100 → B = 80. B: 240 − 80 − 50 = 110 di pomeriggio. Pomeriggio: A + 110 + 80 = 280 → A = 90. A di notte: 270 − 120 − 90 = 60. Tabella completa: A 120, 90, 60; B 80, 110, 50; C 100, 80, 60. Notte: A = C = 60 (vera). Pomeriggio: 110 contro 90 + 80 = 170 (falsa). Mattina: C = 100 su 300 è esattamente un terzo, non «più di» (falsa). B di mattina 80 e di notte 50: 80 non è 100 (falsa).`,
  trap: `Riempire le celle a caso invece di usare i vincoli: il rapporto 5 : 4 : 3 fissa la riga C, i totali di colonna e di riga fissano il resto. L'affermazione sul terzo è costruita sul confine: 100 su 300 è «un terzo», non «più di un terzo».`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 32 ---------- */
{ n: 32, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel 2025 la società Meridiana ha chiuso con una perdita netta di 12 milioni di euro, contro un utile netto di 8 milioni nel 2024. Il management attribuisce due terzi della perdita a svalutazioni di crediti, ritenute non ripetibili, e il restante terzo al calo dei ricavi, scesi del 4% a 300 milioni. Il bilancio prevede per il 2026 ricavi stabili e nessuna nuova svalutazione.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  opts: [`Senza le svalutazioni di crediti la perdita del 2025 sarebbe stata di 4 milioni di euro.`,
         `La perdita del 2025 è dovuta soltanto al calo dei ricavi.`,
         `Le svalutazioni di crediti sono state pari a 12 milioni di euro.`,
         `Nel 2024 i ricavi erano pari a 288 milioni di euro.`], ans: 0,
  sol: `Frase chiave: «due terzi della perdita a svalutazioni di crediti». Due terzi di 12 milioni sono 8 milioni di svalutazioni; togliendole resta una perdita di 12 − 8 = 4 milioni. Le altre: «soltanto» contraddice la ripartizione 2/3 e 1/3; 12 milioni è l'intera perdita, non le sole svalutazioni; se i ricavi sono scesi del 4% a 300, nel 2024 erano 300 ÷ 0,96 = 312,5 milioni, non 288.`,
  trap: `Percentuale con la base sbagliata: 300 · 0,96 = 288 applica il 4% al valore finale invece che a quello iniziale. E l'assoluto «soltanto» tradisce un brano che attribuisce la perdita a due cause.`,
  patt: 'Base della percentuale' },

/* ---------- 33 ---------- */
{ n: 33, area: 'Q', diff: 'media', lang: 'it',
  stem: `Una colonia batterica parte da una sola cellula e raddoppia ogni 20 minuti. Dopo quanto tempo conterà circa un milione di cellule?`,
  opts: ['circa 20 ore', 'circa 10 ore', 'circa 6 ore e 40 minuti', 'circa 3 ore e 20 minuti'], ans: 2,
  sol: `Dopo n raddoppi le cellule sono 2ⁿ. Poiché 2¹⁰ = 1.024 ≈ 1.000, un milione ≈ 1.000 · 1.000 ≈ 2¹⁰ · 2¹⁰ = 2²⁰. Servono circa 20 raddoppi: 20 · 20 minuti = 400 minuti = 6 ore e 40 minuti.`,
  trap: `Fermarsi a 2¹⁰ (circa mille, 3 ore e 20 minuti), oppure confondersi con le potenze: 2³⁰ ≈ un miliardo (10 ore) e (2¹⁰)⁶ = 2⁶⁰ (20 ore) se si scambia 10⁶ con «10 alla sesta volte» invece di (10³)².`,
  patt: 'Crescita esponenziale' },

/* ---------- 34 ---------- */
{ n: 34, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds(`Tra i clienti di un'agenzia viaggi, quale percentuale ha prenotato almeno uno dei due servizi, volo o hotel?`,
    `Il 40% dei clienti ha prenotato un volo e, tra questi, il 25% ha prenotato anche l'hotel.`,
    `Il 30% dei clienti ha prenotato l'hotel.`),
  ...dsq('CBAD', 'B'),
  sol: `Insiemi sovrapposti: almeno uno = volo + hotel − entrambi. Dalla (1): volo 40% e, tra questi, il 25% anche hotel, cioè entrambi = 25% di 40% = 10% dei clienti; l'hotel in totale però è ignoto. Dalla (2): hotel 30%, ma non si sa quanti abbiano anche il volo. Insieme: 40% + 30% − 10% = 60%.`,
  trap: `Leggere «25%» come 25% di tutti i clienti (invece di 25% del 40%) oppure sommare 40% + 30% = 70% dimenticando di togliere chi ha prenotato entrambi. Nessuna delle due affermazioni basta da sola: la prima non dà l'hotel, la seconda non dà la sovrapposizione.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 35 ---------- */
{ n: 35, area: 'V', diff: 'media', lang: 'it',
  passage: `Un'analisi su 400 imprese manifatturiere rileva che quelle che pubblicano un bilancio di sostenibilità hanno margini operativi in media più alti delle altre. Un consulente ne conclude che pubblicare il bilancio di sostenibilità fa aumentare i margini.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione del consulente?`,
  opts: [`Molti clienti dichiarano di preferire le imprese che pubblicano un bilancio di sostenibilità.`,
         `Le imprese analizzate operano in sei diversi settori manifatturieri.`,
         `Il bilancio di sostenibilità viene pubblicato di solito nel mese di giugno.`,
         `Redigere e certificare un bilancio di sostenibilità ha un costo elevato, che solo le imprese con margini già alti possono permettersi.`], ans: 3,
  sol: `Il consulente suppone che la pubblicazione causi i margini alti. Se solo le imprese con margini già alti possono permettersi il bilancio, la causalità è invertita: i margini alti portano al bilancio, e la correlazione resta senza che il bilancio faccia aumentare nulla.`,
  trap: `Scegliere il gradimento dei clienti: rafforza la conclusione, non la indebolisce. La correlazione tra due fenomeni può dipendere dal verso opposto del nesso: qui è la causalità inversa.`,
  patt: 'Cause alternative' },

/* ---------- 36 ---------- */
{ n: 36, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Una boa galleggiante è fissata al fondale con una catena lunga e lenta, che la lascia libera di salire. La luce che la sormonta sta 40 cm sopra il pelo dell'acqua. A causa della marea il livello dell'acqua sale di 15 cm all'ora. Dopo quante ore la luce sarà sott'acqua?`,
  opts: ['Dopo 2 ore e 40 minuti', 'Dopo 3 ore', 'Mai', 'Non è possibile determinarlo con i dati forniti'], ans: 2,
  sol: `La boa galleggia: sale insieme all'acqua, quindi la distanza tra la luce e il pelo dell'acqua resta sempre di 40 cm. La luce non andrà mai sott'acqua.`,
  trap: `Calcolare 40 ÷ 15 ≈ 2 ore e 40 minuti come se la boa fosse ferma (3 ore se si arrotonda per eccesso). «Non determinabile» attira chi pensa che manchi la lunghezza della catena: ma la catena è lunga e lenta, quindi non trattiene la boa.`,
  patt: 'Ragionamento laterale' },

/* ---------- 37 ---------- */
{ n: 37, area: 'DI', diff: 'difficile', lang: 'it', asset: gVendite(),
  stem: `Qual è la variazione percentuale delle vendite per addetto tra gennaio e giugno?`,
  opts: ['+35%', '+8%', '0%', '−10%'], ans: 3,
  sol: `Serie delle vendite (mila €): gennaio 200; febbraio 200 · 1,25 = 250; marzo 250 · 0,8 = 200; aprile 200 · 1,2 = 240; maggio 240 · 0,75 = 180; giugno 180 · 1,5 = 270. Addetti: 8 a gennaio, 12 a giugno (8 + 2 + 2). Vendite per addetto: 200 ÷ 8 = 25 a gennaio, 270 ÷ 12 = 22,5 a giugno; 22,5 ÷ 25 = 0,9, cioè −10%.`,
  trap: `Sommare le variazioni mensili (+25 − 20 + 20 − 25 + 50 = +50%): le vendite sembrerebbero +50%, gli addetti sono +50% (da 8 a 12) e la variazione per addetto «0%». Altre esche: fermarsi alle vendite totali (270 ÷ 200 = +35%) o usare gli addetti di marzo (270 ÷ 10 = 27, cioè +8%). Variazioni percentuali successive si moltiplicano, non si sommano.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 38 ---------- */
{ n: 38, area: 'V', diff: 'media', lang: 'en',
  passage: `In a survey of 800 employees, 35% said that they work remotely at least two days a week. Of these, 60% said that they are satisfied with their work-life balance.`,
  claim: `At least 150 of the employees surveyed work remotely at least two days a week and are satisfied with their work-life balance.`,
  opts: VFN_EN, ans: 2,
  sol: `Key sentences: «35% said that they work remotely at least two days a week» and «Of these, 60% … satisfied». 35% of 800 = 280 employees work remotely at least two days a week; 60% of 280 = 168 are also satisfied. Since 168 ≥ 150, the claim is true.`,
  trap: `Answering «cannot be determined» because the passage says nothing about the other 520 employees or does not state the number outright: the claim is only about the remote workers who are satisfied, and 168 can be computed. Applying 60% to all 800 would give 480.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 39 ---------- */
{ n: 39, area: 'Q', diff: 'media', lang: 'en',
  stem: `Elena's gross salary rises by 10%. At the same time, the deductions (tax and social contributions) go from 20% to 25% of her gross salary. Approximately how does her net salary change?`,
  opts: ['about −6%', 'about +3%', 'about +5%', 'about +10%'], ans: 1,
  sol: `Net salary = gross × (1 − deduction rate). Before: 0.80 × G. After: 0.75 × 1.10 G = 0.825 G. Ratio: 0.825 ÷ 0.80 = 1.03125, i.e. about +3%.`,
  trap: `Subtracting percentages: +10% − 5 percentage points = +5%. Or looking only at the deductions (0.75 ÷ 0.80 ≈ −6%) or only at the raise (+10%). The 5 points are a change in the rate of deduction, which applies to a different base (the new gross salary).`,
  patt: 'Percentuali composte' },

/* ---------- 40 ---------- */
{ n: 40, area: 'Q', diff: 'media', lang: 'it',
  stem: `Sei amici cenano insieme. Il conto comprende: coperto di 2 € a persona; antipasti per 30 €; sei secondi da 15 € l'uno; una bottiglia di vino da 20 €, bevuta da cinque di loro (uno non beve alcolici); il caffè, offerto dalla casa (a listino costerebbe 1,50 € a persona). Il servizio del 10% si applica soltanto ad antipasti e secondi. Tutto, tranne il vino, è diviso in parti uguali tra i sei; il vino è diviso solo tra i cinque che lo hanno bevuto. Quanto paga ciascuno di quelli che hanno bevuto il vino?`,
  opts: ['28 €', 'circa 27 €', '26 €', '24 €'], ans: 0,
  sol: `Coperti: 6 · 2 = 12 €. Antipasti e secondi: 30 + 6 · 15 = 120 €; servizio 10% di 120 = 12 €. Parte comune: 12 + 120 + 12 = 144 €, cioè 24 € a testa. Vino: 20 ÷ 5 = 4 € in più per chi lo ha bevuto: 24 + 4 = 28 €. (Il caffè offerto è un dato superfluo.)`,
  trap: `24 € è la quota di chi non ha bevuto; 26 € dimentica il servizio ((12 + 120) ÷ 6 + 4); «circa 27 €» è il conto totale (164 €) diviso in sei parti uguali, senza distinguere chi ha bevuto il vino. Il caffè offerto non entra nel conto.`,
  patt: 'Dati superflui e quote' },

/* ---------- 41 ---------- */
{ n: 41, area: 'DI', diff: 'media', lang: 'it',
  asset: dp([
    `Un negozio ha quattro addetti.`,
    `Gli addetti lavorano un numero intero di ore settimanali, tutte diverse tra loro.`,
    `Nessuno lavora meno di 20 né più di 40 ore a settimana.`,
    `In media gli addetti lavorano 30 ore a settimana.`
  ], [
    `A. L'addetto che lavora di più lavora almeno 32 ore.`,
    `B. L'addetto che lavora di meno lavora al massimo 27 ore.`,
    `C. Almeno un addetto lavora esattamente 30 ore.`,
    `D. I due addetti che lavorano di più lavorano insieme almeno 63 ore.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo la B', 'Sia la A sia la D', 'Solo la A', 'Sia la C sia la D'], ans: 1,
  sol: `Quattro interi distinti a < b < c < d con somma 4 · 30 = 120. A: se d fosse al massimo 31, la somma sarebbe al massimo 31 + 30 + 29 + 28 = 118 < 120: quindi d ≥ 32, vera. D: se a + b fosse almeno 58, allora b ≥ 30, c ≥ 31 e d ≥ 32 e la somma sarebbe almeno 58 + 31 + 32 = 121 > 120; dunque a + b ≤ 57 e c + d ≥ 63, vera. B: (28, 29, 31, 32) somma 120 con il minimo a 28: non sicura. C: (28, 29, 31, 32) non contiene 30: non sicura.`,
  trap: `Pensare che la media 30 obblighi qualcuno a lavorare esattamente 30 ore (C): una media non è un valore presente. Per B e D basta cercare una quaterna che le smentisce o capire il limite: «almeno 63» è il confine esatto, 64 non sarebbe più sicuro.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 42 ---------- */
{ n: 42, area: 'Q', diff: 'media', lang: 'it',
  stem: `Da 7 candidati se ne scelgono 3 per formare un comitato; due di essi, Anna e Bruno, non vogliono far parte dello stesso comitato. Poi ai tre componenti si assegnano tre ruoli diversi (presidente, vicepresidente, tesoriere). In quanti modi si può formare il comitato e, una volta formato, in quanti modi si possono assegnare i ruoli?`,
  opts: ['35; 6', '25; 6', '30; 3', '30; 6'], ans: 3,
  sol: `Comitati senza vincolo: C(7,3) = 35. Quelli che contengono sia Anna sia Bruno: il terzo membro si sceglie tra gli altri 5, quindi 5 comitati. Comitati ammessi: 35 − 5 = 30. Ruoli: 3! = 6 modi.`,
  trap: `Dimenticare il vincolo (35; 6); togliere due volte i comitati con Anna e Bruno (35 − 2 · 5 = 25); contare 3 invece di 3! assegnazioni dei ruoli (30; 3). Le due risposte sono di natura diversa: combinazioni per il comitato, permutazioni per i ruoli.`,
  patt: 'Combinazioni vs permutazioni' },

/* ---------- 43 ---------- */
{ n: 43, area: 'V', diff: 'media', lang: 'it',
  passage: `Tra luglio 2022 e settembre 2023 la banca centrale ha alzato dieci volte i tassi di riferimento, portandoli dallo 0% al 4,5%. Nello stesso periodo il tasso medio sui nuovi mutui a tasso variabile è salito dal 2,1% al 5,6%, quello sui mutui a tasso fisso dal 2,8% al 4,9%. Nel 2023 le erogazioni di nuovi mutui sono diminuite del 25% rispetto al 2022, mentre le surroghe (il trasferimento di un mutuo già in corso a un'altra banca, in cerca di condizioni migliori) sono aumentate del 40%. La banca centrale ha cominciato a ridurre i tassi nel giugno 2024.`,
  stem: `Quale delle seguenti affermazioni si può ricavare con certezza dal brano?`,
  opts: [`Tra luglio 2022 e settembre 2023 il tasso sui nuovi mutui variabili è salito, in punti percentuali, più di quello sui mutui fissi.`,
         `Nel 2023 le surroghe sono diminuite del 40% rispetto al 2022.`,
         `La banca centrale ha ridotto i tassi già nel giugno 2023.`,
         `Le erogazioni di nuovi mutui sono calate perché le surroghe sono aumentate del 40%.`], ans: 0,
  sol: `Frase chiave: «variabile … dal 2,1% al 5,6%, … fisso dal 2,8% al 4,9%». Variabile: +3,5 punti; fisso: +2,1 punti; il variabile è salito di più. Le altre: «aumentate del 40%» smentisce la diminuzione (percentuale invertita); la riduzione dei tassi inizia nel giugno 2024, non 2023 (data spostata); il brano non lega il calo delle erogazioni alle surroghe (causa inventata).`,
  trap: `Quattro esche classiche in un solo brano: percentuale invertita (+40% → −40%), data spostata (2024 → 2023), nesso causale non scritto (erogazioni e surroghe sono solo due fatti dello stesso anno). La risposta giusta si ricava con una sottrazione e non nomina cause.`,
  patt: 'Periodo o ambito spostato' },

/* ---------- 44 ---------- */
{ n: 44, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Gli interi a e b hanno prodotto 12. Quanto vale a + b?',
    'La differenza a − b è uguale a 1.',
    'a è maggiore di 0.'),
  ...dsq('ACBD', 'B'),
  sol: `Il prodotto è positivo, quindi a e b hanno lo stesso segno e possono essere entrambi negativi. (1): a − b = 1 e ab = 12 → (a, b) = (4, 3) oppure (−3, −4): a + b vale 7 o −7. (2): a > 0 lascia molte coppie (1·12, 2·6, 3·4 e così via). Insieme: a > 0 elimina (−3, −4); resta (4, 3) e a + b = 7.`,
  trap: `Dimenticare che gli interi possono essere negativi: con prodotto positivo vanno bene anche due numeri negativi. La (1) sembra bastare («si trova 4 e 3») ma ha una seconda soluzione, (−3, −4).`,
  patt: 'Sufficienza dei dati' },

/* ---------- 45 ---------- */
{ n: 45, area: 'Q', diff: 'media', lang: 'it',
  stem: `Una cassa contiene 40 monete, tutte da 1 €, da 2 € o da 5 €, per un valore totale di 100 €. Le monete da 2 € sono il doppio di quelle da 5 €. Quanti euro sono in monete da 2 €?`,
  opts: ['50 €', '40 €', '20 €', '10 €'], ans: 1,
  sol: `Sia k il numero delle monete da 5 €: quelle da 2 € sono 2k e quelle da 1 € sono 40 − 3k. Valore: (40 − 3k) + 2 · 2k + 5k = 40 + 6k = 100, quindi k = 10. Le monete da 2 € sono 20 e valgono 40 €.`,
  trap: `Rispondere con il numero di monete da 2 € (20) invece che con il loro valore in euro; il 10 è il numero di monete da 5 € (e da 1 €), il 50 è il valore delle monete da 5 €. Dopo aver risolto il sistema bisogna leggere cosa chiede la domanda.`,
  patt: 'Sistemi a parole' },

/* ---------- 46 ---------- */
{ n: 46, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Una banca ha offerto un corso gratuito di educazione finanziaria ai titolari di piccole imprese. Dei 900 titolari iscritti, 500 hanno concluso il corso; tra questi l'80% dichiara di gestire meglio la liquidità rispetto a prima del corso. La banca conclude che il corso migliora la gestione della liquidità delle piccole imprese.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione della banca?`,
  opts: [`Il corso dura quattro settimane e si tiene in orario serale.`,
         `Il 20% dei titolari che hanno concluso il corso dichiara che la gestione della liquidità non è cambiata.`,
         `In Italia le piccole imprese sono più di quattro milioni.`,
         `Chi ha abbandonato il corso lo ha fatto soprattutto perché la propria impresa attraversava già gravi difficoltà di liquidità.`], ans: 3,
  sol: `L'80% è calcolato solo su chi ha concluso il corso (500 su 900). Se i 400 che hanno abbandonato erano soprattutto imprese già in difficoltà, il campione è selezionato: chi è rimasto era già messo meglio, e il miglioramento può non dipendere dal corso. Il 20% è l'altra faccia dell'80%; durata e numero di imprese non toccano il nesso.`,
  trap: `Scegliere il 20% di «non cambiato»: sembra negativo ma è lo stesso dato già incluso nell'80%. Il ragionamento della banca generalizza da un campione autoselezionato (selezione), un punto debole diverso da una causa alternativa vera e propria.`,
  patt: 'Cause alternative' },

/* ---------- 47 ---------- */
{ n: 47, area: 'DI', diff: 'media', lang: 'it',
  asset: dp([
    `Un circolo ha 40 soci, di cui 30 iscritti da più di un anno.`,
    `Possono partecipare al torneo sociale unicamente i soci iscritti da più di un anno.`,
    `Al torneo partecipano 12 soci.`
  ], [
    `A. Se un socio è iscritto da più di un anno, allora partecipa al torneo.`,
    `B. Tra i soci che non partecipano al torneo, almeno 18 sono iscritti da più di un anno.`,
    `C. Almeno un socio iscritto da meno di un anno partecipa al torneo.`,
    `D. I partecipanti al torneo sono meno della metà dei soci iscritti da più di un anno.`
  ]),
  stem: `In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Sia la A sia la C', 'Solo la A', 'Solo la C', 'Sia la B sia la D'], ans: 0,
  sol: `«Unicamente» significa che i 12 partecipanti sono tutti iscritti da più di un anno. I soci con più di un anno sono 30, quindi 30 − 12 = 18 di loro non partecipano. A: l'implicazione inversa non vale (18 soci anziani non partecipano): sicuramente falsa. B: i non partecipanti con più di un anno sono esattamente 18, quindi «almeno 18» è vera. C: nessun socio con meno di un anno può partecipare: sicuramente falsa. D: 12 è meno di 15, la metà di 30: vera.`,
  trap: `Con la consegna «sicuramente false» si rischia di indicare B e D, cioè le vere. E «unicamente» non è biunivoco: tutti i partecipanti sono anziani, ma non tutti gli anziani partecipano (implicazione inversa).`,
  patt: 'Consegna: sicuramente falsa' },

/* ---------- 48 ---------- */
{ n: 48, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un numero intero positivo n minore di 50, diviso per 3, dà resto 2 e, diviso per 5, dà resto 4. Quanto vale n?`,
  opts: ['14', '29', '44', 'Il valore di n non è unico'], ans: 3,
  sol: `Resto 2 su 3 e resto 4 su 5 significano che n + 1 è multiplo sia di 3 sia di 5, quindi di 15: n = 15k − 1, cioè 14, 29, 44 (sotto 50). Ci sono tre valori: n non è determinato in modo unico.`,
  trap: `Fermarsi al primo valore trovato (14) o al più «comodo». Con il limite superiore 50 le soluzioni sono tre, quindi nessuna delle prime tre risposte descrive l'unico valore di n.`,
  patt: 'Resti e congruenze' },

/* ---------- 49 ---------- */
{ n: 49, area: 'Q', diff: 'facile', lang: 'it',
  stem: `L'età media dei soci di un circolo è di 40 anni. Quando si iscrive un nuovo socio, l'età media sale a 41 anni. Quanti anni ha il nuovo socio?`,
  opts: ['41 anni', '42 anni', '81 anni', 'Non è possibile determinarlo con i dati forniti'], ans: 3,
  sol: `Con n soci iniziali la somma delle età è 40n; con il nuovo socio di età x diventa 40n + x = 41(n + 1), quindi x = 41 + n. L'età dipende dal numero n di soci, che non è dato: non è determinabile (con 10 soci sarebbe 51, con 40 sarebbe 81).`,
  trap: `Rispondere con un numero «ragionevole»: 41 è la nuova media, non l'età; 42 vale solo se i soci iniziali sono 1; 81 solo se sono 40. Senza il numero di soci il problema è indeterminato.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 50 ---------- */
{ n: 50, area: 'V', diff: 'media', lang: 'it',
  passage: `Il ristorante «Da Gino» ha chiuso il 2025 con un fatturato di 540.000 €, il 12% in più rispetto al 2024. Il titolare afferma: «Abbiamo reagito alla crisi dei consumi meglio di tutti gli altri locali della zona».`,
  stem: `Quale dei seguenti fattori, se noto, influirebbe maggiormente sulla correttezza dell'affermazione del titolare?`,
  opts: [`Il numero di dipendenti di «Da Gino».`,
         `Il valore assoluto del fatturato 2025 degli altri locali della zona.`,
         `L'andamento del fatturato 2025 rispetto al 2024 di ciascun altro locale della zona.`,
         `L'andamento dei consumi delle famiglie italiane nel 2025.`], ans: 2,
  sol: `La parola chiave è «reagito meglio di tutti gli altri»: serve confrontare la crescita di «Da Gino» (+12%) con quella di ciascun altro locale. Basta un locale cresciuto più del 12% per smentire il titolare. Il valore assoluto del fatturato degli altri misura la dimensione, non la reazione alla crisi.`,
  trap: `Scegliere il livello (fatturato assoluto) invece della variazione: «reagire meglio» riguarda la crescita, non chi incassa di più. Il quadro dei consumi in Italia è contesto: non permette di verificare il confronto con gli altri locali.`,
  patt: 'Parola chiave dell\'affermazione' }
];

return {
  id: '14',
  title: 'Mock 14',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Calibrato sulla difficoltà del test ufficiale: domande a più passaggi, opzioni-esca mascherate (formule, frazioni, «non determinabile», «nessuna delle altre»), sufficienza dei dati con criteri A–D rimescolati, tabelle con percentuali di riga e celle mancanti, brani economici con numeri.',
  questions: QUESTIONS,
  data: DATA
};
});
