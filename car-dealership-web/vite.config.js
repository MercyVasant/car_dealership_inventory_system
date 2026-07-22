import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
})