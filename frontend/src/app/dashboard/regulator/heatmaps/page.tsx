'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Map } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts'

// Initial Data for "Heatmap"
const initialHeatmapData = Array.from({ length: 400 }).map((_, i) => ({
    x: Math.floor(i / 20),
    y: i % 20,
    z: Math.random() > 0.8 ? Math.random() * 100 : Math.random() * 10,
}))

const getColor = (value: number) => {
    if (value > 80) return '#ef4444' // Red - High concentration
    if (value > 50) return '#f97316' // Orange
    if (value > 20) return '#eab308' // Yellow
    if (value > 5) return '#10b981' // Green - Healthy baseline
    return '#f1f5f9' // Light gray (or dark gray in dark mode via opacity tricks usually, but standard hex here) - Low activity
}


export default function HeatmapsPage() {
    const [heatmapData, setHeatmapData] = useState(initialHeatmapData)
    const [isSimulating, setIsSimulating] = useState(true)

    // Simulation Engine Effect
    useEffect(() => {
        if (!isSimulating) return

        const interval = setInterval(() => {
            setHeatmapData(currentData =>
                currentData.map(node => {
                    // Randomly fluctuate
                    let newZ = node.z + (Math.random() * 20 - 10)

                    // Add external capital injection (Monopoly growth) occasionally to hotspots
                    if (node.z > 70 && Math.random() > 0.9) newZ += 30

                    // Prevent going below 0 or crazy high over time unnecessarily 
                    newZ = Math.max(0, Math.min(newZ, 400))

                    return { ...node, z: newZ }
                })
            )
        }, 1500) // Update every 1.5 seconds

        return () => clearInterval(interval)
    }, [isSimulating])

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
                        <h1 className="text-3xl font-bold tracking-tight">Regional Wealth Heatmap</h1>
                        <p className="text-muted-foreground">Spatial distribution of economic health and activity.</p>
                    </div>
                </div>

                <Card className="flex-1 min-h-[600px] flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2"><Map className="w-5 h-5" /> Geographic Wealth Distribution</CardTitle>
                                <CardDescription>Hotspots indicate high capital concentration. Cold zones may require subsidy intervention.</CardDescription>
                            </div>
                            <Button variant={isSimulating ? "destructive" : "default"} onClick={() => setIsSimulating(!isSimulating)}>
                                {isSimulating ? "Pause Live Analytics" : "Resume Live Analytics"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col relative">
                        <div className="absolute top-6 right-6 z-10 bg-background/80 backdrop-blur border p-4 rounded-xl shadow-sm text-sm space-y-2">
                            <h4 className="font-semibold border-b pb-1 mb-2">Legend</h4>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Hyper-Concentrated (Risk)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f97316]"></div> High Activity</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#eab308]"></div> Developing Market</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Baseline Health</div>
                        </div>

                        <div className="h-full w-full min-h-[500px] bg-muted/10 rounded-xl overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                    <XAxis type="number" dataKey="x" name="Longitude" domain={[0, 20]} hide />
                                    <YAxis type="number" dataKey="y" name="Latitude" domain={[0, 20]} hide />
                                    <ZAxis type="number" dataKey="z" range={[50, 400]} name="Wealth Density" />
                                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--background)' }} />
                                    <Scatter name="Zones" data={heatmapData} shape="square">
                                        {heatmapData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getColor(entry.z)} fillOpacity={entry.z > 5 ? 0.8 : 0.1} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    )
}
