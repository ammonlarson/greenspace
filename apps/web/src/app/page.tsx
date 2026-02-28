"use client";

import {
  DEFAULT_OPENING_DATETIME,
  OPENING_TIMEZONE,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PreOpenPage } from "@/components/PreOpenPage";
import { LandingPage } from "@/components/LandingPage";
import { useEffect, useState } from "react";

function isBeforeOpening(openingIso: string): boolean {
  const openingUtc = new Date(
    new Date(openingIso).toLocaleString("en-US", { timeZone: OPENING_TIMEZONE }),
  );
  const nowInTz = new Date(
    new Date().toLocaleString("en-US", { timeZone: OPENING_TIMEZONE }),
  );
  return nowInTz < openingUtc;
}

export default function Home() {
  const { t } = useLanguage();
  const [preOpen, setPreOpen] = useState<boolean | null>(null);

  useEffect(() => {
    setPreOpen(isBeforeOpening(DEFAULT_OPENING_DATETIME));
  }, []);

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

      {preOpen === null ? (
        <p style={{ textAlign: "center", padding: "2rem" }}>
          {t("common.loading")}
        </p>
      ) : preOpen ? (
        <PreOpenPage openingDatetime={DEFAULT_OPENING_DATETIME} />
      ) : (
        <LandingPage />
      )}
    </main>
  );
}
