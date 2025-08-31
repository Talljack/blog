'use client'

import { useState } from 'react'
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react'

interface NewsletterProps {
  className?: string
  variant?: 'default' | 'minimal' | 'card'
  title?: string
  description?: string
}

export default function Newsletter({
  className = '',
  variant = 'default',
  title = '订阅我的博客',
  description = '获取最新文章和技术分享，不定期发送，绝不骚扰。',
}: NewsletterProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('请输入有效的邮箱地址')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('订阅成功！欢迎加入我们的社区。')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.message || '订阅失败，请稍后重试。')
      }
    } catch (error) {
      setStatus('error')
      setMessage('网络错误，请检查连接后重试。')
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <form onSubmit={handleSubmit} className='flex items-center gap-2'>
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='输入邮箱订阅'
            className='px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
            disabled={status === 'loading'}
          />
          <button
            type='submit'
            disabled={status === 'loading' || status === 'success'}
            className='p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center justify-center'
          >
            {status === 'loading' ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : status === 'success' ? (
              <Check className='w-4 h-4' />
            ) : (
              <Mail className='w-4 h-4' />
            )}
          </button>
        </form>

        {message && (
          <span
            className={`text-sm ${
              status === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {message}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <div className='flex items-start gap-4'>
          <div className='p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg'>
            <Mail className='w-6 h-6 text-blue-600 dark:text-blue-400' />
          </div>

          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
              {title}
            </h3>
            <p className='text-gray-600 dark:text-gray-400 text-sm mb-4'>
              {description}
            </p>

            <form onSubmit={handleSubmit} className='space-y-3'>
              <div className='flex gap-2'>
                <input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='your@email.com'
                  className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
                  disabled={status === 'loading' || status === 'success'}
                />
                <button
                  type='submit'
                  disabled={status === 'loading' || status === 'success'}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center gap-2 whitespace-nowrap'
                >
                  {status === 'loading' ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : status === 'success' ? (
                    <Check className='w-4 h-4' />
                  ) : (
                    <Mail className='w-4 h-4' />
                  )}
                  {status === 'success' ? '已订阅' : '订阅'}
                </button>
              </div>

              {message && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    status === 'success'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {status === 'error' && <AlertCircle className='w-4 h-4' />}
                  {status === 'success' && <Check className='w-4 h-4' />}
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className='text-center mb-6'>
        <div className='inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg mb-4'>
          <Mail className='w-6 h-6 text-blue-600 dark:text-blue-400' />
        </div>

        <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
          {title}
        </h3>
        <p className='text-gray-600 dark:text-gray-400'>{description}</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='输入您的邮箱地址'
            className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors'
            disabled={status === 'loading' || status === 'success'}
          />
        </div>

        <button
          type='submit'
          disabled={status === 'loading' || status === 'success'}
          className='w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium'
        >
          {status === 'loading' ? (
            <>
              <Loader2 className='w-4 h-4 animate-spin' />
              订阅中...
            </>
          ) : status === 'success' ? (
            <>
              <Check className='w-4 h-4' />
              订阅成功
            </>
          ) : (
            <>
              <Mail className='w-4 h-4' />
              立即订阅
            </>
          )}
        </button>

        {message && (
          <div
            className={`flex items-center justify-center gap-2 text-sm ${
              status === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {status === 'error' && <AlertCircle className='w-4 h-4' />}
            {status === 'success' && <Check className='w-4 h-4' />}
            {message}
          </div>
        )}
      </form>

      <div className='mt-4 text-center'>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          我们承诺保护您的隐私，随时可以取消订阅
        </p>
      </div>
    </div>
  )
}

// 侧边栏版本（紧凑型）
interface SidebarNewsletterProps {
  className?: string
}

export function SidebarNewsletter({ className = '' }: SidebarNewsletterProps) {
  return (
    <Newsletter
      variant='card'
      title='订阅更新'
      description='获取最新技术文章推送'
      className={className}
    />
  )
}

// Footer版本（最小化）
export function FooterNewsletter({ className = '' }: FooterNewsletterProps) {
  return <Newsletter variant='minimal' className={className} />
}

interface FooterNewsletterProps {
  className?: string
}
