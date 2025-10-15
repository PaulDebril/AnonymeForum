# Sender instance outputs
output "sender_instance_id" {
  description = "ID of the Sender EC2 instance"
  value       = aws_instance.sender.id
}

output "sender_instance_public_ip" {
  description = "Public IP of the Sender EC2 instance"
  value       = aws_instance.sender.public_ip
}

output "sender_ssh_command" {
  description = "SSH command to connect to the Sender instance"
  value       = "ssh -i paul-debril-forum-key.pem ec2-user@${aws_instance.sender.public_ip}"
}

# API instance outputs
output "api_instance_id" {
  description = "ID of the API EC2 instance"
  value       = aws_instance.api.id
}

output "api_instance_public_ip" {
  description = "Public IP of the API EC2 instance"
  value       = aws_instance.api.public_ip
}

output "api_ssh_command" {
  description = "SSH command to connect to the API instance"
  value       = "ssh -i paul-debril-forum-key.pem ec2-user@${aws_instance.api.public_ip}"
}

# Thread instance outputs
output "thread_instance_id" {
  description = "ID of the Thread EC2 instance"
  value       = aws_instance.thread.id
}

output "thread_instance_public_ip" {
  description = "Public IP of the Thread EC2 instance"
  value       = aws_instance.thread.public_ip
}

output "thread_ssh_command" {
  description = "SSH command to connect to the Thread instance"
  value       = "ssh -i paul-debril-forum-key.pem ec2-user@${aws_instance.thread.public_ip}"
}

# Database instance outputs
output "db_instance_id" {
    description = "ID of the DB EC2 instance"
    value       = aws_instance.db.id
}

output "db_instance_public_ip" {
  description = "Public IP of the DB EC2 instance"
  value       = aws_instance.db.public_ip
}

output "db_instance_private_ip" {
  description = "Private IP of the DB EC2 instance"
  value       = aws_instance.db.private_ip
}

output "db_ssh_command" {
    description = "SSH command to connect to the DB instance"
    value       = "ssh -i paul-debril-forum-key.pem ec2-user@${aws_instance.db.public_ip}"
}