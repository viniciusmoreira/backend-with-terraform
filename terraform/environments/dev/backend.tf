terraform {
  backend "s3" {
    key            = "dev/terraform.tfstate"
    encrypt        = true
    dynamodb_table = "alvorada-terraform-state-locks"
  }
}
