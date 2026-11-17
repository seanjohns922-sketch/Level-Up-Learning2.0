/** Combine event bursts without overlapping reads or losing a refresh during a read. */
export function createCoalescedRefresh(
  load: () => Promise<void>,
  onError: (error: unknown) => void,
  minIntervalMs = 2_000,
) {
  let disposed = false;
  let running = false;
  let pending = false;
  let immediate = false;
  let lastStarted = -Infinity;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function schedule() {
    if (disposed || running || timer !== null || !pending) return;
    const delay = immediate ? 0 : Math.max(0, minIntervalMs - (Date.now() - lastStarted));
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
    immediate = false;
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
    // Reserved for connection recovery; ordinary events retain the rate limit.
    request(options?: { immediate?: boolean }) {
      if (disposed) return;
      pending = true;
      if (options?.immediate) {
        immediate = true;
        if (timer !== null) clearTimeout(timer);
        timer = null;
      }
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
