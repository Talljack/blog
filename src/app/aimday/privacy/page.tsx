import type { Metadata } from 'next'
import AimdayPage from '../AimdayPage'

export const metadata: Metadata = {
  title: 'Aimday Privacy Policy',
  description: 'Privacy Policy for Aimday.',
}

export default function Page() {
  return (
    <AimdayPage
      title='Privacy Policy'
      intro='This Privacy Policy explains how Aimday handles information when you use the app.'
    >
      <section>
        <h2 className='text-lg font-semibold text-gray-950 dark:text-gray-50'>
          Information you provide
        </h2>
        <p className='mt-3'>
          Aimday stores goals, tasks, focus sessions, habits, reviews, and app
          settings so the app can provide planning and progress features.
        </p>
      </section>
      <section>
        <h2 className='text-lg font-semibold text-gray-950 dark:text-gray-50'>
          Purchases
        </h2>
        <p className='mt-3'>
          In-app purchases are processed by Apple. Aimday uses Apple StoreKit
          purchase status to unlock paid features and does not receive your full
          payment card details.
        </p>
      </section>
      <section>
        <h2 className='text-lg font-semibold text-gray-950 dark:text-gray-50'>
          Support
        </h2>
        <p className='mt-3'>
          If you contact support, we use the information you provide to respond
          to your request. Contact: support@talljack.com.
        </p>
      </section>
      <p className='text-xs text-gray-500 dark:text-gray-500'>
        Last updated: June 29, 2026
      </p>
    </AimdayPage>
  )
}
