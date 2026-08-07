'use client';

import { useEffect, useState } from 'react';
import { Users, Search, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function UsersPage() {
 const [users, setUsers] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 
 // Modal state
 const [isOpen, setIsOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [editId, setEditId] = useState<string | null>(null);

 // Delete state
 const [deleteOpen, setDeleteOpen] = useState(false);
 const [deleteId, setDeleteId] = useState<string | null>(null);

 const [formData, setFormData] = useState({
 name: '',
 email: '',
 role: 'USER',
 isActive: true
 });

 const fetchUsers = async () => {
 setLoading(true);
 try {
 const { data } = await api.get('/api/users', { params: { search } });
 setUsers(data.data || []);
 } catch (e) { 
 console.error(e); 
 } finally { 
 setLoading(false); 
 }
 };

 useEffect(() => {
 fetchUsers();
 }, [search]);

 const openCreateDialog = () => {
 setEditId(null);
 setFormData({ name: '', email: '', role: 'USER', isActive: true });
 setIsOpen(true);
 };

 const openEditDialog = (user: any) => {
 setEditId(user.id);
 setFormData({
 name: user.name,
 email: user.email,
 role: user.role,
 isActive: user.isActive,
 });
 setIsOpen(true);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 if (editId) {
 await api.put('/api/users', { id: editId, ...formData });
 } else {
 await api.post('/api/users', formData);
 }
 setIsOpen(false);
 fetchUsers();
 } catch (error) {
 console.error('Error saving user:', error);
 alert('Failed to save User');
 } finally {
 setIsSubmitting(false);
 }
 };

 const confirmDelete = async () => {
 if (!deleteId) return;
 setIsSubmitting(true);
 try {
 await api.delete(`/api/users?id=${deleteId}`);
 setDeleteOpen(false);
 fetchUsers();
 } catch (error) {
 console.error('Failed to delete user', error);
 alert('Failed to delete user');
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="space-y-6">
 <div className="animate-fade-in">
        <h1 className="text-2xl font-bold">User Management</h1>
 <p className="text-sm text-muted-foreground mt-0.5">Manage system access and roles</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input 
 type="search" 
 placeholder="Search name or email..." 
 value={search} 
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9"
 />
        </div>
        <Button onClick={openCreateDialog} className="gap-2 ">
 <Plus className="w-4 h-4" /> Add User
 </Button>
      </div>

 <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
 {loading ? (
 <div className="p-8 text-center flex flex-col items-center bg-card border rounded-xl ">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-muted-foreground">Loading users...</p>
 </div>
 ) : users.length > 0 ? (
 <Table className="whitespace-nowrap">
 <TableHeader>
 <TableRow>
 <TableHead className="w-[250px]">Name</TableHead>
 <TableHead className="w-[200px]">Email</TableHead>
 <TableHead className="w-[150px]">Role</TableHead>
 <TableHead className="w-[120px]">Status</TableHead>
 <TableHead className="w-[80px] text-right">Action</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {users.map((u) => (
 <TableRow key={u.id} className="hover:bg-muted/30">
 <TableCell className="font-medium">{u.name}</TableCell>
 <TableCell>{u.email}</TableCell>
 <TableCell>
 <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none text-xs font-normal">
 {u.role}
 </Badge>
 </TableCell>
 <TableCell>
 {u.isActive ? (
 <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 font-normal">Active</Badge>
 ) : (
 <Badge variant="outline" className="text-gray-500 bg-gray-50 border-gray-200 font-normal">Inactive</Badge>
 )}
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(u)}>
 <Pencil className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setDeleteId(u.id); setDeleteOpen(true); }}>
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 ) : (
 <div className="text-center py-16 bg-card border rounded-xl ">
 <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
 <p className="text-muted-foreground">No users found</p>
 <Button variant="link" onClick={openCreateDialog} className="mt-2">
 Add a new user
 </Button>
 </div>
 )}
 </div>

 <Dialog open={isOpen} onOpenChange={setIsOpen}>
 <DialogContent>
 <form onSubmit={handleSubmit}>
 <DialogHeader>
 <DialogTitle>{editId ? 'Edit User' : 'Add New User'}</DialogTitle>
 <DialogDescription>{editId ? 'Update user details.' : 'Register a new user to the system.'}</DialogDescription>
 </DialogHeader>
 <div className="grid gap-4 py-4">
 <div className="grid gap-2">
 <Label htmlFor="name">Full Name *</Label>
 <Input 
 id="name" 
 placeholder="e.g. John Doe" 
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 required 
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="email">Email Address *</Label>
 <Input 
 id="email" 
 type="email"
 placeholder="e.g. john@example.com" 
 value={formData.email}
 onChange={(e) => setFormData({...formData, email: e.target.value})}
 required 
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="grid gap-2">
 <Label htmlFor="role">System Role</Label>
 <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
 <SelectTrigger>
 <SelectValue placeholder="Select Role" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="ADMIN">Administrator</SelectItem>
 <SelectItem value="USER">Standard User</SelectItem>
 <SelectItem value="FINANCE">Finance</SelectItem>
 <SelectItem value="MANAGER">Manager</SelectItem>
 </SelectContent>
 </Select>
 </div>
 {editId && (
 <div className="grid gap-2">
 <Label htmlFor="status">Status</Label>
 <Select value={formData.isActive ? "ACTIVE" : "INACTIVE"} onValueChange={(val) => setFormData({...formData, isActive: val === "ACTIVE"})}>
 <SelectTrigger>
 <SelectValue placeholder="Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="ACTIVE">Active</SelectItem>
 <SelectItem value="INACTIVE">Inactive</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}
 </div>
 </div>
 <DialogFooter>
 <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
 Cancel
 </Button>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
 {editId ? 'Save Changes' : 'Save User'}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>

 <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>Confirm Deletion</DialogTitle>
 <DialogDescription>
 Are you sure you want to delete this user? This action cannot be undone.
 </DialogDescription>
 </DialogHeader>
 <DialogFooter className="pt-4">
 <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
 Cancel
 </Button>
 <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 Delete
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 );
}
