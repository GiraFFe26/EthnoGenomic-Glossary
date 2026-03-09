import { useEffect, useState } from "react";
import {
  downloadTemplateJson,
  downloadTemplateXls,
  fetchAdminTerms,
  login,
  uploadJson,
  uploadXls,
  updateTermAdmin,
  deleteTermAdmin,
} from "../services/api";
import TermCard from "../components/TermCard";
import { Term } from "../types/term";

type Props = {
  language: "ru" | "en";
};

export default function AdminPage({ language }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState<boolean>(!!localStorage.getItem("token"));
  const [terms, setTerms] = useState<Term[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<number, Term>>({});
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const loadTerms = async () => {
    try {
      const data = await fetchAdminTerms();
      setTerms(data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        setLoggedIn(false);
      }
      setMessage(language === "ru" ? "Не удалось загрузить термины (проверьте права)" : "Failed to load terms (check permissions)");
    }
  };

  const startEdit = (t: Term) => {
    setEditing((prev) => ({ ...prev, [t.id]: { ...t } }));
  };

  const changeField = (id: number, field: keyof Term, value: any) => {
    setEditing((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const saveTerm = async (id: number) => {
    const payload = editing[id];
    if (!payload) return;
    await updateTermAdmin(id, payload);
    setMessage(language === "ru" ? "Сохранено" : "Saved");
    setEditing((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    loadTerms();
  };

  const removeTerm = async (id: number) => {
    await deleteTermAdmin(id);
    setMessage(language === "ru" ? "Удалено" : "Deleted");
    loadTerms();
  };

  useEffect(() => {
    if (loggedIn) loadTerms();
  }, [loggedIn]);

  const handleLogin = async () => {
    try {
      await login(email, password);
      setLoggedIn(true);
      setMessage(language === "ru" ? "Успешный вход" : "Logged in");
      loadTerms();
    } catch (err) {
      setMessage(language === "ru" ? "Ошибка входа" : "Login failed");
    }
  };

  const handleUpload = async (file: File, type: "json" | "xls") => {
    try {
      if (type === "json") {
        await uploadJson(file);
      } else {
        await uploadXls(file);
      }
      setMessage(language === "ru" ? "Импорт завершён" : "Import done");
      loadTerms();
    } catch {
      setMessage(language === "ru" ? "Ошибка импорта" : "Import failed");
    }
  };

  const filtered = terms.filter((t) => {
    const text = `${t.term_ru || ""} ${t.term_en || ""}`.toLowerCase();
    return text.includes(filter.toLowerCase());
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{language === "ru" ? "Админ-панель" : "Admin Panel"}</h2>
        {!loggedIn && (
          <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder={language === "ru" ? "Пароль" : "Password"} />
            <button onClick={handleLogin} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #1b3672", background: "#1b3672", color: "#fff", cursor: "pointer" }}>
              {language === "ru" ? "Войти" : "Login"}
            </button>
          </div>
        )}
        {loggedIn && (
          <div className="card" style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700 }}>{language === "ru" ? "Импорт/шаблоны" : "Import/Templates"}</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ marginBottom: 4 }}>{language === "ru" ? "Импорт JSON" : "Import JSON"}</div>
                <input type="file" accept=".json" onChange={(e) => e.target.files && handleUpload(e.target.files[0], "json")} />
                <div>
                  <a href={downloadTemplateJson()} style={{ marginTop: 4, display: "inline-block" }}>
                    {language === "ru" ? "Скачать JSON шаблон" : "Download JSON template"}
                  </a>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>{language === "ru" ? "Импорт XLSX" : "Import XLSX"}</div>
                <input type="file" accept=".xls,.xlsx" onChange={(e) => e.target.files && handleUpload(e.target.files[0], "xls")} />
                <div>
                  <a href={downloadTemplateXls()} style={{ marginTop: 4, display: "inline-block" }}>
                    {language === "ru" ? "Скачать XLSX шаблон" : "Download XLSX template"}
                  </a>
                </div>
              </div>
            </div>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={language === "ru" ? "Поиск по словам" : "Search terms"}
              style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #d1d5db" }}
            />
          </div>
        )}
        {message && <div style={{ marginTop: 10, color: "#1b3672" }}>{message}</div>}
      </div>

      {loggedIn &&
        paged.map((t) => {
          const editable = editing[t.id] || t;
          const isEditing = !!editing[t.id];
          return (
            <div key={t.id} className="card" style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{t.term_ru || t.term_en}</div>
                  <div style={{ color: "#6b7280" }}>{t.term_en || t.term_ru}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => startEdit(t)} style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #d1d5db", background: "#f8fafc", cursor: "pointer" }}>
                    {language === "ru" ? "Редактировать" : "Edit"}
                  </button>
                  <button onClick={() => removeTerm(t.id)} style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #b91c1c", background: "#fee2e2", color: "#b91c1c", cursor: "pointer" }}>
                    {language === "ru" ? "Удалить" : "Delete"}
                  </button>
                </div>
              </div>

              {isEditing && (
                <>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input value={editable.term_ru || ""} onChange={(e) => changeField(t.id, "term_ru", e.target.value)} placeholder="term_ru" />
                    <input value={editable.term_en || ""} onChange={(e) => changeField(t.id, "term_en", e.target.value)} placeholder="term_en" />
                    <input value={editable.abbreviation || ""} onChange={(e) => changeField(t.id, "abbreviation", e.target.value)} placeholder="abbr" style={{ width: 120 }} />
                    <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="checkbox" checked={editable.active !== false} onChange={(e) => changeField(t.id, "active", e.target.checked)} />
                      {language === "ru" ? "Активен" : "Active"}
                    </label>
                  </div>
                  <textarea value={editable.definition || ""} onChange={(e) => changeField(t.id, "definition", e.target.value)} placeholder="definition (ru)" />
                  <textarea value={editable.definition_en || ""} onChange={(e) => changeField(t.id, "definition_en", e.target.value)} placeholder="definition (en)" />
                  <textarea value={editable.context || ""} onChange={(e) => changeField(t.id, "context", e.target.value)} placeholder="context (ru)" />
                  <textarea value={editable.context_en || ""} onChange={(e) => changeField(t.id, "context_en", e.target.value)} placeholder="context (en)" />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => saveTerm(t.id)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #1b3672", background: "#1b3672", color: "#fff", cursor: "pointer" }}>
                      {language === "ru" ? "Сохранить" : "Save"}
                    </button>
                    <button onClick={() => setEditing((prev) => ({ ...prev, [t.id]: undefined as any }))} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #d1d5db", background: "#f8fafc", cursor: "pointer" }}>
                      {language === "ru" ? "Отмена" : "Cancel"}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      {loggedIn && filtered.length > 0 && totalPages > 1 && (
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
