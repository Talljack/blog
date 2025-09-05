# 📧 博客邮件订阅功能文档

## 功能概述

邮件订阅功能允许读者订阅你的博客，当有新文章发布时（且标记为发送newsletter），系统会自动发送邮件通知给所有订阅者。

## 核心特性

- ✅ 订阅者管理（基于 Upstash Redis）
- ✅ 欢迎邮件自动发送
- ✅ 优雅的取消订阅流程
- ✅ 精美的邮件模板
- ✅ 批量邮件发送
- ✅ 发送历史记录
- ✅ 多种订阅表单样式

## 环境配置

### 必需的环境变量

在 `.env.local` 文件中添加以下配置：

```env
# Resend 邮件服务
RESEND_API_KEY=your-resend-api-key

# 邮件发送地址
EMAIL_FROM="你的博客名称 <noreply@your-domain.com>"

# Newsletter 发送认证密钥
NEWSLETTER_AUTH_KEY=your-secret-newsletter-key

# Upstash Redis 数据库
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 获取 Resend API Key

1. 访问 [Resend](https://resend.com)
2. 注册账户并验证域名
3. 在 API Keys 页面创建新的 API Key
4. 将 API Key 添加到环境变量

### 获取 Upstash Redis 配置

1. 访问 [Upstash](https://upstash.com)
2. 创建新的 Redis 数据库
3. 在数据库详情页面获取 REST URL 和 Token
4. 将配置添加到环境变量

## 使用方法

### 1. 在文章中启用 Newsletter

在 Markdown 文件的 frontmatter 中添加 `newsletter: true`：

```yaml
---
title: '你的文章标题'
description: '文章描述'
date: '2024-01-01'
tags: ['tag1', 'tag2']
newsletter: true # 启用newsletter发送
---
```

### 2. 订阅表单集成

Newsletter 组件已经集成在首页，支持三种显示模式：

```tsx
// 默认卡片模式（首页使用）
<Newsletter
  variant="card"
  title="订阅我的博客"
  description="获取最新技术文章推送"
/>

// 紧凑模式（侧边栏使用）
<Newsletter variant="minimal" />

// 完整模式（独立页面使用）
<Newsletter />
```

### 3. 发送 Newsletter

使用命令行工具发送：

```bash
# 发送特定文章的newsletter
npm run newsletter:send hello-world

# 带自定义预览文本
npm run newsletter:send hello-world "这是我的新文章预览..."

# 查看帮助
npm run newsletter:help
```

## API 端点

### 订阅相关

- `POST /api/newsletter/subscribe` - 新用户订阅
- `DELETE /api/newsletter/subscribe?email=xxx` - 取消订阅（通过邮箱）
- `GET /api/newsletter/subscribe` - 获取订阅者统计

### 邮件发送

- `POST /api/newsletter/send` - 发送newsletter
- `GET /api/newsletter/send` - 获取发送历史

### 取消订阅

- `GET /api/newsletter/unsubscribe?token=xxx` - 通过token取消订阅

## 邮件模板

### 欢迎邮件

新用户订阅后自动发送，包含：

- 欢迎信息
- 博客介绍
- 查看最新文章链接
- 取消订阅链接

### Newsletter 邮件

新文章发布时发送，包含：

- 文章标题和描述
- 文章标签
- 内容预览
- 阅读全文链接
- 取消订阅链接

## 订阅者管理

所有订阅者数据存储在 Upstash Redis 中：

```typescript
// 订阅者数据结构
{
  email: string,
  subscribedAt: string,
  unsubscribeToken: string,
  active: boolean
}
```

### 获取统计信息

```bash
curl https://your-domain.com/api/newsletter/subscribe
```

### 发送历史

```bash
curl https://your-domain.com/api/newsletter/send
```

## 安全考虑

1. **认证密钥**: Newsletter 发送需要 `NEWSLETTER_AUTH_KEY` 认证
2. **邮箱验证**: 严格的邮箱格式验证
3. **重复订阅**: 防止同一邮箱重复订阅
4. **取消订阅**: 每个订阅者都有唯一的取消订阅token
5. **隐私保护**: 不在响应中暴露订阅者邮箱

## 故障排除

### 常见问题

**Q: 邮件发送失败**
A: 检查 Resend API Key 是否正确，域名是否已验证

**Q: 订阅者数据丢失**
A: 检查 Upstash Redis 连接配置

**Q: 取消订阅链接无效**
A: 确保环境变量 `NEXT_PUBLIC_SITE_URL` 设置正确

### 调试技巧

1. 检查服务器日志中的错误信息
2. 验证所有环境变量是否正确设置
3. 测试 Redis 连接和 Resend API
4. 确保网站可以正常访问

## 最佳实践

1. **内容质量**: 确保newsletter内容有价值
2. **发送频率**: 不要过于频繁发送，尊重订阅者时间
3. **取消订阅**: 提供简单的取消订阅流程
4. **隐私保护**: 严格保护订阅者隐私信息
5. **邮件设计**: 使用响应式邮件模板，确保各种设备兼容

## 扩展功能

可以考虑添加的功能：

- [ ] 订阅者分组管理
- [ ] 邮件模板编辑器
- [ ] A/B 测试功能
- [ ] 高级统计分析
- [ ] 自动化邮件序列
- [ ] 社交媒体集成

## 支持

如果遇到问题，请检查：

1. 环境变量配置
2. Resend 和 Upstash 服务状态
3. 网络连接和域名解析
4. 日志文件中的错误信息
