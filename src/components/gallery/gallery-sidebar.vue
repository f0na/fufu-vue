<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'

const portal_target_ref = ref<HTMLDivElement | null>(null)
const portal = inject<any>('rightSidebarPortal', null)

onMounted(() => {
  if (portal && portal_target_ref.value) {
    portal.set_portal_target(portal_target_ref.value)
  }
})

onUnmounted(() => {
  if (portal) {
    portal.set_portal_target(null)
  }
})

interface Props {
  tags: string[]
  all_tags: string[]
  is_portal_target?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  is_portal_target: false,
})
const emit = defineEmits<{
  'update:tags': [tags: string[]]
}>()

function handle_tag_click(tag: string) {
  if (props.tags.includes(tag)) {
    emit('update:tags', props.tags.filter(t => t !== tag))
  } else {
    emit('update:tags', [...props.tags, tag])
  }
}

function handle_all_click() {
  emit('update:tags', [])
}
</script>

<template>
  <aside class="flex flex-col gap-4 w-full">
    <!-- Portal target - 看板娘渲染位置 -->
    <div v-if="is_portal_target" ref="portal_target_ref" />

    <!-- 标签筛选 -->
    <Card size="sm">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Icon icon="lucide:tag" class="h-4 w-4" />
          标签
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            :variant="tags.length === 0 ? 'default' : 'outline'"
            size="sm"
            @click="handle_all_click"
          >
            全部
          </Button>
          <Button
            v-for="tag_item in all_tags"
            :key="tag_item"
            :variant="tags.includes(tag_item) ? 'default' : 'outline'"
            size="sm"
            @click="handle_tag_click(tag_item)"
          >
            {{ tag_item }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </aside>
</template>
