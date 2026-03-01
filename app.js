// ─── STATE ──────────────────────────────────────────────────────
let currentLang = 'chamicuro';
let activeToken = null;

// ─── INIT ────────────────────────────────────────────────────────
function enterSite() {
  const intro = document.getElementById('intro');
  intro.classList.add('fade-out');
  setTimeout(() => {
    intro.style.display = 'none';
    const app = document.getElementById('app');
    app.classList.remove('hidden');
    buildLegend();
    buildLangNav();
    loadLanguage(currentLang);
    initStarCanvas();
  }, 900);
}

// ─── LEGEND ──────────────────────────────────────────────────────
function buildLegend() {
  const legend = document.getElementById('legend');
  legend.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${cat.color}"></div>
      ${cat.label}
    </div>
  `).join('');
}

// ─── LANGUAGE NAV ────────────────────────────────────────────────
function buildLangNav() {
  const nav = document.getElementById('lang-nav');
  nav.innerHTML = Object.entries(LANGUAGES).map(([key, lang]) => `
    <button class="lang-tab ${key === currentLang ? 'active' : ''}"
      onclick="loadLanguage('${key}')">
      ${lang.name}
    </button>
  `).join('');
}

// ─── LOAD LANGUAGE ────────────────────────────────────────────────
function loadLanguage(key) {
  currentLang = key;
  closePanel();

  // Update nav
  document.querySelectorAll('.lang-tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent.trim() === LANGUAGES[key].name);
  });

  // Update counter
  const lang = LANGUAGES[key];
  document.getElementById('counter-lang-name').textContent = lang.name;
  document.getElementById('counter-text').innerHTML =
    `${lang.region} &nbsp;·&nbsp; ${lang.status} &nbsp;·&nbsp; ${lang.statusNote} &nbsp;·&nbsp; ` +
    `Of an estimated <strong>${lang.estimated.toLocaleString()}</strong> words, approximately ` +
    `<strong>${lang.documented.toLocaleString()}</strong> have been documented. ` +
    `Shown here: <strong>${lang.words.length}</strong> that were saved.`;

  renderWords(lang);
}

// ─── RENDER WORDS ─────────────────────────────────────────────────
function renderWords(lang) {
  const field = document.getElementById('word-field');
  field.innerHTML = '';

  const fieldW = field.offsetWidth || window.innerWidth;
  const fieldH = Math.max(window.innerHeight * 1.1, lang.words.length * 60);
  field.style.minHeight = fieldH + 'px';

  // Scatter positions using a repulsion-based layout
  const positions = generatePositions(lang.words.length, fieldW, fieldH);

  lang.words.forEach((word, i) => {
    const cat = CATEGORIES[word.category] || CATEGORIES.other;
    const pos = positions[i];

    // Font size varies slightly for visual texture
    const size = 0.9 + Math.random() * 0.7;

    const token = document.createElement('div');
    token.className = 'word-token';
    token.style.left = pos.x + 'px';
    token.style.top = pos.y + 'px';
    token.style.animationDelay = (i * 30) + 'ms';

    token.innerHTML = `
      <div class="word-dot" style="background:${cat.color}; box-shadow:0 0 6px ${cat.color}88"></div>
      <div class="word-native" style="font-size:${size}rem; color:#fff; text-shadow:0 0 12px ${cat.color}44">${word.native}</div>
      <div class="word-english">${word.english}</div>
    `;

    token.addEventListener('click', () => openPanel(word, cat, token));

    field.appendChild(token);

    // Stagger reveal
    setTimeout(() => {
      token.classList.add('visible');
    }, 50 + i * 35);
  });
}

// ─── POSITION GENERATOR ───────────────────────────────────────────
function generatePositions(count, fieldW, fieldH) {
  const positions = [];
  const minDist = 120;
  const padding = { x: 20, y: 20, right: 160, bottom: 60 };

  for (let i = 0; i < count; i++) {
    let best = null;
    let bestScore = -1;
    const attempts = 60;

    for (let a = 0; a < attempts; a++) {
      const x = padding.x + Math.random() * (fieldW - padding.x - padding.right);
      const y = padding.y + Math.random() * (fieldH - padding.y - padding.bottom);

      // Score = minimum distance to any existing point
      let minD = Infinity;
      for (const p of positions) {
        const d = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
        if (d < minD) minD = d;
      }
      if (minD === Infinity) minD = minDist * 2;

      if (minD > bestScore) {
        bestScore = minD;
        best = { x, y };
      }
    }

    positions.push(best || {
      x: padding.x + Math.random() * (fieldW - padding.x - 160),
      y: padding.y + Math.random() * (fieldH - padding.y - 60)
    });
  }

  return positions;
}

// ─── PANEL ────────────────────────────────────────────────────────
function openPanel(word, cat, tokenEl) {
  // Deselect previous
  if (activeToken) activeToken.style.filter = '';
  activeToken = tokenEl;
  tokenEl.style.filter = 'brightness(2)';

  document.getElementById('panel-category-dot').style.background = cat.color;
  document.getElementById('panel-category').textContent = cat.label.toUpperCase();
  document.getElementById('panel-word').textContent = word.native;
  document.getElementById('panel-pronunciation').textContent = word.pronunciation ? `/ ${word.pronunciation} /` : '';
  document.getElementById('panel-meaning').textContent = word.english;
  document.getElementById('panel-note').textContent = word.note || '';
  document.getElementById('panel-why').textContent = cat.why || '';

  document.getElementById('detail-panel').classList.remove('panel-hidden');
}

function closePanel() {
  document.getElementById('detail-panel').classList.add('panel-hidden');
  if (activeToken) {
    activeToken.style.filter = '';
    activeToken = null;
  }
}

// ─── STAR CANVAS ─────────────────────────────────────────────────
function initStarCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawStars(ctx, canvas.width, canvas.height);
  }

  resize();
  window.addEventListener('resize', resize);
}

function drawStars(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  const count = Math.floor((w * h) / 8000);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 0.8 + 0.1;
    const alpha = Math.random() * 0.3 + 0.05;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }
}

// ─── CLOSE PANEL ON BG CLICK ─────────────────────────────────────
document.getElementById('stage') && document.getElementById('stage').addEventListener('click', (e) => {
  if (e.target === document.getElementById('stage') || e.target === document.getElementById('word-field')) {
    closePanel();
  }
});

// Resize rerender
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (currentLang) loadLanguage(currentLang);
  }, 300);
});
