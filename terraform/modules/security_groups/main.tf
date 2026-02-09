resource "aws_security_group" "main" {
  name        = "allow-ssh-http"
  description = "Allow SSH and HTTP"
  vpc_id      = var.vpc_id

  # 1. SSH Access (Admin only)
  dynamic "ingress" {
    for_each = var.admin_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = [var.allowed_ssh_cidr] # <--- RESTRICTED TO Specific IP
    }
  }

  # 2. PUBLIC ACCESS - Port 80 (For your Website Users)
  ingress {
    description = "HTTP access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # 3. Internal Traffic (Allows Nginx <-> Frontend <-> Backend communication)
  # This rule implicitly allows ports 8000, 5173, etc., strictly between your instances.
  ingress {
    description = "Internal Communication"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  # 4. Egress (Allows sending emails, downloading updates)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}