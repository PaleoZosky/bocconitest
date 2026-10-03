/* =======================================================================
   Mock 13 — 50 domande nuove (18 Q, 16 V, 16 DI).
   Pensato per il punto debole (Data Insights) e per i cinque pattern
   d'errore: Falso vs Non deducibile, Rapporti vs valori assoluti,
   Cause alternative, Media ponderata vs semplice, Sufficienza dei dati.

   Tutti i numeri dei grafici e delle tabelle stanno in DATA e sono
   riusati da tools/check-math-13.js per ricalcolare le risposte.
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

const VFN = C.VFN;
const VFN_EN = C.VFN_EN;
const DSOPTS = C.DSOPTS;
const DSOPTS_EN = C.DSOPTS_EN;
const ds = C.ds;

/* ============================== DATI ============================== */
const DATA = {
  /* n.5 — acquisti online per canale: visitatori, % che mette nel carrello, % di questi che acquista */
  canali: [
    { c: 'Sito',   v: 8000,  car: 25, acq: 50 },
    { c: 'App',    v: 2000,  car: 50, acq: 60 },
    { c: 'Social', v: 10000, car: 10, acq: 40 }
  ],
  /* n.8 — ordini di un negozio (migliaia), online e in negozio */
  ordini: { anni: [2021, 2022, 2023, 2024, 2025], online: [20, 32, 40, 52, 60], negozio: [60, 52, 56, 54, 50] },
  /* n.14 — visitatori di una mostra per fascia d'età */
  eta: { classi: ['15–24', '25–34', '35–44', '45–54', '55–64'], n: [12, 28, 35, 15, 10] },
  /* n.17 — due ambulatori: pazienti trattati e recuperi completi, 2024 e 2025 */
  ambulatori: [
    { a: 'A', t24: 400, r24: 320, t25: 100, r25: 90 },
    { a: 'B', t24: 100, r24: 20,  t25: 400, r25: 100 }
  ],
  /* n.20 — fatturato (milioni di €); l'asse parte da 70 */
  fatturato: { anni: [2022, 2023, 2024, 2025], v: [80, 85, 90, 100], asseDa: 70, asseA: 110 },
  /* n.26 — variazione mensile degli abbonati (migliaia); a inizio gennaio erano 120 */
  abbonati: { mesi: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'], var: [8, -3, 5, -6, -4, 10], inizio: 120 },
  /* n.29 — tre hotel */
  hotel: [
    { h: 'Alba',   camere: 120, occ: 75, tariffa: 80 },
    { h: 'Brezza', camere: 80,  occ: 90, tariffa: 100 },
    { h: 'Cielo',  camere: 100, occ: 70, tariffa: 95 }
  ],
  /* n.35 — partecipanti a un workshop: celle note (null = dato non riportato) */
  workshop: {
    studenti:      { mattina: 20,   pomeriggio: null, tot: 90 },
    professionisti:{ mattina: null, pomeriggio: null, tot: null },
    tot:           { mattina: 50,   pomeriggio: 100,  tot: 150 }
  },
  /* n.41 — progetto: durata (giorni) e attività che devono finire prima */
  progetto: [
    { a: 'A', d: 3, dopo: [] },
    { a: 'B', d: 4, dopo: [] },
    { a: 'C', d: 2, dopo: ['A'] },
    { a: 'D', d: 5, dopo: ['A', 'B'] },
    { a: 'E', d: 3, dopo: ['C', 'D'] }
  ]
};

/* ======================= tabelle e grafici ======================= */
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function tCanali() {
  return C.table({
    caption: 'Acquisti online per canale di arrivo',
    head: ['Canale', 'Visitatori', 'Mettono nel carrello (% dei visitatori)', 'Acquistano (% di chi ha messo nel carrello)'],
    rows: DATA.canali.map(c => [c.c, fmt(c.v), c.car + '%', c.acq + '%'])
  });
}

function gOrdini() {
  const D = DATA.ordini;
  const W = 520, H = 280, L = 40, R = 30, T = 20, B = 32, lo = 0, hi = 70;
  const x = i => L + (W - L - R) * i / 4;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  let g = '';
  for (let t = 0; t <= 60; t += 20) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  D.anni.forEach((yr, i) => { g += `<text x="${x(i)}" y="${H - 8}" class="tick" text-anchor="middle">${yr}</text>`; });
  const line = (arr, c, dash) => `<polyline points="${arr.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" style="stroke:var(--${c})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${dash ? ' stroke-dasharray="6 4"' : ''}></polyline>`;
  const dots = (arr, c, name) => arr.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"><title>${name}, ${D.anni[i]}: ${v}</title></circle>`).join('');
  g += line(D.online, 's1') + line(D.negozio, 's2', true) + dots(D.online, 's1', 'Online') + dots(D.negozio, 's2', 'In negozio');
  D.anni.forEach((yr, i) => {
    const sopraOnline = D.online[i] > D.negozio[i];
    g += `<text x="${x(i)}" y="${y(D.online[i]) + (sopraOnline ? -11 : 19)}" class="val" text-anchor="middle">${D.online[i]}</text>`;
    g += `<text x="${x(i)}" y="${y(D.negozio[i]) + (sopraOnline ? 19 : -11)}" class="val" text-anchor="middle">${D.negozio[i]}</text>`;
  });
  return `<figure class="fig"><figcaption>Ordini di un negozio, in migliaia</figcaption>
<ul class="legend"><li><i class="sw line" style="background:var(--s1)"></i>Ordini online</li><li><i class="sw line" style="background:var(--s2)"></i>Ordini in negozio</li></ul>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Due linee dal 2021 al 2025, ordini in migliaia. Online: ${D.online.join(', ')}. In negozio: ${D.negozio.join(', ')}.">${g}</svg></div></figure>`;
}

function gEta() {
  const D = DATA.eta;
  return `<figure class="fig"><figcaption>Visitatori intervistati all'uscita di una mostra, per fascia d'età</figcaption>` + C.bars({
    labels: D.classi,
    series: [{ name: 'Visitatori', values: D.n, style: 'fill' }],
    W: 440, H: 230, max: 40,
    aria: 'Numero di visitatori per fascia d\'età: ' + D.classi.map((c, i) => c + ' anni: ' + D.n[i]).join(', ') + '.'
  }) + `<p class="fig-note">Ogni fascia comprende gli estremi: «15–24» indica le persone da 15 a 24 anni compiuti.</p></figure>`;
}

function tAmbulatori() {
  return C.table({
    caption: 'Pazienti trattati e pazienti con recupero completo in due ambulatori',
    head: ['Ambulatorio', 'Trattati 2024', 'Recuperi 2024', 'Trattati 2025', 'Recuperi 2025'],
    rows: DATA.ambulatori.map(a => [a.a, a.t24, a.r24, a.t25, a.r25])
  });
}

function gFatturato() {
  const D = DATA.fatturato;
  const W = 460, H = 270, L = 44, R = 14, T = 22, B = 34, lo = D.asseDa, hi = D.asseA;
  const base = H - B, y = v => T + (H - T - B) * (hi - v) / (hi - lo), band = (W - L - R) / D.anni.length, bw = 56;
  let g = '';
  for (let t = lo; t <= hi; t += 10) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === lo ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 7}" y="${y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  D.anni.forEach((a, i) => {
    const x = L + band * i + (band - bw) / 2, v = D.v[i];
    g += `<rect x="${x}" y="${y(v)}" width="${bw}" height="${base - y(v)}" style="fill:var(--s1)"><title>${a}: ${v}</title></rect>`;
    g += `<text x="${x + bw / 2}" y="${y(v) - 7}" class="val" text-anchor="middle">${v}</text>`;
    g += `<text x="${x + bw / 2}" y="${H - 10}" class="lab" text-anchor="middle">${a}</text>`;
  });
  return `<figure class="fig"><figcaption>Fatturato di un'azienda, in milioni di €</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Colonne del fatturato in milioni di euro, con asse verticale che parte da ${lo}. ${D.anni.map((a, i) => a + ': ' + D.v[i]).join(', ')}.">${g}</svg></div></figure>`;
}

function gAbbonati() {
  const D = DATA.abbonati;
  const W = 480, H = 280, L = 44, R = 14, T = 24, B = 34, lo = -8, hi = 12, bw = 44;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  const band = (W - L - R) / D.mesi.length;
  let g = '';
  for (let t = -8; t <= 12; t += 4) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t > 0 ? '+' : t < 0 ? '−' : ''}${Math.abs(t)}</text>`;
  }
  D.var.forEach((p, i) => {
    const x = L + band * i + (band - bw) / 2, pos = p >= 0;
    const y0 = pos ? y(p) : y(0), h = Math.abs(y(p) - y(0));
    g += `<rect x="${x}" y="${y0}" width="${bw}" height="${h}" style="fill:var(--${pos ? 's1' : 's2'})"><title>${D.mesi[i]}: ${pos ? '+' : '−'}${Math.abs(p)}</title></rect>`;
    g += `<text x="${x + bw / 2}" y="${pos ? y0 - 7 : y0 + h + 15}" class="val" text-anchor="middle">${pos ? '+' : '−'}${Math.abs(p)}</text>`;
    g += `<text x="${x + bw / 2}" y="${H - 10}" class="lab" text-anchor="middle">${D.mesi[i]}</text>`;
  });
  return `<figure class="fig"><figcaption>Abbonati a una rivista: variazione rispetto al mese precedente, in migliaia</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Colonne con la variazione mensile degli abbonati in migliaia. ${D.mesi.map((m, i) => m + ': ' + (D.var[i] > 0 ? '+' : '−') + Math.abs(D.var[i])).join(', ')}.">${g}</svg></div>
<p class="fig-note">All'inizio di gennaio gli abbonati erano ${D.inizio} mila.</p></figure>`;
}

function tHotel() {
  return C.table({
    caption: 'Tre hotel in una giornata tipo',
    head: ['Hotel', 'Camere', 'Occupazione (% delle camere)', 'Tariffa per camera occupata (€)'],
    rows: DATA.hotel.map(h => [h.h, h.camere, h.occ + '%', h.tariffa])
  });
}

function tWorkshop() {
  const W = DATA.workshop, c = v => v === null ? '?' : v;
  return C.table({
    caption: 'Partecipanti a un workshop, per tipo di partecipante e turno',
    head: ['', 'Turno del mattino', 'Turno del pomeriggio', 'Totale'],
    rows: [
      ['Studenti', c(W.studenti.mattina), c(W.studenti.pomeriggio), c(W.studenti.tot)],
      ['Professionisti', c(W.professionisti.mattina), c(W.professionisti.pomeriggio), c(W.professionisti.tot)],
      ['Totale', c(W.tot.mattina), c(W.tot.pomeriggio), c(W.tot.tot)]
    ]
  }) + `<p class="fig-note">Il punto interrogativo indica un dato non riportato. Ogni partecipante frequenta un solo turno.</p>`;
}

function tProgetto() {
  return C.table({
    caption: 'Attività di un piccolo progetto',
    head: ['Attività', 'Durata (giorni)', 'Può iniziare solo dopo la fine di'],
    rows: DATA.progetto.map(p => [p.a, p.d, p.dopo.length ? p.dopo.join(' e ') : '—'])
  }) + `<p class="fig-note">Le attività senza vincoli iniziano il primo giorno; attività indipendenti possono procedere in parallelo, senza limiti di personale.</p>`;
}

function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

/* ======================= LE 50 DOMANDE ======================= */
const QUESTIONS = [

/* ---------- 1 ---------- */
{ n: 1, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Una palestra ha 50 abbonati mensili, che pagano 40 € al mese, e 150 abbonati annuali, che pagano 288 € all'anno in un'unica soluzione. Qual è la quota mensile media pagata per abbonato?`,
  opts: ['28 €', '30 €', '32 €', '36 €'], ans: 0,
  sol: `Un abbonato annuale paga 288 ÷ 12 = 24 € al mese. Incasso mensile: 50 · 40 + 150 · 24 = 2.000 + 3.600 = 5.600 €. Abbonati: 200. Quota media: 5.600 ÷ 200 = 28 €.`,
  trap: `Fare la media semplice delle due quote mensili, (40 + 24) ÷ 2 = 32 €: gli abbonati annuali sono il triplo di quelli mensili, quindi la media sta più vicina a 24 che a 40. Attenzione anche all'unità: 288 € sono una quota annuale.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 2 ---------- */
{ n: 2, area: 'V', diff: 'media', lang: 'it',
  passage: `Il vivaio «Le Querce» vende solo tre tipi di piante: aromatiche, da frutto e ornamentali. Nel 2025 le aromatiche hanno rappresentato il 30% delle piante vendute e le piante da frutto il doppio delle aromatiche.`,
  claim: `Nel 2025 le piante ornamentali sono state meno del 10% delle piante vendute.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: «solo tre tipi», «aromatiche 30%», «le piante da frutto il doppio». Da frutto: 60%. Aromatiche + da frutto = 90%, quindi le ornamentali sono il 100% − 90% = 10% esatto. «Meno del 10%» è contraddetto.`,
  trap: `Rispondere «Non deducibile» perché il testo non dà i numeri di piante vendute: bastano le percentuali. O rispondere «Vera» arrotondando: 10% non è «meno del 10%».`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 3 ---------- */
{ n: 3, area: 'DI', diff: 'facile', lang: 'it', ds: true,
  stem: ds('Quanti biglietti ha venduto un cinema sabato sera?',
    'Il 40% dei biglietti era a prezzo ridotto.',
    'I biglietti a prezzo intero sono stati 90.'),
  opts: DSOPTS, ans: 2,
  sol: `Dalla (1) da sola si conosce solo una quota; dalla (2) da sola solo un numero parziale. Insieme: i biglietti a prezzo intero sono il 60% del totale, quindi 90 ÷ 0,60 = 150.`,
  trap: `Pensare che la (2) basti perché contiene un numero, o che basti la (1) perché «dà la percentuale»: serve un valore assoluto collegato alla quota.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 4 ---------- */
{ n: 4, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Si lancia tre volte una moneta equa. Qual è la probabilità di ottenere almeno due teste?`,
  opts: [fr(1, 8), fr(1, 4), fr(3, 8), fr(1, 2)], ans: 3,
  sol: `Gli esiti possibili sono 2 · 2 · 2 = 8. Quelli con almeno due teste: esattamente due teste (TTC, TCT, CTT) e tre teste (TTT), cioè 4. Probabilità: ${fr(4, 8)} = ${fr(1, 2)}.`,
  trap: `Contare solo i casi con esattamente due teste (3 su 8): «almeno due» comprende anche i tre lanci con testa.`,
  patt: 'Probabilità e combinatoria' },

/* ---------- 5 ---------- */
{ n: 5, area: 'DI', diff: 'media', lang: 'it', asset: tCanali(),
  stem: `Quale percentuale di tutti i visitatori dei tre canali completa un acquisto?`,
  opts: ['4%', '8%', '10%', '15,5%'], ans: 2,
  sol: `Acquisti: Sito 8.000 · 25% · 50% = 1.000; App 2.000 · 50% · 60% = 600; Social 10.000 · 10% · 40% = 400. Totale 2.000 acquisti su 20.000 visitatori: 10%.`,
  trap: `Calcolare la quota di acquirenti sui visitatori di ciascun canale (12,5%, 30%, 4%) e farne la media semplice, circa 15,5%: i canali hanno visitatori molto diversi, quindi serve la media ponderata. Attenzione anche alla seconda percentuale: si applica a chi ha messo nel carrello, non a tutti i visitatori.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 6 ---------- */
{ n: 6, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel marzo scorso un call center ha introdotto una pausa di 10 minuti ogni ora per gli operatori. Nei tre mesi successivi il numero medio di chiamate gestite da ciascun operatore è aumentato del 12%. La direzione conclude che le pause hanno reso gli operatori più produttivi.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione della direzione?`,
  opts: [`Nel trimestre corrispondente dell'anno precedente, quando le pause non c'erano, il numero medio di chiamate per operatore era aumentato anch'esso del 12%.`,
         `Molti operatori dichiarano di sentirsi meno stressati dopo le pause.`,
         `Le pause sono state introdotte in tutte le sedi del call center.`,
         `Il numero di operatori è rimasto invariato nei tre mesi.`], ans: 0,
  sol: `Se lo stesso aumento del 12% si era già verificato nello stesso trimestre dell'anno prima, senza pause, la crescita delle chiamate è un andamento stagionale: è una spiegazione alternativa che non dipende dalle pause. Le altre opzioni sono irrilevanti oppure (B, D) vanno nella direzione della direzione.`,
  trap: `Scegliere un'opzione che «sembra negativa» per le pause: qui conta una spiegazione diversa dello stesso aumento, che si presenta anche quando le pause non ci sono.`,
  patt: 'Cause alternative' },

/* ---------- 7 ---------- */
{ n: 7, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Un negozio acquista un articolo a 60 €. Vuole venderlo con uno sconto del 25% sul prezzo di listino e guadagnare comunque il 20% del prezzo di vendita. Qual è il prezzo di listino?`,
  opts: ['75 €', '90 €', '96 €', '100 €'], ans: 3,
  sol: `Se p è il prezzo di vendita, il guadagno è 0,20 p e il costo è 0,80 p = 60, quindi p = 75 €. Il prezzo di vendita è il 75% del listino L: 0,75 L = 75, quindi L = 100 €.`,
  trap: `Calcolare il guadagno del 20% sul costo (p = 72 €, listino 96 €) oppure fermarsi al prezzo di vendita (75 €). Le percentuali hanno basi diverse: costo, prezzo di vendita, listino.`,
  patt: 'Base della percentuale' },

/* ---------- 8 ---------- */
{ n: 8, area: 'DI', diff: 'media', lang: 'it', asset: gOrdini(),
  stem: `In quale anno gli ordini online hanno superato per la prima volta il 40% del totale degli ordini (online + in negozio)?`,
  opts: ['2022', '2023', '2024', '2025'], ans: 1,
  sol: `Quota online: 2022 → 32 ÷ (32 + 52) = 32 ÷ 84 ≈ 38%; 2023 → 40 ÷ (40 + 56) = 40 ÷ 96 ≈ 41,7%. È quindi il 2023 il primo anno sopra il 40%.`,
  trap: `Guardare dove le due linee si incrociano (tra il 2024 e il 2025, cioè intorno al 50%) o scegliere il 2022 a occhio: la quota è il rapporto tra gli ordini online e il totale, non si legge dall'altezza della linea.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 9 ---------- */
{ n: 9, area: 'V', diff: 'media', lang: 'it',
  passage: `Il regolamento del condominio vieta di tenere biciclette sui balconi che affacciano sulla strada, mentre le consente nel cortile interno e nel garage.`,
  claim: `Un condomino può tenere la propria bicicletta sul balcone che affaccia sul cortile interno.`,
  opts: VFN, ans: 2,
  sol: `Il brano vieta le biciclette sui balconi sulla strada e le consente nel cortile e nel garage: non dice nulla dei balconi che affacciano sul cortile. L'affermazione non è né confermata né contraddetta.`,
  trap: `Rispondere «Vera» estendendo il permesso del cortile ai balconi sul cortile: sono luoghi diversi. Il divieto riguarda solo i balconi sulla strada; per gli altri il testo tace.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 10 ---------- */
{ n: 10, area: 'Q', diff: 'media', lang: 'it',
  stem: `In un ristorante un pasto completo comprende un antipasto, un primo e, a scelta del cliente, un dessert (oppure nessun dessert). Ci sono 3 antipasti, 4 primi e 2 dessert. Quanti pasti diversi si possono comporre?`,
  opts: ['9', '14', '24', '36'], ans: 3,
  sol: `Antipasto: 3 scelte. Primo: 4 scelte. Dessert: 2 dessert più la possibilità di non prenderlo = 3 scelte. In tutto 3 · 4 · 3 = 36.`,
  trap: `Dimenticare l'opzione «nessun dessert» (3 · 4 · 2 = 24) oppure sommare invece di moltiplicare (3 + 4 + 2 = 9).`,
  patt: 'Probabilità e combinatoria' },

/* ---------- 11 ---------- */
{ n: 11, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Il fatturato complessivo di un\'azienda è aumentato nel 2025 rispetto al 2024?',
    'Nel 2024 il fatturato realizzato in Italia era almeno pari a quello realizzato all\'estero.',
    'Nel 2025 il fatturato realizzato in Italia è cresciuto del 10% e quello realizzato all\'estero è calato del 5%, rispetto al 2024.'),
  opts: DSOPTS, ans: 2,
  sol: `Siano I ed E i fatturati 2024 in Italia e all'estero. Dalla (2) la variazione è 0,10 I − 0,05 E. Da sola non basta: se E è molto più grande di I, il totale cala. Con la (1), E ≤ I: 0,10 I − 0,05 E ≥ 0,10 I − 0,05 I = 0,05 I > 0, quindi il totale è aumentato. La (1) da sola non dice nulla sul 2025.`,
  trap: `Concludere che la (2) basti perché «+10% è più di −5%»: le due percentuali vanno pesate con i fatturati di partenza. Serve la (1) per sapere quale dei due pesa di più.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 12 ---------- */
{ n: 12, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un birrificio vende bottiglie da 20 cl e bottiglie da 50 cl in rapporto di 5 a 2: ogni 5 bottiglie piccole ne vende 2 grandi. Quale percentuale del volume totale venduto è costituita dalle bottiglie piccole?`,
  opts: ['50%', '60%', '67%', '71%'], ans: 0,
  sol: `Prendiamo 5 bottiglie piccole e 2 grandi: volume piccole 5 · 20 = 100 cl; volume grandi 2 · 50 = 100 cl. Le piccole sono 100 su 200 cl, cioè il 50%.`,
  trap: `Rispondere con la quota in numero di bottiglie, 5 su 7 ≈ 71%: una bottiglia grande contiene però due volte e mezzo il liquido di una piccola.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 13 ---------- */
{ n: 13, area: 'V', diff: 'media', lang: 'it',
  passage: `Una catena di librerie ha spostato la sezione dei libri per ragazzi dal fondo del negozio all'ingresso in 12 punti vendita. Nei sei mesi successivi le vendite di libri per ragazzi sono aumentate in media del 15% in quei punti vendita. La direzione conclude che lo spostamento ha fatto aumentare le vendite.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione della direzione?`,
  opts: [`Tra i 12 punti vendita, gli aumenti di vendite più alti si sono registrati dove la sezione è diventata più visibile dall'ingresso.`,
         `Molti clienti dichiarano di apprezzare la sezione per ragazzi.`,
         `I libri per ragazzi hanno un prezzo medio inferiore a quello dei libri per adulti.`,
         `La catena ha aperto nuovi punti vendita negli ultimi anni.`], ans: 0,
  sol: `Se l'aumento è tanto più forte quanto più lo spostamento ha reso la sezione visibile, l'effetto cresce con l'intensità dell'intervento: è un indizio a favore del nesso spostamento → vendite. Le altre opzioni non collegano la nuova posizione all'andamento delle vendite.`,
  trap: `Scegliere il gradimento dei clienti: è un'opinione e non dice se le vendite siano aumentate per via della nuova posizione. Serve un'evidenza che leghi l'entità del cambiamento all'entità dell'effetto.`,
  patt: 'Cause alternative' },

/* ---------- 14 ---------- */
{ n: 14, area: 'DI', diff: 'media', lang: 'it', asset: gEta(),
  stem: `Quale delle seguenti affermazioni è certamente vera?`,
  opts: [`I visitatori tra i 35 e i 44 anni sono più numerosi di quelli con meno di 35 anni.`,
         `L'età media dei visitatori intervistati è superiore a 40 anni.`,
         `La mediana dell'età dei visitatori intervistati è inferiore a 35 anni.`,
         `Almeno il 70% dei visitatori intervistati ha meno di 45 anni.`], ans: 3,
  sol: `Visitatori in tutto: 12 + 28 + 35 + 15 + 10 = 100. Con meno di 35 anni: 12 + 28 = 40; con meno di 45 anni: 40 + 35 = 75, cioè il 75% (D vera). C: sotto i 35 anni sono solo 40, meno della metà, quindi la mediana è almeno 35. A: 35 contro 40, falsa. B: dai dati a fasce non si può dire: con tutti i visitatori all'estremo basso di ogni fascia la media sarebbe 33,3, all'estremo alto 42,3.`,
  trap: `Scegliere A perché la colonna più alta è 35–44: una colonna può essere la più alta senza superare la somma di due colonne vicine. Per B la media dipende dall'età esatta dentro ogni fascia.`,
  patt: 'Lettura del grafico: classi e mediana' },

/* ---------- 15 ---------- */
{ n: 15, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un capitale impiegato a interesse semplice al 4% annuo diventa, dopo 3 anni, 1.680 €. Qual era il capitale iniziale?`,
  opts: ['1.280 €', '1.400 €', '1.480 €', '1.500 €'], ans: 3,
  sol: `In 3 anni gli interessi sono il 12% del capitale: 1,12 · C = 1.680, quindi C = 1.680 ÷ 1,12 = 1.500 €. (Verifica: 12% di 1.500 = 180; 1.500 + 180 = 1.680.)`,
  trap: `Togliere il 12% dal valore finale, 1.680 · 0,88 ≈ 1.480 €: il 12% si calcola sul capitale iniziale, non su 1.680.`,
  patt: 'Base della percentuale' },

/* ---------- 16 ---------- */
{ n: 16, area: 'V', diff: 'media', lang: 'en',
  passage: `A bike-sharing company operates 120 stations. At 8 a.m. every station holds at least 10 bikes, and exactly 90% of the stations hold more than 15 bikes.`,
  claim: `At 8 a.m., at least 10 stations hold between 10 and 15 bikes (both included).`,
  opts: VFN_EN, ans: 0,
  sol: `Key sentence: «exactly 90% of the stations hold more than 15 bikes». The other 10% of 120 = 12 stations hold 15 bikes or fewer, and every station holds at least 10: so 12 stations hold between 10 and 15 bikes, and 12 ≥ 10. The claim is true.`,
  trap: `Answering «Cannot be determined» because the passage never gives the exact number of bikes per station: the percentage is enough to fix how many stations are in the 10–15 range.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 17 ---------- */
{ n: 17, area: 'DI', diff: 'difficile', lang: 'it', asset: tAmbulatori(),
  stem: `Tra il 2024 e il 2025, quale delle seguenti affermazioni sui due ambulatori considerati insieme è corretta?`,
  opts: [`La percentuale di recuperi completi è rimasta invariata, perché i pazienti trattati sono 500 in entrambi gli anni.`,
         `Il numero di recuperi completi è aumentato.`,
         `La percentuale di recuperi completi è aumentata, perché è aumentata in entrambi gli ambulatori.`,
         `La percentuale di recuperi completi è diminuita di 30 punti percentuali, nonostante sia aumentata in entrambi gli ambulatori.`], ans: 3,
  sol: `2024: (320 + 20) ÷ 500 = 68%. 2025: (90 + 100) ÷ 500 = 38%. Il tasso complessivo scende di 30 punti, anche se A passa da 80% a 90% e B da 20% a 25%. Nel 2025 la maggior parte dei pazienti è seguita da B, l'ambulatorio con il tasso più basso. Anche i recuperi totali calano (da 340 a 190).`,
  trap: `Pensare che se due gruppi migliorano allora migliora anche il totale: il totale è una media ponderata, e qui i pesi si spostano verso l'ambulatorio con il tasso più basso.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 18 ---------- */
{ n: 18, area: 'Q', diff: 'media', lang: 'it',
  stem: `In un quiz ogni risposta esatta vale +4 punti, ogni risposta errata −1 punto e ogni domanda omessa 0 punti. Un candidato affronta 20 domande, ne omette 5 e totalizza 40 punti. Quante risposte ha sbagliato?`,
  opts: ['3', '4', '5', '8'], ans: 1,
  sol: `Ha risposto a 20 − 5 = 15 domande. Se e sono le esatte e s le sbagliate: e + s = 15 e 4e − s = 40. Sommando: 5e = 55, quindi e = 11 e s = 4. (Verifica: 44 − 4 = 40.)`,
  trap: `Usare 20 domande invece di 15 nell'equazione e + s: darebbe e = 12 e s = 8. Le domande omesse non sono né esatte né sbagliate.`,
  patt: 'Equazioni e problemi a parole' },

/* ---------- 19 ---------- */
{ n: 19, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Una scuola di lingue vuole aumentare gli incassi dei corsi serali riducendo la retta del 20%. La direttrice è convinta che, grazie a questa riduzione, gli incassi complessivi dei corsi serali aumenteranno.`,
  stem: `Quale delle seguenti assunzioni è necessaria perché il ragionamento della direttrice regga?`,
  opts: [`Gli iscritti ai corsi serali aumenteranno di più del 25%.`,
         `Tutti gli attuali iscritti continueranno a frequentare i corsi serali.`,
         `La nuova retta sarà inferiore a quella delle altre scuole della città.`,
         `Le rette degli altri corsi della scuola resteranno invariate.`], ans: 0,
  sol: `Incasso = retta × numero di iscritti. Con la retta all'80%, per superare l'incasso di prima servono iscritti > 1 ÷ 0,80 = 125% di quelli attuali: cioè più del 25% in più. Senza questa condizione gli incassi non possono crescere.`,
  trap: `Scegliere un'opzione «commerciale» (concorrenza, fedeltà degli iscritti): sono plausibili ma non necessarie. L'unica assunzione che il calcolo rende indispensabile è la soglia di crescita degli iscritti.`,
  patt: 'Assunzione implicita' },

/* ---------- 20 ---------- */
{ n: 20, area: 'DI', diff: 'media', lang: 'it', asset: gFatturato(),
  stem: `Di quanto, in percentuale, è cresciuto il fatturato dal 2022 al 2025?`,
  opts: ['+20%', '+25%', '+30%', '+200%'], ans: 1,
  sol: `I valori sono scritti sulle colonne: 80 nel 2022 e 100 nel 2025. Crescita: (100 − 80) ÷ 80 = 25%. L'asse verticale parte da 70, non da 0.`,
  trap: `Fidarsi dell'altezza delle colonne: poiché l'asse parte da 70, la colonna del 2025 (30 sopra la base) sembra tre volte quella del 2022 (10 sopra la base), cioè +200%. Contano i valori, non le altezze.`,
  patt: 'Lettura del grafico: asse troncato' },

/* ---------- 21 ---------- */
{ n: 21, area: 'Q', diff: 'media', lang: 'it',
  stem: `Anna corre a una velocità costante di 12 km/h. Bruno corre a un ritmo costante di 4 minuti e 30 secondi per ogni chilometro. Su una distanza di 20 km, chi arriva prima e con quanto anticipo?`,
  opts: ['Anna, di 10 minuti', 'Bruno, di 5 minuti', 'Arrivano insieme', 'Bruno, di 10 minuti'], ans: 3,
  sol: `Anna: 20 km ÷ 12 km/h = 100 minuti. Bruno: 20 · 4,5 min = 90 minuti. Bruno arriva 10 minuti prima.`,
  trap: `Confrontare i numeri 12 e 4,5 come se fossero grandezze dello stesso tipo: 12 sono km all'ora (più è alto, più si è veloci), 4,5 sono minuti per km (più è basso, più si è veloci).`,
  patt: 'Unità di misura e tassi' },

/* ---------- 22 ---------- */
{ n: 22, area: 'V', diff: 'media', lang: 'it',
  passage: `Nella prima settimana di luglio il rifugio Alpe Bella ha ospitato ogni giorno almeno 12 persone e, in nessun giorno, più di 40. Il sabato e la domenica gli ospiti sono stati almeno 30.`,
  claim: `Il sabato il rifugio ha ospitato più persone di ogni altro giorno di quella settimana.`,
  opts: VFN, ans: 2,
  sol: `Il brano dà solo un minimo per ogni giorno (12), un massimo (40) e un minimo di 30 per sabato e domenica. Non dice se il sabato abbia avuto più ospiti di un giorno feriale (che potrebbe aver toccato 40) né della domenica. Il testo è compatibile con entrambe le situazioni.`,
  trap: `Rispondere «Vera» perché nel weekend il rifugio è più affollato: è un'impressione plausibile ma il brano dà solo dei minimi, non un confronto tra giorni.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 23 ---------- */
{ n: 23, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Anna è più grande di Bea?',
    'Anna ha 6 anni più di Carla.',
    'Tra 5 anni Anna avrà esattamente il doppio degli anni di Bea.'),
  opts: DSOPTS, ans: 1,
  sol: `Dalla (2): se oggi Bea ha b anni, tra 5 anni ne avrà b + 5 e Anna ne avrà 2(b + 5); oggi Anna ha 2b + 5 anni, che è più di b per ogni b ≥ 0. Quindi Anna è sicuramente più grande. La (1) confronta Anna con un'altra persona: da sola non dice nulla su Bea.`,
  trap: `Cercare di calcolare l'età di Anna e di Bea: non servono i valori, basta sapere che 2b + 5 > b. Un'altra via sbagliata è ritenere che la (1) serva perché contiene un numero.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 24 ---------- */
{ n: 24, area: 'Q', diff: 'media', lang: 'en',
  stem: `When the positive integer n is divided by 6 the remainder is 4, and when the positive integer m is divided by 6 the remainder is 5. What is the remainder when the product n · m is divided by 6?`,
  opts: ['0', '1', '2', '3'], ans: 2,
  sol: `Write n = 6a + 4 and m = 6b + 5. The product is 36ab + 30a + 24b + 20: the first three terms are multiples of 6, so only 20 matters. 20 = 3 · 6 + 2, hence the remainder is 2.`,
  trap: `Adding the remainders (4 + 5 = 9, remainder 3 when divided by 6) instead of multiplying them: that is the remainder of the sum n + m, not of the product.`,
  patt: 'Resti e divisibilità' },

/* ---------- 25 ---------- */
{ n: 25, area: 'V', diff: 'media', lang: 'it',
  passage: `Il Comune comunica che in un anno gli iscritti ai corsi di yoga sono aumentati del 60%, mentre quelli ai corsi di nuoto sono aumentati del 10%. L'assessore ne conclude che oggi lo yoga ha più iscritti del nuoto.`,
  stem: `Quale delle seguenti obiezioni mette in luce il difetto principale del ragionamento dell'assessore?`,
  opts: [`Confronta due aumenti percentuali senza sapere da quanti iscritti partivano le due attività.`,
         `Considera un solo anno, mentre servirebbero dati su più anni.`,
         `Attribuisce l'aumento dello yoga a una moda passeggera.`,
         `Non tiene conto del fatto che il nuoto si può praticare anche fuori dai corsi del Comune.`], ans: 0,
  sol: `La crescita del 60% di un corso piccolo può dare meno iscritti in più (e meno iscritti in tutto) della crescita del 10% di un corso grande. Una percentuale più alta non implica un numero assoluto più alto: mancano gli iscritti di partenza.`,
  trap: `Scegliere un'obiezione sul periodo o sui motivi: il difetto logico è confondere la variazione percentuale con il numero di iscritti.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 26 ---------- */
{ n: 26, area: 'DI', diff: 'media', lang: 'it', asset: gAbbonati(),
  stem: `A fine di quale mese il numero di abbonati è stato più basso?`,
  opts: ['Febbraio', 'Aprile', 'Maggio', 'Giugno'], ans: 2,
  sol: `Il grafico mostra le variazioni, non i livelli. Abbonati a fine mese: gennaio 120 + 8 = 128; febbraio 125; marzo 130; aprile 124; maggio 120; giugno 130. Il livello più basso è a fine maggio (120).`,
  trap: `Scegliere aprile, il mese con la colonna negativa più grande (−6): a fine aprile gli abbonati sono ancora 124, mentre maggio, con un'altra variazione negativa, li porta a 120.`,
  patt: 'Livello vs variazione' },

/* ---------- 27 ---------- */
{ n: 27, area: 'Q', diff: 'facile', lang: 'it',
  stem: `La somma di due numeri positivi è 60 e il loro rapporto è 7 a 3. Qual è la differenza tra il maggiore e il minore?`,
  opts: ['12', '18', '24', '42'], ans: 2,
  sol: `Le parti sono 7 + 3 = 10 e ogni parte vale 60 ÷ 10 = 6. I numeri sono 42 e 18 e la differenza è 24 (cioè 7 − 3 = 4 parti, 4 · 6 = 24).`,
  trap: `Rispondere con uno dei due numeri (42 o 18): la domanda chiede la differenza, che corrisponde a 4 parti su 10.`,
  patt: 'Rapporti e proporzioni' },

/* ---------- 28 ---------- */
{ n: 28, area: 'V', diff: 'facile', lang: 'it',
  passage: `Per tutelare la fauna, il parco naturale della Val Verde chiude l'accesso ai veicoli a motore nei fine settimana di luglio e agosto. Fanno eccezione i residenti e i mezzi di soccorso.`,
  claim: `Una domenica di luglio un turista non residente può entrare nel parco con la propria automobile.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «chiude l'accesso ai veicoli a motore nei fine settimana di luglio e agosto». Una domenica di luglio è nel fine settimana e il turista non residente non rientra nelle eccezioni (residenti e soccorso): l'ingresso in auto è vietato, quindi l'affermazione è falsa.`,
  trap: `Rispondere «Non deducibile» perché il brano non nomina i turisti: ma le uniche eccezioni sono residenti e soccorso, e un turista non residente non ne fa parte.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 29 ---------- */
{ n: 29, area: 'DI', diff: 'media', lang: 'it', asset: tHotel(),
  stem: `Quale hotel ha il ricavo giornaliero più alto per camera disponibile (cioè il ricavo giornaliero totale diviso per il numero di camere dell'hotel)?`,
  opts: ['Alba', 'Cielo', 'Alba e Brezza, a pari merito', 'Brezza'], ans: 3,
  sol: `Il ricavo per camera disponibile è occupazione × tariffa. Alba: 0,75 · 80 = 60 €. Brezza: 0,90 · 100 = 90 €. Cielo: 0,70 · 95 = 66,50 €. Il più alto è Brezza. (Controllo: i ricavi totali sono 7.200 € per Alba e per Brezza, 6.650 € per Cielo, ma Alba li ottiene con 120 camere e Brezza con 80.)`,
  trap: `Confrontare i ricavi totali: Alba e Brezza incassano lo stesso (7.200 €) e farebbero scegliere il pari merito. La domanda chiede un rapporto per camera disponibile, e Alba ha il 50% di camere in più da riempire.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 30 ---------- */
{ n: 30, area: 'Q', diff: 'facile', lang: 'it',
  stem: `I cinque stipendi mensili di una piccola impresa sono 1.200 €, 1.300 €, 1.300 €, 1.500 € e 5.700 €. Di quanto la media supera la mediana?`,
  opts: ['700 €', '900 €', '1.100 €', '1.400 €'], ans: 1,
  sol: `Somma: 1.200 + 1.300 + 1.300 + 1.500 + 5.700 = 11.000, media 11.000 ÷ 5 = 2.200 €. La mediana è il terzo valore in ordine crescente: 1.300 €. Differenza: 2.200 − 1.300 = 900 €.`,
  trap: `Usare il valore sbagliato come mediana (per esempio 1.500 €, il penultimo): la mediana è il valore centrale, il terzo dei cinque ordinati.`,
  patt: 'Media e mediana' },

/* ---------- 31 ---------- */
{ n: 31, area: 'V', diff: 'media', lang: 'it',
  passage: `Una catena di negozi nota che nelle sedi in cui il personale indossa una divisa colorata le vendite per metro quadro sono più alte che nelle altre. La direzione decide perciò di introdurre la divisa colorata in tutte le sedi, per aumentare le vendite.`,
  stem: `Quale delle seguenti informazioni, se vera, mette più in dubbio che la divisa colorata faccia aumentare le vendite?`,
  opts: [`La divisa colorata è stata adottata soltanto nelle sedi situate nei centri commerciali più frequentati.`,
         `Alcuni dipendenti trovano la divisa colorata poco comoda.`,
         `La divisa colorata costa più di quella tradizionale.`,
         `Le sedi con la divisa colorata sono più numerose di quelle senza.`], ans: 0,
  sol: `Se la divisa colorata è presente solo nei centri commerciali più frequentati, sono la posizione e l'affluenza a spiegare vendite più alte: una causa comune che non dipende dalla divisa. Le altre opzioni riguardano costi e comodità, non il nesso causale.`,
  trap: `Scegliere C: il costo può far desistere dall'acquisto della divisa, ma non spiega perché le vendite siano più alte dove la divisa c'è già. La domanda chiede di dubitare del nesso causale.`,
  patt: 'Cause alternative' },

/* ---------- 32 ---------- */
{ n: 32, area: 'DI', diff: 'facile', lang: 'en', ds: true,
  stem: ds('Are there more boys than girls among the members of a chess club?',
    'Boys make up 55% of the members.',
    'The club has 40 members.'),
  opts: DSOPTS_EN, ans: 0,
  sol: `From (1): boys are 55% of the members, so girls are 45%: boys outnumber girls whatever the total. Statement (2) gives only the total, so alone it says nothing about boys and girls.`,
  trap: `Thinking that the total number of members is needed: a share above 50% is enough to compare the two groups, without any absolute figure.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 33 ---------- */
{ n: 33, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un negozio ha avuto 50 clienti in una giornata, con una spesa media di 44 €. I 20 clienti in possesso della carta fedeltà hanno speso in media 35 €. Qual è stata la spesa media degli altri clienti?`,
  opts: ['44 €', '50 €', '53 €', '55 €'], ans: 1,
  sol: `Incasso totale: 50 · 44 = 2.200 €. Incasso dei 20 clienti con carta: 20 · 35 = 700 €. Gli altri 30 clienti hanno speso 2.200 − 700 = 1.500 €, in media 1.500 ÷ 30 = 50 €.`,
  trap: `Pensare che la differenza sia simmetrica (44 + 9 = 53 €): i due gruppi hanno numerosità diverse (20 e 30), quindi lo scarto dalla media generale non è lo stesso per i due gruppi.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 34 ---------- */
{ n: 34, area: 'V', diff: 'media', lang: 'it',
  passage: `Nella cooperativa agricola «Terra Viva» il 40% dei soci ha più di 50 anni e, tra questi, la metà ha anche più di 60 anni.`,
  claim: `Almeno quattro soci su cinque hanno 60 anni o meno.`,
  opts: VFN, ans: 0,
  sol: `Frasi chiave: «il 40% ha più di 50 anni» e «tra questi, la metà ha più di 60 anni». I soci con più di 60 anni sono la metà del 40%, cioè il 20% del totale; quindi l'80% ha 60 anni o meno, cioè esattamente quattro soci su cinque. «Almeno quattro su cinque» è vera.`,
  trap: `Rispondere «Non deducibile» perché il brano non dà il numero dei soci, oppure «Falsa» per la parola «almeno»: l'80% è proprio quattro quinti, quindi «almeno» è soddisfatto.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 35 ---------- */
{ n: 35, area: 'DI', diff: 'difficile', lang: 'it', asset: tWorkshop(),
  stem: `Quale percentuale dei partecipanti al turno del pomeriggio è composta da professionisti?`,
  opts: ['20%', '30%', '40%', '60%'], ans: 1,
  sol: `Studenti: 90 in tutto, di cui 20 al mattino, quindi 70 al pomeriggio. Al pomeriggio i partecipanti sono 100, quindi 100 − 70 = 30 sono professionisti: 30 ÷ 100 = 30%. (Verifica: professionisti 150 − 90 = 60, di cui 30 al mattino, che con i 20 studenti fanno 50.)`,
  trap: `Usare un denominatore sbagliato: 30 su 150 dà 20%, la quota di professionisti sul totale è 60 su 150 = 40%. La domanda chiede la quota dentro il solo turno del pomeriggio.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 36 ---------- */
{ n: 36, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Quanti numeri interi n verificano 3 < ${fr('n', 2)} < 9?`,
  opts: ['11', '12', '13', '14'], ans: 0,
  sol: `Moltiplicando per 2: 6 < n < 18. Gli interi sono 7, 8, …, 17: 17 − 7 + 1 = 11. Gli estremi 6 e 18 sono esclusi.`,
  trap: `Includere gli estremi (da 6 a 18 sono 13 numeri) oppure calcolare 18 − 6 = 12: i numeri compresi in modo stretto tra 6 e 18 sono 18 − 6 − 1 = 11.`,
  patt: 'Disuguaglianze' },

/* ---------- 37 ---------- */
{ n: 37, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Nel dipartimento di economia, tutti i corsi di laurea che prevedono un tirocinio prevedono anche un esame di lingua. Nessun corso con esame di lingua è a numero chiuso. Alcuni corsi del dipartimento sono a numero chiuso.`,
  stem: `Quale delle seguenti conclusioni segue necessariamente dalle affermazioni del brano?`,
  opts: [`Alcuni corsi con esame di lingua non prevedono il tirocinio.`,
         `Tutti i corsi senza tirocinio sono a numero chiuso.`,
         `Almeno un corso a numero chiuso prevede il tirocinio.`,
         `Alcuni corsi a numero chiuso non prevedono il tirocinio.`], ans: 3,
  sol: `Se un corso è a numero chiuso, non ha esame di lingua; ma tirocinio ⇒ esame di lingua, quindi (contrapposta) senza esame di lingua non c'è tirocinio. Poiché almeno un corso è a numero chiuso, quel corso non ha il tirocinio: D segue necessariamente.`,
  trap: `Scegliere A o B invertendo i «se… allora»: dal brano non si può dire che esistano corsi con esame di lingua senza tirocinio, né che i corsi senza tirocinio siano a numero chiuso. C è addirittura contraddetta.`,
  patt: 'Quantificatori e deduzioni' },

/* ---------- 38 ---------- */
{ n: 38, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Il rubinetto B, da solo, impiega più di 6 ore a riempire una vasca?',
    'A e B insieme riempiono la vasca in 6 ore.',
    'A, da solo, riempie la vasca in 10 ore.'),
  opts: DSOPTS, ans: 0,
  sol: `Dalla (1): lavorando insieme A e B ci mettono 6 ore, quindi B da solo, senza l'aiuto di A, ci mette più di 6 ore: la risposta è sì. La (2) da sola non dice nulla su B.`,
  trap: `Provare a calcolare il tempo di B (che richiederebbe entrambe le informazioni: 15 ore) invece di accorgersi che alla domanda basta un confronto: due rubinetti insieme sono sempre più rapidi di ciascuno da solo.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 39 ---------- */
{ n: 39, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Una successione parte da 5 e ogni termine successivo si ottiene raddoppiando il precedente e sottraendo 3. Quanto vale il quinto termine?`,
  opts: ['19', '27', '35', '43'], ans: 2,
  sol: `Primo 5; secondo 2 · 5 − 3 = 7; terzo 2 · 7 − 3 = 11; quarto 2 · 11 − 3 = 19; quinto 2 · 19 − 3 = 35.`,
  trap: `Fermarsi un passaggio prima (19 è il quarto termine): il primo termine è già dato, ne servono altri quattro passaggi.`,
  patt: 'Successioni' },

/* ---------- 40 ---------- */
{ n: 40, area: 'V', diff: 'media', lang: 'it',
  passage: `Un'indagine sui piccoli produttori di olio d'oliva ha rilevato che quelli che vendono direttamente ai consumatori ottengono in media un prezzo al litro più alto di quelli che vendono ai distributori. Tuttavia i costi di vendita sostenuti dai produttori che vendono direttamente assorbono in media la metà di questa differenza di prezzo.`,
  stem: `Quale delle seguenti conclusioni è supportata dal brano?`,
  opts: [`Per i piccoli produttori la vendita diretta è sempre più redditizia della vendita ai distributori.`,
         `Il vantaggio di prezzo della vendita diretta è in parte compensato dai costi di vendita.`,
         `I distributori pagano meno perché hanno costi di vendita più alti dei produttori.`,
         `La vendita diretta non conviene ai piccoli produttori di olio.`], ans: 1,
  sol: `Frase chiave: «i costi di vendita… assorbono in media la metà di questa differenza di prezzo»: il vantaggio c'è ma è ridotto dai costi. A usa «sempre» (il brano parla di medie), C attribuisce un motivo mai citato, D è contraddetta perché metà del vantaggio resta.`,
  trap: `Scegliere A o D: sono estremi. Il brano dà un quadro intermedio (vantaggio dimezzato) e parla di medie, non di tutti i produttori.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 41 ---------- */
{ n: 41, area: 'DI', diff: 'difficile', lang: 'it', asset: tProgetto(),
  stem: `Se la durata dell'attività B si riducesse di 2 giorni (da 4 a 2), di quanto si ridurrebbe la durata minima complessiva del progetto?`,
  opts: ['0 giorni', '1 giorno', '2 giorni', '3 giorni'], ans: 1,
  sol: `Prima: A finisce al giorno 3, B al 4; C finisce al 5; D parte dopo A e B, quindi al giorno 4, e finisce al 9; E parte dopo C e D, al giorno 9, e finisce al 12. Con B = 2: D parte dopo A (giorno 3) e finisce all'8; E finisce all'8 + 3 = 11. La riduzione è di 1 giorno.`,
  trap: `Pensare che togliere 2 giorni a un'attività del percorso più lungo tolga 2 giorni al progetto: dopo la riduzione il percorso A → D → E diventa quello determinante, e B non pesa più.`,
  patt: 'Cammino critico' },

/* ---------- 42 ---------- */
{ n: 42, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Il fatturato di un'azienda passa da 200 a 288 milioni di euro in due anni, con lo stesso tasso di crescita percentuale in ciascuno dei due anni. Qual è il tasso di crescita annuo?`,
  opts: ['15%', '18%', '20%', '22%'], ans: 2,
  sol: `La crescita complessiva è 288 ÷ 200 = 1,44, e 1,44 = 1,2 · 1,2. Il fattore annuo è 1,2: +20% ogni anno. (Verifica: 200 → 240 → 288.)`,
  trap: `Dividere per due la crescita complessiva: 44% ÷ 2 = 22%. Le crescite annue si moltiplicano (1,22 · 1,22 ≈ 1,49, non 1,44), quindi la crescita complessiva non è la somma dei due tassi.`,
  patt: 'Percentuali composte' },

/* ---------- 43 ---------- */
{ n: 43, area: 'V', diff: 'media', lang: 'it',
  passage: `In un'azienda di 60 dipendenti i tre reparti (vendite, amministrazione e produzione) hanno lo stesso numero di persone. Nel reparto vendite un dipendente su quattro lavora part-time, nel reparto amministrazione i dipendenti part-time sono 4 e nel reparto produzione nessuno lavora part-time.`,
  claim: `In tutta l'azienda i dipendenti part-time sono più di 10.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «i tre reparti hanno lo stesso numero di persone»: 60 ÷ 3 = 20 per reparto. Vendite: 20 ÷ 4 = 5 part-time; amministrazione: 4; produzione: 0. In tutto sono 9, quindi «più di 10» è contraddetto dal brano.`,
  trap: `Rispondere «Non deducibile» perché non si conoscono i numeri dei singoli reparti: «lo stesso numero di persone» li fissa tutti a 20. Oppure contare 5 + 4 + 4 per distrazione.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 44 ---------- */
{ n: 44, area: 'DI', diff: 'difficile', lang: 'it',
  asset: dp(
    [`Un corso di aggiornamento ha 20 iscritti, ciascuno dei quali frequenta almeno uno dei due laboratori: Teatro e Musica.`,
     `14 iscritti frequentano il laboratorio di Teatro.`,
     `11 iscritti frequentano il laboratorio di Musica.`],
    [`A. Almeno 5 iscritti frequentano entrambi i laboratori.`,
     `B. Più di 7 iscritti frequentano entrambi i laboratori.`,
     `C. Gli iscritti che frequentano solo Musica sono meno di quelli che frequentano solo Teatro.`,
     `D. Al massimo 9 iscritti frequentano solo Teatro.`]),
  stem: `Leggi con attenzione i dati e le proposizioni. In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo A e C', 'Solo A e D', 'Solo A, C e D', 'Tutte e quattro'], ans: 2,
  sol: `Sia x chi frequenta entrambi. Teatro ∪ Musica = 20 = 14 + 11 − x, quindi x = 5: i dati danno un valore unico. A vera (x = 5). B falsa: 5 non è più di 7. C: solo Musica = 11 − 5 = 6, solo Teatro = 14 − 5 = 9, e 6 < 9: vera. D: solo Teatro = 9, quindi al massimo 9: vera. Sono vere A, C e D.`,
  trap: `Considerare B «possibile» perché i dati sembrano lasciare margine: l'unione fissa x esattamente a 5. «Sicuramente vera» vuol dire vera con i dati dati, e B è falsa.`,
  patt: 'Deduzioni con vincoli' },

/* ---------- 45 ---------- */
{ n: 45, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Un pavimento rettangolare di 6 m per 4 m viene ricoperto con piastrelle quadrate di lato 20 cm, senza sprechi. Quante piastrelle servono?`,
  opts: ['120', '240', '600', '1.200'], ans: 2,
  sol: `Area del pavimento: 6 · 4 = 24 m². Area di una piastrella: 0,2 · 0,2 = 0,04 m². Numero: 24 ÷ 0,04 = 600. (Oppure: 600 cm ÷ 20 = 30 file per 400 cm ÷ 20 = 20 colonne: 30 · 20 = 600.)`,
  trap: `Dividere l'area per il lato della piastrella, 24 ÷ 0,2 = 120: si divide per l'area (0,04 m²), non per il lato.`,
  patt: 'Unità di misura e tassi' },

/* ---------- 46 ---------- */
{ n: 46, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Tre scatole sono etichettate «Mele», «Arance» e «Miste». Una contiene solo mele, una solo arance e una mele e arance mescolate, ma tutte le etichette sono sbagliate. Dalla scatola etichettata «Miste» si estrae un frutto ed è un'arancia.`,
  stem: `Quale delle seguenti affermazioni è certamente vera?`,
  opts: [`La scatola etichettata «Mele» contiene mele e arance mescolate.`,
         `La scatola etichettata «Arance» contiene mele e arance mescolate.`,
         `La scatola etichettata «Arance» contiene soltanto arance.`,
         `Il contenuto delle scatole «Mele» e «Arance» non si può stabilire.`], ans: 0,
  sol: `La scatola «Miste» ha un'etichetta sbagliata, quindi non è quella mista: con un'arancia dentro contiene solo arance. «Mele» non può contenere mele (etichetta sbagliata) né solo arance (già assegnate): è la scatola mista. «Arance» contiene quindi solo mele.`,
  trap: `Dedurre che la scatola «Miste» contenga mele e arance perché ha dato un'arancia: ma la sua etichetta è sbagliata, quindi è proprio quella che non può essere mista.`,
  patt: 'Vincoli logici' },

/* ---------- 47 ---------- */
{ n: 47, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Più della metà dei 200 clienti di un negozio ha acquistato il prodotto Z?',
    'Tra i clienti con più di 30 anni, il 55% ha acquistato Z.',
    'I clienti con più di 30 anni sono 120.'),
  opts: DSOPTS, ans: 3,
  sol: `Insieme: 55% di 120 = 66 acquirenti tra gli over 30. Restano 80 clienti con 30 anni o meno, di cui non si sa nulla: gli acquirenti totali possono essere da 66 (nessun under 30) a 146 (tutti), quindi sopra o sotto 100. Nemmeno insieme bastano.`,
  trap: `Calcolare 66 e fermarsi, oppure presumere che la percentuale del 55% valga per tutti i clienti. Il dato riguarda solo una parte dei clienti: serve anche l'altra.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 48 ---------- */
{ n: 48, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Quanti numeri di tre cifre distinte, formati con le cifre 1, 2, 3, 4 e 5, sono pari e maggiori di 300?`,
  opts: ['12', '15', '18', '24'], ans: 1,
  sol: `Pari: l'ultima cifra è 2 o 4. Se finisce per 2: prima cifra 3, 4 o 5 (3 scelte) e cifra centrale tra le 3 rimaste, cioè 3 · 3 = 9. Se finisce per 4: prima cifra 3 o 5 (2 scelte, il 4 è già usato) e centrale tra le 3 rimaste, cioè 2 · 3 = 6. Totale: 9 + 6 = 15.`,
  trap: `Contare tutti i numeri pari senza il vincolo «maggiori di 300» (2 · 4 · 3 = 24) oppure usare 3 scelte per la prima cifra anche quando l'ultima è 4: il 4 non può comparire due volte.`,
  patt: 'Probabilità e combinatoria' },

/* ---------- 49 ---------- */
{ n: 49, area: 'V', diff: 'media', lang: 'it',
  passage: `Molti sostengono che il lavoro agile riduca l'inquinamento, perché diminuiscono gli spostamenti casa-ufficio. Tuttavia chi lavora da casa consuma più energia per riscaldare o raffrescare la propria abitazione e spesso compie comunque spostamenti per altre commissioni. Il bilancio ambientale del lavoro agile non può quindi essere dato per scontato: dipende da come e dove viene praticato.`,
  stem: `Qual è la tesi principale del brano?`,
  opts: [`Il lavoro agile non riduce l'inquinamento.`,
         `Il lavoro agile consuma più energia del lavoro in ufficio.`,
         `Il vantaggio ambientale del lavoro agile non è garantito: dipende dalle modalità con cui viene praticato.`,
         `Chi lavora da casa si sposta meno di chi lavora in ufficio.`], ans: 2,
  sol: `Frase conclusiva: «il bilancio ambientale… non può essere dato per scontato: dipende da come e dove viene praticato». A è troppo forte (il brano non dice che non riduce), B e D riprendono dettagli o la tesi che il brano mette in discussione.`,
  trap: `Scegliere A: è la lettura più «negativa» ma il brano non esclude che il lavoro agile possa ridurre l'inquinamento in alcuni casi. Conta la cautela della conclusione.`,
  patt: 'Tesi principale' },

/* ---------- 50 ---------- */
{ n: 50, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Il costo di produzione di un oggetto è composto per il 40% da materiali, per il 35% da manodopera e per il 25% da altre voci. Il costo dei materiali aumenta del 10%, quello della manodopera diminuisce del 10% e le altre voci non cambiano. Come varia il costo totale?`,
  opts: ['0%', '+0,5%', '+1%', '+5%'], ans: 1,
  sol: `Su un costo di partenza di 100: materiali 40 → 44 (+4); manodopera 35 → 31,5 (−3,5); altre voci invariate. Nuovo totale 100 + 4 − 3,5 = 100,5: +0,5%.`,
  trap: `Concludere che +10% e −10% si compensino (0%): le due voci hanno pesi diversi (40% e 35%), quindi la variazione complessiva è la media ponderata dei due cambiamenti.`,
  patt: 'Media ponderata vs semplice' }
];

return {
  id: '13',
  title: 'Mock 13',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Focus su Data Insights: sufficienza dei dati, quote e valori assoluti, medie ponderate.',
  questions: QUESTIONS,
  data: DATA
};
});
