// Remote backend, create "underlying" infrastructure with local state before moving to remote state

variable "s3_state_bucket_mc" {
	default = "mrcarmona-tf-state-bucket"
}

variable "dynamodb_table_name_mc" {
	default = "terraform_state"
}

// variables not allowed in backend configuration
terraform {
	backend "s3" {
		bucket			= "mrcarmona-tf-state-bucket"
		key				= "terraform.tfstate"
		region			= "us-west-1"
		dynamodb_table	= "terraform_state"
	}
}


// Infrastructure for remote backend

module "foundation_mc" {
	source = "./modules/base"
	providers = {
		aws = aws
		aws.virginia = aws.virginia
	}
	bucket_name = var.s3_state_bucket_mc
	bucket_tag_name = "S3 Remote Terraform State Store for MrCarmona.com"
	dynamodb_table_name = var.dynamodb_table_name_mc
	dynamodb_table_tag_name = "DynamoDB Terraform State Lock Table for MrCarmona.com"
}


// My region
provider "aws" {
	region = "us-west-1"
}

// Certain resources can only be created in us-east-1
provider "aws" {
	alias = "virginia"
	region = "us-east-1"
}

variable "domain_name_mc"{
	default = "tf.mrcarmona.com"
}

variable "alternate_domain_name_mc" {
	default = "www.tf.mrcarmona.com"
}


module "ssl_certificate_mc" {
	source = "./modules/cert"
	providers = {
		aws = aws
		aws.virginia = aws.virginia
	}
	domain_name = var.domain_name_mc
	alternate_domain_name = var.alternate_domain_name_mc
}

module "s3_mc" {
	source = "./modules/mc"
	certificate = module.ssl_certificate_mc.certificate
	certificate_records = module.ssl_certificate_mc.certificate_records
	zone = module.ssl_certificate_mc.zone
	providers = {
		aws = aws
		aws.virginia = aws.virginia
	}
}
