output "naming_prefix" {
  description = "Deterministic naming prefix for environment-scoped resources."
  value       = local.naming_prefix
}

# ---------- Networking ----------

output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets."
  value       = aws_subnet.private[*].id
}

output "api_security_group_id" {
  description = "Security group ID for API Lambda functions."
  value       = aws_security_group.api.id
}

output "database_security_group_id" {
  description = "Security group ID for the RDS database."
  value       = aws_security_group.database.id
}

# ---------- IAM ----------

output "api_lambda_role_arn" {
  description = "ARN of the IAM role for API Lambda functions."
  value       = aws_iam_role.api_lambda.arn
}

output "ci_deploy_role_arn" {
  description = "ARN of the IAM role for CI/CD deployments."
  value       = aws_iam_role.ci_deploy.arn
}

# ---------- Security ----------

output "kms_key_arn" {
  description = "ARN of the KMS encryption key."
  value       = aws_kms_key.main.arn
}

# ---------- Observability ----------

output "api_log_group_name" {
  description = "Name of the CloudWatch log group for the API."
  value       = aws_cloudwatch_log_group.api.name
}
