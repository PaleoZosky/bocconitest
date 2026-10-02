/* =======================================================================
   Mock 12 — 50 domande nuove (18 Q, 16 V, 16 DI).
   Pensato per il punto debole (Data Insights) e per i cinque pattern
   d'errore: Falso vs Non deducibile, Rapporti vs valori assoluti,
   Cause alternative, Media ponderata vs semplice, Sufficienza dei dati.

   Tutti i numeri dei grafici e delle tabelle stanno in DATA e sono
   riusati da tools/check-math-12.js per ricalcolare le risposte.
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
const DSOPTS = C.DSOPTS;
const DSOPTS_EN = C.DSOPTS_EN;
const ds = C.ds;

/* ============================== DATI ============================== */
const DATA = {
  /* n.5 — acquisti di farina: spesa (€) e prezzo (€/kg) per fornitore */
  farina: [
    { f: 'Molino Alfa',  spesa: 400, prezzo: 2 },
    { f: 'Molino Beta',  spesa: 600, prezzo: 3 },
    { f: 'Molino Gamma', spesa: 400, prezzo: 4 }
  ],
  /* n.8 — voto medio per sezione in due anni */
  sezioni: [
    { s: 'A', n1: 80, m1: 8.0, n2: 20, m2: 8.5 },
    { s: 'B', n1: 20, m1: 5.0, n2: 80, m2: 5.5 }
  ],
  /* n.14 — attività di un progetto: durata (giorni) e attività da cui dipende */
  progetto: [
    { a: 'A', d: 3, dopo: [] },
    { a: 'B', d: 4, dopo: ['A'] },
    { a: 'C', d: 2, dopo: ['A'] },
    { a: 'D', d: 5, dopo: ['B', 'C'] },
    { a: 'E', d: 3, dopo: ['C'] }
  ],
  /* n.17 — soci di un circolo per classe di età */
  soci: { classi: ['18–24', '25–34', '35–44', '45–54', '55 e oltre'], n: [55, 30, 15, 10, 40] },
  /* n.20 — prezzo e unità vendute a settimana; costo variabile 3 € */
  prezzi: { prezzo: [5, 6, 7, 8, 9], unita: [100, 90, 75, 55, 30], costo: 3 },
  /* n.26 — scuola di lingue: dati per le proposizioni (totale iscritti) */
  lingue: { totale: 120, tedesco: 20, minCinese: 10 },
  /* n.29 — mezzo usato per andare al lavoro, per fascia d'età (% per riga) */
  mezzi: [
    { g: 'Meno di 35 anni', n: 300, auto: 10, pubblici: 50, bici: 40 },
    { g: '35 anni o più',   n: 200, auto: 55, pubblici: 30, bici: 15 }
  ],
  /* n.35 — variazione % del fatturato 2025 e fatturato 2024 noto (milioni) */
  divisioni: { nomi: ['Alfa', 'Beta', 'Gamma'], pct: [20, 10, -5], f2024: [50, 80, null] },
  /* n.38 — iscritti per canale (200 in tutto) e rinunce per canale */
  canali: { totale: 200, nomi: ['Web', 'Telefono', 'Sportello'], quota: [40, 40, 20], rinuncia: [25, 50, 0] },
  /* n.41 — piani di telefonia: canone, GB inclusi, costo per GB extra */
  piani: [
    { p: 'A', canone: 8,  inclusi: 10,       extra: 2 },
    { p: 'B', canone: 14, inclusi: 20,       extra: 1.5 },
    { p: 'C', canone: 20, inclusi: Infinity, extra: 0 }
  ],
  /* n.50 — saldo mensile di due piani di risparmio */
  risparmio: { mesi: [0, 1, 2, 3, 4, 5, 6], A: [200, 240, 280, 320, 360, 400, 440], B: [50, 140, 230, 320, 410, 500, 590] }
};

/* ======================= tabelle e grafici ======================= */
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dec = n => String(n).replace('.', ',');

function tFarina() {
  return C.table({
    caption: 'Acquisti di farina di un panificio in un mese',
    head: ['Fornitore', 'Spesa (€)', 'Prezzo (€/kg)'],
    rows: DATA.farina.map(r => [r.f, r.spesa, r.prezzo.toFixed(2).replace('.', ',')])
  });
}

function tSezioni() {
  const righe = [];
  DATA.sezioni.forEach(r => {
    righe.push([r.s, 'Anno 1', r.n1, dec(r.m1.toFixed(1))]);
    righe.push([r.s, 'Anno 2', r.n2, dec(r.m2.toFixed(1))]);
  });
  return C.table({
    caption: 'Voto medio a un test d\'ingresso, per sezione, in due anni',
    head: ['Sezione', 'Anno', 'Studenti', 'Voto medio'],
    rows: righe
  });
}

function tProgetto() {
  return C.table({
    caption: 'Attività di un piccolo progetto',
    head: ['Attività', 'Durata (giorni)', 'Può iniziare solo dopo la fine di'],
    rows: DATA.progetto.map(r => [r.a, r.d, r.dopo.length ? r.dopo.join(' e ') : '—'])
  });
}

function gSoci() {
  const D = DATA.soci;
  return `<figure class="fig"><figcaption>Soci di un circolo sportivo: numero di soci per classe di età</figcaption>` + C.bars({
    labels: D.classi,
    series: [{ name: 'Soci', values: D.n, style: 'fill' }],
    W: 460, H: 230, max: 60,
    aria: 'Numero di soci per classe di età: ' + D.classi.map((c, i) => c + ': ' + D.n[i]).join(', ') + '.'
  }) + `</figure>`;
}

function tPrezzi() {
  const D = DATA.prezzi;
  return C.table({
    caption: 'Prezzo di vendita e unità vendute a settimana',
    head: ['Prezzo di vendita (€)', 'Unità vendute a settimana'],
    rows: D.prezzo.map((p, i) => [p, D.unita[i]])
  });
}

function dp(dati, prop) {
  /* testo allineato a sinistra: le tabelle di sola prosa non sono colonne di numeri */
  const sx = t => t ? `<span style="display:block;text-align:left">${t}</span>` : '';
  const rows = [];
  for (let i = 0; i < Math.max(dati.length, prop.length); i++) rows.push([sx(dati[i]), sx(prop[i])]);
  return C.table({ head: [sx('Dati'), sx('Proposizioni')], rows: rows });
}

function tMezzi() {
  return C.table({
    caption: 'Come vanno al lavoro gli intervistati (percentuali per fascia d\'età)',
    head: ['Fascia d\'età', 'Intervistati', 'Auto', 'Mezzi pubblici', 'Bici'],
    rows: DATA.mezzi.map(r => [r.g, r.n, r.auto + '%', r.pubblici + '%', r.bici + '%'])
  });
}

function gDivisioni() {
  const D = DATA.divisioni;
  const W = 480, H = 270, L = 46, R = 14, T = 26, B = 36, lo = -10, hi = 30, bw = 70;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  const band = (W - L - R) / D.nomi.length;
  let g = '';
  for (let t = -10; t <= 30; t += 10) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t < 0 ? '−' : ''}${Math.abs(t)}%</text>`;
  }
  D.pct.forEach((p, i) => {
    const x = L + band * i + (band - bw) / 2;
    const pos = p >= 0;
    const y0 = pos ? y(p) : y(0), h = Math.abs(y(p) - y(0));
    g += `<rect x="${x}" y="${y0}" width="${bw}" height="${h}" style="fill:var(--${pos ? 's1' : 's2'})"><title>${D.nomi[i]}: ${p > 0 ? '+' : '−'}${Math.abs(p)}%</title></rect>`;
    g += `<text x="${x + bw / 2}" y="${pos ? y0 - 7 : y0 + h + 15}" class="val" text-anchor="middle">${p > 0 ? '+' : '−'}${Math.abs(p)}%</text>`;
    g += `<text x="${x + bw / 2}" y="${H - 10}" class="lab" text-anchor="middle">${D.nomi[i]}</text>`;
  });
  const grafico = `<figure class="fig"><figcaption>Variazione del fatturato 2025 rispetto al 2024, per divisione</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Colonne con la variazione percentuale del fatturato 2025 rispetto al 2024. ${D.nomi.map((n, i) => n + ': ' + (D.pct[i] > 0 ? '+' : '−') + Math.abs(D.pct[i]) + '%').join('. ')}.">${g}</svg></div></figure>`;
  const tabella = C.table({
    caption: 'Fatturato 2024 (milioni di €)',
    head: ['Divisione', 'Fatturato 2024'],
    rows: D.nomi.map((n, i) => [n, D.f2024[i] === null ? 'non riportato' : D.f2024[i]])
  });
  return grafico + tabella;
}

function gCanali() {
  const D = DATA.canali;
  return `<figure class="fig"><figcaption>Iscritti a un corso, per canale d'iscrizione — ${D.totale} iscritti in tutto</figcaption>` + C.pie({
    data: D.nomi.map((n, i) => [n, D.quota[i]]),
    aria: 'Ripartizione degli iscritti per canale: ' + D.nomi.map((n, i) => n + ' ' + D.quota[i] + '%').join(', ') + '.'
  }) + `</figure>`;
}

function tPiani() {
  return C.table({
    caption: 'Tre piani per la telefonia mobile',
    head: ['Piano', 'Canone mensile', 'GB inclusi', 'Costo di ogni GB oltre quelli inclusi'],
    rows: DATA.piani.map(r => [r.p, r.canone + ' €', r.inclusi === Infinity ? 'illimitati' : r.inclusi, r.extra ? dec(r.extra.toFixed(2)) + ' €' : '—'])
  });
}

function gRisparmio() {
  const D = DATA.risparmio;
  const W = 520, H = 300, L = 44, R = 24, T = 18, B = 66, lo = -60, hi = 640;
  const n = D.mesi.length;
  const x = i => L + 16 + (W - L - R - 16) * i / (n - 1);
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  let g = '';
  for (let t = 0; t <= 600; t += 100) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  D.mesi.forEach((m, i) => { g += `<text x="${x(i)}" y="${H - B + 20}" class="tick" text-anchor="middle">${m}</text>`; });
  g += `<text x="${(L + W - R) / 2}" y="${H - B + 42}" class="tick" text-anchor="middle">Mesi trascorsi</text>`;
  const linea = (arr, c, tratteggio) => `<polyline points="${arr.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" style="stroke:var(--${c})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${tratteggio ? ' stroke-dasharray="6 4"' : ''}></polyline>`;
  const punti = (arr, c, nome) => arr.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"><title>Piano ${nome}, mese ${D.mesi[i]}: ${v} €</title></circle>`).join('');
  g += linea(D.A, 's1', false) + linea(D.B, 's2', true) + punti(D.A, 's1', 'A') + punti(D.B, 's2', 'B');
  /* etichette: il piano più alto in ogni mese ha il valore sopra il punto, l'altro sotto; se i saldi sono uguali se ne scrive uno solo */
  D.mesi.forEach((m, i) => {
    const a = D.A[i], b = D.B[i];
    if (a === b) { g += `<text x="${x(i)}" y="${y(a) - 11}" class="val" text-anchor="middle">${a}</text>`; return; }
    const alto = a > b ? a : b, basso = a > b ? b : a;
    g += `<text x="${x(i)}" y="${y(alto) - 11}" class="val" text-anchor="middle">${alto}</text>`;
    g += `<text x="${x(i)}" y="${y(basso) + 20}" class="val" text-anchor="middle">${basso}</text>`;
  });
  return `<figure class="fig"><figcaption>Saldo di due piani di risparmio, mese per mese (€)</figcaption>
<ul class="legend"><li><i class="sw line" style="background:var(--s1)"></i>Piano A (linea continua)</li><li><i class="sw line" style="background:var(--s2)"></i>Piano B (linea tratteggiata)</li></ul>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Due linee, saldo in euro nei mesi da 0 a 6. Piano A: ${D.A.join(', ')}. Piano B: ${D.B.join(', ')}.">${g}</svg></div></figure>`;
}

/* ======================= LE 50 DOMANDE ======================= */
const QUESTIONS = [

/* ---------- 1 ---------- */
{ n: 1, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Oggi è giovedì. Che giorno della settimana sarà fra 100 giorni?`,
  opts: ['mercoledì', 'giovedì', 'venerdì', 'sabato'], ans: 3,
  sol: `100 = 14 × 7 + 2: passano 14 settimane intere (si torna a giovedì) e restano 2 giorni. Giovedì + 2 giorni = sabato.`,
  trap: `Dividere per 7, vedere che 14 settimane «tornano» a giovedì e dimenticare il resto di 2 giorni (98 giorni, non 100).`,
  patt: 'Aritmetica modulare' },

/* ---------- 2 ---------- */
{ n: 2, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel 2025 il comune di Rivabella ha vietato ai monopattini a noleggio di circolare sui marciapiedi, introducendo una multa di 50 euro per chi non rispetta il divieto. Nei sei mesi successivi gli incidenti con monopattini segnalati alla polizia locale sono scesi da 42 a 30.`,
  claim: `Nei sei mesi successivi al divieto gli incidenti con monopattini sono diminuiti di più di un terzo.`,
  opts: VFN, ans: 1,
  sol: `Frase chiave: «sono scesi da 42 a 30». Un terzo di 42 è 14: per un calo superiore a un terzo gli incidenti dovrebbero scendere sotto 28. Il calo è di 12 su 42, cioè circa il 29%: meno di un terzo. L'affermazione è contraddetta dai numeri.`,
  trap: `Rispondere «Non deducibile» perché il brano non dice se il calo dipenda dal divieto: l'affermazione non parla di cause, descrive solo l'entità del calo, che si calcola dai due numeri. Oppure arrotondare 29% a «circa un terzo».`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 3 ---------- */
{ n: 3, area: 'DI', diff: 'facile', lang: 'it', ds: true,
  stem: ds('Quanti anni ha Livia?',
    'Livia ha 6 anni più di suo fratello Teo.',
    'Tra 4 anni la somma delle età di Livia e di Teo sarà 30.'),
  opts: DSOPTS, ans: 2,
  sol: `Dalla (1): L = T + 6. Dalla (2): L + T = 22. Da sola la (1) lascia libera T; da sola la (2) non separa le due età. Insieme: 2T + 6 = 22, quindi T = 8 e L = 14.`,
  trap: `Pensare che la (2) basti perché «dà una somma»: una somma non fissa le due età (potrebbero essere 11 e 11, 10 e 12…). Serve anche la differenza della (1).`,
  patt: 'Sufficienza dei dati' },

/* ---------- 4 ---------- */
{ n: 4, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Per una gita scolastica, se ogni studente paga 12 € mancano 30 € per coprire la spesa; se ogni studente paga 15 € avanzano 15 €. Quanti sono gli studenti?`,
  opts: ['15', '20', '30', '45'], ans: 0,
  sol: `Sia n il numero degli studenti: la spesa è 12n + 30 = 15n − 15. Quindi 45 = 3n e n = 15 (spesa 210 €: 12 · 15 + 30 = 210 = 15 · 15 − 15).`,
  trap: `Fermarsi a uno dei due scarti (30 €) o alla loro somma (45 €), che sono importi in euro: vanno divisi per la differenza di quota (3 € a testa).`,
  patt: 'Equazioni e problemi a parole' },

/* ---------- 5 ---------- */
{ n: 5, area: 'DI', diff: 'difficile', lang: 'it', asset: tFarina(),
  stem: `Qual è il prezzo medio pagato per chilo di farina nel mese?`,
  opts: ['2,40 €', '2,80 €', '3,00 €', '3,50 €'], ans: 1,
  sol: `Chili acquistati: 400 ÷ 2 = 200; 600 ÷ 3 = 200; 400 ÷ 4 = 100, cioè 500 kg. Spesa totale: 400 + 600 + 400 = 1.400 €. Prezzo medio: 1.400 ÷ 500 = 2,80 €/kg.`,
  trap: `Fare la media dei tre prezzi, (2 + 3 + 4) ÷ 3 = 3,00 €, oppure pesarli con la spesa (viene ancora 3,00 €): i pesi giusti sono i chili. Il fornitore più economico ha venduto più chili di quanto la spesa faccia pensare.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 6 ---------- */
{ n: 6, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel 2025 il 70% degli assegnatari degli orti comunali di Vallechiara aveva più di 60 anni e il 15% ne aveva meno di 40. Il regolamento prevede che l'orto possa essere assegnato a qualsiasi residente che ne faccia richiesta.`,
  claim: `Nel 2025 la maggior parte degli assegnatari degli orti comunali di Vallechiara era in pensione.`,
  opts: VFN, ans: 2,
  sol: `Il brano dà l'età degli assegnatari (il 70% ha più di 60 anni) ma non dice nulla sulla loro condizione lavorativa. Avere più di 60 anni non significa essere in pensione, e il regolamento non lega gli orti ai pensionati: l'affermazione non è né confermata né smentita.`,
  trap: `Rispondere «Vera» perché «più di 60 anni» fa pensare ai pensionati: è un'inferenza plausibile ma non scritta nel testo. «Non deducibile» non vuol dire «improbabile», vuol dire che il testo non basta.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 7 ---------- */
{ n: 7, area: 'Q', diff: 'facile', lang: 'it',
  stem: `In un torneo a eliminazione diretta partecipano 16 squadre: chi perde una partita è eliminato. Quante partite si giocano in tutto fino alla proclamazione del vincitore?`,
  opts: ['15', '16', '31', '120'], ans: 0,
  sol: `Ogni partita elimina esattamente una squadra. Per arrivare a una sola squadra rimasta ne vanno eliminate 15, quindi si giocano 15 partite (8 + 4 + 2 + 1).`,
  trap: `Rispondere 16 (una partita per squadra) oppure 120 (ogni squadra contro ogni altra, come in un girone all'italiana): qui nessuna coppia si affronta due volte e chi perde esce.`,
  patt: 'Conteggio' },

/* ---------- 8 ---------- */
{ n: 8, area: 'DI', diff: 'difficile', lang: 'it', asset: tSezioni(),
  stem: `Quale delle seguenti affermazioni è corretta?`,
  opts: [`La media complessiva è aumentata, perché è aumentata in entrambe le sezioni.`,
         `La media complessiva è rimasta invariata, perché i due aumenti si compensano.`,
         `La media complessiva non si può confrontare senza conoscere i voti dei singoli studenti.`,
         `La media complessiva è diminuita, anche se è aumentata in entrambe le sezioni.`], ans: 3,
  sol: `Anno 1: (80 · 8,0 + 20 · 5,0) ÷ 100 = (640 + 100) ÷ 100 = 7,4. Anno 2: (20 · 8,5 + 80 · 5,5) ÷ 100 = (170 + 440) ÷ 100 = 6,1. La media complessiva scende perché nel secondo anno quasi tutti gli studenti stanno nella sezione con il voto più basso.`,
  trap: `Ragionare sulle medie delle sezioni come se dicessero da sole cosa accade al totale: la media complessiva è ponderata e dipende da quanti studenti ci sono in ogni sezione, che cambia da un anno all'altro.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 9 ---------- */
{ n: 9, area: 'V', diff: 'media', lang: 'it',
  passage: `Uno studio su 500 imprese ha rilevato che quelle che investono di più nella formazione dei dipendenti hanno, in media, profitti per addetto più alti. Gli autori concludono che la formazione fa aumentare i profitti.`,
  stem: `Quale delle seguenti informazioni, se vera, indebolisce di più la conclusione degli autori?`,
  opts: [`Le spese di formazione sono in parte detraibili dalle imposte.`,
         `Le imprese con profitti più alti hanno più risorse da destinare alla formazione dei dipendenti.`,
         `Lo studio ha incluso imprese di tutte le dimensioni e di tutti i settori.`,
         `Nelle imprese analizzate la formazione si svolge quasi sempre in orario di lavoro.`], ans: 1,
  sol: `Se sono i profitti a rendere possibile la formazione, la relazione osservata c'è ma la causa e l'effetto sono invertiti rispetto alla tesi degli autori. È una spiegazione alternativa della stessa correlazione.`,
  trap: `Cercare un difetto nel campione (l'opzione C è anzi un punto di forza dello studio) o nei costi (A e D): nessuna di queste offre un'altra spiegazione del legame tra formazione e profitti.`,
  patt: 'Cause alternative' },

/* ---------- 10 ---------- */
{ n: 10, area: 'Q', diff: 'media', lang: 'it',
  stem: `Cinque carte sono numerate da 1 a 5. Se ne estraggono due a caso, senza rimettere la prima nel mazzo. Qual è la probabilità che la somma dei due numeri sia pari?`,
  opts: [fr(2, 5), fr(1, 2), fr(3, 5), fr(3, 4)], ans: 0,
  sol: `La somma è pari solo se i due numeri hanno la stessa parità. Le coppie possibili sono 10. Due dispari (tra 1, 3, 5): 3 coppie; due pari (2 e 4): 1 coppia. Favorevoli 4 su 10, cioè ${fr(2, 5)}.`,
  trap: `Rispondere ${fr(1, 2)} come se somma pari e somma dispari fossero ugualmente probabili: tra le carte i numeri dispari sono 3 e i pari 2, quindi le coppie «uguali» sono meno della metà.`,
  patt: 'Probabilità e combinatoria' },

/* ---------- 11 ---------- */
{ n: 11, area: 'DI', diff: 'facile', lang: 'it', ds: true,
  stem: ds('Dati due numeri reali x e y, è vero che x &gt; y?',
    'x² &gt; y²',
    'x &gt; 0 e y &lt; 0'),
  opts: DSOPTS, ans: 1,
  sol: `La (2) basta: un numero positivo è sempre maggiore di uno negativo, quindi x > y. La (1) da sola no: x² > y² vale sia per x = 5, y = 2 (x > y) sia per x = −5, y = 2 (x < y).`,
  trap: `Leggere x² > y² come se fosse x > y: elevando al quadrato si perde il segno, e la (1) dice soltanto che x è più lontano da zero di y.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 12 ---------- */
{ n: 12, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Il bando di concorso resta aperto dal 1° al 30 settembre. L'elenco degli ammessi sarà pubblicato entro 15 giorni dalla chiusura del bando. Ogni candidato può presentare ricorso entro 10 giorni dalla pubblicazione dell'elenco.`,
  claim: `Un candidato può presentare ricorso anche 28 giorni dopo la chiusura del bando.`,
  opts: VFN, ans: 1,
  sol: `Frasi chiave: elenco «entro 15 giorni» dalla chiusura, ricorso «entro 10 giorni» dalla pubblicazione. Nel caso più lungo la pubblicazione avviene dopo 15 giorni e il ricorso arriva 10 giorni dopo: al massimo 25 giorni dalla chiusura. 28 giorni non è possibile in nessun caso.`,
  trap: `Rispondere «Non deducibile» perché la data esatta di pubblicazione dell'elenco non è fissata: non serve conoscerla, basta il limite massimo (15 + 10 = 25 giorni), che resta sotto i 28.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 13 ---------- */
{ n: 13, area: 'Q', diff: 'media', lang: 'it',
  stem: `Una password è formata da 4 cifre scelte tra 1, 2, 3, 4, 5 e 6, senza ripetere nessuna cifra, e deve iniziare con una cifra dispari. Quante password sono possibili?`,
  opts: ['120', '150', '180', '240'], ans: 2,
  sol: `Prima cifra: 3 scelte (1, 3 o 5). Le altre tre, senza ripetizioni, tra le 5 cifre rimaste: 5 · 4 · 3 = 60. Totale 3 · 60 = 180. (Controllo: le password senza vincolo sono 6 · 5 · 4 · 3 = 360 e la metà inizia con una cifra dispari.)`,
  trap: `Contare 4 cifre «dispari» di partenza (4 · 60 = 240) o usare solo tre posti (6 · 5 · 4 = 120): le cifre dispari fra 1 e 6 sono 3 e la password ha 4 posti.`,
  patt: 'Combinazioni vs permutazioni' },

/* ---------- 14 ---------- */
{ n: 14, area: 'DI', diff: 'difficile', lang: 'it', asset: tProgetto(),
  stem: `Il progetto termina quando sono concluse tutte le attività; le attività che non dipendono l'una dall'altra possono svolgersi in parallelo. Se la durata dell'attività C passasse da 2 a 5 giorni, di quanti giorni aumenterebbe la durata minima del progetto?`,
  opts: ['1 giorno', '2 giorni', '3 giorni', '4 giorni'], ans: 0,
  sol: `Prima: A dal giorno 0 al 3; B dal 3 al 7; C dal 3 al 5; D parte quando finiscono B e C (giorno 7) e termina al 12; E dal 5 all'8. Durata 12. Con C di 5 giorni: C finisce all'8, quindi D parte all'8 (non più al 7) e termina al 13; E va dall'8 all'11. Durata 13: aumenta di 1 giorno.`,
  trap: `Aggiungere i 3 giorni di ritardo di C alla durata totale. C finiva al giorno 5, mentre B finiva al 7: aveva 2 giorni di margine che assorbono parte del ritardo.`,
  patt: 'Percorso critico' },

/* ---------- 15 ---------- */
{ n: 15, area: 'V', diff: 'difficile', lang: 'it',
  passage: `In un'azienda di 50 dipendenti, 32 vengono al lavoro in bicicletta e 25 con i mezzi pubblici.`,
  stem: `Quale delle seguenti affermazioni è sicuramente vera?`,
  opts: [`Al più 7 dipendenti usano entrambi i mezzi.`,
         `Esattamente 7 dipendenti usano entrambi i mezzi.`,
         `Nessun dipendente usa soltanto la bicicletta.`,
         `Almeno 7 dipendenti usano entrambi i mezzi.`], ans: 3,
  sol: `32 + 25 = 57 persone «contate» su 50 dipendenti: almeno 57 − 50 = 7 sono contate due volte, quindi usano entrambi i mezzi. Il numero può essere anche più alto (fino a 25). Quindi D è sicura; A e B non lo sono; C è falsa: chi usa solo la bici è almeno 32 − 25 = 7.`,
  trap: `Scegliere «esattamente 7»: 32 + 25 − 50 è solo il minimo. Il brano non dice che ogni dipendente usi almeno un mezzo né quanti usino entrambi, quindi il numero può essere maggiore.`,
  patt: 'Quantificatori e deduzioni' },

/* ---------- 16 ---------- */
{ n: 16, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `In un'azienda i 40 impiegati hanno una retribuzione media di 1.600 € e i dirigenti una retribuzione media di 4.000 €. La retribuzione media di tutti i dipendenti è 2.000 €. Quanti sono i dirigenti?`,
  opts: ['5', '6', '8', '10'], ans: 2,
  sol: `Distanze dalla media generale: gli impiegati stanno 400 € sotto, i dirigenti 2.000 € sopra. I numeri stanno in rapporto inverso alle distanze: impiegati : dirigenti = 2.000 : 400 = 5 : 1. Con 40 impiegati i dirigenti sono 8. Controllo: (40 · 1.600 + 8 · 4.000) ÷ 48 = 96.000 ÷ 48 = 2.000.`,
  trap: `Ragionare come se la media generale fosse a metà strada tra le due medie (2.800 €): la media 2.000 € è molto vicina a quella degli impiegati, quindi i dirigenti sono pochi rispetto a loro. Attenzione anche a non invertire il rapporto.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 17 ---------- */
{ n: 17, area: 'DI', diff: 'media', lang: 'it', asset: gSoci(),
  stem: `In quale classe di età si trova l'età mediana dei soci?`,
  opts: ['18–24', '25–34', '35–44', '55 e oltre'], ans: 1,
  sol: `Soci in tutto: 55 + 30 + 15 + 10 + 40 = 150. La mediana è l'età che sta in mezzo: tra il 75° e il 76° socio in ordine di età. La prima classe contiene i soci dall'1° al 55°, la seconda dal 56° all'85°: il 75° e il 76° sono lì, quindi 25–34.`,
  trap: `Scegliere la classe con la colonna più alta (18–24 è la moda, non la mediana) oppure quella che sta in mezzo nel grafico (35–44): la mediana si trova contando i soci, non guardando la posizione delle colonne.`,
  patt: 'Mediana vs moda' },

/* ---------- 18 ---------- */
{ n: 18, area: 'V', diff: 'facile', lang: 'it',
  passage: `Il museo della scienza ha due sedi. Nella sede centrale tutte le visite guidate si svolgono su prenotazione. Nella sede distaccata le visite guidate sono libere il sabato, mentre negli altri giorni richiedono la prenotazione.`,
  claim: `In nessun giorno della settimana nella sede centrale si può fare una visita guidata senza prenotazione.`,
  opts: VFN, ans: 0,
  sol: `Frase chiave: «nella sede centrale tutte le visite guidate si svolgono su prenotazione». Se tutte richiedono la prenotazione, nessuna è libera, in qualunque giorno.`,
  trap: `Rispondere «Non deducibile» perché il brano non nomina i giorni della sede centrale, oppure confondere le due sedi: il sabato libero vale solo per la sede distaccata.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 19 ---------- */
{ n: 19, area: 'Q', diff: 'media', lang: 'it',
  stem: `La somma di due numeri positivi è 50 e la differenza dei loro quadrati è 500. Qual è il numero maggiore?`,
  opts: ['10', '20', '25', '30'], ans: 3,
  sol: `a² − b² = (a + b)(a − b). Quindi 500 = 50 · (a − b) e a − b = 10. Con a + b = 50 si ha a = 30 e b = 20 (controllo: 900 − 400 = 500).`,
  trap: `Rispondere 25 (la metà della somma, valida solo se i numeri fossero uguali) oppure 10 (la differenza, non il numero maggiore).`,
  patt: 'Equazioni e problemi a parole' },

/* ---------- 20 ---------- */
{ n: 20, area: 'DI', diff: 'media', lang: 'it', asset: tPrezzi(),
  stem: `Il costo variabile è di 3 € per unità e non ci sono altri costi. A quale prezzo è massimo il margine complessivo (ricavi meno costi)?`,
  opts: ['6 €', '7 €', '8 €', '9 €'], ans: 1,
  sol: `Margine = unità × (prezzo − 3). A 5 €: 100 · 2 = 200. A 6 €: 90 · 3 = 270. A 7 €: 75 · 4 = 300. A 8 €: 55 · 5 = 275. A 9 €: 30 · 6 = 180. Il massimo è a 7 €.`,
  trap: `Scegliere 6 €, il prezzo che massimizza i ricavi (90 · 6 = 540, contro 525 a 7 €): togliendo il costo di 3 € per unità conviene un prezzo più alto, anche se si vende un po' meno.`,
  patt: 'Margine e ottimizzazione' },

/* ---------- 21 ---------- */
{ n: 21, area: 'V', diff: 'media', lang: 'en',
  passage: `An airline reports that since it started offering free in-flight Wi-Fi, its average customer satisfaction score has risen from 7.1 to 7.6 (out of 10). The airline concludes that the free Wi-Fi improved customer satisfaction.`,
  stem: `Which of the following, if true, most weakens the airline's conclusion?`,
  opts: [`The Wi-Fi service is provided by a company that also serves other airlines.`,
         `Some passengers do not use the Wi-Fi during their flight.`,
         `In the same period the airline replaced its oldest aircraft with newer, more comfortable ones.`,
         `Satisfaction scores are collected through an online survey sent after each flight.`], ans: 2,
  sol: `Un cambiamento avvenuto nello stesso periodo (aerei nuovi e più comodi) è una spiegazione alternativa: i punteggi sarebbero potuti salire anche senza il Wi-Fi.`,
  trap: `Scegliere B: che alcuni passeggeri non usino il Wi-Fi non spiega perché i punteggi siano saliti. Anche D descrive solo il metodo di raccolta, che è lo stesso prima e dopo.`,
  patt: 'Cause alternative' },

/* ---------- 22 ---------- */
{ n: 22, area: 'Q', diff: 'media', lang: 'it',
  stem: `L'auto A consuma 6 litri ogni 100 km, l'auto B 8 litri ogni 100 km. Con 48 litri di carburante, quanti chilometri in più può percorrere l'auto A rispetto all'auto B?`,
  opts: ['200 km', '400 km', '600 km', '800 km'], ans: 0,
  sol: `Auto A: 48 ÷ 6 = 8 volte 100 km, cioè 800 km. Auto B: 48 ÷ 8 = 6 volte 100 km, cioè 600 km. Differenza: 200 km.`,
  trap: `Rispondere con la distanza di una sola auto (600 o 800 km) oppure confondere il verso del rapporto: consumare meno litri per 100 km significa percorrere più chilometri con lo stesso carburante.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 23 ---------- */
{ n: 23, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Tra il 2024 e il 2025 le vendite del negozio A sono cresciute, in percentuale, più di quelle del negozio B?',
    'Le vendite di A sono aumentate di 30.000 € e quelle di B di 20.000 €.',
    'Nel 2024 le vendite di A erano il doppio di quelle di B.'),
  opts: DSOPTS, ans: 2,
  sol: `Per una crescita percentuale servono l'aumento e la base. La (1) dà gli aumenti ma non le basi; la (2) dà il rapporto tra le basi ma nessun aumento. Insieme: se le vendite 2024 di B erano b, quelle di A erano 2b. Crescita di A = 30.000 ÷ 2b = 15.000 ÷ b; crescita di B = 20.000 ÷ b. B è cresciuto di più: la risposta («no») è la stessa per ogni valore di b.`,
  trap: `Pensare che la (1) basti: A è cresciuto di più in valore assoluto (30.000 contro 20.000), ma la domanda riguarda la percentuale, che dipende dalla base di partenza.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 24 ---------- */
{ n: 24, area: 'V', diff: 'facile', lang: 'it',
  passage: `Negli ultimi cinque anni, tra le famiglie italiane che hanno installato pannelli fotovoltaici sul tetto, la spesa media annua per l'elettricità è diminuita di circa il 40%. Il calo è stato maggiore per le famiglie che hanno installato anche un sistema di accumulo. Gli esperti avvertono però che il risparmio dipende dall'esposizione del tetto e dai consumi serali, e che non è ancora possibile stimare in modo affidabile in quanti anni l'impianto si ripaga.`,
  stem: `Quale delle seguenti affermazioni è supportata dal brano?`,
  opts: [`Il fotovoltaico riduce del 40% la spesa elettrica di ogni famiglia che lo installa.`,
         `Gli impianti fotovoltaici si ripagano in meno di cinque anni.`,
         `Il risparmio dipende soprattutto dai consumi serali.`,
         `Tra le famiglie con fotovoltaico, quelle che hanno anche un sistema di accumulo hanno ridotto la spesa più delle altre.`], ans: 3,
  sol: `Frase chiave: «Il calo è stato maggiore per le famiglie che hanno installato anche un sistema di accumulo». A trasforma una media («circa il 40%») in una regola per ogni famiglia; B è esclusa dall'ultima frase (non si può stimare); C: il testo cita esposizione e consumi serali senza metterli in graduatoria.`,
  trap: `Scegliere A: una riduzione media del 40% non vale per ogni singola famiglia. Il brano supporta solo ciò che dice, non le sue generalizzazioni.`,
  patt: 'Inferenza dal testo' },

/* ---------- 25 ---------- */
{ n: 25, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un negozio vende ogni articolo con un ricarico del 25% sul prezzo d'acquisto. Il guadagno del negozio è pari a quale percentuale del prezzo di vendita?`,
  opts: ['16,7%', '20%', '25%', '30%'], ans: 1,
  sol: `Se un articolo costa 100 €, viene venduto a 125 € e il guadagno è 25 €. Rispetto al prezzo di vendita: 25 ÷ 125 = 20%.`,
  trap: `Rispondere 25%: il ricarico si calcola sul prezzo d'acquisto (100 €), il guadagno richiesto è invece rapportato al prezzo di vendita (125 €). Cambia la base della percentuale.`,
  patt: 'Base della percentuale' },

/* ---------- 26 ---------- */
{ n: 26, area: 'DI', diff: 'difficile', lang: 'it',
  asset: dp(
    ['Una scuola ha quattro corsi: inglese, spagnolo, tedesco e cinese.',
     'Gli iscritti sono 120 in tutto e ognuno frequenta un solo corso.',
     'L\'inglese ha il doppio degli iscritti del cinese.',
     'Il tedesco ha 20 iscritti.',
     'Lo spagnolo ha più iscritti del tedesco.',
     'Il cinese ha almeno 10 iscritti.'],
    ['A. L\'inglese ha più iscritti dello spagnolo.',
     'B. Lo spagnolo ha almeno 22 iscritti.',
     'C. Il cinese ha meno iscritti del tedesco.',
     'D. L\'inglese ha almeno 20 iscritti.']),
  stem: `Leggi con attenzione i dati e le proposizioni. In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo B e D', 'Solo D', 'Solo A, B e D', 'Solo B, C e D'], ans: 0,
  sol: `Sia c gli iscritti al cinese: l'inglese ne ha 2c, il tedesco 20, lo spagnolo 120 − 20 − 3c = 100 − 3c. Da «spagnolo più del tedesco»: 100 − 3c > 20, cioè c ≤ 26; con c ≥ 10 si ha 10 ≤ c ≤ 26. B vera: lo spagnolo ha almeno 100 − 78 = 22 iscritti. D vera: 2c ≥ 20. A non è sicura (inglese 2c e spagnolo 100 − 3c: con c = 10 vince lo spagnolo, con c = 25 l'inglese). C non è sicura (c = 10 è minore di 20, c = 25 no).`,
  trap: `Considerare vere A o C perché valgono nei casi che vengono in mente per primi. «Sicuramente vera» richiede che la proposizione valga per tutti i valori di c compatibili con i dati.`,
  patt: 'Deduzioni con vincoli' },

/* ---------- 27 ---------- */
{ n: 27, area: 'V', diff: 'media', lang: 'it',
  passage: `Dopo la riapertura della linea ferroviaria Valdorba–Pieve, i passeggeri giornalieri sono passati da 1.200 a 1.900. Nello stesso periodo il prezzo dei carburanti è aumentato del 12%.`,
  claim: `Una parte dell'aumento dei passeggeri è dovuta all'aumento del prezzo dei carburanti.`,
  opts: VFN, ans: 2,
  sol: `Il brano accosta i due fatti nello stesso periodo ma non afferma alcun legame tra carburanti e passeggeri, e non lo esclude: potrebbe esserci o no. L'affermazione non è né confermata né smentita.`,
  trap: `Rispondere «Vera» perché è plausibile che carburanti più cari spingano verso il treno, oppure «Falsa» perché il brano sembra attribuire tutto alla riapertura. «Nello stesso periodo» non significa «a causa di», in nessuna delle due direzioni.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 28 ---------- */
{ n: 28, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `In un comune i residenti stranieri sono il 20% della popolazione. Nei prossimi anni la popolazione totale cresce del 10%, mentre il numero degli stranieri cresce del 32%. Quale sarà allora la quota degli stranieri sulla popolazione?`,
  opts: ['22%', '24%', '26,4%', '30%'], ans: 1,
  sol: `Con 100 residenti: gli stranieri sono 20. Dopo la crescita: stranieri 20 · 1,32 = 26,4 su una popolazione di 100 · 1,10 = 110. Quota: 26,4 ÷ 110 = 0,24, cioè 24%.`,
  trap: `Fermarsi a 26,4 (cioè «26,4%»): è il numero degli stranieri se la popolazione fosse rimasta 100. La quota è un rapporto e il denominatore è cresciuto del 10%.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 29 ---------- */
{ n: 29, area: 'DI', diff: 'media', lang: 'it', asset: tMezzi(),
  stem: `Tra tutti gli intervistati che vanno al lavoro in bici, quale percentuale ha meno di 35 anni?`,
  opts: ['40%', '60%', '75%', '80%'], ans: 3,
  sol: `Meno di 35 anni: 40% di 300 = 120 vanno in bici. Da 35 anni in su: 15% di 200 = 30. In bici vanno 150 persone; 120 su 150 = 80%.`,
  trap: `Rispondere 40% (la quota di chi usa la bici dentro il gruppo dei giovani) o 60% (la quota dei giovani sugli intervistati, 300 su 500). Qui si chiede quanti, tra chi usa la bici, sono giovani: servono i numeri assoluti.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 30 ---------- */
{ n: 30, area: 'V', diff: 'media', lang: 'it',
  passage: `Un'azienda vuole ridurre il numero di dimissioni offrendo un aumento di stipendio del 5% a tutti i dipendenti con più di due anni di anzianità. La direzione ritiene che così meno dipendenti lasceranno l'azienda.`,
  stem: `Su quale assunzione si basa principalmente il piano della direzione?`,
  opts: [`Tutti i dipendenti con più di due anni di anzianità desiderano un aumento.`,
         `I dipendenti con meno di due anni di anzianità non lasciano mai l'azienda.`,
         `Almeno una parte di chi lascia l'azienda lo fa per ragioni di stipendio, e un aumento del 5% può convincerli a restare.`,
         `Il 5% è il massimo aumento che l'azienda possa permettersi.`], ans: 2,
  sol: `Il piano funziona solo se lo stipendio è una delle cause delle dimissioni e se un aumento di quella misura può trattenere almeno alcuni dipendenti: senza questo, l'aumento non riduce le dimissioni.`,
  trap: `Scegliere A: è troppo forte («tutti») e non necessaria; il piano regge anche se solo una parte dei dipendenti apprezza l'aumento. B e D non riguardano il legame tra aumento e dimissioni.`,
  patt: 'Assunzione implicita' },

/* ---------- 31 ---------- */
{ n: 31, area: 'Q', diff: 'media', lang: 'it',
  stem: `Si sceglie a caso un numero intero tra 1 e 30 (estremi inclusi). Qual è la probabilità che sia un multiplo di 4 oppure di 6?`,
  opts: [fr(1, 3), fr(2, 5), fr(1, 2), fr(3, 5)], ans: 0,
  sol: `Multipli di 4: 4, 8, …, 28, cioè 7. Multipli di 6: 6, 12, …, 30, cioè 5. Multipli di entrambi (di 12): 12 e 24, cioè 2. Favorevoli: 7 + 5 − 2 = 10. Probabilità: 10 ÷ 30 = ${fr(1, 3)}.`,
  trap: `Sommare 7 + 5 = 12 (probabilità ${fr(2, 5)}): 12 e 24 sono contati due volte, sono multipli sia di 4 sia di 6.`,
  patt: 'Probabilità e combinatoria' },

/* ---------- 32 ---------- */
{ n: 32, area: 'DI', diff: 'media', lang: 'en', ds: true,
  stem: ds('Was the cyclist\'s average speed greater than 20 km/h?',
    'The distance covered was 60 km and the ride took less than 3 hours.',
    'The cyclist\'s top speed during the ride was 35 km/h.'),
  opts: DSOPTS_EN, ans: 0,
  sol: `Con la (1): velocità media = 60 km ÷ tempo, e con tempo inferiore a 3 ore la media è superiore a 60 ÷ 3 = 20 km/h. Basta. La (2) dà solo la velocità massima: la media può essere molto più bassa (soste, salite).`,
  trap: `Pensare che serva anche la (2), oppure che 35 km/h «di punta» dica qualcosa sulla media. Una velocità massima non fissa la velocità media.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 33 ---------- */
{ n: 33, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel 2020 il 30% dei 1.000 laureati di un ateneo ha trovato lavoro entro sei mesi. Nel 2025 la percentuale è salita al 40%, ma i laureati dell'anno sono stati soltanto 600.`,
  claim: `Nel 2025 hanno trovato lavoro entro sei mesi più laureati che nel 2020.`,
  opts: VFN, ans: 1,
  sol: `2020: 30% di 1.000 = 300 laureati occupati. 2025: 40% di 600 = 240. Poiché 240 è minore di 300, nel 2025 hanno trovato lavoro meno laureati: l'affermazione è falsa.`,
  trap: `Guardare solo le percentuali (40% contro 30%) e rispondere «Vera». Le basi sono diverse (1.000 contro 600): una percentuale più alta può corrispondere a un numero più basso.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 34 ---------- */
{ n: 34, area: 'Q', diff: 'media', lang: 'it',
  stem: `Sei operai, lavorando 8 ore al giorno, finiscono un lavoro in 10 giorni. Quanti giorni servono a 5 operai che lavorano 6 ore al giorno, con lo stesso ritmo di lavoro?`,
  opts: ['12', '14', '16', '20'], ans: 2,
  sol: `Il lavoro vale 6 · 8 · 10 = 480 ore di lavoro. Ogni giorno 5 operai da 6 ore ne fanno 30. Giorni: 480 ÷ 30 = 16.`,
  trap: `Correggere un solo fattore: con soli 5 operai al posto di 6 si avrebbero 12 giorni, ma le ore giornaliere scendono da 8 a 6 e allungano ancora i tempi.`,
  patt: 'Proporzioni composte' },

/* ---------- 35 ---------- */
{ n: 35, area: 'DI', diff: 'media', lang: 'it', asset: gDivisioni(),
  stem: `Quale delle seguenti affermazioni è sicuramente corretta?`,
  opts: [`Nel 2025 il fatturato di Alfa è maggiore di quello di Beta.`,
         `Nel 2025 il fatturato complessivo delle tre divisioni è maggiore di quello del 2024.`,
         `In milioni di euro, Beta è cresciuta più di Alfa.`,
         `Nel 2025 il fatturato di Gamma è minore di quello del 2024.`], ans: 3,
  sol: `Alfa: 50 → 60 (+10 milioni). Beta: 80 → 88 (+8 milioni). A è falsa (60 è minore di 88) e C è falsa (8 è minore di 10). B dipende dal fatturato 2024 di Gamma, che non è riportato: −5% di un valore molto grande può superare i +18 milioni di Alfa e Beta insieme. D è sicura: −5% è un calo.`,
  trap: `Leggere le percentuali come valori assoluti: Alfa cresce di più in percentuale ma parte da una base più piccola di Beta. E scegliere B pensando che «due divisioni crescono e una cala»: la divisione che cala potrebbe essere molto grande.`,
  patt: 'Rapporti vs valori assoluti' },

/* ---------- 36 ---------- */
{ n: 36, area: 'V', diff: 'media', lang: 'it',
  passage: `Dopo l'installazione di dossi rallentatori in via Garibaldi, la velocità media dei veicoli è scesa da 52 a 41 km/h. Il comune ne conclude che i dossi hanno ridotto la velocità.`,
  stem: `Quale delle seguenti informazioni, se vera, rafforza di più la conclusione del comune?`,
  opts: [`Nello stesso periodo il traffico complessivo in via Garibaldi e il tipo di veicoli che la percorrono sono rimasti invariati.`,
         `Molti residenti dichiarano di apprezzare i dossi.`,
         `I dossi sono costati meno del previsto.`,
         `Via Garibaldi è una strada a senso unico.`], ans: 0,
  sol: `Se nello stesso periodo traffico e tipo di veicoli non sono cambiati, vengono escluse le spiegazioni alternative più probabili del calo di velocità (meno auto, più mezzi lenti): resta il nesso dossi → velocità. Le altre informazioni non toccano il rapporto causale.`,
  trap: `Scegliere B o C: sono informazioni vere e magari vantaggiose, ma non dicono nulla sul perché la velocità sia scesa. Rafforzare una tesi causale significa eliminare le cause alternative.`,
  patt: 'Cause alternative' },

/* ---------- 37 ---------- */
{ n: 37, area: 'Q', diff: 'media', lang: 'it',
  stem: `Da un gruppo di 6 persone si deve scegliere un capogruppo e, tra le altre cinque, un comitato di 2 persone (l'ordine dei due componenti non conta). In quanti modi si può fare?`,
  opts: ['30', '60', '90', '120'], ans: 1,
  sol: `Capogruppo: 6 scelte. Comitato tra le 5 persone rimaste: C(5, 2) = 5 · 4 ÷ 2 = 10. Totale 6 · 10 = 60.`,
  trap: `Contare l'ordine dei due componenti del comitato (5 · 4 = 20, quindi 6 · 20 = 120): il comitato è un insieme, non una sequenza.`,
  patt: 'Combinazioni vs permutazioni' },

/* ---------- 38 ---------- */
{ n: 38, area: 'DI', diff: 'media', lang: 'it', asset: gCanali(),
  stem: `Dopo il primo mese rinuncia al corso il 25% degli iscritti via web, il 50% di quelli via telefono e nessuno di quelli allo sportello. Quale percentuale degli iscritti totali ha rinunciato?`,
  opts: ['20%', '25%', '30%', '37,5%'], ans: 2,
  sol: `Iscritti: web 40% di 200 = 80, telefono 80, sportello 40. Rinunce: 25% di 80 = 20; 50% di 80 = 40; sportello 0. In tutto 60 su 200 = 30%.`,
  trap: `Fare la media semplice dei tre tassi, (25 + 50 + 0) ÷ 3 = 25%, oppure dei due tassi non nulli, (25 + 50) ÷ 2 = 37,5%. I canali hanno pesi diversi (40%, 40% e 20%): serve la media ponderata.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 39 ---------- */
{ n: 39, area: 'V', diff: 'media', lang: 'it',
  passage: `In un sondaggio su 800 lavoratori, il 55% ha dichiarato di lavorare da casa almeno un giorno a settimana; tra questi, uno su quattro lavora da casa almeno tre giorni a settimana.`,
  claim: `Più di 100 dei lavoratori intervistati lavorano da casa almeno tre giorni a settimana.`,
  opts: VFN, ans: 0,
  sol: `55% di 800 = 440 lavoratori lavorano da casa almeno un giorno. Un quarto di 440 = 110 lavorano da casa almeno tre giorni. 110 è più di 100: l'affermazione è vera.`,
  trap: `Applicare «uno su quattro» a tutti gli 800 intervistati (200) oppure rispondere «Non deducibile» perché il testo non dà il numero finale: si ricava da due passaggi successivi, ciascuno su una base diversa.`,
  patt: 'Percentuali annidate' },

/* ---------- 40 ---------- */
{ n: 40, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Qual è la cifra delle unità del numero 7<sup>2026</sup>?`,
  opts: ['1', '3', '7', '9'], ans: 3,
  sol: `Le cifre delle unità delle potenze di 7 si ripetono ogni 4 passi: 7, 9, 3, 1. Poiché 2026 = 4 · 506 + 2, la cifra è quella di 7² = 49, cioè 9.`,
  trap: `Sbagliare il resto della divisione per 4: 2026 non è multiplo di 4 (darebbe 1), ha resto 2. Anche scegliere 7 (esponente «dispari») dimentica il ciclo.`,
  patt: 'Cifre delle unità' },

/* ---------- 41 ---------- */
{ n: 41, area: 'DI', diff: 'media', lang: 'it', asset: tPiani(),
  stem: `Un cliente consuma ogni mese la stessa quantità di dati. A partire da quanti GB mensili il piano C costa meno sia del piano A sia del piano B?`,
  opts: ['Oltre 16 GB', 'Oltre 24 GB', 'Oltre 30 GB', 'Oltre 36 GB'], ans: 1,
  sol: `Piano A: 8 + 2 · (x − 10) supera 20 € per x maggiore di 16. Piano B: 14 + 1,5 · (x − 20) supera 20 € per x maggiore di 24. Il piano C (20 €) costa meno di entrambi solo oltre 24 GB (a 24 GB il piano B costa esattamente 20 €).`,
  trap: `Confrontare C solo con A (oltre 16 GB): tra 16 e 24 GB il piano B è ancora più economico di C (per esempio a 22 GB costa 17 €).`,
  patt: 'Lettura di tabelle' },

/* ---------- 42 ---------- */
{ n: 42, area: 'V', diff: 'difficile', lang: 'it',
  passage: `In una provincia il tasso di abbandono scolastico è sceso dal 12% al 9% dopo l'introduzione di un bonus di 300 euro per le famiglie con figli a rischio di abbandono. L'assessore attribuisce il calo al bonus.`,
  stem: `Quale delle seguenti informazioni, se vera, mette più in dubbio l'attribuzione dell'assessore?`,
  opts: [`Il bonus è stato erogato a circa 4.000 famiglie.`,
         `Il bonus è stato finanziato con fondi europei.`,
         `Nello stesso periodo il tasso di abbandono è sceso dal 12% al 9% anche nelle province confinanti, che non hanno introdotto alcun bonus.`,
         `Alcune famiglie hanno speso il bonus per esigenze diverse dalla scuola.`], ans: 2,
  sol: `Se il tasso scende nella stessa misura anche dove il bonus non c'è, il calo si spiega con fattori comuni a tutte le province (congiuntura, politiche nazionali) e il bonus non serve per spiegarlo. Il confronto con chi non ha ricevuto il bonus è decisivo.`,
  trap: `Scegliere D: se alcune famiglie non hanno usato il bonus per la scuola, l'effetto sarebbe più piccolo, ma non spiega perché il tasso sia sceso. Le opzioni A e B sono dettagli sul bonus, non sulle cause del calo.`,
  patt: 'Cause alternative' },

/* ---------- 43 ---------- */
{ n: 43, area: 'Q', diff: 'media', lang: 'it',
  stem: `Per superare un corso serve una media ponderata di almeno 24, in cui lo scritto pesa il 60% e l'orale il 40%. Allo scritto Sara ha preso 22. Quale voto minimo le serve all'orale?`,
  opts: ['24', '25', '26', '27'], ans: 3,
  sol: `0,6 · 22 + 0,4 · x ≥ 24 → 13,2 + 0,4x ≥ 24 → 0,4x ≥ 10,8 → x ≥ 27.`,
  trap: `Rispondere 26: sembra che basti compensare i 2 punti persi allo scritto con 2 punti in più all'orale (22 e 26 hanno media 24). Ma lo scritto pesa di più dell'orale: i 2 punti di meno valgono 0,6 · 2 = 1,2 e vanno recuperati con un peso di 0,4, quindi servono 3 punti in più.`,
  patt: 'Media ponderata vs semplice' },

/* ---------- 44 ---------- */
{ n: 44, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Il prezzo medio d\'acquisto per capo, in un negozio di abbigliamento, è inferiore a 30 €?',
    'Il negozio ha acquistato 100 capi in tutto.',
    'Il 60% dei capi è stato pagato 25 € l\'uno.'),
  opts: DSOPTS, ans: 3,
  sol: `Insieme sappiamo che 60 capi sono costati 25 € l'uno (1.500 €) ma non il prezzo degli altri 40. Se costano in media p, la media è (1.500 + 40p) ÷ 100: con p = 30 vale 27 (inferiore a 30), con p = 50 vale 35 (superiore). La risposta cambia: i dati non bastano.`,
  trap: `Supporre che gli altri capi costino come i primi, o poco più: il testo non dice nulla sul 40% restante, che può far salire la media sopra 30 €.`,
  patt: 'Sufficienza dei dati' },

/* ---------- 45 ---------- */
{ n: 45, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel 2025 il 38% dei dipendenti di un grande gruppo bancario ha lavorato da remoto almeno due giorni a settimana, contro il 12% del 2020. La banca ha ridotto del 20% la superficie degli uffici, mentre i costi di manutenzione sono rimasti stabili perché sono stati ampliati i servizi digitali. Il gruppo non ha rilevato variazioni significative nel numero di clienti serviti per dipendente.`,
  stem: `Quale delle seguenti affermazioni è contraddetta dal brano?`,
  opts: [`I costi di manutenzione del gruppo sono diminuiti del 20%.`,
         `La banca ha ridotto il numero dei suoi dipendenti.`,
         `Nel 2025 la quota di dipendenti che lavorano da remoto almeno due giorni è più che tripla rispetto al 2020.`,
         `Nel gruppo il numero di clienti serviti per dipendente è rimasto sostanzialmente costante.`], ans: 0,
  sol: `Frase chiave: «i costi di manutenzione sono rimasti stabili». L'opzione A dice il contrario (−20%: è la riduzione della superficie, non dei costi). B non è né scritta né negata nel brano; C è vera (38 ÷ 12 ≈ 3,2); D riprende l'ultima frase.`,
  trap: `Scegliere B perché «non è scritta nel brano»: ciò che manca nel testo non è contraddetto, è solo non deducibile. La domanda chiede ciò che il brano esclude, non ciò che non dice.`,
  patt: 'Falso vs Non deducibile' },

/* ---------- 46 ---------- */
{ n: 46, area: 'Q', diff: 'difficile', lang: 'en',
  stem: `A group of friends rented a van for 240 € and split the cost equally. Two of them dropped out, so each of the remaining friends had to pay 20 € more. How many friends were in the group originally?`,
  opts: ['5', '6', '8', '10'], ans: 1,
  sol: `Con n amici ciascuno paga 240 ÷ n; con n − 2 amici, 240 ÷ (n − 2). Per n = 6: 40 € contro 60 €, differenza 20 € ✓. (Algebra: 240 · 2 = 20 · n(n − 2), cioè n² − 2n − 24 = 0, quindi n = 6.) Le altre opzioni: n = 5 → 48 e 80 (differenza 32); n = 8 → 30 e 40 (10); n = 10 → 24 e 30 (6).`,
  trap: `Trattare l'aumento come se fosse proporzionale al numero di amici usciti (per esempio 2 amici → 10 € a testa): la quota cambia in modo non lineare, conviene provare le opzioni.`,
  patt: 'Equazioni e problemi a parole' },

/* ---------- 47 ---------- */
{ n: 47, area: 'Q', diff: 'media', lang: 'it',
  stem: `Sulla scala mobile ferma Luca sale a piedi in 60 secondi. Con la scala mobile in funzione, camminando alla stessa velocità, sale in 40 secondi. Quanti secondi impiegherebbe stando fermo sulla scala in funzione?`,
  opts: ['60 s', '100 s', '120 s', '150 s'], ans: 2,
  sol: `In un secondo Luca percorre ${fr(1, 60)} della scala a piedi, ${fr(1, 40)} con la scala in funzione. La scala da sola ne percorre ${fr(1, 40)} − ${fr(1, 60)} = ${fr(1, 120)} al secondo: 120 secondi per salire.`,
  trap: `Sommare o sottrarre i tempi (60 + 40 = 100; 60 − 40 = 20). Si sommano le velocità, cioè le frazioni di scala percorse in un secondo, non i tempi.`,
  patt: 'Tassi, lavoro e velocità' },

/* ---------- 48 ---------- */
{ n: 48, area: 'V', diff: 'media', lang: 'it',
  passage: `Tutti i corsi di statistica dell'ateneo sono obbligatori. Alcuni corsi obbligatori si tengono al primo anno. Nessun corso del primo anno prevede propedeuticità.`,
  stem: `Quale delle seguenti conclusioni segue necessariamente?`,
  opts: [`Alcuni corsi obbligatori non prevedono propedeuticità.`,
         `Alcuni corsi di statistica si tengono al primo anno.`,
         `Nessun corso di statistica prevede propedeuticità.`,
         `Tutti i corsi obbligatori si tengono al primo anno.`], ans: 0,
  sol: `Alcuni corsi obbligatori sono del primo anno, e nessun corso del primo anno ha propedeuticità: quindi quei corsi obbligatori non hanno propedeuticità (A). B non segue: i corsi obbligatori del primo anno potrebbero non essere di statistica. C e D estendono a «tutti» ciò che vale solo per «alcuni».`,
  trap: `Scegliere B o C: partono da «tutti i corsi di statistica sono obbligatori» e ne invertono il senso, come se tutti gli obbligatori fossero di statistica.`,
  patt: 'Quantificatori e deduzioni' },

/* ---------- 49 ---------- */
{ n: 49, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Quanto vale (${fr(1, 2)} + ${fr(1, 3)}) ÷ (${fr(1, 2)} − ${fr(1, 3)})?`,
  opts: [fr(5, 36), fr(1, 5), '1', '5'], ans: 3,
  sol: `Numeratore: ${fr(3, 6)} + ${fr(2, 6)} = ${fr(5, 6)}. Denominatore: ${fr(3, 6)} − ${fr(2, 6)} = ${fr(1, 6)}. Divisione: ${fr(5, 6)} ÷ ${fr(1, 6)} = 5.`,
  trap: `Moltiplicare per ${fr(1, 6)} invece di dividere (viene ${fr(5, 36)}) oppure capovolgere il quoziente (${fr(1, 5)}).`,
  patt: 'Frazioni' },

/* ---------- 50 ---------- */
{ n: 50, area: 'DI', diff: 'facile', lang: 'it', asset: gRisparmio(),
  stem: `Per la prima volta, dopo quanti mesi il saldo del piano B supera quello del piano A, e di quanto?`,
  opts: ['Dopo 3 mesi, di 50 €', 'Dopo 4 mesi, di 50 €', 'Dopo 4 mesi, di 90 €', 'Dopo 5 mesi, di 100 €'], ans: 1,
  sol: `Al mese 3 i due piani valgono entrambi 320 € (A: 200 + 3 · 40; B: 50 + 3 · 90): le linee si incontrano, nessuno dei due è sopra. Al mese 4: A 360 €, B 410 €. B supera A di 50 €.`,
  trap: `Scegliere il mese 3, dove le linee si toccano: lì i saldi sono uguali, il sorpasso avviene un mese dopo.`,
  patt: 'Lettura di grafici' }
];

return {
  id: '12',
  title: 'Mock 12',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Focus su Data Insights e sui cinque pattern d\'errore: sufficienza dei dati, medie ponderate, percentuali e valori assoluti, cause alternative.',
  questions: QUESTIONS,
  data: DATA
};
});
