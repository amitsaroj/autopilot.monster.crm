terraform {
  backend "s3" {
    # Isko khali chhodein, workflow isse bhar dega
    key    = "terraform.tfstate"
    region = "ap-south-1"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}
