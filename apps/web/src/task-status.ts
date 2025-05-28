import { CreateTaskRequestDto } from '@ts-fullstack-todo/api-client'

export type TaskStatus = CreateTaskRequestDto['status']
export const TASK_STATUS = {
    NOT_STARTED: 'NOT_STARTED' as TaskStatus,
    IN_PROGRESS: 'IN_PROGRESS' as TaskStatus,
    COMPLETED: 'COMPLETED' as TaskStatus,
} as const
