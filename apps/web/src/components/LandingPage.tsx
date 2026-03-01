"use client";

import { useEffect, useState } from "react";
import {
  BOX_CATALOG,
  GREENHOUSES,
  type Greenhouse,
  type GreenhouseSummary,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { GreenhouseCard } from "./GreenhouseCard";
import { WaitlistBanner } from "./WaitlistBanner";

interface LandingPageProps {
  onSelectGreenhouse?: (greenhouse: Greenhouse) => void;
  hasAvailableBoxes?: boolean;
}

function getBoxCountForGreenhouse(greenhouse: Greenhouse) {
  return BOX_CATALOG.filter((b) => b.greenhouse === greenhouse).length;
}

export function LandingPage({ onSelectGreenhouse, hasAvailableBoxes = true }: LandingPageProps) {
  const { t } = useLanguage();
  const [summaries, setSummaries] = useState<GreenhouseSummary[] | null>(null);

  useEffect(() => {
    async function fetchSummaries() {
      try {
        const res = await fetch("/public/greenhouses");
        if (res.ok) {
          setSummaries(await res.json());
        }
      } catch {
        /* fall back to static counts */
      }
    }
    fetchSummaries();
  }, []);

  return (
    <section style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2>{t("greenhouse.title")}</h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        {GREENHOUSES.map((gh) => {
          const summary = summaries?.find((s) => s.name === gh);
          const total = summary?.totalBoxes ?? getBoxCountForGreenhouse(gh);
          const available = summary?.availableBoxes ?? total;
          const occupied = summary?.occupiedBoxes ?? 0;
          return (
            <GreenhouseCard
              key={gh}
              name={gh}
              totalBoxes={total}
              availableBoxes={available}
              occupiedBoxes={occupied}
              onSelect={onSelectGreenhouse ? () => onSelectGreenhouse(gh) : undefined}
            />
          );
        })}
      </div>
      {!hasAvailableBoxes && <WaitlistBanner />}
    </section>
  );
}
