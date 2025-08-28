# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `pnpm run dev` - Start development server on localhost:3000
- `pnpm run build` - Build production version and generate sitemap
- `pnpm start` - Start production server
- `pnpm run lint` - Run ESLint for code quality checks

### Testing

- `pnpm test` - Run Playwright end-to-end tests
- `pnpm run test:ui` - Run Playwright tests with UI mode
- `pnpm run test:debug` - Run Playwright tests in debug mode

### Additional Commands

- `pnpm run sitemap` - Generate sitemap using next-sitemap

## Architecture Overview

This is a modern blog system built with Next.js 15 using the App Router architecture. The application follows a clean separation of concerns with distinct layers for content management, UI components, and configuration.

### Key Technologies

- **Next.js 15** with App Router for routing and SSG
- **TypeScript** with strict mode enabled
- **Tailwind CSS** with custom typography plugin for styling
- **MDX/Markdown** for content with gray-matter for frontmatter parsing
- **Playwright** for end-to-end testing

### Core Architecture

**Content Layer (`src/content/blog/`)**: Markdown/MDX files with frontmatter containing blog posts. The content structure expects:

```yaml
---
title: 'Post Title'
description: 'Post description'
date: 'YYYY-MM-DD'
tags: ['tag1', 'tag2']
featured: boolean
author: 'Author Name'
---
```

**Data Layer (`src/lib/blog.ts`)**: Centralized content processing with functions for:

- `getAllPosts()` - Returns all posts sorted by date
- `getPostBySlug(slug)` - Gets individual post with processed HTML
- `getFeaturedPosts()` - Gets featured posts (limited to 3)
- `getPostsByTag(tag)` - Filters posts by tag
- `getAllTags()` - Extracts all unique tags
- Automatic read time calculation (200 words/minute)

**Configuration (`src/lib/config.ts`)**: Central site configuration including:

- Site metadata and SEO settings
- Author information and social links
- Navigation structure
- Giscus comments configuration
- Google Analytics integration

**Component Architecture**: Components in `src/components/` handle specific UI concerns:

- `ThemeProvider.tsx` - Dark/light mode management using next-themes
- `BlogCard.tsx` - Reusable post preview component
- `Header.tsx` / `Footer.tsx` - Site navigation and footer
- `SEO.tsx` / `StructuredData.tsx` - SEO optimization components
- `Comments.tsx` - Giscus integration for comments
- `ViewCounter.tsx` - Post view tracking with API endpoints

**Routing Structure**:

- `/` - Homepage with featured posts
- `/blog` - Blog listing page
- `/blog/[slug]` - Individual post pages (SSG)
- `/tag/[tag]` - Tag-filtered post listings
- `/about` - Static about page
- `/api/search` - Search API endpoint
- `/api/views` - View tracking API

### Path Resolution

Uses TypeScript path mapping with `@/*` pointing to `./src/*` for clean imports.

### Styling System

Tailwind CSS with:

- Custom typography plugin configured for blog content
- Dark mode support via `class` strategy
- Custom font families: Inter (sans) and JetBrains Mono (mono)
- Responsive design patterns

### Content Management

- Blog posts stored as Markdown/MDX files in `src/content/blog/`
- Automatic frontmatter parsing with gray-matter
- Remark pipeline for HTML conversion with GitHub Flavored Markdown support
- Automatic read time estimation and tag extraction
- Featured post system for homepage highlighting

### SEO & Performance

- Static generation for all blog content
- Automatic sitemap generation via next-sitemap
- Structured data implementation
- RSS feed generation at `/feed.xml`
- Optimized for Core Web Vitals with Next.js 15 performance features

### Dev

- Always use `pnpm` for package management
