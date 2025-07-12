import type { Stage } from '@ts-fullstack-todo/shared'
import type { StackProps } from 'aws-cdk-lib'
import type { IVpc } from 'aws-cdk-lib/aws-ec2'

export interface BaseProps extends StackProps {
    stage: Stage
    vpc: IVpc
}
