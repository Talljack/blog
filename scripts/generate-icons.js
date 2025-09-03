const fs = require('fs')
const path = require('path')

/**
 * 生成SVG格式的图标
 * 创建一个现代、专业的博客图标
 */
function generateBlogIcon(size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- 主要背景 -->
  <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad1)" filter="url(#shadow)"/>
  
  <!-- 代码符号 </> -->
  <g transform="translate(${size * 0.5}, ${size * 0.5})" fill="white" opacity="0.95">
    <!-- 左括号 < -->
    <path d="M-${size * 0.15},-${size * 0.1} L-${size * 0.25},0 L-${size * 0.15},${size * 0.1}" 
          stroke="white" stroke-width="${size * 0.02}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    
    <!-- 斜杠 / -->
    <path d="M-${size * 0.05},-${size * 0.12} L${size * 0.05},${size * 0.12}" 
          stroke="white" stroke-width="${size * 0.025}" stroke-linecap="round"/>
    
    <!-- 右括号 > -->
    <path d="M${size * 0.15},-${size * 0.1} L${size * 0.25},0 L${size * 0.15},${size * 0.1}" 
          stroke="white" stroke-width="${size * 0.02}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
  
  <!-- 装饰点 -->
  <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.02}" fill="white" opacity="0.6"/>
  <circle cx="${size * 0.2}" cy="${size * 0.8}" r="${size * 0.015}" fill="white" opacity="0.4"/>
</svg>`
}

/**
 * 创建 favicon.ico 内容（简化版）
 */
function generateFaviconData() {
  // 这里返回一个简单的ICO文件头和16x16 PNG数据
  // 在实际项目中，你可能需要使用专门的库如 `to-ico`
  const svg = generateBlogIcon(16)
  return svg // 现代浏览器支持SVG favicon
}

/**
 * 生成Web App Manifest
 */
function generateWebManifest() {
  return {
    name: '我的博客',
    short_name: '博客',
    description: '分享技术心得与生活感悟',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'technology', 'education'],
    lang: 'zh-CN',
  }
}

/**
 * 生成浏览器配置文件 browserconfig.xml
 */
function generateBrowserConfig() {
  return `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/mstile-150x150.png"/>
            <TileColor>#3b82f6</TileColor>
        </tile>
    </msapplication>
</browserconfig>`
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public')

  console.log('🎨 开始生成图标文件...')

  try {
    // 生成不同尺寸的SVG图标
    const sizes = [16, 32, 180, 192, 512]

    for (const size of sizes) {
      const svgContent = generateBlogIcon(size)
      let filename

      if (size === 16) filename = 'favicon-16x16.svg'
      else if (size === 32) filename = 'favicon-32x32.svg'
      else if (size === 180) filename = 'apple-touch-icon.svg'
      else if (size === 192) filename = 'android-chrome-192x192.svg'
      else if (size === 512) filename = 'android-chrome-512x512.svg'

      fs.writeFileSync(path.join(publicDir, filename), svgContent)
      console.log(`✅ 生成 ${filename} (${size}x${size})`)
    }

    // 生成特殊的Open Graph图片 (1200x630)
    const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="ogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#334155;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect width="1200" height="630" fill="url(#ogGrad)"/>
  
  <!-- 主标题区域 -->
  <g transform="translate(600, 315)">
    <!-- 图标 -->
    <g transform="translate(-120, -40)">
      <rect x="-40" y="-40" width="80" height="80" rx="12" fill="#3b82f6" opacity="0.9"/>
      <g fill="white" opacity="0.95">
        <path d="M-15,-10 L-25,0 L-15,10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M-5,-12 L5,12" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <path d="M15,-10 L25,0 L15,10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>
    </g>
    
    <!-- 文本 -->
    <text x="0" y="0" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="700">我的技术博客</text>
    <text x="0" y="40" text-anchor="middle" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="24" font-weight="400">分享技术心得与生活感悟</text>
  </g>
  
  <!-- 装饰元素 -->
  <circle cx="100" cy="100" r="2" fill="white" opacity="0.3"/>
  <circle cx="1100" cy="530" r="3" fill="white" opacity="0.2"/>
  <circle cx="150" cy="500" r="1.5" fill="white" opacity="0.4"/>
</svg>`

    fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogSvg)
    console.log('✅ 生成 og-image.svg (1200x630)')

    // 生成 Web App Manifest
    const manifest = generateWebManifest()
    fs.writeFileSync(
      path.join(publicDir, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2)
    )
    console.log('✅ 更新 site.webmanifest')

    // 生成 browserconfig.xml
    fs.writeFileSync(
      path.join(publicDir, 'browserconfig.xml'),
      generateBrowserConfig()
    )
    console.log('✅ 生成 browserconfig.xml')

    // 创建一个简单的 favicon.svg（现代浏览器支持）
    const faviconSvg = generateBlogIcon(32)
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg)
    console.log('✅ 生成 favicon.svg')

    console.log('\n🎉 所有图标文件生成完成!')
    console.log('\n📝 生成的文件:')
    console.log('- favicon.svg (现代浏览器)')
    console.log('- favicon-16x16.svg, favicon-32x32.svg')
    console.log('- apple-touch-icon.svg (180x180)')
    console.log('- android-chrome-192x192.svg, android-chrome-512x512.svg')
    console.log('- og-image.svg (1200x630 Open Graph)')
    console.log('- site.webmanifest (PWA配置)')
    console.log('- browserconfig.xml (Microsoft配置)')

    console.log('\n💡 提示: 这些是SVG格式的图标，现代且高质量。')
    console.log('如需PNG格式，可以使用在线工具转换或添加转换脚本。')
  } catch (error) {
    console.error('❌ 生成图标时出错:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  generateBlogIcon,
  generateWebManifest,
  generateBrowserConfig,
}
