# fufu-rs API 对接文档（前端版）

> 最后更新：2026-05-01

---

## 目录

1. [基础约定](#1-基础约定)
2. [认证系统](#2-认证系统)
3. [仪表盘](#3-仪表盘)
4. [站点设置](#4-站点设置)
5. [博客](#5-博客)
6. [搜索](#6-搜索)
7. [点赞系统](#7-点赞系统)
8. [友人帐](#8-友人帐)
9. [链接收藏](#9-链接收藏)
10. [相册](#10-相册)
11. [法律文档](#11-法律文档)
12. [番剧记录](#12-番剧记录)
13. [外部 API 代理](#13-外部-api-代理)
14. [翻译](#14-翻译)
15. [垃圾桶](#15-垃圾桶)
16. [健康检查](#16-健康检查)

---

## 1. 基础约定

### 1.1 基本信息

| 项目 | 值 |
|------|-----|
| 基础路径 | `/api` |
| 请求/响应体 | `application/json` |
| 时间格式 | RFC 3339（如 `2026-05-01T12:00:00Z`） |
| 主键 | UUID v7 字符串 |

### 1.2 分页格式

所有列表接口统一使用以下查询参数和响应格式：

**请求参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码，从 1 开始 |
| `page_size` | number | 10~20 | 每页条数，最大 100 |

**响应结构：**

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "page_size": 10,
  "total_pages": 10
}
```

### 1.3 鉴权方式

需要登录的接口在请求头携带：

```
Authorization: Bearer <access_token>
```

Token 类型：

| Token | 用途 | 过期时间 |
|-------|------|----------|
| `access_token` | 访问受保护 API | 短时效（默认 15 分钟） |
| `refresh_token` | 刷新 access_token | 长时效（默认 7 天） |
| `temp_token` | 登录第二步验证 | 短时效（默认 5 分钟） |

### 1.4 统一响应格式

**成功响应：** 直接返回 JSON 数据体，没有外层包装。

**错误响应：**

```json
{
  "error": {
    "code": 1004,
    "message": "文章不存在或已被删除"
  }
}
```

**HTTP 状态码：**

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 创建成功 |
| 400 | Bad Request | 参数错误 |
| 401 | Unauthorized | 未登录或 token 过期 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 冲突（如重复数据） |
| 422 | Unprocessable Entity | 验证失败 |
| 429 | Too Many Requests | 频率超限 |
| 500 | Internal Server Error | 服务器错误 |
| 502 | Bad Gateway | 外部 API 调用失败 |

**业务错误码：**

| 业务码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| `1001` | 400 | 参数校验不通过 |
| `1002` | 401 | 邮箱或密码错误 |
| `1003` | 401 | 需要 TOTP 第二步验证 |
| `1004` | 404 | 资源不存在 |
| `1005` | 409 | 资源冲突 |
| `1006` | 429 | 请求频率超限 |
| `2001` | 401 | TOTP 验证码错误 |
| `2002` | 401 | 邮箱验证码错误或已过期 |
| `2003` | 401 | 临时令牌已过期 |
| `5001` | 500 | 服务器内部错误 |
| `5002` | 502 | 外部 API 调用失败 |

---

## 2. 认证系统

### 2.1 注册（首次设置）

#### POST /api/auth/register — 注册管理员

> **限制：** 仅当系统中没有任何管理员时可用，用于首次部署时初始化账号。
> 已有管理员后该接口返回 409，防止被滥用。

**请求：**

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "your_password"
}
```

**响应：**

```json
{
  "id": "0194f...",
  "username": "admin",
  "email": "admin@example.com",
  "totp_enabled": false,
  "role": "admin",
  "created_at": "2026-05-01T00:00:00Z"
}
```

### 2.2 登录流程

登录分两步：

1. **第一步：** 提交邮箱+密码 → 返回 `temp_token` 和下一步方式
2. **第二步：** 根据第一步的指示，提交 `temp_token` + 验证码

```
登录流程图示：

用户提交邮箱密码
      │
      ▼
  验证密码
      │
      ├── 2FA 已开启 ──→ 返回 require_2fa=true
      │                      │
      │                      ▼
      │                  POST /login/2fa (temp_token + TOTP码) ──→ 得到 JWT
      │
      └── 2FA 未开启 ──→ 返回 require_email_verify=true
                           │
                           ▼
                      发送邮箱验证码（6位）
                           │
                           ▼
                      POST /login/verify (temp_token + 验证码) ──→ 得到 JWT
```

#### POST /api/auth/login — 第一步：验证邮箱密码

**请求：**

```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**响应（2FA 已开启）：**

```json
{
  "temp_token": "eyJ...",
  "require_2fa": true,
  "require_email_verify": false
}
```

**响应（2FA 未开启，需邮箱验证码）：**

```json
{
  "temp_token": "eyJ...",
  "require_2fa": false,
  "require_email_verify": true
}
```

#### POST /api/auth/login/2fa — 第二步：TOTP 验证

**请求：**

```json
{
  "temp_token": "eyJ...",
  "code": "123456"
}
```

**响应：**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

#### POST /api/auth/login/verify — 第二步：邮箱验证码验证

**请求：**

```json
{
  "temp_token": "eyJ...",
  "code": "483921"
}
```

**响应：**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

### 2.2 Token 刷新 & 登出

#### POST /api/auth/refresh — 刷新 Token

**请求：**

```json
{
  "refresh_token": "eyJ..."
}
```

**响应（返回新的 token 对，旧的 refresh_token 加入黑名单）：**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

#### POST /api/auth/logout — 登出

> 需要 `Authorization` header

**请求：**

```json
{
  "refresh_token": "eyJ..."
}
```

**响应：**

```json
{
  "message": "已登出"
}
```

### 2.3 管理员信息

#### GET /api/auth/me — 获取当前管理员信息

> 需要 `Authorization` header

**响应：**

```json
{
  "id": "0194f...",
  "username": "admin",
  "email": "admin@example.com",
  "totp_enabled": false,
  "role": "admin",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### 2.4 2FA 管理

> 以下接口均需要 `Authorization` header

#### POST /api/auth/2fa/setup — 生成 TOTP 密钥

返回 TOTP 密钥和 `otpauth://` URI，前端可用此 URI 生成二维码供用户扫描。

**响应：**

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "uri": "otpauth://totp/fufu-rs:admin@example.com?secret=...&issuer=fufu-rs"
}
```

#### POST /api/auth/2fa/verify — 确认开启 2FA

用户首次绑定 TOTP 后，提交一个验证码来确认设置正确。

**请求：**

```json
{
  "code": "123456"
}
```

**响应：**

```json
{
  "message": "2FA 已开启"
}
```

#### POST /api/auth/2fa/disable — 关闭 2FA

需要验证密码。

**请求：**

```json
{
  "password": "your_password"
}
```

**响应：**

```json
{
  "message": "2FA 已关闭"
}
```

---

## 3. 仪表盘

#### GET /api/auth/dashboard — 全站运营数据

> 需要 `Authorization` header

从 Cloudflare GraphQL Analytics 聚合获取运营数据，同时包含站点运行状态和各模块统计。

**响应：**

```json
{
  "today": {
    "requests": 1289,
    "bandwidth": "45.6 MB",
    "avg_duration_ms": 23
  },
  "this_month": {
    "requests": 38420,
    "bandwidth": "1.2 GB"
  },
  "total": {
    "requests": 284123,
    "bandwidth": "8.5 GB"
  },
  "status_codes": {
    "2xx": 281000,
    "4xx": 2800,
    "5xx": 323
  },
  "health": {
    "status": "ok",
    "uptime": 123456,
    "version": "0.1.0",
    "d1": { "status": "ok", "latency_ms": 5 },
    "kv": { "status": "ok", "latency_ms": 3 }
  },
  "stats": {
    "posts": 42,
    "friends": 8,
    "links": 20,
    "galleries": 5,
    "bangumi_records": 30
  }
}
```

> 注意：仪表盘的 `health` 和 `stats` 字段与公开的 `/api/status` 接口数据一致，管理面板可以直接使用仪表盘接口获取全部信息。

---

## 4. 站点设置

### 4.1 站点信息 Profile

> 需要 `Authorization` header

#### GET /api/settings/profile

**响应：**

```json
{
  "data": {
    "id": "0194f...",
    "site_name": "我的站点",
    "subtitle": "副标题",
    "logo_url": "https://...",
    "description": "站点描述",
    "keywords": "关键词1,关键词2",
    "icp_beian": "京ICP备xxxx号",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-05-01T00:00:00Z"
  }
}
```

#### PUT /api/settings/profile

**请求（全部可选，只传需要更新的字段）：**

```json
{
  "site_name": "我的站点",
  "subtitle": "副标题",
  "logo_url": "https://...",
  "description": "站点描述",
  "keywords": "关键词1,关键词2",
  "icp_beian": "京ICP备xxxx号"
}
```

**响应：** 同 GET 的 `{ "data": {...} }` 格式。

### 4.2 页脚信息 Footer

> 需要 `Authorization` header

#### GET /api/settings/footer

**响应：**

```json
{
  "data": {
    "id": "0194f...",
    "content": "页脚内容",
    "copyright_text": "© 2026",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

#### PUT /api/settings/footer

**请求（全部可选）：**

```json
{
  "content": "页脚内容",
  "copyright_text": "© 2026"
}
```

### 4.3 页脚链接 Footer Links

> 需要 `Authorization` header

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/settings/footer-links | 列表 |
| POST | /api/settings/footer-links | 添加 |
| PUT | /api/settings/footer-links/:id | 更新 |
| DELETE | /api/settings/footer-links/:id | 删除 |

#### GET /api/settings/footer-links

**响应：** 直接返回数组

```json
[
  {
    "id": "0194f...",
    "name": "隐私政策",
    "url": "/privacy",
    "sort_order": 1,
    "created_at": "...",
    "updated_at": "...",
    "deleted_at": null
  }
]
```

#### POST /api/settings/footer-links

**请求：**

```json
{
  "name": "隐私政策",
  "url": "/privacy",
  "sort_order": 1
}
```

**响应：** 返回创建后的完整对象

#### PUT /api/settings/footer-links/:id

**请求：** 同 POST

**响应：** 返回更新后的完整对象

#### DELETE /api/settings/footer-links/:id

**响应：**

```json
{ "message": "已删除" }
```

### 4.4 社交链接 Social Links

> 需要 `Authorization` header

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/settings/social-links | 列表 |
| POST | /api/settings/social-links | 添加 |
| PUT | /api/settings/social-links/:id | 更新 |
| DELETE | /api/settings/social-links/:id | 删除 |

#### GET /api/settings/social-links

**响应：** 直接返回数组

```json
[
  {
    "id": "0194f...",
    "platform": "bilibili",
    "label": "B 站",
    "url": "https://space.bilibili.com/...",
    "icon": "",
    "sort_order": 1,
    "created_at": "...",
    "updated_at": "...",
    "deleted_at": null
  }
]
```

#### POST /api/settings/social-links

**请求：**

```json
{
  "platform": "bilibili",
  "label": "B 站",
  "url": "https://space.bilibili.com/...",
  "icon": "",
  "sort_order": 1
}
```

### 4.5 公告 Announcements

> 需要 `Authorization` header

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/settings/announcements | 列表 |
| POST | /api/settings/announcements | 添加 |
| PUT | /api/settings/announcements/:id | 更新 |
| DELETE | /api/settings/announcements/:id | 删除 |

#### GET /api/settings/announcements

**响应：** 直接返回数组

```json
[
  {
    "id": "0194f...",
    "content": "公告内容",
    "active": true,
    "sort_order": 1,
    "created_at": "...",
    "updated_at": "...",
    "deleted_at": null
  }
]
```

#### POST /api/settings/announcements

**请求：**

```json
{
  "content": "公告内容",
  "active": true,
  "sort_order": 1
}
```

---

## 5. 博客

### 5.1 文章列表

#### GET /api/posts

> 不需要登录，但登录后可查看非 published 状态的文章

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码 |
| `page_size` | number | 10 | 每页条数 |
| `tag` | string | - | 按标签筛选 |
| `year` | string | - | 按年份筛选，如 `2026` |
| `status` | string | `published` | 仅登录后可用 |

**响应：**

```json
{
  "data": [
    {
      "id": "0194f...",
      "title": "文章标题",
      "slug": "article-slug",
      "excerpt": "摘要内容...",
      "tags": ["技术", "Rust"],
      "status": "published",
      "view_count": 128,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z",
      "published_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 10,
  "total_pages": 5
}
```

### 5.2 文章详情

#### GET /api/posts/:slug

**响应：**

```json
{
  "id": "0194f...",
  "title": "文章标题",
  "slug": "article-slug",
  "content": "# Markdown 正文...",
  "excerpt": "摘要",
  "tags": ["技术", "Rust"],
  "status": "published",
  "view_count": 128,
  "github_discussion_number": 5,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z",
  "published_at": "2026-01-01T00:00:00Z"
}
```

### 5.3 创建文章

#### POST /api/posts

> 需要 `Authorization` header

**请求：**

```json
{
  "title": "文章标题",
  "slug": "custom-slug",
  "content": "# Markdown 正文",
  "excerpt": "摘要（可选，不传则自动截取正文前200字）",
  "tags": ["技术", "Rust"],
  "status": "draft",
  "github_discussion_number": 5
}
```

**说明：**
- `slug` 不传则自动从 title 生成
- `status` 默认为 `draft`，发布请传 `published`
- `status` 为 `published` 时会自动设置 `published_at`

**响应：** 返回完整的 Post 对象

### 5.4 更新文章

#### PUT /api/posts/:slug

> 需要 `Authorization` header

**请求（全部可选）：**

```json
{
  "title": "新标题",
  "slug": "new-slug",
  "content": "# 新正文",
  "excerpt": "新摘要",
  "tags": ["技术", "Rust"],
  "status": "published",
  "published_at": "2026-01-01T00:00:00Z",
  "github_discussion_number": 5
}
```

**响应：** 返回更新后的完整 Post 对象

### 5.5 删除文章

#### DELETE /api/posts/:slug

> 需要 `Authorization` header — 逻辑删除

**响应：**

```json
{ "message": "已删除" }
```

### 5.6 增加浏览量

#### POST /api/posts/:slug/views

**响应：**

```json
{ "message": "ok" }
```

### 5.7 评论数代理

#### GET /api/posts/:slug/comments-count

通过 GitHub Discussion API 获取评论数，结果缓存在 KV（5 分钟）。

**响应：**

```json
{
  "count": 12
}
```

---

## 6. 搜索

### 6.1 全站搜索

#### GET /api/search

> 搜索全站内容，包括文章、收藏链接、相册、友人帐、公告。

**请求参数：**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `q` | string | 是 | - | 搜索关键词，最少 2 个字符 |
| `page` | number | 否 | 1 | 页码 |
| `page_size` | number | 否 | 10 | 每页条数，最大 100 |

**响应结构：**

```json
{
  "data": [
    {
      "type": "post",
      "title": "用 Rust 构建 Web 应用",
      "url": "/posts/building-web-apps-with-rust",
      "snippet": "…本文将介绍如何用 Rust 构建高性能 Web 应用…",
      "published_at": "2026-04-28T00:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "page_size": 10,
  "total_pages": 2,
  "query": "rust"
}
```

**`type` 字段说明：**

| type | 对应内容 | 搜索字段 | title 来源 | url 说明 |
|------|---------|---------|-----------|---------|
| `post` | 文章 | title / content / excerpt | 文章标题 | `/posts/{slug}` |
| `link` | 收藏链接 | title / description | 链接标题 | 原始 URL |
| `gallery` | 相册 | title | 相册标题 | null（无独立页） |
| `friend` | 友人帐 | name / description | 友链名称 | 友链网站 URL |
| `announcement` | 公告 | content | 内容前 50 字 | null（无独立页） |

**排序规则：** 标题匹配 > 摘要/描述匹配 > 正文匹配 → 发布/创建时间降序

---

## 7. 点赞系统

### 6.1 点赞/取消点赞

#### POST /api/likes/:target_type/:target_id

> `target_type` 支持：`post`（文章）、`site`（站点点赞）
> `target_id`：post 用 slug，site 用 `main`

通过 KV 记录访客点赞状态，30 天内同一访客再次请求会取消点赞。

**响应：**

```json
{
  "count": 42,
  "liked": true
}
```

### 6.2 获取点赞数

#### GET /api/likes/:target_type/:target_id

**响应：**

```json
{
  "count": 42,
  "liked": false
}
```

---

## 7. 友人帐

### 7.1 友链列表

#### GET /api/friends

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | |
| `page_size` | number | 20 | |
| `status` | string | `approved` | 未登录仅看 approved，登录后可筛选 |

**响应：** 分页格式，`data` 中每个元素：

```json
{
  "id": "0194f...",
  "name": "友人站点",
  "url": "https://example.com",
  "avatar_url": "https://example.com/avatar.png",
  "description": "站点描述",
  "email": "contact@example.com",
  "status": "approved",
  "sort_order": 1,
  "created_at": "...",
  "updated_at": "...",
  "deleted_at": null
}
```

### 7.2 友链详情

#### GET /api/friends/:id

**响应：** 返回单个 Friend 对象

### 7.3 添加友链

#### POST /api/friends

> 需要 `Authorization` header

**请求：**

```json
{
  "name": "友人站点",
  "url": "https://example.com",
  "avatar_url": "https://example.com/avatar.png",
  "description": "站点描述",
  "email": "contact@example.com"
}
```

> 新添加的友链状态默认为 `pending`，需管理员审核。

### 7.4 更新友链

#### PUT /api/friends/:id

> 需要 `Authorization` header

**请求（全部可选）：**

```json
{
  "name": "新名称",
  "url": "https://new-url.com",
  "avatar_url": "https://...",
  "description": "新描述",
  "email": "new@example.com",
  "sort_order": 2
}
```

### 7.5 删除友链

#### DELETE /api/friends/:id

> 需要 `Authorization` header

### 7.6 审核友链

#### PATCH /api/friends/:id/status

> 需要 `Authorization` header

**请求：**

```json
{
  "status": "approved"
}
```

`status` 值：`approved` | `rejected`

---

## 8. 链接收藏

### 8.1 链接列表

#### GET /api/links

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | |
| `page_size` | number | 20 | |
| `tag` | string | - | 按标签筛选 |
| `favorite` | number | - | 1 表示只看收藏 |

**响应：** 分页格式

```json
{
  "data": [
    {
      "id": "0194f...",
      "title": "链接标题",
      "url": "https://example.com",
      "description": "描述",
      "favicon_url": "https://example.com/favicon.ico",
      "tags": ["前端", "工具"],
      "favorite": 1,
      "sort_order": 0,
      "created_at": "...",
      "updated_at": "...",
      "deleted_at": null
    }
  ],
  "total": 20,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

> `favorite` 为 1 表示收藏，0 表示未收藏。

### 8.2 标签元数据

#### GET /api/links/meta

返回全量标签及其出现次数。

**响应：**

```json
{
  "tags": [
    { "tag": "前端", "count": 5 },
    { "tag": "工具", "count": 3 }
  ]
}
```

### 8.3 链接详情

#### GET /api/links/:id

返回单个 Link 对象。

### 8.4 添加链接

#### POST /api/links

> 需要 `Authorization` header

**请求：**

```json
{
  "title": "链接标题",
  "url": "https://example.com",
  "description": "描述",
  "favicon_url": "https://example.com/favicon.ico",
  "tags": ["前端", "工具"],
  "favorite": 1,
  "sort_order": 0
}
```

> `favorite` 为可选，1 表示收藏，0 或留空表示不收藏。

### 8.5 更新链接

#### PUT /api/links/:id

> 需要 `Authorization` header

**请求（全部可选）：**

```json
{
  "title": "新标题",
  "url": "https://new-url.com",
  "description": "新描述",
  "favicon_url": "https://...",
  "tags": ["新标签"],
  "favorite": 1,
  "sort_order": 1
}
```

### 8.6 删除链接

#### DELETE /api/links/:id

> 需要 `Authorization` header

---

## 9. 相册

### 9.1 相册列表

#### GET /api/galleries

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | |
| `page_size` | number | 20 | |
| `tag` | string | - | 按标签筛选 |

**响应：** 分页格式

```json
{
  "data": [
    {
      "id": "0194f...",
      "title": "相册标题",
      "cover_path": "https://.../cover.jpg",
      "tags": ["旅行", "风景"],
      "created_at": "...",
      "updated_at": "...",
      "deleted_at": null
    }
  ],
  "total": 5,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

### 9.2 相册详情（含照片列表）

#### GET /api/galleries/:id

**响应：**

```json
{
  "id": "0194f...",
  "title": "相册标题",
  "cover_path": "https://.../cover.jpg",
  "tags": ["旅行", "风景"],
  "created_at": "...",
  "updated_at": "...",
  "photos": [
    {
      "id": "0194f...",
      "gallery_id": "0194f...",
      "path": "https://.../photo1.jpg",
      "created_at": "...",
      "deleted_at": null
    }
  ]
}
```

### 9.3 创建相册

#### POST /api/galleries

> 需要 `Authorization` header

**请求：**

```json
{
  "title": "相册标题",
  "cover_path": "https://.../cover.jpg",
  "tags": ["旅行", "风景"]
}
```

### 9.4 更新相册

#### PUT /api/galleries/:id

> 需要 `Authorization` header

**请求（全部可选）：**

```json
{
  "title": "新标题",
  "cover_path": "https://.../new-cover.jpg",
  "tags": ["旅行"]
}
```

### 9.5 删除相册

#### DELETE /api/galleries/:id

> 需要 `Authorization` header — 逻辑删除

### 9.6 添加照片

#### POST /api/galleries/:id/photos

> 需要 `Authorization` header
> 前端自行处理图片上传，将图片 URL 传给后端。

**请求：**

```json
{
  "paths": [
    "https://.../photo1.jpg",
    "https://.../photo2.jpg"
  ]
}
```

**响应：** 返回创建的照片数组

```json
[
  {
    "id": "0194f...",
    "gallery_id": "0194f...",
    "path": "https://.../photo1.jpg",
    "created_at": "...",
    "deleted_at": null
  }
]
```

### 9.7 删除照片

#### DELETE /api/photos/:id

> 需要 `Authorization` header — 逻辑删除

### 9.8 图片加速代理

通过 jsDelivr CDN 加速 GitHub raw 图片加载，**无需后端处理，不消耗任何服务端资源**。

#### 配置方式

前端 `.env` 设置：
```bash
VITE_IMAGE_PROXY_BASE=jsdelivr
```

URL 转换规则：
```
原始: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
jsDelivr: https://cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/{path}
```

示例：
```
原始: https://raw.githubusercontent.com/f0na/fufu-vue/main/content/imgs/xxx.png
结果: https://cdn.jsdelivr.net/gh/f0na/fufu-vue@main/content/imgs/xxx.png
```

> jsDelivr 是专门加速 GitHub 内容的免费 CDN，国内访问速度快，无需任何后端改动。
> 如果不想用 jsDelivr，也可将 `VITE_IMAGE_PROXY_BASE` 设为自定义代理地址。

---

## 10. 法律文档

### 10.1 许可证

#### GET /api/license

获取最新版本的许可证。

**响应：**

```json
{
  "id": "0194f...",
  "version": "v1.0",
  "content": "## 许可证\n\n...（Markdown 内容）",
  "created_at": "2026-01-01T00:00:00Z"
}
```

#### GET /api/license/versions

获取所有版本历史。

**响应：**

```json
[
  {
    "id": "0194f...",
    "version": "v1.0",
    "content": "...",
    "created_at": "..."
  }
]
```

#### POST /api/license

> 需要 `Authorization` header

**请求：**

```json
{
  "version": "v1.0",
  "content": "## 许可证\n\n...（Markdown 内容）"
}
```

### 10.2 隐私政策

#### GET /api/privacy

获取最新版本的隐私政策。

**响应：**

```json
{
  "id": "0194f...",
  "version": "v1.0",
  "date": "2026-01-01",
  "content": "## 隐私政策\n\n...",
  "created_at": "..."
}
```

#### GET /api/privacy/versions

**响应：**

```json
[
  {
    "id": "0194f...",
    "version": "v1.0",
    "date": "2026-01-01",
    "content": "...",
    "created_at": "..."
  }
]
```

#### POST /api/privacy

> 需要 `Authorization` header

**请求：**

```json
{
  "version": "v1.0",
  "date": "2026-01-01",
  "content": "## 隐私政策\n\n..."
}
```

---

## 11. 番剧记录

### 11.1 追番列表

#### GET /api/bangumi/records

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | |
| `page_size` | number | 20 | |
| `status` | string | - | 筛选：`watching` / `want_to_watch` / `watched` / `dropped` |
| `subject_id` | number | - | 按 Bangumi 条目 ID 查询 |

**响应：** 分页格式

```json
{
  "data": [
    {
      "id": "0194f...",
      "subject_id": 12345,
      "title": "番剧标题",
      "status": "watching",
      "progress": "12/24",
      "cover_url": "https://...",
      "fansub": "字幕组",
      "added_at": "...",
      "updated_at": "...",
      "deleted_at": null
    }
  ],
  "total": 30,
  "page": 1,
  "page_size": 20,
  "total_pages": 2
}
```

**状态枚举：**

| 值 | 说明 |
|----|------|
| `watching` | 在看 |
| `want_to_watch` | 想看 |
| `watched` | 已看 |
| `dropped` | 弃番 |

### 11.2 添加追番

#### POST /api/bangumi/records

> 需要 `Authorization` header

**请求：**

```json
{
  "subject_id": 12345,
  "title": "番剧标题",
  "status": "watching",
  "progress": "12/24",
  "cover_url": "https://...",
  "fansub": "字幕组"
}
```

`status` 默认为 `want_to_watch`

### 11.3 更新追番

#### PUT /api/bangumi/records/:id

> 需要 `Authorization` header

**请求（全部可选）：**

```json
{
  "title": "新标题",
  "status": "watched",
  "progress": "24/24",
  "cover_url": "https://...",
  "fansub": "新字幕组"
}
```

### 11.4 删除追番

#### DELETE /api/bangumi/records/:id

> 需要 `Authorization` header — 逻辑删除

---

## 12. 外部 API 代理

后端透传请求解决跨域，前端无需关心原始 API 地址。

### 12.1 Bangumi 搜索

#### POST /api/bangumi/search

**请求（JSON Body）：**

```json
{
  "keyword": "进击的巨人",
  "sort": "heat",
  "filter": {
    "type": [2],
    "rating": [">=7"]
  },
  "limit": 10,
  "offset": 0
}
```

**参数说明：**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `keyword` | string | 是 | - | 搜索关键词 |
| `sort` | string | 否 | `"match"` | 排序：`match`=匹配度, `heat`=收藏人数, `rank`=排名, `score`=评分 |
| `filter` | object | 否 | - | 筛选条件，见下方 |
| `limit` | number | 否 | 10 | 每页条数 |
| `offset` | number | 否 | 0 | 偏移量 |

**filter 字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | number[] | 条目类型：`[1]`=书籍, `[2]`=动画, `[3]`=音乐, `[4]`=游戏, `[6]`=三次元 |
| `tag` | string[] | 标签，多值 `且`，可用 `-` 排除 |
| `meta_tags` | string[] | 公共标签 |
| `air_date` | string[] | 播出/发售日期，如 `[">=2020-07-01"]` |
| `rating` | string[] | 评分范围，如 `[">=6", "<8"]` |
| `rating_count` | string[] | 评分人数，如 `[">=200"]` |
| `rank` | string[] | 排名范围 |
| `nsfw` | boolean | `true`=仅 R18, `false`=排除 R18, 不传=全部 |

**缓存：** 1 小时（按完整请求参数组合缓存）

### 12.2 Bangumi 条目详情

#### GET /api/bangumi/subjects/:id

**缓存：** 24 小时

### 12.3 Bangumi 每日放送

#### GET /api/bangumi/calendar

**缓存：** 1 小时

### 12.4 Bangumi 浏览

#### GET /api/bangumi/browse

查询参数透传给 bangumi API（如 `?page=1&limit=24&type=2`）。

**缓存：** 1 小时

### 12.5 AnimeGarden 资源

#### GET /api/anime-garden/resources

查询参数透传给 anime-garden API（如 `?query=...&provider=...`）。

**缓存：** 30 分钟

---

## 13. 翻译

#### POST /api/translate

百度翻译 API 代理。默认中译英。

**请求：**

```json
{
  "text": "你好世界",
  "from": "auto",
  "to": "en"
}
```

**响应：** 透传百度翻译 API 原始返回。

```json
{
  "from": "zh",
  "to": "en",
  "trans_result": [
    {
      "src": "你好世界",
      "dst": "Hello World"
    }
  ]
}
```

---

## 14. 垃圾桶

### 14.1 垃圾桶列表

#### GET /api/trash/:resource

**支持的 `:resource` 值：** `posts`, `friends`, `links`, `galleries`, `bangumi/records`（也支持 `bangumi`、`bangumi-records`、`bangumi_records`）

**查询参数：**

| 参数 | 类型 | 默认值 |
|------|------|--------|
| `page` | number | 1 |
| `page_size` | number | 20 |

**响应：** 分页格式，`data` 中每个 item 返回该资源的完整字段（不含大文本如 `content`），字段与各管理列表接口一致。

各资源的响应字段：

**posts：** `id`, `title`, `slug`, `excerpt`, `tags`, `status`, `view_count`, `created_at`, `updated_at`, `published_at`, `deleted_at`
**friends：** `id`, `name`, `url`, `avatar_url`, `description`, `email`, `status`, `sort_order`, `created_at`, `updated_at`, `deleted_at`
**links：** `id`, `title`, `url`, `description`, `favicon_url`, `tags`, `favorite`, `sort_order`, `created_at`, `updated_at`, `deleted_at`
**galleries：** `id`, `title`, `cover_path`, `tags`, `created_at`, `updated_at`, `deleted_at`
**bangumi-records：** `id`, `subject_id`, `title`, `status`, `progress`, `cover_url`, `fansub`, `added_at`, `updated_at`, `deleted_at`

```json
{
  "data": [
    {
      "id": "0194f...",
      "title": "已删除的文章标题",
      "slug": "deleted-article",
      "excerpt": "文章摘要",
      "tags": "[\"tag1\",\"tag2\"]",
      "status": "published",
      "view_count": 42,
      "created_at": "2026-04-01T12:00:00Z",
      "updated_at": "2026-04-15T12:00:00Z",
      "published_at": "2026-04-01T12:00:00Z",
      "deleted_at": "2026-05-01T12:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

### 14.2 真删除

#### DELETE /api/trash/:resource/:id

> 需要 `Authorization` header — 永久删除，不可恢复

**响应：**

```json
{ "message": "已永久删除" }
```

### 14.3 恢复

#### POST /api/trash/:resource/:id/restore

> 需要 `Authorization` header

**响应：**

```json
{ "message": "已恢复" }
```

---

## 15. 站点状态（公开）

#### GET /api/status

无需认证，返回站点基本信息、各模块数据量和 API 健康状态。

> uptime 通过 KV 持久化，**重新部署不会重置**，只有手动清除 KV 才会归零。

**响应：**

```json
{
  "api": {
    "status": "ok",
    "uptime": 123456,
    "version": "0.1.0",
    "d1": { "status": "ok", "latency_ms": 12 },
    "kv": { "status": "ok", "latency_ms": 8 }
  },
  "site": {
    "site_name": "我的站点",
    "subtitle": "副标题",
    "description": "站点描述",
    "logo_url": "https://..."
  },
  "stats": {
    "posts": 42,
    "friends": 8,
    "links": 20,
    "galleries": 5,
    "bangumi_records": 30
  }
}
```

---

## 16. 健康检查

#### GET /api/health

**响应：**

```json
{
  "status": "ok",
  "uptime": 123456,
  "checks": {
    "d1": { "status": "ok", "latency_ms": 12 },
    "kv": { "status": "ok", "latency_ms": 8 },
    "bangumi_api": { "status": "ok", "latency_ms": 234 },
    "anime_garden_api": { "status": "ok", "latency_ms": 156 }
  }
}
```

---

## 附录：接口速查表

### 公开接口（无需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/status | 站点状态概览（公开） |
| POST | /api/auth/register | 注册（仅首次无管理员时） |
| POST | /api/auth/login | 登录第一步 |
| POST | /api/auth/login/2fa | 登录第二步（TOTP） |
| POST | /api/auth/login/verify | 登录第二步（邮箱验证码） |
| POST | /api/auth/refresh | 刷新 Token |
| GET | /api/posts | 文章列表 |
| GET | /api/posts/:slug | 文章详情 |
| POST | /api/posts/:slug/views | 增加浏览量 |
| GET | /api/posts/:slug/comments-count | 评论数 |
| GET/POST | /api/likes/:type/:id | 点赞 |
| GET | /api/friends | 友链列表 |
| GET | /api/friends/:id | 友链详情 |
| GET | /api/links | 链接列表 |
| GET | /api/links/meta | 标签元数据 |
| GET | /api/links/:id | 链接详情 |
| GET | /api/galleries | 相册列表 |
| GET | /api/galleries/:id | 相册详情 |
| GET | /api/license | 最新许可证 |
| GET | /api/license/versions | 许可证历史 |
| GET | /api/privacy | 最新隐私政策 |
| GET | /api/privacy/versions | 隐私政策历史 |
| GET | /api/bangumi/records | 追番列表 |
| POST | /api/bangumi/search | Bangumi 搜索 |
| GET | /api/bangumi/subjects/:id | Bangumi 条目 |
| GET | /api/bangumi/calendar | Bangumi 日历 |
| GET | /api/bangumi/browse | Bangumi 浏览 |
| GET | /api/anime-garden/resources | AnimeGarden 资源 |
| POST | /api/translate | 翻译 |
| GET | /api/trash/:resource | 垃圾桶列表 |

### 需登录接口（需 `Authorization: Bearer <token>`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/auth/me | 管理员信息 |
| POST | /api/auth/logout | 登出 |
| GET | /api/auth/dashboard | 仪表盘 |
| POST | /api/auth/2fa/setup | 生成 TOTP 密钥 |
| POST | /api/auth/2fa/verify | 确认开启 2FA |
| POST | /api/auth/2fa/disable | 关闭 2FA |
| GET/PUT | /api/settings/profile | 站点信息 |
| GET/PUT | /api/settings/footer | 页脚信息 |
| GET/POST | /api/settings/footer-links | 页脚链接 |
| PUT/DELETE | /api/settings/footer-links/:id | 页脚链接 |
| GET/POST | /api/settings/social-links | 社交链接 |
| PUT/DELETE | /api/settings/social-links/:id | 社交链接 |
| GET/POST | /api/settings/announcements | 公告 |
| PUT/DELETE | /api/settings/announcements/:id | 公告 |
| POST | /api/posts | 创建文章 |
| PUT/DELETE | /api/posts/:slug | 更新/删除文章 |
| POST | /api/friends | 添加友链 |
| PUT/DELETE | /api/friends/:id | 更新/删除友链 |
| PATCH | /api/friends/:id/status | 审核友链 |
| POST | /api/links | 添加链接 |
| PUT/DELETE | /api/links/:id | 更新/删除链接 |
| POST | /api/galleries | 创建相册 |
| PUT/DELETE | /api/galleries/:id | 更新/删除相册 |
| POST | /api/galleries/:id/photos | 添加照片 |
| DELETE | /api/photos/:id | 删除照片 |
| POST | /api/license | 创建许可证版本 |
| POST | /api/privacy | 创建隐私政策版本 |
| POST | /api/bangumi/records | 添加追番 |
| PUT/DELETE | /api/bangumi/records/:id | 更新/删除追番 |
| DELETE | /api/trash/:resource/:id | 真删除 |
| POST | /api/trash/:resource/:id/restore | 恢复 |
