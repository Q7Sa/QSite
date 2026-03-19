import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        slideshow: resolve(__dirname, 'slideshow/index.html'),
      },
    },
  },
  server: {
    // This helps local development with proper routing
    open: true,
  }
})
