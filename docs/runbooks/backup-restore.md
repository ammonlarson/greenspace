# Backup & Restore Runbook

## Overview

Greenspace's transactional data lives on the **shared RDS instance owned by
`ammonlarson/infra-shared-db`** (databases `greenspace_staging` and
`greenspace_prod`). The dedicated per-environment RDS instances were
decommissioned in #347 after the shared-db cutover (#342 / #346).

As a result, RDS automated backups, snapshots, and point-in-time restore for
the live database are **managed by the `ammonlarson/infra-shared-db` repo**, not
by this stack. Backup retention, the backup window, and encryption settings for
the shared instance are configured there. Refer to that repo's runbook for the
authoritative restore procedure.

For the data-migration context (how the Greenspace schema and data were moved
onto the shared instance), see `docs/runbooks/shared-rds-migration.md`.

## Restoring Greenspace data on the shared RDS

The shared RDS hosts one database per Greenspace environment. Restore work is
performed by the shared-db owner, but the Greenspace-specific steps are:

1. **Identify the target restore point** — the UTC timestamp just before the
   data-loss or corruption event.
2. **Coordinate with the shared-db owner** to restore the shared instance (or a
   clone of it) to that point in time. Never restore in place on the live shared
   instance; restore to a new instance and validate first.
3. **Verify restored Greenspace data** against the restored instance:

   ```bash
   psql -h <restored-endpoint> -U greenspace_<env> -d greenspace_<env> -c "
     SELECT COUNT(*) FROM registrations;
     SELECT COUNT(*) FROM emails;
     SELECT MAX(created_at) FROM audit_events;
   "
   ```

   Compare row counts and latest timestamps against expected values.
4. **Cut back over** by repointing the relevant `rds/shared/greenspace_<env>`
   Secrets Manager secret (consumed by the API Lambda via `DB_SECRET_ID`) at the
   validated host, or by promoting the restored instance. For production, always
   get explicit approval before proceeding.

## Decommission retention (one-time, completed in #347)

When the dedicated RDS instances were torn down, the following retention steps
applied:

- **Staging:** no final snapshot retained — the dedicated staging DB was QA
  scratch space and its data was already migrated.
- **Production:** before destroy, disable `deletion_protection` and take a
  **manual final snapshot** of `greenspace-prod-2026-postgres` so the
  pre-cutover prod data remains recoverable independently of the shared
  instance. The data itself was already migrated to and validated on the shared
  RDS (#340).

These steps are historical; the dedicated instances no longer exist.

## References

- [RDS Point-in-Time Recovery](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIT.html)
- Shared-RDS connectivity ADR: `docs/adr/0001-shared-rds-connectivity.md`
- Shared-RDS migration runbook: `docs/runbooks/shared-rds-migration.md`
- Incident triage: `docs/runbooks/incident-triage.md`
