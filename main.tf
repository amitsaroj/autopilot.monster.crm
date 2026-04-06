resource "aws_iam_role" "autopilot_ssm_role" {
  name = "autopilot-ssm-role"
  assume_role_policy = jsonencode(
    {
      Version = "2012-10-17"
      Statement = [
        {
          Action = "sts:AssumeRole"
          Principal = { Service = "ssm.amazonaws.com" }
          Effect = "Allow"
          Sid = ""
        }
      ]
    }
  )
}

resource "aws_security_group" "autopilot_sg" {
  name = "autopilot-sg"
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks  = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
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

resource "aws_instance" "app_server" {
  ami                    = "ami-0dee22c13ea7a9a67"
  instance_type         = "t3a.medium"
  iam_instance_profile   = "ssm_profile"
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }
  user_data = <<-EOF
                #!/bin/bash
                docker setup script here
                EOF
  tags = {
    Name = "Autopilot-Backend"
  }
}

resource "aws_eip" "lb" {
  instance = aws_instance.app_server.id
}