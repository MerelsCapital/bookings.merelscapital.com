import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',                    // allows all network interfaces
    port: 5173,
    allowedHosts: ['bookings.merelscapital.com', 'api.merelscapital.com'],  // ← THIS WHITELISTS YOUR DOMAINS
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})