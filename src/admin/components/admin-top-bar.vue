<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/admin/components/ui/avatar';
import { Icon } from '@iconify/vue';

const THEMES = [
  { name: 'avemujica', label: 'AM', color: '#5a8fa8' },
  { name: 'mygo', label: 'MG', color: '#ff8899' },
];

const saved_name = localStorage.getItem('fufu-theme');
const init_name = saved_name && THEMES.some((t) => t.name === saved_name) ? saved_name : 'avemujica';

document.documentElement.setAttribute('data-theme', init_name);
localStorage.setItem('fufu-theme', init_name);

const current = ref(THEMES.find((t) => t.name === init_name)!);

function toggle() {
  const next_name = current.value.name === 'avemujica' ? 'mygo' : 'avemujica';
  document.documentElement.setAttribute('data-theme', next_name);
  localStorage.setItem('fufu-theme', next_name);
  current.value = THEMES.find((t) => t.name === next_name)!;
}
</script>

<template>
  <header class="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold text-foreground">Fufu Admin</span>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon-sm" @click="toggle" :title="`主题: ${current.label}`">
        <Icon icon="lucide:palette" class="size-4" :style="{ color: current.color }" />
      </Button>
      <Avatar class="size-8">
        <AvatarFallback class="bg-primary/10 text-primary text-xs">FF</AvatarFallback>
      </Avatar>
    </div>
  </header>
</template>
