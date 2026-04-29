<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/vue';
const themes = [
  { name: 'avemujica', label: 'AM', color: '#5a8fa8' },
  { name: 'mygo', label: 'MG', color: '#ff8899' },
];

const nav_items = [
  { label: '首页', key: 'home', href: '/home' },
  { label: '归档', key: 'archive', href: '/archive' },
  { label: '链接', key: 'links', href: '/links' },
  { label: '追番', key: 'anime', href: '/anime' },
  { label: '相册', key: 'gallery', href: '/gallery' },
  { label: '友人帐', key: 'friends', href: '/friends' },
];

const more_items = [{ label: '网站状态', key: 'status', href: '/status' }];

const route = useRoute();

function get_current_page_key(): string {
  const path = route.path;
  for (const item of nav_items) {
    if (path === item.href) return item.key;
  }
  for (const item of more_items) {
    if (path === item.href) return item.key;
  }
  return '';
}

const theme_idx = ref(0);
const is_mobile_menu_open = ref(false);
const is_search_open = ref(false);

function toggle_theme() {
  theme_idx.value = (theme_idx.value + 1) % themes.length;
  document.documentElement.setAttribute('data-theme', themes[theme_idx.value].name);
}

function open_search() {
  is_search_open.value = true;
}

function close_search() {
  is_search_open.value = false;
}

const input_ref = ref<HTMLInputElement | null>(null);
const query = ref('');

onMounted(() => {
  const handle_keydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && is_search_open.value) {
      close_search();
    }
  };
  window.addEventListener('keydown', handle_keydown);

  onUnmounted(() => {
    window.removeEventListener('keydown', handle_keydown);
  });
});
</script>

<template>
  <Button
    variant="ghost"
    size="icon-sm"
    class="fixed top-0 left-4 z-[60] md:hidden text-foreground hover:text-primary"
    @click="is_mobile_menu_open = !is_mobile_menu_open"
    aria-label="菜单"
  >
    <Icon icon="lucide:x" v-if="is_mobile_menu_open" class="size-4" />
    <Icon icon="lucide:menu" v-else class="size-4" />
  </Button>

  <nav
    class="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-md rounded-b-lg border border-border shadow-sm"
  >
    <div class="flex items-center gap-1 px-4 h-10">
      <div class="hidden md:flex items-center gap-1">
        <RouterLink
          v-for="item in nav_items"
          :key="item.key"
          :to="item.href"
          :class="
            cn(
              'px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
              get_current_page_key() === item.key
                ? 'text-primary bg-primary/10 rounded-md'
                : 'text-foreground hover:text-primary'
            )
          "
        >
          {{ item.label }}
        </RouterLink>

        <DropdownMenu>
          <DropdownMenuTrigger as="button" class="flex items-center">
            <Button variant="ghost" size="sm" class="gap-0.5">
              更多
              <Icon icon="lucide:chevron-down" class="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem v-for="item in more_items" :key="item.key" as-child>
              <RouterLink :to="item.href">{{ item.label }}</RouterLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RouterLink
        to="/home"
        class="md:hidden px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        首页
      </RouterLink>

      <div class="flex items-center gap-2">
        <button
          class="hidden md:flex items-center gap-1.5 px-2.5 py-1 h-7 bg-muted/50 rounded-md border border-border text-muted-foreground text-xs hover:bg-muted hover:text-foreground transition-colors"
          @click="open_search"
        >
          <Icon icon="lucide:search" class="size-3.5" />
          <span>搜索</span>
        </button>

        <button
          class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-muted"
          :style="{ color: themes[theme_idx].color }"
          :title="`当前: ${themes[theme_idx].label}`"
          @click="toggle_theme"
        >
          <Icon icon="lucide:palette" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </nav>

  <!-- 移动端菜单 -->
  <div
    v-if="is_mobile_menu_open"
    class="md:hidden fixed top-14 left-4 z-[60] bg-card rounded-xl border border-border shadow-sm min-w-[150px]"
  >
    <div class="flex flex-col gap-1 px-2 py-2">
      <RouterLink
        v-for="item in nav_items"
        :key="item.key"
        :to="item.href"
        class="px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg"
        @click="is_mobile_menu_open = false"
      >
        {{ item.label }}
      </RouterLink>
      <div class="border-t border-border my-1" />
      <span class="px-3 py-1 text-xs text-muted-foreground">更多</span>
      <RouterLink
        v-for="item in more_items"
        :key="item.key"
        :to="item.href"
        class="px-3 py-1.5 text-sm text-foreground hover:text-primary transition-colors rounded-lg pl-5"
        @click="is_mobile_menu_open = false"
      >
        {{ item.label }}
      </RouterLink>
    </div>
  </div>

  <!-- 搜索弹窗 -->
  <div
    v-if="is_search_open"
    class="fixed inset-0 z-[100] flex items-start justify-center pt-20"
    @click="close_search"
  >
    <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" />
    <div class="relative w-full max-w-xl mx-4" @click.stop>
      <div class="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Icon icon="lucide:search" class="size-4 text-muted-foreground" />
          <input
            ref="input_ref"
            v-model="query"
            type="text"
            placeholder="搜索文章、标签..."
            class="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            v-if="query"
            class="text-muted-foreground hover:text-foreground"
            @click="query = ''"
          >
            <Icon icon="lucide:x" class="size-4" />
          </button>
        </div>
        <div class="px-4 py-6 text-center text-muted-foreground text-sm">输入关键词搜索内容</div>
      </div>
      <div class="mt-2 text-center text-muted-foreground text-xs">按 ESC 或点击空白处关闭</div>
    </div>
  </div>
</template>
