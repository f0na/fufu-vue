/**
 * Umami 分析追踪
 * 向 analytics.fufu.moe 发送页面浏览数据
 */
const UMAMI_URL = 'https://analytics.fufu.moe';
const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

let loaded = false;

export function use_umami() {
  if (!WEBSITE_ID) return;

  if (loaded) return;
  loaded = true;

  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = `${UMAMI_URL}/script.js`;
  script.setAttribute('data-website-id', WEBSITE_ID);
  script.setAttribute('data-auto-track', 'true');
  script.setAttribute('data-domains', import.meta.env.VITE_UMAMI_DOMAINS || '');
  document.head.appendChild(script);
}
