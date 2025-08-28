import Link from 'next/link'
import { getAllCourses } from '@/lib/courses'

export default function CoursePage() {
  const courses = getAllCourses()

  return (
    <main className='max-w-4xl mx-auto px-6 pb-16'>
      <div className='space-y-8'>
        {courses.map(course => (
          <div
            key={course.id}
            className='bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-800'
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                {/* 标签 */}
                <div className='flex items-center space-x-2 mb-3'>
                  {course.tags.map((tag, index) => (
                    <span key={index} className='flex items-center text-xs'>
                      <span className='w-1.5 h-1.5 bg-gray-900 dark:bg-gray-100 rounded-full mr-2' />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 标题 */}
                <h2 className='heading-font text-xl font-medium text-gray-900 dark:text-gray-100 mb-3'>
                  {course.title}
                </h2>

                {/* 描述 */}
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed'>
                  {course.description}
                </p>

                {/* 课程信息 */}
                <div className='flex items-center space-x-4 mb-6 text-xs text-gray-500 dark:text-gray-500'>
                  <div className='flex items-center'>
                    <svg
                      className='w-3 h-3 mr-1'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                    >
                      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                    </svg>
                    {course.duration}
                  </div>
                  <div className='flex items-center'>
                    <svg
                      className='w-3 h-3 mr-1'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                    >
                      <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' />
                    </svg>
                    {course.chapters}
                  </div>
                </div>

                {/* 开始学习按钮 */}
                <Link
                  href={course.link}
                  className='inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm rounded hover:opacity-90 transition-opacity'
                >
                  开始学习
                </Link>
              </div>

              {/* 课程图标 */}
              <div className='ml-6 flex-shrink-0'>
                <div className='w-16 h-16 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white text-2xl font-bold'>
                  {course.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
