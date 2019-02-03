import * as template from "../templates/vnet.json";
import { TemplateDeployment, TemplateParameters } from "./templateDeployment";
import { IDeploymentParameters } from "./deployment";

export class VNetDeployment extends TemplateDeployment<typeof template> {
    constructor(deploymentParameters: IDeploymentParameters, templateParameters: TemplateParameters<typeof template>) {
        super(deploymentParameters, template, templateParameters);
    }
}
