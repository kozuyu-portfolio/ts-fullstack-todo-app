import {
    BastionHostLinux,
    type ISecurityGroup,
    InstanceClass,
    InstanceSize,
    InstanceType,
    SubnetType,
} from 'aws-cdk-lib/aws-ec2'
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam'
import {
    AwsCustomResource,
    AwsCustomResourcePolicy,
    type AwsSdkCall,
    PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {
    bastionSecurityGroup: ISecurityGroup
}

export class BastionConstruct extends Construct {
    public readonly bastionHost: BastionHostLinux
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage, vpc, bastionSecurityGroup } = props

        this.bastionHost = new BastionHostLinux(this, makeId('BastionHost', stage), {
            vpc,
            instanceName: `TsFullstackTodoBastionHost-${stage}`,
            subnetSelection: {
                subnetType: SubnetType.PRIVATE_ISOLATED,
            },
            securityGroup: bastionSecurityGroup,
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            requireImdsv2: true,
        })
        this.bastionHost.instance.role.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        )

        /**
         * To reduce costs, the BastionHost will only be started when in use.
         */
        const stopInstanceCustomResourceCall: AwsSdkCall = {
            service: 'EC2',
            action: 'StopInstances',
            parameters: {
                InstanceIds: [this.bastionHost.instanceId],
            },
            physicalResourceId: PhysicalResourceId.of('stop-bastion-instance'),
        }
        new AwsCustomResource(this, makeId('StopBastionInstanceCustomResource', stage), {
            onCreate: stopInstanceCustomResourceCall,
            onUpdate: stopInstanceCustomResourceCall,
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: ['*'],
            }),
        })
    }
}
