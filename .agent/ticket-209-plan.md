# Ticket 209 - Support bilingual bulk emails with per-recipient language delivery

## Analysis

**Current state:** AdminMessaging sends a single subject + bodyHtml to all recipients. The email service already accepts a `language` parameter per recipient, but the same HTML content is sent regardless of language.

**Target state:** Admins can toggle bilingual mode. In bilingual mode, separate subject/body fields for DA and EN are shown. On send, each recipient receives the version matching their stored language preference.

**Approach:**
- Add a bilingual toggle to the AdminMessaging UI
- In bilingual mode, show two content sections (DA/EN) with subject + body each
- Update the API to accept either single-language or bilingual payloads
- Route each recipient to their language-specific content during delivery
- Keep the existing single-language workflow fully functional

## Task Checklist

- [x] Read issue, add labels
- [x] Create plan document
- [ ] Set up feature branch from main
- [ ] Add bilingual i18n keys to translations.ts (da + en)
- [ ] Update AdminMessaging.tsx with bilingual toggle and dual subject/body editors
- [ ] Update messaging.ts API route to accept bilingual payloads and route per language
- [ ] Update frontend tests (AdminMessaging.test.tsx)
- [ ] Update API tests (messaging.test.ts)
- [ ] Run lint, build, tests
- [ ] Create PR, run review, address feedback

## Implementation Summary

**Files to modify:**
1. `apps/web/src/i18n/translations.ts` — Add i18n keys for bilingual mode UI elements
2. `apps/web/src/components/AdminMessaging.tsx` — Add bilingual toggle, dual editors, updated validation and send payload
3. `apps/api/src/routes/admin/messaging.ts` — Accept bilingual payload, route per recipient language
4. `apps/web/src/components/AdminMessaging.test.tsx` — Add tests for bilingual mode
5. `apps/api/src/routes/admin/messaging.test.ts` — Add tests for bilingual API

**Design decisions:**
- Bilingual payload: `{ bilingual: true, subjectDa, bodyHtmlDa, subjectEn, bodyHtmlEn }` alongside existing `{ subject, bodyHtml }`
- API backward compatible: if `bilingual` is falsy, uses existing single-language fields
- In bilingual mode, all four fields (subjectDa, bodyHtmlDa, subjectEn, bodyHtmlEn) required
