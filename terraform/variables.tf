variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-southeast-2"
}

variable "cluster_name" {
  description = "EKS Cluster Name"
  type        = string
  default     = "taskboard-eks"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}
