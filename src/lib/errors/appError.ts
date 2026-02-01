export type ErrorSeverity = "info" | "warning" | "error" | "fatal";

export type AppErrorOptions = {
  code: string;
  message: string;
  userMessage: string;
  severity?: ErrorSeverity;
  retryable?: boolean;
  cause?: unknown;
};

export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly cause?: unknown;
  public readonly retryable: boolean;
  public readonly userMessage: string;

  constructor({
    code,
    message,
    userMessage,
    severity = "error",
    retryable = false,
    cause,
  }: AppErrorOptions) {
    super(message);
    this.code = code;
    this.userMessage = userMessage;
    this.severity = severity;
    this.retryable = retryable;
    this.cause = cause;
  }
}
