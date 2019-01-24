import { IHttpContext, HttpRequest } from "azure-functions-typedefinitions";

export async function run(context: IHttpContext, req: HttpRequest) {
    context.log('JavaScript HTTP trigger function processed a request.');

    context.res.status = 200;
    context.res.body = "Hello "+ Date.now();
};