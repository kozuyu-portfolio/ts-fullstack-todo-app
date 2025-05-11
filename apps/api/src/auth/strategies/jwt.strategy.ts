import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const secretOrKey = process.env.JWT_SECRET;
        if (!secretOrKey) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey,
        });
    }

    validate(payload: { sub: number; email: string }) {
        return payload;
    }
}