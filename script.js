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
  const LINK_D  = 180;    // max distance for edges within a group

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
      const spread = Math.abs(randGauss()) * spreadFactor;
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

    // Main cluster — dense, fills screen
    const isMobile = W < 768;
    const count = isMobile ? 160 : 280;
    const main = makeCluster(W * 0.52, H * 0.48, count, Math.min(W, H) * 0.75, 2.5, 6.5, 0.55, 0);
    nodes.push(...main);
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
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i], nj = nodes[j];
        if (ni.group !== nj.group) continue;
        if (ni.glow || nj.glow) continue; // glow edges drawn separately
        const dx = ni.x - nj.x;
        if (dx * dx > LINK_D2) continue;  // fast early reject
        const dy = ni.y - nj.y;
        const d2 = dx*dx + dy*dy;
        if (d2 > LINK_D2) continue;
        const alpha = (1 - Math.sqrt(d2) / LINK_D) * 0.18;
        ctx.moveTo(ni.x, ni.y);
        ctx.lineTo(nj.x, nj.y);
      }
    }
    ctx.strokeStyle = dk ? 'rgba(255,255,255,0.12)' : 'rgba(80,80,70,0.10)';
    ctx.stroke();

    // Glow edges
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i], nj = nodes[j];
        if (ni.group !== nj.group) continue;
        if (!ni.glow && !nj.glow) continue;
        const dx = ni.x - nj.x;
        if (dx * dx > LINK_D2) continue;
        const dy = ni.y - nj.y;
        const d2 = dx*dx + dy*dy;
        if (d2 > LINK_D2) continue;
        ctx.moveTo(ni.x, ni.y);
        ctx.lineTo(nj.x, nj.y);
      }
    }
    ctx.strokeStyle = dk ? 'rgba(255,255,255,0.28)' : 'rgba(80,80,70,0.22)';
    ctx.stroke();

    // Draw nodes
    nodes.forEach(n => {
      n.p  += n.ps;
      const pulse = 0.45 + 0.55 * Math.sin(n.p);

      if (dk) {
        const isGlow = n.glow;
        if (isGlow) {
          // soft halo — no gradient creation per frame
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.06 * pulse})`;
          ctx.fill();
        }
        const a = isGlow
          ? (0.90 + 0.10 * pulse)
          : (0.40 + 0.35 * pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      } else {
        const a = 0.25 + 0.25 * pulse;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(60,58,50,${a})`;
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

      // very slow drift back — let nodes roam far
      if (n.cluster) {
        n.vx += (n.ox - n.x) * 0.00004;
        n.vy += (n.oy - n.y) * 0.00004;
      }

      // dampen velocity
      n.vx *= 0.96;
      n.vy *= 0.96;

      // apply velocity
      n.x += n.vx;
      n.y += n.vy;

      // bounce at edges
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
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
