import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { resolve } from 'path'
import crypto from 'crypto'
import type { Plugin } from 'vite'

const BAIDU_API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

function baiduTranslatePlugin(): Plugin {
  return {
    name: 'baidu-translate',
    configureServer(server) {
      server.middlewares.use('/api/baidu-translate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const appid = process.env.BAIDU_TRANSLATION_APP_ID;
        const key = process.env.BAIDU_TRANSLATION_APP_KEY;

        if (!appid || !key) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: '百度翻译 API 未配置' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', async () => {
          try {
            const { q } = JSON.parse(body);
            if (!q) {
              res.statusCode = 400;
              res.end('Missing q parameter');
              return;
            }

            const salt = Date.now().toString();
            const sign = crypto
              .createHash('md5')
              .update(appid + q + salt + key)
              .digest('hex');

            const params = new URLSearchParams({
              q,
              from: 'zh',
              to: 'en',
              appid,
              salt,
              sign,
            });

            const response = await fetch(BAIDU_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: params.toString(),
            });

            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: (e as Error).message }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    baiduTranslatePlugin(),
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api/bangumi': {
        target: 'https://api.bgm.tv',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bangumi/, ''),
      },
    },
  },
})
