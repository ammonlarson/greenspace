"use client";

import {
  OPENING_TIMEZONE,
  ORGANIZER_CONTACTS,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";

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
    <section style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2>{t("status.preOpenTitle")}</h2>

      <p>{t("status.preOpenDescription")}</p>

      <div style={{ margin: "1.5rem 0", padding: "1rem", background: "#f5f5f0", borderRadius: 8 }}>
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
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
