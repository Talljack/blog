import { siteConfig } from '@/lib/config'

export async function GET() {
  const robots = `# *
User-agent: *
Allow: /

# GPTBot
User-agent: GPTBot
Disallow: /

# Google-Extended
User-agent: Google-Extended
Disallow: /

# Host
Host: ${siteConfig.url}

# Sitemaps
Sitemap: ${siteConfig.url}/sitemap.xml
`

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
