import * as MsRestAzure from 'ms-rest-azure'
import * as AzureArmResource from 'azure-arm-resource'
import * as AzureArmNetwork from 'azure-arm-network'
import { _args } from './args'

const argv = _args
    .option("resource-group", {
        demand: true,
        description: "The Azure resource group name",
        string: true
    })
    .argv


async function main() {
    const credentials = await MsRestAzure.loginWithServicePrincipalSecret(argv["sp-app-id"], argv["sp-password"], argv["sp-tenant"])
    const resourceClient = new AzureArmResource.ResourceManagementClient(credentials, argv["account-id"])

    await resourceClient.resourceGroups.deleteMethod(argv["resource-group"])
}
main()