# apps/web

Next.js 15 frontend application (React 19, App Router).

## Responsibilities

- Public registration experience (greenhouse maps, box selection, registration form).
- Admin dashboard experience.
- Bilingual UI (`da`, `en`) with browser-default detection and manual switching.
- Pre-open mode (blocks registration before configured opening datetime).

Must not contain:
- Direct database access.
- AWS provisioning logic.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **React:** 19
- **Styling:** Inline styles (no CSS framework)
- **Testing:** Vitest
- **Linting:** ESLint

## Source Structure

```
src/
├── app/
│   ├── layout.tsx           Root layout with LanguageProvider
│   ├── page.tsx             Main page (pre-open / landing / map routing)
│   └── page.test.tsx        Integration tests
├── components/
│   ├── BoxCard.tsx           Individual planter box card with state badge
│   ├── BoxStateLegend.tsx    Color legend for box states
│   ├── boxStateColors.ts    Shared color constants for box states
│   ├── GreenhouseCard.tsx    Greenhouse summary card (clickable)
│   ├── GreenhouseMap.tsx     Responsive CSS grid of box cards
│   ├── GreenhouseMapPage.tsx Full greenhouse map view
│   ├── LandingPage.tsx       Greenhouse overview with cards
│   ├── LanguageSelector.tsx  da/en language toggle
│   └── PreOpenPage.tsx       Pre-registration info page
├── i18n/
│   ├── LanguageProvider.tsx  React context for language state
│   └── translations.ts      Danish and English translation strings
└── utils/
    └── opening.ts            Opening datetime comparison helper
```

## Scripts

```bash
npm run dev        # Start Next.js dev server (port 3000)
npm run build      # Production build
npm run test       # Run Vitest tests
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
```
