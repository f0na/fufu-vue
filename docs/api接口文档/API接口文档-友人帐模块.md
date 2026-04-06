# API 接口文档 - 友人帐模块

> 友链管理模块，支持申请添加功能

---

## 数据模型

### FriendStatus

```typescript
type FriendStatus = 'active' | 'pending' | 'inactive'
```

| 状态 | 中文 | 说明 |
|------|------|------|
| `active` | 活跃 | 正常显示 |
| `pending` | 待审核 | 申请中 |
| `inactive` | 失效 | 链接失效或已下架 |

### Friend

```typescript
interface Friend {
  id: string                   // UUIDv7
  name: string                 // 网站名称
  url: string                  // 网站链接
  description: string | null   // 网站描述
  status: FriendStatus         // 状态
  visible: boolean             // 是否显示
  sort_order: number           // 排序权重
  created_at: string           // 创建时间 ISO 8601
  updated_at: string           // 更新时间 ISO 8601
}
```

> **图标说明**：前端自动从 `url` 获取源站 favicon，无需后端存储图标。

---

## 公开接口

### 获取友链列表

获取所有活跃状态的友链（仅返回 status=active 且 visible=true）。

```
GET /api/v1/friends
GET /api/v1/friends?page=1&per_page=20
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码 |
| `per_page` | integer | 20 | 每页数量（最大50） |

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
        "name": "小明的博客",
        "url": "https://xiaoming.example.com",
        "description": "一个技术博客",
        "status": "active",
        "visible": true,
        "sort_order": 0,
        "created_at": "2026-04-01T00:00:00Z",
        "updated_at": "2026-04-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 10,
      "total_pages": 1
    }
  }
}
```

---

## 申请接口（公开）

### 申请添加友链

游客和登录用户都可以申请添加友链。

```
POST /api/v1/friends/apply
```

**请求头**

| 头部 | 说明 |
|------|------|
| `Authorization` | 可选，登录用户可携带 Bearer Token |

**请求体**

```json
{
  "name": "我的博客",
  "url": "https://myblog.example.com",
  "description": "个人技术博客"
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
    "name": "我的博客",
    "url": "https://myblog.example.com",
    "description": "个人技术博客",
    "status": "pending",
    "visible": false,
    "sort_order": 0,
    "created_at": "2026-04-05T00:00:00Z",
    "updated_at": "2026-04-05T00:00:00Z"
  }
}
```

**说明**

- 申请后 `status` 为 `pending`，`visible` 为 `false`
- 需管理员审核批准后才会显示

---

## 管理接口（需管理员权限）

### 获取友链列表（含申请）

获取所有友链，包括待审核的申请。

```
GET /api/v1/admin/friends
GET /api/v1/admin/friends?status=pending
GET /api/v1/admin/friends?visible=false
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `status` | string | 全部 | 状态筛选 |
| `visible` | boolean | 全部 | 可见性筛选 |
| `page` | integer | 1 | 页码 |
| `per_page` | integer | 20 | 每页数量 |

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
        "name": "小明的博客",
        "url": "https://xiaoming.example.com",
        "description": "一个技术博客",
        "status": "active",
        "visible": true,
        "sort_order": 0,
        "created_at": "2026-04-01T00:00:00Z",
        "updated_at": "2026-04-01T00:00:00Z"
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

### 添加友链

```
POST /api/v1/admin/friends
Authorization: Bearer <token>
```

**请求体**

```json
{
  "name": "友站名称",
  "url": "https://friend.example.com",
  "description": "友站描述",
  "sort_order": 0
}
```

### 更新友链

```
PATCH /api/v1/admin/friends/{id}
Authorization: Bearer <token>
```

**请求体**

```json
{
  "name": "新名称",
  "description": "新描述",
  "status": "active"
}
```

### 更新友链状态

用于批准或拒绝申请，也用于标记友链失效。

```
PATCH /api/v1/admin/friends/{id}/status
Authorization: Bearer <token>
```

**请求体**

```json
{
  "status": "active"
}
```

**状态说明**

| 操作 | status 值 | 说明 |
|------|-----------|------|
| 批准申请 | `active` | 同时自动设置 visible=true |
| 拒绝申请 | `inactive` | 标记为失效 |
| 标记失效 | `inactive` | 链接失效或已下架 |

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "018f...",
    "status": "active"
  }
}
```

### 删除友链

```
DELETE /api/v1/admin/friends/{id}
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 204 No Content
```