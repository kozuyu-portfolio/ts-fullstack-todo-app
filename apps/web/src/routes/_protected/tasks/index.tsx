import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import { Box, Button, Container, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { TaskResponseDto } from '@ts-fullstack-todo/api-client'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { createTaskMutationAtom, filterAtom, updateTaskMutationAtomFamily, visibleTasksAtom } from '../../../store/task'

import { createFileRoute } from '@tanstack/react-router'
import { Link } from 'src/components/Link'

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
                <ToggleButton value="todo">
                    <ClearIcon fontSize="small" /> Todo
                </ToggleButton>
                <ToggleButton value="done">
                    <CheckIcon fontSize="small" /> Done
                </ToggleButton>
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
    const { id, title, isDone } = props
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
            onClick={() => updateTask.mutate({ body: { isDone: !isDone } })}
        >
            <Link
                to={'/tasks/$taskId'}
                params={{
                    taskId: id.toString(),
                }}
            >
                {title}
            </Link>
            {isDone && <CheckIcon color="success" />}
        </Box>
    )
}
