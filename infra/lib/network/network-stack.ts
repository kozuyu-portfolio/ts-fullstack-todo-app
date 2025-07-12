import { Stack } from 'aws-cdk-lib'
import { type ISecurityGroup, type IVpc, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import type { IHostedZone } from 'aws-cdk-lib/aws-route53'
import type { Construct } from 'constructs'
import { makeId } from '../../infra-util.js'
import type { BaseProps } from '../base-props.js'
import { BastionConstruct } from './constructs/bastion-construct.js'
import { Route53Construct } from './constructs/route53-construct.js'
import { SecurityGroupConstruct } from './constructs/security-group-construct.js'
import { VpcEndpointConstruct } from './constructs/vpc-endpoint-construct.js'

export interface NetworkStackProps extends Omit<BaseProps, 'vpc'> {}

export class NetworkStack extends Stack {
    public readonly vpc: IVpc
    public readonly databaseSecurityGroup: ISecurityGroup
    public readonly redisSecurityGroup: ISecurityGroup
    public readonly lambdaSecurityGroup: ISecurityGroup
    public readonly apiHostedZone: IHostedZone
    public readonly webHostedZone: IHostedZone

    constructor(scope: Construct, id: string, props: NetworkStackProps) {
        super(scope, id, props)
        const { stage } = props

        const vpc = new Vpc(this, makeId('Vpc', stage), {
            maxAzs: 2,
            subnetConfiguration: [
                {
                    name: 'private',
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                },
            ],
        })

        const {
            vpcEndpointSecurityGroup,
            databaseSecurityGroup,
            redisSecurityGroup,
            bastionSecurityGroup,
            lambdaSecurityGroup,
        } = new SecurityGroupConstruct(this, makeId('SecurityGroupConstruct', stage), {
            stage,
            vpc,
        })

        new BastionConstruct(this, makeId('BastionConstruct', stage), {
            stage,
            vpc,
            bastionSecurityGroup,
        })

        new VpcEndpointConstruct(this, makeId('VpcEndpointConstruct', stage), {
            stage,
            vpc,
            vpcEndpointSecurityGroup,
        })

        const { webHostedZone, apiHostedZone } = new Route53Construct(this, makeId('Route53Construct', stage), {
            stage,
            vpc,
        })

        this.vpc = vpc
        this.databaseSecurityGroup = databaseSecurityGroup
        this.redisSecurityGroup = redisSecurityGroup
        this.lambdaSecurityGroup = lambdaSecurityGroup
        this.apiHostedZone = apiHostedZone
        this.webHostedZone = webHostedZone
    }
}
