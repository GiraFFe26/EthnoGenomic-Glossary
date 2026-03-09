type Props = {
  language: "ru" | "en";
};

export default function About({ language }: Props) {
  const t =
    language === "ru"
      ? {
          title: "О проекте",
          intro: "EthnoGenomic Glossary — двуязычный словарь-навигатор терминов этногеномики, объединяющий поиск, определения и связи между понятиями.",
          goal: "Снимаем языковой барьер, даём быстрый доступ к контексту и связям терминов и упрощаем переход между русскими и английскими обозначениями.",
          stackTitle: "Стек и подход к данным",
          stackText: "Фронтенд: React + Vite + TypeScript. Бэкенд: FastAPI + PostgreSQL с полнотекстовым поиском. Всё упаковано в Docker для простого развёртывания.",
          roadmapTitle: "Принципы качественной терминологии",
          roadmapItems: [
            "Единая структура: RU/EN вариант, аббревиатура, определение, контекст.",
            "Направленные связи: синонимы, антонимы, гипонимы/гиперонимы.",
            "Контекст использования: примеры, источники, заметки.",
            "Ролевая модель для редакторов и зрителей.",
            "Удобный импорт/экспорт для пополнения базы.",
          ],
        }
      : {
          title: "About the project",
          intro: "EthnoGenomic Glossary is a bilingual navigator for ethnogenomic terms, combining search, definitions, and cross-term relations.",
          goal: "We aim to remove the language barrier, give quick access to term context and relations, and keep Russian and English entries in sync.",
          stackTitle: "Stack and data approach",
          stackText: "Frontend: React + Vite + TypeScript. Backend: FastAPI + PostgreSQL with full-text search. Everything is containerized with Docker for easy deployment.",
          roadmapTitle: "Terminology quality principles",
          roadmapItems: [
            "Unified structure: RU/EN variant, abbreviation, definition, context.",
            "Directed relations: synonyms, antonyms, hyponyms/hypernyms.",
            "Usage context: examples, sources, notes.",
            "Role model for editors and viewers.",
            "Convenient import/export to enrich the dataset.",
          ],
        };

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{t.title}</h2>
      <p>{t.intro}</p>
      <p style={{ color: "#4b5563" }}>{t.goal}</p>
      <div className="card" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{t.stackTitle}</div>
        <p style={{ margin: 0, color: "#1f2937" }}>{t.stackText}</p>
      </div>
      <div className="card" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{t.roadmapTitle}</div>
        <div style={{ display: "grid", gap: 6, color: "#1f2937" }}>
          {t.roadmapItems.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
