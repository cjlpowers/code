import * as ApiModule from "hybrid-network-api";
import { config } from "./config";

export { ApiModule };
export const azureConnection = new ApiModule.AzureConnection(config);
