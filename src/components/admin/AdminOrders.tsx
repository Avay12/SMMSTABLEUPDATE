import { useState, useEffect, useRef, useTransition } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const STATUSES = ["All", "Pending", "Processing", "In progress", "Completed", "Partial", "Cancelled", "Refunded", "Failed"];

const statusColor = (s: string) => {
  switch (s?.toLowerCase()) {
    case "completed": return "bg-[hsl(var(--fame-success))]/10 text-[hsl(var(--fame-success))] border-[hsl(var(--fame-success))]/20 hover:bg-[hsl(var(--fame-success))]/20";
    case "pending": return "bg-[hsl(var(--fame-orange))]/10 text-[hsl(var(--fame-orange))] border-[hsl(var(--fame-orange))]/20 hover:bg-[hsl(var(--fame-orange))]/20";
    case "processing": case "in progress": return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20";
    case "cancelled": case "refunded": case "failed": return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20";
    case "partial": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20";
    default: return "bg-secondary text-muted-foreground border-border hover:bg-muted";
  }
};

const activeStatusColor = (s: string) => {
  switch (s?.toLowerCase()) {
    case "completed": return "bg-[hsl(var(--fame-success))] text-white border-[hsl(var(--fame-success))] shadow-sm";
    case "pending": return "bg-[hsl(var(--fame-orange))] text-white border-[hsl(var(--fame-orange))] shadow-sm";
    case "processing": case "in progress": return "bg-primary text-primary-foreground border-primary shadow-sm";
    case "cancelled": case "refunded": case "failed": return "bg-destructive text-destructive-foreground border-destructive shadow-sm";
    case "partial": return "bg-yellow-500 text-white border-yellow-500 shadow-sm";
    case "all": return "bg-foreground text-background border-foreground shadow-sm";
    default: return "bg-muted-foreground text-background border-muted-foreground shadow-sm";
  }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [refundDialog, setRefundDialog] = useState(false);
  const [refundOrder, setRefundOrder] = useState<any>(null);
  const [refunding, setRefunding] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(50);
  }, [search, statusFilter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 50);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // The API returns orders through /api/orders/all
      const { data } = await apiClient.get('/orders/all');
      setOrders(data?.orders || data || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load orders", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o => {
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    if (!query) return matchesStatus;
    const q = query.toLowerCase();
    return matchesStatus && ((o.service || o.service_name)?.toLowerCase().includes(q) || o.link?.toLowerCase().includes(q) || o.id?.includes(q) || (o.username || o.user_id)?.includes(q));
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/admin/orders/${id}/status`, { status });
      toast({ title: "Order updated", description: `Status → ${status}` });
      fetchOrders();
    } catch (e) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleRefund = async () => {
    if (!refundOrder) return;
    setRefunding(true);
    try {
      await apiClient.post(`/admin/orders/${refundOrder.id}/refund`, {
        amount: Number(refundOrder.charge || refundOrder.cost)
      });
      toast({ title: "Refund processed", description: `$${Number(refundOrder.charge || refundOrder.cost).toFixed(4)} credited back` });
    } catch (e) {
      toast({ title: "Refund failed", variant: "destructive" });
    } finally {
      setRefunding(false);
      setRefundDialog(false);
      fetchOrders();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Order Command Center</h2>
          <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} className="rounded-xl gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9 h-10 bg-card border-border rounded-xl" value={search} onChange={(e) => {
            setSearch(e.target.value);
            startTransition(() => {
              setQuery(e.target.value);
            });
          }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                statusFilter === s ? activeStatusColor(s) : statusColor(s)
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading || isPending ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.slice(0, visibleCount).map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.015, duration: 0.3 }}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-sm font-semibold">{o.service || o.service_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.link}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Qty: <strong className="text-foreground">{o.quantity}</strong></span>
                      <span>Cost: <strong className="text-primary">${Number(o.charge || o.cost).toFixed(4)}</strong></span>
                      <span>{o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80 font-mono mt-0.5">
                      {o.smm_order_id && <span>SMM ID: {o.smm_order_id}</span>}
                      <span>Service ID: {o.service_id || o.serviceId || 'N/A'}</span>
                      <span>Provider: {o.provider_name || o.provider || o.providerId || 'N/A'}</span>
                      <span>User: {o.user?.email || o.username || o.user_id || o.userId || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Badge className={`${statusColor(o.status)} border-none text-xs px-2.5 py-0.5`}>{o.status}</Badge>
                    <Select defaultValue={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="h-8 w-28 text-xs rounded-lg border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.filter(s => s !== "All").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {!["Refunded", "Cancelled"].includes(o.status) && (
                      <button
                        onClick={() => { setRefundOrder(o); setRefundDialog(true); }}
                        className="h-8 px-2.5 rounded-lg bg-destructive/10 text-destructive flex items-center gap-1 hover:bg-destructive/20 transition-all active:scale-95 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" /> Refund
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length > visibleCount && (
            <div ref={observerTarget} className="h-14 w-full flex justify-center items-center text-muted-foreground text-xs mt-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading more...
            </div>
          )}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-16 text-sm">No orders found.</p>}
        </div>
      )}

      {/* Refund Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent className="sm:max-w-sm max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><RotateCcw className="h-4 w-4" /> Confirm Refund</DialogTitle>
            <DialogDescription>This will credit ${Number(refundOrder?.cost || 0).toFixed(4)} back to the user's balance and mark the order as refunded.</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-secondary p-3 text-sm space-y-1">
            <div><span className="text-muted-foreground">Service:</span> {refundOrder?.service || refundOrder?.service_name}</div>
            <div><span className="text-muted-foreground">Amount:</span> <span className="text-primary font-semibold">${Number(refundOrder?.charge || refundOrder?.cost || 0).toFixed(4)}</span></div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setRefundDialog(false)}>Cancel</Button>
            <Button className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleRefund} disabled={refunding}>
              {refunding && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
