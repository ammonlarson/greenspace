# Validates that IAM policies do not use wildcard resources.
# Run with: terraform test

variables {
  environment          = "test"
  vpc_cidr             = "10.99.0.0/16"
  availability_zones   = ["eu-north-1a", "eu-north-1b"]
  public_subnet_cidrs  = ["10.99.1.0/24", "10.99.2.0/24"]
  private_subnet_cidrs = ["10.99.10.0/24", "10.99.11.0/24"]

  ses_sender_domain            = "test.example.com"
  cloudfront_distribution_arns = ["arn:aws:cloudfront::000000000000:distribution/TESTDISTID"]
}

run "ses_policy_uses_scoped_arns" {
  command = plan

  assert {
    condition     = !contains([for s in jsondecode(data.aws_iam_policy_document.api_ses.json).Statement : s if s.Sid == "SESSend"][0].Resource, "*")
    error_message = "SES send policy must not use wildcard '*' resource. Scope to specific identity ARN(s)."
  }
}

run "cloudfront_policy_uses_scoped_arns" {
  command = plan

  assert {
    condition     = !contains([for s in jsondecode(data.aws_iam_policy_document.ci_deploy_permissions.json).Statement : s if s.Sid == "CloudFrontInvalidation"][0].Resource, "*")
    error_message = "CloudFront invalidation policy must not use wildcard '*' resource. Scope to specific distribution ARN(s)."
  }
}

run "cloudfront_arns_reject_empty_list" {
  command = plan

  variables {
    cloudfront_distribution_arns = []
  }

  expect_failures = [var.cloudfront_distribution_arns]
}

run "cloudfront_arns_reject_invalid_prefix" {
  command = plan

  variables {
    cloudfront_distribution_arns = ["arn:aws:s3:::some-bucket"]
  }

  expect_failures = [var.cloudfront_distribution_arns]
}

run "cloudfront_arns_reject_wildcard_in_arn" {
  command = plan

  variables {
    cloudfront_distribution_arns = ["arn:aws:cloudfront:*"]
  }

  expect_failures = [var.cloudfront_distribution_arns]
}

run "ses_sender_domain_reject_invalid" {
  command = plan

  variables {
    ses_sender_domain = "not a domain!"
  }

  expect_failures = [var.ses_sender_domain]
}
