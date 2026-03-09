import { useEffect, useState } from "react";
import AlphabetIndex from "../components/AlphabetIndex";
import TermCard from "../components/TermCard";
import { fetchAlphabet } from "../services/api";
import { Term } from "../types/term";

type Props = {
  language: "ru" | "en";
};

export default function Alphabet({ language }: Props) {
  const [alphabetLanguage, setAlphabetLanguage] = useState<"ru" | "en">(language);
  const [letter, setLetter] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const t =
    language === "ru"
      ? {
          title: "Алфавитный указатель",
          empty: "Выберите букву, чтобы увидеть термины.",
          langButtons: { ru: "Русский", en: "English" },
        }
      : {
          title: "Alphabet index",
          empty: "Pick a letter to see matching terms.",
          langButtons: { ru: "Русский", en: "English" },
        };

  useEffect(() => {
    setAlphabetLanguage(language);
    setLetter(null);
    setTerms([]);
    setPage(1);
  }, [language]);

  const load = async (ltr: string) => {
    setLetter(ltr);
    const data = await fetchAlphabet(ltr);
    setTerms(data);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(terms.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedTerms = terms.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 700 }}>{t.title}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ code: "ru", label: t.langButtons.ru }, { code: "en", label: t.langButtons.en }].map((option) => (
              <button
                key={option.code}
                onClick={() => {
                  setAlphabetLanguage(option.code as "ru" | "en");
                  setLetter(null);
                  setTerms([]);
                  setPage(1);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: option.code === alphabetLanguage ? "1px solid #1b3672" : "1px solid #d1d5db",
                  background: option.code === alphabetLanguage ? "#eef4ff" : "#fff",
                  color: "#1f2937",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <AlphabetIndex onSelect={load} active={letter || undefined} language={alphabetLanguage} />
      </div>
      {pagedTerms.map((term) => (
        <TermCard key={term.id} term={term} language={language} />
      ))}
      {terms.length === 0 && <div className="card">{t.empty}</div>}
      {terms.length > 0 && totalPages > 1 && (
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
