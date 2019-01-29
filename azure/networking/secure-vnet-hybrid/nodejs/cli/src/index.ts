// tslint:disable:no-shadowed-variable
// tslint:disable:max-line-length
import yargs = require("yargs");
import Api from "../../api/src/index";
import { config } from "./config";

const api = new Api(config);

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
                    async (argv) => api.deployVnet({
                        resourceGroupName: argv["resource-group"],
                        location: argv.location,
                        vnetName: argv.name,
                        vnetAddressPrefixes: argv["address-prefixes"].split(","),
                    }))
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
                                default: "vpn-vgw",
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
    .demandCommand()
    .help()
    .argv;
