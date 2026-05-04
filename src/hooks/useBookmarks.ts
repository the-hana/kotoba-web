import { useState, useEffect, useReducer } from 'react'
import { getBookmarks } from '@/api/bookmarks'
import { toErrorMessage } from '@/utils/errorMessage'
import type { JlptLevel, Word } from '@/types'

type State = { loading: boolean; error: string | null; words: Word[] }
type Action =
  | { type: 'START' }
  | { type: 'SUCCESS'; words: Word[] }
  | { type: 'ERROR'; error: string }

function reducer(_: State, action: Action): State {
  switch (action.type) {
    case 'START': return { loading: true, error: null, words: [] }
    case 'SUCCESS': return { loading: false, error: null, words: action.words }
    case 'ERROR': return { loading: false, error: action.error, words: [] }
  }
}

export const useBookmarks = () => {
  const [level, setLevel] = useState<JlptLevel | undefined>(undefined)
  const [state, dispatch] = useReducer(reducer, { loading: true, error: null, words: [] })

  useEffect(() => {
    const controller = new AbortController()
    dispatch({ type: 'START' })

    getBookmarks(level ? { jlpt_level: level } : undefined, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        if (res.data.success) {
          dispatch({ type: 'SUCCESS', words: res.data.data })
        } else {
          dispatch({ type: 'ERROR', error: toErrorMessage(res.data.error) })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) dispatch({ type: 'ERROR', error: '북마크를 불러오지 못했습니다.' })
      })

    return () => controller.abort()
  }, [level])

  return { ...state, level, setLevel }
}
