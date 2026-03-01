"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

interface WaitlistBannerProps {
  position?: number | null;
  alreadyOnWaitlist?: boolean;
}

export function WaitlistBanner({ position, alreadyOnWaitlist }: WaitlistBannerProps) {
  const { t } = useLanguage();

  return (
    <section
      style={{
        border: "1px solid #e0c547",
        borderRadius: 8,
        backgroundColor: "#fef9e7",
        padding: "1.25rem",
        marginTop: "1.5rem",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
        {t("waitlist.title")}
      </h3>
      <p style={{ margin: "0 0 0.75rem", color: "#555", fontSize: "0.95rem" }}>
        {alreadyOnWaitlist
          ? t("waitlist.alreadyOnWaitlist")
          : t("waitlist.description")}
      </p>
      {position != null && position > 0 && (
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {t("waitlist.positionLabel")}: #{position}
        </p>
      )}
    </section>
  );
}
