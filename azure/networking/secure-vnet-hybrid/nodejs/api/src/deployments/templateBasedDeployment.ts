import * as AzureArmResource from "azure-arm-resource";
import { AzureConnection } from "../azureConnection";
import { Deployment, IDeploymentParameters } from "./deployment";

export abstract class TemplateBasedDeployment<T extends IDeploymentParameters> extends Deployment {
    constructor(public parameters: T) {
        super();
    }

    public async deploy(connection: AzureConnection) {
        const resourceClient = await connection.getResourceClient();

        // make sure the resource group exists
        if (await resourceClient.resourceGroups.checkExistence(this.parameters.resourceGroupName) === false) {
            await resourceClient.resourceGroups.createOrUpdate(this.parameters.resourceGroupName, {
                name: this.parameters.resourceGroupName,
                location: this.parameters.location,
            });
        }

        return await resourceClient.deployments.createOrUpdate(
            this.parameters.resourceGroupName,
            this.parameters.deploymentName,
            await this.getAzureDeployment());
    }

    protected async cancel(connection: AzureConnection) {
        const resourceClient = await connection.getResourceClient();
        return resourceClient.deployments.cancel(this.parameters.resourceGroupName, this.parameters.deploymentName);
    }

    protected async delete(connection: AzureConnection) {
        const resourceClient = await connection.getResourceClient();
        return resourceClient.deployments.deleteMethod(this.parameters.resourceGroupName, this.parameters.deploymentName);
    }

    protected abstract async getAzureTemplate(): Promise<any>;
    protected abstract async getAzureTemplateParameters(): Promise<any>;
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
