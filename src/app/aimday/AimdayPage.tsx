import Link from 'next/link'

type AimdayPageProps = {
  title: string
  eyebrow?: string
  intro: string
  children: React.ReactNode
}

export default function AimdayPage({
  title,
  eyebrow = 'Aimday',
  intro,
  children,
}: AimdayPageProps) {
  return (
    <article className='max-w-3xl mx-auto px-6 pb-16'>
      <p className='text-sm font-medium text-blue-600 dark:text-blue-400'>
        {eyebrow}
      </p>
      <h1 className='mt-3 heading-font text-3xl font-semibold text-gray-950 dark:text-gray-50'>
        {title}
      </h1>
      <p className='mt-4 text-base leading-7 text-gray-600 dark:text-gray-300'>
        {intro}
      </p>
      <div className='mt-10 space-y-8 text-sm leading-7 text-gray-700 dark:text-gray-300'>
        {children}
      </div>
      <div className='mt-12 flex flex-wrap gap-4 text-sm'>
        <Link className='elegant-link' href='/aimday/privacy'>
          Privacy Policy
        </Link>
        <Link className='elegant-link' href='/aimday/terms'>
          Terms of Service
        </Link>
        <Link className='elegant-link' href='/aimday/support'>
          Support
        </Link>
      </div>
    </article>
  )
}
