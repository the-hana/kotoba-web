import axios from 'axios'
import { useEffect, useRef } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export const ProtectedRoute = () => {
  const { accessToken, isInitialized, setTokens, clearAuth, setInitialized } = useAuthStore()
  // StrictMode二重実行でrefreshが2回飛ばないようにフラグで制御
  const refreshingRef = useRef(false)

  useEffect(() => {
    if (isInitialized) return
    if (refreshingRef.current) return
    refreshingRef.current = true

    const refreshToken = useAuthStore.getState().refreshToken
    if (!refreshToken) {
      setInitialized()
      return
    }

    // interceptorを経由させないためaxiosを直接使用
    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`, { refresh_token: refreshToken })
      .then((res) => {
        if (!res.data.success) throw new Error()
        const { access_token, refresh_token } = res.data.data
        setTokens(access_token, refresh_token)
      })
      .catch(() => clearAuth())
      .finally(() => setInitialized())
  }, [isInitialized, setTokens, clearAuth, setInitialized])

  if (!isInitialized) return <LoadingSpinner />
  if (!accessToken) return <Navigate to="/login" replace />
  return <Outlet />
}
