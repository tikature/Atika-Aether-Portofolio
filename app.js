/* =====================================================
   app.js — Dewi Atika Muthi Portfolio
   ===================================================== */

'use strict';

const GITHUB_USERNAME = 'tikature';
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}`;
const GITHUB_REPOS_API = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`;

/* ---- Language Color Map ---- */
const LANG_COLORS = {
  JavaScript: '#f1e05a', Python: '#3572A5', HTML: '#e34c26',
  CSS: '#563d7c', Vue: '#41b883', TypeScript: '#2b7489',
  PHP: '#4F5D95', Java: '#b07219', Ruby: '#701516',
  Go: '#00ADD8', Rust: '#dea584', Shell: '#89e051',
  Dart: '#00B4AB', Swift: '#F05138', Kotlin: '#A97BFF',
};

/* ================================================
   THEME TOGGLE
   ================================================ */
function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';

  root.setAttribute('data-theme', savedTheme);

  if (btn) {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
    });
  }
}

/* ================================================
   NAVBAR
   ================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const allNavLinks = document.querySelectorAll('.nav-link');

  /* Scroll effect */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
    updateActiveLink();
    updateBackToTop();
  }, { passive: true });

  /* Hamburger */
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks?.classList.toggle('open');
  });

  /* Close mobile menu on link click */
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      navLinks?.classList.remove('open');
    });
  });
}

/* Active section link highlight */
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 100;
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollY >= top && scrollY < top + height) {
      current = section.getAttribute('id');
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/* ================================================
   BACK TO TOP
   ================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  btn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function updateBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  if (window.scrollY > 400) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}

/* ================================================
   SCROLL ANIMATIONS (Intersection Observer)
   ================================================ */
function initAnimations() {
  const elements = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animated');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ================================================
   GITHUB API — USER PROFILE
   ================================================ */
async function fetchGitHubProfile() {
  try {
    const res = await fetch(GITHUB_API, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (!res.ok) throw new Error(`GitHub API Error: ${res.status}`);
    const data = await res.json();

    /* Populate profile card */
    const ghAvatar = document.getElementById('gh-avatar');
    const ghName = document.getElementById('gh-name');
    const ghBio = document.getElementById('gh-bio');
    const ghFollowers = document.getElementById('gh-followers');
    const ghFollowing = document.getElementById('gh-following');
    const ghRepos = document.getElementById('gh-repos');
    const ghGists = document.getElementById('gh-gists');

    if (ghAvatar) { ghAvatar.src = data.avatar_url; ghAvatar.alt = data.name || data.login; }
    if (ghName) ghName.textContent = data.name || data.login;
    if (ghBio) ghBio.textContent = data.bio || 'Software Developer from Indonesia 🇮🇩';
    if (ghFollowers) ghFollowers.textContent = `${data.followers} followers`;
    if (ghFollowing) ghFollowing.textContent = `${data.following} following`;
    if (ghRepos) ghRepos.textContent = data.public_repos;
    if (ghGists) ghGists.textContent = data.public_gists;

    /* Hero stats */
    const statRepos = document.getElementById('stat-repos');
    if (statRepos) statRepos.textContent = `${data.public_repos}+`;

    return data;
  } catch (err) {
    console.warn('GitHub profile fetch failed:', err.message);
    return null;
  }
}

/* ================================================
   GITHUB API — REPOSITORIES
   ================================================ */
async function fetchGitHubRepos() {
  const grid = document.getElementById('projects-grid');
  const errorEl = document.getElementById('projects-error');

  try {
    const res = await fetch(GITHUB_REPOS_API, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (!res.ok) throw new Error(`GitHub API Error: ${res.status}`);
    const repos = await res.json();

    /* Filter forks and sort by stars */
    const filtered = repos
      .filter(r => !r.fork && r.description)
      .sort((a, b) => b.stargazers_count - a.stargazers_count);

    /* Calculate total stars */
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const statStars = document.getElementById('stat-stars');
    if (statStars) statStars.textContent = `${totalStars}`;

    const ghStarsTotal = document.getElementById('gh-stars-total');
    if (ghStarsTotal) ghStarsTotal.textContent = totalStars;

    if (!grid) return;

    if (filtered.length === 0) {
      /* Fallback: show all without description filter */
      const all = repos.filter(r => !r.fork).slice(0, 6);
      renderRepoCards(all, grid);
    } else {
      renderRepoCards(filtered.slice(0, 9), grid);
    }

    if (errorEl) errorEl.classList.add('hidden');
  } catch (err) {
    console.warn('GitHub repos fetch failed:', err.message);
    if (grid) grid.innerHTML = '';
    if (errorEl) errorEl.classList.remove('hidden');
  }
}

function renderRepoCards(repos, container) {
  container.innerHTML = '';

  if (repos.length === 0) {
    container.innerHTML = `
      <div class="projects-error" style="grid-column:1/-1">
        <p>No public repositories found.</p>
        <a href="https://github.com/${GITHUB_USERNAME}" class="btn btn-outline btn-sm" target="_blank" rel="noopener">Visit GitHub Profile</a>
      </div>`;
    return;
  }

  repos.forEach((repo, i) => {
    const lang = repo.language || 'default';
    const color = LANG_COLORS[lang] || '#858585';
    const desc = repo.description || 'No description provided.';
    const topics = repo.topics || [];
    const topicHtml = topics.slice(0, 3).map(t => `<span class="project-topic">#${t}</span>`).join('');
    const detailUrl = `project.html?repo=${encodeURIComponent(repo.name)}`;

    const card = document.createElement('article');
    card.className = 'project-card';
    card.style.animationDelay = `${i * 80}ms`;
    card.dataset.animate = 'fade-up';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="project-lang">
        <span class="lang-dot" style="background:${color}"></span>
        <span>${lang !== 'default' ? lang : 'Code'}</span>
      </div>
      <h3 class="project-name">${escapeHtml(repo.name)}</h3>
      <p class="project-desc">${escapeHtml(desc)}</p>
      ${topicHtml ? `<div class="project-topics" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">${topicHtml}</div>` : ''}
      <div class="project-meta">
        <span title="Stars">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${repo.stargazers_count}
        </span>
        <span title="Forks">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>
          ${repo.forks_count}
        </span>
        ${repo.updated_at ? `<span>${formatDate(repo.updated_at)}</span>` : ''}
      </div>
      <div class="project-card-actions">
        <a href="${detailUrl}" class="project-link project-detail-link" aria-label="View ${repo.name} details">
          View Details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-gh-link" aria-label="View ${repo.name} on GitHub" title="Open on GitHub">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
        </a>
      </div>
    `;

    /* Clicking card body (not links) navigates to detail page */
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.location.href = detailUrl;
      }
    });

    container.appendChild(card);
  });

  /* Re-observe newly added cards */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  container.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

/* ================================================
   PROJECT TOPICS STYLE (injected)
   ================================================ */
function injectTopicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .project-topic {
      font-size: 11px;
      font-weight: 500;
      color: var(--magenta);
      background: var(--magenta-subtle);
      border: 1px solid rgba(187,38,73,0.15);
      border-radius: 100px;
      padding: 2px 8px;
      letter-spacing: 0.03em;
    }
  `;
  document.head.appendChild(style);
}

/* ================================================
   CONTACT FORM
   ================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit');
  const submitText = document.getElementById('submit-text');
  const statusEl = document.getElementById('form-status');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Basic validation */
    const nameEl = document.getElementById('contact-name');
    const emailEl = document.getElementById('contact-email');
    const msgEl = document.getElementById('contact-message');

    let valid = true;
    [nameEl, emailEl, msgEl].forEach(el => el?.classList.remove('error'));

    if (!nameEl?.value.trim()) { nameEl?.classList.add('error'); valid = false; }
    if (!emailEl?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl?.classList.add('error'); valid = false;
    }
    if (!msgEl?.value.trim()) { msgEl?.classList.add('error'); valid = false; }

    if (!valid) {
      showStatus('Please fill in all required fields correctly.', 'error');
      return;
    }

    /* Simulate send (no backend) */
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Sending...';

    await new Promise(r => setTimeout(r, 1200));

    showStatus('✅ Thank you for your message! I\'ll get back to you soon.', 'success');
    form.reset();

    if (submitBtn) submitBtn.disabled = false;
    if (submitText) submitText.textContent = 'Send Message';
  });

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = `form-status ${type}`;
    statusEl.classList.remove('hidden');
    setTimeout(() => {
      statusEl.classList.add('hidden');
    }, 5000);
  }
}

/* ================================================
   AVATAR FALLBACK
   ================================================ */
function initAvatarFallback() {
  const avatar = document.getElementById('avatar-img');
  if (!avatar) return;

  avatar.addEventListener('error', () => {
    /* Generate SVG avatar initials */
    const svg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="340" height="340" viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg">
        <rect width="340" height="340" rx="170" fill="#1a1020"/>
        <rect width="340" height="340" rx="170" fill="url(#grad)"/>
        <defs>
          <radialGradient id="grad" cx="40%" cy="35%">
            <stop offset="0%" stop-color="#BB2649" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#0a0a0f" stop-opacity="1"/>
          </radialGradient>
        </defs>
        <text x="170" y="200" text-anchor="middle" font-family="Space Grotesk,sans-serif" font-size="110"
              font-weight="800" fill="#ffffff" fill-opacity="0.9">DA</text>
      </svg>
    `)}`;
    avatar.src = svg;
  });
}

/* ================================================
   TYPED EFFECT — Hero subtitle
   ================================================ */
function initTypewriter() {
  /* Subtle cursor blink on hero title last word */
  const badge = document.querySelector('.hero-badge');
  if (!badge) return;
  badge.style.opacity = '0';
  setTimeout(() => {
    badge.style.transition = 'opacity 0.8s ease';
    badge.style.opacity = '1';
  }, 400);
}

/* ================================================
   TILT EFFECT on project cards (subtle)
   ================================================ */
function initCardTilt() {
  function applyTilt(card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  }

  /* Observe for dynamically added cards */
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.project-card:not([data-tilt])').forEach(card => {
      card.setAttribute('data-tilt', '1');
      applyTilt(card);
    });
  });

  const grid = document.getElementById('projects-grid');
  if (grid) observer.observe(grid, { childList: true });
}

/* ================================================
   SMOOTH SECTION TRANSITIONS — gradient separator
   ================================================ */
function injectSectionDividers() {
  const style = document.createElement('style');
  style.textContent = `
    .section + .section::before {
      content: '';
      display: block;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--magenta-glow), transparent);
      margin-bottom: var(--section-py);
    }
  `;
  document.head.appendChild(style);
}

/* ================================================
   CURSOR GLOW EFFECT (desktop only)
   ================================================ */
function initCursorGlow() {
  if (window.innerWidth < 768) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999;
    width:300px; height:300px; border-radius:50%;
    background: radial-gradient(circle, rgba(187,38,73,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease;
    top: 0; left: 0;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

/* ================================================
   UTILITIES
   ================================================ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/* ================================================
   INITIALIZE
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initBackToTop();
  initAnimations();
  initContactForm();
  initAvatarFallback();
  initTypewriter();
  initCardTilt();
  injectTopicStyles();
  injectSectionDividers();
  initCursorGlow();

  /* Fetch GitHub data */
  Promise.all([
    fetchGitHubProfile(),
    fetchGitHubRepos(),
  ]).catch(err => console.warn('GitHub data load error:', err));
});
