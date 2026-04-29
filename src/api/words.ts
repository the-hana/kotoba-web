import { apiClient } from './client'
import type { ApiResponse, Word, WordDetail, JlptLevel } from '@/types'

export const getWords = (params: { jlpt_level: JlptLevel; day_number?: number }, signal?: AbortSignal) =>
  apiClient.get<ApiResponse<Word[]>>('/api/v1/words', { params, signal })

export const getWord = (id: number) =>
  apiClient.get<ApiResponse<WordDetail>>(`/api/v1/words/${id}`)
