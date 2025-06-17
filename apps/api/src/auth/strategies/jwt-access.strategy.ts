import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { requireEnv } from '@ts-fullstack-todo/shared'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { strategyNames } from '../../auth/constants'
import { AccessTokenPayload } from '../../model/auth.model'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, strategyNames.access) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: requireEnv('JWT_ACCESS_SECRET'),
        })
    }

    validate(payload: AccessTokenPayload) {
        return payload
    }
}
