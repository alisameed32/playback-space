output "public_ip" {
  description = "The public elastic IPs of the web servers"
  value       = aws_eip.web_eip[*].public_ip
}