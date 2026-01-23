import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.ts', 'tests/**/*.js'],
    coverage: {
      enabled: true,
      include: ['src/**/*.ts', 'tests/**/*.ts', 'tests/**/*.js'],
      exclude: ['**/*.test.ts'],
      reporter: ['text', 'html'],
    },
  },
})
