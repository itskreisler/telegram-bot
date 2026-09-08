import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  bundle: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  outExtension: () => ({ js: '.js' })
})