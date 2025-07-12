import { InfraEnvConstants } from '@ts-fullstack-todo/shared/infra'
import { Bucket, BucketEncryption, HttpMethods, type IBucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {}

export class AttachmentBucketConstruct extends Construct {
    public readonly attachmentBucket: IBucket
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage } = props
        const env = InfraEnvConstants[stage]
        const {
            s3: { attachmentBucketName, attachmentBucketCorsAllowedOrigins, attachmentBucketRemovalPolicy },
        } = env

        const bucket = new Bucket(this, makeId('AttachmentBucket', stage), {
            bucketName: attachmentBucketName,
            encryption: BucketEncryption.S3_MANAGED,
            removalPolicy: attachmentBucketRemovalPolicy,
            cors: [
                {
                    allowedOrigins: attachmentBucketCorsAllowedOrigins,
                    allowedMethods: [HttpMethods.GET, HttpMethods.PUT],
                    allowedHeaders: ['*'],
                },
            ],
            enforceSSL: true,
        })
        this.attachmentBucket = bucket
    }
}
