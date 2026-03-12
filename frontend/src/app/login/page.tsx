'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, Role } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Home } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<Role>('regulator')
    const { login } = useAuthStore()
    const router = useRouter()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (email && role) {
            login(email, role)
            router.push(`/dashboard/${role}`)
        }
    }

    const handleDemoLogin = (demoRole: Role) => {
        login(`demo@${demoRole}.com`, demoRole)
        router.push(`/dashboard/${demoRole}`)
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <div className="mx-auto w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center text-primary">
                    <img src="/logo.png" alt="TownSync ERP" className="h-20 w-auto object-contain mb-4" />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>Enter your email below to login to your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input id="password" type="password" required defaultValue="password123" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Mock Role Selection</Label>
                                <Select value={role || undefined} onValueChange={(val) => setRole(val as Role)}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="analyst">Analyst</SelectItem>
                                        <SelectItem value="umkm">UMKM</SelectItem>
                                        <SelectItem value="regulator">Regulator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <div className="text-sm text-muted-foreground text-center mb-2">Quick Demo Access</div>
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('regulator')}>
                                Regulator
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('analyst')}>
                                Analyst
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('umkm')}>
                                UMKM
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('admin')}>
                                Admin
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
