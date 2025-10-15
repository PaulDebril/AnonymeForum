# Generate SSH key
resource "tls_private_key" "key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Create key pair
resource "aws_key_pair" "deployer" {
  key_name   = "paul-debril-forum-key"
  public_key = tls_private_key.key.public_key_openssh
}

# Store private key locally
resource "local_file" "private_key" {
  content         = tls_private_key.key.private_key_pem
  filename        = "${path.module}/paul-debril-forum-key.pem"
  file_permission = "0600"
}

# EC2 instance for Sender service
resource "aws_instance" "sender" {
  ami             = "ami-0444794b421ec32e4"  # Amazon Linux 2 AMI (HVM) - eu-central-1
  instance_type   = "t2.micro"
  security_groups = [aws_security_group.web.name]
  key_name        = aws_key_pair.deployer.key_name

  user_data = <<-EOF
              #!/bin/bash
              # Install Docker
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -a -G docker ec2-user
              
              # Login to GitHub Container Registry
              echo "${var.github_token}" | docker login ghcr.io -u PaulDebril --password-stdin

              # Pull and run the sender container
              docker pull ghcr.io/pauldebril/sender:68b679b
              docker run -d \
                --name forum-sender \
                -p 8080:80 \
                --restart unless-stopped \
                ghcr.io/pauldebril/sender:68b679b
              EOF

  tags = {
    Name = "sender-server"
  }
}

# EC2 instance for API service
resource "aws_instance" "api" {
  ami             = "ami-0444794b421ec32e4"  # Amazon Linux 2 AMI (HVM) - eu-central-1
  instance_type   = "t2.nano"
  security_groups = [aws_security_group.web.name]
  key_name        = aws_key_pair.deployer.key_name

  user_data = <<-EOF
              #!/bin/bash
              # Install Docker
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -a -G docker ec2-user
              
              # Login to GitHub Container Registry
              echo "${var.github_token}" | docker login ghcr.io -u PaulDebril --password-stdin

              # Pull and run the API container
              docker pull ghcr.io/pauldebril/api:68b679b
              docker run -d \
                --name forum-api \
                -p 3000:3000 \
                -e DB_HOST=localhost \
                -e DB_PORT=5432 \
                -e DB_USER=forum_user \
                -e DB_PASSWORD=forum_pass \
                -e DB_NAME=forum_db \
                --restart unless-stopped \
                ghcr.io/pauldebril/api:68b679b
              EOF

  tags = {
    Name = "api-server"
  }
}

# EC2 instance for Thread service
resource "aws_instance" "thread" {
  ami             = "ami-0444794b421ec32e4"  # Amazon Linux 2 AMI (HVM) - eu-central-1
  instance_type   = "t2.nano"
  security_groups = [aws_security_group.web.name]
  key_name        = aws_key_pair.deployer.key_name

  user_data = <<-EOF
              #!/bin/bash
              # Install Docker
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -a -G docker ec2-user
              
              # Login to GitHub Container Registry
              echo "${var.github_token}" | docker login ghcr.io -u PaulDebril --password-stdin
              
              # Pull and run the thread container
              docker pull ghcr.io/pauldebril/thread:68b679b
              docker run -d \
                --name forum-thread \
                -p 80:80 \
                --restart unless-stopped \
                ghcr.io/pauldebril/thread:68b679b
              EOF

  tags = {
    Name = "thread-server"
  }
}

# EC2 instance for Database service
resource "aws_instance" "db" {
  ami             = "ami-0444794b421ec32e4"  # Amazon Linux 2 AMI (HVM) - eu-central-1
  instance_type   = "t2.nano"
  security_groups = [aws_security_group.web.name]
  key_name        = aws_key_pair.deployer.key_name

  user_data = <<-EOF
              #!/bin/bash
              # Install Docker
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -a -G docker ec2-user
              
              # Pull and run PostgreSQL container
              docker pull postgres:15 
              docker run -d \
                --name forum-db \
                -p 5432:5432 \
                -e POSTGRES_USER=forum_user \
                -e POSTGRES_PASSWORD=forum_pass \
                -e POSTGRES_DB=forum_db \
                --restart unless-stopped \
                postgres:15
              EOF

  tags = {
    Name = "db-server"
  }
}
