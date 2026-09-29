/* =======================================================================
   engine.js — motore comune del sito.

   Contiene:
   - caricamento dei mock (script classici, funziona anche da file://)
   - archivio nel browser (localStorage, sempre dentro try/catch)
   - punteggio con penalità, conteggi per area e per pattern
   - svolgimento di una prova: cronometro, schermate da 3, checkpoint
   - pagina dei risultati, revisione ed esportazione in testo

   Espone tutto in window.Bocconi. Nessuna dipendenza esterna.
   ======================================================================= */
(function (root) {
  'use strict';

  /* ======================= costanti ======================= */
  const PER_Q = 90;                 // 1,5 minuti a domanda
  const K_STORICO = 'bocconi-storico-v1';
  const K_TEMA = 'bocconi-tema-v1';
  const P_PROVA = 'bocconi-prova-';
  const AREA_NOME = { Q: 'Quantitativa', V: 'Verbale', DI: 'Data insights' };
  const CHECKPOINT = [                // domanda → tempo atteso (secondi)
    { q: 15, t: 22 * 60 }, { q: 30, t: 45 * 60 }, { q: 45, t: 67 * 60 }
  ];
  const PATTERN_MIEI = [
    'Falso vs Non deducibile', 'Rapporti vs valori assoluti', 'Cause alternative',
    'Media ponderata vs semplice', 'Sufficienza dei dati'
  ];

  /* ======================= utilità ======================= */
  function mmss(s) { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60); return m + ':' + String(s % 60).padStart(2, '0'); }
  function num(v, d) { return Number(v).toFixed(d === undefined ? 2 : d).replace('.', ','); }
  function esc(t) { return String(t === null || t === undefined ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function qs(name) { return new URLSearchParams(location.search).get(name); }

  /* ======================= archivio ======================= */
  const Store = {
    leggi(k, fallback) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fallback; } catch (e) { return fallback; } },
    scrivi(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    togli(k) { try { localStorage.removeItem(k); } catch (e) { } },

    storico() { const s = Store.leggi(K_STORICO, []); return Array.isArray(s) ? s : []; },
    aggiungi(tentativo) {
      const s = Store.storico();
      s.push(tentativo);
      s.sort((a, b) => a.ts - b.ts);
      while (s.length > 60) s.shift();          // non riempio lo spazio del browser
      Store.scrivi(K_STORICO, s);
      return tentativo;
    },
    svuotaStorico() { Store.togli(K_STORICO); },
    tentativo(ts) { return Store.storico().find(t => String(t.ts) === String(ts)) || null; },

    prova(key) { return Store.leggi(P_PROVA + key, null); },
    salvaProva(key, S) { Store.scrivi(P_PROVA + key, S); },
    buttaProva(key) { Store.togli(P_PROVA + key); }
  };

  /* ======================= tema chiaro / scuro ======================= */
  const Tema = {
    applica(t) {
      if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
      else document.documentElement.removeAttribute('data-theme');
    },
    corrente() { return Store.leggi(K_TEMA, 'auto'); },
    giro() {
      const ordine = ['auto', 'light', 'dark'];
      const next = ordine[(ordine.indexOf(Tema.corrente()) + 1) % 3];
      Store.scrivi(K_TEMA, next); Tema.applica(next); return next;
    },
    etichetta(t) { return t === 'light' ? 'Tema: chiaro' : t === 'dark' ? 'Tema: scuro' : 'Tema: auto'; },
    init() {
      Tema.applica(Tema.corrente());
      document.addEventListener('click', e => {
        const b = e.target.closest('.themebtn'); if (!b) return;
        b.textContent = Tema.etichetta(Tema.giro());
      });
      document.querySelectorAll('.themebtn').forEach(b => { b.textContent = Tema.etichetta(Tema.corrente()); });
    }
  };

  /* ======================= caricamento dei mock ======================= */
  root.MOCKS = root.MOCKS || {};

  function elenco() { return root.MOCK_ELENCO || []; }
  function voceElenco(id) { return elenco().find(m => m.id === id) || null; }

  function caricaMock(id) {
    if (root.MOCKS[id]) return Promise.resolve(root.MOCKS[id]);
    const voce = voceElenco(id);
    if (!voce) return Promise.reject(new Error('mock ' + id + ' non presente nell\'elenco'));
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = voce.file;
      s.onload = () => root.MOCKS[id] ? ok(root.MOCKS[id]) : ko(new Error('il file ' + voce.file + ' non ha registrato il mock ' + id));
      s.onerror = () => ko(new Error('non riesco a caricare ' + voce.file));
      document.head.appendChild(s);
    });
  }
  function caricaTutti() { return Promise.all(elenco().map(m => caricaMock(m.id))); }

  /* Risolve un riferimento {m, n} nella domanda vera. */
  function domanda(ref) {
    const mock = root.MOCKS[ref.m];
    if (!mock) return null;
    return mock.questions.find(q => q.n === ref.n) || null;
  }
  function domande(refs) { return refs.map(domanda); }

  /* ======================= punteggio ======================= */
  function penalita(q) { return q.opts.length === 3 ? 0.33 : 0.25; }

  function punteggio(qs_, answers) {
    let pts = 0, right = 0, wrong = 0, blank = 0;
    const byArea = { Q: { r: 0, w: 0, b: 0, p: 0, tot: 0 }, V: { r: 0, w: 0, b: 0, p: 0, tot: 0 }, DI: { r: 0, w: 0, b: 0, p: 0, tot: 0 } };
    qs_.forEach((q, i) => {
      if (!q) return;
      const a = answers[i], A = byArea[q.area] || (byArea[q.area] = { r: 0, w: 0, b: 0, p: 0, tot: 0 });
      A.tot++;
      if (a === null || a === undefined) { blank++; A.b++; }
      else if (a === q.ans) { pts += 1; right++; A.r++; A.p += 1; }
      else { const pen = penalita(q); pts -= pen; wrong++; A.w++; A.p -= pen; }
    });
    return { pts, right, wrong, blank, byArea, tot: qs_.length };
  }

  function perPattern(qs_, answers) {
    const patt = {};
    qs_.forEach((q, i) => {
      if (!q) return;
      const a = answers[i];
      if (!patt[q.patt]) patt[q.patt] = { tot: 0, bad: [], om: [] };
      patt[q.patt].tot++;
      if (a === null || a === undefined) patt[q.patt].om.push(q.n);
      else if (a !== q.ans) patt[q.patt].bad.push(q.n);
    });
    return patt;
  }

  /* ======================= esportazione in testo ======================= */
  function esporta(tentativo) {
    const qs_ = domande(tentativo.items.map(it => ({ m: it.m, n: it.n })));
    const answers = tentativo.items.map(it => (it.a === undefined ? null : it.a));
    const R = punteggio(qs_, answers);
    const patt = perPattern(qs_, answers);
    const data = new Date(tentativo.ts);
    const righe = [];
    righe.push(`${tentativo.label} — ${num(R.pts)}/${R.tot} (${R.right} giuste, ${R.wrong} sbagliate, ${R.blank} omesse), tempo ${mmss(tentativo.used)}${tentativo.timeout ? ' — tempo scaduto' : ''}`);
    righe.push(`Data: ${data.toLocaleDateString('it-IT')} ${data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`);
    righe.push('Per area: ' + ['Q', 'V', 'DI'].filter(a => R.byArea[a].tot)
      .map(a => `${a} ${num(R.byArea[a].p)}/${R.byArea[a].tot} (${R.byArea[a].r}g ${R.byArea[a].w}s ${R.byArea[a].b}o)`).join(' · '));
    if (tentativo.screenTimes && tentativo.screenTimes.length)
      righe.push('Tempo per schermata: ' + tentativo.screenTimes.map((t, i) => `${i + 1}:${mmss(t)}`).join(' · '));
    const pattRighe = Object.entries(patt)
      .filter(([, v]) => v.bad.length || v.om.length)
      .sort((a, b) => (b[1].bad.length + b[1].om.length) - (a[1].bad.length + a[1].om.length))
      .map(([k, v]) => `${k}: ${v.bad.length}/${v.tot} sbagliate${v.bad.length ? ' (n. ' + v.bad.join(', ') + ')' : ''}${v.om.length ? ', omesse n. ' + v.om.join(', ') : ''}`);
    righe.push('Errori per pattern:');
    righe.push(pattRighe.length ? pattRighe.map(r => '  - ' + r).join('\n') : '  - nessun errore');
    righe.push('Risposte (domanda:lettera, - = omessa):');
    righe.push('  ' + tentativo.items.map(it => `${it.n}:${it.a === null || it.a === undefined ? '-' : 'ABCD'[it.a]}`).join(' '));
    const sbagliate = qs_.map((q, i) => ({ q, a: answers[i] })).filter(x => x.q && x.a !== null && x.a !== undefined && x.a !== x.q.ans);
    if (sbagliate.length) {
      righe.push('Dettaglio degli errori (domanda, mia risposta, corretta, pattern):');
      sbagliate.forEach(x => righe.push(`  - n.${x.q.n} ${x.q.area}: ho messo ${'ABCD'[x.a]}, corretta ${'ABCD'[x.q.ans]} — ${x.q.patt}`));
    }
    return righe.join('\n');
  }

  function copia(testo, elFlash) {
    const fine = ok => {
      if (!elFlash) return;
      elFlash.textContent = ok ? 'Copiato.' : 'Copia non riuscita: seleziona il testo qui sotto.';
      elFlash.style.color = ok ? 'var(--good)' : 'var(--signal)';
      elFlash.classList.add('on');
      setTimeout(() => elFlash.classList.remove('on'), 2600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText && location.protocol !== 'file:') {
      navigator.clipboard.writeText(testo).then(() => fine(true), () => fine(fallback(testo)));
    } else fine(fallback(testo));
  }
  function fallback(testo) {
    try {
      const ta = document.createElement('textarea');
      ta.value = testo; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.top = '-1000px';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  /* ======================= scelta delle domande ======================= */
  function mescola(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* Tutte le domande pubblicate, con il mock di provenienza. */
  function tutteLeDomande() {
    const out = [];
    elenco().forEach(v => {
      const m = root.MOCKS[v.id];
      if (m) m.questions.forEach(q => out.push({ m: v.id, n: q.n, q }));
    });
    return out;
  }

  /* Domande sbagliate o omesse nei tentativi passati, dalla più recente. */
  function mieiErrori() {
    const visti = new Map();
    Store.storico().slice().sort((a, b) => b.ts - a.ts).forEach(t => {
      (t.items || []).forEach(it => {
        const chiave = it.m + '#' + it.n;
        if (visti.has(chiave)) return;
        const q = domanda({ m: it.m, n: it.n });
        if (!q) return;
        const a = (it.a === undefined ? null : it.a);
        if (a === null || a !== q.ans) visti.set(chiave, { m: it.m, n: it.n, q, esito: a === null ? 'omessa' : 'sbagliata', ts: t.ts });
      });
    });
    return Array.from(visti.values());
  }

  /* ======================= la prova ======================= */
  function nuovaProva(o) {
    return {
      v: 1, key: o.key, mode: o.mode, label: o.label, mockId: o.mockId || null,
      refs: o.refs, seconds: o.seconds,
      phase: 'run', screen: 0, answers: new Array(o.refs.length).fill(null),
      left: o.seconds, tPrev: o.seconds, screenTimes: [], timeout: false,
      ckptFatti: []
    };
  }

  function Prova(cfg) {
    const el = {
      app: document.getElementById('app'), bar: document.getElementById('bar'),
      foot: document.getElementById('foot'), clock: document.getElementById('clock'),
      pos: document.getElementById('pos'), pace: document.getElementById('pace'),
      track: document.querySelector('#track > i'), hint: document.getElementById('hint'),
      next: document.getElementById('next')
    };
    let S = null, QS = [], SCREENS = [], ticker = null;

    function costruisciSchermate() {
      QS = domande(S.refs);
      SCREENS = [];
      for (let i = 0; i < QS.length; i += 3) SCREENS.push({ from: i, qs: QS.slice(i, i + 3) });
    }

    /* ---------------- copertina ---------------- */
    function copertina(ripresa) {
      el.bar.classList.add('hidden'); el.foot.classList.add('hidden');
      const n = cfg.refs.length;
      el.app.innerHTML = `<div class="wrap cover">
        <div class="kicker ui">${esc(cfg.kicker)}</div>
        <h1>${cfg.h1}</h1>
        <p class="sub">${esc(cfg.sub)}</p>
        <dl class="rules">
          <div class="rule-row"><dt>Tempo</dt><dd>${Math.round(cfg.seconds / 60)} minuti in totale. Il cronometro parte quando premi Inizia e non si ferma.</dd></div>
          <div class="rule-row"><dt>Schermate</dt><dd>3 domande per volta. Una volta chiusa una schermata non si torna indietro.</dd></div>
          <div class="rule-row"><dt>Materiale</dt><dd>Una penna e 2 fogli A4. Nessuna calcolatrice: tutti i conti si fanno a mano.</dd></div>
          <div class="rule-row"><dt>Punteggio</dt><dd>+1 corretta, 0 omessa, −0,25 errata (4 opzioni), −0,33 errata (3 opzioni).${cfg.soglia ? ' Soglia minima 15/50.' : ''}</dd></div>
          <div class="rule-row"><dt>Ritmo</dt><dd>1,5 minuti a domanda.${cfg.checkpoint ? " Checkpoint: alla 15ª ≈ 22', alla 30ª ≈ 45', alla 45ª ≈ 67'." : ''}</dd></div>
          ${cfg.lingua ? `<div class="rule-row"><dt>Lingua</dt><dd>${esc(cfg.lingua)}</dd></div>` : ''}
        </dl>
        <div class="warnbox"><p>Rispondi sempre: con queste penalità anche il tiro alla cieca ha valore atteso positivo, e se elimini anche una sola opzione conviene di sicuro. Lasciare in bianco vale zero.</p></div>
        ${ripresa ? `<p class="note" style="margin-bottom:1.2rem">Prova interrotta: schermata ${ripresa.screen + 1} di ${Math.ceil(ripresa.refs.length / 3)}, ${mmss(ripresa.left)} rimasti.</p>` : ''}
        <div style="display:flex;gap:.7rem;flex-wrap:wrap">
          ${ripresa ? `<button class="btn" id="go-resume">Riprendi</button><button class="btn ghost" id="go-new">Ricomincia da zero</button>`
          : `<button class="btn" id="go-new">Inizia${n ? ' la prova' : ''}</button>`}
          <a class="btn ghost" href="index.html" style="text-decoration:none;display:inline-block">Torna alla home</a>
        </div>
      </div>`;
      const r = document.getElementById('go-resume');
      if (r) r.onclick = () => { S = ripresa; costruisciSchermate(); avvia(); };
      document.getElementById('go-new').onclick = () => {
        Store.buttaProva(cfg.key);
        S = nuovaProva(cfg);
        costruisciSchermate();
        avvia();
      };
      window.scrollTo(0, 0);
    }

    /* ---------------- svolgimento ---------------- */
    function avvia() {
      S.phase = 'run';
      el.bar.classList.remove('hidden'); el.foot.classList.remove('hidden');
      schermata();
      if (ticker) clearInterval(ticker);
      ticker = setInterval(tick, 1000);
      tick();
    }

    function tick() {
      S.left -= 1;
      if (S.left <= 0) { S.left = 0; orologio(); chiudi(true); return; }
      orologio();
      if (S.left % 5 === 0) Store.salvaProva(cfg.key, S);
    }

    function orologio() {
      el.clock.textContent = mmss(S.left);
      el.clock.className = S.left <= 300 ? 'crit' : (S.left <= 900 ? 'warn' : '');
      const fatte = S.screen * 3;
      const attese = Math.floor((S.seconds - S.left) / PER_Q);
      const d = fatte - attese;
      el.pace.textContent = (S.seconds - S.left) < 120 ? '' :
        (d >= 1 ? `${d} domande di margine` : (d <= -1 ? `${-d} domande di ritardo` : 'in linea con il ritmo'));
    }

    function schermata() {
      const sc = SCREENS[S.screen];
      const first = sc.from + 1, last = sc.from + sc.qs.length;
      el.pos.textContent = `Domanda ${first}–${last} di ${QS.length}`;
      el.track.style.width = (S.screen / SCREENS.length * 100) + '%';
      el.app.innerHTML = `<div class="wrap screen">` + sc.qs.map((q, i) => carta(q, sc.from + i)).join('') + `</div>`;
      el.app.querySelectorAll('input[type=radio]').forEach(inp => {
        inp.addEventListener('change', e => {
          S.answers[+e.target.dataset.i] = +e.target.value;
          Store.salvaProva(cfg.key, S); suggerimento();
        });
      });
      suggerimento();
      el.next.textContent = (S.screen === SCREENS.length - 1) ? 'Consegna' : 'Avanti';
      window.scrollTo(0, 0);
    }

    function carta(q, i) {
      if (!q) return `<section class="q"><p class="note">Domanda non disponibile.</p></section>`;
      const tags = `<span class="tag">${AREA_NOME[q.area] || q.area}</span>` + (q.lang === 'en' ? `<span class="tag">EN</span>` : '');
      const body = (q.passage ? `<div class="passage">${q.passage}</div>` : '')
        + (q.claim ? `<p class="claim">Affermazione: «${q.claim}»</p><p class="stem">L'affermazione è:</p>` : '')
        + (q.asset || '')
        + (q.stem ? (q.ds ? q.stem : `<p class="stem">${q.stem}</p>`) : '');
      const opts = q.opts.map((o, k) => `
        <li><label>
          <input type="radio" name="q${i}" value="${k}" data-i="${i}" ${S.answers[i] === k ? 'checked' : ''}>
          <span class="ltr">${'ABCD'[k]}</span><span>${o}</span>
        </label></li>`).join('');
      return `<section class="q" id="q${i + 1}">
        <div class="qnum ui"><span>${i + 1}</span>${tags}</div>
        ${body}
        <ul class="opts">${opts}</ul>
      </section>`;
    }

    function suggerimento() {
      const sc = SCREENS[S.screen];
      const vuote = sc.qs.filter((q, i) => S.answers[sc.from + i] === null).length;
      el.hint.textContent = vuote === 0 ? (sc.qs.length === 3 ? 'Tutte e tre date.' : sc.qs.length === 2 ? 'Entrambe date.' : 'Data.') :
        (vuote === 1 ? '1 domanda ancora in bianco.' : `${vuote} domande ancora in bianco.`);
      el.hint.style.color = vuote === 0 ? 'var(--good)' : 'var(--signal)';
    }

    /* Checkpoint di tempo: alla 15ª, 30ª e 45ª domanda. */
    function checkpoint(fatte) {
      if (!cfg.checkpoint) return;
      const cp = CHECKPOINT.find(c => c.q === fatte && S.ckptFatti.indexOf(c.q) < 0);
      if (!cp) return;
      S.ckptFatti.push(cp.q);
      const usato = S.seconds - S.left;
      const d = Math.round(usato - cp.t);
      const box = document.createElement('div');
      box.id = 'ckpt';
      box.className = d > 0 ? 'late' : 'ok';
      box.innerHTML = `<b>Checkpoint · domanda ${cp.q}</b>` +
        `Tempo usato ${mmss(usato)}, riferimento ${mmss(cp.t)}: ` +
        (Math.abs(d) < 30 ? 'sei in linea.' : d > 0 ? `sei indietro di ${mmss(Math.abs(d))}.` : `sei avanti di ${mmss(Math.abs(d))}.`);
      const vecchio = document.getElementById('ckpt'); if (vecchio) vecchio.remove();
      document.body.appendChild(box);
      setTimeout(() => { if (box.parentNode) box.remove(); }, 7000);
    }

    el.next.onclick = () => {
      const sc = SCREENS[S.screen];
      const vuote = sc.qs.filter((q, i) => S.answers[sc.from + i] === null).length;
      if (vuote > 0 && !confirm(`Stai chiudendo la schermata con ${vuote} domanda/e in bianco. Valgono 0 e non potrai tornare indietro. Confermi?`)) return;
      S.screenTimes.push(Math.round(S.tPrev - S.left)); S.tPrev = S.left;
      const fatte = sc.from + sc.qs.length;
      if (S.screen === SCREENS.length - 1) { chiudi(false); return; }
      S.screen++; Store.salvaProva(cfg.key, S); schermata(); checkpoint(fatte);
    };

    /* ---------------- consegna ---------------- */
    function chiudi(scaduto) {
      if (ticker) clearInterval(ticker);
      const box = document.getElementById('ckpt'); if (box) box.remove();
      S.phase = 'done'; S.timeout = !!scaduto;
      if (scaduto && S.screenTimes.length < SCREENS.length) S.screenTimes.push(Math.round(S.tPrev - S.left));
      const tentativo = {
        ts: Date.now(), mode: S.mode, mockId: S.mockId, label: S.label,
        used: S.seconds - S.left, seconds: S.seconds, timeout: S.timeout,
        screenTimes: S.screenTimes.slice(),
        items: S.refs.map((r, i) => ({ m: r.m, n: r.n, a: S.answers[i] }))
      };
      Store.aggiungi(tentativo);
      Store.buttaProva(cfg.key);
      S = null;
      mostraEsito(tentativo, { appenaFatta: true });
    }

    /* ---------------- avvio ---------------- */
    this.parti = function () {
      const salvata = Store.prova(cfg.key);
      const valida = salvata && salvata.phase === 'run' && salvata.refs && salvata.refs.length === cfg.refs.length;
      if (valida) copertina(salvata);
      else { Store.buttaProva(cfg.key); copertina(null); }
    };

    window.addEventListener('beforeunload', e => {
      if (S && S.phase === 'run') { e.preventDefault(); e.returnValue = ''; }
    });
  }

  /* ======================= esito, revisione, esportazione ======================= */
  function mostraEsito(tentativo, opt) {
    opt = opt || {};
    const app = document.getElementById('app');
    const bar = document.getElementById('bar'); if (bar) bar.classList.add('hidden');
    const foot = document.getElementById('foot'); if (foot) foot.classList.add('hidden');

    const refs = tentativo.items.map(it => ({ m: it.m, n: it.n }));
    const QS = domande(refs);
    const answers = tentativo.items.map(it => (it.a === undefined ? null : it.a));
    const R = punteggio(QS, answers);
    const patt = perPattern(QS, answers);
    const completo = tentativo.mode === 'full' && R.tot === 50;
    const passa = R.pts >= 15;

    const pattRighe = Object.entries(patt)
      .sort((a, b) => (b[1].bad.length - a[1].bad.length) || (b[1].om.length - a[1].om.length))
      .map(([k, v]) => `<div class="row"><span>${esc(k)}${PATTERN_MIEI.includes(k) ? ' ◆' : ''}</span><span class="n">${v.bad.length}/${v.tot}</span>
        <span class="qs">${v.bad.length ? ('n. ' + v.bad.join(', ')) : '—'}${v.om.length ? (' · om. ' + v.om.join(', ')) : ''}</span></div>`).join('');

    const areaRiga = (k) => {
      const A = R.byArea[k];
      if (!A || !A.tot) return '';
      return `<div class="row"><span>${AREA_NOME[k]}</span><span>${A.r}</span><span>${A.w}</span><span>${A.b}</span><span>${A.tot}</span><span>${num(A.p)}</span></div>`;
    };

    const tempi = (tentativo.screenTimes || []).map((t, i) => `${i + 1}: ${mmss(t)}${t > 270 ? ' ⚑' : ''}`).join(' · ');
    const testoExport = esporta(tentativo);

    app.innerHTML = `<div class="wrap res">
      <div class="kicker ui">Esito · ${esc(tentativo.label)}${tentativo.timeout ? ' · tempo scaduto' : ''}</div>
      <div class="bigscore">${num(R.pts)}<small> / ${R.tot}</small></div>
      <p class="verdict" style="color:${completo ? (passa ? 'var(--good)' : 'var(--signal)') : 'var(--ink-soft)'}">
        ${completo ? (passa ? 'Sopra la soglia minima di 15' : 'Sotto la soglia minima di 15') : 'Prova di allenamento'} ·
        ${R.right} corrette, ${R.wrong} errate, ${R.blank} omesse · tempo usato ${mmss(tentativo.used)}
      </p>

      <div class="grid">
        <div class="row head"><span>Area</span>
          <span><span class="wide">Giuste</span><span class="narrow">G</span></span>
          <span><span class="wide">Sbagliate</span><span class="narrow">S</span></span>
          <span><span class="wide">Omesse</span><span class="narrow">O</span></span>
          <span><span class="wide">Totale</span><span class="narrow">Tot</span></span>
          <span>Punti</span></div>
        ${areaRiga('Q')}${areaRiga('V')}${areaRiga('DI')}
        <div class="row"><span><b>Totale</b></span><span>${R.right}</span><span>${R.wrong}</span><span>${R.blank}</span><span>${R.tot}</span><span><b>${num(R.pts)}</b></span></div>
      </div>

      <h2 class="sec">Errori per pattern</h2>
      <div class="patt">
        <div class="row head"><span>Pattern</span><span class="n">Errori</span><span class="qs">Domande</span></div>
        ${pattRighe}
      </div>
      <p class="note">◆ = uno dei 5 pattern d'errore da tenere d'occhio.</p>

      <h2 class="sec">Tempo per schermata</h2>
      <p class="note">${tempi || '—'}<br>⚑ = oltre 4'30", il budget di una schermata.</p>

      <h2 class="sec noprint">Esporta per l'analisi</h2>
      <p class="note noprint">Copia il riepilogo e incollalo in chat con Claude.
        <button class="btn small noprint" id="copia" style="margin-left:.4rem">Copia il riepilogo</button>
        <span class="flash" id="flash"></span></p>
      <textarea class="noprint" readonly rows="10" id="dump">${esc(testoExport)}</textarea>

      <h2 class="sec">Revisione</h2>
      <div id="review"></div>

      <div style="margin-top:2.5rem;display:flex;gap:.7rem;flex-wrap:wrap" class="noprint">
        ${opt.appenaFatta ? `<button class="btn" id="again">Rifai da zero</button>` : ''}
        <a class="btn ghost" href="index.html" style="text-decoration:none;display:inline-block">Home</a>
        <button class="btn ghost" id="printit">Stampa l'esito</button>
      </div>
    </div>`;

    document.getElementById('review').innerHTML = QS.map((q, i) => {
      if (!q) return '';
      const a = answers[i];
      const st = a === null ? ['vt-om', 'omessa'] : (a === q.ans ? ['vt-ok', 'corretta'] : ['vt-no', 'sbagliata']);
      const opts = q.opts.map((o, k) => {
        const mk = k === q.ans ? '<span class="mark">← corretta</span>' : (k === a ? '<span class="mark">← la tua</span>' : '');
        return `<li><label><span class="ltr" style="${k === q.ans ? 'background:var(--ink);color:var(--paper);border-color:var(--ink)' : ''}">${'ABCD'[k]}</span><span>${o}${mk}</span></label></li>`;
      }).join('');
      const body = (q.passage ? `<div class="passage">${q.passage}</div>` : '')
        + (q.claim ? `<p class="claim">Affermazione: «${q.claim}»</p>` : '')
        + (q.asset || '')
        + (q.stem ? (q.ds ? q.stem : `<p class="stem">${q.stem}</p>`) : '');
      return `<section class="rev">
        <div class="qnum ui"><span>${i + 1}</span><span class="verdicttag ${st[0]}">${st[1]}</span>
          <span class="tag">${AREA_NOME[q.area] || q.area}</span>
          <span class="tag">${q.diff}</span>
          ${q.lang === 'en' ? '<span class="tag">EN</span>' : ''}
          <span class="tag">${esc((voceElenco(refs[i].m) || {}).title || 'Mock ' + refs[i].m)} · n. ${q.n}</span></div>
        ${body}
        <ul class="opts">${opts}</ul>
        <div class="solbox">
          <b>Via rapida</b><p>${q.sol}</p>
          <b>Trappola</b><p>${q.trap}</p>
          <b>Pattern</b><p>${esc(q.patt)}</p>
        </div>
      </section>`;
    }).join('');

    const btnCopia = document.getElementById('copia');
    if (btnCopia) btnCopia.onclick = () => copia(testoExport, document.getElementById('flash'));
    const again = document.getElementById('again');
    if (again) again.onclick = () => location.reload();
    document.getElementById('printit').onclick = () => window.print();
    window.scrollTo(0, 0);
  }

  /* ======================= grafico dell'andamento ======================= */
  function andamento(tentativi) {
    if (!root.Charts || !tentativi.length) return '';
    const etichette = tentativi.map(t => {
      const d = new Date(t.ts);
      return d.getDate() + '/' + (d.getMonth() + 1);
    });
    const serie = ['Q', 'V', 'DI'].map((a, i) => ({
      name: AREA_NOME[a],
      stroke: ['var(--f1)', 'var(--f2)', 'var(--f3)'][i],
      dash: [null, '5 3', '2 3'][i],
      values: tentativi.map(t => {
        const QS = domande(t.items.map(it => ({ m: it.m, n: it.n })));
        const R = punteggio(QS, t.items.map(it => (it.a === undefined ? null : it.a)));
        const A = R.byArea[a];
        return A && A.tot ? Math.round(A.p / A.tot * 100) : null;
      })
    }));
    return root.Charts.line({
      labels: etichette, series: serie, lo: 0, hi: 100, gridFrom: 0, gridTo: 100, gridStep: 25,
      title: '% dei punti sul massimo dell\'area · un punto per mock completo', legend: true, showValues: false,
      aria: 'Andamento dei punteggi per area nei tentativi registrati'
    });
  }

  /* ======================= esposizione ======================= */
  root.Bocconi = {
    PER_Q, AREA_NOME, PATTERN_MIEI, CHECKPOINT,
    mmss, num, esc, qs,
    Store, Tema,
    elenco, voceElenco, caricaMock, caricaTutti, domanda, domande,
    punteggio, perPattern, penalita, esporta, copia,
    mescola, tutteLeDomande, mieiErrori,
    Prova, mostraEsito, andamento
  };
})(window);
