<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/vue';
import { RightSidebarPortalKey } from '@/context/right-sidebar-portal';
import type { RightSidebarPortalValue } from '@/context/right-sidebar-portal';
interface Props {
  sort: 'asc' | 'desc';
  year: string | undefined;
  tags: string[];
  all_tags: string[];
  years: string[];
  is_portal_target?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  is_portal_target: false,
});

const emit = defineEmits<{
  'update:sort': [sort: 'asc' | 'desc'];
  'update:year': [year: string | undefined];
  'update:tags': [tags: string[]];
}>();

const portal_target_ref = ref<HTMLDivElement | null>(null);

const handle_tag_click = (tag_item: string) => {
  if (props.tags.includes(tag_item)) {
    emit(
      'update:tags',
      props.tags.filter((t) => t !== tag_item)
    );
  } else {
    emit('update:tags', [...props.tags, tag_item]);
  }
};

const handle_all_click = () => {
  emit('update:tags', []);
};

onMounted(() => {
  if (props.is_portal_target && portal_target_ref.value) {
    const portal = inject<RightSidebarPortalValue>(RightSidebarPortalKey);
    if (portal) {
      portal.set_portal_target(portal_target_ref.value);
    }
  }
});

onUnmounted(() => {
  if (props.is_portal_target) {
    const portal = inject<RightSidebarPortalValue>(RightSidebarPortalKey);
    if (portal) {
      portal.set_portal_target(null);
    }
  }
});
</script>

<template>
  <aside class="flex flex-col gap-4 w-full">
    <div v-if="is_portal_target" ref="portal_target_ref" />

    <Card size="sm">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Icon icon="lucide:arrow-up-down" class="h-4 w-4" />
          排序
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            :variant="sort === 'desc' ? 'default' : 'outline'"
            size="sm"
            @click="emit('update:sort', 'desc')"
          >
            时间倒序
          </Button>
          <Button
            :variant="sort === 'asc' ? 'default' : 'outline'"
            size="sm"
            @click="emit('update:sort', 'asc')"
          >
            时间正序
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card size="sm">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Icon icon="lucide:calendar" class="h-4 w-4" />
          年份
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            :variant="year === undefined ? 'default' : 'outline'"
            size="sm"
            @click="emit('update:year', undefined)"
          >
            全部
          </Button>
          <Button
            v-for="year_item in years"
            :key="year_item"
            :variant="year === year_item ? 'default' : 'outline'"
            size="sm"
            @click="emit('update:year', year_item)"
          >
            {{ year_item }}
          </Button>
        </div>
      </CardContent>
    </Card>

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
