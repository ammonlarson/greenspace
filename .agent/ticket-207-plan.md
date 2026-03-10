# Ticket 207 - Use friendly action names in audit-log filter options

## Analysis

**Current state:** The AuditTimeline component renders audit action codes directly (e.g., `registration_create`, `box_state_change`) in both the filter dropdown and the event table. These are internal identifiers, not user-friendly.

**Target state:** Display human-readable labels (e.g., "Registration Created", "Box State Changed") in the action filter dropdown and the action column of the event table, while preserving the underlying filter values sent to the API.

**Approach:**
- Add translation keys for each audit action in both `da` and `en` locales
- Update `AuditTimeline.tsx` to use `t()` for displaying audit action labels
- Keep `<option value={a}>` unchanged so the API filter value remains the raw action code

## Task Checklist

- [x] Add labels to issue
- [x] Create plan document
- [ ] Set up feature branch from main
- [ ] Add `audit.action.<action_name>` translation keys for all 16 AUDIT_ACTIONS (da + en)
- [ ] Update AuditTimeline filter dropdown to show translated labels
- [ ] Update AuditTimeline table action column to show translated labels
- [ ] Run lint, build, tests
- [ ] Create PR, run review, address feedback

## Implementation Summary

**Files to modify:**
1. `apps/web/src/i18n/translations.ts` - Add 16 translation keys per language (32 total)
2. `apps/web/src/components/AuditTimeline.tsx` - Use `t()` for action display in dropdown + table

**Estimated impact:** Low risk, UI-only change. No API or DB changes needed.
