import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentTerms, RecentTermEntry } from "../utils/recentTerms";

type Props = {
  language: "ru" | "en";
  items?: RecentTermEntry[];
  refreshKey?: string | number;
};

export default function RecentTerms({ language, items, refreshKey }: Props) {
  const navigate = useNavigate();
  const [list, setList] = useState<RecentTermEntry[]>(() => items ?? getRecentTerms());

  useEffect(() => {
    if (items) {
      setList(items);
    } else {
      setList(getRecentTerms());
    }
  }, [items, refreshKey]);

  if (!list.length) return null;

  const title = language === "ru" ? "Недавно просмотренные" : "Recently viewed";
  const subtitle =
    language === "ru"
      ? "Последние открытые карточки сохраняются локально, чтобы быстро вернуться."
      : "Last opened cards are stored locally so you can jump back quickly.";

  return (
    <div className="card" style={{ display: "grid", gap: 10 }}>
      <div>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ color: "#4b5563", marginTop: 4 }}>{subtitle}</div>
      </div>
      <div className="chips" style={{ gap: 8, flexWrap: "wrap" }}>
        {list.map((term) => {
          const label = language === "ru" ? term.term_ru || term.term_en : term.term_en || term.term_ru;
          return (
            <button
              key={term.id}
              onClick={() => navigate(`/term/${term.id}`)}
              className="chip"
              style={{ cursor: "pointer", border: "1px solid #cbd5e1", background: "#f8fafc" }}
            >
              <span style={{ fontWeight: 600 }}>{label}</span>
              {term.abbreviation && <span style={{ color: "#475569", marginLeft: 6 }}>({term.abbreviation})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
