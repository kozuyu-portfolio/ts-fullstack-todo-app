import { RouterProvider, createRouter } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { CssBaseline, ThemeProvider } from '@mui/material'
import { OpenAPI } from '@ts-fullstack-todo/api-client'
import { routeTree } from './routeTree.gen'
import { theme } from './theme'

OpenAPI.BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
OpenAPI.WITH_CREDENTIALS = true
OpenAPI.TOKEN = () => Promise.resolve(localStorage.getItem('token') ?? '')

const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const container = document.getElementById('root')
if (!container) {
    throw new Error('Root element not found')
}
ReactDOM.createRoot(container).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <RouterProvider router={router} />
        </ThemeProvider>
    </React.StrictMode>,
)
