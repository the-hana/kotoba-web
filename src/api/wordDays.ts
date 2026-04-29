import { apiClient } from './client'
import type { ApiResponse, WordDay, JlptLevel } from '@/types'

export const getWordDays = (jlpt_level: JlptLevel, signal?: AbortSignal) =>
  apiClient.get<ApiResponse<WordDay[]>>('/api/v1/word_days', { params: { jlpt_level }, signal })
