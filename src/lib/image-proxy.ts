/**
 * 图片加速代理
 *
 * 将 GitHub raw 图片链接改写为通过国内可快速访问的 CDN 加载。
 *
 * 使用方式（三选一）：
 *   1. jsDelivr — VITE_IMAGE_PROXY_BASE=jsdelivr
 *   2. 自定义前缀代理 — VITE_IMAGE_PROXY_BASE=https://你的代理域名/
 *   3. 不配置 — 直连 GitHub raw
 *
 * jsDelivr 示例：
 *   原始: https://raw.githubusercontent.com/f0na/fufu-vue/main/content/imgs/xxx.png
 *   结果: https://cdn.jsdelivr.net/gh/f0na/fufu-vue@main/content/imgs/xxx.png
 */

const GITHUB_RAW_RE = /^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/i;

export function proxy_image_url(url: string): string {
  if (!url) return url;

  const proxy = import.meta.env.VITE_IMAGE_PROXY_BASE;
  if (!proxy) return url;

  const match = url.match(GITHUB_RAW_RE);
  if (!match) return url;

  const [, owner, repo, branch, path] = match;

  // jsDelivr 模式 — 最推荐，免费且国内速度快
  if (proxy === 'jsdelivr') {
    return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`;
  }

  // 通用前缀代理（如自定义 CDN 或 Cloudflare Transform Rule）
  const separator = proxy.endsWith('/') ? '' : '/';
  return `${proxy}${separator}${owner}/${repo}/${branch}/${path}`;
}
