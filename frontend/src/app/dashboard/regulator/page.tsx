'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator, ArrowRight, BarChart3, Activity } from 'lucide-react'
import Link from 'next/link'

export default function RegulatorDashboard() {
    return (
        <ProtectedRoute allowedRoles={['regulator']}>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Regulator Command Center</h1>
                    <p className="text-muted-foreground">Analyze economic health and simulate policy impacts.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-primary" />
                                Policy Simulator (MVP)
                            </CardTitle>
                            <CardDescription>Run AI-driven tax and subsidy simulations before releasing policies.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/regulator/simulation">
                                <Button className="w-full gap-2">
                                    Open Simulator Engine <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ecology Health Score</CardTitle>
                            <Activity className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">84/100</div>
                            <p className="text-xs text-muted-foreground">Wealth distribution is relatively balanced.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                            <BarChart3 className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">142</div>
                            <p className="text-xs text-muted-foreground">Subsidy requests in queue</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Wealth Distribution Heatmap Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Regional Wealth Heatmap
                            <Link href="/dashboard/regulator/heatmaps">
                                <Button variant="outline" size="sm">View Detailed Heatmap</Button>
                            </Link>
                        </CardTitle>
                        <CardDescription>Identifies areas needing economic intervention.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/50 rounded-md border mt-2">
                        <div className="text-muted-foreground flex flex-col items-center">
                            <MapPin className="h-10 w-10 mb-2 opacity-50" />
                            <p>Mapbox / D3.js Heatmap Visualization Overlay</p>
                            <p className="text-xs">(Requires Geolocation Data Segment)</p>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </ProtectedRoute>
    )
}

import { MapPin } from 'lucide-react'
