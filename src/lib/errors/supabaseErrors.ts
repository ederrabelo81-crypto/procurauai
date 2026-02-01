import { AppError } from "./appError";

export class SupabaseRequestError extends AppError {
  constructor(message: string, cause?: unknown, retryable = false) {
    super({
      code: "SUPABASE_REQUEST_FAILED",
      message,
      userMessage: "Não foi possível carregar os dados agora.",
      severity: "error",
      retryable,
      cause,
    });
  }
}
