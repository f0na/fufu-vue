<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/admin/components/ui/avatar';
import { Icon } from '@iconify/vue';

const themes = [
  { name: 'avemujica', label: 'AM', color: '#5a8fa8' },
  { name: 'mygo', label: 'MG', color: '#ff8899' },
];

const current_theme = ref(themes[0]);

// Sync with existing theme on mount
if (!document.documentElement.getAttribute('data-theme')) {
  document.documentElement.setAttribute('data-theme', current_theme.value.name);
} else {
  const existing = themes.find(
    (t) => t.name === document.documentElement.getAttribute('data-theme')
  );
  if (existing) current_theme.value = existing;
}

function toggle_theme() {
  const idx = themes.indexOf(current_theme.value);
  const next_idx = (idx + 1) % themes.length;
  current_theme.value = themes[next_idx];
  document.documentElement.setAttribute('data-theme', current_theme.value.name);
}
</script>

<template>
  <header
    class="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0"
  >
    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold text-foreground">Fufu Admin</span>
    </div>

    <div class="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        @click="toggle_theme"
        :title="`主题: ${current_theme.label}`"
      >
        <Icon icon="lucide:palette" class="size-4" :style="{ color: current_theme.color }" />
      </Button>
      <Avatar class="size-8">
        <AvatarFallback class="bg-primary/10 text-primary text-xs">FF</AvatarFallback>
      </Avatar>
    </div>
  </header>
</template>
