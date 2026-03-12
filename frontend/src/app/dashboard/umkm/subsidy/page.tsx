'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

export default function SubsidyPage() {
    const [submitted, setSubmitted] = useState(false)
    const [amount, setAmount] = useState('')
    const [reason, setReason] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (amount && reason) {
            setSubmitted(true)
        }
    }

    return (
        <ProtectedRoute allowedRoles={['umkm']}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/umkm">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Q4 Resilience Grant Application</h1>
                        <p className="text-muted-foreground">Request operational subsidies from the regional regulator.</p>
                    </div>
                </div>

                <div className="max-w-2xl">
                    {!submitted ? (
                        <Card>
                            <form onSubmit={handleSubmit}>
                                <CardHeader>
                                    <CardTitle>Subsidy Request Form</CardTitle>
                                    <CardDescription>
                                        Your economic health score is currently <span className="text-emerald-500 font-bold">Good</span>, meaning you are eligible for up to Rp 15,000,000 in assistance.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Requested Amount (IDR)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="e.g 5000000"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Business Justification</Label>
                                        <Textarea
                                            id="reason"
                                            placeholder="Briefly explain how this subsidy will help stabilize your supply chain or retain employees..."
                                            className="min-h-[150px]"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            required
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full gap-2">
                                        <Send className="h-4 w-4" /> Submit Application
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    ) : (
                        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">Application Submitted!</h2>
                                <p className="text-muted-foreground max-w-md">
                                    Your request for Rp {Number(amount).toLocaleString()} has been sent to the Regulator pool. You will receive a notification once the policy engine evaluates it.
                                </p>
                                <div className="mt-8 flex gap-4">
                                    <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another</Button>
                                    <Link href="/dashboard/umkm">
                                        <Button>Return to Dashboard</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}
