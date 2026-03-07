# ---------- Amplify App ----------

resource "aws_amplify_app" "web" {
  name       = "${local.naming_prefix}-web"
  repository = "https://github.com/${var.github_repo}"
  platform   = "WEB_COMPUTE"

  access_token = var.amplify_github_access_token

  build_spec = <<-YAML
version: 1
applications:
  - appRoot: apps/web
    frontend:
      phases:
        preBuild:
          commands:
            - cd ../.. && npm ci
        build:
          commands:
            - cd ../.. && npm run build --workspace=@greenspace/web
      artifacts:
        baseDirectory: .next
        files:
          - "**/*"
      cache:
        paths:
          - node_modules/**/*
          - ../../node_modules/**/*
          - .next/cache/**/*
  YAML

  environment_variables = {
    AMPLIFY_MONOREPO_APP_ROOT = "apps/web"
    API_URL                   = aws_lambda_function_url.api.function_url
  }

  enable_auto_branch_creation = var.amplify_enable_preview_branches
  enable_branch_auto_deletion = var.amplify_enable_preview_branches

  auto_branch_creation_patterns = var.amplify_enable_preview_branches ? var.amplify_preview_branch_patterns : []

  dynamic "auto_branch_creation_config" {
    for_each = var.amplify_enable_preview_branches ? [1] : []
    content {
      enable_auto_build = true
      stage             = "DEVELOPMENT"
      framework         = "Next.js - SSR"
      environment_variables = {
        NEXT_PUBLIC_ENV = "preview"
      }
    }
  }

  tags = {
    Name = "${local.naming_prefix}-web"
  }
}

# ---------- Amplify Branch ----------

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.web.id
  branch_name = var.amplify_branch_name

  enable_auto_build = var.amplify_enable_auto_build

  framework = "Next.js - SSR"

  environment_variables = {
    NEXT_PUBLIC_ENV = var.environment
  }

  tags = {
    Name = "${local.naming_prefix}-web-${var.amplify_branch_name}"
  }
}

# ---------- Amplify Domain Association ----------

resource "aws_amplify_domain_association" "main" {
  app_id      = aws_amplify_app.web.id
  domain_name = var.ses_sender_domain

  wait_for_verification = false

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = var.amplify_domain_prefix
  }
}
