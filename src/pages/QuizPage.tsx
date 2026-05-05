import { useEffect, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useWords } from '@/hooks/useWords'
import { isValidLevel } from '@/constants/jlpt'
import type { JlptLevel, Word } from '@/types'
import styles from './QuizPage.module.css'

interface QuizQuestion {
  word: Word
  options: Word[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuizQuestions(words: Word[]): QuizQuestion[] {
  return shuffle(words).map((word) => {
    const distractors = shuffle(words.filter((w) => w.id !== word.id)).slice(0, 3)
    return { word, options: shuffle([word, ...distractors]) }
  })
}

const QuizView = ({ level, dayNumber }: { level: JlptLevel; dayNumber: number }) => {
  const navigate = useNavigate()
  const { words: rawWords, loading, error } = useWords(level, dayNumber)

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (rawWords.length >= 4) setQuestions(buildQuizQuestions(rawWords))
  }, [rawWords])

  // 答え選択後、自動で次の問題へ
  useEffect(() => {
    if (selectedId === null) return
    const timer = setTimeout(() => {
      setCurrentIndex((i) => i + 1)
      setSelectedId(null)
    }, 900)
    return () => clearTimeout(timer)
  }, [selectedId])

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

  if (rawWords.length < 4) {
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
        <p className="text-slate-400 text-sm">퀴즈에 필요한 단어가 부족합니다. (최소 4개)</p>
      </div>
    )
  }

  const answered = selectedId !== null
  const finished = questions.length > 0 && currentIndex >= questions.length

  // 結果画面
  if (finished) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-full flex items-center gap-3 mb-10">
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

        <p className="text-6xl font-bold text-indigo-500 mb-2">
          {score}
          <span className="text-3xl text-slate-400 font-medium"> / {questions.length}</span>
        </p>
        <p className="text-slate-500 text-sm mb-10">정답</p>

        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setQuestions(buildQuizQuestions(rawWords))
              setCurrentIndex(0)
              setSelectedId(null)
              setScore(0)
            }}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            다시 풀기
          </button>
          <button
            type="button"
            onClick={() => navigate(`/study/${level}/${dayNumber}`)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors"
          >
            단어 목록으로
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) return <LoadingSpinner />

  const current = questions[currentIndex]
  const progressPercent = ((currentIndex + 1) / questions.length) * 100

  const handleSelect = (word: Word) => {
    if (answered) return
    setSelectedId(word.id)
    if (word.id === current.word.id) setScore((s) => s + 1)
  }

  const getOptionClass = (word: Word): string => {
    const isCorrect = word.id === current.word.id
    const isSelected = word.id === selectedId

    if (!answered) {
      return 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-800'
    }
    if (isSelected && isCorrect) {
      return 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700'
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-50 border-2 border-red-400 text-red-700'
    }
    if (!isSelected && isCorrect) {
      return 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700'
    }
    return 'bg-white border border-slate-200 text-slate-400'
  }

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
          {currentIndex + 1} / {questions.length}
        </p>
      </div>

      {/* 進捗バー */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full mb-10">
        <div
          className={styles.progressBar}
          style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}
        />
      </div>

      {/* 問題: 日本語 */}
      <div className="flex flex-col items-center mb-10">
        <p className="text-5xl font-bold text-indigo-600 text-center">{current.word.japanese}</p>
        <p className="text-xl text-indigo-400 mt-3 text-center">{current.word.hiragana}</p>
      </div>

      {/* 選択肢 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {current.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option)}
            disabled={answered}
            className={`p-4 rounded-xl font-medium text-center transition-all disabled:cursor-default ${getOptionClass(option)}`}
          >
            {option.korean}
          </button>
        ))}
      </div>
    </div>
  )
}

export const QuizPage = () => {
  const { level, dayId } = useParams<{ level?: string; dayId?: string }>()

  if (!isValidLevel(level) || !dayId) {
    return <Navigate to="/study" replace />
  }
  const dayNumber = parseInt(dayId, 10)
  if (isNaN(dayNumber) || dayNumber <= 0 || dayNumber > 999) {
    return <Navigate to={`/study/${level}`} replace />
  }

  return <QuizView level={level} dayNumber={dayNumber} />
}
