variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "ssm_parameter_arn" {
  description = "ARN of SSM parameter for secrets"
  type        = string
}
