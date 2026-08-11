'use client';

import { useEffect, useState } from 'react';
import { Package, Search, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function CatalogPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/api/materials', { params: { search, limit: 100 } });
        setMaterials(data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Catalog</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse all registered master materials.</p>
      </div>

      <div className="relative max-w-md animate-fade-in" style={{ animationDelay: '100ms' }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search catalog..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : materials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {materials.map((m) => (
              <div key={m.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <Badge variant="secondary" className="font-normal text-xs bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {m.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{m.unit}</span>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-2 leading-tight mb-1">{m.materialName}</h3>
                  <p className="font-mono text-sm text-muted-foreground">{m.materialCode}</p>
                  
                  {m.specification && (
                    <p className="text-sm text-muted-foreground mt-4 line-clamp-3">
                      {m.specification}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground">Catalog Item</span>
                  <Package className="w-4 h-4 text-primary" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border rounded-xl ">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No materials found in catalog</p>
          </div>
        )}
      </div>
    </div>
  );
}
