function initializeDemo(stage) {
  const find = (selector) => stage.querySelector(selector);
  const screen = find('.demo-screen');
  const app = find('.demo-app');
  const switcher = find('.demo-switcher');
  const sheet = find('.demo-sheet');
  const shade = find('.demo-shade');
  const saved = find('.demo-saved');
  const cursor = find('.demo-cursor');
  const ripple = find('.demo-ripple');
  const homeBar = find('.demo-home-bar');
  const sourceCards = find('.source-cards');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const gs = window.gsap;

  const apps = [
    { id: 'tiktok', name: 'TikTok', logo: 'tiktok.svg', title: 'Streetwear edit', domain: 'tiktok.com', theme: 'dark' },
    { id: 'instagram', name: 'Instagram', logo: 'instagram.svg', title: 'Streetwear edit', domain: 'instagram.com', theme: 'dark' },
    { id: 'youtube', name: 'YouTube', logo: 'youtube.svg', title: 'Streetwear edit', domain: 'youtube.com', theme: 'dark' },
    { id: 'x', name: 'X', logo: 'x.svg', title: 'Streetwear edit', domain: 'x.com', theme: 'dark' },
    { id: 'safari', name: 'Safari', logo: 'safari.png', title: 'Secure the Unknown', domain: 'secure-the-unknown.cyera.com', page: 'cyera-mobile.webp', recording: 'cyera-homepage.mp4', theme: 'dark' },
    { id: 'portfolio', name: 'Safari', logo: 'safari.png', title: 'Aonnoy Sengupta', domain: 'aonnoysengupta.com', page: 'aonnoy-mobile.webp', recording: 'aonnoy-homepage.mp4', theme: 'dark' },
    { id: 'reddit', name: 'Reddit', logo: 'reddit.svg', title: 'A question about two kittens', domain: 'reddit.com', post: 'reddit-post.webp', theme: 'light' },
  ];
  const icon = (name) => `<svg focusable="false"><use href="#${name}"/></svg>`;
  const logo = (item) => `<img src="assets/${item.logo}" alt="">`;
  const poster = 'assets/hero/streetwear-edit.jpg';
  const capture = (item) => `<img src="${item.page || item.post ? 'assets/hero/' + (item.page || item.post) : poster}" alt="" draggable="false">`;
  const linq = '<img src="assets/current/linq-icon.png" alt="">';
  const glyphs = {
    home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
    heart: 'M12 21 4.1 13a5 5 0 0 1 7.9-6 5 5 0 0 1 7.9 6z',
    profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0z',
    shorts: 'm9 10 6 3-6 3z M7 10a3 3 0 0 1 0-5l7-3a4 4 0 0 1 4 7 4 4 0 0 1-1 7l-7 4a4 4 0 0 1-4-7z',
    send: 'm22 3-6 18-5-8-8-5 19-5z M11 13l6-5',
    back: 'm15 4-8 8 8 8',
    forward: 'm9 4 8 8-8 8',
    thumb: 'M8 10v11H3V10z M8 11l5-8c2 0 3 1 2 4l-1 3h5a2 2 0 0 1 2 3l-2 6a3 3 0 0 1-3 2H8',
    arrow: 'm14 4 8 7-8 7v-4c-5 0-8 1-12 5 1-7 6-11 12-11z',
    menu: 'M5 12h.1m7 0h.1m7 0h.1',
  };
  const glyph = (name) => glyphs[name]
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${glyphs[name]}"/></svg>`
    : icon(name);
  const actions = (names, shareIcon) => names.map((name) =>
    `<span${name === shareIcon ? ' class="demo-share-anchor"' : ''}>${glyph(name)}</span>`).join('');
  const details = {
    tiktok: { head: '<span>Following</span><strong>For You</strong>', rail: ['heart', 'hero-message', 'bookmark', 'arrow'], share: 'arrow', tabs: ['home', 'people', 'plus', 'hero-message', 'profile'], labels: ['Home', 'Friends', '', 'Inbox', 'Profile'] },
    instagram: { head: '<strong>Reels</strong><span>Friends</span>', rail: ['heart', 'hero-message', 'repeat', 'send', 'menu'], share: 'send', tabs: ['home', 'shorts', 'send', 'search', 'profile'] },
    youtube: { head: '<strong>Shorts</strong>', rail: ['thumb', 'hero-message', 'arrow', 'repeat'], share: 'arrow', tabs: ['home', 'shorts', 'plus', 'bookmark', 'profile'], labels: ['Home', 'Shorts', '', 'Subscriptions', 'You'] },
    x: { head: '<strong>Post</strong>', rail: ['hero-message', 'repeat', 'heart', 'bookmark', 'share'], share: 'share', tabs: ['home', 'search', 'people', 'hero-message', 'profile'] },
  };

  function platformView(item) {
    if (item.post) return `<div class="platform-view platform-thread">
      <div class="thread-heading">${glyph('back')}${logo(item)}<b>Reddit</b>${glyph('menu')}</div>
      <div class="thread-post">${capture(item)}<span class="demo-share-anchor"></span></div>
    </div>`;
    if (item.page) return `<div class="platform-view platform-browser">
      ${capture(item)}
      <canvas class="browser-recording" data-footage="${item.id}" width="240" height="507" aria-hidden="true"></canvas>
      <div class="platform-browser-bar">
        <span>${glyph('back')}</span><span>${item.domain}</span><span class="demo-share-anchor">${glyph('menu')}</span>
      </div></div>`;

    const ui = details[item.id];
    return `<div class="platform-view" data-platform="${item.id}">
      <div class="platform-head">${ui.head}</div>
      <div class="platform-media"><canvas data-footage="social" width="270" height="480"></canvas></div>
      <div class="platform-rail">${actions(ui.rail, ui.share)}</div>
      <div class="platform-caption">${item.title}</div>
      ${item.id === 'x' ? '' : `<div class="platform-tabs">${ui.tabs.map((tab, i) => `<span>${glyph(tab)}${ui.labels?.[i] ? `<small>${ui.labels[i]}</small>` : ''}</span>`).join('')}</div>`}
    </div>`;
  }

  const media = [
    ['social', 'streetwear-edit.mp4'],
    ...apps.filter(item => item.recording).map(item => [item.id, item.recording]),
  ].map(([id, filename]) => {
    const video = document.createElement('video');
    video.src = 'assets/hero/' + filename;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    video.className = 'hero-footage';
    video.dataset.footage = id;
    video.setAttribute('aria-hidden', 'true');
    stage.append(video);
    return { id, video, canvases: [], frameRequest: null };
  });
  const contexts = new WeakMap();

  function drawFootage({ video, canvases }) {
    if (video.readyState < 2) return;
    for (const canvas of canvases) {
      if (canvas.closest('.source-card[hidden]')) continue;
      if (!contexts.has(canvas)) contexts.set(canvas, canvas.getContext('2d', { alpha: false }));
      contexts.get(canvas)?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.classList.add('has-frame');
    }
  }

  function listenForFrames(source) {
    const { video } = source;
    if (source.frameRequest !== null || video.paused) return;
    const onFrame = () => {
      source.frameRequest = null;
      if (visible && gather < 1) drawFootage(source);
      listenForFrames(source);
    };
    source.frameRequest = typeof video.requestVideoFrameCallback === 'function'
      ? video.requestVideoFrameCallback(onFrame)
      : requestAnimationFrame(onFrame);
  }

  function refreshCanvases() {
    for (const source of media) {
      source.canvases = stage.querySelectorAll(`canvas[data-footage="${source.id}"]`);
      if (!reduce()) drawFootage(source);
    }
  }

  sourceCards.innerHTML = '<div class="source-track">' + Array.from({length: 3}, () =>
    apps.map((item) => `<div class="source-card">${platformView(item)}</div>`).join('')
  ).join('') + '</div>';
  const track = sourceCards.firstElementChild;
  const cards = [...track.children];
  const stripClock = { step: 0 };
  const phone = find('.demo-phone');
  const island = find('.demo-status i');
  let curve;
  let active = 0;
  let timeline;
  let visible = false;
  let gather = 0;

  const reduce = () => motionPreference.matches || !gs;
  const canPlay = () => !reduce() && gather === 0 && visible && !document.hidden &&
    !document.documentElement.classList.contains('motion-paused');

  function measureStrip() {
    const halfWidth = stage.clientWidth / 2;
    const width = phone.offsetWidth;
    if (!halfWidth || !width) return;
    const gap = halfWidth < 300 ? 4 : 7;
    const radius = halfWidth * (halfWidth < 300 ? 1.2 : .88);
    const phoneBounds = phone.getBoundingClientRect();
    const inset = (island.getBoundingClientRect().bottom - phoneBounds.top) *
      width / phoneBounds.width + width * .024;
    const contentHeight = phone.offsetHeight - 2 * inset;
    const panelWidth = contentHeight * screen.clientWidth / screen.clientHeight;
    const start = Math.asinh((width + gap) / (2 * radius));
    const centerDepth = Math.cosh(start);
    const pitch = (panelWidth + gap) / (radius * centerDepth);
    const limit = Math.min(3.51, (Math.asinh((halfWidth + gap) / radius) - start) / pitch + 1);
    curve = { radius, pitch, start, gap, width: panelWidth, centerDepth, limit };
    track.style.setProperty('--slot-width', `${panelWidth}px`);
    track.style.setProperty('--slot-height', `${contentHeight}px`);
    // Allow for the straight chord between two curved rails at the viewport edge.
    const edgeHeight = Math.hypot(1, halfWidth / radius) * Math.cosh(pitch / 2);
    stage.dataset.carouselHeight = Math.ceil(contentHeight * edgeHeight / centerDepth) + 14;
    drawStrip();
  }

  function drawStrip() {
    if (!curve) return;
    const { radius, pitch, start, gap, width, centerDepth, limit } = curve;
    // The phone occupies a wider center slot in the inset composition.
    const boundary = t => Math.sign(t) * (Math.abs(t) < .5
      ? 2 * Math.abs(t) * start : start + (Math.abs(t) - .5) * pitch);
    const middle = apps.length + stripClock.step % apps.length;
    const travel = 1 - (1 - gather) ** 2;
    const remaining = 1 - travel;
    const targetScale = .12 * travel;
    cards.forEach((card, index) => {
      let offset = index - middle;
      offset -= cards.length * Math.round(offset / cards.length);
      const distance = Math.abs(offset);
      card.hidden = distance >= limit || distance < .0001;
      if (card.hidden) return;

      const left = radius * Math.sinh(boundary(offset - .5)) + gap / 2;
      const right = radius * Math.sinh(boundary(offset + .5)) - gap / 2;
      const leftDepth = centerDepth / Math.hypot(1, left / radius);
      const rightDepth = centerDepth / Math.hypot(1, right / radius);

      // A single projective transform maps the full screen to its four rail corners.
      // The same boundaries drive both neighbours throughout the swipe.
      const leftX = left * leftDepth;
      const rightX = right * rightDepth;
      const scaleX = (rightX - leftX) / width;
      const perspectiveX = (rightDepth - leftDepth) / width;
      const translateX = (leftX + rightX) / 2;
      const depth = (leftDepth + rightDepth) / 2;
      // Interpolate projected dimensions so every panel lands at the phone's center.
      card.style.opacity = 1 - Math.max(0, (gather - .72) / .28);
      card.style.transform = `matrix3d(${scaleX * remaining + targetScale * depth},0,0,${perspectiveX * remaining},0,${remaining + targetScale * depth},0,0,0,0,1,0,${translateX * remaining},${-distance * 3 * travel * remaining},0,${depth})`;
    });
  }

  function alignStrip(index) {
    stripClock.step = index;
    drawStrip();
  }

  function syncPlayback() {
    const paused = !canPlay();
    timeline?.paused(paused);
    for (const source of media) {
      const { id, video, frameRequest } = source;
      const shouldPlay = id === 'social' ? !paused : !reduce();
      if (shouldPlay) {
        video.play().then(() => {
          if (id === 'social' ? canPlay() : !reduce()) listenForFrames(source);
          else video.pause();
        }).catch(() => {});
      } else {
        video.pause();
        if (frameRequest === null) continue;
        if (typeof video.cancelVideoFrameCallback === 'function') video.cancelVideoFrameCallback(frameRequest);
        else cancelAnimationFrame(frameRequest);
        source.frameRequest = null;
      }
    }
  }

  function renderApp(index) {
    const item = apps[index];
    active = index;
    stage.dataset.app = item.id;
    screen.dataset.theme = item.theme;
    app.innerHTML = platformView(item);
    refreshCanvases();
    sheet.innerHTML = `
      <div class="activity-preview">${capture(item)}<div><b>${item.title}</b><small>${item.domain}</small></div></div>
      <span class="sheet-linq"></span>`;
    saved.innerHTML = `${linq}<div><strong>Saved to LinQ</strong><span>${item.name} · ${item.title}</span></div>${icon('check')}`;
    setPhase('post', 'Previewing ' + item.name);
  }

  function setPhase(phase, label) {
    stage.dataset.phase = phase;
  }

  function resetScene() {
    timeline?.kill();
    if (!gs) return;
    gs.set([app, shade, sheet, saved, cursor, ripple, switcher, find('.demo-browser-menu')], { clearProps: 'all' });
  }

  function position(getTarget) {
    const target = getTarget().getBoundingClientRect();
    const bounds = screen.getBoundingClientRect();
    return { x: target.left + target.width / 2 - bounds.left - 3, y: target.top + target.height / 2 - bounds.top - 2 };
  }

  function moveCursor(tl, target, time, duration = .48) {
    tl.to(cursor, {
      x: () => position(target).x,
      y: () => position(target).y,
      duration,
      ease: 'power2.inOut',
    }, time);
  }

  function tap(tl, target, time) {
    tl.set(ripple, {
      x: () => position(target).x - ripple.offsetWidth / 2 + 3,
      y: () => position(target).y - ripple.offsetHeight / 2 + 2,
      opacity: 1,
      scale: .42,
    }, time)
      .to(ripple, { scale: 1.45, opacity: 0, duration: .33 }, time)
      .to(cursor, { scale: .81, duration: .08, yoyo: true, repeat: 1 }, time);
  }

  function cycle(index, continueCursor = false) {
    const cursorPosition = continueCursor ? { x: gs.getProperty(cursor, 'x'), y: gs.getProperty(cursor, 'y') } : null;
    resetScene();
    if (!continueCursor) renderApp(index);
    if (reduce()) return;

    const item = apps[index];
    const next = (index + 1) % apps.length;
    switcher.innerHTML = `<div class="switcher-rail">${[item, apps[next]].map((entry) =>
      `<div class="switcher-card"><span class="switcher-label">${logo(entry)}${entry.name}</span>${platformView(entry)}</div>`).join('')}</div>`;
    refreshCanvases();
    const [currentPreview, nextPreview] = switcher.firstElementChild.children;
    const share = () => app.querySelector('.demo-share-anchor');
    const target = () => sheet.querySelector('.sheet-linq');
    const tl = gs.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    timeline = tl;
    if (cursorPosition) {
      gs.set(cursor, { ...cursorPosition, opacity: 1 });
    } else {
      tl.set(cursor, { x: () => screen.clientWidth * .77, y: () => screen.clientHeight * .62, opacity: 0 }, 1.19)
        .to(cursor, { opacity: 1, duration: .15 }, 1.31);
    }
    const shareTap = 1.72;
    moveCursor(tl, share, shareTap - .35, .35);
    tap(tl, share, shareTap);
    if (item.page) {
      const menu = find('.demo-browser-menu');
      const shareWebsite = () => menu.firstElementChild;
      tl.fromTo(menu, { autoAlpha: 0, y: 9 }, { autoAlpha: 1, y: 0, duration: .19 }, shareTap + .09);
      moveCursor(tl, shareWebsite, shareTap + .33, .23);
      tap(tl, shareWebsite, shareTap + .59);
      tl.to(menu, { autoAlpha: 0, duration: .12 }, shareTap + .66);
    }
    const sheetTime = shareTap + (item.page ? .74 : .1);
    const confirmAt = sheetTime + 1.32;
    const leaveAt = confirmAt + .94;
    const minimizeAt = leaveAt + .42;
    const swipeAt = minimizeAt + .63;
    const expandAt = swipeAt + .85;
    tl.call(() => setPhase('share', 'Share menu · ' + item.name), null, sheetTime)
      .to(shade, { opacity: 1, duration: .25 }, sheetTime)
      .to(sheet, { yPercent: 0, y: 0, duration: .34 }, sheetTime);
    moveCursor(tl, target, sheetTime + .39, .41);
    tap(tl, target, sheetTime + .82);
    tl.call(() => target().classList.add('is-selected'), null, sheetTime + .82)
      .to(sheet, { yPercent: 105, duration: .33, ease: 'power2.inOut' }, sheetTime + 1.02)
      .to(shade, { opacity: 0, duration: .26 }, sheetTime + 1.09)
      .fromTo(saved, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: .32 }, confirmAt)
      .call(() => setPhase('saved', 'Saved from ' + item.name), null, confirmAt + .16)
      .to(saved, { opacity: 0, y: -7, duration: .23 }, leaveAt);

    moveCursor(tl, () => homeBar, leaveAt, .38);
    tl.to(cursor, { y: () => screen.clientHeight * .61, duration: .47, ease: 'power3.inOut' }, minimizeAt)
      .call(() => {
        setPhase('switch', 'Switching to ' + apps[next].name);
      }, null, minimizeAt)
      .set(nextPreview, { x: () => screen.clientWidth * .11, opacity: 0, scale: .94 }, minimizeAt)
      .to(app, { scale: .68, borderRadius: () => screen.clientWidth * .088, duration: .48, ease: 'power3.inOut' }, minimizeAt)
      .fromTo(switcher, { opacity: 0, visibility: 'hidden' }, { opacity: 1, visibility: 'visible', duration: .23 }, minimizeAt + .39)
      .to(app, { opacity: 0, duration: .23 }, minimizeAt + .39);
    const swipeDuration = .48;
    tl.to(cursor, { x: () => screen.clientWidth * .43, duration: swipeDuration, ease: 'power2.inOut' }, swipeAt)
      .to(currentPreview, { x: () => -screen.clientWidth * .11, opacity: 0, scale: .94, duration: swipeDuration, ease: 'power2.inOut' }, swipeAt)
      .to(nextPreview, { x: 0, opacity: 1, scale: 1, duration: swipeDuration, ease: 'power2.inOut' }, swipeAt)
      .to(stripClock, { step: index + 1, duration: swipeDuration, ease: 'power2.inOut', onUpdate: drawStrip }, swipeAt);
    const nextCard = () => nextPreview;
    moveCursor(tl, nextCard, expandAt - .31, .22);
    tap(tl, nextCard, expandAt - .07);
    tl.call(() => {
      renderApp(next);
      gs.set(app, { opacity: 1, scale: .68, borderRadius: screen.clientWidth * .088 });
    }, null, expandAt)
      .to(switcher, { opacity: 0, duration: .34 }, expandAt)
      .to(app, { scale: 1, yPercent: 0, borderRadius: 0, duration: .55, ease: 'power3.inOut' }, expandAt)
      .call(() => {
        alignStrip(next);
        cycle(next, true);
      }, null, expandAt + .56);
    syncPlayback();
  }

  new ResizeObserver(measureStrip).observe(stage);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  }, { threshold: .15 }).observe(stage);
  new MutationObserver(syncPlayback).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class'],
  });
  motionPreference.addEventListener('change', () => {
    if (reduce()) stage.querySelectorAll('canvas.has-frame').forEach(canvas => canvas.classList.remove('has-frame'));
    alignStrip(active);
    cycle(active);
    if (reduce()) syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  measureStrip();
  cycle(0);
  return progress => {
    if (gather === progress) return;
    const playbackChanged = (gather === 0) !== (progress === 0);
    gather = progress;
    stage.toggleAttribute('data-gathering', gather > 0 && gather < 1);
    drawStrip();
    if (playbackChanged) syncPlayback();
  };
}

const setDemoGather = initializeDemo(document.querySelector('.share-stage'));
