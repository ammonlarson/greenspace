"use client";

import { LANGUAGES, LANGUAGE_LABELS, type Language } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-selector">
      {LANGUAGES.map((lang: Language) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          aria-current={lang === language ? "true" : undefined}
          style={{
            fontWeight: lang === language ? 700 : 400,
            textDecoration: lang === language ? "underline" : "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            fontSize: "0.875rem",
          }}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
