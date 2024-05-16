# Firewall policy sample

Demonstrates how a Azure Firewall policy rules can be managed in a modular way.

## Pre-requisites

Assumed operating system is Linux ([WSL](https://learn.microsoft.com/en-us/windows/wsl/install) can be used).

1. Install the [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-linux?pivots=apt) and login.

    ``` bash
    # Login
    az login
    ```

1. Select the target subscription

    ``` bash
    # Show all accounts
    az account list --query "[][name, id]"

    # Set account (subscription) by id
    az account set --subscription "xxxx-xx-xx-xxxx"
    ```

## Usage

Run this sample using the provided [Makefile](https://makefiletutorial.com/).

```bash
# Start the deployment
make
```