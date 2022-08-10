export function rateLimit(delay: number, f: () => any) {
  let lastTime: ReturnType<typeof performance.now> = 0;
  let pending: number | null = null;

  function limited() {
    const now = performance.now();
    const elapsed = now - lastTime;
    if (elapsed >= delay) {
      lastTime = now;
      f();
    } else {
      if (pending !== null) {
        clearTimeout(pending);
      }
      pending = window.setTimeout(f(), delay - elapsed);
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
      pending.set(ix(a), window.setTimeout(f(a), delay - elapsed));
    }
  }

  return limited;
}
