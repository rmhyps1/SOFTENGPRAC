'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Package, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

export default function UMKMDashboard() {
    return (
        <ProtectedRoute allowedRoles={['umkm']}>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Toko Sejahtera - Dashboard</h1>
                    <p className="text-muted-foreground">Manage your inventory and request aid from the regulator.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Monthly Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp 15.4M</div>
                            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Stock Value</CardTitle>
                            <Package className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp 8.2M</div>
                            <p className="text-xs text-muted-foreground">Estimated holding value</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-xs text-muted-foreground">Requires fulfillment soon</p>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Stock Alerts</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">2 Items</div>
                            <p className="text-xs text-red-600/80 dark:text-red-400/80">Running low on stock</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Your latest business activities.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { id: 'TRX-994', title: 'Supplier Payment (Beras)', amount: '-Rp 2,500,000', status: 'Completed', date: 'Oct 24' },
                                    { id: 'TRX-995', title: 'Daily Retail Sales', amount: '+Rp 840,000', status: 'Completed', date: 'Oct 24' },
                                    { id: 'TRX-996', title: 'Government Subsidy Receipt', amount: '+Rp 5,000,000', status: 'Approved', date: 'Oct 20' },
                                ].map((trx, i) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{trx.title}</span>
                                            <span className="text-xs text-muted-foreground">{trx.id} • {trx.date}</span>
                                        </div>
                                        <div className={`text-sm font-bold ${trx.amount.startsWith('+') ? 'text-emerald-500' : ''}`}>
                                            {trx.amount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" onClick={() => toast('Loading comprehensive transaction history...')}>View All Transactions</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Subsidy Status</CardTitle>
                            <CardDescription>Track your aid requests.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[200px]">
                            <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 p-4 rounded-full mb-4">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">You are eligible!</h3>
                            <p className="text-sm text-muted-foreground mb-6">Based on your recent economic activity score, you can apply for the Q4 Resilience Grant.</p>
                            <Link href="/dashboard/umkm/subsidy">
                                <Button>Apply for Subsidy</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    )
}
