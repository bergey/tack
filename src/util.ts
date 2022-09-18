export function rateLimit<A>(delay: number, f: (a: A) => any) {
  let lastTime: ReturnType<typeof performance.now> = 0;
  let pending: number | null = null;

  function limited(a: A) {
    const now = performance.now();
    const elapsed = now - lastTime;
    if (elapsed >= delay) {
      lastTime = now;
      f();
    } else {
      if (pending !== null) {
        clearTimeout(pending);
      }
      pending = window.setTimeout(f, delay - elapsed, a);
    }
  }

  return limited;
}

export function rateLimitIndexed<Index, A>(
  delay: number, // milliseconds
  ix: (a: A) => Index,
  f: (a: A) => any
) {
  let lastTimes: Map<Index, number> = new Map();
  let pending: Map<Index, number> = new Map();

  function limited(a: A) {
    const now = performance.now();
    const lastT = lastTimes.get(ix(a));
    if (lastT === undefined || now - lastT >= delay) {
      lastTimes.set(ix(a), now);
      f(a);
    } else {
      const p = pending.get(ix(a));
      if (p !== undefined) {
        clearTimeout(p);
      }
      const elapsed = now - lastT;
      pending.set(ix(a), window.setTimeout(f, delay - elapsed, a));
    }
  }

  return limited;
}

export function isoDate(date: date) {
  const mm = date.getMonth().toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}
