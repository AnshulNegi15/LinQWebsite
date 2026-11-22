{
  const root = document.documentElement;
  const story = document.querySelector('.showcase-story');
  const pin = story.querySelector('.story-pin');
  const stage = story.querySelector('.share-stage');
  const paintInk = createStoryInk(story.querySelector('.story-ink'));
  const phone = story.querySelector('.demo-phone');
  const welcome = story.querySelector('.feature-welcome');
  const welcomeHold = story.querySelector('.welcome-hold');
  const welcomeCover = story.querySelector('.welcome-reveal');
  const welcomeRays = story.querySelector('.welcome-tap-rays');
  const cursor = story.querySelector('.feature-cursor');
  const ripple = story.querySelector('.feature-tap');
  const searchEmpty = story.querySelector('.search-empty');
  const searchResults = story.querySelector('.tour-search-results');
  const searchResultImage = searchResults.firstElementChild;
  const query = story.querySelector('.search-query');
  const nav = story.querySelector('.chapter-nav');
  const playback = story.querySelector('.feature-playback');
  const progressBar = playback.querySelector('progress');
  const soundButton = playback.querySelector('.welcome-sound');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px) and (max-aspect-ratio: 5/4)');
  const timings = [
    { duration: 360 },
    { duration: 1230, tap: 710, target: [.89, .158], origin: [.70, .32] },
    { duration: 1230, tap: 710, target: [.426, .943], origin: [.63, .76] },
    { duration: 2500, tap: 710, target: [.90, .939], origin: [.72, .78] },
  ];
  const anchors = story.querySelectorAll('.chapter-anchor');
  const chapters = Array.from(story.querySelectorAll('.feature-panel'), (panel, index) => ({
    ...timings[index],
    panel,
    title: panel.querySelector('.chapter-title'),
    copy: [
      ...Array.from(panel.querySelector('.chapter-title').children, (node, i) => ({node, side:-1, delay:i*72})),
      ...Array.from(panel.querySelector('.chapter-detail').children, (node, i) => ({node, side:1, delay:140+i*76})),
    ],
    screen: story.querySelector('[data-screen="' + panel.dataset.chapter + '"]'),
    link: nav.children[index],
    anchor: anchors[index],
  }));
  const searchChapter = chapters.length - 1;
  const copySettleTime = 1660;
  const searchText = 'Game';
  const welcomeTap = { tap: 6420, origin: [.62, .75], target: [.145, .89] };
  const swipeStart = 6480;
  const swipeEnd = 6910;
  const coverEnd = swipeEnd + 700;
  const welcomeEnd = coverEnd + 230;
  let pending = 0;
  let currentChapter = -2;
  let outgoingCopy = -1;
  let chapterStarted = 0;
  let inkProgress = 0;
  let inkUpdatedAt = 0;
  let transition = null;
  let saveHandoffDirection = 0;
  let sound;
  let clickPlayed = false;

  const motionIsOff = () => reduce.matches || root.classList.contains('motion-paused');
  const fraction = (value, low, high) => Math.max(0, Math.min(1, (value-low)/(high-low)));

  function ease(value, low, high) {
    const t = fraction(value, low, high);
    return t*t*(3-2*t);
  }

  function chapterAt(travel) {
    const entry = anchors[0].offsetTop;
    if (travel < entry-2) return -1;
    const step = anchors[1].offsetTop-entry;
    return Math.min(searchChapter, Math.max(0, Math.round((travel-entry)/step)));
  }

  function animateTap(chapter, elapsed, playing) {
    if (!playing || !chapter?.tap) {
      cursor.style.opacity = ripple.style.opacity = 0;
      return;
    }
    const { tap, target, origin } = chapter;
    const travel = ease(elapsed, tap-300, tap);
    const x = origin[0] + (target[0]-origin[0])*travel;
    const y = origin[1] + (target[1]-origin[1])*travel - .045*Math.sin(Math.PI*travel);
    const press = ease(elapsed,tap-50,tap) * (1-ease(elapsed,tap,tap+85));
    const echo = ease(elapsed,tap,tap+330);
    cursor.style.left = x*100 + '%';
    cursor.style.top = y*100 + '%';
    cursor.style.scale = 1-.2*press;
    cursor.style.opacity = ease(elapsed,tap-350,tap-235) * (1-ease(elapsed,tap+60,tap+160));
    ripple.style.left = target[0]*100 + '%';
    ripple.style.top = target[1]*100 + '%';
    ripple.style.scale = .42+1.28*echo;
    ripple.style.opacity = elapsed < tap ? 0 : 1-echo;
  }

  function changeChapter(index, now, previous = currentChapter) {
    outgoingCopy = previous;
    currentChapter = index;
    chapterStarted = now;
    clickPlayed = false;
    const chapter = chapters[index];
    if (chapter) pin.dataset.chapter = chapter.panel.dataset.chapter;
    else delete pin.dataset.chapter;
    nav.inert = index < 0;
    for (const [i, item] of chapters.entries()) {
      item.copyFrame = undefined;
      for (const part of item.copy) part.exitOpacity = Number(part.node.style.opacity || 0);
      item.panel.setAttribute('aria-hidden', String(i !== index));
      if (i === index) item.link.setAttribute('aria-current','step');
      else item.link.removeAttribute('aria-current');
    }
    phone.setAttribute('aria-label',index < 0 ? 'Saving a link from the iPhone share menu' :
      'LinQ in dark mode. ' + chapter.title.querySelector('h2').textContent);
  }

  soundButton.addEventListener('click', async () => {
    if (soundButton.getAttribute('aria-pressed') === 'true') {
      soundButton.setAttribute('aria-pressed','false');
      return;
    }
    try {
      sound ??= new AudioContext();
      await sound.resume();
      soundButton.setAttribute('aria-pressed', String(sound.state === 'running'));
    } catch {
      soundButton.setAttribute('aria-pressed','false');
    }
  });

  function playWelcomeClick(elapsed) {
    if (clickPlayed || elapsed < welcomeTap.tap || elapsed > welcomeTap.tap+240 ||
        document.hidden || sound?.state !== 'running' || soundButton.getAttribute('aria-pressed') !== 'true') return;
    clickPlayed = true;
    const start = sound.currentTime;
    const oscillator = sound.createOscillator();
    const volume = sound.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(920,start);
    oscillator.frequency.exponentialRampToValueAtTime(290,start+.048);
    volume.gain.setValueAtTime(.001,start);
    volume.gain.linearRampToValueAtTime(.085,start+.004);
    volume.gain.exponentialRampToValueAtTime(.001,start+.052);
    oscillator.connect(volume).connect(sound.destination);
    oscillator.start(start);
    oscillator.stop(start+.054);
    oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
  }

  function renderWelcome(opacity, elapsed, playing) {
    const covering = playing && elapsed >= swipeStart && elapsed < welcomeEnd;
    const click = playing && elapsed >= welcomeTap.tap && elapsed < welcomeTap.tap+285;
    welcomeCover.hidden = !covering;
    welcomeRays.hidden = !click;
    if (click) {
      const echo = ease(elapsed,welcomeTap.tap,welcomeTap.tap+285);
      welcomeRays.style.left = welcomeTap.target[0]*100 + '%';
      welcomeRays.style.top = welcomeTap.target[1]*100 + '%';
      welcomeRays.style.scale = .62+.66*echo;
      welcomeRays.style.opacity = 1-echo;
      playWelcomeClick(elapsed);
    }
    const swipe = ease(elapsed,swipeStart,swipeEnd);
    if (covering) {
      const screen = welcome.parentElement;
      const diameter = (54+180*swipe)*screen.clientWidth/393 +
        2*Math.hypot(screen.clientWidth,screen.clientHeight)*ease(elapsed,swipeEnd,coverEnd);
      welcomeCover.style.left = (welcomeTap.target[0]+279/393*swipe)*100 + '%';
      welcomeCover.style.top = welcomeTap.target[1]*100 + '%';
      welcomeCover.style.setProperty('--reveal-size',diameter+'px');
      welcomeCover.style.opacity = 1-ease(elapsed,coverEnd,welcomeEnd);
    }
    if (opacity === 0) {
      welcome.hidden = true;
      return;
    }
    welcome.hidden = false;
    welcome.style.opacity = opacity;
    welcome.style.setProperty('--welcome-time', Math.min(elapsed, 6400));
    welcome.style.setProperty('--welcome-x', welcome.clientWidth / 393);
    welcome.style.setProperty('--welcome-y', welcome.clientHeight / 852);
    welcome.style.setProperty('--welcome-swipe', 279 * swipe + 'px');
    welcome.style.setProperty('--welcome-label', 1 - ease(swipe, .05, .45));
    welcome.style.setProperty('--welcome-press', 1 - .10 * (ease(elapsed,6370,6420) * (1-ease(elapsed,6420,6530))));
    if (playing && elapsed >= swipeStart && elapsed < swipeEnd+115) {
      cursor.style.left = (welcomeTap.target[0]+279/393*swipe)*100 + '%';
      cursor.style.top = welcomeTap.target[1]*100 + '%';
      cursor.style.opacity = 1 - ease(elapsed,swipeEnd-25,swipeEnd+115);
    }
  }

  function renderCopy(item, index, active, elapsed, still) {
    const leaving = !still && currentChapter >= 0 && index === outgoingCopy && elapsed < 420;
    const frame = still ? copySettleTime : Math.min(elapsed, copySettleTime);
    const state = active ? frame : leaving ? -1-frame : null;
    if (item.copyFrame === state) return;
    item.copyFrame = state;
    item.panel.style.opacity = Number(active || leaving);
    if (!active && !leaving) return;

    for (const {node, side, delay, exitOpacity} of item.copy) {
      let opacity;
      let offset;
      if (active) {
        const opening = index === 0 && outgoingCopy < 0;
        const start = (opening ? (side < 0 ? 220 : 350) : outgoingCopy >= 0 ? 420 : 0) + delay;
        const progress = fraction(frame,start,start+890);
        opacity = 1 - (1-progress) ** 2;
        offset = 1-ease(progress,0,1);
      } else {
        const start = side === 1 ? 0 : 38;
        offset = ease(frame,start,start+370);
        opacity = exitOpacity*(1-offset);
      }
      node.style.opacity = opacity;
      node.style.transform = offset ? 'translateX(' + offset*side*(compact.matches ? 15 : 28) + 'px)' : 'none';
      node.style.filter = offset ? 'blur(' + offset*10 + 'px)' : 'none';
    }
  }

  function render(now) {
    pending = 0;
    const still = motionIsOff();
    const bounds = story.getBoundingClientRect();
    const pinHeight = pin.clientHeight;
    const travel = -bounds.top;
    const entry = chapters[0].anchor.offsetTop;
    const lastAnchor = chapters[searchChapter].anchor.offsetTop;
    const pastSearch = travel > lastAnchor+8;
    const index = chapterAt(travel);
    if (index !== currentChapter) changeChapter(index, now);
    const chapter = chapters[index];
    const elapsed = now-chapterStarted;
    const looping = index >= 0 && !still && !pastSearch;
    const duration = index === 0 ? welcomeEnd : chapter?.duration ?? 0;
    const period = duration + (index === 0 ? 2200 : 1700);
    const time = looping ? elapsed % period : duration;
    const playing = looping && index > 0 && time < duration;
    const welcoming = looping && index === 0 && time < welcomeEnd;
    const welcomeReveal = welcoming
      ? (elapsed >= period ? 1-ease(time,0,260) : 0) + ease(time,coverEnd-140,coverEnd)
      : 1;

    const handoff = fraction(travel, 0, entry);
    const gather = still ? Number(index >= 0) : ease(handoff,.20,.73);
    const home = still ? gather : ease(handoff,.73,.96);
    const hold = still ? 0
      : index < 0 && saveHandoffDirection === 1 ? ease(handoff,.72,.92)
      : index === 0 && outgoingCopy < 0 ? 1-ease(elapsed,100,440) : 0;
    welcomeHold.hidden = hold === 0;
    welcomeHold.style.opacity = hold;
    setDemoGather(gather);
    phone.style.setProperty('--handoff-shade', still ? gather : ease(handoff,.66,.77));
    const spread = still ? gather : ease(handoff,.13,.99);
    const timeStep = Math.max(1, Math.min(34, now-inkUpdatedAt));
    inkUpdatedAt = now;
    if (still || index >= 0 || Math.abs(spread-inkProgress) < .001) inkProgress = spread;
    else inkProgress += (spread-inkProgress) * (1-Math.exp(-timeStep/76));
    paintInk(inkProgress, pin.clientWidth, pinHeight);
    pin.toggleAttribute('data-filled', inkProgress === 1);

    // Finish the vertical approach before the shell scales around the viewport center.
    const carouselHeight = phone.offsetHeight;
    const deckHeight = Math.max(carouselHeight, Number(stage.dataset.carouselHeight) || 0);
    const entryOffset = Math.max(0, (pinHeight-deckHeight)/2 - 10);
    const approach = still ? 0 : ease(bounds.top, 0, pinHeight*.52);
    stage.style.setProperty('--carousel-y', -entryOffset*approach + 'px');
    const zoom = still ? home : ease(handoff,.13,.92);
    const targetHeight = compact.matches ? Math.max(pinHeight*.47, pinHeight-320) : Math.min(pinHeight*.80, pinHeight-98);
    const targetWidth = compact.matches ? stage.clientWidth*.76 : 325;
    const restingScale = Math.min(targetHeight/carouselHeight,targetWidth/phone.offsetWidth);
    const scale = 1 + (restingScale-1)*zoom;
    phone.style.scale = scale;
    phone.style.setProperty('--device-scale',scale);
    story.style.setProperty('--tour-device-half', phone.offsetWidth*restingScale/2 + 'px');
    story.style.setProperty('--tour-device-half-height', carouselHeight*restingScale/2 + 'px');

    animateTap(welcoming ? welcomeTap : chapter, time, welcoming || playing);
    renderWelcome(index < 0 && !still && saveHandoffDirection !== 1 ? home : welcoming ? 1-ease(time,coverEnd-110,coverEnd) : 0,
      index < 0 ? 0 : time, welcoming);
    const open = playing ? ease(time,chapter.tap+35,chapter.tap+405) : 1;
    for (const [i, item] of chapters.entries()) {
      const active = i === index;
      const outgoing = playing && i === index-1 && open < 1;
      renderCopy(item, i, active, elapsed, still);
      item.screen.style.zIndex = active ? 17 : 16;
      item.screen.style.opacity = active ? (playing && i === 1 ? Number(open > 0) : open) * welcomeReveal
        : outgoing ? 1 : 0;
      item.screen.style.transform = active && playing ?
        (i === 1 ? 'translateX(' + (1-open)*100 + '%)' : 'translateY(' + (1-open)*3 + '%)') : 'none';
    }

    const searchPlayed = index === searchChapter && playing;
    const typed = searchPlayed ? fraction(time,1285,1815) : 1;
    const result = searchPlayed ? ease(time,1885,2305) : 1;
    const text = searchText.slice(0, Math.floor(typed*searchText.length));
    if (query.textContent !== text) query.textContent = text;
    searchEmpty.style.opacity = 1-ease(typed,0,.72);
    searchResults.style.opacity = result;
    searchResultImage.style.transform = 'translateY(' + (1-result)*3 + '%)';
    query.closest('.feature-search').style.setProperty('--typing-caret', Number(searchPlayed && result < 1));
    nav.inert = index < 0 || pastSearch;
    nav.style.opacity = Number(index >= 0 && !pastSearch);
    playback.hidden = !looping;
    soundButton.hidden = index !== 0 || typeof AudioContext === 'undefined';
    if (looping) progressBar.value = fraction(time, 0, duration);

    const copyEntering = !still && index >= 0 && bounds.bottom > 0 && elapsed < copySettleTime;
    if (inkProgress !== spread || looping || copyEntering) schedule();
  }

  function schedule() {
    if (!pending) pending = requestAnimationFrame(render);
  }


  for (const [index, chapter] of chapters.entries()) {
    chapter.anchor.style.setProperty('--chapter-number', index);
    chapter.link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      cancelTransition();
      if (location.hash !== chapter.link.hash) history.pushState(null, '', chapter.link.hash);
      scrollToChapter(index);
    });
  }

  function scrollStoryTo(offset) {
    window.scrollTo({top:scrollY + story.getBoundingClientRect().top + offset, behavior:'instant'});
    schedule();
  }

  function scrollToChapter(index) {
    scrollStoryTo(anchors[index].offsetTop);
  }

  function cancelTransition(settle = false) {
    const active = transition;
    transition = null;
    saveHandoffDirection = 0;
    if (active) {
      cancelAnimationFrame(active.frame);
      if (settle) active.finish();
    }
  }

  function playTransition(duration, update, finish) {
    if (transition) return;
    if (motionIsOff()) {
      finish();
      return;
    }
    const start = performance.now();
    const step = now => {
      const elapsed = fraction(now-start, 0, duration);
      if (elapsed === 1) {
        cancelTransition(true);
        return;
      }
      update(elapsed);
      transition.frame = requestAnimationFrame(step);
    };
    transition = { frame:requestAnimationFrame(step), finish };
  }

  function playSaveHandoff(forward) {
    const entry = anchors[0].offsetTop;
    const from = fraction(-story.getBoundingClientRect().top,0,entry);
    const to = Number(forward);
    const duration = Math.max(550, 1780 * Math.abs(to-from));
    if (!motionIsOff()) saveHandoffDirection = forward ? 1 : -1;
    playTransition(duration, progress => {
      const amount = from + (to-from)*ease(progress,0,1);
      scrollStoryTo(amount*anchors[0].offsetTop);
    }, () => scrollStoryTo(forward ? anchors[0].offsetTop : 0));
  }

  function scrollDestination(direction, distance) {
    const travel = -story.getBoundingClientRect().top;
    if (travel > anchors[searchChapter].offsetTop+8) return null;
    const chapter = chapterAt(travel);
    if (chapter >= 0) {
      const next = chapter+direction;
      if (next < 0) return 'save';
      return next > searchChapter ? null : next;
    }
    if (direction > 0 && chapter < 0 && travel+distance >= -2) return 'home';
    return null;
  }

  let nativeSwipeUntil = 0;
  let nativeSwipeDirection = 0;

  function moveTo(destination) {
    nativeSwipeUntil = 0;
    if (destination === 'home' || destination === 'save') playSaveHandoff(destination === 'home');
    else scrollToChapter(destination);
  }

  let wheelAt = -Infinity;
  let wheelConsumed = false;
  let wheelTravel = 0;
  let wheelDirection = 0;

  // A trackpad's momentum events belong to the gesture that already advanced the tour.
  addEventListener('wheel', event => {
    if (event.ctrlKey || event.altKey || event.shiftKey || event.defaultPrevented ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const direction = Math.sign(event.deltaY);
    const now = performance.now();
    if (now-wheelAt > 165 || direction !== wheelDirection) {
      wheelConsumed = false;
      wheelTravel = 0;
    }
    wheelAt = now;
    wheelDirection = direction;
    if (transition || wheelConsumed) {
      if (event.cancelable) event.preventDefault();
      wheelConsumed = true;
      return;
    }
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? pin.clientHeight : 1;
    const distance = Math.abs(event.deltaY)*unit;
    const destination = scrollDestination(direction,distance);
    if (destination === null) return;
    if (event.cancelable) event.preventDefault();
    wheelTravel += distance;
    if (typeof destination === 'number' && wheelTravel < 22) return;
    wheelConsumed = true;
    moveTo(destination);
  }, {passive:false});

  let swipe;
  addEventListener('touchstart', event => {
    const point = event.touches[0];
    nativeSwipeUntil = 0;
    swipe = event.touches.length === 1 ? {x:point.clientX,y:point.clientY,lastY:point.clientY,handled:false} : null;
  }, {passive:true});
  addEventListener('touchmove', event => {
    if (!swipe || event.touches.length !== 1) return;
    const point = event.touches[0];
    const deltaY = swipe.y-point.clientY;
    if (Math.abs(deltaY) <= Math.max(10,Math.abs(swipe.x-point.clientX))) return;
    if (transition || swipe.handled) {
      if (event.cancelable) event.preventDefault();
      swipe.handled = true;
      return;
    }
    const direction = Math.sign(swipe.lastY-point.clientY) || Math.sign(deltaY);
    const destination = scrollDestination(direction, Math.abs(swipe.lastY-point.clientY));
    swipe.lastY = point.clientY;
    if (destination === null) {
      nativeSwipeDirection = direction;
      nativeSwipeUntil = performance.now()+950;
      return;
    }
    if (event.cancelable) event.preventDefault();
    swipe.handled = true;
    moveTo(destination);
  }, {passive:false});
  addEventListener('touchend', () => { swipe = null; }, {passive:true});
  addEventListener('touchcancel', () => { swipe = null; }, {passive:true});

  addEventListener('keydown', event => {
    const directions = { ArrowDown:1, PageDown:1, ArrowUp:-1, PageUp:-1 };
    const direction = directions[event.key];
    if (!direction || event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey ||
        event.target.closest?.('input, textarea, select, button, [contenteditable]')) return;
    const distance = event.key.startsWith('Page') ? pin.clientHeight : 40;
    const destination = scrollDestination(direction,distance);
    if (!transition && destination === null) return;
    event.preventDefault();
    if (!transition && !event.repeat) moveTo(destination);
  });

  function syncNavigation() {
    cancelTransition();
    nativeSwipeUntil = 0;
    schedule();
  }
  addEventListener('hashchange', syncNavigation);
  let lastScrollY = scrollY;
  addEventListener('scroll', () => {
    const delta = scrollY-lastScrollY;
    lastScrollY = scrollY;
    schedule();
    if (transition || performance.now() >= nativeSwipeUntil || Math.sign(delta) !== nativeSwipeDirection) return;
    const travel = -story.getBoundingClientRect().top;
    if (delta > 0 && travel >= 0 && travel-delta < 0) moveTo('home');
  }, {passive:true});
  addEventListener('resize',schedule);
  addEventListener('pageshow',schedule);
  addEventListener('popstate',syncNavigation);
  reduce.addEventListener('change', () => {
    cancelTransition(true);
    schedule();
  });
  new ResizeObserver(schedule).observe(story);
  new MutationObserver(schedule).observe(stage, {attributeFilter: ['data-carousel-height']});
  schedule();
}
