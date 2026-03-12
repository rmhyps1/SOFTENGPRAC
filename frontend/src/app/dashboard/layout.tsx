"use client"

import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { ReactNode, useState } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <aside className={`hidden md:flex flex-shrink-0 border-r transition-all duration-200 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <Sidebar collapsed={isSidebarCollapsed} />
            </aside>

            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                <SheetContent side="left" className="w-[280px] p-0">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <SheetDescription className="sr-only">
                        Use this menu to navigate between dashboard pages.
                    </SheetDescription>
                    <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} className="min-h-full" />
                </SheetContent>
            </Sheet>

            <main className="flex-1 overflow-auto">
                <div className="flex items-center justify-between border-b bg-background/80 px-3 py-2 backdrop-blur md:justify-end md:px-4">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="md:hidden"
                        aria-label="Open navigation"
                        onClick={() => setIsMobileSidebarOpen(true)}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="hidden md:inline-flex"
                        aria-label={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
                        onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                    >
                        {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
