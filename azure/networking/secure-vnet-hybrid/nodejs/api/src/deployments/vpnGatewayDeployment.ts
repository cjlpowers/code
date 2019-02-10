import * as AzureArmResource from "azure-arm-resource";
import { Deployment, IDeploymentParameters } from "./deployment";
import * as template from "../templates/vpnGateway/azuredeploy.json";

interface IVpnGatewayDeploymentPrameters extends IDeploymentParameters {
    vnet: {
        name: string;
    };
    virtualNetworkGateway: {
        name: string,
    };
}

export class VpnGatewayDeployment extends Deployment {
    constructor(protected parameters: IVpnGatewayDeploymentPrameters) {
        super(parameters);
    }

    protected async getAzureDeployment(): Promise<AzureArmResource.ResourceModels.Deployment> {
        return {
            properties: {
                mode: "Incremental",
                template,
                parameters: {
                    vnetName: {
                        value: this.parameters.vnet.name,
                    },
                    virtualNetworkGatewayName: {
                        value: this.parameters.virtualNetworkGateway.name,
                    },
                },
            },
        };
    }
}
