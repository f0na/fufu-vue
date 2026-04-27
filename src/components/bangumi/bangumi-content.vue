<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ProfileCard from '@/components/entrance/profile-card.vue'
import Announcement, { type AnnouncementItem } from '@/components/home/announcement.vue'
import LatestSection from '@/components/bangumi/latest-section.vue'
import BangumiSidebar from '@/components/bangumi/bangumi-sidebar.vue'
import RecordsSection from '@/components/bangumi/records-section.vue'
import SearchSection from '@/components/bangumi/search-section.vue'
import { get_storage } from '@/lib/bangumi-storage'
import { fetch_calendar } from '@/lib/bangumi-api'
import { convert_subject_info_to_subject } from '@/lib/bangumi-utils'
import type { BangumiRecord, BangumiSubject, WeekdayGroup } from '@/lib/types/bangumi'

interface Props {
  profile_props?: {
    name?: string
    avatar_url?: string
    greeting?: string
    social_links?: {
      bilibili?: string
      github?: string
      email?: string
    }
  }
  announcement_props?: {
    title?: string
    announcements?: AnnouncementItem[]
    max_display?: number
  }
}

const props = defineProps<Props>()
const router = useRouter()

const view = ref<'latest' | 'records' | 'search'>('latest')
const subjects = ref<BangumiSubject[]>([])
const weekday_groups = ref<WeekdayGroup[]>([])
const records = ref<BangumiRecord[]>([])
const is_loading = ref(false)

// 加载本地记录和每周番剧
onMounted(async () => {
  await nextTick()

  // 加载本地记录
  const storage = get_storage()
  records.value = await storage.get_all()

  // 加载每周番剧
  is_loading.value = true

  try {
    const calendar = await fetch_calendar()

    const WEEKDAY_MAP: Record<number, string> = {
      1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
    }
    const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 7]

    for (const weekday of WEEKDAY_ORDER) {
      const day_data = calendar.find(d => d.weekday === weekday)
      if (!day_data || day_data.items.length === 0) continue

      const converted_items = day_data.items.map(convert_subject_info_to_subject)

      weekday_groups.value = [...weekday_groups.value, {
        weekday,
        label: WEEKDAY_MAP[weekday] || '未知',
        subjects: converted_items,
      }]
      subjects.value = [...subjects.value, ...converted_items]
    }
  }
  catch {
    // error handled
  }
  finally {
    is_loading.value = false
  }
})

function handle_card_click(subject_id: number) {
  router.push(`/anime/${subject_id}`)
}

async function handle_delete_record(id: string) {
  const storage = get_storage()
  await storage.delete(id)
  records.value = records.value.filter(r => r.id !== id)
}

function handle_status_change(_subject_id: number, _status: string) {
  // handled in detail page
}

function handle_progress_change(_subject_id: number, _progress: string) {
  // handled in detail page
}
</script>

<template>
  <div class="w-full max-w-[61.8%] px-4 py-8">
    <!-- 三栏布局 -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- 左侧边栏 -->
      <aside class="hidden lg:flex flex-col gap-4 w-[16%] shrink-0">
        <ProfileCard
          :name="profile_props?.name"
          :avatar_url="profile_props?.avatar_url"
          :greeting="profile_props?.greeting"
          :social_links="profile_props?.social_links"
          class="w-full"
        />
        <Announcement
          :title="announcement_props?.title"
          :announcements="announcement_props?.announcements"
        />
      </aside>

      <!-- 中间内容区 -->
      <main class="flex-1 lg:w-[60%] min-w-0">
        <SearchSection
          v-if="view === 'search'"
          :records="records"
          :on_card_click="handle_card_click"
        />
        <LatestSection
          v-else-if="view === 'latest'"
          :weekday_groups="weekday_groups"
          :subjects="subjects"
          :records="records"
          :is_loading="is_loading"
          :on_card_click="handle_card_click"
        />
        <RecordsSection
          v-else
          :records="records"
          :on_delete="handle_delete_record"
          :on_card_click="handle_card_click"
        />
      </main>

      <!-- 右侧边栏 -->
      <aside class="hidden lg:block w-[20%] shrink-0">
        <BangumiSidebar
          :view="view"
          :on_view_change="(v) => view = v"
          :selected_subject="null"
          :records="records"
          :on_status_change="handle_status_change"
          :on_progress_change="handle_progress_change"
        />
      </aside>
    </div>
  </div>
</template>
