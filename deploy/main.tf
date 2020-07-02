terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "kschoon"

    workspaces {
      prefix = "kschoonme-"
    }
  }
}

variable "cloudflare_api_token" {
 description = "API Token generated from https://dash.cloudflare.com/profile/api-tokens with Edit DNS Zone permissions"
}

provider "digitalocean" {
  token = var.do_token
}

provider "cloudflare" {
  version = "~> 2.0"
  api_token = var.cloudflare_api_token
}


resource "digitalocean_ssh_key" "default" {
    name = terraform.workspace == "production" ? "kschoon.me prod SSH key" : "kschoon.me dev SSH key"
    public_key = terraform.workspace == "production" ? file("./.keys/digitalocean-kschoon.pub") : file("./.keys/digitalocean-kschoon-dev.pub")
}

resource "digitalocean_droplet" "primary_api" {
  name = "api.kschoon.me"
  # image = "ubuntu-18-04-x64"
  image = "docker-18-04"
  region = "nyc3"
  size = "s-1vcpu-1gb"
  monitoring = true
  private_networking = true
  tags = ["api", "nomad_instances"]
  ssh_keys = [digitalocean_ssh_key.default.fingerprint]
}

resource "digitalocean_project" "default" {
  name = terraform.workspace == "production" ? "kschoon.me" : "kschoon.me - dev"
  description = "All *.kschoon.me services and infrastructure"
  purpose = "Other"
  environment = terraform.workspace == "production" ? "production" : "development"
  resources   = [
    digitalocean_droplet.primary_api.urn, 
  ]
}

resource "cloudflare_zone" "kschoonme" {
    zone = "kschoon.me"

}

resource "cloudflare_record" "root" {
  zone_id = cloudflare_zone.kschoonme.id
  type    = "CNAME"
  name    = terraform.workspace == "production" ? "@" : "dev"

  value   = "nervous-hoover-27535d.netlify.app"
}

resource "cloudflare_record" "www" {
  count   = terraform.workspace == "production" ? "1" : "0"
  zone_id = cloudflare_zone.kschoonme.id
  type    = "CNAME"
  name    = "www"
  value   = "nervous-hoover-27535d.netlify.app"
}

resource "cloudflare_record" "api" {
  zone_id = cloudflare_zone.kschoonme.id
  type    = "A"
  name    = terraform.workspace == "production" ? "api" : "api.dev"
  value   = digitalocean_droplet.primary_api.ipv4_address
}

resource "cloudflare_record" "checkin" {
  zone_id = cloudflare_zone.kschoonme.id
  type    = "CNAME"
  name    = terraform.workspace == "production" ? "checkin" : "checkin.dev"
  value   = "angry-mestorf-27dfe0.netlify.app"
}

resource "cloudflare_record" "mail1" {
  count   = terraform.workspace == "production" ? "1" : "0"
  zone_id = cloudflare_zone.kschoonme.id
  type    = "MX"
  name    = "@"
  value   = "mx1.improvmx.com"
  priority = 10
}

resource "cloudflare_record" "mail2" {
  count   = terraform.workspace == "production" ? "1" : "0"
  zone_id = cloudflare_zone.kschoonme.id
  type    = "MX"
  name    = "@"
  value   = "mx2.improvmx.com"
  priority = 20
}
