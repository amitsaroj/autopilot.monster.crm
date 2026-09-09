variable "aws_region" {
  description = "AWS region for the single-node production host"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "autopilot-monster"
}

variable "instance_type" {
  description = "EC2 instance type hosting docker-compose.prod.yml"
  type        = string
  default     = "t3.micro"
}

variable "root_volume_gb" {
  description = "Root volume size in GB"
  type        = number
  default     = 20
}

variable "ami_id" {
  description = "Ubuntu AMI for the app host"
  type        = string
  default     = "ami-0dee22c13ea7a9a67"
}

variable "allowed_ssh_cidr" {
  description = "Optional SSH CIDR. Empty disables SSH ingress (SSM preferred)."
  type        = string
  default     = ""
}
