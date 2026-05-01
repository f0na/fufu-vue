<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/admin/components/ui/avatar';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import { logout } from '@/lib/api/auth';

const router = useRouter();
const auth = useAuthStore();

const THEMES = [
  { name: 'avemujica', label: 'AM', color: '#5a8fa8' },
  { name: 'mygo', label: 'MG', color: '#ff8899' },
];

const saved_name = localStorage.getItem('fufu-theme');
const init_name = saved_name && THEMES.some((t) => t.name === saved_name) ? saved_name : 'avemujica';

document.documentElement.setAttribute('data-theme', init_name);
localStorage.setItem('fufu-theme', init_name);

const current = ref(THEMES.find((t) => t.name === init_name)!);
const show_user_menu = ref(false);

const user_initials = computed(() => {
  if (auth.user) {
    return auth.user.username.slice(0, 2).toUpperCase();
  }
  return 'FF';
});

function toggle() {
  const next_name = current.value.name === 'avemujica' ? 'mygo' : 'avemujica';
  document.documentElement.setAttribute('data-theme', next_name);
  localStorage.setItem('fufu-theme', next_name);
  current.value = THEMES.find((t) => t.name === next_name)!;
}

async function handle_logout() {
  try {
    if (auth.refresh_token) {
      await logout(auth.refresh_token);
    }
  } catch {
    // Ignore logout API errors
  }
  auth.clear();
  toast.success('已登出');
  router.push('/admin/login');
}

function go_to_login() {
  router.push('/admin/login');
}

function toggle_user_menu() {
  show_user_menu.value = !show_user_menu.value;
}

function close_user_menu() {
  show_user_menu.value = false;
}
</script>

<template>
  <header class="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 relative">
    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold text-foreground">Fufu Admin</span>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon-sm" @click="toggle" :title="`主题: ${current.label}`">
        <Icon icon="lucide:palette" class="size-4" :style="{ color: current.color }" />
      </Button>

      <template v-if="auth.is_authenticated">
        <div class="relative">
          <button class="flex items-center gap-2 cursor-pointer" @click="toggle_user_menu" @blur="close_user_menu">
            <Avatar class="size-8">
              <AvatarFallback class="bg-primary/10 text-primary text-xs">{{ user_initials }}</AvatarFallback>
            </Avatar>
          </button>
          <div
            v-if="show_user_menu"
            class="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-popover shadow-md z-50 py-1"
            @mousedown.prevent
          >
            <div class="px-3 py-2 text-xs text-muted-foreground border-b border-border">
              {{ auth.user?.username || '管理员' }}
            </div>
            <button
              class="w-full px-3 py-1.5 text-sm text-left text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
              @click="handle_logout"
            >
              <Icon icon="lucide:log-out" class="size-3.5" />
              登出
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <Button variant="ghost" size="sm" @click="go_to_login">
          <Icon icon="lucide:log-in" class="size-3.5 mr-1" />
          登录
        </Button>
      </template>
    </div>
  </header>
</template>
