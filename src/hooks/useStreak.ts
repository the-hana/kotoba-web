import { useEffect, useState } from 'react'
import { getStudySession } from '@/api/studySession'
import type { StudySession, StreakStatus } from '@/types'

export const useStreak = () => {
  const [session, setSession] = useState<StudySession | null>(null)
  const [status, setStatus] = useState<StreakStatus>('none')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getStudySession(controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        if (!res.data.success) {
          setError(typeof res.data.error === 'string' ? res.data.error : res.data.error.join(', '))
          return
        }
        const s = res.data.data
        if (!s) {
          setStatus('none')
          return
        }
        setSession(s)

        // updated_atを基準にローカルカレンダー日数差でストリーク判定
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const updated = new Date(s.updated_at)
        updated.setHours(0, 0, 0, 0)
        const diffDays = Math.floor((today.getTime() - updated.getTime()) / 86400000)

        if (diffDays === 0) setStatus('today')
        else if (diffDays === 1) setStatus('yesterday')
        else setStatus('broken')
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('학습 현황을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  return { session, status, loading, error }
}
