import { apiClient } from './client'
import type { ApiResponse, AuthTokens, JlptLevel } from '@/types'

export const signup = (data: {
  email: string
  nickname: string
  password: string
  password_confirmation: string
  target_level: JlptLevel
}) => apiClient.post<ApiResponse<AuthTokens>>('/api/v1/auth/signup', data)

export const login = (data: { email: string; password: string }) =>
  apiClient.post<ApiResponse<AuthTokens>>('/api/v1/auth/login', data)

export const logout = () => apiClient.delete<ApiResponse<null>>('/api/v1/auth/logout')
