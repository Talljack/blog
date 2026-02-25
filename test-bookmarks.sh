#!/bin/bash

echo "=== 测试 X 推文收藏功能 ==="
echo ""

# 测试主页是否正常
echo "1. 测试主页..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
echo ""

# 测试导航是否包含收藏链接
echo "2. 测试导航是否包含收藏链接..."
curl -s http://localhost:3000 | grep -o "收藏" | head -1
echo ""

# 测试 bookmarks 页面（应该重定向到 public）
echo "3. 测试 /bookmarks 页面（未认证，应重定向）..."
curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000/bookmarks
echo ""

# 测试公开页面
echo "4. 测试 /bookmarks/public 页面..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/bookmarks/public
echo ""

# 测试保存页面
echo "5. 测试 /bookmarks/save 页面..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/bookmarks/save
echo ""

# 测试 API - 获取公开推文
echo "6. 测试 API - 获取公开推文..."
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/bookmarks?public=true"
echo ""

# 测试 API - 保存推文（需要认证）
echo "7. 测试 API - 保存推文（应返回 401）..."
curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"https://x.com/test/status/123"}' \
  http://localhost:3000/api/bookmarks
echo ""

# 测试 API - 使用认证保存推文
echo "8. 测试 API - 使用认证保存推文..."
curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"https://x.com/elonmusk/status/1234567890","tags":["tech","ai"],"notes":"测试推文","isPublic":true}' \
  "http://localhost:3000/api/bookmarks?username=admin&password=zz1234zz"
echo ""

echo ""
echo "=== 测试完成 ==="
