import {
    CreateTaskRequestDto,
    TaskResponseDto,
    UpdateTaskRequestDto,
    taskControllerCreate,
    taskControllerFindAll,
    taskControllerUpdate,
} from '@ts-fullstack-todo/api-client'
import { atom } from 'jotai'
import { atomWithMutation, atomWithQuery, queryClientAtom } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import { apiClient } from 'src/api/client'

export const filterAtom = atom<'all' | 'todo' | 'done'>('all')

export const tasksQueryAtom = atomWithQuery<TaskResponseDto[]>(() => ({
    queryKey: ['tasks'],
    queryFn: async () => {
        const res = await taskControllerFindAll({ client: apiClient })
        if (res.data == null) {
            throw new Error('Failed to fetch tasks')
        }
        return res.data
    },
}))

export const createTaskMutationAtom = atomWithMutation((get) => ({
    mutationKey: ['createTask'],
    mutationFn: async (body: CreateTaskRequestDto) => {
        const res = await taskControllerCreate({ body, client: apiClient })
        if (res.data == null) {
            throw new Error('Failed to create task')
        }
        return res.data
    },
    onSettled: () => {
        const queryClient = get(queryClientAtom)
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
}))

export const updateTaskMutationAtomFamily = atomFamily((id: string) =>
    atomWithMutation((get) => ({
        mutationKey: ['updateTask'],
        mutationFn: async ({ body }: { body: UpdateTaskRequestDto }) => {
            const res = await taskControllerUpdate({
                path: { id },
                body,
                client: apiClient,
            })
            if (res.data == null) {
                throw new Error('Failed to update task')
            }
            return res.data
        },
        onSettled: () => {
            const queryClient = get(queryClientAtom)
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })),
)

export const visibleTasksAtom = atom((get) => {
    const filter = get(filterAtom)
    const tasks = get(tasksQueryAtom).data
    if (filter === 'todo') {
        return tasks?.filter((t) => !t.isDone) ?? []
    }
    if (filter === 'done') {
        return tasks?.filter((t) => t.isDone) ?? []
    }
    return tasks ?? []
})
