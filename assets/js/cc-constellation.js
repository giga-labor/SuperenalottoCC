(function () {
  'use strict';

  // Sfondo animato condiviso: numeri 1-90 collegati da linee, reagisce a mouse e touch.
  // Sostituisce in modo pulito il vecchio "startSky" di v8-inner-chrome.js.

  if (document.getElementById('v8-sky') || document.getElementById('cc-constellation')) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cssVar(names, fallback) {
    var style = getComputedStyle(document.documentElement);
    for (var i = 0; i < names.length; i += 1) {
      var value = style.getPropertyValue(names[i]).trim();
      if (value) return value;
    }
    return fallback;
  }

  function hexToRgb(hex) {
    var match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : [140, 90, 192];
  }

  var canvas = document.createElement('canvas');
  canvas.id = 'cc-constellation';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width = 0, height = 0, points = [], pointer = null, rafId = null, running = true;

  function pointCount(w, h) {
    var area = w * h;
    return Math.round(Math.min(110, Math.max(36, area / 9000)));
  }

  function makePoint(w, h) {
    return {
      n: 1 + Math.floor(Math.random() * 90),
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var target = pointCount(width, height);
    if (points.length > target) {
      points.length = target;
    } else {
      while (points.length < target) points.push(makePoint(width, height));
    }
    points.forEach(function (p) {
      if (p.x > width) p.x = width;
      if (p.y > height) p.y = height;
    });
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }

  function setPointer(x, y) {
    pointer = { x: x, y: y };
  }
  function clearPointer() {
    pointer = null;
  }

  function onMouseMove(event) {
    setPointer(event.clientX, event.clientY);
  }
  function onTouchMove(event) {
    if (!event.touches || !event.touches.length) return;
    setPointer(event.touches[0].clientX, event.touches[0].clientY);
  }

  function step() {
    points.forEach(function (p) {
      if (pointer) {
        var dx = p.x - pointer.x, dy = p.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 110 * 110 && d2 > 0.01) {
          var d = Math.sqrt(d2);
          var force = (110 - d) / 110 * 0.6;
          p.vx += (dx / d) * force * 0.06;
          p.vy += (dy / d) * force * 0.06;
        }
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    var lineRgb = hexToRgb(cssVar(['--accent-purple', '--cca-violet'], '#8c5ac0'));
    var dotRgb = hexToRgb(cssVar(['--brand-green', '--cca-green'], '#21b188'));
    var link = 130, link2 = link * link;

    for (var i = 0; i < points.length; i += 1) {
      for (var j = i + 1; j < points.length; j += 1) {
        var a = points[i], b = points[j];
        var dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < link2) {
          var alpha = (1 - d2 / link2) * 0.16;
          ctx.strokeStyle = 'rgba(' + lineRgb.join(',') + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    points.forEach(function (p) {
      ctx.fillStyle = 'rgba(' + dotRgb.join(',') + ',.55)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
      if (pointer) {
        var dx = p.x - pointer.x, dy = p.y - pointer.y;
        if (dx * dx + dy * dy < 130 * 130) {
          ctx.fillStyle = 'rgba(' + dotRgb.join(',') + ',.85)';
          ctx.font = '11px Inter, ui-sans-serif, system-ui, sans-serif';
          ctx.fillText(String(p.n), p.x + 6, p.y - 6);
        }
      }
    });
  }

  function frame() {
    if (!running) return;
    step();
    draw();
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    resize();
    if (reduceMotion) {
      draw();
      return;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', clearPointer, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', clearPointer, { passive: true });
    window.addEventListener('touchcancel', clearPointer, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', function () {
      running = document.visibilityState === 'visible';
      if (running && !rafId) frame();
      else if (!running && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });
    frame();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
