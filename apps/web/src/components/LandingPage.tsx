"use client";

import {
  BOX_CATALOG,
  GREENHOUSES,
  type Greenhouse,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { GreenhouseCard } from "./GreenhouseCard";

interface LandingPageProps {
  onSelectGreenhouse?: (greenhouse: Greenhouse) => void;
}

function getBoxCountForGreenhouse(greenhouse: Greenhouse) {
  return BOX_CATALOG.filter((b) => b.greenhouse === greenhouse).length;
}

export function LandingPage({ onSelectGreenhouse }: LandingPageProps) {
  const { t } = useLanguage();

  return (
    <section style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2>{t("greenhouse.title")}</h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        {GREENHOUSES.map((gh) => {
          const total = getBoxCountForGreenhouse(gh);
          return (
            <GreenhouseCard
              key={gh}
              name={gh}
              totalBoxes={total}
              availableBoxes={total}
              occupiedBoxes={0}
              onSelect={onSelectGreenhouse ? () => onSelectGreenhouse(gh) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
