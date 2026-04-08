/**
 * API 类型定义
 * 基于后端 API 接口文档 v1
 */

// ========== 通用响应格式 ==========

// API 响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 分页响应
export interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// ========== 业务错误码 ==========

export const ErrorCodes = {
  // 成功
  SUCCESS: 0,
  // 资源错误
  RESOURCE_NOT_FOUND: 10001,
  RESOURCE_ALREADY_EXISTS: 10002,
  RESOURCE_DELETED: 10003,
  EMAIL_ALREADY_REGISTERED: 10004,
  USERNAME_ALREADY_USED: 10005,
  // 认证错误
  NOT_LOGGED_IN: 10101,
  TOKEN_INVALID: 10102,
  TOKEN_EXPIRED: 10103,
  PASSWORD_ERROR: 10104,
  ACCOUNT_DISABLED: 10105,
  TWO_FACTOR_FAILED: 10106,
  TWO_FACTOR_REQUIRED: 10111, // 需要两步验证
  RESET_TOKEN_INVALID: 10107,
  RESET_TOKEN_EXPIRED: 10108,
  TWO_FACTOR_NOT_SETUP: 10109,
  TWO_FACTOR_ALREADY_ENABLED: 10110,
  // GitHub相关错误
  GITHUB_AUTH_FAILED: 10112,
  GITHUB_NO_PUBLIC_EMAIL: 10113,
  GITHUB_STATE_MISMATCH: 10114,
  GITHUB_ALREADY_BOUND: 10115,
  GITHUB_BOUND_BY_OTHER: 10116,
  GITHUB_NOT_BOUND: 10117,
  GITHUB_CANNOT_UNBIND: 10118,
  // 权限错误
  NO_ACCESS_PERMISSION: 10201,
  NO_OPERATION_PERMISSION: 10202,
  ALREADY_ADMIN: 10203, // 已是管理员
  PENDING_APPLICATION_EXISTS: 10204, // 已有待处理的申请
  APPLICATION_ALREADY_PROCESSED: 10205, // 申请已处理
  FIRST_ADMIN_CANNOT_BE_REVOKED: 10206, // 首位管理员权限不可撤销
  USER_NOT_ADMIN: 10207, // 用户不是管理员
  CANNOT_REVOKE_SELF: 10208, // 不能撤销自己的权限
  // 文件错误
  FILE_TOO_LARGE: 10301,
  FILE_TYPE_NOT_ALLOWED: 10302,
  UPLOAD_FAILED: 10303,
  // 参数错误
  PARAM_MISSING: 10401,
  PARAM_FORMAT_ERROR: 10402,
  BUSINESS_VALIDATION_FAILED: 10403,
  NEW_PASSWORD_FORMAT_ERROR: 10404,
  // 服务器错误
  INTERNAL_ERROR: 10501,
  SERVICE_UNAVAILABLE: 10502,
  RATE_LIMITED: 10503,
} as const

// ========== 用户相关 ==========

export interface UserProfile {
  id: string
  name: string
  avatar: string | null
  greeting: string | null
  social_links: SocialLink[]
}

export interface SocialLink {
  id: string
  name: string
  url: string
  icon: string
  link_type: 'link' | 'email'
  sort_order: number
}

export interface UserSettings {
  theme: string
  language: string
}

// ========== 相册相关 ==========

export interface Gallery {
  id: string
  title: string
  cover: string | null
  photo_count: number
  tags: string[]
  visible: boolean
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  gallery_id: string
  src: string
  x: number
  y: number
  rotation: number
  width: number
  height: number
  z_index: number
  original_filename?: string
  file_size?: number
}

export interface GalleryWithPhotos extends Gallery {
  photos: Photo[]
}

export interface PhotoUpdate {
  id: string
  x?: number
  y?: number
  rotation?: number
  z_index?: number
}

// ========== 公告相关 ==========

export interface Announcement {
  id: string
  content: string
  date: string
  priority: number
  visible: boolean
}

// ========== 菜单相关 ==========

export interface MenuItem {
  id: string
  label: string
  key: string
  icon: string | null
  route: string
  visible: boolean
  sort_order: number
}

// ========== 认证相关 ==========

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  display_name?: string
}

export interface LoginResponse {
  token: string
  refresh_token: string
  expires_in: number
  user: User
  permissions: UserPermission
}

export interface RegisterResponse {
  token: string
  refresh_token: string
  expires_in: number
  user: User
  permissions: UserPermission // 用户权限
  is_first_user: boolean // 是否为首位用户（自动成为管理员）
}

export interface User {
  id: string
  email: string
  username: string
  display_name: string | null
  avatar: string | null
  bio: string | null
  role: 'user' | 'admin'
  github_id: string | null // GitHub 用户ID
  github_username: string | null // GitHub 用户名
  two_factor_enabled: boolean
  active: boolean
  last_login_at: string | null
  last_login_ip: string | null
}

export interface UserPermission {
  can_add: boolean
  can_edit: boolean
  can_delete: boolean
  can_toggle_visibility: boolean
}

// 兼容旧类型名
export type AdminUser = User
export type AdminPermission = UserPermission

// 管理员申请
export interface AdminApplication {
  id: string
  user_id: string
  username: string
  email?: string // 仅管理员可见
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  review_note: string | null
}

// 管理员信息
export interface Manager {
  id: string
  username: string
  email: string
  display_name: string | null
  avatar: string | null
  created_at: string // 成为管理员时间
  is_first_admin: boolean // 是否为首位管理员
}

// 申请成为管理员请求
export interface AdminApplyRequest {
  reason: string // 申请理由，10-500字
}

// 审批申请请求
export interface ReviewApplicationRequest {
  action: 'approve' | 'reject'
  note?: string // 审批备注，最多200字
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  token: string
  refresh_token: string
  expires_in: number
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

// ========== 文件上传相关 ==========

export interface UploadResponse {
  url: string
  key: string
}

export interface FileInfo {
  name: string
  size: number
  type: string
  data: string
}

// ========== 邮件相关 ==========

export interface EmailData {
  subject: string
  content: string
  recipient: string
  attachments: FileInfo[]
}

// ========== 管理接口请求类型 ==========

export interface CreateGalleryRequest {
  title: string
  cover?: string
  tags?: string[]
}

export interface UpdateGalleryRequest {
  title?: string
  cover?: string
  tags?: string[]
}

export interface CreateAnnouncementRequest {
  content: string
  date: string
  priority?: number
}

export interface UpdateAnnouncementRequest {
  content?: string
  date?: string
  priority?: number
}

export interface CreateMenuItemRequest {
  label: string
  key: string
  icon?: string
  route: string
  visible?: boolean
  sort_order?: number
}

export interface UpdateMenuItemRequest {
  label?: string
  icon?: string
  route?: string
  visible?: boolean
  sort_order?: number
}

export interface CreateSocialLinkRequest {
  name: string
  url: string
  icon: string
  link_type: 'link' | 'email'
  sort_order?: number
}

export interface UpdateSocialLinkRequest {
  name?: string
  url?: string
  icon?: string
  sort_order?: number
}

// ========== 两步验证 (2FA) 相关 ==========

export interface TwoFactorSetupResponse {
  secret: string
  otpauth_url: string
}

export interface TwoFactorCodeRequest {
  code: string
}

// 两步验证登录请求（第二步）
export interface TwoFactorVerifyRequest {
  temp_token: string // 登录第一步返回的临时令牌
  code: string // 6位验证码
}

// 两步验证登录响应（含临时令牌）
export interface TwoFactorRequiredResponse {
  temp_token: string
  github_login?: boolean
}

// ========== 密码重置相关 ==========

export interface ResetPasswordRequest {
  username: string
}

export interface ResetPasswordConfirmRequest {
  token: string
  new_password: string
}

export interface ResetPassword2FARequest {
  code: string
  new_password: string
}

// ========== GitHub OAuth 相关 ==========

// GitHub授权URL响应
export interface GitHubAuthUrlResponse {
  url: string
  state: string
}

// GitHub登录回调请求
export interface GitHubCallbackRequest {
  code: string
  state: string
}

// GitHub登录响应
export interface GitHubLoginResponse {
  token: string
  refresh_token: string
  expires_in: number
  user: User
  permissions: UserPermission // 用户权限
  is_new_user: boolean // 是否为新注册用户
  is_first_user: boolean // 是否为首位用户
}

// GitHub绑定请求
export interface GitHubBindRequest {
  code: string
  state: string
}

// GitHub绑定响应
export interface GitHubBindResponse {
  github_id: string
  github_username: string
  avatar: string
}

// 2FA所需的GitHub登录响应（code 10111）
export interface TwoFactorRequiredGitHubResponse {
  temp_token: string
  github_login: boolean
}

// ========== 评论相关 ==========

// 评论目标类型
export type CommentTarget = 'gallery' | 'bangumi' | 'post'

// 评论状态
export type CommentStatus = 'normal' | 'hidden'

// 评论者信息
export interface CommentAuthor {
  user_id: string | null
  name: string // 用户名或游客名称
  avatar: string | null // 头像URL
}

// 评论项（包含回复）
export interface Comment {
  id: string
  target_type: CommentTarget
  target_id: string
  parent_id: string | null // 父评论ID，null表示一级评论

  // 评论者
  author: CommentAuthor

  // 回复目标
  reply_to_name: string | null // 回复的用户名

  content: string
  markdown: boolean // 是否为 Markdown 格式
  status: CommentStatus

  // 回复列表（仅一级评论有）
  replies: Comment[]
  reply_count: number

  created_at: string
  updated_at: string
}

// 发布评论请求（登录用户）
export interface CreateCommentRequest {
  target_type: CommentTarget
  target_id: string
  parent_id?: string | null
  reply_to_user_id?: string | null
  reply_to_guest_name?: string | null
  content: string
  markdown?: boolean // 是否为 Markdown 格式，默认 false
}

// 发布评论请求（游客）
export interface CreateGuestCommentRequest extends CreateCommentRequest {
  guest_name: string
  guest_email: string
  guest_avatar?: string
}

// 评论列表响应（公开接口，不返回总数）
export interface CommentListResponse {
  items: Comment[]
  has_more: boolean
}

// 敏感词
export interface SensitiveWord {
  id: string
  word: string
  level: 'filter' | 'hide'
  created_at: string
}

// ========== 友人帐相关 ==========

// 友人帐状态
export type FriendStatus = 'active' | 'pending' | 'inactive'

// 友链（图标由前端从 url 自动获取 favicon）
export interface Friend {
  id: string
  name: string // 网站名称
  url: string // 网站链接
  description: string | null // 网站描述
  status: FriendStatus
  visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// 申请添加友链请求
export interface ApplyFriendRequest {
  name: string // 网站名称
  url: string // 网站链接
  description?: string // 网站描述（可选）
}

// ========== 番剧相关 ==========

// 追番进度状态
export type WatchStatus = 'watching' | 'want_to_watch' | 'watched' | 'dropped'

// 番剧基础信息
export interface BangumiInfo {
  id: string // UUIDv7
  title: string // 番剧标题
  cover: string | null // 封面图URL
  episodes: number | null // 总集数（可为空）
  description: string | null // 简介
  tags: string[] // 标签数组
  status: WatchStatus // 追番进度状态
  rating: number // 平均评分（根据追番记录计算）
  visible: boolean // 是否可见
  sort_order: number // 排序权重
  created_at: string // 创建时间 ISO 8601
  updated_at: string // 更新时间 ISO 8601
}

// 追番记录
export interface WatchlistItem {
  id: string // UUIDv7
  bangumi_id: string // 关联番剧 ID
  bangumi_title: string // 番剧标题（关联查询）
  bangumi_cover: string | null // 番剧封面（关联查询）
  bangumi_episodes: number | null // 番剧总集数（关联查询）
  rating: number | null // 评分 0-10
  progress: string | null // 观看进度（文本）
  notes: string | null // 感想/备注
  watch_date: string | null // 观看日期
  visible: boolean // 是否可见
  sort_order: number // 排序权重
  created_at: string // 创建时间 ISO 8601
  updated_at: string // 更新时间 ISO 8601
}

// 兼容旧类型 - 使用 WatchlistItem 作为 Bangumi
export type Bangumi = WatchlistItem

// 创建番剧信息请求
export interface CreateBangumiInfoRequest {
  title: string
  cover?: string
  episodes?: number
  description?: string
  tags?: string[]
  status?: WatchStatus
  visible?: boolean
}

// 更新番剧信息请求
export interface UpdateBangumiInfoRequest {
  title?: string
  cover?: string
  episodes?: number
  description?: string
  tags?: string[]
  status?: WatchStatus
  visible?: boolean
}

// 创建追番记录请求
export interface CreateWatchlistRequest {
  bangumi_id: string
  rating?: number
  progress?: string
  notes?: string
  watch_date?: string
}

// 更新追番记录请求
export interface UpdateWatchlistRequest {
  rating?: number
  progress?: string
  notes?: string
  watch_date?: string
}

// 兼容旧类型
export type CreateBangumiRequest = CreateBangumiInfoRequest & CreateWatchlistRequest
export type UpdateBangumiRequest = UpdateBangumiInfoRequest & UpdateWatchlistRequest

// ========== 链接相关 ==========

// 链接
export interface Link {
  id: string
  title: string // 网站名称
  url: string // 链接地址
  description: string | null // 网站描述
  tags: string[] // 标签数组（用于分组）
  icon: string | null // 网站图标URL（可选）
  visible: boolean // 是否可见
  sort_order: number // 排序权重
  created_at: string
  updated_at: string
}

// 创建链接请求
export interface CreateLinkRequest {
  title: string
  url: string
  description?: string
  tags?: string[]
  icon?: string
  sort_order?: number
}

// 更新链接请求
export interface UpdateLinkRequest {
  title?: string
  url?: string
  description?: string
  tags?: string[]
  icon?: string
  sort_order?: number
}

// ========== 文章相关 ==========

// 文章状态
export type PostStatus = 'published' | 'draft' | 'hidden'

// 文章基础信息（列表项）
export interface Post {
  id: string
  title: string
  slug: string
  summary: string | null
  cover: string | null
  tags: string[]
  category: string | null
  status: PostStatus
  view_count: number
  like_count: number
  comment_count: number
  top: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

// 文章详情（含内容）
export interface PostDetail extends Post {
  content: string
  comment_allowed: boolean
}

// 文章目录项
export interface PostTocItem {
  id: string
  text: string
  level: number
  children: PostTocItem[]
}

// 归档分组
export interface ArchiveGroup {
  year: number
  months: {
    month: number
    count: number
    posts: Pick<Post, 'id' | 'title' | 'slug' | 'published_at'>[]
  }[]
  total: number
}

// 标签统计
export interface TagCount {
  tag: string
  count: number
}

// 分类统计
export interface CategoryCount {
  category: string
  count: number
}

// 创建文章请求
export interface CreatePostRequest {
  title: string
  slug?: string
  summary?: string
  content: string
  cover?: string
  tags?: string[]
  category?: string
  status?: PostStatus
  top?: boolean
  comment_allowed?: boolean
}

// 更新文章请求
export interface UpdatePostRequest {
  title?: string
  slug?: string
  summary?: string
  content?: string
  cover?: string
  tags?: string[]
  category?: string
  comment_allowed?: boolean
}

// 切换文章状态请求
export interface UpdatePostStatusRequest {
  status: PostStatus
}

// 切换置顶请求
export interface UpdatePostTopRequest {
  top: boolean
}

// ========== 点赞相关 ==========

// 点赞目标类型
export type LikeTarget = 'gallery' | 'bangumi' | 'post' | 'site'

// 点赞请求
export interface LikeRequest {
  target_type: LikeTarget
  target_id?: string // site 类型时不需要
}

// 点赞响应
export interface LikeResponse {
  liked: boolean // true=点赞成功，false=取消点赞
  like_count: number // 当前点赞数
}

// 点赞检查响应
export interface LikeCheckResponse {
  liked: boolean
}

// 点赞数响应
export interface LikeCountResponse {
  count: number
}
