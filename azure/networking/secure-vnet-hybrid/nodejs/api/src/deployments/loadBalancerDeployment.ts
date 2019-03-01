import * as template from "../templates/loadBalancer.json";
import { TemplateDeployment, TemplateParameters } from "./templateDeployment";
import { IDeploymentParameters } from "./deployment";

export class LoadBalancerDeployment extends TemplateDeployment<typeof template> {
    constructor(deploymentParameters: IDeploymentParameters, templateParameters: TemplateParameters<typeof template>) {
        super(deploymentParameters, template, templateParameters);
    }
}
