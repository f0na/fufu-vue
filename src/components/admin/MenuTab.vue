<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  get_admin_menu,
  create_menu_item,
  update_menu_item,
  delete_menu_item,
  toggle_menu_visibility,
} from '@/api/user'
import { useToast } from '@/composables/useToast'
import type { MenuItem, CreateMenuItemRequest } from '@/api/types'
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-vue-next'

const { success, error } = useToast()

// 菜单列表
const menu_items = ref<MenuItem[]>([])
const loading = ref(false)

// 表单
const show_form = ref(false)
const editing = ref<MenuItem | null>(null)
const form = ref<CreateMenuItemRequest>({
  label: '',
  key: '',
  icon: '',
  route: '',
  visible: true,
  sort_order: 0,
})

// 加载菜单列表
async function load() {
  loading.value = true
  try {
    menu_items.value = await get_admin_menu()
  } catch (e) {
    console.error('加载菜单失败:', e)
    error('加载菜单失败')
  } finally {
    loading.value = false
  }
}

// 打开添加表单
function open_add() {
  editing.value = null
  form.value = {
    label: '',
    key: '',
    icon: '',
    route: '',
    visible: true,
    sort_order: menu_items.value.length,
  }
  show_form.value = true
}

// 打开编辑表单
function open_edit(item: MenuItem) {
  editing.value = item
  form.value = {
    label: item.label,
    key: item.key,
    icon: item.icon || '',
    route: item.route,
    visible: item.visible,
    sort_order: item.sort_order,
  }
  show_form.value = true
}

// 提交表单
async function submit() {
  if (!form.value.label || !form.value.key || !form.value.route) {
    error('请填写标签、键和路由')
    return
  }

  try {
    if (editing.value) {
      await update_menu_item(editing.value.id, form.value)
      success('更新成功')
    } else {
      await create_menu_item(form.value)
      success('添加成功')
    }
    show_form.value = false
    load()
  } catch (e) {
    console.error('保存菜单失败:', e)
    error('保存失败')
  }
}

// 删除菜单项
async function handle_delete(id: string) {
  try {
    await delete_menu_item(id)
    success('删除成功')
    load()
  } catch (e) {
    console.error('删除菜单失败:', e)
    error('删除失败')
  }
}

// 切换可见性
async function handle_toggle(item: MenuItem) {
  try {
    await toggle_menu_visibility(item.id, !item.visible)
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
        添加菜单项
      </button>
    </div>

    <!-- 添加/编辑表单 -->
    <div v-if="show_form" class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-sm font-medium text-slate-700 mb-4">
        {{ editing ? '编辑菜单项' : '添加菜单项' }}
      </h3>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-slate-500 mb-1">标签</label>
          <input
            v-model="form.label"
            type="text"
            placeholder="如：首页"
            class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">键</label>
          <input
            v-model="form.key"
            type="text"
            placeholder="如：home"
            class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">路由</label>
          <input
            v-model="form.route"
            type="text"
            placeholder="如：/home"
            class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">图标</label>
          <input
            v-model="form.icon"
            type="text"
            placeholder="如：i-lucide-home"
            class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">排序</label>
          <input
            v-model.number="form.sort_order"
            type="number"
            min="0"
            class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
          />
        </div>
        <div class="flex items-center">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="form.visible"
              type="checkbox"
              class="w-4 h-4 rounded border-[var(--c-border)] text-[var(--c-primary)] focus:ring-[var(--c-primary)]"
            />
            <span class="text-xs text-slate-600">可见</span>
          </label>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-3">
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

    <!-- 菜单列表 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <div v-if="loading" class="py-8 text-center">
        <Loader2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
      </div>
      <div v-else-if="menu_items.length === 0" class="py-8 text-center text-sm text-slate-400">
        暂无菜单项
      </div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="item in menu_items"
          :key="item.id"
          class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <GripVertical class="w-4 h-4 text-slate-400 cursor-move" />
          <div v-if="item.icon" :class="item.icon" class="w-5 h-5 text-slate-600" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-700">{{ item.label }}</p>
            <p class="text-xs text-slate-500">{{ item.route }}</p>
          </div>
          <span class="px-2 py-0.5 text-xs rounded bg-slate-200 text-slate-600">
            {{ item.key }}
          </span>
          <span
            class="px-2 py-0.5 text-xs rounded"
            :class="item.visible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
          >
            {{ item.visible ? '可见' : '隐藏' }}
          </span>
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
</template>
