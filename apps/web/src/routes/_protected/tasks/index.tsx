import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import {
    Box,
    Button,
    Container,
    IconButton,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material'
import { TaskResponseDto } from '@ts-fullstack-todo/api-client'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { createTaskMutationAtom, filterAtom, updateTaskMutationAtomFamily, visibleTasksAtom } from '../../../store/task'

import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
                fullWidth
            >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value={String(TASK_STATUS.NOT_STARTED)}>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <CheckBoxOutlineBlankIcon color="info" />
                        未着手
                    </Stack>
                </ToggleButton>
                <ToggleButton value={String(TASK_STATUS.IN_PROGRESS)}>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <TimelapseIcon color="warning" />
                        進行中
                    </Stack>
                </ToggleButton>
                <ToggleButton value={String(TASK_STATUS.COMPLETED)}>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <CheckBoxIcon color="success" />
                        完了
                    </Stack>
                </ToggleButton>
            </ToggleButtonGroup>

            {/* 一覧 */}
            <Stack>
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
    const navigate = useNavigate()
    const updateTask = useAtomValue(updateTaskMutationAtomFamily(id))
    const handleUpdateStatus = () => {
        const nextStatusMap: Record<string, TaskStatus> = {
            [TASK_STATUS.NOT_STARTED as string]: TASK_STATUS.IN_PROGRESS,
            [TASK_STATUS.IN_PROGRESS as string]: TASK_STATUS.COMPLETED,
            [TASK_STATUS.COMPLETED as string]: TASK_STATUS.NOT_STARTED,
        }
        updateTask.mutate({ body: { status: nextStatusMap[status] } })
    }

    return (
        <Stack
            key={id}
            direction="row"
            spacing={2}
            sx={{
                paddingX: 2,
                marginTop: '-1px',
                border: '1px solid',
                borderColor: 'divider',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 64,
            }}
        >
            <Button onClick={handleUpdateStatus} sx={{ width: 48, cursor: 'pointer' }}>
                {status === TASK_STATUS.NOT_STARTED && <CheckBoxOutlineBlankIcon color="info" />}
                {status === TASK_STATUS.IN_PROGRESS && <TimelapseIcon color="warning" />}
                {status === TASK_STATUS.COMPLETED && <CheckBoxIcon color="success" />}
            </Button>
            <Box
                width="100%"
                height="100%"
                onClick={() => navigate({ to: '/tasks/$taskId', params: { taskId: id.toString() } })}
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
                <Typography variant="body1">{title}</Typography>
            </Box>
        </Stack>
    )
}
