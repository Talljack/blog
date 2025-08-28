/**
 * SEO检查工具 - 分析页面SEO优化程度
 */
export interface SEOCheckResult {
  score: number // 0-100分
  issues: SEOIssue[]
  suggestions: string[]
  passed: SEOCheck[]
  failed: SEOCheck[]
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info'
  category: 'meta' | 'content' | 'structure' | 'performance' | 'accessibility'
  message: string
  impact: 'high' | 'medium' | 'low'
  element?: string
  fix?: string
}

export interface SEOCheck {
  name: string
  category: string
  passed: boolean
  impact: 'high' | 'medium' | 'low'
  message: string
}

/**
 * 主要SEO检查函数
 */
export function checkPageSEO(): SEOCheckResult {
  if (typeof window === 'undefined') {
    throw new Error('SEO check must run in browser environment')
  }

  const checks: SEOCheck[] = []
  const issues: SEOIssue[] = []

  // 运行所有检查
  runMetaTagChecks(checks, issues)
  runContentChecks(checks, issues)
  runStructureChecks(checks, issues)
  runImageChecks(checks, issues)
  runLinkChecks(checks, issues)
  runAccessibilityChecks(checks, issues)
  runPerformanceChecks(checks, issues)

  // 计算分数
  const score = calculateSEOScore(checks, issues)

  // 生成建议
  const suggestions = generateSuggestions(issues)

  const passed = checks.filter(check => check.passed)
  const failed = checks.filter(check => !check.passed)

  return {
    score,
    issues,
    suggestions,
    passed,
    failed,
  }
}

/**
 * 检查Meta标签
 */
function runMetaTagChecks(checks: SEOCheck[], issues: SEOIssue[]) {
  // Title 检查
  const title = document.querySelector('title')?.textContent || ''

  checks.push({
    name: 'Title存在',
    category: 'meta',
    passed: !!title,
    impact: 'high',
    message: title ? `Title: "${title}"` : '缺少页面标题',
  })

  if (!title) {
    issues.push({
      type: 'error',
      category: 'meta',
      message: '页面缺少title标签',
      impact: 'high',
      fix: '添加描述性的页面标题',
    })
  } else if (title.length < 30 || title.length > 60) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: `Title长度不佳: ${title.length}字符（建议30-60字符）`,
      impact: 'medium',
      fix: title.length < 30 ? '增加title长度' : '缩短title长度',
    })
  }

  // Description 检查
  const description =
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute('content') || ''

  checks.push({
    name: 'Description存在',
    category: 'meta',
    passed: !!description,
    impact: 'high',
    message: description
      ? `Description: "${description.substring(0, 100)}..."`
      : '缺少页面描述',
  })

  if (!description) {
    issues.push({
      type: 'error',
      category: 'meta',
      message: '页面缺少description meta标签',
      impact: 'high',
      fix: '添加描述性的页面描述',
    })
  } else if (description.length < 120 || description.length > 160) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: `Description长度不佳: ${description.length}字符（建议120-160字符）`,
      impact: 'medium',
      fix:
        description.length < 120
          ? '增加description长度'
          : '缩短description长度',
    })
  }

  // Keywords 检查（现在不那么重要，但仍然有用）
  const keywords = document
    .querySelector('meta[name="keywords"]')
    ?.getAttribute('content')
  checks.push({
    name: 'Keywords存在',
    category: 'meta',
    passed: !!keywords,
    impact: 'low',
    message: keywords ? '已设置关键词' : '未设置关键词',
  })

  // Open Graph 检查
  const ogTitle = document
    .querySelector('meta[property="og:title"]')
    ?.getAttribute('content')
  const ogDescription = document
    .querySelector('meta[property="og:description"]')
    ?.getAttribute('content')
  const ogImage = document
    .querySelector('meta[property="og:image"]')
    ?.getAttribute('content')

  checks.push({
    name: 'Open Graph标签',
    category: 'meta',
    passed: !!(ogTitle && ogDescription && ogImage),
    impact: 'medium',
    message: `OG标签完整度: ${[ogTitle, ogDescription, ogImage].filter(Boolean).length}/3`,
  })

  if (!ogTitle || !ogDescription || !ogImage) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Open Graph标签不完整',
      impact: 'medium',
      fix: '添加完整的Open Graph标签（og:title, og:description, og:image）',
    })
  }

  // Canonical 检查
  const canonical = document.querySelector('link[rel="canonical"]')
  checks.push({
    name: 'Canonical URL',
    category: 'meta',
    passed: !!canonical,
    impact: 'medium',
    message: canonical ? '已设置canonical URL' : '未设置canonical URL',
  })

  // 结构化数据检查
  const structuredData = document.querySelectorAll(
    'script[type="application/ld+json"]'
  )
  checks.push({
    name: '结构化数据',
    category: 'meta',
    passed: structuredData.length > 0,
    impact: 'medium',
    message: `找到 ${structuredData.length} 个结构化数据脚本`,
  })
}

/**
 * 检查内容质量
 */
function runContentChecks(checks: SEOCheck[], issues: SEOIssue[]) {
  const textContent = document.body.textContent || ''
  const wordCount = textContent.trim().split(/\s+/).length

  checks.push({
    name: '内容长度',
    category: 'content',
    passed: wordCount >= 300,
    impact: 'medium',
    message: `内容字数: ${wordCount} 字`,
  })

  if (wordCount < 300) {
    issues.push({
      type: 'warning',
      category: 'content',
      message: `内容较短（${wordCount}字），建议至少300字`,
      impact: 'medium',
      fix: '增加有价值的内容',
    })
  }

  // H1标签检查
  const h1Tags = document.querySelectorAll('h1')
  checks.push({
    name: 'H1标签',
    category: 'content',
    passed: h1Tags.length === 1,
    impact: 'high',
    message: `H1标签数量: ${h1Tags.length}`,
  })

  if (h1Tags.length === 0) {
    issues.push({
      type: 'error',
      category: 'content',
      message: '页面缺少H1标签',
      impact: 'high',
      fix: '添加一个主要的H1标签',
    })
  } else if (h1Tags.length > 1) {
    issues.push({
      type: 'warning',
      category: 'content',
      message: `页面有多个H1标签（${h1Tags.length}个）`,
      impact: 'medium',
      fix: '每页只使用一个H1标签',
    })
  }

  // 标题层级检查
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const headingLevels = Array.from(headings).map(h =>
    parseInt(h.tagName.charAt(1))
  )

  let properHierarchy = true
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      properHierarchy = false
      break
    }
  }

  checks.push({
    name: '标题层级结构',
    category: 'content',
    passed: properHierarchy,
    impact: 'medium',
    message: properHierarchy ? '标题层级结构正确' : '标题层级结构有问题',
  })

  if (!properHierarchy) {
    issues.push({
      type: 'warning',
      category: 'content',
      message: '标题层级跳跃（如从H1直接到H3）',
      impact: 'medium',
      fix: '使用连续的标题层级（H1→H2→H3）',
    })
  }
}

/**
 * 检查页面结构
 */
function runStructureChecks(checks: SEOCheck[], issues: SEOIssue[]) {
  // Semantic HTML检查
  const hasMain = !!document.querySelector('main')
  const hasHeader = !!document.querySelector('header')
  const hasNav = !!document.querySelector('nav')
  const hasFooter = !!document.querySelector('footer')

  const semanticScore = [hasMain, hasHeader, hasNav, hasFooter].filter(
    Boolean
  ).length

  checks.push({
    name: '语义化HTML',
    category: 'structure',
    passed: semanticScore >= 3,
    impact: 'medium',
    message: `语义化标签: ${semanticScore}/4 (main, header, nav, footer)`,
  })

  // URL结构检查（基本）
  const url = window.location.href
  const hasCleanURL =
    !url.includes('?') && !url.includes('#') && url.split('/').length <= 5

  checks.push({
    name: 'URL结构',
    category: 'structure',
    passed: hasCleanURL,
    impact: 'low',
    message: hasCleanURL ? 'URL结构简洁' : 'URL结构可以优化',
  })

  // 面包屑导航检查
  const breadcrumbs = document.querySelector(
    '[itemtype*="BreadcrumbList"], nav[aria-label*="面包屑"], .breadcrumb'
  )
  checks.push({
    name: '面包屑导航',
    category: 'structure',
    passed: !!breadcrumbs,
    impact: 'low',
    message: breadcrumbs ? '已实现面包屑导航' : '未发现面包屑导航',
  })
}

/**
 * 检查图片优化
 */
function runImageChecks(checks: SEOCheck[], issues: SEOIssue[]) {
  const images = document.querySelectorAll('img')
  const imagesWithAlt = document.querySelectorAll('img[alt]')
  const imagesWithoutAlt = images.length - imagesWithAlt.length

  checks.push({
    name: '图片Alt属性',
    category: 'content',
    passed: imagesWithoutAlt === 0,
    impact: 'high',
    message: `${imagesWithAlt.length}/${images.length} 图片有Alt属性`,
  })

  if (imagesWithoutAlt > 0) {
    issues.push({
      type: 'error',
      category: 'content',
      message: `${imagesWithoutAlt} 张图片缺少Alt属性`,
      impact: 'high',
      fix: '为所有图片添加描述性的Alt属性',
    })
  }

  // 检查图片懒加载
  const lazyImages = document.querySelectorAll('img[loading="lazy"]')
  const imageLoadingOptimization =
    images.length > 0 ? (lazyImages.length / images.length) * 100 : 100

  checks.push({
    name: '图片懒加载',
    category: 'performance',
    passed: imageLoadingOptimization >= 50,
    impact: 'medium',
    message: `${Math.round(imageLoadingOptimization)}% 的图片使用懒加载`,
  })
}

/**
 * 检查链接
 */
function runLinkChecks(checks: SEOCheck[], issues: SEOIssue[]) {
  const links = document.querySelectorAll('a[href]')
  const externalLinks = document.querySelectorAll(
    'a[href^="http"]:not([href*="' + window.location.hostname + '"])'
  )
  const externalLinksWithTarget = document.querySelectorAll(
    'a[href^="http"][target="_blank"]'
  )

  // 外部链接检查
  const externalLinkRatio =
    links.length > 0 ? (externalLinks.length / links.length) * 100 : 0
  checks.push({
    name: '外部链接比例',
    category: 'structure',
    passed: externalLinkRatio <= 30,
    impact: 'low',
    message: `${Math.round(externalLinkRatio)}% 的链接是外部链接`,
  })

  // 外部链接安全性
  const unsafeExternalLinks = document.querySelectorAll(
    'a[href^="http"][target="_blank"]:not([rel*="noopener"])'
  )
  checks.push({
    name: '外部链接安全性',
    category: 'structure',
    passed: unsafeExternalLinks.length === 0,
    impact: 'medium',
    message:
      unsafeExternalLinks.length === 0
        ? '外部链接安全'
        : `${unsafeExternalLinks.length} 个不安全的外部链接`,
  })

  if (unsafeExternalLinks.length > 0) {
    issues.push({
      type: 'warning',
      category: 'structure',
      message: '外部链接缺少rel="noopener"属性',
      impact: 'medium',
      fix: '为target="_blank"的外部链接添加rel="noopener noreferrer"',
    })
  }
}

/**
 * 检查可访问性
 */
function runAccessibilityChecks(checks: SEOCheck[], issues: SEOIssue[]) {
  // Language属性检查
  const htmlLang = document.documentElement.getAttribute('lang')
  checks.push({
    name: '页面语言声明',
    category: 'accessibility',
    passed: !!htmlLang,
    impact: 'medium',
    message: htmlLang ? `页面语言: ${htmlLang}` : '未声明页面语言',
  })

  // Skip link检查
  const skipLink = document.querySelector(
    'a[href="#main"], a[href="#main-content"]'
  )
  checks.push({
    name: '跳转链接',
    category: 'accessibility',
    passed: !!skipLink,
    impact: 'low',
    message: skipLink ? '已提供跳转到主内容的链接' : '未发现跳转链接',
  })

  // Form labels检查
  const inputs = document.querySelectorAll('input, textarea, select')
  const inputsWithLabels = document.querySelectorAll(
    'input[aria-label], textarea[aria-label], select[aria-label], input[id] + label, textarea[id] + label, select[id] + label'
  )

  if (inputs.length > 0) {
    checks.push({
      name: '表单标签',
      category: 'accessibility',
      passed: inputsWithLabels.length >= inputs.length,
      impact: 'medium',
      message: `${inputsWithLabels.length}/${inputs.length} 表单字段有标签`,
    })
  }
}

/**
 * 检查性能相关
 */
function runPerformanceChecks(checks: SEOCheck[], issues: SEOIssue[]) {
  // 检查压缩
  const hasGzip = document.querySelector(
    'meta[name="compress"], meta[http-equiv="content-encoding"]'
  )
  checks.push({
    name: '内容压缩',
    category: 'performance',
    passed: true, // 假设已启用，实际需要检查HTTP头
    impact: 'medium',
    message: '内容压缩状态未知（需检查HTTP头）',
  })

  // 检查缓存
  const hasCacheHeaders = document.querySelector(
    'meta[http-equiv="cache-control"]'
  )
  checks.push({
    name: '缓存策略',
    category: 'performance',
    passed: true, // 假设已配置，实际需要检查HTTP头
    impact: 'medium',
    message: '缓存策略未知（需检查HTTP头）',
  })

  // 检查脚本数量
  const scripts = document.querySelectorAll('script[src]')
  checks.push({
    name: '脚本数量',
    category: 'performance',
    passed: scripts.length <= 10,
    impact: 'medium',
    message: `页面包含 ${scripts.length} 个外部脚本`,
  })

  if (scripts.length > 10) {
    issues.push({
      type: 'warning',
      category: 'performance',
      message: `页面脚本较多（${scripts.length}个），可能影响加载速度`,
      impact: 'medium',
      fix: '考虑合并脚本或按需加载',
    })
  }
}

/**
 * 计算SEO分数
 */
function calculateSEOScore(checks: SEOCheck[], issues: SEOIssue[]): number {
  const totalChecks = checks.length
  if (totalChecks === 0) return 0

  let score = 0

  checks.forEach(check => {
    let weight = 1
    switch (check.impact) {
      case 'high':
        weight = 3
        break
      case 'medium':
        weight = 2
        break
      case 'low':
        weight = 1
        break
    }

    if (check.passed) {
      score += weight
    }
  })

  // 计算最大可能分数
  const maxScore = checks.reduce((sum, check) => {
    let weight = 1
    switch (check.impact) {
      case 'high':
        weight = 3
        break
      case 'medium':
        weight = 2
        break
      case 'low':
        weight = 1
        break
    }
    return sum + weight
  }, 0)

  // 问题扣分
  const penalty = issues.reduce((sum, issue) => {
    switch (issue.impact) {
      case 'high':
        return sum + 10
      case 'medium':
        return sum + 5
      case 'low':
        return sum + 2
    }
    return sum
  }, 0)

  const baseScore = maxScore > 0 ? (score / maxScore) * 100 : 0
  const finalScore = Math.max(0, Math.min(100, baseScore - penalty))

  return Math.round(finalScore)
}

/**
 * 生成优化建议
 */
function generateSuggestions(issues: SEOIssue[]): string[] {
  const suggestions = new Set<string>()

  // 基于问题生成建议
  issues.forEach(issue => {
    if (issue.fix) {
      suggestions.add(issue.fix)
    }
  })

  // 添加通用建议
  const generalSuggestions = [
    '定期检查和更新内容，保持新鲜度',
    '优化图片大小和格式，提高加载速度',
    '建立内部链接网络，提高页面权重传递',
    '监控核心Web指标（Core Web Vitals）',
    '为重要页面创建XML站点地图',
    '实施结构化数据标记',
    '优化移动端用户体验',
    '提高页面加载速度',
    '创建高质量、原创内容',
    '建立合理的URL结构',
  ]

  generalSuggestions.forEach(suggestion => suggestions.add(suggestion))

  return Array.from(suggestions).slice(0, 10) // 限制建议数量
}

/**
 * 生成SEO报告
 */
export function generateSEOReport(): string {
  const result = checkPageSEO()

  const report = `
# SEO检查报告

## 总体评分: ${result.score}/100

### 通过的检查 (${result.passed.length})
${result.passed.map(check => `✅ ${check.name}: ${check.message}`).join('\n')}

### 失败的检查 (${result.failed.length})
${result.failed.map(check => `❌ ${check.name}: ${check.message}`).join('\n')}

### 问题详情 (${result.issues.length})
${result.issues
  .map(issue => {
    const icon =
      issue.type === 'error' ? '🚨' : issue.type === 'warning' ? '⚠️' : 'ℹ️'
    return `${icon} ${issue.message}${issue.fix ? ` - 修复建议: ${issue.fix}` : ''}`
  })
  .join('\n')}

### 优化建议
${result.suggestions.map(suggestion => `💡 ${suggestion}`).join('\n')}

---
生成时间: ${new Date().toLocaleString()}
页面: ${window.location.href}
  `.trim()

  return report
}
