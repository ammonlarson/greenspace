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

SES send permissions are scoped to the SES domain identity provisioned by the
module (`aws_ses_domain_identity`). CloudFront invalidation permissions are
scoped to explicit ARNs supplied via `cloudfront_distribution_arns`. Wildcard
(`*`) resources are not accepted; input validations enforce correct ARN
prefixes and non-empty lists.

## SES email configuration

Each environment provisions its own SES domain identity, DKIM signing, and
configuration set. Sender addresses default to `greenspace@<ses_sender_domain>`
and can be overridden via `ses_sender_email`. Reply-To defaults to
`elise7284@gmail.com` (spec default) and can be overridden via
`ses_reply_to_email`.

| Environment | Domain                 | Sender address                        | Reply-To                |
|-------------|------------------------|---------------------------------------|-------------------------|
| staging     | `staging.un17hub.com`  | `greenspace@staging.un17hub.com`      | `elise7284@gmail.com`   |
| prod        | `un17hub.com`          | `greenspace@un17hub.com`              | `elise7284@gmail.com`   |

### DNS verification

Route 53 hosted zones and DNS records for SES domain verification and DKIM
are managed by Terraform. After the first `terraform apply`:

1. **Point your registrar's nameservers** to the Route 53 zone nameservers
   (output: `route53_nameservers`).
2. **Delegate the staging subdomain** by adding an NS record in the prod
   Route 53 zone for `staging.un17hub.com` pointing to the staging zone's
   nameservers.
3. SES will verify the domain and enable DKIM signing automatically once DNS
   propagates.
