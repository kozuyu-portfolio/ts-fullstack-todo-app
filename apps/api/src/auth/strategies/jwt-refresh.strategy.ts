import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { generateRefreshTokenKey, strategyNames } from '../../auth/constants.js'
import { RefreshTokenPayload } from '../../model/auth.model.js'
import { RedisService } from '../../redis/redis.service.js'
import { JWT_REFRESH_SECRET } from '../../secrets/secrets.constants.js'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, strategyNames.refresh) {
    constructor(
        @Inject(JWT_REFRESH_SECRET) jwtRefreshSecret: string,
        private readonly redis: RedisService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.refresh_token]),
            ignoreExpiration: false,
            secretOrKey: jwtRefreshSecret,
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
