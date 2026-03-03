# ---------- Amplify App ----------

resource "aws_amplify_app" "web" {
  name       = "${local.naming_prefix}-web"
  repository = "https://github.com/${var.github_repo}"
  platform   = "WEB_COMPUTE"

  access_token = var.amplify_github_access_token

  build_spec = yamlencode({
    version = 1
    applications = [{
      appRoot = "apps/web"
      frontend = {
        phases = {
          preBuild = {
            commands = ["npm ci"]
          }
          build = {
            commands = ["npm run build"]
          }
        }
        artifacts = {
          baseDirectory = ".next"
          files         = ["**/*"]
        }
        cache = {
          paths = [
            "node_modules/**/*",
            ".next/cache/**/*",
          ]
        }
      }
    }]
  })

  environment_variables = {
    AMPLIFY_MONOREPO_APP_ROOT = "apps/web"
    API_URL                   = var.amplify_api_url
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
