import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { apiClient } from "@/lib/apiClient";
import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingCart, DollarSign, AlertTriangle, RefreshCw, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
  delay?: number;
}

const MetricCard = ({ title, value, subtitle, icon, trend, trendValue, color = "primary", delay = 0 }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="rounded-2xl border border-border bg-card p-5 hover:border-primary/20 transition-all duration-300 group"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`h-10 w-10 rounded-xl bg-${color}/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend === "up" ? "text-[hsl(var(--fame-success))] bg-[hsl(var(--fame-success))]/10" : 
          trend === "down" ? "text-destructive bg-destructive/10" : "text-muted-foreground bg-muted"
        }`}>
          {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="text-2xl font-bold tracking-tight">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{title}</div>
    {subtitle && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{subtitle}</div>}
  </motion.div>
);

const AdminOverview = () => {
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalOrderCost: 0,
    pendingOrders: 0,
    newSignups24h: 0,
    profit: 0,
  });
  const [providerBalance, setProviderBalance] = useState<string | null>(null);
  const [providerAlert, setProviderAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/admin/system/stats');
      setStats({
        totalUsers: data.users || 0,
        totalOrders: data.orders || 0,
        totalRevenue: data.totalRevenue || 0,
        totalOrderCost: data.totalOrderCost || 0,
        pendingOrders: data.pendingOrders || 0,
        newSignups24h: data.newSignups24h || 0,
        profit: data.profit || 0,
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load overview stats", variant: "destructive" });
    }
    setLoading(false);
  };

  const fetchProviderBalance = async () => {
    setRefreshing(true);
    try {
      const { data } = await apiClient.get('/services/balance');
      const bal = data?.balance;
      if (bal !== undefined) {
        setProviderBalance(String(bal));
        setProviderAlert(Number(bal) < 10);
      } else {
        setProviderBalance("N/A");
      }
    } catch {
      setProviderBalance("Error");
      setProviderAlert(true);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
    fetchProviderBalance();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time platform metrics</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchProviderBalance(); }} className="rounded-xl gap-2">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Provider Alert */}
      {providerAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-destructive">Provider Balance Low</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              SMM provider balance is critically low ({providerBalance || "unknown"}). Orders may fail. Top up immediately.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue (All time)"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          delay={0}
        />
        <MetricCard
          title="New Signups (24h)"
          value={String(stats.newSignups24h)}
          subtitle={`${stats.totalUsers} total users`}
          icon={<Users className="h-5 w-5 text-primary" />}
          delay={0.05}
        />
        <MetricCard
          title="Pending Orders"
          value={String(stats.pendingOrders)}
          subtitle={`${stats.totalOrders} total orders`}
          icon={<ShoppingCart className="h-5 w-5 text-[hsl(var(--fame-orange))]" />}
          delay={0.1}
        />
        <MetricCard
          title="Provider Balance"
          value={providerBalance !== null ? formatCurrency(Number(providerBalance)) : "—"}
          subtitle="All providers combined"
          icon={<TrendingUp className="h-5 w-5 text-[hsl(var(--fame-success))]" />}
          delay={0.15}
        />
      </div>

      {/* Revenue breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Deposits</div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Costs</div>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(stats.totalOrderCost)}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Net Profit</div>
          <div className={`text-2xl font-bold ${stats.profit >= 0 ? "text-[hsl(var(--fame-success))]" : "text-destructive"}`}>
            {formatCurrency(stats.profit)}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminOverview;
