# Terraform Configuration for AWS

## IAM Roles
resource "aws_iam_role" "example_role" {
  name               = "example_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Effect   = "Allow"
      Sid      = ""
    }]
  })
}

## Security Groups
resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow SSH from anywhere"
  vpc_id      = aws_vpc.example_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks  = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks  = ["0.0.0.0/0"]
  }
}

## EC2 Instance
resource "aws_instance" "example_instance" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3a.medium"
  subnet_id     = aws_subnet.example_subnet.id
  security_groups = [aws_security_group.allow_ssh.name]
}

## Elastic IP
resource "aws_eip" "example_eip" {
  instance = aws_instance.example_instance.id
}