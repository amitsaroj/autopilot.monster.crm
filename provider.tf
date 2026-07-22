terraform {
  backend "s3" {
    # Configure via: terraform init -backend-config="bucket=<bucket>" -backend-config="key=terraform.tfstate" -backend-config="region=ap-south-1"
    # Do not embed real bucket names or credentials in this repository.
    key    = "terraform.tfstate"
    region = "ap-south-1"
  }

  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
