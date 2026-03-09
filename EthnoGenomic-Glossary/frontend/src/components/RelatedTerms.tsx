import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRelatedTerms, fetchTerm } from "../services/api";
import { Relation, Term } from "../types/term";

type Props = {
  termId: number;
  language: "ru" | "en";
  term?: Term | null;
};

export default function RelatedTerms({ termId, language, term }: Props) {
  const [relations, setRelations] = useState<Relation[]>([]);
  const [termsMap, setTermsMap] = useState<Record<number, Term>>({});
  const [error, setError] = useState<string | null>(null);
  const hasRelations = relations.length > 0;

  useEffect(() => {
    const load = async () => {
      try {
        const rels = await fetchRelatedTerms(termId);
        setRelations(rels);
        const uniqueIds = [...new Set(rels.map((r) => r.related_id))];
        const fetchedEntries = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const data = await fetchTerm(id);
              return [id, data] as const;
            } catch (err) {
              console.warn("Failed to load related term", err);
              return null;
            }
          })
        );
        const fetched: Record<number, Term> = {};
        fetchedEntries.forEach((entry) => {
          if (!entry) return;
          const [id, data] = entry;
          fetched[id] = data;
        });
        setTermsMap(fetched);
        setError(null);
      } catch (err) {
        console.warn("Failed to load related terms", err);
        setError(language === "ru" ? "Не удалось загрузить связанные термины." : "Failed to load related terms.");
        setRelations([]);
        setTermsMap({});
      }
    };
    load();
  }, [termId, language]);

  const labelMapRu: Record<string, string> = {
    paternal: "Отцовская связь",
    maternal: "Материнская связь",
    feature: "Признак",
    cause: "Причина",
    process: "Процесс",
    synonym: "Синоним",
    antonym: "Антоним",
    hyponym: "Гипоним",
    hypernym: "Гипероним",
  };
  const labelMapEn: Record<string, string> = {
    paternal: "paternal link",
    maternal: "maternal link",
    feature: "feature",
    cause: "cause",
    process: "process",
    synonym: "synonym",
    antonym: "antonym",
    hyponym: "hyponym",
    hypernym: "hypernym",
  };

  const label = (val?: string | null) => {
    if (!val) return null;
    const v = val.toLowerCase();
    return language === "ru" ? labelMapRu[v] || v : labelMapEn[v] || v;
  };

  const typeColors: Record<string, string> = {
    synonym: "#1d4ed8",
    antonym: "#dc2626",
    hyponym: "#0f766e",
    hypernym: "#9333ea",
    paternal: "#2563eb",
    maternal: "#ea580c",
    feature: "#16a34a",
    cause: "#7c3aed",
    process: "#0ea5e9",
    other: "#475569",
  };

  const graph = useMemo(() => {
    const nodes: Array<{ id: number; label: string; type: string; x: number; y: number; color: string }> = [];
    const edges: Array<{ from: number; to: number; color: string }> = [];
    const centerLabel =
      language === "ru"
        ? term?.term_ru || term?.term_en || "Термин"
        : term?.term_en || term?.term_ru || "Term";

    nodes.push({ id: termId, label: centerLabel, type: "center", x: 320, y: 180, color: "#111827" });

    const total = relations.length || 1;
    const radius = 140;
    relations.forEach((rel, idx) => {
      const relatedTerm = termsMap[rel.related_id];
      const labelText =
        language === "ru"
          ? relatedTerm?.term_ru || relatedTerm?.term_en || "Термин"
          : relatedTerm?.term_en || relatedTerm?.term_ru || "Term";
      const angle = (2 * Math.PI * idx) / total;
      const x = 320 + radius * Math.cos(angle);
      const y = 180 + radius * Math.sin(angle);
      const typeKey = rel.type?.toLowerCase() || "other";
      const color = typeColors[typeKey] || typeColors.other;
      nodes.push({ id: rel.related_id, label: labelText, type: typeKey, x, y, color });
      edges.push({ from: termId, to: rel.related_id, color });
    });

    return { nodes, edges };
  }, [language, relations, term, termId, termsMap]);

  const grouped = relations.reduce<Record<string, Relation[]>>((acc, rel) => {
    const key = rel.type?.toLowerCase() || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(rel);
    return acc;
  }, {});

  const presentTypes = Array.from(new Set(relations.map((r) => r.type?.toLowerCase() || "other"))).filter((t) => typeColors[t]);

  const groupedEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        {language === "ru" ? "Связанные термины" : "Related terms"}
      </div>
      {error && <div style={{ color: "#b91c1c", marginBottom: 10 }}>{error}</div>}
      {!hasRelations && !error && <div style={{ color: "#475569" }}>{language === "ru" ? "Связи не найдены." : "No related terms."}</div>}
      {graph.nodes.length > 1 && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, marginBottom: 16, background: "#f8fafc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{language === "ru" ? "Граф связей" : "Relation graph"}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {presentTypes.map((t) => (
                  <span key={t} className="chip" style={{ backgroundColor: typeColors[t], color: "#fff" }}>
                    {t === "other" ? (language === "ru" ? "Другое" : "Other") : label(t) || t}
                  </span>
                ))}
              </div>
            </div>
          <svg viewBox="0 0 640 360" width="100%" style={{ height: "auto", maxHeight: 360 }}>
            {graph.edges.map((edge) => {
              const from = graph.nodes.find((n) => n.id === edge.from);
              const to = graph.nodes.find((n) => n.id === edge.to);
              if (!from || !to) return null;
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={edge.color}
                  strokeWidth={2}
                  strokeOpacity={0.7}
                />
              );
            })}
            {graph.nodes.map((n) => (
              <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                <circle r={n.type === "center" ? 16 : 12} fill={n.type === "center" ? "#0f172a" : n.color} opacity={0.9} />
                <text
                  x={0}
                  y={n.type === "center" ? -22 : -18}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize={12}
                  fontWeight={600}
                >
                  {n.label.length > 22 ? `${n.label.slice(0, 22)}…` : n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
      {hasRelations && (
        <div className="grid grid-2" style={{ gap: 16 }}>
          {groupedEntries.map(([type, rels]) => (
            <div key={type} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="chip" style={{ backgroundColor: "#eef2ff", color: "#1e2a52" }}>
                  {type === "other" ? (language === "ru" ? "Другое" : "Other") : label(type) || type}
                </span>
                <span style={{ color: "#6b7280", fontSize: 14 }}>({rels.length})</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rels.map((rel) => (
                  <div key={rel.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Link to={`/term/${rel.related_id}`} style={{ fontWeight: 600 }}>
                      {language === "ru"
                        ? termsMap[rel.related_id]?.term_ru || termsMap[rel.related_id]?.term_en || "Термин"
                        : termsMap[rel.related_id]?.term_en || termsMap[rel.related_id]?.term_ru || "Term"}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
