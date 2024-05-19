# Firewall policy sample

Demonstrates how a Azure Firewall policy rules can be managed in a modular way.

## Pre-requisites

Assumed operating system is Linux ([WSL](https://learn.microsoft.com/en-us/windows/wsl/install) can be used).

1. Install the [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-linux?pivots=apt) and login.

    ``` bash
    # Login
    az login
    ```

1. Select the target subscription.

    ``` bash
    # Show all accounts
    az account list --query "[][name, id]"

    # Set account (subscription) by id
    az account set --subscription "xxxx-xx-xx-xxxx"
    ```

1. Install the provided Azure Firewall Bicep Macros extension (optional).

    ``` bash
    # Install the extension from .vsix file
    code --install-extension "macros/extension/az-fw-bicep-macros-0.0.2.vsix"
    ```

    > Note: If you have never manually installed a VS Code extension before please read [Install from a VSIX](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix).

## Usage

### Authoring

You can easily add new firewall rule collection groups or firewall rule collections using the decorators provided with the .vsix extension.

Install the provided extension or view it's [README](macros/repo/README.md) to learn more.

### Deploy

Deploy the firewall policy using the provided [Makefile](https://makefiletutorial.com/).

```bash
# Start the deployment
make
```
