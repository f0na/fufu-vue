<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import { useConfirm } from '@/composables/useConfirm'
import { useBangumiEdit } from '@/composables/useBangumiEdit'
import { useLinkEdit } from '@/composables/useLinkEdit'
import { useGalleryEdit } from '@/composables/useGalleryEdit'
import Toast from '@/components/common/Toast.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const route = useRoute()
const confirm_modal_ref = ref<InstanceType<typeof ConfirmModal> | null>(null)
const { set_modal_ref } = useConfirm()
const { edit_mode: bangumi_edit_mode, reset_edit_mode: reset_bangumi_edit } = useBangumiEdit()
const { edit_mode: link_edit_mode, reset_edit_mode: reset_link_edit } = useLinkEdit()
const { edit_mode: gallery_edit_mode, reset_edit_mode: reset_gallery_edit } = useGalleryEdit()

onMounted(() => {
  set_modal_ref(confirm_modal_ref.value)
})

// 路由变化时退出编辑模式
watch(
  () => route.path,
  (new_path, old_path) => {
    if (old_path && new_path !== old_path) {
      if (bangumi_edit_mode.value !== 'none') {
        reset_bangumi_edit()
      }
      if (link_edit_mode.value !== 'none') {
        reset_link_edit()
      }
      if (gallery_edit_mode.value !== 'none') {
        reset_gallery_edit()
      }
    }
  },
)
</script>

<template>
  <RouterView />
  <Toast />
  <ConfirmModal ref="confirm_modal_ref" />
</template>
