# API 接口更新 - 图片管理与翻译

> 更新日期：2026/04/08

---

## 新增接口

### 翻译接口（管理员）

**POST /api/v1/admin/translate**

权限：管理员

调用百度翻译 API，将中文翻译为英文，并转换为 slug 格式（小写 + 连字符）。

**请求：**
```json
{
  "text": "测试文章标题"
}
```

**响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "translated": "test-article-title"
  }
}
```

---

### 上传回调接口（管理员）

**POST /api/v1/admin/upload/callback**

权限：管理员

用于管理员上传图片成功后回调记录文件信息。

**请求：**
```json
{
  "key": "cover/abc123.jpg",
  "original_filename": "my-image.jpg",
  "file_size": 12345,
  "mime_type": "image/jpeg",
  "file_type": "cover"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | 是 | 七牛云文件 key |
| original_filename | string | 是 | 原始文件名 |
| file_size | int | 是 | 文件大小（字节） |
| mime_type | string | 是 | MIME 类型 |
| file_type | string | 是 | 文件类型：cover / markdown / gallery |

**响应：** 201
```json
{
  "code": 0,
  "message": "created",
  "data": {
    "id": "012345...",
    "url": "https://cdn.example.com/cover/abc123.jpg",
    "key": "cover/abc123.jpg",
    "original_filename": "my-image.jpg",
    "file_size": 12345,
    "mime_type": "image/jpeg",
    "file_type": "cover",
    "created_at": "2026-04-08T10:00:00Z"
  }
}
```

---

### 获取已上传文件列表（管理员）

**GET /api/v1/admin/files**

权限：管理员

获取管理员上传的可复用图片列表（排除用户头像）。

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file_type | string | 否 | 筛选类型：cover / markdown / gallery |
| page | int | 否 | 页码，默认 1 |
| per_page | int | 否 | 每页数量，默认 20，最大 50 |

**响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "012345...",
        "url": "https://cdn.example.com/cover/abc.jpg",
        "key": "cover/abc.jpg",
        "original_filename": "my-image.jpg",
        "file_size": 12345,
        "mime_type": "image/jpeg",
        "file_type": "cover",
        "created_at": "2026-04-08T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

---

## 流程说明

### 用户上传头像
```
1. 用户请求 POST /api/v1/upload (type=avatar)
2. 前端获取凭证后直传七牛云
3. 前端直接使用返回的 URL 更新用户资料
4. 不需要回调后端记录
```

### 管理员上传图片
```
1. 管理员请求 POST /api/v1/admin/upload (type=cover/markdown/gallery)
2. 前端获取凭证后直传七牛云
3. 上传成功后调用 POST /api/v1/admin/upload/callback 记录
4. 后端写入 uploaded_files 表
```

---

## 文件类型说明

| file_type | 说明 | 上传者 | 是否记录 |
|-----------|------|--------|---------|
| avatar | 用户头像 | 用户 | ❌ 不记录 |
| cover | 文章封面 | 管理员 | ✅ 记录 |
| markdown | Markdown 图片 | 管理员 | ✅ 记录 |
| gallery | 相册图片 | 管理员 | ✅ 记录 |