import { Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {}

export class SecurityGroupConstruct extends Construct {
    public readonly vpcEndpointSecurityGroup: SecurityGroup
    public readonly databaseSecurityGroup: SecurityGroup
    public readonly redisSecurityGroup: SecurityGroup
    public readonly bastionSecurityGroup: SecurityGroup
    public readonly lambdaSecurityGroup: SecurityGroup
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage, vpc } = props

        const vpcEndpointSecurityGroup = new SecurityGroup(this, makeId('VpcEndpointSecurityGroup', stage), {
            vpc,
            allowAllOutbound: false,
        })

        const databaseSecurityGroup = new SecurityGroup(this, makeId('DatabaseClusterSecurityGroup', stage), {
            vpc,
            allowAllOutbound: false,
        })
        const redisSecurityGroup = new SecurityGroup(this, makeId('RedisSecurityGroup', stage), {
            vpc,
            allowAllOutbound: false,
        })
        const bastionSecurityGroup = new SecurityGroup(this, makeId('BastionSecurityGroup', stage), {
            vpc,
            allowAllOutbound: false,
        })
        const lambdaSecurityGroup = new SecurityGroup(this, makeId('LambdaSecurityGroup', stage), {
            vpc,
            allowAllOutbound: false,
        })

        bastionSecurityGroup.addEgressRule(databaseSecurityGroup, Port.tcp(5432))
        databaseSecurityGroup.addIngressRule(bastionSecurityGroup, Port.tcp(5432))

        lambdaSecurityGroup.addEgressRule(databaseSecurityGroup, Port.tcp(5432))
        databaseSecurityGroup.addIngressRule(lambdaSecurityGroup, Port.tcp(5432))

        bastionSecurityGroup.addEgressRule(redisSecurityGroup, Port.tcp(6379))
        redisSecurityGroup.addIngressRule(bastionSecurityGroup, Port.tcp(6379))

        lambdaSecurityGroup.addEgressRule(redisSecurityGroup, Port.tcp(6379))
        redisSecurityGroup.addIngressRule(lambdaSecurityGroup, Port.tcp(6379))

        lambdaSecurityGroup.addEgressRule(vpcEndpointSecurityGroup, Port.tcp(443))
        vpcEndpointSecurityGroup.addIngressRule(lambdaSecurityGroup, Port.tcp(443))
        bastionSecurityGroup.addEgressRule(vpcEndpointSecurityGroup, Port.tcp(443))

        lambdaSecurityGroup.addEgressRule(Peer.prefixList('pl-61a54008'), Port.tcp(443)) // S3 prefix list

        this.vpcEndpointSecurityGroup = vpcEndpointSecurityGroup
        this.databaseSecurityGroup = databaseSecurityGroup
        this.redisSecurityGroup = redisSecurityGroup
        this.bastionSecurityGroup = bastionSecurityGroup
        this.lambdaSecurityGroup = lambdaSecurityGroup
    }
}
