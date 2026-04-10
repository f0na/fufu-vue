<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  get_admin_announcements,
  create_announcement,
  update_announcement,
  delete_announcement,
  toggle_announcement_visibility,
} from '@/api/announcement'
import { useToast } from '@/composables/useToast'
import type { Announcement } from '@/api/types'
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-vue-next'

const { success, error } = useToast()

// 公告列表
const announcements = ref<Announcement[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)

// 获取当前日期字符串
function get_today_date(): string {
  return new Date().toISOString().split('T')[0] || ''
}

// 表单
const show_form = ref(false)
const editing = ref<Announcement | null>(null)
const form = ref<{
  content: string
  date: string
  priority: number
}>({
  content: '',
  date: get_today_date(),
  priority: 10,
})

// 加载公告列表
async function load() {
  loading.value = true
  try {
    const res = await get_admin_announcements({
      page: page.value,
      per_page: 20,
    })
    announcements.value = res.items
    total.value = res.pagination.total
  } catch (e) {
    console.error('加载公告失败:', e)
    error('加载公告失败')
  } finally {
    loading.value = false
  }
}

// 打开添加表单
function open_add() {
  editing.value = null
  form.value = {
    content: '',
    date: get_today_date(),
    priority: 10,
  }
  show_form.value = true
}

// 打开编辑表单
function open_edit(item: Announcement) {
  editing.value = item
  form.value = {
    content: item.content,
    date: item.date,
    priority: item.priority,
  }
  show_form.value = true
}

// 提交表单
async function submit() {
  if (!form.value.content) {
    error('请输入公告内容')
    return
  }

  try {
    if (editing.value) {
      await update_announcement(editing.value.id, {
        content: form.value.content,
        date: form.value.date,
        priority: form.value.priority,
      })
      success('更新成功')
    } else {
      await create_announcement({
        content: form.value.content,
        date: form.value.date,
        priority: form.value.priority,
      })
      success('添加成功')
    }
    show_form.value = false
    load()
  } catch (e) {
    console.error('保存公告失败:', e)
    error('保存失败')
  }
}

// 删除公告
async function handle_delete(id: string) {
  try {
    await delete_announcement(id)
    success('删除成功')
    load()
  } catch (e) {
    console.error('删除公告失败:', e)
    error('删除失败')
  }
}

// 切换可见性
async function handle_toggle(item: Announcement) {
  try {
    await toggle_announcement_visibility(item.id, !item.visible)
    success(item.visible ? '已隐藏' : '已显示')
    load()
  } catch (e) {
    console.error('切换可见性失败:', e)
    error('操作失败')
  }
}

// 初始化
onMounted(() => {
  load()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 添加按钮 -->
    <div class="flex justify-end">
      <button
        @click="open_add"
        class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[var(--c-primary-bg)] text-[var(--c-primary)] hover:bg-[var(--c-primary)] hover:text-white transition-colors"
      >
        <Plus class="w-3.5 h-3.5" />
        添加公告
      </button>
    </div>

    <!-- 添加/编辑表单 -->
    <div v-if="show_form" class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-sm font-medium text-slate-700 mb-4">
        {{ editing ? '编辑公告' : '添加公告' }}
      </h3>
      <div class="flex flex-col gap-3">
        <div>
          <label class="block text-xs text-slate-500 mb-1">内容</label>
          <textarea
            v-model="form.content"
            placeholder="输入公告内容"
            rows="3"
            class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none resize-none"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-500 mb-1">日期</label>
            <input
              v-model="form.date"
              type="date"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">优先级</label>
            <input
              v-model.number="form.priority"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button
            @click="show_form = false"
            class="px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] text-slate-600 hover:bg-slate-100 transition-colors"
          >
            取消
          </button>
          <button
            @click="submit"
            class="px-3 py-1.5 text-xs rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all"
          >
            {{ editing ? '更新' : '添加' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 公告列表 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <div v-if="loading" class="py-8 text-center">
        <Loader2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
      </div>
      <div v-else-if="announcements.length === 0" class="py-8 text-center text-sm text-slate-400">
        暂无公告
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="item in announcements"
          :key="item.id"
          class="p-4 rounded-lg bg-slate-50 border border-[var(--c-border)]"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <p class="text-sm text-slate-700 mb-2">{{ item.content }}</p>
              <div class="flex items-center gap-3 text-xs text-slate-500">
                <span>{{ item.date }}</span>
                <span class="px-1.5 py-0.5 rounded bg-slate-200">优先级: {{ item.priority }}</span>
                <span
                  class="px-1.5 py-0.5 rounded"
                  :class="item.visible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
                >
                  {{ item.visible ? '可见' : '隐藏' }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="handle_toggle(item)"
                class="p-1.5 text-slate-400 hover:text-[var(--c-primary)] transition-colors"
                :title="item.visible ? '隐藏' : '显示'"
              >
                <EyeOff v-if="item.visible" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
              <button
                @click="open_edit(item)"
                class="p-1.5 text-slate-400 hover:text-[var(--c-primary)] transition-colors"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button
                @click="handle_delete(item.id)"
                class="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
