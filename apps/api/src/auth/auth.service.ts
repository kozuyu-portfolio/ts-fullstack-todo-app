import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpRequestDto } from './dto/signup.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) { }

    async signup(dto: SignUpRequestDto) {
        const hash = await argon2.hash(dto.password);
        try {
            const user = await this.prisma.user.create({
                data: { email: dto.email, password: hash },
            });
            return this.signToken(user.id, user.email);
        } catch (err) {
            throw new ForbiddenException('Credentials taken');
        }
    }

    async signin(dto: SignUpRequestDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) { throw new ForbiddenException('Credentials incorrect'); }

        const pwMatches = await argon2.verify(user.password, dto.password);
        if (!pwMatches) { throw new ForbiddenException('Credentials incorrect'); }

        return this.signToken(user.id, user.email);
    }

    private async signToken(userId: number, email: string) {
        const payload = { sub: userId, email };
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        const token = await this.jwt.signAsync(payload, {
            secret,
            expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
        });
        return { access_token: token };
    }
}