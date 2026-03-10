# Ticket 228 - Show waitlist join time alongside date

## Analysis

**Current state:** The admin waitlist tab shows only the date (e.g. "10 Mar 2026") for each waitlist entry using `formatDate()`.

**Target state:** Show both date and time (e.g. "10 Mar 2026, 14:30") in the waitlist tab Date column.

**Approach:**
- Add a `formatDateTime` function to the existing `formatDate.ts` utility
- Replace `formatDate` with `formatDateTime` in `AdminWaitlist.tsx` for the date column
- Update the test mock to include `formatDateTime`

## Files to modify
1. `apps/web/src/utils/formatDate.ts` — Add `formatDateTime` export
2. `apps/web/src/components/AdminWaitlist.tsx` — Import and use `formatDateTime`
3. `apps/web/src/components/AdminWaitlist.test.tsx` — Add `formatDateTime` to mock
