# Single-EC2 runtime aligned with docker-compose.prod.yml (API + UI + Postgres + Redis + MinIO + Qdrant + nginx).

locals {
  name_prefix = var.project_name
}

resource "aws_iam_role" "ssm_role" {
  name                  = "${local.name_prefix}-ssm-role"
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
    ignore_changes        = [assume_role_policy]
    create_before_destroy = true
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
  name = "${local.name_prefix}-ssm-profile"
  role = aws_iam_role.ssm_role.name

  lifecycle {
    ignore_changes        = [role]
    create_before_destroy = true
  }
}

resource "aws_security_group" "sg" {
  name_prefix = "${local.name_prefix}-sg-"
  description = "Allow HTTP and HTTPS for nginx ingress"

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

  dynamic "ingress" {
    for_each = var.allowed_ssh_cidr == "" ? [] : [var.allowed_ssh_cidr]
    content {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [ingress, egress]
  }

  tags = {
    Name    = "${local.name_prefix}-sg"
    Project = local.name_prefix
  }
}

resource "aws_instance" "app_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  iam_instance_profile   = aws_iam_instance_profile.ssm_profile.name
  vpc_security_group_ids = [aws_security_group.sg.id]

  root_block_device {
    volume_size = var.root_volume_gb
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e
              fallocate -l 2G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab
              apt-get update -y
              apt-get install -y docker.io docker-compose-plugin awscli
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ubuntu
              EOF

  lifecycle {
    ignore_changes = [user_data, ami]
  }

  tags = {
    Name    = "${local.name_prefix}-app"
    Project = local.name_prefix
    Role    = "compose-host"
  }
}

resource "aws_eip" "lb" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = {
    Name    = "${local.name_prefix}-eip"
    Project = local.name_prefix
  }
}
