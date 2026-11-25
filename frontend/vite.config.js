import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const localApi = {
  name: 'linq-local-api',
  apply: 'serve',
  configureServer(server) {
    const settings = loadEnv(server.config.mode, server.config.envDir, '');
    for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY',
      'ADMIN_ENVIRONMENT', 'RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET', 'SUPPORT_INBOUND_ADDRESS',
      'RESEND_SEND_API_KEY', 'SUPPORT_FROM_ADDRESS', 'SUPPORT_REPLY_TO_ADDRESS',
      'DASHBOARD_SUPPORT_REPLIES', 'DASHBOARD_REPORT_ENFORCEMENT']) {
      if (settings[key]) process.env[key] = settings[key];
    }
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (!['/api/admin', '/api/support-inbound'].includes(url.pathname)) return next();
      try {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 300_000) {
            res.writeHead(413);
            return res.end();
          }
          chunks.push(chunk);
        }
        const request = new Request(url, {
          method: req.method,
          headers: req.headers,
          body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
        });
        const handler = url.pathname === '/api/admin'
          ? (await import('./api/admin.js')).default
          : (await import('./api/support-inbound.js')).default;
        const response = await handler.fetch(request);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (error) {
        next(error);
      }
    });
  },
};

function configureAdminEntry(server) {
  server.middlewares.use((req, _res, next) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (/^\/admin(?:\/|$)/.test(url.pathname)) {
      req.url = '/admin/index.html' + url.search;
    }
    next();
  });
}

const adminEntry = {
  name: 'linq-admin-entry',
  configureServer: configureAdminEntry,
  configurePreviewServer: configureAdminEntry,
};

export default defineConfig({
  plugins: [react(), localApi, adminEntry],
  build: {
    rolldownOptions: {
      input: ['index.html', 'admin/index.html', 'privacy/index.html', 'terms/index.html', 'support/index.html'].map(
        entry => resolve(import.meta.dirname, entry),
      ),
    },
  },
  server: { host: '127.0.0.1', strictPort: true },
});
