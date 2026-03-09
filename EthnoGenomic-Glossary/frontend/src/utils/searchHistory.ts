const HISTORY_KEY = "search_history";
const HISTORY_LIMIT = 5;

const normalize = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
};

export const readSearchHistory = (): string[] => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(HISTORY_KEY);
  if (!saved) return [];
  try {
    return normalize(JSON.parse(saved)).slice(0, HISTORY_LIMIT);
  } catch (err) {
    console.warn("Failed to parse saved search history, resetting", err);
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
};

export const writeSearchHistory = (items: string[]) => {
  if (typeof window === "undefined") return;
  const prepared = normalize(items).slice(0, HISTORY_LIMIT);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(prepared));
};

export const pushSearchHistory = (value: string, current: string[]): string[] => {
  const normalized = value.trim();
  if (!normalized) return current;
  const next = [normalized, ...current.filter((h) => h.toLowerCase() !== normalized.toLowerCase())].slice(0, HISTORY_LIMIT);
  writeSearchHistory(next);
  return next;
};
