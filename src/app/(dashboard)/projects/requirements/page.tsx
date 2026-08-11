'use client';

import { useEffect, useState } from 'react';
import { 
 ClipboardList, Plus, Search, MapPin, FolderKanban, 
 Loader2, Pencil, Trash2, Package, MoreHorizontal, Eye 
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronsUpDown } from 'lucide-react';
import { DataTablePagination } from '@/components/shared/DataTablePagination';

export default function RequirementsPage() {
 const [requirements, setRequirements] = useState<any[]>([]);
 const [projects, setProjects] = useState<any[]>([]);
 const [materials, setMaterials] = useState<any[]>([]);
 
 const [loading, setLoading] = useState(true);
 const [selectedProject, setSelectedProject] = useState<string>('');
 const [projectSearch, setProjectSearch] = useState('');
 const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);
 const [materialSearch, setMaterialSearch] = useState('');
 const [materialPopoverOpen, setMaterialPopoverOpen] = useState(false);
 
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(10);
 
 // Dialog State
 const [isOpen, setIsOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [editId, setEditId] = useState<string | null>(null);
 const [viewReq, setViewReq] = useState<any>(null);
 
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
 setPage(1);
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
 <div className="space-y-1 flex-1 w-full max-w-full md:max-w-[600px]">
 <Label className="text-xs text-muted-foreground">Select Project</Label>
 <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
   <PopoverTrigger
       className="flex h-10 w-full max-w-full min-w-0 overflow-hidden items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
     >
       <span className="truncate text-left flex-1 pr-2">
       {selectedProject
         ? projects.find((p) => p.id === selectedProject)?.projectName
         : "Select a project..."}
       </span>
       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
   </PopoverTrigger>
   <PopoverContent className="w-(--anchor-width) min-w-[300px] p-0" align="start">
     <div className="flex items-center border-b px-3">
       <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
       <Input
         placeholder="Search project..."
         className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
         value={projectSearch}
         onChange={(e) => setProjectSearch(e.target.value)}
       />
     </div>
     <div className="max-h-[300px] overflow-y-auto p-1">
       {projects.filter(p => p.projectName.toLowerCase().includes(projectSearch.toLowerCase())).length === 0 ? (
         <div className="py-6 text-center text-sm text-muted-foreground">No project found.</div>
       ) : (
         projects.filter(p => p.projectName.toLowerCase().includes(projectSearch.toLowerCase())).map(p => (
           <div
             key={p.id}
             className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${selectedProject === p.id ? 'bg-accent text-accent-foreground' : ''}`}
             onClick={() => {
               setSelectedProject(p.id);
               setProjectPopoverOpen(false);
             }}
           >
             {selectedProject === p.id && (
               <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                 <Check className="h-4 w-4" />
               </span>
             )}
             {p.projectName}
           </div>
         ))
       )}
     </div>
   </PopoverContent>
 </Popover>
 </div>
 </div>
 
 <div className={`flex gap-6 text-sm text-muted-foreground bg-muted/30 px-6 h-[60px] items-center rounded-lg w-full md:w-auto ${!activeProject ? 'opacity-0 pointer-events-none' : ''}`}>
 <div className="flex flex-col justify-center">
 <span className="text-xs opacity-70">Customer</span>
 <span className="font-medium text-foreground">{activeProject?.customer || '-'}</span>
 </div>
 <div className="flex flex-col justify-center">
 <span className="text-xs opacity-70">Region</span>
 <span className="font-medium text-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/> {activeProject?.region || '-'}</span>
 </div>
 </div>
 </div>

 <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
 {loading ? (
 <div className="p-8 text-center flex flex-col items-center bg-card border rounded-xl ">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-muted-foreground">Loading requirements...</p>
 </div>
 ) : requirements.length > 0 ? (
 <>
 <Table className="bg-card border rounded-xl overflow-hidden">
 <TableHeader>
 <TableRow className="bg-muted/50">
 <TableHead className="w-[250px] sticky left-0 z-20 bg-muted border-r">Material Code</TableHead>
 <TableHead className="w-[500px] min-w-[500px] max-w-[500px]">Material Name</TableHead>
 <TableHead className="w-[150px]">Category</TableHead>
 <TableHead className="w-[100px] text-right">Estimated Qty</TableHead>
 <TableHead className="w-[150px]">Unit</TableHead>
 <TableHead className="w-[250px]">Notes</TableHead>
 <TableHead className="w-[80px] text-right">Action</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {requirements.slice((page - 1) * pageSize, page * pageSize).map((req) => (
 <TableRow key={req.id} className="hover:bg-muted/30 group">
 <TableCell className="font-medium text-primary sticky left-0 z-10 bg-card group-hover:bg-muted/50 border-r transition-colors">
 <div className="flex items-center gap-2">
 <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
 {req.materialCode}
 </div>
 </TableCell>
 <TableCell className="w-[500px] min-w-[500px] max-w-[500px] whitespace-normal break-words">{req.materialName}</TableCell>
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
 <DropdownMenu>
 <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-primary outline-none">
 <MoreHorizontal className="h-4 w-4" />
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-48">
 <DropdownMenuItem onClick={() => setViewReq(req)} className="cursor-pointer text-muted-foreground">
 <Eye className="mr-2 h-4 w-4" />
 View Details
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => openEditDialog(req)} className="cursor-pointer text-muted-foreground">
 <Pencil className="mr-2 h-4 w-4" />
 Edit Requirement
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => setDeleteId(req.id)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
 <Trash2 className="mr-2 h-4 w-4" />
 Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 <DataTablePagination 
    totalItems={requirements.length} 
    pageSize={pageSize} 
    currentPage={page} 
    onPageChange={setPage} 
    onPageSizeChange={setPageSize} 
 />
 </>
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
 <DialogContent className="sm:max-w-2xl md:max-w-3xl">
 <DialogHeader>
 <DialogTitle>{editId ? 'Edit Material Requirement' : 'Add Material Requirement'}</DialogTitle>
 <DialogDescription>
 {editId ? 'Update the quantity or notes.' : 'Select a material and enter the estimated quantity for this project.'}
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleSubmit} className="space-y-4 pt-4">
 {!editId && (
 <div className="space-y-2">
 <Label htmlFor="materialId">Material <span className="text-destructive">*</span></Label>
 <Popover open={materialPopoverOpen} onOpenChange={setMaterialPopoverOpen}>
   <PopoverTrigger
       className="flex min-h-10 h-auto w-full max-w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
     >
       <span className="text-left flex-1 pr-2 break-words whitespace-normal">
       {formData.materialId
         ? (() => {
             const m = materials.find((m) => m.id === formData.materialId);
             return m ? `[${m.materialCode}] ${m.materialName}` : "Select material...";
           })()
         : "Select material..."}
       </span>
       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
   </PopoverTrigger>
   <PopoverContent className="w-(--anchor-width) min-w-[300px] p-0" align="start">
     <div className="flex items-center border-b px-3">
       <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
       <Input
         placeholder="Search material code or name..."
         className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
         value={materialSearch}
         onChange={(e) => setMaterialSearch(e.target.value)}
       />
     </div>
     <div className="max-h-[300px] overflow-y-auto p-1">
        {materials.filter(m => 
            !requirements.some(r => r.materialId === m.id) &&
            (m.materialCode.toLowerCase().includes(materialSearch.toLowerCase()) || 
             m.materialName.toLowerCase().includes(materialSearch.toLowerCase()))
          ).length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No material found or all available materials are already added.</div>
        ) : (
          materials.filter(m => 
            !requirements.some(r => r.materialId === m.id) &&
            (m.materialCode.toLowerCase().includes(materialSearch.toLowerCase()) || 
             m.materialName.toLowerCase().includes(materialSearch.toLowerCase()))
          ).map(m => (
           <div
             key={m.id}
             className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${formData.materialId === m.id ? 'bg-accent text-accent-foreground' : ''}`}
             onClick={() => {
               setFormData({ ...formData, materialId: m.id });
               setMaterialPopoverOpen(false);
             }}
           >
             {formData.materialId === m.id && (
               <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                 <Check className="h-4 w-4" />
               </span>
             )}
             [{m.materialCode}] {m.materialName}
           </div>
         ))
       )}
     </div>
   </PopoverContent>
 </Popover>
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
 <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setIsOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || !formData.materialId}>
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
 <Button variant="outline" className="w-full sm:w-auto" onClick={() => setDeleteId(null)}>Cancel</Button>
 <Button variant="destructive" className="w-full sm:w-auto" onClick={handleDelete} disabled={isDeleting}>
 {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
 Remove
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 <Dialog open={!!viewReq} onOpenChange={(open) => !open && setViewReq(null)}>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>Requirement Details</DialogTitle>
 <DialogDescription>
 Detailed view of the material requirement.
 </DialogDescription>
 </DialogHeader>
 {viewReq && (
 <div className="space-y-4 pt-4">
 <div className="grid grid-cols-3 gap-2 text-sm">
 <span className="font-medium text-muted-foreground">Material Code:</span>
 <span className="col-span-2 font-semibold text-primary">{viewReq.materialCode}</span>
 </div>
 <div className="grid grid-cols-3 gap-2 text-sm">
 <span className="font-medium text-muted-foreground">Material Name:</span>
 <span className="col-span-2 whitespace-normal break-words">{viewReq.materialName}</span>
 </div>
 <div className="grid grid-cols-3 gap-2 text-sm">
 <span className="font-medium text-muted-foreground">Category:</span>
 <span className="col-span-2">
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
 {viewReq.category}
 </span>
 </span>
 </div>
 <div className="grid grid-cols-3 gap-2 text-sm">
 <span className="font-medium text-muted-foreground">Est. Qty:</span>
 <span className="col-span-2 font-semibold">{viewReq.estimatedQty} {viewReq.unit}</span>
 </div>
 <div className="grid grid-cols-3 gap-2 text-sm">
 <span className="font-medium text-muted-foreground">Notes:</span>
 <span className="col-span-2">{viewReq.notes || '-'}</span>
 </div>
 </div>
 )}
 <DialogFooter className="pt-4">
 <Button variant="outline" className="w-full sm:w-auto" onClick={() => setViewReq(null)}>Close</Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 );
}
