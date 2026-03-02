const TWEET_RE = /^https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/\d+/

const noTokenEl = document.getElementById('no-token')
const notTweetEl = document.getElementById('not-tweet')
const formEl = document.getElementById('form')
const tweetUrlEl = document.getElementById('tweet-url')
const tagsInput = document.getElementById('tags')
const notesInput = document.getElementById('notes')
const isPublicInput = document.getElementById('isPublic')
const saveBtn = document.getElementById('save-btn')
const statusEl = document.getElementById('status')

document.getElementById('open-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage()
})

function show(el) {
  el.classList.remove('hidden')
}

function showStatus(msg, ok) {
  statusEl.textContent = msg
  statusEl.className = 'status ' + (ok ? 'success' : 'error')
  show(statusEl)
}

function getTweetContextFromTab(tabId, url) {
  return new Promise(resolve => {
    chrome.tabs.sendMessage(
      tabId,
      { type: 'GET_TWEET_CONTEXT', url },
      response => {
        if (chrome.runtime.lastError || !response) {
          resolve({ url, text: '' })
          return
        }
        resolve(response)
      }
    )
  })
}

async function init() {
  const { apiUrl, token } = await chrome.storage.sync.get(['apiUrl', 'token'])

  if (!token) {
    show(noTokenEl)
    return
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const url = tab?.url || ''

  if (!TWEET_RE.test(url)) {
    show(notTweetEl)
    return
  }

  show(formEl)
  tweetUrlEl.textContent = url

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true
    saveBtn.textContent = 'Saving...'

    const tags = tagsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const base = (apiUrl || 'https://www.talljack.me').replace(/\/+$/, '')

    try {
      const context = await getTweetContextFromTab(tab.id, url)
      const body = {
        url: context.url || url,
        tags,
        notes: notesInput.value.trim(),
        isPublic: isPublicInput.checked,
      }

      if (context.text) {
        body.metadata = { text: context.text }
      }

      const res = await fetch(`${base}/api/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      showStatus('Saved!', true)
      setTimeout(() => window.close(), 1000)
    } catch (err) {
      showStatus(err.message, false)
      saveBtn.disabled = false
      saveBtn.textContent = 'Save Bookmark'
    }
  })
}

init()
