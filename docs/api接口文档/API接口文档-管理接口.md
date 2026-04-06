# API 接口文档 - 管理接口

> 管理员操作接口（需要认证和admin角色）

---

## 文件上传

### 获取上传凭证（公开）

> 获取七牛云上传凭证，前端直接上传到七牛云。普通用户限制 1MB。

```
POST /api/v1/upload
```

**请求体**

```json
{
  "type": "avatar"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 否 | 文件类型：`avatar`、`cover`、`photo`、`general`，默认 `general` |

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "token": "Qiniu AccessKey:EncodedSign:EncodedPolicy",
    "key": "avatar-018f...",
    "domain": "cdn.example.com",
    "expires_in": 300,
    "fsize_limit": 1048576,
    "upload_url": "https://up-z2.qiniup.com",
    "download_url": "https://cdn.example.com/avatar-018f...?e=1712345678&token=xxx"
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `token` | string | 七牛上传凭证 |
| `key` | string | 文件存储 key（上传时使用） |
| `domain` | string | CDN 域名（不含协议） |
| `expires_in` | number | 凭证有效期（秒） |
| `fsize_limit` | number | 文件大小限制（字节），0 表示无限制 |
| `upload_url` | string | 七牛上传地址（根据区域自动选择） |
| `download_url` | string | 下载地址（私有空间带签名，有效期 24 小时） |

**前端上传示例**

```javascript
// 1. 获取上传凭证
const { data } = await fetch('/api/v1/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'avatar' })
}).then(r => r.json());

// 2. 使用凭证上传到七牛云
const formData = new FormData();
formData.append('token', data.token);
formData.append('key', data.key);
formData.append('file', fileInput.files[0]);

await fetch(data.upload_url, {
  method: 'POST',
  body: formData
});

// 3. 使用 download_url 作为图片地址（已带签名）
// 私有空间：直接使用 data.download_url
// 公开空间：可使用 `https://${data.domain}/${data.key}`
```

### 获取上传凭证（管理员）

> 管理员获取上传凭证，不限制文件大小。

```
POST /api/v1/admin/upload
Authorization: Bearer <token>
```

**请求体**

```json
{
  "type": "photo"
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "token": "Qiniu AccessKey:EncodedSign:EncodedPolicy",
    "key": "gallery-018f...",
    "domain": "cdn.example.com",
    "expires_in": 300,
    "fsize_limit": 0,
    "upload_url": "https://up-z2.qiniup.com",
    "download_url": "https://cdn.example.com/gallery-018f...?e=1712345678&token=xxx"
  }
}
```

**大小限制对比**

| 用户类型 | 大小限制 |
|---------|---------|
| 普通用户 | 1MB |
| 管理员 | 无限制 |

**七牛云区域配置**

后端根据 `QINIU_REGION` 环境变量自动选择上传地址：

| 区域 | 代码 | 上传地址 |
|------|------|---------|
| 华东 | z0 | upload.qiniup.com |
| 华北 | z1 | up-z1.qiniup.com |
| 华南 | z2 | up-z2.qiniup.com |
| 北美 | na0 | up-na0.qiniup.com |
| 东南亚 | as0 | up-as0.qiniup.com |

**支持的图片格式**

- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

**凭证有效期**

- 上传凭证：5 分钟
- 下载 URL（私有空间）：24 小时

---

## 用户管理

### 获取用户信息（管理视角）

```
GET /api/v1/admin/user
Authorization: Bearer <token>
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
    "greeting": "Ciallo～(∠・ω< )⌒★"
  }
}
```

### 更新用户信息

```
PATCH /api/v1/admin/user
Authorization: Bearer <token>
```

**请求体**

```json
{
  "name": "新昵称",
  "greeting": "新的欢迎语",
  "avatar": "https://cdn.example.com/new-avatar.jpg"
}
```

> **上传头像**：先调用 `/api/v1/admin/upload` 上传图片获取 URL，再通过此接口更新头像字段

---

## 社交链接管理

### 创建社交链接

```
POST /api/v1/admin/user/social-links
Authorization: Bearer <token>
```

**请求体**

```json
{
  "name": "B站",
  "url": "https://space.bilibili.com/xxx",
  "icon": "i-simple-icons-bilibili",
  "link_type": "link",
  "sort_order": 0
}
```

### 更新社交链接

```
PATCH /api/v1/admin/user/social-links/{id}
Authorization: Bearer <token>
```

### 删除社交链接

```
DELETE /api/v1/admin/user/social-links/{id}
Authorization: Bearer <token>
```

---

## 相册管理

### 管理相册列表

> 获取所有相册（包括隐藏的），支持按可见性筛选

```
GET /api/v1/admin/galleries
GET /api/v1/admin/galleries?page=1&per_page=10
GET /api/v1/admin/galleries?visible=false
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码 |
| `per_page` | integer | 10 | 每页数量（最大50） |
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
        "title": "旅行照片",
        "cover": "https://cdn.example.com/cover.jpg",
        "description": "旅行途中拍的照片",
        "tags": ["旅行", "风景"],
        "visible": true,
        "sort_order": 0,
        "photo_count": 20,
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

### 创建相册

```
POST /api/v1/admin/galleries
Authorization: Bearer <token>
```

**请求体**

```json
{
  "title": "旅行照片",
  "cover": "https://cdn.example.com/cover.jpg",
  "tags": ["旅行", "风景"]
}
```

### 更新相册

```
PATCH /api/v1/admin/galleries/{id}
Authorization: Bearer <token>
```

### 删除相册

```
DELETE /api/v1/admin/galleries/{id}
Authorization: Bearer <token>
```

### 切换相册可见性

```
PATCH /api/v1/admin/galleries/{id}/visibility
Authorization: Bearer <token>
```

**请求体**

```json
{
  "visible": false
}
```

---

## 照片管理

### 创建照片记录

> 先通过 `/api/v1/admin/upload` 上传图片获取 URL，再调用此接口创建照片记录

```
POST /api/v1/admin/galleries/{gallery_id}/photos
Authorization: Bearer <token>
```

**请求体**

```json
{
  "src": "https://cdn.example.com/gallery/xxx.jpg",
  "filename": "photo.jpg",
  "x": 0,
  "y": 0,
  "rotation": 0,
  "width": 800,
  "height": 600
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `src` | string | 是 | 图片 URL（通过上传接口获取） |
| `filename` | string | 否 | 原始文件名 |
| `x` | number | 否 | 初始X坐标（默认0） |
| `y` | number | 否 | 初始Y坐标（默认0） |
| `rotation` | number | 否 | 旋转角度（默认0） |
| `width` | number | 否 | 显示宽度 |
| `height` | number | 否 | 显示高度 |

**响应示例**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "id": "018f...",
    "gallery_id": "018f...",
    "src": "https://cdn.example.com/gallery/xxx.jpg",
    "x": 0,
    "y": 0,
    "rotation": 0,
    "width": 800,
    "height": 600,
    "z_index": 0,
    "original_filename": "photo.jpg",
    "file_size": null
  }
}
```

### 批量更新照片布局

```
PATCH /api/v1/admin/galleries/{gallery_id}/photos
Authorization: Bearer <token>
```

**请求体**

```json
{
  "photos": [
    {
      "id": "0190...",
      "x": 120,
      "y": 180,
      "rotation": 5,
      "z_index": 2
    }
  ]
}
```

### 更新单张照片

```
PATCH /api/v1/admin/photos/{id}
Authorization: Bearer <token>
```

### 删除照片

```
DELETE /api/v1/admin/photos/{id}
Authorization: Bearer <token>
```

---

## 公告管理

### 创建公告

```
POST /api/v1/admin/announcements
Authorization: Bearer <token>
```

**请求体**

```json
{
  "content": "新公告内容",
  "date": "2026-04-04",
  "priority": 10
}
```

### 更新公告

```
PATCH /api/v1/admin/announcements/{id}
Authorization: Bearer <token>
```

### 删除公告

```
DELETE /api/v1/admin/announcements/{id}
Authorization: Bearer <token>
```

### 切换公告可见性

```
PATCH /api/v1/admin/announcements/{id}/visibility
Authorization: Bearer <token>
```

---

## 设置管理

### 更新用户设置

```
PATCH /api/v1/admin/settings
Authorization: Bearer <token>
```

**请求体**

```json
{
  "theme": "cyan",
  "language": "en-US"
}
```

---

## 菜单管理

### 获取完整菜单配置

```
GET /api/v1/admin/menu
Authorization: Bearer <token>
```

### 创建菜单项

```
POST /api/v1/admin/menu
Authorization: Bearer <token>
```

**请求体**

```json
{
  "label": "博客",
  "key": "blog",
  "icon": "i-lucide-book-open",
  "route": "/blog",
  "visible": true,
  "sort_order": 2
}
```

### 更新菜单项

```
PATCH /api/v1/admin/menu/{id}
Authorization: Bearer <token>
```

### 删除菜单项

```
DELETE /api/v1/admin/menu/{id}
Authorization: Bearer <token>
```

---

## 管理员审批

### 获取申请列表

```
GET /api/v1/admin/applications
GET /api/v1/admin/applications?status=pending
Authorization: Bearer <token>
```

### 审批申请

```
POST /api/v1/admin/applications/{id}/review
Authorization: Bearer <token>
```

**请求体**

```json
{
  "action": "approve",
  "note": "欢迎加入管理团队"
}
```

### 获取管理员列表

```
GET /api/v1/admin/managers
Authorization: Bearer <token>
```

### 撤销管理员权限

```
POST /api/v1/admin/managers/{id}/revoke
Authorization: Bearer <token>
```

---

## 邮件发送

```
POST /api/v1/admin/email
Authorization: Bearer <token>
```

**请求体**

```json
{
  "subject": "邮件主题",
  "content": "<p>邮件HTML内容</p>",
  "recipient": "user@example.com",
  "attachments": [
    {
      "name": "image.png",
      "size": 102400,
      "type": "image/png",
      "data": "data:image/png;base64,iVBORw0KGgo..."
    }
  ]
}
```