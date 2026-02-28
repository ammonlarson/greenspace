"use client";

import { DEFAULT_OPENING_DATETIME } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PreOpenPage } from "@/components/PreOpenPage";
import { LandingPage } from "@/components/LandingPage";
import { isBeforeOpening } from "@/utils/opening";

export default function Home() {
  const { t } = useLanguage();
  const preOpen = isBeforeOpening(DEFAULT_OPENING_DATETIME);

  return (
    <main>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          borderBottom: "1px solid #eee",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", margin: 0 }}>
          {t("common.appName")}
        </h1>
        <LanguageSelector />
      </header>

      {preOpen ? (
        <PreOpenPage openingDatetime={DEFAULT_OPENING_DATETIME} />
      ) : (
        <LandingPage />
      )}
    </main>
  );
}
