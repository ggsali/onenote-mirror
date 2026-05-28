import type { AppState } from "./types";
import { createSeedState } from "./seed";

const KEY = "onenote:v2";

export function loadState(): AppState {
  if (typeof window === "undefined") return createSeedState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.notebooks?.length) return createSeedState();
    return parsed;
  } catch {
    return createSeedState();
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;
export function saveStateDebounced(state: AppState, delay = 500) {
  if (typeof window === "undefined") return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  }, delay);
}
