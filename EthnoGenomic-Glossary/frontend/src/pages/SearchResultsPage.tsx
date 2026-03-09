import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import TermCard from "../components/TermCard";
import { fetchSuggestions, fetchTerms } from "../services/api";
import { Term } from "../types/term";
import { pushSearchHistory, readSearchHistory } from "../utils/searchHistory";

type Props = {
  language: "ru" | "en";
};

export default function SearchResultsPage({ language }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState<string>(() => searchParams.get("q") || "");
  const [terms, setTerms] = useState<Term[]>([]);
  const [sortBy, setSortBy] = useState<"default" | "ru" | "en">("default");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [correction, setCorrection] = useState<{ suggestion: string | null; used: boolean }>({ suggestion: null, used: false });
  const [history, setHistory] = useState<string[]>(() => readSearchHistory());
  const [hasSearched, setHasSearched] = useState(false);
  const [appliedQuery, setAppliedQuery] = useState<string>(() => searchParams.get("q") || "");
  const syncedQueryRef = useRef<string>(searchParams.get("q") || "");

  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    if (urlQuery !== syncedQueryRef.current) {
      syncedQueryRef.current = urlQuery;
      setQuery(urlQuery);
      setAppliedQuery(urlQuery);
      setHasSearched(false);
      setTerms([]);
      setCorrection({ suggestion: null, used: false });
    }
  }, [searchParams]);

  const updateHistory = (term: string, existingTerms: Term[], suggs: string[]) => {
    if (!term) return;
    const normalized = term.trim();
    const inList =
      existingTerms.some(
        (t) =>
          (t.term_ru && t.term_ru.toLowerCase() === normalized.toLowerCase()) ||
          (t.term_en && t.term_en.toLowerCase() === normalized.toLowerCase())
      ) || suggs.some((s) => s.toLowerCase() === normalized.toLowerCase());
    if (!inList) return;
    setHistory((prev) => pushSearchHistory(normalized, prev));
  };

  const fetchData = async (raw?: string) => {
    const q = (raw ?? query).trim();
    syncedQueryRef.current = q;
    setHasSearched(true);
    setAppliedQuery(q);
    setPage(1);
    setSearchParams(q ? { q } : {});

    if (!q) {
      setTerms([]);
      setCorrection({ suggestion: null, used: false });
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setCorrection({ suggestion: null, used: false });
    try {
      const data = await fetchTerms(q);
      setTerms(data.results || []);
      setCorrection({
        suggestion: data.corrected_query || null,
        used: Boolean(data.used_correction),
      });
      const applied = data.used_correction && data.corrected_query ? data.corrected_query : q;
      if (applied && data.results.length) {
        updateHistory(applied, data.results, suggestions);
      }
    } catch (err) {
      console.warn("Failed to load terms", err);
      setError(language === "ru" ? "Не удалось загрузить данные. Проверьте API." : "Failed to load data. Check API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        const suggs = await fetchSuggestions(query || undefined, 10);
        setSuggestions(suggs);
      } catch (err) {
        console.warn("Failed to load suggestions", err);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  const filteredTerms = useMemo(() => {
    const base = terms;
    if (sortBy === "ru") return [...base].sort((a, b) => (a.term_ru || "").localeCompare(b.term_ru || ""));
    if (sortBy === "en") return [...base].sort((a, b) => (a.term_en || "").localeCompare(b.term_en || ""));
    return base;
  }, [terms, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredTerms.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedTerms = filteredTerms.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const highlightQuery = correction.used && correction.suggestion ? correction.suggestion : appliedQuery;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card" style={{ background: "linear-gradient(120deg, #eef2ff 0%, #fdfbff 100%)" }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>{language === "ru" ? "Результаты поиска" : "Search results"}</h2>
        <p style={{ marginTop: 0, color: "#334155" }}>
          {language === "ru"
            ? "Введите термин на русском или английском, чтобы посмотреть определения и открыть карточку."
            : "Enter a Russian or English term to view definitions and open the term card."}
        </p>
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 280px", minWidth: 0 }}>
              <SearchBar
                value={query}
                onChange={(val) => setQuery(val)}
                onSubmit={(q) => fetchData(q)}
                onSelectSuggestion={(val) => updateHistory(val, terms, suggestions)}
                suggestions={suggestions}
                history={history}
                language={language}
              />
            </div>
            <button
              onClick={() => fetchData(query)}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #1b3672",
                background: "#1b3672",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                minWidth: 120,
              }}
            >
              {language === "ru" ? "Поиск" : "Search"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#4b5563" }}>{language === "ru" ? "Сортировка" : "Sort"}</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={{ padding: "6px 8px", borderRadius: 10 }}>
                <option value="default">{language === "ru" ? "По релевантности" : "Relevance"}</option>
                <option value="ru">{language === "ru" ? "А-Я (RU)" : "A-Z (RU)"}</option>
                <option value="en">{language === "ru" ? "A-Z (EN)" : "A-Z (EN)"}</option>
              </select>
            </label>
            <div style={{ color: "#4b5563" }}>
              {language === "ru" ? "Подсказки и история показывают только реальные термины." : "Suggestions and history show only real terms."}
            </div>
          </div>
        </div>
      </div>

      {hasSearched && correction.suggestion && (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ color: "#1f2937" }}>
            {correction.used
              ? language === "ru"
                ? `Запрос исправлен на «${correction.suggestion}» автоматически.`
                : `Query auto-corrected to “${correction.suggestion}”.`
              : language === "ru"
              ? `Возможно, вы имели в виду «${correction.suggestion}».`
              : `Did you mean “${correction.suggestion}”?`}
          </div>
          {!correction.used && (
            <button
              onClick={() => fetchData(correction.suggestion!)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #1b3672",
                background: "#1b3672",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {language === "ru" ? "Поиск по предложению" : "Search suggestion"}
            </button>
          )}
        </div>
      )}

      {hasSearched && error && <div className="card" style={{ color: "#b91c1c" }}>{error}</div>}
      {hasSearched && loading && <div className="card">{language === "ru" ? "Загрузка..." : "Loading..."}</div>}
      {!hasSearched && <div className="card">{language === "ru" ? "Введите запрос и нажмите «Поиск», чтобы увидеть результаты." : "Enter a query and press Search to see results."}</div>}
      {hasSearched && !loading && !appliedQuery && <div className="card">{language === "ru" ? "Введите запрос для поиска." : "Please enter a search query."}</div>}
      {hasSearched && !loading && appliedQuery && !terms.length && <div className="card">{language === "ru" ? "Ничего не найдено." : "Nothing found."}</div>}
      {hasSearched && !loading && pagedTerms.map((term) => <TermCard key={term.id} term={term} query={highlightQuery} language={language} />)}
      {hasSearched && !loading && totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: p === currentPage ? "#1b3672" : "#f8fafc",
                color: p === currentPage ? "#fff" : "#1f2937",
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
