# Ticket #204: Per-Admin Email Notification Preferences

## Analysis

### Current State
- Emails are sent only to **users** (registration confirmations, etc.)
- No system for sending operational notification emails **to admins**
- No per-admin preference storage exists

### Target State
- Admins can opt in/out of two notification categories:
  1. **User registration/switch events**: When public users register or switch boxes
  2. **Admin box actions**: When other admins perform box actions (reserve, release, add registration, move, remove, waitlist assign)
- Opted-in admins receive email notifications for relevant events
- Admins do NOT receive self-notifications for their own box actions
- Preferences persist in the database

### Approach
1. Add `admin_notification_preferences` table via migration
2. Create admin notification email builder (English only)
3. Add GET/PATCH API endpoints for preferences
4. Wire notification sends into public registration + admin box action flows
5. Add UI toggles in admin settings

## Task Checklist

- [ ] Database migration: `admin_notification_preferences` table
- [ ] Update `Database` interface in `types.ts`
- [ ] Create `admin-ops-notifications.ts` (email template + send logic)
- [ ] Add preference routes to `settings.ts`
- [ ] Register new routes in `index.ts`
- [ ] Wire into `public.ts` (handlePublicRegister)
- [ ] Wire into `boxes.ts` (handleReserveBox, handleReleaseBox)
- [ ] Wire into `registrations.ts` (create, move, remove, waitlist_assign)
- [ ] Add UI component `AdminNotificationPreferences.tsx`
- [ ] Update `AdminSettings.tsx` to include preferences section
- [ ] Add i18n translations
- [ ] Write tests for new functionality
- [ ] Run tests, lint, build

## Implementation Summary

### Files to create
- `apps/api/src/db/migrations/003_admin_notification_preferences.ts`
- `apps/api/src/lib/admin-ops-notifications.ts`
- `apps/api/src/lib/admin-ops-notifications.test.ts`
- `apps/web/src/components/AdminNotificationPreferences.tsx`

### Files to modify
- `apps/api/src/db/types.ts` — add table interface
- `apps/api/src/db/migration-registry.ts` — register migration
- `apps/api/src/routes/admin/settings.ts` — add preference endpoints
- `apps/api/src/routes/admin/settings.test.ts` — add preference tests
- `apps/api/src/index.ts` — register new routes
- `apps/api/src/routes/public.ts` — trigger admin notifications on register/switch
- `apps/api/src/routes/admin/boxes.ts` — trigger admin notifications on reserve/release
- `apps/api/src/routes/admin/registrations.ts` — trigger admin notifications on box actions
- `apps/web/src/components/AdminSettings.tsx` — include preferences component
- `apps/web/src/i18n/translations.ts` — add translation keys

### Estimated Impact
- Low risk — additive feature, no changes to existing notification behavior
- All new admin notification sends are fire-and-forget (errors logged, never fail callers)
