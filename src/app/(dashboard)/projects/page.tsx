'use client';

import { useEffect, useState } from 'react';
import { FolderKanban, Plus, Search, MapPin, Calendar, Users, Loader2, Pencil, Trash2, History, GitCommit, FileText, CheckCircle2, PlayCircle, PauseCircle } from 'lucide-react';
import api from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';


export default function ProjectsPage() {
 const [projects, setProjects] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 
 // Dialog State
 const [isOpen, setIsOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [editId, setEditId] = useState<string | null>(null);
 const [formData, setFormData] = useState({
 projectName: '',
 customer: '',
 region: '',
 startDate: '',
 pic: '',
 status: 'PLANNING'
 });

 // Delete State
 const [deleteId, setDeleteId] = useState<string | null>(null);
 const [isDeleting, setIsDeleting] = useState(false);

 // Activity Log State
 const [isLogOpen, setIsLogOpen] = useState(false);
 const [activities, setActivities] = useState<any[]>([]);
 const [loadingActivities, setLoadingActivities] = useState(false);
 const [selectedProjectName, setSelectedProjectName] = useState('');

 useEffect(() => {
 fetchProjects();
 }, [search]);

 const fetchProjects = async () => {
 try {
 const { data } = await api.get('/api/projects', { params: { search, limit: 50 } });
 setProjects(data.data || []);
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 }
 };

 const openActivityLog = async (project: any) => {
   setSelectedProjectName(project.projectName);
   setIsLogOpen(true);
   setLoadingActivities(true);
   setActivities([]);
   try {
     const { data } = await api.get(`/api/projects/activities/${project.id}`);
     setActivities(data.data || []);
   } catch (error) {
     console.error('Failed to load activities', error);
   } finally {
     setLoadingActivities(false);
   }
 };

 const getActivityIcon = (action: string, statusText: string = '') => {
   if (action === 'CREATED') return <FileText className="w-4 h-4" />;
   if (action === 'STATUS_CHANGED') {
     const st = statusText.toLowerCase();
     if (st.includes('completed')) return <CheckCircle2 className="w-4 h-4" />;
     if (st.includes('progress') || st.includes('start')) return <PlayCircle className="w-4 h-4" />;
     if (st.includes('hold')) return <PauseCircle className="w-4 h-4" />;
   }
   return <GitCommit className="w-4 h-4" />;
 };

 const renderActivityDetails = (details: string) => {
   const match = details.match(/Status changed from (.*) to (.*)/);
   if (match) {
     return (
       <span className="flex items-center flex-wrap gap-x-1.5 gap-y-1 mt-1">
         Status changed from <StatusBadge status={match[1]} /> to <StatusBadge status={match[2]} />
       </span>
     );
   }
   return details;
 };

 const openCreateDialog = () => {
 setEditId(null);
 setFormData({ projectName: '', customer: '', region: '', startDate: '', pic: '', status: 'PLANNING' });
 setIsOpen(true);
 };

 const openEditDialog = (project: any) => {
 setEditId(project.id);
 setFormData({
 projectName: project.projectName,
 customer: project.customer,
 region: project.region,
 startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
 pic: project.pic,
 status: project.status || 'PLANNING'
 });
 setIsOpen(true);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 if (editId) {
 await api.put('/api/projects', { id: editId, ...formData });
 } else {
 await api.post('/api/projects', formData);
 }
 setIsOpen(false);
 fetchProjects();
 } catch (error) {
 console.error('Failed to save project', error);
 alert('Failed to save project');
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async () => {
 if (!deleteId) return;
 setIsDeleting(true);
 try {
 await api.delete(`/api/projects?id=${deleteId}`);
 setDeleteId(null);
 fetchProjects();
 } catch (error) {
 console.error('Failed to delete project', error);
 alert('Failed to delete project');
 } finally {
 setIsDeleting(false);
 }
 };

 return (
 <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your network infrastructure projects</p>
      </div>

 <Dialog open={isOpen} onOpenChange={setIsOpen}>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>{editId ? 'Edit Project' : 'Create Project'}</DialogTitle>
 <DialogDescription>
 {editId ? 'Update the details of this project.' : 'Add a new project to your inventory management system.'}
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleSubmit} className="space-y-4 py-4">
 <div className="space-y-2">
 <Label htmlFor="projectName">Project Name</Label>
 <Input
 id="projectName"
 placeholder="e.g. Fiber Optic Jkt-Bdg"
 required
 value={formData.projectName}
 onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="customer">Customer / Client</Label>
 <Input
 id="customer"
 placeholder="e.g. PT Telkom"
 required
 value={formData.customer}
 onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="region">Region / Area</Label>
 <Input
 id="region"
 placeholder="e.g. Jawa Barat"
 required
 value={formData.region}
 onChange={(e) => setFormData({ ...formData, region: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="startDate">Start Date</Label>
 <DatePicker
 value={formData.startDate}
 onChange={(value) => setFormData({ ...formData, startDate: value })}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="pic">PIC (Person in Charge)</Label>
 <Input
 id="pic"
 placeholder="e.g. John Doe"
 required
 value={formData.pic}
 onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
 />
 </div>
 {editId && (
 <div className="space-y-2">
 <Label htmlFor="status">Status</Label>
 <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
   <SelectTrigger id="status" className="w-full" style={{ width: '100%' }}>
     <SelectValue placeholder="Select status" />
   </SelectTrigger>
   <SelectContent>
     <SelectItem value="PLANNING">Planning</SelectItem>
     <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
     <SelectItem value="COMPLETED">Completed</SelectItem>
     <SelectItem value="ON_HOLD">On Hold</SelectItem>
   </SelectContent>
 </Select>
 </div>
 )}
 <DialogFooter className="pt-4">
 <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {editId ? 'Save Changes' : 'Create Project'}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>

 <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>Are you sure?</DialogTitle>
 <DialogDescription>
 This will permanently delete this project and all of its data. This action cannot be undone.
 </DialogDescription>
 </DialogHeader>
 <DialogFooter className="pt-4">
 <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
 <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
 {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
 Delete
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

      {/* Search and Action */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={openCreateDialog}>
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

 <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
 {loading ? (
 <div className="p-8 text-center flex flex-col items-center bg-card border rounded-xl ">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-muted-foreground">Loading projects...</p>
 </div>
 ) : projects.length > 0 ? (
 <Table className="whitespace-nowrap">
 <TableHeader>
 <TableRow>
 <TableHead>Project Name</TableHead>
 <TableHead>Customer</TableHead>
 <TableHead>Region</TableHead>
 <TableHead>Start Date</TableHead>
 <TableHead>PIC</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Action</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {projects.map((project) => (
 <TableRow key={project.id} className="hover:bg-muted/30 group">
 <TableCell className="font-medium text-primary">
 <div className="flex items-center gap-2">
 <FolderKanban className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
 {project.projectName}
 </div>
 </TableCell>
 <TableCell>{project.customer}</TableCell>
 <TableCell>
 <div className="flex items-center gap-1 text-sm text-muted-foreground">
 <MapPin className="w-3 h-3" />
 {project.region}
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-1 text-sm text-muted-foreground">
 <Calendar className="w-3 h-3" />
 {formatDate(project.startDate)}
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-1 text-sm text-muted-foreground">
 <Users className="w-3 h-3" />
 {project.pic}
 </div>
 </TableCell>
 <TableCell>
 <StatusBadge status={project.status} />
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openActivityLog(project)} title="Activity Log">
 <History className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(project)}>
 <Pencil className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(project.id)}>
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
 <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
 <p className="text-muted-foreground">No projects found</p>
 <Button variant="link" onClick={openCreateDialog} className="mt-2">
 Create your first project
 </Button>
 </div>
 )}
 </div>
 
 <Sheet open={isLogOpen} onOpenChange={setIsLogOpen}>
   <SheetContent className="w-full sm:max-w-md overflow-y-auto">
     <SheetHeader className="mb-6">
       <SheetTitle>Activity Log</SheetTitle>
       <SheetDescription>History of changes for {selectedProjectName}</SheetDescription>
     </SheetHeader>
     
     <div className="relative border-l ml-6 pl-6 space-y-6">
       {loadingActivities ? (
         <div className="flex items-center justify-center py-8">
           <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
         </div>
       ) : activities.length === 0 ? (
         <p className="text-sm text-muted-foreground py-4">No activities found.</p>
       ) : (
         activities.map((act) => (
           <div key={act.id} className="relative">
             <div className="absolute -left-[37px] bg-background border p-1 rounded-full text-muted-foreground shadow-sm">
               {getActivityIcon(act.action, act.details)}
             </div>
             <div className="pt-0.5">
               <div className="text-sm text-foreground leading-relaxed">{renderActivityDetails(act.details)}</div>
               <p className="text-xs text-muted-foreground mt-1">{formatDate(act.createdAt)}</p>
             </div>
           </div>
         ))
       )}
     </div>
   </SheetContent>
 </Sheet>

 </div>
 );
}
