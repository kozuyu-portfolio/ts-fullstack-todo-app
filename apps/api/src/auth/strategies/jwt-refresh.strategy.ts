import { ForbiddenException, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { requireEnv } from '@ts-fullstack-todo/shared'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { generateRefreshTokenKey, strategyNames } from '../../auth/constants.js'
import { RefreshTokenPayload } from '../../model/auth.model.js'
import { RedisService } from '../../redis/redis.service.js'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, strategyNames.refresh) {
    constructor(private readonly redis: RedisService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.refresh_token]),
            ignoreExpiration: false,
            secretOrKey: requireEnv('JWT_REFRESH_SECRET'),
        })
    }

    async validate(payload: RefreshTokenPayload) {
        const exists = await this.redis.get(generateRefreshTokenKey(payload.sub, payload.jti))
        if (!exists) {
            throw new ForbiddenException('Refresh token revoked')
        }
        return payload
    }
}
