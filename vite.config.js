import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Stamped at build time so the About tab's "Last Updated" is always
    // accurate without needing to hand-edit a date string on every change.
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },
})
