import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Term } from "../types/term";

type Props = {
  term: Term;
  query?: string;
  language: "ru" | "en";
};

const highlight = (text?: string | null, q?: string) => {
  if (!text) return text;
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q})`, "gi"));
  return parts.map((part, idx) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={idx} style={{ background: "#f3e8ff" }}>
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  ) as ReactNode;
};

export default function TermCard({ term, query, language }: Props) {
  const navigate = useNavigate();
  const primary = language === "ru" ? term.term_ru || term.term_en : term.term_en || term.term_ru;
  const secondary = language === "ru" ? term.term_en || term.term_ru : null;

  return (
    <div className="card" onClick={() => navigate(`/term/${term.id}`)} style={{ cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{highlight(primary, query)}</div>
          {secondary && <div style={{ color: "#52617d" }}>{highlight(secondary, query)}</div>}
        </div>
        {term.abbreviation && <div className="chip">{term.abbreviation}</div>}
      </div>

      {language === "ru" ? (
        <>
          {term.definition && <p style={{ marginTop: 12, marginBottom: 8, color: "#111827" }}>{highlight(term.definition, query)}</p>}
          {term.context && <p style={{ marginTop: 0, color: "#4b5563" }}>{highlight(term.context, query)}</p>}
        </>
      ) : (
        <>
          {term.definition_en && <p style={{ marginTop: 12, marginBottom: 8, color: "#111827" }}>{highlight(term.definition_en, query)}</p>}
          {term.context_en && <p style={{ marginTop: 0, color: "#4b5563" }}>{highlight(term.context_en, query)}</p>}
        </>
      )}
    </div>
  );
}
