# ---------- Lambda Function ----------

resource "aws_lambda_function" "api" {
  function_name = "${local.naming_prefix}-api"
  role          = aws_iam_role.api_runtime.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = "${path.module}/files/api-placeholder.zip"

  memory_size = var.lambda_memory_size
  timeout     = var.lambda_timeout

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.api.id]
  }

  environment {
    variables = {
      DB_HOST     = aws_db_instance.main.address
      DB_PORT     = tostring(aws_db_instance.main.port)
      DB_NAME     = var.db_name
      DB_USER     = var.db_master_username
      DB_PASSWORD = random_password.db_master.result
      DB_SSL      = "true"
    }
  }

  logging_config {
    log_group  = aws_cloudwatch_log_group.api.name
    log_format = "JSON"
  }

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }

  depends_on = [
    aws_iam_role_policy_attachment.api_basic_execution,
    aws_iam_role_policy_attachment.api_vpc_access,
  ]

  tags = {
    Name = "${local.naming_prefix}-api"
  }
}

# ---------- Lambda Function URL ----------

resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"
}
