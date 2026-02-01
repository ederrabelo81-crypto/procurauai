import { AppError } from "@/lib/errors/appError";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };
