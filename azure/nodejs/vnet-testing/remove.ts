import * as MsRestAzure from 'ms-rest-azure';
import * as AzureArmResource from 'azure-arm-resource';
import * as AzureArmNetwork from 'azure-arm-network';
import * as minimist from 'minimist';
import {config} from './config'

let rawArgs =  minimist(process.argv.slice(2));

const args ={
  resourceGroup: <string>rawArgs["resource-group"]
}

async function main() {
    const credentials = await MsRestAzure.loginWithServicePrincipalSecret(config.servicePrincipal.appId, config.servicePrincipal.password, config.servicePrincipal.tenant)
    const resourceClient = new AzureArmResource.ResourceManagementClient(credentials, config.account.id)

    await resourceClient.resourceGroups.deleteMethod(args.resourceGroup)
}
main()