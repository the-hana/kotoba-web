import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { ChevronDown } from 'lucide-react'
import { logout } from '@/api/auth'
import { changePassword } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import { useProfile } from '@/hooks/useProfile'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { JLPT_LEVELS } from '@/constants/jlpt'

type PasswordForm = { current: string; next: string; confirm: string }
type PasswordErrors = { current?: string; next?: string; confirm?: string }

export const ProfilePage = () => {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const {
    profile,
    loading,
    error,
    isEditing,
    editNickname,
    setEditNickname,
    startEdit,
    cancelEdit,
    isSaving,
    saveNickname,
    editLevel,
    saveLevel,
    isDeleting,
    deleteAccount,
  } = useProfile()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isLevelOpen, setIsLevelOpen] = useState(false)
  const levelRef = useRef<HTMLDivElement>(null)

  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [pwForm, setPwForm] = useState<PasswordForm>({ current: '', next: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState<PasswordErrors>({})
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  // ドロップダウン外クリックで閉じる（開いている時だけリスナーを登録）
  useEffect(() => {
    if (!isLevelOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (levelRef.current && !levelRef.current.contains(e.target as Node)) {
        setIsLevelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isLevelOpen])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  const validatePassword = (): boolean => {
    const next: PasswordErrors = {}
    if (!pwForm.current) next.current = '현재 비밀번호를 입력해주세요.'
    if (pwForm.next.length < 6) next.next = '비밀번호는 6자 이상이어야 합니다.'
    if (pwForm.next !== pwForm.confirm) next.confirm = '비밀번호가 일치하지 않습니다.'
    setPwErrors(next)
    return Object.keys(next).length === 0
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return
    setPwSaving(true)
    setPwError(null)
    setPwSuccess(false)
    try {
      await changePassword({ current_password: pwForm.current, new_password: pwForm.next })
      setPwSuccess(true)
      setPwForm({ current: '', next: '', confirm: '' })
      setIsPasswordOpen(false)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        setPwError('현재 비밀번호가 올바르지 않거나 새 비밀번호가 조건을 충족하지 않습니다.')
      } else {
        setPwError('비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setPwSaving(false)
    }
  }

  const cancelPassword = () => {
    setIsPasswordOpen(false)
    setPwForm({ current: '', next: '', confirm: '' })
    setPwErrors({})
    setPwError(null)
    setPwSuccess(false)
  }

  const handleDeleteAccount = async () => {
    const success = await deleteAccount()
    if (success) navigate('/login')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">프로필</h1>

      {/* エラー表示 */}
      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      {/* プロフィールカード */}
      {profile && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6 mb-4">
          {/* メール (read-only) */}
          <div>
            <p className="text-xs text-slate-400 mb-1">이메일</p>
            <p className="text-slate-700">{profile.email}</p>
          </div>

          {/* ニックネーム inline edit */}
          <div>
            <p className="text-xs text-slate-400 mb-1">닉네임</p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  maxLength={30}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveNickname()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveNickname}
                  disabled={isSaving || !editNickname.trim()}
                  className="px-3 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? '저장 중...' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={isSaving}
                  className="px-3 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-slate-700">{profile.nickname}</p>
                <button
                  type="button"
                  onClick={startEdit}
                  className="text-xs text-indigo-500 px-2 py-1 rounded hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  수정
                </button>
              </div>
            )}
          </div>

          {/* パスワード変更 */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">비밀번호</p>
              {!isPasswordOpen && (
                <button
                  type="button"
                  onClick={() => { setIsPasswordOpen(true); setPwError(null); setPwSuccess(false) }}
                  className="text-xs text-indigo-500 px-2 py-1 rounded hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  변경
                </button>
              )}
            </div>
            {pwSuccess && !isPasswordOpen && (
              <p className="text-green-600 text-xs mt-1">비밀번호가 변경되었습니다.</p>
            )}
            {isPasswordOpen && (
              <form onSubmit={handlePasswordSubmit} noValidate className="mt-3 space-y-3">
                {pwError && <p className="text-red-500 text-xs">{pwError}</p>}
                <div>
                  <input
                    type="password"
                    placeholder="현재 비밀번호"
                    value={pwForm.current}
                    onChange={(e) => { setPwForm((f) => ({ ...f, current: e.target.value })); setPwErrors((prev) => ({ ...prev, current: undefined })) }}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${pwErrors.current ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-300'}`}
                  />
                  {pwErrors.current && <p className="text-red-500 text-xs mt-1">{pwErrors.current}</p>}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="새 비밀번호 (6자 이상)"
                    value={pwForm.next}
                    onChange={(e) => { setPwForm((f) => ({ ...f, next: e.target.value })); setPwErrors((prev) => ({ ...prev, next: undefined, confirm: undefined })) }}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${pwErrors.next ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-300'}`}
                  />
                  {pwErrors.next && <p className="text-red-500 text-xs mt-1">{pwErrors.next}</p>}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={pwForm.confirm}
                    onChange={(e) => { setPwForm((f) => ({ ...f, confirm: e.target.value })); setPwErrors((prev) => ({ ...prev, confirm: undefined })) }}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${pwErrors.confirm ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-300'}`}
                  />
                  {pwErrors.confirm && <p className="text-red-500 text-xs mt-1">{pwErrors.confirm}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="flex-1 bg-indigo-500 text-white text-sm rounded-lg py-2 hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                  >
                    {pwSaving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelPassword}
                    disabled={pwSaving}
                    className="flex-1 border border-slate-200 text-slate-600 text-sm rounded-lg py-2 hover:bg-slate-50 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* target_level カスタムドロップダウン (即時保存) */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">목표 레벨</p>
            <div ref={levelRef} className="relative inline-block">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isLevelOpen}
                onClick={() => setIsLevelOpen((prev) => !prev)}
                onKeyDown={(e) => e.key === 'Escape' && setIsLevelOpen(false)}
                className="flex items-center gap-3 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors min-w-[7rem]"
              >
                <span className="flex-1 text-left">{editLevel.toUpperCase()}</span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${isLevelOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isLevelOpen && (
                <ul
                  role="listbox"
                  aria-label="목표 레벨"
                  onKeyDown={(e) => e.key === 'Escape' && setIsLevelOpen(false)}
                  className="absolute left-0 top-full mt-1 z-10 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden min-w-[7rem]"
                >
                  {JLPT_LEVELS.map((lv) => (
                    <li key={lv} role="option" aria-selected={editLevel === lv}>
                      <button
                        type="button"
                        onClick={() => {
                          saveLevel(lv)
                          setIsLevelOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-indigo-50 hover:text-indigo-600 ${
                          editLevel === lv ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700'
                        }`}
                      >
                        {lv.toUpperCase()}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ログアウトボタン */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full border border-indigo-300 text-indigo-600 rounded-lg py-2 text-sm hover:bg-indigo-50 transition-colors mb-3"
      >
        로그아웃
      </button>

      {/* アカウント削除ボタン */}
      <button
        type="button"
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full border border-red-200 text-red-500 rounded-lg py-2 text-sm hover:bg-red-50 transition-colors"
      >
        회원 탈퇴
      </button>

      {/* アカウント削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-2">회원 탈퇴</h2>
            <p className="text-sm text-slate-500 mb-6">
              정말 탈퇴하시겠습니까?<br />
              탈퇴 후 모든 데이터가 삭제되며 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2 text-sm hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? '탈퇴 중...' : '탈퇴'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
