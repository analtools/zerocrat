const delays = [50, 100, 200, 400, 800, 1600, 3200, 6400, 12800];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = delays.length,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === retries) {
        throw lastError;
      }

      const baseDelay = delays[attempt]!;
      const jitter = baseDelay * (0.5 + Math.random()); // 50–150%
      await sleep(jitter);
    }
  }

  throw lastError;
}
