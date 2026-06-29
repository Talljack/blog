import type { Metadata } from 'next'
import AimdayPage from '../AimdayPage'

export const metadata: Metadata = {
  title: 'Aimday Support',
  description: 'Support information for Aimday.',
}

export default function Page() {
  return (
    <AimdayPage
      title='Support'
      intro='Need help with Aimday? Use the contact details below.'
    >
      <section>
        <h2 className='text-lg font-semibold text-gray-950 dark:text-gray-50'>
          Contact
        </h2>
        <p className='mt-3'>
          Email support@talljack.com with your question, device model, iOS
          version, and a short description of what happened.
        </p>
      </section>
      <section>
        <h2 className='text-lg font-semibold text-gray-950 dark:text-gray-50'>
          Purchases
        </h2>
        <p className='mt-3'>
          For subscription cancellation or refund requests, use your Apple
          account purchase history or App Store subscription settings.
        </p>
      </section>
    </AimdayPage>
  )
}
