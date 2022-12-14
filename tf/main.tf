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
