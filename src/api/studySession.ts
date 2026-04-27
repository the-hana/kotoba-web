import { apiClient } from './client'
import type { ApiResponse, StudySession } from '@/types'

export const getStudySession = (signal?: AbortSignal) =>
  apiClient.get<ApiResponse<StudySession | null>>('/api/v1/study_session', { signal })

export const updateStudySession = (word_day_id: number) =>
  apiClient.put<ApiResponse<StudySession>>('/api/v1/study_session', { word_day_id })
