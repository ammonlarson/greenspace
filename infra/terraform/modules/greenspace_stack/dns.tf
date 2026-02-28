# ---------- Route 53 Hosted Zone ----------

resource "aws_route53_zone" "main" {
  name = var.ses_sender_domain

  tags = {
    Name = "${local.naming_prefix}-zone"
  }
}

# ---------- SES Domain Verification ----------

resource "aws_route53_record" "ses_verification" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_amazonses.${var.ses_sender_domain}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.main.verification_token]
}

# ---------- SES DKIM Records ----------

resource "aws_route53_record" "ses_dkim" {
  count = 3

  zone_id = aws_route53_zone.main.zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"]
}
