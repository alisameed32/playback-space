resource "aws_instance" "web" {
  count         = 2  # [Loop] Creates 2 instances
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name
  subnet_id     = var.subnet_id
  vpc_security_group_ids = [var.sg_id]

  # [Storage] Sets the root volume size to 30 GB
  root_block_device {
    volume_size = 30
    volume_type = "gp3" 
  }

  tags = {
    Name = var.instance_names[count.index] 
  }
}

# [Static IP] Creates an Elastic IP for each instance
resource "aws_eip" "web_eip" {
  count    = 2
  instance = aws_instance.web[count.index].id
  domain   = "vpc"
}