# Create a security group for all EC2 instances
resource "aws_security_group" "web" {
  name        = "paul-debril-forum-sg-${var.environment}"
  description = "Allow web, SSH, and application traffic"

  # HTTP traffic (port 80)
  ingress {
    from_port   = var.security_group_port
    to_port     = var.security_group_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP traffic"
  }

  # HTTPS traffic (port 443)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS traffic"
  }

  # SSH traffic (port 22)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow SSH traffic"
  }

  # Node.js development ports (3000-3003)
  ingress {
    from_port   = 3000
    to_port     = 3003
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow Node.js application traffic"
  }

  # Vite development port (5173)
  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow Vite development server"
  }

  # Sender service port (8080)
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow Sender service traffic"
  }

  # PostgreSQL port (5432)
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["172.31.0.0/16"]  # AWS VPC default CIDR for internal access
    description = "Allow PostgreSQL traffic"
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "anonyme-forum-sg-${var.environment}"
  }
}
