import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { beforeAll, describe, expect, it } from 'vitest'
import { AuthService } from '../src/auth/auth.service'
import { prisma } from './helper/prisma-test-util'

const jwt = new JwtService({ secret: 'test-secret' })
const service = new AuthService(prisma, jwt)

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
