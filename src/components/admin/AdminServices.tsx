import { useState, useEffect, useMemo, useTransition, useCallback, useRef } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { apiClient } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, RefreshCw, Check, X, Download, Package, Trash2, Filter, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  originalServiceId?: number;
}

function extractPlatform(text: string): string {
  const l = (text || "").toLowerCase();
  if (l.includes("instagram")) return "Instagram";
  if (l.includes("tiktok") || l.includes("tik tok")) return "TikTok";
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
  if (l.includes("pinterest")) return "Pinterest";
  if (l.includes("reddit")) return "Reddit";
  return "Other";
}

/** Returns a meaningful category string, falling back to the service name scan when
 *  the backend has stored 'Unknown', blank, or a pending-sync placeholder. */
function resolveCategory(category: string, serviceName: string): string {
  const bad = !category || category.toLowerCase() === "unknown" || category.toLowerCase().includes("pending");
  if (!bad) return category;
  // Try to derive from service name
  const derived = extractPlatform(serviceName);
  return derived !== "Other" ? derived : (serviceName.split("|")[0]?.trim() || "Other");
}

const AdminServices = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  
  // Main View State (Active/Imported Services)
  const [services, setServices] = useState<RemoteService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);

  const { formatCurrency } = useCurrency();

  // Import Modal State
  const [importOpen, setImportOpen] = useState(false);
  const [importProvider, setImportProvider] = useState("");
  const [remoteServices, setRemoteServices] = useState<RemoteService[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteSearchInput, setRemoteSearchInput] = useState("");
  const [remoteSearch, setRemoteSearch] = useState("");
  const [remoteQuery, setRemoteQuery] = useState("");
  const [remotePlatform, setRemotePlatform] = useState("all");
  const [remotePage, setRemotePage] = useState(1);
  const [remoteTotalPages, setRemoteTotalPages] = useState(1);
  const [remoteTotal, setRemoteTotal] = useState(0);
  const [remoteSelected, setRemoteSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Single-service activation dialog
  const [activateSingleOpen, setActivateSingleOpen] = useState(false);
  const [singleService, setSingleService] = useState<RemoteService | null>(null);
  const [singleForm, setSingleForm] = useState({ name: "", serviceId: "", originalServiceId: "", min: "", max: "", customRate: "", nameEdited: false });
  const [activatingSingle, setActivatingSingle] = useState(false);

  // Edit active service dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingService, setEditingService] = useState<RemoteService | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    serviceId: "",
    originalServiceId: "",
    customRate: "",
    min: "",
    max: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchProviders = async () => {
    try {
      const { data } = await apiClient.get('/admin/providers');
      setProviders(data || []);
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

  const fetchRemoteServices = async (pageToFetch = remotePage) => {
    if (!importProvider) return;
    setRemoteLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageToFetch), limit: "50" });
      if (remotePlatform !== "all") params.set("platform", remotePlatform);
      if (remoteSearch) params.set("search", remoteSearch);

      const { data } = await apiClient.get(`/admin/providers/${importProvider}/remote-services?${params}`);
      const servicesData = data?.data || data?.services || data;
      const arr = Array.isArray(servicesData) ? servicesData : [];
      arr.sort((a: any, b: any) => a.service - b.service);
      setRemoteServices(arr);
      setRemoteTotalPages(data?.totalPages || Math.ceil((data?.total || 1) / 50));
      setRemoteTotal(data?.total || (Array.isArray(servicesData) ? servicesData.length : 0));
      setHasFetched(true);
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
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setQuery(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setRemoteSearch(remoteSearchInput);
      setRemoteQuery(remoteSearchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [remoteSearchInput]);
  
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
    fetchServices(1);
  }, [platformFilter, search]);

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
    if (importOpen) {
      setRemotePage(1);
      setRemoteSelected(new Set());
      setRemoteServices([]);
      setHasFetched(false);
    }
  }, [importOpen]);

  useEffect(() => {
    if (importOpen && importProvider) {
      setRemotePage(1);
      fetchRemoteServices();
    }
  }, [remotePlatform, remoteSearch]);

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

  const toggleAllRemoteAcrossPages = async () => {
    if (remoteSelected.size > 0 && remoteSelected.size >= remoteTotal) {
      setRemoteSelected(new Set());
    } else {
      toast({ title: "Selecting all services...", description: `Fetching all ${remoteTotal} matching records.` });
      try {
        const params = new URLSearchParams({ page: "1", limit: "20000" });
        if (remotePlatform !== "all") params.set("platform", remotePlatform);
        if (remoteSearch) params.set("search", remoteSearch);
        const { data } = await apiClient.get(`/admin/providers/${importProvider}/remote-services?${params}`);
        const servicesData = data?.data || data?.services || data;
        const newSelected = new Set<number>();
        if (Array.isArray(servicesData)) {
          servicesData.forEach((s: any) => newSelected.add(s.service));
        }
        setRemoteSelected(newSelected);
        toast({ title: `Selected all ${newSelected.size} matching services.` });
      } catch (e) {
        toast({ title: "Failed to select all", variant: "destructive" });
      }
    }
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
          originalServiceId: s.service,
          name: s.name,
          category: s.category,
          rate: s.rate,
          min: s.min,
          max: s.max,
          type: s.type
        }));

      await apiClient.post(`/admin/providers/${importProvider}/services/import-bulk`, servicesToImport);
      toast({ title: `Imported ${remoteSelected.size} services successfully` });
      
      // Instantly remove imported services from the local state
      setRemoteServices(prev => prev.filter(s => !remoteSelected.has(s.service)));
      setRemoteSelected(new Set());
      setImportOpen(false);
      fetchServices(1);
    } catch (e: any) {
      toast({ title: "Import failed", description: e.message, variant: "destructive" });
    }
    setImporting(false);
  };

  const openActivateSingle = (s: RemoteService) => {
    setSingleService(s);
    setSingleForm({
      name: s.name,
      serviceId: String(s.service),
      originalServiceId: String(s.service),
      min: String(s.min),
      max: String(s.max),
      customRate: "",
      nameEdited: false,
    });
    setActivateSingleOpen(true);
  };

  const handleActivateSingle = async () => {
    if (!singleService || !importProvider) return;
    const parsedMin = Number(singleForm.min);
    const parsedMax = Number(singleForm.max);
    const parsedId = Number(singleForm.serviceId);
    const parsedOriginalId = singleForm.originalServiceId ? Number(singleForm.originalServiceId) : parsedId;
    const customName = singleForm.name.trim();
    if (!customName || isNaN(parsedMin) || isNaN(parsedMax) || isNaN(parsedId) || isNaN(parsedOriginalId)) {
      toast({ title: "Invalid fields", description: "Please fill all fields with valid values.", variant: "destructive" });
      return;
    }
    setActivatingSingle(true);
    try {
      // Always carry original service's category & type so backend doesn't mark them Unknown.
      // Send customName + overrideName so backend won't overwrite name on async sync.
      const parsedCustomRate = singleForm.customRate ? Number(singleForm.customRate) : null;
      const payload = [{
        serviceId: parsedId,
        originalServiceId: parsedOriginalId,
        name: customName,
        customName: customName,        // explicit override field
        overrideName: true,            // tell backend: do NOT overwrite name on sync
        category: singleService.category,
        rate: parsedCustomRate ?? singleService.rate,
        min: parsedMin,
        max: parsedMax,
        type: singleService.type,
        ...(parsedCustomRate !== null ? { customRate: parsedCustomRate } : {}),
      }];
      await apiClient.post(`/admin/providers/${importProvider}/services/import-bulk`, payload);
      toast({ title: "Service activated", description: `"${customName}" has been added successfully.` });
      // Remove from remote list using the ORIGINAL service id (not the potentially-changed parsedId)
      setRemoteServices(prev => prev.filter(s => s.service !== singleService.service));
      setActivateSingleOpen(false);
      setSingleService(null);
      fetchServices(1);
    } catch (e: any) {
      toast({ title: "Activation failed", description: e.message, variant: "destructive" });
    }
    setActivatingSingle(false);
  };

  const openEditModal = (s: RemoteService) => {
    setEditingService(s);
    setEditForm({
      name: s.name || "",
      serviceId: String(s.service || ""),
      originalServiceId: String(s.originalServiceId || s.service || ""),
      customRate: s.customRate !== undefined ? String(s.customRate) : String(s.rate || ""),
      min: String(s.min || ""),
      max: String(s.max || ""),
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingService) return;
    if (!editingService.providerId) {
      toast({ title: "Provider ID missing for this service", variant: "destructive" });
      return;
    }
    const parsedMin = editForm.min ? Number(editForm.min) : undefined;
    const parsedMax = editForm.max ? Number(editForm.max) : undefined;
    const parsedRate = editForm.customRate ? Number(editForm.customRate) : undefined;
    const parsedNewServiceId = editForm.serviceId ? Number(editForm.serviceId) : undefined;
    const customName = editForm.name.trim();

    setSavingEdit(true);
    try {
      await apiClient.put(`/admin/providers/${editingService.providerId}/services/${editingService.service}`, {
        customName: customName || undefined,
        customRate: parsedRate,
        customMin: parsedMin,
        customMax: parsedMax,
        serviceId: parsedNewServiceId,
        newServiceId: parsedNewServiceId,
        originalServiceId: Number(editForm.originalServiceId) || Number(editingService.originalServiceId) || Number(editingService.service),
      });

      toast({ title: "Service updated successfully" });
      setEditOpen(false);
      setEditingService(null);
      fetchServices(1);
    } catch (e: any) {
      toast({ title: "Failed to update service", description: e.message, variant: "destructive" });
    }
    setSavingEdit(false);
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
    const standardPlatforms = [
      "Instagram", "TikTok", "YouTube", "Facebook", "X (Twitter)", 
      "Telegram", "Spotify", "Twitch", "Kick", "LinkedIn", 
      "Discord", "Threads", "Snapchat", "SoundCloud", 
      "Pinterest", "Reddit", "Website Traffic", "Other"
    ];
    return ["all", ...standardPlatforms.sort((a, b) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    })];
  }, []);

  const filteredServices = services;
  const filteredRemoteServices = remoteServices;

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
            value={searchInput} 
            onChange={(e) => setSearchInput(e.target.value)} 
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
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border bg-secondary/20">
                <TableHead className="w-12 text-center">
                  <Checkbox checked={selected.size === filteredServices.length && filteredServices.length > 0} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead className="text-xs font-medium whitespace-nowrap">ID</TableHead>
                <TableHead className="text-xs font-medium whitespace-nowrap">Original ID</TableHead>
                <TableHead className="text-xs font-medium whitespace-nowrap">Service</TableHead>
                <TableHead className="text-xs font-medium whitespace-nowrap">Category</TableHead>
                <TableHead className="text-xs font-medium whitespace-nowrap">Provider Cost</TableHead>
                <TableHead className="text-xs font-medium whitespace-nowrap">My Price</TableHead>
                <TableHead className="text-xs font-medium whitespace-nowrap">Provider</TableHead>
                <TableHead className="text-xs font-medium text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredServices.map((s, i) => (
                  <TableRow 
                    ref={i === filteredServices.length - 1 ? lastElementRef : null}
                    key={getServiceKey(s.providerId || "", s.service)} 
                    className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-center">
                      <Checkbox checked={selected.has(getServiceKey(s.providerId || "", s.service))} onCheckedChange={() => toggleSelect(s.providerId || "", s.service)} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">{s.service}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                      {s.originalServiceId || s.service}
                    </TableCell>
                    <TableCell className="text-sm font-medium whitespace-nowrap">
                      {s.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {resolveCategory(s.category, s.name)}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{formatCurrency(Number(s.rate))}</TableCell>
                    <TableCell className="text-xs font-mono font-medium text-emerald-500">{formatCurrency(Number(s.customRate || s.rate))}</TableCell>
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
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="text-xs px-2.5 py-1.5 rounded-full font-semibold border border-border/80 bg-secondary/60 hover:bg-secondary text-foreground transition-colors flex items-center gap-1"
                          title="Edit Service Details"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(s.providerId || "", s.service, s.isActive || false)}
                          className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-colors ${!s.isActive ? "bg-[#015C4B] text-white shadow-sm hover:bg-[#015C4B]/90" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                        >
                          {!s.isActive ? "Active" : "Hidden"}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-muted-foreground text-sm">
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
              <Button onClick={() => { setRemotePage(1); fetchRemoteServices(1); }} className="rounded-xl h-11 px-6 gap-2 bg-[#00B49F] hover:bg-[#00B49F]/90 text-white font-semibold" disabled={!importProvider || remoteLoading}>
                {remoteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Fetch
              </Button>
            </div>
          </div>

          {(remoteServices.length > 0 || remoteLoading || hasFetched) && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/20">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, ID, or category..." 
                    className="pl-9 h-10 bg-card border-border rounded-xl" 
                    value={remoteSearchInput} 
                    onChange={(e) => setRemoteSearchInput(e.target.value)} 
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

              <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border bg-secondary/10 flex justify-between items-center">
                <span>{remoteTotal} services found · {remoteSelected.size} selected</span>
                {remoteTotal > 0 && (
                  <button onClick={toggleAllRemoteAcrossPages} className="text-primary hover:underline font-medium">
                    {remoteSelected.size >= remoteTotal ? "Deselect All" : `Select All (${remoteTotal})`}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-auto max-h-[40vh] p-4 sm:p-5">
                {remoteLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border/60 rounded-2xl overflow-hidden">
                    <Table>
                    <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                      <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="w-12 text-center">
                          {/* Empty header instead of checkbox to match design */}
                        </TableHead>
                        <TableHead className="text-xs font-medium">ID</TableHead>
                        <TableHead className="text-xs font-medium whitespace-nowrap">Name</TableHead>
                        <TableHead className="text-xs font-medium whitespace-nowrap">Category</TableHead>
                        <TableHead className="text-xs font-medium whitespace-nowrap">Platform</TableHead>
                        <TableHead className="text-xs font-medium whitespace-nowrap">Rate</TableHead>
                        <TableHead className="text-xs font-medium whitespace-nowrap">Min/Max</TableHead>
                        <TableHead className="text-xs font-medium whitespace-nowrap text-right">Activate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRemoteServices.map((s, idx) => (
                        <TableRow key={`${s.service}-${idx}`} className="border-b border-border/50 hover:bg-secondary/20">
                          <TableCell className="text-center">
                            <Checkbox className="rounded-full" checked={remoteSelected.has(s.service)} onCheckedChange={() => toggleRemoteSelect(s.service)} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{s.service}</TableCell>
                          <TableCell className="text-sm font-medium whitespace-nowrap">
                            {s.name}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {s.category}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="text-[10px] font-normal">{extractPlatform(s.category)}</Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">{formatCurrency(Number(s.rate))}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{s.min}/{s.max}</TableCell>
                          <TableCell className="text-right">
                            <button
                              onClick={() => openActivateSingle(s)}
                              className="text-[11px] px-3 py-1 rounded-full font-semibold bg-[#00B49F]/10 text-[#00B49F] border border-[#00B49F]/30 hover:bg-[#00B49F]/20 transition-colors whitespace-nowrap"
                            >
                              ⚡ Activate
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredRemoteServices.length === 0 && !remoteLoading && (
                        <tr>
                          <td colSpan={8} className="text-center py-16 text-muted-foreground text-sm">
                            No new services found for this provider. They may have all been imported.
                          </td>
                        </tr>
                      )}
                    </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div className="flex justify-between sm:justify-start gap-2 items-center w-full sm:w-auto">
                  <span className="text-xs text-muted-foreground mr-2">Page {remotePage} of {remoteTotalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full h-8 px-4" disabled={remotePage <= 1} onClick={() => setRemotePage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" className="rounded-full h-8 px-4 font-semibold text-foreground" disabled={remotePage >= remoteTotalPages} onClick={() => setRemotePage(p => p + 1)}>Next</Button>
                  </div>
                </div>
                <Button className="w-full sm:w-auto rounded-xl h-11 px-8 bg-[#80D2C8] hover:bg-[#80D2C8]/90 text-white font-semibold" onClick={handleImportBulk} disabled={importing || remoteSelected.size === 0}>
                  {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
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

      {/* Single Service Activation Dialog */}
      <Dialog open={activateSingleOpen} onOpenChange={(o) => { if (!o) { setActivateSingleOpen(false); setSingleService(null); } }}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">⚡ Activate Service</DialogTitle>
            <DialogDescription>
              Customize the name, service ID, min/max quantity, and optional custom rate before activating.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Custom Name
                {!singleForm.nameEdited && (
                  <span className="ml-2 text-[10px] text-muted-foreground font-normal">(pre-filled — edit to override)</span>
                )}
              </Label>
              <Input
                value={singleForm.name}
                onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value, nameEdited: true })}
                placeholder="Service display name"
                className="rounded-xl bg-secondary border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Service ID (Your Site)</Label>
                <Input
                  type="number"
                  value={singleForm.serviceId}
                  onChange={(e) => {
                    // Changing service ID only updates the ID — name/min/max stay as-is
                    setSingleForm(prev => ({ ...prev, serviceId: e.target.value }));
                  }}
                  placeholder="e.g. 1042"
                  className="rounded-xl bg-secondary border-border font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Original ID (Provider)</Label>
                <Input
                  type="number"
                  disabled
                  value={singleForm.originalServiceId}
                  className="rounded-xl bg-secondary/50 border-border font-mono cursor-not-allowed opacity-75"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Min Quantity</Label>
                <Input
                  type="number"
                  value={singleForm.min}
                  onChange={(e) => setSingleForm({ ...singleForm, min: e.target.value })}
                  placeholder="e.g. 100"
                  className="rounded-xl bg-secondary border-border font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Max Quantity</Label>
                <Input
                  type="number"
                  value={singleForm.max}
                  onChange={(e) => setSingleForm({ ...singleForm, max: e.target.value })}
                  placeholder="e.g. 10000"
                  className="rounded-xl bg-secondary border-border font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Custom Rate (optional — leave blank to use provider rate)</Label>
              <Input
                type="number"
                step="0.0001"
                value={singleForm.customRate}
                onChange={(e) => setSingleForm({ ...singleForm, customRate: e.target.value })}
                placeholder={`Provider rate: ${singleService ? formatCurrency(Number(singleService.rate)) : ""}`}
                className="rounded-xl bg-secondary border-border font-mono"
              />
            </div>
            {singleService && (
              <p className="text-[11px] text-muted-foreground rounded-xl bg-secondary/60 px-3 py-2">
                Category: <span className="font-medium text-foreground">{singleService.category}</span>
                &nbsp;·&nbsp; Platform: <span className="font-medium text-foreground">{extractPlatform(singleService.category)}</span>
                &nbsp;·&nbsp; Type: <span className="font-medium text-foreground">{singleService.type}</span>
                {singleForm.serviceId !== String(singleService.service) && (
                  <span className="ml-2 text-amber-500 font-medium">· ID changed — name &amp; category kept from original</span>
                )}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => { setActivateSingleOpen(false); setSingleService(null); }}>Cancel</Button>
            <Button className="rounded-xl bg-[#00B49F] hover:bg-[#00B49F]/90 text-white" onClick={handleActivateSingle} disabled={activatingSingle}>
              {activatingSingle && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Activate Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Active Service Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) { setEditOpen(false); setEditingService(null); } }}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">✏️ Edit Service {editingService?.service}</DialogTitle>
            <DialogDescription>
              Customize the name, site service ID, min/max quantities, and your custom selling price.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Custom Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Service display name"
                className="rounded-xl bg-secondary border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Service ID (Your Site)</Label>
                <Input
                  type="number"
                  value={editForm.serviceId}
                  onChange={(e) => setEditForm({ ...editForm, serviceId: e.target.value })}
                  placeholder="e.g. 1042"
                  className="rounded-xl bg-secondary border-border font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Original ID (Provider)</Label>
                <Input
                  type="number"
                  disabled
                  value={editForm.originalServiceId}
                  className="rounded-xl bg-secondary/50 border-border font-mono cursor-not-allowed opacity-75"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Min Quantity</Label>
                <Input
                  type="number"
                  value={editForm.min}
                  onChange={(e) => setEditForm({ ...editForm, min: e.target.value })}
                  placeholder="e.g. 100"
                  className="rounded-xl bg-secondary border-border font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Max Quantity</Label>
                <Input
                  type="number"
                  value={editForm.max}
                  onChange={(e) => setEditForm({ ...editForm, max: e.target.value })}
                  placeholder="e.g. 10000"
                  className="rounded-xl bg-secondary border-border font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Custom Price ({editingService ? `Cost: ${formatCurrency(Number(editingService.rate))}` : ""})</Label>
              <Input
                type="number"
                step="0.0001"
                value={editForm.customRate}
                onChange={(e) => setEditForm({ ...editForm, customRate: e.target.value })}
                placeholder="Selling rate"
                className="rounded-xl bg-secondary border-border font-mono"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => { setEditOpen(false); setEditingService(null); }}>Cancel</Button>
            <Button className="rounded-xl bg-[#00B49F] hover:bg-[#00B49F]/90 text-white" onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;
