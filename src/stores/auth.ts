import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthUser } from '@/lib/types/auth';

const ACCESS_KEY = 'fufu-access-token';
const REFRESH_KEY = 'fufu-refresh-token';

export const useAuthStore = defineStore('auth', () => {
  const access_token = ref(localStorage.getItem(ACCESS_KEY) || '');
  const refresh_token = ref(localStorage.getItem(REFRESH_KEY) || '');
  const temp_token = ref('');
  const user = ref<AuthUser | null>(null);

  const is_authenticated = computed(() => !!access_token.value);

  function set_tokens(access: string, refresh: string) {
    access_token.value = access;
    refresh_token.value = refresh;
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }

  function set_temp_token(token: string) {
    temp_token.value = token;
  }

  function set_user(u: AuthUser) {
    user.value = u;
  }

  function clear() {
    access_token.value = '';
    refresh_token.value = '';
    temp_token.value = '';
    user.value = null;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  return {
    access_token,
    refresh_token,
    temp_token,
    user,
    is_authenticated,
    set_tokens,
    set_temp_token,
    set_user,
    clear,
  };
});
