<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export interface AnnouncementItem {
  id: string;
  content: string;
  time: string;
}

interface Props {
  title?: string;
  announcements?: AnnouncementItem[];
  max_display?: number;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '公告',
  announcements: () => [
    {
      id: '1',
      content: '欢迎来到我的小站！这里是我的个人空间。',
      time: '2026-04-17',
    },
  ],
  max_display: 3,
});

const settings_announcements = ref<AnnouncementItem[]>([]);

onMounted(async () => {
  try {
    const res = await fetch('/content/settings.json');
    if (res.ok) {
      const data = await res.json();
      if (data.announcements && Array.isArray(data.announcements)) {
        settings_announcements.value = data.announcements;
      }
    }
  } catch {
    // fallback to props
  }
});

const display_items = computed(() => {
  const source = settings_announcements.value.length > 0 ? settings_announcements.value : props.announcements;
  return source.slice(0, props.max_display);
});
</script>

<template>
  <Card size="sm" :class="props.class">
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <div v-for="item in display_items" :key="item.id" class="text-sm">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs text-muted-foreground/60">{{ item.time }}</span>
        </div>
        <p class="text-muted-foreground leading-relaxed">{{ item.content }}</p>
      </div>
    </CardContent>
  </Card>
</template>
