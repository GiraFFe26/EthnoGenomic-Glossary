import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { fetchSuggestions } from "../services/api";
import { pushSearchHistory, readSearchHistory } from "../utils/searchHistory";

type Props = {
  language: "ru" | "en";
};

export default function HomePage({ language }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>(() => readSearchHistory());

  const recordHistory = (term: string) => {
    setHistory((prev) => pushSearchHistory(term, prev));
  };

  const goToResults = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    navigate(`/search?q=${encodeURIComponent(normalized)}`);
  };

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        const suggs = await fetchSuggestions(query || undefined, 10);
        setSuggestions(suggs);
      } catch (err) {
        console.warn("Failed to load suggestions", err);
      }
    }, 150);

    return () => clearTimeout(handler);
  }, [query]);

  const features = useMemo(() => {
    if (language === "ru") {
      return [
        { title: "Поиск", desc: "Полнотекстовый поиск по RU/EN терминам и определениям." },
        { title: "Связи", desc: "Переходы между связанными понятиями для контекста." },
        { title: "Алфавит", desc: "Быстрый доступ по первым буквам на двух языках." },
      ];
    }
    return [
      { title: "Search", desc: "Full-text search across RU/EN terms and definitions." },
      { title: "Relations", desc: "Navigate between connected concepts for context." },
      { title: "Alphabet", desc: "Quick jump by first letters in both languages." },
    ];
  }, [language]);

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card" style={{ background: "linear-gradient(120deg, #e8edff 0%, #fdfbff 100%)" }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>
          {language === "ru" ? "Двуязычный словарь-навигатор" : "Bilingual EthnoGenomic Glossary"}
        </h1>
        <p style={{ marginTop: 0, color: "#334155", maxWidth: 720 }}>
          {language === "ru"
            ? "Этногеномические термины с определениями, контекстом и связями. Искать можно на русском и английском — результаты доступны на отдельной странице."
            : "Ethnogenomic terms with definitions, context, and relations. Search in Russian or English — results open on a dedicated page."}
        </p>
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={goToResults}
            onSelectSuggestion={(val) => {
              recordHistory(val);
              goToResults(val);
            }}
            suggestions={suggestions}
            history={history}
            language={language}
          />
          <div className="chips">
            <span className="chip">RU/EN поиск</span>
            <span className="chip">Связи терминов</span>
            <span className="chip">Алфавитный указатель</span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => goToResults(query || "")}
              style={{ padding: "12px 18px", borderRadius: 12, border: "1px solid #1b3672", background: "#1b3672", color: "#fff", cursor: "pointer", fontWeight: 700 }}
            >
              {language === "ru" ? "Перейти к результатам" : "Go to results"}
            </button>
            <div style={{ color: "#1f2937", maxWidth: 520 }}>
              {language === "ru"
                ? "Перейдите на страницу результатов, чтобы просмотреть найденные термины и перейти к карточкам."
                : "Open the results page to browse found terms and jump to term cards."}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {features.map((f) => (
          <div key={f.title} className="card">
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
            <div style={{ color: "#4b5563" }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
