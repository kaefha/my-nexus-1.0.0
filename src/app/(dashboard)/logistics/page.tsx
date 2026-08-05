'use client';

import { useEffect, useState } from 'react';
import { Truck, Search, Eye, Plus, Loader2, Package, Map, MapPin } from 'lucide-react';
import api from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [rfcs, setRfcs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    doNumber: '',
    origin: '',
    rfcId: '',
    shippingDate: '',
    notes: ''
  });

  const fetchDOs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/logistics', { params: { search } });
      setDos(data.data || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchRfcs = async () => {
    try {
      // Fetch approved RFCs for DO creation
      const { data } = await api.get('/api/rfc', { params: { limit: 100 } });
      // In reality we should filter on backend, but doing here for simplicity
      const approvedRfcs = data.data.filter((r: any) => r.status === 'APPROVED');
      setRfcs(approvedRfcs);
    } catch (e) {
      console.error('Failed to fetch RFCs', e);
    }
  };

  useEffect(() => {
    fetchDOs();
    fetchRfcs();
  }, [search]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
    try {
      await api.post('/api/logistics', formData);
      setIsOpen(false);
      setFormData({ doNumber: '', origin: '', rfcId: '', shippingDate: '', notes: '' });
      fetchDOs();
 } catch (error) {
 console.error('Error creating DO:', error);
 toast.error('Failed to create Delivery Order');
 } finally {
 setIsSubmitting(false);
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
  <TableHead>DO Number</TableHead>
  <TableHead>Origin</TableHead>
  <TableHead>Destination (Project)</TableHead>
  <TableHead>Items</TableHead>
  <TableHead>Shipping Date</TableHead>
  <TableHead>Status</TableHead>
 <TableHead className="text-right">Action</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {dos.map((d) => (
 <TableRow key={d.id} className="hover:bg-muted/30">
  <TableCell className="font-medium text-primary">{d.doNumber}</TableCell>
  <TableCell>{d.origin}</TableCell>
  <TableCell>
    <div>
      <p className="font-medium">{d.project?.projectName || d.destination}</p>
      {d.rfc && <p className="text-xs text-muted-foreground">{d.rfc.rfcNumber}</p>}
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
    <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setSelectedDO(d)}>
    View
    </Button>
  </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 ) : (
 <div className="text-center py-16 bg-card border rounded-xl ">
 <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
 <p className="text-muted-foreground">No delivery orders found</p>
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
                <Label htmlFor="rfcId">Approved RFC (Destination) *</Label>
                <select 
                  id="rfcId" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.rfcId}
                  onChange={(e) => setFormData({...formData, rfcId: e.target.value})}
                  required 
                >
                  <option value="">Select approved RFC...</option>
                  {rfcs.map(rfc => (
                    <option key={rfc.id} value={rfc.id}>
                      {rfc.rfcNumber} - {rfc.project?.projectName}
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
    </div>
  </DialogContent>
 </Dialog>
 </div>
 );
}
