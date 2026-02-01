import { AppError } from "./appError";

export class TimeoutError extends AppError {
  constructor(timeoutMs: number, cause?: unknown) {
    super({
      code: "REQUEST_TIMEOUT",
      message: `Request exceeded ${timeoutMs}ms`,
      userMessage: "A requisição demorou demais. Tente novamente.",
      severity: "warning",
      retryable: true,
      cause,
    });
  }
}
