#!/usr/bin/env node
/* =======================================================================
   validate.js — validatore dei mock.

   uso:  node tools/validate.js docs/mocks/mock-08.js
         node tools/validate.js docs/mocks/*.js

   Regole (da CLAUDE.md). Il mock non passa se:
   1.  le domande non sono 50;
   2.  la ripartizione non è 18 Q / 16 V / 16 DI;
   3.  un `ans` è fuori range;
   4.  una domanda vero/falso/non deducibile non ha 3 opzioni,
       oppure una domanda di altro tipo non ne ha 4;
   5.  ci sono più di 3 risposte uguali di fila;
   6.  una lettera compare meno del 18% o più del 32% delle volte
       (contando solo le domande a 4 opzioni);
   7.  le domande in inglese non sono 0, 2 o 3 (0 per i mock tutti in italiano);
   8.  meno di 17 domande hanno come `patt` una delle 5 etichette
       dei pattern d'errore;
   9.  manca `sol`, `trap` o `patt`;
   10. due domande hanno lo stesso testo.

   Esce con codice 0 se tutti i file passano, 1 altrimenti.
   ======================================================================= */
const path = require('path');

const PATTERN_MIEI = [
  'Falso vs Non deducibile',
  'Rapporti vs valori assoluti',
  'Cause alternative',
  'Media ponderata vs semplice',
  'Sufficienza dei dati'
];

const TOTALE = 50;
const RIPARTIZIONE = { Q: 18, V: 16, DI: 16 };
const MIN_QUOTA = 0.18;
const MAX_QUOTA = 0.32;
const MAX_FILA = 3;
const MIN_PATTERN_MIEI = 17;
const EN_AMMESSE = [0, 2, 3];

/* Riconosce una domanda vero / falso / non deducibile: o ha un `claim`
   da giudicare, oppure le sue opzioni sono la terna classica. */
const TERNE_VFN = [
  ['vera', 'falsa', 'non deducibile'],
  ['true', 'false', 'cannot be determined']
];
function eVFN(q) {
  const opts = (q.opts || []).map(o => String(o).toLowerCase().trim());
  const terna = TERNE_VFN.some(t => t.length === opts.length && t.every((v, i) => opts[i] === v));
  return terna || !!q.claim;
}

/* Testo confrontabile di una domanda, per scovare i doppioni. */
function testo(q) {
  return [q.passage, q.claim, q.stem, (q.opts || []).join('|')]
    .filter(Boolean).join(' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase().trim();
}

function valida(file) {
  const mock = require(path.resolve(file));
  const qs = (mock && mock.questions) || (Array.isArray(mock) ? mock : null);
  const errori = [];
  const avvisi = [];
  if (!qs) return { errori: ['il file non esporta né `questions` né un array di domande'], avvisi };

  /* 1 — numero di domande */
  if (qs.length !== TOTALE) errori.push(`le domande sono ${qs.length}, devono essere ${TOTALE}`);

  /* 2 — ripartizione per area */
  const perArea = { Q: 0, V: 0, DI: 0 };
  qs.forEach(q => {
    if (perArea[q.area] === undefined) errori.push(`domanda ${q.n}: area sconosciuta "${q.area}"`);
    else perArea[q.area]++;
  });
  Object.keys(RIPARTIZIONE).forEach(a => {
    if (perArea[a] !== RIPARTIZIONE[a]) errori.push(`area ${a}: ${perArea[a]} domande, devono essere ${RIPARTIZIONE[a]}`);
  });

  /* 3, 4, 9 — campi di ogni domanda */
  qs.forEach(q => {
    const nOpt = (q.opts || []).length;
    if (!Number.isInteger(q.ans) || q.ans < 0 || q.ans >= nOpt) {
      errori.push(`domanda ${q.n}: ans = ${q.ans} fuori range (opzioni: ${nOpt})`);
    }
    if (eVFN(q)) {
      if (nOpt !== 3) errori.push(`domanda ${q.n}: è vero/falso/non deducibile ma ha ${nOpt} opzioni invece di 3`);
    } else if (nOpt !== 4) {
      errori.push(`domanda ${q.n}: ha ${nOpt} opzioni invece di 4`);
    }
    ['sol', 'trap', 'patt'].forEach(k => {
      if (!q[k] || !String(q[k]).trim()) errori.push(`domanda ${q.n}: manca "${k}"`);
    });
    if (q.lang && q.lang !== 'it' && q.lang !== 'en') errori.push(`domanda ${q.n}: lang = "${q.lang}" (ammessi 'it' e 'en')`);
    if (!q.lang) avvisi.push(`domanda ${q.n}: campo lang assente, la considero italiana`);
  });

  /* 5 — sequenze di risposte uguali */
  let fila = 1;
  for (let i = 1; i < qs.length; i++) {
    if (qs[i].ans === qs[i - 1].ans) {
      fila++;
      if (fila > MAX_FILA) {
        errori.push(`domande ${qs[i - fila + 1].n}–${qs[i].n}: ${fila} risposte "${'ABCD'[qs[i].ans]}" di fila (massimo ${MAX_FILA})`);
        break;
      }
    } else fila = 1;
  }

  /* 6 — distribuzione delle lettere sulle domande a 4 opzioni */
  const quattro = qs.filter(q => (q.opts || []).length === 4);
  const conta = [0, 0, 0, 0];
  quattro.forEach(q => { if (conta[q.ans] !== undefined) conta[q.ans]++; });
  conta.forEach((c, i) => {
    const quota = quattro.length ? c / quattro.length : 0;
    if (quota < MIN_QUOTA || quota > MAX_QUOTA) {
      errori.push(`lettera ${'ABCD'[i]}: ${c} volte su ${quattro.length} domande a 4 opzioni (${(quota * 100).toFixed(1)}%), fuori dall'intervallo 18–32%`);
    }
  });

  /* 7 — domande in inglese */
  const en = qs.filter(q => q.lang === 'en' || q.en).length;
  if (!EN_AMMESSE.includes(en)) errori.push(`domande in inglese: ${en}, devono essere ${EN_AMMESSE.join(' o ')}`);

  /* 8 — copertura dei miei pattern d'errore */
  const miei = qs.filter(q => PATTERN_MIEI.includes(q.patt)).length;
  if (miei < MIN_PATTERN_MIEI) errori.push(`solo ${miei} domande hanno come patt una delle 5 etichette dei pattern d'errore, ne servono almeno ${MIN_PATTERN_MIEI}`);

  /* 10 — testi duplicati */
  const visti = new Map();
  qs.forEach(q => {
    const t = testo(q);
    if (!t) return;
    if (visti.has(t)) errori.push(`domande ${visti.get(t)} e ${q.n}: stesso testo`);
    else visti.set(t, q.n);
  });

  return { errori, avvisi, info: { perArea, en, miei, conta, quattro: quattro.length } };
}

/* ------------------------------- avvio -------------------------------- */
const files = process.argv.slice(2);
if (!files.length) {
  console.error('uso: node tools/validate.js docs/mocks/mock-07.js [altri...]');
  process.exit(2);
}

let tutto = true;
files.forEach(f => {
  let r;
  try { r = valida(f); }
  catch (e) { console.log(`\n${f}\n  ERRORE nel caricamento: ${e.message}`); tutto = false; return; }
  console.log(`\n${f}`);
  if (r.info) {
    console.log(`  aree Q/V/DI: ${r.info.perArea.Q}/${r.info.perArea.V}/${r.info.perArea.DI} · inglese: ${r.info.en} · pattern miei: ${r.info.miei}`);
    console.log(`  lettere su ${r.info.quattro} domande a 4 opzioni: ` +
      r.info.conta.map((c, i) => `${'ABCD'[i]}=${c} (${(c / r.info.quattro * 100).toFixed(1)}%)`).join('  '));
  }
  r.avvisi.forEach(a => console.log(`  avviso: ${a}`));
  if (r.errori.length) {
    tutto = false;
    console.log(`  NON PASSA — ${r.errori.length} problema/i:`);
    r.errori.forEach(e => console.log(`   × ${e}`));
  } else {
    console.log('  PASSA: tutte le regole rispettate.');
  }
});
console.log('');
process.exit(tutto ? 0 : 1);
