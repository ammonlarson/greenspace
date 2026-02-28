"use client";

import {
  BOX_CATALOG,
  type Greenhouse,
  type PlanterBoxPublic,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { GreenhouseMap } from "./GreenhouseMap";
import { BoxStateLegend } from "./BoxStateLegend";

interface GreenhouseMapPageProps {
  greenhouse: Greenhouse;
  onBack: () => void;
}

function mockBoxes(greenhouse: Greenhouse): PlanterBoxPublic[] {
  return BOX_CATALOG.filter((b) => b.greenhouse === greenhouse).map((b) => ({
    id: b.id,
    name: b.name,
    greenhouse: b.greenhouse,
    state: "available" as const,
  }));
}

export function GreenhouseMapPage({ greenhouse, onBack }: GreenhouseMapPageProps) {
  const { t } = useLanguage();
  const boxes = mockBoxes(greenhouse);

  const total = boxes.length;
  const available = boxes.filter((b) => b.state === "available").length;
  const occupied = boxes.filter((b) => b.state === "occupied").length;

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
        <GreenhouseMap boxes={boxes} />
      </div>
    </section>
  );
}
