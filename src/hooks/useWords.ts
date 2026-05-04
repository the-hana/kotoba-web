import { useEffect, useState } from 'react'
import { getWords } from '@/api/words'
import { getWordDays } from '@/api/wordDays'
import { updateStudySession } from '@/api/studySession'
import { toErrorMessage } from '@/utils/errorMessage'
import type { Word, JlptLevel } from '@/types'

export const useWords = (level: JlptLevel, dayNumber: number) => {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    // getWordDaysの失敗で単語表示がブロックされないようallSettledを使用
    Promise.allSettled([
      getWords({ jlpt_level: level, day_number: dayNumber }, controller.signal),
      getWordDays(level, controller.signal),
    ])
      .then(([wordsResult, daysResult]) => {
        if (controller.signal.aborted) return

        if (wordsResult.status === 'fulfilled') {
          const res = wordsResult.value
          if (res.data.success) {
            setWords(res.data.data)
          } else {
            setError(toErrorMessage(res.data.error))
          }
        } else {
          setError('단어를 불러오지 못했습니다.')
        }

        // 学習セッションを更新（fire-and-forget）
        if (daysResult.status === 'fulfilled' && daysResult.value.data.success) {
          const wordDay = daysResult.value.data.data.find((d) => d.day_number === dayNumber)
          if (wordDay) {
            updateStudySession(wordDay.id).catch((err) => {
              console.warn('学習セッションの更新に失敗しました:', err)
            })
          }
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('단어를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [level, dayNumber])

  return { words, loading, error }
}
