# API 接口更新 - 博客功能

> 更新日期：2026/04/07

---

## 新增接口

### 文章模块

#### 公开接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/posts` | GET | 文章列表（分页、筛选） |
| `/api/v1/posts/{id_or_slug}` | GET | 文章详情（支持 ID 或 slug） |
| `/api/v1/posts/archive` | GET | 归档列表 |
| `/api/v1/posts/tags` | GET | 标签统计 |
| `/api/v1/posts/categories` | GET | 分类统计 |

#### 管理接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/admin/posts` | GET | 管理文章列表 |
| `/api/v1/admin/posts` | POST | 创建文章 |
| `/api/v1/admin/posts/{id}` | PATCH | 更新文章（部分更新） |
| `/api/v1/admin/posts/{id}` | DELETE | 删除文章 |
| `/api/v1/admin/posts/{id}/status` | PATCH | 切换状态 |
| `/api/v1/admin/posts/{id}/top` | PATCH | 切换置顶 |

### 点赞模块（通用）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/likes` | POST | 点赞/取消点赞 |
| `/api/v1/likes/check` | GET | 检查是否已点赞 |
| `/api/v1/likes/count` | GET | 获取点赞数 |

---

## 接口详情

### 文章列表

**GET /api/v1/posts**

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| per_page | int | 否 | 每页数量，默认 10，最大 50 |
| tag | string | 否 | 标签筛选 |
| category | string | 否 | 分类筛选 |
| keyword | string | 否 | 关键词搜索（标题/摘要） |

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "012345...",
        "title": "文章标题",
        "slug": "my-first-post",
        "summary": "摘要内容...",
        "cover": "https://cdn.example.com/cover.jpg",
        "tags": ["Vue", "前端"],
        "category": "技术",
        "view_count": 100,
        "like_count": 10,
        "comment_count": 5,
        "top": false,
        "published_at": "2026-04-07T10:00:00Z",
        "created_at": "2026-04-07T10:00:00Z",
        "updated_at": "2026-04-07T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

---

### 文章详情

**GET /api/v1/posts/{id_or_slug}**

- 支持 ID 或 slug 作为路径参数
- 每次访问增加 view_count
- 只返回 status='published' 且 visible 的文章

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "012345...",
    "title": "文章标题",
    "slug": "my-first-post",
    "summary": "摘要内容...",
    "content": "# 标题\n\nMarkdown 内容...",
    "cover": "https://cdn.example.com/cover.jpg",
    "tags": ["Vue", "前端"],
    "category": "技术",
    "status": "published",
    "view_count": 101,
    "like_count": 10,
    "comment_count": 5,
    "top": false,
    "comment_allowed": true,
    "published_at": "2026-04-07T10:00:00Z",
    "created_at": "2026-04-07T10:00:00Z",
    "updated_at": "2026-04-07T10:00:00Z"
  }
}
```

---

### 归档列表

**GET /api/v1/posts/archive**

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "year": 2026,
      "months": [
        {
          "month": 4,
          "count": 5,
          "posts": [
            {
              "id": "...",
              "title": "文章标题",
              "slug": "my-post",
              "published_at": "2026-04-07T10:00:00Z"
            }
          ]
        }
      ],
      "total": 15
    }
  ]
}
```

---

### 标签统计

**GET /api/v1/posts/tags**

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "name": "Vue", "count": 10 },
    { "name": "前端", "count": 8 },
    { "name": "技术", "count": 5 }
  ]
}
```

---

### 分类统计

**GET /api/v1/posts/categories**

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "name": "技术", "count": 20 },
    { "name": "生活", "count": 10 }
  ]
}
```

---

### 创建文章

**POST /api/v1/admin/posts**

需要管理员权限。

请求：
```json
{
  "title": "文章标题",
  "slug": "my-first-post",           // 可选，不传则后端生成日期+随机串
  "summary": "摘要内容...",
  "content": "# 标题\n\nMarkdown 内容",
  "cover": "posts/cover-key.jpg",    // 可选，七牛云 key
  "tags": ["Vue", "前端"],           // 可选
  "category": "技术",                 // 可选
  "status": "published",              // 可选，默认 draft
  "top": false,                       // 可选，默认 false
  "comment_allowed": true             // 可选，默认 true
}
```

响应：201
```json
{
  "code": 0,
  "message": "created",
  "data": {
    "id": "012345...",
    "title": "文章标题",
    "slug": "my-first-post",
    ...
  }
}
```

---

### 更新文章

**PATCH /api/v1/admin/posts/{id}**

需要管理员权限。部分更新，未传入字段保留原值。

请求：
```json
{
  "title": "新标题",        // 可选
  "slug": "new-slug",       // 可选
  "summary": "新摘要",      // 可选
  "content": "新内容",      // 可选
  "cover": "new-cover",     // 可选
  "tags": ["新标签"],       // 可选
  "category": "新分类",     // 可选
  "comment_allowed": false  // 可选
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

---

### 删除文章

**DELETE /api/v1/admin/posts/{id}**

需要管理员权限。软删除。

响应：204 无内容

---

### 切换文章状态

**PATCH /api/v1/admin/posts/{id}/status**

请求：
```json
{
  "status": "published"  // published | draft | hidden
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": { "id": "...", "status": "published" }
}
```

---

### 切换置顶

**PATCH /api/v1/admin/posts/{id}/top**

请求：
```json
{
  "top": true
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": { "id": "...", "top": true }
}
```

---

### 点赞/取消点赞

**POST /api/v1/likes**

通用点赞接口，支持多种目标类型。

请求：
```json
{
  "target_type": "post",    // gallery | bangumi | post | site
  "target_id": "012345..."  // site 类型时可为空
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "liked": true,          // true=点赞成功，false=取消点赞
    "like_count": 11        // 当前点赞数
  }
}
```

防重逻辑：
- 登录用户：user_id + target_type + target_id
- 未登录用户：IP + target_type + target_id

---

### 检查是否已点赞

**GET /api/v1/likes/check**

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| target_type | string | 是 | 目标类型 |
| target_id | string | 否 | 目标 ID（site 类型时不需要） |

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "liked": true
  }
}
```

---

### 获取点赞数

**GET /api/v1/likes/count**

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| target_type | string | 是 | 目标类型 |
| target_id | string | 否 | 目标 ID（site 类型时不需要） |

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "count": 100
  }
}
```

---

## 评论系统扩展

评论系统的 `target_type` 新增 `post` 类型：

- `CommentTarget` 枚举：Gallery, Bangumi, Post
- `/api/v1/comments` 接口支持 `target_type=post`

---

## 数据库变更

### 新增表

#### posts（文章表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | UUIDv7 主键 |
| title | TEXT | 标题（max 200） |
| slug | TEXT | URL slug（唯一） |
| summary | TEXT | 摘要（max 500） |
| content | TEXT | Markdown 内容 |
| cover | TEXT | 封面图 key |
| tags | TEXT | 标签 JSON 数组 |
| category | TEXT | 分类名称 |
| status | TEXT | published/draft/hidden |
| view_count | INTEGER | 浏览数 |
| like_count | INTEGER | 点赞数 |
| comment_count | INTEGER | 评论数 |
| top | INTEGER | 置顶标记 |
| comment_allowed | INTEGER | 允许评论 |
| published_at | TEXT | 发布时间 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |
| deleted_at | TEXT | 删除时间（软删除） |

#### likes（点赞表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | UUIDv7 主键 |
| target_type | TEXT | 目标类型 |
| target_id | TEXT | 目标 ID |
| user_id | TEXT | 用户 ID |
| ip | TEXT | 访客 IP |
| created_at | TEXT | 创建时间 |
| deleted_at | TEXT | 删除时间 |

---

## 字段命名修正

原需求文档 → 修正后：
- `is_top` → `top`
- `allow_comment` → `comment_allowed`