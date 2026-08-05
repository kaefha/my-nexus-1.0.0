'use client';

import { useEffect, useState } from 'react';
import { 
 ClipboardList, Plus, Search, MapPin, FolderKanban, 
 Loader2, Pencil, Trash2, Package 
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function RequirementsPage() {
 const [requirements, setRequirements] = useState<any[]>([]);
 const [projects, setProjects] = useState<any[]>([]);
 const [materials, setMaterials] = useState<any[]>([]);
 
 const [loading, setLoading] = useState(true);
 const [selectedProject, setSelectedProject] = useState<string>('');
 
 // Dialog State
 const [isOpen, setIsOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [editId, setEditId] = useState<string | null>(null);
 
 const [formData, setFormData] = useState({
 projectId: '',
 materialId: '',
 estimatedQty: '',
 notes: '',
 });

 // Delete State
 const [deleteId, setDeleteId] = useState<string | null>(null);
 const [isDeleting, setIsDeleting] = useState(false);

 useEffect(() => {
 fetchInitialData();
 }, []);

 useEffect(() => {
 fetchRequirements();
 }, [selectedProject]);

 const fetchInitialData = async () => {
 try {
 const [projRes, matRes] = await Promise.all([
 api.get('/api/projects?limit=100'),
 api.get('/api/materials?limit=1000')
 ]);
 setProjects(projRes.data.data || []);
 setMaterials(matRes.data.data || []);
 
 if (projRes.data.data?.length > 0) {
 setSelectedProject(projRes.data.data[0].id);
 }
 } catch (error) {
 console.error(error);
 }
 };

 const fetchRequirements = async () => {
 if (!selectedProject) return;
 setLoading(true);
 try {
 const { data } = await api.get(`/api/projects/requirements?projectId=${selectedProject}`);
 setRequirements(data.data || []);
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 }
 };

 const openCreateDialog = () => {
 setEditId(null);
 setFormData({ 
 projectId: selectedProject || (projects[0]?.id || ''), 
 materialId: '', 
 estimatedQty: '', 
 notes: '' 
 });
 setIsOpen(true);
 };

 const openEditDialog = (req: any) => {
 setEditId(req.id);
 setFormData({
 projectId: req.projectId,
 materialId: req.materialId,
 estimatedQty: req.estimatedQty.toString(),
 notes: req.notes || ''
 });
 setIsOpen(true);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 if (editId) {
 await api.put('/api/projects/requirements', { id: editId, ...formData });
 } else {
 await api.post('/api/projects/requirements', formData);
 }
 setIsOpen(false);
 fetchRequirements();
 } catch (error) {
 console.error('Failed to save requirement', error);
 alert('Failed to save requirement');
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async () => {
 if (!deleteId) return;
 setIsDeleting(true);
 try {
 await api.delete(`/api/projects/requirements?id=${deleteId}`);
 setDeleteId(null);
 fetchRequirements();
 } catch (error) {
 console.error('Failed to delete requirement', error);
 alert('Failed to delete requirement');
 } finally {
 setIsDeleting(false);
 }
 };

 const activeProject = projects.find(p => p.id === selectedProject);

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between animate-fade-in">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">Material Requirements</h1>
 <p className="text-sm text-muted-foreground mt-1">Plan and allocate materials (BoM) for your projects</p>
 </div>
 
 <Button className="gap-2" onClick={openCreateDialog} disabled={!selectedProject}>
 <Plus className="w-4 h-4" /> Add Material
 </Button>
 </div>

 <div className="bg-card border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>
 <div className="flex items-center gap-4 w-full md:w-auto">
 <FolderKanban className="w-5 h-5 text-primary" />
 <div className="space-y-1 flex-1 md:w-64">
 <Label className="text-xs text-muted-foreground">Select Project</Label>
 <select 
 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
 value={selectedProject}
 onChange={(e) => setSelectedProject(e.target.value)}
 >
 <option value="" disabled>Select a project</option>
 {projects.map(p => (
 <option key={p.id} value={p.id}>{p.projectName}</option>
 ))}
 </select>
 </div>
 </div>
 
 {activeProject && (
 <div className="flex gap-6 text-sm text-muted-foreground bg-muted/30 px-6 py-3 rounded-lg w-full md:w-auto">
 <div className="flex flex-col">
 <span className="text-xs opacity-70">Customer</span>
 <span className="font-medium text-foreground">{activeProject.customer}</span>
 </div>
 <div className="flex flex-col">
 <span className="text-xs opacity-70">Region</span>
 <span className="font-medium text-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/> {activeProject.region}</span>
 </div>
 </div>
 )}
 </div>

 <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
 {loading ? (
 <div className="p-8 text-center flex flex-col items-center bg-card border rounded-xl ">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-muted-foreground">Loading requirements...</p>
 </div>
 ) : requirements.length > 0 ? (
 <Table className="bg-card border rounded-xl overflow-hidden">
 <TableHeader>
 <TableRow className="bg-muted/50">
 <TableHead>Material Code</TableHead>
 <TableHead>Material Name</TableHead>
 <TableHead>Category</TableHead>
 <TableHead className="text-right">Estimated Qty</TableHead>
 <TableHead>Unit</TableHead>
 <TableHead>Notes</TableHead>
 <TableHead className="text-right">Action</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {requirements.map((req) => (
 <TableRow key={req.id} className="hover:bg-muted/30 group">
 <TableCell className="font-medium text-primary">
 <div className="flex items-center gap-2">
 <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
 {req.materialCode}
 </div>
 </TableCell>
 <TableCell>{req.materialName}</TableCell>
 <TableCell>
 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
 {req.category}
 </span>
 </TableCell>
 <TableCell className="text-right font-semibold">{req.estimatedQty}</TableCell>
 <TableCell className="text-muted-foreground">{req.unit}</TableCell>
 <TableCell className="text-muted-foreground max-w-[200px] truncate">{req.notes || '-'}</TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(req)}>
 <Pencil className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(req.id)}>
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 ) : (
 <div className="text-center py-20 bg-card border rounded-xl ">
 <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
 <h3 className="text-lg font-semibold mb-1">No Requirements Found</h3>
 <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
 You haven't added any material requirements for this project yet. Start building your BoM.
 </p>
 <Button onClick={openCreateDialog} disabled={!selectedProject}>
 <Plus className="w-4 h-4 mr-2" /> Add First Material
 </Button>
 </div>
 )}
 </div>

 {/* Forms and Dialogs */}
 <Dialog open={isOpen} onOpenChange={setIsOpen}>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>{editId ? 'Edit Material Requirement' : 'Add Material Requirement'}</DialogTitle>
 <DialogDescription>
 {editId ? 'Update the quantity or notes.' : 'Select a material and enter the estimated quantity for this project.'}
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleSubmit} className="space-y-4 py-4">
 {!editId && (
 <div className="space-y-2">
 <Label htmlFor="materialId">Material <span className="text-destructive">*</span></Label>
 <select 
 id="materialId"
 required
 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
 value={formData.materialId}
 onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
 >
 <option value="" disabled>Select material...</option>
 {materials.map(m => (
 <option key={m.id} value={m.id}>
 [{m.materialCode}] {m.materialName}
 </option>
 ))}
 </select>
 </div>
 )}
 <div className="space-y-2">
 <Label htmlFor="estimatedQty">Estimated Quantity <span className="text-destructive">*</span></Label>
 <Input
 id="estimatedQty"
 type="number"
 min="1"
 placeholder="e.g. 100"
 required
 value={formData.estimatedQty}
 onChange={(e) => setFormData({ ...formData, estimatedQty: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="notes">Notes / Remarks</Label>
 <Input
 id="notes"
 placeholder="Optional notes..."
 value={formData.notes}
 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
 />
 </div>
 <DialogFooter className="pt-4">
 <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" disabled={isSubmitting || !formData.materialId}>
 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {editId ? 'Save Changes' : 'Add Material'}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>

 <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>Remove Material?</DialogTitle>
 <DialogDescription>
 Are you sure you want to remove this material from the project requirements?
 </DialogDescription>
 </DialogHeader>
 <DialogFooter className="pt-4">
 <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
 <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
 {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
 Remove
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 );
}
