import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'kotoba-auth'

// accessTokenはメモリ専用 — persistスコープ外で管理
interface MemoryState {
  accessToken: string | null
  isInitialized: boolean
}

// refreshTokenのみlocalStorageに永続化
interface PersistedState {
  refreshToken: string | null
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  setInitialized: () => void
}

type AuthStore = MemoryState & PersistedState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isInitialized: false,

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      clearAuth: () => set({ accessToken: null, refreshToken: null }),

      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state): PersistedState => ({ refreshToken: state.refreshToken }),
    }
  )
)
