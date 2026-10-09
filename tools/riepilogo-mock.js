#!/usr/bin/env node
/* =======================================================================
   riepilogo-mock.js — stampa in Markdown la tabella di riepilogo di un mock
   (n, area, tipologia, difficoltà, risposta, pattern) e una stima dei minuti
   per schermata da tre. La tipologia è dedotta dal testo della domanda.

   uso: node tools/riepilogo-mock.js docs/mocks/mock-19.js
   ======================================================================= */
const path = require('path');
const m = require(path.resolve(process.argv[2] || ''));
const strip = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function tipologia(q) {
  const t = strip([q.stem, q.claim].join(' ')).toLowerCase();
  if (q.claim) return 'Vero/falso/non ricavabile';
  if (q.ds || /\(1\)/.test(strip(q.stem))) return 'Sufficienza dei dati';
  if (q.area === 'DI') {
    if (/Proposizioni/.test(strip(q.asset))) return /false/.test(t) ? 'Proposizioni (sicuramente false)' : 'Proposizioni (sicuramente vere)';
    if (/<svg/.test(q.asset || '')) return 'Grafico';
    return 'Tabella';
  }
  if (q.area === 'V') {
    if (/non è corretta/.test(t)) return 'Brano: «NON è corretta»';
    if (/indebolisce/.test(t)) return 'Indebolisce';
    if (/rafforza/.test(t)) return 'Rafforza';
    if (/assunzione/.test(t)) return 'Assunzione implicita';
    if (/fattori|se noto/.test(t)) return 'Fattore che influirebbe';
    if (/applicazione di una regola/i.test(q.patt)) return 'Applicazione di una regola';
    if (/termine/i.test(q.patt)) return 'Termine tecnico';
    return 'Comprensione di un brano';
  }
  return 'Quantitativa';
}
const base = { Q: { facile: 0.8, media: 1.4, difficile: 2.3 }, V: { facile: 1.0, media: 1.5, difficile: 2.0 }, DI: { facile: 1.2, media: 1.8, difficile: 2.6 } };
const min = q => (base[q.area][q.diff] || 1.5) + (q.claim ? -0.2 : 0);
const L = 'ABCD';

console.log('| n | area | tipologia | diff. | risposta | pattern |');
console.log('|---|------|-----------|-------|----------|---------|');
m.questions.forEach(q => console.log(`| ${q.n} | ${q.area} | ${tipologia(q)} | ${q.diff} | ${L[q.ans]} | ${q.patt} |`));
console.log('\nStima dei minuti per schermata (3 domande; ritmo di uno studente preparato):\n');
console.log('| schermata | domande | minuti | cumulati |');
console.log('|-----------|---------|--------|----------|');
let cum = 0;
for (let s = 0; s * 3 < m.questions.length; s++) {
  const qs = m.questions.slice(s * 3, s * 3 + 3);
  const t = qs.reduce((a, q) => a + min(q), 0);
  cum += t;
  console.log(`| ${s + 1} | ${qs[0].n}–${qs[qs.length - 1].n} | ${t.toFixed(1)} | ${cum.toFixed(1)} |`);
}
console.log(`\nTotale stimato: ${cum.toFixed(0)} minuti su 75.`);
const d = m.questions.reduce((a, q) => (a[q.diff] = (a[q.diff] || 0) + 1, a), {});
console.log('Difficoltà:', JSON.stringify(d));
