terraform {
	required_providers {
		cloud = {
			source = "hashicorp/aws"
		}
	}
}

variable "domain_name" {
	type = string
}

variable "alternate_domain_name" {
	type = string
}

// SSL Certificate for website with and without www prefix
resource "aws_acm_certificate" "certificate" {
	domain_name = var.domain_name
	subject_alternative_names = ["${var.alternate_domain_name}"]
	validation_method = "DNS"

	lifecycle {
		create_before_destroy = true
	}
	provider = aws.virginia
}

// Create Route 53 Zone for cloudfront distribution
resource "aws_route53_zone" "zone" {
	name = "${var.domain_name}"
	force_destroy = true
}

// Create DNS records for SSL certificates
resource "aws_route53_record" "dns_records_ssl" {
	for_each = {
		//for dvo in aws_acm_certificate.certificate_mc.domain_validation_options : dvo.domain_name => {
		for dvo in aws_acm_certificate.certificate.domain_validation_options : dvo.domain_name => {
			name	= dvo.resource_record_name
			record	= dvo.resource_record_value
			type	= dvo.resource_record_type
		}
	}

	allow_overwrite = true
	name = each.value.name
	records = [each.value.record]
	ttl = 60
	type = each.value.type
	zone_id = aws_route53_zone.zone.zone_id
}

output "certificate" {
	value = aws_acm_certificate.certificate
	description = "The ACM certificate resource"
}

output "certificate_records" {
	value = aws_route53_record.dns_records_ssl
	description = "The DNS records for the SSL certificate"
}

output "zone" {
	value = aws_route53_zone.zone
}
