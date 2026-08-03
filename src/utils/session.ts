const KEY = "backend-warmed";

export function isBackendWarmed(): boolean {
  return sessionStorage.getItem(KEY) === "true";
}

export function markBackendWarmed(): void {
  sessionStorage.setItem(KEY, "true");
}