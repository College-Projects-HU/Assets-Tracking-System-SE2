import { useState } from 'react';
import { mockAssets, Asset, AssetStatus, AssetCategory } from '@/lib/mock-data';
import { useAuth, canManageAssets } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Download } from 'lucide-react';

const defaultForm = { name: '', assetTag: '', category: 'HARDWARE' as AssetCategory, type: '', brand: '', serialNumber: '', status: 'AVAILABLE' as AssetStatus, description: '', purchaseDate: '', purchaseCost: 0, warrantyExpiry: '' };

export default function AssetsPage() {
  const { user } = useAuth();
  const isManager = user ? canManageAssets(user.role) : false;
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState(defaultForm);

  // Employees see only their assigned assets
  const visibleAssets = isManager ? assets : assets.filter(a => a.assignedToId === user?.id);

  const filtered = visibleAssets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()) || a.assetTag.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchCategory = filterCategory === 'ALL' || a.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const openAdd = () => {
    setEditingAsset(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({ name: asset.name, assetTag: asset.assetTag, category: asset.category, type: asset.type, brand: asset.brand, serialNumber: asset.serialNumber, status: asset.status, description: asset.description, purchaseDate: asset.purchaseDate, purchaseCost: asset.purchaseCost, warrantyExpiry: asset.warrantyExpiry });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const tag = form.assetTag || `HW-${String(assets.length + 1).padStart(3, '0')}`;
    if (editingAsset) {
      setAssets(assets.map(a => a.id === editingAsset.id ? { ...a, ...form, assetTag: tag } : a));
    } else {
      setAssets([...assets, { id: Date.now(), ...form, assetTag: tag, addDate: new Date().toISOString().split('T')[0] }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => setAssets(assets.filter(a => a.id !== id));

  const exportCSV = () => {
    const headers = ['Asset Tag', 'Name', 'Category', 'Type', 'Brand', 'Serial', 'Status', 'Assigned To', 'Purchase Date', 'Cost', 'Warranty'];
    const rows = filtered.map(a => [a.assetTag, a.name, a.category, a.type, a.brand, a.serialNumber, a.status, a.assignedTo || '', a.purchaseDate, a.purchaseCost, a.warrantyExpiry]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'assets.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Asset Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">{isManager ? "Manage your organization's IT assets" : 'View your assigned assets'}</p>
        </div>
        <div className="flex gap-2">
          {isManager && <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>}
          {isManager && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Asset</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display">{editingAsset ? 'Edit Asset' : 'Register New Asset'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Asset name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Asset Tag</Label>
                      <Input value={form.assetTag} onChange={e => setForm({ ...form, assetTag: e.target.value })} placeholder="Auto-generated if empty" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as AssetCategory })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HARDWARE">Hardware</SelectItem>
                          <SelectItem value="SOFTWARE_LICENSE">Software License</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="e.g. Laptop, Monitor" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Brand/Model *</Label>
                      <Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Apple, Dell" />
                    </div>
                    <div className="space-y-2">
                      <Label>Serial Number *</Label>
                      <Input value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} placeholder="Unique serial" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Purchase Date *</Label>
                      <Input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Purchase Cost *</Label>
                      <Input type="number" value={form.purchaseCost} onChange={e => setForm({ ...form, purchaseCost: Number(e.target.value) })} placeholder="0.00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Warranty Expiry *</Label>
                      <Input type="date" value={form.warrantyExpiry} onChange={e => setForm({ ...form, warrantyExpiry: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as AssetStatus })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">Available</SelectItem>
                          <SelectItem value="ASSIGNED">Assigned</SelectItem>
                          <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                          <SelectItem value="RETIRED">Retired</SelectItem>
                          <SelectItem value="LOST_STOLEN">Lost/Stolen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
                  </div>
                  <Button onClick={handleSave} className="w-full">Save Asset</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, type, or tag..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="HARDWARE">Hardware</SelectItem>
            <SelectItem value="SOFTWARE_LICENSE">Software License</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="ASSIGNED">Assigned</SelectItem>
            <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
            <SelectItem value="RETIRED">Retired</SelectItem>
            <SelectItem value="LOST_STOLEN">Lost/Stolen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Warranty</TableHead>
              {isManager && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(asset => (
              <TableRow key={asset.id}>
                <TableCell className="font-mono text-xs">{asset.assetTag}</TableCell>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{asset.category.replace('_', ' ')}</TableCell>
                <TableCell className="text-muted-foreground">{asset.type}</TableCell>
                <TableCell><StatusBadge status={asset.status} /></TableCell>
                <TableCell className="text-muted-foreground">{asset.assignedTo || '—'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{asset.warrantyExpiry}</TableCell>
                {isManager && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(asset)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={isManager ? 8 : 7} className="text-center py-8 text-muted-foreground">No assets found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
