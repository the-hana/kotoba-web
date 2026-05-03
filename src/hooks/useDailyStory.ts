import { useEffect, useState } from 'react'
import { getDailyStory } from '@/api/dailyStory'
import { toErrorMessage } from '@/utils/errorMessage'
import type { DailyStory } from '@/types'

export const useDailyStory = () => {
  const [data, setData] = useState<DailyStory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getDailyStory(controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        if (res.data.success) setData(res.data.data)
        else setError(toErrorMessage(res.data.error))
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('스토리를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  return { data, loading, error }
}
