'use client';

import { useEffect, useState } from 'react';
import { Truck, Search, Eye, Plus, Loader2, Package, Map, MapPin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import RealTrackingMap from '@/components/map/RealTrackingMap';

export default function LogisticsPage() {
 const [selectedDO, setSelectedDO] = useState<any>(null);
 const [dos, setDos] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 
 // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    doNumber: '',
    origin: '',
    destination: '',
    poId: '',
    shippingDate: '',
    notes: ''
  });

  const fetchDOs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/logistics', { params: { search, type: 'active' } });
      setDos(data.data || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchPOs = async () => {
    try {
      const { data } = await api.get('/api/procurement', { params: { limit: 100 } });
      const approvedPOs = data.data.filter((r: any) => r.status === 'APPROVED');
      setPos(approvedPOs);
    } catch (e) {
      console.error('Failed to fetch POs', e);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const { data } = await api.get('/api/warehouse', { params: { limit: 100 } });
      setWarehouses(data.data || []);
    } catch (e) {
      console.error('Failed to fetch Warehouses', e);
    }
  };

  useEffect(() => {
    fetchDOs();
    fetchPOs();
    fetchWarehouses();
  }, [search]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
    try {
      await api.post('/api/logistics', formData);
      setIsOpen(false);
      setFormData({ doNumber: '', origin: '', destination: '', poId: '', shippingDate: '', notes: '' });
      fetchDOs();
      toast.success('Delivery Order created successfully');
 } catch (error: any) {
 console.error('Error creating DO:', error);
 toast.error(error.response?.data?.message || 'Failed to create Delivery Order');
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async (id: string) => {
   if (!confirm('Are you sure you want to delete this DO?')) return;
   try {
     await api.delete(`/api/logistics/${id}`);
     toast.success('DO deleted successfully');
     fetchDOs();
   } catch (error: any) {
     toast.error(error.response?.data?.message || 'Failed to delete DO');
   }
 };

 return (
 <div className="space-y-6">
 <div className="animate-fade-in">
        <h1 className="text-2xl font-bold">Delivery Tracking</h1>
 <p className="text-sm text-muted-foreground mt-0.5">Track shipments and delivery orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input 
 type="search" 
 placeholder="Search DO number, location..." 
 value={search} 
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9"
 />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New DO
          </Button>
        </div>
      </div>

 <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
 {loading ? (
 <div className="p-8 text-center flex flex-col items-center bg-card border rounded-xl ">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-muted-foreground">Loading delivery orders...</p>
 </div>
 ) : dos.length > 0 ? (
 <Table className="whitespace-nowrap">
 <TableHeader>
 <TableRow>
  <TableHead className="w-[150px]">DO Number</TableHead>
  <TableHead className="w-[200px]">Origin</TableHead>
  <TableHead className="w-[200px]">Destination</TableHead>
  <TableHead className="w-[250px]">Project</TableHead>
  <TableHead className="w-[100px]">Items</TableHead>
  <TableHead className="w-[150px]">Shipping Date</TableHead>
  <TableHead className="w-[120px]">Status</TableHead>
 <TableHead className="w-[80px] text-right">Action</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {dos.map((d) => (
 <TableRow key={d.id} className="hover:bg-muted/30">
  <TableCell className="font-medium text-primary">{d.doNumber}</TableCell>
  <TableCell>{d.origin}</TableCell>
  <TableCell>
    {warehouses.find(w => w.id === d.destination)?.name || d.destination || 'Warehouse'}
  </TableCell>
  <TableCell>
    <div>
      <p className="font-medium">{d.project?.projectName || '-'}</p>
      {d.po && <p className="text-xs text-muted-foreground">PO: {d.po.poNumber}</p>}
    </div>
  </TableCell>
  <TableCell>
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Package className="w-3 h-3" />
      <span>{d._count?.items || 0} mat</span>
    </div>
  </TableCell>
  <TableCell className="text-muted-foreground">
  {d.shippingDate ? formatDate(d.shippingDate) : '-'}
  </TableCell>
 <TableCell><StatusBadge status={d.status} /></TableCell>
 <TableCell className="text-right">
  <div className="flex justify-end gap-2">
    <Button 
      variant="outline" 
      size="sm" 
      className="text-xs h-8" 
      onClick={() => {
        navigator.clipboard.writeText(`${window.location.origin}/track/${d.id}`);
        toast.success('Tracking link copied to clipboard! Send this to the driver.');
      }}
    >
      <MapPin className="w-3 h-3 mr-1" /> Copy Link
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setSelectedDO(d)} className="cursor-pointer">
          <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
          Edit DO
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(d.id)} className="cursor-pointer text-destructive focus:text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete DO
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 ) : (
 <div className="text-center py-16 bg-card border rounded-xl ">
 <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
 <p className="text-muted-foreground">No active delivery orders found</p>
 <Button variant="link" onClick={() => setIsOpen(true)} className="mt-2">
 Create your first DO
 </Button>
 </div>
 )}
 </div>

 <Dialog open={isOpen} onOpenChange={setIsOpen}>
 <DialogContent>
 <form onSubmit={handleSubmit}>
 <DialogHeader>
 <DialogTitle>New Delivery Order</DialogTitle>
 <DialogDescription>Create a new delivery order to track shipment.</DialogDescription>
 </DialogHeader>
 <div className="grid gap-4 py-4">
 <div className="grid gap-2">
 <Label htmlFor="doNumber">DO Number *</Label>
 <Input 
 id="doNumber" 
 placeholder="e.g. DO-2026-001" 
 value={formData.doNumber}
 onChange={(e) => setFormData({...formData, doNumber: e.target.value})}
 required 
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="origin">Origin *</Label>
 <Input 
 id="origin" 
 placeholder="e.g. Central Warehouse" 
 value={formData.origin}
 onChange={(e) => setFormData({...formData, origin: e.target.value})}
 required 
 />
 </div>
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination (Warehouse) *</Label>
                <select 
                  id="destination" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  required 
                >
                  <option value="">Select destination warehouse...</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="poId">Approved PO *</Label>
                <select 
                  id="poId" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.poId}
                  onChange={(e) => setFormData({...formData, poId: e.target.value})}
                  required 
                >
                  <option value="">Select approved PO...</option>
                  {pos.map(po => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} - {po.vendor}
                    </option>
                  ))}
                </select>
              </div>
 <div className="grid gap-2">
 <Label htmlFor="shippingDate">Shipping Date</Label>
 <DatePicker 
 value={formData.shippingDate}
 onChange={(value) => setFormData({...formData, shippingDate: value})}
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
 Save DO
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>

 <Dialog open={!!selectedDO} onOpenChange={(open) => !open && setSelectedDO(null)}>
  <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden bg-slate-50 border-0 shadow-2xl">
    <div className="relative w-full h-[600px]">
      <RealTrackingMap selectedDO={selectedDO} />
      
      {/* Close button in top right corner */}
      <Button 
        variant="secondary" 
        size="sm" 
        className="absolute top-4 right-4 z-50 rounded-full shadow-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-200"
        onClick={() => setSelectedDO(null)}
      >
        Close Map
      </Button>

      {/* Admin actions (Mark as delivered / Evidence upload) could be added here in the future */}
      {selectedDO && (selectedDO.status === 'SHIPPING' || selectedDO.status === 'WAITING') && (
        <div className="absolute bottom-4 right-4 z-50 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <p className="text-sm font-medium mb-2">Admin Actions</p>
          <Button size="sm" className="w-full" onClick={() => {
            // Minimal UI for admin to upload evidence
            const evidenceUrl = prompt("Enter Evidence Photo URL (or Base64):");
            if (evidenceUrl) {
              api.patch(`/api/logistics/${selectedDO.id}`, { status: 'DELIVERED', evidence: evidenceUrl })
                .then(() => {
                  toast.success('Evidence recorded, status updated to DELIVERED');
                  setSelectedDO(null);
                  fetchDOs();
                })
                .catch(() => toast.error('Failed to update status'));
            }
          }}>
            Upload Evidence (Receive)
          </Button>
        </div>
      )}
    </div>
  </DialogContent>
 </Dialog>
 </div>
 );
}
