# Ticket 195: Hide contact email addresses, keep names clickable

## Analysis

**Current state**: Contact sections across the app display organizer names alongside their raw email addresses (e.g., "Elise Larson – elise7284@gmail.com" or "Elise Larson (elise7284@gmail.com)"). The email text is visible in both the web UI and HTML email templates.

**Target state**: Contact names remain clickable (via `mailto:` links) but raw email addresses are no longer visibly displayed. Users can still initiate contact by clicking the name.

**Approach**: In every location where `ORGANIZER_CONTACTS` is rendered, change the display to show only the contact name as a clickable `mailto:` link, removing the visible email text.

## Task Checklist

- [ ] Update `PreOpenPage.tsx` – remove email text, keep name as mailto link
- [ ] Update `RegistrationForm.tsx` – remove email text from consent section
- [ ] Update `WaitlistForm.tsx` – remove email text from consent section
- [ ] Update `email-templates.ts` – remove email text from confirmation emails
- [ ] Update `admin-email-templates.ts` – remove email text from admin notification emails
- [ ] Run tests, lint, and build

## Implementation Summary

**Files to modify:**
1. `apps/web/src/components/PreOpenPage.tsx` (lines 88-93)
2. `apps/web/src/components/RegistrationForm.tsx` (lines 295-300)
3. `apps/web/src/components/WaitlistForm.tsx` (lines 197-202)
4. `apps/api/src/lib/email-templates.ts` (lines 172-175)
5. `apps/api/src/lib/admin-email-templates.ts` (lines 114-117)

**Estimated impact**: Minimal – cosmetic change to contact display. No logic, validation, or data model changes.
