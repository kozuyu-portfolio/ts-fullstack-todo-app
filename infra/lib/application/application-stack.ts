import { Stack } from 'aws-cdk-lib'
import type { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import type { ISecurityGroup } from 'aws-cdk-lib/aws-ec2'
import type { CfnReplicationGroup } from 'aws-cdk-lib/aws-elasticache'
import type { IHostedZone } from 'aws-cdk-lib/aws-route53'
import type { IBucket } from 'aws-cdk-lib/aws-s3'
import type { ISecret } from 'aws-cdk-lib/aws-secretsmanager'
import type { Construct } from 'constructs'
import { makeId } from '../../infra-util.js'
import type { BaseProps } from '../base-props.js'
import { ApiGatewayConstruct } from './backend-constructs/apigateway-construct.js'
import { EventBridgeConstruct } from './backend-constructs/eventbridge-construct.js'
import { NestjsLambdaConstruct } from './backend-constructs/nestjs-lambda-construct.js'
import { BucketDeploymentConstruct } from './frontend-constructs/bucket-deployment-construct.js'
import { DistributionConstruct } from './frontend-constructs/distribution-construct.js'
import { S3HostingConstruct } from './frontend-constructs/s3-hosting-construct.js'

export interface ApplicationStackProps extends BaseProps {
    lambdaSecurityGroup: ISecurityGroup
    databaseSecret: ISecret
    redisReplicationGroup: CfnReplicationGroup
    redisAuthSecret: ISecret
    attachmentBucket: IBucket
    apiHostedZone: IHostedZone
    apiCertificate: ICertificate
    webHostedZone: IHostedZone
    webCertificate: ICertificate
}

export class ApplicationStack extends Stack {
    constructor(scope: Construct, id: string, props: ApplicationStackProps) {
        super(scope, id, props)
        const {
            stage,
            vpc,
            lambdaSecurityGroup,
            databaseSecret,
            redisReplicationGroup,
            redisAuthSecret,
            attachmentBucket,
            apiHostedZone,
            apiCertificate,
            webHostedZone,
            webCertificate,
        } = props

        /** Backend */
        const { nestjsLambda } = new NestjsLambdaConstruct(this, makeId('NestjsLambda', stage), {
            stage,
            vpc,
            lambdaSecurityGroup,
            databaseSecret,
            redisReplicationGroup,
            redisAuthSecret,
            attachmentBucket,
        })

        new ApiGatewayConstruct(this, makeId('ApiGatewayConstruct', stage), {
            stage,
            vpc,
            nestjsLambda,
            apiHostedZone,
            apiCertificate,
        })

        new EventBridgeConstruct(this, makeId('EventBridgeConstruct', stage), {
            stage,
            vpc,
            nestjsLambda,
        })

        /** Frontend */
        const { webBucket, webOai } = new S3HostingConstruct(this, makeId('S3HostingConstruct', stage), {
            stage,
            vpc,
        })

        const { distribution } = new DistributionConstruct(this, makeId('DistributionConstruct', stage), {
            stage,
            vpc,
            webHostedZone,
            webBucket,
            webOai,
            webCertificate,
        })

        new BucketDeploymentConstruct(this, makeId('BucketDeploymentConstruct', stage), {
            stage,
            vpc,
            webBucket,
            distribution,
        })
    }
}
