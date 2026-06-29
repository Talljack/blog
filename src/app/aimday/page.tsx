import type { Metadata } from 'next'
import AimdayPage from './AimdayPage'

export const metadata: Metadata = {
  title: 'Aimday',
  description:
    'Aimday helps you turn meaningful goals into daily plans, focus sessions, reviews, and progress insights.',
}

export default function Page() {
  return (
    <AimdayPage
      title='Aimday'
      intro='Aimday is a native iPhone goal system for turning long-term goals into daily execution.'
    >
      <section>
        <h2 className='text-lg font-semibold text-gray-950 dark:text-gray-50'>
          What Aimday does
        </h2>
        <p className='mt-3'>
          Aimday helps you plan milestones, generate daily work, run focused
          sessions, review progress, and keep momentum with lightweight insights
          and widgets.
        </p>
      </section>
      <section>
        <h2 className='text-lg font-semibold text-gray-950 dark:text-gray-50'>
          Contact
        </h2>
        <p className='mt-3'>
          For support or product questions, email support@talljack.com.
        </p>
      </section>
    </AimdayPage>
  )
}
