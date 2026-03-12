'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, Filter, ShieldAlert, Download } from 'lucide-react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { getAuditLogs, exportAuditLogsCSV } from '@/app/actions/audit'

type AuditLog = {
    id: string
    user_id: string
    email: string
    role: string
    action: string
    timestamp: string
    ip_address: string
}

export default function SystemLogsPage() {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    const fetchLogs = async () => {
        const data = await getAuditLogs()
        setAuditLogs(data)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const handleExportCSV = async () => {
        const csv = await exportAuditLogsCSV()
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Audit logs exported successfully!')
    }

    const filteredLogs = useMemo(() => {
        return auditLogs.filter(log => {
            return log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.ip_address.includes(searchQuery);
        })
    }, [searchQuery, auditLogs])

    const handleLock = () => {
        toast.error('System Lockdown Initiated', {
            description: 'All non-admin sessions have been forcefully terminated.'
        })
    }

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/admin">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">System Audit Logs</h1>
                            <p className="text-muted-foreground">Immutable record of all platform activity for compliance and debugging.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={handleExportCSV}><Download className="w-4 h-4" /> Export Logs</Button>
                        <Button variant="destructive" className="gap-2" onClick={handleLock}><ShieldAlert className="w-4 h-4" /> Lock System</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Activity Trail</CardTitle>
                        <CardDescription>All recorded actions mapped to IP addresses and User IDs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search logs by user, action or IP..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="gap-2" onClick={() => toast('Filter menu opened')}><Filter className="w-4 h-4" /> Filter by Role</Button>
                        </div>

                        <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[100px]">Log ID</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="max-w-[300px]">Action Detail</TableHead>
                                        <TableHead className="text-right">IP Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center">Loading logs...</TableCell></TableRow>
                                    ) : filteredLogs.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center">No logs found.</TableCell></TableRow>
                                    ) : filteredLogs.map((log) => (
                                        <TableRow key={log.id} className="text-xs">
                                            <TableCell className="font-mono text-muted-foreground">{log.id}</TableCell>
                                            <TableCell className="whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</TableCell>
                                            <TableCell className="font-medium text-blue-600 dark:text-blue-400">{log.email}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${log.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    log.role === 'System' ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400' :
                                                        log.role === 'regulator' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                            log.role === 'analyst' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    }`}>
                                                    {log.role}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate">{log.action}</TableCell>
                                            <TableCell className="text-right font-mono">{log.ip_address}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-4 flex-row items-center">
                        <div className="text-xs text-muted-foreground">Showing {filteredLogs.length} logs</div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => toast('Previous page loaded')}>Previous</Button>
                            <Button variant="outline" size="sm" onClick={() => toast('Next page loaded')}>Next</Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </ProtectedRoute>
    )
}
