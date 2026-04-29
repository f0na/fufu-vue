# 数据接口清单

> 整理时间：2026-04-29  
> 前端项目：fufu-vue（Vue 3 + Vite 8 + TypeScript）  
> 用途：与后端对接参考

---

## 目录

1. [站点设置（Settings）](#1-站点设置settings)
2. [博客文章（Posts）](#2-博客文章posts)
3. [友人帐（Friends）](#3-友人帐friends)
4. [链接收藏（Links）](#4-链接收藏links)
5. [相册（Gallery）](#5-相册gallery)
6. [许可证（License）](#6-许可证license)
7. [隐私政策（Privacy）](#7-隐私政策privacy)
8. [番剧（Bangumi）](#8-番剧bangumi)
9. [图片上传](#9-图片上传)
10. [中文翻译](#10-中文翻译)

---

## 1. 站点设置（Settings）

### 数据文件
`public/content/settings.json`

### 接口

#### GET /content/settings.json
读取站点设置。

**响应示例：**
```json
{
  "site": {
    "name": "fufu",
    "avatar_url": "https://www.loliapi.com/acg/pp/",
    "greeting": "Ciallo～(∠・ω< )⌒★",
    "description": "这里是可爱芙芙的小窝，欢迎大家^^",
    "keywords": "博客,个人站,二次元,芙芙"
  },
  "hero": {
    "image_url": "https://t.alcy.cc/moez"
  },
  "footer": {
    "icp_beian": "",
    "copyright": "fufu",
    "license_label": "许可证",
    "license_url": "/license",
    "privacy_label": "隐私政策",
    "privacy_url": "/privacy"
  },
  "social_links": [
    {
      "platform": "bilibili",
      "label": "Bilibili",
      "url": "https://space.bilibili.com/"
    }
  ],
  "announcements": [
    {
      "id": "1",
      "content": "欢迎来到我的小站！",
      "time": "2026-04-17"
    }
  ]
}
```

#### POST /api/settings/save
保存站点设置。

**请求体：** 完整的 settings JSON 对象（同上）。

**响应：**
```json
{ "success": true }
```

---

## 2. 博客文章（Posts）

### 数据文件
- `public/content/posts/_index.json` — 文章索引（元数据列表）
- `public/content/posts/{slug}.md` — 文章 Markdown 内容

### 数据结构

```typescript
interface Post {
  slug: string;           // URL 标识
  title: string;          // 标题
  date: string;           // 日期 "YYYY-MM-DD"
  tags: string[];         // 标签
  cover?: string;         // 封面图 URL
  excerpt?: string;       // 摘要
  content?: string;       // 正文（仅详情接口返回）
  views?: number;         // 浏览量
  likes?: number;         // 点赞数
  comments_count?: number; // 评论数
  category?: string;       // 分类（技术/生活/杂谈/旅行/音乐）
  status?: 'draft' | 'published'; // 发布状态
}

interface PostsResponse {
  posts: Post[];
  page: number;
  has_more: boolean;
}
```

### 前端调用

| 用途 | 请求 | 说明 |
|------|------|------|
| 获取文章列表 | `GET /content/posts/_index.json` | 全量拉取，前端做分页/筛选 |
| 获取文章内容 | `GET /content/posts/{slug}.md` | 返回 Markdown 原文 |
| 保存文章 | 未实现（`handle_save` 为 TODO） | 需要后端提供 |

### 需要后端实现
- `GET /api/posts` — 文章列表（分页、标签筛选、年份筛选）
- `GET /api/posts/:slug` — 文章详情（含 Markdown 内容）
- `POST /api/posts` — 创建文章
- `PUT /api/posts/:slug` — 更新文章
- `DELETE /api/posts/:slug` — 删除文章
- `PUT /api/posts/:slug/views` — 增加浏览量

---

## 3. 友人帐（Friends）

### 数据文件
`public/content/friends/friends.json`

### 数据结构

```typescript
type FriendStatus = 'pending' | 'approved' | 'rejected';

interface FriendItem {
  id: string;             // "friend-001"
  name: string;           // 站点名称
  url: string;            // 站点链接
  avatar?: string;        // 头像 URL
  description?: string;   // 描述
  created_at: string;     // 创建日期 "YYYY-MM-DD"
  status?: FriendStatus;  // 审核状态
}

interface FriendsResponse {
  friends: FriendItem[];
  page: number;
  has_more: boolean;
}
```

### 前端调用

| 用途 | 请求 | 说明 |
|------|------|------|
| 读取友链 | `GET /content/friends/friends.json` | 全量拉取，前端做筛选分页 |
| 通过/拒绝 | 前端仅操作内存数据 | 无持久化接口 |

### 需要后端实现
- `GET /api/friends` — 列表（分页、状态筛选）
- `GET /api/friends/:id` — 详情
- `POST /api/friends` — 添加友链
- `PUT /api/friends/:id` — 更新
- `DELETE /api/friends/:id` — 删除
- `PATCH /api/friends/:id/status` — 审核（approve/reject）

---

## 4. 链接收藏（Links）

### 数据文件
`public/content/links/links.json`

### 数据结构

```typescript
interface LinkItem {
  id: string;             // "link-001"
  title: string;          // 标题
  url: string;            // 链接地址
  description?: string;   // 描述
  tags: string[];         // 标签
  created_at: string;     // 创建日期
  is_starred?: boolean;   // 是否收藏
}

interface LinksResponse {
  links: LinkItem[];
  page: number;
  has_more: boolean;
}

interface LinksMeta {
  all_tags: string[];
}
```

### 前端调用

| 用途 | 请求 | 说明 |
|------|------|------|
| 读取链接 | `GET /content/links/links.json` | 全量拉取，前端做筛选分页 |
| 获取元数据 | 前端基于全量数据计算 tags | 无独立接口 |

### 需要后端实现
- `GET /api/links` — 列表（分页、标签筛选、收藏筛选）
- `GET /api/links/meta` — 元数据（所有标签列表）
- `GET /api/links/starred` — 收藏列表
- `GET /api/links/:id` — 详情
- `POST /api/links` — 添加链接
- `PUT /api/links/:id` — 更新
- `DELETE /api/links/:id` — 删除

---

## 5. 相册（Gallery）

### 数据文件
`public/content/gallery.json`

### 数据结构

```typescript
interface Gallery {
  id: string;             // 相册 ID
  title: string;          // 标题
  cover_path: string;     // 封面图路径
  photos: string[];       // 照片路径数组（URL 或相对路径）
  tags: string[];         // 标签
  created_at: string;     // 创建日期
}
```

### 接口

#### GET /content/gallery.json
读取相册数据。

**响应：**
```json
{
  "galleries": [
    {
      "id": "gallery-001",
      "title": "示例相册",
      "cover_path": "/content/imgs/xxx.jpg",
      "photos": ["/content/imgs/xxx.jpg", "/content/imgs/yyy.jpg"],
      "tags": ["日常"],
      "created_at": "2026-04-17"
    }
  ]
}
```

#### POST /api/gallery/save
保存相册数据。

**请求体：**
```json
{
  "galleries": [ /* Gallery[] */ ]
}
```

**响应：**
```json
{ "success": true }
```

### 需要后端实现
- `GET /api/galleries` — 列表（分页、标签筛选）
- `GET /api/galleries/:id` — 详情
- `POST /api/galleries` — 创建相册
- `PUT /api/galleries/:id` — 更新
- `DELETE /api/galleries/:id` — 删除相册

---

## 6. 许可证（License）

### 数据文件
`public/content/license.json`（新建文件，可能为空）

### 数据结构

```typescript
// 前端发送/接收格式
{
  content: string;  // Markdown 内容
}
```

### 接口

#### GET /content/license.json

**响应：**
```json
{
  "content": "## 许可证\\n\\n本站内容采用..."
}
```

#### POST /api/license/save

**请求体：**
```json
{
  "content": "## 许可证\n\n本站内容采用..."
}
```

**响应：**
```json
{ "success": true }
```

---

## 7. 隐私政策（Privacy）

### 数据文件
`public/content/privacy.json`（新建文件）

### 数据结构

```typescript
interface PolicyVersion {
  version: string;     // "v1.0"
  date: string;        // "YYYY-MM-DD"
  content: string;     // Markdown 内容
}
```

### 接口

#### GET /content/privacy.json

**响应：**
```json
{
  "versions": [
    {
      "version": "v1.0",
      "date": "2026-04-29",
      "content": "## 隐私政策\n\n..."
    }
  ]
}
```

#### POST /api/privacy/save

**请求体：**
```json
{
  "versions": [
    { "version": "v1.0", "date": "2026-04-29", "content": "..." }
  ]
}
```

**响应：**
```json
{ "success": true }
```

---

## 8. 番剧（Bangumi）

### 外部 API

本模块依赖两个外部 API，前端通过 Vite Dev Proxy 和 Cloudflare Workers 代理访问。

#### Bangumi API (api.bgm.tv)

| 前端调用 | 代理路径 | 原始 API | 说明 |
|---------|---------|---------|------|
| `POST` | `/api/bangumi/v0/search/subjects` | `POST /v0/search/subjects` | 搜索条目 |
| `GET` | `/api/bangumi/v0/subjects/:id` | `GET /v0/subjects/:id` | 条目详情 |
| `GET` | `/api/bangumi/calendar` | `GET /calendar` | 每周放送表 |
| `GET` | `/api/bangumi/v0/subjects` | `GET /v0/subjects` | 浏览条目 |

**搜索请求体：**
```json
{
  "keyword": "string",
  "sort": "match" | "heat" | "rank" | "score",
  "filter": {
    "type": [2],
    "meta_tags": ["string"],
    "tag": ["string"],
    "air_date": ["string"],
    "rating": ["string"]
  },
  "limit": 10,
  "offset": 0
}
```

**条目详情响应：**
```typescript
interface BangumiSubjectInfo {
  id: number;
  name: string;
  name_cn: string;
  summary: string;
  date: string;
  platform: string;
  images: {
    small: string;
    grid: string;
    large: string;
    medium: string;
    common: string;
  };
  rating?: {
    score: number;
    total: number;
    count: { 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; 7: number; 8: number; 9: number; 10: number };
  };
  tags?: Array<{ name: string; count: number }>;
  eps?: number;
  collection?: { doing: number; wish: number; collect: number; on_hold: number; dropped: number };
}
```

#### AnimeGarden API (api.animes.garden)

| 请求 | 说明 |
|------|------|
| `GET /resources` | 搜索资源，支持丰富查询参数 |

**查询参数：** `page`, `pageSize`, `search`, `include`, `keywords`, `exclude`, `type`, `fansub`, `publisher`, `subject`, `after`, `before`, `provider`, `metadata`, `tracker`

**资源响应：**
```typescript
interface AnimeResource {
  id: number;
  title: string;
  type: string;
  magnet: string;
  tracker?: string | null;
  size: number;
  created_at: Date;
  fetched_at: Date;
  fansub?: { id: number; name: string; avatar?: string | null } | null;
  publisher: { id: number; name: string; avatar?: string | null };
  subject_id?: number | null;
  metadata?: { anipar?: { episode?: { number: number }; title?: string; ... } } | null;
}
```

### 本地番剧记录（浏览器 localStorage）

```typescript
type BangumiStatus = 'watching' | 'want_to_watch' | 'watched' | 'dropped';

interface BangumiRecord {
  id: string;
  subject_id: number;
  title: string;
  status: BangumiStatus;
  progress: string;
  added_at: string;
  cover_url?: string;
  fansub?: string;
}
```

---

## 9. 图片上传

### POST /api/upload

**请求体：**
```json
{
  "filename": "photo.jpg",
  "data": "<base64 encoded image data>"
}
```

**处理流程：** Sharp 库 auto-rotate → 剥离元数据 → 保存至 `public/content/imgs/`

**响应：**
```json
{
  "path": "/content/imgs/1712345678-abc123.jpg"
}
```

---

## 10. 中文翻译

### POST /api/baidu-translate

**请求体：**
```json
{
  "q": "需要翻译的中文"
}
```

**响应：**
```json
{
  "trans_result": [
    { "src": "需要翻译的中文", "dst": "Chinese to be translated" }
  ]
}
```

---
