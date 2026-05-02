<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/admin/components/ui/input';
import { Label } from '@/admin/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useAuthStore } from '@/stores/auth';
import type { TokenPair } from '@/lib/types/auth';
import { login, login_2fa, login_verify, register, get_me } from '@/lib/api/auth';
import { ApiError } from '@/lib/api-client';

type LoginStep = 'credentials' | 'verify';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const step = ref<LoginStep>('credentials');
const loading = ref(false);
const require_2fa = ref(false);
const temp_token = ref('');
const email = ref('');
const password = ref('');
const code = ref('');

function handle_error(err: unknown) {
  if (err instanceof ApiError) {
    const messages: Record<number, string> = {
      1002: '邮箱或密码错误',
      2001: '验证码错误',
      2002: '验证码错误或已过期',
      2003: '会话已过期，请重新登录',
    };
    toast.error(messages[err.code ?? -1] || err.message || '请求失败');
  } else if (err instanceof Error) {
    toast.error(err.message);
  } else {
    toast.error('请求失败');
  }
}

async function submit_credentials() {
  if (!email.value || !password.value) return;
  loading.value = true;

  async function handle_login_response(result: any) {
    // Direct token response — no 2FA/email verify needed
    if (result.access_token) {
      const tokens = result as TokenPair;
      auth.set_tokens(tokens.access_token, tokens.refresh_token);
      try {
        const user = await get_me();
        auth.set_user(user);
      } catch { /* non-critical */ }
      const redirect = (route.query.redirect as string) || '/admin/dashboard';
      toast.success('登录成功');
      router.push(redirect);
      return true;
    }

    // Need verification step
    temp_token.value = result.temp_token;
    require_2fa.value = result.require_2fa;
    step.value = 'verify';
    return true;
  }

  async function do_login(): Promise<boolean> {
    try {
      const result = await login(email.value, password.value);
      return await handle_login_response(result);
    } catch {
      return false;
    }
  }

  try {
    // Try login first
    const ok = await do_login();
    if (ok) return;

    // Login failed — try register for first-time setup
    try {
      await register(
        email.value.split('@')[0] || 'admin',
        email.value,
        password.value
      );
      toast.success('管理员账号已创建，请输入验证码完成验证');
    } catch (reg_err) {
      if (reg_err instanceof ApiError && reg_err.code === 1005) {
        toast.error('邮箱或密码错误');
      } else {
        handle_error(reg_err);
      }
      return;
    }

    // Register succeeded, retry login
    const ok2 = await do_login();
    if (!ok2) {
      toast.error('登录失败，请重试');
    }
  } catch (err) {
    handle_error(err);
  } finally {
    loading.value = false;
  }
}

async function submit_code() {
  if (!code.value || code.value.length < 6) return;
  loading.value = true;
  try {
    let tokens;
    if (require_2fa.value) {
      tokens = await login_2fa(temp_token.value, code.value);
    } else {
      tokens = await login_verify(temp_token.value, code.value);
    }
    auth.set_tokens(tokens.access_token, tokens.refresh_token);

    try {
      const user = await get_me();
      auth.set_user(user);
    } catch {
      // Non-critical
    }

    const redirect = (route.query.redirect as string) || '/admin/dashboard';
    toast.success('登录成功');
    router.push(redirect);
  } catch (err) {
    handle_error(err);
  } finally {
    loading.value = false;
  }
}

function go_back() {
  step.value = 'credentials';
  code.value = '';
}
</script>

<template>
  <div class="flex min-h-svh items-center justify-center bg-muted/30 p-4">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <div class="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Icon icon="lucide:shield" class="size-6 text-primary" />
        </div>
        <CardTitle class="text-xl">管理员登录</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- Step 1: 邮箱密码 -->
        <form v-if="step === 'credentials'" @submit.prevent="submit_credentials" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">邮箱</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="admin@example.com"
              autocomplete="email"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="password">密码</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            <Icon
              v-if="loading"
              icon="lucide:loader-circle"
              class="size-4 mr-1 animate-spin"
            />
            {{ loading ? '验证中...' : '登录' }}
          </Button>
        </form>

        <!-- Step 2: 验证码输入 -->
        <div v-else class="space-y-4">
          <div class="text-center text-sm text-muted-foreground">
            {{ require_2fa ? '请输入身份验证器中的 6 位代码' : '验证码已发送到您的邮箱' }}
          </div>

          <form @submit.prevent="submit_code" class="space-y-4">
            <div class="flex justify-center">
              <InputOTP v-model="code" :maxlength="6">
                <InputOTPGroup>
                  <InputOTPSlot v-for="i in 6" :key="i" :index="i - 1" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" class="w-full" :disabled="loading || code.length < 6">
              <Icon
                v-if="loading"
                icon="lucide:loader-circle"
                class="size-4 mr-1 animate-spin"
              />
              {{ loading ? '验证中...' : '确认' }}
            </Button>

            <Button variant="ghost" class="w-full" @click="go_back" :disabled="loading">
              <Icon icon="lucide:arrow-left" class="size-4 mr-1" />
              返回
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
