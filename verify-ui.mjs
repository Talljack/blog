import { chromium } from '@playwright/test';

console.log('=== 启动 Chrome 浏览器进行 UI 测试 ===\n');

const browser = await chromium.launch({
  headless: false, // 显示浏览器窗口
  devtools: true,  // 自动打开 DevTools
  slowMo: 500      // 放慢操作速度以便观察
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
});

const page = await context.newPage();

try {
  // 测试 1: 访问主页并检查导航
  console.log('✓ 测试 1: 访问主页并检查导航');
  await page.goto('http://localhost:3001');
  await page.waitForLoadState('networkidle');
  
  const bookmarksLink = await page.locator('nav a:has-text("收藏")');
  const isVisible = await bookmarksLink.isVisible();
  console.log(`  - 导航栏包含"收藏"链接: ${isVisible ? '✅' : '❌'}`);
  
  if (!isVisible) {
    throw new Error('导航栏未找到"收藏"链接');
  }
  
  await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });
  console.log('  - 截图已保存: screenshots/01-homepage.png\n');

  // 测试 2: 访问公开收藏页面
  console.log('✓ 测试 2: 访问公开收藏页面');
  await bookmarksLink.click();
  await page.waitForLoadState('networkidle');
  
  const currentUrl = page.url();
  console.log(`  - 当前 URL: ${currentUrl}`);
  console.log(`  - 是否重定向到 /bookmarks/public: ${currentUrl.includes('/bookmarks/public') ? '✅' : '❌'}`);
  
  const pageTitle = await page.locator('h1').textContent();
  console.log(`  - 页面标题: ${pageTitle}`);
  
  await page.screenshot({ path: 'screenshots/02-public-bookmarks.png', fullPage: true });
  console.log('  - 截图已保存: screenshots/02-public-bookmarks.png\n');

  // 测试 3: 访问保存推文页面
  console.log('✓ 测试 3: 访问保存推文页面');
  await page.goto('http://localhost:3001/bookmarks/save');
  await page.waitForLoadState('networkidle');
  
  const savePageTitle = await page.locator('h1').textContent();
  console.log(`  - 页面标题: ${savePageTitle}`);
  
  // 检查表单元素
  const urlInput = await page.locator('input[type="url"]').isVisible();
  const tagsInput = await page.locator('input#tags').isVisible();
  const notesTextarea = await page.locator('textarea#notes').isVisible();
  const publicCheckbox = await page.locator('input[type="checkbox"]#isPublic').isVisible();
  
  console.log(`  - URL 输入框: ${urlInput ? '✅' : '❌'}`);
  console.log(`  - 标签输入框: ${tagsInput ? '✅' : '❌'}`);
  console.log(`  - 笔记文本框: ${notesTextarea ? '✅' : '❌'}`);
  console.log(`  - 公开复选框: ${publicCheckbox ? '✅' : '❌'}`);
  
  // 检查 Bookmarklet
  const bookmarkletSection = await page.locator('text=快速保存书签').isVisible();
  console.log(`  - Bookmarklet 说明: ${bookmarkletSection ? '✅' : '❌'}`);
  
  await page.screenshot({ path: 'screenshots/03-save-page.png', fullPage: true });
  console.log('  - 截图已保存: screenshots/03-save-page.png\n');

  // 测试 4: 保存推文功能
  console.log('✓ 测试 4: 测试保存推文功能（带认证）');
  await page.goto('http://localhost:3001/bookmarks/save?username=admin&password=zz1234zz');
  await page.waitForLoadState('networkidle');
  
  // 填写表单
  await page.locator('input[type="url"]').fill('https://x.com/elonmusk/status/1234567890123456789');
  await page.locator('input#tags').fill('tech, ai, playwright-test');
  await page.locator('textarea#notes').fill('这是通过 Playwright 自动化测试保存的推文');
  await page.locator('input[type="checkbox"]#isPublic').check();
  
  console.log('  - 表单已填写');
  await page.screenshot({ path: 'screenshots/04-form-filled.png', fullPage: true });
  
  // 监听网络请求
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/bookmarks') && response.request().method() === 'POST'
  );
  
  // 点击保存按钮
  await page.locator('button[type="submit"]').click();
  console.log('  - 已点击保存按钮');
  
  // 等待响应
  const response = await responsePromise;
  const status = response.status();
  console.log(`  - API 响应状态: ${status} ${status === 201 ? '✅' : '❌'}`);
  
  if (status === 201) {
    const data = await response.json();
    console.log(`  - 保存的推文 ID: ${data.id}`);
    console.log(`  - 推文 URL: ${data.url}`);
    console.log(`  - 标签: ${data.tags.join(', ')}`);
  }
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/05-save-success.png', fullPage: true });
  console.log('  - 截图已保存: screenshots/05-save-success.png\n');

  // 测试 5: 查看已保存的推文
  console.log('✓ 测试 5: 查看已保存的推文');
  await page.goto('http://localhost:3001/bookmarks/public');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // 等待推文嵌入加载
  
  const tweetCards = await page.locator('article').count();
  console.log(`  - 推文数量: ${tweetCards}`);
  
  // 检查标签
  const tags = await page.locator('a[href*="/bookmarks?tag="]').allTextContents();
  console.log(`  - 找到的标签: ${tags.join(', ')}`);
  
  await page.screenshot({ path: 'screenshots/06-public-with-tweets.png', fullPage: true });
  console.log('  - 截图已保存: screenshots/06-public-with-tweets.png\n');

  // 测试 6: 搜索功能
  console.log('✓ 测试 6: 测试搜索功能');
  const searchInput = page.locator('input[placeholder*="搜索"]');
  await searchInput.fill('playwright');
  console.log('  - 已输入搜索关键词: playwright');
  
  await page.waitForTimeout(1000); // 等待防抖
  await page.screenshot({ path: 'screenshots/07-search.png', fullPage: true });
  console.log('  - 截图已保存: screenshots/07-search.png\n');

  // 测试 7: 标签筛选
  console.log('✓ 测试 7: 测试标签筛选');
  await searchInput.clear();
  
  const techTag = page.locator('button:has-text("#tech")').first();
  if (await techTag.isVisible()) {
    await techTag.click();
    console.log('  - 已点击 #tech 标签');
    await page.waitForTimeout(500);
    
    const urlAfterFilter = page.url();
    console.log(`  - 筛选后 URL: ${urlAfterFilter}`);
    console.log(`  - URL 包含 tag 参数: ${urlAfterFilter.includes('tag=') ? '✅' : '❌'}`);
    
    await page.screenshot({ path: 'screenshots/08-tag-filter.png', fullPage: true });
    console.log('  - 截图已保存: screenshots/08-tag-filter.png\n');
  } else {
    console.log('  - 未找到 #tech 标签（可能还没有推文）\n');
  }

  // 测试 8: 认证访问私有页面
  console.log('✓ 测试 8: 认证访问私有收藏页面');
  await page.goto('http://localhost:3001/bookmarks?username=admin&password=zz1234zz');
  await page.waitForLoadState('networkidle');
  
  const privatePageTitle = await page.locator('h1').textContent();
  console.log(`  - 页面标题: ${privatePageTitle}`);
  
  // 检查管理功能按钮
  const addButton = await page.locator('a:has-text("添加推文")').isVisible();
  const publicButton = await page.locator('a:has-text("公开收藏")').isVisible();
  const jsonButton = await page.locator('button:has-text("JSON")').isVisible();
  const markdownButton = await page.locator('button:has-text("Markdown")').isVisible();
  
  console.log(`  - 添加推文按钮: ${addButton ? '✅' : '❌'}`);
  console.log(`  - 公开收藏按钮: ${publicButton ? '✅' : '❌'}`);
  console.log(`  - JSON 导出按钮: ${jsonButton ? '✅' : '❌'}`);
  console.log(`  - Markdown 导出按钮: ${markdownButton ? '✅' : '❌'}`);
  
  await page.screenshot({ path: 'screenshots/09-private-bookmarks.png', fullPage: true });
  console.log('  - 截图已保存: screenshots/09-private-bookmarks.png\n');

  // 测试 9: 编辑推文
  console.log('✓ 测试 9: 测试编辑推文功能');
  const editButton = page.locator('button:has-text("编辑")').first();
  if (await editButton.isVisible()) {
    await editButton.click();
    console.log('  - 已点击编辑按钮');
    
    await page.waitForTimeout(500);
    const modal = await page.locator('text=编辑推文收藏').isVisible();
    console.log(`  - 编辑对话框打开: ${modal ? '✅' : '❌'}`);
    
    await page.screenshot({ path: 'screenshots/10-edit-modal.png', fullPage: true });
    console.log('  - 截图已保存: screenshots/10-edit-modal.png');
    
    // 关闭对话框
    await page.locator('button:has-text("取消")').click();
    console.log('  - 已关闭对话框\n');
  } else {
    console.log('  - 未找到编辑按钮（可能还没有推文）\n');
  }

  // 测试 10: API 测试
  console.log('✓ 测试 10: API 端点测试');
  
  // 测试获取公开推文
  const apiResponse = await page.request.get('http://localhost:3001/api/bookmarks?public=true');
  console.log(`  - GET /api/bookmarks?public=true: ${apiResponse.status()} ${apiResponse.status() === 200 ? '✅' : '❌'}`);
  
  const apiData = await apiResponse.json();
  console.log(`  - 返回数据包含 tweets: ${apiData.hasOwnProperty('tweets') ? '✅' : '❌'}`);
  console.log(`  - 返回数据包含 total: ${apiData.hasOwnProperty('total') ? '✅' : '❌'}`);
  console.log(`  - 推文总数: ${apiData.total}`);
  
  // 测试无认证保存（应该失败）
  const unauthorizedResponse = await page.request.post('http://localhost:3001/api/bookmarks', {
    data: {
      url: 'https://x.com/test/status/123',
      tags: ['test']
    }
  });
  console.log(`  - POST /api/bookmarks (无认证): ${unauthorizedResponse.status()} ${unauthorizedResponse.status() === 401 ? '✅' : '❌'}`);

  console.log('\n=== 所有测试完成 ===');
  console.log('\n测试结果总结:');
  console.log('- 所有截图已保存到 screenshots/ 目录');
  console.log('- 浏览器窗口将保持打开 30 秒供您查看');
  console.log('- DevTools 已自动打开，可以查看 Console 和 Network');
  
  // 保持浏览器打开一段时间
  await page.waitForTimeout(30000);

} catch (error) {
  console.error('\n❌ 测试过程中出现错误:');
  console.error(error.message);
  await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  console.log('错误截图已保存: screenshots/error.png');
} finally {
  await browser.close();
  console.log('\n浏览器已关闭');
}
