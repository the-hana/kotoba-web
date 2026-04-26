import { useNavigate } from 'react-router-dom'
import { logout } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

export const ProfilePage = () => {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">프로필</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <p className="text-slate-400 text-sm">준비 중...</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="w-full border border-red-200 text-red-500 rounded-lg py-2 text-sm hover:bg-red-50 transition-colors"
      >
        로그아웃
      </button>
    </div>
  )
}
