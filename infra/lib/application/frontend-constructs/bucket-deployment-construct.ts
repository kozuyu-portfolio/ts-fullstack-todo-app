import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'

import type { IDistribution } from 'aws-cdk-lib/aws-cloudfront'
import type { IBucket } from 'aws-cdk-lib/aws-s3'

import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {
    webBucket: IBucket
    distribution: IDistribution
}

export class BucketDeploymentConstruct extends Construct {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage, webBucket, distribution } = props

        new BucketDeployment(this, makeId('BucketDeployment', stage), {
            sources: [Source.asset('../apps/web/dist')],
            destinationBucket: webBucket,
            distribution,
            distributionPaths: ['/*'],
        })
    }
}
