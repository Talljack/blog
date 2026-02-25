# X 推文收藏功能 - 快速开始

## 🎉 功能已实现！

你的博客现在已经具备完整的 X (Twitter) 推文收藏功能。

## 🚀 立即开始使用

### 1. 启动开发服务器

```bash
pnpm run dev
```

### 2. 访问收藏页面

打开浏览器访问：`http://localhost:3000/bookmarks`

### 3. 设置 Bookmarklet

1. 访问 `http://localhost:3000/bookmarks/save`
2. 将页面上的蓝色按钮"保存到博客"拖拽到浏览器书签栏
3. 在任何 X 推文页面点击这个书签，即可快速保存

### 4. 手动添加推文

1. 访问 `http://localhost:3000/bookmarks/save`
2. 粘贴推文链接（例如：`https://x.com/username/status/123456789`）
3. 添加标签（用逗号分隔）
4. 添加笔记
5. 选择是否公开
6. 点击保存

## 📱 功能特性

- ✅ **Bookmarklet 一键保存** - 在 X 上直接保存推文
- ✅ **标签系统** - 为推文添加多个标签
- ✅ **笔记功能** - 添加个人想法和笔记
- ✅ **搜索筛选** - 全文搜索和标签筛选
- ✅ **公开分享** - 选择性公开推文收藏
- ✅ **导出功能** - 导出为 JSON 或 Markdown
- ✅ **X 嵌入显示** - 完整显示推文内容（图片、视频等）
- ✅ **深色模式** - 自动适配深色主题

## 🔐 认证说明

### 开发环境

在开发环境中，如果没有设置管理员账号，系统会自动允许访问所有功能。

### 生产环境

在 `.env.local` 中设置管理员账号：

```env
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
```

访问时使用以下方式之一：

1. URL 参数：`/bookmarks?username=admin&password=xxx`
2. HTTP Basic Auth（浏览器会提示输入）

## 📂 页面路由

- `/bookmarks` - 主收藏页面（需认证）
- `/bookmarks/public` - 公开收藏页面（无需认证）
- `/bookmarks/save` - 保存推文页面

## 🎨 导航更新

导航栏已自动添加"收藏"链接，位于"模板"和"关于"之间。

## 📊 数据存储

### 本地开发

数据保存在 `data/bookmarks.json` 文件中。

### 生产环境

使用 Upstash Redis 存储，需要配置：

```env
KV_REST_API_URL=your_redis_url
KV_REST_API_TOKEN=your_redis_token
```

## 🛠️ 技术实现

- **前端**: Next.js 15 + React 19 + TypeScript
- **样式**: Tailwind CSS（支持深色模式）
- **数据库**: Upstash Redis（生产）/ JSON 文件（开发）
- **验证**: Zod
- **嵌入**: X Platform Widgets API

## 📚 详细文档

- [使用指南](docs/BOOKMARKS.md) - 完整的功能说明和 API 文档
- [实现总结](docs/IMPLEMENTATION_SUMMARY.md) - 技术实现细节

## 🐛 故障排除

### 推文无法显示？

1. 确认推文 URL 格式正确
2. 检查推文是否被删除
3. 确认网络可以访问 X 的服务

### 无法保存推文？

1. 检查是否已登录（开发环境自动登录）
2. 确认推文 URL 格式：`https://x.com/username/status/123456789`
3. 查看浏览器控制台的错误信息

### Bookmarklet 不工作？

1. 确认在 X 推文页面使用
2. 检查浏览器是否阻止弹窗
3. 尝试手动复制链接到保存页面

## 🎯 下一步

1. **测试功能** - 保存几条推文试试
2. **自定义样式** - 根据需要调整 UI
3. **配置认证** - 在生产环境设置管理员账号
4. **部署上线** - 部署到 Vercel 并配置 Redis

## 💡 使用建议

1. **标签规范** - 建立一套标签体系（如：技术、设计、灵感等）
2. **定期整理** - 定期回顾和整理收藏
3. **导出备份** - 定期导出数据作为备份
4. **分享精选** - 将有价值的推文设为公开分享

## 🤝 需要帮助？

查看详细文档：
- [docs/BOOKMARKS.md](docs/BOOKMARKS.md)
- [docs/IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md)

祝使用愉快！🎊
