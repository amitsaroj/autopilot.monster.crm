# Terraform Configuration 

provider "aws" {
  region = "ap-south-1"
}

resource "aws_instance" "app" {
  ami           = "ami-123456"
  instance_type = "t3a.medium"
  # ... other configurations
}