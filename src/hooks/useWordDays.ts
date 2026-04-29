import { useEffect, useState } from 'react'
import { getWordDays } from '@/api/wordDays'
import type { WordDay, JlptLevel } from '@/types'

export const useWordDays = (level: JlptLevel) => {
  const [data, setData] = useState<WordDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getWordDays(level, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        if (res.data.success) setData(res.data.data)
        else
          setError(
            typeof res.data.error === 'string' ? res.data.error : res.data.error.join(', '),
          )
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('DAY 목록을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [level])

  return { data, loading, error }
}
