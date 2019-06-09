import * as template from "../templates/dmzVnet/azuredeploy.json";
import { TemplateDeployment, TemplateParameters } from "./templateDeployment";
import { IDeploymentParameters } from "./deployment";

export class DmzVNetDeployment extends TemplateDeployment<typeof template> {
    constructor(deploymentParameters: IDeploymentParameters, templateParameters: TemplateParameters<typeof template>) {
        super(deploymentParameters, template, templateParameters);
    }
}
