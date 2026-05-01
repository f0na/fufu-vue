<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/vue';
import { search_content, type SearchResult } from '@/lib/api/search';

const THEMES = [
  { name: 'avemujica', label: 'AM', color: '#5a8fa8' },
  { name: 'mygo', label: 'MG', color: '#ff8899' },
];

const saved_name = localStorage.getItem('fufu-theme');
const init_name = saved_name && THEMES.some((t) => t.name === saved_name) ? saved_name : 'avemujica';

document.documentElement.setAttribute('data-theme', init_name);
localStorage.setItem('fufu-theme', init_name);

const current_theme = ref(THEMES.find((t) => t.name === init_name)!);

function toggle_theme() {
  const next_name = current_theme.value.name === 'avemujica' ? 'mygo' : 'avemujica';
  document.documentElement.setAttribute('data-theme', next_name);
  localStorage.setItem('fufu-theme', next_name);
  current_theme.value = THEMES.find((t) => t.name === next_name)!;
}

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

const is_mobile_menu_open = ref(false);
const is_search_open = ref(false);

function open_search() {
  is_search_open.value = true;
}

function close_search() {
  is_search_open.value = false;
}

const router = useRouter();

const input_ref = ref<HTMLInputElement | null>(null);
const query = ref('');
const search_results = ref<SearchResult[]>([]);
const is_searching = ref(false);
const search_total = ref(0);
let search_timer: ReturnType<typeof setTimeout> | null = null;

async function do_search(q: string) {
  if (!q.trim() || q.trim().length < 2) {
    search_results.value = [];
    search_total.value = 0;
    return;
  }

  is_searching.value = true;
  try {
    const res = await search_content({ q: q.trim(), page_size: 10 });
    search_results.value = res.data;
    search_total.value = res.total;
  } catch {
    search_results.value = [];
    search_total.value = 0;
  }
  is_searching.value = false;
}

function handle_input() {
  if (search_timer) clearTimeout(search_timer);
  search_timer = setTimeout(() => do_search(query.value), 300);
}

function go_to_result(item: SearchResult) {
  close_search();
  if (item.url) {
    router.push(item.url);
  }
}

function type_icon(type: SearchResult['type']): string {
  const map: Record<string, string> = {
    post: 'lucide:file-text',
    link: 'lucide:link',
    gallery: 'lucide:images',
    friend: 'lucide:users',
    announcement: 'lucide:megaphone',
  };
  return map[type] || 'lucide:search';
}

function type_label(type: SearchResult['type']): string {
  const map: Record<string, string> = {
    post: '文章',
    link: '链接',
    gallery: '相册',
    friend: '友人',
    announcement: '公告',
  };
  return map[type] || type;
}

watch(is_search_open, (open) => {
  if (open) {
    setTimeout(() => input_ref.value?.focus(), 100);
  } else {
    query.value = '';
    search_results.value = [];
    search_total.value = 0;
  }
});

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
          :style="{ color: current_theme.color }"
          :title="`当前: ${current_theme.label}`"
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
          <Icon icon="lucide:search" class="size-4 text-muted-foreground shrink-0" />
          <input
            ref="input_ref"
            v-model="query"
            type="text"
            placeholder="搜索文章、链接、友人帐..."
            class="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            @input="handle_input"
          />
          <div v-if="is_searching" class="size-4 animate-spin text-muted-foreground">
            <Icon icon="lucide:loader-2" class="size-4" />
          </div>
          <button
            v-if="query && !is_searching"
            class="text-muted-foreground hover:text-foreground"
            @click="query = ''; search_results = []; search_total = 0"
          >
            <Icon icon="lucide:x" class="size-4" />
          </button>
        </div>

        <!-- 搜索结果 -->
        <div v-if="search_results.length > 0" class="max-h-80 overflow-y-auto">
          <div
            v-for="item in search_results"
            :key="`${item.type}-${item.url || item.title}`"
            class="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
            @click="go_to_result(item)"
          >
            <div class="shrink-0 mt-0.5">
              <Icon
                :icon="type_icon(item.type)"
                class="size-4 text-muted-foreground"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-foreground truncate">{{ item.title }}</div>
              <div class="text-xs text-muted-foreground line-clamp-2 mt-0.5">{{ item.snippet }}</div>
            </div>
            <div class="shrink-0">
              <span class="text-[10px] text-muted-foreground/60 px-1.5 py-0.5 rounded bg-muted">{{ type_label(item.type) }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-else
          class="px-4 py-6 text-center text-muted-foreground text-sm"
        >
          {{ query ? '未找到相关内容' : '输入关键词搜索文章、链接、友人帐...' }}
        </div>
      </div>
      <div class="mt-2 text-center text-muted-foreground text-xs">
        {{ query ? `共 ${search_total} 条结果 · ` : '' }}按 ESC 或点击空白处关闭
      </div>
    </div>
  </div>
</template>
