'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Share2, Filter } from 'lucide-react'
import Link from 'next/link'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { toast } from 'sonner'

// Mock Data for "Flow Map" - essentially node densities
const nodeData = [
    { x: 10, y: 30, z: 200, name: 'Node Alpha (Retail)', color: '#3b82f6' },
    { x: 30, y: 90, z: 500, name: 'Hub Beta (Distributor)', color: '#a855f7' },
    { x: 45, y: 50, z: 120, name: 'Node Gamma', color: '#10b981' },
    { x: 70, y: 80, z: 300, name: 'Node Delta', color: '#f59e0b' },
    { x: 90, y: 20, z: 800, name: 'Hub Epsilon (Wholesale)', color: '#ef4444' }, // Centralized pool
    { x: 50, y: 20, z: 150, name: 'Node Zeta', color: '#10b981' },
    { x: 75, y: 40, z: 90, name: 'Node Eta', color: '#3b82f6' },
]

export default function EcologyPage() {
    const [filter, setFilter] = useState('all')

    return (
        <ProtectedRoute allowedRoles={['analyst']}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/analyst">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Wealth Ecology</h1>
                            <p className="text-muted-foreground">Interactive map of transactional flow and capital density.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2"><Filter className="w-4 h-4" /> Filter Nodes</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>Filter by Node Type</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                                    <DropdownMenuRadioItem value="all">All Nodes</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="risk">High Risk (Monopoly)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="distributor">Distributor Hubs</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="retail">Retail Nodes</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button className="gap-2" onClick={() => toast.success('Graph exported as ecology_map.png')}><Share2 className="w-4 h-4" /> Export Graph</Button>
                    </div>
                </div>

                <Card className="flex-1 min-h-[600px] flex flex-col">
                    <CardHeader>
                        <CardTitle>MSME Network Topology</CardTitle>
                        <CardDescription>Visualizing concentrated wealth pools (hub nodes) vs distributed edges.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="h-full w-full min-h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis type="number" dataKey="x" name="Geographic Lon" domain={[0, 100]} hide />
                                    <YAxis type="number" dataKey="y" name="Geographic Lat" domain={[0, 100]} hide />
                                    <ZAxis type="number" dataKey="z" range={[100, 3000]} name="Transaction Volume" />
                                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="MSME Nodes" data={nodeData} fill="#8884d8">
                                        {nodeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex gap-4 text-sm justify-center text-muted-foreground">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Potential Monopoly Link</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#a855f7]"></div> Healthy Distributor Hub</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div> Standard Retail Node</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    )
}
