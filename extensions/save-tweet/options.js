const apiUrlInput = document.getElementById('apiUrl')
const tokenInput = document.getElementById('token')
const saveBtn = document.getElementById('save')
const statusEl = document.getElementById('status')

chrome.storage.sync.get(['apiUrl', 'token'], data => {
  apiUrlInput.value = data.apiUrl || 'https://www.talljack.me'
  tokenInput.value = data.token || ''
})

saveBtn.addEventListener('click', () => {
  const apiUrl = apiUrlInput.value.replace(/\/+$/, '')
  const token = tokenInput.value.trim()

  if (!apiUrl) {
    statusEl.textContent = 'Please enter a blog URL'
    statusEl.style.color = '#dc2626'
    return
  }
  if (!token) {
    statusEl.textContent = 'Please enter an admin token'
    statusEl.style.color = '#dc2626'
    return
  }

  chrome.storage.sync.set({ apiUrl, token }, () => {
    statusEl.textContent = 'Settings saved!'
    statusEl.style.color = '#16a34a'
    setTimeout(() => {
      statusEl.textContent = ''
    }, 2000)
  })
})
