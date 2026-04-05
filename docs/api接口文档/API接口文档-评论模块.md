# API 接口文档 - 评论模块

> 评论系统模块，支持相册和番剧评论

---

## 数据模型

### CommentTarget

```typescript
type CommentTarget = 'gallery' | 'bangumi'
```

### CommentStatus

```typescript
type CommentStatus = 'normal' | 'hidden'  // hidden: 敏感词自动隐藏
```

### Comment

```typescript
interface Comment {
  id: string                    // UUIDv7
  target_type: CommentTarget    // 评论目标类型
  target_id: string             // 目标ID（相册ID或番剧ID）

  // 评论者信息
  user_id: string | null        // 登录用户ID，游客为null
  guest_name: string | null     // 游客名称（2-20字符）
  guest_email: string | null    // 游客邮箱（可选，用于通知）
  guest_avatar: string | null   // 游客头像URL（可选）

  // 评论内容
  parent_id: string | null      // 父评论ID，null表示一级评论
  reply_to_user_id: string | null    // 回复的用户ID
  reply_to_guest_name: string | null // 回复的游客名称
  content: string               // 评论内容（已过滤敏感词，1-500字符）
  raw_content: string           // 原始内容（仅管理员可见）

  // 状态
  status: CommentStatus         // 状态

  // 时间
  created_at: string            // ISO 8601
  updated_at: string            // ISO 8601
}
```

### CommentWithReplies

```typescript
interface CommentWithReplies extends Comment {
  author: {
    user_id: string | null
    name: string                // 用户名或游客名称
    avatar: string | null       // 头像URL
    is_admin: boolean           // 是否管理员
  }
  reply_to_name: string | null  // 回复的用户名
  replies: CommentWithReplies[] // 子评论（仅一级评论有）
  reply_count: number           // 回复数量
}
```

### SensitiveWord

```typescript
interface SensitiveWord {
  id: string
  word: string           // 敏感词
  level: 'filter' | 'hide'  // 处理级别
  created_at: string
}
```

| 级别 | 说明 |
|------|------|
| `filter` | 替换敏感词为 *** |
| `hide` | 自动隐藏评论 |

---

## 公开接口

### 获取评论列表

```
GET /api/v1/comments?target_type=gallery&target_id=xxx&page=1&per_page=20
```

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `target_type` | string | 是 | - | gallery / bangumi |
| `target_id` | string | 是 | - | 目标ID |
| `page` | integer | 否 | 1 | 页码 |
| `per_page` | integer | 否 | 20 | 每页数量（最大50） |

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "018f1234567890abcdef",
        "target_type": "gallery",
        "target_id": "018fabcdef1234567890",
        "author": {
          "user_id": "018f...",
          "name": "fufu",
          "avatar": "https://example.com/avatar.jpg",
          "is_admin": true
        },
        "reply_to_name": null,
        "content": "这张照片真好看！",
        "status": "normal",
        "replies": [
          {
            "id": "018freply123456789",
            "target_type": "gallery",
            "target_id": "018fabcdef1234567890",
            "author": {
              "user_id": null,
              "name": "游客小明",
              "avatar": null,
              "is_admin": false
            },
            "reply_to_name": "fufu",
            "content": "同意！",
            "status": "normal",
            "replies": [],
            "reply_count": 0,
            "created_at": "2026-04-05T12:00:00Z",
            "updated_at": "2026-04-05T12:00:00Z"
          }
        ],
        "reply_count": 1,
        "created_at": "2026-04-05T10:00:00Z",
        "updated_at": "2026-04-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

### 发布评论

```
POST /api/v1/comments
```

**请求头**

| 头部 | 说明 |
|------|------|
| `Authorization` | 可选，登录用户需携带 Bearer Token |

**请求体（登录用户）**

```json
{
  "target_type": "gallery",
  "target_id": "018fabcdef1234567890",
  "parent_id": null,
  "reply_to_user_id": "018f...",
  "content": "评论内容"
}
```

**请求体（游客）**

```json
{
  "target_type": "gallery",
  "target_id": "018fabcdef1234567890",
  "parent_id": null,
  "reply_to_user_id": null,
  "reply_to_guest_name": "游客小明",
  "guest_name": "游客小红",
  "guest_email": "xiaohong@example.com",
  "guest_avatar": "https://example.com/avatar.jpg",
  "content": "评论内容"
}
```

**请求参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `target_type` | string | 是 | gallery / bangumi |
| `target_id` | string | 是 | 目标ID |
| `parent_id` | string | 否 | 父评论ID，null或不传表示一级评论 |
| `reply_to_user_id` | string | 否 | 回复的登录用户ID |
| `reply_to_guest_name` | string | 否 | 回复的游客名称 |
| `guest_name` | string | 游客必填 | 游客名称（2-20字符） |
| `guest_email` | string | 否 | 游客邮箱 |
| `guest_avatar` | string | 否 | 游客头像URL |
| `content` | string | 是 | 评论内容（1-500字符） |

**响应示例**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "id": "018fnewcomment12345",
    "target_type": "gallery",
    "target_id": "018fabcdef1234567890",
    "author": {
      "user_id": null,
      "name": "游客小红",
      "avatar": "https://example.com/avatar.jpg",
      "is_admin": false
    },
    "reply_to_name": null,
    "content": "评论内容",
    "status": "normal",
    "replies": [],
    "reply_count": 0,
    "created_at": "2026-04-05T14:00:00Z",
    "updated_at": "2026-04-05T14:00:00Z"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| `10001` | 目标不存在（相册/番剧不存在） |
| `10401` | 参数缺失 |
| `10402` | 参数格式错误 |
| `10403` | 内容包含敏感词（已自动过滤，评论仍发布） |

---

## 管理接口（需管理员权限）

### 获取所有评论列表

```
GET /api/v1/admin/comments?target_type=gallery&status=normal&page=1
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `target_type` | string | - | 筛选类型 |
| `target_id` | string | - | 筛选目标ID |
| `status` | string | - | 筛选状态 |
| `keyword` | string | - | 搜索关键词 |
| `page` | integer | 1 | 页码 |
| `per_page` | integer | 20 | 每页数量 |

**响应说明**

管理员接口返回的数据包含 `raw_content` 字段，显示原始未过滤内容。

### 删除评论

```
DELETE /api/v1/admin/comments/{id}
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

### 修改评论状态

```
PATCH /api/v1/admin/comments/{id}/status
Authorization: Bearer <token>
```

**请求体**

```json
{
  "status": "hidden"
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "018f...",
    "status": "hidden"
  }
}
```

---

## 敏感词管理接口

### 获取敏感词列表

```
GET /api/v1/admin/sensitive-words
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "018f...",
      "word": "敏感词",
      "level": "filter",
      "created_at": "2026-04-05T00:00:00Z"
    }
  ]
}
```

### 添加敏感词

```
POST /api/v1/admin/sensitive-words
Authorization: Bearer <token>
```

**请求体**

```json
{
  "word": "敏感词",
  "level": "filter"
}
```

**响应示例**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "id": "018f...",
    "word": "敏感词",
    "level": "filter",
    "created_at": "2026-04-05T00:00:00Z"
  }
}
```

### 删除敏感词

```
DELETE /api/v1/admin/sensitive-words/{id}
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

---

## 业务规则

### 评论层级

- 一级评论：`parent_id` 为 `null`
- 二级评论（回复）：`parent_id` 为一级评论的ID
- 不支持三级及以上嵌套

### 回复逻辑

- 回复一级评论时，设置 `parent_id` 为该评论ID
- 回复二级评论时，`parent_id` 仍为一级评论ID，通过 `reply_to_user_id` 或 `reply_to_guest_name` 标识回复对象

### 评论者信息优先级

1. 登录用户：使用 `user_id`，从用户表获取名称、头像
2. 游客：使用 `guest_name`、`guest_avatar`（可选）

### 头像默认值

- 登录用户无头像：显示默认头像或使用 Gravatar
- 游客无头像：使用 Gravatar（基于邮箱）或默认头像

---

## 接口权限总结

| 接口 | 公开 | 需登录 | 需管理员 |
|------|------|--------|---------|
| 获取评论列表 | ✓ | - | - |
| 发布评论（登录） | - | ✓ | - |
| 发布评论（游客） | ✓ | - | - |
| 管理评论列表 | - | - | ✓ |
| 删除评论 | - | - | ✓ |
| 修改评论状态 | - | - | ✓ |
| 敏感词管理 | - | - | ✓ |