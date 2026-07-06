import { useState, useEffect, useMemo, useTransition, useCallback, useRef } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, RefreshCw, Check, X, Download, Package, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  customRate?: number;
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
  
  // Main View State (Active/Imported Services)
  const [services, setServices] = useState<RemoteService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);

  // Import Modal State
  const [importOpen, setImportOpen] = useState(false);
  const [importProvider, setImportProvider] = useState("");
  const [remoteServices, setRemoteServices] = useState<RemoteService[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteSearch, setRemoteSearch] = useState("");
  const [remoteQuery, setRemoteQuery] = useState("");
  const [remotePlatform, setRemotePlatform] = useState("all");
  const [remotePage, setRemotePage] = useState(1);
  const [remoteTotalPages, setRemoteTotalPages] = useState(1);
  const [remoteSelected, setRemoteSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  const fetchProviders = async () => {
    try {
      const { data } = await apiClient.get('/admin/providers');
      setProviders(data || []);
      if (data && data.length > 0 && !importProvider) {
        setImportProvider(data[0].id);
      }
    } catch (e) {
      toast({ title: "Failed to load providers", variant: "destructive" });
    }
  };

  const fetchServices = async (currentPage = page) => {
    if (currentPage === 1) setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: "50" });
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (search) params.set("search", search);

      const { data } = await apiClient.get(`/admin/providers/all/active-services?${params}`);
      const servicesData = data?.data || data?.services || data;
      const newServices = Array.isArray(servicesData) ? servicesData : [];
      setServices(prev => currentPage === 1 ? newServices : [...prev, ...newServices]);
      setTotalPages(data?.totalPages || Math.ceil((data?.total || 1) / 50));
    } catch (e) {
      toast({ title: "Failed to load active services", variant: "destructive" });
    }
    if (currentPage === 1) setLoading(false);
  };

  const fetchRemoteServices = async () => {
    if (!importProvider) return;
    setRemoteLoading(true);
    try {
      const params = new URLSearchParams({ page: String(remotePage), limit: "50" });
      if (remotePlatform !== "all") params.set("platform", remotePlatform);
      if (remoteSearch) params.set("search", remoteSearch);

      const { data } = await apiClient.get(`/admin/providers/${importProvider}/remote-services?${params}`);
      const servicesData = data?.data || data?.services || data;
      setRemoteServices(Array.isArray(servicesData) ? servicesData : []);
      setRemoteTotalPages(data?.totalPages || Math.ceil((data?.total || 1) / 50));
    } catch (e) {
      toast({ title: "Failed to fetch remote catalog", variant: "destructive" });
    }
    setRemoteLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get('/admin/providers/categories');
      setCategories(data || []);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => { 
    fetchProviders(); 
    fetchCategories();
  }, []);
  
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
    fetchServices(1);
  }, [platformFilter]);

  useEffect(() => {
    if (page > 1) {
      fetchServices(page);
    }
  }, [page]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < totalPages) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, page, totalPages]);

  useEffect(() => {
    if (importOpen && remoteServices.length > 0) {
      setRemotePage(1);
      setRemoteSelected(new Set());
      fetchRemoteServices();
    }
  }, [remotePlatform, importProvider]);

  useEffect(() => {
    if (importOpen && remoteServices.length > 0) fetchRemoteServices();
  }, [remotePage]);

  const handleSearch = () => {
    setPage(1);
    fetchServices();
  };

  const handleRemoteSearch = () => {
    setRemotePage(1);
    fetchRemoteServices();
  };

  const getServiceKey = (providerId: string, serviceId: number) => `${providerId}-${serviceId}`;

  const toggleSelect = (providerId: string, serviceId: number) => {
    const key = getServiceKey(providerId, serviceId);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAll = async () => {
    if (selected.size > 0 && selected.size >= filteredServices.length) {
      setSelected(new Set());
    } else {
      toast({ title: "Selecting all services...", description: "Fetching all matching records." });
      try {
        const params = new URLSearchParams({ page: "1", limit: "10000" });
        if (platformFilter !== "all") params.set("platform", platformFilter);
        if (search) params.set("search", search);
        const { data } = await apiClient.get(`/admin/providers/all/active-services?${params}`);
        const servicesData = data?.data || data?.services || data;
        const newSelected = new Set<string>();
        if (Array.isArray(servicesData)) {
          servicesData.forEach((s: any) => newSelected.add(getServiceKey(s.providerId || "", s.service)));
        }
        setSelected(newSelected);
        toast({ title: `Selected all ${newSelected.size} services matching filter.` });
      } catch (e) {
        setSelected(new Set(filteredServices.map((s) => getServiceKey(s.providerId || "", s.service))));
      }
    }
  };

  const toggleRemoteSelect = (id: number) => {
    setRemoteSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleRemoteAll = () => {
    if (remoteSelected.size === filteredRemoteServices.length) setRemoteSelected(new Set());
    else setRemoteSelected(new Set(filteredRemoteServices.map((s) => s.service)));
  };

  const handleImportBulk = async () => {
    if (remoteSelected.size === 0) return;
    setImporting(true);
    try {
      const servicesToImport = remoteServices
        .filter((s) => remoteSelected.has(s.service))
        .map((s) => ({
          serviceId: s.service,
          name: s.name,
          category: s.category,
          rate: s.rate,
          min: s.min,
          max: s.max,
          type: s.type
        }));

      await apiClient.post(`/admin/providers/${importProvider}/services/import-bulk`, servicesToImport);
      toast({ title: `Imported ${remoteSelected.size} services successfully` });
      setRemoteSelected(new Set());
      setImportOpen(false);
      fetchServices();
    } catch (e: any) {
      toast({ title: "Import failed", description: e.message, variant: "destructive" });
    }
    setImporting(false);
  };

  const handleToggleStatus = async (providerId: string, serviceId: number, currentStatus: boolean) => {
    try {
      await apiClient.post(`/admin/providers/${providerId}/services/${serviceId}/toggle`, { status: !currentStatus });
      toast({ title: `Service ${!currentStatus ? "Activated" : "Hidden"}` });
      fetchServices();
    } catch (e) {
      toast({ title: "Failed to change status", variant: "destructive" });
    }
  };

  const handleBulkToggle = async (status: boolean) => {
    if (selected.size === 0) return;
    try {
      const ids = Array.from(selected).map(key => {
        const [pid, sid] = key.split('-');
        return { providerId: pid, serviceId: Number(sid) };
      });
      await apiClient.post(`/admin/providers/services/toggle-bulk`, { services: ids, status });
      toast({ title: `Bulk updated ${selected.size} services to ${status ? 'Active' : 'Hidden'}` });
      setSelected(new Set());
      fetchServices();
    } catch (e) {
      toast({ title: "Bulk action failed", variant: "destructive" });
    }
  };

  const [adjustPriceOpen, setAdjustPriceOpen] = useState(false);
  const [adjustPercentage, setAdjustPercentage] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const handleAdjustPrice = async () => {
    if (selected.size === 0 || !adjustPercentage) return;
    const percentage = parseFloat(adjustPercentage);
    if (isNaN(percentage)) {
      toast({ title: "Invalid percentage", variant: "destructive" });
      return;
    }

    setAdjusting(true);
    try {
      const ids = Array.from(selected).map(key => {
        const [pid, sid] = key.split('-');
        return { providerId: pid, serviceId: Number(sid) };
      });
      await apiClient.post(`/admin/providers/services/bulk-adjust-price`, { services: ids, percentage });
      toast({ title: `Successfully updated prices for ${selected.size} services by ${percentage}%` });
      setSelected(new Set());
      setAdjustPriceOpen(false);
      setAdjustPercentage("");
      fetchServices();
    } catch (e) {
      toast({ title: "Failed to adjust prices", variant: "destructive" });
    }
    setAdjusting(false);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    try {
      const ids = Array.from(selected).map(key => {
        const [pid, sid] = key.split('-');
        return { providerId: pid, serviceId: Number(sid) };
      });
      await apiClient.post(`/admin/providers/services/delete-bulk`, { services: ids });
      toast({ title: `Deleted ${selected.size} services permanently` });
      setSelected(new Set());
      fetchServices();
    } catch (e) {
      toast({ title: "Bulk delete failed", variant: "destructive" });
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

  const platforms = useMemo(() => ["all", ...categories], [categories]);

  const remotePlatforms = useMemo(() => {
    const cats = new Set(remoteServices.map((s) => extractPlatform(s.category)));
    return ["all", ...Array.from(cats).sort()];
  }, [remoteServices]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      if (platformFilter !== "all" && extractPlatform(s.category) !== platformFilter) return false;
      if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [services, platformFilter, query]);

  const filteredRemoteServices = useMemo(() => {
    return remoteServices.filter(s => {
      if (remotePlatform !== "all" && extractPlatform(s.category) !== remotePlatform) return false;
      if (remoteQuery && !s.name.toLowerCase().includes(remoteQuery.toLowerCase())) return false;
      return true;
    });
  }, [remoteServices, remotePlatform, remoteQuery]);

  const activeCount = services.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Service Manager</h2>
          <p className="text-sm text-muted-foreground">{services.length} services · {activeCount} active</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="rounded-xl gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync All"}
          </Button>
          <Button size="sm" onClick={() => setImportOpen(true)} className="rounded-xl gap-2">
            <Download className="h-4 w-4" /> Import Services
          </Button>
        </div>
      </div>

      {/* Main Filter & Search Toolbar */}
      <div className="flex flex-wrap gap-3 items-center bg-card p-3 rounded-2xl border border-border">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or service ID..." 
            className="pl-9 h-10 bg-transparent border-0 ring-0 focus-visible:ring-0 shadow-none" 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value);
              startTransition(() => setQuery(e.target.value));
            }} 
            onKeyDown={(e) => e.key === "Enter" && handleSearch()} 
          />
        </div>
        <div className="h-6 w-px bg-border hidden sm:block mx-2"></div>        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-fit min-w-[160px] h-10 border-0 bg-transparent shadow-none hover:bg-secondary/50 rounded-xl">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto min-w-[200px]">
            {platforms.map(p => (
              <SelectItem 
                key={p} 
                value={p}
                className={platformFilter === p ? "bg-[#00A99D] text-white focus:bg-[#00A99D]/90 focus:text-white" : ""}
              >
                {p === "all" ? "All Categories" : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected.size > 0 && (
          <>
            <div className="h-6 w-px bg-border hidden sm:block mx-2"></div>
            <Select value="" onValueChange={(val) => {
              if (val === 'enable') handleBulkToggle(true);
              else if (val === 'disable') handleBulkToggle(false);
              else if (val === 'delete') handleBulkDelete();
              else if (val === 'adjust') setAdjustPriceOpen(true);
            }}>
              <SelectTrigger className="w-fit gap-2 h-10 border-0 bg-secondary/80 shadow-none hover:bg-secondary rounded-xl font-semibold text-sm">
                <SelectValue placeholder={`Bulk (${selected.size})`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adjust">💰 Adjust Prices</SelectItem>
                <SelectItem value="enable">👁️ Enable</SelectItem>
                <SelectItem value="disable">🚫 Disable</SelectItem>
                <SelectItem value="delete" className="text-destructive focus:bg-destructive/10 focus:text-destructive">🗑️ Delete</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Main Services Table */}
      {loading || isPending ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border bg-secondary/20">
                <TableHead className="w-12 text-center">
                  <Checkbox checked={selected.size === filteredServices.length && filteredServices.length > 0} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead className="text-xs font-medium">ID</TableHead>
                <TableHead className="text-xs font-medium">Service</TableHead>
                <TableHead className="text-xs font-medium">Category</TableHead>
                <TableHead className="text-xs font-medium">Provider Cost</TableHead>
                <TableHead className="text-xs font-medium">My Price</TableHead>
                <TableHead className="text-xs font-medium">Provider</TableHead>
                <TableHead className="text-xs font-medium text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredServices.map((s, i) => (
                  <motion.tr 
                    ref={i === filteredServices.length - 1 ? lastElementRef : null}
                    key={getServiceKey(s.providerId || "", s.service)} 
                    layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-center">
                      <Checkbox checked={selected.has(getServiceKey(s.providerId || "", s.service))} onCheckedChange={() => toggleSelect(s.providerId || "", s.service)} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.service}</TableCell>
                    <TableCell className="text-sm font-medium max-w-[300px] truncate">
                      {s.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {s.category}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">${Number(s.rate).toFixed(4)}</TableCell>
                    <TableCell className="text-xs font-mono font-medium text-emerald-500">${Number(s.customRate || s.rate).toFixed(4)}</TableCell>
                    <TableCell>
                      <Select value={s.providerId || ""} onValueChange={(val) => toast({title: "Coming soon", description: "Provider reassignment is not fully implemented yet."})}>
                        <SelectTrigger className="h-7 w-fit text-[11px] font-medium bg-secondary/80 border-0 rounded-full shadow-none gap-1.5 hover:bg-secondary">
                          <SelectValue placeholder="Unknown" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <button 
                        onClick={() => handleToggleStatus(s.providerId || "", s.service, s.isActive || false)}
                        className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-colors ${!s.isActive ? "bg-[#015C4B] text-white shadow-sm hover:bg-[#015C4B]/90" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      >
                        {!s.isActive ? "Active" : "Hidden"}
                      </button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground text-sm">
                    No services found. Click "Import Services" to add some.
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
          
          {page < totalPages && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </motion.div>
      )}

      {/* Import Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col bg-card border-border rounded-2xl p-0 overflow-hidden">
          <div className="p-6 pb-4 border-b border-border">
            <DialogHeader>
              <DialogTitle>Import Services from Provider</DialogTitle>
              <DialogDescription>Select a provider, fetch their catalog, then search and pick services to import</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <div className="flex-1">
                <Select value={importProvider} onValueChange={(val) => { setImportProvider(val); setRemoteServices([]); }}>
                  <SelectTrigger className="rounded-xl h-11 bg-secondary/50 border-border">
                    <SelectValue placeholder="Select provider..." />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => { setRemotePage(1); fetchRemoteServices(); }} className="rounded-xl h-11 px-6 gap-2" disabled={!importProvider || remoteLoading}>
                {remoteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Fetch
              </Button>
            </div>
          </div>

          {remoteServices.length > 0 && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/20">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, ID, or category..." 
                    className="pl-9 h-10 bg-card border-border rounded-xl" 
                    value={remoteSearch} 
                    onChange={(e) => {
                      setRemoteSearch(e.target.value);
                      startTransition(() => setRemoteQuery(e.target.value));
                    }} 
                    onKeyDown={(e) => e.key === "Enter" && handleRemoteSearch()} 
                  />
                </div>
                <Select value={remotePlatform} onValueChange={setRemotePlatform}>
                  <SelectTrigger className="w-[180px] h-10 rounded-xl bg-card border-border">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    {remotePlatforms.map(p => <SelectItem key={p} value={p}>{p === "all" ? "All Platforms" : p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border bg-secondary/10">
                {remoteServices.length} services found · {remoteSelected.size} selected
              </div>

              <div className="flex-1 overflow-auto max-h-[40vh]">
                {remoteLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                      <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="w-12 text-center">
                          <Checkbox checked={remoteSelected.size === filteredRemoteServices.length && filteredRemoteServices.length > 0} onCheckedChange={toggleRemoteAll} />
                        </TableHead>
                        <TableHead className="text-xs font-medium">ID</TableHead>
                        <TableHead className="text-xs font-medium w-[40%]">Name</TableHead>
                        <TableHead className="text-xs font-medium">Category</TableHead>
                        <TableHead className="text-xs font-medium">Platform</TableHead>
                        <TableHead className="text-xs font-medium">Rate</TableHead>
                        <TableHead className="text-xs font-medium">Min/Max</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRemoteServices.map((s) => (
                        <TableRow key={s.service} className="border-b border-border/50 hover:bg-secondary/20">
                          <TableCell className="text-center">
                            <Checkbox checked={remoteSelected.has(s.service)} onCheckedChange={() => toggleRemoteSelect(s.service)} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{s.service}</TableCell>
                          <TableCell className="text-sm font-medium">
                            <div className="line-clamp-2">{s.name}</div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <div className="line-clamp-1">{s.category}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-normal">{extractPlatform(s.category)}</Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">${Number(s.rate).toFixed(4)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{s.min}/{s.max}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="p-4 border-t border-border bg-card flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground mr-2">Page {remotePage} of {remoteTotalPages}</span>
                  <Button variant="outline" size="sm" className="rounded-lg h-8" disabled={remotePage <= 1} onClick={() => setRemotePage(p => p - 1)}>Prev</Button>
                  <Button variant="outline" size="sm" className="rounded-lg h-8" disabled={remotePage >= remoteTotalPages} onClick={() => setRemotePage(p => p + 1)}>Next</Button>
                </div>
                <Button className="rounded-xl px-8" onClick={handleImportBulk} disabled={importing || remoteSelected.size === 0}>
                  {importing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Import {remoteSelected.size} Services
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={adjustPriceOpen} onOpenChange={setAdjustPriceOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust Prices ({selected.size} services)</DialogTitle>
            <DialogDescription>
              Enter a percentage to increase the prices. For example, '20' will increase prices by 20%. Use a negative number to decrease.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Percentage Adjustment (%)</label>
              <Input 
                type="number" 
                placeholder="e.g. 15" 
                value={adjustPercentage} 
                onChange={e => setAdjustPercentage(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAdjustPriceOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustPrice} disabled={adjusting || !adjustPercentage}>
              {adjusting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Apply Adjustment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;
