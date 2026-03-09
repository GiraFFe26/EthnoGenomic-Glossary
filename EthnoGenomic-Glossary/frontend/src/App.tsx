import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import About from "./pages/About";
import Alphabet from "./pages/Alphabet";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import TermPage from "./pages/TermPage";
import LanguageToggle from "./components/LanguageToggle";
import AdminPage from "./pages/AdminPage";
import ngtuLogo from "./assets/nstu-logo.svg";

const navItems = [
  { path: "/", key: "home", label: { ru: "Главная", en: "Home" }, end: true },
  { path: "/alphabet", key: "alphabet", label: { ru: "Алфавит", en: "Alphabet" } },
  { path: "/about", key: "about", label: { ru: "О проекте", en: "About" } },
  { path: "/admin", key: "admin", label: { ru: "Админ", en: "Admin" } },
] as const;

function App() {
  const [language, setLanguage] = useState<"ru" | "en">("ru");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const brandSubtitle = useMemo(() => (language === "ru" ? "Русско-английский глоссарий" : "Bilingual glossary"), [language]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? " active" : ""}`;
  const navLabel = (item: (typeof navItems)[number]) => (language === "ru" ? item.label.ru : item.label.en);

  return (
    <div className={`app-shell${menuOpen ? " menu-open" : ""}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="Home">
            <img src={ngtuLogo} alt="НГТУ" className="brand-logo" />
            <div className="brand-text">
              <div className="brand-title">EthnoGenomic Glossary</div>
              <div className="brand-subtitle">{brandSubtitle}</div>
            </div>
          </Link>

          <nav className="nav-links desktop">
            {navItems.map((item) => (
              <NavLink key={item.key} to={item.path} end={item.end} className={navLinkClass}>
                {navLabel(item)}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <div className="desktop-only">
              <LanguageToggle value={language} onChange={setLanguage} />
            </div>
            <button className="menu-toggle" type="button" aria-label="Открыть меню" onClick={() => setMenuOpen(true)}>
              <span style={{ fontSize: 18 }}>≡</span>
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer-backdrop${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`mobile-drawer${menuOpen ? " open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-title">{language === "ru" ? "Навигация" : "Navigation"}</div>
          <button className="drawer-close" type="button" aria-label={language === "ru" ? "Закрыть меню" : "Close menu"} onClick={() => setMenuOpen(false)}>
            ×
          </button>
        </div>
        <nav className="drawer-nav">
          {navItems.map((item) => (
            <NavLink key={item.key} to={item.path} end={item.end} className={navLinkClass}>
              {navLabel(item)}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions mobile">
          <LanguageToggle value={language} onChange={setLanguage} />
        </div>
      </aside>

      <main className="layout content">
        <Routes>
          <Route path="/" element={<HomePage language={language} />} />
          <Route path="/search" element={<SearchResultsPage language={language} />} />
          <Route path="/term/:id" element={<TermPage language={language} />} />
          <Route path="/alphabet" element={<Alphabet language={language} />} />
          <Route path="/about" element={<About language={language} />} />
          <Route path="/admin" element={<AdminPage language={language} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
