import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import {
    DATABASE_URL,
    JWT_ACCESS_EXPIRES_IN,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_EXPIRES_IN,
    JWT_REFRESH_SECRET,
    REDIS_URL,
} from './secrets.constants'

@Global()
@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    providers: [
        {
            provide: SecretsManagerClient,
            useFactory: (cs: ConfigService) =>
                new SecretsManagerClient({
                    region: cs.get<string>('AWS_REGION', 'ap-northeast-1'),
                }),
            inject: [ConfigService],
        },
        {
            provide: 'SECRETS_RESOLVER',
            useFactory: async (cs: ConfigService, sm: SecretsManagerClient): Promise<Record<string, string>> => {
                const nodeEnv = cs.get<string>('NODE_ENV', 'development')

                const jwtAccessExpiresIn = cs.get<string>('JWT_ACCESS_EXPIRES_IN', '15min')
                const jwtRefreshExpiresIn = cs.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')

                if (nodeEnv !== 'production') {
                    const databaseUrl = cs.get<string>('DATABASE_URL')
                    if (!databaseUrl) {
                        throw new Error('DATABASE_URL is not set in non-production environment')
                    }
                    const redisUrl = cs.get<string>('REDIS_URL')
                    if (!redisUrl) {
                        throw new Error('REDIS_URL is not set in non-production environment')
                    }
                    const jwtAccessSecret = cs.get<string>('JWT_ACCESS_SECRET')
                    if (!jwtAccessSecret) {
                        throw new Error('JWT_ACCESS_SECRET is not set in non-production environment')
                    }
                    const jwtRefreshSecret = cs.get<string>('JWT_REFRESH_SECRET')
                    if (!jwtRefreshSecret) {
                        throw new Error('JWT_REFRESH_SECRET is not set in non-production environment')
                    }

                    return {
                        databaseUrl,
                        redisUrl,
                        jwtAccessSecret,
                        jwtAccessExpiresIn,
                        jwtRefreshSecret,
                        jwtRefreshExpiresIn,
                    }
                }

                const databaseSecretArn = cs.get<string>('DATABASE_SECRET_ARN')
                if (!databaseSecretArn) {
                    throw new Error('DATABASE_SECRET_ARN is not set in production environment')
                }
                const redisAuthSecretArn = cs.get<string>('REDIS_AUTH_SECRET_ARN')
                if (!redisAuthSecretArn) {
                    throw new Error('REDIS_AUTH_SECRET_ARN is not set in production environment')
                }
                const jwtAccessSecretArn = cs.get<string>('ACCESS_TOKEN_SECRET_ARN')
                if (!jwtAccessSecretArn) {
                    throw new Error('ACCESS_TOKEN_SECRET_ARN is not set in production environment')
                }
                const jwtRefreshSecretArn = cs.get<string>('REFRESH_TOKEN_SECRET_ARN')
                if (!jwtRefreshSecretArn) {
                    throw new Error('REFRESH_TOKEN_SECRET_ARN is not set in production environment')
                }
                const redisEndpointAddress = cs.get<string>('REDIS_ENDPOINT_ADDRESS')
                if (!redisEndpointAddress) {
                    throw new Error('REDIS_ENDPOINT_ADDRESS is not set in production environment')
                }
                const redisEndpointPort = cs.get<string>('REDIS_ENDPOINT_PORT')
                if (!redisEndpointPort) {
                    throw new Error('REDIS_ENDPOINT_PORT is not set in production environment')
                }

                const [databaseSecret, redisAuthSecret, jwtAccessSecretVal, jwtRefreshSecretVal] = await Promise.all([
                    sm.send(
                        new GetSecretValueCommand({
                            SecretId: databaseSecretArn,
                        }),
                    ),
                    sm.send(
                        new GetSecretValueCommand({
                            SecretId: redisAuthSecretArn,
                        }),
                    ),
                    sm.send(
                        new GetSecretValueCommand({
                            SecretId: jwtAccessSecretArn,
                        }),
                    ),
                    sm.send(
                        new GetSecretValueCommand({
                            SecretId: jwtRefreshSecretArn,
                        }),
                    ),
                ])

                if (!databaseSecret.SecretString) {
                    throw new Error(`Database secret ${databaseSecretArn} does not have SecretString`)
                }
                if (!redisAuthSecret.SecretString) {
                    throw new Error(`Redis secret ${redisAuthSecretArn} does not have SecretString`)
                }
                if (!jwtAccessSecretVal.SecretString) {
                    throw new Error(`JWT access secret ${jwtAccessSecretArn} does not have SecretString`)
                }
                if (!jwtRefreshSecretVal.SecretString) {
                    throw new Error(`JWT refresh secret ${jwtRefreshSecretArn} does not have SecretString`)
                }

                const { username, password, host, port } = JSON.parse(databaseSecret.SecretString)
                const databaseUrl = `postgresql://${username}:${encodeURIComponent(
                    password,
                )}@${host}:${port}/postgres?schema=public`

                const redisAuthToken = redisAuthSecret.SecretString
                const redisUrl = `redis://:${encodeURIComponent(redisAuthToken)}@${redisEndpointAddress}:${redisEndpointPort}`

                return {
                    databaseUrl,
                    redisUrl,
                    jwtAccessSecret: jwtAccessSecretVal.SecretString,
                    jwtAccessExpiresIn,
                    jwtRefreshSecret: jwtRefreshSecretVal.SecretString,
                    jwtRefreshExpiresIn,
                }
            },
            inject: [ConfigService, SecretsManagerClient],
        },

        {
            provide: DATABASE_URL,
            useFactory: (s: Record<string, string>) => s.databaseUrl,
            inject: ['SECRETS_RESOLVER'],
        },
        {
            provide: REDIS_URL,
            useFactory: (s: Record<string, string>) => s.redisUrl,
            inject: ['SECRETS_RESOLVER'],
        },
        {
            provide: JWT_ACCESS_SECRET,
            useFactory: (s: Record<string, string>) => s.jwtAccessSecret,
            inject: ['SECRETS_RESOLVER'],
        },
        {
            provide: JWT_ACCESS_EXPIRES_IN,
            useFactory: (s: Record<string, string>) => s.jwtAccessExpiresIn,
            inject: ['SECRETS_RESOLVER'],
        },
        {
            provide: JWT_REFRESH_SECRET,
            useFactory: (s: Record<string, string>) => s.jwtRefreshSecret,
            inject: ['SECRETS_RESOLVER'],
        },
        {
            provide: JWT_REFRESH_EXPIRES_IN,
            useFactory: (s: Record<string, string>) => s.jwtRefreshExpiresIn,
            inject: ['SECRETS_RESOLVER'],
        },
    ],
    exports: [
        DATABASE_URL,
        REDIS_URL,
        JWT_ACCESS_SECRET,
        JWT_ACCESS_EXPIRES_IN,
        JWT_REFRESH_SECRET,
        JWT_REFRESH_EXPIRES_IN,
    ],
})
export class SecretsModule {}
