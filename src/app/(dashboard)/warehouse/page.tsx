'use client';

import { useEffect, useState } from 'react';
import { PackageOpen, Boxes, Search, Loader2, Warehouse as WarehouseIcon, MapPin, LayoutGrid, List } from 'lucide-react';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function WarehouseOperationsPage() {
  const [activeTab, setActiveTab] = useState('info');
  
  // Warehouse Info State
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  
  // Stock State
  const [stocks, setStocks] = useState<any[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [stockSearch, setStockSearch] = useState('');
  
  // Receipt State
  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [receiptForm, setReceiptForm] = useState({ poId: '', warehouseId: '', doNumber: '', evidencePhotoUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStocks();
    fetchPOsAndWarehouses();
  }, [stockSearch]);

  const fetchStocks = async () => {
    setLoadingStocks(true);
    try {
      const { data } = await api.get('/api/inventory/stocks', { params: { search: stockSearch } });
      setStocks(data.data || []);
    } catch (e) {
      console.error('Failed to fetch stocks', e);
    } finally {
      setLoadingStocks(false);
    }
  };

  const fetchPOsAndWarehouses = async () => {
    try {
      const poRes = await api.get('/api/procurement', { params: { limit: 100 } });
      const pendingPOs = (poRes.data.data || []).filter((po: any) => po.status !== 'COMPLETED');
      setPos(pendingPOs);
      
      const whRes = await api.get('/api/warehouse', { params: { limit: 100 } });
      setWarehouses(whRes.data.data || []);
    } catch (e) {
      console.error('Failed to fetch POs or warehouses', e);
    }
  };

  const handleReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptForm.poId || !receiptForm.warehouseId) return alert('Please select PO and Warehouse');
    
    setIsSubmitting(true);
    try {
      await api.post('/api/inventory/receipt', receiptForm);
      alert('Goods Receipt processed successfully! Stock has been updated.');
      setReceiptForm({ poId: '', warehouseId: '', doNumber: '', evidencePhotoUrl: '' });
      fetchPOsAndWarehouses();
      fetchStocks();
      setActiveTab('stocks');
    } catch (error: any) {
      console.error('Receipt error:', error);
      alert(error.response?.data?.message || 'Failed to process receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Warehouse Operations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage material receipts, issuance, and real-time stock levels.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl h-11">
          <TabsTrigger value="info" className="gap-2"><WarehouseIcon className="w-4 h-4" /> Warehouses Info</TabsTrigger>
          <TabsTrigger value="receipt" className="gap-2"><PackageOpen className="w-4 h-4" /> Goods Receipt</TabsTrigger>
          <TabsTrigger value="stocks" className="gap-2"><Boxes className="w-4 h-4" /> Stock Overview</TabsTrigger>
        </TabsList>
        
        {/* WAREHOUSES INFO TAB */}
        <TabsContent value="info" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search by Name, Location, or ID..." 
                value={warehouseSearch}
                onChange={(e) => setWarehouseSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50 w-full sm:w-auto">
              <Button 
                variant={viewMode === 'card' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 flex-1 sm:w-8 p-0"
                onClick={() => setViewMode('card')}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 flex-1 sm:w-8 p-0"
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {(() => {
            const filtered = warehouses.filter(wh => 
              wh.name?.toLowerCase().includes(warehouseSearch.toLowerCase()) || 
              wh.location?.toLowerCase().includes(warehouseSearch.toLowerCase()) || 
              wh.code?.toLowerCase().includes(warehouseSearch.toLowerCase())
            );

            if (filtered.length === 0) {
              return (
                <div className="p-8 text-center bg-card border rounded-xl">
                  <p className="text-muted-foreground">No warehouses found.</p>
                </div>
              );
            }

            if (viewMode === 'list') {
              return (
                <div className="w-full">
                  <Table className="whitespace-nowrap">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">ID / Code</TableHead>
                        <TableHead className="w-[250px]">Warehouse Name</TableHead>
                        <TableHead className="w-[150px]">Type</TableHead>
                        <TableHead className="w-[200px]">Location</TableHead>
                        <TableHead className="w-[100px] text-right">Capacity</TableHead>
                        <TableHead className="w-[120px] text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(wh => (
                        <TableRow key={wh.id}>
                          <TableCell className="font-medium">{wh.code}</TableCell>
                          <TableCell>{wh.name}</TableCell>
                          <TableCell><span className="text-xs px-2 py-0.5 bg-muted rounded-full">{wh.type || 'MAIN'}</span></TableCell>
                          <TableCell className="whitespace-normal max-w-[300px]" title={wh.location}>{wh.location || '-'}</TableCell>
                          <TableCell className="text-right">{wh.capacity ? `${wh.capacity} CBM` : '-'}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-medium ${wh.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                              {wh.status || 'ACTIVE'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(wh => (
                  <Card key={wh.id} className="overflow-visible hover:shadow-md transition-shadow relative hover:z-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="truncate pr-2">{wh.name}</span>
                        <span className="text-xs font-normal px-2 py-0.5 bg-muted rounded-full shrink-0">{wh.type || 'MAIN'}</span>
                      </CardTitle>
                      <CardDescription>{wh.code}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-start gap-2 text-muted-foreground relative group cursor-default">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="whitespace-normal break-words">{wh.location || 'No location set'}</span>
                        
                        {wh.coordinates && (
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-72 h-48 bg-card border rounded-xl shadow-xl p-1.5 origin-bottom scale-95 group-hover:scale-100 pointer-events-none">
                            <iframe 
                              width="100%" 
                              height="100%" 
                              className="rounded-lg pointer-events-auto bg-muted"
                              style={{ border: 0 }} 
                              loading="lazy" 
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(wh.coordinates)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            ></iframe>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-b border-r transform rotate-45" />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">{wh.capacity ? `${wh.capacity} CBM` : 'Unspecified'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <span className={`font-medium ${wh.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                          {wh.status || 'ACTIVE'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
        </TabsContent>

        {/* GOODS RECEIPT TAB */}
        <TabsContent value="receipt" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Goods Receipt (Penerimaan Barang)</CardTitle>
              <CardDescription>
                Process incoming materials from Purchase Orders to increase warehouse stock.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceiptSubmit} className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <Label>Source Purchase Order</Label>
                  <Select value={receiptForm.poId} onValueChange={(val) => setReceiptForm({...receiptForm, poId: val})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an incoming PO" />
                    </SelectTrigger>
                    <SelectContent>
                      {pos.length === 0 && <SelectItem value="none" disabled>No pending POs found</SelectItem>}
                      {pos.map(po => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.poNumber} - {po.vendor} ({po.itemsCount} items)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Destination Warehouse</Label>
                  <Select value={receiptForm.warehouseId} onValueChange={(val) => setReceiptForm({...receiptForm, warehouseId: val})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select receiving warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.length === 0 && <SelectItem value="none" disabled>No warehouses configured</SelectItem>}
                      {warehouses.map(wh => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name} ({wh.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Delivery Order Number</Label>
                  <Input 
                    placeholder="e.g. DO-2026-XYZ (Optional)" 
                    value={receiptForm.doNumber}
                    onChange={(e) => setReceiptForm({ ...receiptForm, doNumber: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Photo Evidence URL</Label>
                  <Input 
                    placeholder="Paste link to Google Drive / image URL" 
                    value={receiptForm.evidencePhotoUrl}
                    onChange={(e) => setReceiptForm({ ...receiptForm, evidencePhotoUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Required by SOP for material movement tracking.</p>
                </div>

                <Button type="submit" disabled={isSubmitting || !receiptForm.poId || !receiptForm.warehouseId} className="w-full sm:w-auto">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Goods Receipt
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STOCK OVERVIEW TAB */}
        <TabsContent value="stocks" className="mt-6 space-y-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search by Warehouse, Material Code, or Name..." 
              value={stockSearch} 
              onChange={(e) => setStockSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="w-full">
            <Table className="whitespace-nowrap">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Warehouse</TableHead>
                  <TableHead className="w-[250px]">Material Code</TableHead>
                  <TableHead className="w-[250px]">Material Name</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead className="w-[100px] text-right">Quantity</TableHead>
                  <TableHead className="w-[150px] text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStocks ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : stocks.length > 0 ? (
                  stocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">{stock.warehouseName}</TableCell>
                      <TableCell>{stock.materialCode}</TableCell>
                      <TableCell>{stock.materialName}</TableCell>
                      <TableCell>{stock.category}</TableCell>
                      <TableCell className="text-right font-bold">{stock.quantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formatDate(stock.lastUpdated)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No stock data found. Process a Goods Receipt to add stock.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
