import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JWT_ACCESS_SECRET } from 'secrets/secrets.constants'
import { strategyNames } from '../../auth/constants'
import { AccessTokenPayload } from '../../model/auth.model'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, strategyNames.access) {
    constructor(@Inject(JWT_ACCESS_SECRET) jwtAccessSecret: string) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtAccessSecret,
        })
    }

    validate(payload: AccessTokenPayload) {
        return payload
    }
}
