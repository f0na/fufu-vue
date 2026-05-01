import * as translate_api from '@/lib/api/translate';

export async function translate_zh_to_en(text: string): Promise<string> {
  const data = await translate_api.translate_text(text);
  return data.trans_result?.[0]?.dst || text;
}

export function text_to_slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
