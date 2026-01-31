# API Gateway HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-${var.environment}-api"
  protocol_type = "HTTP"
  description   = "HTTP API Gateway for User Profile API"

  cors_configuration {
    allow_origins     = ["*"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key"]
    expose_headers    = ["*"]
    max_age           = 300
    allow_credentials = false
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-api"
  }
}

# Cognito Authorizer for API Gateway
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.project_name}-${var.environment}-cognito-authorizer"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.main.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

# API Gateway Stage (auto-deploy)
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId         = "$context.requestId"
      ip                = "$context.identity.sourceIp"
      requestTime       = "$context.requestTime"
      httpMethod        = "$context.httpMethod"
      routeKey          = "$context.routeKey"
      status            = "$context.status"
      protocol          = "$context.protocol"
      responseLength    = "$context.responseLength"
      integrationError  = "$context.integrationErrorMessage"
      authorizerError   = "$context.authorizer.error"
      cognitoSub        = "$context.authorizer.claims.sub"
    })
  }

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-stage"
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-api-logs"
  }
}

# =============================================================================
# INTEGRATIONS - Backend (ALB)
# =============================================================================

# Integration for catch-all proxy route (with path forwarding)
resource "aws_apigatewayv2_integration" "backend_proxy" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${aws_lb.main.dns_name}/{proxy}"

  payload_format_version = "1.0"
  timeout_milliseconds   = 30000
}

# Integration for specific protected routes (with Cognito headers)
resource "aws_apigatewayv2_integration" "backend_profile" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${aws_lb.main.dns_name}/profile"

  request_parameters = {
    "overwrite:header.x-cognito-sub"   = "$context.authorizer.claims.sub"
    "overwrite:header.x-cognito-email" = "$context.authorizer.claims.email"
  }

  payload_format_version = "1.0"
  timeout_milliseconds   = 30000
}

# Integration for system/secret route (with Cognito headers)
resource "aws_apigatewayv2_integration" "backend_system_secret" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "HTTP_PROXY"
  integration_method = "GET"
  integration_uri    = "http://${aws_lb.main.dns_name}/system/secret"

  request_parameters = {
    "overwrite:header.x-cognito-sub"   = "$context.authorizer.claims.sub"
    "overwrite:header.x-cognito-email" = "$context.authorizer.claims.email"
  }

  payload_format_version = "1.0"
  timeout_milliseconds   = 30000
}

# =============================================================================
# ROUTES - Catch-all (public, no auth)
# =============================================================================

# Catch-all route - forwards all paths to backend (public endpoints)
# This handles: GET /health, GET /system/health, POST /auth/*, etc.
# Note: Specific routes below take precedence over this catch-all
resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /{proxy+}"

  target = "integrations/${aws_apigatewayv2_integration.backend_proxy.id}"
}

# =============================================================================
# ROUTES - Protected (with Cognito auth)
# These specific routes take precedence over the catch-all
# =============================================================================

# Profile routes (protected)
resource "aws_apigatewayv2_route" "profile_get" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /profile"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id

  target = "integrations/${aws_apigatewayv2_integration.backend_profile.id}"
}

resource "aws_apigatewayv2_route" "profile_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /profile"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id

  target = "integrations/${aws_apigatewayv2_integration.backend_profile.id}"
}

# System secret route (protected)
resource "aws_apigatewayv2_route" "system_secret" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /system/secret"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id

  target = "integrations/${aws_apigatewayv2_integration.backend_system_secret.id}"
}
