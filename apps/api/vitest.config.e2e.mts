import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        root: '.',
        setupFiles: ['./vitest.setup.ts'],
        include: ['test/**/*.e2e.spec.ts'],
        coverage: {
            reporter: ['text', 'html'],
            all: true,
            exclude: ['dist/**', 'test/**', 'vitest.config*.mts'],
        },
    },
    plugins: [
        swc.vite({
            module: { type: 'es6' },
        }),
    ],
})
