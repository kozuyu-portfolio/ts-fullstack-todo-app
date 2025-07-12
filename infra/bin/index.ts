#!/usr/bin/env node
import { InfraEnvConstants, isValidStage } from '@ts-fullstack-todo/shared/infra'
import { App } from 'aws-cdk-lib'
import { makeId } from '../infra-util.js'
import { ApplicationStack } from '../lib/application/application-stack.js'
import { DataStack } from '../lib/data/data-stack.js'
import { NetworkStack } from '../lib/network/network-stack.js'
import { UsEast1CertificateStack } from '../lib/network/us-east-1-certificate-stack.js'

const app = new App()
const stage = app.node.tryGetContext('stage')

if (!isValidStage(stage)) {
    throw new Error("contest 'stage' is invalid")
}

const { env } = InfraEnvConstants[stage]

const networkStack = new NetworkStack(app, makeId('NetworkStack', stage), {
    stage,
    env,
    crossRegionReferences: true,
})
const { vpc, databaseSecurityGroup, redisSecurityGroup, lambdaSecurityGroup, apiHostedZone, webHostedZone } =
    networkStack

const certificateStack = new UsEast1CertificateStack(app, makeId('UsEast1CertificateStack', stage), {
    stage,
    env: {
        ...env,
        region: 'us-east-1',
    },
    crossRegionReferences: true,
    apiHostedZone,
    webHostedZone,
})
certificateStack.addDependency(networkStack)
const { apiCertificate, webCertificate } = certificateStack

const dataStack = new DataStack(app, makeId('DataStack', stage), {
    stage,
    env,
    crossRegionReferences: true,
    vpc,
    databaseSecurityGroup,
    redisSecurityGroup,
})
dataStack.addDependency(networkStack)
const { databaseSecret, redisAuthSecret, redisReplicationGroup, attachmentBucket } = dataStack

const applicationStack = new ApplicationStack(app, makeId('ApplicationStack', stage), {
    stage,
    env,
    crossRegionReferences: true,
    vpc,
    lambdaSecurityGroup,
    databaseSecret,
    redisAuthSecret,
    redisReplicationGroup,
    attachmentBucket,
    apiHostedZone,
    apiCertificate,
    webHostedZone,
    webCertificate,
})
applicationStack.addDependency(certificateStack)
applicationStack.addDependency(dataStack)
