# API 接口文档 - 数据模型

> 数据类型定义

---

## 用户相关

### User

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

### UserSettings

```typescript
interface UserSettings {
  theme: string                // 主题名称
  language: string             // 语言偏好
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

---

## 认证相关

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

---

## 内容相关

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

---

## 管理相关

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

---

## 文件相关

### FileInfo

```typescript
interface FileInfo {
  name: string                 // 文件名
  size: number                 // 文件大小（bytes）
  type: string                 // MIME类型
  data: string                 // Base64编码数据
}
```