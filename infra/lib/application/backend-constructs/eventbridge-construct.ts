import { InfraEnvConstants, eventBridgeDetailTypes } from '@ts-fullstack-todo/shared/infra'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import type { IFunction } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import { makeId } from '../../../infra-util.js'
import type { BaseProps } from '../../base-props.js'

interface Props extends BaseProps {
    nestjsLambda: IFunction
}

export class EventBridgeConstruct extends Construct {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id)
        const { stage } = props
        const { nestjsLambda } = props
        const {
            eventBridge: {
                reminderEvent: { scheduleExpressions },
            },
        } = InfraEnvConstants[stage]

        scheduleExpressions.forEach((expression, index) => {
            new Rule(this, makeId(`EventBridgeSchedule${index}`, stage), {
                schedule: Schedule.expression(expression),
                targets: [new LambdaFunction(nestjsLambda)],
                eventPattern: {
                    detailType: [eventBridgeDetailTypes.Reminder],
                },
            })
        })
    }
}
