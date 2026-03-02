# Bookmarks Tweet Content Capture And List Preview Design

## Summary

Fix the bookmarks flow so newly saved tweets persist captured tweet text and the bookmarks list shows readable content before the outbound tweet link. The change only applies to newly saved tweets. Existing bookmarks without captured text remain unchanged.

## Goals

- Persist `metadata.text` reliably for new tweet bookmarks in both Redis and file storage modes.
- Show tweet text preview first in bookmark list items.
- Clamp preview text to 5 lines, with overflow ellipsis.
- Keep the original tweet URL visible as a secondary action.
- Preserve X embed support as an optional secondary section instead of the primary reading surface.

## Non-Goals

- No backfill or migration for previously saved bookmarks.
- No automatic refetch of tweet text for historical records.
- No changes to bookmark creation UX beyond existing extension capture.

## Current Problem

The browser extension already extracts tweet text and sends it as `metadata.text`, but the saved result is not consistently usable in the bookmarks UI.

Two issues exist:

1. Redis storage writes `metadata` directly into a hash payload, which is not a stable way to persist nested structured data for later typed reads.
2. `TweetCard` only renders `metadata.text` when the X embed fails to load, so the list still behaves like a link-first or embed-first UI instead of a content-first bookmarks view.

## Proposed Approach

### 1. Normalize metadata persistence

Update `BookmarksStorage` so tweet metadata is serialized before writing to Redis and parsed after reading from Redis.

Recommended shape:

- Store top-level tweet fields as hash fields.
- Store `metadata` as a JSON string field when present.
- On `getTweet`, `listTweetsFromRedis`, and `exportAllTweets`, parse the metadata field back into an object.

File storage remains unchanged because JSON file persistence already supports nested objects.

This makes the Redis and file storage return shape consistent for:

- `tweet.metadata.text`
- `tweet.metadata.authorName`

### 2. Make list items content-first

Update `TweetCard` so the bookmark list item always prefers the saved text preview when available.

New rendering order:

1. Tweet text preview block
2. Link row (`查看 @username 的推文`)
3. Optional tags, notes, metadata row, and actions
4. Optional X embed area

The text preview becomes the primary content block instead of a fallback shown only when embed loading fails.

### 3. Keep embed as secondary enrichment

Preserve the current X widget loading behavior, but treat it as enhancement only.

- The main bookmark content must be readable before the widget loads.
- If the widget loads successfully, show it below the preview/link section.
- If the widget fails or is blocked, no user-facing functionality is lost.

## UX Details

### Text preview

- Render `tweet.metadata?.text` when present.
- Preserve line breaks with `whitespace-pre-wrap`.
- Limit display to 5 lines.
- Use visual truncation for overflow.
- Avoid empty placeholder UI when no text exists.

### Link placement

- Always show the original tweet link beneath the preview.
- Use the existing username-based label.
- Keep the link target opening in a new tab.

### Old bookmarks

- If `metadata.text` is missing, the card falls back to showing the link and existing metadata/actions only.
- No recovery or backfill attempt is made.

## Data Flow

### Save flow

1. Content script extracts tweet text from `[data-testid="tweetText"]`.
2. Background script sends `metadata.text` to `POST /api/bookmarks`.
3. API validates `metadata.text` with existing schema.
4. Storage layer serializes metadata for Redis persistence.
5. Read APIs deserialize metadata before returning tweet data to the client.

### Read flow

1. Bookmarks pages fetch tweets from `/api/bookmarks`.
2. Returned tweet objects include parsed `metadata`.
3. `TweetCard` renders preview text first when `metadata.text` exists.
4. X embed loads independently without blocking core content visibility.

## Error Handling

- If the extension cannot extract text, save still succeeds with URL-only data.
- If Redis metadata parsing fails for a record, treat that bookmark as having no metadata rather than failing the whole list request.
- If X widget loading fails, keep preview and link visible.

## Testing Scope

### Storage

- Saving a new tweet with `metadata.text` persists readable metadata in Redis mode.
- Reading a saved tweet returns `metadata` as an object, not a raw string.
- List and export endpoints continue returning valid tweet objects.

### UI

- New bookmarks with text show a 5-line preview before the link.
- Bookmarks without text do not render an empty preview block.
- Preview remains visible whether embed loads or not.

### Search regression

- Search by words from `metadata.text` still matches bookmarks after metadata serialization changes.

## Implementation Notes

- Prefer a small pair of helper functions in `bookmarks-storage.ts` for serializing and parsing bookmark records.
- Keep the UI change localized to `TweetCard` unless a shared text clamp utility is already present.
- Avoid introducing a data migration in this change set.

## Success Criteria

- Newly saved tweets show human-readable text content in bookmarks list items.
- The list item presents preview text first and link second.
- Old bookmarks continue to render without errors.
- The feature works the same in Redis-backed and file-backed environments.
