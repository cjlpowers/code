import * as AzureArmResource from "azure-arm-resource";
import { Deployment, IDeploymentParameters } from "./deployment";

export interface ITemplate {
    parameters: {
        [key: string]: {
            defaultValue?: unknown;
            type: string;
        };
    };
}

interface ITemplateParameter {
    type: string;
}

interface ITemplateParameterWithoutDefault extends ITemplateParameter {
    defaultValue: undefined;
}

interface ITemplateParameterWithDefault extends ITemplateParameter {
    defaultValue: any;
}

type ParameterNames<T extends ITemplate> = {
    [K in keyof T["parameters"]]: K
}[keyof T["parameters"]];

type ParameterNamesWithoutDefaults<T extends ITemplate> = {
    [K in keyof T["parameters"]]: ITemplateParameterWithoutDefault extends T["parameters"][K]? K : never
}[keyof T["parameters"]];

export type TemplateParameters<T extends ITemplate> = {
    [P in ParameterNamesWithoutDefaults<T>]: string | number | boolean | string[]
} & {
    [P in ParameterNames<T>]?: string | number | boolean | string[]
};

export class TemplateDeployment<T extends ITemplate> extends Deployment {
    constructor(deploymentParameters: IDeploymentParameters, protected template: T, protected templateParameters: TemplateParameters<T>) {
        super(deploymentParameters);
    }

    protected async getAzureTemplate(): Promise<any> {
        return this.template;
    }

    protected async getAzureTemplateParameters(): Promise<any> {
        const result: any = {};
        Object.keys(this.templateParameters).forEach((key) => result[key] = { value: (this.templateParameters as any).key });
        return result;
    }

    protected async getAzureDeployment(): Promise<AzureArmResource.ResourceModels.Deployment> {
        return {
            properties: {
                mode: "Incremental",
                template: await this.getAzureTemplate(),
                parameters: await this.getAzureTemplateParameters(),
            },
        };
    }
}
