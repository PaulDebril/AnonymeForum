# Generate SSH key
resource "tls_private_key" "key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Create key pair
resource "aws_key_pair" "deployer" {
  key_name   = "paul-debril-forum-key-${var.environment}"
  public_key = tls_private_key.key.public_key_openssh
}

# Store private key locally
resource "local_file" "private_key" {
  content         = tls_private_key.key.private_key_pem
  filename        = "${path.module}/paul-debril-forum-key-${var.environment}.pem"
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

              # Pull the sender container
              docker pull ghcr.io/pauldebril/sender:${var.docker_tag}
              
              # Run container initially without env vars - will be updated later
              docker run -d \
                --name forum-sender-${var.environment} \
                -p 8080:80 \
                --restart unless-stopped \
                ghcr.io/pauldebril/sender:${var.docker_tag}
              EOF

  tags = {
    Name = "sender-server-${var.environment}"
  }
}

# EC2 instance for API service
resource "aws_instance" "api" {
  ami             = "ami-0444794b421ec32e4"  # Amazon Linux 2 AMI (HVM) - eu-central-1
  instance_type   = "t2.nano"
  security_groups = [aws_security_group.web.name]
  key_name        = aws_key_pair.deployer.key_name

  depends_on = [aws_instance.db]

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

              # Wait for DB instance to be ready
              sleep 60

              # Pull and run the API container with environment variables
              docker pull ghcr.io/pauldebril/api:${var.docker_tag}
              docker run -d \
                --name forum-api-${var.environment} \
                -p 3000:3000 \
                -e DB_HOST=${aws_instance.db.private_ip} \
                -e DB_PORT=5432 \
                -e DB_USER=forum_user \
                -e DB_PASSWORD=forum_pass \
                -e DB_NAME=forum_db \
                -e PORT=3000 \
                -e NODE_ENV=production \
                --restart unless-stopped \
                ghcr.io/pauldebril/api:${var.docker_tag}
              EOF

  tags = {
    Name = "api-server-${var.environment}"
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
              
              # Pull the thread container
              docker pull ghcr.io/pauldebril/thread:${var.docker_tag}
              
              # Run container initially without env vars - will be updated later
              docker run -d \
                --name forum-thread-${var.environment} \
                -p 80:80 \
                --restart unless-stopped \
                ghcr.io/pauldebril/thread:${var.docker_tag}
              EOF

  tags = {
    Name = "thread-server-${var.environment}"
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
                --name forum-db-${var.environment} \
                -p 5432:5432 \
                -e POSTGRES_USER=forum_user \
                -e POSTGRES_PASSWORD=forum_pass \
                -e POSTGRES_DB=forum_db \
                -v db_data:/var/lib/postgresql/data \
                --restart unless-stopped \
                postgres:15

              # Wait for DB to be ready and initialize schema
              sleep 30
              docker exec forum-db-${var.environment} psql -U forum_user -d forum_db -c "
                CREATE TABLE IF NOT EXISTS message (
                  id SERIAL PRIMARY KEY,
                  pseudo TEXT NOT NULL,
                  contenu TEXT NOT NULL,
                  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                INSERT INTO message (pseudo, contenu) VALUES
                  ('Paul', 'Bonjour, ceci est un message de test !'),
                  ('Clement', 'Voici un autre message.'),
                  ('Marine', 'Test de la table message.'),
                  ('Antoine', 'Salut, comment ça va ?'),
                  ('Corentin', 'Ceci est un message de test.')
                ON CONFLICT DO NOTHING;
              "
              EOF

  tags = {
    Name = "db-server-${var.environment}"
  }
}

# Update services with dynamic IPs once all instances are ready
resource "null_resource" "update_sender_config" {
  depends_on = [aws_instance.sender, aws_instance.api, aws_instance.thread]

  provisioner "remote-exec" {
    inline = [
      "echo '${var.github_token}' | docker login ghcr.io -u PaulDebril --password-stdin",
      "docker stop forum-sender-${var.environment} || true",
      "docker rm forum-sender-${var.environment} || true",
      "docker run -d --name forum-sender-${var.environment} -p 8080:80 --restart unless-stopped ghcr.io/pauldebril/sender:${var.docker_tag}",
      "sleep 5",
      "docker exec forum-sender-${var.environment} sh -c \"echo 'window.ENV_CONFIG = { VITE_API_URL: \\\"http://${aws_instance.api.public_ip}:3000\\\", VITE_THREAD_URL: \\\"http://${aws_instance.thread.public_ip}\\\" };' > /usr/share/nginx/html/config.js\"",
      "docker exec forum-sender-${var.environment} cat /usr/share/nginx/html/config.js"
    ]

    connection {
      type        = "ssh"
      user        = "ec2-user"
      private_key = tls_private_key.key.private_key_pem
      host        = aws_instance.sender.public_ip
    }
  }
}

resource "null_resource" "update_thread_config" {
  depends_on = [aws_instance.thread, aws_instance.api, aws_instance.sender]

  provisioner "remote-exec" {
    inline = [
      "echo '${var.github_token}' | docker login ghcr.io -u PaulDebril --password-stdin",
      "docker stop forum-thread-${var.environment} || true",
      "docker rm forum-thread-${var.environment} || true",
      "docker run -d --name forum-thread-${var.environment} -p 80:80 --restart unless-stopped ghcr.io/pauldebril/thread:${var.docker_tag}",
      "sleep 5",
      "docker exec forum-thread-${var.environment} sh -c \"echo 'window.ENV_CONFIG = { VITE_API_URL: \\\"http://${aws_instance.api.public_ip}:3000\\\", VITE_SENDER_URL: \\\"http://${aws_instance.sender.public_ip}:8080\\\" };' > /usr/share/nginx/html/config.js\"",
      "docker exec forum-thread-${var.environment} cat /usr/share/nginx/html/config.js"
    ]

    connection {
      type        = "ssh"
      user        = "ec2-user"
      private_key = tls_private_key.key.private_key_pem
      host        = aws_instance.thread.public_ip
    }
  }
}
