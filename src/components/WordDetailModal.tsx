import { useEffect, useRef } from 'react'
import type { DailyStoryWord } from '@/types'

interface Props {
  word: DailyStoryWord
  onClose: () => void
}

export const WordDetailModal = ({ word, onClose }: Props) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // モーダルオープン時にフォーカスをクローズボタンへ移動
    closeButtonRef.current?.focus()

    // body scrollをロック
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={word.japanese}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-3xl font-bold text-slate-800">{word.japanese}</p>
            <p className="text-sm text-slate-500 mt-1">{word.hiragana}</p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <p className="text-lg font-semibold text-indigo-600 mb-4">{word.korean}</p>

        {word.example_sentence && (
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <p className="text-sm text-slate-700">{word.example_sentence}</p>
            {word.example_sentence_korean && (
              <p className="text-sm text-slate-500">{word.example_sentence_korean}</p>
            )}
          </div>
        )}

        <span className="inline-block mt-4 text-xs font-medium bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">
          {word.jlpt_level}
        </span>
      </div>
    </div>
  )
}
