export interface IApiConfig {
    account: {
        id: string,
    };
    servicePrincipal: {
        appId: string,
        tenant: string,
        password: string,
    };
}

export interface IDeployVnetModel {
    resourceGroupName: string;
    location: string;
    vnetName: string;
    vnetAddressPrefixes: string[];
}

export interface IDeployVpnModel {
    resourceGroupName: string;
    location: string;
    vnetName: string;
    vpnGatewayName: string;
}

export interface IDeployVpnSiteToSiteConnectionModel {
    resourceGroupName: string;
    location: string;
    vpnGatewayName: string;
    connectionName: string;
    ipsecSharedKey: string;
    gatewayIpAddress: string;
    localAddressPrefixes: string[];
}

export interface IDeployVpnPointToSiteConnectionModel {
    resourceGroupName: string;
    location: string;
    vpnGatewayName: string;
    /**
     * The base 64 encoded public certificate data
     *
     * See:
     * https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-certificates-point-to-site-linux
     *
     * https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-certificates-point-to-site
     */
    cert: string;
}

export interface IRemoveResourceGroup {
    resourceGroupName: string;
}

export interface IDeploymentTemplate {
    template: any;

}
