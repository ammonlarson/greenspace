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

output "db_security_group_id" {
  description = "Security group ID for the RDS database."
  value       = aws_security_group.db.id
}

# ---------- IAM ----------

output "api_runtime_role_arn" {
  description = "ARN of the Lambda execution role."
  value       = aws_iam_role.api_runtime.arn
}

output "ci_deploy_role_arn" {
  description = "ARN of the CI deploy role for GitHub Actions OIDC."
  value       = aws_iam_role.ci_deploy.arn
}

# ---------- Monitoring ----------

output "api_log_group_name" {
  description = "CloudWatch log group name for the API."
  value       = aws_cloudwatch_log_group.api.name
}

output "logs_kms_key_arn" {
  description = "ARN of the KMS key used for log encryption."
  value       = aws_kms_key.logs.arn
}
