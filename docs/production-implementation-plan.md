# Production Implementation Plan

## Summary of Changes
- Add a comprehensive implementation plan covering error handling, env configuration, Supabase API enhancements, testing, type safety, security, performance, and code quality standards.

---

## 1) Error Handling Layer

### Goals
- Centralize error classification, logging, and recovery.
- Provide user-safe messages while retaining developer context.
- Add retry logic for transient failures.

### Proposed Files
- `src/lib/errors/baseError.ts`
- `src/lib/errors/httpErrors.ts`
- `src/lib/errors/supabaseErrors.ts`
- `src/lib/errors/errorHandler.ts`
- `src/lib/logging/logger.ts`
- `src/lib/logging/sentry.ts`
- `src/lib/react/ErrorBoundary.tsx`

### Custom Error Classes
```ts
// src/lib/errors/baseError.ts
export type ErrorSeverity = "info" | "warning" | "error" | "fatal";

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
  }: {
    code: string;
    message: string;
    userMessage: string;
    severity?: ErrorSeverity;
    retryable?: boolean;
    cause?: unknown;
  }) {
    super(message);
    this.code = code;
    this.userMessage = userMessage;
    this.severity = severity;
    this.retryable = retryable;
    this.cause = cause;
  }
}
```

```ts
// src/lib/errors/supabaseErrors.ts
import { AppError } from "./baseError";

export class SupabaseUnavailableError extends AppError {
  constructor(cause?: unknown) {
    super({
      code: "SUPABASE_UNAVAILABLE",
      message: "Supabase service unavailable",
      userMessage: "Estamos com instabilidade. Tente novamente em instantes.",
      severity: "error",
      retryable: true,
      cause,
    });
  }
}
```

### Error Handler + Logger Integration
```ts
// src/lib/errors/errorHandler.ts
import { AppError } from "./baseError";
import { logger } from "../logging/logger";

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError({
    code: "UNKNOWN",
    message: "Unexpected error",
    userMessage: "Algo deu errado. Tente novamente.",
    severity: "error",
    retryable: false,
    cause: error,
  });
}

export function reportError(error: unknown, context?: Record<string, unknown>) {
  const normalized = normalizeError(error);
  logger.error(normalized.message, { error: normalized, context });
  return normalized;
}
```

```ts
// src/lib/logging/logger.ts
import { captureException } from "./sentry";

export const logger = {
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(message, meta);
    captureException(new Error(message), meta);
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(message, meta);
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    console.info(message, meta);
  },
};
```

### Error Boundary
```tsx
// src/lib/react/ErrorBoundary.tsx
import React from "react";

export class ErrorBoundary extends React.Component<
  { fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <p>Algo deu errado.</p>;
    }
    return this.props.children;
  }
}
```

### Integration Steps
1. Replace `console.error` calls with `reportError()` from the new handler.
2. Wrap critical route sections with `ErrorBoundary`.
3. Add Sentry DSN to env config and initialize on app bootstrap.
4. Provide a shared error UI component for retryable errors.

### Migration Steps
- Update `src/services/businesses.ts` to throw `AppError` subclasses instead of raw errors.
- Add a `useErrorHandler` hook for consistent UI messaging.

### Testing
- Unit test `normalizeError`, `reportError`, and logger behavior with mocked Sentry.
- Component test `ErrorBoundary` with thrown errors in children.

---

## 2) Environment Configuration

### Goals
- Validate required env vars at startup.
- Provide a typed, environment-aware config object.
- Ship `.env.example` for onboarding.

### Proposed Files
- `src/config/env.ts`
- `.env.example`

### Env Schema (Zod)
```ts
// src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_ENVIRONMENT: z.enum(["development", "staging", "production"]).default("development"),
});

export const env = envSchema.parse(import.meta.env);
```

### .env.example
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SENTRY_DSN=
VITE_ENVIRONMENT=development
```

### Integration Steps
1. Replace raw `import.meta.env.*` usages with `env.*`.
2. Fail fast at startup if required vars are missing.
3. Add `env.ts` exports to the config index.

### Migration Steps
- Update `src/lib/supabaseClient.ts` to use `env.VITE_SUPABASE_URL` and `env.VITE_SUPABASE_ANON_KEY`.

### Testing
- Unit test schema validation for missing or invalid values.

---

## 3) API/Supabase Layer Enhancement

### Goals
- Add request/response interceptors, timeouts, retries, and deduplication.
- Ensure consistent error typing from the service layer.

### Proposed Files
- `src/services/supabaseClient.ts`
- `src/services/httpClient.ts`
- `src/services/retry.ts`
- `src/services/queryKeys.ts`
- `src/services/types.ts`

### Retry + Timeout Utility
```ts
// src/services/retry.ts
export async function retry<T>(fn: () => Promise<T>, options: {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  shouldRetry: (error: unknown) => boolean;
}): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt > options.retries || !options.shouldRetry(error)) {
        throw error;
      }
      const delay = Math.min(
        options.baseDelayMs * 2 ** (attempt - 1),
        options.maxDelayMs
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

### Supabase Wrapper
```ts
// src/services/supabaseClient.ts
import { supabase } from "@/lib/supabaseClient";
import { retry } from "./retry";
import { normalizeError } from "@/lib/errors/errorHandler";

export async function withSupabaseRetry<T>(fn: () => Promise<T>) {
  return retry(fn, {
    retries: 2,
    baseDelayMs: 250,
    maxDelayMs: 2000,
    shouldRetry: (error) => {
      const normalized = normalizeError(error);
      return normalized.retryable;
    },
  });
}
```

### Request Deduplication
```ts
// src/services/queryKeys.ts
export const queryKeys = {
  businessByCategory: (slug: string) => ["businessByCategory", slug] as const,
};
```

### Integration Steps
1. Wrap service calls in `withSupabaseRetry`.
2. Normalize Supabase errors into `AppError` types.
3. Add `queryKeys` for React Query caching and dedupe.
4. Configure `queryClient` defaults (`staleTime`, `gcTime`, `retry` behaviors).

### Migration Steps
- Update `src/services/businesses.ts` to use new wrapper + typed responses.

### Testing
- Unit tests for `retry` behavior and error normalization.
- Integration tests for Supabase services with mocked fetch.

---

## 4) Testing Foundation

### Goals
- Establish basic unit and integration tests for core logic.
- Provide E2E testing setup and CI automation.

### Unit Test Examples (Hooks)
```ts
// src/hooks/__tests__/useFavorites.test.ts
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "../useFavorites";

test("adds favorites", () => {
  const { result } = renderHook(() => useFavorites());
  act(() => result.current.toggleFavorite("biz-1"));
  expect(result.current.favorites).toContain("biz-1");
});
```

```ts
// src/hooks/__tests__/useSearch.test.ts
import { renderHook } from "@testing-library/react";
import { useSearch } from "../useSearch";

test("initial search state", () => {
  const { result } = renderHook(() => useSearch());
  expect(result.current.query).toBe("");
});
```

```ts
// src/hooks/__tests__/useMobileDetection.test.ts
import { renderHook } from "@testing-library/react";
import { useMobileDetection } from "../useMobileDetection";

test("defaults to desktop in tests", () => {
  const { result } = renderHook(() => useMobileDetection());
  expect(result.current.isMobile).toBe(false);
});
```

### Service Tests
```ts
// src/services/__tests__/businesses.test.ts
import { getBusinessesByCategorySlug } from "../businesses";

test("handles empty data", async () => {
  // mock supabase response and assert empty array
  const result = await getBusinessesByCategorySlug("comer-agora");
  expect(result).toEqual([]);
});
```

### Component Tests
```tsx
// src/components/__tests__/ListingCard.test.tsx
import { render, screen } from "@testing-library/react";
import ListingCard from "../ListingCard";

test("renders listing name", () => {
  render(<ListingCard name="Loja X" />);
  expect(screen.getByText("Loja X")).toBeInTheDocument();
});
```

### E2E Setup (Playwright)
```bash
npm i -D @playwright/test
npx playwright install
```

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: { baseURL: "http://localhost:5173" },
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test
```

### Migration Steps
- Add `@testing-library/react`, `@testing-library/jest-dom`.
- Update `vitest.config.ts` to include `setupFiles`.

---

## 5) Type Safety Improvements

### Goals
- Enable strict TS settings.
- Add branded types and discriminated unions.
- Remove `any` from services.

### Proposed Files
- `src/types/ids.ts`
- `src/types/errors.ts`
- `src/types/featureFlags.ts`
- `src/services/types.ts`

### Strict TS Config
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Branded IDs
```ts
// src/types/ids.ts
type Brand<K, T> = K & { __brand: T };
export type BusinessId = Brand<string, "BusinessId">;
```

### Discriminated Unions
```ts
// src/types/featureFlags.ts
export type FeatureFlag =
  | { name: "newSearch"; enabled: boolean }
  | { name: "promotedListings"; enabled: boolean };
```

### Service Response Types
```ts
// src/services/types.ts
import { BusinessId } from "@/types/ids";

export type Business = {
  id: BusinessId;
  name: string;
  category: string | null;
  neighborhood: string | null;
};
```

### Migration Steps
- Incrementally update services and components to use new types.
- Use `ts-expect-error` for temporary escape hatches.

### Testing
- Type tests using `tsd` or `vitest` type assertions.

---

## 6) Security Hardening

### Goals
- Add input validation, CSP guidance, and secure storage practices.

### Input Sanitization Utility
```ts
// src/lib/security/sanitize.ts
export function sanitizeInput(value: string) {
  return value.replace(/[<>]/g, "");
}
```

### CSP + Headers (Server)
```txt
Content-Security-Policy: default-src 'self'; img-src 'self' https: data:; script-src 'self';
X-Frame-Options: DENY
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
```

### Rate Limiting Strategy
- Apply rate limiting at API gateway or Supabase edge functions.
- Use per-IP quotas for read-heavy endpoints.

### Secure Storage
- Avoid storing tokens in localStorage; prefer HttpOnly cookies where possible.

### Migration Steps
- Document header requirements for hosting environment.
- Add a security checklist to PR reviews.

---

## 7) Performance & Monitoring

### Goals
- Track Web Vitals, query timings, and bundle size.

### Web Vitals Setup
```ts
// src/lib/monitoring/webVitals.ts
import { onCLS, onFID, onLCP } from "web-vitals";

export function reportWebVitals(report: (metric: unknown) => void) {
  onCLS(report);
  onFID(report);
  onLCP(report);
}
```

### React Query Monitoring
```ts
// src/lib/monitoring/queryLogger.ts
import type { QueryCache } from "@tanstack/react-query";

export function attachQueryLogger(queryCache: QueryCache) {
  queryCache.subscribe((event) => {
    if (event?.type === "queryUpdated") {
      // send metrics to logger
    }
  });
}
```

### Bundle Analysis
```bash
npm i -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [visualizer({ open: true })],
});
```

### Lazy Loading Strategy
- Use `React.lazy()` for route-level splitting.
- Preload critical routes during idle time.

### Migration Steps
- Introduce `reportWebVitals` in app entry.
- Add `visualizer` to CI artifact uploads.

---

## 8) Code Quality Standards

### Goals
- Align team workflows with consistent linting, hooks, and review checklists.

### ESLint Rules
```js
// eslint.config.js (partial)
export default [
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "react/jsx-no-useless-fragment": "warn",
    },
  },
];
```

### Husky + lint-staged
```bash
npm i -D husky lint-staged
npx husky init
```

```json
// package.json (partial)
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### PR Template
```md
# .github/PULL_REQUEST_TEMPLATE.md
## Summary
- ...

## Testing
- [ ] npm run test

## Screenshots (if UI)
- [ ] Added
```

### Code Review Checklist
- Types are explicit.
- Errors are handled and logged.
- Queries use `queryKeys`.
- No `any` in services.
- Tests added for new logic.

### Naming Conventions
- Components: `PascalCase`.
- Hooks: `use*`.
- Services: `verbNoun` (e.g., `fetchBusinesses`).

### Migration Steps
- Add lint-staged configuration.
- Introduce PR template and checklist in `.github`.

---

## Implementation Roadmap (Suggested Order)
1. Environment config + env validation.
2. Error handling + logging.
3. Supabase service wrappers + retry/dedupe.
4. Type safety updates.
5. Tests and CI.
6. Security and performance enhancements.
7. Code quality tooling.

## Team Documentation Checklist
- Update README with setup steps.
- Add onboarding notes for environment config.
- Document error-handling patterns.
- Add testing guidelines and example scripts.
