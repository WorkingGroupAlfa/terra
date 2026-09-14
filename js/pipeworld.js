/* Creekside Plumbing & Gas — scroll-driven pipe illustration
   A pipe runs from the hero down the page; water fills it as you scroll, a wrench
   repairs a broken joint between Services and Our works, a branch feeds a shower,
   and the line ends at a dripping tap above the footer duck.
   Geometry is measured from the page, so the whole SVG is rebuilt whenever the
   layout changes. Without GSAP (or with reduced motion) it renders fully assembled. */
(function () {
  'use strict';

  const host = document.getElementById('pipeworld');
  if (!host) return;

  const NS = 'http://www.w3.org/2000/svg';
  const mobileMq = window.matchMedia('(max-width: 899px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);
  const animated = !reduced && !!G && !!ST;

  const isVisible = (el) => el.getClientRects().length > 0;
  const visibleMouseScene = () => Array.from(document.querySelectorAll('svg[data-mousescene]')).find(isVisible);

  let layoutKey = null;
  let pipe = null;         // live state read by the ticker
  let repairTl = null;     // scroll-scrubbed wrench repair
  let repairP = 0;         // its progress; water is held at the break until the joint is fixed
  let dimTrigger = null;
  let mouseTriggers = [];
  let mousePlayed = false;
  let waterOn = true;
  let tickFn = null;
  let tickN = 0;

  const mk = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };
  const P = (d, w, stroke, attrs) => mk('path', Object.assign({
    d: d, fill: 'none', stroke: stroke, 'stroke-width': w, 'stroke-linecap': 'butt', 'stroke-linejoin': 'round'
  }, attrs || {}));

  const pageMargin = (vw) => Math.min(60, Math.max(10, vw * 0.025));

  // Centre line of the left pipe run, in px from the viewport's left edge
  const leftPipeX = (vw, mobile) => (mobile ? 24 : pageMargin(vw) + 22);

  // Shared with CSS as --pipe-x: the sticky bar logo, the footer tap and the mobile text
  // offset are all positioned from it
  let publishedPipeX = '';
  function publishPipeX(vw, mobile) {
    const value = leftPipeX(vw, mobile) + 'px';
    if (value === publishedPipeX) return;
    publishedPipeX = value;
    document.documentElement.style.setProperty('--pipe-x', value);
  }

  function build() {
    const vw = document.documentElement.clientWidth;
    const docH = document.body.scrollHeight;
    const m = mobileMq.matches;
    publishPipeX(vw, m);
    const key = vw + ':' + docH + ':' + (m ? 'm' : 'd');
    if (layoutKey === key) return;

    const hero = document.querySelector('[data-screen-label="Hero"]');
    const brk = document.querySelector('[data-zone="break"]');
    const msc = visibleMouseScene();
    if (!hero || !brk || !msc) return;
    if (docH < window.innerHeight || hero.getBoundingClientRect().height < 50 || vw < 200) return;
    layoutKey = key;

    if (repairTl) { if (repairTl.scrollTrigger) repairTl.scrollTrigger.kill(); repairTl.kill(); repairTl = null; }
    if (dimTrigger) { dimTrigger.kill(); dimTrigger = null; }
    mouseTriggers.forEach(t => t.kill());
    mouseTriggers = [];
    document.querySelectorAll('svg[data-mousescene]').forEach(el => { delete el.dataset.ms; });

    host.innerHTML = '';
    host.style.height = docH + 'px';
    const sy = window.scrollY;
    const pg = (el) => { const r = el.getBoundingClientRect(); return { top: r.top + sy, bottom: r.bottom + sy, height: r.height }; };

    // Dimensions
    const S = m ? 0.75 : 1;
    const OW = 15 * S, IW = 11.6 * S, EW = 8.6 * S, EI = 7 * S, WW = 8 * S;
    const margin = pageMargin(vw);
    const XL = leftPipeX(vw, m);          // left run, lines up with the footer tap and the bar logo
    const XR = vw - margin - 22;          // right run (desktop only)
    const yStart = pg(hero).bottom;
    const crossEl = document.querySelector('[data-zone="cross"]');
    const crossY = !m && crossEl && isVisible(crossEl) ? pg(crossEl).top + 44 : yStart + 160;
    const bR = pg(brk);
    const FL = 5 * S;
    const GAP = 46 * S;
    const yA = bR.top + 64 * S;           // end of the upper pipe (broken joint)
    const yB = yA + GAP + FL * 2;         // start of the lower pipe
    const juncY = yB + 58 * S;            // shower branch
    const yEnd = pg(msc).top + 3;
    const R = m ? 0 : 34;

    // Paths
    const seg1 = m
      ? 'M' + XL + ',' + yStart + ' V'
      : 'M' + XR + ',' + yStart + ' V' + (crossY - R) + ' A' + R + ',' + R + ' 0 0 1 ' + (XR - R) + ',' + crossY +
        ' H' + (XL + R) + ' A' + R + ',' + R + ' 0 0 0 ' + XL + ',' + (crossY + R) + ' V';
    const dA = seg1 + yA;
    const dW = seg1 + yEnd;
    const dT = 'M' + XL + ',' + (yA - 1) + ' V' + (yA + GAP + 1);
    const dB = 'M' + XL + ',' + yB + ' V' + yEnd;
    const Rb = 26;
    const Xs = m ? vw - 44 : Math.max(XL + 300, Math.min(vw - margin - 70, XL + vw * 0.52));
    const dropL = 96 * S;
    const dBr = 'M' + (XL + OW / 2) + ',' + juncY + ' H' + (Xs - Rb) + ' A' + Rb + ',' + Rb + ' 0 0 1 ' + Xs + ',' + (juncY + Rb) + ' V' + (juncY + Rb + dropL);
    const showerY = juncY + Rb + dropL;

    const svg = mk('svg', { width: vw, height: docH, viewBox: '0 0 ' + vw + ' ' + docH, 'aria-hidden': 'true' });
    svg.style.cssText = 'display:block;overflow:visible;pointer-events:none';
    host.appendChild(svg);

    // Pipe bodies: outline / inner / edge / inner edge
    const layers = [['#6FA8DC', OW], ['#0E1B29', IW], ['#6FA8DC', EW], ['#0E1B29', EI]];
    const body = (d) => { layers.forEach(l => svg.appendChild(P(d, l[1], l[0]))); };
    body(dA); body(dB); body(dBr);
    const tailPs = layers.map(l => {
      const el = P(dT, l[1], l[0]);
      el.setAttribute('stroke-dasharray', GAP + 2);
      el.setAttribute('stroke-dashoffset', animated ? GAP + 2 : 0);
      svg.appendChild(el);
      return el;
    });

    // Water: a translucent fill plus a moving dashed flow line, both cut off at the water
    // front with computed dash arrays (see paintWater). No SVG masks: a page-tall mask is
    // re-rasterised every frame, which freezes the flow on phones.
    const wg = mk('g', { 'data-wtr': '1' });
    const wFill = P(dW, WW, '#6FA8DC', { 'stroke-opacity': '0.24', 'stroke-linecap': 'round' });
    const wDash = P(dW, WW * 0.62, '#6FA8DC', { 'stroke-opacity': '0.62' });
    wg.appendChild(wFill); wg.appendChild(wDash); svg.appendChild(wg);

    // Water in the shower branch
    const bg2 = mk('g', { 'data-wtr': '1' });
    const bFill = P(dBr, WW, '#6FA8DC', { 'stroke-opacity': '0.24' });
    const bDash = P(dBr, WW * 0.62, '#6FA8DC', { 'stroke-opacity': '0.62' });
    bg2.appendChild(bFill); bg2.appendChild(bDash); svg.appendChild(bg2);

    // Dark-on-white repaint where the pipe crosses the white Services section
    const fills = [wFill];
    const dashes = [wDash];
    let creamR = null;
    const services = document.getElementById('services');
    if (services) {
      const sR = pg(services);
      const clip = mk('clipPath', { id: 'ckcream' });
      clip.appendChild(mk('rect', { x: 0, y: sR.top, width: vw, height: sR.height }));
      svg.appendChild(clip);
      const cg = mk('g', { 'clip-path': 'url(#ckcream)' });
      [['#0C324A', OW], ['#FFFFFF', IW], ['#0C324A', EW], ['#FFFFFF', EI]].forEach(l => cg.appendChild(P(dA, l[1], l[0])));
      // dA is the start of dW, so the same lengths along the path apply
      const cw = mk('g', { 'data-wtr': '1' });
      const cFill = P(dA, WW, '#0C324A', { 'stroke-opacity': '0.2', 'stroke-linecap': 'round' });
      const cDash = P(dA, WW * 0.62, '#0C324A', { 'stroke-opacity': '0.5' });
      cw.appendChild(cFill);
      cw.appendChild(cDash);
      fills.push(cFill);
      dashes.push(cDash);
      cg.appendChild(cw);
      svg.appendChild(cg);
      creamR = [sR.top, sR.bottom];
    }
    const onWhite = (y) => creamR && y > creamR[0] && y < creamR[1];

    const flange = (x, y, ang, dbl) => {
      const g = mk('g', { transform: 'translate(' + x + ',' + y + ') rotate(' + (ang || 0) + ') scale(' + S + ')', fill: 'none', stroke: onWhite(y) ? '#0C324A' : '#6FA8DC' });
      g.appendChild(mk('rect', { x: -15, y: dbl ? -5 : -2.3, width: 30, height: 4.6, 'stroke-width': 1.5 }));
      if (dbl) g.appendChild(mk('rect', { x: -15, y: 0.4, width: 30, height: 4.6, 'stroke-width': 1.5 }));
      [-11.5, 11.5].forEach(bx => g.appendChild(mk('circle', { cx: bx, cy: dbl ? -2.7 : 0, r: 1.1, 'stroke-width': 0.8 })));
      svg.appendChild(g);
      return g;
    };
    flange(m ? XL : XR, yStart + 6 * S, 0, true);
    if (!m) { flange((XR + XL) / 2, crossY, 90, true); flange(XL, crossY + R + 46, 0, false); }
    flange(XL, ((m ? yStart + 90 : crossY + R) + yA) / 2, 0, false);
    flange(Xs - Rb - 34, juncY, 90, false);

    // Valve on the Services run — click toggles the water on desktop
    const vy = services ? pg(services).top + pg(services).height * 0.55 : yB + 400;
    flange(XL, vy - 16 * S, 0, false); flange(XL, vy + 16 * S, 0, false);
    const vCol = onWhite(vy) ? '#0C324A' : '#6FA8DC';
    const vx = m ? XL : XL + 30 * S;
    const vr = m ? 8 : 10;
    const vg = mk('g', { fill: 'none', stroke: vCol });
    if (!m) vg.appendChild(mk('line', { x1: XL, y1: vy, x2: XL + 20 * S, y2: vy, 'stroke-width': 2 }));
    const valve = mk('g', { 'data-valve': '1', fill: 'none', stroke: vCol });
    valve.appendChild(mk('circle', { cx: vx, cy: vy, r: vr * S, 'stroke-width': 2 }));
    valve.appendChild(mk('circle', { cx: vx, cy: vy, r: vr * 0.6 * S, 'stroke-width': 0.8 }));
    valve.appendChild(P('M' + vx + ',' + (vy - vr * S) + ' V' + (vy + vr * S) + ' M' + (vx - vr * S) + ',' + vy + ' H' + (vx + vr * S), 0.8, vCol));
    vg.appendChild(valve); svg.appendChild(vg);

    // Shower head
    const sh = mk('g', { fill: 'none', stroke: '#6FA8DC', transform: 'translate(' + Xs + ',' + showerY + ') scale(' + S + ')' });
    sh.appendChild(mk('rect', { x: -15, y: -1, width: 30, height: 4.6, 'stroke-width': 1.5 }));
    sh.appendChild(P('M-17,4 L17,4 L25,21 L-25,21 Z', 1.8, '#6FA8DC'));
    sh.appendChild(P('M-20,16 H20', 0.7, '#6FA8DC'));
    sh.appendChild(P('M-15,21 v3 M-7.5,21 v3 M0,21 v3 M7.5,21 v3 M15,21 v3', 1, '#6FA8DC'));
    const spray = mk('g', { 'data-sdrip': '1', 'data-wtr': '1', stroke: '#6FA8DC', fill: 'none' });
    [[-15, -17, '5 7', 0.7], [-7.5, -8, '6 6', 0.55], [0, 0, '6 7', 0.6], [7.5, 8, '5 6', 0.5], [15, 17, '5 8', 0.65]].forEach(dd => {
      const ln = mk('line', { x1: dd[0], y1: 27, x2: dd[1], y2: 72, 'stroke-width': 1.05, 'stroke-dasharray': dd[2] });
      ln.setAttribute('class', 'ck-anim');
      ln.style.animation = 'ck-dash ' + dd[3] + 's linear infinite';
      spray.appendChild(ln);
    });
    sh.appendChild(spray); svg.appendChild(sh);

    // Broken joint: loose flange, drips, and the wrench that fixes it
    const joint = mk('g', {});
    const fACy = yA + GAP + FL / 2;
    const fA = mk('g', { transform: 'translate(' + XL + ',' + fACy + ') scale(' + S + ')', fill: 'none', stroke: '#6FA8DC' });
    fA.appendChild(mk('rect', { x: -15, y: -2.3, width: 30, height: 4.6, 'stroke-width': 1.5 }));
    const boltA = mk('g', {}); boltA.appendChild(P('M-11,-1.5 v3 M-12.5,0 h3', 0.8, '#6FA8DC')); fA.appendChild(boltA);
    const boltB = mk('g', {}); boltB.appendChild(P('M11,-1.5 v3 M9.5,0 h3', 0.8, '#6FA8DC')); fA.appendChild(boltB);
    joint.appendChild(fA);
    const drips = mk('g', { stroke: '#6FA8DC', fill: 'none', 'stroke-linecap': 'round', opacity: animated ? 1 : 0 });
    drips.appendChild(P('M' + (XL - 4) + ',' + (fACy + 10) + ' v9 M' + (XL + 1) + ',' + (fACy + 16) + ' v11 M' + (XL + 5) + ',' + (fACy + 8) + ' v7', 1.1, '#6FA8DC'));
    joint.appendChild(drips);
    // Placement lives on the outer group: GSAP rewrites the transform of the element it tweens
    const wrenchPos = mk('g', { transform: 'translate(' + (XL - 42 * S) + ',' + (fACy - 67 * S) + ') scale(' + S + ')' });
    // Adjustable wrench in the local frame of wrenchPos (flange centre at 42,67): the jaw drops
    // over the pipe from above and rests on the flange, the throat (x 34-50) gripping the
    // 15-wide pipe on its axis x = 42. Head 36 x 34, handle 112 long: real wrench proportions.
    const wrench = mk('g', { opacity: 0, fill: 'none', stroke: '#6FA8DC', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    wrench.appendChild(P('M24,64.5 V33 A3,3 0 0 1 27,30 H57 A3,3 0 0 1 60,33 L165,32 A7,7 0 0 1 165,46 L60,46 V64.5 H50 V44 H34 V64.5 Z', 1.8, '#6FA8DC'));
    wrench.appendChild(mk('rect', { x: 38, y: 34, width: 18, height: 6, rx: 3, 'stroke-width': 0.9 }));   // worm screw
    wrench.appendChild(P('M43.5,34.6 l-1.4,4.8 M47.5,34.6 l-1.4,4.8 M51.5,34.6 l-1.4,4.8', 0.7, '#6FA8DC')); // its knurl
    wrench.appendChild(mk('circle', { cx: 165, cy: 39, r: 2.2, 'stroke-width': 0.9 }));                  // hanging hole
    wrenchPos.appendChild(wrench);
    joint.appendChild(wrenchPos); svg.appendChild(joint);
    flange(XL, yB - FL / 2 - 0.3, 0, false);

    // Flow arcs inside the desktop bends, faded in as the water passes
    const notes = [];
    const note = (d, L) => {
      const el = P(d, 1, '#6FA8DC', { opacity: animated ? 0 : 0.55, 'stroke-linecap': 'round' });
      svg.appendChild(el);
      notes.push({ el: el, L: L, on: !animated });
    };
    if (!m) {
      const c1x = XR - R, c1y = crossY - R, r1 = R - 9, r2 = R - 15;
      note('M' + (c1x + r1) + ',' + c1y + ' A' + r1 + ',' + r1 + ' 0 0 1 ' + c1x + ',' + (c1y + r1) +
        ' M' + (c1x + r2) + ',' + c1y + ' A' + r2 + ',' + r2 + ' 0 0 1 ' + c1x + ',' + (c1y + r2), (crossY - yStart) + 6);
      const c2x = XL + R, c2y = crossY + R;
      note('M' + c2x + ',' + (c2y - r1) + ' A' + r1 + ',' + r1 + ' 0 0 0 ' + (c2x - r1) + ',' + c2y +
        ' M' + c2x + ',' + (c2y - r2) + ' A' + r2 + ',' + r2 + ' 0 0 0 ' + (c2x - r2) + ',' + c2y, (crossY - yStart) + (XR - XL) + 6);
    }

    const LW = wFill.getTotalLength();
    const LB = bFill.getTotalLength();

    // Length → page-y lookup so the water front can follow the viewport
    const samples = [];
    for (let l = 0; l <= LW; l += 26) samples.push([l, wFill.getPointAtLength(l).y]);
    samples.push([LW, yEnd]);

    const nose = mk('circle', { r: WW * 0.55 + 1, fill: 'none', stroke: '#6FA8DC', 'stroke-width': 1.3, opacity: 0 });
    svg.appendChild(nose);

    const keepFront = pipe ? Math.min(pipe.front, LW) : 0;
    const branch = { p: animated ? 0 : 1 };   // shower branch fill, driven by the repair timeline
    pipe = {
      path: wFill, LW: LW, LB: LB, fills: fills, dashes: dashes, bFill: bFill, bDash: bDash, branch: branch,
      notes: notes, samples: samples, nose: nose,
      gateLen: LW - (yEnd - yA),
      front: animated ? keepFront : LW,
      drift: 0, sf: 1, lastY: window.scrollY
    };
    paintWater(pipe);

    if (!waterOn) svg.querySelectorAll('[data-wtr]').forEach(el => { el.style.opacity = '0.06'; });

    if (!animated) { repairP = 1; return; }
    repairP = 0;
    setupMouse();

    G.set(joint, { y: -(GAP + FL) });
    const tl = G.timeline({
      scrollTrigger: { trigger: brk, start: 'top 90%', end: 'bottom 35%', scrub: 0.8 },
      onUpdate: function () { repairP = this.progress(); }
    });
    tl.to(joint, { y: -(GAP + FL), duration: 0.3 }, 0)
      .fromTo(wrench, { x: 130, y: -40, rotation: -70, opacity: 1, transformOrigin: '12% 70%' }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.08)
      .to(wrench, { rotation: 26, duration: 0.28, ease: 'power1.inOut' }, 0.42)
      .to(joint, { y: 0, duration: 0.28, ease: 'power1.inOut' }, 0.42)
      .to(tailPs, { strokeDashoffset: 0, duration: 0.28, ease: 'power1.inOut' }, 0.42)
      .to(drips, { opacity: 0, duration: 0.05 }, 0.66)
      .to([boltA, boltB], { rotation: 55, transformOrigin: '50% 50%', duration: 0.08 }, 0.68)
      .to(wrench, { x: 40, y: 26, rotation: -14, opacity: 0.22, duration: 0.16 }, 0.72)
      .to(branch, { p: 1, duration: 0.2 }, 0.78)
      .fromTo(spray, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.96);
    repairTl = tl;
    requestAnimationFrame(() => ST.refresh());

    // Fade the background map while the repair plays
    dimTrigger = ST.create({
      trigger: brk, start: 'top 70%', end: 'bottom 20%',
      onToggle: (self) => {
        const map = document.querySelector('svg[data-map]');
        if (map) G.to(map, { opacity: self.isActive ? 0.08 : 0.32, duration: 0.5 });
      }
    });

    if (!m) {
      valve.style.pointerEvents = 'auto';
      valve.style.cursor = 'pointer';
      valve.addEventListener('click', () => {
        waterOn = !waterOn;
        G.to(valve, { rotation: '+=' + (waterOn ? -270 : 270), svgOrigin: vx + ' ' + vy, duration: 0.9, ease: 'power2.inOut' });
        G.to(document.querySelectorAll('[data-wtr]'), { opacity: waterOn ? 1 : 0.06, duration: 0.7, delay: 0.2 });
      });
    }

    // Clicking the pipe sends a bubble downstream
    const hit = P(dW, 30, 'rgba(0,0,0,0)', {});
    hit.style.cssText = 'pointer-events:stroke;cursor:pointer';
    svg.appendChild(hit);
    hit.addEventListener('click', (e) => {
      if (!waterOn) return;
      const px = e.clientX + window.scrollX, py = e.clientY + window.scrollY;
      let best = 0, bd = 1e9;
      for (let i = 0; i < samples.length; i++) {
        const pt = wFill.getPointAtLength(samples[i][0]);
        const d2 = (pt.x - px) * (pt.x - px) + (pt.y - py) * (pt.y - py);
        if (d2 < bd) { bd = d2; best = samples[i][0]; }
      }
      const bubble = mk('circle', { r: 2.6 * S, fill: 'none', stroke: '#6FA8DC', 'stroke-width': 1.2, opacity: 0.9 });
      svg.appendChild(bubble);
      const o = { l: best };
      G.to(o, {
        l: Math.min(best + 340, LW - 4), duration: 1.15, ease: 'power1.in',
        onUpdate: () => { const pt = wFill.getPointAtLength(o.l); bubble.setAttribute('cx', pt.x + Math.sin(o.l * 0.3) * 1.6); bubble.setAttribute('cy', pt.y); }
      });
      G.to(bubble, { opacity: 0, duration: 1.15, ease: 'power1.in', onComplete: () => bubble.remove() });
    });

    startTicker();
  }

  const DASH_ON = 14, DASH_OFF = 10, DASH_CYCLE = DASH_ON + DASH_OFF;
  const PAST_END = ' 1000000';

  // Dash list for the flow line: 14 on / 10 off shifted forward by `drift`, cut off at `len`.
  // Starts with a zero-length dash so the list can open with a gap, and ends with a gap
  // longer than any path so the list never repeats.
  function flowDashes(len, drift) {
    let out = '0';
    let cursor = 0;
    for (let s = drift - DASH_CYCLE; s < len; s += DASH_CYCLE) {
      const a = Math.max(0, s);
      const b = Math.min(len, s + DASH_ON);
      if (b <= a) continue;
      out += ' ' + (a - cursor).toFixed(1) + ' ' + (b - a).toFixed(1);
      cursor = b;
    }
    return out + PAST_END;
  }

  function paintWater(st) {
    const flow = flowDashes(st.front, st.drift);
    const fill = st.front.toFixed(1) + PAST_END;
    const fillVis = st.front > 0.5 ? 'visible' : 'hidden';   // a zero-length round-capped dash still draws a dot
    st.fills.forEach(el => { el.setAttribute('stroke-dasharray', fill); el.setAttribute('visibility', fillVis); });
    st.dashes.forEach(el => el.setAttribute('stroke-dasharray', flow));
    const bLen = st.branch.p * st.LB;
    st.bFill.setAttribute('stroke-dasharray', bLen.toFixed(1) + PAST_END);
    st.bDash.setAttribute('stroke-dasharray', flowDashes(bLen, st.drift));
  }

  function startTicker() {
    if (tickFn) return;
    tickFn = () => {
      tickN++;
      if (tickN % 30 === 0) { if (!repairTl) layoutKey = null; build(); }
      const st = pipe;
      if (!st) return;
      const y = window.scrollY;
      const target = y + window.innerHeight * 0.8;

      // Water front follows 80% down the viewport, held at the break until the repair is mostly done
      let ft = 0;
      for (let i = 0; i < st.samples.length; i++) { if (st.samples[i][1] <= target) ft = st.samples[i][0]; }
      if (repairP < 0.72) ft = Math.min(ft, st.gateLen);
      st.front += (ft - st.front) * 0.14;
      if (Math.abs(ft - st.front) < 0.4) st.front = ft;
      if (st.front > 6 && st.front < st.LW - 6) {
        const pt = st.path.getPointAtLength(st.front);
        st.nose.setAttribute('cx', pt.x);
        st.nose.setAttribute('cy', pt.y);
        st.nose.setAttribute('opacity', '0.45');
      } else {
        st.nose.setAttribute('opacity', '0');
      }

      // Flow speed picks up with scroll velocity
      const dt = Math.min(0.05, G.ticker.deltaRatio(60) / 60);
      const v = Math.abs(y - st.lastY) / Math.max(dt, 0.001);
      st.lastY = y;
      st.sf += (1 + Math.min(0.6, v / 2500) - st.sf) * 0.05;
      st.drift = (st.drift + 52 * dt * st.sf) % 24;
      paintWater(st);

      st.notes.forEach(n => {
        if (!n.on && st.front > n.L + 12) { n.on = true; G.to(n.el, { opacity: 0.55, duration: 0.25 }); }
        else if (n.on && st.front < n.L - 30) { n.on = false; G.to(n.el, { opacity: 0, duration: 0.2 }); }
      });
    };
    G.ticker.add(tickFn);
  }

  /* ---------- Footer duck (data-mouse hooks): a drip lands on it once, then an idle loop ---------- */

  function setupMouse() {
    if (!animated) return;
    document.querySelectorAll('svg[data-mousescene]').forEach(sc => {
      if (sc.dataset.ms || !isVisible(sc)) return;
      sc.dataset.ms = '1';
      const q = (s) => sc.querySelectorAll(s);
      if (mousePlayed) {
        G.set(q('[data-mouse]'), { x: 0, opacity: 1 });
        if (!sc.dataset.idle) mouseIdle(sc);
        return;
      }
      G.set(q('[data-mouse]'), { x: -130, opacity: 0 });
      mouseTriggers.push(ST.create({
        trigger: sc, start: 'top 88%', once: true,
        onEnter: () => {
          mousePlayed = true;
          G.timeline({ onComplete: () => mouseIdle(sc) })
            .set(q('[data-mouse]'), { opacity: 1 })
            .to(q('[data-mouse]'), { x: 0, duration: 0.9, ease: 'power2.out' })
            .fromTo(q('[data-mdrop]'), { opacity: 1, y: 0, scale: 0.15, transformOrigin: '50% 0%' }, { scale: 1, duration: 0.5, ease: 'power1.inOut' }, '-=0.25')
            .to(q('[data-mdrop]'), { scaleY: 0.85, duration: 0.1, yoyo: true, repeat: 1 })
            .to(q('[data-mdrop]'), { y: 62, duration: 0.3, ease: 'power2.in' })
            .to(q('[data-mdrop]'), { opacity: 0, duration: 0.08 })
            .to(q('[data-mouse]'), { scaleY: 0.82, scaleX: 1.1, transformOrigin: '50% 100%', duration: 0.09, yoyo: true, repeat: 1 }, '<')
            .to(q('[data-mouse]'), { x: '+=3', duration: 0.05, yoyo: true, repeat: 5 })
            .fromTo(q('[data-mshake]'), { opacity: 1, x: 0, y: 0 }, { opacity: 0, x: 7, y: -9, duration: 0.45 }, '<')
            .to(q('[data-mouse]'), { x: 0, scaleX: 1, scaleY: 1, duration: 0.2 });
        }
      }));
    });
  }

  function mouseIdle(sc) {
    if (sc.dataset.idle) return;
    sc.dataset.idle = '1';
    const q = (s) => sc.querySelectorAll(s);
    G.timeline({ repeat: -1, repeatDelay: 6 })
      .fromTo(q('[data-mdrop]'), { opacity: 1, y: 0, scale: 0.15, transformOrigin: '50% 0%' }, { scale: 1, duration: 0.6 })
      .to(q('[data-mdrop]'), { y: 62, duration: 0.3, ease: 'power2.in' })
      .to(q('[data-mdrop]'), { opacity: 0, duration: 0.08 })
      .to(q('[data-mouse]'), { scaleY: 0.9, transformOrigin: '50% 100%', duration: 0.08, yoyo: true, repeat: 1 }, '<')
      .to(q('[data-mear]'), { rotation: -5, transformOrigin: '50% 100%', duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 3 }, '+=0.1');
  }

  /* ---------- Rebuild on layout changes ---------- */

  // build() only redraws (and refreshes ScrollTrigger) when width, page height or breakpoint
  // change — phone address-bar resizes during scroll leave all three untouched.
  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      build();
    });
  };
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule);
  mobileMq.addEventListener('change', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);

  build();
  setupMouse();
})();
