import { GatewayVpcEndpointAwsService, type ISecurityGroup, InterfaceVpcEndpointAwsService } from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {
    vpcEndpointSecurityGroup: ISecurityGroup
}

export class VpcEndpointConstruct extends Construct {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage, vpc, vpcEndpointSecurityGroup } = props

        vpc.addGatewayEndpoint(makeId('S3VpcEndpoint', stage), {
            service: GatewayVpcEndpointAwsService.S3,
        })
        vpc.addInterfaceEndpoint(makeId('SecretsManagerVpcEndpoint', stage), {
            service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
            securityGroups: [vpcEndpointSecurityGroup],
        })
        vpc.addInterfaceEndpoint(makeId('SesVpcEndpoint', stage), {
            service: InterfaceVpcEndpointAwsService.EMAIL_SMTP,
            securityGroups: [vpcEndpointSecurityGroup],
        })

        vpc.addInterfaceEndpoint(makeId('SsmVpcEndpoint', stage), {
            service: InterfaceVpcEndpointAwsService.SSM,
            securityGroups: [vpcEndpointSecurityGroup],
        })
        vpc.addInterfaceEndpoint(makeId('SsmMessagesVpcEndpoint', stage), {
            service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
            securityGroups: [vpcEndpointSecurityGroup],
        })
        vpc.addInterfaceEndpoint(makeId('Ec2MessagesVpcEndpoint', stage), {
            service: InterfaceVpcEndpointAwsService.EC2_MESSAGES,
            securityGroups: [vpcEndpointSecurityGroup],
        })
    }
}
