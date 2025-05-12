import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config';

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        root: '.',
        setupFiles: ['./vitest.setup.ts'],
        include: ['test/**/*.spec.ts'],
        exclude: ['test/**/*.e2e.spec.ts'],
        coverage: {
            reporter: ['text', 'html'],
            all: true,
            exclude: ['dist/**', 'test/**'],
        },
    },
    plugins: [
        swc.vite({
            module: { type: 'es6' },
        }),
    ],
});