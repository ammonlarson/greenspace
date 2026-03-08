import { LanguageProvider } from "@/i18n/LanguageProvider";
import { colors } from "@/styles/theme";

export const metadata = {
  title: "UN17 Village Rooftop Gardens",
  description: "Rooftop planter box registration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body style={{ margin: 0, background: colors.cream }}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
