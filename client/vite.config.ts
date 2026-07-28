import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['recharts', 'react-is'],
    needsInterop: ['react-is'],
  },
  build: {
    commonjsOptions: {
      include: [/react-is/, /node_modules/],
    },
  },
})
