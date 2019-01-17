import * as MsRestAzure from 'ms-rest-azure'
import * as AzureArmResource from 'azure-arm-resource'
import * as AzureArmNetwork from 'azure-arm-network'
import * as yargs from 'yargs'
import {config} from './config'

const argv = yargs
    .version("1.0.0")
    .option("resource-group",{
        demand: true,
        description: "The Azure resource group name",
    })
    .argv

const args ={
  resourceGroup: <string>argv.resourceGroup
}

async function main() {
    const credentials = await MsRestAzure.loginWithServicePrincipalSecret(config.servicePrincipal.appId, config.servicePrincipal.password, config.servicePrincipal.tenant)
    const resourceClient = new AzureArmResource.ResourceManagementClient(credentials, config.account.id)

    await resourceClient.resourceGroups.deleteMethod(args.resourceGroup)
}
main()