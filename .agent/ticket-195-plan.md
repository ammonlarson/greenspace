# Ticket #195 - Restore PR #179 changes overwritten by PR #191

## Analysis

PR #179 converted box ID inputs from `<input type="number">` to `<select>` dropdowns using `BOX_CATALOG` in the admin add-registration and move-registration flows. PR #191 (visual redesign) inadvertently reverted these changes back to plain number inputs.

**Current state**: Box ID fields are `<input type="number">` in both add and move dialogs.
**Target state**: Box ID fields are `<select>` dropdowns populated from `BOX_CATALOG` with standardized labels.

## Task Checklist

- [x] Add `BOX_CATALOG` import to AdminRegistrations.tsx
- [x] Add `formatBoxLabel` helper function
- [x] Replace add-box-id `<input>` with `<select>` dropdown
- [x] Replace move-new-box-id `<input>` with `<select>` dropdown
- [x] Add missing dropdown tests to AdminRegistrations.test.tsx
- [x] Run tests, lint, build

## Implementation Summary

**Files to modify:**
- `apps/web/src/components/AdminRegistrations.tsx` - Restore dropdown UI
- `apps/web/src/components/AdminRegistrations.test.tsx` - Restore dropdown tests

**Estimated impact**: Low - UI-only change, no backend changes needed.
