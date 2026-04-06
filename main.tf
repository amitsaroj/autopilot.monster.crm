# Terraform Configuration

# Provider configuration removed as per request.

resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe01e"
  instance_type = "t3a.medium"
  ... # other configurations remain unchanged
}