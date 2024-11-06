terraform {
	required_providers {
		cloud = {
			source = "hashicorp/aws"
		}
	}
}

variable "bucket_name" {
	type = string
}

variable "bucket_tag_name" {
	type = string
}

variable "dynamodb_table_name"{
	type = string
}

variable "dynamodb_table_tag_name" {
	type = string
}

resource "aws_s3_bucket" "state_bucket" {
	bucket = var.bucket_name
	versioning {
		enabled = true
	}
	server_side_encryption_configuration {
		rule {
			apply_server_side_encryption_by_default{
				sse_algorithm = "AES256"
			}
		}
	}
	object_lock_configuration {
		object_lock_enabled = "Enabled"
	}
	tags = {
		Name = var.bucket_tag_name
	}
}

resource "aws_dynamodb_table" "terraform-lock" {
	name = var.dynamodb_table_name
	read_capacity = 5
	write_capacity = 5
	hash_key = "LockID"
	attribute {
		name = "LockID"
		type = "S"
	}
	tags = {
		"Name" = var.dynamodb_table_tag_name
	}
}
