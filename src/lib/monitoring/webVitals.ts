import { onCLS, onFID, onLCP } from "web-vitals";

export function reportWebVitals(report: (metric: unknown) => void) {
  onCLS(report);
  onFID(report);
  onLCP(report);
}
