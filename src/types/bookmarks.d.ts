export interface Tweet {
  id: string
  url: string
  tweetId: string
  authorUsername: string
  savedAt: string
  tags: string[]
  notes: string
  isPublic: boolean
  metadata?: {
    authorName?: string
    text?: string
  }
}

export interface TweetListParams {
  page?: number
  limit?: number
  tag?: string
  q?: string
  public?: boolean
}

export interface TweetExportFormat {
  tweets: Tweet[]
  exportedAt: string
  totalCount: number
}

export interface SaveTweetRequest {
  url: string
  tags?: string[]
  notes?: string
  isPublic?: boolean
}

export interface UpdateTweetRequest {
  tags?: string[]
  notes?: string
  isPublic?: boolean
}
