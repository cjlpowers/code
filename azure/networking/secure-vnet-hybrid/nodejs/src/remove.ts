import { Clients } from './clients'

export interface IRemoveResourceGroup {
    resourceGroupName: string,
}

export async function RemoveResourceGroup(model: IRemoveResourceGroup) {
    const resourceClient = await Clients.GetResourceClient()
    await resourceClient.resourceGroups.deleteMethod(model.resourceGroupName)
}