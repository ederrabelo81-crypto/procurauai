export function sanitizeInput(value: string) {
  return value.replace(/[<>]/g, "");
}
