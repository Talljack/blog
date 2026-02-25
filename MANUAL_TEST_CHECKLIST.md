# X 推文收藏功能 - 手动测试清单

## 前提条件
- ✅ 开发服务器正在运行（PID: 59169，端口 3000）
- ✅ 使用 Chrome 浏览器
- ✅ 打开 Chrome DevTools (F12 或 Cmd+Option+I)

## 测试步骤

### 测试 1: 主页导航
1. 打开 `http://localhost:3000`
2. **验证**: 导航栏包含"收藏"链接
3. **DevTools Console**: 无错误
4. **DevTools Network**: 页面加载成功 (200 OK)

**预期结果**:
- ✅ 看到导航: 博客、课程、模板、**收藏**、关于
- ✅ "收藏"链接指向 `/bookmarks`

---

### 测试 2: 公开收藏页面
1. 点击导航栏的"收藏"链接（或访问 `http://localhost:3000/bookmarks`）
2. **验证**: 应该重定向到 `/bookmarks/public`
3. **DevTools Console**: 检查是否有错误
4. **DevTools Network**: 检查 API 调用

**预期结果**:
- ✅ URL 变为 `/bookmarks/public`
- ✅ 页面标题显示"公开推文收藏"
- ✅ 显示搜索框
- ✅ 显示"共 X 条公开推文"
- ✅ Console 无错误

---

### 测试 3: 保存推文页面
1. 访问 `http://localhost:3000/bookmarks/save`
2. **验证**: 页面加载正常
3. **DevTools Elements**: 检查表单元素

**预期结果**:
- ✅ 页面标题显示"保存推文"
- ✅ 显示 Bookmarklet 说明（蓝色区域）
- ✅ 显示可拖拽的"保存到博客"按钮
- ✅ 表单包含:
  - 推文链接输入框（必填）
  - 标签输入框
  - 笔记文本框
  - 公开显示复选框
  - 保存按钮

---

### 测试 4: 保存推文功能
1. 在 `http://localhost:3000/bookmarks/save` 页面
2. 输入推文 URL: `https://x.com/elonmusk/status/1234567890`
3. 输入标签: `tech, ai, test`
4. 输入笔记: `这是一条测试推文`
5. 勾选"公开显示"
6. 点击"保存"按钮
7. **DevTools Network**: 查看 POST 请求到 `/api/bookmarks`

**预期结果**:
- ✅ 显示"保存中..."
- ✅ Network 标签显示 POST 请求
- ✅ 响应状态: 201 Created
- ✅ 响应包含推文数据
- ✅ 显示"保存成功！"消息
- ✅ 自动跳转（或显示成功页面）

---

### 测试 5: 查看已保存的推文
1. 访问 `http://localhost:3000/bookmarks/public`
2. **验证**: 刚才保存的推文出现在列表中
3. **DevTools Elements**: 检查推文卡片结构

**预期结果**:
- ✅ 看到推文卡片
- ✅ 推文使用 X 嵌入组件显示（Twitter 官方样式）
- ✅ 显示标签: #tech, #ai, #test
- ✅ 显示笔记: "这是一条测试推文"
- ✅ 显示"公开"标识
- ✅ 显示保存时间

---

### 测试 6: 搜索功能
1. 在公开收藏页面
2. 在搜索框输入: `test`
3. **验证**: 搜索结果实时更新

**预期结果**:
- ✅ 输入时有防抖效果（不是每个字符都触发搜索）
- ✅ 显示包含"test"的推文
- ✅ DevTools Network 显示 API 请求带 `?q=test` 参数

---

### 测试 7: 标签筛选
1. 在公开收藏页面
2. 点击标签 `#tech`
3. **验证**: 只显示带有该标签的推文

**预期结果**:
- ✅ URL 更新为 `/bookmarks/public?tag=tech`
- ✅ 只显示带 `tech` 标签的推文
- ✅ 标签按钮高亮显示
- ✅ 可以点击"清除筛选"

---

### 测试 8: 认证访问（使用管理员账号）
1. 访问 `http://localhost:3000/bookmarks?username=admin&password=zz1234zz`
2. **验证**: 可以访问私有收藏页面

**预期结果**:
- ✅ 页面显示"X 推文收藏"（不是"公开推文收藏"）
- ✅ 显示"添加推文"按钮
- ✅ 显示"公开收藏"按钮
- ✅ 显示"JSON"和"Markdown"导出按钮
- ✅ 推文卡片显示"编辑"和"删除"按钮

---

### 测试 9: 编辑推文
1. 在私有收藏页面（已认证）
2. 点击某条推文的"编辑"按钮
3. 修改标签、笔记或公开状态
4. 点击"保存"
5. **DevTools Network**: 查看 PATCH 请求

**预期结果**:
- ✅ 弹出编辑对话框
- ✅ 显示当前的标签、笔记、公开状态
- ✅ 可以修改
- ✅ Network 显示 PATCH 请求到 `/api/bookmarks/[id]`
- ✅ 响应状态: 200 OK
- ✅ 对话框关闭
- ✅ 列表自动更新

---

### 测试 10: 删除推文
1. 在私有收藏页面（已认证）
2. 点击某条推文的"删除"按钮
3. 确认删除
4. **DevTools Network**: 查看 DELETE 请求

**预期结果**:
- ✅ 显示确认对话框："确定要删除这条推文收藏吗？"
- ✅ 点击确定后，Network 显示 DELETE 请求
- ✅ 响应状态: 200 OK
- ✅ 推文从列表中移除

---

### 测试 11: 导出功能
1. 在私有收藏页面（已认证）
2. 点击"JSON"按钮
3. **验证**: 下载 JSON 文件
4. 点击"Markdown"按钮
5. **验证**: 下载 Markdown 文件

**预期结果**:
- ✅ JSON 文件下载成功，文件名: `bookmarks-2026-02-24.json`
- ✅ JSON 包含 `tweets`, `exportedAt`, `totalCount` 字段
- ✅ Markdown 文件下载成功，文件名: `bookmarks-2026-02-24.md`
- ✅ Markdown 格式正确，按标签分组

---

### 测试 12: Bookmarklet 功能
1. 在保存页面拖拽"保存到博客"按钮到书签栏
2. 打开任意 X 推文页面（如 `https://x.com/elonmusk/status/...`）
3. 点击书签栏的"保存到博客"按钮
4. **验证**: 弹出保存对话框

**预期结果**:
- ✅ 弹出新窗口（500x700）
- ✅ 推文 URL 自动填充
- ✅ 可以添加标签和笔记
- ✅ 保存成功后窗口自动关闭

---

### 测试 13: 响应式设计
1. 打开 Chrome DevTools
2. 切换到设备模拟器（Toggle Device Toolbar）
3. 选择 iPhone 14 或其他移动设备
4. 访问各个页面

**预期结果**:
- ✅ 所有页面在移动设备上正常显示
- ✅ 导航栏适配移动端
- ✅ 表单元素适配移动端
- ✅ 推文卡片适配移动端

---

### 测试 14: 深色模式
1. 切换系统深色模式，或使用浏览器插件
2. 访问各个页面

**预期结果**:
- ✅ 所有页面支持深色模式
- ✅ 颜色对比度良好
- ✅ 推文嵌入组件也适配深色模式（如果 X 支持）

---

### 测试 15: API 端点测试（使用 DevTools Console）

在 Console 中运行以下代码：

```javascript
// 测试 1: 获取公开推文
fetch('/api/bookmarks?public=true')
  .then(r => r.json())
  .then(d => console.log('公开推文:', d))

// 测试 2: 保存推文（无认证，应返回 401）
fetch('/api/bookmarks', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    url: 'https://x.com/test/status/123',
    tags: ['test'],
    notes: 'Test'
  })
}).then(r => console.log('无认证状态:', r.status))

// 测试 3: 获取标签列表（需认证）
fetch('/api/bookmarks/tags?username=admin&password=zz1234zz')
  .then(r => r.json())
  .then(d => console.log('标签列表:', d))
```

**预期结果**:
- ✅ 测试 1 返回推文列表
- ✅ 测试 2 返回 401
- ✅ 测试 3 返回标签数组

---

## SEO 检查

### 使用 Chrome DevTools Lighthouse

1. 打开 DevTools
2. 切换到 Lighthouse 标签
3. 选择"Desktop"或"Mobile"
4. 勾选"SEO"和"Accessibility"
5. 点击"Analyze page load"

**检查项目**:
- ✅ SEO 分数 > 90
- ✅ Accessibility 分数 > 90
- ✅ 页面有 `<title>` 标签
- ✅ 页面有 `<meta name="description">` 标签
- ✅ 使用语义化 HTML 标签
- ✅ 图片有 alt 属性（如果有）
- ✅ 链接有描述性文本

---

## 性能检查

### 使用 Chrome DevTools Performance

1. 打开 DevTools
2. 切换到 Performance 标签
3. 点击 Record
4. 刷新页面
5. 停止录制

**检查项目**:
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ 无长时间阻塞的 JavaScript
- ✅ 无内存泄漏

---

## 错误检查

### Console 错误
- ✅ 无 JavaScript 错误
- ✅ 无 404 错误
- ✅ 无 CORS 错误

### Network 错误
- ✅ 所有 API 请求返回正确状态码
- ✅ 无失败的资源加载

---

## 测试完成标准

所有测试项目都通过（打勾）后，功能验证完成。

**测试人员签名**: ___________
**测试日期**: 2026-02-24
**测试环境**: Chrome DevTools, localhost:3000
