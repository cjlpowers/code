import { Clients } from './clients'

interface IDeployVnetModel {
    resourceGroupName: string,
    location: string,
    vnetName: string,
    vnetAddressPrefixes: string[],
}

export async function DeployVnet(model: IDeployVnetModel) {
    const resourceClient = await Clients.GetResourceClient()
    const networkClient = await Clients.GetNetworkClient()

    // create or update the resource group
    const rg = await resourceClient.resourceGroups.createOrUpdate(model.resourceGroupName, {
        location: model.location,
        name: model.resourceGroupName
    })
    console.log(rg)

    // create or update the virtual network
    const vnet = await networkClient.virtualNetworks.createOrUpdate(model.resourceGroupName, model.vnetName, {
        name: model.vnetName,
        location: rg.location,
        addressSpace: {
            addressPrefixes: model.vnetAddressPrefixes
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

interface IDeployVpnModel {
    resourceGroupName: string,
    location: string,
    vnetName: string,
    vpnGatewayName: string,
}

export async function DeployVpn(model: IDeployVpnModel) {
    const networkClient = await Clients.GetNetworkClient()

    // get the gateway subnet
    const vnet = await networkClient.virtualNetworks.get(model.resourceGroupName, model.vnetName)
    const subnetGateway = vnet.subnets!.filter(x => x.name === "GatewaySubnet")[0]

    // create a public IP for the VPN gateway
    const vpnGatewayPublicIPName = model.vpnGatewayName + "-ip"
    const vpnGatewayPublicIP = await networkClient.publicIPAddresses.createOrUpdate(model.resourceGroupName, vpnGatewayPublicIPName, {
        name: vpnGatewayPublicIPName,
        location: model.location,
        publicIPAllocationMethod: "Dynamic"
    })
    console.log(vpnGatewayPublicIP)

    // create or update the VPN gateway
    const vpnGateway = await networkClient.virtualNetworkGateways.createOrUpdate(model.resourceGroupName, model.vpnGatewayName, {
        name: model.vpnGatewayName,
        location: model.location,
        gatewayType: "Vpn",
        vpnType: "RouteBased",
        sku: {
            name: "VpnGw1",
            tier: "VpnGw1",
            capacity: 0
        },
        enableBgp: false,
        ipConfigurations: [
            {
                name: model.vpnGatewayName + "-ipconfig",
                publicIPAddress: {
                    id: vpnGatewayPublicIP.id
                },
                subnet: {
                    id: subnetGateway.id
                },
            }
        ],
    })
    console.log(vpnGateway)
}

interface IDeployVpnSiteToSiteConnectionModel {
    resourceGroupName: string,
    location: string,
    vpnGatewayName: string,
    connectionName: string,
    ipsecSharedKey: string,
    gatewayIpAddress: string,
    localAddressPrefixes: string[],
}

export async function DeployVpnSiteToSiteConnection(model: IDeployVpnSiteToSiteConnectionModel) {
    const networkClient = await Clients.GetNetworkClient()

    // get the vpn gateway
    const vpnGateway = await networkClient.virtualNetworkGateways.get(model.resourceGroupName, model.vpnGatewayName)

    // create the local network gateway
    const localNetworkGatewayName = model.connectionName + "-lgw"
    const localNetworkGateway = await networkClient.localNetworkGateways.createOrUpdate(model.resourceGroupName, localNetworkGatewayName, {
        name: localNetworkGatewayName,
        location: model.location,
        gatewayIpAddress: model.gatewayIpAddress,
        localNetworkAddressSpace: {
            addressPrefixes: model.localAddressPrefixes
        }
    })
    console.log(localNetworkGateway)

    // crwate the vpn connection
    const vpnConnection = await networkClient.virtualNetworkGatewayConnections.createOrUpdate(model.resourceGroupName, model.connectionName, {
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

interface IDeployVpnPointToSiteConnectionModel {
    resourceGroupName: string,
    location: string,
    vpnGatewayName: string,
    /**
     * The base 64 encoded public certificate data
     * 
     * See: 
     * https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-certificates-point-to-site-linux
     * 
     * https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-certificates-point-to-site
     */
    cert: string,
}

export async function DeployVpnPointToSiteConnection(model: IDeployVpnPointToSiteConnectionModel) {
    const networkClient = await Clients.GetNetworkClient()

    // get the vpn gateway
    let vpnGateway = await networkClient.virtualNetworkGateways.get(model.resourceGroupName, model.vpnGatewayName)
    vpnGateway.vpnClientConfiguration = {
        vpnClientProtocols: [
            "SSTP",
            "IkeV2"
        ],
        vpnClientAddressPool: {
            addressPrefixes: [
                "172.16.201.0/24"
            ]
        },
        vpnClientRootCertificates: [
            {
                name: "P2SRootCert",
                publicCertData: model.cert
            }
        ]
    }
    vpnGateway = await networkClient.virtualNetworkGateways.createOrUpdate(model.resourceGroupName, model.vpnGatewayName, vpnGateway)
    console.log(vpnGateway)
}