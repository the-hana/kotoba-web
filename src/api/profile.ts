import { apiClient } from './client'
import type { ApiResponse, User, JlptLevel } from '@/types'

export const getProfile = (signal?: AbortSignal) =>
  apiClient.get<ApiResponse<User>>('/api/v1/profile', { signal })

export const updateProfile = (data: { nickname?: string; target_level?: JlptLevel }) =>
  apiClient.put<ApiResponse<User>>('/api/v1/profile', data)

export const deleteProfile = () => apiClient.delete<ApiResponse<null>>('/api/v1/profile')
