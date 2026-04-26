import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDailyStory } from '@/hooks/useDailyStory'
import { useStreak } from '@/hooks/useStreak'
import { WordDetailModal } from '@/components/WordDetailModal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { DailyStoryWord } from '@/types'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { data: story, loading: storyLoading, error: storyError } = useDailyStory()
  const { session, status, loading: streakLoading, error: streakError } = useStreak()
  const [selectedWord, setSelectedWord] = useState<DailyStoryWord | null>(null)

  const handleContinueStudy = () => {
    if (!session) {
      navigate('/study')
      return
    }
    // word_day_idではなくday_numberをURLに使う（Phase 2 StudyPageがday_numberで単語取得するため）
    navigate(`/study/${session.jlpt_level}/${session.day_number}`)
  }

  const handleCloseModal = useCallback(() => setSelectedWord(null), [])

  if (storyLoading || streakLoading) return <LoadingSpinner />

  // 連続中(今日・昨日)はstreak_days実数値、それ以外はデフォルト1を表示
  const isActive = status === 'today' || status === 'yesterday'
  const displayDays = isActive ? (session?.streak_days ?? 1) : 1

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">대시보드</h1>

      {/* 連続学習日カード */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">연속 학습일</p>
          {streakError ? (
            <p className="text-sm text-red-400">{streakError}</p>
          ) : (
            <div className="flex items-baseline gap-1">
              <p className={`text-4xl font-bold ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>
                {displayDays}
              </p>
              <span className={`text-lg font-semibold ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>
                일
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleContinueStudy}
          className="shrink-0 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          이어서 학습
        </button>
      </div>

      {/* 今日のAIストーリーカード */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-700 mb-3">오늘의 AI 스토리</p>

        {!story ? (
          <p className="text-slate-400 text-sm">{storyError ?? '스토리를 불러오지 못했습니다.'}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{story.content_korean}</p>

            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">이야기 속 단어</p>
            <div className="grid grid-cols-2 gap-2">
              {story.words.map((word) => (
                <button
                  key={word.id}
                  onClick={() => setSelectedWord(word)}
                  className="text-left bg-slate-50 hover:bg-indigo-50 rounded-xl px-3 py-2 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-800">{word.japanese}</p>
                  <p className="text-xs text-slate-500">{word.korean}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedWord && (
        <WordDetailModal word={selectedWord} onClose={handleCloseModal} />
      )}
    </div>
  )
}
