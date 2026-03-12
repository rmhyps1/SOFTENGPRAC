'use client'

import { useState, useEffect } from 'react'
import { ArrowUpFromLine, Download, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { addOutboundStock, getStockMovements, deleteStockMovement, exportStockMovementsCSV, StockMovement } from '@/app/actions/stock-movements'
import { getInventoryItems, InventoryItem } from '@/app/actions/inventory'
import { useAuthStore } from '@/store/auth'

export default function OutboundPage() {
    const { user } = useAuthStore()
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    
    // Form state
    const [formData, setFormData] = useState({
        item_id: '',
        quantity: '',
        reason: ''
    })

    const loadData = async () => {
        setLoading(true)
        try {
            const [mvmnts, items] = await Promise.all([
                getStockMovements('outbound'),
                getInventoryItems()
            ])
            setMovements(mvmnts)
            setInventoryItems(items)
        } catch (error: any) {
            console.error('Failed to load outbound data:', error)
            toast.error('Failed to load outbound data')
            setMovements([])
            setInventoryItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.item_id || !formData.quantity || !formData.reason) {
            toast.error('Please fill all required fields')
            return
        }

        const quantity = parseInt(formData.quantity)
        if (isNaN(quantity) || quantity <= 0) {
            toast.error('Quantity must be a positive number')
            return
        }

        const result = await addOutboundStock({
            item_id: formData.item_id,
            quantity,
            reason: formData.reason,
            user_id: 'USR-889'
        })

        if (result.success) {
            toast.success('Outbound stock recorded successfully!')
            setFormData({ item_id: '', quantity: '', reason: '' })
            setIsDialogOpen(false)
            loadData()
        } else {
            toast.error(result.error || 'Failed to record outbound stock')
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        const result = await deleteStockMovement(deleteId)
        if (result.success) {
            toast.success('Stock movement deleted successfully!')
            setDeleteId(null)
            loadData()
        } else {
            toast.error(result.error || 'Failed to delete stock movement')
        }
    }

    const handleExport = async () => {
        const csv = await exportStockMovementsCSV('outbound')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `outbound-movements-${new Date().toISOString()}.csv`
        a.click()
        toast.success('CSV exported successfully!')
    }

    // Get available item with current stock
    const getAvailableQty = (itemId: string) => {
        const item = inventoryItems.find(i => i.id === itemId)
        return item?.quantity || 0
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ArrowUpFromLine className="h-8 w-8" />
                        Outbound Stock (Stock Out)
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Record outgoing stock from sales, waste, or other uses
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Outbound
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Outbound Stock</DialogTitle>
                                <DialogDescription>
                                    Record stock going out from inventory
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="item_id">Item *</Label>
                                    <Select
                                        value={formData.item_id}
                                        onValueChange={(value) => setFormData({ ...formData, item_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select item" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {inventoryItems.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name} ({item.sku}) - {item.quantity} available
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formData.item_id && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Available stock: {getAvailableQty(formData.item_id)} units
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="quantity">Quantity *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        max={formData.item_id ? getAvailableQty(formData.item_id) : undefined}
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        placeholder="Enter quantity"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reason">Reason / Notes *</Label>
                                    <Textarea
                                        id="reason"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        placeholder="e.g., Sale to customer, Expired product, Damaged goods"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Record Outbound Stock</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Outbound Movements</CardTitle>
                    <CardDescription>
                        History of stock removals ({movements.length} total)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No outbound movements recorded yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                movements.map((movement) => (
                                    <TableRow key={movement.id}>
                                        <TableCell>
                                            {new Date(movement.date).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {movement.item_name}
                                        </TableCell>
                                        <TableCell>{movement.item_sku}</TableCell>
                                        <TableCell className="text-right font-semibold text-red-600">
                                            -{movement.quantity}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {movement.reason}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setDeleteId(movement.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete the stock movement record and reverse the inventory quantity change.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
