/* =======================================================================
   charts.js — grafici SVG e tabelle riusabili per i mock.
   Nessuna dipendenza. Ogni funzione restituisce una stringa HTML.
   I colori arrivano dalle variabili CSS, così i grafici seguono
   automaticamente il tema chiaro e quello scuro.
   Funziona sia nel browser (window.Charts) sia in Node (module.exports),
   così il validatore e gli script di verifica possono caricare i mock.
   ======================================================================= */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Charts = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* Arrotonda le coordinate: evita code di virgola come 294.51000000000005
     nell'SVG. Tre decimali sono ben oltre la precisione dello schermo. */
  function r(v) { return Math.round(v * 1000) / 1000; }
  var rd = r;

  /* ---------------------------------------------------------------
     Tabella
     table({caption, head:[...], rows:[[...]], foot:[...]})
     --------------------------------------------------------------- */
  function table(o) {
    var h = '<div class="asset"><table>';
    if (o.caption) h += '\n<caption>' + o.caption + '</caption>';
    if (o.head) h += '\n<thead><tr>' + o.head.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead>';
    h += '\n<tbody>\n';
    h += (o.rows || []).map(function (r) {
      return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('\n');
    h += '\n</tbody>';
    if (o.foot) h += '\n<tfoot><tr>' + o.foot.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr></tfoot>';
    h += '\n</table></div>';
    return h;
  }

  /* ---------------------------------------------------------------
     Barre (una o più serie affiancate)
     bars({labels, series:[{name, values, style:'fill'|'outline'}],
           max, unit, aria, legend})
     --------------------------------------------------------------- */
  function bars(o) {
    var labels = o.labels, series = o.series;
    var n = labels.length, k = series.length;
    var W = o.W || 520, H = o.H || 230, L = o.L || 34, B = o.B || 44, T = o.T || 18, R = o.R || 8;
    var maxV = o.max || Math.max.apply(null, series.reduce(function (a, s) { return a.concat(s.values); }, []));
    var plotH = H - T - B, plotW = W - L - R;
    var groupW = plotW / n, bw = r(groupW * 0.28), gap = groupW * 0.08;
    var total = k * bw + (k - 1) * gap;
    var barsHtml = '', labsHtml = '';
    for (var i = 0; i < n; i++) {
      var cx = L + groupW * i + groupW / 2;
      var x0 = cx - total / 2;
      var xs = [], hs = [];
      for (var s = 0; s < k; s++) {
        xs.push(r(x0 + s * (bw + gap)));
        hs.push(r(series[s].values[i] / maxV * plotH));
      }
      for (var s2 = 0; s2 < k; s2++) {
        barsHtml += series[s2].style === 'outline'
          ? '<rect x="' + xs[s2] + '" y="' + r(T + plotH - hs[s2]) + '" width="' + bw + '" height="' + hs[s2] + '" fill="none" stroke="var(--ink)" stroke-width="1.4"></rect>'
          : '<rect x="' + xs[s2] + '" y="' + r(T + plotH - hs[s2]) + '" width="' + bw + '" height="' + hs[s2] + '" fill="' + (series[s2].fill || 'var(--ink)') + '"></rect>';
      }
      for (var s3 = 0; s3 < k; s3++) {
        barsHtml += '<text class="chartval" x="' + r(xs[s3] + bw / 2) + '" y="' + r(T + plotH - hs[s3] - 4) + '" text-anchor="middle">' + series[s3].values[i] + '</text>';
      }
      labsHtml += '<text class="chartlabel" x="' + r(cx) + '" y="' + r(T + plotH + 16) + '" text-anchor="middle">' + labels[i] + '</text>';
    }
    var leg = '';
    if (o.legend !== false && k > 1) {
      for (var j = 0; j < k; j++) {
        var lx = L + j * 62;
        leg += series[j].style === 'outline'
          ? '<rect x="' + lx + '" y="' + (H - 16) + '" width="11" height="9" fill="none" stroke="var(--ink)" stroke-width="1.4"></rect>'
          : '<rect x="' + lx + '" y="' + (H - 16) + '" width="11" height="9" fill="' + (series[j].fill || 'var(--ink)') + '"></rect>';
        leg += '<text class="chartlabel" x="' + (lx + 16) + '" y="' + (H - 8) + '">' + series[j].name + '</text>';
      }
    }
    var unit = o.unit ? '<text class="chartlabel" x="0" y="' + (T + 6) + '">' + o.unit + '</text>' : '';
    return '<div class="asset"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (o.aria || '') + '">\n' +
      '  <line x1="' + L + '" y1="' + (T + plotH) + '" x2="' + (W - R) + '" y2="' + (T + plotH) + '" stroke="var(--rule-strong)"></line>\n' +
      '  ' + barsHtml + labsHtml + '\n  ' + leg + '\n  ' + unit + '\n  </svg></div>';
  }

  /* ---------------------------------------------------------------
     Linee (una o più serie)
     line({labels, series:[{name, values, dash}], lo, hi,
           gridFrom, gridTo, gridStep, title, aria, showValues, legend})
     --------------------------------------------------------------- */
  function line(o) {
    var labels = o.labels, series = o.series;
    var n = labels.length;
    var W = o.W || 520, H = o.H || 210, L = o.L || 40, B = o.B || (o.legend && series.length > 1 ? 50 : 34), T = o.T || 22, R = o.R || 14;
    var lo = o.lo, hi = o.hi;
    if (lo === undefined || hi === undefined) {
      var all = series.reduce(function (a, s) { return a.concat(s.values.filter(function (v) { return v !== null; })); }, []);
      var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all);
      var pad = (mx - mn) || 1;
      if (lo === undefined) lo = mn - pad * 0.2;
      if (hi === undefined) hi = mx + pad * 0.2;
    }
    var plotH = H - T - B, plotW = W - L - R;
    var x = function (i) { return r(n === 1 ? L + plotW / 2 : L + plotW * i / (n - 1)); };
    var y = function (v) { return r(T + plotH - (v - lo) / (hi - lo) * plotH); };
    var grid = '';
    var gf = o.gridFrom !== undefined ? o.gridFrom : lo, gt = o.gridTo !== undefined ? o.gridTo : hi;
    var gs = o.gridStep || ((gt - gf) / 4 || 1);
    for (var g = gf; g <= gt + 1e-9; g += gs) {
      grid += '<line x1="' + L + '" y1="' + y(g) + '" x2="' + (W - R) + '" y2="' + y(g) + '" stroke="var(--rule)"></line>';
      grid += '<text class="chartlabel" x="' + (L - 6) + '" y="' + r(y(g) + 4) + '" text-anchor="end">' + (Math.round(g * 100) / 100) + '</text>';
    }
    var body = '', labs = '';
    series.forEach(function (s, si) {
      var pts = [];
      s.values.forEach(function (v, i) { if (v !== null && v !== undefined) pts.push(x(i) + ',' + y(v)); });
      body += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + (s.stroke || 'var(--ink)') + '" stroke-width="1.8"' +
        (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + '></polyline>';
      s.values.forEach(function (v, i) {
        if (v === null || v === undefined) return;
        body += '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="3.4" fill="var(--paper)" stroke="' + (s.stroke || 'var(--ink)') + '" stroke-width="1.6"></circle>';
        if (o.showValues !== false) body += '<text class="chartval" x="' + x(i) + '" y="' + r(y(v) - 10) + '" text-anchor="middle">' + v + '</text>';
      });
      if (si === 0) s.values.forEach(function (v, i) {
        labs += '<text class="chartlabel" x="' + x(i) + '" y="' + r(T + plotH + 18) + '" text-anchor="middle">' + labels[i] + '</text>';
      });
    });
    var leg = '';
    if (o.legend && series.length > 1) {
      series.forEach(function (s, j) {
        var lx = L + j * 92;
        leg += '<line x1="' + lx + '" y1="' + (H - 11) + '" x2="' + (lx + 14) + '" y2="' + (H - 11) + '" stroke="' + (s.stroke || 'var(--ink)') + '" stroke-width="1.8"' +
          (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + '></line>';
        leg += '<text class="chartlabel" x="' + (lx + 20) + '" y="' + (H - 7) + '">' + s.name + '</text>';
      });
    }
    return '<div class="asset"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (o.aria || '') + '">\n' +
      '  ' + grid + body + labs + leg + '\n' +
      '  <text class="chartlabel" x="0" y="' + (T - 8) + '">' + (o.title || '') + '</text></svg></div>';
  }

  /* ---------------------------------------------------------------
     Torta
     pie({data:[[etichetta, valore], ...], title, aria})
     I valori sono percentuali che sommano a 100.
     --------------------------------------------------------------- */
  function pie(o) {
    var data = o.data;
    var cx = o.cx || 110, cy = o.cy || 110, rr = o.r || 86, W = o.W || 470, H = o.H || 228;
    var a = -Math.PI / 2, paths = '', leg = '';
    var fills = o.fills || ['var(--f1)', 'var(--f2)', 'var(--f3)', 'var(--f4)'];
    var tot = data.reduce(function (s, d) { return s + d[1]; }, 0);
    data.forEach(function (d, i) {
      var ang = d[1] / tot * 2 * Math.PI, b = a + ang;
      var x1 = rd(cx + rr * Math.cos(a)), y1 = rd(cy + rr * Math.sin(a)), x2 = rd(cx + rr * Math.cos(b)), y2 = rd(cy + rr * Math.sin(b));
      paths += '<path d="M' + cx + ',' + cy + ' L' + x1 + ',' + y1 + ' A' + rr + ',' + rr + ' 0 ' + (ang > Math.PI ? 1 : 0) + ' 1 ' + x2 + ',' + y2 + ' Z" fill="' + fills[i % fills.length] + '" stroke="var(--paper)" stroke-width="1.5"></path>';
      leg += '<rect x="248" y="' + (44 + i * 30) + '" width="11" height="11" fill="' + fills[i % fills.length] + '" stroke="var(--rule-strong)" stroke-width=".7"></rect>';
      leg += '<text class="chartval" x="268" y="' + (54 + i * 30) + '">' + d[0] + ' — ' + d[1] + '%</text>';
      a = b;
    });
    return '<div class="asset"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (o.aria || '') + '">\n' +
      '  ' + paths + leg + '<text class="chartlabel" x="248" y="26">' + (o.title || '') + '</text></svg></div>';
  }

  /* ---------------------------------------------------------------
     Sufficienza dei dati: testo della domanda + le due informazioni
     --------------------------------------------------------------- */
  function ds(q, i1, i2) {
    return '<p class="stem">' + q + '</p><div class="dsbox">\n' +
      '  <div><span>(1)</span><span>' + i1 + '</span></div>\n' +
      '  <div><span>(2)</span><span>' + i2 + '</span></div></div>';
  }

  /* Opzioni standard ricorrenti */
  var DSOPTS = [
    'La (1) da sola è sufficiente, la (2) da sola no',
    'La (2) da sola è sufficiente, la (1) da sola no',
    'Servono entrambe insieme; nessuna delle due da sola basta',
    'Nemmeno insieme sono sufficienti'
  ];
  var DSOPTS_EN = [
    'Statement (1) alone is sufficient, (2) alone is not',
    'Statement (2) alone is sufficient, (1) alone is not',
    'Both statements together are needed; neither alone is sufficient',
    'Even together they are not sufficient'
  ];
  var VFN = ['Vera', 'Falsa', 'Non deducibile'];
  var VFN_EN = ['True', 'False', 'Cannot be determined'];

  return {
    table: table, bars: bars, line: line, pie: pie, ds: ds,
    DSOPTS: DSOPTS, DSOPTS_EN: DSOPTS_EN, VFN: VFN, VFN_EN: VFN_EN
  };
});
