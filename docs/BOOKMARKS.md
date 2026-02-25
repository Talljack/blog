# X 推文收藏功能使用指南

## 功能概述

这个功能允许你从 X (Twitter) 收藏推文到你的博客系统中，支持标签、笔记、搜索和导出等功能。

## 快速开始

### 1. 访问收藏页面

访问 `/bookmarks` 查看你的所有推文收藏（需要管理员登录）。

### 2. 设置 Bookmarklet

1. 访问 `/bookmarks/save`
2. 将页面上的"保存到博客"按钮拖拽到浏览器书签栏
3. 在任何 X 推文页面点击这个书签，即可快速保存

### 3. 手动添加推文

1. 访问 `/bookmarks/save`
2. 输入推文 URL
3. 添加标签和笔记（可选）
4. 选择是否公开显示
5. 点击保存

## 功能特性

### 标签系统

- 为每条推文添加多个标签（用逗号分隔）
- 点击标签快速筛选相关推文
- 标签会自动显示在筛选栏中

### 笔记功能

- 为每条推文添加个人笔记
- 支持 Markdown 格式
- 笔记内容可以被搜索

### 搜索和筛选

- 全文搜索：搜索推文内容、标签和笔记
- 标签筛选：点击标签查看相关推文
- 组合筛选：同时使用搜索和标签筛选

### 公开/私有

- 每条推文可以设置为公开或私有
- 公开的推文会显示在 `/bookmarks/public` 页面
- 私有推文只有管理员可以看到

### 导出功能

支持两种导出格式：

1. **JSON 格式**：包含完整的推文数据
2. **Markdown 格式**：按标签分组的可读格式

## 认证说明

### 管理员访问

需要在 `.env.local` 中配置管理员账号：

```env
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
```

### 访问方式

支持三种认证方式：

1. **URL 参数**：`/bookmarks?username=admin&password=xxx`
2. **Authorization Header**：`Authorization: Basic base64(username:password)`
3. **开发环境**：如果未设置管理员账号，开发环境自动允许访问

## API 端点

### GET /api/bookmarks

获取推文列表

**参数：**
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 20，最大 100）
- `tag`: 按标签筛选
- `q`: 搜索关键词
- `public`: 只获取公开推文（true/false）

**响应：**
```json
{
  "tweets": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### POST /api/bookmarks

保存新推文

**请求体：**
```json
{
  "url": "https://x.com/username/status/123456789",
  "tags": ["技术", "AI"],
  "notes": "很有启发的推文",
  "isPublic": false
}
```

### GET /api/bookmarks/[id]

获取单条推文详情

### PATCH /api/bookmarks/[id]

更新推文

**请求体：**
```json
{
  "tags": ["新标签"],
  "notes": "更新的笔记",
  "isPublic": true
}
```

### DELETE /api/bookmarks/[id]

删除推文

### GET /api/bookmarks/tags

获取所有标签列表

### GET /api/bookmarks/export

导出所有推文

**参数：**
- `format`: 导出格式（json 或 markdown）

## 数据存储

### Vercel 环境（生产环境）

使用 Upstash Redis 存储：

- `tweet:{id}` - 推文数据（Hash）
- `tweets:all` - 所有推文 ID（Sorted Set，按时间排序）
- `tweets:tag:{tag}` - 按标签索引（Set）
- `tweets:public` - 公开推文 ID（Set）
- `tweets:tags:all` - 所有标签（Set）

### 本地开发环境

使用文件存储：`data/bookmarks.json`

## 技术实现

### 前端

- **Next.js 15** - App Router
- **React 19** - 客户端组件
- **Tailwind CSS** - 样式
- **X Platform Widgets** - 推文嵌入

### 后端

- **Next.js API Routes** - RESTful API
- **Upstash Redis** - 数据存储
- **Zod** - 数据验证
- **TypeScript** - 类型安全

## 故障排除

### 推文无法显示

1. 检查推文 URL 是否正确
2. 确认推文未被删除或账号未被封禁
3. 检查网络连接，X 嵌入组件需要加载外部资源

### 无法保存推文

1. 检查是否已登录（管理员账号）
2. 确认推文 URL 格式正确
3. 查看浏览器控制台的错误信息

### Bookmarklet 不工作

1. 确认在 X 推文页面使用
2. 检查浏览器是否阻止弹窗
3. 尝试手动复制链接到保存页面

## 未来改进

- [ ] 批量操作（批量删除、批量修改标签）
- [ ] 推文截图保存（防止推文被删除）
- [ ] 推文统计面板
- [ ] RSS 订阅公开推文
- [ ] 推文分类（文件夹功能）
- [ ] 与博客文章关联
