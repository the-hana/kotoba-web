import { apiClient } from './client'
import type { ApiResponse, DailyStory } from '@/types'

export const getDailyStory = () =>
  apiClient.get<ApiResponse<DailyStory>>('/api/v1/daily_story')
