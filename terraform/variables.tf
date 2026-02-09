variable "region" {}
variable "vpc_cidr" {}
variable "public_subnets" {}
variable "azs" {}
variable "my_ip" {}
variable "ami_id" {}
variable "instance_type" {}
variable "key_name" {}
variable "instance_names" {
  type        = list(string)
  description = "List of names for the EC2 instances"
}
variable "admin_ports" {
  type        = list(number)
  description = "List of admin ports"
}

