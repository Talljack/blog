// background.js - Service worker for save-tweet extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'SAVE_TWEET') {
    handleSaveTweet(message.url).then(sendResponse)
    return true
  }
})

async function handleSaveTweet(url) {
  try {
    const data = await chrome.storage.sync.get(['apiUrl', 'token'])
    if (!data.token)
      return { error: 'No token configured. Open extension options.' }
    const base = (data.apiUrl || 'https://www.talljack.me').replace(/\/+$/, '')
    const res = await fetch(base + '/api/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + data.token,
      },
      body: JSON.stringify({ url: url, tags: [], notes: '', isPublic: false }),
    })
    if (!res.ok) {
      const body = await res.json().catch(function () {
        return {}
      })
      return { error: body.error || 'HTTP ' + res.status }
    }
    return { success: true }
  } catch (err) {
    return { error: err.message || 'Network error' }
  }
}
