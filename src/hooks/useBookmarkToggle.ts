import { useState, useCallback } from 'react'
import { addBookmark, removeBookmark } from '@/api/bookmarks'
import type { Word } from '@/types'

// ローカルの楽観的更新をoverridesマップで管理し、initialWordsと合成する
export const useBookmarkToggle = (initialWords: Word[]) => {
  const [overrides, setOverrides] = useState<Record<number, boolean>>({})
  const [bookmarkError, setBookmarkError] = useState<string | null>(null)

  const words = initialWords.map((w) =>
    w.id in overrides ? { ...w, bookmarked: overrides[w.id] } : w,
  )

  const toggle = useCallback(
    async (wordId: number) => {
      const base = initialWords.find((w) => w.id === wordId)
      if (!base) return

      // overridesに上書きがあればそれを、なければサーバー値を現在の状態とする
      const currentBookmarked = wordId in overrides ? overrides[wordId] : base.bookmarked
      const newBookmarked = !currentBookmarked

      // 楽観的更新
      setOverrides((prev) => ({ ...prev, [wordId]: newBookmarked }))
      setBookmarkError(null)

      try {
        if (currentBookmarked) await removeBookmark(wordId)
        else await addBookmark(wordId)
      } catch {
        // ロールバック
        setOverrides((prev) => ({ ...prev, [wordId]: currentBookmarked }))
        setBookmarkError('북마크 처리에 실패했습니다.')
      }
    },
    [initialWords, overrides],
  )

  return { words, toggle, bookmarkError }
}
