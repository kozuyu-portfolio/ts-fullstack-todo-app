import { ForbiddenException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { generateUUIDv7, requireEnv } from '@ts-fullstack-todo/shared'
import * as argon2 from 'argon2'
import ms, { StringValue } from 'ms'
import { AccessTokenPayload, RefreshTokenPayload } from '../model/auth.model'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { generateRefreshTokenKey } from './constants'
import { RefreshResponseDto } from './dto/refresh.response.dto'
import { SignInResponseDto } from './dto/signin.response.dto'
import { SignUpRequestDto } from './dto/signup.request.dto'
import { SignUpResponseDto } from './dto/signup.response.dto'

type RefreshToken = {
    refresh_token: string
}

@Injectable()
export class AuthService {
    private readonly jwtAccessSecret: string
    private readonly jwtAccessExpiresIn: string
    private readonly jwtRefreshSecret: string
    private readonly jwtRefreshExpiresIn: string

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly redis: RedisService,
    ) {
        this.jwtAccessSecret = requireEnv('JWT_ACCESS_SECRET')
        this.jwtAccessExpiresIn = requireEnv('JWT_ACCESS_EXPIRES_IN')
        this.jwtRefreshSecret = requireEnv('JWT_REFRESH_SECRET')
        this.jwtRefreshExpiresIn = requireEnv('JWT_REFRESH_EXPIRES_IN')

        if (!isMsStringValue(this.jwtAccessExpiresIn)) {
            throw new Error(`Invalid JWT_ACCESS_EXPIRES_IN: ${this.jwtAccessExpiresIn}`)
        }
        if (!isMsStringValue(this.jwtRefreshExpiresIn)) {
            throw new Error(`Invalid JWT_REFRESH_EXPIRES_IN: ${this.jwtRefreshExpiresIn}`)
        }
    }

    async signup(dto: SignUpRequestDto): Promise<SignUpResponseDto & RefreshToken> {
        const hash = await argon2.hash(dto.password)
        try {
            const user = await this.prisma.user.create({
                data: { email: dto.email, password: hash },
            })
            const accessToken = await this.signAccessToken(user.id, user.email)
            const refreshToken = await this.signRefreshToken(user.id)
            return {
                access_token: accessToken,
                refresh_token: refreshToken,
            }
        } catch (err) {
            throw new ForbiddenException('Credentials taken')
        }
    }

    async signin(dto: SignUpRequestDto): Promise<SignInResponseDto & RefreshToken> {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        })
        if (!user) {
            throw new ForbiddenException('Credentials incorrect')
        }

        const pwMatches = await argon2.verify(user.password, dto.password)
        if (!pwMatches) {
            throw new ForbiddenException('Credentials incorrect')
        }

        const accessToken = await this.signAccessToken(user.id, user.email)
        const refreshToken = await this.signRefreshToken(user.id)

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        }
    }

    async refresh(refreshToken: string): Promise<RefreshResponseDto & RefreshToken> {
        const payload: RefreshTokenPayload = this.jwt.verify(refreshToken, { secret: this.jwtRefreshSecret })

        const exists = await this.redis.get(generateRefreshTokenKey(payload.sub, payload.jti))
        if (!exists) {
            throw new ForbiddenException('Session expired')
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        })
        if (!user) {
            throw new ForbiddenException('Forbidden')
        }

        return {
            access_token: await this.signAccessToken(user.id, user.email),
            refresh_token: await this.signRefreshToken(user.id),
        }
    }

    async signout(userId: string, jti: string) {
        await this.redis.del(generateRefreshTokenKey(userId, jti))
    }

    private async signAccessToken(userId: string, email: string) {
        const jti = generateUUIDv7()
        const payload: Omit<AccessTokenPayload, 'exp' | 'iat'> = { sub: userId, email, jti }
        const token = await this.jwt.signAsync(payload, {
            secret: this.jwtAccessSecret,
            expiresIn: this.jwtAccessExpiresIn,
        })
        return token
    }

    private async signRefreshToken(userId: string) {
        if (!isMsStringValue(this.jwtRefreshExpiresIn)) {
            throw new Error(`Invalid JWT_REFRESH_EXPIRES_IN: ${this.jwtRefreshExpiresIn}`)
        }

        const jti = generateUUIDv7()
        const payload: Omit<RefreshTokenPayload, 'exp' | 'iat'> = { sub: userId, jti }
        const token = await this.jwt.signAsync(payload, {
            secret: this.jwtRefreshSecret,
            expiresIn: this.jwtRefreshExpiresIn,
        })
        await this.redis.set(generateRefreshTokenKey(userId, jti), '1', ms(this.jwtRefreshExpiresIn) / 1000)
        return token
    }
}

function isMsStringValue(value: unknown): value is StringValue {
    return typeof value === 'string'
}
