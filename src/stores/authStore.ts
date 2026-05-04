import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'kotoba-auth'

// accessTokenはメモリ専用 — persistスコープ外で管理
interface MemoryState {
  accessToken: string | null
  isInitialized: boolean
}

// refreshTokenとuserIdをlocalStorageに永続化
interface PersistedState {
  refreshToken: string | null
  userId: number | null
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  setInitialized: () => void
}

type AuthStore = MemoryState & PersistedState & AuthActions

const decodeJwtPayload = (token: string): { user_id?: number } => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return {}
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      isInitialized: false,

      setTokens: (accessToken, refreshToken) => {
        const { user_id } = decodeJwtPayload(accessToken)
        set({ accessToken, refreshToken, userId: user_id ?? null })
      },

      clearAuth: () => set({ accessToken: null, refreshToken: null, userId: null }),

      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state): PersistedState => ({
        refreshToken: state.refreshToken,
        userId: state.userId,
      }),
    }
  )
)
