import { useEffect, useMemo, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onSelectSuggestion?: (value: string) => void;
  suggestions?: string[];
  history?: string[];
  language?: "ru" | "en";
};

export default function SearchBar({ value, onChange, onSubmit, onSelectSuggestion, suggestions = [], history = [], language = "ru" }: Props) {
  const [focused, setFocused] = useState(false);

  const highlightMatch = (text: string, query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return text;

    const normalizedText = text.toLowerCase();
    const matchIndex = normalizedText.indexOf(normalizedQuery);
    if (matchIndex === -1) return text;

    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + normalizedQuery.length);
    const after = text.slice(matchIndex + normalizedQuery.length);

    return (
      <span>
        {before}
        <mark style={{ padding: 0, backgroundColor: "#fde68a" }}>{match}</mark>
        {after}
      </span>
    );
  };

  const filteredSuggestions = useMemo(() => {
    const unique = Array.from(new Set(suggestions.filter((s) => s && s.length > 1)));
    if (!value) return [];
    const q = value.trim().toLowerCase();
    const direct = unique.filter((s) => s.toLowerCase().includes(q));
    const fuzzy = unique.filter((s) => !s.toLowerCase().includes(q));
    return [...direct, ...fuzzy].slice(0, 10);
  }, [suggestions, value]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(value);
    }
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFocused(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const handleBlur = () => {
    setTimeout(() => setFocused(false), 100);
  };

  const clickSuggestion = (s: string) => {
    onChange(s);
    onSubmit(s);
    onSelectSuggestion?.(s);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder={language === "ru" ? "Поиск терминов (RU/EN)" : "Search terms (RU/EN)"}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: "14px",
          border: "1px solid #d5def5",
          fontSize: 16,
          boxShadow: "0 8px 18px rgba(23, 48, 97, 0.05)",
        }}
      />
      {focused && (value ? filteredSuggestions.length > 0 : history.length > 0) && (
        <div
          className="card"
          style={{
            position: "absolute",
            width: "100%",
            top: 58,
            zIndex: 2,
            padding: 12,
          }}
        >
          {(value ? filteredSuggestions : history).map((s) => (
            <div key={s} style={{ padding: "8px 6px", cursor: "pointer" }} onMouseDown={() => clickSuggestion(s)}>
              {value ? highlightMatch(s, value) : s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
