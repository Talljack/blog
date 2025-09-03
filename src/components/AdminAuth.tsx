'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface AdminAuthProps {
  onAuth: (username: string, password: string) => void
  error?: string
  requiresAuth: boolean
}

export default function AdminAuth({
  onAuth,
  error,
  requiresAuth,
}: AdminAuthProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAuth(username, password)
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='flex justify-center'>
            <div className='p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full'>
              <Lock className='w-8 h-8 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
          <h2 className='mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            管理员访问
          </h2>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            需要管理员权限才能访问分析面板
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            {/* 用户名字段 */}
            <div>
              <label htmlFor='username' className='sr-only'>
                用户名
              </label>
              <input
                id='username'
                name='username'
                type='text'
                required={requiresAuth}
                className='appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder={
                  requiresAuth ? '管理员用户名' : '用户名 (开发环境可留空)'
                }
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            {/* 密码字段 */}
            <div>
              <label htmlFor='password' className='sr-only'>
                密码
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required={requiresAuth}
                  className='appearance-none rounded-lg relative block w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder={
                    requiresAuth ? '管理员密码' : '密码 (开发环境可留空)'
                  }
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' />
                  ) : (
                    <Eye className='w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            </div>
          )}

          <div>
            <button
              type='submit'
              disabled={requiresAuth && (!username.trim() || !password.trim())}
              className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              访问分析面板
            </button>
          </div>

          <div className='text-center'>
            {requiresAuth ? (
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                需要有效的管理员凭据
              </p>
            ) : (
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                开发环境 - 可直接访问或输入凭据
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
