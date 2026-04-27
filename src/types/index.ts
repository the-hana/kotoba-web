export type JlptLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1'

export type StreakStatus = 'today' | 'yesterday' | 'broken' | 'none'

export type ApiResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string | string[] }

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface User {
  id: number
  email: string
  nickname: string
  target_level: JlptLevel
  created_at: string
}

export interface Word {
  id: number
  japanese: string
  hiragana: string
  korean: string
  jlpt_level: JlptLevel
  bookmarked: boolean
}

export interface AiContent {
  example_sentence: string
  example_sentence_korean: string
}

export interface WordDetail extends Word {
  ai_content: AiContent | null
}

export interface WordDay {
  id: number
  day_number: number
}

export interface StudySession {
  word_day_id: number
  jlpt_level: JlptLevel
  day_number: number
  streak_days: number
  updated_at: string
}

export interface DailyStoryWord {
  id: number
  japanese: string
  hiragana: string
  korean: string
  jlpt_level: JlptLevel
  example_sentence: string | null
  example_sentence_korean: string | null
}

export interface DailyStory {
  story_date: string
  content: string
  content_korean: string
  words: DailyStoryWord[]
}
