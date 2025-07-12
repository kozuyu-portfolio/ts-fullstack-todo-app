import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AttachmentModule } from './attachment/attachment.module'
import { AuthModule } from './auth/auth.module'
import { GlobalAccessTokenGuard } from './auth/guards/global-access-token.guard'
import { EventModule } from './events/event.module'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { TaskModule } from './task/task.module'

@Module({
    imports: [PrismaModule, AuthModule, TaskModule, AttachmentModule, RedisModule, EventModule],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: GlobalAccessTokenGuard,
        },
    ],
})
export class AppModule {}
