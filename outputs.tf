output "public_ip" {
  description = "The public IP of the Elastic IP"
  value       = aws_eip.lb.public_ip
}

output "elastic_ip" {
  description = "The public IP of the Elastic IP for static DNS routing"
  value       = aws_eip.lb.public_ip
}

output "instance_id" {
  description = "The ID of the EC2 app server instance"
  value       = aws_instance.app_server.id
}
