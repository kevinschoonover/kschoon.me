provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_ssh_key" "default" {
    name = "kschoon.me SSH Key"
    public_key = file("~/.ssh/kschoon-digitalocean.pub")
}

resource "digitalocean_droplet" "primary_api" {
  name = "api.kschoon.me"
  image = "ubuntu-18-04-x64"
  region = "nyc3"
  size = "s-1vcpu-1gb"
  monitoring = true
  private_networking = true
  tags = ["api"]
  ssh_keys = [digitalocean_ssh_key.default.fingerprint]
}

resource "digitalocean_project" "default" {
  name = terraform.workspace == "production" ? "kschoon.me" : "kschoon.me - dev"
  description = "All *.kschoon.me services and infrastructure"
  purpose = "Other"
  environment = terraform.workspace == "production" ? "production" : "development"
  resources   = [digitalocean_droplet.primary_api.urn]
}
