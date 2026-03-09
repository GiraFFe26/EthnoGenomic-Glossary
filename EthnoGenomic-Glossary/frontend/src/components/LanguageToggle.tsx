type Props = {
  value: "ru" | "en";
  onChange: (val: "ru" | "en") => void;
};

export default function LanguageToggle({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 4, background: "#eef4ff", borderRadius: 12, padding: 4 }}>
      {(["ru", "en"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: 10,
            background: value === lang ? "#1b3672" : "transparent",
            color: value === lang ? "#fff" : "#1f3a71",
            fontWeight: 700,
            textTransform: "uppercase",
            minWidth: 52,
          }}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
