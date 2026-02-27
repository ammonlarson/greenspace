# ---------- CloudWatch Log Groups ----------

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${local.naming_prefix}-api"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.main.arn

  tags = {
    Name = "${local.naming_prefix}-api-logs"
  }
}
