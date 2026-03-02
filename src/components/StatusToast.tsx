'use client'

import { useEffect } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'

interface StatusToastProps {
  open: boolean
  message: string
  tone?: 'success' | 'error'
  onClose: () => void
}

export default function StatusToast({
  open,
  message,
  tone = 'success',
  onClose,
}: StatusToastProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const timer = window.setTimeout(() => {
      onClose()
    }, 4200)

    return () => {
      window.clearTimeout(timer)
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  const successTone = tone === 'success'
  const Icon = successTone ? CheckCircle2 : CircleAlert

  return (
    <div
      className='pointer-events-none fixed inset-x-0 bottom-5 z-[75] flex justify-center px-4'
      aria-live='polite'
      aria-atomic='true'
    >
      <div
        className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${
          successTone
            ? 'border-emerald-200 bg-white/95 text-slate-900 shadow-emerald-500/10 dark:border-emerald-500/20 dark:bg-slate-900/95 dark:text-slate-50'
            : 'border-rose-200 bg-white/95 text-slate-900 shadow-rose-500/10 dark:border-rose-500/20 dark:bg-slate-900/95 dark:text-slate-50'
        }`}
        data-testid='status-toast'
        role={successTone ? 'status' : 'alert'}
      >
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            successTone
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
          }`}
        >
          <Icon className='h-4 w-4' />
        </div>

        <div className='min-w-0 flex-1 pt-0.5'>
          <p className='text-sm font-medium leading-6'>{message}</p>
        </div>

        <button
          type='button'
          onClick={onClose}
          className='flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:hover:bg-slate-800 dark:hover:text-slate-200'
          aria-label='关闭提示'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
    </div>
  )
}
