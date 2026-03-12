'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function Home() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      router.push(`/dashboard/${user.role}`)
    } else {
      router.push('/login')
    }
  }, [user, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading TownSync ERP...</p>
      </div>
    </div>
  )
}
