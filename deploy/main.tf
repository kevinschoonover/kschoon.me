provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_ssh_key" "default" {
    name = "kschoon.me SSH Key"
    public_key = file("~/.ssh/kschoon-digitalocean.pub")
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

resource "digitalocean_domain" "api" {
  name       = "api.kschoon.me"
  ip_address = digitalocean_droplet.primary_api.ipv4_address
}

resource "digitalocean_project" "default" {
  name = terraform.workspace == "production" ? "kschoon.me" : "kschoon.me - dev"
  description = "All *.kschoon.me services and infrastructure"
  purpose = "Other"
  environment = terraform.workspace == "production" ? "production" : "development"
  resources   = [digitalocean_droplet.primary_api.urn, digitalocean_domain.api.urn]
}
