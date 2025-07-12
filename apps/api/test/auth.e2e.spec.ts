import { JwtService } from '@nestjs/jwt'
import { requireEnv } from '@ts-fullstack-todo/shared'
import * as argon2 from 'argon2'
import { beforeAll, describe, expect, it } from 'vitest'
import { AuthService } from '../src/auth/auth.service'
import { RedisService } from '../src/redis/redis.service'
import { prisma } from './helper/prisma-test-util'

const jwt = new JwtService({ secret: 'test-secret' })
const redis = new RedisService(requireEnv('REDIS_URL'))
const service = new AuthService(
    requireEnv('JWT_ACCESS_SECRET'),
    requireEnv('JWT_ACCESS_EXPIRES_IN'),
    requireEnv('JWT_REFRESH_SECRET'),
    requireEnv('JWT_REFRESH_EXPIRES_IN'),
    prisma,
    jwt,
    redis,
)

describe('AuthService', () => {
    beforeAll(async () => {
        await prisma.user.deleteMany()
    })

    it('signup() & signin()', async () => {
        const cred = { email: 'alice@test', password: 'pw123456' }
        const { access_token } = await service.signup(cred)
        expect(access_token).toBeTruthy()

        const saved = await prisma.user.findUnique({ where: { email: cred.email } })
        expect(saved).not.toBeNull()
        if (saved === null) {
            throw new Error('Saved user should not be null')
        }
        expect(await argon2.verify(saved.password, cred.password)).toBe(true)

        const res = await service.signin(cred)
        expect(res.access_token).toBeTruthy()
    })
})
