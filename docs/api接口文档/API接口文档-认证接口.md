# API 接口文档 - 认证接口

> 登录注册相关接口

---

## 用户注册

### 注册新用户

```
POST /api/v1/auth/register
```

**特殊规则：首位用户自动成为管理员**

如果系统中没有任何用户，第一位注册的用户将自动获得 `admin` 角色，成为系统管理员。

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

**响应示例**

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

---

## GitHub OAuth 登录

### 获取 GitHub 授权链接

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

### GitHub 登录回调

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
    "user": { ... },
    "permissions": { ... },
    "is_new_user": true,
    "is_first_user": false
  }
}
```

### 绑定 GitHub 账号

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

### 解绑 GitHub 账号

```
POST /api/v1/auth/github/unbind
Authorization: Bearer <token>
```

---

## 账号密码登录

### 登录

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

**响应示例 - 未启用2FA**

```json
HTTP/1.1 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200,
    "user": { ... },
    "permissions": { ... }
  }
}
```

**响应示例 - 已启用2FA**

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

---

## 两步验证（2FA）

### 两步验证第二步

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

### 生成2FA密钥

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

### 启用2FA

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

### 禁用2FA

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

---

## 令牌管理

### 登出

```
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

**响应示例**

```json
HTTP/1.1 204 No Content
```

### 刷新令牌

```
POST /api/v1/auth/refresh
```

**请求体**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 验证令牌

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

---

## 重置密码

### 发送重置邮件

```
POST /api/v1/auth/password/reset-request
```

**请求体**

```json
{
  "username": "admin"
}
```

### 确认重置密码

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

### 2FA验证后重置

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

---

## 管理员申请

### 申请成为管理员

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

### 获取我的申请记录

```
GET /api/v1/admin/apply/me
Authorization: Bearer <token>
```