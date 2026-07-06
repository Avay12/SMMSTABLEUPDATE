import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RefreshCw, Loader2, Wifi, WifiOff, Eye, EyeOff, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Provider {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
}

const AdminProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", url: "", apiKey: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/providers');
      setProviders(data || []);
    } catch (e) {
      toast({ title: "Failed to load providers", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.url || !form.apiKey) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/admin/providers', { name: form.name, url: form.url, apiKey: form.apiKey, isActive: form.isActive });
      toast({ title: "Provider added" });
      setAddOpen(false);
      setForm({ name: "", url: "", apiKey: "", isActive: true });
      fetchProviders();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      await apiClient.put(`/admin/providers/${editId}`, { name: form.name, url: form.url, apiKey: form.apiKey, isActive: form.isActive });
      toast({ title: "Provider updated" });
      setEditId(null);
      setForm({ name: "", url: "", apiKey: "", isActive: true });
      fetchProviders();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/providers/${id}`);
      toast({ title: "Provider deleted" });
      fetchProviders();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setDeleteConfirm(null);
  };

  const checkBalance = async (provider: Provider) => {
    setCheckingBalance(provider.id);
    try {
      const { data } = await apiClient.get(`/services/${provider.name}/balance`);
      const bal = data?.balance ?? data?.Balance;
      if (bal !== undefined) {
        setBalances((prev) => ({ ...prev, [provider.id]: String(bal) }));
        toast({ title: `${provider.name} Balance`, description: `$${bal}` });
      } else {
        toast({ title: "Balance unavailable", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Balance check failed", description: e.message, variant: "destructive" });
    }
    setCheckingBalance(null);
  };

  const openEdit = (p: Provider) => {
    setEditId(p.id);
    setForm({ name: p.name, url: p.url, apiKey: p.apiKey, isActive: p.isActive });
  };

  const syncServices = async (providerId: string) => {
    try {
      await apiClient.post('/admin/providers/services/sync', {});
      toast({ title: "Services synced successfully" });
    } catch (e) {
      toast({ title: "Sync failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">API Providers</h2>
          <p className="text-sm text-muted-foreground">Manage external SMM API connections</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => syncServices('')} className="rounded-xl gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Sync Services
          </Button>
          <Button onClick={() => { setForm({ name: "", url: "", apiKey: "", isActive: true }); setAddOpen(true); }} className="rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Add Provider
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : providers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <WifiOff className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No providers configured yet. Add your first SMM API provider.</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Provider</TableHead>
                <TableHead className="text-xs">API URL</TableHead>
                <TableHead className="text-xs">API Key</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Balance</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {providers.map((p) => (
                  <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-border">
                    <TableCell className="font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-3.5 w-3.5 text-primary" />
                        {p.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono max-w-[200px] truncate">{p.url}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-muted-foreground max-w-[120px] truncate">
                          {showKeys[p.id] ? p.apiKey : "••••••••••"}
                        </span>
                        <button onClick={() => setShowKeys((prev) => ({ ...prev, [p.id]: !prev[p.id] }))} className="text-muted-foreground hover:text-foreground">
                          {showKeys[p.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={p.isActive ? "text-[hsl(var(--fame-success))] bg-[hsl(var(--fame-success))]/10 border-[hsl(var(--fame-success))]/20" : "text-muted-foreground bg-muted border-border"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {balances[p.id] ? (
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">${balances[p.id]}</Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1" onClick={() => checkBalance(p)} disabled={checkingBalance === p.id}>
                          {checkingBalance === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                          Check
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEdit(p)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={addOpen || !!editId} onOpenChange={(o) => { if (!o) { setAddOpen(false); setEditId(null); } }}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Provider" : "Add Provider"}</DialogTitle>
            <DialogDescription>Standard SMM Panel API format (services, add, status, balance)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Provider Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. VinaSMM" className="rounded-xl bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">API URL</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://vinasmm.com/api/v2" className="rounded-xl bg-secondary border-border font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">API Key</Label>
              <Input value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="Your API key" className="rounded-xl bg-secondary border-border font-mono text-xs" type="password" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label className="text-xs">Active</Label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => { setAddOpen(false); setEditId(null); }}>Cancel</Button>
            <Button className="rounded-xl" onClick={editId ? handleEdit : handleAdd} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editId ? "Save Changes" : "Add Provider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-xs max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Provider?</DialogTitle>
            <DialogDescription>This will remove the provider and deactivate all linked services.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProviders;
