'use client';

import { useEffect, useState } from 'react';
import { Building2, Search, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function VendorsPage() {
 const [vendors, setVendors] = useState<any[]>([]);
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
 vendorCode: '',
 name: '',
 contactPerson: '',
 email: '',
 phone: '',
 address: '',
 isActive: true
 });

 const fetchVendors = async () => {
 setLoading(true);
 try {
 const { data } = await api.get('/api/vendors', { params: { search } });
 setVendors(data.data || []);
 } catch (e) { 
 console.error(e); 
 } finally { 
 setLoading(false); 
 }
 };

 useEffect(() => {
 fetchVendors();
 }, [search]);

 const openCreateDialog = () => {
 setEditId(null);
 setFormData({ vendorCode: '', name: '', contactPerson: '', email: '', phone: '', address: '', isActive: true });
 setIsOpen(true);
 };

 const openEditDialog = (vendor: any) => {
 setEditId(vendor.id);
 setFormData({
 vendorCode: vendor.vendorCode,
 name: vendor.name,
 contactPerson: vendor.contactPerson || '',
 email: vendor.email || '',
 phone: vendor.phone || '',
 address: vendor.address || '',
 isActive: vendor.isActive,
 });
 setIsOpen(true);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 if (editId) {
 await api.put('/api/vendors', { id: editId, ...formData });
 } else {
 await api.post('/api/vendors', formData);
 }
 setIsOpen(false);
 fetchVendors();
 } catch (error) {
 console.error('Error saving vendor:', error);
 alert('Failed to save Vendor');
 } finally {
 setIsSubmitting(false);
 }
 };

 const confirmDelete = async () => {
 if (!deleteId) return;
 setIsSubmitting(true);
 try {
 await api.delete(`/api/vendors?id=${deleteId}`);
 setDeleteOpen(false);
 fetchVendors();
 } catch (error) {
 console.error('Failed to delete vendor', error);
 alert('Failed to delete vendor');
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="space-y-6">
 <div className="animate-fade-in">
        <h1 className="text-2xl font-bold">Vendor Master Data</h1>
 <p className="text-sm text-muted-foreground mt-0.5">Manage your network of suppliers and partners</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input 
 type="search" 
 placeholder="Search vendor code or name..." 
 value={search} 
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9"
 />
        </div>
        <Button onClick={openCreateDialog} className="gap-2 ">
 <Plus className="w-4 h-4" /> Add Vendor
 </Button>
      </div>

 <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
 {loading ? (
 <div className="p-8 text-center flex flex-col items-center bg-card border rounded-xl ">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-muted-foreground">Loading vendors...</p>
 </div>
 ) : vendors.length > 0 ? (
 <Table className="whitespace-nowrap">
 <TableHeader>
 <TableRow>
 <TableHead>Vendor Code</TableHead>
 <TableHead>Vendor Name</TableHead>
 <TableHead>Contact Person</TableHead>
 <TableHead>Contact Info</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Action</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {vendors.map((v) => (
 <TableRow key={v.id} className="hover:bg-muted/30">
 <TableCell className="font-medium text-primary">{v.vendorCode}</TableCell>
 <TableCell className="font-medium">{v.name}</TableCell>
 <TableCell>{v.contactPerson || '-'}</TableCell>
 <TableCell>
 <div className="text-sm">
 {v.email && <div>{v.email}</div>}
 {v.phone && <div className="text-muted-foreground">{v.phone}</div>}
 </div>
 </TableCell>
 <TableCell>
 {v.isActive ? (
 <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 font-normal">Active</Badge>
 ) : (
 <Badge variant="outline" className="text-gray-500 bg-gray-50 border-gray-200 font-normal">Inactive</Badge>
 )}
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(v)}>
 <Pencil className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setDeleteId(v.id); setDeleteOpen(true); }}>
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
 <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
 <p className="text-muted-foreground">No vendors found</p>
 <Button variant="link" onClick={openCreateDialog} className="mt-2">
 Register your first vendor
 </Button>
 </div>
 )}
 </div>

 <Dialog open={isOpen} onOpenChange={setIsOpen}>
 <DialogContent>
 <form onSubmit={handleSubmit}>
 <DialogHeader>
 <DialogTitle>{editId ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
 <DialogDescription>{editId ? 'Update vendor information.' : 'Register a new supplier or partner.'}</DialogDescription>
 </DialogHeader>
 <div className="grid gap-4 py-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="grid gap-2">
 <Label htmlFor="vendorCode">Vendor Code *</Label>
 <Input 
 id="vendorCode" 
 placeholder="e.g. VND-001" 
 value={formData.vendorCode}
 onChange={(e) => setFormData({...formData, vendorCode: e.target.value})}
 required 
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="name">Vendor Name *</Label>
 <Input 
 id="name" 
 placeholder="e.g. PT Maju Jaya" 
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 required 
 />
 </div>
 </div>
 <div className="grid gap-2">
 <Label htmlFor="contactPerson">Contact Person</Label>
 <Input 
 id="contactPerson" 
 placeholder="e.g. Budi Santoso" 
 value={formData.contactPerson}
 onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="grid gap-2">
 <Label htmlFor="email">Email Address</Label>
 <Input 
 id="email" 
 type="email"
 placeholder="e.g. contact@majujaya.com" 
 value={formData.email}
 onChange={(e) => setFormData({...formData, email: e.target.value})}
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="phone">Phone Number</Label>
 <Input 
 id="phone" 
 placeholder="e.g. 021-1234567" 
 value={formData.phone}
 onChange={(e) => setFormData({...formData, phone: e.target.value})}
 />
 </div>
 </div>
 <div className="grid gap-2">
 <Label htmlFor="address">Address</Label>
 <Textarea 
 id="address" 
 placeholder="Vendor's full address..." 
 value={formData.address}
 onChange={(e) => setFormData({...formData, address: e.target.value})}
 />
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
 <DialogFooter>
 <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
 Cancel
 </Button>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
 {editId ? 'Save Changes' : 'Save Vendor'}
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
 Are you sure you want to delete this vendor? This action cannot be undone.
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
