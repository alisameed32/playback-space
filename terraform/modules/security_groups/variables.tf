variable "vpc_id" {}
variable "allowed_ssh_cidr" {}
variable "allowed_http_cidr" {}
variable "admin_ports" {
  type        = list(number)
  description = "Ports allowed only from my own IP"
  default     = []
}