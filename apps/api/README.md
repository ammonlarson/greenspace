# apps/api

Backend API application.

Responsibilities:
- Public endpoints for status, availability, registration, waitlist.
- Admin endpoints for authentication and management operations.
- Audit event recording and outbound email orchestration.

Must not contain:
- frontend rendering code
- infrastructure provisioning logic

## Database

Uses [Kysely](https://kysely.dev/) as a type-safe query builder with PostgreSQL.

### Schema

The schema is managed through Kysely migrations in `src/db/migrations/`. The initial migration creates all 10 core tables:

- `greenhouses` - Greenhouse records (Kronen, Søen)
- `planter_boxes` - 29 named planter boxes with state tracking
- `admins` - Admin accounts
- `admin_credentials` - Hashed admin passwords
- `sessions` - Admin session management
- `system_settings` - Opening datetime configuration
- `registrations` - Box registrations with address normalization
- `waitlist_entries` - Ordered waitlist by apartment
- `emails` - Outbound email log with edit tracking
- `audit_events` - Immutable audit trail (protected by trigger)

### Key constraints

- One active registration per normalized apartment key (partial unique index)
- One active occupant per box (partial unique index)
- Box state restricted to: available, occupied, reserved
- Audit events are immutable (UPDATE/DELETE blocked by trigger)
- Waitlist FIFO ordering by `created_at`

### Seed data

The seed module (`src/db/seed.ts`) populates:
- 2 greenhouses (Kronen, Søen)
- 29 planter boxes with spec naming and numbering
- Default opening datetime (2026-04-01 10:00 Europe/Copenhagen)
- 2 initial admin accounts (passwords must be hashed at seed time)

### Running migrations

```typescript
import { createDatabase, migrateToLatest } from "./db/index.js";

const db = createDatabase({ host, port, database, user, password });
await migrateToLatest(db);
```
