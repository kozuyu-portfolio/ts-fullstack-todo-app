import { Box, Stack, Typography } from '@mui/material'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { Suspense, createContext } from 'react'
import logo from 'src/vite.svg'
import { Header } from 'src/components/Header'
import { Link } from 'src/components/Link'
import { Loading } from 'src/components/Loading'

export const SidebarStateContext = createContext({ sideBarExpanded: false, canViewViewer: false })

export const Route = createFileRoute('/_public')({
    component: Public,
    loader: () => {
        if (localStorage.getItem('token')) {
            throw redirect({ to: '/tasks' })
        }
    },
})

function Public() {
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
            </Header>
            <Suspense fallback={<Loading />}>
                <Outlet />
            </Suspense>
        </Box>
    )
}
