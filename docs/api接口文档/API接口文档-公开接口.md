# API 接口文档 - 公开接口

> 无需认证的接口

---

## 用户资料

### 获取用户信息

获取公开的用户资料。

```
GET /api/v1/user/profile
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "018f...",
    "name": "fufu",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "greeting": "Ciallo～(∠・ω< )⌒★",
    "social_links": [
      {
        "id": "0190...",
        "name": "B站",
        "url": "https://space.bilibili.com/xxx",
        "icon": "i-simple-icons-bilibili",
        "link_type": "link",
        "sort_order": 0
      }
    ]
  }
}
```

### 获取用户设置

获取公开的用户设置（主题、语言）。

```
GET /api/v1/user/settings
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "theme": "rose",
    "language": "zh-CN"
  }
}
```

---

## 相册

### 获取相册列表

获取公开的相册列表（仅返回visible=true的相册）。

```
GET /api/v1/galleries
GET /api/v1/galleries?page=1&per_page=10
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
        "title": "日常随拍",
        "cover": "https://cdn.example.com/cover1.jpg",
        "photo_count": 12,
        "tags": ["日常", "生活"],
        "visible": true,
        "created_at": "2026-04-01T00:00:00Z",
        "updated_at": "2026-04-03T00:00:00Z"
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

### 获取相册详情

获取单个相册详情及其照片列表。

```
GET /api/v1/galleries/{id}
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 相册ID（UUIDv7） |

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "018f...",
    "title": "日常随拍",
    "cover": "https://cdn.example.com/cover1.jpg",
    "photo_count": 3,
    "tags": ["日常", "生活"],
    "visible": true,
    "created_at": "2026-04-01T00:00:00Z",
    "updated_at": "2026-04-03T00:00:00Z",
    "photos": [
      {
        "id": "0190...",
        "gallery_id": "018f...",
        "src": "https://cdn.example.com/photo1.jpg",
        "x": 100,
        "y": 150,
        "rotation": 5.5,
        "width": 200,
        "height": 150,
        "z_index": 1
      }
    ]
  }
}
```

**错误响应**

```json
HTTP/1.1 404 Not Found

{
  "code": 10001,
  "message": "相册不存在",
  "data": null
}
```

---

## 公告

### 获取公告列表

获取公开的公告列表（仅返回visible=true的公告）。

```
GET /api/v1/announcements
GET /api/v1/announcements?limit=5
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | integer | 10 | 返回数量（最大20） |

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "018f...",
      "content": "欢迎来到我的网站！",
      "date": "2026-04-03",
      "priority": 10,
      "visible": true
    }
  ]
}
```

---

## 导航菜单

### 获取导航菜单

获取导航菜单配置（仅返回visible=true的菜单项）。

```
GET /api/v1/menu
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
      "label": "首页",
      "key": "home",
      "icon": "i-lucide-home",
      "route": "/",
      "visible": true,
      "sort_order": 0
    }
  ]
}
```