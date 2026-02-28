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

- Follow [CLAUDE.md](CLAUDE.md) for all task execution.
- Keep work issue-driven and scoped.
- Prefer contract-first changes:
  1. spec/ADR/API/data contract
  2. implementation
  3. tests/validation

## CI / Terraform Pipeline

Two workflows handle infrastructure:

- **CI (`ci.yml`)** - Runs on every PR and push to main. Validates guardrail files, runs app checks (test/lint/build), and performs lightweight `terraform fmt -check` + `terraform validate` with the backend disabled.
- **Terraform (`terraform.yml`)** - Runs when `infra/terraform/**` files change. Authenticates to AWS via GitHub OIDC and operates per environment.

### Pull requests (internal)

Each environment gets its own plan job. Plan output is uploaded as a CI artifact.

### Pull requests (forks)

Fork PRs receive no AWS credentials. The workflow falls back to backend-disabled `validate` only.

### Merge to main

Staging is applied first. Production applies only after staging succeeds and requires manual approval via the `production` GitHub environment protection rule.

Concurrency guards prevent simultaneous applies to the same environment.

### IAM setup

Each environment defines a `ci-terraform` IAM role assumed via GitHub OIDC (`aws-actions/configure-aws-credentials`). Role ARNs are stored in GitHub repository variables:

| Variable              | Purpose                                 |
| --------------------- | --------------------------------------- |
| `TF_ROLE_ARN_STAGING` | OIDC role ARN for staging plan/apply    |
| `TF_ROLE_ARN_PROD`    | OIDC role ARN for production plan/apply |

The roles grant least-privilege access to the S3 state backend, DynamoDB lock table, and the specific AWS resources managed by Terraform (VPC, IAM, KMS, CloudWatch Logs, Lambda, RDS, Secrets Manager).

### Operational safeguards

- Fork PRs never receive privileged credentials.
- `concurrency` groups prevent parallel applies per environment.
- Prod apply is gated behind staging success and the `production` environment protection rule.
- Plan output is saved as an artifact for audit.

## Guardrails

- No manual AWS infrastructure drift: persistent resources are Terraform-managed.
- Small PRs with explicit acceptance criteria mapping.
- CI checks are required before merge.
