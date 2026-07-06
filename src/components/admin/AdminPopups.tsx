import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, Loader2, Megaphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Popup {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  show_on_login: boolean;
  createdAt: string;
}

const AdminPopups = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", message: "", is_active: true, show_on_login: true });

  const fetchPopups = async () => {
    try {
      const { data } = await apiClient.get('/popups/admin/all');
      
      // Map API fields (camelCase) to what the UI uses
      const formatted = (data || []).map((p: any) => ({
        ...p,
        is_active: p.isActive,
        show_on_login: p.showOnLogin
      }));
      setPopups(formatted);
    } catch (e) {
      toast({ title: "Failed to load popups", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchPopups(); }, []);

  const resetForm = () => {
    setForm({ title: "", message: "", is_active: true, show_on_login: true });
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast({ title: "Error", description: "Title and message are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        message: form.message,
        isActive: form.is_active,
        showOnLogin: form.show_on_login
      };
      
      if (editId) {
        await apiClient.patch(`/popups/${editId}`, payload);
        toast({ title: "Updated", description: "Popup updated successfully" });
      } else {
        await apiClient.post('/popups', payload);
        toast({ title: "Created", description: "Popup created successfully" });
      }
      resetForm();
      await fetchPopups();
    } catch (e) {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/popups/${id}`);
      toast({ title: "Deleted", description: "Popup removed" });
      fetchPopups();
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const startEdit = (p: Popup) => {
    setEditId(p.id);
    setForm({ title: p.title, message: p.message, is_active: p.is_active, show_on_login: p.show_on_login });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Popup Management</h2>
        <p className="text-sm text-muted-foreground">Create and manage promotional popups shown to users</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">{editId ? "Edit Popup" : "Create New Popup"}</h3>
        <div>
          <Label className="text-xs">Title</Label>
          <Input className="mt-1" placeholder="Popup title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        <div>
          <Label className="text-xs">Message</Label>
          <Textarea className="mt-1" placeholder="Popup message content" rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            <Label className="text-xs">Active</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.show_on_login} onCheckedChange={v => setForm(f => ({ ...f, show_on_login: v }))} />
            <Label className="text-xs">Show on Login</Label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editId ? "Update" : "Create"}
          </Button>
          {editId && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {popups.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Megaphone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No popups created yet</p>
          </div>
        ) : popups.map(p => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold truncate">{p.title}</p>
                {p.is_active ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--fame-success))]/10 text-[hsl(var(--fame-success))] font-medium">Active</span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Inactive</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{p.message}</p>
              <div className="text-[10px] text-muted-foreground mt-2 font-mono">
                Created: {new Date(p.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(p)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPopups;
