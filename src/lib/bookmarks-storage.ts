import { Redis } from '@upstash/redis'
import { Tweet, TweetListParams } from '@/types/bookmarks'
import { extractTweetInfo } from './bookmarks-schema'

const redis = Redis.fromEnv()

const KEYS = {
  tweet: (id: string) => `tweet:${id}`,
  tweetsAll: 'tweets:all',
  tweetsTag: (tag: string) => `tweets:tag:${tag}`,
  tweetsPublic: 'tweets:public',
  allTags: 'tweets:tags:all',
}

const isVercelEnvironment = () => {
  return process.env.VERCEL === '1' && process.env.KV_REST_API_URL
}

export class BookmarksStorage {
  async saveTweet(data: {
    url: string
    tags: string[]
    notes: string
    isPublic: boolean
  }): Promise<Tweet> {
    const tweetInfo = extractTweetInfo(data.url)
    if (!tweetInfo) {
      throw new Error('Invalid tweet URL')
    }

    const id = `${tweetInfo.authorUsername}-${tweetInfo.tweetId}`
    const now = new Date().toISOString()

    const tweet: Tweet = {
      id,
      url: data.url,
      tweetId: tweetInfo.tweetId,
      authorUsername: tweetInfo.authorUsername,
      savedAt: now,
      tags: data.tags,
      notes: data.notes,
      isPublic: data.isPublic,
    }

    if (isVercelEnvironment()) {
      const pipeline = redis.pipeline()

      pipeline.hset(KEYS.tweet(id), tweet as unknown as Record<string, unknown>)
      pipeline.zadd(KEYS.tweetsAll, { score: Date.now(), member: id })

      if (data.isPublic) {
        pipeline.sadd(KEYS.tweetsPublic, id)
      }

      data.tags.forEach((tag) => {
        pipeline.sadd(KEYS.tweetsTag(tag), id)
        pipeline.sadd(KEYS.allTags, tag)
      })

      await pipeline.exec()
    } else {
      await this.saveTweetToFile(tweet)
    }

    return tweet
  }

  async getTweet(id: string): Promise<Tweet | null> {
    if (isVercelEnvironment()) {
      const tweet = await redis.hgetall(KEYS.tweet(id))
      if (!tweet || Object.keys(tweet).length === 0) {
        return null
      }
      return tweet as unknown as Tweet
    } else {
      return await this.getTweetFromFile(id)
    }
  }

  async updateTweet(
    id: string,
    updates: {
      tags?: string[]
      notes?: string
      isPublic?: boolean
    }
  ): Promise<Tweet | null> {
    const existingTweet = await this.getTweet(id)
    if (!existingTweet) {
      return null
    }

    const oldTags = existingTweet.tags
    const newTags = updates.tags ?? existingTweet.tags
    const oldIsPublic = existingTweet.isPublic
    const newIsPublic = updates.isPublic ?? existingTweet.isPublic

    const updatedTweet: Tweet = {
      ...existingTweet,
      tags: newTags,
      notes: updates.notes ?? existingTweet.notes,
      isPublic: newIsPublic,
    }

    if (isVercelEnvironment()) {
      const pipeline = redis.pipeline()

      pipeline.hset(KEYS.tweet(id), updatedTweet as unknown as Record<string, unknown>)

      if (updates.tags) {
        const tagsToRemove = oldTags.filter((tag) => !newTags.includes(tag))
        const tagsToAdd = newTags.filter((tag) => !oldTags.includes(tag))

        tagsToRemove.forEach((tag) => {
          pipeline.srem(KEYS.tweetsTag(tag), id)
        })

        tagsToAdd.forEach((tag) => {
          pipeline.sadd(KEYS.tweetsTag(tag), id)
          pipeline.sadd(KEYS.allTags, tag)
        })
      }

      if (updates.isPublic !== undefined && oldIsPublic !== newIsPublic) {
        if (newIsPublic) {
          pipeline.sadd(KEYS.tweetsPublic, id)
        } else {
          pipeline.srem(KEYS.tweetsPublic, id)
        }
      }

      await pipeline.exec()
    } else {
      await this.updateTweetInFile(id, updatedTweet)
    }

    return updatedTweet
  }

  async deleteTweet(id: string): Promise<boolean> {
    const tweet = await this.getTweet(id)
    if (!tweet) {
      return false
    }

    if (isVercelEnvironment()) {
      const pipeline = redis.pipeline()

      pipeline.del(KEYS.tweet(id))
      pipeline.zrem(KEYS.tweetsAll, id)
      pipeline.srem(KEYS.tweetsPublic, id)

      tweet.tags.forEach((tag) => {
        pipeline.srem(KEYS.tweetsTag(tag), id)
      })

      await pipeline.exec()
    } else {
      await this.deleteTweetFromFile(id)
    }

    return true
  }

  async listTweets(params: TweetListParams): Promise<{
    tweets: Tweet[]
    total: number
    page: number
    limit: number
  }> {
    const page = params.page ?? 1
    const limit = params.limit ?? 20
    const offset = (page - 1) * limit

    if (isVercelEnvironment()) {
      let tweetIds: string[] = []

      if (params.tag) {
        const tagMembers = await redis.smembers(KEYS.tweetsTag(params.tag))
        tweetIds = tagMembers as string[]
      } else if (params.public) {
        const publicMembers = await redis.smembers(KEYS.tweetsPublic)
        tweetIds = publicMembers as string[]
      } else {
        const allIds = await redis.zrange(KEYS.tweetsAll, 0, -1, {
          rev: true,
        })
        tweetIds = allIds as string[]
      }

      const pipeline = redis.pipeline()
      tweetIds.forEach((id) => {
        pipeline.hgetall(KEYS.tweet(id))
      })
      const results = await pipeline.exec()

      let tweets = results
        .filter((result) => result && typeof result === 'object')
        .map((result) => result as Tweet)

      if (params.q) {
        const query = params.q.toLowerCase()
        tweets = tweets.filter(
          (tweet) =>
            tweet.notes.toLowerCase().includes(query) ||
            tweet.tags.some((tag) => tag.toLowerCase().includes(query)) ||
            tweet.metadata?.text?.toLowerCase().includes(query)
        )
      }

      const total = tweets.length
      const paginatedTweets = tweets.slice(offset, offset + limit)

      return {
        tweets: paginatedTweets,
        total,
        page,
        limit,
      }
    } else {
      return await this.listTweetsFromFile(params, offset, limit)
    }
  }

  async getAllTags(): Promise<string[]> {
    if (isVercelEnvironment()) {
      const tags = await redis.smembers(KEYS.allTags)
      return tags as string[]
    } else {
      return await this.getAllTagsFromFile()
    }
  }

  async exportAllTweets(): Promise<Tweet[]> {
    if (isVercelEnvironment()) {
      const allIds = (await redis.zrange(KEYS.tweetsAll, 0, -1, {
        rev: true,
      })) as string[]

      const pipeline = redis.pipeline()
      allIds.forEach((id) => {
        pipeline.hgetall(KEYS.tweet(id))
      })
      const results = await pipeline.exec()

      return results
        .filter((result) => result && typeof result === 'object')
        .map((result) => result as Tweet)
    } else {
      return await this.exportAllTweetsFromFile()
    }
  }

  private async saveTweetToFile(tweet: Tweet): Promise<void> {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'data', 'bookmarks.json')

    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
    } catch (error) {
      // Directory might exist
    }

    let data: { tweets: Record<string, Tweet> } = { tweets: {} }
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      data = JSON.parse(content)
    } catch (error) {
      // File doesn't exist yet
    }

    data.tweets[tweet.id] = tweet
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  private async getTweetFromFile(id: string): Promise<Tweet | null> {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'data', 'bookmarks.json')

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      return data.tweets[id] || null
    } catch (error) {
      return null
    }
  }

  private async updateTweetInFile(
    id: string,
    tweet: Tweet
  ): Promise<void> {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'data', 'bookmarks.json')

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      data.tweets[id] = tweet
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
      throw new Error('Failed to update tweet in file')
    }
  }

  private async deleteTweetFromFile(id: string): Promise<void> {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'data', 'bookmarks.json')

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      delete data.tweets[id]
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
      throw new Error('Failed to delete tweet from file')
    }
  }

  private async listTweetsFromFile(
    params: TweetListParams,
    offset: number,
    limit: number
  ): Promise<{
    tweets: Tweet[]
    total: number
    page: number
    limit: number
  }> {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'data', 'bookmarks.json')

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      let tweets = Object.values(data.tweets) as Tweet[]

      tweets.sort(
        (a, b) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      )

      if (params.tag) {
        tweets = tweets.filter((tweet) => tweet.tags.includes(params.tag!))
      }

      if (params.public) {
        tweets = tweets.filter((tweet) => tweet.isPublic)
      }

      if (params.q) {
        const query = params.q.toLowerCase()
        tweets = tweets.filter(
          (tweet) =>
            tweet.notes.toLowerCase().includes(query) ||
            tweet.tags.some((tag) => tag.toLowerCase().includes(query)) ||
            tweet.metadata?.text?.toLowerCase().includes(query)
        )
      }

      const total = tweets.length
      const paginatedTweets = tweets.slice(offset, offset + limit)

      return {
        tweets: paginatedTweets,
        total,
        page: params.page ?? 1,
        limit,
      }
    } catch (error) {
      return {
        tweets: [],
        total: 0,
        page: params.page ?? 1,
        limit,
      }
    }
  }

  private async getAllTagsFromFile(): Promise<string[]> {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'data', 'bookmarks.json')

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      const tweets = Object.values(data.tweets) as Tweet[]
      const tagsSet = new Set<string>()
      tweets.forEach((tweet) => {
        tweet.tags.forEach((tag) => tagsSet.add(tag))
      })
      return Array.from(tagsSet)
    } catch (error) {
      return []
    }
  }

  private async exportAllTweetsFromFile(): Promise<Tweet[]> {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'data', 'bookmarks.json')

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      const tweets = Object.values(data.tweets) as Tweet[]
      tweets.sort(
        (a, b) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      )
      return tweets
    } catch (error) {
      return []
    }
  }
}

export const bookmarksStorage = new BookmarksStorage()
