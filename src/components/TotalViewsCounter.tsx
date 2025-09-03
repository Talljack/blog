'use client'

import { useEffect, useState } from 'react'

export default function TotalViewsCounter() {
  const [totalViews, setTotalViews] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTotalViews = async () => {
      try {
        const response = await fetch('/api/views/total', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch total views')
        }

        const data = await response.json()
        setTotalViews(data.data?.totalViews || 0)
      } catch (error) {
        console.error('Error fetching total views:', error)
        setTotalViews(0)
      } finally {
        setLoading(false)
      }
    }

    fetchTotalViews()
  }, [])

  if (loading) {
    return (
      <span className='text-xs text-gray-400 dark:text-gray-600'>
        总访问量: <span className='animate-pulse'>...</span>
      </span>
    )
  }

  return (
    <span className='text-xs text-gray-400 dark:text-gray-600'>
      总访问量:{' '}
      <span className='font-medium text-gray-500 dark:text-gray-500'>
        {totalViews?.toLocaleString() || 0}
      </span>
    </span>
  )
}
