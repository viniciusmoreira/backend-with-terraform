output "parameter_arn" {
  description = "SSM Parameter ARN"
  value       = aws_ssm_parameter.system_secret.arn
}

output "parameter_name" {
  description = "SSM Parameter Name"
  value       = aws_ssm_parameter.system_secret.name
}
