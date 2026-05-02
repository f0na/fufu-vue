<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageWrapper from '@/components/layout/page-wrapper.vue';
import BangumiDetail from '@/components/bangumi/bangumi-detail.vue';
import BangumiSidebar from '@/components/bangumi/bangumi-sidebar.vue';
import ProfileCard from '@/components/entrance/profile-card.vue';
import Announcement from '@/components/home/announcement.vue';
import { fetch_bangumi_subject } from '@/lib/bangumi-api';
import { fetch_resources } from '@/lib/anime-garden-client';
import { merge_bangumi_with_resources, convert_subject_info_to_subject } from '@/lib/bangumi-utils';
import { get_storage, generate_id } from '@/lib/bangumi-storage';
import type { BangumiSubject, BangumiRecord, BangumiStatus } from '@/lib/types/bangumi';

const route = useRoute();
const router = useRouter();

const subject = ref<BangumiSubject | null>(null);
const is_loading = ref(true);
const resources_loading = ref(false);
const resource_error = ref<string | null>(null);
const records = ref<BangumiRecord[]>([]);

onMounted(async () => {
  await nextTick();
  const storage = get_storage();
  records.value = await storage.get_all();

  // 页面渲染后再请求番剧数据
  const id = route.params.id;
  if (id) fetch_subject(parseInt(id as string, 10));
});

async function fetch_subject(subject_id: number) {
  if (isNaN(subject_id) || subject_id <= 0) {
    router.replace('/anime');
    return;
  }

  is_loading.value = true;
  resource_error.value = null;
  resources_loading.value = false;
  subject.value = null;

  const subject_info = await fetch_bangumi_subject(subject_id);
  if (!subject_info) {
    router.replace('/anime');
    return;
  }

  // 先展示番剧基本信息，资源列表在后台加载
  subject.value = convert_subject_info_to_subject(subject_info);
  is_loading.value = false;
  resources_loading.value = true;

  try {
    const resources_result = await fetch_resources({
      pageSize: 200,
      subject: subject_id,
    });
    const full_subject = merge_bangumi_with_resources(subject_info, resources_result.resources);
    subject.value = full_subject;
  } catch {
    resource_error.value = '资源加载失败，请稍后重试';
  } finally {
    resources_loading.value = false;
  }
}

watch(
  () => route.params.id,
  (new_id) => {
    if (new_id) fetch_subject(parseInt(new_id as string, 10));
  }
);

// 状态变更
async function handle_status_change(subject_id_num: number, status: BangumiStatus) {
  const storage = get_storage();
  const current = subject.value;
  if (!current) return;

  const existing = records.value.find((r) => r.subject_id === subject_id_num);
  const display_name = current.name_cn || current.name;

  if (existing) {
    await storage.update(existing.id, { status });
    const idx = records.value.findIndex((r) => r.id === existing.id);
    if (idx !== -1) records.value[idx] = { ...records.value[idx], status };
  } else {
    const new_record: BangumiRecord = {
      id: generate_id(),
      subject_id: subject_id_num,
      title: display_name,
      status: status as BangumiStatus,
      progress: '',
      added_at: new Date().toISOString(),
      cover_url: current.images?.large || current.cover_url,
      fansub: current.fansub,
    };
    await storage.add(new_record);
    records.value.push(new_record);
  }
}

// 进度变更
async function handle_progress_change(subject_id_num: number, progress: string) {
  const storage = get_storage();
  const current = subject.value;
  if (!current) return;

  const existing = records.value.find((r) => r.subject_id === subject_id_num);

  if (existing) {
    await storage.update(existing.id, { progress });
    const idx = records.value.findIndex((r) => r.id === existing.id);
    if (idx !== -1) records.value[idx] = { ...records.value[idx], progress };
  } else {
    const display_name = current.name_cn || current.name;
    const new_record: BangumiRecord = {
      id: generate_id(),
      subject_id: subject_id_num,
      title: display_name,
      status: 'watching' as BangumiStatus,
      progress,
      added_at: new Date().toISOString(),
      cover_url: current.images?.large || current.cover_url,
      fansub: current.fansub,
    };
    await storage.add(new_record);
    records.value.push(new_record);
  }
}
</script>

<template>
  <PageWrapper current_page="anime">
    <div class="w-full max-w-[61.8%] px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧边栏 -->
        <aside class="hidden lg:flex flex-col gap-4 w-[16%] shrink-0">
          <ProfileCard name="Fufu" greeting="Ciallo～(∠・ω< )⌒★" class="w-full" />
          <Announcement
            title="公告"
            :announcements="[
              {
                id: '1',
                content: '欢迎来到我的小站！这里是我的个人空间，记录着生活中的点点滴滴。',
                time: '2026-04-17',
              },
              { id: '2', content: '网站正在建设中，敬请期待更多内容。', time: '2026-04-16' },
            ]"
          />
        </aside>

        <!-- 中间内容区 -->
        <main class="flex-1 lg:w-[60%] min-w-0">
          <BangumiDetail
            :subject="subject"
            :is_loading="is_loading"
            :resources_loading="resources_loading"
            :resource_error="resource_error"
          />
        </main>

        <!-- 右侧边栏 -->
        <aside class="hidden lg:block w-[20%] shrink-0">
          <BangumiSidebar
            view="detail"
            :on_view_change="() => {}"
            :selected_subject="subject"
            :records="records"
            :on_status_change="handle_status_change"
            :on_progress_change="handle_progress_change"
          />
        </aside>
      </div>
    </div>
  </PageWrapper>
</template>
