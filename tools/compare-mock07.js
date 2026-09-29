#!/usr/bin/env node
/* =======================================================================
   compare-mock07.js — controlla che docs/mocks/mock-07.js contenga
   esattamente le stesse domande del file modello kit/modello/mock07.html.

   uso: node tools/compare-mock07.js [percorso/mock07.html]

   Differenze ammesse (e verificate a parte):
   - il vecchio flag `en:true` è diventato `lang:'en'` / `lang:'it'`;
   - dentro l'HTML degli asset, spazi bianchi irrilevanti e coordinate
     SVG arrotondate da charts.js (scarti sotto il centesimo di pixel).
   ======================================================================= */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MODELLO = path.resolve(process.argv[2] || path.join(__dirname, '..', 'kit', 'modello', 'mock07.html'));

/* Estrae dal file HTML il blocco che va dagli asset alla fine di QUESTIONS
   e lo esegue in una sandbox, così non serve un browser. */
function domandeOriginali(file) {
  const html = fs.readFileSync(file, 'utf8');
  const inizio = html.indexOf('/* ======================= ASSET');
  const fine = html.indexOf('/* ======================= STATO');
  if (inizio < 0 || fine < 0) throw new Error('non trovo i blocchi ASSET/STATO in ' + file);
  const codice = html.slice(inizio, fine) + '\n;QUESTIONS;';
  return vm.runInNewContext(codice, {}, { filename: file });
}

const orig = domandeOriginali(MODELLO);
const mock = require(path.resolve(__dirname, '..', 'docs', 'mocks', 'mock-07.js'));
const nuovo = mock.questions;

const norm = s => String(s)
  .replace(/\s+/g, ' ')
  .replace(/-?\d+\.\d+/g, m => String(Math.round(parseFloat(m) * 100) / 100))
  .replace(/>\s+</g, '><')
  .trim();

const HTMLISH = new Set(['asset', 'stem']);
const problemi = [];

if (orig.length !== nuovo.length) problemi.push(`numero di domande: ${orig.length} vs ${nuovo.length}`);

orig.forEach((o, i) => {
  const n = nuovo[i];
  if (!n) { problemi.push(`domanda ${o.n}: assente nel file convertito`); return; }
  const chiavi = new Set([...Object.keys(o), ...Object.keys(n)]);
  chiavi.delete('en');
  chiavi.delete('lang');
  for (const k of chiavi) {
    const a = o[k], b = n[k];
    if (Array.isArray(a) || Array.isArray(b)) {
      if (JSON.stringify(a) !== JSON.stringify(b)) problemi.push(`domanda ${o.n}, campo ${k}: array diversi`);
    } else if (HTMLISH.has(k)) {
      if (norm(a) !== norm(b)) problemi.push(`domanda ${o.n}, campo ${k}: HTML diverso`);
    } else if (a !== b) {
      problemi.push(`domanda ${o.n}, campo ${k}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
    }
  }
  const attesa = o.en ? 'en' : 'it';
  if (n.lang !== attesa) problemi.push(`domanda ${o.n}: lang atteso ${attesa}, trovato ${n.lang}`);
});

if (problemi.length) {
  console.log('DIFFERENZE rispetto al modello:\n- ' + problemi.join('\n- '));
  process.exit(1);
}
console.log(`OK: le ${nuovo.length} domande del Mock 07 convertito coincidono con il modello (campo lang a parte).`);
