import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { Github, Twitter, Mail, Rss } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {siteConfig.author.name}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {siteConfig.author.social.github && (
              <Link
                href={siteConfig.author.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            )}
            {siteConfig.author.social.twitter && (
              <Link
                href={siteConfig.author.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            )}
            {siteConfig.author.social.email && (
              <Link
                href={`mailto:${siteConfig.author.social.email}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            )}
            <Link
              href="/rss.xml"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Rss className="h-5 w-5" />
              <span className="sr-only">RSS Feed</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}