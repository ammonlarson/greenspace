terraform {
  required_version = ">= 1.5.0"
}

module "greenspace_stack" {
  source      = "../../modules/greenspace_stack"
  environment = "staging"
}

output "naming_prefix" {
  value = module.greenspace_stack.naming_prefix
}
