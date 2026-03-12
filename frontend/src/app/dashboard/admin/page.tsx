'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, DollarSign, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                    <p className="text-muted-foreground">Monitor system-wide platform usage and basic metrics.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+1,204</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Load</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">42%</div>
                            <p className="text-xs text-muted-foreground">Optimal performance</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Policy Sims</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">Running by regulators</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Subsidy Funds (System Tracked)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp 12.5M</div>
                            <p className="text-xs text-muted-foreground">Disbursed successfully</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Global Activity Feed Mockup */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Recent System Audit Logs
                            <Link href="/dashboard/admin/logs">
                                <Button variant="outline" size="sm">View All Logs</Button>
                            </Link>
                        </CardTitle>
                        <CardDescription>Recent actions by platform users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { time: '10 mins ago', user: 'Regulator (Jakarta)', text: 'Ran a new tax policy simulation' },
                                { time: '1 hr ago', user: 'Analyst (Surabaya)', text: 'Exported Flow Map CSV Data' },
                                { time: '2 hrs ago', user: 'UMKM (Toko Sejahtera)', text: 'Requested Rp 5,000,000 in operational subsidy' },
                            ].map((log, i) => (
                                <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{log.user}</p>
                                        <p className="text-sm text-muted-foreground">{log.text}</p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{log.time}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    )
}
