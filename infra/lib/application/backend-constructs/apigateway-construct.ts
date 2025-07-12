import { InfraEnvConstants, toPascalCase } from '@ts-fullstack-todo/shared/infra'
import { Cors, EndpointType, LambdaRestApi, SecurityPolicy } from 'aws-cdk-lib/aws-apigateway'
import type { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import type { IFunction } from 'aws-cdk-lib/aws-lambda'
import { ARecord, type IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {
    nestjsLambda: IFunction
    apiHostedZone: IHostedZone
    apiCertificate: ICertificate
}

export class ApiGatewayConstruct extends Construct {
    public readonly restApi: LambdaRestApi
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage, nestjsLambda, apiHostedZone, apiCertificate } = props
        const envConstants = InfraEnvConstants[stage]

        this.restApi = new LambdaRestApi(this, makeId('LambdaRestApi', stage), {
            restApiName: `ts-fullstack-todo-rest-api-${stage}`,
            handler: nestjsLambda,
            proxy: true,
            deployOptions: {
                stageName: stage,
            },
            defaultCorsPreflightOptions: {
                allowCredentials: true,
                statusCode: 200,
                allowOrigins: [`https://${envConstants.webDomain}`],
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: Cors.DEFAULT_HEADERS,
            },
        })

        this.restApi.addDomainName(makeId(`${toPascalCase(apiHostedZone.zoneName.replace('.', '_'))}`, stage), {
            domainName: `${apiHostedZone.zoneName}`,
            certificate: apiCertificate,
            securityPolicy: SecurityPolicy.TLS_1_2,
            endpointType: EndpointType.EDGE,
        })

        new ARecord(this, makeId('ApiARecord', stage), {
            zone: apiHostedZone,
            recordName: apiHostedZone.zoneName,
            target: RecordTarget.fromAlias(new ApiGateway(this.restApi)),
        })
    }
}
