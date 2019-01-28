import * as MsRestAzure from 'ms-rest-azure';
import * as AzureArmResource from 'azure-arm-resource';
import { Clients } from './clients'

export interface IRemoveResourceGroup {
    resourceGroup: string,
}

export async function RemoveResourceGroup(model: IRemoveResourceGroup) {
    const resourceClient = await Clients.GetResourceClient()
    await resourceClient.resourceGroups.deleteMethod(model.resourceGroup)
}