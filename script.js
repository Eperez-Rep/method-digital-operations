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

  // Node config
  const LINK_D = 200;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function initNodes() {
    nodes = [];
    const isMobile = W < 768;
    const count = isMobile ? 120 : 200;

    for (let i = 0; i < count; i++) {
      // Gaussian-ish distribution: concentrate toward center but allow full spread
      // Use sum of uniforms for bell shape, then scale to canvas
      const gx = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; // ~[-1,1] gaussian
      const gy = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

      // Mix gaussian with uniform so tails reach edges
      const t = 0.55; // 0=pure gaussian (clumped), 1=pure uniform (flat)
      const ux = rand(-1, 1);
      const uy = rand(-1, 1);
      const nx = gx * (1 - t) + ux * t;
      const ny = gy * (1 - t) + uy * t;

      const x = W * 0.50 + nx * W * 0.52;
      const y = H * 0.50 + ny * H * 0.52;

      // Nodes near the edges move slightly faster (more peripheral energy)
      const edgeness = Math.max(Math.abs(nx), Math.abs(ny)); // 0=center, 1=edge
      const speed = rand(0.04, 0.10) + edgeness * 0.08;
      const angle = rand(0, Math.PI * 2);

      nodes.push({
        x, y, ox: x, oy: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r:  rand(1.0, 2.6) * (1 - edgeness * 0.35), // edge nodes slightly smaller
        p:  rand(0, Math.PI * 2),
        ps: rand(0.007, 0.020),
        glow: Math.random() > (0.45 + edgeness * 0.25), // fewer glows at edges
        group: 0,
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

    // Draw all edges in two passes: normal then glow
    const LINK_D2 = LINK_D * LINK_D;

    ctx.lineWidth = 0.4;
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i], nj = nodes[j];
        if (ni.glow || nj.glow) continue;
        const dx = ni.x - nj.x;
        if (dx * dx > LINK_D2) continue;
        const dy = ni.y - nj.y;
        if (dx*dx + dy*dy > LINK_D2) continue;
        ctx.moveTo(ni.x, ni.y);
        ctx.lineTo(nj.x, nj.y);
      }
    }
    ctx.strokeStyle = dk ? 'rgba(255,255,255,0.18)' : 'rgba(40,40,35,0.12)';
    ctx.stroke();

    ctx.lineWidth = 0.65;
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i], nj = nodes[j];
        if (!ni.glow && !nj.glow) continue;
        const dx = ni.x - nj.x;
        if (dx * dx > LINK_D2) continue;
        const dy = ni.y - nj.y;
        if (dx*dx + dy*dy > LINK_D2) continue;
        ctx.moveTo(ni.x, ni.y);
        ctx.lineTo(nj.x, nj.y);
      }
    }
    ctx.strokeStyle = dk ? 'rgba(255,255,255,0.38)' : 'rgba(40,40,35,0.22)';
    ctx.stroke();

    // Draw nodes + physics
    nodes.forEach(n => {
      n.p += n.ps;
      const pulse = 0.45 + 0.55 * Math.sin(n.p);

      if (dk) {
        const a = n.glow ? (0.92 + 0.08 * pulse) : (0.55 + 0.30 * pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30,28,24,${0.35 + 0.25 * pulse})`;
        ctx.fill();
      }

      // mouse repel
      const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
      const md  = Math.sqrt(mdx*mdx + mdy*mdy);
      if (md < 220 && md > 0) {
        const force = (220 - md) / 220 * 5.0;
        n.vx += (mdx / md) * force;
        n.vy += (mdy / md) * force;
      }

      // very gentle drift toward canvas center — keeps the overall shape stable
      n.vx += (W * 0.5 - n.x) * 0.000015;
      n.vy += (H * 0.5 - n.y) * 0.000015;

      n.vx *= 0.982;
      n.vy *= 0.982;

      n.x += n.vx;
      n.y += n.vy;

      // toroidal wrap
      if (n.x < -30)  n.x += W + 60;
      if (n.x > W+30) n.x -= W + 60;
      if (n.y < -30)  n.y += H + 60;
      if (n.y > H+30) n.y -= H + 60;
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
