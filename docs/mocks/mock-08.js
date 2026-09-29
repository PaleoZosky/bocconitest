/* =======================================================================
   Mock 08 — convertito da mock08-progetto.html (creato fuori dal repository)
   senza cambiare domande, risposte, soluzioni e dati dei grafici.
   Differenze di forma rispetto all'originale:
   - il flag `en:true` è diventato `lang:'en'` / `lang:'it'`;
   - `asset` contiene l'HTML già pronto (non più il nome dell'asset);
   - le domande di sufficienza dei dati usano `ds:true` e `stem` costruito
     con C.ds(), come nel Mock 07;
   - le tre tabelle usano C.table(); i grafici (colonne impilate, linee,
     barre orizzontali) restano quelli dell'originale, con gli stili in
     css/style.css.
   ======================================================================= */
(function (root, factory) {
  var C = (typeof module === 'object' && module.exports) ? require('../js/charts.js') : root.Charts;
  var mock = factory(C);
  if (typeof module === 'object' && module.exports) module.exports = mock;
  else { root.MOCKS = root.MOCKS || {}; root.MOCKS[mock.id] = mock; }
})(typeof self !== 'undefined' ? self : this, function (C) {
'use strict';

function fr(n, d){ return `<span class="fr" role="math" aria-label="${n} fratto ${d}"><span>${n}</span><span>${d}</span></span>`; }

const VFN = ['Vera', 'Falsa', 'Non deducibile'];
const DSOPTS = [
  'La (1) da sola è sufficiente, la (2) da sola no',
  'La (2) da sola è sufficiente, la (1) da sola no',
  'Servono entrambe insieme; nessuna delle due da sola basta',
  'Nemmeno insieme sono sufficienti'
];
const DSOPTS_EN = [
  'Statement (1) alone is sufficient, but statement (2) alone is not',
  'Statement (2) alone is sufficient, but statement (1) alone is not',
  'Both statements together are needed; neither alone is sufficient',
  'Even together, the statements are not sufficient'
];

/* ---------- tabelle ---------- */
function tRestaurants(){
  return C.table({
    caption: 'Ristoranti della catena, ottobre 2025',
    head: ['Ristorante', 'Coperti serviti', 'Scontrino medio per coperto'],
    rows: [['Arco', '3.000', '14 €'], ['Borgo', '4.000', '11 €'], ['Corte', '2.000', '17 €'], ['Duomo', '1.000', '50 €']]
  });
}

function tJobs(){
  return C.table({
    caption: 'Laureati 2024 per facoltà e condizione a un anno dalla laurea',
    head: ['Facoltà', 'Occupati', 'Non occupati', 'Totale'],
    rows: [['Economia', 180, 20, 200], ['Giurisprudenza', 100, 50, 150], ['Ingegneria', 120, 30, 150]],
    foot: ['Totale', 400, 100, 500]
  });
}

function tBudget(){
  return C.table({
    caption: 'Spesa del Comune per voce, in percentuale della spesa totale',
    head: ['Voce', '2024', '2025'],
    rows: [['Scuola', '30%', '35%'], ['Trasporti', '25%', '25%'], ['Servizi sociali', '20%', '25%'], ['Cultura', '10%', '5%'], ['Altro', '15%', '10%']],
    foot: ['Spesa totale', '50 milioni di €', '40 milioni di €']
  });
}

/* ---------- grafici (SVG, colori dai token del tema) ---------- */
const STACK = {
  years: ['2023', '2024', '2025'],
  series: [
    { k: 'Hardware', v: [60, 60, 54], c: 's1' },
    { k: 'Software', v: [30, 45, 60], c: 's2' },
    { k: 'Servizi',  v: [10, 15, 36], c: 's3' }
  ]
};
function cStack(){
  const W = 520, H = 300, L = 40, R = 12, T = 30, B = 34;
  const plotH = H - T - B, plotW = W - L - R, max = 160, k = plotH / max, base = T + plotH;
  const band = plotW / 3, cw = 60, gap = 2, r = 4;
  let g = '';
  for (const t of [0, 50, 100, 150]) {
    const y = base - t * k;
    g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 8}" y="${y + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  STACK.years.forEach((yr, i) => {
    const x = L + band * i + (band - cw) / 2;
    let yb = base, tot = 0;
    STACK.series.forEach((s, j) => {
      const v = s.v[i]; tot += v;
      const h = v * k, top = yb - h, y0 = top + gap;
      const isTop = j === STACK.series.length - 1;
      const d = isTop
        ? `M${x},${yb} V${y0 + r} Q${x},${y0} ${x + r},${y0} H${x + cw - r} Q${x + cw},${y0} ${x + cw},${y0 + r} V${yb} Z`
        : `M${x},${yb} V${y0} H${x + cw} V${yb} Z`;
      g += `<path d="${d}" style="fill:var(--${s.c})"><title>${s.k} ${yr}: ${v} milioni di €</title></path>`;
      const mid = (y0 + yb) / 2;
      if (yb - y0 >= 17) g += `<text x="${x + cw / 2}" y="${mid + 4}" class="in" style="fill:var(--on-${s.c})" text-anchor="middle">${v}</text>`;
      else g += `<text x="${x + cw + 6}" y="${mid + 4}" class="val">${v}</text>`;
      yb = top;
    });
    g += `<text x="${x + cw / 2}" y="${yb - 8}" class="total" text-anchor="middle">${tot}</text>`;
    g += `<text x="${x + cw / 2}" y="${base + 20}" class="tick" text-anchor="middle">${yr}</text>`;
  });
  const legend = STACK.series.map(s => `<li><i class="sw" style="background:var(--${s.c})"></i>${s.k}</li>`).join('');
  return `<figure class="fig"><figcaption>Fatturato per linea di prodotto, in milioni di €</figcaption>
<ul class="legend">${legend}</ul>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Colonne impilate. 2023: Hardware 60, Software 30, Servizi 10, totale 100. 2024: Hardware 60, Software 45, Servizi 15, totale 120. 2025: Hardware 54, Software 60, Servizi 36, totale 150.">${g}</svg></div>
<p class="fig-note">Il numero sopra ogni colonna è il fatturato totale dell'anno.</p></figure>`;
}

const IDX = { years: [2021, 2022, 2023, 2024, 2025], A: [100, 104, 117, 130, 143], B: [100, 110, 120, 135, 150] };
function cIndex(){
  const W = 520, H = 280, L = 40, R = 44, T = 20, B = 32, lo = 95, hi = 155;
  const x = i => L + (W - L - R) * i / 4;
  const y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  let g = '';
  for (let t = 100; t <= 150; t += 10) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="grid"></line>`;
    g += `<text x="${L - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  IDX.years.forEach((yr, i) => { g += `<text x="${x(i)}" y="${H - 8}" class="tick" text-anchor="middle">${yr}</text>`; });
  const line = (arr, c) => `<polyline points="${arr.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" style="stroke:var(--${c})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>`;
  const dots = (arr, c, name) => arr.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" style="fill:var(--${c});stroke:var(--paper)" stroke-width="2"><title>Prodotto ${name}, ${IDX.years[i]}: ${v}</title></circle>`).join('');
  g += line(IDX.B, 's2') + line(IDX.A, 's1') + dots(IDX.B, 's2', 'B') + dots(IDX.A, 's1', 'A');
  IDX.A.forEach((v, i) => { g += `<text x="${x(i)}" y="${y(v) + 19}" class="val" text-anchor="middle">${v}</text>`; });
  g += `<text x="${x(4)}" y="${y(150) - 11}" class="val" text-anchor="middle">150</text>`;
  return `<figure class="fig"><figcaption>Indice dei prezzi di due prodotti (2021 = 100)</figcaption>
<ul class="legend"><li><i class="sw line" style="background:var(--s1)"></i>Prodotto A</li><li><i class="sw line" style="background:var(--s2)"></i>Prodotto B</li></ul>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Due linee dal 2021 al 2025. Prodotto A: 100, 104, 117, 130, 143. Prodotto B: 100, 110, 120, 135, 150.">${g}</svg></div>
<p class="fig-note">I valori sotto la linea sono quelli del prodotto A.</p></figure>`;
}

const SHARES = [['Alfa', 30, 26], ['Beta', 25, 24], ['Gamma', 20, 22], ['Delta', 15, 16], ['Epsilon', 10, 12]];
function cShares(){
  const W = 520, L = 70, R = 48, T = 6, rowH = 44, bh = 14, gap = 2, r = 4, max = 35;
  const H = T + rowH * SHARES.length + 26;
  const plotW = W - L - R, k = plotW / max, bottom = T + rowH * SHARES.length;
  let g = '';
  for (const t of [0, 10, 20, 30]) {
    const x = L + t * k;
    g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${bottom}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${x}" y="${bottom + 18}" class="tick" text-anchor="middle">${t}%</text>`;
  }
  const bar = (x0, y0, w, c, label) => {
    const x1 = x0 + w;
    return `<path d="M${x0},${y0} H${x1 - r} Q${x1},${y0} ${x1},${y0 + r} V${y0 + bh - r} Q${x1},${y0 + bh} ${x1 - r},${y0 + bh} H${x0} Z" style="fill:var(--${c})"><title>${label}</title></path>`;
  };
  SHARES.forEach(([name, a, b], i) => {
    const top = T + rowH * i + (rowH - (2 * bh + gap)) / 2;
    g += `<text x="${L - 10}" y="${top + bh + 4}" class="lab" text-anchor="end">${name}</text>`;
    g += bar(L, top, a * k, 'y1', `${name}, 2024: ${a}%`);
    g += bar(L, top + bh + gap, b * k, 'y2', `${name}, 2025: ${b}%`);
    g += `<text x="${L + a * k + 6}" y="${top + bh - 3}" class="val">${a}%</text>`;
    g += `<text x="${L + b * k + 6}" y="${top + 2 * bh + gap - 3}" class="val">${b}%</text>`;
  });
  return `<figure class="fig"><figcaption>Quote di mercato delle cinque imprese del settore</figcaption>
<p class="fig-key">Mercato totale: 200 milioni di € nel 2024, 250 milioni di € nel 2025.</p>
<ul class="legend"><li><i class="sw" style="background:var(--y1)"></i>2024</li><li><i class="sw" style="background:var(--y2)"></i>2025</li></ul>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Barre orizzontali, quota 2024 e 2025. Alfa 30% e 26%. Beta 25% e 24%. Gamma 20% e 22%. Delta 15% e 16%. Epsilon 10% e 12%.">${g}</svg></div></figure>`;
}

const ASSETS = { restaurants: tRestaurants, jobs: tJobs, budget: tBudget, stack: cStack, index: cIndex, shares: cShares };

/* ======================= LE 50 DOMANDE =======================
   area: Q quantitativa, V verbale, DI data insights
   ans: indice della risposta corretta (0 = A)                       */

const QUESTIONS = [
{ n: 1, area: 'Q', diff: 'facile',
  stem: `Cinque macchine identiche producono 5 pezzi in 5 minuti. Quante macchine identiche servono per produrre 100 pezzi in 100 minuti?`,
  opts: ['1', '5', '20', '100'], ans: 1,
  sol: `Ogni macchina produce 1 pezzo ogni 5 minuti, quindi 20 pezzi in 100 minuti. Per 100 pezzi servono 100 ÷ 20 = 5 macchine.`,
  trap: `Moltiplicare tutto per 20 e rispondere 100. Il tempo a disposizione cresce insieme ai pezzi, quindi il numero di macchine non cambia.`,
  patt: 'Tassi, lavoro e velocità' },

{ n: 2, area: 'DI', diff: 'facile', asset: 'restaurants',
  stem: `Quale ristorante ha incassato di più nel mese?`,
  opts: ['Arco', 'Borgo', 'Corte', 'Duomo'], ans: 3,
  sol: `Incasso = coperti × scontrino medio. Arco 42.000 €, Borgo 44.000 €, Corte 34.000 €, Duomo 50.000 €.`,
  trap: `Scegliere Borgo perché serve più coperti. Conta anche quanto spende ogni cliente.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 3, area: 'V', diff: 'facile',
  passage: `Il corso prevede 3 esami obbligatori e 6 esami facoltativi. Per ottenere il diploma bisogna superare tutti gli esami obbligatori e almeno uno degli esami facoltativi.`,
  claim: `Chi ottiene il diploma ha superato almeno 4 esami.`,
  opts: VFN, ans: 0,
  sol: `3 esami obbligatori più almeno 1 facoltativo fanno almeno 4 esami: l'affermazione segue dal testo.`,
  trap: `Rispondere «Non deducibile» perché non si sa quanti facoltativi abbia sostenuto ciascuno. Per dire «almeno 4» non serve saperlo.`,
  patt: 'Condizioni necessarie e sufficienti' },

{ n: 4, area: 'V', diff: 'media',
  passage: `Nel mese di luglio tutti i voli della compagnia Alfa in partenza da Milano hanno subito un ritardo di almeno 20 minuti. Il volo 312 è partito da Milano il 14 luglio.`,
  claim: `Il volo 312 ha subito un ritardo di almeno 20 minuti.`,
  opts: VFN, ans: 2,
  sol: `Il testo non dice che il volo 312 sia della compagnia Alfa. Senza questo collegamento la regola non si applica: non deducibile.`,
  trap: `Dare per scontato che il volo 312 sia di Alfa e rispondere «Vera».`,
  patt: 'Falso vs Non deducibile' },

{ n: 5, area: 'Q', diff: 'facile',
  stem: `Il tasso di interesse di riferimento passa dal 2,5% al 3%. Di quanto è cresciuto il tasso, in percentuale rispetto al valore iniziale?`,
  opts: ['0,5%', '5%', '16,7%', '20%'], ans: 3,
  sol: `L'aumento è di 0,5 punti percentuali. Rispetto al valore iniziale: ${fr('0,5', '2,5')} = 0,2, cioè +20%.`,
  trap: `0,5% confonde i punti percentuali con la variazione percentuale. 16,7% divide per il valore finale (${fr('0,5', '3')}) invece che per quello iniziale.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 6, area: 'DI', diff: 'facile', asset: 'stack',
  stem: `Nel 2025, quale percentuale del fatturato totale proviene dal Software?`,
  opts: ['30%', '40%', '45%', '60%'], ans: 1,
  sol: `Totale 2025: 54 + 60 + 36 = 150 milioni. Software: ${fr(60, 150)} = 40%.`,
  trap: `Leggere 60 milioni come se fossero il 60%, oppure usare la quota del 2023 (30%).`,
  patt: 'Lettura di grafici e tabelle' },

{ n: 7, area: 'DI', diff: 'difficile', asset: 'index',
  stem: `Nel 2025 il prodotto B costa più del prodotto A?`,
  opts: [`Sì, perché nel 2025 il suo indice è più alto`, `No, perché nell'ultimo anno il prodotto A è cresciuto di più`, `Sì, costa circa il 5% in più`, `Non si può stabilire con i dati del grafico`], ans: 3,
  sol: `Ogni indice misura la variazione del prezzo di quel prodotto rispetto al suo prezzo del 2021. Senza i prezzi di partenza i livelli non si confrontano: B potrebbe partire da un prezzo molto più basso di A.`,
  trap: `Trattare gli indici come prezzi e confrontare 150 con 143.`,
  patt: 'Sufficienza dei dati' },

{ n: 8, area: 'Q', diff: 'media',
  stem: `In un corso di 20 studenti la media dei voti è 24. Si aggiungono 5 studenti e la media dell'intero corso sale a 25. Qual è la media dei 5 nuovi studenti?`,
  opts: ['25', '26', '29', '30'], ans: 2,
  sol: `Somma iniziale 20 × 24 = 480. Somma finale 25 × 25 = 625. Ai 5 nuovi restano 625 − 480 = 145 punti: 145 ÷ 5 = 29.`,
  trap: `Scegliere 25 o 26 a intuito. Cinque studenti devono alzare di un punto la media di tutti e 25, quindi devono stare molto sopra.`,
  patt: 'Media ponderata vs semplice' },

{ n: 9, area: 'V', diff: 'media',
  stem: `Negli ultimi tre anni le banche hanno introdotto sistemi antifrode molto più efficaci, che riducono il rischio di frode su ogni singolo pagamento con carta. Eppure il numero totale di frodi con carta denunciate è aumentato. Quale delle seguenti, se vera, spiega meglio questa situazione?`,
  opts: [`Nello stesso periodo il numero di pagamenti con carta è triplicato.`, `Alcuni clienti non conoscono i nuovi sistemi antifrode.`, `Le frodi con assegni bancari sono diminuite.`, `I sistemi antifrode sono costati alle banche più del previsto.`], ans: 0,
  sol: `Il rischio per singolo pagamento è sceso, ma i pagamenti sono triplicati. Il numero di frodi può salire anche se il tasso di frode scende.`,
  trap: `Scegliere B. Che alcuni clienti non conoscano i sistemi non spiega perché il totale sia aumentato.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 10, area: 'Q', diff: 'difficile',
  stem: `Marco risparmia il 25% del suo reddito. Il reddito aumenta del 20% e le spese aumentano del 28%. Di quanto varia la somma che Marco risparmia?`,
  opts: ['−20%', '−8%', '−5%', '−4%'], ans: 3,
  sol: `Con reddito 100: spese 75, risparmio 25. Dopo: reddito 120, spese 75 × 1,28 = 96, risparmio 24. Variazione: ${fr('24 − 25', '25')} = −4%.`,
  trap: `La quota di risparmio passa dal 25% al 20% del reddito: sono −5 punti di quota (−20% in termini relativi), non la variazione della somma. −8% sottrae le due percentuali.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 11, area: 'V', diff: 'media',
  passage: `Uno studio su 3.000 adolescenti conclude che l'uso quotidiano dei social network peggiora la qualità del sonno. L'effetto però scompare quando l'uso termina almeno un'ora prima di andare a dormire.`,
  claim: `L'uso quotidiano dei social network peggiora sempre la qualità del sonno degli adolescenti.`,
  opts: VFN, ans: 1,
  sol: `Il testo indica un caso preciso in cui l'effetto scompare. «Sempre» è quindi contraddetto: falsa.`,
  trap: `Rispondere «Non deducibile». Il testo non tace: nomina esplicitamente l'eccezione.`,
  patt: 'Falso vs Non deducibile' },

{ n: 12, area: 'DI', diff: 'facile',
  ds: { q: `Un negozio ha venduto 120 articoli in una giornata. Quanti erano articoli scontati?`,
        s1: `Gli articoli scontati sono stati il 35% degli articoli venduti.`,
        s2: `Gli articoli non scontati hanno generato il 60% dei ricavi.` },
  opts: DSOPTS, ans: 0,
  sol: `La (1) basta: 35% di 120 = 42. La (2) parla di ricavi, non di pezzi: senza i prezzi non dice quanti articoli fossero scontati.`,
  trap: `Usare la quota dei ricavi come se fosse una quota di articoli.`,
  patt: 'Sufficienza dei dati' },

{ n: 13, area: 'V', diff: 'media',
  stem: `Nel 2025 le esportazioni di vino italiano verso il Giappone sono aumentate del 15% in valore e diminuite del 5% in volume. Quale delle seguenti affermazioni è meglio supportata da questi dati?`,
  opts: [`In Giappone il consumo complessivo di vino è diminuito.`, `Il vino italiano ha perso quote di mercato in Giappone.`, `Il prezzo medio al litro del vino italiano esportato in Giappone è aumentato.`, `Le esportazioni di vino italiano verso gli altri paesi sono diminuite.`], ans: 2,
  sol: `Valore = prezzo medio × volume. Se il valore sale e il volume scende, il prezzo medio è salito: ${fr('1,15', '0,95')} ≈ 1,21, circa +21%.`,
  trap: `Scegliere A o B. I dati riguardano solo il vino italiano: non dicono nulla sul consumo totale in Giappone né sui concorrenti.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 14, area: 'DI', diff: 'media', asset: 'shares',
  stem: `Quali imprese hanno visto diminuire le proprie vendite in euro tra il 2024 e il 2025?`,
  opts: ['Solo Alfa', 'Solo Beta', 'Alfa e Beta', 'Nessuna'], ans: 3,
  sol: `Vendite = quota × mercato. Alfa: 30% di 200 = 60 milioni, poi 26% di 250 = 65. Beta: 50, poi 60. Le quote scendono, ma il mercato cresce del 25%: tutte le vendite aumentano.`,
  trap: `Leggere un calo della quota come un calo delle vendite.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 15, area: 'Q', diff: 'facile',
  stem: `Quanti anagrammi, anche privi di significato, si possono formare usando tutte le lettere della parola CASA?`,
  opts: ['6', '12', '18', '24'], ans: 1,
  sol: `Con 4 lettere tutte diverse sarebbero 4! = 24. Scambiare le due A però non crea una parola nuova: 24 ÷ 2 = 12.`,
  trap: `Rispondere 24 trattando le due A come lettere diverse.`,
  patt: 'Probabilità e combinatoria' },

{ n: 16, area: 'DI', diff: 'media', asset: 'restaurants',
  stem: `Qual è lo scontrino medio per coperto dell'intera catena nel mese?`,
  opts: ['17 €', '20 €', '23 €', '25 €'], ans: 0,
  sol: `Incasso totale 42.000 + 44.000 + 34.000 + 50.000 = 170.000 €, su 10.000 coperti: 17 €.`,
  trap: `Fare la media semplice dei quattro scontrini: (14 + 11 + 17 + 50) ÷ 4 = 23 €. Duomo pesa poco perché serve pochi coperti.`,
  patt: 'Media ponderata vs semplice' },

{ n: 17, area: 'Q', diff: 'media',
  stem: `Due fornitori lavorano in modo indipendente. Il primo consegna in ritardo con probabilità del 20%, il secondo con probabilità del 30%. Qual è la probabilità che almeno una delle due consegne arrivi in ritardo?`,
  opts: ['6%', '44%', '50%', '56%'], ans: 1,
  sol: `Nessuna in ritardo: 0,8 × 0,7 = 0,56. Almeno una in ritardo: 1 − 0,56 = 0,44.`,
  trap: `Sommare le probabilità (50%): così il caso «entrambe in ritardo» viene contato due volte. 56% è la probabilità che nessuna sia in ritardo.`,
  patt: 'Probabilità e combinatoria' },

{ n: 18, area: 'V', diff: 'difficile',
  passage: `Secondo le condizioni di vendita, il rimborso viene concesso solo se la richiesta è presentata entro 30 giorni dall'acquisto. Marco ha presentato la richiesta 10 giorni dopo l'acquisto.`,
  claim: `Marco otterrà il rimborso.`,
  opts: VFN, ans: 2,
  sol: `«Solo se» indica una condizione necessaria, non sufficiente. Rispettare il termine non garantisce il rimborso: potrebbero esserci altri requisiti.`,
  trap: `Leggere «solo se» come «se» e rispondere «Vera».`,
  patt: 'Condizioni necessarie e sufficienti' },

{ n: 19, area: 'Q', diff: 'media',
  stem: `Un treno lungo 200 m viaggia a 72 km/h e attraversa un ponte lungo 400 m. Quanto tempo passa da quando la locomotiva entra sul ponte a quando l'ultimo vagone ne esce?`,
  opts: ['10 secondi', '20 secondi', '30 secondi', '50 secondi'], ans: 2,
  sol: `72 km/h = 20 m/s. Il treno deve percorrere il ponte più la propria lunghezza: 600 m ÷ 20 m/s = 30 s.`,
  trap: `Contare solo il ponte (20 s): anche l'ultimo vagone deve uscirne.`,
  patt: 'Tassi, lavoro e velocità' },

{ n: 20, area: 'V', diff: 'facile',
  passage: `Per essere ammessi al master è necessario ottenere almeno 100 punti al test d'ingresso. Quest'anno sono stati ammessi tutti i candidati con più di 120 punti e solo alcuni di quelli con un punteggio tra 100 e 120.`,
  claim: `Quest'anno è stato ammesso un candidato con 95 punti.`,
  opts: VFN, ans: 1,
  sol: `100 punti sono un requisito necessario: nessuno sotto i 100 può essere ammesso. L'affermazione contraddice il testo.`,
  trap: `Rispondere «Non deducibile» perché il testo non nomina chi ha meno di 100 punti. Il requisito necessario lo esclude già.`,
  patt: 'Condizioni necessarie e sufficienti' },

{ n: 21, area: 'DI', diff: 'media', asset: 'jobs',
  stem: `Quale percentuale degli occupati è laureata in Giurisprudenza?`,
  opts: ['25%', '30%', '66,7%', '80%'], ans: 0,
  sol: `Gli occupati sono 400, di cui 100 di Giurisprudenza: ${fr(100, 400)} = 25%.`,
  trap: `66,7% (${fr(100, 150)}) è la quota di occupati tra i laureati in Giurisprudenza. La base giusta sono gli occupati, non i laureati di quella facoltà.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 22, area: 'V', diff: 'media',
  stem: `Un'azienda di consegne ha adottato un nuovo software di pianificazione dei percorsi in 10 delle sue 60 filiali, e in quelle filiali i tempi medi di consegna sono scesi del 25%. Il direttore propone di adottarlo in tutte le filiali, prevedendo lo stesso risultato ovunque. Quale delle seguenti, se vera, indebolisce di più la previsione?`,
  opts: [`Il software richiede due giorni di formazione per gli autisti.`, `Le 10 filiali sono state scelte perché servono piccoli centri con strade poco trafficate, mentre le altre operano in grandi città congestionate.`, `Alcuni autisti preferivano pianificare i percorsi da soli.`, `Il fornitore del software offre uno sconto sulle installazioni successive.`], ans: 1,
  sol: `Le 10 filiali non sono rappresentative: un risultato ottenuto su strade libere potrebbe non ripetersi nel traffico delle grandi città.`,
  trap: `Scegliere C. La preferenza di alcuni autisti non dice nulla sui tempi di consegna.`,
  patt: 'Cause alternative' },

{ n: 23, area: 'DI', diff: 'media',
  ds: { q: `Un negozio vende solo due articoli: A a 10 € e B a 30 €. Il ricavo medio per articolo venduto è superiore a 20 €?`,
        s1: `Sono stati venduti più articoli B che articoli A.`,
        s2: `In totale sono stati venduti 100 articoli.` },
  opts: DSOPTS, ans: 0,
  sol: `La media vale esattamente 20 € solo se A e B sono venduti in numero uguale. Con più articoli B pesa di più il 30: la media supera 20 €. La (2) non dice nulla sulla composizione.`,
  trap: `Pensare di dover calcolare la media esatta, e quindi che servano entrambe. Basta sapere da che parte pende.`,
  patt: 'Sufficienza dei dati' },

{ n: 24, area: 'Q', diff: 'difficile',
  stem: `In un'azienda il 60% dei dipendenti sono uomini. Lavora part-time il 20% degli uomini e il 45% delle donne. Quale percentuale dei dipendenti part-time è costituita da donne?`,
  opts: ['18%', '40%', '45%', '60%'], ans: 3,
  sol: `Su 100 dipendenti: 60 uomini, di cui 12 part-time; 40 donne, di cui 18 part-time. Part-time in tutto 30, di cui donne 18: ${fr(18, 30)} = 60%.`,
  trap: `45% è la quota di part-time tra le donne; 18% è la quota di donne part-time su tutti i dipendenti. La base giusta sono i part-time.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 25, area: 'DI', diff: 'media', asset: 'stack',
  stem: `Quale linea di prodotto è cresciuta di più, in percentuale, tra il 2023 e il 2025?`,
  opts: ['Hardware', 'Software', 'Servizi', 'Software e Servizi, nella stessa misura'], ans: 2,
  sol: `Servizi: da 10 a 36, +260%. Software: da 30 a 60, +100%. Hardware: da 60 a 54, −10%.`,
  trap: `Scegliere il Software perché ha l'aumento più grande in milioni (+30 contro +26).`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 26, area: 'V', diff: 'media',
  passage: `Tra il 2019 e il 2025 il numero di librerie indipendenti in città è sceso da 45 a 28, mentre le librerie di catena sono rimaste 12. In città non esistono altri tipi di librerie.`,
  claim: `Nel 2025 le librerie indipendenti sono il 70% delle librerie della città.`,
  opts: VFN, ans: 0,
  sol: `Nel 2025 le librerie sono 28 + 12 = 40, e ${fr(28, 40)} = 70%. L'affermazione segue dai dati.`,
  trap: `Confrontare 28 con 45, il dato del 2019, e rispondere «Falsa».`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 27, area: 'Q', diff: 'media',
  stem: `Anna impiega 3 ore per preparare un report. Lavorando insieme a Bruno, ciascuno al proprio ritmo abituale, lo preparano in 2 ore. Quanto impiegherebbe Bruno da solo?`,
  opts: ['1 ora', '2 ore e 30 minuti', '5 ore', '6 ore'], ans: 3,
  sol: `In un'ora insieme fanno ${fr(1, 2)} del report, Anna da sola ${fr(1, 3)}. Bruno fa ${fr(1, 2)} − ${fr(1, 3)} = ${fr(1, 6)} all'ora: 6 ore.`,
  trap: `Sottrarre i tempi (3 − 2 = 1 ora). Si sottraggono i ritmi, non i tempi.`,
  patt: 'Tassi, lavoro e velocità' },

{ n: 28, area: 'Q', diff: 'difficile', en: true,
  stem: `A stationery shop buys pens at 5 for 3 € and sells them at 3 for 2 €. How many pens must it sell to make a profit of 20 €?`,
  opts: ['150', '300', '450', '600'], ans: 1,
  sol: `Si ragiona su 15 penne: costano 9 € (3 lotti da 5) e si vendono a 10 € (5 lotti da 3), con 1 € di guadagno. Per 20 € servono 20 × 15 = 300 penne.`,
  trap: `Confrontare i prezzi dei lotti senza riportarli alla stessa quantità di penne.`,
  patt: 'Equazioni e problemi a parole' },

{ n: 29, area: 'DI', diff: 'media', asset: 'budget',
  stem: `Quale voce ha mantenuto invariata la spesa in euro tra il 2024 e il 2025?`,
  opts: ['Scuola', 'Trasporti', 'Servizi sociali', 'Nessuna'], ans: 2,
  sol: `Servizi sociali: 20% di 50 = 10 milioni, poi 25% di 40 = 10 milioni. Trasporti mantiene la quota ma scende da 12,5 a 10 milioni.`,
  trap: `Scegliere Trasporti. Se il totale cambia, una quota invariata non significa una spesa invariata.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 30, area: 'V', diff: 'media',
  stem: `Marta sostiene: «Il nostro nuovo corso online ha avuto 2.000 iscritti nel primo mese, mentre il corso in aula ne ha 200 all'anno. Quindi il corso online forma molte più persone del corso in aula.» Su quale assunzione si basa il ragionamento?`,
  opts: [`Il corso online costa meno del corso in aula.`, `I docenti del corso online sono più qualificati di quelli del corso in aula.`, `Gli iscritti al corso in aula sono soddisfatti della didattica.`, `Una quota non trascurabile degli iscritti online porta a termine il corso.`], ans: 3,
  sol: `Il ragionamento passa da «iscritti» a «persone formate». Regge solo se una parte non trascurabile degli iscritti online completa il corso.`,
  trap: `Scegliere A. Il costo non collega il numero di iscritti al numero di persone formate.`,
  patt: 'Assunzioni e deduzioni' },

{ n: 31, area: 'V', diff: 'facile',
  passage: `Nel 2025 i ricavi di una catena alberghiera sono aumentati del 18%, soprattutto grazie alla crescita del turismo straniero.`,
  claim: `Nel 2025 l'utile della catena alberghiera è aumentato.`,
  opts: VFN, ans: 2,
  sol: `Il testo parla solo di ricavi. L'utile dipende anche dai costi, di cui non dice nulla: non deducibile.`,
  trap: `Confondere ricavi e utile e rispondere «Vera».`,
  patt: 'Falso vs Non deducibile' },

{ n: 32, area: 'Q', diff: 'media',
  stem: `In un gruppo di 10 studenti, 4 frequentano Economia. Se ne scelgono 2 a caso, qual è la probabilità che siano entrambi di Economia?`,
  opts: [fr(1, 15), fr(3, 25), fr(2, 15), fr(4, 25)], ans: 2,
  sol: `${fr(4, 10)} per il primo e ${fr(3, 9)} per il secondo: ${fr(4, 10)} × ${fr(3, 9)} = ${fr(12, 90)} = ${fr(2, 15)}.`,
  trap: `${fr(4, 25)} (= ${fr(4, 10)} × ${fr(4, 10)}) permette di scegliere due volte la stessa persona; ${fr(3, 25)} dimentica che al secondo passaggio restano 9 studenti; ${fr(1, 15)} divide le 6 coppie non ordinate per 90 casi ordinati.`,
  patt: 'Probabilità e combinatoria' },

{ n: 33, area: 'DI', diff: 'media', asset: 'index',
  stem: `In quale anno il prezzo del prodotto A è cresciuto di più, in percentuale, rispetto all'anno precedente?`,
  opts: ['2023', '2024', '2025', 'Nel 2023, nel 2024 e nel 2025 la crescita è stata uguale'], ans: 0,
  sol: `Dal 2023 l'indice di A sale di 13 punti all'anno, ma su una base sempre più alta: 2023 +12,5% (${fr(13, 104)}), 2024 +11,1% (${fr(13, 117)}), 2025 +10% (${fr(13, 130)}).`,
  trap: `Pensare che lo stesso aumento in punti significhi la stessa crescita percentuale.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 34, area: 'DI', diff: 'difficile',
  ds: { q: `Le vendite del reparto X, in euro, sono aumentate nel 2025 rispetto al 2024?`,
        s1: `La quota del reparto X sulle vendite totali del negozio è scesa dal 20% al 18%.`,
        s2: `Le vendite totali del negozio sono cresciute del 10%.` },
  opts: DSOPTS, ans: 2,
  sol: `Insieme: 18% × 1,10 = 19,8% del totale 2024, contro il 20%. Le vendite di X sono scese: la risposta è «no», ma è certa, quindi i dati bastano. Da sole non bastano: la quota senza il totale non dice nulla, e viceversa.`,
  trap: `Con la sola (1) concludere che le vendite sono scese. Una quota può scendere mentre le vendite salgono.`,
  patt: 'Sufficienza dei dati' },

{ n: 35, area: 'V', diff: 'difficile', en: true,
  stem: `A city council claims that its new online portal has made public services more efficient: in the year after the launch, the number of complaints received by the council fell by 40%. Which of the following, if true, most weakens the council's claim?`,
  opts: [`The portal was built for less than the planned budget.`, `Since the launch, complaints can only be submitted through the portal, which many elderly residents find hard to use.`, `Several residents praised the portal in a local newspaper.`, `Other cities have launched similar portals.`], ans: 1,
  sol: `Il calo dei reclami può dipendere dal fatto che presentarli è diventato più difficile, non da servizi migliori. È una spiegazione alternativa dello stesso dato.`,
  trap: `Scegliere C. Le lodi di alcuni residenti non indeboliscono la tesi: semmai la sostengono.`,
  patt: 'Cause alternative' },

{ n: 36, area: 'Q', diff: 'facile',
  stem: `Luca spende un terzo dello stipendio per l'affitto e un quarto di ciò che gli resta per la spesa alimentare. Quale frazione dello stipendio gli rimane?`,
  opts: [fr(1, 4), fr(1, 3), fr(5, 12), fr(1, 2)], ans: 3,
  sol: `Dopo l'affitto resta ${fr(2, 3)}. La spesa è ${fr(1, 4)} di ${fr(2, 3)} = ${fr(1, 6)}. Rimane ${fr(2, 3)} − ${fr(1, 6)} = ${fr(1, 2)}.`,
  trap: `${fr(5, 12)} (= 1 − ${fr(1, 3)} − ${fr(1, 4)}) calcola il quarto sull'intero stipendio invece che sul resto.`,
  patt: 'Percentuali, frazioni e crescita' },

{ n: 37, area: 'Q', diff: 'media',
  stem: `Un ciclista parte alle 9:00 e pedala a 18 km/h. Alle 9:40 un'auto parte dallo stesso punto, lungo la stessa strada e nella stessa direzione, a 48 km/h. A che ora l'auto raggiunge il ciclista?`,
  opts: ['9:51', '9:55', '10:04', '10:20'], ans: 2,
  sol: `Alle 9:40 il ciclista ha 12 km di vantaggio (18 km/h per ${fr(2, 3)} di ora). L'auto recupera 48 − 18 = 30 km ogni ora: ${fr(12, 30)} di ora = 24 minuti, quindi alle 10:04.`,
  trap: `Dividere il vantaggio per la velocità dell'auto (${fr(12, 48)} di ora = 15 minuti, cioè 9:55). Conta la differenza di velocità.`,
  patt: 'Tassi, lavoro e velocità' },

{ n: 38, area: 'DI', diff: 'media', asset: 'shares',
  stem: `Di quanto sono cresciute, in percentuale, le vendite di Delta tra il 2024 e il 2025?`,
  opts: ['+1%', '+6,7%', '+25%', '+33,3%'], ans: 3,
  sol: `Delta: 15% di 200 = 30 milioni nel 2024, 16% di 250 = 40 milioni nel 2025. Crescita: ${fr(10, 30)} ≈ +33,3%.`,
  trap: `+1% (differenza tra le quote) e +6,7% (${fr(16, 15)}) guardano solo la quota; +25% è la crescita del mercato.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 39, area: 'V', diff: 'difficile',
  passage: `Secondo un'indagine su 400 piccole imprese, il 65% ha adottato almeno uno strumento di intelligenza artificiale nel 2025. Tra queste, meno della metà dichiara di averne misurato i benefici.`,
  claim: `Più della metà delle imprese intervistate ha adottato strumenti di intelligenza artificiale e ne ha misurato i benefici.`,
  opts: VFN, ans: 1,
  sol: `Chi ha adottato e misurato è meno della metà del 65%, cioè meno del 32,5% delle imprese: molto meno della metà. Falsa.`,
  trap: `Rispondere «Non deducibile» perché manca il numero esatto. Il limite «meno della metà» basta per escludere l'affermazione.`,
  patt: 'Falso vs Non deducibile' },

{ n: 40, area: 'V', diff: 'media',
  stem: `Il 90% dei biglietti vincenti di una lotteria è stato acquistato in una tabaccheria. Un giornale conclude che comprare il biglietto in tabaccheria aumenta le probabilità di vincere. Qual è il principale difetto del ragionamento?`,
  opts: [`Non considera quale quota di tutti i biglietti venduti, vincenti e non, viene acquistata in tabaccheria.`, `Non indica l'importo dei premi vinti.`, `Non spiega come avviene l'estrazione.`, `Non indica quante tabaccherie ci sono in Italia.`], ans: 0,
  sol: `Se anche il 90% di tutti i biglietti viene venduto in tabaccheria, il 90% dei vincenti è proprio ciò che ci si aspetta dal caso. Manca il dato di confronto.`,
  trap: `Scegliere D. Il numero di tabaccherie non basta: conta la quota di biglietti venduti.`,
  patt: 'Cause alternative' },

{ n: 41, area: 'Q', diff: 'difficile',
  stem: `Un torrefattore miscela un caffè da 12 €/kg con un caffè da 18 €/kg e ottiene 30 kg di miscela che vale 14 €/kg. Quanti kg del caffè da 18 €/kg ha usato?`,
  opts: ['6 kg', '10 kg', '15 kg', '20 kg'], ans: 1,
  sol: `Con x kg del caffè da 18 €: 12 × (30 − x) + 18x = 30 × 14 = 420, quindi 360 + 6x = 420 e x = 10. Controllo: 20 × 12 + 10 × 18 = 420.`,
  trap: `15 kg, cioè metà e metà, darebbe una miscela da 15 €/kg. 20 kg inverte le due quantità.`,
  patt: 'Media ponderata vs semplice' },

{ n: 42, area: 'DI', diff: 'media', en: true,
  ds: { q: `What is the average monthly salary of the 50 employees of a firm?`,
        s1: `The managers' average salary is 1,000 € higher than the average salary of the other employees.`,
        s2: `The firm's total monthly payroll is 120,000 €.` },
  opts: DSOPTS_EN, ans: 1,
  sol: `La (2) basta: 120.000 ÷ 50 = 2.400 € di media. La (1) dà solo una differenza tra due gruppi, senza livelli né numerosità.`,
  trap: `Pensare che servano i dati sui due gruppi. Per la media bastano il totale e il numero di dipendenti.`,
  patt: 'Sufficienza dei dati' },

{ n: 43, area: 'DI', diff: 'difficile', asset: 'jobs',
  stem: `Supponi che l'anno prossimo i laureati di Ingegneria raddoppino con lo stesso tasso di occupazione, mentre Economia e Giurisprudenza restano invariate. Quale sarebbe il tasso di occupazione complessivo?`,
  opts: ['76%', '79%', '80%', '84%'], ans: 2,
  sol: `Ingegneria ha 120 occupati su 150, cioè l'80%: lo stesso tasso della media complessiva (${fr(400, 500)}). Raddoppiandola: ${fr(520, 650)} = 80%. Dare più peso a un gruppo che sta esattamente sulla media non la sposta.`,
  trap: `79% è la media semplice dei tre tassi; 84% presuppone che dare più peso a Ingegneria alzi la media.`,
  patt: 'Media ponderata vs semplice' },

{ n: 44, area: 'V', diff: 'media',
  stem: `Anna, Bruno, Carla e Dario presentano i loro progetti uno dopo l'altro, in quattro turni. Bruno presenta subito dopo Anna. Carla non presenta né per prima né per ultima. Dario presenta prima di Carla. Chi presenta per terzo?`,
  opts: ['Anna', 'Bruno', 'Carla', 'Dario'], ans: 0,
  sol: `Carla è seconda o terza. Se fosse terza, i posti rimasti ad Anna e Bruno non sarebbero consecutivi. Quindi Carla è seconda, Dario primo, Anna terza e Bruno quarto.`,
  trap: `Fermarsi al primo ordine che sembra funzionare senza controllare tutti i vincoli.`,
  patt: 'Vincoli logici' },

{ n: 45, area: 'Q', diff: 'media',
  stem: `Un turista cambia 500 € in dollari al tasso di 1 € = 1,10 $. Spende 330 $ e riconverte i dollari rimasti al tasso di 1 € = 1,25 $. Quanti euro riceve?`,
  opts: ['176 €', '200 €', '220 €', '275 €'], ans: 0,
  sol: `500 € = 550 $. Restano 550 − 330 = 220 $. Per tornare in euro si divide per il tasso: 220 ÷ 1,25 = 176 €.`,
  trap: `Moltiplicare invece di dividere (220 × 1,25 = 275) oppure usare il tasso dell'andata (220 ÷ 1,10 = 200).`,
  patt: 'Equazioni e problemi a parole' },

{ n: 46, area: 'Q', diff: 'media',
  stem: `Un'azienda ha costi fissi di 18.000 € e un costo variabile di 12 € per unità. Prevede di vendere 1.500 unità. Qual è il prezzo minimo per unità che le evita una perdita?`,
  opts: ['12 €', '24 €', '30 €', '36 €'], ans: 1,
  sol: `Costi totali: 18.000 + 12 × 1.500 = 36.000 €. Diviso per 1.500 unità: 24 € a unità.`,
  trap: `12 € copre solo il costo variabile, oppure solo i costi fissi per unità (18.000 ÷ 1.500 = 12). Servono entrambi.`,
  patt: 'Equazioni e problemi a parole' },

{ n: 47, area: 'DI', diff: 'difficile',
  ds: { q: `Nel corso A sono iscritte più donne che nel corso B?`,
        s1: `Le donne sono il 60% degli iscritti del corso A e il 40% degli iscritti del corso B.`,
        s2: `Il corso A ha 20 iscritti in meno del corso B.` },
  opts: DSOPTS, ans: 3,
  sol: `Anche insieme dipende da quanti sono gli iscritti. Se B ha 100 iscritti, A ne ha 80: donne 48 contro 40. Se B ne ha 50, A ne ha 30: donne 18 contro 20. Due casi compatibili, due risposte diverse.`,
  trap: `Rispondere «sì» perché il 60% è più del 40%: le due percentuali sono calcolate su basi diverse.`,
  patt: 'Sufficienza dei dati' },

{ n: 48, area: 'V', diff: 'difficile',
  passage: `Nel 2025 il fatturato di un'azienda di cosmetici è cresciuto del 12%. Le vendite in Italia sono rimaste ferme a 30 milioni di euro; il resto del fatturato proviene dall'estero.`,
  claim: `Nel 2025 le vendite all'estero dell'azienda sono cresciute più del 12%.`,
  opts: VFN, ans: 0,
  sol: `La crescita totale è una media ponderata tra Italia (0%) ed estero. Perché la media arrivi al 12% con l'Italia ferma, l'estero deve crescere più del 12%. Esempio: estero 70 milioni, totale 100; il totale sale di 12, tutti dall'estero: ${fr(12, 70)} ≈ +17%.`,
  trap: `Rispondere «Non deducibile» perché manca il fatturato totale. Per il confronto con il 12% non serve.`,
  patt: 'Media ponderata vs semplice' },

{ n: 49, area: 'Q', diff: 'media',
  stem: `Una coltura di batteri raddoppia ogni 20 minuti. Dopo 2 ore conta 6.400 batteri. Quanti batteri c'erano all'inizio?`,
  opts: ['100', '200', '1.067', '3.200'], ans: 0,
  sol: `2 ore sono 6 intervalli da 20 minuti: il numero si moltiplica per 2<sup>6</sup> = 64. 6.400 ÷ 64 = 100.`,
  trap: `200 conta 5 raddoppi invece di 6; 1.067 divide per 6 invece che per 2<sup>6</sup>.`,
  patt: 'Percentuali, frazioni e crescita' },

{ n: 50, area: 'Q', diff: 'media',
  stem: `In un'azienda il rapporto tra impiegati e dirigenti è di 9 a 1. Dopo l'assunzione di 10 nuovi dirigenti, con lo stesso numero di impiegati, il rapporto diventa di 6 a 1. Quanti sono gli impiegati?`,
  opts: ['20', '60', '180', '200'], ans: 2,
  sol: `Con d dirigenti: 9d = 6 × (d + 10), quindi 3d = 60 e d = 20. Impiegati: 9 × 20 = 180.`,
  trap: `Fermarsi a 20, che sono i dirigenti. 200 è il totale del personale prima delle assunzioni.`,
  patt: 'Equazioni e problemi a parole' }
];

/* ---------- forma Mock 07: lang, asset come HTML, ds con C.ds() ---------- */
QUESTIONS.forEach(function (q) {
  q.lang = q.en ? 'en' : 'it';
  delete q.en;
  if (q.asset) q.asset = ASSETS[q.asset]();
  if (q.ds) { q.stem = C.ds(q.ds.q, q.ds.s1, q.ds.s2); q.ds = true; }
});

return {
  id: '08',
  title: 'Mock 08',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Creato fuori dal repository e convertito nel formato del sito.',
  questions: QUESTIONS
};
});
