import * as AzureArmNetwork from "azure-arm-network";
import * as AzureArmResource from "azure-arm-resource";
import * as MsRestAzure from "ms-rest-azure";
import * as Models from "./models";

export class Api {
    constructor(private config: Models.IApiConfig) {
    }

    public async deployVnet(model: Models.IDeployVnetModel) {
        const resourceClient = await this.getResourceClient();
        const networkClient = await this.getNetworkClient();

        // create or update the resource group
        const rg = await resourceClient.resourceGroups.createOrUpdate(model.resourceGroupName, {
            location: model.location,
            name: model.resourceGroupName,
        });

        // create or update the virtual network
        const vnet = await networkClient.virtualNetworks.createOrUpdate(model.resourceGroupName, model.vnetName, {
            addressSpace: {
                addressPrefixes: model.vnetAddressPrefixes,
            },
            location: rg.location,
            name: model.vnetName,
            subnets: [
                {
                    name: "GatewaySubnet",
                    addressPrefix: "10.0.255.224/27",
                },
                {
                    name: "snet-dmz-in",
                    addressPrefix: "10.0.0.0/27",
                },
                {
                    name: "snet-dmz-out",
                    addressPrefix: "10.0.0.32/27",
                },
                {
                    name: "snet-mgmt",
                    addressPrefix: "10.0.0.128/25",
                },
                {
                    name: "snet-private",
                    addressPrefix: "10.0.1.0/24",
                },
            ],
        });

        return vnet;
    }

    public async deployVpn(model: Models.IDeployVpnModel) {
        const networkClient = await this.getNetworkClient();

        // get the gateway subnet
        const vnet = await networkClient.virtualNetworks.get(model.resourceGroupName, model.vnetName);
        const subnetGateway = vnet.subnets!.filter((x) => x.name === "GatewaySubnet")[0];

        // create a public IP for the VPN gateway
        const vpnGatewayPublicIPName = model.vpnGatewayName + "-ip";
        const vpnGatewayPublicIP = await networkClient.publicIPAddresses.createOrUpdate(
            model.resourceGroupName,
            vpnGatewayPublicIPName,
            {
                name: vpnGatewayPublicIPName,
                location: model.location,
                publicIPAllocationMethod: "Dynamic",
            });

        // create or update the VPN gateway
        const vpnGateway = await networkClient.virtualNetworkGateways.createOrUpdate(
            model.resourceGroupName,
            model.vpnGatewayName,
            {
                name: model.vpnGatewayName,
                location: model.location,
                gatewayType: "Vpn",
                vpnType: "RouteBased",
                sku: {
                    name: "VpnGw1",
                    tier: "VpnGw1",
                    capacity: 0,
                },
                enableBgp: false,
                ipConfigurations: [
                    {
                        name: model.vpnGatewayName + "-ipconfig",
                        publicIPAddress: {
                            id: vpnGatewayPublicIP.id,
                        },
                        subnet: {
                            id: subnetGateway.id,
                        },
                    },
                ],
            });
    }

    public async deployVpnSiteToSiteConnection(model: Models.IDeployVpnSiteToSiteConnectionModel) {
        const networkClient = await this.getNetworkClient();

        // get the vpn gateway
        const vpnGateway = await networkClient.virtualNetworkGateways.get(model.resourceGroupName, model.vpnGatewayName);

        // create the local network gateway
        const localNetworkGatewayName = model.connectionName + "-lgw";
        const localNetworkGateway = await networkClient.localNetworkGateways.createOrUpdate(
            model.resourceGroupName,
            localNetworkGatewayName,
            {
                name: localNetworkGatewayName,
                location: model.location,
                gatewayIpAddress: model.gatewayIpAddress,
                localNetworkAddressSpace: {
                    addressPrefixes: model.localAddressPrefixes,
                },
            });

        // crwate the vpn connection
        const vpnConnection = await networkClient.virtualNetworkGatewayConnections.createOrUpdate(
            model.resourceGroupName,
            model.connectionName,
            {
            name: model.connectionName,
            location: model.location,
            connectionType: "IPsec",
            sharedKey: model.ipsecSharedKey,
            virtualNetworkGateway1: vpnGateway,
            localNetworkGateway2: localNetworkGateway,
                routingWeight: 100,
            });
    }

    public async deployVpnPointToSiteConnection(model: Models.IDeployVpnPointToSiteConnectionModel) {
        const networkClient = await this.getNetworkClient();

        // get the vpn gateway
        let vpnGateway = await networkClient.virtualNetworkGateways.get(model.resourceGroupName, model.vpnGatewayName);
        vpnGateway.vpnClientConfiguration = {
            vpnClientProtocols: [
                "SSTP",
                "IkeV2",
            ],
            vpnClientAddressPool: {
                addressPrefixes: [
                    "172.16.201.0/24",
                ],
            },
            vpnClientRootCertificates: [
                {
                    name: "P2SRootCert",
                    publicCertData: model.cert,
                },
            ],
        };
        vpnGateway = await networkClient.virtualNetworkGateways.createOrUpdate(model.resourceGroupName, model.vpnGatewayName, vpnGateway);
    }

    public async removeResourceGroup(model: Models.IRemoveResourceGroup) {
        const resourceClient = await this.getResourceClient();
        await resourceClient.resourceGroups.deleteMethod(model.resourceGroupName);
    }

    //#region Helpers
    private async getCredentials() {
        return await MsRestAzure.loginWithServicePrincipalSecret(
            this.config.servicePrincipal.appId,
            this.config.servicePrincipal.password,
            this.config.servicePrincipal.tenant);
                }

    private async getResourceClient() {
        const credentials = await this.getCredentials();
        return new AzureArmResource.ResourceManagementClient(credentials, this.config.account.id);
        }

    private async getNetworkClient() {
        const credentials = await this.getCredentials();
        return new AzureArmNetwork.NetworkManagementClient(credentials, this.config.account.id);
    }

    private async deployTemplate(deployment: AzureArmResource.ResourceModels.Deployment) {
        const resourceClient = await this.getResourceClient();
        const result = await resourceClient.deployments.createOrUpdate("", "", deployment);
    }
    //#endregion
}
