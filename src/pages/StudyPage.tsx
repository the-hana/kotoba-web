import type { JlptLevel } from '@/types'
import { useNavigate } from 'react-router-dom'

const LEVELS: JlptLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1']

export const StudyPage = () => {
  const navigate = useNavigate()
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">단어학습</h1>
      <div className="grid grid-cols-5 gap-3">
        {LEVELS.map((level) => (
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
