'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AdminAuth from '@/components/AdminAuth'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [requiresAuth, setRequiresAuth] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    // 先检查是否需要认证
    checkAuthRequirement()

    // 检查URL中是否有auth参数
    const authParam = searchParams.get('auth')
    if (authParam) {
      handleAuthToken(authParam)
    } else {
      // 检查本地存储的认证状态
      const savedAuth = localStorage.getItem('admin_auth')
      if (savedAuth) {
        handleAuthToken(savedAuth)
      } else {
        setIsLoading(false)
      }
    }
  }, [searchParams])

  const checkAuthRequirement = async () => {
    try {
      // 通过访问API来检查是否需要认证
      const response = await fetch('/api/analytics', { method: 'HEAD' })
      if (response.status === 200) {
        // 不需要认证
        setRequiresAuth(false)
        setIsAuthenticated(true)
        setIsLoading(false)
      } else if (response.status === 403) {
        // 需要认证
        setRequiresAuth(true)
      }
    } catch (error) {
      console.error('检查认证要求失败:', error)
      setRequiresAuth(true)
    }
  }

  const handleAuthToken = async (authToken: string) => {
    try {
      setAuthError('')

      // 尝试访问分析API来验证权限
      const response = await fetch(
        `/api/analytics?auth=${encodeURIComponent(authToken)}`
      )

      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem('admin_auth', authToken)
      } else if (response.status === 403) {
        setAuthError('用户名或密码错误，请重试')
        localStorage.removeItem('admin_auth')
      } else {
        setAuthError('验证失败，请稍后重试')
        localStorage.removeItem('admin_auth')
      }
    } catch (error) {
      console.error('认证错误:', error)
      setAuthError('网络错误，请检查连接')
      localStorage.removeItem('admin_auth')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth = async (username: string, password: string) => {
    try {
      setAuthError('')

      // 生成认证token
      const authToken = Buffer.from(`${username}:${password}`).toString(
        'base64'
      )

      // 尝试访问分析API来验证权限
      const response = await fetch(
        `/api/analytics?auth=${encodeURIComponent(authToken)}`
      )

      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem('admin_auth', authToken)
      } else if (response.status === 403) {
        setAuthError('用户名或密码错误，请重试')
        localStorage.removeItem('admin_auth')
      } else {
        setAuthError('验证失败，请稍后重试')
        localStorage.removeItem('admin_auth')
      }
    } catch (error) {
      console.error('认证错误:', error)
      setAuthError('网络错误，请检查连接')
      localStorage.removeItem('admin_auth')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <AdminAuth
        onAuth={handleAuth}
        error={authError}
        requiresAuth={requiresAuth}
      />
    )
  }

  return <>{children}</>
}
