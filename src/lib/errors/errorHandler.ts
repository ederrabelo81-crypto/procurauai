import { logger } from "@/lib/logging/logger";
import { AppError } from "./appError";
import { SupabaseRequestError } from "./supabaseErrors";

type SupabaseErrorLike = {
  message?: string;
  status?: number;
  code?: string;
};

const isSupabaseError = (error: unknown): error is SupabaseErrorLike => {
  return typeof error === "object" && error !== null && "message" in error;
};

export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;
  if (isSupabaseError(error)) {
    const status = typeof error.status === "number" ? error.status : undefined;
    const retryable = status === 429 || (status !== undefined && status >= 500);
    return new SupabaseRequestError(error.message ?? "Supabase request failed", error, retryable);
  }
  if (error instanceof Error) {
    return new AppError({
      code: "UNEXPECTED",
      message: error.message,
      userMessage: "Algo deu errado. Tente novamente.",
      severity: "error",
      retryable: false,
      cause: error,
    });
  }
  return new AppError({
    code: "UNKNOWN",
    message: "Unknown error",
    userMessage: "Algo deu errado. Tente novamente.",
    severity: "error",
    retryable: false,
    cause: error,
  });
};

export const reportError = (error: unknown, context?: Record<string, unknown>) => {
  const normalized = normalizeError(error);
  logger.error(normalized.message, { ...context, code: normalized.code });
  return normalized;
};
