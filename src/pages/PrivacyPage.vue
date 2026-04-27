<script setup lang="ts">
import { ref } from 'vue'
import HomeLayout from '@/components/home/home-layout.vue'
import PageWrapper from '@/components/layout/page-wrapper.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PolicyVersion {
  version: string
  date: string
  content: Array<{ title: string; items: string[] }>
}

const versions: PolicyVersion[] = [
  {
    version: 'v2.0',
    date: '2026-04-27',
    content: [
      {
        title: '1. 信息收集',
        items: [
          '本网站是一个静态个人站点，不设用户注册和登录功能，因此不会主动收集您的个人信息（如姓名、邮箱地址等）。',
          '我们可能会收集以下非个人识别信息：页面访问统计数据、浏览器类型和版本、设备类型和操作系统。',
        ],
      },
      {
        title: '2. 评论功能',
        items: [
          '本网站的评论功能由 Giscus 提供支持，基于 GitHub Discussions。当您发表评论时：',
          '您的评论内容将存储在对应 GitHub 仓库的 Discussions 中',
          '您需要登录 GitHub 账号才能发表评论',
          'Giscus 可能会收集您的 GitHub 用户名和头像等公开信息',
        ],
      },
      {
        title: '3. AI 训练数据处理',
        items: [
          '本网站默认禁止任何第三方将本站内容用于 AI 模型训练，除非事先获得明确书面授权。',
          '网站通过 robots.txt 和 AI 训练爬虫屏蔽协议声明这一限制。',
          '本条款的变更将通过版本更新记录在案。',
        ],
      },
      {
        title: '4. 外部服务',
        items: [
          'Bangumi API — 用于查询番剧信息，您的 IP 地址可能会被 Bangumi 服务器记录。',
          '随机图片 API — 用于展示随机背景图。',
          'Giscus / GitHub — 用于评论功能，见上述第 2 节。',
          'Cloudflare Pages — 网站托管服务，可能记录基础的访问指标。',
        ],
      },
      {
        title: '5. Cookies',
        items: [
          '本网站不使用任何用于跟踪目的的 Cookie。Giscus 和外部服务可能使用必要的 Cookie 来维持其功能。',
        ],
      },
      {
        title: '6. 数据保留与删除',
        items: [
          '由于本网站不收集用户个人数据，因此不存在存储数据的删除问题。',
          '评论数据由 GitHub 管理，您可以通过 GitHub 控制台管理或删除您的评论。',
        ],
      },
      {
        title: '7. 第三方链接',
        items: [
          '本网站可能包含指向第三方网站的链接。我们对这些外部网站的内容和隐私实践不承担任何责任。',
        ],
      },
      {
        title: '8. 政策更新',
        items: [
          '本隐私政策可能会不时更新。更新后的政策将发布在此页面，并注明版本号和最后更新日期。',
          '版本历史中的旧版本将一并保留供查阅。',
        ],
      },
      {
        title: '9. 联系方式',
        items: [
          '如果您对本隐私政策有任何疑问，请通过 GitHub Issues 或电子邮件联系我。',
        ],
      },
    ],
  },
  {
    version: 'v1.0',
    date: '2026-04-01',
    content: [
      {
        title: '1. 信息收集',
        items: [
          '本网站是一个静态个人站点，不设用户注册和登录功能，因此不会主动收集您的个人信息。',
          '我们可能会收集匿名访问数据、浏览器类型和版本、设备类型和操作系统。',
        ],
      },
      {
        title: '2. 评论功能',
        items: [
          '本网站的评论功能由 Giscus 提供支持，基于 GitHub Discussions。',
          '当您发表评论时，您的评论内容将存储在对应 GitHub 仓库的 Discussions 中。',
          '您需要登录 GitHub 账号才能发表评论。',
        ],
      },
      {
        title: '3. 外部服务',
        items: [
          'Bangumi API — 用于查询番剧信息。',
          '随机图片 API — 用于展示随机背景图。',
          'Giscus / GitHub — 用于评论功能。',
        ],
      },
      {
        title: '4. Cookies',
        items: [
          '本网站不使用任何用于跟踪目的的 Cookie。',
        ],
      },
      {
        title: '5. 数据安全',
        items: [
          '由于本网站不收集或存储用户个人数据，因此不存在用户数据泄露的风险。',
          '网站本身托管于 Cloudflare Pages，采用 HTTPS 加密传输。',
        ],
      },
      {
        title: '6. 第三方链接',
        items: [
          '本网站可能包含指向第三方网站的链接。我们对这些外部网站的内容和隐私实践不承担任何责任。',
        ],
      },
      {
        title: '7. 政策更新',
        items: [
          '本隐私政策可能会不时更新。更新后的政策将发布在此页面，并注明最后更新日期。',
        ],
      },
      {
        title: '8. 联系方式',
        items: [
          '如果您对本隐私政策有任何疑问，请通过 GitHub Issues 或电子邮件联系我。',
        ],
      },
    ],
  },
]

const active_version = ref(versions[0])
</script>

<template>
  <PageWrapper current_page="archive">
    <HomeLayout
      :profile_props="{
        name: 'Fufu',
        greeting: 'Ciallo～(∠・ω< )⌒★',
      }"
      :announcement_props="{
        title: '公告',
        announcements: [
          { id: '1', content: '欢迎来到我的小站！这里是我的个人空间，记录着生活中的点点滴滴。', time: '2026-04-17' },
          { id: '2', content: '网站正在建设中，敬请期待更多内容。', time: '2026-04-16' },
        ],
        max_display: 3,
      }"
    >
      <Card>
        <CardHeader>
          <CardTitle class="text-xl">隐私政策</CardTitle>
          <p class="text-sm text-muted-foreground">最后更新：{{ active_version.date }}</p>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- 版本选择 -->
          <div class="flex gap-2">
            <Button
              v-for="v in versions"
              :key="v.version"
              :variant="active_version.version === v.version ? 'default' : 'outline'"
              size="sm"
              @click="active_version = v"
            >
              {{ v.version }}
            </Button>
          </div>

          <!-- 当前版本内容 -->
          <div class="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <section v-for="section in active_version.content" :key="section.title" class="space-y-2">
              <h3 class="text-foreground font-medium">{{ section.title }}</h3>
              <ul class="list-disc pl-5 space-y-1">
                <li v-for="item in section.items" :key="item">
                  {{ item }}
                </li>
              </ul>
            </section>
          </div>
        </CardContent>
      </Card>
    </HomeLayout>
  </PageWrapper>
</template>
