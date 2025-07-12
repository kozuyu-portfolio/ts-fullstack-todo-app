import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager'

import type { IHostedZone } from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'

import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends Omit<BaseProps, 'vpc'> {
    webHostedZone: IHostedZone
    apiHostedZone: IHostedZone
}

export class CertificateConstruct extends Construct {
    public readonly webCertificate: Certificate
    public readonly apiCertificate: Certificate
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage, webHostedZone, apiHostedZone } = props

        this.webCertificate = new Certificate(this, makeId('WebCertificate', stage), {
            domainName: webHostedZone.zoneName,
            validation: CertificateValidation.fromDns(webHostedZone),
        })

        this.apiCertificate = new Certificate(this, makeId('ApiCertificate', stage), {
            domainName: apiHostedZone.zoneName,
            validation: CertificateValidation.fromDns(apiHostedZone),
        })
    }
}
