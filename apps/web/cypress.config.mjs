import { defineConfig } from 'cypress'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',
        env: {
            apiUrl: 'http://localhost:3000',
        },
        supportFile: false,
        video: false,
        screenshotOnRunFailure: false,
    },
})
