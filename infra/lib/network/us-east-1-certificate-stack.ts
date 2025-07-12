import { Stack } from 'aws-cdk-lib'
import type { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import type { IHostedZone } from 'aws-cdk-lib/aws-route53'
import type { Construct } from 'constructs'
import { makeId } from '../../infra-util.js'
import type { BaseProps } from '../base-props.js'
import { CertificateConstruct } from './constructs/certificate-construct.js'

export interface UsEast1CertificateStackProps extends Omit<BaseProps, 'vpc'> {
    apiHostedZone: IHostedZone
    webHostedZone: IHostedZone
}

export class UsEast1CertificateStack extends Stack {
    public readonly apiCertificate: ICertificate
    public readonly webCertificate: ICertificate

    constructor(scope: Construct, id: string, props: UsEast1CertificateStackProps) {
        super(scope, id, props)
        const { stage, apiHostedZone, webHostedZone } = props

        const { webCertificate, apiCertificate } = new CertificateConstruct(
            this,
            makeId('CertificateConstruct', stage),
            {
                stage,
                webHostedZone,
                apiHostedZone,
            },
        )

        this.apiCertificate = apiCertificate
        this.webCertificate = webCertificate
    }
}
