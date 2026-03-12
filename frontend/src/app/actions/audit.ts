'use server'

import db from '@/lib/db'

export async function logAction(data: {
    userId: string
    action: string
    ipAddress?: string
}) {
    try {
        const id = 'LOG-' + Date.now()
        const timestamp = new Date().toISOString()

        const stmt = db.prepare('INSERT INTO audit_logs (id, user_id, action, timestamp, ip_address) VALUES (?, ?, ?, ?, ?)')
        stmt.run(id, data.userId, data.action, timestamp, data.ipAddress || 'Unknown')

        return { success: true, id }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getAuditLogs(limit?: number) {
    try {
        let stmt
        if (limit) {
            stmt = db.prepare('SELECT l.*, u.email, u.role FROM audit_logs l JOIN users u ON l.user_id = u.id ORDER BY l.timestamp DESC LIMIT ?')
            return stmt.all(limit) as any[]
        } else {
            stmt = db.prepare('SELECT l.*, u.email, u.role FROM audit_logs l JOIN users u ON l.user_id = u.id ORDER BY l.timestamp DESC')
            return stmt.all() as any[]
        }
    } catch (e: any) {
        return []
    }
}

export async function exportAuditLogsCSV() {
    const logs = await getAuditLogs()
    const headers = ['Log ID', 'Timestamp', 'User Email', 'Role', 'Action', 'IP Address']
    const rows = logs.map(log => [log.id, log.timestamp, log.email, log.role, log.action, log.ip_address])
    
    let csv = headers.join(',') + '\n'
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n'
    })
    
    return csv
}
