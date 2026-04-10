# fufu-rs API接口文档

> 更新日期: 2026-04-10  
> 基础路径: `/api/v1`  
> 认证方式: JWT Bearer Token

## 目录

- [认证说明](#认证说明)
- [通用响应格式](#通用响应格式)
- [认证接口](#认证接口)
- [公开接口](#公开接口)
- [相册接口](#相册接口)
- [文章接口](#文章接口)
- [链接接口](#链接接口)
- [番剧信息接口](#番剧信息接口)
- [追番列表接口](#追番列表接口)
- [友人帐接口](#友人帐接口)
- [评论接口](#评论接口)
- [点赞接口](#点赞接口)
- [上传接口](#上传接口)
- [管理接口](#管理接口)

---

## 认证说明

### JWT认证

除了标注为"无需认证"的接口外，其他接口都需要在请求头中携带JWT Token：

```http
Authorization: Bearer <token>
```

### Token类型

- **Access Token**: 用于接口访问，有效期15分钟
- **Refresh Token**: 用于刷新Access Token，有效期7天
- **Temp Token**: 2FA验证时的临时Token，有效期5分钟

### 权限说明

- `user`: 普通用户权限
- `admin`: 管理员权限（管理接口需要）

---

## 通用响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": <错误码>,
  "message": "<错误信息>",
  "data": null
}
```

### 分页响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

### 创建响应

HTTP状态码: `201 Created`

```json
{
  "code": 0,
  "message": "created",
  "data": { ... }
}
```

### 删除响应

HTTP状态码: `204 No Content` (无响应体)

---

## 认证接口

### 1. 注册

**POST** `/api/v1/auth/register`

**无需认证**

**请求体**:
```json
{
  "email": "string",           // 必填，邮箱
  "username": "string",        // 必填，用户名（3-32字符）
  "password": "string",        // 必填，密码（8-32字符）
  "display_name": "string"     // 可选，显示名称
}
```

**响应**:
```json
{
  "code": 0,
  "message": "created",
  "data": {
    "token": "string",               // Access Token
    "refresh_token": "string",       // Refresh Token
    "expires_in": 900,               // Token有效期（秒）
    "user": {
      "id": "string",
      "email": "string",
      "username": "string",
      "display_name": "string",
      "avatar": "string",
      "bio": "string",
      "role": "string",              // "user" 或 "admin"
      "github_id": "string",
      "github_username": "string",
      "two_factor_enabled": false,
      "active": true,
      "last_login_at": "string",
      "last_login_ip": "string"
    },
    "permissions": {
      "can_add": true,
      "can_edit": true,
      "can_delete": true,
      "can_toggle_visibility": true
    },
    "first_user": false              // 是否为首位用户（自动成为管理员）
  }
}
```

**错误码**:
- `400`: 参数缺失或格式错误
- `409`: 邮箱或用户名已存在

---

### 2. 登录

**POST** `/api/v1/auth/login`

**无需认证**

**请求体**:
```json
{
  "username": "string",        // 必填，用户名或邮箱
  "password": "string"         // 必填，密码
}
```

**成功响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "string",
    "refresh_token": "string",
    "expires_in": 900,
    "user": { ... },
    "permissions": { ... }
  }
}
```

**需要2FA响应** (code: `need_2fa`):
```json
{
  "code": "need_2fa",
  "message": "需要两步验证",
  "data": {
    "temp_token": "string"     // 临时Token，用于2FA验证
  }
}
```

**错误码**:
- `400`: 参数缺失
- `401`: 用户名或密码错误
- `403`: 账号已被禁用

---

### 3. 两步验证

**POST** `/api/v1/auth/2fa/verify`

**使用Temp Token认证**

**请求体**:
```json
{
  "temp_token": "string",     // 必填，登录返回的临时Token
  "code": "string"            // 必填，6位验证码
}
```

**响应**: 同登录成功响应

**错误码**:
- `400`: 参数缺失
- `401`: Token无效或验证码错误

---

### 4. 登出

**POST** `/api/v1/auth/logout`

**需要认证**

将Token加入黑名单，响应 `204 No Content`

---

### 5. 刷新Token

**POST** `/api/v1/auth/refresh`

**无需认证**（使用Refresh Token）

**请求体**:
```json
{
  "refresh_token": "string"   // 必填
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "string",
    "refresh_token": "string",
    "expires_in": 900
  }
}
```

---

### 6. 验证Token

**GET** `/api/v1/auth/verify`

**需要认证**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "valid": true,
    "user": {
      "id": "string",
      "username": "string",
      "role": "string"
    }
  }
}
```

---

### 7. 设置2FA

**POST** `/api/v1/auth/2fa/setup`

**需要认证**

生成2FA密钥和二维码URL

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "secret": "string",       // 2FA密钥
    "qr_url": "string"        // 二维码URL
  }
}
```

---

### 8. 启用2FA

**POST** `/api/v1/auth/2fa/enable`

**需要认证**

**请求体**:
```json
{
  "code": "string"            // 必填，6位验证码
}
```

响应 `204 No Content`

---

### 9. 禁用2FA

**POST** `/api/v1/auth/2fa/disable`

**需要认证**

**请求体**:
```json
{
  "code": "string"            // 必填，6位验证码
}
```

响应 `204 No Content`

---

### 10. 重置密码申请

**POST** `/api/v1/auth/password/reset-request`

**无需认证**

发送重置密码邮件

**请求体**:
```json
{
  "email": "string"           // 必填
}
```

响应 `204 No Content`

---

### 11. 重置密码确认

**POST** `/api/v1/auth/password/reset-confirm`

**无需认证**

**请求体**:
```json
{
  "token": "string",          // 必填，邮件中的Token
  "new_password": "string"    // 必填，新密码（8-32字符）
}
```

响应 `204 No Content`

---

### 12. 重置2FA

**POST** `/api/v1/auth/password/reset-2fa`

**需要认证**

通过密码重置2FA

**请求体**:
```json
{
  "password": "string"        // 必填，当前密码
}
```

响应 `204 No Content`

---

### GitHub OAuth

#### 13. 获取GitHub授权URL

**GET** `/api/v1/auth/github`

**无需认证**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "url": "string",          // GitHub授权URL
    "state": "string"         // 状态参数（用于回调验证）
  }
}
```

#### 14. GitHub回调

**POST** `/api/v1/auth/github/callback`

**无需认证**

**请求体**:
```json
{
  "code": "string",           // 必填，GitHub返回的code
  "state": "string"           // 必填，授权时的state
}
```

**响应**: 同登录成功响应，额外包含 `new_user` 和 `first_user` 字段

#### 15. 绑定GitHub

**POST** `/api/v1/auth/github/bind`

**需要认证**

**请求体**:
```json
{
  "code": "string",
  "state": "string"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "github_id": "string",
    "github_username": "string",
    "avatar": "string"
  }
}
```

#### 16. 解绑GitHub

**POST** `/api/v1/auth/github/unbind`

**需要认证**

响应成功消息

---

## 公开接口

### 1. 获取用户资料

**GET** `/api/v1/user/profile`

**无需认证**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "name": "string",
    "avatar": "string",
    "greeting": "string",
    "social_links": [
      {
        "id": "string",
        "name": "string",
        "url": "string",
        "icon": "string",
        "link_type": "string",   // "link" 或其他类型
        "sort_order": 0
      }
    ]
  }
}
```

---

### 2. 获取公告列表

**GET** `/api/v1/announcements`

**无需认证**

**查询参数**:
- `limit`: 数量限制（默认10，最大50）

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "string",
      "content": "string",
      "date": "string",
      "priority": 0,
      "visible": true
    }
  ]
}
```

---

### 3. 获取用户设置

**GET** `/api/v1/user/settings`

**无需认证**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "theme": "string",        // 主题名称
    "language": "string"      // 语言代码
  }
}
```

---

### 4. 获取导航菜单

**GET** `/api/v1/menu`

**无需认证**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "string",
      "label": "string",
      "key": "string",
      "icon": "string",
      "route": "string",
      "visible": true,
      "sort_order": 0
    }
  ]
}
```

---

## 相册接口

### 1. 获取相册列表

**GET** `/api/v1/galleries`

**无需认证**

**查询参数**:
- `page`: 页码（默认1）
- `per_page`: 每页数量（默认10，最大50）

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "cover": "string",        // 封面图片URL
        "photo_count": 0,
        "tags": ["string"],
        "visible": true,
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 2. 获取随机相册

**GET** `/api/v1/galleries/random`

**无需认证**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "title": "string",
    "cover": "string",
    "photo_count": 0,
    "tags": ["string"],
    "visible": true,
    "created_at": "string",
    "updated_at": "string",
    "first_photo_url": "string"  // 第一张照片URL
  }
}
```

---

### 3. 获取相册详情

**GET** `/api/v1/galleries/{id}`

**无需认证**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "title": "string",
    "cover": "string",
    "photo_count": 0,
    "tags": ["string"],
    "visible": true,
    "created_at": "string",
    "updated_at": "string",
    "photos": [
      {
        "id": "string",
        "gallery_id": "string",
        "src": "string",           // 图片URL
        "x": 0.0,                  // X坐标
        "y": 0.0,                  // Y坐标
        "rotation": 0.0,           // 旋转角度
        "width": 0,
        "height": 0,
        "z_index": 0,              // 层级顺序
        "original_filename": "string",
        "file_size": 0
      }
    ]
  }
}
```

---

## 文章接口

### 1. 获取文章列表

**GET** `/api/v1/posts`

**无需认证**

**查询参数**:
- `page`: 页码（默认1）
- `per_page`: 每页数量（默认10，最大50）
- `tag`: 标签筛选
- `category`: 分类筛选
- `keyword`: 关键词搜索（标题或摘要）
- `year`: 年份筛选

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "slug": "string",          // URL友好标识
        "summary": "string",
        "cover": "string",
        "tags": ["string"],
        "category": "string",
        "status": "published",
        "view_count": 0,
        "like_count": 0,
        "comment_count": 0,
        "top": false,              // 是否置顶
        "published_at": "string",
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 2. 获取文章详情

**GET** `/api/v1/posts/{id_or_slug}`

**无需认证**

支持通过ID或slug获取文章

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "title": "string",
    "slug": "string",
    "summary": "string",
    "content": "string",         // 文章正文
    "cover": "string",
    "tags": ["string"],
    "category": "string",
    "status": "published",
    "view_count": 0,
    "like_count": 0,
    "comment_count": 0,
    "top": false,
    "comment_allowed": true,     // 是否允许评论
    "published_at": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

---

### 3. 获取归档列表

**GET** `/api/v1/posts/archive`

**无需认证**

**查询参数**:
- `year`: 年份筛选
- `tag`: 标签筛选

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "year": 2026,
      "months": [
        {
          "month": 4,
          "posts": [
            {
              "id": "string",
              "title": "string",
              "slug": "string",
              "published_at": "string"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 4. 获取所有标签

**GET** `/api/v1/posts/tags`

**无需认证**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "tag": "string",
      "count": 0
    }
  ]
}
```

---

### 5. 获取所有分类

**GET** `/api/v1/posts/categories`

**无需认证**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "category": "string",
      "count": 0
    }
  ]
}
```

---

## 链接接口

### 1. 获取链接列表

**GET** `/api/v1/links`

**无需认证**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "string",
      "name": "string",
      "url": "string",
      "description": "string",
      "icon": "string",
      "sort_order": 0,
      "visible": true
    }
  ]
}
```

---

### 2. 获取链接详情

**GET** `/api/v1/links/{id}`

**无需认证**

---

## 番剧信息接口

### 1. 获取番剧列表

**GET** `/api/v1/bangumi-info`

**无需认证**

**响应**: 分页列表

---

### 2. 获取番剧详情

**GET** `/api/v1/bangumi-info/{id}`

**无需认证**

---

## 追番列表接口

### 1. 获取追番列表

**GET** `/api/v1/watchlist`

**无需认证**

---

### 2. 获取追番详情

**GET** `/api/v1/watchlist/{id}`

**无需认证**

---

## 友人帐接口

### 1. 获取友人列表

**GET** `/api/v1/friends`

**无需认证**

---

### 2. 申请友人

**POST** `/api/v1/friends/apply`

**无需认证**

**请求体**: 待确认

---

## 评论接口

### 1. 获取评论列表

**GET** `/api/v1/comments`

**无需认证**

**查询参数**:
- `target_type`: 目标类型（`post`、`gallery`等）
- `target_id`: 目标ID
- `page`: 页码
- `per_page`: 每页数量

---

### 2. 创建评论

**POST** `/api/v1/comments`

**需要认证**

**请求体**:
```json
{
  "target_type": "string",     // 必填
  "target_id": "string",       // 必填
  "content": "string",         // 必填
  "parent_id": "string"        // 可选，回复的评论ID
}
```

---

## 点赞接口

### 1. 点赞/取消点赞

**POST** `/api/v1/likes`

**需要认证**

**请求体**:
```json
{
  "target_type": "string",     // 必填
  "target_id": "string"        // 必填
}
```

**响应**: 返回当前点赞状态和数量

---

### 2. 检查点赞状态

**GET** `/api/v1/likes/check`

**需要认证**

**查询参数**:
- `target_type`: 目标类型
- `target_id`: 目标ID

---

## 上传接口

### 1. 获取上传凭证（普通用户）

**POST** `/api/v1/upload`

**需要认证**

限制: 最大1MB

**请求体**:
```json
{
  "filename": "string"         // 必填，文件名
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "upload_url": "string",    // 七牛云上传URL
    "token": "string",         // 上传凭证
    "key": "string",           // 文件存储key
    "expires_in": 3600
  }
}
```

---

### 2. 获取上传凭证（管理员）

**POST** `/api/v1/admin/upload`

**需要管理员权限**

无大小限制

---

### 3. 上传回调

**POST** `/api/v1/admin/upload/callback`

**需要管理员权限**

记录文件信息

---

### 4. 获取已上传文件列表

**GET** `/api/v1/admin/files`

**需要管理员权限**

---

## 管理接口

所有管理接口都需要管理员权限（`role = "admin"`）

### 用户管理

#### 1. 获取管理员信息

**GET** `/api/v1/admin/user`

**需要管理员权限**

#### 2. 更新管理员信息

**PATCH** `/api/v1/admin/user`

**需要管理员权限**

#### 3. 社交链接管理

- `GET` `/api/v1/admin/user/social-links` - 获取列表
- `POST` `/api/v1/admin/user/social-links` - 创建
- `PATCH` `/api/v1/admin/user/social-links/{id}` - 更新
- `DELETE` `/api/v1/admin/user/social-links/{id}` - 删除

---

### 设置管理

**PATCH** `/api/v1/admin/settings`

更新站点设置

---

### 管理员申请

#### 1. 申请管理员

**POST** `/api/v1/admin/apply`

**需要认证**

#### 2. 查看我的申请

**GET** `/api/v1/admin/apply/me`

**需要认证**

#### 3. 管理员审批列表

**GET** `/api/v1/admin/applications`

**需要管理员权限**

#### 4. 审批申请

**POST** `/api/v1/admin/applications/{id}/review`

**需要管理员权限**

#### 5. 管理员列表

**GET** `/api/v1/admin/managers`

**需要管理员权限**

#### 6. 撤销管理员权限

**POST** `/api/v1/admin/managers/{id}/revoke`

**需要管理员权限**

---

### 邮件发送

**POST** `/api/v1/admin/email`

**需要管理员权限**

---

### 相册管理

- `GET` `/api/v1/admin/galleries` - 获取列表（包含隐藏的）
- `POST` `/api/v1/admin/galleries` - 创建相册
- `PATCH` `/api/v1/admin/galleries/{id}` - 更新相册
- `DELETE` `/api/v1/admin/galleries/{id}` - 删除相册
- `PATCH` `/api/v1/admin/galleries/{id}/visibility` - 切换可见性

**创建相册请求体**:
```json
{
  "title": "string",           // 必填
  "cover": "string",           // 可选，封面图片key
  "tags": ["string"]           // 可选
}
```

---

### 照片管理

- `POST` `/api/v1/admin/galleries/{gallery_id}/photos` - 创建照片记录
- `PATCH` `/api/v1/admin/galleries/{gallery_id}/photos` - 批量更新照片布局
- `PATCH` `/api/v1/admin/photos/{id}` - 更新单张照片
- `DELETE` `/api/v1/admin/photos/{id}` - 删除照片

**创建照片请求体**:
```json
{
  "src": "string",             // 必填，图片key
  "x": 0.0,
  "y": 0.0,
  "rotation": 0.0,
  "width": 0,
  "height": 0,
  "filename": "string"
}
```

**批量更新请求体**:
```json
{
  "photos": [
    {
      "id": "string",
      "x": 0.0,
      "y": 0.0,
      "rotation": 0.0,
      "z_index": 0
    }
  ]
}
```

---

### 链接管理

- `GET` `/api/v1/admin/links` - 获取列表
- `POST` `/api/v1/admin/links` - 创建
- `PATCH` `/api/v1/admin/links/{id}` - 更新
- `DELETE` `/api/v1/admin/links/{id}` - 删除
- `PATCH` `/api/v1/admin/links/{id}/visibility` - 切换可见性

---

### 公告管理

- `GET` `/api/v1/admin/announcements` - 获取列表
- `POST` `/api/v1/admin/announcements` - 创建
- `PATCH` `/api/v1/admin/announcements/{id}` - 更新
- `DELETE` `/api/v1/admin/announcements/{id}` - 删除
- `PATCH` `/api/v1/admin/announcements/{id}/visibility` - 切换可见性

**创建公告请求体**:
```json
{
  "content": "string",         // 必填
  "date": "string",            // 必填，ISO格式日期
  "priority": 0                // 可选，优先级
}
```

---

### 菜单管理

- `GET` `/api/v1/admin/menu` - 获取列表
- `POST` `/api/v1/admin/menu` - 创建菜单项
- `PATCH` `/api/v1/admin/menu/{id}` - 更新
- `DELETE` `/api/v1/admin/menu/{id}` - 删除
- `PATCH` `/api/v1/admin/menu/{id}/visibility` - 切换可见性

---

### 番剧信息管理

- `GET` `/api/v1/admin/bangumi-info` - 获取列表
- `POST` `/api/v1/admin/bangumi-info` - 创建
- `PATCH` `/api/v1/admin/bangumi-info/{id}` - 更新
- `DELETE` `/api/v1/admin/bangumi-info/{id}` - 删除
- `PATCH` `/api/v1/admin/bangumi-info/{id}/visibility` - 切换可见性
- `PATCH` `/api/v1/admin/bangumi-info/{id}/status` - 更新状态

---

### 追番记录管理

- `GET` `/api/v1/admin/watchlist` - 获取列表
- `POST` `/api/v1/admin/watchlist` - 创建
- `PATCH` `/api/v1/admin/watchlist/{id}` - 更新
- `DELETE` `/api/v1/admin/watchlist/{id}` - 删除
- `PATCH` `/api/v1/admin/watchlist/{id}/visibility` - 切换可见性

---

### 友人帐管理

- `GET` `/api/v1/admin/friends` - 获取列表
- `POST` `/api/v1/admin/friends` - 创建
- `PATCH` `/api/v1/admin/friends/{id}` - 更新
- `DELETE` `/api/v1/admin/friends/{id}` - 删除
- `PATCH` `/api/v1/admin/friends/{id}/visibility` - 切换可见性
- `PATCH` `/api/v1/admin/friends/{id}/status` - 更新状态

---

### 评论管理

- `GET` `/api/v1/admin/comments` - 获取列表
- `PATCH` `/api/v1/admin/comments/{id}/status` - 更新评论状态
- `DELETE` `/api/v1/admin/comments/{id}` - 删除

---

### 敏感词管理

- `GET` `/api/v1/admin/sensitive-words` - 获取列表
- `POST` `/api/v1/admin/sensitive-words` - 创建
- `DELETE` `/api/v1/admin/sensitive-words/{id}` - 删除

---

### 文章管理

- `GET` `/api/v1/admin/posts` - 获取列表（包含所有状态）
- `POST` `/api/v1/admin/posts` - 创建
- `PATCH` `/api/v1/admin/posts/{id}` - 更新
- `DELETE` `/api/v1/admin/posts/{id}` - 删除
- `PATCH` `/api/v1/admin/posts/{id}/status` - 更新状态（published/draft）
- `PATCH` `/api/v1/admin/posts/{id}/top` - 切换置顶

**创建文章请求体**:
```json
{
  "title": "string",           // 必填
  "slug": "string",            // 可选，默认自动生成
  "summary": "string",         // 可选
  "content": "string",         // 必填
  "cover": "string",           // 可选，封面图片key
  "tags": ["string"],          // 可选
  "category": "string",        // 可选
  "status": "published",       // 可选，默认published
  "published_at": "string",    // 可选，ISO格式时间
  "top": false,                // 可选，是否置顶
  "comment_allowed": true      // 可选，是否允许评论
}
```

**文章状态值**:
- `published`: 已发布
- `draft`: 草稿

---

### 翻译接口

**POST** `/api/v1/admin/translate`

**需要管理员权限**

**请求体**:
```json
{
  "text": "string",            // 必填，待翻译文本
  "from": "string",            // 可选，源语言
  "to": "string"               // 可选，目标语言
}
```

---

## 错误码列表

| 错误码 | 说明 |
|-------|------|
| 0 | 成功 |
| 400 | 参数缺失或格式错误 |
| 401 | 未认证或Token无效 |
| 403 | 无权限或账号被禁用 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如邮箱/用户名已存在） |
| 422 | 参数验证失败 |
| 500 | 服务器内部错误 |
| need_2fa | 需要两步验证 |

---

## 分页参数说明

所有分页接口支持以下查询参数：

- `page`: 页码，从1开始，默认1
- `per_page`: 每页数量，默认10，最大50

响应中的 `pagination` 对象包含：

- `page`: 当前页码
- `per_page`: 每页数量
- `total`: 总数量
- `total_pages`: 总页数

---

## 图片处理说明

所有图片URL通过七牛云处理，返回的是完整访问URL，前端无需额外处理。

---

## 注意事项

1. **UUID格式**: 所有资源ID使用UUIDv7格式
2. **时间格式**: 所有时间使用ISO 8601格式（如 `2026-04-10T12:00:00Z`）
3. **逻辑删除**: 所有删除操作为逻辑删除，不会真正删除数据
4. **权限控制**: 管理接口需要 `role = "admin"`，部分管理接口需要用户权限设置
5. **Token刷新**: Access Token有效期15分钟，建议在过期前使用Refresh Token刷新

---

## 更新记录

- 2026-04-10: 初始版本