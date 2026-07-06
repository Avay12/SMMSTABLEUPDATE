import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, RefreshCw, Check, X, Eye, EyeOff, Download, Package, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Provider {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
}

interface RemoteService {
  service: number;
  name: string;
  category: string;
  rate: number;
  min: number;
  max: number;
  type: string;
  isActive?: boolean;
  providerId?: string;
}

function extractPlatform(category: string): string {
  const l = category.toLowerCase();
  if (l.includes("instagram")) return "Instagram";
  if (l.includes("tiktok")) return "TikTok";
  if (l.includes("youtube")) return "YouTube";
  if (l.includes("facebook")) return "Facebook";
  if (l.includes("twitter") || l.includes("x ")) return "X (Twitter)";
  if (l.includes("telegram")) return "Telegram";
  if (l.includes("spotify")) return "Spotify";
  if (l.includes("twitch")) return "Twitch";
  if (l.includes("kick")) return "Kick";
  if (l.includes("linkedin")) return "LinkedIn";
  if (l.includes("discord")) return "Discord";
  if (l.includes("threads")) return "Threads";
  if (l.includes("snapchat")) return "Snapchat";
  if (l.includes("soundcloud")) return "SoundCloud";
  return "Other";
}

const AdminServices = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [viewMode, setViewMode] = useState<"active" | "remote">("active");
  const [services, setServices] = useState<RemoteService[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importPrice, setImportPrice] = useState("");
  const [syncing, setSyncing] = useState(false);

  const fetchProviders = async () => {
    try {
      const { data } = await apiClient.get('/admin/providers');
      setProviders(data || []);
      if (data && data.length > 0 && !selectedProvider) {
        setSelectedProvider(data[0].id);
      }
    } catch (e) {
      toast({ title: "Failed to load providers", variant: "destructive" });
    }
  };

  const fetchServices = async () => {
    if (!selectedProvider) return;
    setLoading(true);
    setServices([]);
    try {
      const endpoint = viewMode === "active"
        ? `/admin/providers/${selectedProvider}/active-services`
        : `/admin/providers/${selectedProvider}/remote-services`;

      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (search) params.set("search", search);

      const { data } = await apiClient.get(`${endpoint}?${params}`);
      const servicesData = data?.data || data?.services || data;
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setTotalPages(data?.totalPages || Math.ceil((data?.total || 1) / 50));
    } catch (e) {
      toast({ title: "Failed to load services", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchProviders(); }, []);
  useEffect(() => {
    if (selectedProvider) {
      setPage(1);
      setSelected(new Set());
      fetchServices();
    }
  }, [selectedProvider, viewMode, platformFilter]);

  useEffect(() => {
    if (selectedProvider) fetchServices();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchServices();
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === services.length) setSelected(new Set());
    else setSelected(new Set(services.map((s) => s.service)));
  };

  const handleActivateBulk = async () => {
    if (selected.size === 0) { toast({ title: "Select services first", variant: "destructive" }); return; }
    setImporting(true);
    try {
      const servicesToActivate = services
        .filter((s) => selected.has(s.service))
        .map((s) => ({
          serviceId: s.service,
          name: s.name,
          category: s.category,
          rate: s.rate,
          min: s.min,
          max: s.max,
          type: s.type,
          customRate: importPrice ? parseFloat(importPrice) : undefined,
        }));

      await apiClient.post(`/admin/providers/${selectedProvider}/services/activate-bulk`, servicesToActivate);
      toast({ title: `Activated ${selected.size} services` });
      setSelected(new Set());
      setImportOpen(false);
      setImportPrice("");
      if (viewMode === "active") fetchServices();
    } catch (e: any) {
      toast({ title: "Activation failed", description: e.message, variant: "destructive" });
    }
    setImporting(false);
  };

  const handleDeactivate = async (serviceId: number) => {
    try {
      await apiClient.delete(`/admin/providers/${selectedProvider}/services/${serviceId}/deactivate`);
      toast({ title: "Service deactivated" });
      fetchServices();
    } catch (e) {
      toast({ title: "Deactivation failed", variant: "destructive" });
    }
  };

  const handleDeactivateBulk = async () => {
    if (selected.size === 0) return;
    try {
      const ids = Array.from(selected).map(id => ({ serviceId: id }));
      await apiClient.post(`/admin/providers/${selectedProvider}/services/deactivate-bulk`, ids);
      toast({ title: `Deactivated ${selected.size} services` });
      setSelected(new Set());
      fetchServices();
    } catch (e) {
      toast({ title: "Bulk deactivation failed", variant: "destructive" });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/admin/providers/services/sync', {});
      toast({ title: "Services synced from all providers" });
      fetchServices();
    } catch (e) {
      toast({ title: "Sync failed", variant: "destructive" });
    }
    setSyncing(false);
  };

  const platforms = useMemo(() => {
    const cats = new Set(services.map((s) => extractPlatform(s.category)));
    return ["all", ...Array.from(cats).sort()];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      if (platformFilter !== "all" && extractPlatform(s.category) !== platformFilter) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [services, platformFilter, search]);

  const selectedProviderObj = providers.find(p => p.id === selectedProvider);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Services Management</h2>
          <p className="text-sm text-muted-foreground">Browse, activate, and manage SMM services per provider</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="rounded-xl gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync All"}
          </Button>
        </div>
      </div>

      {/* Provider & Mode Selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <Label className="text-xs mb-1 block">Provider</Label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="rounded-xl bg-card border-border">
              <SelectValue placeholder="Select provider..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">View</Label>
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === "active" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}
              onClick={() => setViewMode("active")}
            >
              <Package className="h-4 w-4 inline mr-1.5" />Active
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === "remote" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}
              onClick={() => setViewMode("remote")}
            >
              <Download className="h-4 w-4 inline mr-1.5" />Remote
            </button>
          </div>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Platform</Label>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="rounded-xl bg-card border-border w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platforms.map(p => <SelectItem key={p} value={p}>{p === "all" ? "All Platforms" : p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search & Bulk Actions */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-9 rounded-xl bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleSearch} className="rounded-xl">Search</Button>
        {selected.size > 0 && (
          <>
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            {viewMode === "remote" && (
              <Button size="sm" onClick={() => setImportOpen(true)} className="rounded-xl gap-1.5">
                <Check className="h-3.5 w-3.5" /> Activate Selected
              </Button>
            )}
            {viewMode === "active" && (
              <Button size="sm" variant="destructive" onClick={handleDeactivateBulk} className="rounded-xl gap-1.5">
                <X className="h-3.5 w-3.5" /> Deactivate Selected
              </Button>
            )}
          </>
        )}
      </div>

      {/* Services Table */}
      {!selectedProvider ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">Select a provider to view services</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox checked={selected.size === filteredServices.length && filteredServices.length > 0} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Provider</TableHead>
                <TableHead className="text-xs">Rate</TableHead>
                <TableHead className="text-xs">Min/Max</TableHead>
                {viewMode === "active" && <TableHead className="text-xs text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredServices.map((s) => (
                  <motion.tr key={s.service} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-border">
                    <TableCell>
                      <Checkbox checked={selected.has(s.service)} onCheckedChange={() => toggleSelect(s.service)} />
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{s.service}</TableCell>
                    <TableCell className="text-sm max-w-[240px]">
                      <div className="truncate font-medium">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground">{s.type}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal">{extractPlatform(s.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-normal text-muted-foreground whitespace-nowrap">
                        {providers.find(p => p.id === s.providerId)?.name || selectedProviderObj?.name || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-primary">${Number(s.rate).toFixed(4)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.min} – {s.max}</TableCell>
                    {viewMode === "active" && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg text-destructive hover:text-destructive" onClick={() => handleDeactivate(s.service)}>
                          <X className="h-3.5 w-3.5 mr-1" /> Deactivate
                        </Button>
                      </TableCell>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={viewMode === "active" ? 7 : 6} className="text-center py-16 text-muted-foreground text-sm">
                    No services found.
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-lg" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <Button variant="outline" size="sm" className="rounded-lg" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Activate Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-sm max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>Activate {selected.size} Services</DialogTitle>
            <DialogDescription>Optionally set a custom price override. Leave blank to use the provider rate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Custom Price per 1000 (USD, optional)</Label>
              <Input
                className="mt-1 rounded-xl bg-secondary border-border"
                placeholder="e.g. 1.50"
                value={importPrice}
                onChange={(e) => setImportPrice(e.target.value)}
                type="number"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={handleActivateBulk} disabled={importing}>
              {importing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;
