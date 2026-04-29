<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/vue';
export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

interface Props {
  headings: TocHeading[];
  collapsible?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: false,
});

const active_id = ref<string | null>(null);
const is_expanded = ref(!props.collapsible);

let observer: IntersectionObserver | null = null;

function scroll_to_heading(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function get_indent_class(level: number) {
  switch (level) {
    case 1:
      return 'pl-0';
    case 2:
      return 'pl-3';
    case 3:
      return 'pl-6';
    case 4:
      return 'pl-9';
    case 5:
      return 'pl-12';
    case 6:
      return 'pl-15';
    default:
      return 'pl-0';
  }
}

function setup_observer(headings: TocHeading[]) {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (headings.length === 0) return;

  observer = new IntersectionObserver(
    (entries) => {
      const visible_entries = entries.filter((entry) => entry.isIntersecting);
      if (visible_entries.length > 0) {
        visible_entries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        active_id.value = visible_entries[0].target.id;
      }
    },
    {
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0,
    }
  );

  headings.forEach(({ id }) => {
    const element = document.getElementById(id);
    if (element && observer) {
      observer.observe(element);
    }
  });
}

watch(
  () => props.headings,
  (new_headings) => {
    setup_observer(new_headings);
  },
  { immediate: true }
);

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

const should_show_content = !props.collapsible || is_expanded;
</script>

<template>
  <Card v-if="headings.length > 0" size="sm" :class="props.class">
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle>目录</CardTitle>
      <Button
        v-if="collapsible"
        variant="ghost"
        size="icon-xs"
        @click="is_expanded = !is_expanded"
        :aria-label="is_expanded ? '收起目录' : '展开目录'"
      >
        <Icon
          icon="lucide:chevron-down"
          :class="cn('size-4 transition-transform', is_expanded && 'rotate-180')"
        />
      </Button>
    </CardHeader>
    <CardContent v-if="should_show_content">
      <nav class="space-y-1">
        <button
          v-for="(heading, index) in headings"
          :key="`${heading.id}-${index}`"
          @click="scroll_to_heading(heading.id)"
          :class="
            cn(
              'w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors',
              'hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'truncate block',
              get_indent_class(heading.level),
              active_id === heading.id
                ? 'text-primary font-medium bg-muted/50'
                : 'text-muted-foreground'
            )
          "
          :title="heading.text"
        >
          {{ heading.text }}
        </button>
      </nav>
    </CardContent>
  </Card>
</template>
