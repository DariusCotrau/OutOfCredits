import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, UserProfile } from '../types'

interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  token: string | null
  setUser: (user: AuthUser, token: string) => void
  setProfile: (profile: UserProfile) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      setProfile: (profile) => set({ profile }),
      logout: () => set({ user: null, profile: null, token: null }),
    }),
    { name: 'chiriismart-auth' }
  )
)
