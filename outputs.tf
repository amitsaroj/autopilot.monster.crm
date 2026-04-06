output "elastic_ip" {
  value = aws_eip.lb.public_ip
}

output "instance_id" {
  value = aws_instance.app_server.id
}
