import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_GOOGLE_MAPS_API_KEY: z.string().optional(),
  VITE_ENVIRONMENT: z
    .enum(["development", "staging", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(import.meta.env);
