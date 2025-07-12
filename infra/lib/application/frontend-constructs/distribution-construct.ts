import { Duration } from 'aws-cdk-lib'
import {
    AllowedMethods,
    Function as CloudFrontFunction,
    Distribution,
    FunctionCode,
    FunctionEventType,
    PriceClass,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { ARecord, type IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'

import type { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import type { IDistribution, IOriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront'
import type { IBucket } from 'aws-cdk-lib/aws-s3'

import type { Stage } from '@ts-fullstack-todo/shared'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {
    webHostedZone: IHostedZone
    webOai: IOriginAccessIdentity
    webBucket: IBucket
    webCertificate: ICertificate
}

export class DistributionConstruct extends Construct {
    public readonly distribution: IDistribution
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage, webHostedZone, webBucket, webOai, webCertificate } = props
        this.distribution = this.createDistribution(stage, webHostedZone, webBucket, webOai, webCertificate)
        this.createARecord(stage, webHostedZone, this.distribution)
    }

    private createDistribution(
        stage: Stage,
        webHostedZone: IHostedZone,
        webBucket: IBucket,
        webOai: IOriginAccessIdentity,
        webCertificate: ICertificate,
    ): Distribution {
        return new Distribution(this, makeId('Distribution', stage), {
            domainNames: [webHostedZone.zoneName],
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessIdentity(webBucket, { originAccessIdentity: webOai }),
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
                functionAssociations:
                    stage === 'prod'
                        ? undefined
                        : [
                              {
                                  function: new CloudFrontFunction(this, makeId('BasicAuthLambda', stage), {
                                      functionName: `web-basic-auth-${webHostedZone.zoneName.replaceAll('.', '-')}-${stage}`,
                                      code: FunctionCode.fromFile({ filePath: 'lib/application/basic-auth.js' }),
                                  }),
                                  eventType: FunctionEventType.VIEWER_REQUEST,
                              },
                          ],
            },
            certificate: webCertificate,
            priceClass: PriceClass.PRICE_CLASS_200,
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.seconds(0),
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.seconds(0),
                },
            ],
        })
    }

    private createARecord(stage: Stage, hz: IHostedZone, distribution: IDistribution): ARecord {
        return new ARecord(this, makeId('ARecord', stage), {
            zone: hz,
            recordName: hz.zoneName,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        })
    }
}
