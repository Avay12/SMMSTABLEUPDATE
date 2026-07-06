import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Minus, Edit2, Shield, Loader2, UserCog, Crown, Gem, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

const tierIcon = (tier: string) => {
  switch (tier) {
    case "Diamond": return <Gem className="h-3.5 w-3.5" />;
    case "Platinum": return <Crown className="h-3.5 w-3.5" />;
    case "Gold": return <Award className="h-3.5 w-3.5" />;
    default: return null;
  }
};

const tierColor = (tier: string) => {
  switch (tier) {
    case "Diamond": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "Platinum": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "Gold": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "Silver": return "bg-slate-400/10 text-slate-400 border-slate-400/20";
    default: return "bg-orange-700/10 text-orange-700 border-orange-700/20";
  }
};

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Balance dialog
  const [balDialog, setBalDialog] = useState(false);
  const [balUser, setBalUser] = useState<any>(null);
  const [balAction, setBalAction] = useState<"add" | "remove">("add");
  const [balAmount, setBalAmount] = useState("");
  const [balSubmitting, setBalSubmitting] = useState(false);

  // Edit user dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editTier, setEditTier] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editBalance, setEditBalance] = useState("0");
  const [editRole, setEditRole] = useState("USER");
  const [editStatus, setEditStatus] = useState("Active");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Confirm action dialog
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");

  // Add user dialog
  const [addDialog, setAddDialog] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("USER");
  const [addSubmitting, setAddSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/auth/users'); // Use /auth/users as defined in backend
      const usersData = data?.users || data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load users", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.user_id?.includes(q));
  });

  const handleBalanceSubmit = async () => {
    if (!balUser || !balAmount) return;
    const amt = parseFloat(balAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setBalSubmitting(true);
    
    try {
      await apiClient.post(`/admin/users/${balUser.user_id}/balance`, {
        action: balAction,
        amount: amt
      });
      toast({ title: `Balance ${balAction === "add" ? "added" : "removed"}` });
      setBalDialog(false);
      setBalAmount("");
      fetchUsers();
    } catch (e) {
      toast({ title: "Failed to update balance", variant: "destructive" });
    } finally {
      setBalSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editUser) return;
    setEditSubmitting(true);
    const updates: any = {};
    if (editEmail !== editUser.email) updates.email = editEmail;
    if (editTier !== (editUser.tier || editUser.loyalty)) updates.tier = editTier;
    if (editUsername !== editUser.username) updates.username = editUsername;
    if (editCurrency !== editUser.currency) updates.currency = editCurrency;
    if (editBalance !== String(editUser.balance)) updates.balance = parseFloat(editBalance);
    if (editRole !== editUser.role) updates.role = editRole;
    if (editStatus !== (editUser.status === true || editUser.status === 'Active' ? 'Active' : 'Inactive')) updates.status = editStatus;
    
    if (Object.keys(updates).length > 0) {
      try {
        await apiClient.patch(`/admin/users/${editUser.id || editUser.user_id}`, updates);
        toast({ title: "User updated" });
      } catch (e) {
        toast({ title: "Failed to update user", variant: "destructive" });
      }
    }
    
    setEditDialog(false);
    setEditSubmitting(false);
    fetchUsers();
  };

  const handleAddSubmit = async () => {
    if (!addEmail || !addPassword) return;
    setAddSubmitting(true);
    try {
      await apiClient.post('/admin/users', { email: addEmail, username: addUsername, password: addPassword, role: addRole });
      toast({ title: "User created successfully" });
      setAddDialog(false);
      setAddEmail("");
      setAddUsername("");
      setAddPassword("");
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Failed to create user", description: e.message, variant: "destructive" });
    }
    setAddSubmitting(false);
  };

  const showConfirm = (title: string, desc: string, action: () => void) => {
    setConfirmTitle(title);
    setConfirmDesc(desc);
    setConfirmAction(() => action);
    setConfirmDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-9 h-10 bg-card border-border rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button onClick={() => setAddDialog(true)} className="rounded-xl h-10 px-4 gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold truncate">{u.email || "No email"}</span>
                      <Badge variant="outline" className={`text-[10px] gap-1 ${tierColor(u.tier)}`}>
                        {tierIcon(u.tier)} {u.tier}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      @{u.username || "—"} · Joined {u.createdAt || u.createdAt ? new Date(u.createdAt || u.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className="text-sm font-bold text-primary">${Number(u.balance).toFixed(2)}</span>
                    <button
                      onClick={() => { setBalUser(u); setBalAction("add"); setBalDialog(true); }}
                      className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active:scale-95"
                      title="Add balance"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { setBalUser(u); setBalAction("remove"); setBalDialog(true); }}
                      className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-all active:scale-95"
                      title="Remove balance"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { 
                        setEditUser(u); 
                        setEditEmail(u.email || ""); 
                        setEditTier(u.tier || u.loyalty || ""); 
                        setEditUsername(u.username || "");
                        setEditCurrency(u.currency || "USD");
                        setEditBalance(String(u.balance || 0));
                        setEditRole(u.role || "USER");
                        setEditStatus(u.status === true || u.status === 'Active' ? 'Active' : 'Inactive');
                        setEditDialog(true); 
                      }}
                      className="h-8 px-3 rounded-lg bg-secondary text-foreground flex items-center justify-center gap-1.5 hover:bg-muted transition-all active:scale-95 text-xs font-medium"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-16 text-sm">No users found.</p>}
        </div>
      )}

      {/* Balance Dialog */}
      <Dialog open={balDialog} onOpenChange={setBalDialog}>
        <DialogContent className="sm:max-w-sm max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {balAction === "add" ? <Plus className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-destructive" />}
              {balAction === "add" ? "Add" : "Remove"} Balance
            </DialogTitle>
            <DialogDescription>This action will be logged in the transaction audit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-xs text-muted-foreground">User</div>
              <div className="text-sm font-medium break-all">{balUser?.email}</div>
              <div className="text-xs text-muted-foreground mt-1">Current balance: <span className="text-primary font-semibold">${Number(balUser?.balance || 0).toFixed(2)}</span></div>
            </div>
            <div>
              <Label className="text-sm font-medium">Amount ($)</Label>
              <Input type="number" min={0} step="0.01" placeholder="0.00" className="h-11 bg-secondary border-border rounded-xl mt-1.5" value={balAmount} onChange={(e) => setBalAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setBalDialog(false)}>Cancel</Button>
            <Button
              className={`rounded-xl ${balAction === "remove" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`}
              onClick={() => showConfirm(
                `${balAction === "add" ? "Add" : "Remove"} $${balAmount}?`,
                `This will ${balAction === "add" ? "add" : "remove"} $${balAmount} ${balAction === "add" ? "to" : "from"} ${balUser?.email}'s balance.`,
                handleBalanceSubmit
              )}
              disabled={balSubmitting || !balAmount}
            >
              {balSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-sm max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCog className="h-4 w-4" /> Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-xs text-muted-foreground">Current: <span className="break-all text-foreground">{editUser?.email}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Username *</Label>
                <Input placeholder="Username" className="h-11 bg-secondary border-border rounded-xl mt-1.5" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium">Email *</Label>
                <Input type="email" placeholder="Email address" className="h-11 bg-secondary border-border rounded-xl mt-1.5" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium">Currency</Label>
                <Select value={editCurrency} onValueChange={setEditCurrency}>
                  <SelectTrigger className="h-11 bg-secondary border-border rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="NPR">NPR (Rs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Balance (USD) *</Label>
                <Input type="number" step="0.01" className="h-11 bg-secondary border-border rounded-xl mt-1.5" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium">Role *</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="h-11 bg-secondary border-border rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Loyalty *</Label>
                <Select value={editTier} onValueChange={setEditTier}>
                  <SelectTrigger className="h-11 bg-secondary border-border rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-sm font-medium">Status *</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="h-11 bg-secondary border-border rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={handleEditSubmit} disabled={editSubmitting}>
              {editSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="sm:max-w-xs max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
            <DialogDescription>{confirmDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setConfirmDialog(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => { confirmAction(); setConfirmDialog(false); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="sm:max-w-sm max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCog className="h-4 w-4" /> Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <Input type="email" placeholder="user@example.com" className="h-11 bg-secondary border-border rounded-xl mt-1.5" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Username (Optional)</Label>
              <Input placeholder="username" className="h-11 bg-secondary border-border rounded-xl mt-1.5" value={addUsername} onChange={(e) => setAddUsername(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Password</Label>
              <Input type="password" placeholder="Password" className="h-11 bg-secondary border-border rounded-xl mt-1.5" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Role</Label>
              <Select value={addRole} onValueChange={setAddRole}>
                <SelectTrigger className="h-11 bg-secondary border-border rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={handleAddSubmit} disabled={addSubmitting || !addEmail || !addPassword}>
              {addSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
