import type { QueryCache } from "@tanstack/react-query";

export function attachQueryLogger(queryCache: QueryCache) {
  queryCache.subscribe((event) => {
    if (event?.type === "queryUpdated") {
      // Hook into logger/monitoring pipeline here.
    }
  });
}
