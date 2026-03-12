'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, MapPin, TrendingUp, AlertTriangle } from 'lucide-react'

export default function AnalystDashboard() {
    return (
        <ProtectedRoute allowedRoles={['analyst']}>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Analyst Hub</h1>
                    <p className="text-muted-foreground">Monitor economic ecology and spot emergent market trends.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Velocity</CardTitle>
                            <Activity className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">14.2x</div>
                            <p className="text-xs text-muted-foreground">Capital velocity score</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Nodes</CardTitle>
                            <MapPin className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4,231</div>
                            <p className="text-xs text-muted-foreground">Entities interacting</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Emergent Hubs</CardTitle>
                            <TrendingUp className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">New market clusters detected</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Anomaly Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">Potential wealth monopolies</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Economic Flow Map Overview</CardTitle>
                            <CardDescription>Live visualization of transactions between MSMEs.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 border-t border-b mb-6">
                            <div className="text-muted-foreground flex flex-col items-center">
                                <Activity className="h-10 w-10 mb-2 opacity-50" />
                                <p>3D Flow Map Visualization goes here</p>
                                <p className="text-xs">(Interactive Node Canvas)</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Latest Intelligence</CardTitle>
                            <CardDescription>AI-generated insights from transaction data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex flex-col gap-1 border-l-4 border-indigo-500 pl-4">
                                    <h4 className="text-sm font-semibold">Emergent Market: &quot;Kopi Lokal Sub-district B&quot;</h4>
                                    <p className="text-xs text-muted-foreground">Detected a 34% increase in hyper-local transactions in the coffee sector in region B over the last 14 days.</p>
                                </div>
                                <div className="flex flex-col gap-1 border-l-4 border-orange-500 pl-4">
                                    <h4 className="text-sm font-semibold">Anomaly: Centralization Warning</h4>
                                    <p className="text-xs text-muted-foreground">Supplier &apos;Grosir Maju&apos; is absorbing 60% of liquid capital from retail MSMEs in Sector 4. High risk of supply chain monopoly.</p>
                                </div>
                                <div className="flex flex-col gap-1 border-l-4 border-blue-500 pl-4">
                                    <h4 className="text-sm font-semibold">Velocity Normalization</h4>
                                    <p className="text-xs text-muted-foreground">Capital velocity has stabilized post Q3 subsidy disbursements. Impact analysis looks positive.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    )
}
