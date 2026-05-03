import { BookmarkCheck } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useBookmarkToggle } from '@/hooks/useBookmarkToggle'
import type { JlptLevel } from '@/types'

const LEVEL_TABS: { label: string; value: JlptLevel | undefined }[] = [
  { label: '전체', value: undefined },
  { label: 'N5', value: 'n5' },
  { label: 'N4', value: 'n4' },
  { label: 'N3', value: 'n3' },
  { label: 'N2', value: 'n2' },
  { label: 'N1', value: 'n1' },
]

export const BookmarkPage = () => {
  const { words: rawWords, loading, error, level, setLevel } = useBookmarks()
  const { words, toggle, bookmarkError } = useBookmarkToggle(rawWords)

  // 楽観的更新でbookmarked=falseになった単語を即時非表示
  const visibleWords = words.filter((w) => w.bookmarked)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">단어장</h1>

      {/* レベルフィルタータブ */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {LEVEL_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setLevel(tab.value)}
            aria-pressed={level === tab.value}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              level === tab.value
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* エラー表示 */}
      {(bookmarkError || error) && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-xl px-3 py-2">
          {bookmarkError ?? error}
        </p>
      )}

      {/* ローディング: タブを維持したままビューポート中央にスピナー表示 */}
      {loading && <LoadingSpinner />}

      {/* 単語リスト */}
      {!loading && visibleWords.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-slate-400 text-sm">
            {level ? `${level.toUpperCase()} 북마크한 단어가 없습니다.` : '북마크한 단어가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleWords.map((word) => (
            <div
              key={word.id}
              className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-2xl font-bold text-slate-800">{word.japanese}</p>
                <p className="text-sm text-slate-400 mt-0.5">{word.hiragana}</p>
                <p className="text-base text-slate-600 mt-1">{word.korean}</p>
                <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500">
                  {word.jlpt_level.toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggle(word.id)}
                className="p-2 rounded-xl text-indigo-400 hover:bg-indigo-50 transition-colors"
                aria-label="북마크 해제"
              >
                <BookmarkCheck size={22} className="text-indigo-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
