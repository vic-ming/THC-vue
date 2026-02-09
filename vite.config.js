import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    proxy: {
      '/storage': {
        target: 'https://honchuan.vjinc.biz',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://honchuan.vjinc.biz',
        changeOrigin: true,
      }
    }
  }
})
