import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['dist/tests/**/*.test.*'],
    coverage: {
      enabled: true,
      include: ['dist/src/**/*.js'],
      reporter: ['text', 'html', 'lcovonly'],
      thresholds: { '100': true },
    },
  },
})
