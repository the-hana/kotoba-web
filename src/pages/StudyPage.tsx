import { useNavigate, useParams } from 'react-router-dom'
import { Bookmark, BookmarkCheck, ChevronLeft } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useWordDays } from '@/hooks/useWordDays'
import { useWords } from '@/hooks/useWords'
import { useBookmarkToggle } from '@/hooks/useBookmarkToggle'
import { JLPT_LEVELS } from '@/constants/jlpt'
import type { JlptLevel } from '@/types'

const isValidLevel = (l: string | undefined): l is JlptLevel =>
  !!l && (JLPT_LEVELS as string[]).includes(l)

// レベル選択グリッド
const LevelSelectView = () => {
  const navigate = useNavigate()
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">단어학습</h1>
      <div className="grid grid-cols-5 gap-3">
        {JLPT_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => navigate(`/study/${level}`)}
            className="bg-white rounded-2xl p-4 shadow-sm text-center hover:ring-2 hover:ring-indigo-400 transition-all"
          >
            <p className="font-bold text-indigo-500 text-lg">{level.toUpperCase()}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// DAYリスト
const DayListView = ({ level }: { level: JlptLevel }) => {
  const navigate = useNavigate()
  const { data: wordDays, loading, error } = useWordDays(level)

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/study')}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="뒤로"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">{level.toUpperCase()} 단어학습</h1>
      </div>

      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : wordDays.length === 0 ? (
        <p className="text-slate-400 text-sm">학습 가능한 DAY가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {wordDays.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => navigate(`/study/${level}/${day.day_number}`)}
              className="bg-white rounded-2xl p-4 shadow-sm text-center hover:ring-2 hover:ring-indigo-400 transition-all"
            >
              <p className="text-xs text-slate-400 mb-0.5">DAY</p>
              <p className="font-bold text-indigo-500 text-lg">{day.day_number}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 単語リスト
const WordListView = ({ level, dayNumber }: { level: JlptLevel; dayNumber: number }) => {
  const navigate = useNavigate()
  const { words: rawWords, loading, error } = useWords(level, dayNumber)
  const { words, toggle, bookmarkError } = useBookmarkToggle(rawWords)

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(`/study/${level}`)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="뒤로"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          {level.toUpperCase()} · DAY {dayNumber}
        </h1>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/study/${level}/${dayNumber}/flashcard`)}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors mb-4"
      >
        플래시카드로 학습
      </button>

      {bookmarkError && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{bookmarkError}</p>
      )}

      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : words.length === 0 ? (
        <p className="text-slate-400 text-sm">단어가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {words.map((word) => (
            <div
              key={word.id}
              className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-2xl font-bold text-slate-800">{word.japanese}</p>
                <p className="text-sm text-slate-400 mt-0.5">{word.hiragana}</p>
                <p className="text-base text-slate-600 mt-1">{word.korean}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(word.id)}
                className="p-2 rounded-xl text-indigo-400 hover:bg-indigo-50 transition-colors"
                aria-label={word.bookmarked ? '북마크 해제' : '북마크 추가'}
              >
                {word.bookmarked ? (
                  <BookmarkCheck size={22} className="text-indigo-500" />
                ) : (
                  <Bookmark size={22} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const StudyPage = () => {
  const { level, dayId } = useParams<{ level?: string; dayId?: string }>()

  if (isValidLevel(level) && dayId) {
    const dayNumber = parseInt(dayId, 10)
    // 範囲外のDAY番号は無効とみなしてDAYリストに戻す
    if (!isNaN(dayNumber) && dayNumber > 0 && dayNumber <= 999) {
      return <WordListView level={level} dayNumber={dayNumber} />
    }
  }

  if (isValidLevel(level)) return <DayListView level={level} />

  return <LevelSelectView />
}
