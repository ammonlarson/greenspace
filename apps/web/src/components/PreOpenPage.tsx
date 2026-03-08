"use client";

import {
  OPENING_TIMEZONE,
  ORGANIZER_CONTACTS,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { colors, fonts, containerStyle, headingStyle } from "@/styles/theme";

function formatOpeningDatetime(iso: string, locale: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: OPENING_TIMEZONE,
  }).format(date);
}

interface PreOpenPageProps {
  openingDatetime: string;
}

export function PreOpenPage({ openingDatetime }: PreOpenPageProps) {
  const { language, t } = useLanguage();
  const locale = language === "da" ? "da-DK" : "en-GB";
  const formattedDate = formatOpeningDatetime(openingDatetime, locale);

  return (
    <section style={{ ...containerStyle, maxWidth: 600, fontFamily: fonts.body, color: colors.inkBrown }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
        <svg
          width="200"
          height="140"
          viewBox="0 0 200 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Greenhouse frame */}
          <rect x="30" y="50" width="140" height="80" rx="2" stroke={colors.sage} strokeWidth="2" fill="none" />
          {/* Roof */}
          <path d="M30 50 L100 15 L170 50" stroke={colors.sage} strokeWidth="2" fill="none" />
          {/* Roof ridge lines */}
          <line x1="65" y1="32.5" x2="65" y2="50" stroke={colors.sage} strokeWidth="1.5" />
          <line x1="100" y1="15" x2="100" y2="50" stroke={colors.sage} strokeWidth="1.5" />
          <line x1="135" y1="32.5" x2="135" y2="50" stroke={colors.sage} strokeWidth="1.5" />
          {/* Door */}
          <rect x="85" y="90" width="30" height="40" rx="1" stroke={colors.sage} strokeWidth="2" fill="none" />
          <circle cx="110" cy="110" r="2" fill={colors.sage} />
          {/* Windows */}
          <rect x="40" y="60" width="30" height="25" rx="1" stroke={colors.sage} strokeWidth="1.5" fill="none" />
          <rect x="130" y="60" width="30" height="25" rx="1" stroke={colors.sage} strokeWidth="1.5" fill="none" />
          {/* Plants inside */}
          <path d="M50 130 Q52 115 55 120 Q58 110 60 130" stroke={colors.sage} strokeWidth="1.5" fill="none" />
          <path d="M140 130 Q143 112 146 118 Q149 108 152 130" stroke={colors.sage} strokeWidth="1.5" fill="none" />
          {/* Small leaf details */}
          <ellipse cx="55" cy="116" rx="4" ry="2.5" stroke={colors.sage} strokeWidth="1" fill="none" />
          <ellipse cx="146" cy="114" rx="4" ry="2.5" stroke={colors.sage} strokeWidth="1" fill="none" />
          {/* Ground line */}
          <line x1="20" y1="130" x2="180" y2="130" stroke={colors.sage} strokeWidth="1.5" />
        </svg>
      </div>

      <h2 style={{ ...headingStyle, fontSize: "1.5rem" }}>{t("status.preOpenTitle")}</h2>

      <p>{t("status.preOpenDescription")}</p>

      <div style={{
        margin: "1.5rem 0",
        padding: "1rem",
        background: colors.parchment,
        border: `1px solid ${colors.borderTan}`,
        borderRadius: 10,
      }}>
        <strong>{t("status.openingDatetime")}</strong>
        <p style={{ fontSize: "1.25rem", margin: "0.5rem 0 0" }}>
          <time dateTime={openingDatetime}>{formattedDate}</time>
        </p>
      </div>

      <div style={{ margin: "1.5rem 0" }}>
        <strong>{t("status.eligibility")}</strong>
      </div>

      <div>
        <strong>{t("status.contactInfo")}</strong>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {ORGANIZER_CONTACTS.map((contact) => (
            <li key={contact.email} style={{ margin: "0.25rem 0" }}>
              {contact.name} –{" "}
              <a href={`mailto:${contact.email}`} style={{ color: colors.sage }}>{contact.email}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
