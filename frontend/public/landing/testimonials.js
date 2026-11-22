const testimonialSection = document.querySelector('#testimonials');
const testimonialMotion = matchMedia('(prefers-reduced-motion: reduce)');
const testimonialRows = [...testimonialSection.querySelectorAll('.testimonial-row')].map((viewport, index) => {
  const track = viewport.firstElementChild;
  const originals = [...track.children];
  function copy(card) {
    const clone = card.cloneNode(true);
    clone.dataset.copy = '';
    clone.setAttribute('aria-hidden', 'true');
    return clone;
  }
  track.prepend(...originals.slice(-2).map(copy));
  track.append(...originals.map(copy), ...originals.slice(0, 2).map(copy));
  return {viewport, track, originals, reverse: index === 1, animation: null, hovered: false, rate: 1, rateFrame: 0};
});

let testimonialsVisible = false;

function updateTestimonialPlayback() {
  for (const row of testimonialRows) {
    if (!row.animation) continue;
    if (testimonialsVisible && !row.viewport.matches(':focus-visible')) row.animation.play();
    else row.animation.pause();
  }
}

function setTestimonialHover(row, hovered) {
  if (hovered === row.hovered) return;
  row.hovered = hovered;
  cancelAnimationFrame(row.rateFrame);
  if (!row.animation) return;
  const from = row.rate;
  const to = hovered ? .24 : 1;
  const start = performance.now();
  function update(now) {
    const progress = Math.min(1, (now - start) / 220);
    row.rate = from + (to - from) * (1 - (1 - progress) ** 2);
    row.animation.updatePlaybackRate(row.rate);
    if (progress < 1) row.rateFrame = requestAnimationFrame(update);
  }
  row.rateFrame = requestAnimationFrame(update);
}

function configureTestimonialRows() {
  const moving = !testimonialMotion.matches;
  for (const row of testimonialRows) {
    cancelAnimationFrame(row.rateFrame);
    const progress = row.animation?.currentTime ?? 0;
    row.animation?.cancel();
    row.animation = null;
    row.viewport.classList.toggle('is-moving', moving);
    if (!moving) continue;
    row.viewport.scrollLeft = 0;
    const step = row.originals[1].offsetLeft - row.originals[0].offsetLeft;
    const count = row.originals.length;
    const start = 'translateX(' + (-2 * step) + 'px)';
    const end = 'translateX(' + (-(2 + count) * step) + 'px)';
    row.animation = row.track.animate(
      row.reverse ? [{transform:end}, {transform:start}] : [{transform:start}, {transform:end}],
      {duration: count * step / 54 * 1000, iterations: Infinity}
    );
    row.animation.pause();
    row.animation.currentTime = progress;
    row.rate = row.hovered ? .24 : 1;
    row.animation.playbackRate = row.rate;
  }
  updateTestimonialPlayback();
}

for (const row of testimonialRows) {
  const {viewport} = row;
  viewport.addEventListener('pointerover', event => {
    if (event.pointerType === 'mouse') setTestimonialHover(row, Boolean(event.target.closest('.testimonial-card')));
  });
  viewport.addEventListener('pointerleave', () => setTestimonialHover(row, false));
  viewport.addEventListener('focus', updateTestimonialPlayback);
  viewport.addEventListener('blur', updateTestimonialPlayback);
}
testimonialMotion.addEventListener('change', configureTestimonialRows);
new IntersectionObserver(([entry]) => {
  testimonialsVisible = entry.isIntersecting;
  updateTestimonialPlayback();
}).observe(testimonialSection);
new ResizeObserver(configureTestimonialRows).observe(testimonialRows[0].viewport);
configureTestimonialRows();
