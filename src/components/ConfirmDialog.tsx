'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '确认',
  cancelLabel = '取消',
  tone = 'default',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) {
      previousFocusRef.current?.focus()
      return
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null
    cancelButtonRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onCancel, open, pending])

  if (!open) {
    return null
  }

  const dangerTone = tone === 'danger'

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm'
      role='presentation'
      onClick={pending ? undefined : onCancel}
    >
      <div
        className='w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-slate-950/20 dark:bg-slate-900'
        data-testid='confirm-dialog'
        role='dialog'
        aria-modal='true'
        aria-labelledby='confirm-dialog-title'
        aria-describedby='confirm-dialog-description'
        onClick={event => event.stopPropagation()}
      >
        <div className='relative overflow-hidden px-6 pb-6 pt-5'>
          <div className='absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-rose-500/15 via-orange-400/10 to-transparent dark:from-rose-400/15 dark:via-orange-300/10' />
          <div className='relative flex items-start justify-between gap-4'>
            <div className='flex items-start gap-4'>
              <div
                className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                  dangerTone
                    ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                <AlertTriangle className='h-5 w-5' />
              </div>
              <div className='space-y-2'>
                <h2
                  id='confirm-dialog-title'
                  className='text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50'
                >
                  {title}
                </h2>
                <p
                  id='confirm-dialog-description'
                  className='text-sm leading-6 text-slate-600 dark:text-slate-300'
                >
                  {description}
                </p>
              </div>
            </div>

            <button
              type='button'
              onClick={onCancel}
              disabled={pending}
              className='flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              aria-label='关闭确认弹窗'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='relative mt-8 flex items-center justify-end gap-3'>
            <button
              ref={cancelButtonRef}
              type='button'
              onClick={onCancel}
              disabled={pending}
              className='min-h-[44px] rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            >
              {cancelLabel}
            </button>
            <button
              type='button'
              onClick={onConfirm}
              disabled={pending}
              className={`min-h-[44px] rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                dangerTone
                  ? 'bg-rose-600 shadow-lg shadow-rose-600/20 hover:bg-rose-700 focus-visible:ring-rose-500'
                  : 'bg-slate-900 hover:bg-slate-700 focus-visible:ring-slate-500 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
              }`}
            >
              {pending ? '处理中...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
