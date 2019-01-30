import * as AzureArmResource from "azure-arm-resource";
import { AzureConnection } from "../azureConnection";

export interface IDeploymentParameters {
    deploymentName: string;
    location: string;
    resourceGroupName: string;
}

export abstract class Deployment {
    public abstract async deploy(connection: AzureConnection): Promise<AzureArmResource.ResourceModels.DeploymentExtended>;
    protected abstract async cancel(connection: AzureConnection): Promise<void>;
    protected abstract async delete(connection: AzureConnection): Promise<void>;
}
