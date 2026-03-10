import { ORGANIZER_CONTACTS } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { colors, fonts } from "@/styles/theme";

export function ProjectAbout() {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "2rem 1rem 1.5rem",
        borderTop: `1px solid ${colors.borderTan}`,
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontFamily: fonts.heading,
          color: colors.warmBrown,
          fontSize: "1rem",
          margin: "0 0 0.5rem",
        }}
      >
        {t("about.title")}
      </h2>
      <p
        style={{
          fontFamily: fonts.body,
          color: colors.warmBrown,
          fontSize: "0.85rem",
          lineHeight: 1.6,
          margin: "0 0 0.75rem",
          maxWidth: 600,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {t("about.description")}
      </p>
      <p
        style={{
          fontFamily: fonts.body,
          color: colors.warmBrown,
          fontSize: "0.85rem",
          margin: "0 0 0.25rem",
        }}
      >
        {t("about.contact")}
      </p>
      <p style={{ margin: 0, fontSize: "0.85rem" }}>
        {ORGANIZER_CONTACTS.map((contact, i) => (
          <span key={contact.email}>
            {i > 0 && " · "}
            <a
              href={`mailto:${contact.email}`}
              style={{ color: colors.sage, textDecoration: "none" }}
            >
              {contact.name}
            </a>
          </span>
        ))}
      </p>
    </footer>
  );
}
