import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RelatedTerms from "../components/RelatedTerms";
import RecentTerms from "../components/RecentTerms";
import { fetchTerm } from "../services/api";
import { Term } from "../types/term";
import { addRecentTerm, getRecentTerms, RecentTermEntry } from "../utils/recentTerms";

type Props = {
  language: "ru" | "en";
};

export default function TermPage({ language }: Props) {
  const { id } = useParams();
  const [term, setTerm] = useState<Term | null>(null);
  const [recent, setRecent] = useState<RecentTermEntry[]>(() => getRecentTerms());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await fetchTerm(id);
        setTerm(data);
        const updated = addRecentTerm({
          id: data.id,
          term_ru: data.term_ru,
          term_en: data.term_en,
          abbreviation: data.abbreviation,
        });
        setRecent(updated);
        setError(null);
      } catch (err) {
        console.warn("Failed to load term", err);
        setError(language === "ru" ? "Не удалось загрузить термин. Проверьте API." : "Failed to load term. Check the API.");
      }
    };
    load();
  }, [id, language]);

  if (error) return <div className="card">{error}</div>;
  if (!term) return <div className="card">{language === "ru" ? "Загрузка..." : "Loading..."}</div>;

  const primary = language === "ru" ? term.term_ru || term.term_en : term.term_en || term.term_ru;
  const secondary = language === "ru" ? term.term_en || term.term_ru : null;

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{primary}</div>
            {secondary && <div style={{ color: "#4b5563" }}>{secondary}</div>}
          </div>
          {term.abbreviation && <span className="chip">{term.abbreviation}</span>}
        </div>
        {language === "ru" ? (
          <>
            {term.definition && <p style={{ color: "#111827" }}>{term.definition}</p>}
            {term.context && (
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 12, color: "#1f2937" }}>
                <strong>Контекст: </strong>
                {term.context}
              </div>
            )}
          </>
        ) : (
          <>
            {(term.definition_en || term.definition) && <p style={{ color: "#111827" }}>{term.definition_en || term.definition}</p>}
            {(term.context_en || term.context) && (
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 12, color: "#1f2937" }}>
                <strong>Context: </strong>
                {term.context_en || term.context}
              </div>
            )}
          </>
        )}
      </div>

      <RecentTerms language={language} items={recent} refreshKey={id} />

      {id && <RelatedTerms termId={parseInt(id, 10)} language={language} term={term} />}
    </div>
  );
}
