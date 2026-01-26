import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.*'],
    coverage: {
      enabled: true,
      include: ['src/**/*.ts'],
      reporter: ['text', 'html'],
      thresholds: { '100': true },
    },
  },
})
