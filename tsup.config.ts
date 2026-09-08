import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/**/*.ts'],
  outDir: 'dist',
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  bundle: false,
  splitting: false,
  sourcemap: true,
  clean: false,
  dts: false,
  outExtension: () => ({ js: '.js' })
}))
