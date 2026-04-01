terraform {
  backend "s3" {
    bucket         = "your-unique-terraform-state-bucket" # Change this!
    key            = "terraform.tfstate"
    region         = "ap-south-1"
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
