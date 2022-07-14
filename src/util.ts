interface DebounceBookkeeping {
  lastRan: number;
  current: number | null;
}

export type Debouncer = (f: () => void) => void;

export function newDebouncer(milliseconds: number) {
  let state: DebounceBookkeeping = { lastRan: 0, current: null };
  return (f: () => void) => debounce(milliseconds, f, state);
}

function debounce(
  milliseconds: number,
  f: () => void,
  history: DebounceBookkeeping
): () => void {
  return () => {
    const now = performance.now();
    if (now - history.lastRan > milliseconds) {
      // act promptly on first input, or input after a long delay
      console.log(
        `now=${now} history.lastRan=${history.lastRan} delta=${
          now - history.lastRan
        } milliseconds=${milliseconds}`
      );
      history.lastRan = now;
      f();
    } else if (history.current === null) {
      // on second input, schedule action for first allowable time
      console.log("deferring");
      setTimeout(() => {
        f();
        history.lastRan = performance.now();
        history.current = null;
      }, milliseconds - (now - history.lastRan));
    } else {
      // until the scheduled action runs, ignore further input
      console.log("skipping");
    }
  };
}
