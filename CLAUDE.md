# Greenspace Agent Instructions

This file defines required behavior for all AI agents working in this repository.

## 1. Non-Negotiable Workflow

Every task must follow these phases in order.

### Phase 1: Pre-Work (before editing code)
- Create or identify the GitHub issue for the task.
- Read the issue and confirm acceptance criteria.
- Add labels `agent active` and `claude` to the issue while work is in progress.
- Create `.agent/ticket-<issue-number>-plan.md` with:
  - current state
  - target state
  - task checklist
  - validation plan
- Branch from latest `main` using:
  - `ammonl/issue-<number>-<short-topic>`

### Phase 2: Execution
- Keep changes minimal and scoped to the issue.
- Follow architecture boundaries in this repo:
  - `apps/web`: frontend only
  - `apps/api`: backend API only
  - `packages/shared`: shared schemas/types/validators
  - `infra/terraform`: AWS infrastructure as code
- Do not mix unrelated refactors with feature work.
- If requirements are unclear, stop and ask before implementing.

### Phase 3: Validation
- Run required checks (or record why N/A):
  - `npm test`
  - `npm run lint`
  - `npm run build`
- For infra changes, also run:
  - `terraform fmt -check -recursive`
  - `terraform validate`
- Remove debug code and verify no accidental file churn.

### Phase 4: Submission
- Push branch and open PR linked to the issue.
- PR title must follow Conventional Commits.
- PR body must include:
  - scope summary
  - explicit non-goals
  - validation evidence
  - issue link
- Run a separate review pass and post findings as a PR review comment.
- Address review feedback or justify why not addressed.
- Remove `agent active` label when done.

## 2. Scope Guardrails

- Never implement behavior that conflicts with `docs/specs/greenspace-2026-spec.md`.
- Contract-first is mandatory:
  - update spec/ADR/API/data contract first when behavior changes
  - then implement code
- Do not edit secrets, credentials, or production config directly in code.
- Never use destructive git operations (`reset --hard`, `checkout --`) unless explicitly requested.

## 3. IaC Policy (Mandatory)

- All persistent AWS infrastructure must be managed in `infra/terraform`.
- No manual console provisioning for durable resources.
- Emergency manual changes require immediate Terraform back-port in the same task or a linked follow-up issue.

## 4. Task Sizing Rules

- Prefer vertical slices that can be reviewed in under ~300 changed lines.
- If larger work is needed, split into multiple issues/PRs:
  - contracts and schema
  - backend behavior
  - frontend behavior
  - infra

## 5. Communication Rules

- Be concise and factual.
- State assumptions explicitly.
- Report blockers immediately.
- When validation cannot run, record exact reason and command output summary.

## 6. Command Style Rules

- Do not chain commands with `&&`.
- Do not use heredocs in shell commands.
- Use temp files with `--body-file` for multiline GitHub CLI content.

## 7. Definition of Done

A task is done only when:
- Issue criteria are satisfied.
- Relevant docs/contracts are updated.
- Validation is complete (or N/A explained).
- PR is open with clear summary and evidence.
- Issue is updated and active label removed.
