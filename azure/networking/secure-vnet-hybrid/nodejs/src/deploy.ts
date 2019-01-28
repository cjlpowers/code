import * as MsRestAzure from 'ms-rest-azure';
import * as AzureArmResource from 'azure-arm-resource';
import * as AzureArmNetwork from 'azure-arm-network';
import { config } from './config'
import { Clients } from './clients'

export interface IDeployVnetModel {
    resourceGroup: string,
    location: string,
    vnetName: string,
    addressPrefixes: string[],
}

export async function DeployVnet(model: IDeployVnetModel) {
    const resourceClient = await Clients.GetResourceClient()
    const networkClient = await Clients.GetNetworkClient()

    // create or update the resource group
    const rg = await resourceClient.resourceGroups.createOrUpdate(model.resourceGroup, {
        location: model.location,
        name: model.resourceGroup
    })
    console.log(rg)

    // create or update the virtual network
    const vnet = await networkClient.virtualNetworks.createOrUpdate(model.resourceGroup, model.vnetName, {
        name: model.vnetName,
        location: rg.location,
        addressSpace: {
            addressPrefixes: model.addressPrefixes
        },
        subnets: [
            {
                name: "GatewaySubnet",
                addressPrefix: "10.0.255.224/27"
            },
            {
                name: "snet-dmz-in",
                addressPrefix: "10.0.0.0/27"
            },
            {
                name: "snet-dmz-out",
                addressPrefix: "10.0.0.32/27"
            },
            {
                name: "snet-mgmt",
                addressPrefix: "10.0.0.128/25"
            },
            {
                name: "snet-private",
                addressPrefix: "10.0.1.0/24"
            }
        ]
    })
    console.log(vnet)
}

export interface IDeployVpnModel {
    resourceGroup: string,
    location: string,
    vnetName: string,
    vpnGatewayName: string,
}

export async function DeployVpn(model: IDeployVpnModel) {
    const credentials = await MsRestAzure.loginWithServicePrincipalSecret(config.servicePrincipal.appId, config.servicePrincipal.password, config.servicePrincipal.tenant)
    const networkClient = new AzureArmNetwork.NetworkManagementClient(credentials, config.account.id)

    // get the gateway subnet
    const vnet = await networkClient.virtualNetworks.get(model.resourceGroup, model.vnetName)
    const subnetGateway = vnet.subnets!.filter(x => x.name === "GatewaySubnet")[0]
    console.log(vnet)

    // create a public IP for the VPN gateway
    const vpnGatewayPublicIPName = model.vpnGatewayName + "-ip"
    const vpnGatewayPublicIP = await networkClient.publicIPAddresses.createOrUpdate(model.resourceGroup, vpnGatewayPublicIPName, {
        name: vpnGatewayPublicIPName,
        location: model.location,
        publicIPAllocationMethod: "Dynamic"
    })
    console.log(vpnGatewayPublicIP)

    // create or update the VPN gateway
    const vpnGateway = await networkClient.virtualNetworkGateways.createOrUpdate(model.resourceGroup, model.vpnGatewayName, {
        name: model.vpnGatewayName,
        location: model.location,
        gatewayType: "Vpn",
        vpnType: "RouteBased",
        sku: {
            tier: "Basic",
        },
        ipConfigurations: [
            {
                name: model.vpnGatewayName + "-ipconfig",
                privateIPAllocationMethod: "Dynamic",
                publicIPAddress: {
                    id: vpnGatewayPublicIP.id
                },
                subnet: {
                    id: subnetGateway.id
                }
            }
        ],
    })
    console.log(vpnGateway)
}

export interface IDeployVpnSiteToSiteConnectionModel {
    resourceGroup: string,
    location: string,
    vnetName: string,
    vpnGatewayName: string,
    connectionName: string,
    ipsecSharedKey: string,
    gatewayIpAddress: string,
    localAddressPrefixes: string[],
}

export async function DeployVpnSiteToSiteConnection(model: IDeployVpnSiteToSiteConnectionModel) {
    const credentials = await MsRestAzure.loginWithServicePrincipalSecret(config.servicePrincipal.appId, config.servicePrincipal.password, config.servicePrincipal.tenant)
    const networkClient = new AzureArmNetwork.NetworkManagementClient(credentials, config.account.id)

    // get the vpn gateway
    const vpnGateway = await networkClient.virtualNetworkGateways.get(model.resourceGroup, model.vpnGatewayName)

    // create the local network gateway
    const localNetworkGatewayName = model.connectionName + "-lgw"
    const localNetworkGateway = await networkClient.localNetworkGateways.createOrUpdate(model.resourceGroup, localNetworkGatewayName, {
        name: localNetworkGatewayName,
        location: model.location,
        gatewayIpAddress: model.gatewayIpAddress,
        localNetworkAddressSpace: {
            addressPrefixes: model.localAddressPrefixes
        }
    })
    console.log(localNetworkGateway)

    // crwate the vpn connection
    const vpnConnection = await networkClient.virtualNetworkGatewayConnections.createOrUpdate(model.resourceGroup, model.connectionName, {
        name: model.connectionName,
        location: model.location,
        connectionType: "IPsec",
        sharedKey: model.ipsecSharedKey,
        virtualNetworkGateway1: vpnGateway,
        localNetworkGateway2: localNetworkGateway,
        routingWeight: 100
    })
    console.log(vpnConnection)
}

export interface IDeployVpnPointToSiteConnectionModel {
    resourceGroup: string,
    location: string,
    vnetName: string,
    vpnGatewayName: string,
    vwanName: string,
    cert: string,
}

export async function DeployVpnPointToSiteConnection(argv: IDeployVpnPointToSiteConnectionModel) {
    const credentials = await MsRestAzure.loginWithServicePrincipalSecret(config.servicePrincipal.appId, config.servicePrincipal.password, config.servicePrincipal.tenant)
    const networkClient = new AzureArmNetwork.NetworkManagementClient(credentials, config.account.id)

    // get the vpn gateway
    const vpnGateway = await networkClient.virtualNetworkGateways.get(argv.resourceGroup, argv.vpnGatewayName)

    const configName = argv.vwanName + "-config"
    const p2sVpnServerConfig = await networkClient.p2sVpnServerConfigurations.createOrUpdate(argv.resourceGroup, argv.vwanName, configName, {
        name: configName,
        vpnProtocols: [
            "IkeV2"
        ],
        p2SVpnServerConfigVpnClientRootCertificates: [
            {
                name: "Cert",
                publicCertData: argv.cert
            }
        ],
    })
}