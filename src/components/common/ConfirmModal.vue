<script setup lang="ts">
import { ref } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface ConfirmOptions {
  title?: string
  message: string
  confirm_text?: string
  cancel_text?: string
  danger?: boolean
}

const visible = ref(false)
const options = ref<ConfirmOptions>({
  message: '',
})
const resolve_ref = ref<((value: boolean) => void) | null>(null)

function show(opts: ConfirmOptions): Promise<boolean> {
  options.value = {
    title: opts.title || '确认',
    message: opts.message,
    confirm_text: opts.confirm_text || '确认',
    cancel_text: opts.cancel_text || '取消',
    danger: opts.danger ?? true,
  }
  visible.value = true
  return new Promise((resolve) => {
    resolve_ref.value = resolve
  })
}

function handle_confirm() {
  visible.value = false
  resolve_ref.value?.(true)
  resolve_ref.value = null
}

function handle_cancel() {
  visible.value = false
  resolve_ref.value?.(false)
  resolve_ref.value = null
}

defineExpose({
  show,
})
</script>

<template>
  <alert-dialog v-model:open="visible">
    <alert-dialog-content>
      <alert-dialog-header>
        <alert-dialog-title>{{ options.title }}</alert-dialog-title>
        <alert-dialog-description>{{ options.message }}</alert-dialog-description>
      </alert-dialog-header>
      <alert-dialog-footer>
        <alert-dialog-cancel @click="handle_cancel">
          {{ options.cancel_text }}
        </alert-dialog-cancel>
        <alert-dialog-action as-child>
          <Button :variant="options.danger ? 'destructive' : 'default'" @click="handle_confirm">
            {{ options.confirm_text }}
          </Button>
        </alert-dialog-action>
      </alert-dialog-footer>
    </alert-dialog-content>
  </alert-dialog>
</template>