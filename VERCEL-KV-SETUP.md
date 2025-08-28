# Upstash Redis KV 设置指南

## 📋 步骤概览

### 1. 创建 Vercel KV 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **KV** (Key-Value Store)
6. 填写数据库名称（如：`blog-views`）
7. 选择区域（建议选择离用户最近的）
8. 点击 **Create**

### 2. 安装 Upstash Redis 包

```bash
pnpm add @upstash/redis
```

### 3. 获取环境变量

创建完数据库后：

1. 在KV数据库页面，点击 **.env.local** 标签
2. 复制显示的环境变量
3. 应该包含以下变量：

   ```env
   KV_URL="rediss://default:xxx@xxx.upstash.io:6379"
   KV_REST_API_URL="https://xxx-xxx-xxx.upstash.io"
   KV_REST_API_TOKEN="AXXXxxx..."
   KV_REST_API_READ_ONLY_TOKEN="AYXXxxx..."
   REDIS_URL="rediss://default:xxx@xxx.upstash.io:6379"
   ```

### 4. 配置本地环境

将获取的环境变量添加到 `.env.local` 文件：

```env
# Upstash Redis Configuration
KV_URL="rediss://default:your-token@your-host.upstash.io:6379"
KV_REST_API_URL="https://your-host.upstash.io"
KV_REST_API_TOKEN="your-token"
KV_REST_API_READ_ONLY_TOKEN="your-read-only-token"
REDIS_URL="rediss://default:your-token@your-host.upstash.io:6379"
```

### 5. API 代码实现

使用 `@upstash/redis` 包实现 Redis 客户端：

```typescript
// src/app/api/views/route.ts
import { Redis } from '@upstash/redis'

// Redis 客户端自动从环境变量初始化
const redis = Redis.fromEnv()

// 获取浏览量
const views = await redis.get(`blog:views:${slug}`)

// 增加浏览量
const newViews = await redis.incr(`blog:views:${slug}`)
```

### 6. 部署验证

部署到 Vercel 后：

1. 访问你的文章页面
2. 检查浏览量是否正常显示和增加
3. 在 Vercel KV 控制台查看数据

## 🔧 环境变量说明

| 变量名                        | 说明                             | 必需 |
| ----------------------------- | -------------------------------- | ---- |
| `KV_URL`                      | Redis 连接字符串（用于直接连接） | ✅   |
| `KV_REST_API_URL`             | REST API 端点                    | ✅   |
| `KV_REST_API_TOKEN`           | 读写权限的API令牌                | ✅   |
| `KV_REST_API_READ_ONLY_TOKEN` | 只读权限的API令牌                | ✅   |
| `REDIS_URL`                   | Redis 连接字符串（备用）         | ✅   |

## 📊 Redis 数据结构

浏览量数据在 Redis 中的存储格式：

```
Key: blog:views:typescript-tips
Value: 42

Key: blog:views:nextjs-blog-guide
Value: 123
```

## 🔍 本地开发

- **本地环境**：如果没有配置 Redis 环境变量，会自动使用文件存储（`data/views.json`）
- **生产环境**：自动检测Vercel环境，使用 Upstash Redis 存储
- **环境检测**：通过 `Redis.fromEnv()` 自动读取环境变量

## 🚀 Upstash Redis 优势

- ✅ **实时性**：立即读写，无延迟
- ✅ **全球分布**：边缘缓存，快速响应
- ✅ **自动扩容**：无需担心容量问题
- ✅ **高可用**：99.9% 可用性保证
- ✅ **简单易用**：标准 Redis 接口
- ✅ **自动配置**：`Redis.fromEnv()` 自动读取环境变量

## 📈 免费额度

Upstash Redis 免费套餐包含：

- 10,000 次命令/天
- 256MB 存储空间
- 最大数据大小：1MB/key
- 足够中小型博客使用

## 🔧 故障排除

### 常见问题

1. **环境变量未设置**
   - 检查 `.env.local` 是否包含正确的 Redis 配置
   - 确保在Vercel项目设置中也配置了环境变量
   - 验证 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 是否正确

2. **权限错误**
   - 确保使用的是 `KV_REST_API_TOKEN`（读写权限）
   - 不要使用 `KV_REST_API_READ_ONLY_TOKEN` 进行写操作

3. **包版本问题**
   - 确保安装了最新版本的 `@upstash/redis`
   - 检查包是否正确导入：`import { Redis } from '@upstash/redis'`

4. **网络连接问题**
   - 检查网络连接
   - 确认 Upstash Redis 数据库状态正常
   - 验证 REST API 端点是否可访问

### 调试方法

API响应会包含存储方式信息：

```json
{
  "success": true,
  "data": {
    "slug": "typescript-tips",
    "views": 42,
    "storage": "redis" // 显示使用的存储方式
  }
}
```

- `"storage": "redis"` = 使用 Upstash Redis
- `"storage": "file"` = 使用本地文件存储

## 🔧 技术细节

### Redis 客户端初始化

```typescript
import { Redis } from '@upstash/redis'

// 自动从环境变量读取配置
const redis = Redis.fromEnv()

// 或手动配置
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})
```

### 常用操作

```typescript
// 获取值
const value = await redis.get('key')

// 设置值
await redis.set('key', 'value')

// 增加数字
const newValue = await redis.incr('counter')

// 批量操作
const pipeline = redis.pipeline()
pipeline.get('key1')
pipeline.get('key2')
const results = await pipeline.exec()

// 检查key是否存在
const exists = await redis.exists('key')

// 删除key
await redis.del('key')
```

### 错误处理

Redis 操作的安全特性：

```typescript
// 读取不存在的key - 不会报错，返回null
const value = await redis.get('non-existent-key') // 返回: null

// 增加不存在的key - 不会报错，自动创建并设为1
const newValue = await redis.incr('new-counter') // 返回: 1

// 我们的代码处理方式
const views = await redis.get(`blog:views:${slug}`)
return typeof views === 'number' ? views : 0 // 安全处理null情况
```
