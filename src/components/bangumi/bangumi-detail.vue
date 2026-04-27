<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@iconify/vue'
import { format_size } from '@/lib/anime-garden-client'
import { extract_episode, format_date } from '@/lib/bangumi-utils'
import type { BangumiSubject, AnimeResource } from '@/lib/types/bangumi'

interface Props {
  subject: BangumiSubject | null
  is_loading: boolean
  resources_loading?: boolean
  resource_error?: string | null
}

const props = defineProps<Props>()

const copied_id = ref<number | null>(null)

// 按字幕组分组资源
const resource_group = computed(() => {
  if (!props.subject) return { grouped_resources: new Map<string, AnimeResource[]>(), no_fansub_resources: [] as AnimeResource[] }

  const groups = new Map<string, AnimeResource[]>()
  const no_fansub: AnimeResource[] = []

  for (const r of props.subject.resources) {
    const fansub_name = r.fansub?.name
    if (fansub_name) {
      if (!groups.has(fansub_name)) groups.set(fansub_name, [])
      groups.get(fansub_name)!.push(r)
    } else {
      no_fansub.push(r)
    }
  }

  // 每组内按时间排序
  for (const [, resources] of groups) {
    resources.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
  }
  no_fansub.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

  // 按资源数量排序
  const sorted = new Map(
    [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
  )

  return { grouped_resources: sorted, no_fansub_resources: no_fansub }
})

async function handle_copy(magnet: string, resource_id: number) {
  try {
    await navigator.clipboard.writeText(magnet)
    copied_id.value = resource_id
    setTimeout(() => { copied_id.value = null }, 2000)
  }
  catch {
    // copy failed
  }
}

</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 返回按钮 -->
    <RouterLink to="/anime">
      <Button variant="ghost" class="self-start">
        <Icon icon="lucide:arrow-left" class="size-4" />
        返回列表
      </Button>
    </RouterLink>

    <!-- 加载中骨架 -->
    <template v-if="is_loading || !subject">
      <div class="flex gap-4">
        <Skeleton class="w-[160px] aspect-[3/4]" />
        <div class="flex-1 flex flex-col gap-3">
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
          <Skeleton class="h-4 w-1/4" />
        </div>
      </div>
    </template>

    <!-- 详情内容 -->
    <template v-else>
      <!-- 封面 + 基本信息 -->
      <div class="flex gap-4">
        <!-- 封面 -->
        <template v-if="subject.images?.large">
          <img
            :src="subject.images.large"
            :alt="subject.name_cn || subject.name"
            class="w-[160px] aspect-[3/4] object-cover rounded-lg shrink-0"
          />
        </template>
        <template v-else-if="subject.cover_url">
          <img
            :src="subject.cover_url"
            :alt="subject.name_cn || subject.name"
            class="w-[160px] aspect-[3/4] object-cover rounded-lg shrink-0"
          />
        </template>
        <template v-else>
          <div class="w-[160px] aspect-[3/4] bg-muted rounded-lg flex items-center justify-center shrink-0">
            <span class="text-muted-foreground text-lg font-medium">{{ (subject.name_cn || subject.name).slice(0, 2) }}</span>
          </div>
        </template>

        <!-- 基本信息 -->
        <div class="flex-1 flex flex-col gap-2">
          <h1 class="text-lg font-bold">{{ subject.name_cn || subject.name }}</h1>
          <p v-if="subject.name !== (subject.name_cn || subject.name)" class="text-muted-foreground text-sm">
            {{ subject.name }}
          </p>

          <!-- 评分 -->
          <div v-if="subject.rating && subject.rating.score > 0" class="flex items-center gap-2">
            <Badge variant="default">{{ subject.rating.score.toFixed(1) }}</Badge>
            <span v-if="subject.rating.total > 0" class="text-muted-foreground text-sm">
              {{ subject.rating.total }} 人评分
            </span>
          </div>

          <!-- 集数/开播日期 -->
          <div class="flex items-center gap-3 text-sm text-muted-foreground">
            <span v-if="subject.eps && subject.eps > 0">共 {{ subject.eps }} 集</span>
            <span v-if="subject.date">开播: {{ subject.date }}</span>
          </div>

          <!-- 标签 -->
          <div v-if="subject.tags && subject.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
            <Badge v-for="tag in subject.tags.slice(0, 6)" :key="tag" variant="secondary" class="text-xs">
              {{ tag }}
            </Badge>
          </div>

          <!-- Bangumi 链接 -->
          <Button variant="outline" size="sm" as-child class="mt-2">
            <a :href="`https://bgm.tv/subject/${subject.id}`" target="_blank" rel="noopener noreferrer">
              <Icon icon="lucide:external-link" class="size-4" />
              在 Bangumi 查看
            </a>
          </Button>
        </div>
      </div>

      <!-- 简介 -->
      <Card v-if="subject.summary">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">简介</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          <p class="whitespace-pre-wrap">{{ subject.summary }}</p>
        </CardContent>
      </Card>

      <!-- 详细信息 -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">详细信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div v-if="subject.eps && subject.eps > 0">
              <span class="text-muted-foreground">集数: </span>
              <span>{{ subject.eps }}</span>
            </div>
            <div v-if="subject.date">
              <span class="text-muted-foreground">开播: </span>
              <span>{{ subject.date }}</span>
            </div>
            <div v-if="subject.fansub && subject.fansub !== '0'">
              <span class="text-muted-foreground">字幕组: </span>
              <span>{{ subject.fansub }}</span>
            </div>
            <div v-if="subject.episode_count && subject.episode_count > 0">
              <span class="text-muted-foreground">资源数量: </span>
              <span>{{ subject.episode_count }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 资源列表 -->
      <template v-if="resource_error">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">资源列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col items-center gap-3 py-4">
              <Icon icon="lucide:alert-circle" class="size-8 text-destructive" />
              <p class="text-destructive font-medium">加载资源失败</p>
              <p class="text-muted-foreground text-sm text-center">{{ resource_error }}</p>
            </div>
          </CardContent>
        </Card>
      </template>
      <template v-else-if="subject.resources.length > 0">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">资源列表 ({{ subject.resources.length }})</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col gap-4">
              <!-- 按字幕组分组 -->
              <template v-for="[fansub_name, resources] in resource_group.grouped_resources" :key="fansub_name">
                <div class="flex flex-col gap-2">
                  <!-- 字幕组标题 -->
                  <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <img
                      v-if="resources[0]?.fansub?.avatar"
                      :src="resources[0].fansub.avatar"
                      :alt="fansub_name"
                      class="size-5 rounded"
                    />
                    <span>{{ fansub_name }}</span>
                    <span class="text-xs">({{ resources.length }})</span>
                  </div>

                  <!-- 资源列表 -->
                  <div
                    v-for="resource in resources"
                    :key="resource.id"
                    class="flex items-start gap-3 p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Badge variant="secondary" class="shrink-0 mt-0.5">
                      {{ extract_episode(resource.title) || '资源' }}
                    </Badge>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm break-all">{{ resource.title }}</p>
                      <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{{ format_size(resource.size) }}</span>
                        <span>{{ format_date(resource.created_at) }}</span>
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            class="shrink-0"
                            @click="handle_copy(resource.magnet, resource.id)"
                          >
                            <Icon v-if="copied_id === resource.id" icon="lucide:check" class="size-4 text-primary" />
                            <Icon v-else icon="lucide:copy" class="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {{ copied_id === resource.id ? '已复制' : '复制磁力链接' }}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </template>

              <!-- 无字幕组的资源 -->
              <div v-if="resource_group.no_fansub_resources.length > 0" class="flex flex-col gap-2">
                <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span>未知字幕组</span>
                  <span class="text-xs">({{ resource_group.no_fansub_resources.length }})</span>
                </div>
                <div
                  v-for="resource in resource_group.no_fansub_resources"
                  :key="resource.id"
                  class="flex items-start gap-3 p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Badge variant="secondary" class="shrink-0 mt-0.5">
                    {{ extract_episode(resource.title) || '资源' }}
                  </Badge>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm break-all">{{ resource.title }}</p>
                    <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{{ format_size(resource.size) }}</span>
                      <span>{{ format_date(resource.created_at) }}</span>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          class="shrink-0"
                          @click="handle_copy(resource.magnet, resource.id)"
                        >
                          <Icon v-if="copied_id === resource.id" icon="lucide:check" class="size-4 text-primary" />
                          <Icon v-else icon="lucide:copy" class="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {{ copied_id === resource.id ? '已复制' : '复制磁力链接' }}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
      <template v-else-if="resources_loading">
        <!-- 资源加载中 -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">资源列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col gap-2">
              <Skeleton v-for="i in 3" :key="i" class="h-[60px] rounded" />
              <p class="text-center text-muted-foreground text-sm">正在加载资源...</p>
            </div>
          </CardContent>
        </Card>
      </template>
      <template v-else>
        <!-- 无资源 -->
      </template>
    </template>
  </div>
</template>
