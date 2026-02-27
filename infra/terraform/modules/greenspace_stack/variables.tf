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
}

variable "availability_zones" {
  description = "List of availability zones for subnet placement."
  type        = list(string)
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

# ---------- Monitoring ----------

variable "log_retention_days" {
  description = "CloudWatch log group retention in days."
  type        = number
  default     = 30
}
