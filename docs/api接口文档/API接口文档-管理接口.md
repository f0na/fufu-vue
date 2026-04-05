# API 接口文档 - 管理接口

> 管理员操作接口（需要认证和admin角色）

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

### 上传头像

```
POST /api/v1/admin/user/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**表单字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | file | 是 | 图片文件（最大20MB） |

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

### 上传照片

```
POST /api/v1/admin/galleries/{gallery_id}/photos
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**表单字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | file | 是 | 图片文件（最大20MB） |
| `x` | number | 否 | 初始X坐标（默认0） |
| `y` | number | 否 | 初始Y坐标（默认0） |
| `rotation` | number | 否 | 旋转角度（默认0） |
| `width` | number | 否 | 显示宽度（自动检测） |
| `height` | number | 否 | 显示高度（自动检测） |

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