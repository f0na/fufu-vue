interface BaiduTranslateResult {
  trans_result: { src: string; dst: string }[];
  error_msg?: string;
}

export async function translate_zh_to_en(text: string): Promise<string> {
  const res = await fetch('/api/baidu-translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text }),
  });

  if (!res.ok) {
    throw new Error(`翻译请求失败: ${res.status}`);
  }

  const data: BaiduTranslateResult = await res.json();

  if (data.error_msg) {
    throw new Error(`百度翻译错误: ${data.error_msg}`);
  }

  const translated = data.trans_result?.[0]?.dst || text;
  return translated;
}

export function text_to_slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
