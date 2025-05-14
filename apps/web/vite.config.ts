import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

function resolvePath(path: string): string {
  return new URL(path, import.meta.url).pathname
}

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react()],
  resolve: {
    alias: {
      src: resolvePath('./src/'),
    },
  },
});