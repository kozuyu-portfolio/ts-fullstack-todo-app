import { defineConfig } from 'cypress'

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
