import { InfraEnvConstants, type Stage } from '@ts-fullstack-todo/shared/infra'
import { Stack } from 'aws-cdk-lib'
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront'
import { CanonicalUserPrincipal } from 'aws-cdk-lib/aws-iam'
import { BlockPublicAccess, Bucket, BucketEncryption, type IBucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {}

export class S3HostingConstruct extends Construct {
    public readonly webBucket: IBucket
    public readonly webOai: OriginAccessIdentity
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage } = props
        const env = InfraEnvConstants[stage]
        const { webDomain } = env

        this.webBucket = this.createBucket(webDomain, makeId('WebBucket', stage))
        this.webOai = this.createOai(stage, makeId('WebOai', stage))
        this.webBucket.grantRead(
            new CanonicalUserPrincipal(this.webOai.cloudFrontOriginAccessIdentityS3CanonicalUserId),
        )
    }

    private createOai(stage: Stage, id: string): OriginAccessIdentity {
        return new OriginAccessIdentity(this, id, {
            comment: `cf-oai-${Stack.of(this).account}-${stage}`,
        })
    }

    private createBucket(name: string, id: string): IBucket {
        return new Bucket(this, id, {
            bucketName: name,
            encryption: BucketEncryption.S3_MANAGED,
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
        })
    }
}
