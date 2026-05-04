import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined
if (!baseURL) throw new Error('VITE_API_BASE_URL が設定されていません')

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Bearerトークンを全リクエストに付与
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Race condition対応: 401が同時に複数来てもrefreshは1回だけ
let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // ログイン・サインアップは未認証状態のためリフレッシュ対象外
    if (original.url?.includes('/auth/login') || original.url?.includes('/auth/signup')) {
      return Promise.reject(error)
    }

    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState()

    if (!refreshToken) {
      clearAuth()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(original))
          },
          reject,
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { accessToken: currentAccessToken, userId } = useAuthStore.getState()
      const refreshHeaders: Record<string, string> = {}
      if (currentAccessToken) refreshHeaders['Authorization'] = `Bearer ${currentAccessToken}`

      const res = await axios.post(
        `${baseURL}/api/v1/auth/refresh`,
        { refresh_token: refreshToken, user_id: userId },
        { headers: refreshHeaders },
      )
      if (!res.data.success) throw new Error('refresh failed')
      const { access_token, refresh_token } = res.data.data
      setTokens(access_token, refresh_token)
      processQueue(null, access_token)
      original.headers.Authorization = `Bearer ${access_token}`
      return apiClient(original)
    } catch (err) {
      processQueue(err, null)
      clearAuth()
      window.location.href = '/login'
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)
