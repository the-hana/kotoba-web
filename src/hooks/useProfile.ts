import { useState, useEffect } from 'react'
import { getProfile, updateProfile, deleteProfile } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import { toErrorMessage } from '@/utils/errorMessage'
import type { JlptLevel, User } from '@/types'

export const useProfile = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ニックネーム inline edit
  const [isEditing, setIsEditing] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // target_level ドロップダウン
  const [editLevel, setEditLevel] = useState<JlptLevel>('n5')

  // アカウント削除
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    getProfile(controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        if (res.data.success) {
          setProfile(res.data.data)
          setEditNickname(res.data.data.nickname)
          setEditLevel(res.data.data.target_level)
        } else {
          setError(toErrorMessage(res.data.error))
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('프로필을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  const startEdit = () => {
    if (profile) setEditNickname(profile.nickname)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    if (profile) setEditNickname(profile.nickname)
    setIsEditing(false)
  }

  const saveNickname = async () => {
    if (!editNickname.trim()) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await updateProfile({ nickname: editNickname.trim() })
      if (res.data.success) {
        setProfile(res.data.data)
        setIsEditing(false)
      } else {
        setError(toErrorMessage(res.data.error))
      }
    } catch {
      setError('닉네임 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const saveLevel = async (level: JlptLevel) => {
    const prev = editLevel
    setEditLevel(level)
    setError(null)
    try {
      const res = await updateProfile({ target_level: level })
      if (res.data.success) {
        setProfile(res.data.data)
        setEditLevel(res.data.data.target_level)
      } else {
        setError(toErrorMessage(res.data.error))
        setEditLevel(prev)
      }
    } catch {
      setError('목표 레벨 저장에 실패했습니다.')
      setEditLevel(prev)
    }
  }

  // clearAuthのみ内部処理、navigateは呼び出し元で行う
  const deleteAccount = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      const res = await deleteProfile()
      if (res.data.success) {
        clearAuth()
        return true
      } else {
        setError(toErrorMessage(res.data.error))
        return false
      }
    } catch {
      setError('회원 탈퇴에 실패했습니다.')
      return false
    } finally {
      setIsDeleting(false)
    }
  }

  return {
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
  }
}
