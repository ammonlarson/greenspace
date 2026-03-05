"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_OPENING_DATETIME, type Greenhouse } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PreOpenPage } from "@/components/PreOpenPage";
import { LandingPage } from "@/components/LandingPage";
import { GreenhouseMapPage } from "@/components/GreenhouseMapPage";
import { AdminPage } from "@/components/AdminPage";

type View = "public" | "admin";

/** Polling interval when in pre-open state (30 seconds). */
const PRE_OPEN_POLL_MS = 30_000;

interface PublicStatus {
  isOpen: boolean;
  openingDatetime: string | null;
  hasAvailableBoxes: boolean;
  serverTime?: string;
}

export default function Home() {
  const { t } = useLanguage();
  const [view, setView] = useState<View>("public");
  const [selectedGreenhouse, setSelectedGreenhouse] = useState<Greenhouse | null>(null);
  const [status, setStatus] = useState<PublicStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/public/status");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      /* API unreachable — safe default is pre-open (deny early access) */
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Server-authoritative gate: trust the server's isOpen flag.
  // When API is unreachable (status === null), default to pre-open (safe/deny).
  const preOpen = status ? !status.isOpen : true;
  const openingDatetime = status?.openingDatetime ?? DEFAULT_OPENING_DATETIME;

  // Poll /public/status while in pre-open so the page auto-transitions
  // at the correct server-determined time without requiring a manual refresh.
  useEffect(() => {
    if (preOpen) {
      pollRef.current = setInterval(fetchStatus, PRE_OPEN_POLL_MS);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [preOpen, fetchStatus]);

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
    return (
      <LandingPage
        onSelectGreenhouse={setSelectedGreenhouse}
        hasAvailableBoxes={status?.hasAvailableBoxes ?? true}
      />
    );
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
