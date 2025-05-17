import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../../apps/api/swagger.json',
  output: {
    format: 'biome',
    lint: 'biome',
    path: './src'
  },
  plugins: ['@hey-api/client-axios'],
});
