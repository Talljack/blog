// content.js - Inject save buttons into X/Twitter timeline
const PROCESSED_ATTR = 'data-blog-save-injected'
const STATUS_RE = /\/(\w+)\/status\/(\d+)/

const SAVE_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'

function getTweetUrl(article) {
  const links = article.querySelectorAll('a[href*="/status/"]')
  for (const link of links) {
    if (link.querySelector('time')) {
      const match = link.getAttribute('href').match(STATUS_RE)
      if (match) return 'https://x.com/' + match[1] + '/status/' + match[2]
    }
  }
  return null
}

function createSaveButton(tweetUrl) {
  const btn = document.createElement('button')
  btn.className = 'blog-save-btn'
  btn.title = 'Save to Blog'
  btn.innerHTML = SAVE_SVG
  btn.style.cssText =
    'display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:none;background:transparent;color:#536471;cursor:pointer;border-radius:9999px;font-size:13px;transition:all 0.2s;'
  btn.addEventListener('mouseenter', function () {
    btn.style.background = 'rgba(29,155,240,0.1)'
    btn.style.color = '#1d9bf0'
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
    saveTweet(btn, tweetUrl)
  })
  return btn
}

async function saveTweet(btn, url) {
  btn.disabled = true
  btn.innerHTML = '...'
  try {
    const resp = await chrome.runtime.sendMessage({
      type: 'SAVE_TWEET',
      url: url,
    })
    if (resp && resp.error) throw new Error(resp.error)
    btn.innerHTML = '\u2713'
    btn.style.color = '#00ba7c'
    btn.dataset.saved = 'true'
    setTimeout(function () {
      btn.innerHTML = SAVE_SVG
      btn.style.color = '#00ba7c'
    }, 1000)
  } catch (err) {
    btn.innerHTML = SAVE_SVG
    btn.style.color = '#f4212e'
    btn.title = err.message || 'Save failed'
    setTimeout(function () {
      btn.style.color = '#536471'
      btn.title = 'Save to Blog'
    }, 2000)
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
    wrapper.appendChild(createSaveButton(tweetUrl))
    actionBar.appendChild(wrapper)
  }
}

processArticles()
const observer = new MutationObserver(function () {
  processArticles()
})
observer.observe(document.body, { childList: true, subtree: true })
