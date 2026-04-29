import MarkdownIt from 'markdown-it';
import mdEmoji from 'markdown-it-emoji/lib/light.mjs';
import mdFootnote from 'markdown-it-footnote';
import mdSub from 'markdown-it-sub';
import mdSup from 'markdown-it-sup';
import { codeToHtml } from 'shiki';
import mermaid from 'mermaid';
import katex from 'katex';
import taskLists from 'markdown-it-task-lists';
import type { TocHeading } from '@/components/post/post-toc.vue';

// Mermaid 初始化
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  timeline: {
    disableMulticolor: false,
    useMaxWidth: true,
  },
});

interface RenderResult {
  html: string;
  headings: TocHeading[];
}

// 提取数学公式，避免被 markdown 处理
interface MathBlock {
  placeholder: string;
  raw: string;
  display: boolean;
}

function extract_math(text: string): { text: string; math_blocks: MathBlock[] } {
  const math_blocks: MathBlock[] = [];

  // 块级公式 $$...$$
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const idx = math_blocks.length;
    math_blocks.push({ placeholder: `%%MATH_${idx}%%`, raw: math.trim(), display: true });
    return `%%MATH_${idx}%%`;
  });

  // 行内公式 $...$ (排除普通价格 $5)
  result = result.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (_, math) => {
    if (/[=\\{}_^ ]/.test(math)) {
      const idx = math_blocks.length;
      math_blocks.push({ placeholder: `%%MATH_${idx}%%`, raw: math.trim(), display: false });
      return `%%MATH_${idx}%%`;
    }
    return `\$${math}\$`;
  });

  return { text: result, math_blocks };
}

function render_math_with_katex(html: string, math_blocks: MathBlock[]): string {
  for (const block of math_blocks) {
    try {
      const rendered = block.display
        ? `<div class="katex-block my-4 overflow-x-auto">${katex.renderToString(block.raw, { displayMode: true, throwOnError: false })}</div>`
        : katex.renderToString(block.raw, { displayMode: false, throwOnError: false });
      html = html.replace(block.placeholder, rendered);
    } catch {
      html = html.replace(block.placeholder, `<code class="katex-fallback">${block.raw}</code>`);
    }
  }
  return html;
}

function create_md() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  md.use(mdEmoji);
  md.use(mdFootnote);
  md.use(mdSub);
  md.use(mdSup);

  md.use(taskLists, { enabled: false });

  // 启用 strikethrough (默认已启用)
  md.enable(['strikethrough']);

  // 代码块高亮 - Shiki
  md.renderer.rules.fence = (tokens, idx, _options, _env, _self) => {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    const lang = info.split(/\s+/)[0] || 'text';
    const code = token.content;

    if (lang === 'mermaid') {
      const encoded = btoa(unescape(encodeURIComponent(code)));
      return `<div class="mermaid-block my-4" data-code="${encoded}"><pre class="mermaid-placeholder overflow-x-auto rounded-lg bg-muted p-4 text-sm text-muted-foreground">Mermaid diagram loading...</pre></div>`;
    }

    // 使用 Shiki 渲染代码块
    const id = `code-${idx}-${Date.now()}`;
    return `<div class="code-block-wrapper relative group my-4" data-code-lang="${lang}" data-code-id="${id}" data-code-raw="${btoa(unescape(encodeURIComponent(code)))}"><pre class="shiki-placeholder overflow-x-auto rounded-lg bg-muted p-4 text-sm text-muted-foreground">Loading code...</pre><button class="code-copy-btn absolute top-3 right-3 z-10 px-2 py-1 text-xs rounded-md transition-all bg-background/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100" onclick="copyCode(this, '${id}')">复制</button></div>`;
  };

  // 标题添加 id
  const default_heading_open = md.renderer.rules.heading_open?.bind(md.renderer.rules);
  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const next = tokens[idx + 1];
    if (next && next.type === 'inline') {
      const text = next.content;
      const id = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      token.attrSet('id', id);
    }
    return default_heading_open
      ? default_heading_open(tokens, idx, options, env, self)
      : md.renderer.renderToken(tokens, idx, options);
  };

  // 图片尺寸解析
  const default_image = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    // markdown-it 图片 alt 文本存储在 token.content 中
    const alt = token.content || '';
    // 支持 =200x150、=200x、=x150、=200 四种格式
    const size_match = alt.match(/=(\d+)?x(\d+)?$/) || alt.match(/=(\d+)$/);

    if (size_match) {
      const width = size_match[1] || size_match[3] || '';
      const height = size_match[2] || '';
      const clean_alt = alt.replace(size_match[0], '').trim();

      token.content = clean_alt;
      if (width) token.attrSet('width', width);
      if (height) token.attrSet('height', height);
    }

    // 添加 lazy loading
    if (token.attrs) {
      const has_loading = token.attrs.some(([a]) => a === 'loading');
      if (!has_loading) token.attrSet('loading', 'lazy');
    }

    return default_image
      ? default_image(tokens, idx, options, env, self)
      : md.renderer.renderToken(tokens, idx, options);
  };

  return md;
}

const md_instance = create_md();

// 异步处理代码块和 Mermaid
export async function post_process_rendered(container: HTMLElement): Promise<void> {
  // Shiki 代码块处理
  const code_blocks = container.querySelectorAll('.code-block-wrapper');
  for (const block of code_blocks) {
    const raw = block.getAttribute('data-code-raw');
    const lang = block.getAttribute('data-code-lang') || 'text';
    if (!raw) continue;

    try {
      const decoded = decodeURIComponent(escape(atob(raw)));
      const html = await codeToHtml(decoded, {
        lang,
        theme: 'github-light',
      });
      const placeholder = block.querySelector('.shiki-placeholder');
      if (placeholder) {
        placeholder.outerHTML = `<div class="shiki-wrapper overflow-x-auto rounded-lg bg-muted p-4"><div class="shiki text-sm min-w-full" style="display: inline-block">${html}</div></div>`;
      }
    } catch {
      // Shiki 渲染失败，保留占位
    }
  }

  // Mermaid 图表处理
  const mermaid_blocks = container.querySelectorAll('.mermaid-block');
  for (const block of mermaid_blocks) {
    const code_raw = block.getAttribute('data-code');
    if (!code_raw) continue;

    try {
      const code = decodeURIComponent(escape(atob(code_raw)));
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const { svg } = await mermaid.render(id, code);
      block.innerHTML = `<div class="mermaid-container my-4 overflow-x-auto rounded-lg bg-muted/50 p-4">${svg}</div>`;
    } catch {
      const code = decodeURIComponent(escape(atob(code_raw)));
      block.innerHTML = `<pre class="overflow-x-auto rounded-lg bg-muted p-4 text-sm text-muted-foreground">${code}</pre>`;
    }
  }
}

// 提取标题
function extract_headings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    headings.push({ level, text, id });
  }

  return headings;
}

// 去除 frontmatter
function strip_frontmatter(content: string): string {
  return content.replace(/^---[\s\S]*?---\s*/, '');
}

// 渲染 Markdown
export function render_markdown(content: string): RenderResult {
  const body = strip_frontmatter(content);
  const { text: extracted_text, math_blocks } = extract_math(body);
  const rendered = md_instance.render(extracted_text);
  const html = render_math_with_katex(rendered, math_blocks);
  const headings = extract_headings(body);

  return { html, headings };
}

// 全局复制函数（挂到 window）
declare global {
  interface Window {
    copyCode: (btn: HTMLButtonElement, _id: string) => void;
  }
}

export function setup_copy_handler() {
  if (typeof window !== 'undefined') {
    window.copyCode = function (btn: HTMLButtonElement, _id: string) {
      const wrapper = btn.closest('.code-block-wrapper');
      if (!wrapper) return;
      const raw = wrapper.getAttribute('data-code-raw');
      if (!raw) return;
      const code = decodeURIComponent(escape(atob(raw)));
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '已复制';
        setTimeout(() => {
          btn.textContent = '复制';
        }, 2000);
      });
    };
  }
}
