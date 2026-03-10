# Ticket 240: Cross-greenhouse availability hint

## Analysis

**Current state**: When a greenhouse is full, the `GreenhouseMapPage` shows a waitlist section with title, description, and join button. There is no awareness of the other greenhouse's availability.

**Target state**: When one greenhouse is full but the other has available boxes, show an additional message pointing users to the other greenhouse with a direct navigation link.

**Approach**:
- Fetch `/public/greenhouses` in `GreenhouseMapPage` to get the other greenhouse's summary
- When current greenhouse is full and other has availability, render a hint message with CTA button
- Add `onSelectGreenhouse` callback prop so the CTA can navigate directly
- Add i18n keys for the hint message (DA + EN)

## Task Checklist

- [x] Read ticket and add labels
- [ ] Add i18n translation keys (`waitlist.otherAvailable`, `waitlist.goToOther`) to `translations.ts`
- [ ] Add i18n key contracts to `packages/shared/src/i18n.ts`
- [ ] Update `GreenhouseMapPage` to accept `onSelectGreenhouse` prop
- [ ] Fetch greenhouse summaries and determine other greenhouse availability
- [ ] Render cross-greenhouse hint when conditions are met
- [ ] Update `page.tsx` to pass `onSelectGreenhouse` to `GreenhouseMapPage`
- [ ] Run tests, lint, build
- [ ] Push and create PR

## Implementation Summary

**Files to modify:**
1. `apps/web/src/i18n/translations.ts` - Add DA/EN translations for hint message
2. `packages/shared/src/i18n.ts` - Add key contracts
3. `apps/web/src/components/GreenhouseMapPage.tsx` - Add availability check + hint UI
4. `apps/web/src/app/page.tsx` - Pass `onSelectGreenhouse` prop

**Estimated impact**: Minimal, frontend-only change. No API or DB changes needed.
