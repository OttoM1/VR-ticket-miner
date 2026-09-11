/**
 * Simple sequential rate limiter with configurable delay between tasks.
 * Ensures polite spacing when querying VR across multiple days.
 */
export class RateLimiter {
  private lastRunAt = 0;

  constructor(private readonly delayMs: number) {}

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const elapsed = now - this.lastRunAt;
    const wait = Math.max(0, this.delayMs - elapsed);

    if (wait > 0) {
      await sleep(wait);
    }

    try {
      return await fn();
    } finally {
      this.lastRunAt = Date.now();
    }
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
