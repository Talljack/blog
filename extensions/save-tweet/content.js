const PROCESSED_ATTR = 'data-blog-save-injected'
const STATUS_RE = /\/(\w+)\/status\/(\d+)/
const DEDUP_KEY = 'blog_saved_tweets'
const TTL_MS = 20 * 24 * 60 * 60 * 1000
const CONTEXT_INVALIDATED_RE = /Extension context invalidated/i

const SAVED_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="#00ba7c" stroke="#00ba7c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'

const BLOG_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'

function getSavedTweets() {
  try {
    const raw = localStorage.getItem(DEDUP_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    const now = Date.now()
    const cleaned = {}
    let changed = false
    for (const url in data) {
      if (now - data[url] < TTL_MS) {
        cleaned[url] = data[url]
      } else {
        changed = true
      }
    }
    if (changed) localStorage.setItem(DEDUP_KEY, JSON.stringify(cleaned))
    return cleaned
  } catch (e) {
    return {}
  }
}

function markTweetSaved(url) {
  const data = getSavedTweets()
  data[url] = Date.now()
  localStorage.setItem(DEDUP_KEY, JSON.stringify(data))
}

function isTweetSaved(url) {
  const data = getSavedTweets()
  return !!data[url]
}

function normalizeText(text) {
  return (text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+\n/g, '\n')
    .trim()
}

function collectText(elements) {
  const seen = new Set()
  const parts = []

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]
    const text = normalizeText(el.innerText || el.textContent || '')
    if (!text || seen.has(text)) continue
    seen.add(text)
    parts.push(text)
  }

  return parts.join('\n\n').trim()
}

function getTweetText(article) {
  const tweetText = collectText(
    article.querySelectorAll('[data-testid="tweetText"]')
  )
  if (tweetText) return tweetText

  const langText = collectText(article.querySelectorAll('[lang]'))
  if (langText) return langText

  return ''
}

function getTweetUrl(article) {
  const links = article.querySelectorAll('a[href*="/status/"]')
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    if (link.querySelector('time')) {
      const match = link.getAttribute('href').match(STATUS_RE)
      if (match) return 'https://x.com/' + match[1] + '/status/' + match[2]
    }
  }
  return null
}

function getArticleAuthorName(article) {
  const nameLink = article.querySelector('a[role="link"][href^="/"]')
  if (!nameLink) return ''

  const text = normalizeText(nameLink.innerText || nameLink.textContent || '')
  return text.replace(/^@/, '')
}

function getTweetContext(article, fallbackUrl) {
  return {
    url: fallbackUrl || getTweetUrl(article),
    text: getTweetText(article),
    authorName: getArticleAuthorName(article),
  }
}

function getTweetArticleByUrl(url) {
  const articles = document.querySelectorAll('article')
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    if (getTweetUrl(article) === url) {
      return article
    }
  }
  return null
}

function hasLiveExtensionContext() {
  return (
    typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id
  )
}

function isContextInvalidatedError(err) {
  return CONTEXT_INVALIDATED_RE.test((err && err.message) || '')
}

function recoverInvalidatedContext() {
  showToast('扩展刚更新过，正在刷新页面恢复保存功能…', null)
  window.setTimeout(function () {
    window.location.reload()
  }, 1200)
}

function showToast(message, blogUrl) {
  const existing = document.getElementById('blog-save-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'blog-save-toast'
  toast.style.cssText =
    'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:999999;' +
    'background:#1a1a2e;color:#fff;padding:12px 20px;border-radius:12px;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;' +
    'box-shadow:0 8px 32px rgba(0,0,0,0.3);display:flex;align-items:center;gap:12px;' +
    'animation:blogToastIn 0.3s ease;max-width:420px;'

  const style = document.createElement('style')
  style.textContent =
    '@keyframes blogToastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}' +
    'to{opacity:1;transform:translateX(-50%) translateY(0)}}' +
    '@keyframes blogToastOut{from{opacity:1;transform:translateX(-50%) translateY(0)}' +
    'to{opacity:0;transform:translateX(-50%) translateY(20px)}}'
  document.head.appendChild(style)

  const checkSvg =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#00ba7c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'

  toast.innerHTML =
    '<span style="display:flex;align-items:center;flex-shrink:0">' +
    checkSvg +
    '</span>' +
    '<span>' +
    message +
    '</span>'

  if (blogUrl) {
    const link = document.createElement('a')
    link.href = blogUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.textContent = '查看'
    link.style.cssText =
      'color:#60a5fa;text-decoration:none;font-weight:500;white-space:nowrap;margin-left:4px;'
    link.addEventListener('mouseenter', function () {
      link.style.textDecoration = 'underline'
    })
    link.addEventListener('mouseleave', function () {
      link.style.textDecoration = 'none'
    })
    toast.appendChild(link)
  }

  const closeBtn = document.createElement('button')
  closeBtn.innerHTML = '&times;'
  closeBtn.style.cssText =
    'background:none;border:none;color:#999;font-size:18px;cursor:pointer;padding:0 0 0 4px;line-height:1;'
  closeBtn.addEventListener('click', function () {
    toast.style.animation = 'blogToastOut 0.2s ease forwards'
    setTimeout(function () {
      toast.remove()
    }, 200)
  })
  toast.appendChild(closeBtn)

  document.body.appendChild(toast)

  setTimeout(function () {
    if (document.getElementById('blog-save-toast')) {
      toast.style.animation = 'blogToastOut 0.2s ease forwards'
      setTimeout(function () {
        toast.remove()
      }, 200)
    }
  }, 5000)
}

function createSaveButton(article, tweetUrl) {
  const alreadySaved = isTweetSaved(tweetUrl)
  const btn = document.createElement('button')
  btn.className = 'blog-save-btn'
  btn.title = alreadySaved ? 'Already saved to Blog' : 'Save to Blog'
  btn.innerHTML = alreadySaved ? SAVED_SVG : BLOG_SVG
  btn.style.cssText =
    'display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:none;' +
    'background:transparent;color:' +
    (alreadySaved ? '#00ba7c' : '#536471') +
    ';cursor:pointer;border-radius:9999px;font-size:13px;transition:all 0.2s;'

  if (alreadySaved) {
    btn.dataset.saved = 'true'
  }

  btn.addEventListener('mouseenter', function () {
    if (!btn.dataset.saved) {
      btn.style.background = 'rgba(29,155,240,0.1)'
      btn.style.color = '#1d9bf0'
    }
  })
  btn.addEventListener('mouseleave', function () {
    if (!btn.dataset.saved) {
      btn.style.background = 'transparent'
      btn.style.color = '#536471'
    }
  })
  btn.addEventListener('click', function (e) {
    e.stopPropagation()
    e.preventDefault()
    if (btn.dataset.saved) {
      showToast('这条推文已经保存过了', null)
      return
    }
    saveTweet(btn, tweetUrl, getTweetText(article))
  })
  return btn
}

async function saveTweet(btn, url, text) {
  btn.disabled = true
  btn.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32"><animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="1s" repeatCount="indefinite"/></circle></svg>'
  try {
    if (!hasLiveExtensionContext()) {
      throw new Error('Extension context invalidated')
    }

    const result = await new Promise(function (resolve, reject) {
      try {
        chrome.runtime.sendMessage(
          { type: 'SAVE_TWEET', url: url, text: text },
          function (response) {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message))
              return
            }
            if (!response) {
              reject(new Error('No response from extension background'))
              return
            }
            if (response.error) {
              reject(new Error(response.error))
              return
            }
            resolve(response)
          }
        )
      } catch (err) {
        reject(err)
      }
    })
    markTweetSaved(url)
    btn.innerHTML = SAVED_SVG
    btn.style.color = '#00ba7c'
    btn.style.background = 'transparent'
    btn.dataset.saved = 'true'
    btn.title = 'Already saved to Blog'
    const blogUrl = result.base ? result.base + '/bookmarks/public' : null
    showToast('推文已保存到博客', blogUrl)
  } catch (err) {
    if (isContextInvalidatedError(err)) {
      recoverInvalidatedContext()
      return
    }
    btn.innerHTML = BLOG_SVG
    btn.style.color = '#f4212e'
    btn.title = err.message || 'Save failed'
    showToast('保存失败: ' + (err.message || '未知错误'), null)
    setTimeout(function () {
      btn.style.color = '#536471'
      btn.title = 'Save to Blog'
    }, 3000)
  } finally {
    btn.disabled = false
  }
}

function processArticles() {
  const articles = document.querySelectorAll('article')
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    if (article.getAttribute(PROCESSED_ATTR)) continue
    const tweetUrl = getTweetUrl(article)
    if (!tweetUrl) continue
    const actionBar = article.querySelector('[role="group"]')
    if (!actionBar) continue
    article.setAttribute(PROCESSED_ATTR, 'true')
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'display:inline-flex;align-items:center;'
    wrapper.appendChild(createSaveButton(article, tweetUrl))
    actionBar.appendChild(wrapper)
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type !== 'GET_TWEET_CONTEXT') {
    return
  }

  const article =
    getTweetArticleByUrl(message.url) || document.querySelector('article')

  if (!article) {
    sendResponse({ url: message.url || window.location.href, text: '' })
    return
  }

  sendResponse(getTweetContext(article, message.url))
})

processArticles()
const observer = new MutationObserver(function () {
  processArticles()
})
observer.observe(document.body, { childList: true, subtree: true })
