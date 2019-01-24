import * as MsRestAzure from 'ms-rest-azure';
import * as AzureArmResource from 'azure-arm-resource';
import * as AzureArmNetwork from 'azure-arm-network';
import { config } from './config'
import { _args } from './args'

const argv = _args
    .option("resource-group", {
        demand: true,
        description: "The Azure resource group name",
        string: true
    })
    .option("location", {
        demand: true,
        description: "The Azure location",
        default: "South Central US"
    })
    .option("vnet-name", {
        demand: true,
        description: "The virtual network name",
        default: "vnet"
    })
    .argv

async function main() {
    const credentials = await MsRestAzure.loginWithServicePrincipalSecret(argv["sp-app-id"], argv["sp-password"], argv["sp-tenant"])
    const resourceClient = new AzureArmResource.ResourceManagementClient(credentials, argv["account-id"])
    const networkClient = new AzureArmNetwork.NetworkManagementClient(credentials, argv["account-id"])

    const rg = await resourceClient.resourceGroups.createOrUpdate(argv["resource-group"], {
        location: argv.location,
        name: argv["resource-group"]
    })

    const vnet = await networkClient.virtualNetworks.createOrUpdate(argv["resource-group"], argv["vnet-name"], {
        name: argv["vnet-name"],
        location: rg.location,
        addressSpace: {
            addressPrefixes: [
                "10.0.0.0/16"
            ]
        },
        subnets: [
            {
                name: "snet-dmz-in",
                addressPrefix: "10.0.0.0/27"
            },
            {
                name: "snet-dmz-out",
                addressPrefix: "10.0.0.32/27"
            }
        ]
    })
    console.log(vnet)
}
main()