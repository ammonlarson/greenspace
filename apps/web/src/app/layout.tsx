import { LanguageProvider } from "@/i18n/LanguageProvider";

export const metadata = {
  title: "Greenspace 2026",
  description: "Rooftop planter box registration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
