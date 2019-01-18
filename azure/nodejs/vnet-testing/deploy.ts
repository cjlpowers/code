import * as MsRestAzure from 'ms-rest-azure';
import * as AzureArmResource from 'azure-arm-resource';
import * as AzureArmNetwork from 'azure-arm-network';
import * as yargs from 'yargs'
import {config} from './config'

const argv = yargs
    .version("1.0.0")
    .option("resource-group",{
        demand: true,
        description: "The Azure resource group name",
    })
    .option("location",{
        demand: true,
        description: "The Azure location",
    })
    .option("vnet-name",{
        demand: true,
        description: "The virtual network name",
    })
    .argv

const args = {
  resourceGroup: <string>argv.resourceGroup,
  location: <string>argv.location,
  vnetName: <string>argv.vnetName,
}

async function main() {
    const credentials = await MsRestAzure.loginWithServicePrincipalSecret(config.servicePrincipal.appId, config.servicePrincipal.password, config.servicePrincipal.tenant)
    const resourceClient = new AzureArmResource.ResourceManagementClient(credentials, config.account.id)
    const networkClient = new AzureArmNetwork.NetworkManagementClient(credentials, config.account.id)

    const rg =  await resourceClient.resourceGroups.createOrUpdate(args.resourceGroup,{
        location: args.location,
        name: args.resourceGroup
    })
    
    const vnet = await networkClient.virtualNetworks.createOrUpdate(rg.name, args.vnetName,{
        name: args.vnetName,
        location: args.location,
        addressSpace: {
            addressPrefixes: [
                "10.0.0.0/16"
            ]
        },
        subnets:[
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