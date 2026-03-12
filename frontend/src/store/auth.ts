import { create } from 'zustand'

export type Role = 'admin' | 'analyst' | 'umkm' | 'regulator' | null

interface AuthState {
    user: {
        id: string
        email: string
        role: Role
    } | null
    login: (email: string, role: Role) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: {
        id: 'USR-889',
        email: 'toko_sejahtera@gmail.com',
        role: 'umkm'
    },
    login: (email, role) => set({ user: { id: 'USR-889', email, role } }),
    logout: () => set({ user: null }),
}))
