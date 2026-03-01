"use client";

import { useState } from "react";
import { DEFAULT_OPENING_DATETIME, type Greenhouse } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PreOpenPage } from "@/components/PreOpenPage";
import { LandingPage } from "@/components/LandingPage";
import { GreenhouseMapPage } from "@/components/GreenhouseMapPage";
import { isBeforeOpening } from "@/utils/opening";

export default function Home() {
  const { t } = useLanguage();
  const preOpen = isBeforeOpening(DEFAULT_OPENING_DATETIME);
  const [selectedGreenhouse, setSelectedGreenhouse] = useState<Greenhouse | null>(null);

  function renderContent() {
    if (preOpen) {
      return <PreOpenPage openingDatetime={DEFAULT_OPENING_DATETIME} />;
    }
    if (selectedGreenhouse) {
      return (
        <GreenhouseMapPage
          greenhouse={selectedGreenhouse}
          onBack={() => setSelectedGreenhouse(null)}
        />
      );
    }
    return <LandingPage onSelectGreenhouse={setSelectedGreenhouse} />;
  }

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

      {renderContent()}
    </main>
  );
}
