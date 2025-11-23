import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'save-file-middleware',
      configureServer(server) {
        server.middlewares.use('/api/save-file', (req, res, next) => {
          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: Buffer) => {
              body += chunk.toString()
            })
            req.on('end', () => {
              try {
                const { filename, content } = JSON.parse(body)
                const filePath = path.join(process.cwd(), filename)
                fs.writeFileSync(filePath, content, 'utf8')
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: true }))
              } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: String(error) }))
              }
            })
          } else {
            next()
          }
        })
      }
    }
  ],
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

