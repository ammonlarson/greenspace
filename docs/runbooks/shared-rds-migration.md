# Shared-RDS Data Migration Runbook

## Overview

This runbook covers moving the Greenspace schema and data from the dedicated
per-environment RDS instances onto the centralized shared RDS owned by
`ammonlarson/infra-shared-db`. It is the data-preparation step. The
application cutover (env var flip, Lambda redeploy, smoke tests) is tracked
separately in #340 and uses this runbook as a prerequisite.

Scope:

- Backup and export of source databases (staging and prod).
- Schema deployment into the empty shared targets (`greenspace_staging`,
  `greenspace_prod`).
- Production data restore into `greenspace_prod`.
- Staging data handling — explicitly **no raw prod PII into staging**.
- Validation queries.
- Rollback plan.

Out of scope: tearing down the dedicated RDS instances (#337), wiring the
runtime to the shared-db secret contract (#342), the cutover itself (#340),
and connectivity (#338, already shipped — see ADR-0001).

## Prerequisites

- Operator workstation IP `/32` is currently in `allowed_ingress_cidrs` on
  the shared RDS (set in `infra-shared-db/terraform.tfvars`).
- `psql` and `pg_dump`/`pg_restore` (Postgres 16 client) available locally.
- AWS CLI logged in with permission to:
  - read `greenspace-<env>-2026-db-credentials` secrets (dedicated RDS
    master credentials).
  - read `rds/shared/greenspace_<env>` secrets (shared-db per-project
    credentials).
  - create RDS manual snapshots on `greenspace-<env>-2026-postgres`.
- Both shared-db projects exist in state (i.e. `infra-shared-db`
  PR #15 merged and applied locally per `ADDING_A_PROJECT.md`).
- Source databases are quiet enough for the export to be consistent. For
  production this means running this immediately before #340 cutover, after
  registration is closed or while traffic is gated.

## Variables used below

```bash
# Source (dedicated)
SRC_PROD_HOST=$(aws secretsmanager get-secret-value --secret-id greenspace-prod-2026-db-credentials --query SecretString --output text | jq -r .host)
SRC_STG_HOST=$(aws secretsmanager get-secret-value --secret-id greenspace-staging-2026-db-credentials --query SecretString --output text | jq -r .host)
SRC_PROD_PASS=$(aws secretsmanager get-secret-value --secret-id greenspace-prod-2026-db-credentials --query SecretString --output text | jq -r .password)
SRC_STG_PASS=$(aws secretsmanager get-secret-value --secret-id greenspace-staging-2026-db-credentials --query SecretString --output text | jq -r .password)

# Target (shared)
SHARED_HOST=$(aws secretsmanager get-secret-value --secret-id rds/shared/greenspace_prod --query SecretString --output text | jq -r .host)
TGT_PROD_USER=$(aws secretsmanager get-secret-value --secret-id rds/shared/greenspace_prod --query SecretString --output text | jq -r .username)
TGT_PROD_PASS=$(aws secretsmanager get-secret-value --secret-id rds/shared/greenspace_prod --query SecretString --output text | jq -r .password)
TGT_PROD_DB=$(aws secretsmanager get-secret-value --secret-id rds/shared/greenspace_prod --query SecretString --output text | jq -r .dbname)

TGT_STG_USER=$(aws secretsmanager get-secret-value --secret-id rds/shared/greenspace_staging --query SecretString --output text | jq -r .username)
TGT_STG_PASS=$(aws secretsmanager get-secret-value --secret-id rds/shared/greenspace_staging --query SecretString --output text | jq -r .password)
TGT_STG_DB=$(aws secretsmanager get-secret-value --secret-id rds/shared/greenspace_staging --query SecretString --output text | jq -r .dbname)
```

The shared-RDS host is the same for both projects; only the database/role
differ.

## Phase 1 — Backup the source databases

Take both forms of backup before doing anything destructive: a manual RDS
snapshot (the rollback artifact) and a `pg_dump --format=custom` (the
migration source for prod, archive-only for staging).

### 1.1 Manual RDS snapshots

```bash
TS=$(date -u +%Y%m%d-%H%M)

aws rds create-db-snapshot \
  --db-instance-identifier greenspace-prod-2026-postgres \
  --db-snapshot-identifier greenspace-prod-2026-pre-shared-cutover-$TS \
  --region eu-north-1

aws rds create-db-snapshot \
  --db-instance-identifier greenspace-staging-2026-postgres \
  --db-snapshot-identifier greenspace-staging-2026-pre-shared-cutover-$TS \
  --region eu-north-1
```

Wait for both to reach `available`:

```bash
aws rds wait db-snapshot-completed \
  --db-snapshot-identifier greenspace-prod-2026-pre-shared-cutover-$TS \
  --region eu-north-1

aws rds wait db-snapshot-completed \
  --db-snapshot-identifier greenspace-staging-2026-pre-shared-cutover-$TS \
  --region eu-north-1
```

These snapshots are retained independently of the source instance's
`backup_retention_period` and survive instance deletion. Keep both for at
least 30 days post-cutover.

### 1.2 `pg_dump` exports

```bash
mkdir -p ./greenspace-cutover-$TS
cd ./greenspace-cutover-$TS

PGPASSWORD="$SRC_PROD_PASS" pg_dump \
  --host="$SRC_PROD_HOST" \
  --port=5432 \
  --username=greenspace \
  --dbname=greenspace \
  --format=custom \
  --no-owner \
  --no-acl \
  --verbose \
  --file=greenspace_prod.dump

PGPASSWORD="$SRC_STG_PASS" pg_dump \
  --host="$SRC_STG_HOST" \
  --port=5432 \
  --username=greenspace \
  --dbname=greenspace \
  --format=custom \
  --no-owner \
  --no-acl \
  --verbose \
  --file=greenspace_staging.dump
```

Both files contain schema **and** data. We will use the prod dump's data
section in Phase 3. The staging dump is archived for reference only — see
Phase 4 for why staging is rebuilt rather than restored.

The dedicated RDS endpoints are publicly accessible (the dedicated stack
provisions them with `publicly_accessible = true` in the default config) so
this `pg_dump` runs from the operator laptop without needing to be inside
the VPC.

### 1.3 Capture pre-migration counts (prod only)

These row counts are used in Phase 5 validation. Run from the same operator
shell:

```bash
PGPASSWORD="$SRC_PROD_PASS" psql -h "$SRC_PROD_HOST" -U greenspace -d greenspace -c "
  SELECT 'greenhouses' AS t, count(*) FROM greenhouses
  UNION ALL SELECT 'planter_boxes', count(*) FROM planter_boxes
  UNION ALL SELECT 'admins', count(*) FROM admins
  UNION ALL SELECT 'admin_credentials', count(*) FROM admin_credentials
  UNION ALL SELECT 'admin_notification_preferences', count(*) FROM admin_notification_preferences
  UNION ALL SELECT 'sessions', count(*) FROM sessions
  UNION ALL SELECT 'system_settings', count(*) FROM system_settings
  UNION ALL SELECT 'registrations', count(*) FROM registrations
  UNION ALL SELECT 'waitlist_entries', count(*) FROM waitlist_entries
  UNION ALL SELECT 'emails', count(*) FROM emails
  UNION ALL SELECT 'audit_events', count(*) FROM audit_events;
" | tee prod-source-counts.txt
```

## Phase 2 — Bring the shared targets to current schema

Both shared-db project databases are empty. Run the app's existing inline
migrator against each. There are two paths; pick the one that matches where
in the cutover sequence you are.

### 2a. From the operator laptop (recommended pre-#342)

```bash
cd <repo root>

# Production target
DB_HOST="$SHARED_HOST" \
DB_PORT=5432 \
DB_NAME="$TGT_PROD_DB" \
DB_USER="$TGT_PROD_USER" \
DB_PASSWORD="$TGT_PROD_PASS" \
DB_SSL=true \
SEED_ADMIN_PASSWORD="<set this>" \
npm run db:setup --workspace=@greenspace/api

# Staging target
DB_HOST="$SHARED_HOST" \
DB_PORT=5432 \
DB_NAME="$TGT_STG_DB" \
DB_USER="$TGT_STG_USER" \
DB_PASSWORD="$TGT_STG_PASS" \
DB_SSL=true \
SEED_ADMIN_PASSWORD="<set this>" \
npm run db:setup --workspace=@greenspace/api
```

`db:setup` runs `migrateToLatest` followed by `seed`. The seed inserts
greenhouses, the 29-box catalog, and the default admin row. The greenhouses
and boxes are reference data — they're identical in source and target. The
default admin row will be replaced by the prod admin data in Phase 3, so
`SEED_ADMIN_PASSWORD` for the prod target is irrelevant (set anything; it
will be overwritten).

For staging, the seeded admin password matters — keep it short-lived and
rotate after cutover.

### 2b. Via the Lambda one-shot (post-#342, pre-cutover)

Once #342 has wired the runtime to read `DB_SECRET_ID`:

```bash
aws lambda invoke \
  --function-name greenspace-prod-2026-api \
  --payload '{"action":"migrate"}' \
  --cli-binary-format raw-in-base64-out \
  /tmp/migrate-prod.json

aws lambda invoke \
  --function-name greenspace-staging-2026-api \
  --payload '{"action":"migrate"}' \
  --cli-binary-format raw-in-base64-out \
  /tmp/migrate-staging.json
```

Each response should contain
`{"success":true,"executedMigrations":["001_initial_schema", ...]}`.

### 2.1 Verify schema landed on both targets

```bash
PGPASSWORD="$TGT_PROD_PASS" psql -h "$SHARED_HOST" -U "$TGT_PROD_USER" -d "$TGT_PROD_DB" -c "\dt"
PGPASSWORD="$TGT_STG_PASS"  psql -h "$SHARED_HOST" -U "$TGT_STG_USER"  -d "$TGT_STG_DB"  -c "\dt"
```

Expected tables: `admin_credentials`, `admin_notification_preferences`,
`admins`, `audit_events`, `emails`, `greenhouses`, `kysely_migration`,
`kysely_migration_lock`, `planter_boxes`, `registrations`, `sessions`,
`system_settings`, `waitlist_entries`.

Confirm `kysely_migration` lists every entry from
`apps/api/src/db/migration-registry.ts`.

## Phase 3 — Restore production data into `greenspace_prod`

Production-only step. Staging is handled in Phase 4.

### 3.1 Truncate the seed reference rows

The Phase 2 seed put greenhouses, boxes, and a default admin into
`greenspace_prod`. Clear them so the prod data restore is the sole source
of those rows. `audit_events` is empty at this stage — no trigger conflict.

```bash
PGPASSWORD="$TGT_PROD_PASS" psql -h "$SHARED_HOST" -U "$TGT_PROD_USER" -d "$TGT_PROD_DB" <<'SQL'
BEGIN;
TRUNCATE TABLE
  audit_events,
  emails,
  waitlist_entries,
  registrations,
  sessions,
  system_settings,
  admin_notification_preferences,
  admin_credentials,
  admins,
  planter_boxes,
  greenhouses
RESTART IDENTITY CASCADE;
COMMIT;
SQL
```

### 3.2 Restore data from the prod dump

```bash
PGPASSWORD="$TGT_PROD_PASS" pg_restore \
  --host="$SHARED_HOST" \
  --port=5432 \
  --username="$TGT_PROD_USER" \
  --dbname="$TGT_PROD_DB" \
  --data-only \
  --no-owner \
  --no-acl \
  --verbose \
  greenspace_prod.dump
```

Notes:

- `--data-only` skips the schema definitions in the dump (we already have
  them from Phase 2).
- The `audit_events` immutability trigger is `BEFORE UPDATE OR DELETE` and
  does **not** fire on INSERT/COPY. Because `pg_restore --data-only`
  only emits COPY and `setval()` (no UPDATE, no DELETE, no TRUNCATE), no
  trigger bypass is required. We deliberately omit `--disable-triggers`
  here: it would emit `ALTER TABLE ... DISABLE TRIGGER` which requires
  table-owner privilege, and depending on how `infra-shared-db` provisions
  ownership the `greenspace_prod_app` role may or may not own the tables
  it created in Phase 2.
- Sequences are reset by `setval` calls embedded in the data section of the
  custom-format dump. No manual sequence sync needed.

### 3.3 Re-verify trigger integrity post-restore

Confirm the audit trigger that the schema migration installed in Phase 2 is
still active for normal traffic:

```bash
PGPASSWORD="$TGT_PROD_PASS" psql -h "$SHARED_HOST" -U "$TGT_PROD_USER" -d "$TGT_PROD_DB" -c "
  SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'trg_audit_immutable';
"
```

`tgenabled` must be `O` (origin / enabled). Then confirm a forbidden
mutation actually fails:

```bash
PGPASSWORD="$TGT_PROD_PASS" psql -h "$SHARED_HOST" -U "$TGT_PROD_USER" -d "$TGT_PROD_DB" -c "
  DELETE FROM audit_events WHERE id = (SELECT id FROM audit_events LIMIT 1);
"
# Expected: ERROR: audit_events table is immutable: DELETE not allowed
```

## Phase 4 — Staging data handling (no raw prod PII)

**Decision: rebuild staging from `seed.ts` against the empty target. Do
not migrate any rows from the dedicated staging RDS into `greenspace_staging`.**

Rationale:

- The dedicated staging DB is QA scratch space. Its rows are real-shaped
  test data (names, emails, addresses entered by testers) and there is no
  business value in preserving them across the cutover.
- Migrating raw production PII into staging is explicitly prohibited by the
  acceptance criteria. Even though the *current* staging dataset is not
  prod data, the cleanest invariant is "staging gets only synthetic /
  reference data" — which the seed already provides.
- The seed gives a known-good baseline (29 boxes, 2 greenhouses, default
  admin) that QA can build on top of. It's reproducible and deterministic.
- Snapshotting the dedicated staging DB in Phase 1.1 preserves any test
  history that anyone wants to reconstruct later.

What staging gets:

- Schema from Phase 2 (all migrations applied).
- Seed data from Phase 2 (greenhouses, boxes, default admin).
- **No** further data from the dedicated staging RDS.

If a sanitized prod export ever becomes useful for staging load testing,
that's a follow-up: it needs a sanitization pipeline (PII scrubbing of
`registrations.email`, `registrations.name`, address fields,
`waitlist_entries.email`, `emails.recipient_email`,
`emails.body_html`, `audit_events.before/after`) before any rows enter
staging. That is **not** in scope for this ticket.

### 4.1 Rotate the seeded staging admin password

```bash
PGPASSWORD="$TGT_STG_PASS" psql -h "$SHARED_HOST" -U "$TGT_STG_USER" -d "$TGT_STG_DB" -c "
  SELECT a.email, ac.updated_at FROM admins a JOIN admin_credentials ac ON ac.admin_id = a.id;
"
```

Trigger an admin-initiated password reset via the normal admin flow once
the cutover ships, or set a one-shot value via the seed env var
`SEED_ADMIN_PASSWORD` and rotate immediately after.

## Phase 5 — Validation

### 5.1 Production row-count parity

Re-run the Phase 1.3 query against the target and diff against
`prod-source-counts.txt`:

```bash
PGPASSWORD="$TGT_PROD_PASS" psql -h "$SHARED_HOST" -U "$TGT_PROD_USER" -d "$TGT_PROD_DB" -c "
  SELECT 'greenhouses' AS t, count(*) FROM greenhouses
  UNION ALL SELECT 'planter_boxes', count(*) FROM planter_boxes
  UNION ALL SELECT 'admins', count(*) FROM admins
  UNION ALL SELECT 'admin_credentials', count(*) FROM admin_credentials
  UNION ALL SELECT 'admin_notification_preferences', count(*) FROM admin_notification_preferences
  UNION ALL SELECT 'sessions', count(*) FROM sessions
  UNION ALL SELECT 'system_settings', count(*) FROM system_settings
  UNION ALL SELECT 'registrations', count(*) FROM registrations
  UNION ALL SELECT 'waitlist_entries', count(*) FROM waitlist_entries
  UNION ALL SELECT 'emails', count(*) FROM emails
  UNION ALL SELECT 'audit_events', count(*) FROM audit_events
  ORDER BY 1;
" | tee prod-target-counts.txt

diff prod-source-counts.txt prod-target-counts.txt
```

Every row count must match. Any drift here blocks #340.

### 5.2 Production invariant spot-checks

```bash
PGPASSWORD="$TGT_PROD_PASS" psql -h "$SHARED_HOST" -U "$TGT_PROD_USER" -d "$TGT_PROD_DB" -c "
  -- 29 boxes total
  SELECT count(*) FROM planter_boxes;
  -- One active registration per apartment_key
  SELECT apartment_key, count(*) FROM registrations
  WHERE status = 'active' GROUP BY 1 HAVING count(*) > 1;
  -- One active occupant per box
  SELECT box_id, count(*) FROM registrations
  WHERE status = 'active' GROUP BY 1 HAVING count(*) > 1;
  -- Latest audit event matches source
  SELECT max(timestamp) FROM audit_events;
  -- Latest registration matches source
  SELECT max(created_at) FROM registrations;
"
```

The two duplicate-detection queries must return zero rows. Compare the
`max()` values to the same queries run against the dedicated source.

### 5.3 Staging baseline check

```bash
PGPASSWORD="$TGT_STG_PASS" psql -h "$SHARED_HOST" -U "$TGT_STG_USER" -d "$TGT_STG_DB" -c "
  SELECT 'greenhouses' AS t, count(*) FROM greenhouses
  UNION ALL SELECT 'planter_boxes', count(*) FROM planter_boxes
  UNION ALL SELECT 'admins', count(*) FROM admins
  UNION ALL SELECT 'registrations', count(*) FROM registrations
  UNION ALL SELECT 'waitlist_entries', count(*) FROM waitlist_entries
  UNION ALL SELECT 'audit_events', count(*) FROM audit_events;
"
```

Expected: 2 greenhouses, 29 planter_boxes, ≥1 admin, 0 registrations,
0 waitlist_entries, 0 audit_events. Anything else in staging means a
non-seed row leaked in — investigate before cutover.

### 5.4 Connectivity smoke

Once #342 has shipped (or in parallel from the operator laptop using the
shared-db secret), run a one-shot health check from the Lambda:

```bash
aws lambda invoke \
  --function-name greenspace-staging-2026-api \
  --payload '{"action":"health"}' \
  --cli-binary-format raw-in-base64-out \
  /tmp/health-staging.json
cat /tmp/health-staging.json
```

If the runtime hasn't been switched to shared-db yet (`DB_SECRET_ID` not
set), this validates the dedicated path and is not a true cutover signal —
only #340 owns that test.

## Phase 6 — Rollback plan

The migration is **non-destructive on the source side**. The dedicated RDS
instances are untouched by this runbook. They keep running, keep accepting
writes, and keep their automated backups. #337 (cleanup) does not run until
after #340 has stabilized, so the dedicated DBs are the rollback substrate
through the full cutover window.

Rollback scenarios:

### 6.1 Schema migration on shared target fails partway through Phase 2

`migrateToLatest` runs each migration in its own transaction. A failure
leaves the target in a known intermediate state and `kysely_migration` only
records successful migrations.

There is no operator-friendly CLI for `migrateDown` today; the function
exists in `apps/api/src/db/migrate.ts` but isn't wired to a script. The
fastest recovery is to drop everything in the shared target's project
schema and re-run Phase 2:

```bash
PGPASSWORD="$TGT_PROD_PASS" psql -h "$SHARED_HOST" -U "$TGT_PROD_USER" -d "$TGT_PROD_DB" <<'SQL'
DROP SCHEMA public CASCADE;
CREATE SCHEMA public AUTHORIZATION current_user;
GRANT ALL ON SCHEMA public TO current_user;
SQL
```

Then re-run Phase 2.

If the shared-db role lacks privilege to recreate `public` (depending on
how `infra-shared-db` provisions ownership), fall back to asking the
shared-db operator to drop and recreate the project database via
`infra-shared-db` (taint + apply on the target project module). The
shared-db roles, secrets, and ownership stay intact.

### 6.2 Data restore on `greenspace_prod` fails partway through Phase 3

Truncate everything (the Phase 3.1 SQL block) and re-run `pg_restore`.
Because `--data-only` doesn't touch schema, the schema version doesn't
need to be re-applied.

If repeated restores fail with a constraint violation, capture the
`pg_restore` log, leave the target in its truncated state, and abort the
cutover. The dedicated prod RDS is still authoritative.

### 6.3 Post-Phase-5 validation finds drift

If row counts or invariant checks fail, do not proceed to #340. Options:

1. Re-run Phase 3 (truncate + restore). The prod source is still
   authoritative; the dump was taken in Phase 1.
2. If the dump itself is suspect, retake it (Phase 1.2) — the prod RDS
   should still be quiet at this point in the cutover window.
3. If neither path resolves it, abandon the cutover for this window and
   restore from the manual snapshot taken in Phase 1.1.

### 6.4 Cutover (#340) fails after the env-var flip

This is technically out of scope for #341 but the data prepared by this
runbook is the rollback target. To revert: re-deploy the API with
`DB_SECRET_ID` removed and the dedicated `DB_HOST` / `DB_USER` /
`DB_SECRET_ARN` env vars restored (revert the #342 Terraform change). The
dedicated RDS is unchanged and resumes serving as before. The shared-db
target is left as-is for a retry.

### 6.5 Recovery from the manual snapshots

The Phase 1.1 snapshots survive everything. To restore:

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier greenspace-prod-2026-postgres-restored \
  --db-snapshot-identifier greenspace-prod-2026-pre-shared-cutover-<TS> \
  --db-instance-class db.t4g.micro \
  --db-subnet-group-name greenspace-prod-2026-db \
  --vpc-security-group-ids <db-security-group-id> \
  --region eu-north-1
```

See `backup-restore.md` for the full restore procedure.

## References

- Sibling tickets: #338 (connectivity), #339 (shared-db projects), #342
  (runtime secret contract), #340 (cutover), #337 (dedicated RDS cleanup).
- ADR-0001: `docs/adr/0001-shared-rds-connectivity.md`.
- App migrator: `apps/api/src/db/migration-registry.ts`,
  `apps/api/src/db/migrate.ts`.
- App seed: `apps/api/src/db/seed.ts`.
- Dedicated RDS Terraform:
  `infra/terraform/modules/greenspace_stack/database.tf`.
- Backup/restore base runbook: `docs/runbooks/backup-restore.md`.
- Shared-db operator docs: `infra-shared-db/ADDING_A_PROJECT.md`,
  `infra-shared-db/README.md`.
