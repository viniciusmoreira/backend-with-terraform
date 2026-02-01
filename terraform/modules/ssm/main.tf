resource "aws_ssm_parameter" "system_secret" {
  name        = "/${var.project_name}/${var.environment}/system-secret"
  description = "System secret for the User Profile API"
  type        = "SecureString"
  value       = var.secret_value

  tags = {
    Name = "${var.project_name}-${var.environment}-system-secret"
  }
}
