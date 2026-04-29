/**
 * Cloudflare Workers Bangumi API Proxy
 *
 * 部署方式:
 * 1. wrangler deploy --name bangumi-proxy
 * 2. 在 Cloudflare Dashboard 中添加路由规则: yourdomain.com/api/bangumi/*
 *
 * 环境变量 (通过 wrangler secret 设置):
 * - BANGUMI_API_BASE: Bangumi API 基础地址，默认 https://api.bgm.tv
 */

interface Env {
  BANGUMI_API_BASE?: string;
}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const api_base = _env.BANGUMI_API_BASE || 'https://api.bgm.tv';

    // 获取 path 查询参数
    const path = url.searchParams.get('path') || '';

    // 构建目标 URL
    const target_url = `${api_base}/${path}`;

    // 复制其余查询参数
    const search_params = new URLSearchParams(url.search);
    search_params.delete('path');
    const query = search_params.toString();
    const final_url = query ? `${target_url}?${query}` : target_url;

    try {
      const response = await fetch(final_url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'fufu-next/1.0',
        },
        body: request.method === 'POST' ? await request.text() : undefined,
      });

      const data = await response.text();

      return new Response(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
