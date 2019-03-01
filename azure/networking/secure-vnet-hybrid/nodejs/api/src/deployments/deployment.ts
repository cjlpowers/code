import * as AzureArmResource from "azure-arm-resource";
import { AzureConnection } from "../azureConnection";

export interface IDeploymentParameters {
    deploymentName: string;
    location: string;
    resourceGroupName: string;
}

export abstract class Deployment {
    constructor(protected parameters: IDeploymentParameters) {
    }

    public async deploy(connection: AzureConnection): Promise<AzureArmResource.ResourceModels.DeploymentExtended> {
        const resourceClient = await connection.getResourceClient();

        // get the deployment
        const azureDeployment = await this.getAzureDeployment();

        // make sure the resource group exists
        if (await resourceClient.resourceGroups.checkExistence(this.parameters.resourceGroupName) === false) {
            await resourceClient.resourceGroups.createOrUpdate(this.parameters.resourceGroupName, {
                name: this.parameters.resourceGroupName,
                location: this.parameters.location,
            });
        }

        // validate the deployment
        const validationResult = await resourceClient.deployments.validate(
            this.parameters.resourceGroupName,
            this.parameters.deploymentName,
            azureDeployment);

        if (validationResult.error) {
            throw validationResult.error;
        }

        // create the deployment
        return await resourceClient.deployments.createOrUpdate(
            this.parameters.resourceGroupName,
            this.parameters.deploymentName,
            azureDeployment);
    }

    public async cancel(connection: AzureConnection) {
        const resourceClient = await connection.getResourceClient();
        return resourceClient.deployments.cancel(this.parameters.resourceGroupName, this.parameters.deploymentName);
    }

    public async delete(connection: AzureConnection) {
        const resourceClient = await connection.getResourceClient();
        return resourceClient.deployments.deleteMethod(
            this.parameters.resourceGroupName,
            this.parameters.deploymentName,
        );
    }

    public async validate(connection: AzureConnection) {
        const resourceClient = await connection.getResourceClient();
        return resourceClient.deployments.validate(
            this.parameters.resourceGroupName,
            this.parameters.deploymentName,
            await this.getAzureDeployment());
    }

    protected abstract async getAzureDeployment(): Promise<AzureArmResource.ResourceModels.Deployment>;
}
