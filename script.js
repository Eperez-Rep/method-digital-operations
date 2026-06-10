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
  const TOTAL   = 80;     // total nodes
  const CLUSTER = 55;     // how many form the central organic mass
  const LINK_D  = 120;    // max distance for edges

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initNodes();
  }

  function rand(a, b)  { return a + Math.random() * (b - a); }
  function randGauss()  { return (Math.random()+Math.random()+Math.random()-1.5)/1.5; }

  function initNodes() {
    const cx = W * 0.52, cy = H * 0.48;  // cluster centre — slightly right of mid
    nodes = [];

    // Clustered organic mass
    for (let i = 0; i < CLUSTER; i++) {
      const angle  = rand(0, Math.PI * 2);
      const spread = Math.abs(randGauss()) * Math.min(W, H) * 0.22;
      nodes.push({
        x:  cx + Math.cos(angle) * spread,
        y:  cy + Math.sin(angle) * spread * 0.85,
        ox: cx + Math.cos(angle) * spread,
        oy: cy + Math.sin(angle) * spread * 0.85,
        vx: rand(-0.12, 0.12),
        vy: rand(-0.12, 0.12),
        r:  rand(1.2, 3.8),
        p:  rand(0, Math.PI * 2),
        ps: rand(0.008, 0.025),
        glow: Math.random() > 0.65,   // glowing amber nodes
        cluster: true,
      });
    }

    // Scattered field nodes
    for (let i = CLUSTER; i < TOTAL; i++) {
      nodes.push({
        x:  rand(0, W),
        y:  rand(0, H),
        ox: 0, oy: 0,
        vx: rand(-0.08, 0.08),
        vy: rand(-0.08, 0.08),
        r:  rand(0.8, 2),
        p:  rand(0, Math.PI * 2),
        ps: rand(0.006, 0.016),
        glow: false,
        cluster: false,
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

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i], nj = nodes[j];
        if (!ni.cluster && !nj.cluster) continue;   // skip field-to-field
        const dx = ni.x - nj.x, dy = ni.y - nj.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d > LINK_D) continue;
        const alpha = (1 - d / LINK_D) * (ni.glow || nj.glow ? 0.45 : 0.18);
        const glowEdge = ni.glow || nj.glow;
        if (glowEdge && dk) {
          ctx.strokeStyle = `rgba(200,160,60,${alpha})`;
        } else {
          ctx.strokeStyle = dk
            ? `rgba(160,160,150,${alpha * 0.6})`
            : `rgba(80,80,70,${alpha * 0.5})`;
        }
        ctx.lineWidth = glowEdge ? 0.7 : 0.4;
        ctx.beginPath();
        ctx.moveTo(ni.x, ni.y);
        ctx.lineTo(nj.x, nj.y);
        ctx.stroke();
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      n.p  += n.ps;
      const pulse = 0.45 + 0.55 * Math.sin(n.p);

      if (n.glow && dk) {
        // amber glow halo
        const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 9);
        gr.addColorStop(0,   `rgba(210,168,75,${0.28 * pulse})`);
        gr.addColorStop(0.4, `rgba(180,120,30,${0.12 * pulse})`);
        gr.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 9, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();

        // bright core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,190,90,${0.85 + 0.15 * pulse})`;
        ctx.fill();
      } else {
        // regular node
        const a = n.cluster
          ? (dk ? 0.35 + 0.35 * pulse : 0.25 + 0.25 * pulse)
          : (dk ? 0.15 + 0.1 * pulse  : 0.1 + 0.08 * pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = dk
          ? `rgba(180,178,165,${a})`
          : `rgba(60,58,50,${a})`;
        ctx.fill();
      }

      // gentle drift
      n.x += n.vx;
      n.y += n.vy;

      // cluster nodes: soft pull back toward original position
      if (n.cluster) {
        n.vx += (n.ox - n.x) * 0.00015;
        n.vy += (n.oy - n.y) * 0.00015;
      }

      // mouse repel — subtle
      const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
      const md  = Math.sqrt(mdx*mdx + mdy*mdy);
      if (md < 120) {
        const force = (120 - md) / 120 * 0.4;
        n.vx += (mdx / md) * force;
        n.vy += (mdy / md) * force;
      }

      // dampen velocity
      n.vx *= 0.995;
      n.vy *= 0.995;

      // wrap field nodes, bounce cluster nodes gently
      if (n.cluster) {
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      } else {
        if (n.x < -10) n.x = W + 10;
        if (n.x > W+10) n.x = -10;
        if (n.y < -10) n.y = H + 10;
        if (n.y > H+10) n.y = -10;
      }
    });

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();
