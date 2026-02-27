# ---------- KMS Encryption Key ----------

resource "aws_kms_key" "main" {
  description             = "Encryption key for ${local.naming_prefix} resources"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "${local.naming_prefix}-key"
  }
}

resource "aws_kms_alias" "main" {
  name          = "alias/${local.naming_prefix}"
  target_key_id = aws_kms_key.main.key_id
}
