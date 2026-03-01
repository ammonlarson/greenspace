# Greenspace

Greenspace is the UN17 rooftop greenhouse registration platform for the 2026 season.

Primary product specification:
- [Greenspace 2026 Spec](docs/specs/greenspace-2026-spec.md)
- [Architecture Overview](docs/architecture.md)

## Repository Layout

- [`apps/web`](apps/web/) - Next.js 15 frontend for public and admin UI.
- [`apps/api`](apps/api/) - API services (registration, admin operations, email workflows).
- [`packages/shared`](packages/shared/) - Shared types, validation schemas, and i18n/domain constants.
- [`infra/`](infra/) - AWS infrastructure as code.
  - [`infra/terraform`](infra/terraform/) - Terraform modules and environment stacks.
  - [`infra/terraform/modules/greenspace_stack`](infra/terraform/modules/greenspace_stack/) - Shared AWS resource module.
- [`docs/`](docs/) - Product specs, architecture, ADRs, API contracts, and data model docs.
  - [`docs/architecture.md`](docs/architecture.md) - System architecture with diagrams.
  - [`docs/api/openapi.yaml`](docs/api/openapi.yaml) - OpenAPI 3.1 contract.
  - [`docs/data/schema.md`](docs/data/schema.md) - Data contract and invariants.
  - [`docs/adr/`](docs/adr/) - Architecture Decision Records.
- `.github` - CI workflows and contribution templates.

## Local Development

### Prerequisites

- Node.js >= 20
- PostgreSQL 16 (via Docker or a local install)

### 1. Start PostgreSQL

**Docker:**

```bash
docker run -d --name greenspace-db \
  -e POSTGRES_DB=greenspace \
  -e POSTGRES_USER=greenspace \
  -e POSTGRES_PASSWORD=localdev \
  -p 5432:5432 \
  postgres:16
```

**Homebrew (macOS):**

```bash
brew install postgresql@16
brew services start postgresql@16
createuser greenspace
createdb -O greenspace greenspace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run database migrations and seed data

```bash
DB_PASSWORD=localdev npm run db:setup --workspace=@greenspace/api
```

This runs all Kysely migrations and seeds greenhouses, planter boxes, system settings, and an initial admin account. The default admin password is `changeme123` (override with `SEED_ADMIN_PASSWORD`).

### 4. Start the API dev server

```bash
DB_PASSWORD=localdev npm run dev --workspace=@greenspace/api
```

The API starts on `http://localhost:3001` by default (override with `API_PORT`).

### 5. Start the frontend

```bash
npm run dev --workspace=@greenspace/web
```

The Next.js dev server starts on `http://localhost:3000` and proxies API routes (`/public/*`, `/admin/*`, `/health`) to the API dev server.

### Environment variables (API)

| Variable              | Default       | Description                     |
| --------------------- | ------------- | ------------------------------- |
| `DB_HOST`             | `localhost`   | PostgreSQL host                 |
| `DB_PORT`             | `5432`        | PostgreSQL port                 |
| `DB_NAME`             | `greenspace`  | Database name                   |
| `DB_USER`             | `greenspace`  | Database user                   |
| `DB_PASSWORD`         | (empty)       | Database password               |
| `DB_SSL`              | `false`       | Enable SSL for DB connection    |
| `API_PORT`            | `3001`        | Local dev server port           |
| `SEED_ADMIN_PASSWORD` | `changeme123` | Initial admin password for seed |

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
