import { Module } from '@nestjs/common'
import { EventController } from './event.controller'
import { ReminderService } from './reminder.service'

@Module({
    controllers: [EventController],
    providers: [ReminderService],
})
export class EventModule {}
