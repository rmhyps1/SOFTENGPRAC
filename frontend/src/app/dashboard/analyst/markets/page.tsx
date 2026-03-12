'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from 'sonner'

const marketTrends = [
    { name: 'Kopi Lokal', Q1: 4000, Q2: 2400 },
    { name: 'Kerajinan', Q1: 3000, Q2: 1398 },
    { name: 'Fashion', Q1: 2000, Q2: 9800 },
    { name: 'Agrikultur', Q1: 2780, Q2: 3908 },
    { name: 'Jasa IT', Q1: 1890, Q2: 4800 },
]

const recentAnomalies = [
    { id: 1, region: 'Sub-district B', type: 'High Velocity', sector: 'Fashion', severity: 'Low', date: '2026-03-01' },
    { id: 2, region: 'Central Market', type: 'Monopoly Risk', sector: 'Agrikultur', severity: 'High', date: '2026-02-28' },
    { id: 3, region: 'North Hub', type: 'Capital Drain', sector: 'Kerajinan', severity: 'Medium', date: '2026-02-25' },
]

export default function EmergentMarketsPage() {
    return (
        <ProtectedRoute allowedRoles={['analyst']}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/analyst">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Emergent Markets & Anomalies</h1>
                        <p className="text-muted-foreground">Detect early signs of new economic hubs or destructive monopolies.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Sector Growth Velocity (Q1 vs Q2)</CardTitle>
                            <CardDescription>Comparative analysis of transaction volume growth across key MSME sectors.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={marketTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip cursor={{ fill: 'var(--muted)', opacity: 0.4 }} contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }} />
                                    <Legend />
                                    <Bar dataKey="Q1" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Q2" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 flex-row"><TrendingUp className="text-emerald-500 h-5 w-5" /> Detected Top Hub</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-4">
                                <TrendingUp className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Fashion Sector</h3>
                            <p className="text-sm text-muted-foreground">Experiencing an unprecedented 490% quarter-over-quarter growth in transaction volume within local markets.</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" onClick={() => toast.success('Sector Report generation initiated. An email will be sent shortly.')}>Generate Sector Report</Button>
                        </CardFooter>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" /> Activity Anomalies</CardTitle>
                        <CardDescription>AI-flagged deviations from standard economic baseline behaviour.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Sector</TableHead>
                                    <TableHead>Anomaly Type</TableHead>
                                    <TableHead className="text-right">Risk Severity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentAnomalies.map((anomaly) => (
                                    <TableRow key={anomaly.id}>
                                        <TableCell className="font-medium">{anomaly.date}</TableCell>
                                        <TableCell>{anomaly.region}</TableCell>
                                        <TableCell>{anomaly.sector}</TableCell>
                                        <TableCell>{anomaly.type}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${anomaly.severity === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                anomaly.severity === 'Medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                }`}>
                                                {anomaly.severity}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>
        </ProtectedRoute>
    )
}
