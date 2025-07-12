import { type IHostedZone, PublicHostedZone, ZoneDelegationRecord } from 'aws-cdk-lib/aws-route53'

import { InfraEnvConstants, rootDomain } from '@ts-fullstack-todo/shared/infra'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {}

export class Route53Construct extends Construct {
    public readonly webHostedZone: IHostedZone
    public readonly apiHostedZone: IHostedZone
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage } = props

        const env = InfraEnvConstants[stage]

        const rootHostedZone = PublicHostedZone.fromLookup(this, makeId('RootHostedZone', stage), {
            domainName: rootDomain,
        })

        if (!rootHostedZone) {
            throw new Error(`RootHostedZone not found: ${stage}`)
        }

        /** web */
        if (env.webDomain !== rootDomain) {
            this.webHostedZone = new PublicHostedZone(this, makeId('WebHostedZone', stage), {
                zoneName: env.webDomain,
            })
        } else {
            this.webHostedZone = rootHostedZone
        }

        /** api */
        this.apiHostedZone = new PublicHostedZone(this, makeId('ApiHostedZone', stage), {
            zoneName: env.apiDomain,
        })

        this.createDelegationRecord(rootHostedZone, this.webHostedZone, makeId('WebDelegation', stage))
        this.createDelegationRecord(rootHostedZone, this.apiHostedZone, makeId('ApiDelegation', stage))
    }

    private createDelegationRecord(parent: IHostedZone, child: IHostedZone, id: string): ZoneDelegationRecord {
        if (!child.hostedZoneNameServers) {
            throw new Error(`NS records not found ${child.zoneName}`)
        }
        return new ZoneDelegationRecord(this, id, {
            zone: parent,
            recordName: child.zoneName,
            nameServers: child.hostedZoneNameServers,
        })
    }
}
