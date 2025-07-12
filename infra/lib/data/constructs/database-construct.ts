import { InfraEnvConstants } from '@ts-fullstack-todo/shared/infra'
import { type ISecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { Credentials, DatabaseCluster, DatabaseInstance } from 'aws-cdk-lib/aws-rds'
import type { ISecret } from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {
    databaseSecurityGroup: ISecurityGroup
}

export class DatabaseConstruct extends Construct {
    public databaseSecret: ISecret
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage, vpc, databaseSecurityGroup } = props
        const env = InfraEnvConstants[stage]
        const { database } = env
        const { type, engine, removalPolicy, cloudwatchLogsRetention } = database

        if (type === 'rds') {
            const { instanceType, backupRetention } = database
            const instance = new DatabaseInstance(this, makeId('DatabaseInstance', stage), {
                vpc,
                vpcSubnets: vpc.selectSubnets({
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                }),
                securityGroups: [databaseSecurityGroup],
                credentials: Credentials.fromGeneratedSecret('postgres'),
                engine,
                instanceType,
                backupRetention,
                cloudwatchLogsExports: ['postgresql'],
                cloudwatchLogsRetention,
                removalPolicy,
            })
            if (!instance.secret) {
                throw new Error('Database secret not found')
            }
            this.databaseSecret = instance.secret
        } else if (type === 'aurora') {
            const { writer, readers, backup } = database
            const cluster = new DatabaseCluster(this, makeId('DatabaseCluster', stage), {
                vpc,
                vpcSubnets: vpc.selectSubnets({
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                }),
                securityGroups: [databaseSecurityGroup],
                credentials: Credentials.fromGeneratedSecret('postgres'),
                engine,
                writer,
                readers,
                backup,
                cloudwatchLogsExports: ['postgresql'],
                cloudwatchLogsRetention,
                removalPolicy,
            })
            if (!cluster.secret) {
                throw new Error('Database secret not found')
            }
            this.databaseSecret = cluster.secret
        }
    }
}
