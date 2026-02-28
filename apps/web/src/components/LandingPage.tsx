"use client";

import {
  BOX_CATALOG,
  GREENHOUSES,
  type Greenhouse,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { GreenhouseCard } from "./GreenhouseCard";

function getBoxCountForGreenhouse(greenhouse: Greenhouse) {
  return BOX_CATALOG.filter((b) => b.greenhouse === greenhouse).length;
}

export function LandingPage() {
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
            />
          );
        })}
      </div>
    </section>
  );
}
