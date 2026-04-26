import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import type { JlptLevel } from '@/types'

const LEVELS: JlptLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1']

export const SignupPage = () => {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [form, setForm] = useState({
    email: '',
    nickname: '',
    password: '',
    password_confirmation: '',
    target_level: 'n5' as JlptLevel,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await signup(form)
      if (!res.data.success) throw new Error()
      const { access_token, refresh_token } = res.data.data
      setTokens(access_token, refresh_token)
      navigate('/dashboard')
    } catch {
      setError('회원가입에 실패했습니다. 입력 내용을 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">회원가입</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-slate-700 mb-1">닉네임</label>
            <input
              id="nickname"
              type="text"
              value={form.nickname}
              onChange={set('nickname')}
              required
              maxLength={30}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="target_level" className="block text-sm font-medium text-slate-700 mb-1">목표 레벨</label>
            <select
              id="target_level"
              value={form.target_level}
              onChange={set('target_level')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-1">비밀번호 확인</label>
            <input
              id="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={set('password_confirmation')}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4 text-center">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-indigo-500 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
