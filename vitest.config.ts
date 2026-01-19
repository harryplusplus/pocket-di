import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['dist/**/*.test.js'],
    coverage: {
      enabled: true,
      include: ['dist/**/*.js'],
      exclude: ['**/*.test.js'],
      reporter: ['text', 'html', 'lcovonly'],
    },
  },
})
