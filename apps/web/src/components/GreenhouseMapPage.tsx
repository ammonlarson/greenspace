"use client";

import { useEffect, useState } from "react";
import {
  type Greenhouse,
  type PlanterBoxPublic,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useHistoryState } from "@/hooks/useHistoryState";
import { GreenhouseMap } from "./GreenhouseMap";
import { BoxStateLegend } from "./BoxStateLegend";
import { RegistrationForm } from "./RegistrationForm";
import { WaitlistForm } from "./WaitlistForm";

interface GreenhouseMapPageProps {
  greenhouse: Greenhouse;
  onBack: () => void;
}

type PageView = "map" | "register" | "waitlist";

export function GreenhouseMapPage({ greenhouse, onBack }: GreenhouseMapPageProps) {
  const { t } = useLanguage();
  const [boxes, setBoxes] = useState<PlanterBoxPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageView, setPageView] = useHistoryState<PageView>("greenhouse.pageView", "map");
  const [selectedBoxId, setSelectedBoxId] = useHistoryState<number | null>("greenhouse.boxId", null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/public/boxes");
        if (res.ok && !cancelled) {
          const all: PlanterBoxPublic[] = await res.json();
          setBoxes(all.filter((b) => b.greenhouse === greenhouse));
        }
      } catch {
        /* API unreachable — map will show empty */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [greenhouse]);

  const total = boxes.length;
  const available = boxes.filter((b) => b.state === "available").length;
  const occupied = boxes.filter((b) => b.state === "occupied").length;
  const hasAvailable = available > 0;

  if (pageView === "register" && selectedBoxId !== null) {
    return (
      <RegistrationForm
        boxId={selectedBoxId}
        onCancel={() => {
          setSelectedBoxId(null);
          setPageView("map");
        }}
        onBoxUnavailable={() => setPageView("waitlist")}
      />
    );
  }

  if (pageView === "waitlist") {
    return (
      <WaitlistForm
        onCancel={() => setPageView("map")}
      />
    );
  }

  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "0.9rem",
          color: "#555",
          padding: "0.25rem 0",
          marginBottom: "1rem",
          fontFamily: "inherit",
        }}
      >
        &larr; {t("map.back")}
      </button>

      <h2 style={{ margin: "0 0 0.5rem" }}>{greenhouse}</h2>

      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          fontSize: "0.9rem",
          color: "#555",
          marginBottom: "1.25rem",
        }}
      >
        <span>
          {t("greenhouse.totalBoxes")}: <strong>{total}</strong>
        </span>
        <span>
          {t("greenhouse.available")}:{" "}
          <strong style={{ color: "#2d7a3a" }}>{available}</strong>
        </span>
        <span>
          {t("greenhouse.occupied")}: <strong>{occupied}</strong>
        </span>
      </div>

      <BoxStateLegend />

      <div style={{ marginTop: "1.25rem" }}>
        {loading ? (
          <p style={{ color: "#888" }}>{t("common.loading")}</p>
        ) : (
          <GreenhouseMap
            boxes={boxes}
            onSelectBox={(id) => {
              setSelectedBoxId(id);
              setPageView("register");
            }}
          />
        )}
      </div>

      {!hasAvailable && (
        <div style={{ marginTop: "1.5rem" }}>
          <section
            style={{
              border: "1px solid #e0c547",
              borderRadius: 8,
              backgroundColor: "#fef9e7",
              padding: "1.25rem",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
              {t("waitlist.title")}
            </h3>
            <p style={{ margin: "0 0 0.75rem", color: "#555", fontSize: "0.95rem" }}>
              {t("waitlist.description")}
            </p>
            <button
              type="button"
              onClick={() => setPageView("waitlist")}
              style={{
                padding: "0.5rem 1rem",
                background: "#b8860b",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              {t("waitlist.joinButton")}
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
