# API接口更新 - 主题配置管理

> 更新日期: 2026-04-10
> 新增接口: 主题配置管理

## 主题配置管理接口

所有主题配置管理接口都需要管理员权限（`role = "admin"`）

### 数据结构

#### 主题配置 (ThemeConfig)

```typescript
interface ThemeConfig {
    id: string                  // UUIDv7
    name: string                // 主题标识名称（如 "rose", "blue"）
    label: string               // 主题显示名称（如 "玫瑰粉", "蔚蓝"）
    colors: {
        bg: string              // 背景色
        primary: string         // 主色
        primary_light: string   // 主色浅色
        primary_bg: string      // 主色背景
        border: string          // 边框色
        secondary: string       // 次要色
        tag_bg: string          // 标签背景色
        tag_text: string        // 标签文字色
    }
    active: boolean             // 是否为当前激活主题
    created_at: string          // 创建时间
    updated_at: string          // 更新时间
}
```

---

### 1. 获取主题配置列表

**GET** `/api/v1/admin/themes`

**需要管理员权限**

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "string",
      "name": "rose",
      "label": "玫瑰粉",
      "colors": {
        "bg": "#fff5f5",
        "primary": "#f43f5e",
        "primary_light": "#fecdd3",
        "primary_bg": "#fff1f2",
        "border": "#fecdd3",
        "secondary": "#fb7185",
        "tag_bg": "#fce7f3",
        "tag_text": "#be185d"
      },
      "active": true,
      "created_at": "2026-04-10T12:00:00Z",
      "updated_at": "2026-04-10T12:00:00Z"
    }
  ]
}
```

---

### 2. 获取单个主题配置

**GET** `/api/v1/admin/themes/{id}`

**需要管理员权限**

**响应**: 同上单个主题配置对象

---

### 3. 创建主题配置

**POST** `/api/v1/admin/themes`

**需要管理员权限**

**请求体**:
```json
{
  "name": "string",           // 必填，主题标识（唯一）
  "label": "string",          // 必填，显示名称
  "colors": {
    "bg": "string",           // 必填
    "primary": "string",      // 必填
    "primary_light": "string", // 必填
    "primary_bg": "string",    // 必填
    "border": "string",       // 必填
    "secondary": "string",    // 必填
    "tag_bg": "string",        // 必填
    "tag_text": "string"       // 必填
  },
  "active": false             // 可选，默认false
}
```

**响应**: HTTP 201，返回创建的主题配置

**错误码**:
- `400`: 参数缺失或格式错误
- `409`: 主题名称已存在

---

### 4. 更新主题配置

**PATCH** `/api/v1/admin/themes/{id}`

**需要管理员权限**

**请求体**:
```json
{
  "name": "string",           // 可选
  "label": "string",          // 可选
  "colors": {
    "bg": "string",
    "primary": "string",
    "primary_light": "string",
    "primary_bg": "string",
    "border": "string",
    "secondary": "string",
    "tag_bg": "string",
    "tag_text": "string"
  },
  "active": false             // 可选
}
```

**响应**: 返回更新后的主题配置

---

### 5. 删除主题配置

**DELETE** `/api/v1/admin/themes/{id}`

**需要管理员权限**

**响应**: HTTP 204 No Content

**注意**: 无法删除当前激活的主题（返回 400 错误）

---

### 6. 激活主题

**PATCH** `/api/v1/admin/themes/{id}/activate`

**需要管理员权限**

将指定主题设为当前激活主题，其他主题自动取消激活。

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "name": "string",
    "active": true
  }
}
```

---

## 公开接口

### 获取当前激活主题

**GET** `/api/v1/theme`

**无需认证**

获取当前网站使用的激活主题配置。

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "name": "rose",
    "label": "玫瑰粉",
    "colors": {
      "bg": "#fff5f5",
      "primary": "#f43f5e",
      "primary_light": "#fecdd3",
      "primary_bg": "#fff1f2",
      "border": "#fecdd3",
      "secondary": "#fb7185",
      "tag_bg": "#fce7f3",
      "tag_text": "#be185d"
    }
  }
}
```

---

## 数据库表结构

```sql
-- 主题配置表
CREATE TABLE theme_configs (
    id TEXT PRIMARY KEY,              -- UUIDv7
    name TEXT NOT NULL UNIQUE,        -- 主题标识名称
    label TEXT NOT NULL,              -- 主题显示名称
    colors TEXT NOT NULL,             -- 颜色配置 JSON
    active INTEGER DEFAULT 0,         -- 是否激活: 0=否, 1=是
    created_at TEXT NOT NULL,         -- 创建时间
    updated_at TEXT NOT NULL,         -- 更新时间
    deleted_at TEXT                   -- 软删除时间戳
);

CREATE INDEX idx_theme_configs_active ON theme_configs(active) WHERE deleted_at IS NULL;
CREATE INDEX idx_theme_configs_name ON theme_configs(name) WHERE deleted_at IS NULL;
```

---

## 前端对接说明

1. 前端可通过 `/api/v1/theme` 获取当前激活主题配置
2. 管理后台通过 `/api/v1/admin/themes` 系列接口管理多个主题配置
3. 激活某个主题后，前端无需修改代码，只需调用公开接口获取新配置
4. 颜色值为 CSS 颜色字符串（如 `#f43f5e` 或 `rgb(244, 63, 94)`）