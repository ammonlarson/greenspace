# Terraform Layout

This directory contains environment stacks and reusable modules.

## Conventions

- Use one environment directory per deploy target.
- Keep modules focused and composable.
- Tag all resources with:
  - `project=greenspace`
  - `season=2026`
  - `environment=<env>`
  - `managed_by=terraform`

## Planned Backend

Remote state (to be bootstrapped in a dedicated infra task):
- S3 backend for state
- DynamoDB for state locking
