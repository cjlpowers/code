import * as AzureArmNetwork from "azure-arm-network";
import * as AzureArmResource from "azure-arm-resource";
import * as MsRestAzure from "ms-rest-azure";

export interface IAzureConnectionSettings {
    account: {
        id: string,
    };
    servicePrincipal: {
        appId: string,
        tenant: string,
        password: string,
    };
}

export class AzureConnection {
    private credentials: MsRestAzure.ApplicationTokenCredentials;
    private resourceClient: AzureArmResource.ResourceManagementClient;
    private networkClient: AzureArmNetwork.NetworkManagementClient;

    constructor(private settings: IAzureConnectionSettings) {
    }

    public async getCredentials() {
        this.credentials = this.credentials || await MsRestAzure.loginWithServicePrincipalSecret(
            this.settings.servicePrincipal.appId,
            this.settings.servicePrincipal.password,
            this.settings.servicePrincipal.tenant);
        return this.credentials;
    }

    public async getResourceClient() {
        const credentials = await this.getCredentials();
        this.resourceClient = this.resourceClient || new AzureArmResource.ResourceManagementClient(credentials, this.settings.account.id);
        return this.resourceClient;
    }

    public async getNetworkClient() {
        const credentials = await this.getCredentials();
        this.networkClient = this.networkClient || new AzureArmNetwork.NetworkManagementClient(credentials, this.settings.account.id);
        return this.networkClient;
    }
}
