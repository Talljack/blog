# 我的博客

一个使用 Next.js 15、TypeScript 和 Tailwind CSS 构建的现代化博客系统。

## 功能特性

- ✅ 基于 Next.js 15 和 App Router
- ✅ 完整的 TypeScript 支持
- ✅ Tailwind CSS 样式系统
- ✅ Markdown/MDX 文章支持
- ✅ 响应式设计
- ✅ 暗色模式切换
- ✅ SEO 优化
- ✅ 静态生成 (SSG)
- ✅ 文章标签系统
- ✅ 阅读时间估算

## 技术栈

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: Markdown with Gray Matter
- **Icons**: Lucide React
- **Fonts**: Inter & JetBrains Mono

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
├── src/
│   ├── app/                 # App Router 页面
│   │   ├── blog/           # 博客相关页面
│   │   ├── about/          # 关于页面
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   ├── components/         # React 组件
│   │   ├── Header.tsx      # 导航栏
│   │   ├── Footer.tsx      # 页脚
│   │   ├── BlogCard.tsx    # 博客卡片
│   │   └── ThemeProvider.tsx # 主题提供者
│   ├── content/           # 内容文件
│   │   └── blog/          # 博客文章 (Markdown)
│   └── lib/               # 工具库
│       ├── blog.ts        # 博客数据处理
│       ├── config.ts      # 站点配置
│       └── utils.ts       # 工具函数
├── public/                # 静态资源
├── tailwind.config.ts     # Tailwind 配置
├── tsconfig.json         # TypeScript 配置
└── next.config.js        # Next.js 配置
```

## 创建新文章

在 `src/content/blog/` 目录下创建新的 Markdown 文件：

```markdown
---
title: "文章标题"
description: "文章描述"
date: "2024-01-01"
tags: ["标签1", "标签2"]
featured: true
author: "作者名"
---

# 文章内容

这里写文章的正文内容...
```

## 自定义配置

编辑 `src/lib/config.ts` 文件来自定义站点信息：

```typescript
export const siteConfig = {
  name: '你的博客名称',
  description: '博客描述',
  url: 'https://your-domain.com',
  author: {
    name: '你的名字',
    bio: '你的简介',
    social: {
      twitter: 'https://twitter.com/username',
      github: 'https://github.com/username',
      email: 'your-email@example.com',
    },
  },
  // ... 更多配置
}
```

## 部署

### Vercel 部署

这个项目针对 Vercel 部署进行了优化：

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 上导入项目
3. 配置自定义域名（可选）

### 其他平台

也可以部署到其他支持 Next.js 的平台：

- **Netlify**: 使用 `@netlify/plugin-nextjs`
- **Railway**: 支持零配置部署
- **Heroku**: 需要配置 Node.js 环境

## 开发指南

### 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 遵循 TypeScript 严格模式
- 使用语义化的提交信息

### 添加新功能

1. 创建对应的组件或页面
2. 更新类型定义
3. 添加相应的测试
4. 更新文档

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎提交 Issue 和 Pull Request！

---

如果这个项目对你有帮助，请考虑给它一个 ⭐️