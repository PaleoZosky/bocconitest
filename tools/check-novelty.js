#!/usr/bin/env node
/* =======================================================================
   check-novelty.js — segnala le domande di un mock che somigliano troppo
   a domande già presenti nel sito (altri mock) o in kit/materiali/.

   Confronto: gruppi di 4 parole consecutive (n-grammi) del testo di ogni
   domanda (brano, affermazione, testo, opzioni) contro lo stesso testo di
   tutte le altre domande, e contro i file .txt dei mock precedenti. Si
   confrontano anche gli insiemi di numeri usati. Non sostituisce la lettura
   umana: segnala i casi da guardare.

   uso: node tools/check-novelty.js docs/mocks/mock-10.js
   ======================================================================= */
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('uso: node tools/check-novelty.js docs/mocks/mock-10.js'); process.exit(2); }
const nuovo = require(path.resolve(file));
const radice = path.resolve(__dirname, '..');

const pulisci = s => String(s || '').replace(/<[^>]*>/g, ' ').toLowerCase()
  .replace(/[’']/g, ' ').replace(/[^a-zàèéìòù0-9,.% ]+/g, ' ').replace(/\s+/g, ' ').trim();
/* le opzioni standard (sufficienza dei dati, vero/falso/non deducibile) sono uguali in tutti i mock: non contano */
const Charts = require(path.join(radice, 'docs', 'js', 'charts.js'));
const STANDARD = [].concat(Charts.DSOPTS, Charts.DSOPTS_EN, Charts.VFN, Charts.VFN_EN).map(pulisci);
const senzaStandard = t => STANDARD.reduce((x, r) => x.split(r).join(' '), t);
const testoDi = q => senzaStandard(pulisci([q.passage, q.claim, q.stem, q.asset, (q.opts || []).join(' ')].join(' ')));
const parole = t => t.split(' ').filter(Boolean);
const gruppi = (t, k = 4) => { const w = parole(t), o = new Set(); for (let i = 0; i + k <= w.length; i++) o.add(w.slice(i, i + k).join(' ')); return o; };
/* numeri «significativi»: almeno due cifre o con decimali (1, 2, 3, 4 compaiono in ogni domanda) */
const numeri = t => new Set((t.match(/\d+(?:[.,]\d+)?/g) || []).filter(x => x.length >= 2).map(x => x.replace(',', '.')));

/* altre domande del sito */
const dir = path.join(radice, 'docs', 'mocks');
const altri = [];
fs.readdirSync(dir).filter(f => /^mock-\d+\.js$/.test(f) && path.resolve(dir, f) !== path.resolve(file)).forEach(f => {
  const m = require(path.join(dir, f));
  (m.questions || []).forEach(q => altri.push({ src: `${m.id}.${q.n}`, txt: testoDi(q), q }));
});
/* vecchi mock in kit/materiali: testo intero, finestre da 60 parole */
const vecchi = [];
const dirTxt = path.join(radice, 'kit', 'materiali');
const trova = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? trova(path.join(d, e.name)) : /\.txt$/.test(e.name) ? [path.join(d, e.name)] : []);
if (fs.existsSync(dirTxt)) trova(dirTxt).forEach(f => {
  const w = parole(pulisci(fs.readFileSync(f, 'utf8')));
  for (let i = 0; i < w.length; i += 30) vecchi.push({ src: path.basename(f) + '@' + i, txt: w.slice(i, i + 90).join(' ') });
});

const SOGLIA = 0.20;   // quota di 4-grammi della domanda nuova che ricompare altrove
let segnalate = 0;
nuovo.questions.forEach(q => {
  const t = testoDi(q), g = gruppi(t), nn = numeri(pulisci([q.passage, q.claim, q.stem, (q.opts || []).join(' ')].join(' ')));
  if (!g.size) return;
  let best = { s: 0, src: '' };
  altri.concat(vecchi).forEach(o => {
    const go = gruppi(o.txt);
    let comuni = 0; g.forEach(x => { if (go.has(x)) comuni++; });
    const s = comuni / g.size;
    if (s > best.s) best = { s, src: o.src };
  });
  if (best.s >= SOGLIA) { segnalate++; console.log(`n.${q.n}: ${(best.s * 100).toFixed(0)}% di 4-grammi in comune con ${best.src}`); }
  /* stessi numeri e stessa struttura: 4+ numeri uguali con un'altra domanda del sito */
  if (nn.size >= 4) altri.forEach(o => {
    const no = numeri(pulisci([o.q.passage, o.q.claim, o.q.stem, (o.q.opts || []).join(' ')].join(' ')));
    let c = 0; nn.forEach(x => { if (no.has(x)) c++; });
    if (c >= 4 && c / nn.size >= 0.7) { segnalate++; console.log(`n.${q.n}: ${c} numeri su ${nn.size} uguali a ${o.src}`); }
  });
});
console.log(segnalate ? `\n${segnalate} segnalazioni da controllare a mano.` : 'Nessuna somiglianza sospetta con le altre domande del sito né con i mock in kit/materiali/.');
