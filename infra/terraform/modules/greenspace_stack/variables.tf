variable "project" {
  description = "Project tag and naming prefix."
  type        = string
  default     = "greenspace"
}

variable "season" {
  description = "Season tag."
  type        = string
  default     = "2026"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

# ---------- Networking ----------

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "vpc_cidr must be a valid CIDR block."
  }
}

variable "availability_zones" {
  description = "List of availability zones for subnet placement."
  type        = list(string)

  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "At least 2 availability zones required for HA."
  }
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)."
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)."
  type        = list(string)
}

# ---------- IAM / CI ----------

variable "github_repo" {
  description = "GitHub repository in owner/name format for OIDC trust."
  type        = string
  default     = "ammonlarson/greenspace"
}

variable "tf_state_bucket" {
  description = "S3 bucket name for Terraform remote state."
  type        = string
  default     = "greenspace-2026-tfstate"
}

variable "tf_lock_table" {
  description = "DynamoDB table name for Terraform state locking."
  type        = string
  default     = "greenspace-2026-tflock"
}

variable "github_environment" {
  description = "GitHub Actions environment name for OIDC trust (may differ from var.environment). Defaults to var.environment."
  type        = string
  default     = null
}

variable "ses_sender_domain" {
  description = "Domain name for SES sender identity and Route 53 hosted zone."
  type        = string

  validation {
    condition     = can(regex("^([a-z0-9]([a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,}$", var.ses_sender_domain))
    error_message = "ses_sender_domain must be a valid domain name (e.g. example.com)."
  }
}

variable "ses_sender_email" {
  description = "Default From address for outbound email. Defaults to greenspace@<ses_sender_domain>."
  type        = string
  default     = null
}

variable "ses_reply_to_email" {
  description = "Default Reply-To address for outbound email."
  type        = string
  default     = "elise7284@gmail.com"
}

variable "cloudfront_distribution_arns" {
  description = "CloudFront distribution ARN(s) that CI is allowed to create invalidations for."
  type        = list(string)

  validation {
    condition     = length(var.cloudfront_distribution_arns) > 0
    error_message = "At least one CloudFront distribution ARN is required. Wildcard '*' is not allowed."
  }

  validation {
    condition     = alltrue([for arn in var.cloudfront_distribution_arns : can(regex("^arn:aws:cloudfront:", arn))])
    error_message = "Each CloudFront distribution ARN must start with 'arn:aws:cloudfront:'."
  }

  validation {
    condition     = alltrue([for arn in var.cloudfront_distribution_arns : !can(regex("[*]", arn))])
    error_message = "CloudFront distribution ARNs must not contain wildcards ('*')."
  }
}

# ---------- Lambda ----------

variable "lambda_memory_size" {
  description = "Memory allocation for the API Lambda function in MB."
  type        = number
  default     = 256

  validation {
    condition     = var.lambda_memory_size >= 128 && var.lambda_memory_size <= 10240
    error_message = "lambda_memory_size must be between 128 and 10240 MB."
  }
}

variable "lambda_timeout" {
  description = "Timeout for the API Lambda function in seconds."
  type        = number
  default     = 30

  validation {
    condition     = var.lambda_timeout >= 1 && var.lambda_timeout <= 900
    error_message = "lambda_timeout must be between 1 and 900 seconds."
  }
}

variable "lambda_reserved_concurrency" {
  description = "Reserved concurrent executions for the API Lambda. Set to -1 for unrestricted."
  type        = number
  default     = 50

  validation {
    condition     = var.lambda_reserved_concurrency >= -1 && var.lambda_reserved_concurrency <= 1000
    error_message = "lambda_reserved_concurrency must be between -1 (unrestricted) and 1000."
  }
}

# ---------- Database ----------

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Initial allocated storage in GB."
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum storage autoscaling limit in GB."
  type        = number
  default     = 50
}

variable "db_backup_retention_days" {
  description = "Number of days to retain automated backups."
  type        = number
  default     = 7

  validation {
    condition     = var.db_backup_retention_days >= 1 && var.db_backup_retention_days <= 35
    error_message = "db_backup_retention_days must be between 1 and 35."
  }
}

variable "db_multi_az" {
  description = "Enable Multi-AZ deployment for RDS."
  type        = bool
  default     = false
}

variable "db_name" {
  description = "Name of the default database to create."
  type        = string
  default     = "greenspace"
}

variable "db_master_username" {
  description = "Master username for the RDS instance."
  type        = string
  default     = "greenspace"
}

# ---------- Monitoring ----------

variable "log_retention_days" {
  description = "CloudWatch log group retention in days."
  type        = number
  default     = 30

  validation {
    condition     = contains([0, 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653], var.log_retention_days)
    error_message = "log_retention_days must be a valid CloudWatch retention value."
  }
}
