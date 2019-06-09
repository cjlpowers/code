import { HttpRequest, IHttpContext } from "azure-functions-typedefinitions";
import { ApiModule, azureConnection } from "../lib/common";

export async function run(context: IHttpContext, req: HttpRequest) {
    context.log("JavaScript HTTP trigger function processed a request.");

    const vnetDeployment = new ApiModule.VNetDeployment({
            deploymentName: req.params!.name,
            location: req.params!.location,
            resourceGroupName: req.params!["resource-group"],
        },
        req.body);
    const result = await vnetDeployment.deploy(azureConnection);

    context.res!.status = 200;
    context.res!.body = result;
}
