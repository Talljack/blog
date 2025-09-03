/**
 * 管理员身份验证工具
 * 用于保护管理员页面如分析面板
 */

export interface AdminCredentials {
  username: string
  password: string
}

// 管理员账户配置
const getAdminCredentials = (): AdminCredentials | null => {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    return null
  }

  return {
    username: adminUsername,
    password: adminPassword,
  }
}

// 验证管理员凭据
export function validateAdminCredentials(
  username?: string,
  password?: string
): boolean {
  const adminCreds = getAdminCredentials()

  // 如果没有设置管理员凭据，在开发环境允许访问
  if (!adminCreds) {
    return process.env.NODE_ENV === 'development'
  }

  return username === adminCreds.username && password === adminCreds.password
}

// 生成认证token (简单的base64编码，生产环境应使用JWT)
export function generateAuthToken(username: string, password: string): string {
  const credentials = `${username}:${password}`
  return Buffer.from(credentials).toString('base64')
}

// 解析认证token
export function parseAuthToken(token: string): AdminCredentials | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const [username, password] = decoded.split(':')

    if (!username || !password) {
      return null
    }

    return { username, password }
  } catch (error) {
    return null
  }
}

// 从请求中获取认证信息 (支持多种方式)
export function getAuthFromRequest(request: Request): AdminCredentials | null {
  const url = new URL(request.url)

  // 方式1: URL参数中的token
  const authToken = url.searchParams.get('auth')
  if (authToken) {
    return parseAuthToken(authToken)
  }

  // 方式2: URL参数中的用户名密码
  const username = url.searchParams.get('username')
  const password = url.searchParams.get('password')
  if (username && password) {
    return { username, password }
  }

  // 方式3: Authorization header
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Basic ')) {
    const token = authHeader.substring(6)
    return parseAuthToken(token)
  }

  return null
}

// 检查是否有管理员权限
export function hasAdminAccess(request: Request): boolean {
  const credentials = getAuthFromRequest(request)

  if (!credentials) {
    // 开发环境且无配置时允许访问
    return process.env.NODE_ENV === 'development' && !getAdminCredentials()
  }

  return validateAdminCredentials(credentials.username, credentials.password)
}

// 检查是否需要认证
export function requiresAuthentication(): boolean {
  return getAdminCredentials() !== null
}
