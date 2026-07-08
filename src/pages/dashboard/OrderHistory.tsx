import { useEffect, useState, useCallback, useRef } from "react";

import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/apiClient";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Clock, RefreshCw, Package, Truck, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, ExternalLink, Copy, Check, AlertTriangle, Zap, Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ─── Status Pipeline ─── */
const STATUS_STEPS = [
  { key: "Pending", label: "Order Placed", icon: Package, description: "Your order has been submitted" },
  { key: "Processing", label: "Processing", icon: Zap, description: "Provider is processing your order" },
  { key: "In progress", label: "In Progress", icon: Truck, description: "Delivery is underway" },
  { key: "Completed", label: "Delivered", icon: CheckCircle2, description: "Order fulfilled successfully" },
];

const TERMINAL_STATUSES = ["Completed", "Cancelled", "Refunded", "Partial"];
const NEGATIVE_STATUSES = ["Cancelled", "Refunded"];

const getStepIndex = (status: string) => {
  const s = status.toLowerCase();
  const idx = STATUS_STEPS.findIndex((step) => step.key.toLowerCase() === s);
  if (idx !== -1) return idx;
  if (s === "completed") return STATUS_STEPS.length - 1;
  if (NEGATIVE_STATUSES.map(x => x.toLowerCase()).includes(s)) return -1;
  if (s === "partial") return STATUS_STEPS.length - 1;
  return 0;
};

const statusMeta = (status: string) => {
  const s = status.toLowerCase();
  if (s === "completed") return { color: "text-[hsl(var(--fame-success))]", bg: "bg-[hsl(var(--fame-success))]/10", ring: "ring-[hsl(var(--fame-success))]" };
  if (s === "in progress" || s === "processing") return { color: "text-primary", bg: "bg-primary/10", ring: "ring-primary" };
  if (NEGATIVE_STATUSES.map(x => x.toLowerCase()).includes(s)) return { color: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive" };
  if (s === "partial") return { color: "text-[hsl(var(--fame-orange))]", bg: "bg-[hsl(var(--fame-orange))]/10", ring: "ring-[hsl(var(--fame-orange))]" };
  return { color: "text-[hsl(var(--fame-warning))]", bg: "bg-[hsl(var(--fame-warning))]/10", ring: "ring-[hsl(var(--fame-warning))]" };
};

/* ─── Live Tracker Component ─── */
const OrderTracker = ({ order, expanded, onToggle }: { order: any; expanded: boolean; onToggle: () => void }) => {
  const currentStep = getStepIndex(order.status);
  const isNegative = NEGATIVE_STATUSES.map(x => x.toLowerCase()).includes(order.status?.toLowerCase());
  const isPartial = order.status?.toLowerCase() === "partial";
  const isComplete = order.status?.toLowerCase() === "completed";
  const meta = statusMeta(order.status);
  const { formatCurrency } = useCurrency();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(order.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const timeSince = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border bg-card overflow-hidden transition-all duration-300 ${
        expanded ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border hover:border-border/80"
      }`}
    >
      {/* Header - always visible */}
      <button onClick={onToggle} className="w-full text-left p-3 sm:p-4 active:scale-[0.995] transition-transform">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Status badge + time */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${meta.bg} ${meta.color} border-0 font-semibold text-xs px-2.5 py-0.5`}>
                {isNegative && <XCircle className="h-3 w-3 mr-1" />}
                {isPartial && <AlertTriangle className="h-3 w-3 mr-1" />}
                {isComplete && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {!isNegative && !isPartial && !isComplete && (
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${meta.bg.replace("/10", "")}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${meta.bg.replace("/10", "")}`} />
                  </span>
                )}
                {order.status}
              </Badge>
              <span className="text-[11px] text-muted-foreground">{timeSince(order.updatedAt || order.updated_at || order.createdAt || order.created_at)}</span>
            </div>

            {/* Service info + Order ID */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                #{order.id.slice(0, 8)}
              </span>
              <span className="text-sm font-medium truncate">{order.service_name}</span>
            </div>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Qty: <strong className="text-foreground">{order.quantity?.toLocaleString()}</strong></span>
              <span>Cost: <strong className="text-primary">{formatCurrency(Number(order.charge || order.cost || 0))}</strong></span>
              <span>{new Date(order.createdAt || order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-1">
            {/* Mini progress indicator */}
            {!isNegative && (
              <div className="hidden sm:flex items-center gap-0.5">
                {STATUS_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i <= currentStep
                        ? `w-5 ${isComplete ? "bg-[hsl(var(--fame-success))]" : isPartial ? "bg-[hsl(var(--fame-orange))]" : "bg-primary"}`
                        : "w-3 bg-border"
                    }`}
                  />
                ))}
              </div>
            )}
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-0 space-y-5">
              <div className="h-px bg-border" />

              {/* ─── Step Tracker (Food Delivery Style) ─── */}
              {isNegative ? (
                <div className="flex items-center gap-3 rounded-xl bg-destructive/5 border border-destructive/10 p-4">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-destructive">Order {order.status}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.status?.toLowerCase() === "refunded" ? "Funds have been returned to your wallet." : "This order was cancelled by the provider."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical progress line */}
                  <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border rounded-full" />
                  <div
                    className={`absolute left-[19px] top-3 w-0.5 rounded-full transition-all duration-1000 ease-out ${
                      isComplete ? "bg-[hsl(var(--fame-success))]" : isPartial ? "bg-[hsl(var(--fame-orange))]" : "bg-primary"
                    }`}
                    style={{
                      height: `${Math.min(100, ((currentStep) / (STATUS_STEPS.length - 1)) * 100)}%`,
                    }}
                  />

                  <div className="space-y-0">
                    {STATUS_STEPS.map((step, i) => {
                      const isActive = i === currentStep;
                      const isDone = i < currentStep || (isComplete && i <= currentStep);
                      const isPending = i > currentStep;
                      const StepIcon = step.icon;

                      return (
                        <div key={step.key} className="flex items-start gap-3.5 relative py-2.5">
                          {/* Circle / Icon */}
                          <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                            isDone
                              ? `${isComplete || isPartial ? (isPartial && i === currentStep ? "bg-[hsl(var(--fame-orange))]/15" : "bg-[hsl(var(--fame-success))]/15") : "bg-primary/15"}`
                              : isActive
                                ? "bg-primary/15 ring-2 ring-primary/30 ring-offset-2 ring-offset-card"
                                : "bg-secondary"
                          }`}>
                            {isDone && !isActive ? (
                              <CheckCircle2 className={`h-4.5 w-4.5 ${isPartial && i === currentStep ? "text-[hsl(var(--fame-orange))]" : "text-[hsl(var(--fame-success))]"}`} />
                            ) : (
                              <StepIcon className={`h-4 w-4 transition-colors duration-500 ${
                                isActive
                                  ? "text-primary"
                                  : isDone
                                    ? "text-[hsl(var(--fame-success))]"
                                    : "text-muted-foreground/40"
                              }`} />
                            )}

                            {/* Pulse animation for active step */}
                            {isActive && !isComplete && (
                              <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" style={{ animationDuration: "2s" }} />
                            )}
                          </div>

                          {/* Label */}
                          <div className={`pt-1.5 transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
                            <p className={`text-sm font-medium leading-tight ${
                              isActive ? "text-foreground" : isDone ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {step.label}
                              {isPartial && i === currentStep && (
                                <span className="ml-2 text-[10px] text-[hsl(var(--fame-orange))] font-normal">(Partial delivery)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                            {isActive && !isComplete && (
                              <p className="text-[11px] text-primary font-medium mt-1 flex items-center gap-1">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                                </span>
                                Current step
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="rounded-xl bg-secondary/50 border border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order Details</span>
                  {order.smm_order_id && (
                    <span className="text-[10px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded-md">
                      Provider ID: {order.smm_order_id}
                    </span>
                  )}
                </div>

                {/* Link */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground mb-0.5">Target Link</p>
                    <p className="text-xs font-mono truncate text-foreground">{order.link}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={copyLink}>
                      {copied ? <Check className="h-3 w-3 text-[hsl(var(--fame-success))]" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <a href={order.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Service ID</p>
                    <p className="text-sm font-semibold font-mono">{order.serviceId || order.service_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Quantity</p>
                    <p className="text-sm font-semibold">{order.quantity?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Cost</p>
                    <p className="text-sm font-semibold text-primary">{formatCurrency(Number(order.charge || order.cost || 0))}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Placed On</p>
                    <p className="text-sm font-semibold">{new Date(order.createdAt || order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Last Update</p>
                    <p className="text-sm font-semibold">{new Date(order.updatedAt || order.updated_at || order.createdAt || order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── Main Page ─── */
const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "failed">("all");
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const response = await apiClient.get("/orders");
      const data = response.data;
      setOrders(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* Auto-sync active orders every 30s */
  const syncStatuses = useCallback(async () => {
    const ordersToSync = orders.filter((o) => !TERMINAL_STATUSES.includes(o.status));
    if (ordersToSync.length === 0) return;
    setSyncing(true);
    try {
      for (const o of ordersToSync) {
        try {
          await apiClient.post(`/orders/${o.id}/sync`);
        } catch (err) {
          // ignore individual sync errors
        }
      }
      await fetchOrders();
    } catch (err) {
      console.error("Status sync error:", err);
    }
    setSyncing(false);
  }, [orders, fetchOrders]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const hasActive = orders.some((o) => !TERMINAL_STATUSES.includes(o.status) && o.smm_order_id);
      if (hasActive) syncStatuses();
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [orders, syncStatuses]);

  /* Filters */
  const filtered = orders.filter((o) => {
    const matchesSearch =
      !search ||
      o.service_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.service_id?.includes(search) ||
      o.link?.toLowerCase().includes(search.toLowerCase()) ||
      o.smm_order_id?.includes(search);

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !TERMINAL_STATUSES.includes(o.status)) ||
      (filter === "completed" && o.status === "Completed") ||
      (filter === "failed" && NEGATIVE_STATUSES.includes(o.status));

    return matchesSearch && matchesFilter;
  });

  const activeCount = orders.filter((o) => !TERMINAL_STATUSES.includes(o.status)).length;

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "active", label: "Active", count: activeCount },
    { key: "completed", label: "Completed" },
    { key: "failed", label: "Failed" },
  ] as const;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Order Tracking</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                {activeCount} active order{activeCount !== 1 ? "s" : ""} · Auto-syncing every 30s
              </span>
            ) : (
              "Track your orders in real-time"
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncStatuses()}
          disabled={syncing}
          className="gap-2 rounded-xl active:scale-[0.95] min-h-[44px] self-start"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by service, link, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-secondary/50 border-border/60"
          />
        </div>
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 border border-border/40">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              {"count" in f && f.count !== undefined && f.count > 0 && (
                <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{f.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 sm:p-12 text-center">
          <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No orders yet. Place your first order from the Dashboard.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No orders match your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <OrderTracker
              key={o.id}
              order={o}
              expanded={expandedId === o.id}
              onToggle={() => setExpandedId(expandedId === o.id ? null : o.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
