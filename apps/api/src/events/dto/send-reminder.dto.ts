export interface SendReminderDto {
    userEmail: string
    tasks: { id: number; title: string; deadline: Date }[]
}
