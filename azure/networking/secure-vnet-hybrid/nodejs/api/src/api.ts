
import * as Models from "./models";
import { AzureConnection } from "./azureConnection";

export class Api {
    constructor(private connection: AzureConnection) {
    }

    public async getResourceGroup(resourceGroupName: string) {
        const resourceClient = await this.connection.getResourceClient();
        await resourceClient.resourceGroups.get(resourceGroupName);
    }

    public async exportResourceGroup(resourceGroupName: string) {
        const resourceClient = await this.connection.getResourceClient();
        return resourceClient.resourceGroups.exportTemplate(resourceGroupName, {
            resources: [
                "*",
            ],
        });
    }

    public async createResourceGroup(model: Models.ICreateResourceGroup) {
        const resourceClient = await this.connection.getResourceClient();
        return resourceClient.resourceGroups.createOrUpdate(model.resourceGroupName, {
            location: model.location,
        });
    }

    public async removeResourceGroup(model: Models.IRemoveResourceGroup) {
        const resourceClient = await this.connection.getResourceClient();
        await resourceClient.resourceGroups.deleteMethod(model.resourceGroupName);
    }

    public async deployVnet(model: Models.IDeployVnet) {
        const resourceClient = await this.connection.getResourceClient();
        const networkClient = await this.connection.getNetworkClient();

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

    public async deployVpn(model: Models.IDeployVpn) {
        const networkClient = await this.connection.getNetworkClient();

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

    public async deployVpnSiteToSiteConnection(model: Models.IDeployVpnSiteToSiteConnection) {
        const networkClient = await this.connection.getNetworkClient();

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

    public async deployVpnPointToSiteConnection(model: Models.IDeployVpnPointToSiteConnection) {
        const networkClient = await this.connection.getNetworkClient();

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
}
