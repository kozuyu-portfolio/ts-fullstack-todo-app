import CheckIcon from '@mui/icons-material/Check'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import { Box, Button, Container, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { TaskResponseDto } from '@ts-fullstack-todo/api-client'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { createTaskMutationAtom, filterAtom, updateTaskMutationAtomFamily, visibleTasksAtom } from '../../../store/task'

import { createFileRoute } from '@tanstack/react-router'
import { Link } from 'src/components/Link'
import { TASK_STATUS, TaskStatus } from 'src/task-status'

export const Route = createFileRoute('/_protected/tasks/')({
    component: TaskListPage,
})

export function TaskListPage() {
    const [filter, setFilter] = useAtom(filterAtom)
    const [tasks] = useAtom(visibleTasksAtom)
    const createTask = useAtomValue(createTaskMutationAtom)
    const [newTitle, setNewTitle] = useState('')

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" mb={2}>
                タスク一覧
            </Typography>

            {/* 新規追加 */}
            <Stack direction="row" gap={1} mb={3}>
                <TextField
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    size="small"
                    placeholder="新しいタスク"
                    fullWidth
                />
                <Button
                    variant="contained"
                    disabled={!newTitle}
                    onClick={() => {
                        createTask.mutate({ title: newTitle })
                        setNewTitle('')
                    }}
                >
                    追加
                </Button>
            </Stack>

            {/* フィルター */}
            <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={(_, v) => v && setFilter(v)}
                color="primary"
                sx={{ mb: 2 }}
            >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value={String(TASK_STATUS.NOT_STARTED)}>未着手</ToggleButton>
                <ToggleButton value={String(TASK_STATUS.IN_PROGRESS)}>進行中</ToggleButton>
                <ToggleButton value={String(TASK_STATUS.COMPLETED)}>完了</ToggleButton>
            </ToggleButtonGroup>

            {/* 一覧 */}
            <Stack gap={1}>
                {tasks.map((t) => (
                    <Task key={t.id} {...t} />
                ))}
                {tasks.length === 0 && <Typography color="text.secondary">タスクがありません</Typography>}
            </Stack>
        </Container>
    )
}

function Task(props: TaskResponseDto) {
    const { id, title, status } = props
    const updateTask = useAtomValue(updateTaskMutationAtomFamily(id))
    return (
        <Box
            key={id}
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
            }}
            onClick={() => {
                const nextStatusMap: Record<string, TaskStatus> = {
                    [TASK_STATUS.NOT_STARTED as string]: TASK_STATUS.IN_PROGRESS,
                    [TASK_STATUS.IN_PROGRESS as string]: TASK_STATUS.COMPLETED,
                    [TASK_STATUS.COMPLETED as string]: TASK_STATUS.NOT_STARTED,
                }
                updateTask.mutate({ body: { status: nextStatusMap[status] } })
            }}
        >
            <Link
                to={'/tasks/$taskId'}
                params={{
                    taskId: id.toString(),
                }}
            >
                {title}
            </Link>
            {status === TASK_STATUS.COMPLETED && <CheckIcon color="success" />}
            {status === TASK_STATUS.IN_PROGRESS && <TimelapseIcon color="warning" />}
        </Box>
    )
}
