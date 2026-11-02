import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { isKnownRouteAsync } from './route-allowlist.mjs'

// Dev-only: mirrors what middleware.js does on Vercel, so `npm run dev` reports
// the same 200/404 status as production for a quick local check (e.g. hitting
// http://localhost:5173/english should show 404 in the Network tab here too).
// This has no effect on the production build — it only patches the dev server.
function devRouteStatusPlugin() {
  return {
    name: 'dev-route-status',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '/').split('?')[0]
        const hasExtension = /\.[a-zA-Z0-9]+$/.test(pathname)
        const isViteInternal = pathname.startsWith('/@') || pathname.startsWith('/src/') || pathname.startsWith('/node_modules/')

        if (!hasExtension && !isViteInternal && !(await isKnownRouteAsync(pathname))) {
          res.statusCode = 404
        }
        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devRouteStatusPlugin()],
})