# API 接口文档 v1

## 概述

### 基础信息

| 项目 | 说明 |
|------|------|
| 基础URL | `https://api.example.com` |
| 版本 | v1 |
| 协议 | HTTPS |
| 数据格式 | JSON |
| 编码 | UTF-8 |

### 命名规范

- **类型名**：PascalCase（如 `UserProfile`、`SocialLink`）
- **属性名**：snake_case（如 `social_links`、`link_type`）

### 接口分类

| 类别 | 前缀 | 说明 | 认证要求 |
|------|------|------|----------|
| 公开接口 | `/api/v1/` | 公开数据读取 | 无需认证 |
| 管理接口 | `/api/v1/admin/` | 数据管理操作 | JWT认证 |
| 认证接口 | `/api/v1/auth/` | 登录认证相关 | 部分需要 |

### 认证方式

管理接口需要在请求头中携带JWT令牌：

```
Authorization: Bearer <token>
```

令牌有效期：2小时（可配置）
刷新令牌有效期：7天

---

## HTTP状态码

### 成功响应

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| `200 OK` | 成功 | GET查询、PATCH/PUT更新成功 |
| `201 Created` | 已创建 | POST创建资源成功 |
| `204 No Content` | 无内容 | DELETE删除成功（无响应体） |

### 客户端错误

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| `400 Bad Request` | 请求参数错误 | 参数缺失、格式错误 |
| `401 Unauthorized` | 未认证 | 缺少或无效的认证令牌 |
| `403 Forbidden` | 无权限 | 已认证但权限不足 |
| `404 Not Found` | 资源不存在 | 路径错误或资源已删除 |
| `409 Conflict` | 资源冲突 | 重复创建、状态冲突 |
| `413 Payload Too Large` | 内容过大 | 文件上传超限 |
| `415 Unsupported Media Type` | 不支持的类型 | 文件类型不允许 |
| `422 Unprocessable Entity` | 无法处理 | 业务逻辑校验失败 |
| `429 Too Many Requests` | 请求过多 | 限流触发 |

### 服务器错误

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| `500 Internal Server Error` | 服务器错误 | 未预期的内部错误 |
| `503 Service Unavailable` | 服务不可用 | 服务维护或过载 |

---

## 响应格式

### 成功响应

```json
// GET / PATCH 成功 (200)
{
  "code": 0,
  "message": "success",
  "data": { ... }
}

// POST 创建成功 (201)
{
  "code": 0,
  "message": "created",
  "data": { "id": "...", ... }
}

// DELETE 成功 (204) - 无响应体
```

### 分页响应 (200)

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

### 错误响应

```json
// HTTP状态码对应业务错误码
{
  "code": <业务错误码>,
  "message": "<错误描述>",
  "data": null
}
```

---

## 业务错误码

| 代码范围 | 类别 | HTTP状态码 |
|----------|------|------------|
| `0` | 成功 | 200/201/204 |
| `10001-10099` | 资源错误 | 404/409 |
| `10101-10199` | 认证错误 | 401 |
| `10201-10299` | 权限错误 | 403 |
| `10301-10399` | 文件错误 | 413/415 |
| `10401-10499` | 参数错误 | 400/422 |
| `10501-10599` | 服务器错误 | 500/503/429 |

### 具体错误码

| 业务码 | HTTP状态码 | 说明 |
|--------|------------|------|
| `10001` | 404 | 资源不存在 |
| `10002` | 409 | 资源已存在（重复创建） |
| `10003` | 404 | 资源已删除 |
| `10004` | 409 | 邮箱已被注册 |
| `10005` | 409 | 用户名已被使用 |
| `10101` | 401 | 未登录 |
| `10102` | 401 | 令牌无效 |
| `10103` | 401 | 令牌已过期 |
| `10104` | 401 | 密码错误 |
| `10105` | 401 | 账户已禁用 |
| `10106` | 401 | 两步验证失败 |
| `10111` | 401 | 需要两步验证 |
| `10112` | 401 | GitHub 授权失败 |
| `10113` | 400 | GitHub 账号未设置公开邮箱 |
| `10114` | 400 | state 验证失败 |
| `10115` | 400 | 已绑定 GitHub 账号 |
| `10116` | 409 | GitHub 账号已被其他用户绑定 |
| `10117` | 400 | 未绑定 GitHub 账号 |
| `10118` | 400 | 账号未设置密码，无法解绑 |
| `10107` | 400 | 重置令牌无效 |
| `10108` | 400 | 重置令牌已过期 |
| `10109` | 400 | 2FA未设置 |
| `10110` | 400 | 2FA已启用 |
| `10201` | 403 | 无权限访问 |
| `10202` | 403 | 无权限操作 |
| `10203` | 400 | 已是管理员 |
| `10204` | 409 | 已有待处理的申请 |
| `10205` | 400 | 申请已处理 |
| `10206` | 403 | 首位管理员权限不可撤销 |
| `10207` | 400 | 用户不是管理员 |
| `10208` | 400 | 不能撤销自己的权限 |
| `10301` | 413 | 文件过大（最大10MB） |
| `10302` | 415 | 文件类型不允许 |
| `10303` | 500 | 上传失败 |
| `10401` | 400 | 参数缺失 |
| `10402` | 400 | 参数格式错误 |
| `10403` | 422 | 业务校验失败 |
| `10404` | 400 | 新密码格式错误 |
| `10501` | 500 | 服务器内部错误 |
| `10502` | 503 | 服务暂时不可用 |
| `10503` | 429 | 请求过于频繁 |

---

## 数据模型

### UserProfile

```typescript
interface UserProfile {
  id: string                   // UUIDv7
  name: string                 // 用户名/昵称
  avatar: string | null        // 头像URL（七牛云）
  greeting: string | null      // 欢迎语/个性签名
  social_links: SocialLink[]   // 社交链接
}
```

### SocialLink

```typescript
interface SocialLink {
  id: string                   // UUIDv7
  name: string                 // 平台名称
  url: string                  // 链接地址
  icon: string                 // 图标类名
  link_type: 'link' | 'email'  // 类型
  sort_order: number           // 排序权重
}
```

### Gallery

```typescript
interface Gallery {
  id: string                   // UUIDv7
  title: string                // 相册标题
  cover: string | null         // 封面图URL
  photo_count: number          // 照片数量
  tags: string[]               // 标签数组
  visible: boolean             // 是否可见
  created_at: string           // 创建时间 ISO 8601
  updated_at: string           // 更新时间 ISO 8601
}
```

### GalleryWithPhotos

```typescript
interface GalleryWithPhotos extends Gallery {
  photos: Photo[]              // 照片列表
}
```

### Photo

```typescript
interface Photo {
  id: string                   // UUIDv7
  gallery_id: string           // 所属相册ID
  src: string                  // 图片URL（七牛云）
  x: number                    // X坐标
  y: number                    // Y坐标
  rotation: number             // 旋转角度（度）
  width: number                // 显示宽度（px）
  height: number               // 显示高度（px）
  z_index: number              // 层级
  original_filename?: string   // 原始文件名
  file_size?: number           // 文件大小（bytes）
}
```

### Announcement

```typescript
interface Announcement {
  id: string                   // UUIDv7
  content: string              // 公告内容
  date: string                 // 发布日期 YYYY-MM-DD
  priority: number             // 优先级（越大越靠前）
  visible: boolean             // 是否可见
}
```

### UserSettings

```typescript
interface UserSettings {
  theme: string                // 主题名称
  language: string             // 语言偏好
}
```

### MenuItem

```typescript
interface MenuItem {
  id: string                   // UUIDv7
  label: string                // 显示名称
  key: string                  // 唯一标识
  icon: string | null          // 图标类名
  route: string                // 路由路径
  visible: boolean             // 是否显示
  sort_order: number           // 排序权重
}
```

### AdminUser → User

管理员账户已合并到统一的用户表，通过 `role` 字段区分角色。

```typescript
interface User {
  id: string
  email: string
  username: string
  display_name: string | null    // 显示名称
  avatar: string | null          // 头像URL
  bio: string | null             // 个人简介
  role: 'user' | 'admin'         // 用户角色
  github_id: string | null       // GitHub 用户ID
  github_username: string | null // GitHub 用户名
  two_factor_enabled: boolean
  active: boolean
  last_login_at: string | null
  last_login_ip: string | null
}
```

### GitHubOAuthResponse

```typescript
interface GitHubOAuthResponse {
  url: string     // GitHub 授权页面 URL
  state: string   // CSRF 保护令牌
}
```

### GitHubCallbackResponse

```typescript
interface GitHubCallbackResponse {
  token: string
  refresh_token: string
  expires_in: number
  user: User
  permissions: UserPermission    // 用户权限
  is_new_user: boolean           // 是否为新注册用户
  is_first_user: boolean         // 是否为首位用户
}
```

### GitHubBindResponse

```typescript
interface GitHubBindResponse {
  github_id: string
  github_username: string
  avatar: string | null
}
```

### UserPermission

```typescript
interface UserPermission {
  can_add: boolean             // 可添加内容
  can_edit: boolean            // 可编辑内容
  can_delete: boolean          // 可删除内容
  can_toggle_visibility: boolean // 可切换显隐
}
```

### LoginResponse

```typescript
interface LoginResponse {
  token: string                // JWT令牌
  refresh_token: string        // 刷新令牌
  expires_in: number           // 令牌有效期（秒）
  user: User
  permissions: UserPermission
}
```

### RegisterResponse

```typescript
interface RegisterResponse {
  token: string                // JWT令牌
  refresh_token: string        // 刷新令牌
  expires_in: number           // 令牌有效期（秒）
  user: User
  permissions: UserPermission  // 用户权限
  is_first_user: boolean       // 是否为首位用户（自动成为管理员）
}
```

### AdminApplication

```typescript
interface AdminApplication {
  id: string                   // UUIDv7
  user_id: string              // 申请人ID
  username: string             // 申请人用户名
  email?: string               // 申请人邮箱（仅管理员可见）
  reason: string               // 申请理由
  status: 'pending' | 'approved' | 'rejected'  // 申请状态
  created_at: string           // 申请时间 ISO 8601
  reviewed_at: string | null   // 审批时间
  reviewed_by: string | null   // 审批人用户名
  review_note: string | null   // 审批备注
}
```

### Manager

```typescript
interface Manager {
  id: string                   // UUIDv7
  username: string             // 用户名
  email: string                // 邮箱
  display_name: string | null  // 显示名称
  avatar: string | null        // 头像URL
  created_at: string           // 成为管理员时间
  is_first_admin: boolean      // 是否为首位管理员
}
```

### FileInfo

```typescript
interface FileInfo {
  name: string                 // 文件名
  size: number                 // 文件大小（bytes）
  type: string                 // MIME类型
  data: string                 // Base64编码数据
}
```

---

## 公开接口（无需认证）

### 1. 获取用户信息

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
      },
      {
        "id": "0191...",
        "name": "GitHub",
        "url": "https://github.com/xxx",
        "icon": "i-simple-icons-github",
        "link_type": "link",
        "sort_order": 1
      }
    ]
  }
}
```

### 2. 获取相册列表

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

### 3. 获取相册详情

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
        "z_index": 1,
        "original_filename": "IMG_001.jpg",
        "file_size": 102400
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

### 4. 获取公告列表

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
    },
    {
      "id": "0190...",
      "content": "新功能开发中，敬请期待...",
      "date": "2026-04-01",
      "priority": 5,
      "visible": true
    }
  ]
}
```

### 5. 获取用户设置

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

### 6. 获取导航菜单

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
    },
    {
      "id": "0190...",
      "label": "相册",
      "key": "gallery",
      "icon": "i-lucide-image",
      "route": "/gallery",
      "visible": true,
      "sort_order": 1
    }
  ]
}
```

---

## 认证接口

### 1. 用户注册

注册新用户账户。

```
POST /api/v1/auth/register
```

**特殊规则：首位用户自动成为管理员**

如果系统中没有任何用户，第一位注册的用户将自动获得 `admin` 角色，成为系统管理员。后续注册的用户默认为普通用户（`user` 角色）。

**请求体**

```json
{
  "email": "user@example.com",
  "username": "newuser",
  "password": "password123",
  "display_name": "新用户"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `email` | string | 是 | 邮箱地址，需唯一 |
| `username` | string | 是 | 用户名，需唯一，3-32位 |
| `password` | string | 是 | 密码，8-32位 |
| `display_name` | string | 否 | 显示名称，默认为用户名 |

**响应示例 - 首位用户（自动成为管理员）**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200,
    "user": {
      "id": "018f...",
      "email": "admin@example.com",
      "username": "admin",
      "display_name": "管理员",
      "avatar": null,
      "bio": null,
      "role": "admin",
      "github_id": null,
      "github_username": null,
      "two_factor_enabled": false,
      "active": true,
      "last_login_at": "2026-04-04T10:00:00Z",
      "last_login_ip": "1.2.3.4"
    },
    "permissions": {
      "can_add": true,
      "can_edit": true,
      "can_delete": true,
      "can_toggle_visibility": true
    },
    "is_first_user": true
  }
}
```

**响应示例 - 普通用户**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
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
      "last_login_at": "2026-04-04T10:00:00Z",
      "last_login_ip": "1.2.3.4"
    },
    "permissions": {
      "can_add": true,
      "can_edit": true,
      "can_delete": true,
      "can_toggle_visibility": true
    },
    "is_first_user": false
  }
}
```

**错误响应**

```json
// 邮箱已存在
HTTP/1.1 409 Conflict
{
  "code": 10004,
  "message": "邮箱已被注册",
  "data": null
}

// 用户名已存在
HTTP/1.1 409 Conflict
{
  "code": 10005,
  "message": "用户名已被使用",
  "data": null
}

// 密码格式错误
HTTP/1.1 400 Bad Request
{
  "code": 10404,
  "message": "密码长度需为8-32位",
  "data": null
}
```

### 2. GitHub OAuth 登录

使用 GitHub 账号登录。如果账号未注册，自动创建新用户。

#### 2.1 获取 GitHub 授权链接

获取 GitHub OAuth 授权页面 URL，前端重定向到此 URL。

```
GET /api/v1/auth/github
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "url": "https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=user:email",
    "state": "csrf_protection_token"
  }
}
```

**前端流程**

1. 调用此接口获取授权 URL
2. 重定向用户到 `data.url`
3. 用户在 GitHub 授权后，GitHub 会重定向回 `redirect_uri?code=xxx&state=xxx`
4. 前端拿到 `code` 后调用回调接口完成登录

#### 2.2 GitHub 登录回调

使用 GitHub 返回的授权码完成登录。

```
POST /api/v1/auth/github/callback
```

**请求体**

```json
{
  "code": "abc123def456",
  "state": "csrf_protection_token"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `code` | string | 是 | GitHub 返回的授权码 |
| `state` | string | 是 | CSRF 保护令牌，需与步骤1返回的一致 |

**响应示例 - 新用户自动注册**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200,
    "user": {
      "id": "018f...",
      "email": "user@github.com",
      "username": "githubuser",
      "display_name": "GitHub User",
      "avatar": "https://avatars.githubusercontent.com/u/xxx",
      "bio": null,
      "role": "user",
      "github_id": "12345678",
      "github_username": "githubuser",
      "two_factor_enabled": false,
      "active": true,
      "last_login_at": "2026-04-04T10:00:00Z",
      "last_login_ip": "1.2.3.4"
    },
    "permissions": {
      "can_add": true,
      "can_edit": true,
      "can_delete": true,
      "can_toggle_visibility": true
    },
    "is_new_user": true,
    "is_first_user": false
  }
}
```

**响应示例 - 已注册用户登录**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200,
    "user": {
      "id": "018f...",
      "email": "user@example.com",
      "username": "existing_user",
      "display_name": "Existing User",
      "avatar": "https://avatars.githubusercontent.com/u/xxx",
      "bio": null,
      "role": "user",
      "github_id": "12345678",
      "github_username": "octocat",
      "two_factor_enabled": false,
      "active": true,
      "last_login_at": "2026-04-04T10:00:00Z",
      "last_login_ip": "1.2.3.4"
    },
    "permissions": {
      "can_add": true,
      "can_edit": true,
      "can_delete": true,
      "can_toggle_visibility": true
    },
    "is_new_user": false,
    "is_first_user": false
  }
}
```

**响应示例 - 已启用 2FA 的用户**

```json
HTTP/1.1 401 Unauthorized

{
  "code": 10111,
  "message": "需要两步验证",
  "data": {
    "temp_token": "eyJhbGciOiJIUzI1NiIs...",
    "github_login": true
  }
}
```

**错误响应**

```json
// GitHub 授权码无效
HTTP/1.1 401 Unauthorized
{
  "code": 10112,
  "message": "GitHub 授权失败",
  "data": null
}

// GitHub 账号未绑定邮箱
HTTP/1.1 400 Bad Request
{
  "code": 10113,
  "message": "GitHub 账号未设置公开邮箱",
  "data": null
}

// state 不匹配
HTTP/1.1 400 Bad Request
{
  "code": 10114,
  "message": "state 验证失败",
  "data": null
}
```

### 3. 绑定 GitHub 账号

将 GitHub 账号绑定到已登录的用户账户。

```
POST /api/v1/auth/github/bind
Authorization: Bearer <token>
```

**请求体**

```json
{
  "code": "abc123def456",
  "state": "csrf_protection_token"
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "github_id": "12345678",
    "github_username": "octocat",
    "avatar": "https://avatars.githubusercontent.com/u/12345678"
  }
}
```

**错误响应**

```json
// 已经绑定过 GitHub
HTTP/1.1 400 Bad Request
{
  "code": 10115,
  "message": "已绑定 GitHub 账号",
  "data": null
}

// GitHub 账号已被其他用户绑定
HTTP/1.1 409 Conflict
{
  "code": 10116,
  "message": "该 GitHub 账号已被其他用户绑定",
  "data": null
}
```

### 4. 解绑 GitHub 账号

解除 GitHub 账号绑定。

```
POST /api/v1/auth/github/unbind
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误响应**

```json
// 未绑定 GitHub
HTTP/1.1 400 Bad Request
{
  "code": 10117,
  "message": "未绑定 GitHub 账号",
  "data": null
}

// 只有 GitHub 登录方式，无法解绑
HTTP/1.1 400 Bad Request
{
  "code": 10118,
  "message": "账号未设置密码，无法解绑 GitHub",
  "data": null
}
```

### 5. 账号密码登录

验证用户名和密码。如果用户启用了2FA，返回需要验证状态。

```
POST /api/v1/auth/login
```

**请求体**

```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应示例 - 未启用2FA，直接登录成功**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200,
    "user": {
      "id": "018f...",
      "email": "admin@local",
      "username": "admin",
      "display_name": null,
      "avatar": null,
      "bio": null,
      "role": "admin",
      "two_factor_enabled": false,
      "active": true,
      "last_login_at": "2026-04-04T10:00:00Z",
      "last_login_ip": "1.2.3.4"
    },
    "permissions": {
      "can_add": true,
      "can_edit": true,
      "can_delete": true,
      "can_toggle_visibility": true
    }
  }
}
```

**响应示例 - 已启用2FA，需要第二步验证**

```json
HTTP/1.1 401 Unauthorized

{
  "code": 10111,
  "message": "需要两步验证",
  "data": {
    "temp_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**前端登录流程**

```
用户输入账号密码 → POST /api/v1/auth/login
    │
    ├─ 返回token → 登录成功 → 跳转首页
    │
    └─ 返回 temp_token (code: 10111) → 显示2FA输入框 → POST /api/v1/auth/2fa/verify → 登录成功
```

**错误响应**

```json
// 密码错误
HTTP/1.1 401 Unauthorized
{
  "code": 10104,
  "message": "密码错误",
  "data": null
}

// 账户已禁用
HTTP/1.1 401 Unauthorized
{
  "code": 10105,
  "message": "账户已禁用",
  "data": null
}
```

### 3. 两步验证（第二步：验证2FA码）

使用临时token和2FA验证码完成登录。

```
POST /api/v1/auth/2fa/verify
```

**请求体**

```json
{
  "temp_token": "eyJhbGciOiJIUzI1NiIs...",
  "code": "123456"
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200,
    "user": {
      "id": "018f...",
      "email": "admin@local",
      "username": "admin",
      "display_name": null,
      "avatar": null,
      "bio": null,
      "role": "admin",
      "two_factor_enabled": true,
      "active": true,
      "last_login_at": "2026-04-04T10:00:00Z",
      "last_login_ip": "1.2.3.4"
    },
    "permissions": {
      "can_add": true,
      "can_edit": true,
      "can_delete": true,
      "can_toggle_visibility": true
    }
  }
}
```

**错误响应**

```json
// 临时token无效或已过期
HTTP/1.1 401 Unauthorized
{
  "code": 10102,
  "message": "令牌无效",
  "data": null
}

// 2FA验证码错误
HTTP/1.1 401 Unauthorized
{
  "code": 10106,
  "message": "两步验证失败",
  "data": null
}
```

### 3. 登出

登出并将令牌加入黑名单。

```
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

### 4. 刷新令牌

使用刷新令牌获取新的访问令牌。

```
POST /api/v1/auth/refresh
```

**请求体**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200
  }
}
```

**错误响应**

```json
HTTP/1.1 401 Unauthorized
{
  "code": 10102,
  "message": "刷新令牌无效",
  "data": null
}
```

### 5. 验证令牌

验证当前令牌是否有效。

```
GET /api/v1/auth/verify
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "valid": true,
    "user": {
      "id": "018f...",
      "username": "admin",
      "role": "admin"
    }
  }
}
```

**错误响应**

```json
HTTP/1.1 401 Unauthorized
{
  "code": 10103,
  "message": "令牌已过期",
  "data": null
}
```

---

## 管理员申请接口

普通用户可以申请成为管理员，由现有管理员审批。

### 1. 申请成为管理员

提交管理员申请，等待现有管理员审批。

```
POST /api/v1/admin/apply
Authorization: Bearer <token>
```

**请求体**

```json
{
  "reason": "希望参与网站内容管理工作"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `reason` | string | 是 | 申请理由，10-500字 |

**响应示例**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "id": "018f...",
    "user_id": "018f...",
    "username": "applicant",
    "reason": "希望参与网站内容管理工作",
    "status": "pending",
    "created_at": "2026-04-04T10:00:00Z"
  }
}
```

**错误响应**

```json
// 已经是管理员
HTTP/1.1 400 Bad Request
{
  "code": 10203,
  "message": "您已经是管理员",
  "data": null
}

// 已有待处理的申请
HTTP/1.1 409 Conflict
{
  "code": 10204,
  "message": "您已有待处理的申请",
  "data": null
}
```

### 2. 获取我的申请记录

查看当前用户的申请状态。

```
GET /api/v1/admin/apply/me
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
    "user_id": "018f...",
    "username": "applicant",
    "reason": "希望参与网站内容管理工作",
    "status": "pending",
    "created_at": "2026-04-04T10:00:00Z",
    "reviewed_at": null,
    "reviewed_by": null,
    "review_note": null
  }
}
```

**响应示例 - 无申请记录**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

## 管理员审批接口（需要管理员权限）

以下接口仅限管理员访问。

### 1. 获取申请列表

获取所有待处理或已处理的申请列表。

```
GET /api/v1/admin/applications
GET /api/v1/admin/applications?status=pending
GET /api/v1/admin/applications?status=approved
GET /api/v1/admin/applications?status=rejected
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `status` | string | 全部 | 筛选状态：`pending`、`approved`、`rejected` |
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
        "user_id": "018f...",
        "username": "applicant1",
        "email": "user1@example.com",
        "reason": "希望参与网站内容管理工作",
        "status": "pending",
        "created_at": "2026-04-04T10:00:00Z",
        "reviewed_at": null,
        "reviewed_by": null,
        "review_note": null
      },
      {
        "id": "0190...",
        "user_id": "0190...",
        "username": "applicant2",
        "email": "user2@example.com",
        "reason": "有丰富的内容管理经验",
        "status": "approved",
        "created_at": "2026-04-03T10:00:00Z",
        "reviewed_at": "2026-04-03T12:00:00Z",
        "reviewed_by": "admin",
        "review_note": "欢迎加入"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 2,
      "total_pages": 1
    }
  }
}
```

### 2. 审批申请

批准或拒绝管理员申请。

```
POST /api/v1/admin/applications/{id}/review
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 申请ID（UUIDv7） |

**请求体**

```json
{
  "action": "approve",
  "note": "欢迎加入管理团队"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `action` | string | 是 | 操作：`approve`（批准）或 `reject`（拒绝） |
| `note` | string | 否 | 审批备注，最多200字 |

**响应示例 - 批准**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "018f...",
    "user_id": "018f...",
    "username": "applicant1",
    "status": "approved",
    "reviewed_at": "2026-04-04T12:00:00Z",
    "reviewed_by": "admin",
    "review_note": "欢迎加入管理团队"
  }
}
```

**响应示例 - 拒绝**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "018f...",
    "user_id": "018f...",
    "username": "applicant1",
    "status": "rejected",
    "reviewed_at": "2026-04-04T12:00:00Z",
    "reviewed_by": "admin",
    "review_note": "暂不符合要求"
  }
}
```

**错误响应**

```json
// 申请不存在
HTTP/1.1 404 Not Found
{
  "code": 10001,
  "message": "申请不存在",
  "data": null
}

// 申请已处理
HTTP/1.1 400 Bad Request
{
  "code": 10205,
  "message": "该申请已处理",
  "data": null
}
```

### 3. 获取管理员列表

获取所有管理员用户列表。

```
GET /api/v1/admin/managers
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
      "username": "admin",
      "email": "admin@example.com",
      "display_name": "管理员",
      "avatar": null,
      "created_at": "2026-04-01T00:00:00Z",
      "is_first_admin": true
    },
    {
      "id": "0190...",
      "username": "manager1",
      "email": "manager1@example.com",
      "display_name": "内容管理员",
      "avatar": null,
      "created_at": "2026-04-04T10:00:00Z",
      "is_first_admin": false
    }
  ]
}
```

### 4. 撤销管理员权限

将管理员降级为普通用户。

```
POST /api/v1/admin/managers/{id}/revoke
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 用户ID（UUIDv7） |

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "0190...",
    "username": "manager1",
    "role": "user"
  }
}
```

**错误响应**

```json
// 不能撤销首位管理员
HTTP/1.1 403 Forbidden
{
  "code": 10206,
  "message": "首位管理员的权限不可撤销",
  "data": null
}

// 用户不是管理员
HTTP/1.1 400 Bad Request
{
  "code": 10207,
  "message": "该用户不是管理员",
  "data": null
}

// 不能撤销自己的权限
HTTP/1.1 400 Bad Request
{
  "code": 10208,
  "message": "不能撤销自己的管理员权限",
  "data": null
}
```

---

## 两步验证接口（2FA）

### 1. 生成2FA密钥

生成2FA配置密钥，用于绑定 authenticator 应用。

```
POST /api/v1/auth/2fa/setup
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "otpauth_url": "otpauth://totp/fufu:admin?secret=JBSWY3DPEHPK3PXP&issuer=fufu"
  }
}
```

**前端说明**

使用 `otpauth_url` 生成二维码，或让用户手动输入 `secret`。

### 2. 启用2FA

验证2FA码后启用两步验证。

```
POST /api/v1/auth/2fa/enable
Authorization: Bearer <token>
```

**请求体**

```json
{
  "code": "123456"
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误响应**

```json
// 2FA未设置（需先调用 setup）
HTTP/1.1 400 Bad Request
{
  "code": 10109,
  "message": "2FA未设置",
  "data": null
}

// 验证码错误
HTTP/1.1 401 Unauthorized
{
  "code": 10106,
  "message": "两步验证失败",
  "data": null
}
```

### 3. 禁用2FA

验证2FA码后禁用两步验证。

```
POST /api/v1/auth/2fa/disable
Authorization: Bearer <token>
```

**请求体**

```json
{
  "code": "123456"
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误响应**

```json
// 2FA未启用
HTTP/1.1 400 Bad Request
{
  "code": 10110,
  "message": "2FA未启用",
  "data": null
}

// 验证码错误
HTTP/1.1 401 Unauthorized
{
  "code": 10106,
  "message": "两步验证失败",
  "data": null
}
```

---

## 重置密码接口

### 1. 发送重置邮件

发送密码重置链接到管理员邮箱。

```
POST /api/v1/auth/password/reset-request
```

**请求体**

```json
{
  "username": "admin"
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "重置链接已发送到管理员邮箱",
  "data": null
}
```

**错误响应**

```json
// 用户不存在
HTTP/1.1 404 Not Found
{
  "code": 10001,
  "message": "用户不存在",
  "data": null
}
```

### 2. 确认重置密码

验证重置令牌后设置新密码。

```
POST /api/v1/auth/password/reset-confirm
```

**请求体**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "new_password": "newPassword456"
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "密码重置成功",
  "data": null
}
```

**错误响应**

```json
// 重置令牌无效
HTTP/1.1 400 Bad Request
{
  "code": 10107,
  "message": "重置令牌无效",
  "data": null
}

// 重置令牌已过期
HTTP/1.1 400 Bad Request
{
  "code": 10108,
  "message": "重置令牌已过期",
  "data": null
}

// 新密码格式错误
HTTP/1.1 400 Bad Request
{
  "code": 10404,
  "message": "新密码长度需为8-32位",
  "data": null
}
```

### 3. 2FA验证后重置

登录状态下通过2FA验证后重置密码（无需邮箱）。

```
POST /api/v1/auth/password/reset-2fa
Authorization: Bearer <token>
```

**请求体**

```json
{
  "code": "123456",
  "new_password": "newPassword456"
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "密码重置成功",
  "data": null
}
```

**错误响应**

```json
// 2FA未启用
HTTP/1.1 400 Bad Request
{
  "code": 10109,
  "message": "2FA未启用，请使用邮件重置",
  "data": null
}

// 验证码错误
HTTP/1.1 401 Unauthorized
{
  "code": 10106,
  "message": "两步验证失败",
  "data": null
}
```

---

## 管理接口（需要认证）

所有管理接口需要在请求头中携带有效令牌，且用户角色需为 `admin`：

```
Authorization: Bearer <token>
```

> **注意**：普通用户（role: "user"）无法访问管理接口，将返回 403 Forbidden。

### 用户管理

#### 获取用户信息（管理视角）

```
GET /api/v1/admin/user
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

#### 更新用户信息

```
PATCH /api/v1/admin/user
```

**请求体**

```json
{
  "name": "新昵称",
  "greeting": "新的欢迎语",
  "avatar": "https://cdn.example.com/new-avatar.jpg"
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
    "name": "新昵称",
    "avatar": "https://cdn.example.com/new-avatar.jpg",
    "greeting": "新的欢迎语"
  }
}
```

#### 上传头像（一步式）

```
POST /api/v1/admin/user/avatar
Content-Type: multipart/form-data
```

**表单字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | file | 是 | 图片文件（最大10MB） |

**支持的图片类型**

- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

**响应示例**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "url": "https://cdn.example.com/avatar-abc123.jpg",
    "key": "avatar-abc123.jpg"
  }
}
```

**错误响应**

```json
// 文件过大
HTTP/1.1 413 Payload Too Large
{
  "code": 10301,
  "message": "文件大小不能超过10MB",
  "data": null
}

// 文件类型不允许
HTTP/1.1 415 Unsupported Media Type
{
  "code": 10302,
  "message": "仅支持 jpeg/png/gif/webp 格式",
  "data": null
}
```

#### 创建社交链接

```
POST /api/v1/admin/user/social-links
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

**响应示例**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "id": "0190...",
    "name": "B站",
    "url": "https://space.bilibili.com/xxx",
    "icon": "i-simple-icons-bilibili",
    "link_type": "link",
    "sort_order": 0
  }
}
```

#### 更新社交链接

```
PATCH /api/v1/admin/user/social-links/{id}
```

**请求体**

```json
{
  "name": "哔哩哔哩",
  "url": "https://space.bilibili.com/yyy",
  "sort_order": 1
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
    "name": "哔哩哔哩",
    "url": "https://space.bilibili.com/yyy",
    "icon": "i-simple-icons-bilibili",
    "link_type": "link",
    "sort_order": 1
  }
}
```

#### 删除社交链接

```
DELETE /api/v1/admin/user/social-links/{id}
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

---

### 相册管理

#### 创建相册

```
POST /api/v1/admin/galleries
```

**请求体**

```json
{
  "title": "旅行照片",
  "cover": "https://cdn.example.com/cover.jpg",
  "tags": ["旅行", "风景"]
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
    "title": "旅行照片",
    "cover": "https://cdn.example.com/cover.jpg",
    "photo_count": 0,
    "tags": ["旅行", "风景"],
    "visible": true,
    "created_at": "2026-04-04T10:00:00Z",
    "updated_at": "2026-04-04T10:00:00Z"
  }
}
```

#### 更新相册

```
PATCH /api/v1/admin/galleries/{id}
```

**请求体**

```json
{
  "title": "更新后的标题",
  "cover": "https://cdn.example.com/new-cover.jpg",
  "tags": ["新标签"]
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
    "title": "更新后的标题",
    "cover": "https://cdn.example.com/new-cover.jpg",
    "photo_count": 5,
    "tags": ["新标签"],
    "visible": true,
    "created_at": "2026-04-04T10:00:00Z",
    "updated_at": "2026-04-04T12:00:00Z"
  }
}
```

#### 删除相册

```
DELETE /api/v1/admin/galleries/{id}
```

**响应示例**

```json
HTTP/1.1 204 No Content
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

#### 切换相册可见性

```
PATCH /api/v1/admin/galleries/{id}/visibility
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

---

### 照片管理

#### 上传照片到相册（一步式）

```
POST /api/v1/admin/galleries/{gallery_id}/photos
Content-Type: multipart/form-data
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

**响应示例**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "id": "0190...",
    "gallery_id": "018f...",
    "src": "https://cdn.example.com/photo-abc123.jpg",
    "x": 100,
    "y": 100,
    "rotation": 0,
    "width": 800,
    "height": 600,
    "z_index": 5,
    "original_filename": "IMG_001.jpg",
    "file_size": 102400
  }
}
```

**错误响应**

```json
// 相册不存在
HTTP/1.1 404 Not Found
{
  "code": 10001,
  "message": "相册不存在",
  "data": null
}

// 文件过大
HTTP/1.1 413 Payload Too Large
{
  "code": 10301,
  "message": "文件大小不能超过10MB",
  "data": null
}
```

#### 批量更新照片布局

```
PATCH /api/v1/admin/galleries/{gallery_id}/photos
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
    },
    {
      "id": "0191...",
      "x": 200,
      "y": 300,
      "rotation": -10,
      "z_index": 3
    }
  ]
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "updated": 2
  }
}
```

#### 更新单张照片

```
PATCH /api/v1/admin/photos/{id}
```

**请求体**

```json
{
  "x": 150,
  "y": 200,
  "rotation": 15,
  "z_index": 10
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
    "x": 150,
    "y": 200,
    "rotation": 15,
    "z_index": 10
  }
}
```

#### 删除照片

```
DELETE /api/v1/admin/photos/{id}
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

---

### 公告管理

#### 创建公告

```
POST /api/v1/admin/announcements
```

**请求体**

```json
{
  "content": "新公告内容",
  "date": "2026-04-04",
  "priority": 10
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
    "content": "新公告内容",
    "date": "2026-04-04",
    "priority": 10,
    "visible": true
  }
}
```

#### 更新公告

```
PATCH /api/v1/admin/announcements/{id}
```

**请求体**

```json
{
  "content": "更新的公告内容",
  "priority": 15
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
    "content": "更新的公告内容",
    "date": "2026-04-04",
    "priority": 15,
    "visible": true
  }
}
```

#### 删除公告

```
DELETE /api/v1/admin/announcements/{id}
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

#### 切换公告可见性

```
PATCH /api/v1/admin/announcements/{id}/visibility
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

---

### 设置管理

#### 更新用户设置

```
PATCH /api/v1/admin/settings
```

**请求体**

```json
{
  "theme": "cyan",
  "language": "en-US"
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "theme": "cyan",
    "language": "en-US"
  }
}
```

---

### 菜单管理

#### 获取完整菜单配置

获取所有菜单项（含隐藏项）。

```
GET /api/v1/admin/menu
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
    },
    {
      "id": "0190...",
      "label": "管理",
      "key": "admin",
      "icon": "i-lucide-settings",
      "route": "/admin",
      "visible": false,
      "sort_order": 99
    }
  ]
}
```

#### 创建菜单项

```
POST /api/v1/admin/menu
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

**响应示例**

```json
HTTP/1.1 201 Created

{
  "code": 0,
  "message": "created",
  "data": {
    "id": "0191...",
    "label": "博客",
    "key": "blog",
    "icon": "i-lucide-book-open",
    "route": "/blog",
    "visible": true,
    "sort_order": 2
  }
}
```

**错误响应**

```json
// key重复
HTTP/1.1 409 Conflict
{
  "code": 10002,
  "message": "菜单key已存在",
  "data": null
}
```

#### 更新菜单项

```
PATCH /api/v1/admin/menu/{id}
```

**请求体**

```json
{
  "label": "新名称",
  "visible": false,
  "sort_order": 5
}
```

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "id": "0191...",
    "label": "新名称",
    "key": "blog",
    "icon": "i-lucide-book-open",
    "route": "/blog",
    "visible": false,
    "sort_order": 5
  }
}
```

#### 删除菜单项

```
DELETE /api/v1/admin/menu/{id}
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

---

### 邮件发送

发送邮件（需要管理员权限，防止滥用）。

```
POST /api/v1/admin/email
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

**响应示例**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "邮件发送成功",
  "data": null
}
```

**错误响应**

```json
// 请求过于频繁（限流）
HTTP/1.1 429 Too Many Requests
{
  "code": 10503,
  "message": "请求过于频繁，请稍后再试",
  "data": null
}
```

---

## 文件上传限制

| 类型 | 最大大小 | 允许的MIME类型 |
|------|----------|----------------|
| 头像 | 20MB | image/jpeg, image/png, image/gif, image/webp |
| 相册照片 | 20MB | image/jpeg, image/png, image/gif, image/webp |

---

## 限流策略

| 接口类别 | 限制 |
|----------|------|
| 公开接口 | 100次/分钟/IP |
| 管理接口 | 200次/分钟/用户 |
| 登录接口 | 5次/分钟/IP |
| 邮件接口 | 10次/小时/用户 |

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.4 | 2026-04-05 | 注册和 GitHub OAuth 响应中返回用户权限、首位用户自动获得完整权限 |
| v1.3 | 2026-04-04 | GitHub OAuth 登录、绑定/解绑 GitHub 账号 |
| v1.2 | 2026-04-04 | 首位用户自动成为管理员、添加管理员申请和审批接口 |
| v1.1 | 2026-04-04 | 多用户系统：添加注册接口、合并用户表、角色区分 |
| v1 | 2026-04-04 | 初版发布 |