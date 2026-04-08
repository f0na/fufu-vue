# API 接口更新 - 管理员文章列表

> 更新日期：2026/04/09

---

## 接口说明

### 获取文章列表（管理员）

**GET /api/v1/admin/posts**

权限：管理员

获取所有文章列表（包含所有状态），用于后台管理。

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 筛选状态：draft / published / archived |
| tag | string | 否 | 筛选标签 |
| category | string | 否 | 筛选分类 |
| keyword | string | 否 | 搜索关键词（匹配标题和摘要） |
| page | int | 否 | 页码，默认 1 |
| per_page | int | 否 | 每页数量，默认 10，最大 50 |

**响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "012345...",
        "title": "文章标题",
        "slug": "article-slug",
        "summary": "文章摘要",
        "cover": "https://cdn.example.com/cover/abc.jpg",
        "tags": ["标签1", "标签2"],
        "category": "分类名称",
        "status": "published",
        "view_count": 100,
        "like_count": 10,
        "comment_count": 5,
        "top": false,
        "published_at": "2026-04-09T12:00:00Z",
        "created_at": "2026-04-09T10:00:00Z",
        "updated_at": "2026-04-09T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

**PostListItem 字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 文章 ID（UUIDv7） |
| title | string | 文章标题 |
| slug | string | 文章 slug（URL 友好标识） |
| summary | string? | 文章摘要（可为空） |
| cover | string? | 封面图 URL（可为空） |
| tags | string[] | 标签列表 |
| category | string? | 分类（可为空） |
| status | string | 状态：draft / published / hidden |
| view_count | int | 浏览数 |
| like_count | int | 点赞数 |
| comment_count | int | 评论数 |
| top | bool | 是否置顶 |
| published_at | string? | 发布时间（可为空，草稿状态时无发布时间） |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

---

## 与公开接口的区别

| 特性 | 管理员接口 | 公开接口 |
|------|-----------|---------|
| 路径 | /api/v1/admin/posts | /api/v1/posts |
| 状态筛选 | 可查看所有状态 | 仅返回 published |
| 排序规则 | 置顶 + 创建时间倒序 | 置顶 + 发布时间倒序 |
| 权限 | 需要管理员登录 | 无需登录 |