# API 接口文档 - 番剧模块

> 番剧追踪管理模块

---

## 数据模型

### BangumiStatus

```typescript
type BangumiStatus = 'watching' | 'want_to_watch' | 'watched' | 'dropped'
```

| 状态 | 中文 | 说明 |
|------|------|------|
| `watching` | 在看 | 正在观看 |
| `want_to_watch` | 想看 | 想看但未开始 |
| `watched` | 看过 | 已看完 |
| `dropped` | 抛弃 | 中途放弃 |

### Bangumi

```typescript
interface Bangumi {
  id: string                   // UUIDv7
  title: string                // 番剧标题
  cover: string | null         // 封面图URL
  status: BangumiStatus        // 观看状态
  rating: number | null        // 评分 0-10
  episodes: number             // 集数
  description: string | null   // 简介
  tags: string[]               // 标签数组
  visible: boolean             // 是否可见
  sort_order: number           // 排序权重
  created_at: string           // 创建时间 ISO 8601
  updated_at: string           // 更新时间 ISO 8601
}
```

---

## 公开接口

### 获取番剧列表

```
GET /api/v1/bangumi
GET /api/v1/bangumi?page=1&per_page=10
GET /api/v1/bangumi?status=watching
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码 |
| `per_page` | integer | 10 | 每页数量（最大50） |
| `status` | string | - | 状态筛选 |

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "018f...",
        "title": "葬送的芙莉莲",
        "cover": "https://cdn.example.com/cover.jpg",
        "status": "watching",
        "rating": 9.5,
        "episodes": 28,
        "description": "魔王被打倒之后的故事",
        "tags": ["奇幻", "冒险"],
        "visible": true,
        "sort_order": 0,
        "created_at": "2026-04-01T00:00:00Z",
        "updated_at": "2026-04-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 10,
      "total_pages": 1
    }
  }
}
```

### 获取单个番剧详情

```
GET /api/v1/bangumi/{id}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "018f...",
    "title": "葬送的芙莉莲",
    "cover": "https://cdn.example.com/cover.jpg",
    "status": "watching",
    "rating": 9.5,
    "episodes": 28,
    "description": "魔王被打倒之后的故事",
    "tags": ["奇幻", "冒险"],
    "visible": true,
    "sort_order": 0,
    "created_at": "2026-04-01T00:00:00Z",
    "updated_at": "2026-04-01T00:00:00Z"
  }
}
```

---

## 管理接口（需管理员权限）

### 添加番剧

```
POST /api/v1/admin/bangumi
Authorization: Bearer <token>
```

**请求体**

```json
{
  "title": "葬送的芙莉莲",
  "cover": "https://cdn.example.com/cover.jpg",
  "status": "watching",
  "rating": 9.5,
  "episodes": 28,
  "description": "魔王被打倒之后的故事",
  "tags": ["奇幻", "冒险"]
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
    "title": "葬送的芙莉莲",
    "cover": "https://cdn.example.com/cover.jpg",
    "status": "watching",
    "rating": 9.5,
    "episodes": 28,
    "description": "魔王被打倒之后的故事",
    "tags": ["奇幻", "冒险"],
    "visible": true,
    "sort_order": 0,
    "created_at": "2026-04-05T00:00:00Z",
    "updated_at": "2026-04-05T00:00:00Z"
  }
}
```

### 更新番剧

```
PATCH /api/v1/admin/bangumi/{id}
Authorization: Bearer <token>
```

**请求体**

```json
{
  "title": "新标题",
  "rating": 10,
  "tags": ["奇幻", "冒险", "治愈"]
}
```

### 删除番剧

```
DELETE /api/v1/admin/bangumi/{id}
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

### 更新观看状态

```
PATCH /api/v1/admin/bangumi/{id}/status
Authorization: Bearer <token>
```

**请求体**

```json
{
  "status": "watched"
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
    "status": "watched"
  }
}
```

### 切换番剧可见性

```
PATCH /api/v1/admin/bangumi/{id}/visibility
Authorization: Bearer <token>
```

**请求体**

```json
{
  "visible": false
}
```