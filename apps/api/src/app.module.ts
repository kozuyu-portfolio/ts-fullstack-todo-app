import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AttachmentModule } from './attachment/attachment.module'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { TaskModule } from './task/task.module'

@Module({
    imports: [PrismaModule, AuthModule, TaskModule, AttachmentModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
