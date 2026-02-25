---
name: X Tweet Bookmarks Feature
overview: 为博客系统添加 X 推文收藏功能，支持通过 Bookmarklet 快速保存推文，使用 X 嵌入组件显示，并提供标签、笔记、搜索和导出功能。
todos:
  - id: setup-data-model
    content: 创建 TypeScript 类型定义和 Zod schema
    status: completed
  - id: redis-storage
    content: 实现 Redis 存储层（CRUD 操作）
    status: completed
  - id: bookmarklet
    content: 创建 Bookmarklet 和保存对话框页面
    status: completed
  - id: api-routes
    content: 实现所有 API 路由（保存、获取、更新、删除）
    status: completed
  - id: auth-middleware
    content: 添加认证中间件保护私有路由
    status: completed
  - id: list-page
    content: 创建推文列表页面（/bookmarks）
    status: completed
  - id: tweet-card
    content: 实现 TweetCard 组件（集成 X 嵌入 API）
    status: completed
  - id: tags-notes
    content: 实现标签和笔记功能
    status: completed
  - id: search-filter
    content: 实现搜索和筛选功能
    status: completed
  - id: public-page
    content: 创建公开推文页面（/bookmarks/public）
    status: completed
  - id: export-feature
    content: 实现导出功能（JSON 和 Markdown）
    status: completed
  - id: navigation-update
    content: 更新导航配置，添加收藏入口
    status: completed
isProject: false
---

# X 推文收藏功能设计方案

## 方案选择：Bookmarklet + X Embed

### 为什么选择这个方案？

**Bookmarklet 方案的优势：**

- **最简单** - 无需开发浏览器插件，只需拖拽一个书签到书签栏
- **跨浏览器** - 所有现代浏览器都支持
- **零安装** - 不需要从 Chrome/Firefox 商店安装
- **快速实现** - 只需一段 JavaScript 代码

**X Embed 组件的优势：**

- **完整显示** - 保留推文的原始样式、图片、视频、投票等所有内容
- **实时更新** - 如果推文内容被编辑，会自动更新
- **简单存储** - 只需存储推文 URL，不需要抓取和存储大量数据
- **官方支持** - 使用 X 官方的嵌入 API，稳定可靠

**对比其他方案：**

- ❌ **浏览器插件** - 开发复杂，需要发布到商店，审核周期长
- ❌ **API 同步** - X API 现在需要付费，且有严格的限制
- ❌ **分享链接** - 需要手动复制粘贴，体验不够流畅
- ❌ **快照存储** - 需要抓取大量数据，存储成本高，且可能违反 X 的服务条款

## 系统架构

### 数据模型

使用 Upstash Redis 存储推文数据，结构如下：

```typescript
interface Tweet {
  id: string                    // 推文唯一 ID
  url: string                   // 推文完整 URL
  tweetId: string              // X 推文 ID (从 URL 提取)
  authorUsername: string       // 作者用户名
  savedAt: string              // 保存时间 (ISO 8601)
  tags: string[]               // 标签数组
  notes: string                // 个人笔记
  isPublic: boolean            // 是否公开显示
  metadata?: {                 // 可选的元数据
    authorName?: string
    text?: string              // 推文文本预览（用于搜索）
  }
}
```

**Redis 存储策略：**

- `tweets:all` - Sorted Set，按时间排序的所有推文 ID
- `tweet:{id}` - Hash，存储单条推文的完整数据
- `tweets:tag:{tag}` - Set，按标签索引的推文 ID
- `tweets:public` - Set，公开推文的 ID 集合

### 前端架构

#### 1. Bookmarklet 实现

创建一个可拖拽的书签，点击后弹出保存对话框：

```javascript
javascript:(function(){
  const url = window.location.href;
  const match = url.match(/twitter\.com\/(\w+)\/status\/(\d+)|x\.com\/(\w+)\/status\/(\d+)/);
  if (!match) {
    alert('请在 X (Twitter) 推文页面使用此书签');
    return;
  }
  const username = match[1] || match[3];
  const tweetId = match[2] || match[4];

  // 打开保存对话框
  window.open(
    'https://talljack.me/bookmarks/save?url=' + encodeURIComponent(url),
    'SaveTweet',
    'width=500,height=600'
  );
})();
```

#### 2. 页面结构

新增以下路由：

- `/bookmarks` - 推文收藏列表页（需登录）
- `/bookmarks/save` - 保存推文的弹窗页面
- `/bookmarks/public` - 公开的推文收藏（所有人可见）
- `/bookmarks/[id]` - 单条推文详情页

#### 3. UI 组件

**主要组件：**

- `TweetCard` - 推文卡片，使用 X 的嵌入组件
- `TweetList` - 推文列表，支持筛选和搜索
- `SaveTweetDialog` - 保存推文的对话框
- `TweetFilters` - 标签筛选和搜索栏
- `BookmarkletButton` - 生成 Bookmarklet 的按钮

**X 嵌入组件集成：**
使用 `react-twitter-embed` 或直接使用 X 的嵌入脚本：

```typescript
// 使用 X 官方嵌入 API
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://platform.twitter.com/widgets.js';
  script.async = true;
  document.body.appendChild(script);
}, []);

// 渲染推文
<blockquote className="twitter-tweet">
  <a href={tweetUrl}></a>
</blockquote>
```

### 后端 API 设计

#### API 路由

1. `**POST /api/bookmarks**` - 保存推文
  - 需要认证
  - 验证推文 URL 格式
  - 提取推文 ID 和作者信息
  - 存储到 Redis
2. `**GET /api/bookmarks**` - 获取推文列表
  - 支持分页 (`page`, `limit`)
  - 支持标签筛选 (`tag`)
  - 支持搜索 (`q`)
  - 支持公开/私有筛选 (`public`)
3. `**GET /api/bookmarks/[id]**` - 获取单条推文
4. `**PATCH /api/bookmarks/[id]**` - 更新推文
  - 更新标签、笔记、公开状态
5. `**DELETE /api/bookmarks/[id]**` - 删除推文
6. `**GET /api/bookmarks/export**` - 导出推文
  - 支持 JSON、Markdown 格式
  - 包含推文 URL、标签、笔记

#### 认证机制

复用现有的 admin 认证：

- 使用 Next.js middleware 保护 `/bookmarks` 路由
- 使用 HTTP Basic Auth 或 Session Cookie
- 公开页面 `/bookmarks/public` 不需要认证

### 功能实现细节

#### 1. 标签系统

- 添加推文时可以输入多个标签（逗号分隔）
- 标签自动补全（基于已有标签）
- 标签云展示（显示最常用的标签）
- 点击标签快速筛选

#### 2. 笔记功能

- Markdown 格式的笔记
- 支持实时预览
- 笔记内容可搜索

#### 3. 搜索功能

使用 Redis 的全文搜索或在内存中搜索：

- 搜索推文文本（如果有元数据）
- 搜索标签
- 搜索笔记内容

#### 4. 导出功能

**Markdown 格式：**

```markdown
# 我的 X 推文收藏

## [标签名]

### [推文标题/作者]
- URL: [推文链接]
- 保存时间: 2026-02-24
- 标签: tag1, tag2
- 笔记: 我的笔记内容
```

**JSON 格式：**

```json
{
  "tweets": [
    {
      "id": "...",
      "url": "...",
      "tags": ["tag1", "tag2"],
      "notes": "...",
      "savedAt": "2026-02-24T..."
    }
  ]
}
```

## 导航集成

在 `[src/lib/config.ts](src/lib/config.ts)` 中添加新的导航项：

```typescript
navigation: [
  { name: '博客', href: '/blog' },
  { name: '课程', href: '/course' },
  { name: '模板', href: '/template' },
  { name: '收藏', href: '/bookmarks' },  // 新增
  { name: '关于', href: '/about' },
]
```

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS
- **数据库**: Upstash Redis (已有)
- **认证**: HTTP Basic Auth / Session
- **X 嵌入**: X Platform Widgets API
- **类型安全**: TypeScript + Zod 验证

## 实现优先级

### Phase 1: MVP (最小可行产品)

1. 基础数据模型和 Redis 存储
2. Bookmarklet 实现
3. 保存推文 API
4. 简单的列表页面（使用 X 嵌入组件）
5. 基础认证保护

### Phase 2: 核心功能

1. 标签系统
2. 笔记功能
3. 公开/私有切换
4. 搜索功能

### Phase 3: 增强功能

1. 导出功能
2. 标签自动补全
3. 批量操作（批量删除、批量修改标签）
4. 统计面板（收藏数量、最常用标签等）

## 成本和性能考虑

**存储成本：**

- 每条推文约 500 bytes（URL + 元数据）
- 1000 条推文 ≈ 500 KB
- Upstash Redis 免费套餐足够使用

**性能优化：**

- 推文列表分页（每页 20 条）
- X 嵌入组件懒加载
- Redis 缓存热门标签
- 使用 Next.js ISR 缓存公开页面

## 潜在问题和解决方案

**问题1：X 嵌入组件加载慢**

- 解决：使用骨架屏占位
- 解决：提供"仅链接"模式

**问题2：推文被删除或账号被封**

- 解决：嵌入组件会显示"推文不可用"
- 解决：可选择性保存推文截图（未来功能）

**问题3：隐私和版权**

- 解决：使用官方嵌入 API，符合 X 的服务条款
- 解决：私有推文默认不公开

## 替代方案考虑

如果未来需要更强大的功能，可以考虑：

- 集成 Notion、Obsidian 等笔记工具
- 使用专门的书签管理服务（如 Raindrop.io）
- 开发完整的浏览器插件

但对于当前需求，Bookmarklet + X Embed 是最佳平衡点。
