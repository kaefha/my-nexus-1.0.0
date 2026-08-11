'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Eye, Plus, Loader2, CheckCircle2, XCircle, Send, Pencil, Trash2, MoreHorizontal, Printer, Upload, FileText } from 'lucide-react';
import api from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTablePagination } from '@/components/shared/DataTablePagination';

interface POItem {
  id?: string;
  materialName: string;
  quantity: number;
}

 export default function ProcurementPage() {
 const { user } = useAuth();
 const router = useRouter();
 const [pos, setPos] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(10);

  // Delete PO state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
 const [poToDelete, setPoToDelete] = useState<string | null>(null);

 // Upload Signed Doc state
 const [isUploadOpen, setIsUploadOpen] = useState(false);
 const [selectedPoForUpload, setSelectedPoForUpload] = useState<string | null>(null);
 const [signedDocument, setSignedDocument] = useState<File | null>(null);
 const [isUploading, setIsUploading] = useState(false);

 const fetchPOs = async () => {
  setLoading(true);
  try {
  const { data } = await api.get('/api/procurement', { params: { search, type: 'active', limit: 5000 } });
  setPos(data.data || []);
 } catch (e) { 
 console.error(e); 
 } finally { 
 setLoading(false); 
 }
 };

 useEffect(() => {
   fetchPOs();
   setPage(1);
 }, [search]);

  const handleViewPO = (id: string) => {
    router.push(`/procurement/${id}`);
  };

  const confirmDeletePO = (id: string) => {
    setPoToDelete(id);
    setIsDeleteOpen(true);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleDeletePO = async () => {
    if (!poToDelete) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/api/procurement/${poToDelete}`);
      toast.success('PO deleted successfully');
      fetchPOs();
      setIsDeleteOpen(false);
      setPoToDelete(null);
    } catch (error) {
      console.error('Error deleting PO:', error);
      toast.error('Failed to delete PO');
    } finally {
      setIsSubmitting(false);
    }
  };



 return (
 <div className="space-y-6">
 <div className="animate-fade-in">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
 <p className="text-sm text-muted-foreground mt-0.5">Track procurement & vendor management</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input 
 type="search" 
 placeholder="Search PO number, vendor..." 
 value={search} 
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9"
 />
        </div>
         <Link href="/procurement/create">
           <Button className="gap-2 ">
             <Plus className="w-4 h-4" /> New PO
           </Button>
         </Link>
      </div>

 <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
 {loading ? (
 <div className="p-8 text-center flex flex-col items-center bg-card border rounded-xl ">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-muted-foreground">Loading purchase orders...</p>
 </div>
 ) : pos.length > 0 ? (
 <>
 <Table className="whitespace-nowrap">
 <TableHeader>
 <TableRow>
 <TableHead className="w-[150px]">PO Number</TableHead>
 <TableHead className="w-[250px]">Vendor</TableHead>
 <TableHead className="w-[150px]">Expected</TableHead>
 <TableHead className="w-[120px]">Status</TableHead>
 <TableHead className="w-[80px] text-right">Action</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {pos.slice((page - 1) * pageSize, page * pageSize).map((po) => (
 <TableRow key={po.id} className="hover:bg-muted/30">
 <TableCell className="font-medium text-primary">{po.poNumber}</TableCell>
 <TableCell>{po.vendor}</TableCell>
 <TableCell className="text-muted-foreground">
 {po.expectedDate ? formatDate(po.expectedDate) : '-'}
 </TableCell>
 <TableCell><StatusBadge status={po.status} /></TableCell>
 <TableCell className="text-right">
   <DropdownMenu>
     <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
       <span className="sr-only">Open menu</span>
       <MoreHorizontal className="h-4 w-4" />
     </DropdownMenuTrigger>
     <DropdownMenuContent align="end" className="w-48">
       <DropdownMenuItem onClick={() => handleViewPO(po.id)}>
         <Eye className="w-4 h-4 mr-2" /> View Details
       </DropdownMenuItem>
        {po.signedDocumentUrl ? (
          <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(po.signedDocumentUrl, '_blank')}>
            <FileText className="w-4 h-4 mr-2" /> Signed Doc
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(`/print/po/${po.id}`, '_blank')}>
            <Printer className="w-4 h-4 mr-2" /> Print PDF
          </DropdownMenuItem>
        )}
        {(user?.role === 'FINANCE' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <DropdownMenuItem onClick={() => { setSelectedPoForUpload(po.id); setIsUploadOpen(true); }}>
            <Upload className="w-4 h-4 mr-2" /> Upload Signed Doc
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push(`/procurement/create?editId=${po.id}`)}>
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </DropdownMenuItem>
       <DropdownMenuItem onClick={() => confirmDeletePO(po.id)} className="text-destructive">
         <Trash2 className="w-4 h-4 mr-2" /> Delete
       </DropdownMenuItem>
     </DropdownMenuContent>
   </DropdownMenu>
  </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 <DataTablePagination 
    totalItems={pos.length} 
    pageSize={pageSize} 
    currentPage={page} 
    onPageChange={setPage} 
    onPageSizeChange={setPageSize} 
 />
 </>
 ) : (
 <div className="text-center py-16 bg-card border rounded-xl ">
 <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
 <p className="text-muted-foreground">No purchase orders found</p>
  <Link href="/procurement/create">
    <Button variant="link" className="mt-2">
    Create your first PO
    </Button>
  </Link>
 </div>
 )}
 </div>



  {/* Delete Confirmation Dialog */}
  <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this purchase order? This action cannot be undone and will remove all associated items.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="sm:justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleDeletePO} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Upload Signed Doc Dialog */}
  <Dialog open={isUploadOpen} onOpenChange={(open) => { setIsUploadOpen(open); if (!open) setSignedDocument(null); }}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Upload Signed Purchase Order</DialogTitle>
        <DialogDescription>
          Upload the signed PDF version of this Purchase Order.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="signedDocument">Signed Document</Label>
          <Input 
            id="signedDocument" 
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSignedDocument(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>
      <DialogFooter className="sm:justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
          Cancel
        </Button>
        <Button 
          disabled={!signedDocument || isUploading} 
          onClick={async () => {
            setIsUploading(true);
            try {
              // Simulate upload
              await new Promise(r => setTimeout(r, 1000));
              const fakeUrl = '/uploads/signed-po-' + selectedPoForUpload + '.pdf';
              await api.patch(`/api/procurement/${selectedPoForUpload}`, { signedDocumentUrl: fakeUrl });
              toast.success('Signed document uploaded successfully');
              setIsUploadOpen(false);
              fetchPOs();
            } catch (error) {
              toast.error('Failed to upload document');
            } finally {
              setIsUploading(false);
            }
          }}
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
          Upload
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  </div>
 );
}
