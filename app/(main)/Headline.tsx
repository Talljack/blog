'use client'

import { motion } from 'framer-motion'
import Balancer from 'react-wrap-balancer'

import { SocialLink } from '~/components/links/SocialLink'

function Developer() {
  return (
    <span className="group">
      <span className="font-mono">&lt;</span>开发者
      <span className="font-mono">/&gt;</span>
      <span className="invisible inline-flex text-zinc-300 before:content-['|'] group-hover:visible group-hover:animate-typing dark:text-zinc-500" />
    </span>
  )
}

export function Headline() {
  return (
    <div className="max-w-2xl">
      <motion.h1
        className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 100,
          duration: 0.3,
        }}
      >
        <Developer />
      </motion.h1>
      <motion.p
        className="mt-6 text-base text-zinc-600 dark:text-zinc-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 85,
          duration: 0.3,
          delay: 0.1,
        }}
      >
        <Balancer>
          我是
          Talljack，前端开发工程师，探求独立开发者中，热爱开源，代码之外也在学习其他技能。
        </Balancer>
      </motion.p>
      <motion.div
        className="mt-6 flex gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 50,
          stiffness: 90,
          duration: 0.35,
          delay: 0.25,
        }}
      >
        <SocialLink
          href="https://x.com/Talljackcv"
          aria-label="我的推特"
          platform="twitter"
        />
        {/* <SocialLink
          href="https://yugangcao.com/youtube"
          aria-label="我的 YouTube"
          platform="youtube"
        />
        <SocialLink
          href="https://yugangcao.com/bilibili"
          aria-label="我的 Bilibili"
          platform="bilibili"
        /> */}
        <SocialLink
          href="https://github.com/Talljack"
          aria-label="我的 GitHub"
          platform="github"
        />
        {/* <SocialLink
          href="https://yugangcao.com/tg"
          aria-label="我的 Telegram"
          platform="telegram"
        /> */}
        <SocialLink href="/feed.xml" platform="rss" aria-label="RSS 订阅" />
        <SocialLink
          href="mailto:yugang.cao12@gmail.com"
          aria-label="我的邮箱"
          platform="mail"
        />
      </motion.div>
    </div>
  )
}
