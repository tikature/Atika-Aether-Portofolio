/* =====================================================
   project.js — Project Detail Page Logic
   Dewi Atika Muthi Portfolio
   ===================================================== */

'use strict';

const GITHUB_USERNAME = 'tikature';

const LANG_COLORS = {
  JavaScript: '#f1e05a', Python: '#3572A5', HTML: '#e34c26',
  CSS: '#563d7c', Vue: '#41b883', TypeScript: '#2b7489',
  PHP: '#4F5D95', Java: '#b07219', Ruby: '#701516',
  Go: '#00ADD8', Rust: '#dea584', Shell: '#89e051',
  Dart: '#00B4AB', Swift: '#F05138', Kotlin: '#A97BFF',
};

/* ================================================
   THEME
   ================================================ */
function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  root.setAttribute('data-theme', saved);

  btn?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });
}

/* ================================================
   NAVBAR
   ================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
    updateBackToTop();
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks?.classList.toggle('open');
  });

  navLinks?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      navLinks?.classList.remove('open');
    });
  });
}

/* ================================================
   BACK TO TOP
   ================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function updateBackToTop() {
  const btn = document.getElementById('back-to-top');
  btn?.classList.toggle('visible', window.scrollY > 400);
}

/* ================================================
   ANIMATIONS
   ================================================ */
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

/* ================================================
   SHOW / HIDE STATES
   ================================================ */
function showLoading()  {
  document.getElementById('pd-loading').style.display = 'flex';
  document.getElementById('pd-error').classList.add('hidden');
  document.getElementById('pd-main').classList.add('hidden');
}

function showError(msg) {
  document.getElementById('pd-loading').style.display = 'none';
  document.getElementById('pd-main').classList.add('hidden');
  const errEl = document.getElementById('pd-error');
  errEl.classList.remove('hidden');
  const msgEl = document.getElementById('pd-error-msg');
  if (msgEl && msg) msgEl.textContent = msg;
}

function showMain() {
  document.getElementById('pd-loading').style.display = 'none';
  document.getElementById('pd-error').classList.add('hidden');
  document.getElementById('pd-main').classList.remove('hidden');
  /* Trigger animations for newly visible elements */
  setTimeout(initAnimations, 50);
}

/* ================================================
   UTILITIES
   ================================================ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function formatFullDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatRelativeDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const days = Math.floor((now - date) / 86400000);
  if (days < 1) return 'Today';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/* ================================================
   SIMPLE MARKDOWN RENDERER
   (for README display, no external library needed)
   ================================================ */
function renderMarkdown(md) {
  if (!md) return '<p class="pd-readme-placeholder">No README found for this repository.</p>';

  let html = escapeHtml(md);

  /* Restore code blocks before other replacements */
  const fencedBlocks = [];
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => {
    const idx = fencedBlocks.length;
    fencedBlocks.push(`<pre><code>${code.trim()}</code></pre>`);
    return `%%BLOCK_${idx}%%`;
  });

  /* Inline code */
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  /* Headings */
  html = html.replace(/^#{6} (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#{5} (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#{4} (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  /* Bold & italic */
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  /* Strikethrough */
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  /* Blockquote */
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  /* HR */
  html = html.replace(/^(-{3,}|\*{3,})$/gm, '<hr>');

  /* Images (before links) */
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  /* Links */
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  /* Unordered lists */
  html = html.replace(/^[-*+] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  /* Ordered lists */
  html = html.replace(/^\d+\. (.+)$/gm, '<oli>$1</oli>');
  html = html.replace(/(<oli>[\s\S]*?<\/oli>)/g, '<ol>$1</ol>');
  html = html.replace(/<\/ol>\s*<ol>/g, '');
  html = html.replace(/<oli>/g, '<li>').replace(/<\/oli>/g, '</li>');

  /* Paragraphs */
  html = html.split(/\n{2,}/).map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr)/.test(block)) return block;
    if (block.includes('%%BLOCK_')) return block;
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  /* Restore fenced code blocks */
  fencedBlocks.forEach((b, i) => {
    html = html.replace(`%%BLOCK_${i}%%`, b);
  });

  return html;
}

/* ================================================
   POPULATE PAGE
   ================================================ */
async function populatePage(repo, allRepos) {
  const lang = repo.language || null;
  const color = LANG_COLORS[lang] || '#858585';
  const topics = repo.topics || [];

  /* Page title */
  document.title = `${repo.name} — Dewi Atika Muthi`;

  /* Breadcrumb */
  const bcName = document.getElementById('bc-name');
  if (bcName) bcName.textContent = repo.name;

  /* Hero - Lang Badge */
  const langDot = document.getElementById('pd-lang-dot');
  const langText = document.getElementById('pd-lang-text');
  if (langDot) langDot.style.background = color;
  if (langText) langText.textContent = lang || 'Code';

  /* Hero title */
  const titleEl = document.getElementById('pd-title');
  if (titleEl) titleEl.textContent = repo.name;

  /* Hero description */
  const descEl = document.getElementById('pd-desc');
  if (descEl) descEl.textContent = repo.description || 'No description provided.';

  /* Hero topics */
  const topicsEl = document.getElementById('pd-topics');
  if (topicsEl && topics.length > 0) {
    topicsEl.innerHTML = topics.map(t =>
      `<span class="pd-topic-tag">#${escapeHtml(t)}</span>`
    ).join('');
  }

  /* Hero bg tint based on language color */
  const heroBg = document.getElementById('pd-hero-bg');
  if (heroBg && lang) {
    heroBg.style.background = `linear-gradient(135deg, ${color}18 0%, transparent 55%)`;
  }

  /* GitHub button */
  const ghBtn = document.getElementById('pd-github-btn');
  if (ghBtn) ghBtn.href = repo.html_url;

  /* Homepage/Demo button */
  const demoBtn = document.getElementById('pd-homepage-btn');
  if (demoBtn && repo.homepage) {
    demoBtn.href = repo.homepage;
    demoBtn.classList.remove('hidden');
  }

  /* Overview */
  const overviewEl = document.getElementById('pd-overview-text');
  if (overviewEl) {
    overviewEl.textContent = repo.description
      ? `${repo.name} is a ${lang ? lang + ' ' : ''}project by Dewi Atika Muthi. ${repo.description}`
      : 'No description available for this project.';
  }

  /* Stats */
  setText('pd-stars', repo.stargazers_count);
  setText('pd-forks', repo.forks_count);
  setText('pd-watchers', repo.watchers_count ?? repo.watchers);
  setText('pd-open-issues', repo.open_issues_count ?? repo.open_issues);

  /* Details */
  if (lang) {
    const detailLang = document.getElementById('pd-detail-lang');
    if (detailLang) {
      detailLang.innerHTML = `<span class="lang-dot" style="background:${color};width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:4px;"></span>${escapeHtml(lang)}`;
    }
  }
  setText('pd-detail-visibility', repo.private ? 'Private' : 'Public');
  setText('pd-detail-created', formatFullDate(repo.created_at));
  setText('pd-detail-updated', formatRelativeDate(repo.updated_at));
  setText('pd-detail-license', repo.license?.name || 'None');
  setText('pd-detail-branch', repo.default_branch || 'main');

  /* Tag cloud */
  const tagCloud = document.getElementById('pd-tag-cloud');
  const topicsCard = document.getElementById('pd-topics-card');
  if (tagCloud && topics.length > 0) {
    tagCloud.innerHTML = topics.map(t =>
      `<span class="pd-tag">${escapeHtml(t)}</span>`
    ).join('');
  } else if (topicsCard) {
    topicsCard.style.display = 'none';
  }

  /* Activity Grid */
  populateActivity(repo);

  /* README */
  await fetchReadme(repo.name);

  /* Next projects */
  populateNextProjects(allRepos, repo.name);

  showMain();
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '0';
}

/* ================================================
   ACTIVITY GRID
   ================================================ */
function populateActivity(repo) {
  const grid = document.getElementById('pd-activity-grid');
  if (!grid) return;

  const items = [
    { label: 'Last Pushed', value: formatRelativeDate(repo.pushed_at) },
    { label: 'Last Updated', value: formatRelativeDate(repo.updated_at) },
    { label: 'Size', value: repo.size > 1024 ? `${(repo.size / 1024).toFixed(1)} MB` : `${repo.size} KB` },
    { label: 'Default Branch', value: repo.default_branch || 'main' },
  ];

  grid.innerHTML = items.map(item => `
    <div class="pd-activity-item">
      <div class="pd-activity-label">${escapeHtml(item.label)}</div>
      <div class="pd-activity-value">${escapeHtml(String(item.value))}</div>
    </div>
  `).join('');
}

/* ================================================
   FETCH README
   ================================================ */
async function fetchReadme(repoName) {
  const el = document.getElementById('pd-readme');
  if (!el) return;

  try {
    /* Try to get the README from GitHub API (returns base64) */
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/readme`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );

    if (!res.ok) {
      el.innerHTML = '<p class="pd-readme-placeholder">📄 No README found for this repository.</p>';
      return;
    }

    const data = await res.json();
    const md = decodeURIComponent(escape(atob(data.content)));
    el.innerHTML = renderMarkdown(md);

    /* Open all README links in new tab safely */
    el.querySelectorAll('a').forEach(a => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

  } catch (err) {
    console.warn('README fetch failed:', err);
    el.innerHTML = '<p class="pd-readme-placeholder">📄 README could not be loaded.</p>';
  }
}

/* ================================================
   NEXT PROJECTS
   ================================================ */
function populateNextProjects(allRepos, currentRepoName) {
  const grid = document.getElementById('pd-next-grid');
  if (!grid) return;

  const others = allRepos
    .filter(r => r.name !== currentRepoName && !r.fork)
    .slice(0, 3);

  if (others.length === 0) {
    grid.parentElement?.parentElement?.style.setProperty('display', 'none');
    return;
  }

  grid.innerHTML = others.map(repo => {
    const lang = repo.language || null;
    const color = LANG_COLORS[lang] || '#858585';
    const detailUrl = `project.html?repo=${encodeURIComponent(repo.name)}`;
    return `
      <a href="${detailUrl}" class="pd-next-card">
        <div class="pd-next-card-lang">
          <span class="lang-dot" style="background:${color};width:10px;height:10px;border-radius:50%;display:inline-block;"></span>
          ${escapeHtml(lang || 'Code')}
        </div>
        <div class="pd-next-card-name">${escapeHtml(repo.name)}</div>
        <div class="pd-next-card-desc">${escapeHtml(repo.description || 'No description.')}</div>
      </a>
    `;
  }).join('');
}

/* ================================================
   CURSOR GLOW
   ================================================ */
function initCursorGlow() {
  if (window.innerWidth < 768) return;
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9999;
    width:300px;height:300px;border-radius:50%;
    background:radial-gradient(circle,rgba(187,38,73,0.05) 0%,transparent 70%);
    top:0;left:0;
  `;
  document.body.appendChild(glow);

  let mx = 0, my = 0, gx = 0, gy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function tick() {
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.transform = `translate(${gx - 150}px, ${gy - 150}px)`;
    requestAnimationFrame(tick);
  })();
}

/* ================================================
   MAIN — fetch repo and render
   ================================================ */
async function main() {
  const params = new URLSearchParams(window.location.search);
  const repoName = params.get('repo');

  if (!repoName) {
    showError('No project specified. Please go back and select a project.');
    return;
  }

  showLoading();

  try {
    /* Fetch specific repo AND all repos in parallel */
    const [repoRes, allRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      }),
    ]);

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        showError(`Repository "${repoName}" not found on GitHub.`);
      } else if (repoRes.status === 403) {
        showError('GitHub API rate limit reached. Please try again in a few minutes.');
      } else {
        showError(`Failed to load project: HTTP ${repoRes.status}`);
      }
      return;
    }

    const repo = await repoRes.json();
    const allRepos = allRes.ok ? await allRes.json() : [];

    await populatePage(repo, allRepos.filter(r => !r.fork));
  } catch (err) {
    console.error('Project page error:', err);
    showError('Network error. Please check your connection and try again.');
  }
}

/* ================================================
   INIT
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initBackToTop();
  initCursorGlow();
  main();
});
