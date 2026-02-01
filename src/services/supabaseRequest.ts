import { normalizeError } from "@/lib/errors/errorHandler";
import { retry } from "./retry";
import { withTimeout } from "./timeout";

const DEFAULT_TIMEOUT_MS = 8000;

export type SupabaseRequestOptions = {
  retries?: number;
  timeoutMs?: number;
};

const isRetryableError = (error: unknown) => {
  const normalized = normalizeError(error);
  return normalized.retryable;
};

export const executeSupabase = async <T>(
  operation: () => Promise<T>,
  options: SupabaseRequestOptions = {}
): Promise<T> => {
  const { retries = 2, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  return retry(() => withTimeout(operation(), timeoutMs), {
    retries,
    baseDelayMs: 250,
    maxDelayMs: 2000,
    shouldRetry: isRetryableError,
  });
};
