# 1. IAM Role for SSM (No SSH Keys Needed)
resource "aws_iam_role" "ssm_role" {
  name                  = "autopilot-ssm-role"
  force_detach_policies = true
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  lifecycle {
    ignore_changes = [assume_role_policy]
  }
}

resource "aws_iam_role_policy_attachment" "ssm_attach" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_role_policy_attachment" "s3_read" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_instance_profile" "ssm_profile" {
  name = "autopilot-ssm-profile"
  role = aws_iam_role.ssm_role.name

  lifecycle {
    ignore_changes = [role]
  }
}

# 2. Security Group
resource "aws_security_group" "sg" {
  name        = "autopilot-sg"
  description = "Allow HTTP and HTTPS"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    ignore_changes = [ingress, egress]
  }
}

# 3. EC2 Instance (t3.medium - Scaling upgrade in ap-south-1)
resource "aws_instance" "app_server" {
  ami                    = "ami-0dee22c13ea7a9a67" # Ubuntu 24.04 LTS ap-south-1
  instance_type          = "t3.medium"
  iam_instance_profile   = aws_iam_instance_profile.ssm_profile.name
  vpc_security_group_ids = [aws_security_group.sg.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e

              # 2GB swap for memory headroom
              fallocate -l 2G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              # Install Docker & tools
              apt-get update -y
              apt-get install -y docker.io docker-compose-plugin awscli
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ubuntu
              EOF

  lifecycle {
    ignore_changes = [user_data, ami]
  }

  tags = { Name = "Autopilot-Backend" }
}

# 4. Elastic IP for Static DNS
resource "aws_eip" "lb" {
  instance = aws_instance.app_server.id
  domain   = "vpc"
}


