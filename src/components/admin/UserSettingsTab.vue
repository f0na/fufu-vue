<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetch_admin_user,
  update_admin_user,
  upload_avatar,
  get_social_links,
  create_social_link,
  update_social_link,
  delete_social_link,
} from '@/api/admin'
import { useToast } from '@/composables/useToast'
import type { SocialLink } from '@/api/types'
import { Loader2, Upload, Plus, Trash2, GripVertical, ExternalLink, Mail } from 'lucide-vue-next'

const { success, error } = useToast()

// 用户信息
const user_info = ref<{
  id: string
  name: string
  avatar: string | null
  greeting: string | null
} | null>(null)
const name_input = ref('')
const greeting_input = ref('')
const user_loading = ref(false)
const user_saving = ref(false)

// 社交链接
const social_links = ref<SocialLink[]>([])
const links_loading = ref(false)
const editing_link = ref<SocialLink | null>(null)
const show_link_form = ref(false)
const link_form = ref({
  name: '',
  url: '',
  icon: '',
  link_type: 'link' as 'link' | 'email',
  sort_order: 0,
})

// 加载用户信息
async function load_user() {
  user_loading.value = true
  try {
    user_info.value = await fetch_admin_user()
    name_input.value = user_info.value.name || ''
    greeting_input.value = user_info.value.greeting || ''
  } catch (e) {
    console.error('加载用户信息失败:', e)
    error('加载用户信息失败')
  } finally {
    user_loading.value = false
  }
}

// 保存用户信息
async function save_user() {
  user_saving.value = true
  try {
    await update_admin_user({
      name: name_input.value || undefined,
      greeting: greeting_input.value || undefined,
    })
    success('保存成功')
    load_user()
  } catch (e) {
    console.error('保存用户信息失败:', e)
    error('保存失败')
  } finally {
    user_saving.value = false
  }
}

// 上传头像
async function handle_avatar_upload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const res = await upload_avatar(file)
    await update_admin_user({ avatar: res.key })
    success('头像更新成功')
    load_user()
  } catch (e) {
    console.error('上传头像失败:', e)
    error('上传头像失败')
  }
}

// 加载社交链接
async function load_links() {
  links_loading.value = true
  try {
    social_links.value = await get_social_links()
  } catch (e) {
    console.error('加载社交链接失败:', e)
    error('加载社交链接失败')
  } finally {
    links_loading.value = false
  }
}

// 添加社交链接
async function handle_add_link() {
  if (!link_form.value.name || !link_form.value.url) {
    error('请填写名称和链接')
    return
  }

  try {
    await create_social_link(link_form.value)
    success('添加成功')
    show_link_form.value = false
    reset_link_form()
    load_links()
  } catch (e) {
    console.error('添加社交链接失败:', e)
    error('添加失败')
  }
}

// 更新社交链接
async function handle_update_link() {
  if (!editing_link.value || !link_form.value.name || !link_form.value.url) {
    error('请填写名称和链接')
    return
  }

  try {
    await update_social_link(editing_link.value.id, {
      name: link_form.value.name,
      url: link_form.value.url,
      icon: link_form.value.icon || undefined,
      sort_order: link_form.value.sort_order,
    })
    success('更新成功')
    cancel_edit_link()
    load_links()
  } catch (e) {
    console.error('更新社交链接失败:', e)
    error('更新失败')
  }
}

// 删除社交链接
async function handle_delete_link(id: string) {
  try {
    await delete_social_link(id)
    success('删除成功')
    load_links()
  } catch (e) {
    console.error('删除社交链接失败:', e)
    error('删除失败')
  }
}

// 编辑链接
function start_edit_link(link: SocialLink) {
  editing_link.value = link
  show_link_form.value = true
  link_form.value = {
    name: link.name,
    url: link.url,
    icon: link.icon,
    link_type: link.link_type,
    sort_order: link.sort_order,
  }
}

// 取消编辑
function cancel_edit_link() {
  editing_link.value = null
  show_link_form.value = false
  reset_link_form()
}

// 重置表单
function reset_link_form() {
  link_form.value = {
    name: '',
    url: '',
    icon: '',
    link_type: 'link',
    sort_order: 0,
  }
}

// 初始化
onMounted(() => {
  load_user()
  load_links()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 用户信息 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-sm font-medium text-slate-700 mb-4">用户信息</h3>

      <div v-if="user_loading" class="py-8 text-center">
        <Loader2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
      </div>

      <div v-else class="flex flex-col gap-4">
        <!-- 头像 -->
        <div class="flex items-center gap-4">
          <div class="relative group">
            <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--c-border)]">
              <img
                v-if="user_info?.avatar"
                :src="user_info.avatar"
                alt="头像"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center">
                <span class="text-2xl text-slate-400">{{ user_info?.name?.[0] || '?' }}</span>
              </div>
            </div>
            <label
              class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Upload class="w-5 h-5 text-white" />
              <input type="file" accept="image/*" class="hidden" @change="handle_avatar_upload" />
            </label>
          </div>
          <span class="text-xs text-slate-500">点击更换头像</span>
        </div>

        <!-- 昵称 -->
        <div>
          <label class="block text-xs text-slate-500 mb-1">昵称</label>
          <input
            v-model="name_input"
            type="text"
            placeholder="输入昵称"
            class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
          />
        </div>

        <!-- 欢迎语 -->
        <div>
          <label class="block text-xs text-slate-500 mb-1">欢迎语</label>
          <input
            v-model="greeting_input"
            type="text"
            placeholder="输入欢迎语"
            class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
          />
        </div>

        <!-- 保存按钮 -->
        <button
          @click="save_user"
          :disabled="user_saving"
          class="self-end px-4 py-2 text-sm rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all disabled:opacity-50"
        >
          {{ user_saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>

    <!-- 社交链接 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-medium text-slate-700">社交链接</h3>
        <button
          @click="show_link_form = true"
          class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[var(--c-primary-bg)] text-[var(--c-primary)] hover:bg-[var(--c-primary)] hover:text-white transition-colors"
        >
          <Plus class="w-3.5 h-3.5" />
          添加
        </button>
      </div>

      <!-- 添加/编辑表单 -->
      <div v-if="show_link_form" class="p-4 rounded-lg bg-slate-50 mb-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-500 mb-1">名称</label>
            <input
              v-model="link_form.name"
              type="text"
              placeholder="如：B站"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">链接</label>
            <input
              v-model="link_form.url"
              type="text"
              placeholder="https://..."
              class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">图标</label>
            <input
              v-model="link_form.icon"
              type="text"
              placeholder="i-simple-icons-bilibili"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">类型</label>
            <select
              v-model="link_form.link_type"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
            >
              <option value="link">链接</option>
              <option value="email">邮箱</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-3">
          <button
            @click="cancel_edit_link"
            class="px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] text-slate-600 hover:bg-slate-100 transition-colors"
          >
            取消
          </button>
          <button
            @click="editing_link ? handle_update_link() : handle_add_link()"
            class="px-3 py-1.5 text-xs rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all"
          >
            {{ editing_link ? '更新' : '添加' }}
          </button>
        </div>
      </div>

      <!-- 链接列表 -->
      <div v-if="links_loading" class="py-8 text-center">
        <Loader2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
      </div>
      <div v-else-if="social_links.length === 0" class="py-8 text-center text-sm text-slate-400">
        暂无社交链接
      </div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="link in social_links"
          :key="link.id"
          class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <GripVertical class="w-4 h-4 text-slate-400 cursor-move" />
          <div :class="link.icon" class="w-5 h-5 text-slate-600" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-700">{{ link.name }}</p>
            <p class="text-xs text-slate-500 truncate">{{ link.url }}</p>
          </div>
          <span class="px-2 py-0.5 text-xs rounded bg-slate-200 text-slate-600">
            {{ link.link_type === 'email' ? '邮箱' : '链接' }}
          </span>
          <a
            :href="link.link_type === 'email' ? `mailto:${link.url}` : link.url"
            target="_blank"
            class="p-1 text-slate-400 hover:text-[var(--c-primary)] transition-colors"
          >
            <ExternalLink class="w-4 h-4" />
          </a>
          <button
            @click="start_edit_link(link)"
            class="px-2 py-1 text-xs text-slate-600 hover:text-[var(--c-primary)] transition-colors"
          >
            编辑
          </button>
          <button
            @click="handle_delete_link(link.id)"
            class="p-1 text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
