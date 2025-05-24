import { bootstrap } from '../main'
import { ReminderService } from './reminder.service'

export const handler = async () => {
    const app = await bootstrap()
    await app.get(ReminderService).sendDeadlines()
    await app.close()
}

if (require.main === module) {
    handler()
}
