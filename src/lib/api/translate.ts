import { api } from '@/lib/api-client';

interface BaiduTranslateResult {
  from: string;
  to: string;
  trans_result: Array<{ src: string; dst: string }>;
}

export function translate_text(text: string, from = 'auto', to = 'en') {
  return api.post<BaiduTranslateResult>('/api/translate', { text, from, to });
}
