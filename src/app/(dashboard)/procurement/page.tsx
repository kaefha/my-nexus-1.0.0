'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Eye, Plus, Loader2, CheckCircle2, XCircle, Send, Pencil, Trash2, MoreHorizontal, Printer, Upload, FileText } from 'lucide-react';
import api from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface POItem {
  id?: string;
  materialName: string;
  quantity: number;
}

export default function ProcurementPage() {
 const { user } = useAuth();
 const [pos, setPos] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 
 const [formData, setFormData] = useState({
   poNumber: '',
   vendor: '',
   rfcId: '',
   expectedDate: '',
   notes: '',
   transporter: '',
   driverName: '',
   vehicleNumber: '',
   deliverTo: '',
   items: [] as POItem[]
 });
 const [approvedRfcs, setApprovedRfcs] = useState<any[]>([]);
 const [isFetchingRfc, setIsFetchingRfc] = useState(false);
 const [vendors, setVendors] = useState<any[]>([]);
 const [isEditMode, setIsEditMode] = useState(false);

 // View PO state
 const [isOpen, setIsOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isViewOpen, setIsViewOpen] = useState(false);
 const [selectedPo, setSelectedPo] = useState<any>(null);
 const [isLoadingPo, setIsLoadingPo] = useState(false);
 
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
  const { data } = await api.get('/api/procurement', { params: { search, type: 'active' } });
  setPos(data.data || []);
 } catch (e) { 
 console.error(e); 
 } finally { 
 setLoading(false); 
 }
 };

 const fetchApprovedRfcs = async () => {
   try {
     const { data } = await api.get('/api/rfc?status=APPROVED');
     setApprovedRfcs(data.data || []);
   } catch (e) {
     console.error(e);
   }
 };

 const fetchVendors = async () => {
   try {
     const { data } = await api.get('/api/vendors');
     setVendors(data.data || []);
   } catch (e) {
     console.error(e);
   }
 };

 useEffect(() => {
 fetchPOs();
 fetchApprovedRfcs();
 fetchVendors();
 }, [search]);

 const handleRfcChange = async (rfcId: string) => {
   setFormData({ ...formData, rfcId });
   if (rfcId === 'none') {
     setFormData(prev => ({ ...prev, rfcId: '', items: [] }));
     return;
   }
   
   setIsFetchingRfc(true);
   try {
     const { data } = await api.get(`/api/rfc/${rfcId}`);
     if (data?.data?.items) {
       const mappedItems = data.data.items.map((item: any) => ({
         ...item,
         quantity: item.requestQty
       }));
       setFormData(prev => ({ ...prev, rfcId, items: mappedItems }));
     }
   } catch (error) {
     console.error('Failed to fetch RFC details', error);
   } finally {
     setIsFetchingRfc(false);
   }
 };

  const handleViewPO = async (id: string) => {
    setIsViewOpen(true);
    setIsLoadingPo(true);
    setSelectedPo(null);
    try {
      const { data } = await api.get(`/api/procurement/${id}`);
      setSelectedPo(data.data);
    } catch (error) {
      console.error('Error fetching PO details:', error);
      toast.error('Failed to load PO details');
    } finally {
      setIsLoadingPo(false);
    }
  };

  const handleEditPO = async (id: string) => {
    setIsOpen(true);
    setIsEditMode(true);
    try {
      const { data } = await api.get(`/api/procurement/${id}`);
      const po = data.data;
      setFormData({
        poNumber: po.poNumber || '',
        vendor: po.vendor || '',
        rfcId: po.rfcId || '',
        expectedDate: po.expectedDate ? new Date(po.expectedDate).toISOString().split('T')[0] : '',
        notes: po.notes || '',
        transporter: po.transporter || '',
        driverName: po.driverName || '',
        vehicleNumber: po.vehicleNumber || '',
        deliverTo: po.deliverTo || '',
        items: po.items || []
      });
    } catch (error) {
      console.error('Error fetching PO details for edit:', error);
      toast.error('Failed to load PO details');
      setIsOpen(false);
    }
  };

  const confirmDeletePO = (id: string) => {
    setPoToDelete(id);
    setIsDeleteOpen(true);
  };

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

  const updatePOStatus = async (status: string) => {
    if (!selectedPo) return;
    try {
      const payload: any = { status };
      if ((status === 'APPROVED' || status === 'REJECTED') && user?.id) {
        payload.approverId = user.id;
      }
      await api.patch(`/api/procurement/${selectedPo.id}/status`, payload);
      toast.success(`PO status updated to ${status}`);
      setSelectedPo({ ...selectedPo, status, approverName: user?.name, approverRole: user?.role });
      fetchPOs();
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update PO status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode && formData.id) {
        await api.put(`/api/procurement/${formData.id}`, formData);
        toast.success('PO updated successfully');
      } else {
        await api.post('/api/procurement', formData);
        toast.success('PO created successfully');
      }
      setIsOpen(false);
      setFormData({ poNumber: '', vendor: '', rfcId: '', expectedDate: '', notes: '', transporter: '', driverName: '', vehicleNumber: '', deliverTo: '', items: [] });
      fetchPOs();
    } catch (error) {
      console.error('Error saving PO:', error);
      toast.error(isEditMode ? 'Failed to update PO' : 'Failed to create PO');
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
        <Button onClick={() => { setIsOpen(true); setIsEditMode(false); setFormData({ poNumber: '', vendor: '', rfcId: '', expectedDate: '', notes: '', transporter: '', driverName: '', vehicleNumber: '', deliverTo: '', items: [] }); }} className="gap-2 ">
          <Plus className="w-4 h-4" /> New PO
        </Button>
      </div>

 <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
 {loading ? (
 <div className="p-8 text-center flex flex-col items-center bg-card border rounded-xl ">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-muted-foreground">Loading purchase orders...</p>
 </div>
 ) : pos.length > 0 ? (
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
 {pos.map((po) => (
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
       <DropdownMenuItem onClick={() => handleEditPO(po.id)}>
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
 ) : (
 <div className="text-center py-16 bg-card border rounded-xl ">
 <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
 <p className="text-muted-foreground">No purchase orders found</p>
 <Button variant="link" onClick={() => setIsOpen(true)} className="mt-2">
 Create your first PO
 </Button>
 </div>
 )}
 </div>

 <Dialog open={isOpen} onOpenChange={setIsOpen}>
 <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
 <form onSubmit={handleSubmit}>
 <DialogHeader>
 <DialogTitle>{isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}</DialogTitle>
 <DialogDescription>{isEditMode ? 'Update the details of this purchase order.' : 'Create a new purchase order for materials.'}</DialogDescription>
 </DialogHeader>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
  <div className="space-y-4">
    <div className="grid gap-2">
    <Label htmlFor="poNumber">PO Number *</Label>
    <Input 
    id="poNumber" 
    placeholder="e.g. PO-2026-001" 
    value={formData.poNumber}
    onChange={(e) => setFormData({...formData, poNumber: e.target.value})}
    required 
    />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="rfcRef">Reference RFC Number</Label>
      <Select value={formData.rfcId || 'none'} onValueChange={handleRfcChange} disabled={isFetchingRfc}>
        <SelectTrigger id="rfcRef" className="w-full">
       <SelectValue placeholder="Select an approved RFC (Optional)" />
     </SelectTrigger>
     <SelectContent>
       <SelectItem value="none">None (Manual PO)</SelectItem>
        {approvedRfcs.map(rfc => (
          <SelectItem key={rfc.id} value={rfc.id}>{rfc.rfcNumber}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    </div>
    <div className="grid gap-2">
     <Label htmlFor="vendor">Vendor Name *</Label>
     <Select value={formData.vendor} onValueChange={(val) => setFormData({...formData, vendor: val})} required>
       <SelectTrigger id="vendor" className="w-full">
         <SelectValue placeholder="Select a vendor" />
       </SelectTrigger>
       <SelectContent>
         {vendors.map(v => (
           <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
         ))}
       </SelectContent>
     </Select>
    </div>
    <div className="grid gap-2">
    <Label htmlFor="expectedDate">Expected Date</Label>
    <DatePicker 
    value={formData.expectedDate}
    onChange={(value) => setFormData({...formData, expectedDate: value})}
    />
    </div>
    <div className="grid gap-2">
    <Label htmlFor="notes">Notes</Label>
    <Input 
    id="notes" 
    placeholder="Optional notes" 
    value={formData.notes}
    onChange={(e) => setFormData({...formData, notes: e.target.value})}
    />
    </div>
  </div>

  <div className="space-y-4">
    <div className="grid gap-2">
    <Label htmlFor="transporter">Transporter / Ekspedisi</Label>
    <Input 
    id="transporter" 
    placeholder="e.g. PT. Lintas Benua Ekspres" 
    value={formData.transporter}
    onChange={(e) => setFormData({...formData, transporter: e.target.value})}
    />
    </div>
    <div className="grid gap-2">
    <Label htmlFor="driverName">Driver Name</Label>
    <Input 
    id="driverName" 
    placeholder="e.g. Budi Santoso" 
    value={formData.driverName}
    onChange={(e) => setFormData({...formData, driverName: e.target.value})}
    />
    </div>
    <div className="grid gap-2">
    <Label htmlFor="vehicleNumber">Truck / Vehicle Number</Label>
    <Input 
    id="vehicleNumber" 
    placeholder="e.g. B 9012 CDE" 
    value={formData.vehicleNumber}
    onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
    />
    </div>
    <div className="grid gap-2">
    <Label htmlFor="deliverTo">Deliver To</Label>
    <Input 
    id="deliverTo" 
    placeholder="e.g. Proyek Pembangunan Jalur Kereta Api Lintas Makassar - Parepare" 
    value={formData.deliverTo}
    onChange={(e) => setFormData({...formData, deliverTo: e.target.value})}
    />
    </div>
    {formData.items?.length > 0 && (
      <div className="grid gap-1 bg-muted/30 p-3 rounded-md border text-sm mt-2">
        <span className="font-medium text-muted-foreground mb-1">Auto-filled Items from RFC:</span>
        <div className="max-h-[200px] overflow-y-auto space-y-1">
          {formData.items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center bg-background px-2 py-1 rounded border">
              <span className="truncate pr-2">{item.materialName}</span>
              <span className="font-semibold whitespace-nowrap">{item.quantity} units</span>
            </div>
          ))}
        </div>
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
 Save PO
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>

  {/* View PO Dialog */}
  <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Purchase Order Details</DialogTitle>
      </DialogHeader>
      
      {isLoadingPo ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : selectedPo ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">PO Number</p>
              <p className="font-semibold">{selectedPo.poNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Status</p>
              <StatusBadge status={selectedPo.status} />
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Vendor</p>
              <p className="font-medium">{selectedPo.vendor}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Expected Date</p>
              <p>{selectedPo.expectedDate ? formatDate(selectedPo.expectedDate) : '-'}</p>
            </div>
            {selectedPo.transporter && (
              <div className="col-span-2 md:col-span-1">
                <p className="text-muted-foreground mb-1">Transporter / Ekspedisi</p>
                <p className="font-medium">{selectedPo.transporter}</p>
              </div>
            )}
            {selectedPo.driverName && (
              <div className="col-span-2 md:col-span-1">
                <p className="text-muted-foreground mb-1">Driver Name</p>
                <p className="font-medium">{selectedPo.driverName}</p>
              </div>
            )}
            {selectedPo.vehicleNumber && (
              <div className="col-span-2 md:col-span-1">
                <p className="text-muted-foreground mb-1">Vehicle Number</p>
                <p className="font-medium">{selectedPo.vehicleNumber}</p>
              </div>
            )}
            {selectedPo.deliverTo && (
              <div className="col-span-2 md:col-span-1">
                <p className="text-muted-foreground mb-1">Deliver To</p>
                <p className="font-medium">{selectedPo.deliverTo}</p>
              </div>
            )}
            {selectedPo.rfcId && (
              <div className="col-span-2">
                <p className="text-muted-foreground mb-1">Reference RFC ID</p>
                <p className="font-mono text-xs break-all bg-muted/30 p-2 rounded">{selectedPo.rfcId}</p>
              </div>
            )}
            {selectedPo.notes && (
              <div className="col-span-2">
                <p className="text-muted-foreground mb-1">Notes</p>
                <p className="bg-muted/30 p-3 rounded-md text-muted-foreground">{selectedPo.notes}</p>
              </div>
            )}
            {selectedPo.approverName && (
              <div className="col-span-2 bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Processed By</p>
                <p className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {selectedPo.approverName} <span className="text-muted-foreground font-normal text-sm">({selectedPo.approverRole})</span>
                </p>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 border-b pb-2">Order Items</h4>
            {selectedPo.items && selectedPo.items.length > 0 ? (
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Material</TableHead>
                    <TableHead className="w-[100px] text-right">Quantity</TableHead>
                    <TableHead className="w-[250px]">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPo.items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.materialName || 'Unknown Material'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{item.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground italic bg-muted/20 p-4 rounded text-center">No items found for this PO.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">Failed to load PO details.</p>
      )}
      
      <DialogFooter className="sm:justify-between">
        <div className="flex gap-2">
          {selectedPo?.status === 'DRAFT' && (
            <Button variant="default" onClick={() => updatePOStatus('WAITING_APPROVAL')} className="bg-amber-600 hover:bg-amber-700">
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </Button>
          )}
          {selectedPo?.status === 'WAITING_APPROVAL' && ['FINANCE', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role?.toUpperCase() || '') && (
            <>
              <Button variant="default" onClick={() => updatePOStatus('APPROVED')} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve PO
              </Button>
              <Button variant="destructive" onClick={() => updatePOStatus('REJECTED')}>
                <XCircle className="w-4 h-4 mr-2" />
                Reject PO
              </Button>
            </>
          )}
        </div>
        <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

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
