'use client'

import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

export const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) => {
    const { user } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        if (!user) {
            router.push('/login')
        } else if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
            router.push(`/dashboard/${user.role}`)
        }
    }, [user, allowedRoles, router])

    if (!user || (allowedRoles && user.role && !allowedRoles.includes(user.role))) {
        return null // or a loading spinner
    }

    return <>{children}</>
}
