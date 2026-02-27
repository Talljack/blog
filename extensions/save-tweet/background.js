// background.js - Service worker for save-tweet extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'SAVE_TWEET') {
    handleSaveTweet(message.url, message.text).then(sendResponse)
    return true
  }
})

async function handleSaveTweet(url, text) {
  try {
    const data = await chrome.storage.sync.get(['apiUrl', 'token'])
    if (!data.token)
      return { error: 'No token configured. Open extension options.' }
    const base = (data.apiUrl || 'https://www.talljack.me').replace(/\/+$/, '')
    const body = { url: url, tags: [], notes: '', isPublic: true }
    if (text) body.metadata = { text: text }
    const res = await fetch(base + '/api/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + data.token,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const errorBody = await res.json().catch(function () {
        return {}
      })
      return { error: errorBody.error || 'HTTP ' + res.status }
    }
    return { success: true, base: base }
  } catch (err) {
    return { error: err.message || 'Network error' }
  }
}
