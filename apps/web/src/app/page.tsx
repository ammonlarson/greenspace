"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_OPENING_DATETIME, type Greenhouse } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PreOpenPage } from "@/components/PreOpenPage";
import { LandingPage } from "@/components/LandingPage";
import { GreenhouseMapPage } from "@/components/GreenhouseMapPage";
import { AdminPage } from "@/components/AdminPage";
import { isBeforeOpening } from "@/utils/opening";

type View = "public" | "admin";

interface PublicStatus {
  isOpen: boolean;
  openingDatetime: string | null;
}

export default function Home() {
  const { t } = useLanguage();
  const [view, setView] = useState<View>("public");
  const [selectedGreenhouse, setSelectedGreenhouse] = useState<Greenhouse | null>(null);
  const [status, setStatus] = useState<PublicStatus | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/public/status");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      /* API unreachable — fall back to hardcoded constant */
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const openingDatetime = status?.openingDatetime ?? DEFAULT_OPENING_DATETIME;
  const preOpen = status ? !status.isOpen : isBeforeOpening(DEFAULT_OPENING_DATETIME);

  function renderContent() {
    if (view === "admin") {
      return (
        <AdminPage
          onBack={() => setView("public")}
        />
      );
    }
    if (preOpen) {
      return <PreOpenPage openingDatetime={openingDatetime} />;
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {view === "public" && (
            <button
              type="button"
              onClick={() => setView("admin")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.8rem",
                color: "#888",
                fontFamily: "inherit",
              }}
            >
              {t("admin.link")}
            </button>
          )}
          <LanguageSelector />
        </div>
      </header>

      {renderContent()}
    </main>
  );
}
