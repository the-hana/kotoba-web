import { useState, useEffect } from 'react'
import { getBookmarks } from '@/api/bookmarks'
import { toErrorMessage } from '@/utils/errorMessage'
import type { JlptLevel, Word } from '@/types'

export const useBookmarks = () => {
  const [level, setLevel] = useState<JlptLevel | undefined>(undefined)
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    getBookmarks(level ? { jlpt_level: level } : undefined, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        if (res.data.success) {
          setWords(res.data.data)
        } else {
          setError(toErrorMessage(res.data.error))
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('북마크를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [level])

  return { words, loading, error, level, setLevel }
}
