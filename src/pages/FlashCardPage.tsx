import { useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useWords } from '@/hooks/useWords'
import { useBookmarkToggle } from '@/hooks/useBookmarkToggle'
import { isValidLevel } from '@/constants/jlpt'
import type { JlptLevel } from '@/types'
import styles from './FlashCardPage.module.css'

// カード本体: 훅はここで呼ぶ
const FlashCardView = ({ level, dayNumber }: { level: JlptLevel; dayNumber: number }) => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null)

  const { words: rawWords, loading, error } = useWords(level, dayNumber)
  const { words, toggle, bookmarkError } = useBookmarkToggle(rawWords)

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(`/study/${level}/${dayNumber}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="뒤로"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">
            {level.toUpperCase()} · DAY {dayNumber}
          </h1>
        </div>
        <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(`/study/${level}/${dayNumber}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="뒤로"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">
            {level.toUpperCase()} · DAY {dayNumber}
          </h1>
        </div>
        <p className="text-slate-400 text-sm">학습 가능한 단어가 없습니다.</p>
      </div>
    )
  }

  // currentIndexが範囲外になるケースの安全処置
  const validIndex = Math.max(0, Math.min(currentIndex, words.length - 1))
  const currentWord = words[validIndex]
  const total = words.length
  const progressPercent = ((validIndex + 1) / total) * 100

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => navigate(`/study/${level}/${dayNumber}`)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="뒤로"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 flex-1">
          {level.toUpperCase()} · DAY {dayNumber}
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          {validIndex + 1} / {total}
        </p>
      </div>

      {/* 진행바 */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full mb-12">
        <div
          className={styles.progressBar}
          style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}
        />
      </div>

      {/* 에러 배너 */}
      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      {bookmarkError && (
        <p className="text-orange-500 text-sm mb-4 bg-orange-50 rounded-lg px-3 py-2">
          {bookmarkError}
        </p>
      )}

      {/* 3D フリップカード */}
      <div className="flex justify-center mb-8 overflow-hidden">
        <div className={`${styles.container} w-full max-w-md`}>
          <div
            key={validIndex}
            className={
              direction === 'next'
                ? styles.slideFromRight
                : direction === 'prev'
                  ? styles.slideFromLeft
                  : undefined
            }
          >
            <div
              className={`${styles.inner} ${isFlipped ? styles.flipped : ''} w-full h-64 rounded-3xl shadow-lg`}
              onClick={() => setIsFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIsFlipped((f) => !f)
              }}
              aria-label={
                isFlipped
                  ? `카드 뒷면: ${currentWord.korean} · 클릭하면 뒤집기`
                  : `카드 앞면: ${currentWord.japanese} · 클릭하면 뒤집기`
              }
            >
              {/* 앞면: 일본어 */}
              <div className={`${styles.face} bg-indigo-50 rounded-3xl flex flex-col items-center justify-center p-8`}>
                <p className="text-5xl font-bold text-indigo-600 text-center">
                  {currentWord.japanese}
                </p>
                <p className="text-xl text-indigo-400 mt-3 text-center">{currentWord.hiragana}</p>
              </div>
              {/* 뒷면: 한국어 */}
              <div className={`${styles.face} ${styles.back} bg-slate-100 rounded-3xl flex items-center justify-center p-8`}>
                <p className="text-4xl font-bold text-slate-800 text-center">{currentWord.korean}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setDirection('prev')
            setCurrentIndex((i) => i - 1)
            setIsFlipped(false)
          }}
          disabled={validIndex === 0}
          className="p-3 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="이전 카드"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          type="button"
          onClick={() => toggle(currentWord.id)}
          className="p-3 rounded-xl text-indigo-400 hover:bg-indigo-50 transition-colors"
          aria-label={currentWord.bookmarked ? '북마크 해제' : '북마크 추가'}
        >
          {currentWord.bookmarked ? (
            <BookmarkCheck size={24} className="text-indigo-500" />
          ) : (
            <Bookmark size={24} />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setDirection('next')
            setCurrentIndex((i) => i + 1)
            setIsFlipped(false)
          }}
          disabled={validIndex === words.length - 1}
          className="p-3 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="다음 카드"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {validIndex === words.length - 1 && (
        <button
          type="button"
          onClick={() => navigate(`/study/${level}/${dayNumber}`)}
          className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          학습 완료
        </button>
      )}
    </div>
  )
}

// URLパラメータ検証 → FlashCardViewへ委譲
export const FlashCardPage = () => {
  const { level, dayId } = useParams<{ level?: string; dayId?: string }>()

  if (!isValidLevel(level) || !dayId) {
    return <Navigate to="/study" replace />
  }
  const dayNumber = parseInt(dayId, 10)
  if (isNaN(dayNumber) || dayNumber <= 0 || dayNumber > 999) {
    return <Navigate to={`/study/${level}`} replace />
  }

  return <FlashCardView level={level} dayNumber={dayNumber} />
}
