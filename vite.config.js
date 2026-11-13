import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Another project on this machine uses 5173, so this site always runs on 5174.
  server: { port: 5174, strictPort: true },
})
