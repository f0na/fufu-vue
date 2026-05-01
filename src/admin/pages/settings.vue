<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/admin/components/ui/input';
import { Textarea } from '@/admin/components/ui/textarea';
import { Label } from '@/admin/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as settings_api from '@/lib/api/settings';
import { upload_to_github } from '@/lib/api/upload';

const router = useRouter();
const upload_loading = ref(false);
const avatar_file_input = ref<HTMLInputElement | null>(null);

async function handle_avatar_upload(files: FileList | null) {
  const file = files?.[0];
  if (!file) return;
  upload_loading.value = true;
  try {
    const url = await upload_to_github(file);
    form.site.avatar_url = url;
  } catch (err) {
    toast.error('头像上传失败：' + (err instanceof Error ? err.message : ''));
  } finally {
    upload_loading.value = false;
    if (avatar_file_input.value) avatar_file_input.value.value = '';
  }
}

interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

interface AnnouncementItem {
  id: string;
  content: string;
  time: string;
}

interface SiteSettings {
  site: {
    name: string;
    avatar_url: string;
    greeting: string;
    description: string;
    keywords: string;
  };
  hero: {
    image_url: string;
  };
  footer: {
    icp_beian: string;
    copyright: string;
    license_label: string;
    license_url: string;
    privacy_label: string;
    privacy_url: string;
  };
  social_links: SocialLink[];
  announcements: AnnouncementItem[];
}

const default_settings: SiteSettings = {
  site: {
    name: 'Fufu',
    avatar_url: 'https://www.loliapi.com/acg/pp/',
    greeting: 'Ciallo～(∠・ω< )⌒★',
    description: '这里是可爱芙芙的小窝，欢迎大家^^',
    keywords: '博客,个人站,二次元,芙芙',
  },
  hero: {
    image_url: 'https://t.alcy.cc/moez',
  },
  footer: {
    icp_beian: '',
    copyright: 'fufu',
    license_label: '许可证',
    license_url: '/license',
    privacy_label: '隐私政策',
    privacy_url: '/privacy',
  },
  social_links: [
    { platform: 'bilibili', label: 'Bilibili', url: 'https://space.bilibili.com/' },
    { platform: 'github', label: 'GitHub', url: 'https://github.com/' },
    { platform: 'email', label: 'Email', url: 'mailto:example@email.com' },
  ],
  announcements: [
    { id: '1', content: '欢迎来到我的小站！这里是我的个人空间。', time: '2026-04-17' },
  ],
};

const loading = ref(true);
const saving = ref(false);

const form = reactive<SiteSettings>({ ...JSON.parse(JSON.stringify(default_settings)) });
const initial = ref<string>(''); // JSON snapshot for change detection

onMounted(async () => {
  try {
    // Load from backend API
    const [profile, footer, social_links, announcements] = await Promise.all([
      settings_api.get_profile().catch(() => null),
      settings_api.get_footer().catch(() => null),
      settings_api.get_social_links().catch(() => null),
      settings_api.get_announcements().catch(() => null),
    ]);

    const merged = JSON.parse(JSON.stringify(default_settings));

    if (profile?.data) {
      merged.site.name = profile.data.site_name || merged.site.name;
      merged.site.avatar_url = profile.data.logo_url || merged.site.avatar_url;
      merged.site.description = profile.data.description || merged.site.description;
      merged.site.keywords = profile.data.keywords || merged.site.keywords;
      merged.footer.icp_beian = profile.data.icp_beian || merged.footer.icp_beian;
    }

    if (footer?.data) {
      merged.footer.copyright = footer.data.copyright_text || merged.footer.copyright;
    }

    if (Array.isArray(social_links)) {
      merged.social_links = social_links.map((l) => ({
        platform: l.platform,
        label: l.label,
        url: l.url,
      }));
    }

    if (Array.isArray(announcements)) {
      merged.announcements = announcements.map((a) => ({
        id: a.id,
        content: a.content,
        time: a.created_at?.split('T')[0] || '',
      }));
    }

    Object.assign(form, merged);
  } catch {
    // Use defaults when backend is unavailable
  } finally {
    initial.value = JSON.stringify(form);
    loading.value = false;
  }
});

function social_icon(platform: string): string {
  if (!platform) return 'lucide:link';
  if (platform === 'email') return 'lucide:mail';
  const key = platform.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `simple-icons:${key}`;
}

function add_social_link() {
  form.social_links.push({ platform: '', label: '', url: '' });
}

function remove_social_link(idx: number) {
  form.social_links.splice(idx, 1);
}

function generate_announcement_id(): string {
  const existing_ids = form.announcements.map((a) => a.id);
  let num = form.announcements.length + 1;
  let id: string;
  do {
    id = String(num);
    num++;
  } while (existing_ids.includes(id));
  return id;
}

function add_announcement() {
  form.announcements.push({
    id: generate_announcement_id(),
    content: '',
    time: new Date().toISOString().split('T')[0],
  });
}

function remove_announcement(idx: number) {
  form.announcements.splice(idx, 1);
}

async function save_settings() {
  saving.value = true;
  try {
    const prev: SiteSettings = JSON.parse(initial.value);

    // --- Profile fields (只提交有变更的字段) ---
    const profile_changes: Record<string, string | undefined> = {};
    if (form.site.name !== prev.site.name) profile_changes.site_name = form.site.name;
    if (form.site.avatar_url !== prev.site.avatar_url) profile_changes.logo_url = form.site.avatar_url;
    if (form.site.description !== prev.site.description) profile_changes.description = form.site.description;
    if (form.site.keywords !== prev.site.keywords) profile_changes.keywords = form.site.keywords;
    if (form.footer.icp_beian !== prev.footer.icp_beian) profile_changes.icp_beian = form.footer.icp_beian;

    if (Object.keys(profile_changes).length > 0) {
      await settings_api.update_profile(profile_changes);
    }

    // --- Footer (只提交有变更的字段) ---
    const footer_changes: Record<string, string | undefined> = {};
    if (form.footer.copyright !== prev.footer.copyright) footer_changes.copyright_text = form.footer.copyright;

    if (Object.keys(footer_changes).length > 0) {
      await settings_api.update_footer(footer_changes);
    }

    // --- Social links (内容有变化才全量替换) ---
    if (JSON.stringify(form.social_links) !== JSON.stringify(prev.social_links)) {
      const existing_social = await settings_api.get_social_links().catch(() => []);
      await Promise.all([
        ...existing_social.map((l) => settings_api.delete_social_link(l.id).catch(() => {})),
        ...form.social_links.map((l) =>
          settings_api.create_social_link({
            platform: l.platform,
            label: l.label,
            url: l.url,
            sort_order: form.social_links.indexOf(l),
          }).catch(() => {})
        ),
      ]);
    }

    // --- Announcements (内容有变化才全量替换) ---
    if (JSON.stringify(form.announcements) !== JSON.stringify(prev.announcements)) {
      const existing_ann = await settings_api.get_announcements().catch(() => []);
      await Promise.all([
        ...existing_ann.map((a) => settings_api.delete_announcement(a.id).catch(() => {})),
        ...form.announcements.map((a) =>
          settings_api.create_announcement({
            content: a.content,
            active: true,
            sort_order: form.announcements.indexOf(a),
          }).catch(() => {})
        ),
      ]);
    }

    // 保存成功后更新快照
    initial.value = JSON.stringify(form);

    toast.success('设置已保存');
  } catch (e) {
    toast.error('保存失败：' + (e instanceof Error ? e.message : '未知错误'));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <!-- Template unchanged from original -->
  <div>
    <!-- 页头 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">系统设置</h1>
        <p class="text-sm text-muted-foreground mt-1">管理站点的全局配置</p>
      </div>
      <Button size="sm" :disabled="saving" @click.prevent="save_settings">
        <Icon
          :icon="saving ? 'lucide:loader-circle' : 'lucide:save'"
          :class="['size-4 mr-1', saving ? 'animate-spin' : '']"
        />
        {{ saving ? '保存中...' : '保存设置' }}
      </Button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20 text-muted-foreground">
      <Icon icon="lucide:loader-circle" class="size-5 animate-spin mr-2" />
      加载中...
    </div>

    <div v-else class="space-y-6">
      <!-- 基本信息 -->
      <Card size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:info" class="size-4 text-muted-foreground" />
            基本信息
          </CardTitle>
          <p class="text-xs text-muted-foreground">
            对应入口页面和首页左侧的个人信息卡片
          </p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="site-name">站点名称</Label>
            <Input id="site-name" v-model="form.site.name" placeholder="Fufu" />
          </div>
          <div class="space-y-2">
            <Label for="avatar">头像 URL</Label>
            <div class="flex flex-col gap-3">
              <img
                :src="form.site.avatar_url"
                alt="avatar"
                class="size-24 rounded-lg object-cover bg-muted shrink-0"
                @error="($event.target as HTMLImageElement).style.display='none'"
              />
              <div class="flex items-center gap-3">
                <input
                  ref="avatar_file_input"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handle_avatar_upload(($event.target as HTMLInputElement).files)"
                />
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="upload_loading"
                  @click="avatar_file_input?.click()"
                >
                  <Icon
                    :icon="upload_loading ? 'lucide:loader-circle' : 'lucide:upload'"
                    :class="['size-3.5 mr-1', upload_loading ? 'animate-spin' : '']"
                  />
                  {{ upload_loading ? '上传中...' : '上传' }}
                </Button>
                <Input id="avatar" v-model="form.site.avatar_url" placeholder="https://www.loliapi.com/acg/pp/" class="flex-1" />
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="greeting">欢迎语</Label>
            <Input id="greeting" v-model="form.site.greeting" placeholder="Ciallo～(∠・ω< )⌒★" />
            <p class="text-xs text-muted-foreground">显示在个人信息卡片上</p>
          </div>
          <div class="space-y-2">
            <Label>站点描述</Label>
            <div
              class="border border-border rounded-lg p-4 bg-muted/20 min-h-[80px] cursor-pointer hover:bg-muted/40 transition-colors"
              @click="router.push('/admin/settings/description')"
            >
              <div v-if="form.site.description" class="prose prose-sm max-w-none text-sm text-muted-foreground line-clamp-3">
                {{ form.site.description }}
              </div>
              <p v-else class="text-sm text-muted-foreground">点击编辑首页内容（支持 Markdown）</p>
            </div>
            <p class="text-xs text-muted-foreground">点击上方区域进入全屏编辑器</p>
          </div>
          <div class="space-y-2">
            <Label for="keywords">站点关键词</Label>
            <Input id="keywords" v-model="form.site.keywords" placeholder="博客,个人站,二次元" />
            <p class="text-xs text-muted-foreground">用逗号分隔，用于搜索引擎优化（纯前端）</p>
          </div>
        </CardContent>
      </Card>

      <!-- 社交链接 -->
      <Card size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:share-2" class="size-4 text-muted-foreground" />
            社交链接
          </CardTitle>
          <p class="text-xs text-muted-foreground">
            图标使用 simple-icons 库，平台名填写英文（如
            <code class="text-foreground">github</code>、
            <code class="text-foreground">bluesky</code>），
            <code class="text-foreground">email</code> 使用邮件图标
          </p>
        </CardHeader>
        <CardContent class="space-y-3">
          <div
            v-for="(link, idx) in form.social_links"
            :key="idx"
            class="flex items-end gap-2 p-3"
          >
            <div class="flex items-center justify-center size-8 shrink-0 rounded-md bg-muted">
              <Icon :icon="social_icon(link.platform)" class="size-4 text-muted-foreground" />
            </div>
            <div class="flex-1 grid grid-cols-3 gap-2">
              <div class="space-y-1">
                <Label :for="'social-platform-' + idx" class="text-xs">平台</Label>
                <Input
                  :id="'social-platform-' + idx"
                  v-model="link.platform"
                  placeholder="github"
                  class="h-8 text-xs"
                />
              </div>
              <div class="space-y-1">
                <Label :for="'social-label-' + idx" class="text-xs">显示名称</Label>
                <Input
                  :id="'social-label-' + idx"
                  v-model="link.label"
                  placeholder="GitHub"
                  class="h-8 text-xs"
                />
              </div>
              <div class="space-y-1">
                <Label :for="'social-url-' + idx" class="text-xs">链接</Label>
                <Input
                  :id="'social-url-' + idx"
                  v-model="link.url"
                  placeholder="https://github.com/username"
                  class="h-8 text-xs"
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              class="shrink-0 text-destructive hover:text-destructive"
              title="删除"
              @click="remove_social_link(idx)"
            >
              <Icon icon="lucide:x" class="size-4" />
            </Button>
          </div>

          <div
            v-if="form.social_links.length === 0"
            class="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-lg"
          >
            暂无社交链接
          </div>

          <Button variant="outline" size="sm" @click="add_social_link">
            <Icon icon="lucide:plus" class="size-3.5 mr-1" />
            添加链接
          </Button>
        </CardContent>
      </Card>

      <!-- 页脚设置 -->
      <Card size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:copyright" class="size-4 text-muted-foreground" />
            页脚设置
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="copyright">版权信息</Label>
            <Input id="copyright" v-model="form.footer.copyright" placeholder="fufu" />
          </div>
          <div class="space-y-2">
            <Label for="icp">ICP 备案号</Label>
            <Input id="icp" v-model="form.footer.icp_beian" placeholder="沪ICP备xxxxxx号" />
            <p class="text-xs text-muted-foreground">中国大陆服务器需填写 ICP 备案号</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="license-label">许可证名称</Label>
              <Input id="license-label" v-model="form.footer.license_label" placeholder="许可证" />
            </div>
            <div class="space-y-2">
              <Label for="license-url">许可证链接</Label>
              <Input id="license-url" v-model="form.footer.license_url" placeholder="/license" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="privacy-label">隐私政策名称</Label>
              <Input id="privacy-label" v-model="form.footer.privacy_label" placeholder="隐私政策" />
            </div>
            <div class="space-y-2">
              <Label for="privacy-url">隐私政策链接</Label>
              <Input id="privacy-url" v-model="form.footer.privacy_url" placeholder="/privacy" />
            </div>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <Icon icon="lucide:external-link" class="size-3.5 text-muted-foreground" />
            <router-link to="/admin/privacy" class="text-sm text-primary hover:underline">
              编辑隐私政策
            </router-link>
            <span class="text-muted-foreground text-sm">·</span>
            <router-link to="/admin/license" class="text-sm text-primary hover:underline">
              编辑许可证
            </router-link>
          </div>
        </CardContent>
      </Card>

      <!-- Hero 设置 -->
      <Card size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:image" class="size-4 text-muted-foreground" />
            Hero 背景
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="hero-image">背景图片 URL</Label>
            <Input id="hero-image" v-model="form.hero.image_url" placeholder="https://example.com/image.jpg" />
          </div>
          <div
            v-if="form.hero.image_url"
            class="relative w-full h-[40vh] rounded-lg overflow-hidden border border-border bg-muted"
          >
            <img
              :src="form.hero.image_url"
              alt="Hero preview"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).style.display='none'"
            />
          </div>
        </CardContent>
      </Card>

      <!-- 公告管理 -->
      <Card size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:megaphone" class="size-4 text-muted-foreground" />
            公告管理
          </CardTitle>
          <p class="text-xs text-muted-foreground">
            公告显示在首页及各页面的侧边栏卡片中
          </p>
        </CardHeader>
        <CardContent class="space-y-3">
          <div
            v-for="(item, idx) in form.announcements"
            :key="item.id"
            class="p-3 bg-muted/20 rounded-lg space-y-2"
          >
            <div class="flex items-center gap-2">
              <DatePicker v-model="item.time" />
              <Button
                variant="ghost"
                size="icon-sm"
                class="shrink-0 text-destructive hover:text-destructive"
                title="删除"
                @click="remove_announcement(idx)"
              >
                <Icon icon="lucide:x" class="size-4" />
              </Button>
            </div>
            <div class="space-y-1.5">
              <Label :for="'ann-content-' + idx" class="text-xs">内容</Label>
              <Textarea
                :id="'ann-content-' + idx"
                v-model="item.content"
                placeholder="公告内容，支持多行"
                :rows="3"
              />
            </div>
          </div>

          <div
            v-if="form.announcements.length === 0"
            class="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-lg"
          >
            暂无公告
          </div>

          <Button variant="outline" size="sm" @click="add_announcement">
            <Icon icon="lucide:plus" class="size-3.5 mr-1" />
            添加公告
          </Button>
        </CardContent>
      </Card>

      <!-- 底部保存按钮 -->
      <div class="flex items-center justify-end gap-3 pb-6">
        <Button :disabled="saving" @click.prevent="save_settings">
          <Icon
            :icon="saving ? 'lucide:loader-circle' : 'lucide:save'"
            :class="['size-4 mr-1', saving ? 'animate-spin' : '']"
          />
          {{ saving ? '保存中...' : '保存设置' }}
        </Button>
      </div>
    </div>
  </div>
</template>
