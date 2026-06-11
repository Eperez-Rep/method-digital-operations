/* METHOD™ — script.js */

// ── i18n ──────────────────────────────────────────────────────
const T = {
  en: {
    "nav.contact":    "Enquire",
    "hero.tag":       "[ METHOD · SYS ]",
    "hero.l1":        "Systems.",
    "hero.l2":        "Refinement.",
    "hero.l3":        "Infrastructure.",
    "hero.desc":      "Systems Analysis · Architecture\nInfrastructure · Operations",
    "hero.cta":       "Open a conversation \u2197",
    "contact.title": "Bring the problem.",
    "contact.desc":  "Method works at the intersection of analysis, architecture, and operational discipline.",
    "contact.sub":   "Response within 48h.",
  },
  es: {
    "nav.contact":    "Consultar",
    "hero.tag":       "[ METHOD · SYS ]",
    "hero.l1":        "Sistemas.",
    "hero.l2":        "Refinamiento.",
    "hero.l3":        "Infraestructura.",
    "hero.desc":      "Análisis de Sistemas · Arquitectura\nInfraestructura · Operaciones",
    "hero.cta":       "Iniciar una consulta \u2197",
    "contact.title": "Traé el problema.",
    "contact.desc":  "Method opera en la intersección del análisis, la arquitectura y la disciplina operativa.",
    "contact.sub":   "Respuesta en 48h.",
  }
};

let lang = 'en';
function applyLang(l) {
  lang = l;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = T[l]?.[el.getAttribute('data-i18n')];
    if (v) el.textContent = v;
  });
  document.documentElement.setAttribute('data-lang', l);
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === l));
}
document.querySelectorAll('.lang-btn').forEach(b =>
  b.addEventListener('click', () => applyLang(b.dataset.lang)));

// ── Theme ──────────────────────────────────────────────────────
let dark = true;
document.getElementById('themeToggle').addEventListener('click', () => {
  dark = !dark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
});

// ── Nav scroll ─────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () =>
  nav.classList.toggle('scrolled', scrollY > 20), { passive: true });

// ── HERO CANVAS ────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let W, H, nodes, mouse = { x: -1000, y: -1000 };

  // Node config — groups
  const LINK_D = 190;   // max distance for edges between core/mid nodes

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initNodes();
  }

  function rand(a, b)  { return a + Math.random() * (b - a); }
  function randGauss()  { return (Math.random()+Math.random()+Math.random()-1.5)/1.5; }

  function makeCluster(cx, cy, count, spreadFactor, nodeMinR, nodeMaxR, glowThresh, groupId) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle  = rand(0, Math.PI * 2);
      // sqrt of random gives uniform area distribution — no center pile-up
      const spread = Math.sqrt(Math.random()) * spreadFactor;
      const x = cx + Math.cos(angle) * spread;
      const y = cy + Math.sin(angle) * spread * 0.85;
      arr.push({
        x, y, ox: x, oy: y,
        vx: rand(-0.10, 0.10),
        vy: rand(-0.10, 0.10),
        r:  rand(nodeMinR, nodeMaxR),
        p:  rand(0, Math.PI * 2),
        ps: rand(0.008, 0.022),
        glow: Math.random() > glowThresh,
        cluster: true,
        group: groupId,
      });
    }
    return arr;
  }

  function initNodes() {
    nodes = [];
    const isMobile = W < 768;

    // ── Core web: dense center zone, but spread to ~60% of screen ──
    const coreCount = isMobile ? 40 : 65;
    for (let i = 0; i < coreCount; i++) {
      const angle  = rand(0, Math.PI * 2);
      const spread = Math.sqrt(Math.random()) * Math.min(W, H) * 0.28;
      const x = W * 0.50 + Math.cos(angle) * spread;
      const y = H * 0.50 + Math.sin(angle) * spread * 0.80;
      nodes.push({
        x, y, ox: x, oy: y,
        vx: rand(-0.10, 0.10), vy: rand(-0.10, 0.10),
        r:  rand(1.2, 2.8),
        p:  rand(0, Math.PI * 2), ps: rand(0.008, 0.022),
        glow: Math.random() > 0.55,
        cluster: true, outlier: false, group: 0,
      });
    }

    // ── Mid ring: scattered across full screen area ──
    const midCount = isMobile ? 45 : 80;
    for (let i = 0; i < midCount; i++) {
      // Uniform over the full canvas, biased slightly away from center
      const x = rand(W * 0.04, W * 0.96);
      const y = rand(H * 0.04, H * 0.96);
      nodes.push({
        x, y, ox: x, oy: y,
        vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
        r:  rand(1.0, 2.8),
        p:  rand(0, Math.PI * 2), ps: rand(0.007, 0.018),
        glow: Math.random() > 0.60,
        cluster: true, outlier: false, group: 0,
      });
    }

    // ── Outliers: anchored near screen edges / corners ──
    const edgeCount = isMobile ? 10 : 18;
    // Place them explicitly near the 4 edges so they always reach borders
    for (let i = 0; i < edgeCount; i++) {
      const side = Math.floor(rand(0, 4)); // 0=top 1=right 2=bottom 3=left
      let x, y;
      switch (side) {
        case 0: x = rand(W * 0.05, W * 0.95); y = rand(H * 0.02, H * 0.18); break;
        case 1: x = rand(W * 0.78, W * 0.98); y = rand(H * 0.05, H * 0.95); break;
        case 2: x = rand(W * 0.05, W * 0.95); y = rand(H * 0.80, H * 0.97); break;
        case 3: x = rand(W * 0.02, W * 0.22); y = rand(H * 0.05, H * 0.95); break;
      }
      nodes.push({
        x, y, ox: x, oy: y,
        vx: rand(-0.05, 0.05), vy: rand(-0.05, 0.05),
        r:  rand(1.0, 2.2),
        p:  rand(0, Math.PI * 2), ps: rand(0.006, 0.014),
        glow: Math.random() > 0.35,
        cluster: true, outlier: true, group: 0,
      });
    }
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    const dk = isDark();

    // subtle vignette
    const vg = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, dk ? 'rgba(0,0,0,0.55)' : 'rgba(244,243,240,0.5)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    // Draw edges — batched by glow/normal to minimize ctx state changes
    const LINK_D2 = LINK_D * LINK_D;
    const coreNodes    = nodes.filter(n => !n.outlier);
    const outlierNodes = nodes.filter(n =>  n.outlier);

    // Pre-compute: for each outlier, find its 2 closest core nodes (tendril targets)
    // This runs every frame but node count is small (~22 outliers × ~280 core = cheap)
    const tendrilMap = new Map(); // outlier index → [coreNode, coreNode]
    outlierNodes.forEach(o => {
      const sorted = coreNodes
        .map(c => ({ c, d2: (o.x-c.x)**2 + (o.y-c.y)**2 }))
        .sort((a, b) => a.d2 - b.d2)
        .slice(0, 2)
        .map(e => e.c);
      tendrilMap.set(o, sorted);
    });

    ctx.lineWidth = 0.4;
    ctx.beginPath();
    for (let i = 0; i < coreNodes.length; i++) {
      for (let j = i + 1; j < coreNodes.length; j++) {
        const ni = coreNodes[i], nj = coreNodes[j];
        if (ni.glow || nj.glow) continue;
        const dx = ni.x - nj.x;
        if (dx * dx > LINK_D2) continue;
        const dy = ni.y - nj.y;
        if (dx*dx + dy*dy > LINK_D2) continue;
        ctx.moveTo(ni.x, ni.y);
        ctx.lineTo(nj.x, nj.y);
      }
    }
    ctx.strokeStyle = dk ? 'rgba(255,255,255,0.07)' : 'rgba(80,80,70,0.07)';
    ctx.stroke();

    // Glow edges (core only)
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let i = 0; i < coreNodes.length; i++) {
      for (let j = i + 1; j < coreNodes.length; j++) {
        const ni = coreNodes[i], nj = coreNodes[j];
        if (!ni.glow && !nj.glow) continue;
        const dx = ni.x - nj.x;
        if (dx * dx > LINK_D2) continue;
        const dy = ni.y - nj.y;
        if (dx*dx + dy*dy > LINK_D2) continue;
        ctx.moveTo(ni.x, ni.y);
        ctx.lineTo(nj.x, nj.y);
      }
    }
    ctx.strokeStyle = dk ? 'rgba(255,255,255,0.16)' : 'rgba(80,80,70,0.14)';
    ctx.stroke();

    // Tendril edges — each outlier connects only to its 2 nearest core nodes
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    outlierNodes.forEach(o => {
      const targets = tendrilMap.get(o);
      targets.forEach(c => {
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(c.x, c.y);
      });
    });
    ctx.strokeStyle = dk ? 'rgba(255,255,255,0.18)' : 'rgba(80,80,70,0.14)';
    ctx.stroke();

    // Draw nodes
    nodes.forEach(n => {
      n.p  += n.ps;
      const pulse = 0.45 + 0.55 * Math.sin(n.p);

      if (dk) {
        const a = n.glow
          ? (0.75 + 0.15 * pulse)
          : (0.28 + 0.22 * pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(60,58,50,${0.20 + 0.20 * pulse})`;
        ctx.fill();
      }

      // mouse/touch repel — very strong
      const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
      const md  = Math.sqrt(mdx*mdx + mdy*mdy);
      if (md < 250 && md > 0) {
        const force = (250 - md) / 250 * 6.0;
        n.vx += (mdx / md) * force;
        n.vy += (mdy / md) * force;
      }

      // drift back — only outliers return to their edge anchor; mid/core roam free
      if (n.cluster && n.outlier) {
        n.vx += (n.ox - n.x) * 0.00008;
        n.vy += (n.oy - n.y) * 0.00008;
      }

      // dampen velocity
      n.vx *= 0.985;
      n.vy *= 0.985;

      // apply velocity
      n.x += n.vx;
      n.y += n.vy;

      // wrap at edges — infinite canvas effect
      if (n.x < -20)  { n.x += W + 40; n.ox += W + 40; }
      if (n.x > W+20) { n.x -= W + 40; n.ox -= W + 40; }
      if (n.y < -20)  { n.y += H + 40; n.oy += H + 40; }
      if (n.y > H+20) { n.y -= H + 40; n.oy -= H + 40; }
    });

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    mouse.x = t.clientX - r.left;
    mouse.y = t.clientY - r.top;
  }, { passive: false });
  canvas.addEventListener('touchend', () => { mouse.x = -1000; mouse.y = -1000; });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();
