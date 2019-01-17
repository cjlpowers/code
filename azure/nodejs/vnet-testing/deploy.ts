import * as MsRestAzure from 'ms-rest-azure';
import * as AzureArmResource from 'azure-arm-resource';
import * as AzureArmNetwork from 'azure-arm-network';
import * as minimist from 'minimist';
import {config} from './config'

let rawArgs =  minimist(process.argv.slice(2));

const args ={
  resourceGroup: <string>rawArgs["resource-group"],
  location: <string>rawArgs["location"],
  vnetName: <string>rawArgs["vnet-name"]
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