# Ticket #234 — Add project/about text with contact people to public pages

## Analysis

**Current state**: Public pages have no about/project section. Contact info exists only on the PreOpenPage.

**Target state**: A concise about section at the bottom of all public pages explaining the project, its purpose, and listing contact people. Both DA and EN versions.

**Approach**: Create a `ProjectAbout` component and render it at the bottom of the public page views (PreOpenPage, LandingPage, GreenhouseMapPage). Reuse `ORGANIZER_CONTACTS` from shared constants. Add translation keys for the about text.

## Task Checklist

- [ ] Add `about.*` translation keys to `translations.ts` (DA + EN)
- [ ] Add `about` key contracts to `packages/shared/src/i18n.ts`
- [ ] Create `ProjectAbout.tsx` component
- [ ] Render in public page layout (page.tsx, below `renderContent()`)
- [ ] Run tests, lint, build
- [ ] Push and create PR

## Implementation Summary

**Files to modify:**
- `apps/web/src/i18n/translations.ts` — add about.* keys
- `packages/shared/src/i18n.ts` — add about key contracts
- `apps/web/src/app/page.tsx` — render ProjectAbout below content for public views

**Files to create:**
- `apps/web/src/components/ProjectAbout.tsx`
