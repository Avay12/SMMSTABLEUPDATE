import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, RefreshCw, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Currency {
  id: number;
  code: string;
  symbol: string;
  rate: string;
  createdAt: string;
}

export const AdminCurrencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", symbol: "", rate: "" });

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [editForm, setEditForm] = useState({ symbol: "", rate: "" });
  const [saving, setSaving] = useState(false);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/admin/currencies");
      setCurrencies(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load currencies", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleCreate = async () => {
    if (!form.code || !form.symbol || !form.rate) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    try {
      await apiClient.post("/admin/currencies/bulk", {
        currencies: [{
          code: form.code.toUpperCase(),
          symbol: form.symbol,
          rate: parseFloat(form.rate),
        }]
      });
      toast({ title: "Success", description: "Currency added" });
      setOpen(false);
      setForm({ code: "", symbol: "", rate: "" });
      fetchCurrencies();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to add currency", variant: "destructive" });
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm("Delete this currency?")) return;
    try {
      await apiClient.delete(`/admin/currencies/${code}`);
      toast({ title: "Success", description: "Currency deleted" });
      fetchCurrencies();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to delete currency", variant: "destructive" });
    }
  };

  const openEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setEditForm({ symbol: currency.symbol, rate: String(parseFloat(currency.rate)) });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingCurrency) return;
    setSaving(true);
    try {
      await apiClient.put(`/admin/currencies/${editingCurrency.code}`, {
        symbol: editForm.symbol,
        rate: parseFloat(editForm.rate),
      });
      toast({ title: "Success", description: "Currency updated" });
      setEditOpen(false);
      fetchCurrencies();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update currency", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncRates = async () => {
    try {
      setSyncing(true);
      await apiClient.post("/admin/currencies/sync");
      toast({ title: "Success", description: "Currency rates synced with API" });
      fetchCurrencies();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to sync rates", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Currencies</h2>
          <p className="text-sm text-muted-foreground">Manage available currencies and their exchange rates.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSyncRates} disabled={syncing}>
            {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync Rates
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Currency
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Currency</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Currency Code (e.g. EUR)</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Symbol (e.g. €)</Label>
                  <Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Rate against USD (e.g. 0.92)</Label>
                  <Input type="number" step="0.01" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
                </div>
                <Button className="w-full" onClick={handleCreate}>Save Currency</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingCurrency?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Symbol</Label>
              <Input value={editForm.symbol} onChange={(e) => setEditForm({ ...editForm, symbol: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rate against USD</Label>
              <Input type="number" step="0.0001" value={editForm.rate} onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })} />
            </div>
            <Button className="w-full" onClick={handleEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Rate (to USD)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : currencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No currencies configured.
                </TableCell>
              </TableRow>
            ) : (
              currencies.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell className="font-medium">{currency.code}</TableCell>
                  <TableCell>{currency.symbol}</TableCell>
                  <TableCell>{parseFloat(currency.rate).toFixed(4)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary" onClick={() => openEdit(currency)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(currency.code)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

