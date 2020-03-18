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

## Installation
1. Clone the repository to your local computer by running: 
    ```bash
    git clone https://github.com/kevinschoonover/kschoon.me.git
    ```

2. Generate a new (or reuse an old) personal access token by navigating to the
   [Applications & API section](https://cloud.digitalocean.com/account/api) of
   the DigitalOcean control panel with read AND write permissions. Be sure to
   save this token.

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

7. Generate a ssh key with the following path `~/.ssh/kschoon-digitalocean`:
    ```bash
    ssh-keygen -t rsa -b 4096
    ```

7. Initialize terraform:
```bash
terraform init
```

7. Switch to the 'developement' terraform workspace:
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
ansible-playbook -i digital_ocean.py site.yml
```
