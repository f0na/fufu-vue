<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import { useBangumiEdit } from '@/composables/useBangumiEdit'
import { useConfirm } from '@/composables/useConfirm'
import {
  get_bangumi_info_detail,
  get_admin_watchlist,
  create_watchlist,
  update_watchlist,
  delete_watchlist,
  toggle_watchlist_visibility,
} from '@/api/bangumi'
import type { BangumiInfo, WatchlistItem } from '@/api/types'
import CommentSection from '@/components/comment/CommentSection.vue'
import SimpleNumberInput from '@/components/common/SimpleNumberInput.vue'
import DateInput from '@/components/common/DateInput.vue'
import { ArrowLeft, Loader2, Image as ImageIcon, ChevronUp, Inbox } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { success, error } = useToast()
const { can_edit, can_delete, can_toggle_visibility } = useAuth()
const { edit_mode, set_edit_mode } = useBangumiEdit()
const { confirm } = useConfirm()

// 是否显示隐藏记录
const show_hidden = ref(false)

// 是否显示追番记录内容区
const show_watchlist_section = ref(true)

// 番剧信息 ID
const bangumi_id = computed(() => route.params.id as string)

// 番剧信息
const bangumi_info = ref<BangumiInfo | null>(null)

// 追番记录列表
const watchlist_records = ref<WatchlistItem[]>([])

// 加载状态
const loading = ref(false)

// 添加追番记录表单
const add_form = ref({
  rating: 0,
  progress: '',
  notes: '',
  watch_date: '',
})
const add_loading = ref(false)

// 编辑追番记录
const editing_record = ref<WatchlistItem | null>(null)
const edit_form = ref({
  rating: 0,
  progress: '',
  notes: '',
  watch_date: '',
})
const edit_loading = ref(false)

// 筛选后的追番记录
const filtered_records = computed(() => {
  if (show_hidden.value) {
    return watchlist_records.value
  }
  return watchlist_records.value.filter((r) => r.visible)
})

// 获取操作提示
const mode_hint = computed(() => {
  if (edit_mode.value === 'add') return '填写表单添加追番记录'
  if (edit_mode.value === 'edit') return '点击记录进行编辑'
  if (edit_mode.value === 'delete') return '点击记录进行删除'
  if (edit_mode.value === 'visibility') return '点击记录切换显/隐'
  return ''
})

// 加载数据
async function load_data() {
  loading.value = true
  try {
    // 加载番剧信息
    const info = await get_bangumi_info_detail(bangumi_id.value)
    bangumi_info.value = info

    // 加载该番剧的所有追番记录
    const res = await get_admin_watchlist({ bangumi_id: bangumi_id.value, per_page: 100 })
    watchlist_records.value = res.items || []
  } catch (e) {
    console.error('加载失败:', e)
    error('加载番剧信息失败')
    router.push('/home/bangumi')
  } finally {
    loading.value = false
  }
}

// 重置添加表单
function reset_add_form() {
  add_form.value = {
    rating: 0,
    progress: '',
    notes: '',
    watch_date: '',
  }
}

// 保存添加
async function save_add() {
  add_loading.value = true
  try {
    const new_record = await create_watchlist({
      bangumi_id: bangumi_id.value,
      rating: add_form.value.rating || undefined,
      progress: add_form.value.progress.trim() || undefined,
      notes: add_form.value.notes.trim() || undefined,
      watch_date: add_form.value.watch_date.trim() || undefined,
    })

    watchlist_records.value.unshift(new_record)
    success('添加成功')
    reset_add_form()
    set_edit_mode('none')
  } catch (e) {
    console.error('添加失败:', e)
    error('添加失败')
  } finally {
    add_loading.value = false
  }
}

// 开始编辑
function start_edit(record: WatchlistItem) {
  editing_record.value = record
  edit_form.value = {
    rating: record.rating || 0,
    progress: record.progress || '',
    notes: record.notes || '',
    watch_date: record.watch_date || '',
  }
}

// 取消编辑
function cancel_edit() {
  editing_record.value = null
}

// 保存编辑
async function save_edit() {
  if (!editing_record.value) return

  edit_loading.value = true
  try {
    await update_watchlist(editing_record.value.id, {
      rating: edit_form.value.rating || undefined,
      progress: edit_form.value.progress.trim() || undefined,
      notes: edit_form.value.notes.trim() || undefined,
      watch_date: edit_form.value.watch_date.trim() || undefined,
    })

    // 更新本地数据
    const index = watchlist_records.value.findIndex((r) => r.id === editing_record.value!.id)
    if (index !== -1) {
      const existing = watchlist_records.value[index]
      if (existing) {
        watchlist_records.value[index] = {
          ...existing,
          rating: edit_form.value.rating || null,
          progress: edit_form.value.progress || null,
          notes: edit_form.value.notes || null,
          watch_date: edit_form.value.watch_date || null,
        }
      }
    }

    success('保存成功')
    editing_record.value = null
    set_edit_mode('none')
  } catch (e) {
    console.error('保存失败:', e)
    error('保存失败')
  } finally {
    edit_loading.value = false
  }
}

// 切换可见性
async function handle_toggle_visibility(record: WatchlistItem) {
  const new_visible = !record.visible
  try {
    await toggle_watchlist_visibility(record.id, new_visible)
    record.visible = new_visible
    success(new_visible ? '已显示' : '已隐藏')
  } catch (e) {
    console.error('操作失败:', e)
    error('操作失败')
  }
}

// 删除追番记录
async function handle_delete(record: WatchlistItem) {
  const confirmed = await confirm('确定要删除这条追番记录吗？')
  if (!confirmed) return

  try {
    await delete_watchlist(record.id)
    watchlist_records.value = watchlist_records.value.filter((r) => r.id !== record.id)
    success('删除成功')
  } catch (e) {
    console.error('删除失败:', e)
    error('删除失败')
  }
}

// 点击记录卡片
function handle_record_click(record: WatchlistItem) {
  if (edit_mode.value === 'edit') {
    start_edit(record)
  } else if (edit_mode.value === 'delete') {
    handle_delete(record)
  } else if (edit_mode.value === 'visibility') {
    handle_toggle_visibility(record)
  }
}

// 返回
function go_back() {
  router.push('/home/bangumi')
}

onMounted(() => {
  load_data()
})

// 监听 edit_mode 变化
watch(edit_mode, (new_mode) => {
  if (new_mode === 'none') {
    editing_record.value = null
    reset_add_form()
    show_hidden.value = false
  } else if (new_mode === 'add') {
    reset_add_form()
  } else if (new_mode === 'visibility') {
    // 显示隐藏记录模式
    show_hidden.value = true
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
      返回番剧列表
    </button>

    <!-- 加载中 -->
    <div v-if="loading" class="py-12 flex justify-center">
      <Loader2 class="w-8 h-8 animate-spin text-slate-400" />
    </div>

    <template v-else-if="bangumi_info">
      <!-- 编辑模式提示 -->
      <div
        v-if="edit_mode !== 'none'"
        class="flex items-center justify-between px-4 py-2 rounded-lg bg-[var(--c-primary-bg)] text-sm"
      >
        <span class="text-slate-600">{{ mode_hint }}</span>
        <button @click="set_edit_mode('none')" class="text-[var(--c-primary)] hover:underline">
          取消
        </button>
      </div>

      <!-- 封面和基本信息 -->
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- 封面 -->
        <div class="sm:w-40 shrink-0">
          <div class="aspect-[3/4] rounded-xl overflow-hidden shadow-sm">
            <img
              v-if="bangumi_info.cover"
              :src="bangumi_info.cover"
              :alt="bangumi_info.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-[var(--c-primary-bg)] flex items-center justify-center">
              <ImageIcon class="text-slate-300 w-6 h-6" />
            </div>
          </div>
        </div>

        <!-- 信息 -->
        <div class="flex-1">
          <h1 class="text-lg font-bold text-slate-800 mb-2">{{ bangumi_info.title }}</h1>

          <div class="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <span v-if="bangumi_info.episodes">{{ bangumi_info.episodes }} 集</span>
            <span v-if="!bangumi_info.visible" class="text-amber-600">(已隐藏)</span>
          </div>

          <!-- 标签 -->
          <div v-if="bangumi_info.tags && bangumi_info.tags.length > 0" class="flex flex-wrap gap-1.5 mb-3">
            <span
              v-for="tag in bangumi_info.tags"
              :key="tag"
              class="px-2 py-0.5 text-xs rounded-lg bg-[var(--c-primary-bg)] text-slate-600"
            >
              {{ tag }}
            </span>
          </div>

          <!-- 简介 -->
          <p v-if="bangumi_info.description" class="text-sm text-slate-600 leading-relaxed">
            {{ bangumi_info.description }}
          </p>
        </div>
      </div>

      <!-- 追番记录列表 -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-medium text-slate-700">追番记录 ({{ filtered_records.length }})</h2>
          <button
            @click="show_watchlist_section = !show_watchlist_section"
            class="text-xs text-slate-500 hover:text-[var(--c-primary)] transition-colors flex items-center gap-1"
          >
            <ChevronUp class="w-4 h-4 transition-transform" :class="show_watchlist_section ? '' : '-rotate-180'" />
            {{ show_watchlist_section ? '隐藏' : '显示' }}
          </button>
        </div>

        <!-- 追番记录内容 -->
        <div v-show="show_watchlist_section">
          <!-- 添加表单 -->
          <div
            v-if="edit_mode === 'add'"
            class="mb-4 p-4 bg-[var(--c-primary-bg)]/30 rounded-xl border border-[var(--c-primary)]/20"
          >
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-slate-500">评分</label>
              <simple-number-input v-model="add_form.rating" :min="0" :max="10" :step="0.1" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-slate-500">进度</label>
              <input
                v-model="add_form.progress"
                type="text"
                placeholder="如: 1-12, SP1"
                class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-slate-500">观看日期</label>
              <date-input v-model="add_form.watch_date" placeholder="选择日期" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-slate-500">备注</label>
              <input
                v-model="add_form.notes"
                type="text"
                placeholder="感想或备注"
                class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="set_edit_mode('none')"
              class="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-white transition-colors"
            >
              取消
            </button>
            <button
              @click="save_add"
              :disabled="add_loading"
              class="px-4 py-2 text-sm rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all disabled:opacity-50"
            >
              {{ add_loading ? '添加中...' : '添加' }}
            </button>
          </div>
        </div>

        <!-- 记录卡片 -->
        <div v-if="filtered_records.length > 0" class="space-y-3">
          <div
            v-for="record in filtered_records"
            :key="record.id"
            class="p-4 bg-white rounded-xl border border-[var(--c-border)] shadow-sm transition-all"
            :class="{
              'opacity-50': !record.visible,
              'cursor-pointer hover:shadow-md ring-2 ring-[var(--c-primary)]': edit_mode !== 'none' && edit_mode !== 'add',
            }"
            @click="handle_record_click(record)"
          >
            <!-- 编辑模式 -->
            <template v-if="editing_record?.id === record.id">
              <div class="grid grid-cols-2 gap-3 mb-3">
                <div class="flex flex-col gap-1">
                  <label class="text-xs text-slate-500">评分</label>
                  <number-input v-model="edit_form.rating" :min="0" :max="10" :step="0.1" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs text-slate-500">进度</label>
                  <input
                    v-model="edit_form.progress"
                    type="text"
                    placeholder="如: 1-12, SP1"
                    class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 mb-3">
                <div class="flex flex-col gap-1">
                  <label class="text-xs text-slate-500">观看日期</label>
                  <date-input v-model="edit_form.watch_date" placeholder="选择日期" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs text-slate-500">备注</label>
                  <input
                    v-model="edit_form.notes"
                    type="text"
                    placeholder="感想或备注"
                    class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
                  />
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click.stop="cancel_edit"
                  class="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  @click.stop="save_edit"
                  :disabled="edit_loading"
                  class="px-3 py-1.5 text-sm rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all disabled:opacity-50"
                >
                  {{ edit_loading ? '保存中...' : '保存' }}
                </button>
              </div>
            </template>

            <!-- 查看模式 -->
            <template v-else>
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span
                      v-if="record.rating"
                      class="px-2 py-0.5 text-xs rounded-lg bg-amber-100 text-amber-700 font-medium"
                    >
                      {{ record.rating }} 分
                    </span>
                    <span v-if="!record.visible" class="text-xs text-slate-400">(已隐藏)</span>
                  </div>
                  <div v-if="record.progress" class="text-sm text-slate-600 mb-1">
                    进度: {{ record.progress }}
                  </div>
                  <div v-if="record.watch_date" class="text-xs text-slate-500 mb-1">
                    观看日期: {{ record.watch_date }}
                  </div>
                  <div v-if="record.notes" class="text-sm text-slate-600 bg-slate-50 rounded-lg p-2 mt-2">
                    {{ record.notes }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="show_watchlist_section" class="py-8 text-center text-slate-400">
          <Inbox class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm">暂无追番记录</p>
        </div>
      </div>
    </div>

      <!-- 评论区 -->
      <div id="comments-section" class="bg-white rounded-xl shadow-sm border border-[var(--c-border)] p-4">
        <comment-section target_type="bangumi" :target_id="bangumi_id" />
      </div>
    </template>
  </div>
</template>