// tslint:disable:no-shadowed-variable
// tslint:disable:max-line-length
import yargs = require("yargs");
import * as ApiModule from "../../api/src/index";
import { config } from "./config";
import * as fs from "fs";
import { ITemplate } from "../../api/src/deployments/templateDeployment";

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
                .option("deployment-name", {
                    description: "The deployment name",
                    demand: true,
                    string: true,
                })
                .command("template", "Deploys a virtual network",
                    (yargs) => {
                        return yargs
                            .option("template", {
                                description: "The template file or Uri",
                                demand: true,
                                string: true,
                            })
                            .option("parameters", {
                                description: "The template parameters",
                                demand: true,
                                string: true,
                            });
                    },
                    async (argv) => {
                        const template = JSON.parse(fs.readFileSync(argv.template, "utf8")) as ITemplate;
                        const parameters = JSON.parse(fs.readFileSync(argv.parameters, "utf8"));

                        const deployment = new ApiModule.TemplateDeployment({
                            deploymentName: argv["deployment-name"],
                            resourceGroupName: argv["resource-group"],
                            location: argv.location,
                        },
                        template,
                        parameters);

                        // validate the template and parameters
                        const validationResult = await deployment.validate(azureConnection);
                        if (validationResult.error) {
                            throw validationResult.error;
                            return -1;
                        }

                        // deploy the template
                        await deployment.deploy(azureConnection);
                    })
                .command("dmz-vnet", "Deploys a DMZ Virtual Network containing a Firewall NVA",
                    (yargs) => {
                        return yargs
                            .option("vnet-name", {
                                description: "The Virtual Network name",
                                default: "vnet",
                                demand: true,
                                string: true,
                            })
                            .option("vnet-address-prefix", {
                                description: "The Azure location",
                                default: "10.0.0.0/16",
                                demand: true,
                            })
                            .option("nva-username", {
                                description: "The NVA admin username",
                                demand: true,
                                string: true,
                            })
                            .option("nva-password", {
                                description: "The NVA admin password",
                                demand: true,
                                string: true,
                            });
                    },
                    async (argv) => {
                        const deployment = new ApiModule.DmzVNetDeployment({
                            deploymentName: argv["deployment-name"],
                            resourceGroupName: argv["resource-group"],
                            location: argv.location,
                        },
                        {
                            vnetName: argv["vnet-name"],
                            vnetAddressPrefix: argv["vnet-address-prefix"],
                            nvaAdminUsername: argv["nva-username"],
                            nvaAdminPassword: argv["nva-password"],
                        });
                        await deployment.deploy(azureConnection);
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
                            deploymentName: argv["deployment-name"],
                            resourceGroupName: argv["resource-group"],
                            location: argv.location,
                        },
                        {
                            vnetName: argv.name,
                            vnetAddressPrefixes: argv["address-prefixes"].split(","),
                        });
                        await deployment.deploy(azureConnection);
                    })
                .command("nva-firewall", "Deploys a Linux Firewall NVA",
                    (yargs) => {
                        return yargs
                            .option("name", {
                                description: "The NVA firewall name",
                                default: "nva-firewall",
                                demand: true,
                                string: true,
                            })
                            .option("vnet-name", {
                                description: "The virtual network name",
                                default: "vnet",
                                demand: true,
                                string: true,
                            })
                            .option("admin-username", {
                                description: "The admin username",
                                demand: true,
                                string: true,
                            })
                            .option("admin-password", {
                                description: "The admin password",
                                demand: true,
                                string: true,
                            });
                    },
                    async (argv) => {
                        const deployment = new ApiModule.TemplateDeployment({
                            deploymentName: argv["deployment-name"],
                            resourceGroupName: argv["resource-group"],
                            location: argv.location,
                        },
                        ApiModule.NvaLinuxFirewall,
                        {
                            virtualNetworkName: argv["vnet-name"],
                            virtualMachineName: argv.name,
                            adminUsername: argv["admin-username"],
                            adminPassword: argv["admin-password"],
                        });
                        await deployment.deploy(azureConnection);
                    })
                .command("vm", "Deploys a Virtual Machine",
                    (yargs) => {
                        return yargs
                            .option("name", {
                                description: "The virtual machine name",
                                demand: true,
                                string: true,
                            })
                            .option("vnet-name", {
                                description: "The virtual network name",
                                default: "vnet",
                                demand: true,
                                string: true,
                            })
                            .option("subnet-name", {
                                description: "The subnet name",
                                default: "snet-mgmt",
                                demand: true,
                                string: true,
                            })
                            .option("admin-username", {
                                description: "The admin username",
                                demand: true,
                                string: true,
                            })
                            .option("admin-password", {
                                description: "The admin password",
                                demand: true,
                                string: true,
                            });
                    },
                    async (argv) => {
                        const deployment = new ApiModule.TemplateDeployment({
                            deploymentName: argv["deployment-name"],
                            resourceGroupName: argv["resource-group"],
                            location: argv.location,
                        },
                        ApiModule.VmLinuxTemplate,
                        {
                            virtualNetworkName: argv["vnet-name"],
                            subnetName: argv["subnet-name"],
                            virtualMachineName: argv.name,
                            adminUsername: argv["admin-username"],
                            adminPassword: argv["admin-password"],
                        });
                        await deployment.deploy(azureConnection);
                    })
                .command("load-balancer", "Deploys a load balancer",
                    (yargs) => {
                        return yargs
                            .option("name", {
                                description: "The load balancer name",
                                demand: true,
                                string: true,
                            });
                    },
                    async (argv) => {
                        const deployment = new ApiModule.LoadBalancerDeployment({
                            deploymentName: argv["deployment-name"],
                            resourceGroupName: argv["resource-group"],
                            location: argv.location,
                        },
                        {
                            name: argv.name,
                        });
                        await deployment.deploy(azureConnection);
                    })
                .command("vpn-gateway", "Deploys a VPN Gateway",
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
                            deploymentName: argv["deployment-name"],
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
