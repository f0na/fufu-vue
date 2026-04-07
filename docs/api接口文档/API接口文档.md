# API 接口文档 v1.6

> 前后端对接文档

---

## 基础信息

| 项目 | 说明 |
|------|------|
| 基础URL | `https://api.example.com` |
| 版本 | v1 |
| 协议 | HTTPS |
| 数据格式 | JSON |

### 接口分类

| 类别 | 前缀 | 认证要求 |
|------|------|----------|
| 公开接口 | `/api/v1/` | 无需认证 |
| 管理接口 | `/api/v1/admin/` | JWT + admin角色 |
| 认证接口 | `/api/v1/auth/` | 部分需要 |

### 认证方式

```
Authorization: Bearer <token>
```

令牌有效期：2小时 | 刷新令牌：7天

---

## 通用响应格式

### 成功响应

```json
{ "code": 0, "message": "success", "data": { ... } }
```

### 创建成功 (201)

```json
{ "code": 0, "message": "created", "data": { "id": "...", ... } }
```

### 删除成功 (204)

无响应体

### 分页响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "pagination": { "page": 1, "per_page": 10, "total": 100, "total_pages": 10 }
  }
}
```

### 错误响应

```json
{ "code": 10001, "message": "资源不存在", "data": null }
```

### 业务错误码

| 业务码 | HTTP | 说明 |
|--------|------|------|
| 10001 | 404 | 资源不存在 |
| 10002 | 409 | 资源已存在 |
| 10004 | 409 | 邮箱已被注册 |
| 10005 | 409 | 用户名已被使用 |
| 10101 | 401 | 未登录 |
| 10102 | 401 | 令牌无效 |
| 10103 | 401 | 令牌已过期 |
| 10104 | 401 | 密码错误 |
| 10105 | 401 | 账户已禁用 |
| 10106 | 401 | 两步验证失败 |
| 10111 | 401 | 需要两步验证 |
| 10201 | 403 | 无权限访问 |
| 10203 | 400 | 已是管理员 |
| 10204 | 409 | 已有待处理申请 |
| 10205 | 400 | 申请已处理 |
| 10206 | 403 | 首位管理员权限不可撤销 |
| 10207 | 400 | 该用户不是管理员 |
| 10208 | 400 | 不能撤销自己的权限 |
| 10301 | 413 | 文件过大 |
| 10302 | 415 | 文件类型不允许 |
| 10401 | 400 | 参数缺失 |
| 10402 | 400 | 参数格式错误 |

---

## 认证接口

### 用户注册

```
POST /api/v1/auth/register
```

**请求体**

```json
{
  "email": "user@example.com",
  "username": "newuser",
  "password": "password123",
  "display_name": "新用户"  // 可选
}
```

**响应 201**

```json
{
  "code": 0,
  "message": "created",
  "data": {
    "token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "expires_in": 7200,
    "user": {
      "id": "018f...",
      "email": "user@example.com",
      "username": "newuser",
      "display_name": "新用户",
      "avatar": null,
      "bio": null,
      "role": "user",
      "github_id": null,
      "github_username": null,
      "two_factor_enabled": false,
      "active": true,
      "last_login_at": "2026-04-07T00:00:00Z",
      "last_login_ip": "unknown"
    },
    "permissions": { "can_add": true, "can_edit": true, "can_delete": true, "can_toggle_visibility": true },
    "first_user": false
  }
}
```

---

### 登录

```
POST /api/v1/auth/login
```

**请求体**

```json
{ "username": "admin", "password": "password123" }
```

**响应 200**（未启用2FA）

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "expires_in": 7200,
    "user": { ... },
    "permissions": { ... }
  }
}
```

**响应 401**（已启用2FA）

```json
{ "code": 10111, "message": "需要两步验证", "data": { "temp_token": "eyJhbGci..." } }
```

---

### 两步验证

```
POST /api/v1/auth/2fa/verify
```

**请求体**

```json
{ "temp_token": "eyJhbGci...", "code": "123456" }
```

---

### 刷新令牌

```
POST /api/v1/auth/refresh
```

**请求体**

```json
{ "refresh_token": "eyJhbGci..." }
```

---

### 登出

```
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

**响应 204** 无响应体

---

### 验证令牌

```
GET /api/v1/auth/verify
Authorization: Bearer <token>
```

**响应 200**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "valid": true,
    "user": { "id": "018f...", "username": "admin", "role": "admin" }
  }
}
```

---

### 2FA设置

```
POST /api/v1/auth/2fa/setup
Authorization: Bearer <token>
```

**响应 200**

```json
{
  "code": 0,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "otpauth_url": "otpauth://totp/fufu:admin?secret=JBSWY3DPEHPK3PXP&issuer=fufu"
  }
}
```

### 启用/禁用2FA

```
POST /api/v1/auth/2fa/enable
POST /api/v1/auth/2fa/disable
Authorization: Bearer <token>
```

**请求体**

```json
{ "code": "123456" }
```

---

### 重置密码

```
POST /api/v1/auth/password/reset-request
```

**请求体**

```json
{ "username": "admin" }
```

```
POST /api/v1/auth/password/reset-confirm
```

**请求体**

```json
{ "token": "eyJhbGci...", "new_password": "newPassword456" }
```

---

### GitHub OAuth

```
GET /api/v1/auth/github
```

**响应 200**

```json
{
  "code": 0,
  "data": {
    "url": "https://github.com/login/oauth/authorize?client_id=xxx&scope=user:email&state=xxx",
    "state": "csrf_protection_token"
  }
}
```

```
POST /api/v1/auth/github/callback
```

**请求体**

```json
{ "code": "abc123", "state": "csrf_protection_token" }
```

**响应 200**

```json
{
  "code": 0,
  "data": {
    "token": "...",
    "refresh_token": "...",
    "expires_in": 7200,
    "user": { ... },
    "permissions": { ... },
    "new_user": true,
    "first_user": false
  }
}
```

### 绑定/解绑GitHub

```
POST /api/v1/auth/github/bind
Authorization: Bearer <token>
```

**请求体**

```json
{ "code": "abc123", "state": "csrf_protection_token" }
```

```
POST /api/v1/auth/github/unbind
Authorization: Bearer <token>
```

---

## 公开接口

### 用户资料

```
GET /api/v1/user/profile
```

**响应 200**

```json
{
  "code": 0,
  "data": {
    "id": "018f...",
    "name": "fufu",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "greeting": "Ciallo～(∠・ω< )⌒★",
    "social_links": [
      { "id": "0190...", "name": "B站", "url": "https://space.bilibili.com/xxx", "icon": "i-simple-icons-bilibili", "link_type": "link", "sort_order": 0 }
    ]
  }
}
```

### 用户设置

```
GET /api/v1/user/settings
```

**响应 200**

```json
{ "code": 0, "data": { "theme": "rose", "language": "zh-CN" } }
```

---

### 相册

```
GET /api/v1/galleries?page=1&per_page=10
```

**响应 200**

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "018f...",
        "title": "日常随拍",
        "cover": "https://cdn.example.com/cover.jpg",
        "photo_count": 12,
        "tags": ["日常", "生活"],
        "visible": true,
        "created_at": "2026-04-01T00:00:00Z",
        "updated_at": "2026-04-03T00:00:00Z"
      }
    ],
    "pagination": { "page": 1, "per_page": 10, "total": 10, "total_pages": 1 }
  }
}
```

```
GET /api/v1/galleries/{id}
```

**响应 200**

```json
{
  "code": 0,
  "data": {
    "id": "018f...",
    "title": "日常随拍",
    "cover": "https://cdn.example.com/cover.jpg",
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
        "x": 100.5, "y": 150.0,
        "rotation": 5.5,
        "width": 800, "height": 600,
        "z_index": 1,
        "original_filename": "photo.jpg",
        "file_size": 102400
      }
    ]
  }
}
```

---

### 公告

```
GET /api/v1/announcements?limit=5
```

**响应 200**

```json
{
  "code": 0,
  "data": [
    { "id": "018f...", "content": "欢迎来到我的网站！", "date": "2026-04-03", "priority": 10, "visible": true }
  ]
}
```

---

### 导航菜单

```
GET /api/v1/menu
```

**响应 200**

```json
{
  "code": 0,
  "data": [
    { "id": "018f...", "label": "首页", "key": "home", "icon": "i-lucide-home", "route": "/", "visible": true, "sort_order": 0 }
  ]
}
```

---

### 链接

```
GET /api/v1/links?page=1&per_page=10&tag=开发
```

**响应 200**

```json
{
  "code": 0,
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
    "pagination": { ... }
  }
}
```

```
GET /api/v1/links/{id}
```

---

### 番剧信息

```
GET /api/v1/bangumi-info?page=1&per_page=10&status=watching
```

**响应 200**

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "018f...",
        "title": "葬送的芙莉莲",
        "cover": "https://cdn.example.com/cover.jpg",
        "episodes": 28,
        "description": "魔王被打倒之后的故事",
        "tags": ["奇幻", "冒险"],
        "status": "watched",
        "rating": 9.5,
        "visible": true,
        "sort_order": 0,
        "created_at": "2026-04-01T00:00:00Z",
        "updated_at": "2026-04-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

| status | 说明 |
|--------|------|
| `watching` | 在看 |
| `want_to_watch` | 想看 |
| `watched` | 看过 |
| `dropped` | 抛弃 |

```
GET /api/v1/bangumi-info/{id}
```

---

### 追番记录

```
GET /api/v1/watchlist?page=1&per_page=10
```

**响应 200**

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "0190...",
        "bangumi_id": "018f...",
        "bangumi_title": "葬送的芙莉莲",
        "bangumi_cover": "https://cdn.example.com/cover.jpg",
        "bangumi_episodes": 28,
        "rating": 9.5,
        "progress": "1-28",
        "notes": "非常治愈",
        "watch_date": "2026-04-01",
        "visible": true,
        "sort_order": 0,
        "created_at": "2026-04-01T00:00:00Z",
        "updated_at": "2026-04-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

```
GET /api/v1/watchlist/{id}
```

---

### 友人帐

```
GET /api/v1/friends?page=1&per_page=20
```

**响应 200**（仅返回 status=active 且 visible=true）

```json
{
  "code": 0,
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
    "pagination": { ... }
  }
}
```

### 申请友链

```
POST /api/v1/friends/apply
```

**请求体**

```json
{ "name": "我的博客", "url": "https://myblog.example.com", "description": "个人技术博客" }
```

**响应 201**

```json
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

---

### 评论

```
GET /api/v1/comments?target_type=gallery&target_id=xxx&page=1&per_page=20
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `target_type` | 是 | `gallery` / `bangumi` |
| `target_id` | 是 | 目标ID |
| `page` | 否 | 页码，默认1 |
| `per_page` | 否 | 每页数量，默认20，最大50 |

**响应 200**

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "018f...",
        "target_type": "gallery",
        "target_id": "018f...",
        "parent_id": null,
        "author": {
          "user_id": "018f...",
          "name": "fufu",
          "avatar": "https://example.com/avatar.jpg"
        },
        "reply_to_name": null,
        "content": "这张照片真好看！",
        "markdown": false,
        "status": "normal",
        "replies": [
          {
            "id": "018freply...",
            "author": { "user_id": null, "name": "游客小明", "avatar": null },
            "reply_to_name": "fufu",
            "content": "同意！",
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
    "has_more": true
  }
}
```

> - 公开接口不返回评论总数，使用 `has_more` 判断是否还有更多评论
> - `reply_to_name`: 被回复者名称。为 `null` 表示直接回复顶级评论（未指定回复特定人）

### 发布评论

```
POST /api/v1/comments
Authorization: Bearer <token>  // 可选
```

**请求体（登录用户）**

```json
{
  "target_type": "gallery",
  "target_id": "018f...",
  "parent_id": null,
  "reply_to_user_id": "018f...",
  "reply_to_guest_name": null,
  "content": "评论内容"
}
```

**请求体（游客）**

```json
{
  "target_type": "gallery",
  "target_id": "018f...",
  "parent_id": null,
  "reply_to_user_id": null,
  "reply_to_guest_name": "被回复的游客名",
  "guest_name": "游客小红",
  "guest_email": "xiaohong@example.com",
  "guest_avatar": "https://example.com/avatar.jpg",
  "content": "评论内容",
  "markdown": false
}
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `target_type` | 是 | `gallery` / `bangumi` |
| `target_id` | 是 | 目标ID |
| `parent_id` | 否 | 父评论ID，null表示一级评论 |
| `reply_to_user_id` | 否 | 回复的登录用户ID |
| `reply_to_guest_name` | 否 | 回复的游客名称 |
| `guest_name` | 游客必填 | 2-20字符 |
| `guest_email` | 游客必填 | 有效邮箱格式 |
| `guest_avatar` | 否 | 头像URL |
| `content` | 是 | 1-500字符 |
| `markdown` | 否 | 默认false |

---

## 管理接口

> 所有管理接口需要 `Authorization: Bearer <token>` 且用户角色为 admin

---

### 文件上传

```
POST /api/v1/upload           # 普通用户，限制1MB
POST /api/v1/admin/upload     # 管理员，无限制
```

**请求体**

```json
{ "type": "avatar" }  // avatar | cover | photo | general
```

**响应 200**

```json
{
  "code": 0,
  "data": {
    "token": "Qiniu AccessKey:...",
    "key": "avatar-018f...",
    "domain": "cdn.example.com",
    "expires_in": 300,
    "fsize_limit": 1048576,
    "upload_url": "https://up-z2.qiniup.com",
    "download_url": "https://cdn.example.com/avatar-018f..."
  }
}
```

**前端上传流程**

```javascript
// 1. 获取上传凭证
const { data } = await fetch('/api/v1/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'avatar' })
}).then(r => r.json());

// 2. 上传到七牛云
const formData = new FormData();
formData.append('token', data.token);
formData.append('key', data.key);
formData.append('file', fileInput.files[0]);
await fetch(data.upload_url, { method: 'POST', body: formData });

// 3. 使用 download_url 作为图片地址
```

---

### 用户信息管理

```
GET /api/v1/admin/user
```

**响应 200**

```json
{
  "code": 0,
  "data": {
    "id": "018f...",
    "name": "fufu",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "greeting": "Ciallo～(∠・ω< )⌒★"
  }
}
```

```
PATCH /api/v1/admin/user
```

**请求体**

```json
{
  "name": "新昵称",
  "avatar": "avatar-018f...",
  "greeting": "新的欢迎语"
}
```

---

### 社交链接管理

```
GET /api/v1/admin/user/social-links
```

**响应 200**

```json
{
  "code": 0,
  "data": [
    { "id": "018f...", "name": "B站", "url": "https://space.bilibili.com/xxx", "icon": "i-simple-icons-bilibili", "link_type": "link", "sort_order": 0 }
  ]
}
```

```
POST /api/v1/admin/user/social-links
```

**请求体**

```json
{ "name": "B站", "url": "https://space.bilibili.com/xxx", "icon": "i-simple-icons-bilibili", "link_type": "link", "sort_order": 0 }
```

| link_type | 说明 |
|-----------|------|
| `link` | 普通链接 |
| `email` | 邮箱链接 |

```
PATCH /api/v1/admin/user/social-links/{id}
DELETE /api/v1/admin/user/social-links/{id}
```

---

### 设置管理

```
PATCH /api/v1/admin/settings
```

**请求体**

```json
{ "theme": "cyan", "language": "en-US" }
```

**响应 200**

```json
{ "code": 0, "data": { "theme": "cyan", "language": "en-US" } }
```

---

### 申请成为管理员

```
POST /api/v1/admin/apply
Authorization: Bearer <token>
```

**请求体**

```json
{ "reason": "希望参与网站内容管理工作" }
```

**响应 201**

```json
{
  "code": 0,
  "message": "created",
  "data": {
    "id": "018f...",
    "user_id": "018f...",
    "username": "newuser",
    "reason": "希望参与网站内容管理工作",
    "status": "pending",
    "created_at": "2026-04-07T00:00:00Z",
    "reviewed_at": null,
    "reviewed_by": null,
    "review_note": null
  }
}
```

### 获取我的申请记录

```
GET /api/v1/admin/apply/me
Authorization: Bearer <token>
```

### 获取申请列表（管理员）

```
GET /api/v1/admin/applications?status=pending&page=1&per_page=20
Authorization: Bearer <token>
```

| 参数 | 说明 |
|------|------|
| `status` | `pending` / `approved` / `rejected` |

### 审批申请

```
POST /api/v1/admin/applications/{id}/review
Authorization: Bearer <token>
```

**请求体**

```json
{ "action": "approve", "note": "欢迎加入管理团队" }
```

| action | 说明 |
|--------|------|
| `approve` | 批准申请，用户成为管理员 |
| `reject` | 拒绝申请 |

### 获取管理员列表

```
GET /api/v1/admin/managers
Authorization: Bearer <token>
```

**响应 200**

```json
{
  "code": 0,
  "data": [
    {
      "id": "018f...",
      "username": "admin",
      "email": "admin@example.com",
      "display_name": "管理员",
      "avatar": "https://cdn.example.com/avatar.jpg",
      "created_at": "2026-04-01T00:00:00Z",
      "first_admin": true
    }
  ]
}
```

### 撤销管理员权限

```
POST /api/v1/admin/managers/{id}/revoke
Authorization: Bearer <token>
```

---

### 邮件发送

```
POST /api/v1/admin/email
Authorization: Bearer <token>
```

**请求体**

```json
{
  "to": "user@example.com",
  "subject": "邮件主题",
  "html": "<p>邮件HTML内容</p>"
}
```

---

### 相册管理

```
GET /api/v1/admin/galleries?page=1&per_page=10&visible=false
```

```
POST /api/v1/admin/galleries
```

**请求体**

```json
{ "title": "旅行照片", "cover": "gallery-018f...", "tags": ["旅行", "风景"] }
```

```
PATCH /api/v1/admin/galleries/{id}
DELETE /api/v1/admin/galleries/{id}
PATCH /api/v1/admin/galleries/{id}/visibility
```

---

### 照片管理

```
POST /api/v1/admin/galleries/{gallery_id}/photos
```

**请求体**

```json
{
  "src": "gallery-018f...",
  "filename": "photo.jpg",
  "x": 0.0, "y": 0.0,
  "rotation": 0.0,
  "width": 800, "height": 600
}
```

```
PATCH /api/v1/admin/galleries/{gallery_id}/photos
```

**请求体**

```json
{
  "photos": [
    { "id": "0190...", "x": 120.5, "y": 180.0, "rotation": 5.0, "z_index": 2 }
  ]
}
```

```
PATCH /api/v1/admin/photos/{id}
DELETE /api/v1/admin/photos/{id}
```

---

### 链接管理

```
GET /api/v1/admin/links?page=1&per_page=10&tag=开发&visible=false
```

```
POST /api/v1/admin/links
```

**请求体**

```json
{ "title": "GitHub", "url": "https://github.com", "description": "代码托管平台", "tags": ["开发"], "icon": null, "sort_order": 0 }
```

```
PATCH /api/v1/admin/links/{id}
DELETE /api/v1/admin/links/{id}
PATCH /api/v1/admin/links/{id}/visibility
```

---

### 公告管理

```
GET /api/v1/admin/announcements?page=1&per_page=20&visible=false
```

```
POST /api/v1/admin/announcements
```

**请求体**

```json
{ "content": "新公告内容", "date": "2026-04-04", "priority": 10 }
```

```
PATCH /api/v1/admin/announcements/{id}
DELETE /api/v1/admin/announcements/{id}
PATCH /api/v1/admin/announcements/{id}/visibility
```

---

### 菜单管理

```
GET /api/v1/admin/menu
```

```
POST /api/v1/admin/menu
```

**请求体**

```json
{ "label": "博客", "key": "blog", "icon": "i-lucide-book-open", "route": "/blog", "sort_order": 2 }
```

```
PATCH /api/v1/admin/menu/{id}
DELETE /api/v1/admin/menu/{id}
PATCH /api/v1/admin/menu/{id}/visibility
```

---

### 番剧管理

```
GET /api/v1/admin/bangumi-info?page=1&per_page=10&visible=false&status=watching
```

```
POST /api/v1/admin/bangumi-info
```

**请求体**

```json
{ "title": "葬送的芙莉莲", "cover": "bangumi-018f...", "episodes": 28, "description": "简介", "tags": ["奇幻", "冒险"], "status": "want_to_watch", "sort_order": 0 }
```

```
PATCH /api/v1/admin/bangumi-info/{id}
DELETE /api/v1/admin/bangumi-info/{id}
PATCH /api/v1/admin/bangumi-info/{id}/visibility
```

### 更新追番状态

```
PATCH /api/v1/admin/bangumi-info/{id}/status
```

**请求体**

```json
{ "status": "watched" }
```

---

### 追番记录管理

```
GET /api/v1/admin/watchlist?page=1&per_page=10&bangumi_id=xxx&visible=false
```

```
POST /api/v1/admin/watchlist
```

**请求体**

```json
{ "bangumi_id": "018f...", "rating": 9.5, "progress": "1-28", "notes": "非常治愈", "watch_date": "2026-04-01", "sort_order": 0 }
```

```
PATCH /api/v1/admin/watchlist/{id}
DELETE /api/v1/admin/watchlist/{id}
PATCH /api/v1/admin/watchlist/{id}/visibility
```

---

### 友人帐管理

```
GET /api/v1/admin/friends?page=1&per_page=20&status=pending&visible=false
```

| status | 说明 |
|--------|------|
| `active` | 活跃 |
| `pending` | 待审核（申请中） |
| `inactive` | 失效 |

```
POST /api/v1/admin/friends
```

**请求体**

```json
{ "name": "友站名称", "url": "https://friend.example.com", "description": "友站描述", "sort_order": 0 }
```

```
PATCH /api/v1/admin/friends/{id}
DELETE /api/v1/admin/friends/{id}
PATCH /api/v1/admin/friends/{id}/visibility
```

### 更新友链状态

```
PATCH /api/v1/admin/friends/{id}/status
```

**请求体**

```json
{ "status": "active" }
```

---

### 评论管理

```
GET /api/v1/admin/comments?target_type=gallery&target_id=xxx&status=normal&keyword=关键词&page=1
```

| 参数 | 说明 |
|------|------|
| `target_type` | `gallery` / `bangumi` |
| `target_id` | 目标ID |
| `status` | `normal` / `hidden` |
| `keyword` | 搜索关键词 |

```
PATCH /api/v1/admin/comments/{id}/status
```

**请求体**

```json
{ "status": "hidden" }
```

```
DELETE /api/v1/admin/comments/{id}
```

---

### 敏感词管理

```
GET /api/v1/admin/sensitive-words?page=1&per_page=20&level=filter
```

| level | 说明 |
|-------|------|
| `filter` | 替换为 *** |
| `hide` | 自动隐藏评论 |

```
POST /api/v1/admin/sensitive-words
```

**请求体**

```json
{ "word": "敏感词", "level": "filter" }
```

```
DELETE /api/v1/admin/sensitive-words/{id}
```

---

## 数据类型说明

### Photo 坐标

照片的 `x`、`y`、`rotation` 为浮点数，`width`、`height`、`z_index` 为整数。

```typescript
interface Photo {
  id: string
  gallery_id: string
  src: string
  x: number        // 浮点数
  y: number        // 浮点数
  rotation: number // 浮点数（角度）
  width: number    // 整数
  height: number   // 整数
  z_index: number  // 整数
  original_filename?: string
  file_size?: number
}
```

### CommentAuthor

```typescript
interface CommentAuthor {
  user_id: string | null
  name: string
  avatar: string | null
}
```

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.6 | 2026-04-07 | 新增用户管理、社交链接、设置、管理员申请、邮件发送接口；新增定时清理孤儿文件功能；修正数据类型 |
| v1.5 | 2026-04-07 | 整合文档，移除未实现接口 |
| v1.5 | 2026-04-05 | 新增链接、番剧、友人帐、评论模块 |
| v1.4 | 2026-04-05 | 注册和GitHub OAuth响应中返回用户权限 |
| v1.3 | 2026-04-04 | GitHub OAuth登录、绑定/解绑 |
| v1.2 | 2026-04-04 | 首位用户自动成为管理员 |
| v1.1 | 2026-04-04 | 多用户系统 |
| v1 | 2026-04-04 | 初版发布 |