# Launch Readiness Checklist

## Overview

Pre-launch verification and production cutover plan for Greenspace 2026. Complete all sections before the registration opening date.

**Opening date:** 2026-04-01 at 10:00 Europe/Copenhagen
**Primary contact:** Elise Larson (elise7284@gmail.com)

## 1. Staging Sign-Off

Complete all checks in the staging environment before proceeding to production.

### 1.1 Infrastructure

- [ ] Terraform apply is clean (no pending changes)
- [ ] Drift detection workflow has run with no drift issues
- [ ] Lambda function is deployed and healthy (`/health` returns 200)
- [ ] RDS instance is running, migrations applied, seed data present
- [ ] VPC networking: Lambda can reach RDS via private subnet
- [ ] NAT gateway operational (Lambda can reach SES and external services)
- [ ] CloudWatch log group is receiving Lambda logs
- [ ] KMS key is active for log encryption

### 1.2 Database & Data

- [ ] Greenhouses seeded: Kronen, Søen
- [ ] All 29 planter boxes seeded with correct names and greenhouse assignments
- [ ] All boxes in `available` state (no stale registrations from testing)
- [ ] System settings row exists with correct opening datetime
- [ ] Opening datetime matches planned launch: `2026-04-01T10:00:00 Europe/Copenhagen`
- [ ] Audit events table is empty or contains only seed/test data

**Verification queries (run against staging DB):**

```sql
SELECT name FROM greenhouses ORDER BY name;

SELECT COUNT(*) AS total_boxes,
       COUNT(*) FILTER (WHERE state = 'available') AS available
FROM planter_boxes;

SELECT opening_datetime AT TIME ZONE 'Europe/Copenhagen' AS opens_at
FROM system_settings;
```

### 1.3 API Endpoints

- [ ] `GET /health` — returns 200
- [ ] `GET /public/status` — returns correct `registrationOpen` flag (should be `false` before opening date)
- [ ] `GET /public/greenhouses` — returns both greenhouses with correct box counts
- [ ] `GET /public/boxes` — returns all 29 boxes with correct states
- [ ] `POST /public/validate-address` — accepts eligible address, rejects ineligible
- [ ] `POST /public/validate-registration` — validates complete input
- [ ] `POST /public/register` — creates registration (use a test address, clean up after)
- [ ] `POST /public/waitlist` — rejects when boxes are available (correct behavior pre-launch)
- [ ] `POST /admin/auth/login` — admin login works with seeded credentials
- [ ] `GET /admin/registrations` — returns registrations (empty or test data)
- [ ] `PUT /admin/settings/opening-time` — can update opening datetime
- [ ] `GET /admin/audit` — returns audit trail

### 1.4 Email

- [ ] SES domain identity verified (`staging.un17hub.com`)
- [ ] DKIM records active and passing
- [ ] Test registration triggers confirmation email
- [ ] Email appears in `emails` table with status `sent`
- [ ] Email sender shows `greenspace@staging.un17hub.com`
- [ ] Reply-to is `elise7284@gmail.com`
- [ ] Email content is bilingual (matches selected language)

### 1.5 Admin Accounts

- [ ] Admin accounts created for: `elise7284@gmail.com`, `lena@gmail.com`
- [ ] Both admins can log in and access admin endpoints
- [ ] Admin passwords have been changed from seed defaults
- [ ] Session expiry works (logout after inactivity)

### 1.6 Monitoring

- [ ] CloudWatch dashboard loads with all 8 metric widgets
- [ ] SNS alarm topic has email subscription confirmed
- [ ] Test alarm triggers notification email delivery
- [ ] Lambda error alarm is configured (>0 errors for 2×5 min)
- [ ] RDS alarms configured (CPU, memory, connections)
- [ ] SES alarms configured (bounces, complaints)

**Staging sign-off:**

| Role | Name | Date | Approved |
|------|------|------|----------|
| Owner | | | ☐ |
| Developer | | | ☐ |

---

## 2. Production Deploy Plan

### 2.1 Pre-Deploy

- [ ] All staging sign-off items are complete and approved
- [ ] No open P1/P2 issues in the repository
- [ ] All CI checks pass on `main` branch
- [ ] Terraform plan for production shows no unexpected changes

### 2.2 Infrastructure Deploy

Production infrastructure is deployed via the Terraform workflow on merge to `main`.

1. Verify Terraform plan output for the `prod` environment (check CI artifacts)
2. Confirm the `production` GitHub environment protection rule requires approval
3. Approve the production Terraform apply
4. Wait for apply to complete successfully

**Post-infra verification:**

- [ ] RDS instance is running with Multi-AZ enabled
- [ ] Lambda function is provisioned in VPC private subnets
- [ ] SES domain identity verified (`un17hub.com`)
- [ ] DKIM records active
- [ ] CloudWatch alarms and dashboard created
- [ ] SNS alarm subscription confirmed

### 2.3 Application Deploy

Application code is deployed via the Deploy API workflow on merge to `main`.

1. Merge the latest code to `main` (or trigger `workflow_dispatch`)
2. Monitor the `Deploy (staging)` job — confirm health check passes
3. Approve the `Deploy (prod)` job when staging is green
4. Monitor the production health check

### 2.4 Database Setup

- [ ] Run migrations against production database
- [ ] Run seed script (greenhouses, boxes, system settings, admin accounts)
- [ ] Verify seed data with the queries from section 1.2
- [ ] Change admin passwords from seed defaults immediately

### 2.5 Post-Deploy Configuration

- [ ] Set opening datetime to `2026-04-01T10:00:00 Europe/Copenhagen` via admin API
- [ ] Verify `/public/status` returns `registrationOpen: false` (before opening)
- [ ] Confirm alarm notification email is subscribed and confirmed

---

## 3. Post-Deploy Smoke Tests

Run these tests against the production API endpoint immediately after deployment.

### 3.1 Health & Status

```bash
# Health check
curl -s "${PROD_API_URL}/health" | jq .

# Registration status (should show registrationOpen: false before opening)
curl -s "${PROD_API_URL}/public/status" | jq .
```

- [ ] `/health` returns `{ "status": "ok" }`
- [ ] `/public/status` returns correct opening datetime and `registrationOpen` flag

### 3.2 Public Endpoints

```bash
# Greenhouse summaries
curl -s "${PROD_API_URL}/public/greenhouses" | jq .

# All boxes
curl -s "${PROD_API_URL}/public/boxes" | jq .
```

- [ ] `/public/greenhouses` returns 2 greenhouses (Kronen, Søen) with correct total counts
- [ ] `/public/boxes` returns 29 boxes, all in `available` state
- [ ] No test or stale data present

### 3.3 Address Validation

```bash
# Eligible address
curl -s -X POST "${PROD_API_URL}/public/validate-address" \
  -H "Content-Type: application/json" \
  -d '{"street":"Else Alfelts Vej","houseNumber":130,"floor":null,"door":null}' | jq .

# Ineligible address
curl -s -X POST "${PROD_API_URL}/public/validate-address" \
  -H "Content-Type: application/json" \
  -d '{"street":"Main Street","houseNumber":1,"floor":null,"door":null}' | jq .
```

- [ ] Eligible address returns `{ "eligible": true }`
- [ ] Ineligible address returns `{ "eligible": false }`

### 3.4 Admin Access

```bash
# Admin login
curl -s -X POST "${PROD_API_URL}/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"elise7284@gmail.com","password":"<password>"}' \
  -c /tmp/cookies.txt | jq .

# Fetch registrations (with session cookie)
curl -s "${PROD_API_URL}/admin/registrations" \
  -b /tmp/cookies.txt | jq .
```

- [ ] Admin login returns 200 with session cookie
- [ ] Admin endpoints are accessible with valid session
- [ ] Admin endpoints return 401 without session cookie

### 3.5 Email Delivery

- [ ] Send a test registration (use a designated test address)
- [ ] Confirm email appears in `emails` table with status `sent`
- [ ] Confirm email is received in the test inbox
- [ ] Sender shows `greenspace@un17hub.com`
- [ ] Reply-to is `elise7284@gmail.com`
- [ ] Clean up test registration and reset box state

### 3.6 Monitoring

- [ ] CloudWatch dashboard shows Lambda invocation metrics
- [ ] Log group contains entries from smoke test requests
- [ ] No alarms in ALARM state

---

## 4. Go / No-Go Decision

### 4.1 Criteria

All items must be checked for a GO decision.

| Category | Criteria | Status |
|----------|----------|--------|
| Infrastructure | Terraform applied, no drift | ☐ |
| Database | Migrations run, seed data verified | ☐ |
| API | All smoke tests pass | ☐ |
| Email | SES verified, test email delivered | ☐ |
| Admin | Accounts created, passwords changed | ☐ |
| Monitoring | Alarms active, dashboard operational | ☐ |
| Opening datetime | Set to 2026-04-01T10:00:00 Europe/Copenhagen | ☐ |
| Stakeholder approval | Owner has reviewed and approved | ☐ |

### 4.2 Decision

| | |
|---|---|
| **Decision** | ☐ GO / ☐ NO-GO |
| **Date** | |
| **Decided by** | |
| **Notes** | |

### 4.3 No-Go Actions

If the decision is NO-GO, document:

- Blocking issue(s) and owner(s)
- Remediation plan with timeline
- Revised launch target date
- Re-assessment date for next go/no-go review

---

## 5. Rollback Plan

If critical issues are discovered after launch:

1. **API rollback:** Redeploy the previous Lambda version
   ```bash
   aws lambda update-function-code \
     --function-name greenspace-prod-2026-api \
     --s3-bucket <previous-artifact-bucket> \
     --s3-key <previous-artifact-key> \
     --publish
   ```
   Alternatively, revert the commit on `main` and let the deploy workflow run.

2. **Database rollback:** Use point-in-time restore (see [backup-restore.md](backup-restore.md))

3. **Communication:** Notify stakeholders (Elise, Lena) immediately. Update the opening datetime to a future date to pause registrations.

---

## 6. Post-Launch Monitoring

For the first 48 hours after opening:

- [ ] Monitor CloudWatch dashboard for error spikes
- [ ] Check `emails` table for any `failed` status entries
- [ ] Review audit trail for unexpected patterns
- [ ] Verify registration counts match expectations
- [ ] Confirm no SES bounce/complaint alarms
- [ ] Check RDS connection count stays within normal range

**Escalation:** See [incident-triage.md](incident-triage.md) for alarm investigation procedures.
