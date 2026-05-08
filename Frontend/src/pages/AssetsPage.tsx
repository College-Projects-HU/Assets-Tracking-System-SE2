import { useEffect, useState } from 'react';
import { Download, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useAuth, canManageAssets } from '@/lib/auth';
import assetService from '@/services/assetService';
import assignmentService from '@/services/assignmentService';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AssetCategory, AssetRecord, AssetStatus } from '@/types/api';

type AssetForm = {
  assetTag: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  location: string;
  notes: string;
  status: AssetStatus;
};

const defaultForm: AssetForm = {
  assetTag: '',
  name: '',
  category: 'HARDWARE',
  serialNumber: '',
  purchaseDate: '',
  purchaseCost: 0,
  location: '',
  notes: '',
  status: 'AVAILABLE',
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

export default function AssetsPage() {
  const { user } = useAuth();
  const isManager = user ? canManageAssets(user.role) : false;
  const canDelete = user?.role === 'ADMIN';
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [form, setForm] = useState<AssetForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAssets = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const assetsResponse = await assetService.getAll({ size: 200 });
      const allAssets = assetsResponse.data.content;

      if (isManager) {
        setAssets(allAssets);
      } else {
        const assignmentsResponse = await assignmentService.getActiveForUser(user.id);
        const assignedIds = new Set(assignmentsResponse.data.map(item => item.assetId));
        setAssets(allAssets.filter(asset => assignedIds.has(asset.id)));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssets();
  }, [isManager, user?.id]);

  const filtered = assets.filter(asset => {
    const matchSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      (asset.serialNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (asset.location || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || asset.status === filterStatus;
    const matchCategory = filterCategory === 'ALL' || asset.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const openAdd = () => {
    setEditingAsset(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (asset: AssetRecord) => {
    setEditingAsset(asset);
    setForm({
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category as AssetCategory,
      serialNumber: asset.serialNumber || '',
      purchaseDate: asset.purchaseDate || '',
      purchaseCost: asset.purchaseCost || 0,
      location: asset.location || '',
      notes: asset.notes || '',
      status: asset.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      if (editingAsset) {
        const updated = await assetService.update(editingAsset.id, {
          name: form.name,
          category: form.category,
          serialNumber: form.serialNumber,
          purchaseDate: form.purchaseDate,
          purchaseCost: form.purchaseCost,
          location: form.location,
          notes: form.notes,
        });

        let nextAsset = updated.data;
        if (editingAsset.status !== form.status) {
          const statusUpdated = await assetService.changeStatus(editingAsset.id, form.status);
          nextAsset = statusUpdated.data;
        }

        setAssets(current => current.map(asset => (asset.id === nextAsset.id ? nextAsset : asset)));
      } else {
        const created = await assetService.create({
          assetTag: form.assetTag,
          name: form.name,
          category: form.category,
          serialNumber: form.serialNumber,
          purchaseDate: form.purchaseDate,
          purchaseCost: form.purchaseCost,
          location: form.location,
          notes: form.notes,
        });
        setAssets(current => [created.data, ...current]);
      }

      setDialogOpen(false);
      setForm(defaultForm);
      setEditingAsset(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await assetService.delete(id);
      setAssets(current => current.filter(asset => asset.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete asset.');
    }
  };

  const exportCSV = async () => {
    try {
      const response = await assetService.exportCSV();
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'full-inventory.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export inventory.');
    }
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
                      <Label>Asset Tag *</Label>
                      <Input value={form.assetTag} disabled={!!editingAsset} onChange={e => setForm({ ...form, assetTag: e.target.value })} placeholder="HW-001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Asset name" />
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Serial Number</Label>
                      <Input value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} placeholder="Serial number" />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Office / department" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Purchase Date</Label>
                      <Input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Purchase Cost</Label>
                      <Input type="number" value={form.purchaseCost} onChange={e => setForm({ ...form, purchaseCost: Number(e.target.value) })} placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
                  </div>
                  <Button onClick={handleSave} className="w-full" disabled={saving || !form.assetTag || !form.name}>
                    {saving ? 'Saving...' : 'Save Asset'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, tag, serial, or location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Purchase Date</TableHead>
              {isManager && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={isManager ? 7 : 6} className="text-center py-8 text-muted-foreground">Loading assets...</TableCell></TableRow>
            )}
            {!loading && filtered.map(asset => (
              <TableRow key={asset.id}>
                <TableCell className="font-mono text-xs">{asset.assetTag}</TableCell>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{asset.category.replace('_', ' ')}</TableCell>
                <TableCell><StatusBadge status={asset.status} /></TableCell>
                <TableCell className="text-muted-foreground">{asset.location || '—'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(asset.purchaseDate)}</TableCell>
                {isManager && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(asset)}><Edit className="w-4 h-4" /></Button>
                      {canDelete && <Button variant="ghost" size="icon" onClick={() => void handleDelete(asset.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={isManager ? 7 : 6} className="text-center py-8 text-muted-foreground">No assets found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
