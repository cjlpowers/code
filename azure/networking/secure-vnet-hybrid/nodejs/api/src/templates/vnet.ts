export const vnetTemplate = {
    $schema: "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    contentVersion: "1.0.0.0",
    parameters: {
        virtualNetworks_vnet_name: {
            defaultValue: "vnet",
            type: "String",
        },
        subnets_snet_mgmt_name: {
            defaultValue: "snet-mgmt",
            type: "String",
        },
        subnets_snet_dmz_in_name: {
            defaultValue: "snet-dmz-in",
            type: "String",
        },
        subnets_snet_dmz_out_name: {
            defaultValue: "snet-dmz-out",
            type: "String",
        },
        subnets_snet_private_name: {
            defaultValue: "snet-private",
            type: "String",
        },
        subnets_GatewaySubnet_name: {
            defaultValue: "GatewaySubnet",
            type: "String",
        },
    },
    variables: {},
    resources: [
        {
            type: "Microsoft.Network/virtualNetworks",
            name: "[parameters('virtualNetworks_vnet_name')]",
            apiVersion: "2018-10-01",
            location: "southcentralus",
            scale: null,
            properties: {
                provisioningState: "Succeeded",
                resourceGuid: "da4525b2-e5f1-44a9-98a4-0379063a0ec7",
                addressSpace: {
                    addressPrefixes: [
                        "10.0.0.0/16",
                    ],
                },
                subnets: [
                    {
                        name: "GatewaySubnet",
                        etag: "W/\"5334a098-58af-4088-9245-f5853a4f853a\"",
                        properties: {
                            provisioningState: "Succeeded",
                            addressPrefix: "10.0.255.224/27",
                            delegations: [],
                        },
                    },
                    {
                        name: "snet-dmz-in",
                        etag: "W/\"5334a098-58af-4088-9245-f5853a4f853a\"",
                        properties: {
                            provisioningState: "Succeeded",
                            addressPrefix: "10.0.0.0/27",
                            delegations: [],
                        },
                    },
                    {
                        name: "snet-dmz-out",
                        etag: "W/\"5334a098-58af-4088-9245-f5853a4f853a\"",
                        properties: {
                            provisioningState: "Succeeded",
                            addressPrefix: "10.0.0.32/27",
                            delegations: [],
                        },
                    },
                    {
                        name: "snet-mgmt",
                        etag: "W/\"5334a098-58af-4088-9245-f5853a4f853a\"",
                        properties: {
                            provisioningState: "Succeeded",
                            addressPrefix: "10.0.0.128/25",
                            delegations: [],
                        },
                    },
                    {
                        name: "snet-private",
                        etag: "W/\"5334a098-58af-4088-9245-f5853a4f853a\"",
                        properties: {
                            provisioningState: "Succeeded",
                            addressPrefix: "10.0.1.0/24",
                            delegations: [],
                        },
                    },
                ],
                virtualNetworkPeerings: [],
                enableDdosProtection: false,
                enableVmProtection: false,
            },
            dependsOn: [],
        },
        {
            type: "Microsoft.Network/virtualNetworks/subnets",
            name: "[concat(parameters('virtualNetworks_vnet_name'), '/', parameters('subnets_GatewaySubnet_name'))]",
            apiVersion: "2018-10-01",
            scale: null,
            properties: {
                provisioningState: "Succeeded",
                addressPrefix: "10.0.255.224/27",
                delegations: [],
            },
            dependsOn: [
                "[resourceId('Microsoft.Network/virtualNetworks', parameters('virtualNetworks_vnet_name'))]",
            ],
        },
        {
            type: "Microsoft.Network/virtualNetworks/subnets",
            name: "[concat(parameters('virtualNetworks_vnet_name'), '/', parameters('subnets_snet_dmz_in_name'))]",
            apiVersion: "2018-10-01",
            scale: null,
            properties: {
                provisioningState: "Succeeded",
                addressPrefix: "10.0.0.0/27",
                delegations: [],
            },
            dependsOn: [
                "[resourceId('Microsoft.Network/virtualNetworks', parameters('virtualNetworks_vnet_name'))]",
            ],
        },
        {
            type: "Microsoft.Network/virtualNetworks/subnets",
            name: "[concat(parameters('virtualNetworks_vnet_name'), '/', parameters('subnets_snet_dmz_out_name'))]",
            apiVersion: "2018-10-01",
            scale: null,
            properties: {
                provisioningState: "Succeeded",
                addressPrefix: "10.0.0.32/27",
                delegations: [],
            },
            dependsOn: [
                "[resourceId('Microsoft.Network/virtualNetworks', parameters('virtualNetworks_vnet_name'))]",
            ],
        },
        {
            type: "Microsoft.Network/virtualNetworks/subnets",
            name: "[concat(parameters('virtualNetworks_vnet_name'), '/', parameters('subnets_snet_mgmt_name'))]",
            apiVersion: "2018-10-01",
            scale: null,
            properties: {
                provisioningState: "Succeeded",
                addressPrefix: "10.0.0.128/25",
                delegations: [],
            },
            dependsOn: [
                "[resourceId('Microsoft.Network/virtualNetworks', parameters('virtualNetworks_vnet_name'))]",
            ],
        },
        {
            type: "Microsoft.Network/virtualNetworks/subnets",
            name: "[concat(parameters('virtualNetworks_vnet_name'), '/', parameters('subnets_snet_private_name'))]",
            apiVersion: "2018-10-01",
            scale: null,
            properties: {
                provisioningState: "Succeeded",
                addressPrefix: "10.0.1.0/24",
                delegations: [],
            },
            dependsOn: [
                "[resourceId('Microsoft.Network/virtualNetworks', parameters('virtualNetworks_vnet_name'))]",
            ],
        },
    ],
};
