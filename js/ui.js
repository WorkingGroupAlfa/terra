/* Creekside Plumbing & Gas — page interactions
   Quote form, FAQ, reviews toggle, hero video, reveal-on-scroll and the sticky quote bar. */
(function () {
  'use strict';

  // POST target for quote requests and job applications (Formspree, a serverless
  // function, CRM webhook…). Leave empty and the forms only update the UI.
  const LEAD_ENDPOINT = '';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // Lets js/analytics.js record the conversion; only non-personal fields are shared
  function announceLead(type, info) {
    document.dispatchEvent(new CustomEvent('creekside:lead', { detail: Object.assign({ type: type }, info) }));
  }

  function sendLead(type, fields) {
    if (!LEAD_ENDPOINT) return;
    fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.assign({ type: type }, fields)),
      keepalive: true
    }).catch(() => {});
  }

  function scrollToQuiz() {
    const quiz = document.getElementById('quiz');
    if (!quiz) return;
    const top = quiz.getBoundingClientRect().top + window.scrollY - 8;
    window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
  }
  $$('[data-action="to-quiz"]').forEach(btn => btn.addEventListener('click', scrollToQuiz));

  /* ---------- Quote form ---------- */

  const quiz = document.getElementById('quiz');
  const form = $('[data-quote-form]', quiz);
  const field = (name) => form.elements.namedItem(name);

  // Situations that skip the form and show their own panel instead of "Next"
  const DIRECT_PANELS = ['emergency', 'gas', 'job'];

  const state = { step: 1, service: '', property: '', sent: false, jobSent: false, err: '' };

  function render() {
    const s = state;
    $('[data-step-label]', quiz).textContent = 'Step ' + s.step + ' of 3';
    $('[data-progress]', quiz).style.transform = 'scaleX(' + (s.step / 3).toFixed(3) + ')';
    form.hidden = s.sent;
    $('[data-sent]', quiz).hidden = !s.sent;
    $$('[data-step]', quiz).forEach(el => { el.hidden = Number(el.dataset.step) !== s.step; });
    $$('[data-service]', quiz).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.service === s.service)));
    $$('[data-property]', quiz).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.property === s.property)));
    const panel = DIRECT_PANELS.includes(s.service) ? s.service : 'next';
    $$('[data-panel]', quiz).forEach(el => { el.hidden = el.dataset.panel !== panel; });
    $('[data-job-form]', quiz).hidden = s.jobSent;
    $('[data-job-sent]', quiz).hidden = !s.jobSent;
    const errEl = $('[data-error]', quiz);
    errEl.textContent = s.err;
    errEl.hidden = !s.err;
  }

  function set(patch) {
    Object.assign(state, patch);
    render();
  }

  const serviceLabel = () => {
    const btn = $('[data-service="' + state.service + '"]', quiz);
    return btn ? btn.textContent.trim() : '';
  };

  function resetJobFields() {
    ['job-name', 'job-phone', 'job-exp'].forEach(n => { field(n).value = ''; });
  }

  function next1() {
    if (!state.service) return set({ err: 'Pick a service to keep going.' });
    set({ step: 2, err: '' });
  }

  function next2() {
    if (!state.property) return set({ err: 'Pick a property type.' });
    if (!field('suburb').value.trim()) return set({ err: 'Tell us your suburb.' });
    set({ step: 3, err: '' });
  }

  function submitQuote() {
    const name = field('name').value.trim();
    const phone = field('phone').value.trim();
    if (!name || !phone) return set({ err: 'Add your name and phone so we can call you back.' });
    const situation = serviceLabel();
    sendLead('quote', {
      situation: situation,
      property: state.property,
      suburb: field('suburb').value.trim(),
      time: field('time').value,
      name: name,
      phone: phone
    });
    announceLead('quote', { situation: situation, property: state.property, time: field('time').value });
    set({ sent: true, err: '' });
  }

  function submitJob() {
    const name = field('job-name').value.trim();
    const phone = field('job-phone').value.trim();
    if (!name || !phone) return set({ err: 'Add your name and phone so we can call you back.' });
    sendLead('job-application', { name: name, phone: phone, experience: field('job-exp').value.trim() });
    announceLead('job-application', {});
    set({ jobSent: true, err: '' });
  }

  quiz.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || !quiz.contains(btn)) return;
    if (btn.dataset.service) return set({ service: btn.dataset.service, err: '' });
    if (btn.dataset.property) return set({ property: btn.dataset.property, err: '' });
    switch (btn.dataset.action) {
      case 'next1': return next1();
      case 'next2': return next2();
      case 'back': return set({ step: state.step - 1, err: '' });
      case 'job-submit': return submitJob();
      case 'clear-service':
        resetJobFields();
        return set({ service: '', jobSent: false, err: '' });
      case 'again':
        form.reset();
        return set({ sent: false, step: 1, service: '', property: '', err: '' });
    }
  });

  // Enter inside a field advances the current step instead of submitting early
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.service === 'job') return submitJob();
    if (state.step === 1) return next1();
    if (state.step === 2) return next2();
    submitQuote();
  });

  // Hold the box at its step-1 height so later, shorter steps don't shift the page
  function lockQuizHeight() {
    if (state.step !== 1 || state.sent || state.service) return;
    quiz.style.minHeight = '';
    if (quiz.offsetHeight > 100) quiz.style.minHeight = quiz.offsetHeight + 'px';
  }
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    lockQuizHeight();
  }, { passive: true });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(lockQuizHeight));

  render();

  /* ---------- Hero video ---------- */

  const video = $('[data-hero-video]');
  const muteBtn = $('[data-action="mute"]');
  const fullBtn = $('[data-action="fullscreen"]');
  if (video && muteBtn) {
    const play = () => { const p = video.play && video.play(); if (p && p.catch) p.catch(() => {}); };
    video.muted = true;
    play();

    // The native player's own volume control can change this too
    const syncMute = () => { muteBtn.textContent = video.muted ? 'Unmute' : 'Mute'; };
    muteBtn.addEventListener('click', () => { video.muted = !video.muted; });
    video.addEventListener('volumechange', syncMute);

    // Full screen in each platform's own player: the Fullscreen API with native controls on
    // desktop and Android, the built-in iOS player on iPhone (no element full screen there).
    const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;
    const elementFs = (document.fullscreenEnabled || document.webkitFullscreenEnabled) &&
      (video.requestFullscreen || video.webkitRequestFullscreen);
    const iosFs = typeof video.webkitEnterFullscreen === 'function';

    const enterIosFs = () => {
      try { video.webkitEnterFullscreen(); }
      catch (e) { video.addEventListener('loadedmetadata', () => { try { video.webkitEnterFullscreen(); } catch (_) {} }, { once: true }); }
    };

    const openFullscreen = () => {
      if (fsElement()) return;
      if (video.paused) play();
      if (elementFs) {
        video.controls = true;
        const req = video.requestFullscreen ? video.requestFullscreen() : video.webkitRequestFullscreen();
        if (req && req.catch) req.catch(() => { video.controls = false; if (iosFs) enterIosFs(); });
      } else {
        enterIosFs();
      }
    };

    // Back inline: hide native controls again and keep the loop running
    const onExit = () => { video.controls = false; syncMute(); play(); };
    const onFsChange = () => { if (!fsElement()) onExit(); };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    video.addEventListener('webkitendfullscreen', onExit);

    if (fullBtn && (elementFs || iosFs)) {
      fullBtn.hidden = false;
      fullBtn.addEventListener('click', openFullscreen);
      video.parentElement.classList.add('can-fullscreen');
      video.addEventListener('click', () => { if (!fsElement()) openFullscreen(); });
    }
  }

  /* ---------- FAQ ---------- */

  $$('.faq__q').forEach(btn => btn.addEventListener('click', () => {
    btn.setAttribute('aria-expanded', String(btn.getAttribute('aria-expanded') !== 'true'));
  }));

  /* ---------- Reviews (mobile shows 3 until expanded) ---------- */

  const reviews = $('[data-reviews]');
  const reviewsMore = $('[data-reviews-more]');
  if (reviews && reviewsMore) {
    $('button', reviewsMore).addEventListener('click', () => {
      reviews.classList.add('is-expanded');
      reviewsMore.hidden = true;
    });
  }

  /* ---------- Our works pager ---------- */
  // Two pages share one grid, so the section never changes height (the pipe is measured from
  // it). A navy wipe with a bright edge sweeps each tile, top to bottom going forward and
  // bottom to top going back; the pages swap while the tile is covered.

  const worksPager = $('[data-works-pager]');
  const worksGrid = $('[data-works-grid]');
  if (worksPager && worksGrid) {
    const PAGES = 2;
    const FLIP_LABEL = { 1: 'Next: the crew on the tools \u2192', 2: '\u2190 Back to finished jobs' };
    const tabs = $$('[data-page-to]', worksPager);
    const ink = $('[data-pager-ink]', worksPager);
    const prevBtn = $('[data-page-step="-1"]', worksPager);
    const nextBtn = $('[data-page-step="1"]', worksPager);
    const status = $('[data-pager-status]', worksPager);
    const flip = $('[data-works-flip]', worksGrid);
    const tiles = $$('[data-tile]', worksGrid);
    const wipes = $$('[data-wipe]', worksGrid);
    let page = 1;
    let busy = false;
    let wipesReady = false;

    const placeInk = () => {
      const t = tabs.find(b => Number(b.dataset.pageTo) === page);
      if (!t) return;
      ink.style.left = t.offsetLeft + 'px';
      ink.style.width = t.offsetWidth + 'px';
    };

    const showPage = (tile, p) => {
      $$('[data-page]', tile).forEach(el => el.classList.toggle('is-current', Number(el.dataset.page) === p));
      if (flip && tile.contains(flip)) flip.textContent = FLIP_LABEL[p];
    };

    const syncControls = () => {
      tabs.forEach(t => {
        const on = Number(t.dataset.pageTo) === page;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      prevBtn.disabled = page === 1;
      nextBtn.disabled = page === PAGES;
      placeInk();
      const tab = tabs[page - 1];
      status.textContent = 'Page ' + page + ' of ' + PAGES + (tab ? ': ' + tab.textContent.replace(/^\d+\s*/, '').trim() : '');
    };

    // Tiles in the order they appear on screen (mobile reorders two of them with CSS)
    const byPosition = () => tiles.slice().sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return (ra.top - rb.top) || (ra.left - rb.left);
    });

    function goTo(p) {
      if (busy || p < 1 || p > PAGES || p === page) return;
      const dir = p > page ? 1 : -1;
      page = p;
      syncControls();
      const G = window.gsap;
      if (reduced || !G) { tiles.forEach(t => showPage(t, p)); return; }
      busy = true;
      // GSAP owns the wipe transform from here on; CSS keeps it hidden until then
      if (!wipesReady) { G.set(wipes, { yPercent: -102, visibility: 'visible' }); wipesReady = true; }
      const tl = G.timeline({ onComplete: () => { busy = false; } });
      byPosition().forEach((tile, i) => {
        const wipe = $('[data-wipe]', tile);
        if (!wipe) return;
        const at = i * 0.045;
        tl.fromTo(wipe, { yPercent: -102 * dir }, { yPercent: 0, duration: 0.26, ease: 'power2.in' }, at)
          .call(showPage, [tile, p], at + 0.26)
          .to(wipe, { yPercent: 102 * dir, duration: 0.3, ease: 'power2.out' }, at + 0.26);
      });
    }

    worksPager.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.pageTo) goTo(Number(btn.dataset.pageTo));
      else if (btn.dataset.pageStep) goTo(page + Number(btn.dataset.pageStep));
    });
    if (flip) flip.addEventListener('click', () => goTo(page === PAGES ? 1 : page + 1));

    // Left/right arrow keys move between the tabs
    $('[role="tablist"]', worksPager).addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      goTo(page + (e.key === 'ArrowRight' ? 1 : -1));
      const t = tabs.find(b => Number(b.dataset.pageTo) === page);
      if (t) t.focus();
    });

    // Horizontal swipe on touch screens; vertical panning stays native (touch-action: pan-y)
    let swipe = null;
    worksGrid.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      swipe = { id: e.pointerId, x: e.clientX, y: e.clientY };
    }, { passive: true });
    worksGrid.addEventListener('pointerup', (e) => {
      if (!swipe || e.pointerId !== swipe.id) return;
      const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
      swipe = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(page + (dx < 0 ? 1 : -1));
    }, { passive: true });
    worksGrid.addEventListener('pointercancel', () => { swipe = null; });

    window.addEventListener('resize', placeInk, { passive: true });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(placeInk);
    syncControls();

    if ('IntersectionObserver' in window) {
      // Fetch the second page's photos once the grid is near, so the first flip has nothing to wait for
      const preload = new IntersectionObserver((entries) => {
        if (!entries.some(en => en.isIntersecting)) return;
        preload.disconnect();
        $$('[data-page="2"] img', worksGrid).forEach(img => { img.loading = 'eager'; });
      }, { rootMargin: '600px 0px' });
      preload.observe(worksGrid);

      // On phones, nudge the next arrow once when the grid comes into view
      if (!reduced && window.matchMedia('(max-width: 899px)').matches) {
        const hint = new IntersectionObserver((entries) => {
          if (!entries.some(en => en.isIntersecting)) return;
          hint.disconnect();
          const G = window.gsap;
          if (G && page === 1) G.to(nextBtn, { x: 6, duration: 0.16, repeat: 5, yoyo: true, ease: 'sine.inOut', delay: 0.6 });
        }, { threshold: 0.25 });
        hint.observe(worksGrid);
      }
    }
  }

  /* ---------- Reveal on scroll ---------- */

  if (!reduced && 'IntersectionObserver' in window) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        revealer.unobserve(en.target);
        en.target.classList.add('is-revealed');
      });
    }, { threshold: 0.12 });
    $$('[data-reveal]').forEach(el => {
      el.classList.add('reveal');
      revealer.observe(el);
    });
  }

  /* ---------- Sticky quote bar ---------- */
  // Morphs out of the quote box when it scrolls off the top, and back into it on return.

  const bar = $('[data-quote-bar]');
  if (bar && 'IntersectionObserver' in window) {
    const inner = bar.firstElementChild;
    let shown = false;
    let tl = null;
    let token = 0;

    const showBar = () => {
      token++;
      bar.inert = false;
      bar.style.pointerEvents = 'auto';
      const G = window.gsap;
      if (reduced || !G) {
        bar.style.transition = 'opacity 0.25s ease';
        bar.style.transform = 'none';
        bar.style.opacity = '1';
        return;
      }
      const b = quiz.getBoundingClientRect();
      const w = bar.offsetWidth || 1;
      const h = bar.offsetHeight || 1;
      const parts = $$('[data-bp]', bar);
      const line = $('[data-bp-line]', bar);
      if (tl) tl.kill();
      bar.style.transition = 'none';
      inner.style.opacity = '1';
      G.set(bar, { transformOrigin: '0 0', x: b.left, y: b.top, yPercent: 0, scaleX: b.width / w, scaleY: b.height / h, opacity: 0.35 });
      tl = G.timeline({ defaults: { ease: 'expo.out' } });
      tl.to(bar, { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.55 });
      if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.out' }, '-=0.32');
      if (parts.length) tl.fromTo(parts, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.07 }, '-=0.42');
    };

    const hideBar = () => {
      const tok = ++token;
      bar.inert = true;
      bar.style.pointerEvents = 'none';
      const G = window.gsap;
      if (reduced || !G) {
        bar.style.transition = 'opacity 0.25s ease';
        bar.style.opacity = '0';
        return;
      }
      const b = quiz.getBoundingClientRect();
      const w = bar.offsetWidth || 1;
      const h = bar.offsetHeight || 1;
      const parts = $$('[data-bp]', bar);
      const line = $('[data-bp-line]', bar);
      if (tl) tl.kill();
      tl = G.timeline();
      if (parts.length) tl.to(parts, { y: 6, opacity: 0, duration: 0.16, stagger: 0.03, ease: 'power1.in' });
      if (line) tl.to(line, { scaleX: 0, duration: 0.25, ease: 'power2.in' }, '<');
      tl.to(bar, { x: b.left, y: b.top, scaleX: b.width / w, scaleY: b.height / h, opacity: 0, duration: 0.5, ease: 'expo.inOut' }, '-=0.05');
      tl.call(() => {
        if (tok !== token) return;
        G.set(bar, { x: 0, y: 0, yPercent: -110, scaleX: 1, scaleY: 1 });
      });
    };

    new IntersectionObserver((entries) => {
      const e = entries[entries.length - 1];
      const past = !e.isIntersecting && e.boundingClientRect.top < 0;
      if (past === shown) return;
      shown = past;
      past ? showBar() : hideBar();
    }, { threshold: 0 }).observe(quiz);
  }
})();
