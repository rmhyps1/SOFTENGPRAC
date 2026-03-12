'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowLeft, Search, UserPlus, Settings2, Download, Pencil, Trash2, Unlock } from 'lucide-react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { getUsers, inviteUser, updateUser, suspendUser, unlockUser, deleteUser, exportUsersCSV } from '@/app/actions/users'
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

type User = {
    id: string
    email: string
    role: string
    status: string
    mfa: string
    lastLog: string
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
    const [newUserEmail, setNewUserEmail] = useState('')
    const [newUserName, setNewUserName] = useState('')
    const [newUserPassword, setNewUserPassword] = useState('')
    const [newUserRole, setNewUserRole] = useState('regulator')
    const [isLoading, setIsLoading] = useState(true)
    const [editForm, setEditForm] = useState({ email: '', role: 'regulator', status: 'Active', mfa: 'Disabled' })

    const fetchUsers = async () => {
        const data = await getUsers()
        setUsers(data)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleInvite = async () => {
        if (!newUserEmail || !newUserName || !newUserPassword) {
            toast.error("Email, name, and password are required")
            return
        }
        const res = await inviteUser({ 
            email: newUserEmail, 
            name: newUserName,
            password: newUserPassword,
            role: newUserRole 
        })
        if (res.success) {
            toast.success('User created successfully!')
            setIsInviteModalOpen(false)
            setNewUserEmail('')
            setNewUserName('')
            setNewUserPassword('')
            fetchUsers()
        } else {
            toast.error(res.error || 'Failed to create user')
        }
    }

    const handleEditClick = (user: User) => {
        setEditingUser(user)
        setEditForm({ email: user.email, role: user.role, status: user.status, mfa: user.mfa })
        setIsEditModalOpen(true)
    }

    const handleUpdateUser = async () => {
        if (!editingUser) return
        const res = await updateUser(editingUser.id, editForm)
        if (res.success) {
            toast.success('User updated successfully!')
            setIsEditModalOpen(false)
            setEditingUser(null)
            fetchUsers()
        } else {
            toast.error(res.error || 'Failed to update user')
        }
    }

    const handleSuspend = async (id: string) => {
        const res = await suspendUser(id)
        if (res.success) {
            toast.success('Account suspended')
            fetchUsers()
        } else {
            toast.error(res.error || 'Error suspending account')
        }
    }

    const handleUnlock = async (id: string) => {
        const res = await unlockUser(id)
        if (res.success) {
            toast.success('Account unlocked')
            fetchUsers()
        } else {
            toast.error(res.error || 'Error unlocking account')
        }
    }

    const handleDeleteClick = (userId: string) => {
        setDeletingUserId(userId)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingUserId) return
        const res = await deleteUser(deletingUserId)
        if (res.success) {
            toast.success('User deleted successfully!')
            setIsDeleteDialogOpen(false)
            setDeletingUserId(null)
            fetchUsers()
        } else {
            toast.error(res.error || 'Failed to delete user')
        }
    }

    const handleExportCSV = async () => {
        const csv = await exportUsersCSV()
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Users exported successfully!')
    }

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            return user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.role.toLowerCase().includes(searchQuery.toLowerCase());
        })
    }, [searchQuery, users])

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
                            <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
                            <p className="text-muted-foreground">Manage platform access, roles, and security policies.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={handleExportCSV}><Download className="w-4 h-4" /> Export CSV</Button>
                        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2"><UserPlus className="w-4 h-4" /> Invite User</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New User Account</DialogTitle>
                                <DialogDescription>
                                    Add a new user to the platform with email, name, password, and role.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email *</Label>
                                    <Input id="email" type="email" placeholder="user@example.com" className="col-span-3" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name *</Label>
                                    <Input id="name" type="text" placeholder="Full Name" className="col-span-3" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="password" className="text-right">Password *</Label>
                                    <Input id="password" type="password" placeholder="••••••••" className="col-span-3" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="text-right">Role</Label>
                                    <select id="role" className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                                        <option value="regulator">Regulator</option>
                                        <option value="analyst">Analyst</option>
                                        <option value="umkm">UMKM</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleInvite}>Create User</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Platform Accounts</CardTitle>
                        <CardDescription>View all registered entities and their RBAC permissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-6">
                            <div className="relative w-72">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by email, ID or Role..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Email Address</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Account Status</TableHead>
                                        <TableHead>MFA Security</TableHead>
                                        <TableHead>Last Active</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={7} className="text-center">Loading users...</TableCell></TableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} className="text-center">No users found.</TableCell></TableRow>
                                    ) : filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-mono text-muted-foreground text-xs">{user.id}</TableCell>
                                            <TableCell className="font-medium">{user.email}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-muted-foreground/20">
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${user.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {user.status === 'Active' ? '● ' : '○ '}{user.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs">{user.mfa}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{user.lastLog}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(user)} className="h-8 w-8 p-0">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    {user.status === 'Locked' ? (
                                                        <Button variant="ghost" size="sm" onClick={() => handleUnlock(user.id)} className="h-8 w-8 p-0 text-green-600">
                                                            <Unlock className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="sm" onClick={() => handleSuspend(user.id)} className="h-8 w-8 p-0 text-orange-600">
                                                            <Settings2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(user.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
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
                    <CardFooter className="flex justify-between border-t p-4 flex-row items-center">
                        <div className="text-xs text-muted-foreground">Showing {filteredUsers.length} accounts</div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Previous</Button>
                            <Button variant="outline" size="sm" onClick={() => toast('Next page loaded')}>Next</Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* Edit User Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Update user information and permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-email" className="text-right">Email</Label>
                                <Input id="edit-email" type="email" className="col-span-3" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-role" className="text-right">Role</Label>
                                <select id="edit-role" className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                                    <option value="regulator">Regulator</option>
                                    <option value="analyst">Analyst</option>
                                    <option value="umkm">UMKM</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-status" className="text-right">Status</Label>
                                <select id="edit-status" className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                                    <option value="Active">Active</option>
                                    <option value="Locked">Locked</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-mfa" className="text-right">MFA</Label>
                                <select id="edit-mfa" className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.mfa} onChange={(e) => setEditForm({ ...editForm, mfa: e.target.value })}>
                                    <option value="Disabled">Disabled</option>
                                    <option value="Enabled">Enabled</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit" onClick={handleUpdateUser}>Update User</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user account and all associated data.
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
