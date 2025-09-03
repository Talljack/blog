'use client'

import { Suspense } from 'react'
import AdminAuthWrapper from '@/components/AdminAuthWrapper'

interface AdminAuthSuspenseProps {
  children: React.ReactNode
}

function LoadingAuth() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
    </div>
  )
}

export default function AdminAuthSuspense({
  children,
}: AdminAuthSuspenseProps) {
  return (
    <Suspense fallback={<LoadingAuth />}>
      <AdminAuthWrapper>{children}</AdminAuthWrapper>
    </Suspense>
  )
}
