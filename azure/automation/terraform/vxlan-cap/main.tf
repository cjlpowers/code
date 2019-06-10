################################
# Variables
################################
variable "prefix" {
  default = "vxlan-cap"
}

variable "ipRangePrefix" {
  default = "10.0.0"
}

variable "adminUser" {
  default = "cpowers"
}

variable "adminPassword" {
  default = "Password123"
}

locals {
  vmssInstances = 1
}

################################
# Provider
################################
provider "azurerm" {
  # whilst the `version` attribute is optional, we recommend pinning to a given version of the Provider
  version = "=1.28.0"
}

################################
# Resources
################################
resource "azurerm_resource_group" "rg" {
  name     = "${var.prefix}"
  location = "West US"
}

resource "azurerm_virtual_network" "vnet" {
  name                = "${var.prefix}"
  location            = "${azurerm_resource_group.rg.location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  address_space       = ["${var.ipRangePrefix}.0/24"]
}

resource "azurerm_subnet" "subnet1" {
  name                 = "subnet1"
  virtual_network_name = "${azurerm_virtual_network.vnet.name}"
  resource_group_name  = "${azurerm_resource_group.rg.name}"
  address_prefix       = "${var.ipRangePrefix}.0/28"
}

resource "azurerm_subnet" "subnet2" {
  name                 = "subnet2"
  virtual_network_name = "${azurerm_virtual_network.vnet.name}"
  resource_group_name  = "${azurerm_resource_group.rg.name}"
  address_prefix       = "${var.ipRangePrefix}.16/28"
}

resource "random_string" "fqdn" {
 length  = 6
 special = false
 upper   = false
 number  = false
}

resource "azurerm_public_ip" "vmss" {
 name                         = "vmss-public-ip"
 location                     = "${azurerm_resource_group.rg.location}"
 resource_group_name          = "${azurerm_resource_group.rg.name}"
 allocation_method            = "Static"
 domain_name_label            = "${random_string.fqdn.result}"
 sku                          = "Standard"
}

resource "azurerm_lb" "vmss" {
 name                = "${var.prefix}-lb"
 location            = "${azurerm_resource_group.rg.location}"
 resource_group_name = "${azurerm_resource_group.rg.name}"
 sku                 = "Standard"

 frontend_ip_configuration {
   name                 = "PublicIPAddress"
   public_ip_address_id = "${azurerm_public_ip.vmss.id}"
 }
}

resource "azurerm_lb_backend_address_pool" "bpepool" {
 resource_group_name = "${azurerm_resource_group.rg.name}"
 loadbalancer_id     = "${azurerm_lb.vmss.id}"
 name                = "${var.prefix}-bepool"
}

resource "azurerm_lb_probe" "vmss" {
 resource_group_name = "${azurerm_resource_group.rg.name}"
 loadbalancer_id     = "${azurerm_lb.vmss.id}"
 name                = "ssh-running-probe"
 port                = "22"
}

resource "azurerm_lb_rule" "rule_haports" {
   resource_group_name            = "${azurerm_resource_group.rg.name}"
   loadbalancer_id                = "${azurerm_lb.vmss.id}"
   name                           = "ha_ports"
   protocol                       = "UDP"
   frontend_port                  = 4789
   backend_port                   = 4789
   backend_address_pool_id        = "${azurerm_lb_backend_address_pool.bpepool.id}"
   frontend_ip_configuration_name = "PublicIPAddress"
   probe_id                       = "${azurerm_lb_probe.vmss.id}"
}

resource "azurerm_virtual_machine_scale_set" "vmss" {
 name                = "${var.prefix}-vmss"
 location            = "${azurerm_resource_group.rg.location}"
 resource_group_name = "${azurerm_resource_group.rg.name}"
 upgrade_policy_mode = "Manual"

 sku {
   name     = "Standard_DS1_v2"
   tier     = "Standard"
   capacity = "${local.vmssInstances}"
 }

 storage_profile_image_reference {
   publisher = "Canonical"
   offer     = "UbuntuServer"
   sku       = "16.04-LTS"
   version   = "latest"
 }

 storage_profile_os_disk {
   name              = ""
   caching           = "ReadWrite"
   create_option     = "FromImage"
   managed_disk_type = "Standard_LRS"
 }

 storage_profile_data_disk {
   lun          = 0
   caching        = "ReadWrite"
   create_option  = "Empty"
   disk_size_gb   = 10
 }

 os_profile {
   computer_name_prefix = "vmlab"
   admin_username       = "${var.adminUser}"
   admin_password       = "${var.adminPassword}"
   custom_data          = "${file("cloud.conf")}"
 }

 os_profile_linux_config {
   disable_password_authentication = false
 }

 network_profile {
   name    = "network_profile"
   primary = true

   ip_configuration {
     name                                   = "IPConfiguration"
     subnet_id                              = "${azurerm_subnet.subnet2.id}"
     load_balancer_backend_address_pool_ids = ["${azurerm_lb_backend_address_pool.bpepool.id}"]
     primary                                = true
   }
 }
}

resource "azurerm_public_ip" "vm" {
    name                         = "${var.prefix}-vm-pip"
    location                     = "${azurerm_resource_group.rg.location}"
    resource_group_name          = "${azurerm_resource_group.rg.name}"
    allocation_method            = "Dynamic"
}

resource "azurerm_network_interface" "vm-nic" {
    name                = "${var.prefix}-vm-nic"
    location            = "${azurerm_resource_group.rg.location}"
    resource_group_name = "${azurerm_resource_group.rg.name}"

    ip_configuration {
        name                          = "myNicConfiguration"
        subnet_id                     = "${azurerm_subnet.subnet1.id}"
        private_ip_address_allocation = "Dynamic"
        public_ip_address_id          = "${azurerm_public_ip.vm.id}"
    }

    tags = {
        environment = "Terraform Demo"
    }
}

resource "azurerm_virtual_machine" "vm" {
    name                  = "${var.prefix}-vm"
    location              = "${azurerm_resource_group.rg.location}"
    resource_group_name   = "${azurerm_resource_group.rg.name}"
    network_interface_ids = ["${azurerm_network_interface.vm-nic.id}"]
    vm_size               = "Standard_DS1_v2"

    storage_os_disk {
        name              = "myOsDisk"
        caching           = "ReadWrite"
        create_option     = "FromImage"
        managed_disk_type = "Premium_LRS"
    }

    storage_image_reference {
        publisher = "Canonical"
        offer     = "UbuntuServer"
        sku       = "16.04.0-LTS"
        version   = "latest"
    }

    os_profile {
        computer_name         = "vm"
        admin_username       = "${var.adminUser}"
        admin_password       = "${var.adminPassword}"
    }

    os_profile_linux_config {
        disable_password_authentication = false
    }
}

################################
# Outputs
################################