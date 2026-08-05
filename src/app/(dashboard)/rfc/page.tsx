'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, Search, MapPin, Calendar, Clock, Loader2, Printer, Filter } from 'lucide-react';
import api from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function RfcPage() {
 const [rfcs, setRfcs] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [status, setStatus] = useState('ALL');
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
 const [sort, setSort] = useState('desc');

 useEffect(() => {
   fetchRfcs();
 }, [search, status, startDate, endDate, sort]);

 const fetchRfcs = async () => {
   setLoading(true);
   try {
     const { data } = await api.get('/api/rfc', { params: { search, status, startDate, endDate, sort, limit: 100 } });
     setRfcs(data.data || []);
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="space-y-6">
 <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">RFC Management</h1>
 <p className="text-sm text-muted-foreground mt-1">Manage Request for Consumption (RFC) workflows</p>
      </div>

      <div className="flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search RFCs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[230px] h-9 bg-background">
                <SelectValue>
                  {status === 'ALL' ? 'All Status' : 
                   status === 'DRAFT' ? 'Draft' :
                   status === 'WAITING_SITE_APPROVAL' ? 'Waiting Site Approval' :
                   status === 'WAITING_FINANCE_APPROVAL' ? 'Waiting Finance Approval' :
                   status === 'APPROVED' ? 'Approved' : 
                   status === 'REJECTED' ? 'Rejected' : 'All Status'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="WAITING_SITE_APPROVAL">Waiting Site Approval</SelectItem>
                <SelectItem value="WAITING_FINANCE_APPROVAL">Waiting Finance Approval</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5">
              <DatePicker 
                value={startDate} 
                onChange={setStartDate} 
                className="w-[130px] h-9 bg-background"
              />
              <span className="text-muted-foreground">-</span>
              <DatePicker 
                value={endDate} 
                onChange={setEndDate} 
                className="w-[130px] h-9 bg-background"
              />
            </div>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[160px] h-9 bg-background">
                <SelectValue>
                  Sort by: {sort === 'desc' ? 'Newest' : 'Oldest'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Sort by: Newest</SelectItem>
                <SelectItem value="asc">Sort by: Oldest</SelectItem>
              </SelectContent>
            </Select>

            <Link href="/rfc/create" className="ml-auto lg:ml-2">
              <Button className="h-9 gap-2">
                <Plus className="w-4 h-4" /> Create RFC
              </Button>
            </Link>
          </div>
        </div>
      </div>

 <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
 {loading ? (
 <div className="p-8 text-center flex flex-col items-center bg-card border rounded-xl ">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-muted-foreground">Loading RFC data...</p>
 </div>
 ) : rfcs.length > 0 ? (
 <Table className="whitespace-nowrap">
 <TableHeader>
 <TableRow>
 <TableHead className="w-[140px]">RFC Number</TableHead>
 <TableHead>Project</TableHead>
 <TableHead>Location</TableHead>
 <TableHead>Requestor</TableHead>
 <TableHead>Items</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Date</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {rfcs.map((rfc) => (
 <TableRow key={rfc.id} className="hover:bg-muted/30 cursor-pointer">
 <TableCell className="font-medium text-primary">
 {rfc.rfcNumber}
 </TableCell>
 <TableCell>
 <div className="font-medium">{rfc.project?.projectName}</div>
 <div className="text-[10px] text-muted-foreground">{rfc.project?.customer}</div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <MapPin className="w-3 h-3" />
 {rfc.location}
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
 {rfc.requestor?.name?.charAt(0) || 'U'}
 </div>
 <span className="text-sm">{rfc.requestor?.name || 'Unknown'}</span>
 </div>
 </TableCell>
 <TableCell>
 <Badge variant="outline" className="text-xs">
 {rfc._count?.items || 0} items
 </Badge>
 </TableCell>
 <TableCell>
 <StatusBadge status={rfc.status} />
 </TableCell>
  <TableCell className="text-right">
  <div className="flex items-center justify-end gap-3 text-xs">
    {rfc.signedDocument ? (
      <a 
        href={rfc.signedDocument} 
        target="_blank" 
        rel="noreferrer"
        className="text-blue-600 hover:underline flex items-center gap-1"
        title="View Approved Document"
      >
        <FileText className="w-3.5 h-3.5" /> Signed Doc
      </a>
    ) : (
      <Link href={`/print/rfc/${rfc.id}`} target="_blank" className="text-gray-600 hover:text-black hover:underline flex items-center gap-1 border border-gray-300 rounded px-2 py-0.5" title="Print Request PDF">
        <Printer className="w-3 h-3" /> Print PDF
      </Link>
    )}
    <div className="text-muted-foreground flex items-center gap-1.5">
      <Calendar className="w-3 h-3" />
      {formatDate(rfc.createdAt)}
    </div>
  </div>
  </TableCell>
  </TableRow>
 ))}
 </TableBody>
 </Table>
 ) : (
 <div className="text-center py-16 bg-card border rounded-xl ">
 <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
 <p className="text-muted-foreground">No RFCs found</p>
 <Link href="/rfc/create">
 <Button variant="link" className="mt-2">
 Create your first RFC
 </Button>
 </Link>
 </div>
 )}
 </div>
 </div>
 );
}
