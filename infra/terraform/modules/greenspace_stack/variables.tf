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

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "github_repository" {
  description = "GitHub repository in owner/repo format for CI OIDC trust."
  type        = string
  default     = "ammonlarson/greenspace"
}
