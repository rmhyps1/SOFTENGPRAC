'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
    const stmt = db.prepare('SELECT id, email, password_hash, name, role, status, mfa, lastLog FROM users ORDER BY id DESC')
    return stmt.all() as {
        id: string
        email: string
        password_hash: string
        name: string | null
        role: string
        status: string
        mfa: string
        lastLog: string
    }[]
}

export async function inviteUser(data: { email: string, name: string, password: string, role: string }) {
    try {
        if (!data.email || !data.name || !data.password) {
            return { success: false, error: 'Email, name, and password are required' }
        }

        const id = 'USR-' + Math.floor(100 + Math.random() * 900)
        // In production, use bcrypt to hash password. For now, store with 'hashed_' prefix
        const passwordHash = 'hashed_' + Buffer.from(data.password).toString('base64')

        const stmt = db.prepare('INSERT INTO users (id, email, password_hash, name, role, status, mfa, lastLog) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        stmt.run(id, data.email, passwordHash, data.name, data.role, 'Active', 'Disabled', 'Just now')

        revalidatePath('/dashboard/admin/users')
        return { success: true, id }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function updateUser(id: string, data: { email: string, role: string, status: string, mfa: string }) {
    try {
        const stmt = db.prepare('UPDATE users SET email = ?, role = ?, status = ?, mfa = ? WHERE id = ?')
        stmt.run(data.email, data.role, data.status, data.mfa, id)
        
        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function updateUserRole(id: string, newRole: string) {
    try {
        const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?')
        stmt.run(newRole, id)
        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function suspendUser(id: string) {
    try {
        const stmt = db.prepare('UPDATE users SET status = ? WHERE id = ?')
        stmt.run('Locked', id)
        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function unlockUser(id: string) {
    try {
        const stmt = db.prepare('UPDATE users SET status = ? WHERE id = ?')
        stmt.run('Active', id)
        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function deleteUser(id: string) {
    try {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?')
        stmt.run(id)
        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function exportUsersCSV() {
    const users = await getUsers()
    const headers = ['ID', 'Email', 'Role', 'Status', 'MFA', 'Last Login']
    const rows = users.map(user => [user.id, user.email, user.role, user.status, user.mfa, user.lastLog])
    
    let csv = headers.join(',') + '\n'
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n'
    })
    
    return csv
}
