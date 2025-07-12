import { Stack } from 'aws-cdk-lib'
import type { ISecurityGroup } from 'aws-cdk-lib/aws-ec2'
import type { CfnReplicationGroup } from 'aws-cdk-lib/aws-elasticache'
import type { IBucket } from 'aws-cdk-lib/aws-s3'
import type { ISecret } from 'aws-cdk-lib/aws-secretsmanager'
import type { Construct } from 'constructs'
import { makeId } from '../../infra-util.js'
import type { BaseProps } from '../base-props.js'
import { AttachmentBucketConstruct } from './constructs/attachment-bucket-construct.js'
import { DatabaseConstruct } from './constructs/database-construct.js'
import { RedisConstruct } from './constructs/redis-construct.js'

export interface DataStackProps extends BaseProps {
    databaseSecurityGroup: ISecurityGroup
    redisSecurityGroup: ISecurityGroup
}

export class DataStack extends Stack {
    public readonly databaseSecret: ISecret
    public readonly redisAuthSecret: ISecret
    public readonly redisReplicationGroup: CfnReplicationGroup
    public readonly attachmentBucket: IBucket

    constructor(scope: Construct, id: string, props: DataStackProps) {
        super(scope, id, props)
        const { stage, vpc, databaseSecurityGroup, redisSecurityGroup } = props

        /* Aurora PostgreSQL */
        const { databaseSecret } = new DatabaseConstruct(this, makeId('DatabaseConstruct', stage), {
            stage,
            vpc,
            databaseSecurityGroup,
        })

        /* Redis */
        const { redisAuthSecret, redisReplicationGroup } = new RedisConstruct(this, makeId('RedisConstruct', stage), {
            stage,
            vpc,
            redisSecurityGroup,
        })

        /* Attachment S3 Bucket */
        const { attachmentBucket } = new AttachmentBucketConstruct(this, makeId('AttachmentBucketConstruct', stage), {
            stage,
            vpc,
        })

        this.databaseSecret = databaseSecret
        this.redisAuthSecret = redisAuthSecret
        this.redisReplicationGroup = redisReplicationGroup
        this.attachmentBucket = attachmentBucket
    }
}
