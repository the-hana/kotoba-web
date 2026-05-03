import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { toErrorMessage } from '@/utils/errorMessage'
import { JLPT_LEVELS } from '@/constants/jlpt'
import type { JlptLevel } from '@/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = {
  email?: string
  nickname?: string
  password?: string
  passwordConfirm?: string
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const next: FieldErrors = {}
    if (!EMAIL_RE.test(form.email.trim())) next.email = '올바른 이메일 형식이 아닙니다.'
    if (!form.nickname.trim()) next.nickname = '닉네임을 입력해주세요.'
    if (form.password.length < 6) next.password = '비밀번호는 6자 이상이어야 합니다.'
    if (form.password !== form.password_confirmation) next.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError(null)
    try {
      const res = await signup({ ...form, email: form.email.trim(), nickname: form.nickname.trim() })
      if (!res.data.success) {
        setError(toErrorMessage(res.data.error))
        return
      }
      const { access_token, refresh_token } = res.data.data
      setTokens(access_token, refresh_token)
      navigate('/dashboard')
    } catch {
      setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const setField =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      const errorKey = key === 'password_confirmation' ? 'passwordConfirm' : key as keyof FieldErrors
      setFieldErrors((prev) => ({ ...prev, [errorKey]: undefined }))
    }

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
              onChange={setField('email')}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${fieldErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-500'}`}
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-slate-700 mb-1">닉네임</label>
            <input
              id="nickname"
              type="text"
              value={form.nickname}
              onChange={setField('nickname')}
              maxLength={30}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${fieldErrors.nickname ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-500'}`}
            />
            {fieldErrors.nickname && <p className="text-red-500 text-xs mt-1">{fieldErrors.nickname}</p>}
          </div>
          <div>
            <label htmlFor="target_level" className="block text-sm font-medium text-slate-700 mb-1">목표 레벨</label>
            <select
              id="target_level"
              value={form.target_level}
              onChange={setField('target_level')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {JLPT_LEVELS.map((l) => (
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
              onChange={setField('password')}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${fieldErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-500'}`}
            />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-1">비밀번호 확인</label>
            <input
              id="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={setField('password_confirmation')}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${fieldErrors.passwordConfirm ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-500'}`}
            />
            {fieldErrors.passwordConfirm && <p className="text-red-500 text-xs mt-1">{fieldErrors.passwordConfirm}</p>}
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
