terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

module "vpc" {
  source = "../../modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

module "security_groups" {
  source = "../../modules/security-groups"

  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  container_port = var.container_port
}

module "cognito" {
  source = "../../modules/cognito"

  project_name = var.project_name
  environment  = var.environment
}

module "ssm" {
  source = "../../modules/ssm"

  project_name = var.project_name
  environment  = var.environment
  secret_value = var.system_secret_value
}

module "iam" {
  source = "../../modules/iam"

  project_name      = var.project_name
  environment       = var.environment
  ssm_parameter_arn = module.ssm.parameter_arn
}

module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

module "rds" {
  source = "../../modules/rds"

  project_name      = var.project_name
  environment       = var.environment
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_id = module.security_groups.rds_security_group_id
  instance_class    = var.db_instance_class
  db_name           = var.db_name
  db_username       = var.db_username
}

module "alb" {
  source = "../../modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.public_subnet_ids
  security_group_id = module.security_groups.alb_security_group_id
  container_port    = var.container_port
}

module "ecs" {
  source = "../../modules/ecs"

  project_name         = var.project_name
  environment          = var.environment
  aws_region           = var.aws_region
  subnet_ids           = module.vpc.private_subnet_ids
  security_group_id    = module.security_groups.ecs_security_group_id
  target_group_arn     = module.alb.target_group_arn
  execution_role_arn   = module.iam.ecs_task_execution_role_arn
  task_role_arn        = module.iam.ecs_task_role_arn
  ecr_repository_url   = module.ecr.repository_url
  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_client_id    = module.cognito.client_id
  database_url         = "postgresql://${var.db_username}:${urlencode(module.rds.password)}@${module.rds.endpoint}/${var.db_name}?sslmode=no-verify"
  ssm_parameter_name   = module.ssm.parameter_name
  container_port       = var.container_port
  task_cpu             = var.task_cpu
  task_memory          = var.task_memory
  desired_count        = var.desired_count

  depends_on = [module.alb]
}

module "api_gateway" {
  source = "../../modules/api-gateway"

  project_name         = var.project_name
  environment          = var.environment
  aws_region           = var.aws_region
  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_client_id    = module.cognito.client_id
  alb_dns_name         = module.alb.alb_dns_name
}
