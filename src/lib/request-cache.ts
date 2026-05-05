/** 默认缓存时间：30 分钟 */
export const CACHE_TTL = 1800;

/** 长缓存时间：1 小时 */
export const CACHE_TTL_LONG = 3600;

const CACHE_PREFIX = 'fufu-cache:';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * 生成缓存 key，用于 localStorage
 */
function make_key(key: string): string {
  return CACHE_PREFIX + key;
}

/**
 * 从 localStorage 读取缓存，已过期自动清除
 */
export function get_cache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(make_key(key));
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiry) {
      localStorage.removeItem(make_key(key));
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * 写入缓存到 localStorage
 */
export function set_cache<T>(key: string, data: T, ttl_seconds: number): void {
  const entry: CacheEntry<T> = {
    data,
    expiry: Date.now() + ttl_seconds * 1000,
  };
  try {
    localStorage.setItem(make_key(key), JSON.stringify(entry));
  } catch {
    // localStorage 已满或不可用，静默忽略
  }
}

/**
 * 清除缓存，可选按路径前缀过滤
 */
export function clear_cache(pattern?: string): void {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith(CACHE_PREFIX)) {
      if (!pattern || key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    }
  }
}
