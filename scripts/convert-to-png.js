const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

/**
 * 使用Sharp库将SVG转换为PNG
 */
async function convertSvgToPng() {
  console.log('🔄 使用Sharp转换SVG到PNG...')

  const publicDir = path.join(__dirname, '..', 'public')

  const conversions = [
    {
      input: 'favicon.svg',
      outputs: [
        { file: 'favicon-16x16.png', size: 16 },
        { file: 'favicon-32x32.png', size: 32 },
      ],
    },
    {
      input: 'apple-touch-icon.svg',
      outputs: [{ file: 'apple-touch-icon.png', size: 180 }],
    },
    {
      input: 'android-chrome-192x192.svg',
      outputs: [{ file: 'android-chrome-192x192.png', size: 192 }],
    },
    {
      input: 'android-chrome-512x512.svg',
      outputs: [{ file: 'android-chrome-512x512.png', size: 512 }],
    },
    {
      input: 'og-image.svg',
      outputs: [{ file: 'og-image.png', size: { width: 1200, height: 630 } }],
    },
  ]

  try {
    for (const conversion of conversions) {
      const inputPath = path.join(publicDir, conversion.input)

      if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  跳过 ${conversion.input} (文件不存在)`)
        continue
      }

      for (const output of conversion.outputs) {
        const outputPath = path.join(publicDir, output.file)

        try {
          let sharpInstance = sharp(inputPath)

          if (typeof output.size === 'number') {
            // 正方形图标
            sharpInstance = sharpInstance.resize(output.size, output.size)
          } else {
            // 自定义尺寸 (如OG图片)
            sharpInstance = sharpInstance.resize(
              output.size.width,
              output.size.height
            )
          }

          await sharpInstance
            .png({
              quality: 95,
              compressionLevel: 6,
              palette: false, // 保持真彩色
            })
            .toFile(outputPath)

          console.log(
            `✅ 生成 ${output.file} (${typeof output.size === 'number' ? `${output.size}x${output.size}` : `${output.size.width}x${output.size.height}`})`
          )
        } catch (error) {
          console.error(
            `❌ 转换失败 ${conversion.input} → ${output.file}:`,
            error.message
          )
        }
      }
    }

    // 生成额外的PWA图标尺寸
    console.log('\n🔄 生成额外的PWA图标尺寸...')

    const pwaConversions = [
      { file: 'mstile-150x150.png', size: 150 },
      { file: 'safari-pinned-tab.svg', copyFrom: 'favicon.svg' },
    ]

    for (const pwa of pwaConversions) {
      if (pwa.copyFrom) {
        // 复制SVG文件
        const sourcePath = path.join(publicDir, pwa.copyFrom)
        const targetPath = path.join(publicDir, pwa.file)

        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, targetPath)
          console.log(`✅ 复制 ${pwa.file}`)
        }
      } else {
        // 从favicon.svg生成PNG
        const faviconPath = path.join(publicDir, 'favicon.svg')
        const outputPath = path.join(publicDir, pwa.file)

        if (fs.existsSync(faviconPath)) {
          try {
            await sharp(faviconPath)
              .resize(pwa.size, pwa.size)
              .png({ quality: 95 })
              .toFile(outputPath)

            console.log(`✅ 生成 ${pwa.file} (${pwa.size}x${pwa.size})`)
          } catch (error) {
            console.error(`❌ 生成PWA图标失败 ${pwa.file}:`, error.message)
          }
        }
      }
    }

    console.log('\n🎉 所有PNG图标生成完成!')
  } catch (error) {
    console.error('❌ 转换过程中出错:', error)
  }
}

/**
 * 更新网站配置以使用新图标
 */
function updateIconReferences() {
  console.log('\n🔄 更新图标引用配置...')

  // 更新site.webmanifest
  const publicDir = path.join(__dirname, '..', 'public')
  const manifestPath = path.join(publicDir, 'site.webmanifest')

  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

      // 更新图标路径为PNG格式
      manifest.icons = [
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
      ]

      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
      console.log('✅ 更新 site.webmanifest')
    } catch (error) {
      console.error('❌ 更新manifest失败:', error.message)
    }
  }

  console.log('\n📋 图标文件完整清单:')

  // 检查所有图标文件是否存在
  const expectedFiles = [
    'favicon.ico',
    'favicon.svg',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'mstile-150x150.png',
    'og-image.png',
    'og-image.svg',
    'safari-pinned-tab.svg',
  ]

  expectedFiles.forEach(file => {
    const filePath = path.join(publicDir, file)
    const exists = fs.existsSync(filePath)
    const size = exists ? fs.statSync(filePath).size : 0

    console.log(
      `${exists ? '✅' : '❌'} ${file} ${exists ? `(${Math.round(size / 1024)}KB)` : ''}`
    )
  })
}

async function main() {
  console.log('🎨 开始生成完整图标集...')

  await convertSvgToPng()
  updateIconReferences()

  console.log('\n✨ 图标系统完全设置完成!')
  console.log('\n💡 使用说明:')
  console.log('- 所有图标已生成为PNG格式，兼容性最佳')
  console.log('- SVG图标保留用于现代浏览器的高质量显示')
  console.log('- PWA manifest已更新，支持添加到主屏幕')
  console.log('- Open Graph图片已生成，支持社交媒体分享')
  console.log('- Microsoft Tiles配置已就绪')
}

if (require.main === module) {
  main()
}
