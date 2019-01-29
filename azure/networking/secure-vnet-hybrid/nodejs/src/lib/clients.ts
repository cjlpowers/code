import * as MsRestAzure from 'ms-rest-azure';
import * as AzureArmResource from 'azure-arm-resource';
import * as AzureArmNetwork from 'azure-arm-network';
import { config } from '../config'

export class Clients {

    private static async GetCredentials() {
        return await MsRestAzure.loginWithServicePrincipalSecret(config.servicePrincipal.appId, config.servicePrincipal.password, config.servicePrincipal.tenant)
    }

    static async GetResourceClient() {
        const credentials = await this.GetCredentials();
        return new AzureArmResource.ResourceManagementClient(credentials, config.account.id)
    }

    static async GetNetworkClient() {
        const credentials = await this.GetCredentials();
        return new AzureArmNetwork.NetworkManagementClient(credentials, config.account.id)
    }
}