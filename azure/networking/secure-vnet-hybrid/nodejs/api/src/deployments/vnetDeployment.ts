import { Api } from "../api";
import { IDeploymentParameters } from "./deployment";
import { TemplateBasedDeployment } from "./templateBasedDeployment";
import * as vnetTemplate from "../templates/vnet.json";

interface IVNetDeploymentPrameters extends IDeploymentParameters {
    vnet: {
        name: string;
        addressPrefixes: string[];
    };
}

export class VNetDeployment extends TemplateBasedDeployment<IVNetDeploymentPrameters> {
    constructor(parameters: IVNetDeploymentPrameters) {
        super(parameters);
    }

    protected async getAzureTemplate(): Promise<any> {
        return vnetTemplate;
    }

    protected async getAzureTemplateParameters(): Promise<any> {
        return {
            vnetName: {
                value: this.parameters.vnet.name,
            },
            vnetAddressPrefixes: {
                value: this.parameters.vnet.addressPrefixes,
            },
        };
    }
}
