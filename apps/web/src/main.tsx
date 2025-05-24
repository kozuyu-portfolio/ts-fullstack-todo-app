import { RouterProvider, createRouter } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { CssBaseline, ThemeProvider } from '@mui/material'
import { useAtom } from 'jotai'
import { routeTree } from './routeTree.gen'
import { themeModeAtom } from './store/theme'
import { theme } from './theme'

const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

function WithTheme() {
    const [mode] = useAtom(themeModeAtom)
    return (
        <ThemeProvider theme={theme(mode)}>
            <CssBaseline />
            <RouterProvider router={router} />
        </ThemeProvider>
    )
}

const container = document.getElementById('root')
if (!container) {
    throw new Error('Root element not found')
}
ReactDOM.createRoot(container).render(
    <React.StrictMode>
        <WithTheme />
    </React.StrictMode>,
)
