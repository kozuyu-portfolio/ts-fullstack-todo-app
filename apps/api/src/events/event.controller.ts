import { Body, Controller, Post } from '@nestjs/common'
import { eventBridgeDetailTypes } from '@ts-fullstack-todo/shared/dist/runtime'
import { ReminderService } from './reminder.service'

@Controller('events')
export class EventController {
    constructor(private readonly reminderService: ReminderService) {}

    @Post()
    nonHttpEventTrigger(@Body() records: unknown) {
        try {
            for (const record of Array.isArray(records) ? records : [records]) {
                if (
                    typeof record === 'object' &&
                    record !== null &&
                    'detail-type' in record &&
                    record['detail-type'] === eventBridgeDetailTypes.Reminder
                ) {
                    this.reminderService.sendDeadlines()
                }
            }
        } catch (error) {
            console.error('Error processing event records:', error)
        }
    }
}
