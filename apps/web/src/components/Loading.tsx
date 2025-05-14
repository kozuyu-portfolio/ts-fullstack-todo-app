import { Box, type BoxProps, CircularProgress } from '@mui/material'

export function Loading({ sx, ...props }: BoxProps) {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100dvh',
                maxHeight: '100%',
                display: 'grid',
                placeItems: 'center',
                ...sx,
            }}
            {...props}
        >
            <CircularProgress />
        </Box>
    )
}
