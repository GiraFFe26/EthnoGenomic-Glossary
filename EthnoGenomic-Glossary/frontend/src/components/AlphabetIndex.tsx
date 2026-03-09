import { useMemo } from "react";

type Props = {
  onSelect: (letter: string) => void;
  active?: string;
  language: "ru" | "en";
};

const ruAlphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");
const enAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AlphabetIndex({ onSelect, active, language }: Props) {
  const letters = useMemo(() => (language === "ru" ? ruAlphabet : enAlphabet), [language]);

  return (
    <div className="chips">
      {letters.map((letter) => (
        <button
          key={letter}
          onClick={() => onSelect(letter)}
          style={{
            border: "none",
            cursor: "pointer",
            background: active === letter ? "#1b3672" : "#eef4ff",
            color: active === letter ? "#fff" : "#1f3a71",
            borderRadius: 10,
            padding: "8px 10px",
            fontWeight: 700,
            minWidth: 36,
          }}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
