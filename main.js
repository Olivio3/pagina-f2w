/* ═══════════════════════════════════════════════════════════
   FORMAÇÃO 2W — MAIN JAVASCRIPT
   Animated World Map Canvas + Scroll Reveal
═══════════════════════════════════════════════════════════ */

/* ─── WORLD MAP CANVAS ANIMATION ────────────────────────── */
(function initMapCanvas() {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // World map simplified outline coordinates (normalized 0-1)
  // Simplified continental outlines as polygon arrays [x, y]
  const continents = [
    // North America
    [
      [0.07,0.15],[0.09,0.12],[0.13,0.10],[0.18,0.09],[0.22,0.10],
      [0.25,0.12],[0.27,0.15],[0.28,0.18],[0.30,0.20],[0.28,0.24],
      [0.26,0.28],[0.24,0.32],[0.22,0.35],[0.20,0.38],[0.18,0.40],
      [0.16,0.42],[0.14,0.40],[0.12,0.38],[0.10,0.35],[0.08,0.30],
      [0.07,0.25],[0.06,0.20],[0.07,0.15]
    ],
    // South America
    [
      [0.20,0.42],[0.22,0.40],[0.25,0.42],[0.27,0.45],[0.28,0.50],
      [0.27,0.55],[0.26,0.60],[0.24,0.65],[0.22,0.68],[0.20,0.70],
      [0.18,0.68],[0.17,0.63],[0.16,0.58],[0.16,0.52],[0.17,0.47],
      [0.19,0.44],[0.20,0.42]
    ],
    // Europe
    [
      [0.44,0.12],[0.46,0.10],[0.50,0.09],[0.53,0.10],[0.55,0.12],
      [0.56,0.15],[0.55,0.18],[0.53,0.20],[0.51,0.22],[0.49,0.23],
      [0.47,0.22],[0.45,0.20],[0.43,0.18],[0.43,0.15],[0.44,0.12]
    ],
    // Africa
    [
      [0.46,0.26],[0.50,0.24],[0.54,0.25],[0.56,0.28],[0.57,0.33],
      [0.57,0.38],[0.56,0.44],[0.54,0.50],[0.52,0.55],[0.50,0.58],
      [0.48,0.55],[0.46,0.50],[0.44,0.44],[0.43,0.38],[0.43,0.32],
      [0.44,0.28],[0.46,0.26]
    ],
    // Asia
    [
      [0.55,0.10],[0.60,0.08],[0.66,0.08],[0.72,0.10],[0.77,0.12],
      [0.80,0.15],[0.82,0.18],[0.82,0.22],[0.80,0.26],[0.78,0.30],
      [0.75,0.33],[0.72,0.35],[0.68,0.36],[0.64,0.35],[0.60,0.33],
      [0.57,0.30],[0.55,0.26],[0.54,0.22],[0.54,0.17],[0.55,0.13],[0.55,0.10]
    ],
    // Australia
    [
      [0.74,0.52],[0.78,0.50],[0.82,0.51],[0.85,0.54],[0.86,0.58],
      [0.84,0.62],[0.81,0.64],[0.77,0.64],[0.74,0.62],[0.72,0.58],
      [0.72,0.55],[0.74,0.52]
    ]
  ];

  // Dot grid for the world map feel
  const dots = [];
  const gridCols = 80;
  const gridRows = 40;

  // Generate world map dots (rough approximation)
  function isLand(nx, ny) {
    // Very rough land mask
    for (const cont of continents) {
      if (pointInPolygon(nx, ny, cont)) return true;
    }
    return false;
  }

  function pointInPolygon(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const nx = c / gridCols;
      const ny = r / gridRows;
      dots.push({ nx, ny, land: isLand(nx, ny), pulse: Math.random() * Math.PI * 2 });
    }
  }

  // Animated connection lines
  const connections = [];
  const numConnections = 18;
  for (let i = 0; i < numConnections; i++) {
    connections.push({
      x1: Math.random(),
      y1: Math.random() * 0.7 + 0.05,
      x2: Math.random(),
      y2: Math.random() * 0.7 + 0.05,
      progress: Math.random(),
      speed: 0.001 + Math.random() * 0.002,
      opacity: 0.3 + Math.random() * 0.4
    });
  }

  // Pulsing location markers
  const markers = [
    { nx: 0.18, ny: 0.30 }, // North America
    { nx: 0.22, ny: 0.55 }, // South America
    { nx: 0.50, ny: 0.18 }, // Europe
    { nx: 0.50, ny: 0.40 }, // Africa
    { nx: 0.68, ny: 0.22 }, // Asia
    { nx: 0.79, ny: 0.57 }, // Australia
  ];
  markers.forEach(m => { m.pulse = Math.random() * Math.PI * 2; });

  let animFrame;
  let time = 0;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function draw() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    time += 0.012;

    // ── Draw grid lines ──────────────────────────────────
    ctx.strokeStyle = 'rgba(0, 200, 180, 0.06)';
    ctx.lineWidth = 0.5;
    const gridSpacing = 60;
    for (let x = 0; x < W; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // ── Draw lat/lon lines ───────────────────────────────
    ctx.strokeStyle = 'rgba(0, 200, 180, 0.08)';
    ctx.lineWidth = 0.8;
    // Horizontal (latitude)
    for (let i = 1; i < 6; i++) {
      const y = H * (i / 6);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    // Vertical (longitude)
    for (let i = 1; i < 10; i++) {
      const x = W * (i / 10);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // ── Draw dots (land/ocean) ───────────────────────────
    for (const d of dots) {
      const x = d.nx * W;
      const y = d.ny * H;
      const pulse = Math.sin(time + d.pulse) * 0.5 + 0.5;

      if (d.land) {
        const alpha = 0.25 + pulse * 0.15;
        ctx.fillStyle = `rgba(0, 200, 180, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(0, 200, 180, 0.04)';
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Draw animated connection lines ───────────────────
    for (const conn of connections) {
      conn.progress += conn.speed;
      if (conn.progress > 1) conn.progress = 0;

      const x1 = conn.x1 * W;
      const y1 = conn.y1 * H;
      const x2 = conn.x2 * W;
      const y2 = conn.y2 * H;

      // Draw base line (faint)
      ctx.strokeStyle = `rgba(0, 200, 180, 0.06)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw animated segment
      const px = x1 + (x2 - x1) * conn.progress;
      const py = y1 + (y2 - y1) * conn.progress;
      const tailLen = 0.12;
      const tailStart = Math.max(0, conn.progress - tailLen);
      const tx = x1 + (x2 - x1) * tailStart;
      const ty = y1 + (y2 - y1) * tailStart;

      const grad = ctx.createLinearGradient(tx, ty, px, py);
      grad.addColorStop(0, 'rgba(0, 200, 180, 0)');
      grad.addColorStop(1, `rgba(0, 200, 180, ${conn.opacity})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Dot at head
      ctx.fillStyle = `rgba(74, 222, 128, ${conn.opacity})`;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Draw pulsing markers ─────────────────────────────
    for (const m of markers) {
      m.pulse += 0.04;
      const x = m.nx * W;
      const y = m.ny * H;
      const pScale = (Math.sin(m.pulse) * 0.5 + 0.5);

      // Outer ring
      ctx.strokeStyle = `rgba(74, 222, 128, ${0.15 + pScale * 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 8 + pScale * 6, 0, Math.PI * 2);
      ctx.stroke();

      // Middle ring
      ctx.strokeStyle = `rgba(74, 222, 128, ${0.3 + pScale * 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = `rgba(74, 222, 128, 0.9)`;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  resize();
  draw();
})();


/* ─── SCROLL REVEAL ─────────────────────────────────────── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.module-card, .extra-card, .intro-section .section-title, ' +
    '.intro-section .section-desc, .tech-pills, ' +
    '.modules-section .section-title, .extras-section .section-title, ' +
    '.cta-box, .section-tag'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();


/* ─── STAGGER CARDS ─────────────────────────────────────── */
(function staggerCards() {
  const cards = document.querySelectorAll('.module-card, .extra-card');
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${(i % 6) * 0.08}s`;
  });
})();


/* ─── SMOOTH ANCHOR SCROLL ──────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ─── NAVBAR SCROLL ─────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
})();


/* ─── PARALLAX HERO ─────────────────────────────────────────────── */
(function initParallax() {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    canvas.style.transform = `translateY(${scrollY * 0.3}px)`;
  }, { passive: true });
})();
