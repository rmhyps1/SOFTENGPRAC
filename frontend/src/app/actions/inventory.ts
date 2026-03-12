'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export type InventoryItem = {
    id: string
    name: string
    category: string
    sku: string
    quantity: number
    price: number
    status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

export async function getInventoryItems() {
    const stmt = db.prepare('SELECT * FROM inventory ORDER BY id DESC')
    return stmt.all() as InventoryItem[]
}

export async function addInventoryItem(data: { name: string, category: string, sku: string, quantity: number, price: number }) {
    try {
        const id = Math.random().toString(36).substring(7)
        const status = data.quantity === 0 ? 'Out of Stock' : (data.quantity < 10 ? 'Low Stock' : 'In Stock')

        const stmt = db.prepare('INSERT INTO inventory (id, name, category, sku, quantity, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
        stmt.run(id, data.name, data.category, data.sku, data.quantity, data.price, status)

        revalidatePath('/dashboard/umkm/inventory')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function updateInventoryItem(id: string, data: { name: string, category: string, sku: string, quantity: number, price: number }) {
    try {
        const status = data.quantity === 0 ? 'Out of Stock' : (data.quantity < 10 ? 'Low Stock' : 'In Stock')

        const stmt = db.prepare('UPDATE inventory SET name = ?, category = ?, sku = ?, quantity = ?, price = ?, status = ? WHERE id = ?')
        stmt.run(data.name, data.category, data.sku, data.quantity, data.price, status, id)

        revalidatePath('/dashboard/umkm/inventory')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        const stmt = db.prepare('DELETE FROM inventory WHERE id = ?')
        stmt.run(id)

        revalidatePath('/dashboard/umkm/inventory')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function exportInventoryCSV() {
    const items = await getInventoryItems()
    const headers = ['ID', 'Name', 'Category', 'SKU', 'Quantity', 'Price', 'Status']
    const rows = items.map(item => [item.id, item.name, item.category, item.sku, item.quantity, item.price, item.status])
    
    let csv = headers.join(',') + '\n'
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n'
    })
    
    return csv
}
