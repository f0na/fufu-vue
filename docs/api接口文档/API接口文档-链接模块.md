# API 接口文档 - 链接模块

> 链接收藏功能模块

---

## 数据模型

### Link

```typescript
interface Link {
  id: string                   // UUIDv7
  title: string                // 网站名称
  url: string                  // 链接地址
  description: string | null   // 网站描述
  tags: string[]               // 标签数组（用于分组）
  icon: string | null          // 网站图标URL（可选）
  visible: boolean             // 是否可见
  sort_order: number           // 排序权重
  created_at: string           // 创建时间 ISO 8601
  updated_at: string           // 更新时间 ISO 8601
}
```

---

## 公开接口

### 获取链接列表

```
GET /api/v1/links
GET /api/v1/links?page=1&per_page=10
GET /api/v1/links?tag=开发
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码 |
| `per_page` | integer | 10 | 每页数量（最大50） |
| `tag` | string | - | 按标签筛选 |

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
        "title": "GitHub",
        "url": "https://github.com",
        "description": "全球最大的代码托管平台",
        "tags": ["开发"],
        "icon": null,
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

### 获取单个链接详情

```
GET /api/v1/links/{id}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "018f...",
    "title": "GitHub",
    "url": "https://github.com",
    "description": "全球最大的代码托管平台",
    "tags": ["开发"],
    "icon": null,
    "visible": true,
    "sort_order": 0,
    "created_at": "2026-04-01T00:00:00Z",
    "updated_at": "2026-04-01T00:00:00Z"
  }
}
```

---

## 管理接口（需管理员权限）

### 管理链接列表

> 获取所有链接（包括隐藏的），支持按标签和可见性筛选

```
GET /api/v1/admin/links
GET /api/v1/admin/links?page=1&per_page=10
GET /api/v1/admin/links?tag=开发
GET /api/v1/admin/links?visible=false
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码 |
| `per_page` | integer | 10 | 每页数量（最大50） |
| `tag` | string | - | 按标签筛选 |
| `visible` | boolean | - | 按可见性筛选 |

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
        "title": "GitHub",
        "url": "https://github.com",
        "description": "全球最大的代码托管平台",
        "tags": ["开发"],
        "icon": null,
        "visible": true,
        "sort_order": 0,
        "created_at": "2026-04-01T00:00:00Z",
        "updated_at": "2026-04-01T00:00:00Z"
      },
      {
        "id": "018e...",
        "title": "内部工具",
        "url": "https://internal.example.com",
        "description": "内部管理工具",
        "tags": ["工具"],
        "icon": null,
        "visible": false,
        "sort_order": 10,
        "created_at": "2026-04-02T00:00:00Z",
        "updated_at": "2026-04-02T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 15,
      "total_pages": 2
    }
  }
}
```

### 创建链接

```
POST /api/v1/admin/links
Authorization: Bearer <token>
```

**请求体**

```json
{
  "title": "GitHub",
  "url": "https://github.com",
  "description": "全球最大的代码托管平台",
  "tags": ["开发", "代码"],
  "icon": "https://github.com/favicon.ico",
  "sort_order": 0
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
    "title": "GitHub",
    "url": "https://github.com",
    "description": "全球最大的代码托管平台",
    "tags": ["开发", "代码"],
    "icon": "https://github.com/favicon.ico",
    "visible": true,
    "sort_order": 0,
    "created_at": "2026-04-05T00:00:00Z",
    "updated_at": "2026-04-05T00:00:00Z"
  }
}
```

### 更新链接

```
PATCH /api/v1/admin/links/{id}
Authorization: Bearer <token>
```

**请求体**

```json
{
  "title": "新名称",
  "description": "新描述",
  "tags": ["新标签"]
}
```

### 删除链接

```
DELETE /api/v1/admin/links/{id}
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

### 切换链接可见性

```
PATCH /api/v1/admin/links/{id}/visibility
Authorization: Bearer <token>
```

**请求体**

```json
{
  "visible": false
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
    "visible": false
  }
}
```