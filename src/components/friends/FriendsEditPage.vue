<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useFormCache } from '@/composables/useFormCache'
import { add_friend, update_friend, get_admin_friends } from '@/api/friend'
import { useFriendsStore } from '@/stores/friends'
import type { Friend } from '@/api/types'
import BackToTop from '@/components/common/BackToTop.vue'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { success, error } = useToast()
const friends_store = useFriendsStore()

// 是否为编辑模式
const friend_id = computed(() => route.params.id as string | undefined)
const is_edit = computed(() => !!friend_id.value)

// 默认表单值
const default_form = {
  name: '',
  url: '',
  description: '',
  sort_order: 0,
  visible: true,
}

// 表单数据（带缓存）
const { form_data, reset, clear_cache } = useFormCache('friend_edit', default_form)

// 加载状态
const loading = ref(false)
const submit_loading = ref(false)

// 图标加载错误状态
const icon_load_error = ref(false)

// 格式化 URL（补全协议前缀）
function normalize_url(url: string): string {
  let normalized = url.trim()
  if (!normalized) return ''
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized
  }
  return normalized
}

// 图标预览 URL
const preview_icon_url = computed(() => {
  const normalized = normalize_url(form_data.value.url)
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

// 是否显示图标错误提示
const show_icon_error = computed(() => {
  const normalized = normalize_url(form_data.value.url)
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

// 加载友链数据（编辑模式）
async function load_friend() {
  if (!friend_id.value) return

  loading.value = true
  try {
    // 获取友链列表，找到对应的友链
    const res = await get_admin_friends({ per_page: 1000 })
    const friend = res.items.find((f) => f.id === friend_id.value)

    if (!friend) {
      error('友链不存在')
      router.back()
      return
    }

    form_data.value = {
      name: friend.name,
      url: friend.url,
      description: friend.description || '',
      sort_order: friend.sort_order || 0,
      visible: friend.visible,
    }
  } catch (e) {
    console.error('加载友链失败:', e)
    error('加载友链失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 返回
function go_back() {
  router.back()
}

// 提交表单
async function handle_submit() {
  if (!form_data.value.name.trim()) {
    error('请填写站点名称')
    return
  }
  if (!form_data.value.url.trim()) {
    error('请填写网站链接')
    return
  }

  submit_loading.value = true
  try {
    const url = normalize_url(form_data.value.url)

    const data = {
      name: form_data.value.name.trim(),
      url,
      description: form_data.value.description.trim() || undefined,
      sort_order: form_data.value.sort_order,
    }

    if (is_edit.value && friend_id.value) {
      const updated = await update_friend(friend_id.value, {
        ...data,
        visible: form_data.value.visible,
      })
      friends_store.update_friend_local(friend_id.value, updated)
      success('更新成功')
    } else {
      const added = await add_friend({
        ...data,
        sort_order: data.sort_order || undefined,
      })
      friends_store.add_friend_local(added)
      success('添加成功')
    }
    clear_cache()
    router.back()
  } catch (e) {
    console.error('操作失败:', e)
    error(is_edit.value ? '更新失败' : '添加失败')
  } finally {
    submit_loading.value = false
  }
}

// 初始化
onMounted(() => {
  if (is_edit.value) {
    load_friend()
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 返回按钮 -->
    <button
      @click="go_back"
      class="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--c-primary)] transition-colors self-start"
    >
      <ArrowLeft class="w-4 h-4" />
      返回
    </button>

    <!-- 标题 -->
    <h1 class="text-xl font-medium text-slate-700">
      {{ is_edit ? '编辑友链' : '添加友链' }}
    </h1>

    <!-- 加载中 -->
    <div v-if="loading" class="py-12 flex justify-center">
      <Loader2 class="w-8 h-8 animate-spin text-slate-400" />
    </div>

    <!-- 表单 -->
    <div v-else class="flex flex-col gap-6">
      <!-- 站点名称 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600"
          >站点名称 <span class="text-red-500">*</span></label
        >
        <input
          v-model="form_data.name"
          type="text"
          placeholder="请输入站点名称"
          class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all"
          maxlength="50"
        />
      </div>

      <!-- 网站链接 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600"
          >网站链接 <span class="text-red-500">*</span></label
        >
        <input
          v-model="form_data.url"
          type="url"
          placeholder="https://example.com"
          class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all"
          @input="on_url_change"
        />

        <!-- 图标预览 -->
        <div
          v-if="show_icon_preview"
          class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200"
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
      </div>

      <!-- 网站描述 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600"
          >网站描述 <span class="text-slate-400">(可选)</span></label
        >
        <textarea
          v-model="form_data.description"
          placeholder="简单介绍一下这个网站"
          rows="3"
          class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all resize-none"
          maxlength="200"
        />
      </div>

      <!-- 排序 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600"
          >排序 <span class="text-slate-400">(可选，数字越小越靠前)</span></label
        >
        <input
          v-model.number="form_data.sort_order"
          type="number"
          placeholder="0"
          min="0"
          class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all"
        />
      </div>

      <!-- 可见性 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">可见性</label>
        <button
          type="button"
          @click="form_data.visible = !form_data.visible"
          class="relative w-12 h-6 rounded-full transition-colors self-start"
          :class="form_data.visible ? 'bg-[var(--c-primary)]' : 'bg-slate-300'"
        >
          <span
            class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
            :class="form_data.visible ? 'translate-x-6' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-3 pt-4">
        <button
          @click="go_back"
          class="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors"
        >
          取消
        </button>
        <button
          @click="handle_submit"
          :disabled="submit_loading"
          class="flex-1 px-4 py-3 text-sm rounded-xl bg-[var(--c-primary)] text-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submit_loading ? '提交中...' : is_edit ? '保存' : '添加' }}
        </button>
      </div>
    </div>

    <!-- 回到顶部 -->
    <back-to-top />
  </div>
</template>