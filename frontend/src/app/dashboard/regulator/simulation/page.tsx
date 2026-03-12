'use client'

import { useState, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, Play, Download } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'

// Mock simulation data generator
const generateSimulationData = (taxRate: number, subsidy: number) => {
    const data = []
    let wealthIndex = 50 // starting point
    let msmeHealth = 60

    for (let month = 1; month <= 6; month++) {
        // Basic logic: Higher subsidy = better health short term, Higher tax = lower health but stable wealth index long term
        const subsidyImpact = subsidy / 1000000 * 0.5
        const taxImpact = taxRate * 0.2

        msmeHealth = Math.min(100, Math.max(0, msmeHealth + subsidyImpact - taxImpact + (Math.random() * 5 - 2.5)))
        wealthIndex = Math.min(100, Math.max(0, wealthIndex + (taxImpact * 0.5) + (Math.random() * 2 - 1)))

        data.push({
            month: `Month ${month}`,
            msmeHealth: Math.round(msmeHealth),
            wealthIndex: Math.round(wealthIndex),
        })
    }
    return data
}

export default function PolicySimulation() {
    const [taxRate, setTaxRate] = useState<number>(5) // 5% default
    const [subsidy, setSubsidy] = useState<number>(10000000) // 10M default

    const results = useMemo(() => generateSimulationData(taxRate, subsidy), [taxRate, subsidy])

    return (
        <ProtectedRoute allowedRoles={['regulator']}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/regulator">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Policy Simulation Engine</h1>
                        <p className="text-muted-foreground">Model the impact of tax and subsidy adjustments.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Controls Panel */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Simulation Parameters</CardTitle>
                            <CardDescription>Adjust variables to forecast economic outcomes over 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>MSME Tax Rate (%)</Label>
                                    <span className="text-sm font-medium">{taxRate}%</span>
                                </div>
                                <Slider
                                    value={[taxRate]}
                                    onValueChange={(v) => setTaxRate(v[0])}
                                    max={30}
                                    step={0.5}
                                />
                                <p className="text-xs text-muted-foreground">Adjust the regional tax levy on small businesses.</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Regional Subsidy Budget (IDR)</Label>
                                </div>
                                <Input
                                    type="number"
                                    value={subsidy}
                                    onChange={(e) => setSubsidy(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">Total cash injection distributed to eligible MSMEs.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visualization Panel */}
                    <Card className="md:col-span-2 flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Projected Outcome (6 Months)</CardTitle>
                                <CardDescription>AI forecast on MSME Health and Wealth Equality Index.</CardDescription>
                            </div>
                            {results && (
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="h-4 w-4" /> Export Report
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[400px]">
                            <div className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                        <XAxis dataKey="month" />
                                        <YAxis domain={[0, 100]} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="msmeHealth"
                                            name="MSME Health Score"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="wealthIndex"
                                            name="Wealth Equality Index"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    )
}
