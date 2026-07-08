import type { Metadata } from 'next'
import AimdayPage from '../AimdayPage'

export const metadata: Metadata = {
  title: 'Aimday Terms of Service',
  description: 'Terms of Service for Aimday.',
}

export default function Page() {
  return (
    <AimdayPage
      title='Terms of Service'
      intro='These Terms govern your use of Aimday.'
    >
      <section>
        <h2 className='text-lg font-semibold text-gray-950 dark:text-gray-50'>
          Use of the app
        </h2>
        <p className='mt-3'>
          You are responsible for the goals, plans, and content you create in
          Aimday. Do not use Aimday for unlawful, harmful, or abusive activity.
        </p>
      </section>
      <section>
        <h2 className='text-lg font-semibold text-gray-950 dark:text-gray-50'>
          Subscriptions and purchases
        </h2>
        <p className='mt-3'>
          Aimday may offer auto-renewable subscriptions and non-consumable
          purchases through Apple in-app purchase. Billing, renewals,
          cancellations, and refunds are handled by Apple under your App Store
          account settings and Apple policies.
        </p>
      </section>
      <section>
        <h2 className='text-lg font-semibold text-gray-950 dark:text-gray-50'>
          Availability
        </h2>
        <p className='mt-3'>
          Aimday is provided as available. Features may change over time to
          improve the product or comply with platform requirements.
        </p>
      </section>
      <p className='text-xs text-gray-500 dark:text-gray-500'>
        Last updated: June 29, 2026
      </p>
    </AimdayPage>
  )
}
