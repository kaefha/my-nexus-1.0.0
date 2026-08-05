'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

export default function CreateRfcPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  
  // Data for dropdowns
  const [projects, setProjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    projectId: '',
    location: '',
    requestorId: '',
    requestDate: '',
    approvalDestination: '',
    notes: '',
  });
  
  const [requestDocument, setRequestDocument] = useState<File | null>(null);

  const [items, setItems] = useState<any[]>([
    { materialId: '', requestQty: 1, notes: '' }
  ]);

  useEffect(() => {
    Promise.all([
      api.get('/api/projects').then(res => setProjects(res.data.data)),
      api.get('/api/materials').then(res => setMaterials(res.data.data)),
      api.get('/api/users').then(res => setUsers(res.data.data))
    ]).catch(err => console.error('Failed to load initial data', err));
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, requestDate: today }));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { materialId: '', requestQty: 1, notes: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleLoadRequirements = async () => {
    if (!formData.projectId) return;
    setLoadingRequirements(true);
    try {
      const res = await api.get(`/api/projects/requirements?projectId=${formData.projectId}`);
      const reqs = res.data.data;
      if (reqs && reqs.length > 0) {
        const newItems = reqs.map((r: any) => ({
          materialId: r.materialId,
          requestQty: r.estimatedQty || 1,
          notes: r.notes || ''
        }));
        setItems(newItems);
        toast.success('Material requirements loaded successfully');
      } else {
        toast.error('No material requirements found for this project.');
      }
    } catch (err) {
      console.error('Failed to load requirements', err);
      toast.error('Failed to load project requirements.');
    } finally {
      setLoadingRequirements(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let requestDocumentUrl = null;
      if (requestDocument) {
        const uploadData = new FormData();
        uploadData.append('file', requestDocument);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });
        
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          requestDocumentUrl = url;
        } else {
          throw new Error('Failed to upload document');
        }
      }

      await api.post('/api/rfc', {
        ...formData,
        requestDocument: requestDocumentUrl,
        items: items.filter(item => item.materialId) // Only submit valid items
      });
      toast.success('RFC submitted successfully');
      router.push('/rfc');
    } catch (error) {
      console.error('Error submitting RFC', error);
      toast.error('Failed to submit RFC');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/rfc">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New RFC</h1>
          <p className="text-sm text-muted-foreground">Request materials for consumption in a project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Select the project and provide delivery details.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project</Label>
                <select 
                  id="projectId" 
                  required 
                  className={selectClass}
                  value={formData.projectId}
                  onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestorId">Requestor (PIC)</Label>
                <select 
                  id="requestorId" 
                  required 
                  className={selectClass}
                  value={formData.requestorId}
                  onChange={(e) => setFormData({...formData, requestorId: e.target.value})}
                >
                  <option value="">Select a requestor...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestDate">Request Date</Label>
                <DatePicker 
                  value={formData.requestDate}
                  onChange={(value) => setFormData({...formData, requestDate: value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvalDestination">Approval Destination</Label>
                <select 
                  id="approvalDestination" 
                  required 
                  className={selectClass}
                  value={formData.approvalDestination}
                  onChange={(e) => setFormData({...formData, approvalDestination: e.target.value})}
                >
                  <option value="">Select approver...</option>
                  {users
                    .filter(u => ['SITE_MANAGER', 'FINANCE'].includes(u.role))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))
                  }
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Delivery Location(s)</Label>
                <Textarea 
                  id="location" 
                  placeholder="e.g. Segment 1, Segment 2, or full address" 
                  required 
                  className="min-h-[116px]"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestDocument">Supporting Document (Optional)</Label>
                <Input 
                  id="requestDocument" 
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setRequestDocument(e.target.files[0]);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Upload the original scanned document for the approver to review.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Purpose</Label>
                <Input 
                  id="notes" 
                  placeholder="Optional notes for this request" 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Material Items</CardTitle>
              <CardDescription>Add materials needed for this RFC.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {formData.projectId && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleLoadRequirements} 
                  disabled={loadingRequirements} 
                  className="gap-2"
                >
                  {loadingRequirements ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
                  Auto-fill from Project
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => {
              const selectedMaterial = materials.find(m => m.id === item.materialId);
              const uom = selectedMaterial ? selectedMaterial.unit : '-';
              
              return (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                    <div className="space-y-2 md:col-span-4">
                      <Label>Material</Label>
                      <select 
                        required 
                        className={selectClass}
                        value={item.materialId}
                        onChange={(e) => handleItemChange(index, 'materialId', e.target.value)}
                      >
                        <option value="">Select material...</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>[{m.materialCode}] - {m.materialName}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2 md:col-span-1">
                      <Label>Satuan</Label>
                      <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-muted/50 text-sm font-medium text-muted-foreground">
                        {uom}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Vol. Minta</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        required 
                        value={item.requestQty}
                        onChange={(e) => handleItemChange(index, 'requestQty', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label>Vol. Beri</Label>
                      <Input 
                        type="number" 
                        disabled 
                        placeholder="0"
                        title="Diisi oleh Approver"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <Label>SN / Keterangan</Label>
                      <Input 
                        placeholder="e.g. SN12345 or Notes" 
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                  {items.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="mt-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/rfc">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Submit RFC
          </Button>
        </div>
      </form>
    </div>
  );
}
