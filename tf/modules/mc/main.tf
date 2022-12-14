// Access policy for public access to the bucket
data "aws_iam_policy_document" "aws_s3_public_policy" {
	statement {
		sid = "AllowPublicReadAccess"

		/*
		principals {
			type		= "AWS"
			identifiers = ["270746110037"]
		}
		*/

		
		principals {
			type		= "*"
			identifiers = ["*"]
		}
		
		actions = [
			"s3:GetObject",
			"s3:ListBucket",
		]

		resources = [
			"arn:aws:s3:::${var.domain_name_mc}",
			"arn:aws:s3:::${var.domain_name_mc}/*",
		]
	}
}

// Create a bucket
resource "aws_s3_bucket" "bucket_mc" {
	timeouts {
		create = "5m"
	}
	bucket = "${var.domain_name_mc}"
	// acl = "${var.acl_value}"
}

// Bucket access policy created with policy document above
resource "aws_s3_bucket_policy" "allow_access_mc" {
	bucket = "${var.domain_name_mc}"
	policy = data.aws_iam_policy_document.aws_s3_public_policy.json
	depends_on = [
		aws_s3_bucket.bucket_mc
	]
}

// Configure bucket to be used as a website
resource "aws_s3_bucket_website_configuration" "website_mc" {
		bucket = "${var.domain_name_mc}"
		index_document {
			suffix = "index.html"
		}
		error_document {
			key = "index.html"
		}

		// Sample routing rule to replace prefix
		routing_rules = <<EOF
[{
	"Condition": {
		"KeyPrefixEquals": "docs/"
	},
	"Redirect": {
		"ReplaceKeyPrefixWith": "documents/"
	}
}]
EOF
}

// Enable ssl for bucket?
resource "aws_s3_bucket_server_side_encryption_configuration" "ssl_mc" {
	bucket = "${var.domain_name_mc}"
	
	rule {
		apply_server_side_encryption_by_default {
			sse_algorithm = "AES256"
		}
	}
}

// Create log bucket
resource "aws_s3_bucket" "bucket_log_mc" {
	bucket = "${var.log_name}"
	force_destroy = true
}

// Set log bucket acl to be used as a log bucket
resource "aws_s3_bucket_acl" "bucket_log_mc_acl" {
	bucket = aws_s3_bucket.bucket_log_mc.id
	acl = "log-delivery-write"
}

// Set logging bucket for website bucket
resource "aws_s3_bucket_logging" "bucket_log_mc_example_link" {
	bucket = "${var.domain_name_mc}"
	target_bucket = "${var.log_name}"
	target_prefix = "log/"
}

// Block public access to log bucket
resource "aws_s3_bucket_public_access_block" "bucket_log_mc_block" {
	bucket = "${var.log_name}"
	block_public_acls = true
	block_public_policy = true
	ignore_public_acls = true
	restrict_public_buckets = true
}

variable "bucket_name" {
	default = "tf.mrcarmona.com"
}

variable "acl_value" {
	default = "private"
}

variable "log_name" {
	default = "thisisabuckettestlogdoneat1009202201468"
}


variable "domain_name_mc"{
	default = "tf.mrcarmona.com"
}

variable "alternate_domain_name_mc" {
	default = "www.tf.mrcarmona.com"
}

/*
// SSL Certificate for website with and without www prefix
resource "aws_acm_certificate" "certificate_mc" {
	domain_name = var.domain_name_mc
	subject_alternative_names = ["${var.alternate_domain_name_mc}"]
	validation_method = "DNS"

	lifecycle {
		create_before_destroy = true
	}
	provider = aws.virginia
}
*/






locals {
	s3_origin_id = "tfs3origin"
}

// Identity required for cloudfront distribution
resource "aws_cloudfront_origin_access_identity" "ex-identity" {
	comment = "Some comment"
}

// Cloudfront distribution for website bucket
resource "aws_cloudfront_distribution" "tf_distribution" {
	origin {
		domain_name = aws_s3_bucket.bucket_mc.bucket_regional_domain_name
		origin_id = aws_cloudfront_origin_access_identity.ex-identity.id

		s3_origin_config {
			origin_access_identity = aws_cloudfront_origin_access_identity.ex-identity.cloudfront_access_identity_path
		}
	}

	enabled = true
	is_ipv6_enabled = true
	default_root_object = "index.html"
	http_version = "http3"

	logging_config {
		include_cookies = false
		bucket = "${var.log_name}.s3.amazonaws.com"
		prefix = "cf_log"
	}

	aliases = ["${var.domain_name_mc}", "${var.alternate_domain_name_mc}"]

	default_cache_behavior {
		allowed_methods = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
		cached_methods = ["GET", "HEAD"]
		target_origin_id = aws_cloudfront_origin_access_identity.ex-identity.id

		forwarded_values {
			query_string = false


			cookies {
				forward = "none"
			}
		}

		compress = true
		viewer_protocol_policy = "redirect-to-https"
		min_ttl = 0
		default_ttl = 3600
		max_ttl = 86400
	}

	price_class = "PriceClass_200"

	// Need to look over geo restrictions, currently US, Canada, Britain, and Germany allowed only
	restrictions {
		geo_restriction {
			restriction_type = "whitelist"
			locations =  ["US", "CA", "GB", "DE"]
		}
	}

	tags = {
		Environment = "production"
	}
	
	viewer_certificate {
		acm_certificate_arn = var.certificate.arn
		ssl_support_method = "sni-only"
		//cloudfront_default_certificate = true
	}
	provider = aws.virginia
	depends_on = [
		aws_acm_certificate_validation.cert_validation_mc
	]
}







variable "certificate" {
	description = "AWS ACM Certificate resource for website bucket"
	type = any
}


variable "certificate_records" {
	description = "DNS Records for the SSL certificates"
	type = any
}

variable "zone" {
	type = any
}

// Create DNS A record for bucket through distribution
resource "aws_route53_record" "a_record_mc" {
	zone_id = var.zone.zone_id
	name = "${var.domain_name_mc}"
	type = "A"

	alias {
		name = aws_cloudfront_distribution.tf_distribution.domain_name
		zone_id = aws_cloudfront_distribution.tf_distribution.hosted_zone_id
		evaluate_target_health = true
	}
}

// Create DNS C record to redirect to website without www prefix
resource "aws_route53_record" "c_record_mc" {
	zone_id = var.zone.zone_id
	name = "www"
	type = "CNAME"
	ttl = 5

	geolocation_routing_policy {
		country = "*"
	}

	set_identifier = "tf"
	records = ["${var.domain_name_mc}"]
}


// Ensure SSL certificates have been validated before building other resources that use it
resource "aws_acm_certificate_validation" "cert_validation_mc" {
	certificate_arn = var.certificate.arn
	validation_record_fqdns = [for record in var.certificate_records : record.fqdn]

	timeouts {
		create = "40m"
	}
	provider = aws.virginia
}


/*
resource "aws_lb_listener" "cert_listener" {
	certificate_arn = aws_acm_certificate_validation.cert_validation_mc.certificate_arn
}
*/
