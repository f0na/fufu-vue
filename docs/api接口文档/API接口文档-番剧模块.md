# API 接口文档 - 番剧模块（重构版）

> 番剧模块重构：分离番剧信息与追番记录

---

## 概述

番剧模块分为两部分：
- **番剧信息** (`bangumi_info`) - 番剧本身的基础数据（标题、封面、简介等）
- **追番记录** (`watchlist`) - 用户对番剧的观看记录（状态、评分、进度等）

这种分离设计支持：
- 同一番剧多次记录（如重看）
- 多人对同一番剧各自的追番记录
- 番剧信息复用，避免数据冗余

---

## 数据模型

### BangumiInfo（番剧基础信息）

```typescript
interface BangumiInfo {
  id: string                   // UUIDv7
  title: string                // 番剧标题
  cover: string | null         // 封面图URL
  episodes: number | null      // 总集数（可为空，新番可能未知）
  description: string | null   // 简介
  tags: string[]               // 标签数组 ["奇幻", "冒险"]
  visible: boolean             // 是否可见
  sort_order: number           // 排序权重
  created_at: string           // 创建时间 ISO 8601
  updated_at: string           // 更新时间 ISO 8601
}
```

### WatchStatus（观看状态）

```typescript
type WatchStatus = 'watching' | 'want_to_watch' | 'watched' | 'dropped'
```

| 状态 | 中文 | 说明 |
|------|------|------|
| `watching` | 在看 | 正在观看 |
| `want_to_watch` | 想看 | 想看但未开始 |
| `watched` | 看过 | 已看完 |
| `dropped` | 抛弃 | 中途放弃 |

### WatchlistItem（追番记录）

```typescript
interface WatchlistItem {
  id: string                   // UUIDv7
  bangumi_id: string           // 关联番剧 ID
  bangumi_title: string        // 番剧标题（关联查询）
  bangumi_cover: string | null // 番剧封面（关联查询）
  bangumi_episodes: number | null // 番剧总集数（关联查询）
  status: WatchStatus          // 观看状态
  rating: number | null        // 评分 0-10
  progress: string | null      // 观看进度（文本，如 "1-12, SP1, PV"）
  notes: string | null         // 感想/备注
  watch_date: string | null    // 观看日期
  visible: boolean             // 是否可见
  sort_order: number           // 排序权重
  created_at: string           // 创建时间 ISO 8601
  updated_at: string           // 更新时间 ISO 8601
}
```

---

## 公开接口 - 番剧信息

### 获取番剧信息列表

```
GET /api/v1/bangumi-info
GET /api/v1/bangumi-info?page=1&per_page=10
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码 |
| `per_page` | integer | 10 | 每页数量（最大50） |

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

### 获取番剧信息详情

```
GET /api/v1/bangumi-info/{id}
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

## 公开接口 - 追番记录

### 获取追番列表

```
GET /api/v1/watchlist
GET /api/v1/watchlist?page=1&per_page=10
GET /api/v1/watchlist?status=watching
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
        "id": "0190...",
        "bangumi_id": "018f...",
        "bangumi_title": "葬送的芙莉莲",
        "bangumi_cover": "https://cdn.example.com/cover.jpg",
        "bangumi_episodes": 28,
        "status": "watching",
        "rating": 9.5,
        "progress": "1-5",
        "notes": "非常治愈",
        "watch_date": "2026-04-01",
        "visible": true,
        "sort_order": 0,
        "created_at": "2026-04-01T00:00:00Z",
        "updated_at": "2026-04-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

### 获取追番详情

```
GET /api/v1/watchlist/{id}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "0190...",
    "bangumi_id": "018f...",
    "bangumi_title": "葬送的芙莉莲",
    "bangumi_cover": "https://cdn.example.com/cover.jpg",
    "bangumi_episodes": 28,
    "status": "watching",
    "rating": 9.5,
    "progress": "1-5",
    "notes": "非常治愈",
    "watch_date": "2026-04-01",
    "visible": true,
    "sort_order": 0,
    "created_at": "2026-04-01T00:00:00Z",
    "updated_at": "2026-04-01T00:00:00Z"
  }
}
```

---

## 管理接口 - 番剧信息（需管理员权限）

### 管理番剧信息列表

> 获取所有番剧信息（包括隐藏的）

```
GET /api/v1/admin/bangumi-info
GET /api/v1/admin/bangumi-info?page=1&per_page=10
GET /api/v1/admin/bangumi-info?visible=false
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码 |
| `per_page` | integer | 10 | 每页数量（最大50） |
| `visible` | boolean | - | 按可见性筛选 |

### 创建番剧信息

```
POST /api/v1/admin/bangumi-info
Authorization: Bearer <token>
```

**请求体**

```json
{
  "title": "葬送的芙莉莲",
  "cover": "gallery-018f...",
  "episodes": 28,
  "description": "魔王被打倒之后的故事",
  "tags": ["奇幻", "冒险"]
}
```

> **注意**：`episodes` 可省略（新番可能未知总集数）

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
    "episodes": 28,
    "description": "魔王被打倒之后的故事",
    "tags": ["奇幻", "冒险"],
    "visible": true,
    "sort_order": 0,
    "created_at": "2026-04-06T00:00:00Z",
    "updated_at": "2026-04-06T00:00:00Z"
  }
}
```

### 更新番剧信息

```
PATCH /api/v1/admin/bangumi-info/{id}
Authorization: Bearer <token>
```

**请求体**

```json
{
  "title": "新标题",
  "episodes": 29,
  "tags": ["奇幻", "冒险", "治愈"]
}
```

### 删除番剧信息

```
DELETE /api/v1/admin/bangumi-info/{id}
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

### 切换番剧信息可见性

```
PATCH /api/v1/admin/bangumi-info/{id}/visibility
Authorization: Bearer <token>
```

**请求体**

```json
{
  "visible": false
}
```

---

## 管理接口 - 追番记录（需管理员权限）

### 管理追番列表

> 获取所有追番记录（包括隐藏的）

```
GET /api/v1/admin/watchlist
GET /api/v1/admin/watchlist?page=1&per_page=10
GET /api/v1/admin/watchlist?status=watching
GET /api/v1/admin/watchlist?bangumi_id=018f...
GET /api/v1/admin/watchlist?visible=false
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码 |
| `per_page` | integer | 10 | 每页数量（最大50） |
| `status` | string | - | 按状态筛选 |
| `bangumi_id` | string | - | 按番剧 ID 筛选 |
| `visible` | boolean | - | 按可见性筛选 |

### 创建追番记录

> 添加一部番剧到追番列表，需关联已有的番剧信息

```
POST /api/v1/admin/watchlist
Authorization: Bearer <token>
```

**请求体**

```json
{
  "bangumi_id": "018f...",
  "status": "watching",
  "rating": 9.5,
  "progress": "1-5",
  "notes": "非常治愈",
  "watch_date": "2026-04-01"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `bangumi_id` | string | 是 | 关联的番剧 ID |
| `status` | string | 否 | 观看状态，默认 `want_to_watch` |
| `rating` | number | 否 | 评分 0-10 |
| `progress` | string | 否 | 观看进度（文本） |
| `notes` | string | 否 | 感想/备注 |
| `watch_date` | string | 否 | 观看日期 |

**响应示例**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "id": "0190...",
    "bangumi_id": "018f...",
    "bangumi_title": "葬送的芙莉莲",
    "bangumi_cover": "https://cdn.example.com/cover.jpg",
    "bangumi_episodes": 28,
    "status": "watching",
    "rating": 9.5,
    "progress": "1-5",
    "notes": "非常治愈",
    "watch_date": "2026-04-01",
    "visible": true,
    "sort_order": 0,
    "created_at": "2026-04-06T00:00:00Z",
    "updated_at": "2026-04-06T00:00:00Z"
  }
}
```

### 更新追番记录

```
PATCH /api/v1/admin/watchlist/{id}
Authorization: Bearer <token>
```

**请求体**

```json
{
  "status": "watched",
  "rating": 10,
  "progress": "1-28, SP1, SP2",
  "watch_date": "2026-04-06"
}
```

### 删除追番记录

```
DELETE /api/v1/admin/watchlist/{id}
Authorization: Bearer <token>
```

### 切换追番记录可见性

```
PATCH /api/v1/admin/watchlist/{id}/visibility
Authorization: Bearer <token>
```

**请求体**

```json
{
  "visible": false
}
```

### 更新追番状态

```
PATCH /api/v1/admin/watchlist/{id}/status
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
    "id": "0190...",
    "status": "watched"
  }
}
```

---

## 使用流程

### 新番入库流程

1. 先创建番剧信息：`POST /api/v1/admin/bangumi-info`
2. 再添加追番记录：`POST /api/v1/admin/watchlist`（关联番剧 ID）

### 同一番剧多次观看

可以创建多条追番记录，关联同一个 `bangumi_id`：

```json
// 第一次观看记录
{
  "bangumi_id": "018f...",
  "status": "watched",
  "progress": "1-28",
  "watch_date": "2024-03-01"
}

// 第二次观看（重看）
{
  "bangumi_id": "018f...",  // 同一个番剧 ID
  "status": "watching",
  "progress": "1-10",
  "notes": "重看依然很感动",
  "watch_date": "2026-04-01"
}
```

### 进度记录说明

`progress` 字段为文本类型，可灵活记录：
- `"1-12"` - 观看第1到12集
- `"1-12, SP1, SP2"` - 包含特别篇
- `"PV, EP1"` - 先导PV和第一集
- `"全"` - 已看完全部