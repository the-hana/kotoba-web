import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { logout } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { useProfile } from '@/hooks/useProfile'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { JlptLevel } from '@/types'

const JLPT_LEVELS: JlptLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1']

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
