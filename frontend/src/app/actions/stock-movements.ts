'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export type StockMovement = {
    id: string
    item_id: string
    item_name: string
    item_sku: string
    quantity: number
    movement_type: 'inbound' | 'outbound'
    reason: string
    date: string
    user_id: string
}

// Get all stock movements
export async function getStockMovements(type?: 'inbound' | 'outbound') {
    try {
        let stmt
        if (type) {
            stmt = db.prepare(`
                SELECT sm.*, i.name as item_name, i.sku as item_sku 
                FROM stock_movements sm 
                JOIN inventory i ON sm.item_id = i.id 
                WHERE sm.movement_type = ?
                ORDER BY sm.date DESC
            `)
            return stmt.all(type) as StockMovement[]
        } else {
            stmt = db.prepare(`
                SELECT sm.*, i.name as item_name, i.sku as item_sku 
                FROM stock_movements sm 
                JOIN inventory i ON sm.item_id = i.id 
                ORDER BY sm.date DESC
            `)
            return stmt.all() as StockMovement[]
        }
    } catch (e: any) {
        console.error('Error getting stock movements:', e)
        return []
    }
}

// Add inbound stock movement (incoming stock)
export async function addInboundStock(data: {
    item_id: string
    quantity: number
    reason: string
    user_id: string
}) {
    try {
        // Validate item exists
        const checkItem = db.prepare('SELECT id FROM inventory WHERE id = ?')
        const item = checkItem.get(data.item_id)
        if (!item) {
            return { success: false, error: 'Item not found in inventory' }
        }

        // Validate user exists
        const checkUser = db.prepare('SELECT id FROM users WHERE id = ?')
        const user = checkUser.get(data.user_id)
        if (!user) {
            console.error('User not found:', data.user_id)
            return { success: false, error: 'User not found. Try refreshing the page.' }
        }

        const id = 'SM-IN-' + Date.now()
        const date = new Date().toISOString()

        // Insert stock movement record
        const stmt = db.prepare(`
            INSERT INTO stock_movements (id, item_id, quantity, movement_type, reason, date, user_id) 
            VALUES (?, ?, ?, 'inbound', ?, ?, ?)
        `)
        stmt.run(id, data.item_id, data.quantity, data.reason, date, data.user_id)

        // Update inventory quantity
        const updateStmt = db.prepare(`
            UPDATE inventory 
            SET quantity = quantity + ?, 
                status = CASE 
                    WHEN quantity + ? = 0 THEN 'Out of Stock'
                    WHEN quantity + ? < 10 THEN 'Low Stock'
                    ELSE 'In Stock'
                END
            WHERE id = ?
        `)
        updateStmt.run(data.quantity, data.quantity, data.quantity, data.item_id)

        revalidatePath('/dashboard/umkm/inbound')
        revalidatePath('/dashboard/umkm/inventory')
        return { success: true, id }
    } catch (e: any) {
        console.error('Error adding inbound stock:', e)
        return { success: false, error: e.message || 'Failed to add inbound stock' }
    }
}

// Add outbound stock movement (outgoing stock)
export async function addOutboundStock(data: {
    item_id: string
    quantity: number
    reason: string
    user_id: string
}) {
    try {
        // Validate item exists
        const checkItem = db.prepare('SELECT id, quantity FROM inventory WHERE id = ?')
        const item = checkItem.get(data.item_id) as { id: string; quantity: number } | undefined
        
        if (!item) {
            return { success: false, error: 'Item not found in inventory' }
        }
        
        if (item.quantity < data.quantity) {
            return { success: false, error: `Insufficient stock. Available: ${item.quantity}, Requested: ${data.quantity}` }
        }

        // Validate user exists
        const checkUser = db.prepare('SELECT id FROM users WHERE id = ?')
        const user = checkUser.get(data.user_id)
        if (!user) {
            console.error('User not found:', data.user_id)
            return { success: false, error: 'User not found. Try refreshing the page.' }
        }

        const id = 'SM-OUT-' + Date.now()
        const date = new Date().toISOString()

        // Insert stock movement record
        const stmt = db.prepare(`
            INSERT INTO stock_movements (id, item_id, quantity, movement_type, reason, date, user_id) 
            VALUES (?, ?, ?, 'outbound', ?, ?, ?)
        `)
        stmt.run(id, data.item_id, data.quantity, data.reason, date, data.user_id)

        // Update inventory quantity (subtract)
        const updateStmt = db.prepare(`
            UPDATE inventory 
            SET quantity = quantity - ?, 
                status = CASE 
                    WHEN quantity - ? = 0 THEN 'Out of Stock'
                    WHEN quantity - ? < 10 THEN 'Low Stock'
                    ELSE 'In Stock'
                END
            WHERE id = ?
        `)
        updateStmt.run(data.quantity, data.quantity, data.quantity, data.item_id)

        revalidatePath('/dashboard/umkm/outbound')
        revalidatePath('/dashboard/umkm/inventory')
        return { success: true, id }
    } catch (e: any) {
        console.error('Error adding outbound stock:', e)
        return { success: false, error: e.message || 'Failed to record outbound stock' }
    }
}

// Delete stock movement
export async function deleteStockMovement(id: string) {
    try {
        // Get movement details first to reverse the inventory change
        const getStmt = db.prepare('SELECT * FROM stock_movements WHERE id = ?')
        const movement = getStmt.get(id) as StockMovement | undefined
        
        if (!movement) {
            return { success: false, error: 'Movement not found' }
        }

        // Reverse the inventory change
        if (movement.movement_type === 'inbound') {
            // Subtract the quantity that was added
            const updateStmt = db.prepare(`
                UPDATE inventory 
                SET quantity = quantity - ?, 
                    status = CASE 
                        WHEN quantity - ? = 0 THEN 'Out of Stock'
                        WHEN quantity - ? < 10 THEN 'Low Stock'
                        ELSE 'In Stock'
                    END
                WHERE id = ?
            `)
            updateStmt.run(movement.quantity, movement.quantity, movement.quantity, movement.item_id)
        } else {
            // Add back the quantity that was removed
            const updateStmt = db.prepare(`
                UPDATE inventory 
                SET quantity = quantity + ?, 
                    status = CASE 
                        WHEN quantity + ? = 0 THEN 'Out of Stock'
                        WHEN quantity + ? < 10 THEN 'Low Stock'
                        ELSE 'In Stock'
                    END
                WHERE id = ?
            `)
            updateStmt.run(movement.quantity, movement.quantity, movement.quantity, movement.item_id)
        }

        // Delete the movement record
        const deleteStmt = db.prepare('DELETE FROM stock_movements WHERE id = ?')
        deleteStmt.run(id)

        revalidatePath('/dashboard/umkm/inbound')
        revalidatePath('/dashboard/umkm/outbound')
        revalidatePath('/dashboard/umkm/inventory')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// Export stock movements to CSV
export async function exportStockMovementsCSV(type?: 'inbound' | 'outbound') {
    const movements = await getStockMovements(type)
    const headers = ['ID', 'Date', 'Item Name', 'SKU', 'Quantity', 'Type', 'Reason']
    const rows = movements.map(m => [
        m.id,
        new Date(m.date).toLocaleString(),
        m.item_name,
        m.item_sku,
        m.quantity,
        m.movement_type,
        m.reason
    ])
    
    let csv = headers.join(',') + '\n'
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n'
    })
    
    return csv
}
