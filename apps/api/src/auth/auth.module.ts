import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { RedisModule } from '../redis/redis.module'
import { SecretsModule } from '../secrets/secrets.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAccessStrategy } from './strategies/jwt-access.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'

@Module({
    imports: [JwtModule.register({}), RedisModule, SecretsModule],
    controllers: [AuthController],
    providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
    exports: [AuthService],
})
export class AuthModule {}
