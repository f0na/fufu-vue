<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetch_user_settings, update_user_settings } from '@/api/user'
import { useToast } from '@/composables/useToast'
import type { UserSettings } from '@/api/types'
import { Loader2 } from 'lucide-vue-next'

const { success, error } = useToast()

// 设置
const settings = ref<UserSettings>({
  theme: 'rose',
  language: 'zh-CN',
})
const loading = ref(false)
const saving = ref(false)

// 主题选项
const theme_options = [
  { value: 'rose', label: '玫瑰红' },
  { value: 'cyan', label: '青色' },
  { value: 'amber', label: '琥珀黄' },
  { value: 'emerald', label: '翡翠绿' },
  { value: 'slate', label: '石板灰' },
]

// 语言选项
const language_options = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
]

// 加载设置
async function load() {
  loading.value = true
  try {
    settings.value = await fetch_user_settings()
  } catch (e) {
    console.error('加载设置失败:', e)
    error('加载设置失败')
  } finally {
    loading.value = false
  }
}

// 保存设置
async function save() {
  saving.value = true
  try {
    await update_user_settings(settings.value)
    success('保存成功')
    // 应用主题
    document.documentElement.setAttribute('data-theme', settings.value.theme)
  } catch (e) {
    console.error('保存设置失败:', e)
    error('保存失败')
  } finally {
    saving.value = false
  }
}

// 初始化
onMounted(() => {
  load()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-sm font-medium text-slate-700 mb-4">网站设置</h3>

      <div v-if="loading" class="py-8 text-center">
        <loader-2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
      </div>

      <div v-else class="flex flex-col gap-4">
        <!-- 主题 -->
        <div>
          <label class="block text-xs text-slate-500 mb-2">主题颜色</label>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="theme in theme_options"
              :key="theme.value"
              @click="settings.theme = theme.value"
              class="flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors"
              :class="
                settings.theme === theme.value
                  ? 'border-[var(--c-primary)] bg-[var(--c-primary-bg)]'
                  : 'border-[var(--c-border)] hover:border-slate-300'
              "
            >
              <div
                class="w-6 h-6 rounded-full"
                :style="{
                  backgroundColor:
                    theme.value === 'rose'
                      ? '#f43f5e'
                      : theme.value === 'cyan'
                        ? '#06b6d4'
                        : theme.value === 'amber'
                          ? '#f59e0b'
                          : theme.value === 'emerald'
                            ? '#10b981'
                            : '#64748b',
                }"
              />
              <span class="text-xs text-slate-600">{{ theme.label }}</span>
            </button>
          </div>
        </div>

        <!-- 语言 -->
        <div>
          <label class="block text-xs text-slate-500 mb-1">语言</label>
          <select
            v-model="settings.language"
            class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
          >
            <option v-for="lang in language_options" :key="lang.value" :value="lang.value">
              {{ lang.label }}
            </option>
          </select>
        </div>

        <!-- 保存按钮 -->
        <button
          @click="save"
          :disabled="saving"
          class="self-end px-4 py-2 text-sm rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all disabled:opacity-50"
        >
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>
  </div>
</template>
