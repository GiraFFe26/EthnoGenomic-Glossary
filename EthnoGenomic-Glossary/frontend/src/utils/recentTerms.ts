export type RecentTermEntry = {
  id: number;
  term_ru?: string | null;
  term_en?: string | null;
  abbreviation?: string | null;
};

const STORAGE_KEY = "recent_terms";
const LIMIT = 6;

const safeParse = (raw: string | null): RecentTermEntry[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "number");
  } catch (err) {
    console.warn("Failed to parse recent terms", err);
    return [];
  }
};

export const getRecentTerms = (): RecentTermEntry[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return safeParse(raw);
};

export const addRecentTerm = (term: RecentTermEntry): RecentTermEntry[] => {
  if (typeof window === "undefined") return [];
  const existing = getRecentTerms().filter((t) => t.id !== term.id);
  const next = [term, ...existing].slice(0, LIMIT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};
