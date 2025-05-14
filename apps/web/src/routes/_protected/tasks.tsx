import { Box, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/tasks')({
    component: Tasks,
})

function Tasks() {
    return (
        <Box padding={4}>
            <Typography variant="body1">認証済みです</Typography>
        </Box>
    )
}
