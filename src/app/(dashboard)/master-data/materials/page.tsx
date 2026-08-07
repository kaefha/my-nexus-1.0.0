'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Search, Loader2, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function MaterialsPage() {
 const [materials, setMaterials] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 
 // Dialog State
 const [isOpen, setIsOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [editId, setEditId] = useState<string | null>(null);
 
 // Delete Dialog State
 const [deleteOpen, setDeleteOpen] = useState(false);
 const [deleteId, setDeleteId] = useState<string | null>(null);

 const [formData, setFormData] = useState({
 code: '',
 name: '',
 group: '',
 uom: '',
 description: '',
 });

 useEffect(() => {
 fetchMaterials();
 }, [search]);

 const fetchMaterials = async () => {
 try {
 const { data } = await api.get('/api/materials', { params: { search, limit: 100 } });
 setMaterials(data.data || []);
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 }
 };

 const openCreateDialog = () => {
 setEditId(null);
 setFormData({ code: '', name: '', group: '', uom: '', description: '' });
 setIsOpen(true);
 };

 const openEditDialog = (material: any) => {
 setEditId(material.id);
 setFormData({
 code: material.materialCode,
 name: material.materialName,
 group: material.category,
 uom: material.unit,
 description: material.specification,
 });
 setIsOpen(true);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 if (editId) {
 await api.put('/api/materials', {
 id: editId,
 materialCode: formData.code,
 materialName: formData.name,
 category: formData.group,
 specification: formData.description,
 unit: formData.uom,
 minimumStock: 0,
 isActive: true
 });
 } else {
 await api.post('/api/materials', formData);
 }
 setIsOpen(false);
 fetchMaterials();
 } catch (error) {
 console.error('Failed to save material', error);
 alert('Failed to save material');
 } finally {
 setIsSubmitting(false);
 }
 };

 const confirmDelete = async () => {
 if (!deleteId) return;
 setIsSubmitting(true);
 try {
 await api.delete(`/api/materials?id=${deleteId}`);
 setDeleteOpen(false);
 fetchMaterials();
 } catch (error) {
 console.error('Failed to delete material', error);
 alert('Failed to delete material');
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="space-y-6">
 <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Material Master Data</h1>
 <p className="text-sm text-muted-foreground mt-1">Manage network materials and inventory catalog</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 type="search"
 placeholder="Search materials by code or name..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9"
 />
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
 <Plus className="w-4 h-4" /> Add Material
 </Button>
 
 <Dialog open={isOpen} onOpenChange={setIsOpen}>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>{editId ? 'Edit Material' : 'Add Material'}</DialogTitle>
 <DialogDescription>
 {editId ? 'Update the details of this material.' : 'Add a new material to the master data catalog.'}
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleSubmit} className="space-y-4 py-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="code">Material Code</Label>
 <Input
 id="code"
 placeholder="e.g. CBL-FO-48"
 required
 value={formData.code}
 onChange={(e) => setFormData({ ...formData, code: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="uom">Unit of Measure (UOM)</Label>
 <Input
 id="uom"
 placeholder="e.g. Meter, Roll, Pcs"
 required
 value={formData.uom}
 onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
 />
 </div>
 </div>
 <div className="space-y-2">
 <Label htmlFor="name">Material Name</Label>
 <Input
 id="name"
 placeholder="e.g. Fiber Optic Cable 48 Core"
 required
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="group">Group / Category</Label>
 <Input
 id="group"
 placeholder="e.g. CABLE, OSP, ACTIVE_DEVICE"
 required
 value={formData.group}
 onChange={(e) => setFormData({ ...formData, group: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="description">Description</Label>
 <Input
 id="description"
 placeholder="Optional details"
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 />
 </div>
 <DialogFooter className="pt-4">
 <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {editId ? 'Save Changes' : 'Save Material'}
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
 Are you sure you want to delete this material? This action cannot be undone.
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

 <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
 {loading ? (
 <div className="p-8 text-center flex flex-col items-center bg-card border rounded-xl ">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-muted-foreground">Loading materials...</p>
 </div>
 ) : materials.length > 0 ? (
 <Table className="whitespace-nowrap">
 <TableHeader>
 <TableRow>
 <TableHead className="w-[150px]">Code</TableHead>
 <TableHead className="w-[250px]">Name</TableHead>
 <TableHead className="w-[150px]">Group</TableHead>
 <TableHead className="w-[150px]">UOM</TableHead>
 <TableHead className="w-[80px] text-right">Action</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {materials.map((material) => (
 <TableRow key={material.id} className="hover:bg-muted/30">
 <TableCell className="font-medium text-primary">
 {material.materialCode}
 </TableCell>
 <TableCell className="font-medium whitespace-normal max-w-[350px] break-words">
 {material.materialName}
 </TableCell>
 <TableCell>
 <Badge variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground">
 {material.category}
 </Badge>
 </TableCell>
 <TableCell>{material.unit}</TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(material)}>
 <Pencil className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setDeleteId(material.id); setDeleteOpen(true); }}>
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
 <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
 <p className="text-muted-foreground">No materials found</p>
 <Button variant="link" onClick={openCreateDialog} className="mt-2">
 Create your first material
 </Button>
 </div>
 )}
 </div>
 </div>
 );
}
