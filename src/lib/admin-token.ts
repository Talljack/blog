const ADMIN_TOKEN_KEY = 'admin_token'

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
  document.cookie = `${ADMIN_TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  document.cookie = `${ADMIN_TOKEN_KEY}=; path=/; max-age=0`
}

export function isAdmin(): boolean {
  return !!getAdminToken()
}
