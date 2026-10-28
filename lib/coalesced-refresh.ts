/** Combine event bursts without overlapping reads or losing a refresh during a read. */
export function createCoalescedRefresh(
  load: () => Promise<void>,
  onError: (error: unknown) => void,
  minIntervalMs = 2_000,
) {
  let disposed = false;
  let running = false;
  let pending = false;
  let lastStarted = -Infinity;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function schedule() {
    if (disposed || running || timer !== null || !pending) return;
    const delay = Math.max(0, minIntervalMs - (Date.now() - lastStarted));
    if (delay === 0) {
      void run();
    } else {
      timer = setTimeout(() => {
        timer = null;
        void run();
      }, delay);
    }
  }

  async function run() {
    if (disposed) return;
    pending = false;
    running = true;
    lastStarted = Date.now();
    try {
      await load();
    } catch (error) {
      if (!disposed) onError(error);
    } finally {
      running = false;
      schedule();
    }
  }

  return {
    request() {
      if (disposed) return;
      pending = true;
      schedule();
    },
    dispose() {
      disposed = true;
      pending = false;
      if (timer !== null) clearTimeout(timer);
      timer = null;
    },
  };
}
