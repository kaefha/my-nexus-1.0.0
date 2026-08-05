'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Eye, Plus, Loader2, CheckCircle2, XCircle, Send } from 'lucide-react';
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

export default function ProcurementPage() {
 const { user } = useAuth();
 const [pos, setPos] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 
 const [formData, setFormData] = useState<any>({
 poNumber: '',
 vendor: '',
 rfcId: '',
 expectedDate: '',
 notes: '',
 items: []
 });
 const [approvedRfcs, setApprovedRfcs] = useState<any[]>([]);
 const [isFetchingRfc, setIsFetchingRfc] = useState(false);
 const [vendors, setVendors] = useState<any[]>([]);

 // View PO state
 const [isOpen, setIsOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isViewOpen, setIsViewOpen] = useState(false);
 const [selectedPo, setSelectedPo] = useState<any>(null);
 const [isLoadingPo, setIsLoadingPo] = useState(false);

 const fetchPOs = async () => {
 setLoading(true);
 try {
 const { data } = await api.get('/api/procurement', { params: { search } });
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
     alert('Failed to load PO details');
   } finally {
     setIsLoadingPo(false);
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
 await api.post('/api/procurement', formData);
 setIsOpen(false);
 setFormData({ poNumber: '', vendor: '', rfcId: '', expectedDate: '', notes: '', items: [] });
 fetchPOs();
 } catch (error) {
 console.error('Error creating PO:', error);
 alert('Failed to create PO');
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
        <Button onClick={() => setIsOpen(true)} className="gap-2 ">
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
 <TableHead>PO Number</TableHead>
 <TableHead>Vendor</TableHead>
 <TableHead>Expected</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Action</TableHead>
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
  <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleViewPO(po.id)}>
  View
  </Button>
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
 <DialogContent className="sm:max-w-xl">
 <form onSubmit={handleSubmit}>
 <DialogHeader>
 <DialogTitle>New Purchase Order</DialogTitle>
 <DialogDescription>Create a new purchase order for materials.</DialogDescription>
 </DialogHeader>
 <div className="grid gap-4 py-4">
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
     <SelectTrigger id="rfcRef" className="w-full" style={{ width: '100%' }}>
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
 {formData.items?.length > 0 && (
   <div className="grid gap-1 bg-muted/30 p-3 rounded-md border text-sm">
     <span className="font-medium text-muted-foreground mb-1">Auto-filled Items from RFC:</span>
     {formData.items.map((item: any, idx: number) => (
       <div key={idx} className="flex justify-between">
         <span>{item.materialName}</span>
         <span className="font-semibold">{item.quantity} units</span>
       </div>
     ))}
   </div>
 )}
 <div className="grid gap-2">
  <Label htmlFor="vendor">Vendor Name *</Label>
  <Select value={formData.vendor} onValueChange={(val) => setFormData({...formData, vendor: val})} required>
    <SelectTrigger id="vendor" className="w-full" style={{ width: '100%' }}>
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
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Notes</TableHead>
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
          {selectedPo?.status === 'WAITING_APPROVAL' && user?.role?.toUpperCase() === 'FINANCE' && (
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
  </div>
 );
}
