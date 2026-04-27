<script setup lang="ts">
import { Spinner } from '@/components/ui/spinner'
import FriendCard from './friend-card.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { FriendItem } from '@/lib/types/friend'

interface Props {
  friends: FriendItem[]
  is_loading: boolean
  has_more: boolean
}

const props = defineProps<Props>()

const { sentinelRef } = useInfiniteScroll({
  has_more: props.has_more,
  onLoadMore: () => {},
  root_margin: '100px',
  disabled: props.is_loading || props.friends.length === 0,
})
</script>

<template>
  <div v-if="friends.length === 0 && !is_loading" class="py-8 text-center text-muted-foreground">
    暂无友链
  </div>

  <div v-else class="space-y-4 pb-20">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FriendCard v-for="friend in friends" :key="friend.id" :friend="friend" />
    </div>

    <div v-if="has_more" ref="sentinelRef" class="h-20 flex items-center justify-center">
      <Spinner v-if="is_loading" class="size-6" />
    </div>
  </div>
</template>
