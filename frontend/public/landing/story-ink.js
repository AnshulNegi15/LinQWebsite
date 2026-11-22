function createStoryInk(canvas) {
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  let paintedColor;
  let frame;
  let arrival;
  let earliest;
  let latest;
  let feather;
  let lastStep = -1;

  function prepare(width, height) {
    canvas.width = width;
    canvas.height = height;
    frame = context.createImageData(width, height);
    arrival = new Float32Array(width * height);
    earliest = Infinity;
    latest = -Infinity;
    const shortEdge = Math.min(width, height);
    const halfWidth = width / shortEdge;
    const halfHeight = height / shortEdge;
    feather = 1.25 / shortEdge;

    const buds = [
      [-.40, -.29, .83, 1.18], [.18, -.48, .89, .97],
      [.47, -.19, .81, .97], [.46, .26, .91, 1.19],
      [-.25, .53, .91, 1.05], [-.49, .18, .87, 1.06],
    ].map(([u, v, lead, slope]) => {
      const x = u * halfWidth;
      const y = v * halfHeight;
      return { x, y, start: Math.hypot(x * .92, y * 1.06) * lead - .09, slope };
    });
    const gaps = [
      [.29, -.18, .13, .50], [-.28, .23, .08, .46], [.10, .37, .075, .36],
    ].map(([u, v, radius, delay]) => ({ x: u * halfWidth, y: v * halfHeight, radius, delay }));

    // Both directions share the same thresholds, so the edge preserves its shape when reversed.
    for (let row = 0, pixel = 0; row < height; row++) {
      const y = (2 * row - height + 1) / shortEdge;
      for (let col = 0; col < width; col++, pixel++) {
        const x = (2 * col - width + 1) / shortEdge;
        const bentX = x + .124 * Math.sin(4.4*y + .8) + .065 * Math.sin(9.8*y + 2.7*x);
        const bentY = y + .132 * Math.sin(3.7*x - .5) + .061 * Math.sin(9.1*x - 3.1*y);
        let threshold = Math.hypot(.92*bentX, 1.06*bentY);
        for (const bud of buds) {
          const distance = Math.hypot(bentX - bud.x, bentY - bud.y);
          threshold = Math.min(threshold, bud.start + distance * bud.slope);
        }
        threshold += .034*Math.sin(15*x + 5*y) * Math.sin(13*y - 3*x);
        for (const gap of gaps) {
          const dx = (x - gap.x) / gap.radius;
          const dy = (y - gap.y) / gap.radius;
          threshold += gap.delay * Math.exp(-2.4 * (dx*dx + dy*dy));
        }
        arrival[pixel] = threshold;
        earliest = Math.min(earliest, threshold);
        latest = Math.max(latest, threshold);
      }
    }
    paintedColor = undefined;
  }

  return function paint(progress, viewWidth, viewHeight, fromEdges = false) {
    canvas.hidden = progress <= 0 || progress >= 1 || !viewWidth || !viewHeight;
    if (canvas.hidden) return;
    const scale = Math.min(1, 810 / Math.max(viewWidth, viewHeight));
    const width = Math.round(viewWidth * scale);
    const height = Math.round(viewHeight * scale);
    const color = getComputedStyle(canvas).color;
    if (!frame || canvas.width !== width || canvas.height !== height) prepare(width, height);
    if (paintedColor !== color) {
      const channels = color.match(/\d+/g).slice(0, 3).map(Number);
      for (let offset = 0; offset < frame.data.length; offset += 4) frame.data.set(channels, offset);
      paintedColor = color;
      lastStep = -1;
    }

    const direction = fromEdges ? -1 : 1;
    const step = Math.round((fromEdges ? 1-progress : progress) * 2048);
    if (direction * step === lastStep) return;
    lastStep = direction * step;
    const frontier = earliest - feather + (latest - earliest + 2*feather) * step / 2048;
    for (let pixel = 0, alpha = 3; pixel < arrival.length; pixel++, alpha += 4) {
      frame.data[alpha] = direction * (frontier - arrival[pixel]) * 255 / feather;
    }
    context.putImageData(frame, 0, 0);
  };
}
