import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Where the site lives. "/" locally; the GitHub Pages workflow sets BASE_PATH=/WEBSITE/
  base: process.env.BASE_PATH || '/',
  // Another project on this machine uses 5173, so this site always runs on 5174.
  server: { port: 5174, strictPort: true },
})
