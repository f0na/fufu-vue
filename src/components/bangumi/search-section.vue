<script setup lang="ts">
import { ref, computed } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Icon } from '@iconify/vue';
import { search_bangumi_subjects, SORT_TYPES, SORT_LABELS } from '@/lib/bangumi-api';
import { convert_subject_info_to_subject } from '@/lib/bangumi-utils';
import type { BangumiSubject, BangumiRecord } from '@/lib/types/bangumi';
import type { SortType } from '@/lib/bangumi-api';
import BangumiCard from '@/components/bangumi/bangumi-card.vue';

const SUBJECT_TYPE_OPTIONS = [
  { value: '2', label: '动画' },
  { value: '1', label: '书籍' },
  { value: '3', label: '音乐' },
  { value: '4', label: '游戏' },
  { value: '6', label: '三次元' },
];

interface Props {
  records: BangumiRecord[];
  on_card_click: (subject_id: number) => void;
}

defineProps<Props>();

const keyword = ref('');
const sort = ref<SortType>('heat');
const subject_type = ref('2');
const tags = ref<string[]>([]);
const tag_input = ref('');
const include_tags = ref<string[]>([]);
const include_input = ref('');
const exclude_tags = ref<string[]>([]);
const exclude_input = ref('');
const rating_min = ref('');
const rating_max = ref('');
const air_date_start = ref<Date>();
const air_date_end = ref<Date>();
const rank_min = ref('');
const rank_max = ref('');

const results = ref<BangumiSubject[]>([]);
const is_loading = ref(false);
const has_searched = ref(false);

const results_ref = ref<HTMLElement | null>(null);

function format_display_date(date: Date | undefined): string {
  if (!date) return '选择日期';
  return date.toLocaleDateString('zh-CN');
}

function date_to_filter_string(date: Date | undefined, prefix: string): string | undefined {
  if (!date) return undefined;
  return `${prefix}${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function add_tag(
  target: typeof tags | typeof include_tags | typeof exclude_tags,
  input: string,
  set_input: (v: string) => void
) {
  const tag = input.trim();
  if (tag) {
    target.value = [...target.value, tag];
    set_input('');
  }
}

function remove_tag(target: typeof tags | typeof include_tags | typeof exclude_tags, tag: string) {
  target.value = target.value.filter((t) => t !== tag);
}

const has_filters = computed(
  () =>
    tags.value.length > 0 ||
    include_tags.value.length > 0 ||
    exclude_tags.value.length > 0 ||
    rating_min.value ||
    rating_max.value ||
    air_date_start.value ||
    air_date_end.value ||
    rank_min.value ||
    rank_max.value ||
    sort.value !== 'heat' ||
    subject_type.value !== '2'
);

async function handle_search() {
  if (!keyword.value.trim() && include_tags.value.length === 0) return;

  is_loading.value = true;
  has_searched.value = true;

  setTimeout(() => {
    results_ref.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  try {
    const search_keyword = [keyword.value.trim(), ...include_tags.value].filter(Boolean).join(' ');

    const filter: Record<string, unknown> = { type: [parseInt(subject_type.value)] };

    if (tags.value.length > 0) filter.tag = tags.value;

    const air_date_filters: string[] = [];
    const start_filter = date_to_filter_string(air_date_start.value, '>=');
    const end_filter = date_to_filter_string(air_date_end.value, '<=');
    if (start_filter) air_date_filters.push(start_filter);
    if (end_filter) air_date_filters.push(end_filter);
    if (air_date_filters.length > 0) filter.air_date = air_date_filters;

    const rating_filters: string[] = [];
    if (rating_min.value) rating_filters.push(`>=${rating_min.value}`);
    if (rating_max.value) rating_filters.push(`<${rating_max.value}`);
    if (rating_filters.length > 0) filter.rating = rating_filters;

    const rank_filters: string[] = [];
    if (rank_min.value) rank_filters.push(`>${rank_min.value}`);
    if (rank_max.value) rank_filters.push(`<=${rank_max.value}`);
    if (rank_filters.length > 0) filter.rank = rank_filters;

    const search_result = await search_bangumi_subjects({
      keyword: search_keyword,
      sort: sort.value,
      filter,
      limit: 50,
    });

    let filtered_data = search_result.data;
    if (exclude_tags.value.length > 0) {
      filtered_data = filtered_data.filter((subject) => {
        const name = subject.name_cn || subject.name;
        const summary = subject.summary || '';
        const text = `${name} ${summary}`.toLowerCase();
        return !exclude_tags.value.some((ex) => text.includes(ex.toLowerCase()));
      });
    }

    results.value = filtered_data.map(convert_subject_info_to_subject);
  } catch {
    // error handled
  }

  is_loading.value = false;
}

function handle_clear() {
  keyword.value = '';
  sort.value = 'heat';
  subject_type.value = '2';
  tags.value = [];
  tag_input.value = '';
  include_tags.value = [];
  include_input.value = '';
  exclude_tags.value = [];
  exclude_input.value = '';
  rating_min.value = '';
  rating_max.value = '';
  air_date_start.value = undefined;
  air_date_end.value = undefined;
  rank_min.value = '';
  rank_max.value = '';
  results.value = [];
  has_searched.value = false;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 搜索面板 -->
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col gap-4">
          <!-- 关键词输入 -->
          <div class="flex gap-2">
            <Input
              v-model="keyword"
              @keydown.enter="handle_search"
              placeholder="搜索番剧..."
              class="flex-1"
            />
            <Button @click="handle_search">
              <Icon icon="lucide:search" class="size-4" />
              搜索
            </Button>
            <Button v-if="keyword || has_filters" variant="ghost" @click="handle_clear">
              <Icon icon="lucide:x" class="size-4" />
              清空
            </Button>
          </div>

          <Separator />

          <!-- 排序和类型 -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm text-muted-foreground">排序方式</label>
              <Select v-model="sort" @update:model-value="(v) => (sort = v as SortType)">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择排序" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem v-for="s in SORT_TYPES" :key="s" :value="s">{{
                    SORT_LABELS[s]
                  }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm text-muted-foreground">条目类型</label>
              <Select v-model="subject_type">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem v-for="t in SUBJECT_TYPE_OPTIONS" :key="t.value" :value="t.value">{{
                    t.label
                  }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <!-- 标签筛选 -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-muted-foreground"
              >标签筛选（且关系，可用 `-标签` 排除）</label
            >
            <div class="flex gap-2">
              <Input
                v-model="tag_input"
                @keydown.enter="add_tag(tags, tag_input, (v) => (tag_input = v))"
                placeholder="添加标签..."
                class="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                @click="add_tag(tags, tag_input, (v) => (tag_input = v))"
              >
                <Icon icon="lucide:plus" class="size-4" />
              </Button>
            </div>
            <div v-if="tags.length > 0" class="flex flex-wrap gap-1">
              <Badge
                v-for="tag in tags"
                :key="tag"
                :variant="tag.startsWith('-') ? 'destructive' : 'secondary'"
                class="cursor-pointer"
                @click="remove_tag(tags, tag)"
              >
                {{ tag }}
                <Icon icon="lucide:x" class="size-3 ml-1" />
              </Badge>
            </div>
          </div>

          <Separator />

          <!-- 包含关键字 -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-muted-foreground">包含关键字</label>
            <div class="flex gap-2">
              <Input
                v-model="include_input"
                @keydown.enter="add_tag(include_tags, include_input, (v) => (include_input = v))"
                placeholder="添加包含关键字..."
                class="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                @click="add_tag(include_tags, include_input, (v) => (include_input = v))"
              >
                <Icon icon="lucide:plus" class="size-4" />
              </Button>
            </div>
            <div v-if="include_tags.length > 0" class="flex flex-wrap gap-1">
              <Badge
                v-for="tag in include_tags"
                :key="tag"
                variant="default"
                class="cursor-pointer"
                @click="remove_tag(include_tags, tag)"
              >
                {{ tag }}
                <Icon icon="lucide:x" class="size-3 ml-1" />
              </Badge>
            </div>
          </div>

          <Separator />

          <!-- 排除关键字 -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-muted-foreground">排除关键字（本地筛选）</label>
            <div class="flex gap-2">
              <Input
                v-model="exclude_input"
                @keydown.enter="add_tag(exclude_tags, exclude_input, (v) => (exclude_input = v))"
                placeholder="添加排除关键字..."
                class="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                @click="add_tag(exclude_tags, exclude_input, (v) => (exclude_input = v))"
              >
                <Icon icon="lucide:minus" class="size-4" />
              </Button>
            </div>
            <div v-if="exclude_tags.length > 0" class="flex flex-wrap gap-1">
              <Badge
                v-for="tag in exclude_tags"
                :key="tag"
                variant="destructive"
                class="cursor-pointer"
                @click="remove_tag(exclude_tags, tag)"
              >
                {{ tag }}
                <Icon icon="lucide:x" class="size-3 ml-1" />
              </Badge>
            </div>
          </div>

          <Separator />

          <!-- 评分范围 -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-muted-foreground">评分范围</label>
            <div class="flex gap-2 items-center">
              <Input
                v-model="rating_min"
                placeholder="最低评分"
                type="number"
                min="0"
                max="10"
                class="w-24"
              />
              <span class="text-muted-foreground">-</span>
              <Input
                v-model="rating_max"
                placeholder="最高评分"
                type="number"
                min="0"
                max="10"
                class="w-24"
              />
            </div>
          </div>

          <Separator />

          <!-- 排名范围 -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-muted-foreground">排名范围</label>
            <div class="flex gap-2 items-center">
              <Input v-model="rank_min" placeholder="最低排名" type="number" min="0" class="w-24" />
              <span class="text-muted-foreground">-</span>
              <Input v-model="rank_max" placeholder="最高排名" type="number" min="0" class="w-24" />
            </div>
          </div>

          <Separator />

          <!-- 播出日期范围 -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm text-muted-foreground flex items-center gap-1">
                <Icon icon="lucide:calendar" class="size-3" />
                开播日期晚于
              </label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline" class="justify-start">
                    {{ format_display_date(air_date_start) }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                  <Calendar v-model="air_date_start" mode="single" caption-layout="dropdown" />
                </PopoverContent>
              </Popover>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm text-muted-foreground flex items-center gap-1">
                <Icon icon="lucide:calendar" class="size-3" />
                开播日期早于
              </label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline" class="justify-start">
                    {{ format_display_date(air_date_end) }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                  <Calendar v-model="air_date_end" mode="single" caption-layout="dropdown" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 搜索结果 -->
    <div v-if="has_searched" ref="results_ref" class="flex flex-col gap-4">
      <h2 class="text-lg font-semibold">
        搜索结果 {{ results.length > 0 ? `(${results.length})` : '' }}
      </h2>

      <template v-if="is_loading">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in 6" :key="i" class="h-[200px] rounded-lg bg-muted animate-pulse" />
        </div>
      </template>
      <template v-else-if="results.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <BangumiCard
            v-for="subject in results"
            :key="subject.id"
            :subject="subject"
            :record="records.find((r) => r.subject_id === subject.id)"
            :on_click="() => on_card_click(subject.id)"
          />
        </div>
      </template>
      <div v-else class="text-center text-muted-foreground py-8">未找到相关番剧</div>
    </div>
  </div>
</template>
