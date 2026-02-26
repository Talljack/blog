# Save Tweet to Blog - 使用指南

## 一、安装扩展

1. 打开 Chrome 浏览器，地址栏输入 `chrome://extensions/`
2. 打开右上角「开发者模式」开关
3. 点击「加载已解压的扩展程序」
4. 选择项目中的 `extensions/save-tweet/` 文件夹
5. 安装成功后，工具栏会出现扩展图标

## 二、配置扩展

1. 右键点击工具栏的扩展图标 → 选择「选项」（Options）
2. 填写以下信息：
   - **Blog API URL**: `http://localhost:3000`（本地开发）或 `https://www.talljack.me`（生产环境）
   - **Admin Token**: `YWRtaW46enoxMjM0eno=`
3. 点击 Save 保存

> Token 是 `admin:password` 的 Base64 编码，可通过 `btoa('admin:zz1234zz')` 生成

## 三、添加推文到收藏

### 方式 A：时间线一键保存（推荐）

1. 打开 X (twitter.com / x.com) 任意页面
2. 浏览时间线，每条推文的操作栏（回复、转发、点赞旁边）末尾会出现一个 **书签图标按钮**
3. 点击该按钮即可保存推文
4. 按钮变绿色 ✓ 表示保存成功

### 方式 B：推文详情页保存

1. 点击进入某条推文的详情页（URL 格式：`x.com/用户名/status/数字ID`）
2. 点击工具栏的扩展图标
3. 弹窗中会显示推文链接，可填写标签和笔记
4. 点击 Save Bookmark 保存

### 方式 C：浏览器直接访问保存页面

访问以下 URL（替换推文链接）：

```
http://localhost:3000/bookmarks/save?token=YWRtaW46enoxMjM0eno=&url=https://x.com/vercel/status/2026439379422687639
```

页面会自动填入推文链接，填好标签和笔记后点保存即可。

## 四、查看收藏

- **所有收藏**（需管理员）：访问 `/bookmarks`
- **公开收藏**：访问 `/bookmarks/public`

收藏页面支持：

- 按标签筛选
- 搜索推文
- 查看推文嵌入卡片

## 五、删除收藏

1. 先确保浏览器已设置管理员 Token（首次访问保存页面带 `?token=` 参数会自动设置，或在控制台执行）：
   ```js
   localStorage.setItem('admin_token', btoa('admin:zz1234zz'))
   ```
2. 访问 `/bookmarks` 或 `/bookmarks/public`
3. 每条推文卡片底部会出现红色「删除」按钮
4. 点击删除，确认后即可移除

## 六、常见问题

### 时间线上看不到保存按钮

- 在 `chrome://extensions/` 页面点击扩展的刷新按钮（↻）
- 刷新 X 页面（Ctrl+R / Cmd+R）
- 确认扩展已启用且没有报错

### 点击保存按钮变红色

- 检查扩展选项中的 API URL 和 Token 是否正确配置
- 确认博客服务正在运行

### 收藏页面看不到删除按钮

- 需要先设置管理员 Token 到 localStorage（见第五节）
- 刷新页面
