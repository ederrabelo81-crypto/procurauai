import type { QueryCache } from "@tanstack/react-query";

export function attachQueryLogger(queryCache: QueryCache) {
  queryCache.subscribe((event) => {
    // React Query v5 uses different event types
    if (event?.type === "updated") {
      // Hook into logger/monitoring pipeline here.
      // Example: console.log("Query updated:", event.query.queryKey);
    }
  });
}
