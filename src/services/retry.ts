export type RetryOptions = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  shouldRetry: (error: unknown) => boolean;
};

export const retry = async <T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> => {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt > options.retries || !options.shouldRetry(error)) {
        throw error;
      }
      const delay = Math.min(options.baseDelayMs * 2 ** (attempt - 1), options.maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
