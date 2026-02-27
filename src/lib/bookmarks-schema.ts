import { z } from 'zod'

export const tweetUrlSchema = z
  .string()
  .url()
  .refine(
    url => {
      const match = url.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/)
      return match !== null
    },
    {
      message: 'Invalid X/Twitter URL. Must be a tweet status URL.',
    }
  )

export const saveTweetSchema = z.object({
  url: tweetUrlSchema,
  tags: z.array(z.string().min(1).max(50)).max(10).optional().default([]),
  notes: z.string().max(5000).optional().default(''),
  isPublic: z.boolean().optional().default(false),
  metadata: z
    .object({
      authorName: z.string().max(100).optional(),
      text: z.string().max(5000).optional(),
    })
    .optional(),
})

export const updateTweetSchema = z.object({
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  notes: z.string().max(5000).optional(),
  isPublic: z.boolean().optional(),
})

export const tweetListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  tag: z.string().optional(),
  q: z.string().optional(),
  public: z.coerce.boolean().optional(),
})

export const exportFormatSchema = z.enum(['json', 'markdown'])

export function extractTweetInfo(url: string): {
  tweetId: string
  authorUsername: string
} | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/)
  if (!match) return null

  return {
    authorUsername: match[1],
    tweetId: match[2],
  }
}
