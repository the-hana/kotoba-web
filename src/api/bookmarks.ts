import { apiClient } from './client'
import type { ApiResponse, Word, JlptLevel } from '@/types'

export const getBookmarks = (params?: { jlpt_level?: JlptLevel }) =>
  apiClient.get<ApiResponse<Word[]>>('/api/v1/bookmarks', { params })

export const addBookmark = (wordId: number) =>
  apiClient.post<ApiResponse<null>>(`/api/v1/words/${wordId}/bookmark`)

export const removeBookmark = (wordId: number) =>
  apiClient.delete<ApiResponse<null>>(`/api/v1/words/${wordId}/bookmark`)
