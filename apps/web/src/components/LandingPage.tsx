"use client";

import { useEffect, useState } from "react";
import {
  GREENHOUSES,
  type Greenhouse,
  type GreenhouseSummary,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { GreenhouseCard } from "./GreenhouseCard";
import { WaitlistBanner } from "./WaitlistBanner";
import { containerStyle, headingStyle } from "@/styles/theme";

interface LandingPageProps {
  onSelectGreenhouse?: (greenhouse: Greenhouse) => void;
  hasAvailableBoxes?: boolean;
}

export function LandingPage({ onSelectGreenhouse, hasAvailableBoxes = true }: LandingPageProps) {
  const { t } = useLanguage();
  const [greenhouses, setGreenhouses] = useState<GreenhouseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/public/greenhouses");
        if (res.ok && !cancelled) {
          setGreenhouses(await res.json());
        }
      } catch {
        /* API unreachable — cards will show empty until loaded */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const displayGreenhouses = greenhouses.length > 0
    ? greenhouses
    : GREENHOUSES.map((name) => ({ name, totalBoxes: 0, availableBoxes: 0, occupiedBoxes: 0 }));

  return (
    <section style={{ ...containerStyle, maxWidth: 700 }}>
      <h2 style={{ ...headingStyle, fontSize: "1.5rem" }}>{t("greenhouse.title")}</h2>
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
        {displayGreenhouses.map((gh) => (
          <GreenhouseCard
            key={gh.name}
            name={gh.name}
            totalBoxes={gh.totalBoxes}
            availableBoxes={gh.availableBoxes}
            occupiedBoxes={gh.occupiedBoxes}
            onSelect={onSelectGreenhouse ? () => onSelectGreenhouse(gh.name) : undefined}
          />
        ))}
      </div>
      {!loading && !hasAvailableBoxes && <WaitlistBanner />}
    </section>
  );
}
