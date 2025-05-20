import {
    CreateAttachmentResponseDto,
    GetAttachmentResponseDto,
    TaskResponseDto,
    attachmentControllerCreate,
    attachmentControllerGetDownloadUrl,
    taskControllerFindOne,
} from '@ts-fullstack-todo/api-client'
import { atomWithMutation, atomWithQuery, queryClientAtom } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import { apiClient } from 'src/api/client'

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export const taskDetailQueryAtomFamily = atomFamily((id: string) =>
    atomWithQuery<TaskResponseDto>(() => ({
        queryKey: ['tasks', id],
        queryFn: async () => {
            const res = await taskControllerFindOne({ path: { id }, client: apiClient })
            if (res.data == null) {
                throw new Error('Failed to fetch task')
            }
            return res.data
        },
    })),
)

export const uploadFileMutationAtomFamily = atomFamily((taskId: string) =>
    atomWithMutation((get) => ({
        mutationKey: ['upload', taskId],
        mutationFn: async ({ file }: { file: File }): Promise<CreateAttachmentResponseDto> => {
            const res = await attachmentControllerCreate({
                path: { taskId },
                body: { filename: file.name },
                client: apiClient,
            })
            if (res.data == null) {
                throw new Error('Failed to upload file')
            }

            await fetch(res.data.url, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            })
            return res.data
        },
        onSettled: () => {
            const queryClient = get(queryClientAtom)
            queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
        },
    })),
)

export const downloadFileMutationAtomFamily = atomFamily((attachmentId: string) =>
    atomWithMutation(() => ({
        mutationKey: ['download', attachmentId],
        mutationFn: async (): Promise<GetAttachmentResponseDto> => {
            const res = await attachmentControllerGetDownloadUrl({
                path: { attachmentId },
                client: apiClient,
            })
            if (res.data == null) {
                throw new Error('Failed to download file')
            }
            return res.data
        },
    })),
)
