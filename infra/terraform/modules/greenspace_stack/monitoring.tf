# ---------- KMS Key for encryption ----------

resource "aws_kms_key" "logs" {
  description         = "Encryption key for ${local.naming_prefix} CloudWatch logs"
  enable_key_rotation = true

  tags = {
    Name = "${local.naming_prefix}-logs-key"
  }
}

resource "aws_kms_alias" "logs" {
  name          = "alias/${local.naming_prefix}-logs"
  target_key_id = aws_kms_key.logs.key_id
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_kms_key_policy" "logs" {
  key_id = aws_kms_key.logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "RootAccess"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Principal = {
          Service = "logs.${data.aws_region.current.id}.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey",
        ]
        Resource = "*"
        Condition = {
          ArnLike = {
            "kms:EncryptionContext:aws:logs:arn" = "arn:aws:logs:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:log-group:/${local.naming_prefix}/*"
          }
        }
      },
    ]
  })
}

# ---------- CloudWatch Log Groups ----------

resource "aws_cloudwatch_log_group" "api" {
  name              = "/${local.naming_prefix}/api"
  retention_in_days = var.log_retention_days
  kms_key_id        = aws_kms_key.logs.arn

  tags = {
    Name = "${local.naming_prefix}-api-logs"
  }

  depends_on = [aws_kms_key_policy.logs]
}
