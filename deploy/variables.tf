variable "do_token" {
  description = "DigitalOcean personal access token with read and write access"
}

variable "cloudflare_api_token" {
  description = "API Token generated from https://dash.cloudflare.com/profile/api-tokens with Edit DNS Zone permissions"
}

variable "postgres_admin_user" {
  description = "Admin username for the PostgreSQL server"
  default = "kevin"
}

variable "postgres_admin_pass" {
  description = "Admin password for the PostgreSQL server"
}
