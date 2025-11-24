import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig(() => {
  console.log("Vite config LOADED!!!")
  return {
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
    },
    {
      name: 'debug-all-requests',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          console.log('DEV SERVER →', req.method, req.url, 'x-yandex-api-key:', req.headers['x-yandex-api-key'])
          next()
        })
      }
    }
  ],
  server: {
    proxy: {
      '/api/yandex-search': {
        target: 'https://searchapi.api.cloud.yandex.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yandex-search/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const authHeader = req.headers['x-yandex-api-key']

            console.log('🔁 PROXY /api/yandex-search → triggered for:', req.url)
            console.log('   incoming x-yandex-api-key:', authHeader)

            if (authHeader) {
              const finalAuth = `Api-Key ${authHeader}`
              proxyReq.setHeader('Authorization', finalAuth)
              console.log('   set Authorization:', finalAuth)
            } else {
              console.log('   NO x-yandex-api-key, Authorization not set')
            }
          })
        }
      },
      '/api/yandex': {
        target: 'https://llm.api.cloud.yandex.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yandex/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const authHeader = req.headers['x-yandex-api-key']

            console.log('🔁 PROXY /api/yandex → triggered for:', req.url)
            console.log('   incoming x-yandex-api-key:', authHeader)

            if (authHeader) {
              const finalAuth = `Api-Key ${authHeader}`
              proxyReq.setHeader('Authorization', finalAuth)
              console.log('   set Authorization:', finalAuth)
            } else {
              console.log('   NO x-yandex-api-key, Authorization not set')
            }
          })
        }
      }
    }
  }
  }
})

