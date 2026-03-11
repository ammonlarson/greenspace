import { ORGANIZER_CONTACTS } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { colors, fonts } from "@/styles/theme";

function PlantIcon() {
  return (
    <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 26 L12 14" stroke={colors.borderTan} strokeWidth="1" strokeLinecap="round" />
      <path d="M12 18 C10 16 7 16.5 6.5 18.5" stroke={colors.borderTan} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M12 15 C14 13 17 13.5 17.5 15.5" stroke={colors.borderTan} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M12 14 C11 11 9 10 7 11" stroke={colors.borderTan} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M12 14 C13 11 15 10 17 11" stroke={colors.borderTan} strokeWidth="1" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="12" r="1.5" stroke={colors.borderTan} strokeWidth="0.8" fill="none" />
      <path d="M11 10.5 L10 8" stroke={colors.borderTan} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M13 10.5 L14 8" stroke={colors.borderTan} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M12 10.5 L12 7.5" stroke={colors.borderTan} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

export function ProjectAbout() {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        maxWidth: 800,
        margin: "2rem auto 0",
        padding: "1.5rem 1rem 2rem",
        textAlign: "center",
      }}
    >
      {/* Decorative divider */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}>
        <div style={{ flex: 1, maxWidth: 200, height: 1, background: `linear-gradient(to right, transparent, ${colors.borderTan})` }} />
        <PlantIcon />
        <div style={{ flex: 1, maxWidth: 200, height: 1, background: `linear-gradient(to left, transparent, ${colors.borderTan})` }} />
      </div>

      <p
        style={{
          fontFamily: fonts.body,
          color: colors.sage,
          fontSize: "0.8rem",
          lineHeight: 1.6,
          margin: "0 auto 0.5rem",
          maxWidth: 500,
        }}
      >
        {t("about.description")}
      </p>
      <p style={{ margin: 0, fontSize: "0.8rem" }}>
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
