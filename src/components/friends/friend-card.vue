<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FriendItem } from '@/lib/types/friend';

interface Props {
  friend: FriendItem;
  class?: string;
}

const props = defineProps<Props>();

const avatar_loaded = ref(false);
const favicon_loaded = ref(false);
const favicon_api_loaded = ref(false);

const friend_info = computed(() => {
  try {
    const url_obj = new URL(props.friend.url);
    const domain = url_obj.hostname.replace(/^www\./, '');
    return {
      primary_avatar: props.friend.avatar || null,
      favicon_url: `${url_obj.origin}/favicon.ico`,
      favicon_api_url: `https://api.iowen.cn/favicon/${domain}.png`,
      site_initial: domain.charAt(0).toUpperCase(),
    };
  } catch {
    return {
      primary_avatar: props.friend.avatar || null,
      favicon_url: null,
      favicon_api_url: null,
      site_initial: null,
    };
  }
});

const show_avatar = computed(() => friend_info.value.primary_avatar && avatar_loaded.value);
const show_favicon = computed(() => friend_info.value.favicon_url && favicon_loaded.value);
const show_favicon_api = computed(
  () => friend_info.value.favicon_api_url && favicon_api_loaded.value && !favicon_loaded.value
);
const show_initial = computed(
  () => friend_info.value.site_initial && /^[A-Za-z0-9]$/.test(friend_info.value.site_initial)
);

const handle_click = () => {
  window.open(props.friend.url, '_blank');
};

const preload_image = (src: string, success_cb: () => void, fail_cb?: () => void) => {
  if (!src) return;
  const img = new Image();
  img.src = src;
  img.onload = success_cb;
  img.onerror = fail_cb || (() => {});
};

watch(
  () => friend_info.value.primary_avatar,
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
  () => friend_info.value.favicon_url,
  (val) => {
    if (val && !favicon_loaded.value) {
      preload_image(val, () => {
        favicon_loaded.value = true;
      });
    }
  },
  { immediate: true }
);

watch(
  () => [friend_info.value.favicon_api_url, favicon_loaded.value, favicon_api_loaded.value],
  () => {
    if (friend_info.value.favicon_api_url && !favicon_api_loaded.value && !favicon_loaded.value) {
      preload_image(friend_info.value.favicon_api_url, () => {
        favicon_api_loaded.value = true;
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <Card
    :class="cn('cursor-pointer transition-all hover:ring-primary/30 hover:shadow-md', props.class)"
    @click="handle_click"
  >
    <CardHeader>
      <CardTitle class="flex items-center gap-3">
        <!-- avatar -->
        <img
          v-if="show_avatar"
          :src="friend_info.primary_avatar!"
          :alt="friend.name"
          class="size-12 shrink-0 rounded-lg object-cover"
        />
        <!-- favicon -->
        <img
          v-else-if="show_favicon"
          :src="friend_info.favicon_url!"
          alt=""
          class="size-12 shrink-0 rounded-lg object-cover"
        />
        <!-- favicon api -->
        <img
          v-else-if="show_favicon_api"
          :src="friend_info.favicon_api_url!"
          alt=""
          class="size-12 shrink-0 rounded-lg object-cover"
        />
        <!-- site initial -->
        <div
          v-else-if="show_initial"
          class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-medium text-muted-foreground"
        >
          {{ friend_info.site_initial }}
        </div>
        <!-- default -->
        <div
          v-else
          class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-medium text-muted-foreground"
        >
          ?
        </div>

        <span class="truncate">{{ friend.name }}</span>
      </CardTitle>
    </CardHeader>
    <CardContent v-if="friend.description">
      <p class="line-clamp-2 text-sm text-muted-foreground">
        {{ friend.description }}
      </p>
    </CardContent>
  </Card>
</template>
