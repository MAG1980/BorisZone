import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { makeOffline } from 'vite-plugin-make-offline'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), makeOffline()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
