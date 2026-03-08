"use client";

import { LANGUAGES, LANGUAGE_LABELS, type Language } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { colors, fonts } from "@/styles/theme";

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
            textUnderlineOffset: "3px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            fontSize: "0.875rem",
            fontFamily: fonts.body,
            color: colors.warmBrown,
          }}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
