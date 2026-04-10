<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get_managers, revoke_admin, get_admin_applications, review_application } from '@/api/auth'
import { useToast } from '@/composables/useToast'
import type { Manager, AdminApplication } from '@/api/types'
import { Loader2, Check, X, User, Crown } from 'lucide-vue-next'

const { success, error } = useToast()

// 管理员列表
const managers = ref<Manager[]>([])
const managers_loading = ref(false)

// 申请列表
const applications = ref<AdminApplication[]>([])
const applications_loading = ref(false)
const application_filter = ref<'pending' | 'approved' | 'rejected' | ''>('pending')

// 加载管理员列表
async function load_managers() {
  managers_loading.value = true
  try {
    managers.value = await get_managers()
  } catch (e) {
    console.error('加载管理员列表失败:', e)
    error('加载管理员列表失败')
  } finally {
    managers_loading.value = false
  }
}

// 加载申请列表
async function load_applications() {
  applications_loading.value = true
  try {
    const res = await get_admin_applications({
      status: application_filter.value || undefined,
    })
    applications.value = res.items
  } catch (e) {
    console.error('加载申请列表失败:', e)
    error('加载申请列表失败')
  } finally {
    applications_loading.value = false
  }
}

// 撤销管理员权限
async function handle_revoke(manager: Manager) {
  if (manager.is_first_admin) {
    error('首位管理员权限不可撤销')
    return
  }

  try {
    await revoke_admin(manager.id)
    success('已撤销管理员权限')
    load_managers()
  } catch (e) {
    console.error('撤销权限失败:', e)
    error('撤销失败')
  }
}

// 审批申请
async function handle_review(application: AdminApplication, action: 'approve' | 'reject') {
  try {
    await review_application(application.id, { action })
    success(action === 'approve' ? '已批准' : '已拒绝')
    load_applications()
    load_managers()
  } catch (e) {
    console.error('审批失败:', e)
    error('审批失败')
  }
}

// 筛选申请
function filter_applications() {
  load_applications()
}

// 初始化
onMounted(() => {
  load_managers()
  load_applications()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 管理员列表 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-sm font-medium text-slate-700 mb-4">管理员列表</h3>

      <div v-if="managers_loading" class="py-8 text-center">
        <loader-2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
      </div>
      <div v-else-if="managers.length === 0" class="py-8 text-center text-sm text-slate-400">
        暂无管理员
      </div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="manager in managers"
          :key="manager.id"
          class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50"
        >
          <div
            class="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center"
          >
            <img
              v-if="manager.avatar"
              :src="manager.avatar"
              :alt="manager.display_name || manager.username"
              class="w-full h-full object-cover"
            />
            <user v-else class="w-5 h-5 text-slate-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-700">
              {{ manager.display_name || manager.username }}
              <crown
                v-if="manager.is_first_admin"
                class="w-4 h-4 inline ml-1 text-yellow-500"
                title="首位管理员"
              />
            </p>
            <p class="text-xs text-slate-500">{{ manager.email }}</p>
          </div>
          <span class="text-xs text-slate-400">{{ manager.created_at }}</span>
          <button
            v-if="!manager.is_first_admin"
            @click="handle_revoke(manager)"
            class="px-3 py-1 text-xs rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            撤销权限
          </button>
        </div>
      </div>
    </div>

    <!-- 申请列表 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-medium text-slate-700">管理员申请</h3>
        <select
          v-model="application_filter"
          @change="filter_applications"
          class="px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
        >
          <option value="">全部</option>
          <option value="pending">待处理</option>
          <option value="approved">已批准</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>

      <div v-if="applications_loading" class="py-8 text-center">
        <loader-2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
      </div>
      <div v-else-if="applications.length === 0" class="py-8 text-center text-sm text-slate-400">
        暂无申请
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="app in applications"
          :key="app.id"
          class="p-4 rounded-lg bg-slate-50 border border-[var(--c-border)]"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm font-medium text-slate-700">{{ app.username }}</span>
                <span
                  class="px-2 py-0.5 text-xs rounded"
                  :class="{
                    'bg-yellow-100 text-yellow-600': app.status === 'pending',
                    'bg-green-100 text-green-600': app.status === 'approved',
                    'bg-red-100 text-red-600': app.status === 'rejected',
                  }"
                >
                  {{
                    app.status === 'pending'
                      ? '待处理'
                      : app.status === 'approved'
                        ? '已批准'
                        : '已拒绝'
                  }}
                </span>
              </div>
              <p class="text-sm text-slate-600 mb-2">{{ app.reason }}</p>
              <p class="text-xs text-slate-400">{{ app.created_at }}</p>
            </div>
            <div v-if="app.status === 'pending'" class="flex items-center gap-2">
              <button
                @click="handle_review(app, 'approve')"
                class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <check class="w-3.5 h-3.5" />
                批准
              </button>
              <button
                @click="handle_review(app, 'reject')"
                class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <x class="w-3.5 h-3.5" />
                拒绝
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
