# Ticket #229 — Standardize displayed addresses

## Analysis

**Current state**: Addresses are displayed using the raw `apartment_key` (e.g., `else alfelts vej 138/1-tv`), which is a normalized lowercase key meant for uniqueness constraints, not user display.

**Target state**: Addresses displayed as `Else Alfelts Vej [house_number] [floor]. [apartment]` with graceful handling of missing apartment/door values.

**Approach**: Create a shared `formatAddress` utility and apply it in all address display surfaces.

## Task Checklist

- [ ] Add `formatAddress` function to `packages/shared/src/validators.ts`
- [ ] Export from `packages/shared/src/index.ts`
- [ ] Update `AdminRegistrations.tsx` — table cell (line 700) and assign dialog (line 193)
- [ ] Update `AdminWaitlist.tsx` — table cell (line 373) and assign dialog (line 193)
- [ ] Add unit tests for `formatAddress`
- [ ] Run tests, lint, build

## Implementation Summary

**Files to modify:**
- `packages/shared/src/validators.ts` — add `formatAddress()` function
- `packages/shared/src/index.ts` — export `formatAddress`
- `apps/web/src/components/AdminRegistrations.tsx` — replace `apartment_key` display with `formatAddress`
- `apps/web/src/components/AdminWaitlist.tsx` — replace `apartment_key` display with `formatAddress`
- `packages/shared/src/validators.test.ts` — add tests for `formatAddress`

**Format rules:**
- `Else Alfelts Vej 138 1. tv` (with floor and door)
- `Else Alfelts Vej 138 1.` (with floor, no door)
- `Else Alfelts Vej 122` (no floor or door)
