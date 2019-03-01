import * as template from "../templates/customerVnet/azuredeploy.json";
import { TemplateDeployment, TemplateParameters } from "./templateDeployment";
import { IDeploymentParameters } from "./deployment";

export class CustomerVNetDeployment extends TemplateDeployment<typeof template> {
    constructor(deploymentParameters: IDeploymentParameters, templateParameters: TemplateParameters<typeof template>) {
        super(deploymentParameters, template, templateParameters);
    }
}
