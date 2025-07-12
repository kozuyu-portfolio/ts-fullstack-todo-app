import { InfraEnvConstants } from '@ts-fullstack-todo/shared/infra'
import { type ISecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { CfnReplicationGroup, CfnSubnetGroup } from 'aws-cdk-lib/aws-elasticache'
import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {
    redisSecurityGroup: ISecurityGroup
}

export class RedisConstruct extends Construct {
    public readonly redisAuthSecret: Secret
    public readonly redisReplicationGroup: CfnReplicationGroup
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage, vpc, redisSecurityGroup } = props
        const env = InfraEnvConstants[stage]
        const {
            redis: { removalPolicy },
        } = env

        const redisAuthSecret = new Secret(this, makeId('RedisAuthSecret', stage), {
            generateSecretString: {
                excludePunctuation: true,
                passwordLength: 16,
            },
            description: 'Redis AUTH token',
            secretName: `redis-auth-token-${stage}`,
        })
        redisAuthSecret.applyRemovalPolicy(removalPolicy)

        const redisSubnetGroup = new CfnSubnetGroup(this, makeId('RedisSubnetGroup', stage), {
            cacheSubnetGroupName: `redis-subnet-group-${stage}`,
            description: 'Subnet group for Redis',
            subnetIds: vpc.selectSubnets({ subnetType: SubnetType.PRIVATE_ISOLATED }).subnetIds,
        })
        redisSubnetGroup.applyRemovalPolicy(removalPolicy)

        const replicationGroup = new CfnReplicationGroup(this, makeId('RedisReplicationGroup', stage), {
            replicationGroupDescription: `Redis replication group for ${stage}`,
            engine: 'redis',
            cacheNodeType: 'cache.t3.micro',
            numNodeGroups: 1,
            replicasPerNodeGroup: 2,
            authToken: redisAuthSecret.secretValue.unsafeUnwrap(),
            cacheSubnetGroupName: redisSubnetGroup.cacheSubnetGroupName,
            securityGroupIds: [redisSecurityGroup.securityGroupId],
            transitEncryptionEnabled: true,
        })
        replicationGroup.applyRemovalPolicy(removalPolicy)
        replicationGroup.node.addDependency(redisAuthSecret)
        replicationGroup.node.addDependency(redisSubnetGroup)

        this.redisAuthSecret = redisAuthSecret
        this.redisReplicationGroup = replicationGroup

        console.log(replicationGroup.attrPrimaryEndPointAddress)
        console.log(replicationGroup.attrPrimaryEndPointPort)
    }
}
