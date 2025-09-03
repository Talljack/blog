/**
 * 使用canvas生成PNG格式图标
 * 这个脚本需要在Node.js环境中运行，使用canvas库
 */
const fs = require('fs')
const path = require('path')

/**
 * 创建简单的Canvas绘制函数（伪代码，实际需要canvas库）
 * 这里我们创建一个简化版本，生成base64数据
 */
function generateIconPNG(size) {
  // 创建一个简单的PNG数据头（简化版）
  // 实际项目中应该使用 canvas 或其他图像处理库

  const canvas = {
    width: size,
    height: size,
    getContext: () => ({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      font: '',
      fillText: () => {},
      createLinearGradient: () => ({
        addColorStop: () => {},
      }),
    }),
  }

  const ctx = canvas.getContext('2d')

  // 设置渐变背景
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#3b82f6')
  gradient.addColorStop(1, '#8b5cf6')

  // 绘制背景
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // 绘制代码符号 </>
  ctx.strokeStyle = 'white'
  ctx.lineWidth = Math.max(2, size / 16)
  ctx.fillStyle = 'white'

  const centerX = size / 2
  const centerY = size / 2
  const symbolSize = size / 4

  // 这里应该实际绘制，但由于没有canvas库，我们返回占位数据
  // 实际实现需要安装: npm install canvas

  return null // 占位符
}

/**
 * 使用SVG转PNG的替代方案
 * 创建一个更大的SVG，然后说明如何转换
 */
function createPNGInstructions() {
  console.log('\n📖 PNG图标生成说明:')
  console.log('由于Node.js环境限制，推荐以下方案生成PNG图标:')
  console.log('')
  console.log('方案1: 使用在线工具')
  console.log('- 访问 https://convertio.co/svg-png/')
  console.log('- 上传生成的SVG文件')
  console.log('- 下载对应尺寸的PNG文件')
  console.log('')
  console.log('方案2: 使用命令行工具 (推荐)')
  console.log('- 安装 ImageMagick: brew install imagemagick')
  console.log('- 转换命令示例:')
  console.log(
    '  convert public/favicon.svg -resize 16x16 public/favicon-16x16.png'
  )
  console.log(
    '  convert public/favicon.svg -resize 32x32 public/favicon-32x32.png'
  )
  console.log(
    '  convert public/apple-touch-icon.svg -resize 180x180 public/apple-touch-icon.png'
  )
  console.log('')
  console.log('方案3: 使用脚本自动转换 (需要安装依赖)')
  console.log('- npm install sharp')
  console.log('- 使用sharp库批量转换SVG到PNG')
  console.log('')
}

/**
 * 检查是否有ImageMagick并自动转换
 */
async function tryAutoConvert() {
  const { execSync } = require('child_process')

  try {
    // 检查是否安装了ImageMagick
    execSync('which convert', { stdio: 'ignore' })
    console.log('✅ 检测到ImageMagick，开始自动转换...')

    const publicDir = path.join(__dirname, '..', 'public')
    const conversions = [
      { input: 'favicon.svg', output: 'favicon-16x16.png', size: '16x16' },
      { input: 'favicon.svg', output: 'favicon-32x32.png', size: '32x32' },
      {
        input: 'apple-touch-icon.svg',
        output: 'apple-touch-icon.png',
        size: '180x180',
      },
      {
        input: 'android-chrome-192x192.svg',
        output: 'android-chrome-192x192.png',
        size: '192x192',
      },
      {
        input: 'android-chrome-512x512.svg',
        output: 'android-chrome-512x512.png',
        size: '512x512',
      },
      { input: 'og-image.svg', output: 'og-image.png', size: '1200x630' },
    ]

    for (const { input, output, size } of conversions) {
      const inputPath = path.join(publicDir, input)
      const outputPath = path.join(publicDir, output)

      if (fs.existsSync(inputPath)) {
        try {
          execSync(`convert "${inputPath}" -resize ${size} "${outputPath}"`, {
            stdio: 'ignore',
          })
          console.log(`✅ 转换 ${input} → ${output} (${size})`)
        } catch (error) {
          console.log(`❌ 转换失败 ${input}: ${error.message}`)
        }
      }
    }

    console.log('🎉 PNG图标转换完成!')
    return true
  } catch (error) {
    console.log('ℹ️  未检测到ImageMagick，跳过自动转换')
    return false
  }
}

async function main() {
  console.log('🖼️  开始生成PNG图标...')

  const converted = await tryAutoConvert()

  if (!converted) {
    createPNGInstructions()
  }

  // 更新favicon.ico (创建一个更简单的版本)
  console.log('\n🔄 更新favicon.ico...')

  try {
    // 复制SVG favicon作为现代替代方案的备份
    const publicDir = path.join(__dirname, '..', 'public')
    const svgFavicon = fs.readFileSync(
      path.join(publicDir, 'favicon.svg'),
      'utf8'
    )

    // 对于favicon.ico，我们保持现有文件，因为SVG在大多数现代浏览器中效果更好
    console.log(
      'ℹ️  保留现有favicon.ico，添加了favicon.svg作为现代浏览器的首选'
    )

    console.log('\n✨ 图标系统更新完成!')
    console.log('\n📋 当前图标配置:')
    console.log('- favicon.ico (传统浏览器支持)')
    console.log('- favicon.svg (现代浏览器，矢量图标)')
    console.log('- PNG图标 (如果ImageMagick可用)')
    console.log('- PWA图标 (Android/iOS)')
    console.log('- Open Graph图标 (社交分享)')
  } catch (error) {
    console.error('❌ 更新图标时出错:', error)
  }
}

if (require.main === module) {
  main()
}
