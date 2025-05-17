import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function resolvePath(path: string): string {
    return new URL(path, import.meta.url).pathname
}

export default defineConfig({
    plugins: [TanStackRouterVite({ target: 'react', autoCodeSplitting: true }), react()],
    resolve: {
        alias: {
            src: resolvePath('./src/'),
        },
    },
})
