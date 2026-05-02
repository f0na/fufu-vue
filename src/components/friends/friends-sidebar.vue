<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import { RightSidebarPortalKey } from '@/context/right-sidebar-portal';
import type { RightSidebarPortalValue } from '@/context/right-sidebar-portal';
import { create_friend } from '@/lib/api/friends';
interface Props {
  is_portal_target?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  is_portal_target: false,
});

const link_url = ref('');
const avatar_url = ref('');
const avatar_loaded = ref(false);
const favicon_loaded = ref(false);
const name = ref('');
const description = ref('');
const submitting = ref(false);

const portal_target_ref = ref<HTMLDivElement | null>(null);

const processed_url = computed(() => {
  if (!link_url.value) return null;
  if (link_url.value.startsWith('http://') || link_url.value.startsWith('https://')) {
    return link_url.value;
  }
  return 'https://' + link_url.value;
});

const favicon_info = computed(() => {
  try {
    if (!processed_url.value)
      return { favicon_url: null, site_initial: null };
    const url_obj = new URL(processed_url.value);
    const domain = url_obj.hostname.replace(/^www\./, '');
    return {
      favicon_url: `https://favicon.im/${domain}`,
      site_initial: domain.charAt(0).toUpperCase(),
    };
  } catch {
    return { favicon_url: null, site_initial: null };
  }
});

const show_avatar_preview = computed(() => avatar_url.value && avatar_loaded.value);
const show_favicon_preview = computed(() => favicon_info.value.favicon_url && favicon_loaded.value);
const show_initial_preview = computed(
  () => favicon_info.value.site_initial && /^[A-Za-z0-9]$/.test(favicon_info.value.site_initial)
);

watch(
  () => link_url.value,
  () => {
    favicon_loaded.value = false;
  }
);

watch(
  () => avatar_url.value,
  () => {
    avatar_loaded.value = false;
  }
);

const handle_submit = async () => {
  const final_url = processed_url.value || link_url.value;
  if (!final_url || !name.value) return;

  submitting.value = true;
  try {
    await create_friend({
      url: final_url,
      name: name.value,
      avatar_url: avatar_url.value || undefined,
      description: description.value || undefined,
    });
    toast.success('友链申请已提交');
    link_url.value = '';
    avatar_url.value = '';
    name.value = '';
    description.value = '';
  } catch {
    toast.error('提交失败，请重试');
  } finally {
    submitting.value = false;
  }
};

const preload_image = (src: string, success_cb: () => void, fail_cb?: () => void) => {
  if (!src) return;
  const img = new Image();
  img.src = src;
  img.onload = success_cb;
  img.onerror = fail_cb || (() => {});
};

watch(
  () => avatar_url.value,
  (val) => {
    if (val && !avatar_loaded.value) {
      preload_image(val, () => {
        avatar_loaded.value = true;
      });
    }
  },
  { immediate: true }
);

watch(
  () => favicon_info.value.favicon_url,
  (val) => {
    if (val && !favicon_loaded.value) {
      preload_image(val, () => {
        favicon_loaded.value = true;
      });
    }
  },
  { immediate: true }
);

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
          <Icon icon="lucide:user-plus" class="h-4 w-4" />
          申请友链
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="space-y-1.5">
          <label class="text-xs text-muted-foreground">网站链接 *</label>
          <Input placeholder="example.com" v-model="link_url" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs text-muted-foreground">头像链接</label>
          <Input placeholder="https://example.com/avatar.png" v-model="avatar_url" />
          <div class="flex items-center gap-2 pt-1">
            <!-- avatar loaded -->
            <img
              v-if="show_avatar_preview"
              :src="avatar_url"
              alt="头像预览"
              class="size-10 rounded-lg object-cover"
            />
            <!-- favicon loaded -->
            <img
              v-else-if="show_favicon_preview"
              :src="favicon_info.favicon_url!"
              alt="网站图标"
              class="size-10 rounded-lg object-cover"
            />
            <!-- site initial -->
            <div
              v-else-if="show_initial_preview"
              class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-medium text-muted-foreground"
            >
              {{ favicon_info.site_initial }}
            </div>
            <!-- default -->
            <div
              v-else
              class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-medium text-muted-foreground"
            >
              ?
            </div>
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs text-muted-foreground">名称 *</label>
          <Input placeholder="您的站点名称" v-model="name" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs text-muted-foreground">描述</label>
          <Textarea placeholder="简短介绍您的站点..." v-model="description" class="min-h-[60px]" />
        </div>
        <Button class="w-full" @click="handle_submit" :disabled="!link_url || !name || submitting">
          <Spinner v-if="submitting" class="mr-2 size-4" />
          添加申请
        </Button>
      </CardContent>
    </Card>
  </aside>
</template>
