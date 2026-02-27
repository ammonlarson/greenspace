# Greenspace

Greenspace is the UN17 rooftop greenhouse registration platform for the 2026 season.

Primary product specification:
- [Greenspace 2026 Spec](docs/specs/greenspace-2026-spec.md)

## Repository Layout

- `apps/web` - Next.js frontend for public and admin UI.
- `apps/api` - API services (registration, admin operations, email workflows).
- `packages/shared` - shared types, validation schemas, and i18n/domain constants.
- `infra/terraform` - AWS infrastructure as code (staging and production).
- `docs` - product specs, ADRs, API contracts, and data model docs.
- `.github` - CI workflows and contribution templates.

## Working Agreement

- Follow [AGENTS.md](AGENTS.md) for all task execution.
- Keep work issue-driven and scoped.
- Prefer contract-first changes:
  1. spec/ADR/API/data contract
  2. implementation
  3. tests/validation

## Guardrails

- No manual AWS infrastructure drift: persistent resources are Terraform-managed.
- Small PRs with explicit acceptance criteria mapping.
- CI checks are required before merge.
