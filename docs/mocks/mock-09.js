/* =======================================================================
   Mock 09 — 50 domande nuove (18 Q, 16 V, 16 DI).
   Pensato per il punto debole (Data Insights) e per i cinque pattern
   d'errore: Falso vs Non deducibile, Rapporti vs valori assoluti,
   Cause alternative, Media ponderata vs semplice, Sufficienza dei dati.

   Tutti i numeri dei grafici e delle tabelle stanno in DATA e sono
   riusati da tools/check-math-09.js per ricalcolare le risposte.
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
  /* n.11 — rifiuti per quartiere */
  rifiuti: [
    { q: 'Nord',   ab: 20000, kg: 400, diff: 60 },
    { q: 'Centro', ab: 10000, kg: 500, diff: 80 },
    { q: 'Sud',    ab: 30000, kg: 300, diff: 50 },
    { q: 'Est',    ab: 40000, kg: 200, diff: 40 }
  ],
  /* n.5 — pane venduto (kg) nei due punti vendita */
  pane: {
    giorni: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven'],
    centro:    [90, 30, 60, 50, 80],
    periferia: [30, 20, 30, 30, 40]
  },
  /* n.20 — spese del condominio (% del totale) */
  condominio: [['Riscaldamento', 40], ['Pulizie', 25], ['Ascensore', 20], ['Varie', 15]],
  condominioVar: { Riscaldamento: -25, Pulizie: -20 },
  /* n.3 — ordini cumulati da inizio anno */
  ordini: { mesi: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'], cum: [40, 90, 130, 210, 250, 280] },
  /* n.23 — power bank: prezzo (€) e capacità (Wh) */
  powerbank: [
    { m: 'A', prezzo: 10, wh: 40 },
    { m: 'B', prezzo: 20, wh: 90 },
    { m: 'C', prezzo: 30, wh: 120 },
    { m: 'D', prezzo: 50, wh: 225 },
    { m: 'E', prezzo: 40, wh: 200 }
  ],
  /* n.29 — grafico con asse che parte da 80 */
  soddisfazione: { base: 80, top: 92, A: 84, B: 90 },
  /* n.31 — gusto preferito per fascia d'età (% dentro ogni fascia) */
  gelato: [
    { fascia: 'Under 18',  n: 200, cioc: 45, fra: 30, pist: 15, altro: 10 },
    { fascia: '18–40 anni', n: 300, cioc: 30, fra: 20, pist: 30, altro: 20 },
    { fascia: 'Over 40',   n: 500, cioc: 20, fra: 20, pist: 40, altro: 20 }
  ],
  /* n.37 — turisti per provenienza e quota con più di 3 notti */
  turisti: [
    { p: 'Italia',   n: 900, lunghi: 40 },
    { p: 'Germania', n: 500, lunghi: 60 },
    { p: 'Francia',  n: 400, lunghi: 10 },
    { p: 'Altri',    n: 200, lunghi: 50 }
  ]
};

/* ======================= tabelle e grafici ======================= */
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function tRifiuti() {
  return C.table({
    caption: 'Rifiuti urbani per quartiere, anno 2025',
    head: ['Quartiere', 'Abitanti', 'Rifiuti per abitante (kg/anno)', 'Raccolta differenziata'],
    rows: DATA.rifiuti.map(r => [r.q, fmt(r.ab), r.kg, r.diff + '%'])
  });
}

function gPane() {
  return `<figure class="fig"><figcaption>Pane venduto in una settimana dai due punti vendita (kg)</figcaption>` + C.bars({
    labels: DATA.pane.giorni,
    series: [
      { name: 'Centro', values: DATA.pane.centro, style: 'fill' },
      { name: 'Periferia', values: DATA.pane.periferia, style: 'outline' }
    ],
    W: 400, H: 240, max: 100,
    aria: 'Pane venduto in una settimana dai due punti vendita, in kg. Centro: ' + DATA.pane.centro.join(', ') + '. Periferia: ' + DATA.pane.periferia.join(', ') + '.'
  }) + `</figure>`;
}

function gCondominio() {
  return `<figure class="fig"><figcaption>Spese annue del condominio, per voce (% del totale)</figcaption>` + C.pie({
    data: DATA.condominio,
    aria: 'Ripartizione delle spese annue del condominio: ' + DATA.condominio.map(d => d[0] + ' ' + d[1] + '%').join(', ') + '.'
  }) + `</figure>`;
}

function gOrdini() {
  return `<figure class="fig"><figcaption>Ordini ricevuti da inizio anno (totale cumulato)</figcaption>` + C.line({
    labels: DATA.ordini.mesi,
    series: [{ values: DATA.ordini.cum }],
    W: 400, H: 210, T: 30, lo: 0, hi: 300, gridFrom: 0, gridTo: 300, gridStep: 100,
    aria: 'Ordini cumulati da inizio anno: ' + DATA.ordini.mesi.map((m, i) => m + ' ' + DATA.ordini.cum[i]).join(', ') + '.'
  }) + `</figure>`;
}

function gPowerbank() {
  const W = 400, H = 300, L = 46, R = 14, T = 14, B = 44, xmax = 60, ymax = 250;
  const X = v => L + (W - L - R) * v / xmax, Y = v => T + (H - T - B) * (1 - v / ymax);
  let g = '';
  for (let t = 0; t <= ymax; t += 50) {
    g += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 7}" y="${Y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  for (let t = 0; t <= xmax; t += 10) {
    g += `<line x1="${X(t)}" x2="${X(t)}" y1="${T}" y2="${H - B}" class="${t === 0 ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${X(t)}" y="${H - B + 16}" class="tick" text-anchor="middle">${t}</text>`;
  }
  g += `<text x="${(L + W - R) / 2}" y="${H - 6}" class="tick" text-anchor="middle">Prezzo (€)</text>`;
  g += `<text x="12" y="${(T + H - B) / 2}" class="tick" text-anchor="middle" transform="rotate(-90 12 ${(T + H - B) / 2})">Capacità (Wh)</text>`;
  DATA.powerbank.forEach(p => {
    const left = p.m === 'D';
    g += `<circle cx="${X(p.prezzo)}" cy="${Y(p.wh)}" r="5" style="fill:var(--s1);stroke:var(--paper)" stroke-width="1.5"><title>Modello ${p.m}: ${p.prezzo} €, ${p.wh} Wh</title></circle>`;
    g += `<text x="${X(p.prezzo) + (left ? -9 : 9)}" y="${Y(p.wh) + 4}" class="val" text-anchor="${left ? 'end' : 'start'}">${p.m} (${p.prezzo}; ${p.wh})</text>`;
  });
  return `<figure class="fig"><figcaption>Cinque batterie portatili: prezzo e capacità</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafico a punti, prezzo in euro e capacità in wattora. ${DATA.powerbank.map(p => 'Modello ' + p.m + ': ' + p.prezzo + ' euro, ' + p.wh + ' Wh').join('. ')}.">${g}</svg></div>
<p class="fig-note">Tra parentesi, per ogni punto: (prezzo in €; capacità in Wh).</p></figure>`;
}

function gSoddisfazione() {
  const s = DATA.soddisfazione;
  const W = 400, H = 260, L = 46, R = 16, T = 24, B = 34, bw = 78;
  const Y = v => T + (H - T - B) * (1 - (v - s.base) / (s.top - s.base));
  let g = '';
  for (let t = s.base; t <= s.top; t += 4) {
    g += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" class="${t === s.base ? 'axis' : 'grid'}"></line>`;
    g += `<text x="${L - 7}" y="${Y(t) + 4}" class="tick" text-anchor="end">${t}</text>`;
  }
  [['Prodotto A', s.A, 'var(--s1)'], ['Prodotto B', s.B, 'var(--s2)']].forEach(([nome, v, col], i) => {
    const x = L + (W - L - R) * (i + 0.5) / 2 - bw / 2;
    g += `<rect x="${x}" y="${Y(v)}" width="${bw}" height="${Y(s.base) - Y(v)}" style="fill:${col}"><title>${nome}: ${v}</title></rect>`;
    g += `<text x="${x + bw / 2}" y="${Y(v) - 7}" class="val" text-anchor="middle">${v}</text>`;
    g += `<text x="${x + bw / 2}" y="${H - 12}" class="lab" text-anchor="middle">${nome}</text>`;
  });
  return `<figure class="fig"><figcaption>Punteggio medio di soddisfazione dei clienti</figcaption>
<div class="fig-scroll"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafico a colonne con asse verticale che va da ${s.base} a ${s.top}. Prodotto A: ${s.A}. Prodotto B: ${s.B}.">${g}</svg></div></figure>`;
}

function tGelato() {
  /* tabella «trasposta» (gusti in riga, fasce in colonna): 4 colonne stanno anche in 360 px */
  const g = DATA.gelato;
  const riga = (nome, k) => [nome].concat(g.map(r => r[k] + '%'));
  return C.table({
    caption: 'Gusto preferito, per fascia d\'età (% degli intervistati di ciascuna fascia)',
    head: ['Gusto'].concat(g.map(r => r.fascia)),
    rows: [['Intervistati (numero)'].concat(g.map(r => r.n)),
           riga('Cioccolato', 'cioc'), riga('Fragola', 'fra'), riga('Pistacchio', 'pist'), riga('Altro', 'altro')]
  });
}

function gTuristi() {
  return `<figure class="fig"><figcaption>Turisti in visita, per provenienza (totale 2.000)</figcaption>` + C.bars({
    labels: DATA.turisti.map(t => t.p),
    series: [{ name: 'Turisti', values: DATA.turisti.map(t => t.n), style: 'fill' }],
    W: 400, H: 220, max: 1000,
    aria: 'Turisti per provenienza: ' + DATA.turisti.map(t => t.p + ' ' + t.n).join(', ') + '.'
  }) + `</figure>`;
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

{ n: 1, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Su una cartina in scala 1:50.000 due paesi distano 3,6 cm. Quanti chilometri li separano in realtà?`,
  opts: ['0,18 km', '1,8 km', '18 km', '180 km'], ans: 1,
  sol: `3,6 cm × 50.000 = 180.000 cm = 1.800 m = 1,8 km.`,
  trap: `Perdere (o guadagnare) uno zero nella conversione da centimetri a chilometri: 1 km = 100.000 cm.`,
  patt: 'Proporzioni e unità di misura' },

{ n: 2, area: 'V', diff: 'facile', lang: 'it',
  passage: `Nella classifica finale del campionato regionale di pallanuoto il Rovereto ha chiuso davanti al Trento; il Bolzano ha chiuso dietro al Trento; il Merano ha chiuso davanti al Rovereto. Non ci sono stati pari merito.`,
  claim: `Il Bolzano ha chiuso davanti al Rovereto.`,
  opts: VFN, ans: 1,
  sol: `Le informazioni si concatenano: Merano > Rovereto > Trento > Bolzano. Il Bolzano è dietro al Trento, che è dietro al Rovereto: l'affermazione è contraddetta. Frase chiave: «il Bolzano ha chiuso dietro al Trento».`,
  trap: `Rispondere «Non deducibile» perché Bolzano e Rovereto non vengono mai confrontati direttamente: la transitività li collega.`,
  patt: 'Falso vs Non deducibile' },

{ n: 3, area: 'DI', diff: 'facile', lang: 'it', asset: gOrdini(),
  stem: `In quale mese sono arrivati più ordini?`,
  opts: ['Gennaio', 'Marzo', 'Aprile', 'Giugno'], ans: 2,
  sol: `La linea mostra gli ordini cumulati: quelli di ogni mese sono la differenza con il mese precedente. Gen 40, Feb 50, Mar 40, Apr 80, Mag 40, Giu 30.`,
  trap: `Scegliere giugno, il punto più alto della linea: è il totale da inizio anno, non gli ordini di quel mese.`,
  patt: 'Livello vs variazione' },

{ n: 4, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un autonoleggio propone due offerte: la prima costa 30 € fissi più 0,20 € per ogni chilometro, la seconda 10 € fissi più 0,30 € per ogni chilometro. Per quanti chilometri le due offerte costano esattamente lo stesso?`,
  opts: ['40', '80', '150', '200'], ans: 3,
  sol: `30 + 0,20·x = 10 + 0,30·x → 20 = 0,10·x → x = 200 km. Controllo: 30 + 40 = 70 e 10 + 60 = 70.`,
  trap: `Sommare le tariffe al chilometro (0,20 + 0,30) e ottenere 40 o 80. Conta la differenza: la seconda offerta costa 0,10 € in più a chilometro e deve recuperare 20 € di differenza sui costi fissi.`,
  patt: 'Equazioni e problemi a parole' },

{ n: 5, area: 'DI', diff: 'media', lang: 'it', asset: gPane(),
  stem: `In quale giorno la sede Periferia pesa di più, in percentuale, sul totale del pane venduto dai due punti vendita?`,
  opts: ['Lunedì', 'Martedì', 'Giovedì', 'Venerdì'], ans: 1,
  sol: `Quota della Periferia: lun 30/120 = 25%; mar 20/50 = 40%; mer 30/90 ≈ 33%; gio 30/80 = 37,5%; ven 40/120 ≈ 33%. Il massimo è martedì.`,
  trap: `Scegliere venerdì, il giorno in cui la Periferia vende di più in assoluto (40 kg): la domanda chiede il peso sul totale del giorno, non il valore assoluto.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 6, area: 'V', diff: 'media', lang: 'it',
  passage: `Nel comune di Valbella ci sono cinque scuole primarie. In quattro di esse il servizio mensa è gratuito per le famiglie con reddito basso; nella quinta, l'istituto «Rodari», la mensa è a pagamento per tutte le famiglie.`,
  claim: `Il servizio mensa è gratuito per le famiglie con reddito basso in tutte e cinque le scuole primarie di Valbella.`,
  opts: VFN, ans: 1,
  sol: `Il testo dice che al «Rodari» la mensa è a pagamento per tutte le famiglie: «in tutte e cinque» è quindi contraddetto. Frase chiave: «nella quinta [...] la mensa è a pagamento per tutte le famiglie».`,
  trap: `Rispondere «Non deducibile» perché non si sa quante famiglie a reddito basso frequentino il «Rodari». La regola dell'istituto è esplicita e basta a smentire «in tutte».`,
  patt: 'Falso vs Non deducibile' },

{ n: 7, area: 'Q', diff: 'media', lang: 'it',
  stem: `Tre quaderni e due penne costano 9 €; due quaderni e tre penne costano 8 €. Quanto costano, insieme, un quaderno e una penna?`,
  opts: ['3,00 €', '3,20 €', '3,40 €', '3,50 €'], ans: 2,
  sol: `Sommando le due spese: 5 quaderni + 5 penne = 17 €, quindi 1 quaderno + 1 penna = 17 ÷ 5 = 3,40 €. (Controllo: quaderno 2,20 €, penna 1,20 €.)`,
  trap: `Risolvere l'intero sistema (lungo, con più rischi di errore) o tirare a indovinare: la domanda chiede solo la somma dei due prezzi, che si ottiene sommando le due equazioni.`,
  patt: 'Sistema lineare a parole' },

{ n: 8, area: 'DI', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Il voto medio di 5 studenti in un test supera 8?',
    'Il voto più basso è 6 e il più alto è 10.',
    'Due studenti hanno preso esattamente 8.'),
  opts: DSOPTS, ans: 3,
  sol: `Insieme: 6 + 10 + 8 + 8 = 32, più il quinto voto x, compreso tra 6 e 10. La media supera 8 solo se 32 + x > 40, cioè x > 8: con x = 7 no, con x = 9 sì. Le informazioni non bastano nemmeno insieme.`,
  trap: `Vedere il 6 e il 10 simmetrici rispetto all'8 e concludere che la media sia 8 (o più): dipende dal quinto voto.`,
  patt: 'Sufficienza dei dati' },

{ n: 9, area: 'V', diff: 'media', lang: 'it',
  passage: `Un'indagine su 2.000 pendolari ha rilevato che il 58% preferisce leggere durante il viaggio, il 27% ascolta musica e il resto lavora con il portatile o con lo smartphone. Gli autori precisano che il campione comprende soltanto utenti di linee regionali.`,
  claim: `Sui treni ad alta velocità la maggior parte dei viaggiatori preferisce leggere.`,
  opts: VFN, ans: 2,
  sol: `Il campione riguarda solo le linee regionali: sull'alta velocità il testo non dice nulla. Frase chiave: «il campione comprende soltanto utenti di linee regionali». Non deducibile.`,
  trap: `Estendere il 58% a tutti i treni («Vera») o dire «Falsa» perché il dato manca: il testo non conferma e non smentisce.`,
  patt: 'Falso vs Non deducibile' },

{ n: 10, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un'impresa ha un fatturato di 200 milioni di euro, di cui il 20% deriva dalle esportazioni. L'anno dopo le esportazioni raddoppiano e il resto del fatturato non cambia. Qual è la nuova quota delle esportazioni sul fatturato?`,
  opts: ['25%', '33,3%', '40%', '50%'], ans: 1,
  sol: `Esportazioni: 40 → 80 milioni; resto: 160 milioni invariato; nuovo fatturato: 240 milioni. Quota: ${fr(80, 240)} = 33,3%.`,
  trap: `Raddoppiare anche la quota (20% → 40%): ma il fatturato totale è cresciuto, quindi la quota sale meno.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 11, area: 'DI', diff: 'media', lang: 'it', asset: tRifiuti(),
  stem: `Quale quartiere ha raccolto in modo differenziato il maggior numero di tonnellate di rifiuti?`,
  opts: ['Nord', 'Centro', 'Sud', 'Est'], ans: 0,
  sol: `Tonnellate differenziate = abitanti × kg pro capite × quota: Nord 20.000 × 400 kg × 60% = 4.800 t; Centro 10.000 × 500 × 80% = 4.000 t; Sud 30.000 × 300 × 50% = 4.500 t; Est 40.000 × 200 × 40% = 3.200 t.`,
  trap: `Scegliere il Centro, che ha la percentuale più alta (80%), o l'Est, che ha più abitanti: contano insieme abitanti, rifiuti pro capite e quota.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 12, area: 'V', diff: 'media', lang: 'en',
  passage: `A bakery chain reports that the stores which began selling organic bread saw their daily sales rise by 12% over the following six months. The manager concludes that organic bread attracts new customers.`,
  stem: `Which of the following, if true, most weakens the manager's conclusion?`,
  opts: [`The stores that began selling organic bread are all in districts where a large university campus opened during the same six months.`,
         `Organic bread costs more to produce than ordinary bread.`,
         `Some customers say they prefer the taste of organic bread.`,
         `Several competing bakeries also sell organic bread.`], ans: 0,
  sol: `Il nuovo campus è una causa alternativa: gli studenti in più nella zona possono spiegare l'aumento delle vendite anche senza il pane biologico.`,
  trap: `Scegliere la seconda o la quarta: costi di produzione e concorrenza non spiegano perché le vendite siano cresciute. La terza, semmai, rafforza la tesi.`,
  patt: 'Cause alternative' },

{ n: 13, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Marta ha letto i ${fr(3, 8)} di un libro. Se legge altre 60 pagine, avrà letto esattamente metà del libro. Quante pagine ha il libro?`,
  opts: ['240', '360', '480', '600'], ans: 2,
  sol: `Metà meno ${fr(3, 8)} fa ${fr(1, 2)} − ${fr(3, 8)} = ${fr(1, 8)} del libro. Se ${fr(1, 8)} vale 60 pagine, il libro ne ha 60 × 8 = 480.`,
  trap: `Prendere le 60 pagine come metà, un quarto o un terzo del libro: sono solo la differenza tra metà e i tre ottavi, cioè un ottavo.`,
  patt: 'Frazioni' },

{ n: 14, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('La produzione complessiva di latte di un\'azienda agricola nel 2025 è stata maggiore di quella del 2024?',
    'Il numero di mucche è aumentato del 10% rispetto al 2024.',
    'La produzione media per mucca è diminuita del 5% rispetto al 2024.'),
  opts: DSOPTS, ans: 2,
  sol: `Produzione totale = numero di mucche × produzione per mucca: 1,10 × 0,95 = 1,045, cioè +4,5%. Ciascuna informazione da sola riguarda un solo fattore, quindi servono entrambe.`,
  trap: `Fermarsi alla (2), che parla di un calo, o alla (1), che parla di un aumento: la produzione totale dipende da tutti e due i fattori.`,
  patt: 'Sufficienza dei dati' },

{ n: 15, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Il circolo scacchistico «Alfiere Nero» conta 120 soci. Nel 2025 ha organizzato due tornei: al primo si sono iscritti 60 soci, al secondo 50. Il regolamento consente di iscriversi a entrambi i tornei.`,
  claim: `Almeno 10 soci non si sono iscritti a nessuno dei due tornei.`,
  opts: VFN, ans: 0,
  sol: `Nel caso più favorevole alle iscrizioni nessun socio partecipa a entrambi: 60 + 50 = 110 soci diversi. Restano quindi almeno 120 − 110 = 10 soci senza iscrizione. Frase chiave: «al primo si sono iscritti 60 soci, al secondo 50».`,
  trap: `Rispondere «Non deducibile» perché non si sa quanti soci abbiano fatto entrambi i tornei: basta ragionare sul caso limite, quello con meno sovrapposizioni.`,
  patt: 'Falso vs Non deducibile' },

{ n: 16, area: 'Q', diff: 'media', lang: 'it',
  stem: `Con le cifre 1, 2, 3 e 4, senza ripeterne nessuna, quanti numeri di tre cifre divisibili per 3 si possono formare?`,
  opts: ['6', '8', '12', '24'], ans: 2,
  sol: `Un numero è divisibile per 3 se lo è la somma delle cifre. Terne possibili: {1,2,3} → 6 ✓; {2,3,4} → 9 ✓; {1,2,4} → 7 ✗; {1,3,4} → 8 ✗. Ogni terna buona dà 3! = 6 numeri: 2 × 6 = 12.`,
  trap: `Rispondere 24 (tutte le disposizioni, 4 · 3 · 2) senza filtrare per divisibilità.`,
  patt: 'Combinazioni vs permutazioni' },

{ n: 17, area: 'DI', diff: 'facile', lang: 'it', ds: true,
  stem: ds('In un campionato la vittoria vale 3 punti, il pareggio 1 punto e la sconfitta 0. Quanti punti ha totalizzato la squadra Rossa?',
    'La squadra Rossa ha vinto 6 partite e ne ha pareggiate 2.',
    'La squadra Rossa ha perso 3 partite.'),
  opts: DSOPTS, ans: 0,
  sol: `Dalla (1): 6 × 3 + 2 × 1 = 20 punti. La (2) da sola non basta: le sconfitte valgono 0 punti, ma senza vittorie e pareggi il totale non si ricava.`,
  trap: `Pensare che serva anche il numero di sconfitte: valgono zero punti, quindi non cambiano il totale.`,
  patt: 'Sufficienza dei dati' },

{ n: 18, area: 'V', diff: 'media', lang: 'it',
  passage: `Secondo il rapporto annuale dell'Osservatorio Risicolo Padano, nel 2025 la superficie coltivata a riso ha raggiunto i 220.000 ettari, il 4% in meno rispetto all'anno precedente. La produzione è rimasta stabile a 1,4 milioni di tonnellate, grazie a rese medie più alte, salite da 6,1 a 6,4 tonnellate per ettaro. Il rapporto segnala inoltre che le aziende con irrigazione a goccia sono il 18% del totale e consumano in media il 25% di acqua in meno rispetto alle altre. Gli autori precisano che i dati sulle rese sono provvisori e che non è stato possibile stabilire quanta parte dell'aumento delle rese sia dovuta alle nuove tecniche di irrigazione.`,
  stem: `Secondo quanto riportato nel brano, è corretto affermare che:`,
  opts: [`l'irrigazione a goccia ha causato l'aumento delle rese medie.`,
         `le aziende con irrigazione a goccia consumano il 25% di acqua in meno rispetto a quanto consumavano l'anno precedente.`,
         `le rese del 2025 sono definitive e aumentate del 4% rispetto al 2024.`,
         `nel 2025 la produzione di riso è rimasta stabile nonostante la riduzione della superficie coltivata.`], ans: 3,
  sol: `Frase chiave: «La produzione è rimasta stabile a 1,4 milioni di tonnellate» con una superficie «il 4% in meno». La prima è un nesso causale che gli autori dichiarano di non aver stabilito; la seconda cambia il termine di confronto (il 25% è rispetto alle «altre» aziende, non all'anno prima); la terza contraddice «provvisori» e scambia il 4% della superficie con la crescita delle rese.`,
  trap: `Scegliere la prima: un dato affiancato all'altro non prova che uno causi l'altro. La seconda sposta il confronto dalle altre aziende all'anno precedente.`,
  patt: 'Falso vs Non deducibile' },

{ n: 19, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `Ogni mese Luca spende 60 € di benzina. A gennaio la benzina costava 2 € al litro, a febbraio 3 € al litro. Qual è stato il prezzo medio al litro pagato da Luca nei due mesi?`,
  opts: ['2,25 €', '2,40 €', '2,50 €', '2,60 €'], ans: 1,
  sol: `A parità di spesa, a gennaio compra 60 ÷ 2 = 30 litri e a febbraio 60 ÷ 3 = 20 litri. In tutto 120 € per 50 litri: 120 ÷ 50 = 2,40 € al litro.`,
  trap: `Fare la media semplice dei due prezzi (2,50 €): Luca compra più litri quando costa meno, quindi il prezzo medio pagato è più basso.`,
  patt: 'Media ponderata vs semplice' },

{ n: 20, area: 'DI', diff: 'media', lang: 'it', asset: gCondominio(),
  stem: `Il prossimo anno la spesa per il riscaldamento scenderà del 25% e quella per le pulizie del 20%; le altre voci non cambieranno. Di quanto scenderà la spesa totale del condominio?`,
  opts: ['10%', '12,5%', '15%', '22,5%'], ans: 2,
  sol: `Il 25% di 40 punti (riscaldamento) fa 10 punti; il 20% di 25 punti (pulizie) fa 5 punti. Il totale scende di 15 punti su 100: −15%.`,
  trap: `Fare la media semplice dei due ribassi, (25 + 20) ÷ 2 = 22,5%: i due ribassi vanno pesati con il peso di ciascuna voce sulla spesa.`,
  patt: 'Media ponderata vs semplice' },

{ n: 21, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un battello impiega 3 ore per risalire un fiume per 12 km e 2 ore per ridiscendere gli stessi 12 km. Qual è la velocità della corrente?`,
  opts: ['0,5 km/h', '1 km/h', '2 km/h', '5 km/h'], ans: 1,
  sol: `Contro corrente: 12 ÷ 3 = 4 km/h. Con la corrente: 12 ÷ 2 = 6 km/h. La corrente si toglie in salita e si aggiunge in discesa, quindi la differenza (2 km/h) vale due volte la corrente: 1 km/h.`,
  trap: `Rispondere 5 km/h (la media, che è la velocità del battello in acqua ferma) o 2 km/h (la differenza intera): la differenza contiene la corrente due volte.`,
  patt: 'Tassi, lavoro e velocità' },

{ n: 22, area: 'V', diff: 'media', lang: 'it',
  passage: `Uno studio condotto su 500 famiglie ha rilevato che, dopo l'installazione di contatori intelligenti, il consumo domestico di acqua è sceso in media del 12%. Gli autori precisano di non aver raccolto dati sull'andamento delle tariffe né sul numero di componenti dei nuclei familiari nel periodo.`,
  claim: `Le famiglie dello studio hanno speso in media meno per l'acqua.`,
  opts: VFN, ans: 2,
  sol: `Il brano riporta un calo dei consumi, non della spesa. Se le tariffe sono salite la spesa può essere anche aumentata, e gli autori dicono di non avere dati sulle tariffe. Frase chiave: «non aver raccolto dati sull'andamento delle tariffe».`,
  trap: `Rispondere «Vera» perché consumare meno sembra voler dire spendere meno: la spesa dipende anche dal prezzo.`,
  patt: 'Falso vs Non deducibile' },

{ n: 23, area: 'DI', diff: 'media', lang: 'it', asset: gPowerbank(),
  stem: `Quale modello offre più capacità per euro speso?`,
  opts: ['A', 'B', 'D', 'E'], ans: 3,
  sol: `Capacità per euro = Wh ÷ prezzo: A 40/10 = 4; B 90/20 = 4,5; C 120/30 = 4; D 225/50 = 4,5; E 200/40 = 5. Il rapporto migliore è quello di E.`,
  trap: `Scegliere D, che ha la capacità più alta in assoluto, o A, che costa meno: la domanda chiede il rapporto tra capacità e prezzo.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 24, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Quanto vale (0,2 × 0,05) ÷ 0,004?`,
  opts: ['0,025', '0,25', '2,5', '25'], ans: 2,
  sol: `0,2 × 0,05 = 0,01. Poi 0,01 ÷ 0,004 = 10 ÷ 4 = 2,5.`,
  trap: `Sbagliare di una posizione decimale (0,25 o 25): conviene moltiplicare numeratore e denominatore per 1.000.`,
  patt: 'Aritmetica e decimali' },

{ n: 25, area: 'V', diff: 'media', lang: 'it',
  passage: `Dai dati di un ospedale risulta che i pazienti che ricevono più visite di parenti restano ricoverati più a lungo. Un dirigente ne conclude che le visite dei parenti allungano la degenza e propone di limitarle.`,
  stem: `Quale delle seguenti affermazioni, se vera, indebolisce maggiormente la conclusione del dirigente?`,
  opts: [`I pazienti con patologie più gravi hanno degenze più lunghe e ricevono più visite di parenti.`,
         `Le visite sono consentite soltanto nel pomeriggio.`,
         `L'ospedale dispone di 300 posti letto.`,
         `Molti parenti portano cibo ai pazienti durante le visite.`], ans: 0,
  sol: `La gravità della patologia spiega entrambe le cose: chi è più grave resta più a lungo e riceve più visite. La correlazione c'è, ma la causa potrebbe essere invertita o comune.`,
  trap: `Scegliere l'ultima, che semmai suggerisce un effetto negativo delle visite. Orari e posti letto non toccano il nesso tra visite e durata.`,
  patt: 'Cause alternative' },

{ n: 26, area: 'DI', diff: 'media', lang: 'it',
  asset: dp([
    'Un festival ospita cinque band (Alfa, Beta, Gamma, Delta ed Epsilon), una per sera, da lunedì a venerdì.',
    'Beta suona in una sera precedente a quella di Gamma.',
    'Delta suona la sera immediatamente successiva a quella di Alfa.',
    'Epsilon non suona né il lunedì né il venerdì.'
  ], [
    '<b>A.</b> Alfa suona prima di Gamma.',
    '<b>B.</b> Delta non suona di lunedì.',
    '<b>C.</b> Epsilon suona di giovedì.',
    '<b>D.</b> Beta non suona di venerdì.'
  ]),
  stem: `Leggi con attenzione i dati e le proposizioni. In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo D', 'Solo A, B e D', 'Solo B, C e D', 'Solo B e D'], ans: 3,
  sol: `B è vera: Delta viene dopo Alfa, quindi non può essere il primo giorno. D è vera: Beta precede Gamma, quindi non può essere l'ultimo. A non è sicura (Beta lun, Gamma mar, Epsilon mer, Alfa gio, Delta ven: Gamma precede Alfa). C non è sicura (Epsilon può suonare anche martedì o mercoledì).`,
  trap: `Considerare «sicuro» ciò che è solo possibile: A e C sono compatibili con i dati in alcune sere, ma non in tutte.`,
  patt: 'Deduzioni con vincoli' },

{ n: 27, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un'urna contiene 2 palline rosse e 3 bianche. Se ne estraggono due, rimettendo nell'urna la prima pallina prima della seconda estrazione, qual è la probabilità che le due palline abbiano lo stesso colore?`,
  opts: [fr(2, 5), fr(12, 25), fr(1, 2), fr(13, 25)], ans: 3,
  sol: `Con reinserimento le due estrazioni sono indipendenti: P(due rosse) = ${fr(2, 5)} × ${fr(2, 5)} = ${fr(4, 25)}; P(due bianche) = ${fr(3, 5)} × ${fr(3, 5)} = ${fr(9, 25)}. Somma: ${fr(13, 25)}.`,
  trap: `${fr(2, 5)} è il risultato che si otterrebbe senza reinserimento (${fr(2, 5)} × ${fr(1, 4)} + ${fr(3, 5)} × ${fr(2, 4)}): qui la seconda estrazione non dipende dalla prima.`,
  patt: 'Probabilità e combinatoria' },

{ n: 28, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Una compagnia di traghetti afferma che i propri passeggeri sono oggi più soddisfatti di un anno fa, perché nell'ultimo anno i reclami ricevuti sono scesi da 400 a 300.`,
  stem: `Quale assunzione è necessaria perché la conclusione della compagnia regga?`,
  opts: [`Il numero di passeggeri trasportati è diminuito, in proporzione, meno dei reclami.`,
         `I prezzi dei biglietti sono rimasti invariati.`,
         `Tutti i reclami dell'anno precedente riguardavano ritardi delle corse.`,
         `Le compagnie concorrenti hanno ricevuto meno reclami.`], ans: 0,
  sol: `Per parlare di maggiore soddisfazione i reclami per passeggero devono essere diminuiti. I reclami sono calati del 25% (da 400 a 300): se i passeggeri fossero calati del 25% o più, la quota di chi reclama non sarebbe migliorata. Le altre affermazioni non toccano questo legame.`,
  trap: `Guardare il calo assoluto dei reclami senza chiedersi rispetto a quanti passeggeri: se i passeggeri sono diminuiti di più, il tasso di reclamo può essere salito.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 29, area: 'DI', diff: 'media', lang: 'it', asset: gSoddisfazione(),
  stem: `Di quanto, in percentuale, il punteggio del prodotto B supera quello del prodotto A?`,
  opts: ['circa 6%', 'circa 7%', 'circa 50%', 'circa 150%'], ans: 1,
  sol: `I punteggi sono 84 e 90: la differenza è 6, e ${fr(6, 84)} ≈ 7,1%. L'asse parte da 80, non da 0: la colonna di B è alta 10 quadretti contro i 4 di A, ma solo perché manca la parte sotto 80.`,
  trap: `Confrontare l'altezza delle colonne (10 contro 4, cioè +150%) invece dei valori: con l'asse che non parte da zero la differenza appare enorme. Anche 6% è un errore: 6 va diviso per 84, non per 100.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 30, area: 'Q', diff: 'difficile', lang: 'it', ds: true,
  stem: ds('Il prodotto xy è positivo?',
    'x + y > 0',
    'x < y'),
  opts: DSOPTS, ans: 3,
  sol: `Prendendo x = 1, y = 2 valgono entrambe e xy = 2 > 0; prendendo x = −1, y = 2 valgono entrambe e xy = −2 < 0. Anche insieme, quindi, il segno di xy non è determinato.`,
  trap: `Pensare che insieme le due condizioni obblighino x e y a essere positivi: (2) permette a x di essere negativo, e (1) impone solo che la somma sia positiva.`,
  patt: 'Sufficienza dei dati' },

{ n: 31, area: 'DI', diff: 'difficile', lang: 'it', asset: tGelato(),
  stem: `Sulla base dei dati riportati in tabella, quale affermazione è corretta?`,
  opts: [`Il cioccolato e la fragola, insieme, sono scelti da esattamente metà degli intervistati.`,
         `Il cioccolato è il gusto più scelto dall'insieme degli intervistati.`,
         `Gli under 18 che scelgono la fragola sono più numerosi degli over 40 che scelgono la fragola.`,
         `Il pistacchio è scelto da più di un terzo degli intervistati.`], ans: 0,
  sol: `Intervistati per gusto: cioccolato 90 + 90 + 100 = 280; fragola 60 + 60 + 100 = 220; pistacchio 30 + 90 + 200 = 320; altro 20 + 60 + 100 = 180 (totale 1.000). Cioccolato + fragola = 500, esattamente la metà. Il gusto più scelto è il pistacchio (32%, meno di un terzo); gli under 18 con la fragola sono 60, gli over 40 sono 100.`,
  trap: `Fare la media semplice delle percentuali: per il cioccolato (45 + 30 + 20) ÷ 3 ≈ 31,7% contro il pistacchio (15 + 30 + 40) ÷ 3 ≈ 28,3%, che farebbe scegliere la seconda affermazione. Le fasce hanno però numerosità molto diverse.`,
  patt: 'Media ponderata vs semplice' },

{ n: 32, area: 'V', diff: 'media', lang: 'it',
  passage: `Le linee guida dell'ospedale raccomandano di lavarsi le mani prima di ogni visita a un paziente; nei casi di emergenza, tuttavia, il medico può iniziare subito la visita e lavarsi le mani appena possibile.`,
  claim: `Le linee guida raccomandano di lavarsi le mani prima di iniziare qualsiasi visita, senza eccezioni.`,
  opts: VFN, ans: 1,
  sol: `Il testo prevede un'eccezione esplicita: «nei casi di emergenza [...] il medico può iniziare subito la visita». «Senza eccezioni» è quindi contraddetto: falsa.`,
  trap: `Rispondere «Non deducibile» perché il brano non descrive tutti i casi d'emergenza: l'eccezione è nominata, e questo basta a smentire «senza eccezioni».`,
  patt: 'Falso vs Non deducibile' },

{ n: 33, area: 'Q', diff: 'media', lang: 'it',
  stem: `Scrivendo tutti i numeri interi da 1 a 100, quante volte compare la cifra 9?`,
  opts: ['10', '11', '19', '20'], ans: 3,
  sol: `Cifra delle unità: 9, 19, 29, …, 99 → 10 volte. Cifra delle decine: 90, 91, …, 99 → 10 volte. Il 99 contiene due 9 e va contato due volte: 10 + 10 = 20.`,
  trap: `Rispondere 19 (contando il 99 una sola volta) o 10 (guardando solo le unità o solo le decine).`,
  patt: 'Conteggio' },

{ n: 34, area: 'DI', diff: 'difficile', lang: 'en', ds: true,
  stem: ds('Are more than half of the company\'s employees part-time?',
    'The company has 45 part-time employees.',
    'There are 10 more part-time employees than full-time employees.'),
  opts: DSOPTS_EN, ans: 1,
  sol: `Dalla (2): part-time = full-time + 10, quindi i part-time sono più dei full-time e quindi più della metà del totale. La (1) da sola non dice quanti siano i dipendenti in tutto.`,
  trap: `Pensare che «45 part-time» sia già un numero grande: senza il totale (o il numero dei full-time) non dice nulla sulla metà.`,
  patt: 'Sufficienza dei dati' },

{ n: 35, area: 'V', diff: 'media', lang: 'it',
  passage: `Un liceo ha introdotto l'obbligo di lasciare il telefono cellulare in una cassetta all'ingresso. Nei tre mesi successivi le note disciplinari sono scese del 30%. Il preside conclude che il divieto ha migliorato il comportamento degli studenti.`,
  stem: `Quale informazione rafforzerebbe maggiormente la conclusione del preside?`,
  opts: [`Molti studenti dichiarano di non gradire il divieto.`,
         `Il divieto è stato introdotto all'inizio dell'anno scolastico.`,
         `Alcuni docenti ritengono che il telefono sia utile per la didattica.`,
         `Il calo delle note è stato più marcato nelle classi in cui il divieto è stato applicato con maggiore rigore.`], ans: 3,
  sol: `Se l'effetto è più forte dove la misura è applicata con più rigore, il nesso tra divieto e comportamento diventa più credibile (relazione dose-risposta). Le altre informazioni non dicono nulla sull'effetto.`,
  trap: `Scegliere la prima: il fatto che il divieto non piaccia non dice se abbia funzionato. Il momento dell'introduzione e le opinioni dei docenti sono irrilevanti per il nesso causale.`,
  patt: 'Cause alternative' },

{ n: 36, area: 'Q', diff: 'media', lang: 'it',
  stem: `La stampante A produce 30 pagine al minuto, la stampante B 20 pagine al minuto. Per stampare 500 pagine A parte 5 minuti prima di B; poi lavorano insieme fino alla fine. Quanti minuti passano in tutto dalla partenza di A al termine del lavoro?`,
  opts: ['10', '12', '14', '15'], ans: 1,
  sol: `In 5 minuti A stampa 150 pagine. Ne restano 350, a 30 + 20 = 50 pagine al minuto: 7 minuti. In tutto 5 + 7 = 12 minuti.`,
  trap: `Dividere 500 per 50 (10 minuti) ignorando il vantaggio di A, oppure sommare i 5 minuti a quei 10 (15).`,
  patt: 'Tassi, lavoro e velocità' },

{ n: 37, area: 'DI', diff: 'media', lang: 'it', asset: gTuristi(),
  stem: `Hanno pernottato più di 3 notti il 40% dei turisti italiani, il 60% dei tedeschi, il 10% dei francesi e il 50% degli altri turisti. Quale affermazione è corretta?`,
  opts: [`I tedeschi hanno la quota più alta di soggiorni lunghi, ma gli italiani sono i più numerosi tra chi ha pernottato più di 3 notti.`,
         `La metà dei turisti ha pernottato più di 3 notti.`,
         `Tra chi ha pernottato più di 3 notti, gli altri turisti sono meno numerosi dei francesi.`,
         `I tedeschi che hanno pernottato più di 3 notti sono più numerosi degli italiani che hanno fatto lo stesso.`], ans: 0,
  sol: `Soggiorni lunghi: Italia 900 × 40% = 360; Germania 500 × 60% = 300; Francia 400 × 10% = 40; Altri 200 × 50% = 100. In tutto 800 su 2.000 (40%). I tedeschi hanno la quota più alta (60%), ma gli italiani sono più numerosi (360 contro 300).`,
  trap: `Pensare che la quota più alta (i tedeschi, 60%) corrisponda anche al numero più alto: gli italiani sono quasi il doppio dei tedeschi.`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 38, area: 'V', diff: 'facile', lang: 'it',
  passage: `I lombrichi scavano gallerie nel terreno; queste gallerie favoriscono il passaggio di aria e di acqua verso le radici, da cui dipende la crescita di molte colture.`,
  claim: `L'attività di scavo dei lombrichi favorisce la crescita di molte colture.`,
  opts: VFN, ans: 0,
  sol: `È una parafrasi fedele della catena descritta: gallerie → aria e acqua alle radici → crescita delle colture. Frase chiave: «favoriscono il passaggio di aria e di acqua verso le radici, da cui dipende la crescita di molte colture».`,
  trap: `Rispondere «Non deducibile» perché il brano non usa le stesse parole dell'affermazione: quando il significato segue dal testo, la risposta è «Vera».`,
  patt: 'Falso vs Non deducibile' },

{ n: 39, area: 'Q', diff: 'difficile', lang: 'it',
  stem: `In un'azienda il 60% dei dipendenti ha meno di 40 anni. Vengono assunte 20 persone, tutte con meno di 40 anni, e la quota di under 40 sale al 65%. Quanti dipendenti aveva l'azienda prima delle assunzioni?`,
  opts: ['100', '120', '140', '160'], ans: 2,
  sol: `Sia N il numero iniziale: 0,60·N + 20 = 0,65·(N + 20) → 0,60·N + 20 = 0,65·N + 13 → 7 = 0,05·N → N = 140. Controllo: 84 + 20 = 104 under 40 su 160 dipendenti = 65%.`,
  trap: `Pensare che i 20 nuovi assunti siano il 5% dell'organico (e rispondere 400): le 20 persone entrano sia tra gli under 40 sia nel totale, quindi la quota non sale di 5 punti «per 20 persone».`,
  patt: 'Rapporti vs valori assoluti' },

{ n: 40, area: 'DI', diff: 'difficile', lang: 'it',
  asset: dp([
    'Una scuola di musica ha tre corsi: Chitarra, Pianoforte e Violino.',
    'Ogni corso ha tra 8 e 20 iscritti (estremi inclusi).',
    'Il totale degli iscritti è 42.',
    'Pianoforte ha 6 iscritti più di Violino.',
    'Chitarra ha meno iscritti di Pianoforte.'
  ], [
    '<b>A.</b> Violino ha almeno 11 iscritti.',
    '<b>B.</b> Chitarra ha esattamente 12 iscritti.',
    '<b>C.</b> Pianoforte ha più di 16 iscritti.',
    '<b>D.</b> Chitarra ha più iscritti di Violino.'
  ]),
  stem: `Leggi con attenzione i dati e le proposizioni. In base ai dati, quali proposizioni sono sicuramente vere?`,
  opts: ['Solo A', 'Solo A e C', 'Solo A, C e D', 'Solo B e D'], ans: 1,
  sol: `Con V iscritti a Violino: Pianoforte V + 6, Chitarra 42 − V − (V + 6) = 36 − 2V. Chitarra < Pianoforte dà V > 10; i limiti 8–20 danno V ≤ 14. Quindi V = 11, 12, 13 o 14 (Chitarra 14, 12, 10, 8). A: V ≥ 11 sempre. C: Pianoforte = V + 6 ≥ 17 sempre. B vale solo per V = 12; D vale per V = 11 ma non per V = 12 (12 contro 12).`,
  trap: `Fermarsi a un caso possibile (per esempio V = 11) e considerare «vere» B o D: una proposizione è sicuramente vera solo se vale in tutti i casi compatibili con i dati.`,
  patt: 'Deduzioni con vincoli' },

{ n: 41, area: 'V', diff: 'difficile', lang: 'it',
  passage: `In una scuola la media dei voti di italiano è 7,2 nella classe 3A e 6,4 nella classe 3B. La classe 3A ha meno alunni della classe 3B.`,
  claim: `La media di italiano dei due gruppi considerati insieme è inferiore a 6,8.`,
  opts: VFN, ans: 0,
  sol: `La media complessiva è una media ponderata e sta tra 6,4 e 7,2. Poiché la 3A pesa meno della 3B, la media complessiva è più vicina a 6,4 che a 7,2, cioè sotto il punto medio 6,8. Frase chiave: «La classe 3A ha meno alunni della classe 3B».`,
  trap: `Rispondere «Non deducibile» perché mancano i numeri di alunni, oppure «Falsa» perché la media semplice (7,2 + 6,4) ÷ 2 è esattamente 6,8: basta sapere quale gruppo è più numeroso.`,
  patt: 'Media ponderata vs semplice' },

{ n: 42, area: 'Q', diff: 'media', lang: 'en',
  stem: `A pair of shoes costs €80. A 25% discount is applied first, and then a further €6 is taken off the discounted price. What is the total discount, as a percentage of the original price?`,
  opts: ['31%', '32.5%', '35%', '36%'], ans: 1,
  sol: `80 × 0,75 = 60; poi 60 − 6 = 54. Lo sconto totale è 80 − 54 = 26 €, cioè ${fr(26, 80)} = 32,5% del prezzo iniziale.`,
  trap: `Calcolare i 6 € rispetto al prezzo già scontato (${fr(6, 60)} = 10%) e sommare 25 + 10 = 35%. Oppure sommare 25 + 6 = 31%. Tutti gli sconti vanno riferiti al prezzo iniziale.`,
  patt: 'Percentuali composte' },

{ n: 43, area: 'DI', diff: 'media', lang: 'it', ds: true,
  stem: ds('Qual è il prezzo di una lezione singola di nuoto?',
    'Un pacchetto di 10 lezioni costa 180 €.',
    'Il pacchetto di 10 lezioni costa il 10% in meno di 10 lezioni singole.'),
  opts: DSOPTS, ans: 2,
  sol: `Insieme: 180 € è il 90% del prezzo di 10 lezioni singole, che quindi costano 180 ÷ 0,90 = 200 €: 20 € l'una. La (1) da sola non dà il prezzo singolo, la (2) da sola non dà nessun importo.`,
  trap: `Dividere 180 per 10 (18 €): è il prezzo medio a lezione nel pacchetto, già scontato, non il prezzo della lezione singola.`,
  patt: 'Sufficienza dei dati' },

{ n: 44, area: 'V', diff: 'facile', lang: 'it',
  passage: `Un circolo ricreativo ha 40 soci. Tutti i soci che partecipano al torneo di dama giocano anche a scacchi. In tutto, 25 soci giocano a scacchi.`,
  stem: `Quale delle seguenti affermazioni è sicuramente vera?`,
  opts: [`Almeno 15 soci partecipano al torneo di dama.`,
         `Tutti i soci che giocano a scacchi partecipano al torneo di dama.`,
         `Almeno un socio partecipa al torneo di dama.`,
         `Al massimo 25 soci partecipano al torneo di dama.`], ans: 3,
  sol: `Chi partecipa al torneo di dama gioca anche a scacchi: i partecipanti sono un sottoinsieme dei 25 che giocano a scacchi, quindi al massimo 25 (potrebbero anche essere pochissimi o nessuno).`,
  trap: `Usare i 15 soci che non giocano a scacchi (40 − 25) come se dovessero partecipare al torneo: sono fuori dal torneo. La seconda inverte la condizione: non tutti gli scacchisti giocano a dama.`,
  patt: 'Quantificatori e deduzioni' },

{ n: 45, area: 'Q', diff: 'media', lang: 'it',
  stem: `La media di cinque numeri è 20. Se si toglie uno dei numeri, la media dei quattro rimasti diventa 18. Quale numero è stato tolto?`,
  opts: ['22', '24', '28', '38'], ans: 2,
  sol: `Somma iniziale: 5 × 20 = 100. Somma dei quattro rimasti: 4 × 18 = 72. Il numero tolto è 100 − 72 = 28.`,
  trap: `Aggiungere alla media la differenza (20 + 2 = 22): togliendo un numero la media dei rimasti scende di 2 su quattro numeri, cioè di 8 in totale, e la differenza va ricavata dalle somme.`,
  patt: 'Medie e somme' },

{ n: 46, area: 'DI', diff: 'difficile', lang: 'it',
  asset: dp([
    'Nel torneo la vittoria vale 3 punti, il pareggio 1 punto e la sconfitta 0 punti.',
    'La squadra Blu ha giocato 4 partite e ha totalizzato 7 punti.',
    'La squadra Verde ha giocato 4 partite e non ha mai pareggiato.',
    'Blu e Verde hanno subito lo stesso numero di sconfitte.'
  ], [
    '<b>A.</b> La squadra Verde ha totalizzato 9 punti.',
    '<b>B.</b> La squadra Verde ha vinto meno partite della squadra Blu.',
    '<b>C.</b> Le squadre Blu e Verde hanno vinto lo stesso numero di partite.',
    '<b>D.</b> La squadra Verde ha più punti della squadra Blu.'
  ]),
  stem: `Leggi con attenzione i dati e le proposizioni. In base ai dati, quali proposizioni sono sicuramente false?`,
  opts: ['Solo B e C', 'Solo B', 'Solo A e D', 'Solo C e D'], ans: 0,
  sol: `Blu: 7 punti in 4 partite si ottengono solo con 2 vittorie, 1 pareggio e 1 sconfitta (6 + 1). Verde: nessun pareggio e 1 sconfitta, quindi 3 vittorie e 9 punti. A è vera (9 punti), D è vera (9 > 7). B è falsa (3 vittorie contro 2) e C è falsa (3 contro 2).`,
  trap: `Cercare le proposizioni «vere» invece di quelle «sicuramente false»: la domanda chiede le false. Un'altra trappola è considerare B falsa e non accorgersi che anche C lo è.`,
  patt: 'Deduzioni con vincoli' },

{ n: 47, area: 'V', diff: 'media', lang: 'it',
  passage: `Tutti gli iscritti al corso di cucina partecipano alla gita di fine anno. Nessun partecipante alla gita ha meno di 18 anni. Alcuni membri della giuria del concorso sono iscritti al corso di cucina.`,
  stem: `Quale conclusione segue necessariamente dalle affermazioni del brano?`,
  opts: [`Alcuni membri della giuria hanno meno di 18 anni.`,
         `Alcuni membri della giuria hanno almeno 18 anni.`,
         `Tutti i partecipanti alla gita sono iscritti al corso di cucina.`,
         `Nessun membro della giuria partecipa alla gita.`], ans: 1,
  sol: `Gli iscritti al corso vanno alla gita e quindi hanno almeno 18 anni; alcuni giurati sono iscritti al corso, dunque alcuni giurati hanno almeno 18 anni.`,
  trap: `Invertire la prima frase e pensare che alla gita partecipino solo gli iscritti al corso: «tutti gli iscritti vanno alla gita» non implica che tutti i partecipanti siano iscritti.`,
  patt: 'Quantificatori e deduzioni' },

{ n: 48, area: 'Q', diff: 'media', lang: 'it',
  stem: `Un numero di due cifre ha la somma delle cifre uguale a 11. Scambiando le due cifre si ottiene un numero che supera di 27 il numero di partenza. Qual è il numero di partenza?`,
  opts: ['38', '47', '65', '74'], ans: 1,
  sol: `Con a cifra delle decine e b cifra delle unità: a + b = 11 e (10b + a) − (10a + b) = 9·(b − a) = 27, quindi b − a = 3. Ne segue a = 4, b = 7: il numero è 47 (e 74 − 47 = 27).`,
  trap: `Scegliere 74: ha le cifre giuste ma, scambiate, dà un numero più piccolo (47), non più grande di 27.`,
  patt: 'Equazioni e problemi a parole' },

{ n: 49, area: 'V', diff: 'difficile', lang: 'it',
  passage: `Il comune di Valdora vuole ridurre i consumi di energia spegnendo un lampione su due dopo la mezzanotte. A sostegno della proposta l'assessore cita il comune di Riva, dove la stessa misura, adottata due anni fa, ha ridotto del 30% i consumi dell'illuminazione pubblica.`,
  stem: `Su quale assunzione si basa principalmente il ragionamento dell'assessore?`,
  opts: [`Il risparmio ottenuto a Riva non dipende da caratteristiche del comune che Valdora non ha.`,
         `Riva ha più abitanti di Valdora.`,
         `Nessun residente di Valdora protesterà contro lo spegnimento dei lampioni.`,
         `Lo spegnimento dei lampioni non ha effetti sulla sicurezza stradale.`], ans: 0,
  sol: `Il ragionamento è per analogia: ciò che è successo a Riva si ripeterà a Valdora solo se il risultato di Riva non deriva da condizioni specifiche di Riva che Valdora non condivide.`,
  trap: `Scegliere la terza o la quarta: sono questioni di accettazione o di sicurezza, non condizioni perché il risparmio si ripeta. Il numero di abitanti non è necessario per l'analogia.`,
  patt: 'Assunzione implicita' },

{ n: 50, area: 'Q', diff: 'facile', lang: 'it',
  stem: `Il prezzo del prodotto A è i ${fr(3, 4)} del prezzo di B, e il prezzo di B è i ${fr(2, 3)} del prezzo di C. Se C costa 60 €, quanto costa A?`,
  opts: ['30 €', '40 €', '45 €', '50 €'], ans: 0,
  sol: `B = ${fr(2, 3)} × 60 = 40 €; A = ${fr(3, 4)} × 40 = 30 €. (In un passaggio: ${fr(3, 4)} × ${fr(2, 3)} = ${fr(1, 2)}, cioè metà di 60.)`,
  trap: `Applicare i ${fr(3, 4)} direttamente a C (45 €): A è i tre quarti di B, non di C.`,
  patt: 'Rapporti composti' }
];

return {
  id: '09',
  title: 'Mock 09',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Focus su Data Insights e sui cinque pattern d\'errore.',
  questions: QUESTIONS,
  data: DATA
};
});
