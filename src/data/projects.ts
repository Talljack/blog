export type Project = {
  name: string
  eyebrow: string
  description: string
  href: string
  productHref?: string
  productLabel?: string
  signal: string
  stack: string[]
  accent: 'lime' | 'amber' | 'sky'
}

export const featuredProjects: Project[] = [
  {
    name: 'EchoType',
    eyebrow: 'AI × LANGUAGE LEARNING',
    description:
      '把文章、视频和音频变成听、说、读、写一体的英语练习。支持 AI 导师、发音评分、CEFR 分级与间隔复习，也提供轻量桌面端。',
    href: 'https://github.com/Talljack/echo-type',
    productHref: 'https://echo-type.app',
    productLabel: '立即体验',
    signal: '200+ GitHub Stars',
    stack: ['Next.js', 'Tauri', 'AI SDK', 'Supabase'],
    accent: 'lime',
  },
  {
    name: 'WhereMyMoney',
    eyebrow: 'SUBSCRIPTION INTELLIGENCE',
    description:
      '集中追踪订阅服务、续费日期与多币种支出，通过智能提醒、可视化分析、年度报告和 AI 财务助手，看清每一笔周期性开销。',
    href: 'https://github.com/Talljack/subscription-manage-community',
    productHref: 'https://www.wheremymoney.pro',
    productLabel: '管理我的订阅',
    signal: 'Tracking · Reminders · Analytics',
    stack: ['Next.js', 'PostgreSQL', 'Stripe', 'AI Assistant'],
    accent: 'sky',
  },
  {
    name: 'Menu Hub',
    eyebrow: 'NATIVE macOS UTILITY',
    description:
      '原生 macOS 菜单栏管理器，用键盘快速搜索、分组和唤起菜单栏项目。仅使用公开系统 API，不需要录屏权限、账号或云服务。',
    href: 'https://github.com/Talljack/menu-hub',
    productHref: 'https://github.com/Talljack/menu-hub/releases/latest',
    productLabel: '下载最新版',
    signal: 'Swift 6 · 10 种语言',
    stack: ['SwiftUI', 'AppKit', 'macOS 14+', 'Local-first'],
    accent: 'amber',
  },
]

export const openSourceProjects = [
  {
    name: 'Agent Skills',
    description:
      '面向 Codex、Claude Code、OpenCode、Gemini CLI 等工具的可复用工作流。',
    href: 'https://github.com/Talljack/skills',
    meta: 'AGENTS',
  },
  {
    name: 'content-manager-mcp',
    description: '处理 Markdown、生成文档和搜索笔记的 MCP Server。',
    href: 'https://github.com/Talljack/content-manager-mcp',
    meta: 'MCP',
  },
  {
    name: 'vue3-hotKey',
    description: '为 Vue 3 应用提供类型友好的键盘快捷键组合式 API。',
    href: 'https://github.com/Talljack/vue3-hotKey',
    meta: '31 STARS',
  },
  {
    name: 'vscode-auto-space',
    description: '自动处理中英文之间的空格，让混排文本更易读。',
    href: 'https://marketplace.visualstudio.com/items?itemName=talljack.vscode-auto-space',
    meta: 'VS CODE',
  },
  {
    name: 'unplugin-remove',
    description: '在构建阶段移除 console、debugger 等不需要的代码。',
    href: 'https://github.com/Talljack/unplugin-remove',
    meta: 'UNPLUGIN',
  },
  {
    name: 'daily-code-stats',
    description: '通过 GitHub Action 自动记录每日代码增删统计。',
    href: 'https://github.com/Talljack/daily-code-stats',
    meta: 'AUTOMATION',
  },
]
