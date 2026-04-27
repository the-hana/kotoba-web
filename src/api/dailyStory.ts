import { apiClient } from './client'
import type { ApiResponse, DailyStory } from '@/types'

export const getDailyStory = (signal?: AbortSignal) =>
  apiClient.get<ApiResponse<DailyStory>>('/api/v1/daily_story', { signal })
