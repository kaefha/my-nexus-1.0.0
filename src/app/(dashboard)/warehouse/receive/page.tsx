'use client';

import { useEffect, useState } from 'react';
import { PackageOpen, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MaterialReceivePage() {
  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [selectedPo, setSelectedPo] = useState<any>(null);
  
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [receivedItems, setReceivedItems] = useState<Record<string, number>>({});
  
  const [loadingPOs, setLoadingPOs] = useState(true);
  const [isFetchingPo, setIsFetchingPo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch POs (Ideally only ISSUED or PARTIAL, but we'll fetch all and filter)
        const poRes = await api.get('/api/procurement');
        const activePos = (poRes.data?.data || []).filter((po: any) => 
          po.status !== 'COMPLETED' && po.status !== 'DRAFT'
        );
        setPos(activePos);

        // Fetch Warehouses
        const whRes = await api.get('/api/warehouse');
        setWarehouses(whRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoadingPOs(false);
      }
    };
    
    fetchData();
  }, []);

  const handlePoChange = async (poId: string) => {
    setSelectedPoId(poId);
    setSuccess(false);
    if (!poId) {
      setSelectedPo(null);
      setReceivedItems({});
      return;
    }
    
    setIsFetchingPo(true);
    try {
      const { data } = await api.get(`/api/procurement/${poId}`);
      if (data?.data) {
        setSelectedPo(data.data);
        
        // Auto-fill received quantities with the ordered quantities
        const initialQtys: Record<string, number> = {};
        (data.data.items || []).forEach((item: any) => {
          initialQtys[item.materialId] = item.quantity;
        });
        setReceivedItems(initialQtys);
      }
    } catch (error) {
      console.error('Failed to fetch PO details:', error);
    } finally {
      setIsFetchingPo(false);
    }
  };

  const handleQtyChange = (materialId: string, val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    
    setReceivedItems(prev => ({
      ...prev,
      [materialId]: num
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoId || !selectedWarehouseId || !selectedPo?.items?.length) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        poId: selectedPoId,
        warehouseId: selectedWarehouseId,
        items: selectedPo.items.map((item: any) => ({
          materialId: item.materialId,
          receivedQty: receivedItems[item.materialId] || 0
        }))
      };
      
      await api.post('/api/warehouse/receive', payload);
      
      setSuccess(true);
      setSelectedPoId('');
      setSelectedPo(null);
      setReceivedItems({});
      
      // Refresh PO list to remove completed POs
      const poRes = await api.get('/api/procurement');
      const activePos = (poRes.data?.data || []).filter((po: any) => 
        po.status !== 'COMPLETED' && po.status !== 'DRAFT'
      );
      setPos(activePos);
      
    } catch (error) {
      console.error('Failed to receive materials:', error);
      alert('Failed to process material receipt. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Material Receive (Goods Receipt)</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Receive incoming materials from vendors based on Purchase Orders.
        </p>
      </div>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium">Goods received successfully and inventory has been updated!</p>
        </div>
      )}
      
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
            <CardDescription>Select a PO and destination warehouse</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poSelect">Purchase Order</Label>
                <Select value={selectedPoId} onValueChange={handlePoChange} disabled={loadingPOs || isSubmitting}>
                  <SelectTrigger id="poSelect" className="w-full" style={{ width: '100%' }}>
                    <SelectValue placeholder={loadingPOs ? "Loading POs..." : "Select PO"} />
                  </SelectTrigger>
                  <SelectContent>
                    {pos.length === 0 ? (
                      <SelectItem value="empty" disabled>No pending POs found</SelectItem>
                    ) : (
                      pos.map(po => (
                        <SelectItem key={po.id} value={po.id}>{po.poNumber} - {po.vendor}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whSelect">Destination Warehouse</Label>
                <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId} disabled={isSubmitting}>
                  <SelectTrigger id="whSelect" className="w-full" style={{ width: '100%' }}>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-4" 
                disabled={!selectedPoId || !selectedWarehouseId || isSubmitting || !selectedPo}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><PackageOpen className="w-4 h-4 mr-2" /> Process Receipt</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className={!selectedPo ? 'opacity-50 pointer-events-none' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              Incoming Items
            </CardTitle>
            <CardDescription>
              {selectedPo ? `Review items from ${selectedPo.poNumber}` : 'Select a PO to view items'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetchingPo ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedPo ? (
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Name</TableHead>
                    <TableHead className="w-[120px] text-center">Ordered Qty</TableHead>
                    <TableHead className="w-[150px] text-right">Received Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPo.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.materialName || 'Unknown Material'}</TableCell>
                      <TableCell className="text-center bg-muted/20">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Input 
                          type="number" 
                          min="0"
                          className="w-24 ml-auto text-right"
                          value={receivedItems[item.materialId] || 0}
                          onChange={(e) => handleQtyChange(item.materialId, e.target.value)}
                          disabled={isSubmitting}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No Purchase Order selected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
