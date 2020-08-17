terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "kschoon"

    workspaces {
      prefix = "kschoonme-"
    }
  }
  required_providers {
    cloudflare = {
      source = "terraform-providers/cloudflare"
      version = "~> 2.9.0"
    }
    azure = {
      source = "azurerm"
      version = "~> 2.23.0"
    }
  }
  required_version = ">= 0.13"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "kschoonme" {
  name     = "kschoonme"
  location = "Central US"
}

# NOTE: the Name used for Redis needs to be globally unique
resource "azurerm_redis_cache" "primary" {
  name                = "kschoonme-redis-primary"
  location            = azurerm_resource_group.kschoonme.location
  resource_group_name = azurerm_resource_group.kschoonme.name
  capacity            = 0
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
  }
}

resource "azurerm_postgresql_server" "primary" {
  name                = "kschoonme-postgres-primary"
  location            = azurerm_resource_group.kschoonme.location
  resource_group_name = azurerm_resource_group.kschoonme.name

  sku_name = "B_Gen5_1"

  storage_mb                   = 5120
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = true

  administrator_login          = "kevin"
  administrator_login_password = var.postgresql_admin_pass
  version                      = "11"
  ssl_enforcement_enabled      = true
}

resource "azurerm_postgresql_database" "identity" {
  name                = "identity"
  resource_group_name = azurerm_resource_group.kschoonme.name
  server_name         = azurerm_postgresql_server.primary.name
  charset             = "UTF8"
  collation           = "English_United States.1252"
}

resource "azurerm_virtual_network" "primary" {
  name                = "kschoonme-network"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.kschoonme.location
  resource_group_name = azurerm_resource_group.kschoonme.name
}

resource "azurerm_subnet" "internal" {
  name                 = "internal"
  resource_group_name  = azurerm_resource_group.kschoonme.name
  virtual_network_name = azurerm_virtual_network.primary.name
  address_prefixes     = ["10.0.2.0/24"]
}

resource "azurerm_public_ip" "vm1" {
  name                = "kschoonme-vm1-ip"
  resource_group_name = azurerm_resource_group.kschoonme.name
  location            = azurerm_resource_group.kschoonme.location
  allocation_method   = "Static"

  tags = {
    environment = terraform.workspace == "production" ? "Production" : "Development"
  }
}

resource "azurerm_network_interface" "vm1" {
  name                = "vm1-nic"
  location            = azurerm_resource_group.kschoonme.location
  resource_group_name = azurerm_resource_group.kschoonme.name

  ip_configuration {
    name                          = "network"
    subnet_id                     = azurerm_subnet.internal.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id = azurerm_public_ip.vm1.id
  }
}

resource "azurerm_linux_virtual_machine" "primary" {
  name                = "kschoon.me"
  resource_group_name = azurerm_resource_group.kschoonme.name
  location            = azurerm_resource_group.kschoonme.location
  size                = "Standard_F2"
  admin_username      = "kevin"
  network_interface_ids = [
    azurerm_network_interface.vm1.id,
  ]

  admin_ssh_key {
    username   = "kevin"
    public_key = terraform.workspace == "production" ? file("./.keys/digitalocean-kschoon.pub") : file("./.keys/vms-kschoon-dev.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
}

resource "cloudflare_zone" "kschoonme" {
    zone = terraform.workspace == "production" ? "kschoon.me" : "kschoon.dev"
}

resource "cloudflare_record" "root" {
  zone_id = cloudflare_zone.kschoonme.id
  type    = "CNAME"
  name    = "@" 
  value   = "nervous-hoover-27535d.netlify.app"
}

resource "cloudflare_record" "www" {
  zone_id = cloudflare_zone.kschoonme.id
  type    = "CNAME"
  name    = "www"
  value   = "nervous-hoover-27535d.netlify.app"
}

resource "cloudflare_record" "api" {
  zone_id = cloudflare_zone.kschoonme.id
  type    = "A"
  name    = "api"
  value   = azurerm_linux_virtual_machine.primary.public_ip_address
}

resource "cloudflare_record" "traefik" {
  zone_id = cloudflare_zone.kschoonme.id
  type    = "A"
  name    = "traefik"
  value   = azurerm_linux_virtual_machine.primary.public_ip_address
}

resource "cloudflare_record" "faktory" {
  zone_id = cloudflare_zone.kschoonme.id
  type    = "A"
  name    = "faktory"
  value   = azurerm_linux_virtual_machine.primary.public_ip_address
}

resource "cloudflare_record" "sso" {
  zone_id = cloudflare_zone.kschoonme.id
  type    = "A"
  name    = "sso"
  value   = azurerm_linux_virtual_machine.primary.public_ip_address
}

resource "cloudflare_record" "checkin" {
  zone_id = cloudflare_zone.kschoonme.id
  type    = "CNAME"
  name    = "checkin"
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
