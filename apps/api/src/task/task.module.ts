import { Module } from '@nestjs/common'
import { AWSModule } from '../aws/aws.module'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

@Module({
    imports: [AWSModule],
    controllers: [TaskController],
    providers: [TaskService],
})
export class TaskModule {}
