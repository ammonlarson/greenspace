"use client";

import { useEffect, useState } from "react";
import {
  type Greenhouse,
  type PlanterBoxPublic,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { GreenhouseMap } from "./GreenhouseMap";
import { BoxStateLegend } from "./BoxStateLegend";
import { RegistrationForm } from "./RegistrationForm";

interface GreenhouseMapPageProps {
  greenhouse: Greenhouse;
  onBack: () => void;
}

export function GreenhouseMapPage({ greenhouse, onBack }: GreenhouseMapPageProps) {
  const { t } = useLanguage();
  const [boxes, setBoxes] = useState<PlanterBoxPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);

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

  if (selectedBoxId !== null) {
    return (
      <RegistrationForm
        boxId={selectedBoxId}
        onCancel={() => setSelectedBoxId(null)}
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
          <GreenhouseMap boxes={boxes} onSelectBox={setSelectedBoxId} />
        )}
      </div>
    </section>
  );
}
