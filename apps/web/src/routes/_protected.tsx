import { Box, Stack, Typography } from '@mui/material'
import { Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { authControllerSignout } from '@ts-fullstack-todo/api-client'
import { Suspense, createContext } from 'react'
import { apiClient } from 'src/api/client'
import { Header } from 'src/components/Header'
import { Link } from 'src/components/Link'
import { Loading } from 'src/components/Loading'
import logo from 'src/vite.svg' // FIXME: use a better logo

export const SidebarStateContext = createContext({ sideBarExpanded: false, canViewViewer: false })

export const Route = createFileRoute('/_protected')({
    component: Protected,
    loader: () => {
        if (!localStorage.getItem('token')) {
            throw redirect({ to: '/login' })
        }
    },
})

function Protected() {
    const navigate = useNavigate()
    return (
        <Box sx={{ display: 'grid', gridTemplateRows: 'min-content minmax(0, 1fr)', height: '100dvh' }}>
            <Header>
                <Link to="/" color="inherit" underline="none" noWrap>
                    <Stack direction="row" spacing={2} alignItems="center" paddingX={2}>
                        <img src={logo} width={32} height={32} alt="logo" />
                        <Typography variant="h1" fontSize={32}>
                            TS Fullstack Todo
                        </Typography>
                    </Stack>
                </Link>

                <Link
                    variant="body1"
                    color="inherit"
                    underline="none"
                    noWrap
                    sx={{ ml: 'auto' }}
                    onClick={async () => {
                        try {
                            await authControllerSignout({ client: apiClient })
                            localStorage.removeItem('token')
                        } catch {
                        } finally {
                            navigate({ to: '/login' })
                        }
                    }}
                >
                    <Box paddingX={2}>ログアウト</Box>
                </Link>
            </Header>
            <Suspense fallback={<Loading />}>
                <Outlet />
            </Suspense>
        </Box>
    )
}
