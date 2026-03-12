'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Download, PackageSearch, Search, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, exportInventoryCSV } from '@/app/actions/inventory'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type InventoryItem = {
    id: string
    name: string
    category: string
    sku: string
    quantity: number
    price: number
    status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

    const [newItem, setNewItem] = useState({ name: '', sku: '', quantity: '0', price: '10000', category: 'Sembako' })
    const [editItem, setEditItem] = useState({ name: '', sku: '', quantity: '0', price: '10000', category: 'Sembako' })

    const fetchItems = async () => {
        const data = await getInventoryItems()
        setItems(data)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.sku) {
            toast.error("Name and SKU are required")
            return
        }

        const res = await addInventoryItem({
            name: newItem.name,
            sku: newItem.sku,
            category: newItem.category,
            quantity: parseInt(newItem.quantity) || 0,
            price: parseInt(newItem.price) || 0
        })

        if (res.success) {
            toast.success('Item added successfully!')
            setIsAddModalOpen(false)
            setNewItem({ name: '', sku: '', quantity: '0', price: '10000', category: 'Sembako' })
            fetchItems()
        } else {
            toast.error(res.error || 'Failed to add item')
        }
    }

    const handleEditClick = (item: InventoryItem) => {
        setEditingItem(item)
        setEditItem({
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity.toString(),
            price: item.price.toString()
        })
        setIsEditModalOpen(true)
    }

    const handleUpdateItem = async () => {
        if (!editingItem || !editItem.name || !editItem.sku) {
            toast.error("Name and SKU are required")
            return
        }

        const res = await updateInventoryItem(editingItem.id, {
            name: editItem.name,
            sku: editItem.sku,
            category: editItem.category,
            quantity: parseInt(editItem.quantity) || 0,
            price: parseInt(editItem.price) || 0
        })

        if (res.success) {
            toast.success('Item updated successfully!')
            setIsEditModalOpen(false)
            setEditingItem(null)
            fetchItems()
        } else {
            toast.error(res.error || 'Failed to update item')
        }
    }

    const handleDeleteClick = (itemId: string) => {
        setDeletingItemId(itemId)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingItemId) return

        const res = await deleteInventoryItem(deletingItemId)

        if (res.success) {
            toast.success('Item deleted successfully!')
            setIsDeleteDialogOpen(false)
            setDeletingItemId(null)
            fetchItems()
        } else {
            toast.error(res.error || 'Failed to delete item')
        }
    }

    const handleExportCSV = async () => {
        const csv = await exportInventoryCSV()
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Inventory exported successfully!')
    }

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
        })
    }, [searchQuery, items])

    return (
        <ProtectedRoute allowedRoles={['umkm']}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/umkm">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Stock & Inventory</h1>
                            <p className="text-muted-foreground">Manage your physical products and supply quantities.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={handleExportCSV}><Download className="w-4 h-4" /> Export CSV</Button>
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2"><Plus className="w-4 h-4" /> Add Item</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Item</DialogTitle>
                                    <DialogDescription>
                                        Add a new product to your inventory tracking.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input id="name" placeholder="e.g. Gula Merah" className="col-span-3" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="sku" className="text-right">SKU</Label>
                                        <Input id="sku" placeholder="GLA-002" className="col-span-3" value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="cat" className="text-right">Category</Label>
                                        <Input id="cat" placeholder="Sembako" className="col-span-3" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="qty" className="text-right">Quantity</Label>
                                        <Input id="qty" type="number" className="col-span-3" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="price" className="text-right">Price</Label>
                                        <Input id="price" type="number" className="col-span-3" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" onClick={handleAddItem}>Save changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><PackageSearch className="h-5 w-5" /> Active Products</CardTitle>
                        <CardDescription>A list of everything currently tracked in your local warehouse.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-6">
                            <div className="relative w-72">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name, SKU or category..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[100px]">SKU</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Price (IDR)</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                        <TableHead className="text-right w-[120px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={7} className="text-center">Loading inventory...</TableCell></TableRow>
                                    ) : filteredItems.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} className="text-center">No items found.</TableCell></TableRow>
                                    ) : filteredItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-xs font-mono">{item.sku}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell className="text-right">Rp {item.price.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.status === 'Out of Stock' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    item.status === 'Low Stock' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditClick(item)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(item.id)}
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                            <DialogDescription>
                                Update product information in your inventory.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">Name</Label>
                                <Input id="edit-name" placeholder="e.g. Gula Merah" className="col-span-3" value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-sku" className="text-right">SKU</Label>
                                <Input id="edit-sku" placeholder="GLA-002" className="col-span-3" value={editItem.sku} onChange={e => setEditItem({ ...editItem, sku: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-cat" className="text-right">Category</Label>
                                <Input id="edit-cat" placeholder="Sembako" className="col-span-3" value={editItem.category} onChange={e => setEditItem({ ...editItem, category: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-qty" className="text-right">Quantity</Label>
                                <Input id="edit-qty" type="number" className="col-span-3" value={editItem.quantity} onChange={e => setEditItem({ ...editItem, quantity: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-price" className="text-right">Price</Label>
                                <Input id="edit-price" type="number" className="col-span-3" value={editItem.price} onChange={e => setEditItem({ ...editItem, price: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit" onClick={handleUpdateItem}>Update Item</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the item from your inventory.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </ProtectedRoute>
    )
}
