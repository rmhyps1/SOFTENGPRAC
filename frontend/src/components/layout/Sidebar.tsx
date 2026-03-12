'use client'

import { FC } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, LineChart, Package, Settings, Users, LogOut, ArrowRightLeft, ShieldAlert, ArrowDownToLine, ArrowUpFromLine, type LucideIcon } from 'lucide-react'
import { useAuthStore, type Role } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SidebarRole = Exclude<Role, null>

type SidebarLink = {
    name: string
    href: string
    icon: LucideIcon
}

type SidebarProps = {
    collapsed?: boolean
    onNavigate?: () => void
    className?: string
}

const roleLinks: Record<SidebarRole, SidebarLink[]> = {
    admin: [
        { name: 'Overview', href: '/dashboard/admin', icon: Home },
        { name: 'System Logs', href: '/dashboard/admin/logs', icon: ShieldAlert },
        { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
    ],
    analyst: [
        { name: 'Overview', href: '/dashboard/analyst', icon: Home },
        { name: 'Wealth Ecology', href: '/dashboard/analyst/ecology', icon: LineChart },
        { name: 'Emergent Markets', href: '/dashboard/analyst/markets', icon: ArrowRightLeft },
    ],
    umkm: [
        { name: 'Dashboard', href: '/dashboard/umkm', icon: Home },
        { name: 'Inventory', href: '/dashboard/umkm/inventory', icon: Package },
            { name: 'Inbound (Stock In)', href: '/dashboard/umkm/inbound', icon: ArrowDownToLine },
            { name: 'Outbound (Stock Out)', href: '/dashboard/umkm/outbound', icon: ArrowUpFromLine },
        { name: 'Subsidy Requests', href: '/dashboard/umkm/subsidy', icon: Settings },
    ],
    regulator: [
        { name: 'Overview', href: '/dashboard/regulator', icon: Home },
        { name: 'Policy Simulator', href: '/dashboard/regulator/simulation', icon: LineChart },
        { name: 'Heatmaps', href: '/dashboard/regulator/heatmaps', icon: ArrowRightLeft },
    ],
}

export const Sidebar: FC<SidebarProps> = ({ collapsed = false, onNavigate, className }) => {
    const { user, logout } = useAuthStore()
    const router = useRouter()
    const pathname = usePathname()
    const userRole = user?.role ?? null

    // Show sidebar even if user not loaded yet - prevents layout collapse
    if (!user) {
        return (
            <aside className={cn('w-full bg-muted/40 min-h-screen flex flex-col', className)}>
                <div className={cn('flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6', collapsed && 'justify-center px-2')}>
                    <Link href="/" className={cn('flex items-center font-semibold', !collapsed && 'gap-2')}>
                        <span>{collapsed ? 'TS' : 'TownSync ERP'}</span>
                    </Link>
                </div>
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Loading...
                </div>
            </aside>
        )
    }

    const links = userRole ? roleLinks[userRole] : []

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    return (
        <aside className={cn('w-full bg-muted/40 min-h-screen flex flex-col', className)}>
            <div className={cn('flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6', collapsed && 'justify-center px-2')}>
                <Link href="/" className={cn('flex items-center font-semibold', !collapsed && 'gap-2')}>
                    <span>{collapsed ? 'TS' : 'TownSync ERP'}</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className={cn('grid items-start px-2 text-sm font-medium', !collapsed && 'lg:px-4')}>
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => onNavigate?.()}
                                className={cn(
                                    'flex items-center rounded-lg py-2 transition-all hover:text-primary',
                                    collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                                    isActive ? 'bg-muted text-primary' : 'text-muted-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {!collapsed && <span>{link.name}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className={cn('mt-auto border-t p-4 flex flex-col gap-2', collapsed && 'items-center p-3')}>
                {!collapsed && userRole && (
                    <div className="text-sm font-medium px-2 py-1 bg-primary/10 rounded text-primary">
                        Logged in as: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </div>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    className={cn('w-full', collapsed ? 'justify-center px-0' : 'justify-start gap-2')}
                    aria-label="Logout"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    {!collapsed && 'Logout'}
                </Button>
            </div>
        </aside>
    )
}
