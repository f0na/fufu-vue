/**
 * 文章编辑状态管理
 */
import { ref, computed } from 'vue'
import type { PostDetail, PostStatus, PostTocItem } from '@/api/types'

// 编辑模式
export type PostEditMode = 'none' | 'add' | 'edit' | 'delete' | 'status' | 'top'

// 编辑模式状态
const edit_mode = ref<PostEditMode>('none')

// 当前编辑的文章 ID
const editing_id = ref<string | null>(null)

// 编辑表单数据
const form_data = ref({
  title: '',
  slug: '',
  summary: '',
  content: '',
  cover: '',
  tags: [] as string[],
  category: '',
  status: 'draft' as PostStatus,
  top: false,
  comment_allowed: true,
})

// 预览模式
const is_preview = ref(false)

// Slug 正在生成
const slug_generating = ref(false)

// 设置编辑模式
function set_edit_mode(mode: PostEditMode, post?: PostDetail) {
  edit_mode.value = mode
  if (mode === 'add') {
    reset_form()
  } else if (mode === 'edit' && post) {
    editing_id.value = post.id
    form_data.value = {
      title: post.title,
      slug: post.slug,
      summary: post.summary || '',
      content: post.content,
      cover: post.cover || '',
      tags: post.tags,
      category: post.category || '',
      status: post.status,
      top: post.top,
      comment_allowed: post.comment_allowed,
    }
  }
  is_preview.value = false
}

// 重置编辑模式
function reset_edit_mode() {
  edit_mode.value = 'none'
  editing_id.value = null
  reset_form()
  is_preview.value = false
}

// 重置表单
function reset_form() {
  form_data.value = {
    title: '',
    slug: '',
    summary: '',
    content: '',
    cover: '',
    tags: [],
    category: '',
    status: 'draft',
    top: false,
    comment_allowed: true,
  }
}

// 切换预览模式
function toggle_preview() {
  is_preview.value = !is_preview.value
}

// 将标题文本转为 slug ID（与 markdown 渲染器保持一致）
function heading_to_slug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // 空格转连字符
    .replace(/[^\w\u4e00-\u9fa5-]/g, '') // 移除非字母数字和中文的字符
}

// 从 Markdown 内容提取标题生成目录
const toc = computed<PostTocItem[]>(() => {
  const content = form_data.value.content
  if (!content) return []

  const lines = content.split('\n')
  const headings: { id: string; text: string; level: number }[] = []
  const slug_counts: Map<string, number> = new Map() // 用于处理重复标题

  lines.forEach((line) => {
    // 去除行尾的 \r（Monaco 编辑器使用 \r\n 换行）
    const clean_line = line.replace(/\r$/, '')
    const match = clean_line.match(/^(#{1,6})\s+(.+)$/)
    if (match && match[1] && match[2]) {
      const level = match[1].length
      const text = match[2].trim()
      const base_slug = heading_to_slug(text)

      // 处理重复标题
      const count = slug_counts.get(base_slug) || 0
      slug_counts.set(base_slug, count + 1)
      const id = count > 0 ? `${base_slug}-${count}` : base_slug

      headings.push({ id, text, level })
    }
  })

  // 构建树形结构
  const root: PostTocItem[] = []
  const stack: PostTocItem[] = []

  headings.forEach((h) => {
    const item: PostTocItem = { id: h.id, text: h.text, level: h.level, children: [] }

    // 找到合适的位置插入
    while (stack.length > 0 && stack[stack.length - 1]!.level >= h.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      root.push(item)
    } else {
      stack[stack.length - 1]!.children.push(item)
    }

    stack.push(item)
  })

  return root
})

// 添加标签
function add_tag(tag: string) {
  if (tag && !form_data.value.tags.includes(tag)) {
    form_data.value.tags.push(tag)
  }
}

// 移除标签
function remove_tag(tag: string) {
  form_data.value.tags = form_data.value.tags.filter((t) => t !== tag)
}

// 导入 Markdown 文件
async function import_markdown_file(file: File): Promise<boolean> {
  if (!file.name.endsWith('.md')) {
    return false
  }

  try {
    const content = await file.text()

    // 提取第一个标题作为文章标题
    const title_match = content.match(/^#\s+(.+)$/m)
    if (title_match && title_match[1]) {
      form_data.value.title = title_match[1].trim()
    }

    // 从文件名提取 slug（去除 .md 后缀）
    const filename_slug = file.name.replace('.md', '').toLowerCase().replace(/\s+/g, '-')
    if (!form_data.value.slug) {
      form_data.value.slug = filename_slug
    }

    form_data.value.content = content
    return true
  } catch {
    return false
  }
}

// 使用 pinyin-pro 生成 slug（降级方案）
async function generate_slug_pinyin(title: string): Promise<string> {
  // 动态导入 pinyin-pro
  try {
    const { pinyin } = await import('pinyin-pro')
    const result = pinyin(title, { toneType: 'none', type: 'array' })
    const slug = result.join('-').toLowerCase().replace(/[^\w-]/g, '')
    return slug
  } catch {
    // 如果导入失败，返回时间戳作为降级
    return `post-${Date.now()}`
  }
}

// 使用百度翻译 API 生成 slug（通过后端代理）
async function generate_slug_baidu(title: string): Promise<string | null> {
  try {
    // 通过后端代理调用百度翻译 API
    const { post } = await import('@/api/request')
    const result = await post<{ translated: string }>('/admin/translate', { text: title })

    if (result.translated) {
      // 转为 slug 格式
      const slug = result.translated.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      return slug
    }

    return null
  } catch (e) {
    console.error('翻译接口调用失败:', e)
    return null
  }
}

// 生成 slug（优先百度翻译，降级拼音）
async function generate_slug(): Promise<string> {
  if (!form_data.value.title) {
    return ''
  }

  slug_generating.value = true

  try {
    // 尝试百度翻译
    const baidu_slug = await generate_slug_baidu(form_data.value.title)
    if (baidu_slug) {
      form_data.value.slug = baidu_slug
      return baidu_slug
    }

    // 降级到拼音
    const pinyin_slug = await generate_slug_pinyin(form_data.value.title)
    form_data.value.slug = pinyin_slug
    return pinyin_slug
  } finally {
    slug_generating.value = false
  }
}

export function usePostEdit() {
  return {
    edit_mode,
    editing_id,
    form_data,
    is_preview,
    slug_generating,
    toc,
    set_edit_mode,
    reset_edit_mode,
    reset_form,
    toggle_preview,
    add_tag,
    remove_tag,
    import_markdown_file,
    generate_slug,
  }
}