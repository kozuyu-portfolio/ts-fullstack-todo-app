import { InfraEnvConstants } from '@ts-fullstack-todo/shared/infra'
import { Duration } from 'aws-cdk-lib'
import { type ISecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { Platform } from 'aws-cdk-lib/aws-ecr-assets'
import type { CfnReplicationGroup } from 'aws-cdk-lib/aws-elasticache'
import { Architecture, DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda'
import type { IBucket } from 'aws-cdk-lib/aws-s3'
import { type ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {
    lambdaSecurityGroup: ISecurityGroup
    databaseSecret: ISecret
    redisReplicationGroup: CfnReplicationGroup
    redisAuthSecret: ISecret
    attachmentBucket: IBucket
}

export class NestjsLambdaConstruct extends Construct {
    public readonly nestjsLambda: DockerImageFunction
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const {
            stage,
            vpc,
            lambdaSecurityGroup,
            databaseSecret,
            redisReplicationGroup,
            redisAuthSecret,
            attachmentBucket,
        } = props
        const {
            apiBaseURL,
            eventBridge: { reminderEvent },
        } = InfraEnvConstants[stage]

        const accessTokenSecret = new Secret(this, makeId('AccessTokenSecret', stage), {
            secretName: 'ACCESS_TOKEN_SECRET',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({}),
                generateStringKey: 'secret',
                excludePunctuation: true,
                includeSpace: false,
            },
        })
        const refreshTokenSecret = new Secret(this, makeId('RefreshTokenSecret', stage), {
            secretName: 'REFRESH_TOKEN_SECRET',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({}),
                generateStringKey: 'secret',
                excludePunctuation: true,
                includeSpace: false,
            },
        })

        this.nestjsLambda = new DockerImageFunction(this, makeId('NestLambda', stage), {
            functionName: `nest-function-${stage}`,
            vpc,
            vpcSubnets: vpc.selectSubnets({ subnetType: SubnetType.PRIVATE_ISOLATED }),
            securityGroups: [lambdaSecurityGroup],
            memorySize: 1769,
            timeout: Duration.minutes(3),
            code: DockerImageCode.fromImageAsset('../', {
                file: 'apps/api/Dockerfile',
                platform: Platform.LINUX_ARM64,
            }),
            architecture: Architecture.ARM_64,
            environment: {
                NODE_ENV: 'production',
                STAGE: stage,
                ATTACHMENT_BUCKET: attachmentBucket.bucketName,

                REMINDER_DEADLINE_THRESHOLD_MS: reminderEvent.deadlineThresholdMs.toString(),
                REMINDER_MAIL_FROM: reminderEvent.senderEmail,

                API_BASEURL: apiBaseURL,
                REDIS_ENDPOINT_ADDRESS: redisReplicationGroup.attrPrimaryEndPointAddress,
                REDIS_ENDPOINT_PORT: redisReplicationGroup.attrPrimaryEndPointPort,

                DATABASE_SECRET_ARN: databaseSecret.secretArn,
                REDIS_AUTH_SECRET_ARN: redisAuthSecret.secretArn,
                ACCESS_TOKEN_SECRET_ARN: accessTokenSecret.secretArn,
                REFRESH_TOKEN_SECRET_ARN: refreshTokenSecret.secretArn,
            },
        })

        attachmentBucket.grantReadWrite(this.nestjsLambda)
        databaseSecret.grantRead(this.nestjsLambda)
        redisAuthSecret.grantRead(this.nestjsLambda)
        refreshTokenSecret.grantRead(this.nestjsLambda)
        accessTokenSecret.grantRead(this.nestjsLambda)
    }
}
