export interface IDeployVnet {
    resourceGroupName: string;
    location: string;
    vnetName: string;
    vnetAddressPrefixes: string[];
}

export interface IDeployVpn {
    resourceGroupName: string;
    location: string;
    vnetName: string;
    vpnGatewayName: string;
}

export interface IDeployVpnSiteToSiteConnection {
    resourceGroupName: string;
    location: string;
    vpnGatewayName: string;
    connectionName: string;
    ipsecSharedKey: string;
    gatewayIpAddress: string;
    localAddressPrefixes: string[];
}

export interface IDeployVpnPointToSiteConnection {
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

export interface ICreateResourceGroup {
    location: string;
    resourceGroupName: string;
}

export interface IRemoveResourceGroup {
    resourceGroupName: string;
}
