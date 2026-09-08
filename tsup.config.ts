import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/**/*.ts', '!src/trash/**'],
  outDir: 'dist',
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  bundle: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false,
  outExtension: () => ({ js: '.js' })
}))
