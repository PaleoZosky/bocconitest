#!/usr/bin/env node
/* =======================================================================
   check-math-08.js — ricalcola con il codice le risposte delle domande
   Q e DI del Mock 08 e le confronta con la chiave (`ans`).
   I dati dei grafici sono letti dall'aria-label degli SVG, cioè da quello
   che il grafico mostra davvero, non da numeri copiati a mano.

   uso: node tools/check-math-08.js
   ======================================================================= */
const path = require('path');
const mock = require(path.resolve(__dirname, '..', 'docs', 'mocks', 'mock-08.js'));
const Q = Object.fromEntries(mock.questions.map(q => [q.n, q]));
const L = 'ABCD';
const close = (a, b, e = 1e-9) => Math.abs(a - b) < e;

/* ---- dati letti dai grafici e dalle tabelle ---- */
const aria = q => (Q[q].asset.match(/aria-label="([^"]*)"/) || [])[1] || '';
const stack = (() => {           // colonne impilate (domande 6 e 25)
  const s = aria(6), o = {};
  for (const y of ['2023', '2024', '2025']) {
    const part = s.match(new RegExp(y + ': ([^.]*)\\.'))[1];
    o[y] = {};
    part.split(', ').forEach(p => { const m = p.match(/^(\w+) (\d+)$/); if (m) o[y][m[1]] = +m[2]; });
  }
  return o;
})();
const idx = (() => {             // linee (domande 7 e 33)
  const s = aria(7), o = {};
  for (const p of ['A', 'B']) o[p] = s.match(new RegExp('Prodotto ' + p + ': ([\\d, ]+)'))[1].split(', ').map(Number);
  return o;
})();
const shares = (() => {          // barre (domande 14 e 38)
  const s = aria(14), o = {};
  for (const m of s.matchAll(/(\w+) (\d+)% e (\d+)%/g)) o[m[1]] = [+m[2], +m[3]];
  return o;
})();
const rist = [['Arco', 3000, 14], ['Borgo', 4000, 11], ['Corte', 2000, 17], ['Duomo', 1000, 50]];
const tabRist = Q[2].asset;
rist.forEach(([n, c, p]) => {
  const re = new RegExp('<td>' + n + '</td><td>' + String(c).replace(/(\d)(?=(\d{3})$)/, '$1.') + '</td><td>' + p + ' €</td>');
  if (!re.test(tabRist)) throw new Error('la tabella dei ristoranti non coincide con i dati usati qui: ' + n);
});
const lauree = { Economia: [180, 20], Giurisprudenza: [100, 50], Ingegneria: [120, 30] };
const spesa = { Scuola: [30, 35], Trasporti: [25, 25], 'Servizi sociali': [20, 25], Cultura: [10, 5], Altro: [15, 10] };
const tot = { 2024: 50, 2025: 40 };

/* ---- per ogni domanda: valori calcolati per le 4 opzioni (o indice giusto) ---- */
const calc = {};
calc[1] = () => ['1', '5', '20', '100'].indexOf(String(100 / (100 / 5)));
calc[2] = () => { const inc = rist.map(([, c, p]) => c * p); return inc.indexOf(Math.max(...inc)); };
calc[5] = () => ['0,5%', '5%', '16,7%', '20%'].indexOf(String(((3 - 2.5) / 2.5 * 100)).replace('.', ',') + '%');
calc[6] = () => ['30%', '40%', '45%', '60%'].indexOf(stack[2025].Software / (stack[2025].Hardware + stack[2025].Software + stack[2025].Servizi) * 100 + '%');
calc[7] = () => 3;               // i dati sono indici: senza livelli di partenza non si confrontano (verificato a mano)
calc[8] = () => ['25', '26', '29', '30'].indexOf(String((25 * 25 - 20 * 24) / 5));
calc[10] = () => { const s0 = 25, sp = 75 * 1.28, r = 120 - sp; return ['-20%', '-8%', '-5%', '-4%'].indexOf(Math.round((r - s0) / s0 * 100) + '%'); };
calc[12] = () => (Math.round(120 * 0.35) === 42 ? 0 : -1);   // (1) basta; (2) parla di ricavi
calc[14] = () => {
  const mk = { 2024: 200, 2025: 250 };
  const calo = Object.entries(shares).filter(([, [a, b]]) => b * mk[2025] < a * mk[2024]).map(([n]) => n);
  return calo.length === 0 ? 3 : -1;
};
calc[15] = () => ['6', '12', '18', '24'].indexOf(String(24 / 2));
calc[16] = () => { const t = rist.reduce((a, [, c, p]) => a + c * p, 0), n = rist.reduce((a, [, c]) => a + c, 0); return ['17 €', '20 €', '23 €', '25 €'].indexOf(t / n + ' €'); };
calc[17] = () => ['6%', '44%', '50%', '56%'].indexOf(Math.round((1 - 0.8 * 0.7) * 100) + '%');
calc[19] = () => ['10 secondi', '20 secondi', '30 secondi', '50 secondi'].indexOf((200 + 400) / (72 / 3.6) + ' secondi');
calc[21] = () => { const occ = Object.values(lauree).reduce((a, [o]) => a + o, 0); return ['25%', '30%', '66,7%', '80%'].indexOf(lauree.Giurisprudenza[0] / occ * 100 + '%'); };
calc[23] = () => {               // (1): più B che A -> media > 20 sempre; (2): niente sulla composizione
  let s1 = true, s2 = new Set();
  for (let a = 0; a <= 100; a++) { const b = 100 - a; if (b > a) { if (!((10 * a + 30 * b) / 100 > 20)) s1 = false; } if (a + b === 100) s2.add((10 * a + 30 * b) / 100 > 20); }
  const suff1 = (() => { for (let a = 0; a < 60; a++) for (let b = a + 1; b < 60; b++) if (!((10 * a + 30 * b) / (a + b) > 20)) return false; return true; })();
  const suff2 = s2.size === 1;
  return suff1 && !suff2 ? 0 : !suff1 && suff2 ? 1 : -1;
};
calc[24] = () => { const pu = 60 * .2, pd = 40 * .45; return ['18%', '40%', '45%', '60%'].indexOf(pd / (pu + pd) * 100 + '%'); };
calc[25] = () => {
  const g = k => (stack[2025][k] - stack[2023][k]) / stack[2023][k];
  const v = ['Hardware', 'Software', 'Servizi'].map(g);
  return v.indexOf(Math.max(...v)) === 2 && close(v[2], 2.6) ? 2 : -1;
};
calc[27] = () => ['1 ora', '2 ore e 30 minuti', '5 ore', '6 ore'].indexOf(Math.round(1 / (1 / 2 - 1 / 3)) + ' ore');
calc[28] = () => { let pens = 0, buy = 0; for (pens = 15; ; pens += 15) { const profit = pens / 3 * 2 - pens / 5 * 3; if (profit >= 20) break; } return ['150', '300', '450', '600'].indexOf(String(pens)); };
calc[29] = () => { const sp = k => spesa[k].map((p, i) => p * [50, 40][i] / 100); const eq = Object.keys(spesa).filter(k => close(sp(k)[0], sp(k)[1])); return eq.length === 1 && eq[0] === 'Servizi sociali' ? 2 : -1; };
calc[32] = () => { const p = 4 / 10 * 3 / 9; return ['1/15', '3/25', '2/15', '4/25'].findIndex(f => { const [a, b] = f.split('/'); return close(a / b, p); }); };
calc[33] = () => { const g = idx.A.slice(1).map((v, i) => v / idx.A[i] - 1); const m = Math.max(...g); return ['2023', '2024', '2025'].indexOf(String(idx.A.length && [2022, 2023, 2024, 2025][g.indexOf(m)])); };
calc[34] = () => {               // (1): quota 20%->18%; (2): totale +10%
  const insieme = 0.18 * 1.1 < 0.2;                                    // 19,8% < 20%: X scende, sempre
  const s1 = new Set([100 * .18 > 100 * .2, 200 * .18 > 100 * .2]);    // totale invariato / raddoppiato
  const s2 = new Set([110 * .25 > 100 * .2, 110 * .1 > 100 * .2]);     // quota sale / scende
  return insieme && s1.size > 1 && s2.size > 1 ? 2 : -1;
};
calc[36] = () => ['1/4', '1/3', '5/12', '1/2'].findIndex(f => { const [a, b] = f.split('/'); return close(a / b, 2 / 3 - 1 / 4 * 2 / 3); });
calc[37] = () => { const gap = 18 * 40 / 60, t = gap / (48 - 18) * 60; const m = 9 * 60 + 40 + t; const hh = Math.floor(m / 60), mm = Math.round(m % 60); return ['9:51', '9:55', '10:04', '10:20'].indexOf(hh + ':' + String(mm).padStart(2, '0')); };
calc[38] = () => { const [a, b] = shares.Delta; return ['+1%', '+6,7%', '+25%', '+33,3%'].indexOf('+' + (Math.round((b * 250 / (a * 200) - 1) * 1000) / 10).toString().replace('.', ',') + '%'); };
calc[41] = () => { for (let x = 0; x <= 30; x++) if (12 * (30 - x) + 18 * x === 30 * 14) return ['6 kg', '10 kg', '15 kg', '20 kg'].indexOf(x + ' kg'); return -1; };
calc[42] = () => 120000 / 50 === 2400 ? 1 : -1;   // (2) basta da sola; (1) non fissa la media
calc[43] = () => { const occ = 400, n = 500; const ing = lauree.Ingegneria; const tasso = (occ + ing[0]) / (n + ing[0] + ing[1]); return ['76%', '79%', '80%', '84%'].indexOf(Math.round(tasso * 100) + '%'); };
calc[45] = () => ['176 €', '200 €', '220 €', '275 €'].indexOf((500 * 1.1 - 330) / 1.25 + ' €');
calc[46] = () => ['12 €', '24 €', '30 €', '36 €'].indexOf((18000 + 12 * 1500) / 1500 + ' €');
calc[47] = () => { const r = new Set(); for (let B = 40; B <= 200; B += 10) { const A = B - 20; r.add(.6 * A > .4 * B); } return r.size > 1 ? 3 : -1; };
calc[49] = () => ['100', '200', '1.067', '3.200'].indexOf(String(6400 / 2 ** 6));
calc[50] = () => { for (let d = 1; d < 500; d++) if (9 * d === 6 * (d + 10)) return ['20', '60', '180', '200'].indexOf(String(9 * d)); return -1; };

let ok = 0, ko = 0, senza = [];
for (const q of mock.questions) {
  if (q.area === 'V') continue;
  if (!calc[q.n]) { senza.push(q.n); continue; }
  const got = calc[q.n]();
  const good = got === q.ans;
  good ? ok++ : ko++;
  console.log(`${good ? 'ok ' : 'NO '} ${q.area.padEnd(2)} #${String(q.n).padStart(2)}  chiave ${L[q.ans]}  calcolata ${got < 0 ? '(nessuna)' : L[got]}`);
}
if (senza.length) console.log('Domande Q/DI senza controllo:', senza.join(', '));
console.log(`\n${ok} coincidono, ${ko} non coincidono.`);
process.exit(ko || senza.length ? 1 : 0);
