"use client";

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
  greenhouses?: GreenhouseSummary[];
  onSelectGreenhouse?: (greenhouse: Greenhouse) => void;
  hasAvailableBoxes?: boolean;
  onJoinWaitlist?: () => void;
}
export function LandingPage({ greenhouses = [], onSelectGreenhouse, hasAvailableBoxes = true, onJoinWaitlist }: LandingPageProps) {
  const { t } = useLanguage();

  const displayGreenhouses = greenhouses.length > 0
    ? greenhouses
    : GREENHOUSES.map((name) => ({ name, totalBoxes: 0, availableBoxes: 0, occupiedBoxes: 0 }));

  return (
    <section style={{ ...containerStyle, maxWidth: 700 }}>
      <h2 style={{ ...headingStyle, fontSize: "1.5rem", textAlign: "center" }}>{t("greenhouse.title")}</h2>
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
      {!hasAvailableBoxes && <WaitlistBanner onJoinWaitlist={onJoinWaitlist} />}
    </section>
  );
}
