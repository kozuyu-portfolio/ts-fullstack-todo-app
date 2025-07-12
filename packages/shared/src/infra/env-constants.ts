import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import {
    AuroraPostgresEngineVersion,
    type BackupProps,
    CaCertificate,
    ClusterInstance,
    DatabaseClusterEngine,
    DatabaseInstanceEngine,
    type IClusterEngine,
    type IClusterInstance,
    type IInstanceEngine,
    PostgresEngineVersion,
} from 'aws-cdk-lib/aws-rds'

import { Duration, type Environment, RemovalPolicy } from 'aws-cdk-lib/core'
import {
    RuntimeEnvConstants,
    type RuntimeEnvConstantsBody,
    type Stage,
    account,
    region,
    rootDomain,
} from '../runtime/index.js'

type RdsInstanceProperties = {
    type: 'rds'
    engine: IInstanceEngine
    instanceType: InstanceType
    backupRetention: Duration
    removalPolicy: RemovalPolicy
    cloudwatchLogsRetention: RetentionDays
}

type AuroraClusterProperties = {
    type: 'aurora'
    engine: IClusterEngine
    writer: IClusterInstance
    readers?: IClusterInstance[]
    backup: BackupProps
    removalPolicy: RemovalPolicy
    cloudwatchLogsRetention: RetentionDays
}

type InfraEnvConstantsBody = RuntimeEnvConstantsBody & {
    env: Environment
    database: RdsInstanceProperties | AuroraClusterProperties
    redis: {
        removalPolicy: RemovalPolicy
    }
    s3: {
        frontendBucketName: string
        frontendBucketCorsAllowedOrigins: string[]
        frontendBucketRemovalPolicy: RemovalPolicy
        attachmentBucketName: string
        attachmentBucketCorsAllowedOrigins: string[]
        attachmentBucketRemovalPolicy: RemovalPolicy
    }
    eventBridge: {
        reminderEvent: {
            senderEmail: string
            deadlineThresholdMs: number
            scheduleExpressions: string[]
        }
    }
}

const env: Environment = {
    account,
    region,
}

export const InfraEnvConstants: Record<Stage, InfraEnvConstantsBody> = {
    dev: {
        ...RuntimeEnvConstants.dev,
        env,
        database: {
            type: 'rds',
            engine: DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_16_8 }),
            instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
            backupRetention: Duration.days(0),
            removalPolicy: RemovalPolicy.DESTROY,
            cloudwatchLogsRetention: RetentionDays.ONE_WEEK,
        },
        redis: {
            removalPolicy: RemovalPolicy.DESTROY,
        },
        s3: {
            frontendBucketName: 'ts-fullstack-todo-frontend-dev',
            frontendBucketCorsAllowedOrigins: [`https://dev.${rootDomain}`, 'http://localhost:5173'],
            frontendBucketRemovalPolicy: RemovalPolicy.DESTROY,
            attachmentBucketName: 'ts-fullstack-todo-attachment-dev',
            attachmentBucketCorsAllowedOrigins: [`https://dev.${rootDomain}`, 'http://localhost:5173'],
            attachmentBucketRemovalPolicy: RemovalPolicy.DESTROY,
        },
        eventBridge: {
            reminderEvent: {
                senderEmail: '<replace with your email address>', // FIXME: Replace with your email address
                deadlineThresholdMs: 24 * 60 * 60 * 1000, // 24 hours
                // JST 9:00（UTC 00:00）、JST 15:00（UTC 06:00）
                scheduleExpressions: ['cron(0 0 * * ? *)', 'cron(0 6 * * ? *)'],
            },
        },
    },
    stg: {
        ...RuntimeEnvConstants.stg,
        env,
        database: {
            type: 'aurora',
            engine: DatabaseClusterEngine.auroraPostgres({ version: AuroraPostgresEngineVersion.VER_16_8 }),
            writer: ClusterInstance.provisioned('primary', {
                instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MEDIUM),
                instanceIdentifier: 'ts-fullstack-todo-db-stg-primary',
                caCertificate: CaCertificate.RDS_CA_RSA4096_G1,
            }),
            readers: [
                ClusterInstance.provisioned('secondary', {
                    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MEDIUM),
                    instanceIdentifier: 'ts-fullstack-todo-db-stg-secondary',
                    caCertificate: CaCertificate.RDS_CA_RSA4096_G1,
                }),
            ],
            backup: {
                retention: Duration.days(7),
                preferredWindow: '17:00-19:00', // JST 02:00-04:00
            },
            removalPolicy: RemovalPolicy.RETAIN,
            cloudwatchLogsRetention: RetentionDays.ONE_MONTH,
        },
        redis: {
            removalPolicy: RemovalPolicy.RETAIN,
        },
        s3: {
            frontendBucketName: 'ts-fullstack-todo-frontend-stg',
            frontendBucketCorsAllowedOrigins: [`https://stg.${rootDomain}`],
            frontendBucketRemovalPolicy: RemovalPolicy.RETAIN,
            attachmentBucketName: 'ts-fullstack-todo-attachment-stg',
            attachmentBucketCorsAllowedOrigins: [`https://stg.${rootDomain}`],
            attachmentBucketRemovalPolicy: RemovalPolicy.RETAIN,
        },
        eventBridge: {
            reminderEvent: {
                senderEmail: '<replace with your email address>', // FIXME: Replace with your email address
                deadlineThresholdMs: 24 * 60 * 60 * 1000, // 24 hours
                // JST 9:00（UTC 00:00）、JST 15:00（UTC 06:00）
                scheduleExpressions: ['cron(0 0 * * ? *)', 'cron(0 6 * * ? *)'],
            },
        },
    },
    prod: {
        ...RuntimeEnvConstants.prod,
        env,
        database: {
            type: 'aurora',
            engine: DatabaseClusterEngine.auroraPostgres({ version: AuroraPostgresEngineVersion.VER_16_8 }),
            writer: ClusterInstance.provisioned('primary', {
                instanceType: InstanceType.of(InstanceClass.R7G, InstanceSize.LARGE),
                instanceIdentifier: 'ts-fullstack-todo-db-prod-primary',
                caCertificate: CaCertificate.RDS_CA_RSA4096_G1,
            }),
            readers: [
                ClusterInstance.provisioned('secondary', {
                    instanceType: InstanceType.of(InstanceClass.R7G, InstanceSize.LARGE),
                    instanceIdentifier: 'ts-fullstack-todo-db-prod-secondary',
                    caCertificate: CaCertificate.RDS_CA_RSA4096_G1,
                }),
            ],
            backup: {
                retention: Duration.days(7),
                preferredWindow: '17:00-19:00', // JST 02:00-04:00
            },
            removalPolicy: RemovalPolicy.RETAIN,
            cloudwatchLogsRetention: RetentionDays.ONE_MONTH,
        },
        redis: {
            removalPolicy: RemovalPolicy.RETAIN,
        },
        s3: {
            frontendBucketName: 'ts-fullstack-todo-frontend-prod',
            frontendBucketCorsAllowedOrigins: [`https://${rootDomain}`],
            frontendBucketRemovalPolicy: RemovalPolicy.RETAIN,
            attachmentBucketName: 'ts-fullstack-todo-attachment-prod',
            attachmentBucketCorsAllowedOrigins: [`https://${rootDomain}`],
            attachmentBucketRemovalPolicy: RemovalPolicy.RETAIN,
        },
        eventBridge: {
            reminderEvent: {
                senderEmail: '<replace with your email address>', // FIXME: Replace with your email address
                deadlineThresholdMs: 24 * 60 * 60 * 1000, // 24 hours
                // JST 9:00（UTC 00:00）、JST 15:00（UTC 06:00）
                scheduleExpressions: ['cron(0 0 * * ? *)', 'cron(0 6 * * ? *)'],
            },
        },
    },
}
