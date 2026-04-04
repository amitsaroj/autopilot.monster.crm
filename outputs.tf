output "elastic_ip" {
  value = aws_eip.lb.public_ip
}
