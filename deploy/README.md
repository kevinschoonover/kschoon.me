# Deploy
All infrastructure as code (IaC) and instructions used to deploy the
\*.kschoon.me services from scratch.

## Table of Contents
+ [Requirements](#requirements)
+ [Installation](#installation)

## Requirements
+ [Terraform](https://www.terraform.io/docs/index.html)
+ [git](https://git-scm.com/downloads)
+ [ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
+ [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

## Installation
1. Clone the repository to your local computer by running: 
    ```bash
    git clone https://github.com/kevinschoonover/kschoon.me.git
    ```

2. Generate a new (or reuse an old) personal access token by navigating to the
   [Applications & API section](https://cloud.digitalocean.com/account/api) of
   the DigitalOcean control panel with read AND write permissions. Be sure to
   save this token.

2. Generate a new (or reuse an old) cloudflare API token token by navigating to
   the [API Tokens section](https://dash.cloudflare.com/profile/api-tokens) in
   profile settings on [cloudflare](https://dash.cloudflare.com/) with the `Zone
   DNS Edit` and `Zone Zone Edit` permissions.

3. [Login to Azure using the Azure
   CLI](https://www.terraform.io/docs/providers/azurerm/guides/azure_cli.html)
   and point it to the appropriate subscription.
   
3. Navigate to the `deploy` directory in the repo:
    ```bash
    cd ./kschoon.me/deploy
    ```

3. Copy the `secrets.examples.tfvars` into `secrets.auto.tfvars`:
    ```bash
    cp secrets.examples.tfvars secrets.auto.tfvars
    ```

   The `*.auto.tfvars` is used to automatically apply the variables to any run
   of terraform

4. Populate the `secrets.auto.tfvars` with the appropriate values.

5. Copy the `digital_ocean.examples.ini` into `digital_ocean.ini`:
    ```bash
    cp digital_ocean.examples.tfvars digital_ocean.ini
    ```

6. Populate the `digital_ocean.ini` with the appropriate values.

7. (optional) Generate a ssh key with the following path
   `./.keys/dev-kschoon-vms` (or your own ssh key, but make sure to add it
   to the terraform file):
    ```bash
    ssh-keygen -t rsa -b 4096 -m PEM -f ./.keys/dev-kschoon-vms
    ```

7. (optional) Generate a ssh key with the following path
   `./.keys/prod-kschoon-vms` (or your own ssh key, but make sure to add it to
   the terraform file):
    ```bash
    ssh-keygen -t rsa -b 4096 -m PEM -f ./.keys/prod-kschoon-vms
    ```

8. (optional) Add this SSH Key to the [CircleCI
   Project](https://circleci.com/gh/kevinschoonover/kschoon.me/edit#ssh)

9. (optional) Configure the `add_ssh_key` command in the `.circleci/config.yml`
   to use the appropriate fingerprint

10. (optional) Add the ssh private key to circleci by following 
    [these instructions](https://circleci.com/docs/2.0/add-ssh-key/#steps)

7. Request access to the [kschoon organization](https://app.terraform.io/app/kschoon/workspaces) 
   on [Terraform Cloud](https://app.terraform.io)

8. Generate a terraform cloud access token using their CLI:
    ```bash
    terraform login
    ```

9. Initialize terraform:
    ```bash
    terraform init
    ```

10. Switch to the 'developement' terraform workspace:
    ```bash
    terraform workspace select development
    ```

## Usage
To **spin up** infrastructure, simply run:
```bash
terraform apply
```

To **tear down** infrastructure that has been created, run:
```bash
terraform destroy
```

To **configure provisioned machines**, run:
```bash
# --ask-vault-pass requires the vault password stored by Kevin.
ansible-playbook -i azure_rm.yml site.yml --ask-vault-pass
```
