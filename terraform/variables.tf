//Le type d'instance EC2
//Le nom de l'instance EC2
//Le port par défaut pour le groupe de sécurité
variable "ec2_instance_type" {
  description = "Type of EC2 instance"
  type        = string
  default     = "t2.nano"
}

variable "ec2_instance_name" {
  description = "Name of the EC2 instance"
  type        = string
  default     = "nginx-server-pauldebril"
}

variable "security_group_port" {
  description = "Default port for the security group"
  type        = number
  default     = 80
}

variable "github_token" {
  description = "GitHub Personal Access Token for Container Registry"
  type        = string
  sensitive   = true
}
