import * as yargs from 'yargs'
import { config } from './config'

export const _args = yargs
    .version(config.version)
    .option("sp-app-id", {
        demand: true,
        description: "The Service Principal App ID",
        default: config.servicePrincipal.appId,
        string: true
    })
    .option("sp-password", {
        demand: true,
        description: "The Service Principal Password",
        string: true
    })
    .option("sp-tenant", {
        demand: true,
        description: "The Service Principal Tenant",
        default: config.servicePrincipal.tenant,
        string: true
    })
    .option("account-id", {
        demand: true,
        description: "The Azure Account Id",
        default: config.account.id,
        string: true
    })
    .wrap(yargs.terminalWidth())