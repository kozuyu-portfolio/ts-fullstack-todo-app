import DownloadIcon from '@mui/icons-material/Download'
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { AttachmentInDto } from '@ts-fullstack-todo/api-client'
import dayjs from 'dayjs'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useForm } from 'react-hook-form'
import { TASK_STATUS, TaskStatus } from 'src/task-status'
import { updateTaskMutationAtomFamily } from '../../../store/task'
import {
    downloadFileMutationAtomFamily,
    taskDetailQueryAtomFamily,
    uploadFileMutationAtomFamily,
} from '../../../store/taskDetail'

export const Route = createFileRoute('/_protected/tasks/$taskId')({
    component: TaskDetailPage,
})

type FormValues = {
    title: string
    status: TaskStatus
    deadline: string
}

export function TaskDetailPage() {
    const { taskId } = useParams({ from: '/_protected/tasks/$taskId' })
    const [{ data: task, isLoading }] = useAtom(taskDetailQueryAtomFamily(taskId))
    const updateTask = useAtomValue(updateTaskMutationAtomFamily(taskId))
    const uploadFile = useAtomValue(uploadFileMutationAtomFamily(taskId))

    const { control, reset, watch } = useForm<FormValues>({
        defaultValues: {
            title: task?.title ?? '',
            status: task?.status,
            deadline: task?.deadline
                ? dayjs(task.deadline).format('YYYY-MM-DDTHH:mm')
                : dayjs().format('YYYY-MM-DDTHH:mm'),
        },
    })

    // 値の変更を監視して即時更新
    useEffect(() => {
        const subscription = watch((data, { type }) => {
            if (type === undefined) {
                return
            }
            updateTask.mutate({
                body: {
                    title: data.title,
                    status: data.status,
                    deadline: data.deadline ? dayjs(data.deadline).toISOString() : undefined,
                },
            })
        })
        return () => subscription.unsubscribe()
    }, [watch, updateTask])

    useEffect(() => {
        if (!task) {
            return
        }
        reset({
            title: task.title ?? '',
            status: task.status,
            deadline: task.deadline
                ? dayjs(task.deadline).format('YYYY-MM-DDTHH:mm')
                : dayjs().format('YYYY-MM-DDTHH:mm'),
        })
    }, [task, reset])

    const onDrop = (files: File[]) => {
        const file = files[0]
        uploadFile.mutate({ file })
    }
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    if (isLoading || !task) {
        return <CircularProgress sx={{ m: 4 }} />
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                {/* タイトル & ステータス */}
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Typography variant="h4">{task.title}</Typography>
                    <Chip label={taskStatusLabelMap[task.status]} color={taskStatusColorMap[task.status]} />
                </Stack>

                {/* メタ情報 */}
                <Stack direction="row" spacing={4}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>作成日時：</strong> {dayjs(task.createdAt).format('YYYY/MM/DD HH:mm')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>更新日時</strong> {dayjs(task.updatedAt).format('YYYY/MM/DD HH:mm')}
                    </Typography>
                </Stack>
            </Stack>

            {/* タイトル編集 */}
            <Stack direction="row" spacing={1} mb={4}>
                <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="タイトル"
                            size="small"
                            placeholder="タイトルを編集"
                            value={field.value}
                            onChange={field.onChange}
                            fullWidth
                        />
                    )}
                />
            </Stack>
            {/* タスクステータス */}
            <Stack direction="row" spacing={2} mb={3}>
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <FormControl size="small">
                            <InputLabel id="task-status-label">ステータス</InputLabel>
                            <Select
                                {...field}
                                labelId="task-status-label"
                                size="small"
                                label="ステータス"
                                value={String(field.value || TASK_STATUS.NOT_STARTED)}
                                onChange={(e) => field.onChange(e.target.value)}
                                sx={{ minWidth: 240 }}
                            >
                                <MenuItem value={String(TASK_STATUS.NOT_STARTED)}>未着手</MenuItem>
                                <MenuItem value={String(TASK_STATUS.IN_PROGRESS)}>進行中</MenuItem>
                                <MenuItem value={String(TASK_STATUS.COMPLETED)}>完了</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                />
            </Stack>

            {/* 期限 */}
            <Stack direction="row" spacing={2} mb={3}>
                <Controller
                    name="deadline"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            size="small"
                            type="datetime-local"
                            label="期限"
                            value={field.value}
                            onChange={field.onChange}
                            sx={{ minWidth: 240 }}
                        />
                    )}
                />
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* 添付ファイル一覧 */}
            <Typography variant="h6" gutterBottom>
                添付ファイル
            </Typography>
            <Stack gap={1}>
                {task.attachments?.map((attachment) => (
                    <Attachment key={attachment.id} {...attachment} />
                ))}
                {task.attachments?.length === 0 && (
                    <Typography color="text.secondary">添付ファイルはありません</Typography>
                )}
            </Stack>

            {/* ファイルアップロード */}
            <Box
                {...getRootProps()}
                sx={{
                    p: 4,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'divider',
                    textAlign: 'center',
                    borderRadius: 2,
                    marginY: 3,
                    cursor: 'pointer',
                }}
            >
                <input {...getInputProps()} />
                {isDragActive
                    ? 'ここにファイルをドロップしてください'
                    : 'ここにファイルをドラッグ＆ドロップ、またはクリックして選択'}
            </Box>
        </Container>
    )
}

function Attachment(props: AttachmentInDto) {
    const { id, filename } = props
    const downloadFile = useAtomValue(downloadFileMutationAtomFamily(id))

    return (
        <Button
            startIcon={<DownloadIcon />}
            onClick={async () => {
                const res = await downloadFile.mutateAsync()
                window.open(res.url, '_blank', 'noopener')
            }}
        >
            {filename}
        </Button>
    )
}

const taskStatusLabelMap = {
    NOT_STARTED: '未着手',
    IN_PROGRESS: '進行中',
    COMPLETED: '完了',
} as const

const taskStatusColorMap = {
    NOT_STARTED: 'default',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
} as const
