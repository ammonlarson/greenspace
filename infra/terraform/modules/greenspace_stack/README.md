# greenspace_stack module

Top-level module placeholder for Greenspace AWS resources.

This module will eventually compose:
- API Gateway + Lambda
- RDS/Aurora
- SES configuration
- S3 assets bucket(s)
- IAM roles/policies
- DNS/TLS integration points

## Least-privilege IAM

SES send and CloudFront invalidation permissions are scoped to explicit ARNs
supplied via the required module variables `ses_identity_arns` and
`cloudfront_distribution_arns`. Wildcard (`*`) resources are not accepted;
input validations enforce correct ARN prefixes and non-empty lists.

Update these values in each environment's `main.tf` once the corresponding
SES identities and CloudFront distributions are provisioned.
