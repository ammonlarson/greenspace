# infra

Infrastructure as code for Greenspace.

All persistent AWS resources must be defined under `infra/terraform`.

Structure:
- `terraform/modules` reusable building blocks
- `terraform/environments/staging` staging stack
- `terraform/environments/prod` production stack
