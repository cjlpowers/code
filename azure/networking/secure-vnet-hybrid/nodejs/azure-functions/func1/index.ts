import { HttpRequest, IHttpContext } from "azure-functions-typedefinitions";
import { api } from "../lib/common";

export async function run(context: IHttpContext, req: HttpRequest) {
    context.log("JavaScript HTTP trigger function processed a request.");

    const vnet = await api.deployVnet(req.body);

    context.res!.status = 200;
    context.res!.body = vnet;
}
