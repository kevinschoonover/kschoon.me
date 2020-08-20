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

2. Generate a new (or reuse an old) cloudflare API token token by navigating to
   the [API Tokens section](https://dash.cloudflare.com/profile/api-tokens) in
   profile settings on [cloudflare](https://dash.cloudflare.com/) with the `Zone
   DNS Edit` and `Zone Zone Edit` permissions.

3. [Login to Azure using the Azure
   CLI](https://www.terraform.io/docs/providers/azurerm/guides/azure_cli.html)
   and point it to the appropriate subscription.

4. Navigate to the `deploy` directory in the repo:
    ```bash
    cd ./kschoon.me/deploy
    ```

5. Copy the `secrets.examples.tfvars` into `secrets.auto.tfvars`:
    ```bash
    cp secrets.examples.tfvars secrets.auto.tfvars
    ```

   The `*.auto.tfvars` is used to automatically apply the variables to any run
   of terraform

6. Populate the `secrets.auto.tfvars` with the appropriate values.

7. Generate a ssh key with the following path
   `./.keys/dev-kschoon-vms` (or your own ssh key, but make sure to add it
   to the terraform file):
    ```bash
    ssh-keygen -t rsa -b 4096 -m PEM -f ./.keys/dev-kschoon-vms
    ```

8. (optional) Generate a ssh key with the following path
   `./.keys/prod-kschoon-vms` (or your own ssh key, but make sure to add it to
   the terraform file):
    ```bash
    ssh-keygen -t rsa -b 4096 -m PEM -f ./.keys/prod-kschoon-vms
    ```

9. (optional) Add the `prod-kschoon-vms` SSH Key to the [Github Actions
   Secrets](https://github.com/kevinschoonover/kschoon.me/settings/secrets) as
   `DEPLOY_SSH_PRIV_KEY`.

10. Request access to the [kschoon organization](https://app.terraform.io/app/kschoon/workspaces)
   on [Terraform Cloud](https://app.terraform.io)

11. Generate a terraform cloud access token using their CLI:
    ```bash
    terraform login
    ```

12. Initialize terraform:
    ```bash
    terraform init
    ```

13. Switch to the 'development' terraform workspace:
    ```bash
    terraform workspace select development
    ```

14. Populate the `group_vars/terraform.yml` by running:
    ```bash
    poetry run python ./scripts/create_ansible_vars.py
    ```

    **NOTE**: this command must be run everytime you change a variable in
    terraform that would be reflected in ansible like the postgres password.

## Usage
### Refresh the terraform.yml file for ansible
1. Switch to the appropriate workspace:
```bash
terraform workspace select <environment>
```

2. Run the script to populate `./group_vars/terraform.yml`:
```bash
poetry run python ./scripts/create_ansible_vars.py
```

### Configure provisioned machines
To configure **staging** machines, run:
```
# --ask-vault-pass requires the vault password stored by Kevin.
ansible-playbook -i ./inventory/staging_azure_rm.yml site.yml --ask-vault-pass
```

To configure **produciton machines**, run:
```
# --ask-vault-pass requires the vault password stored by Kevin.
ansible-playbook -i ./inventory/prod_azure_rm.yml site.yml --ask-vault-pass
```

### Spinning up infrastructure
```bash
terraform apply
```

### Tearing down infrastructure
```bash
terraform destroy
```
