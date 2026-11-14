/* Kachel-Renderer: zeichnet Folie 1 (Foto + Hook + Kernsatz) und Folie 2 (Fakten, Einordnung, Quelle) auf ein Canvas 1080 x 1350. */
(function () {
  var W = 1080, H = 1350, PAD = 60, OR = '#ff6a00';
  var AN = function (s) { return s + 'px JTAnton'; };
  var OS = function (s, w) { return (w || 400) + ' ' + s + 'px JTOswald'; };

  // Versalien, aber µ bleibt µ (Großbuchstabe wäre griechisches My und fehlt in der Schrift)
  function up(s) { return String(s || '').split('').map(function (c) { return c === 'µ' ? c : c.toUpperCase(); }).join(''); }

  function wrap(ctx, text, maxW) {
    var words = String(text).split(/\s+/).filter(Boolean), lines = [], cur = '';
    words.forEach(function (w) {
      var c = cur ? cur + ' ' + w : w;
      if (ctx.measureText(c).width <= maxW || !cur) cur = c; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }
  // Gleichmäßiger Umbruch: gleiche Zeilenzahl wie der normale Umbruch, aber ohne einsame Wörter in der letzten Zeile.
  function balWrap(ctx, text, maxW) {
    var base = wrap(ctx, text, maxW);
    if (base.length < 2) return base;
    var lo = 0; String(text).split(/\s+/).forEach(function (w) { lo = Math.max(lo, ctx.measureText(w).width); });
    var hi = maxW, n = base.length;
    for (var i = 0; i < 14; i++) { var mid = (lo + hi) / 2; if (wrap(ctx, text, mid).length <= n) hi = mid; else lo = mid; }
    var r = wrap(ctx, text, hi + 0.5); return r.length === n ? r : base;
  }
  function maxLineW(ctx, lines) { var m = 0; lines.forEach(function (l) { m = Math.max(m, ctx.measureText(l).width); }); return m; }

  // Größte Schriftgröße finden, bei der der Text in maxLines Zeilen und maxH Höhe passt.
  function fit(ctx, text, fontFn, sizes, maxW, maxLines, maxH, lh) {
    var last = null;
    for (var i = 0; i < sizes.length; i++) {
      var s = sizes[i]; ctx.font = fontFn(s);
      var lines = balWrap(ctx, text, maxW);
      last = { size: s, lines: lines, lh: lh, h: lines.length * s * lh, over: false };
      if (lines.length <= maxLines && last.h <= maxH && maxLineW(ctx, lines) <= maxW + 0.5) return last;
    }
    last.over = true; return last;
  }
  function range(a, b, step) { var o = []; for (var v = a; v >= b; v -= step) o.push(v); return o; }

  function drawLines(ctx, lines, x, y, size, lh, color, align) {
    ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    lines.forEach(function (l, i) { ctx.fillText(l, x, y + size * 0.86 + i * size * lh); });
  }

  function lumOf(ctx, x, y, w, h) {
    try {
      var d = ctx.getImageData(x, y, w, h).data, s = 0, n = 0;
      for (var i = 0; i < d.length; i += 32) { s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++; }
      return n ? s / n / 255 : 0.8;
    } catch (e) { return 0.8; }
  }

  function footer(ctx, ink, withNext) {
    ctx.font = AN(36); ctx.fillStyle = OR; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('JOGA', PAD, 1296);
    if (withNext) {
      ctx.font = OS(34, 600); ctx.fillStyle = ink; ctx.textAlign = 'right'; ctx.fillText('WEITER', W - PAD - 70, 1294);
      ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(W - PAD - 55, 1283); ctx.lineTo(W - PAD, 1283); ctx.moveTo(W - PAD - 18, 1268); ctx.lineTo(W - PAD, 1283); ctx.lineTo(W - PAD - 18, 1298); ctx.stroke();
    }
  }

  /* ---------- Folie 1 ---------- */
  function cover(ctx, t, img, off) {
    var res = { overflow: false, dark: false };
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    if (img && img.naturalWidth) {
      var ih = img.naturalHeight * (W / img.naturalWidth);
      var y = -(ih - H) * Math.max(0, Math.min(1, off == null ? 0.2 : off));
      ctx.drawImage(img, 0, y, W, ih);
    }
    var lum = lumOf(ctx, 0, 0, W, 380); res.dark = lum < 0.42;
    var topInk = res.dark ? '#fff' : '#000';
    var parts = String(t.hook || '').split('|'), ink = up(parts[0] || ''), acc = up(parts.slice(1).join(' ') || '');
    var maxW = W - 2 * PAD, chosen = null;
    var sizes = range(150, 64, 4);
    for (var i = 0; i < sizes.length; i++) {
      var s = sizes[i]; ctx.font = AN(s);
      var a = balWrap(ctx, ink, maxW), c = acc ? balWrap(ctx, acc, maxW) : [];
      var n = a.length + c.length, h = n * s * 1.0;
      chosen = { s: s, a: a, c: c, h: h };
      if (n <= 4 && h <= 470 && maxLineW(ctx, a.concat(c)) <= maxW + .5) { chosen.over = false; break; }
      chosen.over = true;
    }
    if (chosen.over) res.overflow = true;
    var hb = 44 + chosen.h;
    var gh = hb + 150, g = ctx.createLinearGradient(0, 0, 0, gh), c0 = res.dark ? '0,0,0' : '255,255,255';
    g.addColorStop(0, 'rgba(' + c0 + ',.9)'); g.addColorStop(Math.min(0.92, hb / gh), 'rgba(' + c0 + ',.8)'); g.addColorStop(1, 'rgba(' + c0 + ',0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, gh);
    var b = ctx.createLinearGradient(0, 860, 0, H);
    b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(0.55, 'rgba(0,0,0,.72)'); b.addColorStop(1, 'rgba(0,0,0,.94)');
    ctx.fillStyle = b; ctx.fillRect(0, 860, W, H - 860);
    ctx.font = AN(chosen.s);
    drawLines(ctx, chosen.a, PAD, 44, chosen.s, 1.0, topInk);
    drawLines(ctx, chosen.c, PAD, 44 + chosen.a.length * chosen.s, chosen.s, 1.0, OR);

    var k = fit(ctx, up(t.kern || ''), AN, range(58, 38, 2), maxW, 3, 260, 1.16);
    if (k.over) res.overflow = true;
    ctx.font = AN(k.size);
    drawLines(ctx, k.lines, PAD, 1218 - k.h, k.size, 1.16, '#fff');
    footer(ctx, '#fff', true);
    return res;
  }

  /* ---------- Folie 2 ---------- */
  function facts(ctx, t, ev) {
    var res = { overflow: false };
    var hell = t.theme === 'hell';
    var bg = hell ? '#ffffff' : '#000000', ink = hell ? '#000000' : '#ffffff', muted = hell ? '#6b6b6b' : '#a8a8a8', rule = hell ? '#cfcfcf' : '#4a4a4a';
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    var maxW = W - 2 * PAD;

    // Titel
    var hp = String(t.head2 || '').split('|'), htxt = up(hp.join(' '));
    var hd = fit(ctx, htxt, AN, range(104, 56, 4), maxW, 2, 250, 1.06); if (hd.over) res.overflow = true;
    ctx.font = AN(hd.size);
    hd.lines.forEach(function (l, i) {
      var col = ink;
      if (hp.length > 1) { /* Trennstrich im Titel: Teil nach | orange */ col = (i >= hd.lines.length - wrap(ctx, up(hp.slice(1).join(' ')), maxW).length) ? OR : ink; }
      else if (hd.lines.length > 1 && i === hd.lines.length - 1) col = OR;
      drawLines(ctx, [l], PAD, 56 + i * hd.size * hd.lh, hd.size, 1, col);
    });
    var yTop = 56 + hd.h + 30;

    // Untertitel
    if (t.sub) {
      var sb = fit(ctx, t.sub, function (s) { return OS(s); }, range(34, 26, 2), maxW, 2, 100, 1.25);
      ctx.font = OS(sb.size); drawLines(ctx, sb.lines, PAD, yTop - 6, sb.size, 1.25, muted); yTop += sb.h + 8;
    }

    // Einordnung + Quelle unten (autoskaliert)
    var blk = { h: 0 }, ein = ev && ev.einordnung ? ev.einordnung : '', qu = ev && ev.quelle ? ev.quelle : '';
    if (ein || qu) {
      var scales = [1, 0.92, 0.85, 0.78, 0.72];
      for (var i = 0; i < scales.length; i++) {
        var sc = scales[i], eS = Math.round(40 * sc), qS = Math.round(30 * sc), lS = Math.round(44 * sc);
        ctx.font = OS(eS); var el = ein ? wrap(ctx, ein, maxW) : [];
        ctx.font = OS(qS); var ql = qu ? wrap(ctx, 'Quelle: ' + qu, maxW) : [];
        var hh = (ein ? lS * 1.25 + el.length * eS * 1.3 + 18 : 0) + (qu ? ql.length * qS * 1.32 : 0);
        blk = { h: hh, eS: eS, qS: qS, lS: lS, el: el, ql: ql };
        if (hh <= 430) break;
        if (i === scales.length - 1) res.overflow = true;
      }
    }
    var blockTop = 1238 - blk.h;
    var areaTop = yTop, areaBot = (ein || qu) ? blockTop - 44 : 1220;

    // Körper
    var rows = t.rows || [], fa = (t.facts || []).filter(Boolean), n;
    if (t.mode === 'bars' && rows.length) {
      n = rows.length; var rowH = Math.min(100, (areaBot - areaTop) / n);
      if (rowH < 70) res.overflow = true;
      var ls = 38; ctx.font = OS(ls); var lw = 0; rows.forEach(function (r) { lw = Math.max(lw, ctx.measureText(up(r[0])).width); });
      while (lw > 400 && ls > 28) { ls -= 2; ctx.font = OS(ls); lw = 0; rows.forEach(function (r) { lw = Math.max(lw, ctx.measureText(up(r[0])).width); }); }
      var bx = PAD + lw + 28, maxV = 0; rows.forEach(function (r) { maxV = Math.max(maxV, r[1]); });
      var barMax = W - PAD - 190 - bx;
      rows.forEach(function (r, i) {
        var y = areaTop + i * rowH, bh = Math.round(rowH * 0.6);
        ctx.font = OS(ls); drawLines(ctx, [up(r[0])], PAD, y + (rowH - ls) / 2 - 4, ls, 1, ink);
        var bw = Math.max(8, Math.round(barMax * r[1] / maxV));
        ctx.fillStyle = OR; ctx.fillRect(bx, y + (rowH - bh) / 2, bw, bh);
        ctx.font = AN(Math.min(60, Math.round(rowH * 0.6))); drawLines(ctx, [up(r[2] || String(r[1]))], bx + bw + 16, y + (rowH - Math.min(60, rowH * 0.6)) / 2 - 2, Math.min(60, Math.round(rowH * 0.6)), 1, ink);
      });
    } else if (t.mode === 'items' && rows.length) {
      n = rows.length; var rH = Math.min(200, (areaBot - areaTop) / n);
      var bigS = Math.min(78, Math.round(rH * 0.42)), smS = Math.min(44, Math.round(rH * 0.26));
      if (rH < 90) res.overflow = true;
      rows.forEach(function (r, i) {
        var y = areaTop + i * rH;
        ctx.font = AN(bigS); drawLines(ctx, [up(r[0])], PAD, y + 6, bigS, 1, OR);
        ctx.font = OS(smS); var sl = wrap(ctx, r[1], maxW); drawLines(ctx, sl.slice(0, 1), PAD, y + 6 + bigS * 1.08, smS, 1.2, ink);
        if (sl.length > 1) res.overflow = true;
        if (i < n - 1) { ctx.fillStyle = rule; ctx.fillRect(PAD, y + rH - 8, maxW, 2); }
      });
    } else if (fa.length) {
      var best = null, sizes = range(54, 28, 2);
      for (var q = 0; q < sizes.length; q++) {
        var s = sizes[q]; ctx.font = OS(s); var tot = 0, ls2 = [];
        fa.forEach(function (f) { var l = wrap(ctx, f, maxW - 46); ls2.push(l); tot += l.length * s * 1.28; });
        tot += (fa.length - 1) * s * 0.6;
        best = { s: s, ls: ls2, tot: tot };
        if (tot <= areaBot - areaTop) break;
        if (q === sizes.length - 1) res.overflow = true;
      }
      var yy = areaTop;
      best.ls.forEach(function (l, i) {
        ctx.fillStyle = OR; ctx.fillRect(PAD, yy + best.s * 0.42, 20, 20);
        ctx.font = OS(best.s); drawLines(ctx, l, PAD + 46, yy, best.s, 1.28, ink);
        yy += l.length * best.s * 1.28 + best.s * 0.6;
      });
    }

    // Einordnung / Quelle
    if (ein || qu) {
      ctx.fillStyle = rule; ctx.fillRect(PAD, blockTop - 26, maxW, 2);
      var y2 = blockTop;
      if (ein) {
        ctx.font = AN(blk.lS); drawLines(ctx, ['EINORDNUNG'], PAD, y2, blk.lS, 1, OR); y2 += blk.lS * 1.25;
        ctx.font = OS(blk.eS); drawLines(ctx, blk.el, PAD, y2, blk.eS, 1.3, ink); y2 += blk.el.length * blk.eS * 1.3 + 18;
      }
      if (qu) { ctx.font = OS(blk.qS); drawLines(ctx, blk.ql, PAD, y2, blk.qS, 1.32, muted); }
    }
    footer(ctx, ink, false);
    return res;
  }

  function parseEvidence(s) {
    var o = { einordnung: '', quelle: '' };
    String(s || '').split(/\n+/).forEach(function (l) {
      var m = l.match(/^\s*Einordnung:\s*(.*)$/i); if (m) { o.einordnung = m[1].trim(); return; }
      m = l.match(/^\s*Quelle:\s*(.*)$/i); if (m) { o.quelle = m[1].trim(); }
    });
    return o;
  }

  var fontPromise = null;
  function ready() {
    if (!fontPromise) {
      var d = document.fonts; if (!d || !d.load) { fontPromise = Promise.resolve(); }
      else fontPromise = Promise.all([d.load('100px JTAnton', 'AÄ0'), d.load('40px JTOswald', 'aä0'), d.load('600 40px JTOswald', 'aä0')]).then(function () { return d.ready; });
    }
    return fontPromise;
  }

  window.JogaTile = {
    W: W, H: H, up: up, parseEvidence: parseEvidence, ready: ready,
    render: function (canvas, slide, tile, img, off, ev) {
      canvas.width = W; canvas.height = H; var ctx = canvas.getContext('2d');
      return slide === 1 ? cover(ctx, tile, img, off) : facts(ctx, tile, ev);
    },
    toBlob: function (canvas) { return new Promise(function (res) { canvas.toBlob(res, 'image/png'); }); }
  };
})();
