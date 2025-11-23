import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/yandex': {
        target: 'https://llm.api.cloud.yandex.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yandex/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward Authorization header from client
            const authHeader = req.headers['x-yandex-api-key']
            if (authHeader) {
              proxyReq.setHeader('Authorization', `Api-Key ${authHeader}`)
            }
          })
        }
      }
    }
  }
})

