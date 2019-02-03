// tslint:disable:no-shadowed-variable
// tslint:disable:max-line-length
import yargs = require("yargs");
import * as ApiModule from "../../api/src/index";
import { config } from "./config";

const azureConnection = new ApiModule.AzureConnection(config);
const api = new ApiModule.Api(azureConnection);

const argv = yargs
    .version("1.0.0")
    .wrap(yargs.terminalWidth())
    .command("deploy", "Creates or updates infrastructure",
        (yargs) => {
            return yargs
                .option("resource-group", {
                    description: "The Azure resource group name",
                    demand: true,
                    string: true,
                })
                .option("location", {
                    description: "The Azure location",
                    default: "South Central US",
                    demand: true,
                })
                .command("vnet", "Deploys a virtual network",
                    (yargs) => {
                        return yargs
                            .option("name", {
                                description: "The Virtual Network name",
                                default: "vnet",
                                demand: true,
                                string: true,
                            })
                            .option("address-prefixes", {
                                description: "The Azure location",
                                default: "10.0.0.0/16",
                                demand: true,
                            });
                    },
                    async (argv) => {
                        const deployment = new ApiModule.VNetDeployment({
                            deploymentName: argv.name,
                            resourceGroupName: argv["resource-group"],
                            location: argv.location,
                        },
                        {
                            vnetName: argv.name,
                            vnetAddressPrefixes: argv["address-prefixes"].split(","),
                        });
                        await deployment.deploy(azureConnection);
                    })
                .command("vpn", "Deploys a virtual network",
                    (yargs) => {
                        return yargs
                            .option("vpn-gateway-name", {
                                description: "The VPN gateway name",
                                default: "vpn-vgw",
                                demand: true,
                                string: true,
                            })
                            .command("s2s", "Deploys a Site-to-Site connection",
                                (yargs) => {
                                    return yargs
                                        .option("connection-name", {
                                            description: "The connection name",
                                            demand: true,
                                            string: true,
                                        })
                                        .option("ipsec-shared-key", {
                                            description: "The IPSec shared key",
                                            demand: true,
                                            string: true,
                                        })
                                        .option("gateway-ip-address", {
                                            description: "IP address of local network gateway",
                                            demand: true,
                                            string: true,
                                        })
                                        .option("local-address-prefixes", {
                                            description: "Comma separated list of address blocks reserved for this virtual network in CIDR notation",
                                            default: "192.168.0.0/16",
                                            demand: true,
                                            string: true,
                                        });
                                },
                                async (argv) => api.deployVpnSiteToSiteConnection({
                                    resourceGroupName: argv["resource-group"],
                                    location: argv.location,
                                    vpnGatewayName: argv["vpn-gateway-name"],
                                    connectionName: argv["connection-name"],
                                    ipsecSharedKey: argv["ipsec-shared-key"],
                                    gatewayIpAddress: argv["gateway-ip-address"],
                                    localAddressPrefixes: argv["local-address-prefixes"].split(","),
                                }))
                            .command("p2s", "Deploys a Point-to-Site connection",
                                (yargs) => {
                                    return yargs
                                        .option("cert", {
                                            description: "The public certificate data in base64 format from the root certificate",
                                            demand: true,
                                            string: true,
                                        });
                                },
                                async (argv) => api.deployVpnPointToSiteConnection({
                                    resourceGroupName: argv["resource-group"],
                                    location: argv.location,
                                    vpnGatewayName: argv["vpn-gateway-name"],
                                    cert: argv.cert,
                                }))
                            .option("vnet-name", {
                                description: "The virtual network name",
                                default: "vnet",
                                demand: true,
                                string: true,
                            })
                            .help();
                    },
                    async (argv) => api.deployVpn({
                        resourceGroupName: argv["resource-group"],
                        location: argv.location,
                        vnetName: argv["vnet-name"],
                        vpnGatewayName: argv["vpn-gateway-name"],
                    }))
                .command("vpn-template", "Deploys a virtual network",
                    (yargs) => {
                        return yargs
                            .option("vpn-gateway-name", {
                                description: "The VPN gateway name",
                                default: "vpn-vgw",
                                demand: true,
                                string: true,
                            })
                            .option("vnet-name", {
                                description: "The virtual network name",
                                default: "vnet",
                                demand: true,
                                string: true,
                            })
                            .help();
                    },
                    async (argv) => {
                        const deployment = new ApiModule.VpnGatewayDeployment({
                            deploymentName: argv["vpn-gateway-name"],
                            resourceGroupName: argv["resource-group"],
                            location: argv.location,
                            vnet: {
                                name: argv["vnet-name"],
                            },
                            virtualNetworkGateway: {
                                name: argv["vpn-gateway-name"],
                            },
                        });
                        await deployment.deploy(azureConnection);
                    })
                .demandCommand()
                .help();
        })
    .command("remove", "Removes infrastructure",
        (yargs) => {
            return yargs
                .command("resource-group <resource-group-name>", "Removes a resource group",
                    (yargs) => {
                        return yargs
                            .positional("resource-group-name", {
                                type: "string",
                                description: "The Azure resource group name",
                                demand: true,
                            });
                    },
                    async (argv) => api.removeResourceGroup({
                        resourceGroupName: argv["resource-group-name"]!,
                    }))
                .demandCommand()
                .help();
        })
    .command("export", "Exports infrastructure",
        (yargs) => {
            return yargs
                .command("resource-group <resource-group-name>", "Exports a resource group as a template",
                    (yargs) => {
                        return yargs
                            .positional("resource-group-name", {
                                type: "string",
                                description: "The Azure resource group name",
                                demand: true,
                            });
                    },
                    async (argv) => {
                        const result = await api.exportResourceGroup(argv["resource-group-name"]!);
                        console.log(JSON.stringify(result, null, 2));
                    })
                .demandCommand()
                .help();
        })
    .demandCommand()
    .help()
    .argv;
