<script setup lang="ts">
import { ref, computed } from 'vue'
import { apply_friend } from '@/api/friend'
import { useToast } from '@/composables/useToast'
import { useFriendsFilter } from '@/composables/useFriendsFilter'
import { Search, Plus, X, AlertCircle } from 'lucide-vue-next'

const { success, error } = useToast()
const { search_query } = useFriendsFilter()

// 申请表单模态框
const show_apply_modal = ref(false)
const apply_loading = ref(false)
const apply_form = ref({
  name: '',
  url: '',
  description: '',
})

// 图标加载失败状态
const icon_load_error = ref(false)

// 格式化 URL（补全协议前缀）
function normalize_url(url: string): string {
  let normalized = url.trim()
  if (!normalized) return ''
  // 如果没有协议前缀，补上 https://
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized
  }
  return normalized
}

// 根据链接获取网站图标 URL
const preview_icon_url = computed(() => {
  const normalized = normalize_url(apply_form.value.url)
  if (!normalized) return ''
  try {
    const domain = new URL(normalized).hostname
    return `https://favicon.im/${domain}?icon=icon`
  } catch {
    return ''
  }
})

// 是否显示图标预览
const show_icon_preview = computed(() => {
  return preview_icon_url.value !== '' && !icon_load_error.value
})

// 是否显示加载失败提示（URL 有效但图标加载失败）
const show_icon_error = computed(() => {
  const normalized = normalize_url(apply_form.value.url)
  return normalized !== '' && icon_load_error.value
})

// 监听 URL 变化，重置图标错误状态
function on_url_change() {
  icon_load_error.value = false
}

// 图标加载失败
function on_icon_error() {
  icon_load_error.value = true
}

function open_apply_modal() {
  show_apply_modal.value = true
  icon_load_error.value = false
}

function close_apply_modal() {
  show_apply_modal.value = false
  apply_form.value = { name: '', url: '', description: '' }
  icon_load_error.value = false
}

async function submit_apply() {
  if (!apply_form.value.name.trim() || !apply_form.value.url.trim()) {
    error('请填写站点名称和链接')
    return
  }

  apply_loading.value = true
  try {
    await apply_friend({
      name: apply_form.value.name.trim(),
      url: apply_form.value.url.trim(),
      description: apply_form.value.description.trim() || undefined,
    })
    success('申请已提交，等待审核')
    close_apply_modal()
  } catch (e) {
    console.error('申请失败:', e)
    error('申请提交失败')
  } finally {
    apply_loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 搜索框 -->
    <div
      class="rounded-xl bg-white/80 backdrop-blur-sm border border-[var(--c-border)] shadow-sm overflow-hidden"
    >
      <div class="relative">
        <div class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
          <Search class="w-3.5 h-3.5" />
        </div>
        <input
          v-model="search_query"
          type="text"
          placeholder="搜索友链..."
          class="w-full pl-7 pr-2 py-2 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>
    </div>

    <!-- 申请添加按钮 -->
    <button
      @click="open_apply_modal"
      class="w-full px-4 py-2 text-sm rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all flex items-center justify-center gap-2"
    >
      <Plus class="w-4 h-4" />
      申请添加
    </button>
  </div>

  <!-- 申请表单模态框 -->
  <Teleport to="body">
    <div v-if="show_apply_modal" class="fixed inset-0 z-[100] flex items-center justify-center">
      <!-- 遮罩 -->
      <div class="absolute inset-0 bg-black/30" @click="close_apply_modal" />

      <!-- 表单 -->
      <div class="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-xl overflow-hidden">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--c-border)]">
          <h2 class="text-lg font-medium text-slate-700">申请添加友链</h2>
          <button
            @click="close_apply_modal"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X class="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <!-- 表单内容 -->
        <div class="p-6 flex flex-col gap-4">
          <!-- 站点名称 -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm text-slate-600"
              >站点名称 <span class="text-red-500">*</span></label
            >
            <input
              v-model="apply_form.name"
              type="text"
              placeholder="请输入站点名称"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all"
              maxlength="50"
            />
          </div>

          <!-- 网站链接 -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm text-slate-600"
              >网站链接 <span class="text-red-500">*</span></label
            >
            <input
              v-model="apply_form.url"
              type="url"
              placeholder="https://example.com"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all"
              @input="on_url_change"
            />
          </div>

          <!-- 图标预览 -->
          <div
            v-if="show_icon_preview"
            class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-[var(--c-border)]"
          >
            <div
              class="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0"
            >
              <img
                :src="preview_icon_url"
                alt="网站图标"
                class="w-6 h-6 object-contain"
                @error="on_icon_error"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-500">网站图标预览</p>
              <p class="text-xs text-slate-400 mt-0.5">提交后将使用此图标</p>
            </div>
          </div>
          <div
            v-else-if="show_icon_error"
            class="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200"
          >
            <AlertCircle class="w-4 h-4 text-amber-500" />
            <p class="text-xs text-amber-600">无法获取网站图标，将使用默认图标</p>
          </div>

          <!-- 网站描述 -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm text-slate-600"
              >网站描述 <span class="text-slate-400">(可选)</span></label
            >
            <textarea
              v-model="apply_form.description"
              placeholder="简单介绍一下你的网站"
              rows="3"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all resize-none"
              maxlength="200"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div
          class="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--c-border)]"
        >
          <button
            @click="close_apply_modal"
            class="px-4 py-2 text-sm rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            取消
          </button>
          <button
            @click="submit_apply"
            :disabled="apply_loading"
            class="px-4 py-2 text-sm rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ apply_loading ? '提交中...' : '提交申请' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
