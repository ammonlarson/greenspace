terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }

  backend "s3" {
    bucket         = "greenspace-2026-tfstate"
    key            = "environments/prod/terraform.tfstate"
    region         = "eu-north-1"
    dynamodb_table = "greenspace-2026-tflock"
    encrypt        = true
  }
}

provider "aws" {
  region = "eu-north-1"

  default_tags {
    tags = {
      project     = "greenspace"
      season      = "2026"
      environment = "prod"
      managed_by  = "terraform"
    }
  }
}

module "greenspace_stack" {
  source             = "../../modules/greenspace_stack"
  environment        = "prod"
  github_environment = "production"

  vpc_cidr             = "10.1.0.0/16"
  availability_zones   = ["eu-north-1a", "eu-north-1b"]
  public_subnet_cidrs  = ["10.1.1.0/24", "10.1.2.0/24"]
  private_subnet_cidrs = ["10.1.10.0/24", "10.1.11.0/24"]
  log_retention_days   = 90

  db_instance_class        = "db.t4g.small"
  db_allocated_storage     = 20
  db_max_allocated_storage = 100
  db_backup_retention_days = 35
  db_multi_az              = true

  ses_sender_domain  = "un17hub.com"
  ses_reply_to_email = "elise7284@gmail.com"

  # TODO: replace placeholder ARN with actual value once CloudFront distribution is provisioned
  cloudfront_distribution_arns = ["arn:aws:cloudfront::222222222222:distribution/PROD_DIST_ID"]
}

# ---------- Staging subdomain delegation ----------

data "terraform_remote_state" "staging" {
  backend = "s3"

  config = {
    bucket = "greenspace-2026-tfstate"
    key    = "environments/staging/terraform.tfstate"
    region = "eu-north-1"
  }
}

resource "aws_route53_record" "staging_ns" {
  zone_id = module.greenspace_stack.route53_zone_id
  name    = "staging.un17hub.com"
  type    = "NS"
  ttl     = 300
  records = data.terraform_remote_state.staging.outputs.route53_nameservers
}

output "naming_prefix" {
  value = module.greenspace_stack.naming_prefix
}

output "vpc_id" {
  value = module.greenspace_stack.vpc_id
}

output "api_runtime_role_arn" {
  value = module.greenspace_stack.api_runtime_role_arn
}

output "ci_deploy_role_arn" {
  value = module.greenspace_stack.ci_deploy_role_arn
}

output "ci_terraform_role_arn" {
  value = module.greenspace_stack.ci_terraform_role_arn
}

output "db_endpoint" {
  value = module.greenspace_stack.db_endpoint
}

output "db_secret_arn" {
  value = module.greenspace_stack.db_secret_arn
}

output "app_secret_arn" {
  value = module.greenspace_stack.app_secret_arn
}

output "ses_domain_identity_arn" {
  value = module.greenspace_stack.ses_domain_identity_arn
}

output "ses_configuration_set_name" {
  value = module.greenspace_stack.ses_configuration_set_name
}

output "ses_sender_email" {
  value = module.greenspace_stack.ses_sender_email
}

output "ses_reply_to_email" {
  value = module.greenspace_stack.ses_reply_to_email
}

output "route53_zone_id" {
  value = module.greenspace_stack.route53_zone_id
}

output "route53_nameservers" {
  value = module.greenspace_stack.route53_nameservers
}
